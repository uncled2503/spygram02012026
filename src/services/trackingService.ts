import { supabase } from '../integrations/supabase/client';

export const trackLead = async (data: {
  username_searched?: string;
  full_name?: string;
  profile_pic?: string;
  email?: string;
  phone?: string;
  document?: string;
  status?: string;
  amount?: number; 
  city?: string;
  state?: string;
  ip_address?: string;
}) => {
  try {
    const userAgent = navigator.userAgent;
    let existingLeadId = sessionStorage.getItem('current_lead_id');
    const updateData: any = { ...data };
    
    if (data.amount !== undefined) {
      updateData.total_amount = data.amount;
      delete updateData.amount;
    }

    // Se já temos um ID, tentamos o UPDATE
    if (existingLeadId) {
      // Usamos count: 'exact' para saber se o registro realmente existe
      const { error, count } = await supabase
        .from('leads')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        }, { count: 'exact' })
        .eq('id', existingLeadId);
      
      // Se o update funcionou e alterou 1 linha, encerramos aqui
      if (!error && count && count > 0) return;

      // Se o erro for nulo mas count for 0, significa que o lead foi DELETADO pelo admin
      if (!error && count === 0) {
        console.warn('[tracking] Lead foi excluído pelo administrador. Aguardando nova ação do usuário.');
        // Se o status for apenas uma atualização de rotina (pesquisou/confirmou), não recriamos
        if (data.status === 'pesquisou' || !data.email) {
          return; 
        }
        // Se for algo crítico (checkout/pagou), limpamos o ID para permitir um novo insert abaixo
        sessionStorage.removeItem('current_lead_id');
        existingLeadId = null;
      }
    }

    // Só cria um novo lead se não houver ID (ou se foi limpo acima por ser uma ação crítica)
    if (!existingLeadId) {
      const { data: newLead, error: insertError } = await supabase
        .from('leads')
        .insert([{
          ...updateData,
          user_agent: userAgent
        }])
        .select()
        .single();

      if (insertError) {
        console.error('[tracking] Erro ao criar novo lead:', insertError.message);
      } else if (newLead) {
        sessionStorage.setItem('current_lead_id', newLead.id);
      }
    }
  } catch (err) {
    console.error('[tracking] Falha crítica no rastreamento:', err);
  }
};