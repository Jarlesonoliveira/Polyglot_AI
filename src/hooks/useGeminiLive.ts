/**
 * Hook: useGeminiLive
 * Gerencia a conexão e interação com Gemini Live API
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { GeminiLiveService } from '../services/geminiLiveService';
import { AudioService } from '../services/audioService';
import { TranslationService, Message } from '../services/translationService';

export interface UseGeminiLiveConfig {
  nativeLanguage: string;
  targetLanguage: string;
  mode: 'translation' | 'pronunciation' | 'conversation';
  voiceId: string;
}

export function useGeminiLive(config: UseGeminiLiveConfig) {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const apiKey = import.meta.env.VITE_API_KEY as string | undefined;

  const geminiServiceRef = useRef<GeminiLiveService | null>(null);
  const audioServiceRef = useRef<AudioService | null>(null);
  const translationServiceRef = useRef<TranslationService | null>(null);
  const audioLevelIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const liveTranscriptIdRef = useRef<{ user: string | null; assistant: string | null }>({
    user: null,
    assistant: null,
  });
  const liveTranscriptTextRef = useRef<{ user: string; assistant: string }>({
    user: '',
    assistant: '',
  });

  const normalizeTranscriptChunk = (text: string): string => {
    return text.replace(/\s+/g, ' ').trim();
  };

  const mergeTranscriptChunks = (previousText: string, nextChunk: string): string => {
    const previous = normalizeTranscriptChunk(previousText);
    const next = normalizeTranscriptChunk(nextChunk);

    if (!previous) return next;
    if (!next) return previous;
    if (next.startsWith(previous)) return next;
    if (previous.startsWith(next)) return previous;

    const previousWords = previous.split(' ');
    const nextWords = next.split(' ');
    const maxOverlap = Math.min(previousWords.length, nextWords.length);

    for (let overlap = maxOverlap; overlap > 0; overlap--) {
      const previousSlice = previousWords.slice(-overlap).join(' ');
      const nextSlice = nextWords.slice(0, overlap).join(' ');
      if (previousSlice === nextSlice) {
        return [...previousWords, ...nextWords.slice(overlap)].join(' ');
      }
    }

    return `${previous} ${next}`.replace(/\s+/g, ' ').trim();
  };
  // Inicializar serviços
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Reinicia estado local ao trocar configuração para evitar estado de conexão defasado.
        setIsConnected(false);
        setIsListening(false);

        if (audioLevelIntervalRef.current) {
          clearInterval(audioLevelIntervalRef.current);
          audioLevelIntervalRef.current = null;
        }

        audioServiceRef.current?.stopRecording();
        audioServiceRef.current?.clearPlaybackQueue();
        await geminiServiceRef.current?.disconnect();
        audioServiceRef.current?.cleanup();

        if (!apiKey) {
          throw new Error('VITE_API_KEY não encontrada. Configure no .env.local e reinicie o Vite.');
        }

        geminiServiceRef.current = new GeminiLiveService({
          apiKey,
          voiceId: config.voiceId,
        });

        audioServiceRef.current = new AudioService({
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        });

        translationServiceRef.current = new TranslationService(
          config.nativeLanguage,
          config.targetLanguage,
          config.mode
        );

        await audioServiceRef.current.initialize();

        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao inicializar';
        setError(errorMessage);
        console.error('Erro ao inicializar serviços:', err);
      }
    };

    initializeServices();

    return () => {
      geminiServiceRef.current?.disconnect();
      audioServiceRef.current?.cleanup();
    };
  }, [apiKey, config.nativeLanguage, config.targetLanguage, config.mode, config.voiceId]);

  useEffect(() => {
    liveTranscriptIdRef.current = { user: null, assistant: null };
    liveTranscriptTextRef.current = { user: '', assistant: '' };
  }, [config.nativeLanguage, config.targetLanguage, config.mode]);

  const connect = useCallback(async () => {
    try {
      if (!geminiServiceRef.current) {
        throw new Error('Gemini service não inicializado');
      }

      // Configurar listeners antes de conectar
      geminiServiceRef.current.on('transcription', (message) => {
        if (translationServiceRef.current) {
          const role = message.type === 'input' ? 'user' : 'assistant';
          const previousText = liveTranscriptTextRef.current[role];
          const mergedText = mergeTranscriptChunks(previousText, message.text);
          const currentId = liveTranscriptIdRef.current[role] || `live_${role}_${Date.now()}`;

          liveTranscriptIdRef.current[role] = currentId;
          liveTranscriptTextRef.current[role] = mergedText;

          translationServiceRef.current.upsertMessage(
            currentId,
            mergedText,
            role,
            !message.finished
          );

          if (message.finished) {
            liveTranscriptIdRef.current[role] = null;
            liveTranscriptTextRef.current[role] = '';
          }

          setMessages([...translationServiceRef.current.getMessages()]);
        }
      });

      geminiServiceRef.current.on('error', (error) => {
        setError(error.error);
      });

      geminiServiceRef.current.on('audio', (data) => {
        // Tocar áudio recebido (PCM 24kHz)
        audioServiceRef.current?.playAudio(data.audioBytes, 24000);
      });

      geminiServiceRef.current.on('interrupted', () => {
        audioServiceRef.current?.clearPlaybackQueue();
      });

      const systemPrompt = translationServiceRef.current?.generateSystemPrompt();
      await geminiServiceRef.current.connect(systemPrompt);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao conectar';
      setError(errorMessage);
      setIsConnected(false);
    }
  }, []);

  const startListening = useCallback(async () => {
    try {
      const isSessionReady = geminiServiceRef.current?.isConnectedStatus() ?? false;
      if (!isSessionReady) {
        await connect();
      }

      const isReadyAfterConnect = geminiServiceRef.current?.isConnectedStatus() ?? false;
      if (!isReadyAfterConnect) {
        throw new Error('Sessão Gemini Live ainda não está pronta. Tente novamente em 1 segundo.');
      }

      if (!audioServiceRef.current) {
        throw new Error('Audio service não inicializado');
      }

      setIsListening(true);

      // Iniciar captura de áudio
      audioServiceRef.current.startRecording(async (audioData) => {
        try {
          await geminiServiceRef.current?.sendAudioChunk(audioData);
        } catch (err) {
          console.error('Erro ao enviar áudio:', err);
        }
      });
      // Monitorar nível de áudio
      audioLevelIntervalRef.current = setInterval(() => {
        const level = audioServiceRef.current?.getAudioLevel() || 0;
        setAudioLevel(level);
      }, 100);

      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao iniciar escuta';
      setError(errorMessage);
      setIsListening(false);
    }
  }, [connect]);

  const stopListening = useCallback(async () => {
    if (audioLevelIntervalRef.current) {
      clearInterval(audioLevelIntervalRef.current);
      audioLevelIntervalRef.current = null;
    }

    audioServiceRef.current?.stopRecording();
    await geminiServiceRef.current?.endAudioStream();
    audioServiceRef.current?.clearPlaybackQueue();

    setIsListening(false);
    setAudioLevel(0);
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await stopListening();
      await geminiServiceRef.current?.disconnect();
      setIsConnected(false);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao desconectar';
      setError(errorMessage);
    }
  }, [stopListening]);

  const sendMessage = useCallback((text: string) => {
    // Placeholder para envio de texto futuro (modo multimodal).
    console.log('Envio de texto ainda não implementado:', text);
  }, []);

  const clearMessages = useCallback(() => {
    translationServiceRef.current?.clearContext();
    setMessages([]);
  }, []);

  const updateMode = useCallback((newMode: 'translation' | 'pronunciation' | 'conversation') => {
    if (translationServiceRef.current) {
      translationServiceRef.current.setMode(newMode);
    }
  }, []);

  const updateLanguages = useCallback((native: string, target: string) => {
    if (translationServiceRef.current) {
      translationServiceRef.current.setLanguages(native, target);
    }
  }, []);

  return {
    // Estado
    isConnected,
    isListening,
    messages,
    audioLevel,
    error,

    // Métodos
    connect,
    disconnect,
    startListening,
    stopListening,
    sendMessage,
    clearMessages,
    updateMode,
    updateLanguages,
  };
}
