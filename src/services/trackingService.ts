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
    
    // Tenta recuperar ID do lead da sessão para atualizar o mesmo registro
    let existingLeadId = sessionStorage.getItem('current_lead_id');

    const updateData: any = { ...data };
    
    // Mapeia 'amount' para 'total_amount' se presente
    if (data.amount !== undefined) {
      updateData.total_amount = data.amount;
      delete updateData.amount;
    }

    // Se já temos um ID, fazemos o UPDATE
    if (existingLeadId) {
      console.log(`[tracking] Atualizando lead: ${existingLeadId}`, updateData);
      const { error } = await supabase
        .from('leads')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLeadId);
      
      if (error) {
        console.error('[tracking] Erro no update:', error.message);
        // Se falhar o update (ex: lead deletado), limpamos o ID para criar um novo abaixo
        existingLeadId = null;
      } else {
        return; // Sucesso
      }
    }

    // Se não houver ID ou o update falhou, fazemos o INSERT
    if (!existingLeadId) {
      console.log('[tracking] Criando novo lead', updateData);
      const { data: newLead, error: insertError } = await supabase
        .from('leads')
        .insert([{
          ...updateData,
          user_agent: userAgent
        }])
        .select()
        .single();

      if (insertError) {
        console.error('[tracking] Erro no insert:', insertError.message);
      } else if (newLead) {
        sessionStorage.setItem('current_lead_id', newLead.id);
        console.log('[tracking] Novo ID salvo:', newLead.id);
      }
    }
  } catch (err) {
    console.error('[tracking] Falha crítica:', err);
  }
};