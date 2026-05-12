/**
 * SettingsPanel Component
 * Painel de configurações da aplicação
 */

import React from 'react';
import { Settings } from 'lucide-react';

interface SettingsPanelProps {
  mode: 'translation' | 'pronunciation' | 'conversation';
  onModeChange: (mode: 'translation' | 'pronunciation' | 'conversation') => void;
  nativeLanguage: string;
  onNativeLanguageChange: (lang: string) => void;
  targetLanguage: string;
  onTargetLanguageChange: (lang: string) => void;
  voiceId: string;
  onVoiceChange: (voice: string) => void;
}

const LANGUAGES = [
  { code: 'pt', name: 'Português (Brasil)' },
  { code: 'en', name: 'English (US)' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文 (Simplified)' },
  { code: 'ko', name: '한국어' },
  { code: 'it', name: 'Italiano' },
  { code: 'ru', name: 'Русский' },
];

const VOICES = [
  { id: 'Puck', name: 'Puck' },
  { id: 'Charon', name: 'Charon' },
  { id: 'Kore', name: 'Kore' },
  { id: 'Fenrir', name: 'Fenrir' },
  { id: 'Zephyr', name: 'Zephyr' },
];

const MODES = [
  { id: 'translation', label: 'Tradução em Tempo Real' },
  { id: 'pronunciation', label: 'Treino de Pronúncia' },
  { id: 'conversation', label: 'Conversação Livre' },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  mode,
  onModeChange,
  nativeLanguage,
  onNativeLanguageChange,
  targetLanguage,
  onTargetLanguageChange,
  voiceId,
  onVoiceChange,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-slate-900">Configurações</h2>
        </div>
        <div
          className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        >
          ▼
        </div>
      </button>

      {isExpanded && (
        <div className="p-6 space-y-6 border-t border-slate-200 max-h-96 overflow-y-auto">
          {/* Mode */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Modo de Uso
            </label>
            <div className="grid grid-cols-1 gap-2">
              {MODES.map((m) => (
                <label
                  key={m.id}
                  className="flex items-center gap-3 p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="mode"
                    value={m.id}
                    checked={mode === m.id}
                    onChange={(e) =>
                      onModeChange(e.target.value as typeof mode)
                    }
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="text-slate-700">{m.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Idioma Nativo
              </label>
              <select
                value={nativeLanguage}
                onChange={(e) => onNativeLanguageChange(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Idioma Alvo
              </label>
              <select
                value={targetLanguage}
                onChange={(e) => onTargetLanguageChange(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Voice */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Voz da IA
            </label>
            <select
              value={voiceId}
              onChange={(e) => onVoiceChange(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {VOICES.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
