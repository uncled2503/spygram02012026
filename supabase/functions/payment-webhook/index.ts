import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const payload = await req.json()
    console.log("[payment-webhook] Payload recebido:", JSON.stringify(payload));

    const transactionId = payload.idTransaction;
    const externalRef = payload.externalReference;
    const rawStatus = String(payload.status || '').toLowerCase();

    if (!rawStatus || (!transactionId && !externalRef)) {
      console.error("[payment-webhook] Payload inválido.");
      return new Response(JSON.stringify(400), { status: 400 });
    }

    let leadIdToUnlock = null;

    // 1. Tentar localizar o pagamento pela transaction_id
    if (transactionId) {
      const { data: paymentData } = await supabase
        .from('payments')
        .update({ 
          status: payload.status,
          payload: payload,
          updated_at: new Date().toISOString()
        })
        .eq('transaction_id', String(transactionId))
        .select('lead_id')
        .single();
      
      if (paymentData?.lead_id) leadIdToUnlock = paymentData.lead_id;
    }

    // 2. Backup: Usar externalReference como lead_id direto
    if (!leadIdToUnlock && externalRef && String(externalRef).length > 20) {
      leadIdToUnlock = externalRef;
    }

    // 3. Verificação de Status (Lista de sucesso Royal Banking)
    const successStatuses = ['paid', 'saquepago', 'approved', 'success', 'pago'];
    const isPaid = successStatuses.includes(rawStatus);

    if (leadIdToUnlock && isPaid) {
      console.log(`[payment-webhook] LIBERANDO ACESSO -> Lead: ${leadIdToUnlock}`);
      
      const { error: leadError } = await supabase
        .from('leads')
        .update({ status: 'pagou' })
        .eq('id', leadIdToUnlock);

      if (leadError) console.error("[payment-webhook] Erro ao atualizar lead:", leadError.message);

      // --- NOVO DISPARO AUTOMÁTICO DE PURCHASE VIA CAPI ---
      try {
        const { data: leadData } = await supabase
          .from('leads')
          .select('email, phone, total_amount')
          .eq('id', leadIdToUnlock)
          .single();

        if (leadData) {
          console.log(`[payment-webhook] Disparando CAPI Purchase para email: ${leadData.email}`);
          await supabase.functions.invoke('facebook-capi', {
            body: {
              eventName: 'Purchase',
              userData: {
                email: leadData.email,
                phone: leadData.phone
              },
              customData: {
                value: Number(leadData.total_amount) || 37.90,
                currency: 'BRL'
              }
            }
          });
        }
      } catch (fbErr) {
        console.error("[payment-webhook] Falha ao enviar evento de Purchase:", fbErr.message);
      }
      // ----------------------------------------------------
    } else {
      console.warn(`[payment-webhook] Não liberado. Lead: ${leadIdToUnlock}, Status: ${rawStatus}`);
    }

    // Retorno padrão Royal Banking
    return new Response(JSON.stringify(200), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error("[payment-webhook] Erro Fatal:", error.message)
    return new Response(JSON.stringify(500), { status: 500 })
  }
})