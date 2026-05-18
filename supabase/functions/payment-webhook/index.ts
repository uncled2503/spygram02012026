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
    console.log("[payment-webhook] Recebido:", payload);

    const transactionId = String(payload.idTransaction || payload.externalReference);
    const status = payload.status; // Esperado 'paid', 'approved', etc.

    if (!transactionId || !status) {
      return new Response(JSON.stringify(400), { status: 400 });
    }

    // 1. Atualiza a tabela de pagamentos
    const { data: paymentData } = await supabase
      .from('payments')
      .update({ 
        status: status,
        payload: payload,
        updated_at: new Date().toISOString()
      })
      .eq('transaction_id', transactionId)
      .select('lead_id')
      .single();

    // 2. Se o pagamento for confirmado, atualiza o status do LEAD
    if (paymentData?.lead_id && (status === 'paid' || status === 'approved' || status === 'success')) {
      console.log(`[payment-webhook] Confirmando lead: ${paymentData.lead_id}`);
      await supabase
        .from('leads')
        .update({ status: 'pagou' })
        .eq('id', paymentData.lead_id);
    }

    return new Response(JSON.stringify(200), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error("[payment-webhook] Falha:", error.message)
    return new Response(JSON.stringify(500), { status: 500 })
  }
})