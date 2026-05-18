import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Tratamento de CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const payload = await req.json()
    console.log("[payment-webhook] Recebido:", payload);

    // Extrai os campos conforme a documentação (idTransaction ou externalReference)
    const transactionId = payload.idTransaction || payload.externalReference;
    const status = payload.status;

    if (!transactionId || !status) {
      console.error("[payment-webhook] Payload inválido: faltando ID ou Status");
      return new Response(JSON.stringify(400), { status: 400 });
    }

    // Registra ou atualiza o status no banco de dados
    const { error } = await supabase
      .from('payments')
      .upsert({ 
        transaction_id: transactionId, 
        status: status,
        payload: payload,
        updated_at: new Date().toISOString()
      }, { onConflict: 'transaction_id' });

    if (error) {
      console.error("[payment-webhook] Erro ao salvar no banco:", error.message);
      // Mesmo com erro no banco, a doc sugere responder 200 se o payload foi recebido
    }

    // Conforme a documentação: retorne imediatamente HTTP 200 com json_encode(200)
    return new Response(JSON.stringify(200), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error("[payment-webhook] Falha crítica:", error.message)
    return new Response(JSON.stringify(500), { status: 500 })
  }
})