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

    const { leadId, action, amount, email } = await req.json()

    if (!action) {
      return new Response(JSON.stringify({ error: 'Ação é obrigatória.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'get') {
      let leadIdsToQuery: string[] = [];
      
      // Busca todos os leads vinculados a este e-mail para unificar os créditos
      if (email) {
        const { data: leads } = await supabase
          .from('leads')
          .select('id')
          .eq('email', email.trim().toLowerCase());
        leadIdsToQuery = leads?.map(l => l.id) || [];
      } else if (leadId) {
        leadIdsToQuery = [leadId];
      }

      if (leadIdsToQuery.length === 0) {
        return new Response(JSON.stringify({ payments: [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      // Retorna todos os pagamentos vinculados a qualquer um dos leads do usuário
      const { data: payments, error } = await supabase
        .from('payments')
        .select('status, payload')
        .in('lead_id', leadIdsToQuery);

      if (error) throw error;

      return new Response(JSON.stringify({ payments }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Ações de adicionar e remover ainda precisam do leadId específico
    if (!leadId) {
      throw new Error('leadId é obrigatório para esta ação.');
    }

    if (action === 'add') {
      const { error: insertError } = await supabase
        .from('payments')
        .insert({
          transaction_id: `MANUAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          lead_id: leadId,
          status: 'approved',
          payload: { amount: parseFloat(amount) }
        });

      if (insertError) throw insertError;

      const { error: leadError } = await supabase
        .from('leads')
        .update({ status: 'pagou' })
        .eq('id', leadId);

      if (leadError) throw leadError;

      return new Response(JSON.stringify({ success: true, message: 'Créditos adicionados com sucesso!' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })

    } else if (action === 'remove') {
      const { data: payments, error: selectError } = await supabase
        .from('payments')
        .select('id, payload')
        .eq('lead_id', leadId);

      if (selectError) throw selectError;

      const creditPaymentIds = payments
        ?.filter(p => {
          const payAmt = Number(p.payload?.amount) || 0;
          return payAmt === 49.50 || payAmt === 79.50 || payAmt === 149.00;
        })
        .map(p => p.id) || [];

      if (creditPaymentIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('payments')
          .delete()
          .in('id', creditPaymentIds);

        if (deleteError) throw deleteError;
      }

      return new Response(JSON.stringify({ success: true, message: 'Todos os créditos foram removidos!' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    throw new Error('Ação inválida.');
  } catch (error: any) {
    console.error("[manage-credits] Erro fatal:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})