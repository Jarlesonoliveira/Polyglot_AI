/**
 * App.tsx
 * Componente principal da aplicação Polyglot AI
 */

import { useState } from 'react';
import { useGeminiLive } from './hooks/useGeminiLive';
import { SettingsPanel } from './components/SettingsPanel';
import { ChatTranscription } from './components/ChatTranscription';
import { ControlButton } from './components/ControlButton';
import { MicrophonePermission } from './components/MicrophonePermission';
import appLogo from './assets/image_ff98b028.png';

function App() {
  // Estado de configuração
  const [mode, setMode] = useState<'translation' | 'pronunciation' | 'conversation'>('translation');
  const [nativeLanguage, setNativeLanguage] = useState('pt');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [voiceId, setVoiceId] = useState('Puck');

  // Hook customizado para Gemini Live
  const geminiLive = useGeminiLive({
    nativeLanguage,
    targetLanguage,
    mode,
    voiceId,
  });

  // Atualizar configurações
  const handleModeChange = (newMode: typeof mode) => {
    setMode(newMode);
    geminiLive.updateMode(newMode);
  };

  const handleNativeLanguageChange = (lang: string) => {
    setNativeLanguage(lang);
    geminiLive.updateLanguages(lang, targetLanguage);
  };

  const handleTargetLanguageChange = (lang: string) => {
    setTargetLanguage(lang);
    geminiLive.updateLanguages(nativeLanguage, lang);
  };

  const handleConnect = async () => {
    await geminiLive.connect();
  };

  const handleStartListening = async () => {
    // Solicitar permissão do microfone explicitamente antes de conectar
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      alert(
        'Permissão de microfone negada.\n\n' +
        'Para permitir:\n' +
        '1. Clique no ícone de cadeado/câmera na barra de endereço\n' +
        '2. Selecione "Permitir" para Microfone\n' +
        '3. Recarregue a página e tente novamente'
      );
      return;
    }

    if (!geminiLive.isConnected) {
      await handleConnect();
    }

    await geminiLive.startListening();
  };

  const handleStopListening = () => {
    geminiLive.stopListening();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4 sm:gap-6">
          <img
            src={appLogo}
            alt="Polyglot AI"
            className="w-32 h-32 sm:w-40 sm:h-40 object-cover"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-none">Polyglot AI</h1>
            <p className="text-base sm:text-lg text-slate-600 mt-2">
              Aprendizado de idiomas com IA em tempo real
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {geminiLive.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <span className="text-red-600 font-medium text-lg">⚠</span>
            <div>
              <h3 className="font-semibold text-red-900">Erro</h3>
              <p className="text-red-700 text-sm mt-1">{geminiLive.error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Settings and Control */}
          <div className="lg:col-span-1 space-y-6">
            <SettingsPanel
              mode={mode}
              onModeChange={handleModeChange}
              nativeLanguage={nativeLanguage}
              onNativeLanguageChange={handleNativeLanguageChange}
              targetLanguage={targetLanguage}
              onTargetLanguageChange={handleTargetLanguageChange}
              voiceId={voiceId}
              onVoiceChange={setVoiceId}
            />

            <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
              <ControlButton
                isListening={geminiLive.isListening}
                isConnected={geminiLive.isConnected}
                onStart={handleStartListening}
                onStop={handleStopListening}
                disabled={false}
                noApiKey={false}
                audioLevel={geminiLive.audioLevel}
              />
            </div>

            <MicrophonePermission />

            {/* Status Info */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-3 text-sm">Status</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">API:</span>
                  <span
                    className={`font-medium ${
                      geminiLive.isConnected
                        ? 'text-emerald-600'
                        : 'text-slate-400'
                    }`}
                  >
                    {geminiLive.isConnected ? '● Conectado' : '○ Desconectado'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Áudio:</span>
                  <span
                    className={`font-medium ${
                      geminiLive.isListening
                        ? 'text-emerald-600'
                        : 'text-slate-400'
                    }`}
                  >
                    {geminiLive.isListening ? '● Ativo' : '○ Inativo'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Mensagens:</span>
                  <span className="font-medium text-indigo-600">
                    {geminiLive.messages.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Chat */}
          <div className="lg:col-span-2">
            <ChatTranscription
              messages={geminiLive.messages}
              isListening={geminiLive.isListening}
              audioLevel={geminiLive.audioLevel}
              onClear={geminiLive.clearMessages}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400 text-sm">
          <p>Polyglot AI © 2026 - Powered by Google Gemini Live API</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
