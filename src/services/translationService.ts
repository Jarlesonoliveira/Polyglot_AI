/**
 * Translation Service
 * Gerencia a lógica de tradução e conversação
 */

export interface Message {
  id: string;
  type: 'user' | 'assistant';
  text: string;
  audioData?: Uint8Array;
  timestamp: number;
  live?: boolean;
}

export interface ConversationContext {
  nativeLanguage: string;
  targetLanguage: string;
  mode: 'translation' | 'pronunciation' | 'conversation';
  messages: Message[];
}

export class TranslationService {
  private context: ConversationContext;
  private translationCache: Map<string, string> = new Map();

  constructor(nativeLanguage: string, targetLanguage: string, mode: 'translation' | 'pronunciation' | 'conversation' = 'translation') {
    this.context = {
      nativeLanguage,
      targetLanguage,
      mode,
      messages: [],
    };
  }

  addMessage(text: string, type: 'user' | 'assistant', audioData?: Uint8Array, live: boolean = false): Message {
    const message: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      type,
      text,
      audioData,
      timestamp: Date.now(),
      live,
    };

    this.context.messages.push(message);
    return message;
  }

  upsertMessage(
    id: string,
    text: string,
    type: 'user' | 'assistant',
    live: boolean,
    audioData?: Uint8Array
  ): Message {
    const existingIndex = this.context.messages.findIndex((message) => message.id === id);

    if (existingIndex >= 0) {
      const current = this.context.messages[existingIndex];
      const updated: Message = {
        ...current,
        text,
        type,
        audioData: audioData ?? current.audioData,
        live,
        timestamp: Date.now(),
      };
      this.context.messages[existingIndex] = updated;
      return updated;
    }

    const created: Message = {
      id,
      type,
      text,
      audioData,
      timestamp: Date.now(),
      live,
    };
    this.context.messages.push(created);
    return created;
  }

  getMessages(): Message[] {
    return this.context.messages;
  }

  getLastUserMessage(): Message | undefined {
    return [...this.context.messages]
      .reverse()
      .find(msg => msg.type === 'user');
  }

  getLastAssistantMessage(): Message | undefined {
    return [...this.context.messages]
      .reverse()
      .find(msg => msg.type === 'assistant');
  }

  private getLanguageLabel(code: string): string {
    const labels: Record<string, string> = {
      pt: 'Português',
      en: 'Inglês',
      es: 'Espanhol',
      fr: 'Francês',
      de: 'Alemão',
      ja: 'Japonês',
      zh: 'Chinês',
      ko: 'Coreano',
      it: 'Italiano',
      ru: 'Russo',
    };

    return labels[code] || code;
  }

  generateSystemPrompt(): string {
    const nativeLang = this.getLanguageLabel(this.context.nativeLanguage);
    const targetLang = this.getLanguageLabel(this.context.targetLanguage);

    const modePrompts = {
      translation: `Você é um intérprete de áudio simultâneo e bidirecional extremamente rápido e preciso. Sua ÚNICA função é traduzir o que você ouvir entre os idiomas: ${nativeLang} e ${targetLang}.
REGRA DE OURO: Se ouvir em ${nativeLang}, responda IMEDIATAMENTE a tradução em ${targetLang}. Se ouvir em ${targetLang}, responda IMEDIATAMENTE a tradução em ${nativeLang}.
Regras estritas: NÃO adicione comentários, não converse. APENAS traduza. Mantenha o tom e a emoção. Se for ininteligível, não diga nada.`,
      pronunciation: `Você é um professor de idiomas extremamente rigoroso focado em análise de pronúncia. O usuário está aprendendo ${targetLang} e sua língua nativa é ${nativeLang}.
Seu objetivo é ouvir o usuário falar em ${targetLang} e corrigir IMEDIATAMENTE qualquer erro de pronúncia, sotaque ou entonação.
Regras: Seja direto. Aponte exatamente qual sílaba ou fonema foi pronunciado errado. Dê dicas fonéticas de como posicionar a língua/boca. Fale no idioma ${nativeLang} para explicar o erro, mas demonstre a pronúncia correta em ${targetLang}.`,
      conversation: `Você é um parceiro de conversação amigável e nativo do idioma ${targetLang}. O usuário fala ${nativeLang} e está praticando ${targetLang}.
Seu objetivo é manter uma conversa natural, fluida e engajadora.
Regras: Responda sempre em ${targetLang}. Faça perguntas para manter a conversa viva. Se o usuário cometer um erro grave, corrija-o gentilmente, mas não pare a conversa por erros pequenos. Adapte seu vocabulário ao nível que o usuário demonstrar.`,
    };

    return modePrompts[this.context.mode];
  }

  clearContext(): void {
    this.context.messages = [];
    this.translationCache.clear();
  }

  setMode(mode: 'translation' | 'pronunciation' | 'conversation'): void {
    this.context.mode = mode;
  }

  setLanguages(native: string, target: string): void {
    this.context.nativeLanguage = native;
    this.context.targetLanguage = target;
    this.clearContext();
  }

  getContext(): ConversationContext {
    return this.context;
  }

  // Simular tradução local (em produção, usaria a API Gemini)
  simulateTranslation(text: string): string {
    const cacheKey = `${this.context.nativeLanguage}_${this.context.targetLanguage}_${text}`;
    
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey)!;
    }

    // Simular tradução (em produção seria real)
    const translation = `[Tradução de: "${text}" para ${this.context.targetLanguage}]`;
    this.translationCache.set(cacheKey, translation);
    
    return translation;
  }
}
