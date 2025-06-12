import React, { useState, useEffect } from 'react';
import useInactivityTimer from '../hooks/useInactivityTimer';

// Versão modificada que não depende diretamente do useAuth
const InactivityWarning = ({ onLogout }) => {
  const [showModal, setShowModal] = useState(false);
  
  // Função chamada quando o usuário fica inativo
  const handleInactive = () => {
    // Fazer logout automático via prop
    if (onLogout) {
      onLogout('inactivity');
    }
  };

  // Função chamada quando o aviso de inatividade deve ser mostrado
  const handleWarning = () => {
    setShowModal(true);
  };

  // Hook de inatividade - 10 minutos para logout, aviso 60 segundos antes
  const { isWarning, remainingTime, extendSession } = useInactivityTimer(
    10, // minutos para inatividade
    handleInactive,
    handleWarning,
    60 // segundos de aviso
  );

  // Fechar modal quando não estiver mais em aviso
  useEffect(() => {
    if (!isWarning) {
      setShowModal(false);
    }
  }, [isWarning]);

  // Continuar sessão
  const handleContinue = () => {
    extendSession();
    setShowModal(false);
  };

  // Fazer logout manualmente
  const handleLogout = () => {
    if (onLogout) {
      onLogout('manual');
    }
  };

  // Converter segundos para minutos (arredondando para cima)
  const remainingMinutes = Math.ceil(remainingTime / 60);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Aviso de Inatividade
        </h3>
        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            Sua sessão será encerrada em breve devido à inatividade.
          </p>
          <p className="text-gray-700 font-bold">
            Tempo restante: {remainingMinutes} minuto{remainingMinutes !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Sair agora
          </button>
          <button
            onClick={handleContinue}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Continuar conectado
          </button>
        </div>
      </div>
    </div>
  );
};

export default InactivityWarning;
