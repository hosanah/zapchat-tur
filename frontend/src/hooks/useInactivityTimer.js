import React, { useEffect, useState, useCallback } from 'react';

/**
 * Hook para controlar inatividade do usuário e fazer logout automático
 * @param {number} timeout - Tempo em minutos para considerar inatividade
 * @param {function} onInactive - Função a ser chamada quando o usuário ficar inativo
 * @param {function} onWarning - Função a ser chamada para avisar que o tempo está acabando
 * @param {number} warningTime - Tempo em segundos antes do timeout para mostrar aviso
 */
const useInactivityTimer = (
  timeout = 10, 
  onInactive = () => {}, 
  onWarning = () => {},
  warningTime = 60
) => {
  const [isWarning, setIsWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(warningTime);
  const [isActive, setIsActive] = useState(true);

  // Converter timeout para milissegundos
  const timeoutMs = timeout * 60 * 1000;
  const warningTimeMs = warningTime * 1000;

  // Função para resetar o timer
  const resetTimer = useCallback(() => {
    setIsWarning(false);
    setIsActive(true);
  }, []);

  // Função para estender a sessão manualmente
  const extendSession = useCallback(() => {
    resetTimer();
    // Disparar evento para notificar outros componentes
    window.dispatchEvent(new CustomEvent('auth:extend-session'));
  }, [resetTimer]);

  useEffect(() => {
    let inactivityTimer;
    let warningTimer;
    let countdownInterval;

    // Função para iniciar o timer de inatividade
    const startInactivityTimer = () => {
      // Limpar timers existentes
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      clearInterval(countdownInterval);

      // Definir timer para aviso
      warningTimer = setTimeout(() => {
        setIsWarning(true);
        setRemainingTime(warningTime);
        
        // Chamar callback de aviso
        onWarning();
        
        // Iniciar contagem regressiva
        countdownInterval = setInterval(() => {
          setRemainingTime(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, timeoutMs - warningTimeMs);

      // Definir timer para inatividade
      inactivityTimer = setTimeout(() => {
        setIsActive(false);
        setIsWarning(false);
        clearInterval(countdownInterval);
        
        // Chamar callback de inatividade
        onInactive();
      }, timeoutMs);
    };

    // Eventos que resetam o timer de inatividade
    const events = [
      'mousedown', 'mousemove', 'keypress', 
      'scroll', 'touchstart', 'click', 'keydown'
    ];

    // Função para resetar o timer quando houver atividade
    const resetTimerOnActivity = () => {
      if (!isActive) return; // Não resetar se já estiver inativo
      resetTimer();
      startInactivityTimer();
    };

    // Listener para evento customizado de atividade
    const handleCustomActivity = () => {
      resetTimer();
      startInactivityTimer();
    };

    // Adicionar event listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimerOnActivity);
    });

    // Adicionar listener para evento customizado
    window.addEventListener('auth:activity', handleCustomActivity);

    // Iniciar timer
    startInactivityTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimerOnActivity);
      });
      window.removeEventListener('auth:activity', handleCustomActivity);
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      clearInterval(countdownInterval);
    };
  }, [timeoutMs, warningTimeMs, warningTime, onInactive, onWarning, isActive, resetTimer]);

  return {
    isWarning,
    remainingTime,
    isActive,
    extendSession,
    resetTimer
  };
};

export default useInactivityTimer;
