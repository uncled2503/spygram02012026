import { supabase } from '../integrations/supabase/client';

// Trava global para evitar envios duplicados/simultâneos
let isTrackingInProgress = false;

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
  // 1. Bloqueio Permanente: Verifica se este navegador já foi banido (lead deletado pelo admin)
  if (localStorage.getItem('spygram_banned_session') === 'true') {
    return;
  }

  // 2. Trava de Concorrência: Evita que duas chamadas criem dois leads ao mesmo tempo
  if (isTrackingInProgress) return;
  isTrackingInProgress = true;

  try {
    const userAgent = navigator.userAgent;
    let existingLeadId = sessionStorage.getItem('current_lead_id');
    const updateData: any = { ...data };
    
    if (data.amount !== undefined) {
      updateData.total_amount = data.amount;
      delete updateData.amount;
    }

    // 3. Tenta ATUALIZAR o lead existente
    if (existingLeadId) {
      const { error, count } = await supabase
        .from('leads')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        }, { count: 'exact' })
        .eq('id', existingLeadId);
      
      // Se atualizou com sucesso (count > 0), finaliza
      if (!error && count && count > 0) {
        isTrackingInProgress = false;
        return;
      }

      // Se o erro for nulo mas o count for 0, o lead foi DELETADO pelo administrador
      if (!error && count === 0) {
        console.warn('[tracking] Lead deletado pelo admin. Banindo sessão.');
        localStorage.setItem('spygram_banned_session', 'true');
        sessionStorage.removeItem('current_lead_id');
        isTrackingInProgress = false;
        return;
      }
    }

    // 4. Só CRIA um novo se não houver ID e não estiver banido
    const isNewLeadTrigger = data.status === 'pesquisou' || data.email;
    
    if (!existingLeadId && isNewLeadTrigger) {
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
    // Erros silenciosos para não alertar o usuário
  } finally {
    isTrackingInProgress = false;
  }
};