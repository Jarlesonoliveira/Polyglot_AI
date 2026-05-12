/**
 * ControlButton Component
 * Botão de controle principal para iniciar/parar sessão
 */

import React from 'react';
import { Mic, Square } from 'lucide-react';

interface ControlButtonProps {
  isListening: boolean;
  isConnected: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
  audioLevel?: number;
  noApiKey?: boolean;
}

export const ControlButton: React.FC<ControlButtonProps> = ({
  isListening,
  isConnected,
  onStart,
  onStop,
  disabled = false,
  audioLevel = 0,
  noApiKey = false,
}) => {
  const handleClick = () => {
    if (isListening) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`relative w-24 h-24 rounded-full font-bold text-white text-lg transition-all duration-300 flex items-center justify-center ${
          isListening
            ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/50 animate-pulse-glow scale-105'
            : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-lg'
        } ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:shadow-2xl'
        }`}
      >
        {isListening ? (
          <Square className="w-8 h-8 fill-current" />
        ) : (
          <Mic className="w-8 h-8" />
        )}
      </button>

      {/* Status */}
      <div className="text-center">
        <p className="text-sm font-medium text-slate-700">
          {noApiKey
            ? 'Insira a chave API'
            : isListening
            ? 'Ouvindo...'
            : isConnected
            ? 'Pronto para começar'
            : 'Clique para iniciar'}
        </p>
        {isListening && audioLevel > 0 && (
          <p className="text-xs text-slate-500 mt-1">
            Nível: {Math.round(audioLevel * 100)}%
          </p>
        )}
      </div>

      {/* Atividade visual */}
      {isListening && (
        <div className="flex gap-1 items-center">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 bg-indigo-600 rounded-full"
              style={{
                height: `${6 + Math.sin((Date.now() / 200 + i) / 5) * 8}px`,
                transition: 'height 0.1s ease-out',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
