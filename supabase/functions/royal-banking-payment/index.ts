import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const ROYAL_BANKING_TOKEN = Deno.env.get('ROYAL_BANKING_TOKEN')
    if (!ROYAL_BANKING_TOKEN) {
      console.error("[royal-banking-payment] ROYAL_BANKING_TOKEN não configurada.");
      throw new Error('Configuração de token pendente.')
    }

    const { name, email, document, phone, amount, items } = await req.json()

    // Higienização de documentos e telefone (apenas números)
    const cleanDocument = document.replace(/\D/g, '');
    const cleanPhone = phone.replace(/\D/g, '');

    // Payload estruturado conforme a documentação da Royal Banking para Transações
    const payload = {
      customer: {
        name: name,
        email: email,
        document: cleanDocument,
        phone: cleanPhone
      },
      payment_method: 'pix',
      amount: Math.round(amount * 100), // Valor em centavos
      items: items.map((item: any) => ({
        title: item.name,
        unit_price: Math.round(item.price * 100),
        quantity: 1
      })),
      // URL de Postback para notificações de status de pagamento
      postback_url: 'https://wdxgxbvrealcalipuzay.supabase.co/functions/v1/payment-webhook'
    }

    console.log("[royal-banking-payment] Enviando transação para Royal Banking...");

    const response = await fetch('https://api.royalbanking.com.br/api/v1/transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ROYAL_BANKING_TOKEN}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[royal-banking-payment] Erro na Resposta:", data);
      return new Response(JSON.stringify({ 
        error: data.message || 'Erro ao processar transação na Royal Banking',
        details: data.errors || null
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // A API geralmente retorna 'pix_url', 'pix_qrcode' ou um link de checkout
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("[royal-banking-payment] Falha crítica:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})