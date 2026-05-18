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
      // O count: 'exact' nos diz quantas linhas foram alteradas
      const { error, count } = await supabase
        .from('leads')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        }, { count: 'exact' })
        .eq('id', existingLeadId);
      
      // Se alterou a linha, sucesso!
      if (!error && count && count > 0) return;

      // Se count for 0, significa que o lead foi EXCLUÍDO do banco de dados
      if (!error && count === 0) {
        console.warn('[tracking] Lead excluído pelo admin. Encerrando rastreio desta sessão.');
        sessionStorage.removeItem('current_lead_id');
        // Importante: NÃO prossegue para o INSERT abaixo
        return;
      }
    }

    // Só cria um novo lead se não houver ID (sessão nova ou erro no update)
    // E só criamos no "pesquisou" ou se tivermos dados reais (email/documento)
    if (!existingLeadId && (data.status === 'pesquisou' || data.email)) {
      const { data: newLead, error: insertError } = await supabase
        .from('leads')
        .insert([{
          ...updateData,
          user_agent: userAgent
        }])
        .select()
        .single();

      if (!insertError && newLead) {
        sessionStorage.setItem('current_lead_id', newLead.id);
      }
    }
  } catch (err) {
    console.error('[tracking] Falha:', err);
  }
};