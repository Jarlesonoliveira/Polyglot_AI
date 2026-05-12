/**
 * ChatTranscription Component
 * Exibe a transcrição em tempo real da conversa
 */

import React, { useEffect, useRef } from 'react';
import { Message } from '../services/translationService';

interface ChatTranscriptionProps {
  messages: Message[];
  isListening: boolean;
  audioLevel: number;
  onClear?: () => void;
}

export const ChatTranscription: React.FC<ChatTranscriptionProps> = ({
  messages,
  isListening,
  audioLevel,
  onClear,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll para a última mensagem
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-lg border border-slate-200">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Transcrição em Tempo Real</h2>
        <div className="flex items-center gap-3">
        {onClear && messages.length > 0 && (
          <button
            onClick={onClear}
            title="Limpar transcrição"
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Limpar
          </button>
        )}
        {isListening && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-emerald-500 rounded-full"
                  style={{
                    height: `${4 + audioLevel * 12}px`,
                    animation: `pulse 0.3s ease-in-out ${i * 0.1}s infinite`,
                  }}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-emerald-600">Ouvindo...</span>
          </div>
        )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-slate-500">
            <div>
              <p className="text-lg font-medium">Nenhuma mensagem ainda</p>
              <p className="text-sm mt-2">Comece uma sessão para ver a transcrição</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-white border border-slate-300 text-slate-900 rounded-bl-none'
                } ${message.live ? 'ring-2 ring-emerald-300/70' : ''}`}
              >
                <p className="text-sm leading-relaxed break-words">
                  {message.text}
                </p>
                <p
                  className={`text-xs mt-2 ${
                    message.type === 'user'
                      ? 'text-indigo-100'
                      : 'text-slate-500'
                  }`}
                >
                  {message.live ? 'Transcrevendo...' : ''}
                  {message.live ? ' • ' : ''}
                  {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
