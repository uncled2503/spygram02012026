import { supabase } from '../integrations/supabase/client';

export const trackFacebookEvent = async (
  eventName: string,
  userData: { email?: string; phone?: string } = {},
  customData: { value?: number; currency?: string } = {}
) => {
  // 1. Disparo via Pixel tradicional no Navegador
  if (typeof (window as any).fbq === 'function') {
    (window as any).fbq('track', eventName, {
      content_name: eventName,
      value: customData.value || 37.90,
      currency: customData.currency || 'BRL',
    });
    console.log(`[Facebook Pixel] Evento ${eventName} disparado no navegador.`);
  }

  // 2. Disparo via Servidor (API de Conversões - CAPI)
  try {
    await supabase.functions.invoke('facebook-capi', {
      body: {
        eventName,
        userData,
        customData
      }
    });
    console.log(`[Facebook CAPI] Evento ${eventName} enviado via CAPI.`);
  } catch (err) {
    console.error('[Facebook CAPI] Erro ao disparar CAPI:', err);
  }
};