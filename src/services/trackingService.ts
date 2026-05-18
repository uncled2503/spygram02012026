import { supabase } from '../integrations/supabase/client';
import { ProfileData } from '../../types';

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
}) => {
  try {
    const userAgent = navigator.userAgent;
    
    // Tenta recuperar ID do lead da sessão para atualizar o mesmo registro
    const existingLeadId = sessionStorage.getItem('current_lead_id');

    if (existingLeadId) {
      const { error } = await supabase
        .from('leads')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLeadId);
      
      if (error) console.error('Erro ao atualizar lead:', error);
    } else {
      const { data: newLead, error } = await supabase
        .from('leads')
        .insert([{
          ...data,
          user_agent: userAgent
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar lead:', error);
      } else if (newLead) {
        sessionStorage.setItem('current_lead_id', newLead.id);
      }
    }
  } catch (err) {
    console.error('Falha no rastreamento:', err);
  }
};