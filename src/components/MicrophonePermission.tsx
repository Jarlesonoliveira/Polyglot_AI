/**
 * MicrophonePermission Component
 * Testa e gerencia permissão do microfone
 */

import React, { useState } from 'react';
import { Mic, CheckCircle, AlertCircle } from 'lucide-react';

interface MicrophonePermissionProps {
  onPermissionGranted?: () => void;
}

type PermissionStatus = 'unknown' | 'checking' | 'granted' | 'denied' | 'error';

export const MicrophonePermission: React.FC<MicrophonePermissionProps> = ({
  onPermissionGranted,
}) => {
  const [status, setStatus] = useState<PermissionStatus>('unknown');
  const [errorMessage, setErrorMessage] = useState('');

  const checkMicrophonePermission = async () => {
    setStatus('checking');
    setErrorMessage('');

    try {
      // Tentar acessar o microfone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Se conseguiu, parar o stream e marcar como concedido
      stream.getTracks().forEach((track) => track.stop());
      setStatus('granted');
      onPermissionGranted?.();
    } catch (error) {
      const err = error as Error;

      if (err.name === 'NotAllowedError') {
        setStatus('denied');
        setErrorMessage(
          'Permissão negada. Clique no ícone 🔒 na barra de endereço e permita o microfone.'
        );
      } else if (err.name === 'NotFoundError') {
        setStatus('error');
        setErrorMessage(
          'Nenhum microfone foi encontrado. Verifique se o microfone está conectado.'
        );
      } else if (err.name === 'NotSupportedError') {
        setStatus('error');
        setErrorMessage(
          'Seu navegador não suporta acesso ao microfone. Tente usar Chrome, Edge ou Firefox.'
        );
      } else {
        setStatus('error');
        setErrorMessage(
          `Erro ao acessar microfone: ${err.message || 'Desconhecido'}`
        );
      }
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'granted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'denied':
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Mic className="w-5 h-5 text-slate-600" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'granted':
        return 'Microfone permitido ✓';
      case 'denied':
        return 'Permissão negada';
      case 'error':
        return 'Erro ao acessar microfone';
      case 'checking':
        return 'Verificando...';
      default:
        return 'Testar microfone';
    }
  };

  const isLoading = status === 'checking';

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        {getStatusIcon()}
        <h3 className="font-semibold text-slate-900">Permissão de Microfone</h3>
      </div>

      <button
        onClick={checkMicrophonePermission}
        disabled={isLoading}
        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
          status === 'granted'
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        } ${isLoading ? 'opacity-75 cursor-wait' : ''}`}
      >
        <Mic className="w-4 h-4" />
        {getStatusText()}
      </button>

      {errorMessage && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {status === 'denied' && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          <strong>Como resolver:</strong>
          <ol className="mt-2 space-y-1 ml-4 list-decimal">
            <li>Clique no ícone 🔒 à esquerda na barra de endereço</li>
            <li>Clique em "Permissões do site"</li>
            <li>Mude "Microfone" para "Permitir"</li>
            <li>Recarregue a página (F5)</li>
            <li>Clique no botão "Testar microfone" novamente</li>
          </ol>
        </div>
      )}

      {status === 'granted' && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          ✓ Microfone pronto para usar! Agora você pode ativar a sessão no botão principal.
        </div>
      )}
    </div>
  );
};
