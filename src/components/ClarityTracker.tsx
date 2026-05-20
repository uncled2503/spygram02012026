import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ClarityTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Verifica se a API global do Clarity está disponível na janela do navegador
    if (typeof window !== 'undefined' && (window as any).clarity) {
      // Notifica o Clarity que uma nova rota virtual foi acessada pelo usuário
      const virtualPath = location.pathname + location.search;
      (window as any).clarity("route", virtualPath);
    }
  }, [location]);

  return null;
};

export default ClarityTracker;