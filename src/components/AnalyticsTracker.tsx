import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AnalyticsTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Evita erros caso os scripts ainda não tenham sido carregados no index.html
    const win = window as any;

    // 1. Notifica o Microsoft Clarity sobre a nova visualização de página
    if (typeof win.clarity === 'function') {
      // Dispara um evento personalizado com o caminho atual da rota
      win.clarity("event", "pageview", { path: location.pathname });
      // Atualiza as dimensões de rastreamento do Clarity para segmentação
      win.clarity("set", "route", location.pathname);
    }

    // 2. Notifica o Meta Pixel (Facebook) que o usuário mudou de página
    if (typeof win.fbq === 'function') {
      win.fbq('track', 'PageView');
    }

    // Opcional: Rolar para o topo em transições de página
    window.scrollTo(0, 0);

  }, [location]);

  return null; // Componente invisível de utilidade
};

export default AnalyticsTracker;