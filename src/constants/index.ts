/**
 * Constantes da Aplicação
 */

// Idiomas Suportados
export const SUPPORTED_LANGUAGES = {
  pt: { name: 'Português (Brasil)', nativeName: 'Português' },
  en: { name: 'English (US)', nativeName: 'English' },
  es: { name: 'Español', nativeName: 'Español' },
  fr: { name: 'Français', nativeName: 'Français' },
  de: { name: 'Deutsch', nativeName: 'Deutsch' },
  ja: { name: '日本語', nativeName: '日本語' },
  zh: { name: '中文 (Simplified)', nativeName: '中文' },
  ko: { name: '한국어', nativeName: '한국어' },
  it: { name: 'Italiano', nativeName: 'Italiano' },
  ru: { name: 'Русский', nativeName: 'Русский' },
} as const;

export type SupportedLanguageCode = keyof typeof SUPPORTED_LANGUAGES;

// Modos de Uso
export const MODES = {
  translation: {
    id: 'translation',
    label: 'Tradução em Tempo Real',
    description: 'Traduza conversas entre idiomas em tempo real',
  },
  pronunciation: {
    id: 'pronunciation',
    label: 'Treino de Pronúncia',
    description: 'Pratique e melhore sua pronúncia',
  },
  conversation: {
    id: 'conversation',
    label: 'Conversação Livre',
    description: 'Converse naturalmente em outro idioma',
  },
} as const;

export type ModeType = keyof typeof MODES;

// Vozes da IA
export const AI_VOICES = {
  Puck: { id: 'Puck', name: 'Puck', gender: 'male' },
  Charon: { id: 'Charon', name: 'Charon', gender: 'male' },
  Kore: { id: 'Kore', name: 'Kore', gender: 'female' },
  Fenrir: { id: 'Fenrir', name: 'Fenrir', gender: 'male' },
  Zephyr: { id: 'Zephyr', name: 'Zephyr', gender: 'neutral' },
} as const;

export type VoiceId = keyof typeof AI_VOICES;

// Configurações de Áudio
export const AUDIO_CONFIG = {
  // Entrada (microfone)
  INPUT_SAMPLE_RATE: 16000, // Hz
  INPUT_CHANNELS: 1,
  INPUT_FRAME_SIZE: 4096, // samples

  // Saída (altofalante)
  OUTPUT_SAMPLE_RATE: 24000, // Hz
  OUTPUT_CHANNELS: 1,

  // Processamento
  ECHO_CANCELLATION: true,
  NOISE_SUPPRESSION: true,
  AUTO_GAIN_CONTROL: true,
} as const;

// Configurações da API Gemini
export const GEMINI_CONFIG = {
  MODEL: 'gemini-2.5-flash-native-audio-preview-09-2025',
  RESPONSE_MODALITIES: ['AUDIO'] as const,
  ENABLE_INPUT_TRANSCRIPTION: true,
  ENABLE_OUTPUT_TRANSCRIPTION: true,
  API_TIMEOUT: 30000, // ms
  RECONNECT_ATTEMPTS: 3,
  RECONNECT_DELAY: 1000, // ms
} as const;

// Limites e Thresholds
export const LIMITS = {
  MAX_MESSAGE_LENGTH: 2000,
  MAX_MESSAGE_HISTORY: 100,
  MIN_AUDIO_DURATION: 500, // ms
  AUDIO_LEVEL_THRESHOLD: 0.05, // 5%
  SESSION_IDLE_TIMEOUT: 300000, // 5 minutes
} as const;

// URLs e Endpoints
export const URLS = {
  GOOGLE_AI_STUDIO: 'https://aistudio.google.com/app/apikey',
  GEMINI_API_BASE: 'https://generativelanguage.googleapis.com',
  DOCS_GEMINI: 'https://ai.google.dev/docs',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  API_KEY: 'api_key',
  LANGUAGE_NATIVE: 'language_native',
  LANGUAGE_TARGET: 'language_target',
  CURRENT_MODE: 'current_mode',
  VOICE_ID: 'voice_id',
  CONVERSATION_HISTORY: 'conversation_history',
  APP_SETTINGS: 'app_settings',
} as const;

// Mensagens de Erro
export const ERROR_MESSAGES = {
  AUDIO_NOT_ALLOWED: 'Permissão de microfone negada. Verifique as configurações do navegador.',
  API_KEY_REQUIRED: 'Chave API do Google é necessária',
  API_KEY_INVALID: 'Chave API inválida ou expirada',
  CONNECTION_FAILED: 'Falha ao conectar com a API Gemini',
  AUDIO_INITIALIZATION_FAILED: 'Falha ao inicializar o áudio',
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet',
  TIMEOUT: 'Tempo limite excedido. Tente novamente',
  UNKNOWN_ERROR: 'Erro desconhecido. Tente recarregar a página',
} as const;

// Mensagens de Sucesso
export const SUCCESS_MESSAGES = {
  CONNECTED: 'Conectado com sucesso',
  SESSION_STARTED: 'Sessão iniciada',
  SESSION_ENDED: 'Sessão finalizada',
  SETTINGS_SAVED: 'Configurações salvas',
} as const;

// Cores e Temas
export const THEME_COLORS = {
  PRIMARY: 'indigo',
  SUCCESS: 'emerald',
  ERROR: 'red',
  WARNING: 'amber',
  INFO: 'blue',
} as const;

// Animações
export const ANIMATIONS = {
  PULSE_GLOW: 'animate-pulse-glow',
  FADE_IN: 'animate-fade-in',
  SLIDE_IN: 'animate-slide-in',
} as const;
