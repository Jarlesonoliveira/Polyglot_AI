/**
 * Gemini Live API Service
 * Gerencia a conexão com a API Gemini Live via SDK oficial @google/genai
 */

import { GoogleGenAI, Modality, type LiveServerMessage } from '@google/genai';

export interface GeminiLiveConfig {
  apiKey: string;
  model?: string;
  voiceId?: string;
}

export interface Message {
  type: 'input' | 'output';
  text: string;
  timestamp: number;
  finished?: boolean;
}

export class GeminiLiveService {
  private ai: GoogleGenAI;
  private apiKey: string;
  private model = 'gemini-2.5-flash-native-audio-preview-09-2025';
  private voiceId: string;
  private session: any | null = null;
  private isConnected = false;
  private readyPromise: Promise<void> | null = null;
  private resolveReady: (() => void) | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private conversationHistory: Message[] = [];
  private systemPrompt = '';

  constructor(config: GeminiLiveConfig) {
    this.apiKey = config.apiKey;
    this.ai = new GoogleGenAI({ apiKey: config.apiKey });
    if (config.model) {
      this.model = config.model;
    }
    this.voiceId = config.voiceId || 'Puck';
  }

  async connect(systemPrompt?: string): Promise<void> {
    if (this.isConnected) {
      console.log('Já conectado ao Gemini Live');
      return;
    }

    if (!this.apiKey) {
      throw new Error('VITE_API_KEY não configurada. Defina no arquivo .env.local');
    }

    if (systemPrompt) {
      this.systemPrompt = systemPrompt;
    }

    try {
      this.readyPromise = new Promise<void>((resolve) => {
        this.resolveReady = resolve;
      });

      this.session = await this.ai.live.connect({
        model: this.model,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: this.voiceId,
              },
            },
          },
          systemInstruction: this.systemPrompt || 'Você é um assistente prestativo.',
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            this.isConnected = true;
            console.log('Conectado ao Gemini Live API');
          },
          onmessage: (message: LiveServerMessage) => {
            this.handleMessage(message);
          },
          onerror: (error: ErrorEvent) => {
            this.handleError({ message: error.message || 'Erro de conexão com Gemini Live' });
          },
          onclose: () => {
            this.isConnected = false;
            this.readyPromise = null;
            this.resolveReady = null;
            console.log('Sessão Gemini Live encerrada');
          },
        },
      });

      await this.readyPromise;
    } catch (error) {
      console.error('Erro ao conectar:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.session) {
      try {
        await this.session.close();
      } catch {
        // Ignora erro de sessão já fechada
      }
      this.session = null;
    }
    this.isConnected = false;
    this.readyPromise = null;
    this.resolveReady = null;
  }

  async sendAudioChunk(audioBytes: Uint8Array): Promise<void> {
    if (!this.session || !this.isConnected) {
      return;
    }

    const base64Audio = this.uint8ArrayToBase64(audioBytes);
    await this.session.sendRealtimeInput({
      audio: {
        data: base64Audio,
        mimeType: 'audio/pcm;rate=16000',
      },
    });
  }

  async endAudioStream(): Promise<void> {
    if (!this.session || !this.isConnected) {
      return;
    }

    this.session.sendRealtimeInput({
      audioStreamEnd: true,
    });
  }

  private handleMessage(message: LiveServerMessage): void {
    try {
      if (message.setupComplete) {
        console.log('Setup da sessão Gemini Live concluído');
        this.resolveReady?.();
        this.resolveReady = null;
      }

      const sc = message.serverContent;
      if (!sc) return;

      if (sc.interrupted) {
        const interruptedHandler = this.messageHandlers.get('interrupted');
        if (interruptedHandler) {
          interruptedHandler({ interrupted: true, timestamp: Date.now() });
        }
      }

      if (sc.modelTurn?.parts) {
        sc.modelTurn.parts.forEach((part: any) => {
          if (part.inlineData?.mimeType?.startsWith('audio/')) {
            const audioData = this.base64ToUint8Array(part.inlineData.data);
            this.handleAudioData(audioData);
          }
        });
      }

      if (sc.inputTranscription?.text) {
        this.handleTranscription(
          sc.inputTranscription.text,
          'input',
          !!sc.inputTranscription.finished
        );
      }

      if (sc.outputTranscription?.text) {
        this.handleTranscription(
          sc.outputTranscription.text,
          'output',
          !!sc.outputTranscription.finished
        );
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  }

  private handleAudioData(audioData: Uint8Array): void {
    const handler = this.messageHandlers.get('audio');
    if (handler) {
      handler({
        audioBytes: audioData,
        timestamp: Date.now(),
      });
    }
  }

  private handleTranscription(text: string, type: 'input' | 'output', finished: boolean): void {
    const message: Message = {
      type,
      text,
      timestamp: Date.now(),
      finished,
    };

    this.conversationHistory.push(message);

    const handler = this.messageHandlers.get('transcription');
    if (handler) {
      handler(message);
    }
  }

  private handleError(error: any): void {
    const handler = this.messageHandlers.get('error');
    if (handler) {
      handler({
        error: error.message || 'Erro desconhecido',
        timestamp: Date.now(),
      });
    }
  }

  on(event: 'audio' | 'transcription' | 'error' | 'interrupted', callback: (data: any) => void): void {
    this.messageHandlers.set(event, callback);
  }

  off(event: string): void {
    this.messageHandlers.delete(event);
  }

  isConnectedStatus(): boolean {
    return this.isConnected && !!this.session;
  }

  getConversationHistory(): Message[] {
    return [...this.conversationHistory];
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  private uint8ArrayToBase64(uint8Array: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}
