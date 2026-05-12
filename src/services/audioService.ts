/**
 * Audio Service
 * Gerencia captura de áudio do microfone e reprodução de áudio
 */

export interface AudioConfig {
  sampleRate?: number;
  channels?: number;
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
}

export class AudioService {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private audioBuffer: Uint8Array[] = [];
  private isRecording = false;
  private config: AudioConfig;
  private inputSampleRate = 16000;
  private playbackQueue: AudioBuffer[] = [];
  private currentPlaybackSource: AudioBufferSourceNode | null = null;
  private isPlayingQueue = false;

  constructor(config: AudioConfig = {}) {
    this.config = {
      sampleRate: 16000,
      channels: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      ...config,
    };
  }

  async initialize(): Promise<void> {
    try {
      // Solicitar acesso ao microfone
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: this.config.echoCancellation,
          noiseSuppression: this.config.noiseSuppression,
          autoGainControl: this.config.autoGainControl,
          sampleRate: { ideal: this.config.sampleRate },
        },
      });

      // Criar AudioContext
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.inputSampleRate = this.audioContext.sampleRate;
      
      // Criar analisador para monitorar nível de áudio
      this.analyser = this.audioContext.createAnalyser();

      // Conectar stream do microfone
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      source.connect(this.analyser);

      // Criar processor para capturar áudio em PCM
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      console.log('AudioService inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar AudioService:', error);
      throw error;
    }
  }

  startRecording(onAudioData: (audioData: Uint8Array) => void): void {
    if (!this.processor) {
      throw new Error('AudioService não inicializado');
    }

    this.isRecording = true;
    this.audioBuffer = [];

    this.processor.onaudioprocess = (event: AudioProcessingEvent) => {
      if (!this.isRecording) return;

      const inputData = event.inputBuffer.getChannelData(0);
      const resampledData = this.resampleToTargetSampleRate(
        inputData,
        this.inputSampleRate,
        this.config.sampleRate || 16000
      );
      const pcmData = this.floatTo16BitPCM(resampledData);
      this.audioBuffer.push(pcmData);

      // Enviar áudio em PCM 16kHz little-endian conforme exigido pela Gemini Live.
      onAudioData(pcmData);
    };

    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  stopRecording(): Uint8Array {
    this.isRecording = false;
    
    if (this.processor) {
      this.processor.onaudioprocess = null;
    }

    // Concatenar todos os buffers de áudio
    if (this.audioBuffer.length === 0) {
      return new Uint8Array(0);
    }

    const totalLength = this.audioBuffer.reduce((sum, buf) => sum + buf.length, 0);
    const result = new Uint8Array(totalLength);
    
    let offset = 0;
    for (const buf of this.audioBuffer) {
      result.set(buf, offset);
      offset += buf.length;
    }

    this.audioBuffer = [];
    return result;
  }

  async playAudio(audioData: Uint8Array, sampleRate: number = 24000): Promise<void> {
    if (!this.audioContext) {
      throw new Error('AudioContext não inicializado');
    }

    try {
      const audioBuffer = this.audioContext.createBuffer(1, audioData.length / 2, sampleRate);
      const channelData = audioBuffer.getChannelData(0);
      
      // Converter bytes para float32
      for (let i = 0; i < audioData.length; i += 2) {
        const sample = (audioData[i + 1] << 8) | audioData[i];
        const s = sample < 32768 ? sample / 32768 : sample / 32768 - 2;
        channelData[i / 2] = s;
      }

      this.playbackQueue.push(audioBuffer);
      this.playNextInQueue();
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error);
    }
  }

  clearPlaybackQueue(): void {
    this.playbackQueue = [];
    this.isPlayingQueue = false;

    if (this.currentPlaybackSource) {
      try {
        this.currentPlaybackSource.stop();
      } catch {
        // Ignora parada de source já encerrado
      }
      this.currentPlaybackSource = null;
    }
  }

  private playNextInQueue(): void {
    if (!this.audioContext || this.isPlayingQueue || this.playbackQueue.length === 0) {
      return;
    }

    const nextBuffer = this.playbackQueue.shift();
    if (!nextBuffer) {
      return;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = nextBuffer;
    source.connect(this.audioContext.destination);

    this.currentPlaybackSource = source;
    this.isPlayingQueue = true;

    source.onended = () => {
      this.isPlayingQueue = false;
      this.currentPlaybackSource = null;
      this.playNextInQueue();
    };

    source.start(0);
  }

  getAudioLevel(): number {
    if (!this.analyser) return 0;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    return average / 255;
  }

  encodeAudioToBase64(audioData: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < audioData.length; i++) {
      binary += String.fromCharCode(audioData[i]);
    }
    return btoa(binary);
  }

  decodeBase64ToAudio(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  private floatTo16BitPCM(float32Array: Float32Array): Uint8Array {
    const pcm = new Uint8Array(float32Array.length * 2);
    let offset = 0;

    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      const sample = s < 0 ? s * 0x8000 : s * 0x7fff;
      pcm[offset] = sample & 0xff;
      pcm[offset + 1] = (sample >> 8) & 0xff;
    }

    return pcm;
  }

  private resampleToTargetSampleRate(
    input: Float32Array,
    fromSampleRate: number,
    toSampleRate: number
  ): Float32Array {
    if (fromSampleRate === toSampleRate) {
      return input;
    }

    const ratio = fromSampleRate / toSampleRate;
    const newLength = Math.max(1, Math.round(input.length / ratio));
    const output = new Float32Array(newLength);

    for (let i = 0; i < newLength; i++) {
      const position = i * ratio;
      const index = Math.floor(position);
      const nextIndex = Math.min(index + 1, input.length - 1);
      const weight = position - index;
      output[i] = input[index] * (1 - weight) + input[nextIndex] * weight;
    }

    return output;
  }

  cleanup(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }

    this.clearPlaybackQueue();
  }

  isRecordingStatus(): boolean {
    return this.isRecording;
  }

  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }
}
