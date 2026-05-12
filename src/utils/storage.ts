/**
 * Utilitários de armazenamento local
 */

const PREFIX = 'polyglot_ai_';

export const LocalStorage = {
  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (error) {
      console.error(`Erro ao salvar ${key} no localStorage:`, error);
    }
  },

  get: <T = any>(key: string, defaultValue?: T): T | undefined => {
    try {
      const item = localStorage.getItem(PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Erro ao ler ${key} do localStorage:`, error);
      return defaultValue;
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch (error) {
      console.error(`Erro ao remover ${key} do localStorage:`, error);
    }
  },

  clear: (): void => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error);
    }
  },

  getAll: (): Record<string, any> => {
    try {
      const items: Record<string, any> = {};
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(PREFIX)) {
          const itemKey = key.replace(PREFIX, '');
          items[itemKey] = JSON.parse(localStorage.getItem(key) || '');
        }
      });
      return items;
    } catch (error) {
      console.error('Erro ao obter dados do localStorage:', error);
      return {};
    }
  },
};
