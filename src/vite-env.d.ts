/// <reference types="vite/client" />

/**
 * Tipos e interfaces globais
 */

interface ImportMetaEnv {
  readonly VITE_API_KEY?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_DEBUG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Estender tipos do Web Audio API
declare global {
  interface AudioProcessingEvent {
    inputBuffer: AudioBuffer;
    outputBuffer: AudioBuffer;
  }

  interface ScriptProcessorNode extends AudioNode {
    onaudioprocess: ((event: AudioProcessingEvent) => void) | null;
  }
}

export {};
