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
    // 1. Verifica se a sessão foi marcada como 'deletada pelo admin'
    if (sessionStorage.getItem('is_deleted_lead') === 'true') {
      return;
    }

    const userAgent = navigator.userAgent;
    let existingLeadId = sessionStorage.getItem('current_lead_id');
    const updateData: any = { ...data };
    
    if (data.amount !== undefined) {
      updateData.total_amount = data.amount;
      delete updateData.amount;
    }

    // 2. Se temos um ID, tentamos o UPDATE primeiro
    if (existingLeadId) {
      const { error, count } = await supabase
        .from('leads')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        }, { count: 'exact' })
        .eq('id', existingLeadId);
      
      // Sucesso: linha encontrada e atualizada
      if (!error && count && count > 0) {
        return;
      }

      // Se não houve erro mas o count é 0, o lead foi apagado do banco
      if (!error && count === 0) {
        console.warn('[tracking] Lead removido pelo administrador. Bloqueando reinserção.');
        sessionStorage.setItem('is_deleted_lead', 'true');
        sessionStorage.removeItem('current_lead_id');
        return; // INTERROMPE aqui para não cair no insert abaixo
      }

      // Se houve erro de rede/permissão, não tentamos criar um novo para evitar duplicidade
      if (error) {
        console.error('[tracking] Erro ao atualizar lead:', error.message);
        return;
      }
    }

    // 3. Só cria um novo se NÃO houver ID e a sessão NÃO estiver bloqueada
    // E apenas para eventos de entrada (pesquisa ou início de checkout)
    const isNewLeadTrigger = data.status === 'pesquisou' || data.email;
    
    if (!existingLeadId && isNewLeadTrigger && sessionStorage.getItem('is_deleted_lead') !== 'true') {
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
    // Silencioso em produção para não afetar a experiência do usuário
  }
};