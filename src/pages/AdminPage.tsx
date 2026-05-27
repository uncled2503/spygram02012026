import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { 
  Users, DollarSign, Search, ShieldCheck, 
  CreditCard, LogOut, RotateCcw,
  Trash2, MessageCircle, Key, BarChart3, 
  Map as MapIcon, QrCode, Download, X, FileText, Check, Save, ShieldAlert, ShieldOff, Coins, ShoppingBag
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Lead {
  id: string;
  username_searched: string;
  full_name: string;
  profile_pic: string;
  email: string;
  phone: string;
  document: string;
  status: string;
  total_amount: number;
  city: string;
  state: string;
  user_agent: string;
  created_at: string;
  updated_at: string;
}

interface Payment {
  id: string;
  transaction_id: string;
  lead_id: string;
  status: string;
  payload: any;
  created_at: string;
}

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leads' | 'analytics' | 'sales'>('leads');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [showPixModal, setShowPixModal] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // Estados para o PIX
  const [pixAmount, setPixAmount] = useState('29.90');
  const [generatedPix, setGeneratedPix] = useState<any>(null);
  const [pixLoading, setPixLoading] = useState(false);
  const pixPdfRef = useRef<HTMLDivElement>(null);

  // Estados para o Acesso
  const [accessEmail, setAccessEmail] = useState('');
  const [accessPassword, setAccessPassword] = useState('123456');
  const [accessLoading, setAccessLoading] = useState(false);

  // Estados para Créditos
  const [creditAmount, setCreditAmount] = useState<number>(49.50);

  const fetchLeadsAndPayments = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-admin-data');

      if (error) throw error;
      setLeads(data?.leads || []);
      setPayments(data?.payments || []);
      if (silent) toast.success('Dados sincronizados!');
    } catch (error: any) {
      toast.error('Erro ao buscar dados do painel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadsAndPayments();
    const channel = supabase
      .channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchLeadsAndPayments(true);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm("Deseja realmente excluir este lead permanentemente? Todos os dados vinculados serão apagados.")) return;
    
    try {
      const { error } = await supabase.functions.invoke('delete-lead', {
        body: { leadId: id },
      });

      if (error) throw error;
      toast.success("Lead excluído com sucesso.");
      fetchLeadsAndPayments(true);
    } catch (err) {
      toast.error("Erro ao excluir lead.");
    }
  };

  // Métricas
  const metrics = useMemo(() => {
    const total = leads.length || 0;
    const paid = leads.filter(l => l.status === 'pagou');
    const revenue = paid.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
    
    const geoMap: Record<string, { count: number, cities: Record<string, number> }> = {};
    leads.forEach(l => {
      const st = l.state || 'Outros';
      const ct = l.city || 'Desconhecida';
      if (!geoMap[st]) geoMap[st] = { count: 0, cities: {} };
      geoMap[st].count++;
      geoMap[st].cities[ct] = (geoMap[st].cities[ct] || 0) + 1;
    });

    const geoData = Object.entries(geoMap)
      .map(([uf, data]) => ({
        uf,
        count: data.count,
        percent: total > 0 ? ((data.count / total) * 100).toFixed(1) : "0",
        mainCities: Object.entries(data.cities)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([city, count]) => `${city} (${count})`)
          .join(' • ')
      }))
      .sort((a, b) => b.count - a.count);

    const salesByDate: Record<string, number> = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    last7Days.forEach(date => salesByDate[date] = 0);
    paid.forEach(l => {
      const date = l.updated_at?.split('T')[0];
      if (date && salesByDate[date] !== undefined) {
        salesByDate[date] += Number(l.total_amount);
      }
    });

    return { 
      total, 
      paidCount: paid.length, 
      revenue, 
      geoData, 
      chartData: Object.entries(salesByDate).map(([date, amount]) => ({
        date: date.split('-').slice(1).reverse().join('/'),
        amount
      }))
    };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const searchLower = searchTerm.toLowerCase().trim();
    return leads.filter(lead => {
      const matchesSearch = searchLower === '' || 
        (lead.username_searched || '').toLowerCase().includes(searchLower) ||
        (lead.email || '').toLowerCase().includes(searchLower) ||
        (lead.full_name || '').toLowerCase().includes(searchLower) ||
        (lead.document || '').includes(searchLower);
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, statusFilter]);

  // Função inteligente para analisar itens comprados com base no valor e payload
  const getPurchasedItems = (lead: Lead) => {
    const successStatuses = ['paid', 'saquepago', 'approved', 'success', 'pago'];
    const leadPayments = payments.filter(p => p.lead_id === lead.id && successStatuses.includes(String(p.status).toLowerCase()));
    
    if (leadPayments.length === 0 && lead.status !== 'pagou') return [];

    const items: string[] = [];
    
    // Se o status for pago, assume pelo menos o Relatório Base caso não haja registros de pagamentos detalhados
    let hasBaseReport = lead.status === 'pagou';
    
    leadPayments.forEach(payment => {
      // 1. Prioriza a lista estruturada salva no payload da compra
      if (payment.payload?.items && Array.isArray(payment.payload.items)) {
        payment.payload.items.forEach((item: string) => {
          if (!items.includes(item)) {
            items.push(item);
          }
        });
        return; // Pula a estimativa baseada em preços caso já tenhamos os itens explícitos
      }

      // 2. Fallback para deduções de preço de compras legadas
      const amount = Number(payment.payload?.amount) || 0;
      
      if (amount === 49.50) {
        items.push("Recarga: 10 Créditos 🪙");
      } else if (amount === 79.50) {
        items.push("Recarga: 30 Créditos 🪙");
      } else if (amount === 149.00) {
        items.push("Recarga: Créditos Ilimitados 🪙");
      } else {
        hasBaseReport = true;
        // Se pagou o base, deduz os bumps pela diferença de preço (Base = 37.90)
        let remaining = Math.round((amount - 37.90) * 100) / 100;
        
        if (remaining > 0) {
          const bumps = [
            { title: 'Espião Social 👥', price: 19.90 },
            { title: 'Recuperador Mensagens 💬', price: 15.90 },
            { title: 'Rastreamento 24h 📍', price: 15.90 },
            { title: 'Vitalício PRO ⚡', price: 9.90 },
          ];
          
          bumps.forEach(bump => {
            if (remaining >= bump.price - 0.05) {
              items.push(bump.title);
              remaining = Math.round((remaining - bump.price) * 100) / 100;
            }
          });
        }
      }
    });

    const hasExplicitReport = items.some(i => i.includes("Relatório") || i.includes("SpyGram"));
    if (hasBaseReport && !hasExplicitReport) {
      items.unshift("Relatório SpyGram 🕵️");
    }

    return items;
  };

  const handleGeneratePix = async () => {
    if (!selectedLead) return;
    setPixLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('royal-banking-payment', {
        body: { 
          name: selectedLead.full_name || selectedLead.username_searched,
          email: selectedLead.email,
          document: selectedLead.document,
          phone: selectedLead.phone,
          amount: parseFloat(pixAmount),
          leadId: selectedLead.id
        },
      });

      if (error || !data.paymentCode) throw new Error('Falha no pagamento');
      setGeneratedPix(data);
      toast.success('PIX Manual Gerado');
    } catch (err) {
      toast.error('Erro ao processar');
    } finally {
      setPixLoading(false);
    }
  };

  const downloadPixPdf = async () => {
    if (!pixPdfRef.current) return;
    const canvas = await html2canvas(pixPdfRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`SpyGram-PIX-${selectedLead?.username_searched}.pdf`);
  };

  const handleOpenAccessModal = async (lead: Lead) => {
    setSelectedLead(lead);
    setAccessEmail(lead.email || '');
    setAccessPassword('123456');
    
    if (lead.email) {
      const { data } = await supabase.from('members').select('password').eq('email', lead.email).single();
      if (data) setAccessPassword(data.password);
    }
    
    setShowAccessModal(true);
  };

  const handleSaveAccess = async (liberate: boolean = false) => {
    if (!selectedLead || !accessEmail.trim()) {
      toast.error("E-mail é obrigatório.");
      return;
    }

    setAccessLoading(true);
    try {
      const { error: memberError } = await supabase
        .from('members')
        .upsert({ 
          email: accessEmail.trim().toLowerCase(), 
          password: accessPassword.trim() 
        }, { onConflict: 'email' });

      if (memberError) throw memberError;

      if (liberate || accessEmail !== selectedLead.email) {
        const updateData: any = { email: accessEmail.trim().toLowerCase() };
        if (liberate) updateData.status = 'pagou';
        
        const { error: leadError } = await supabase
          .from('leads')
          .update(updateData)
          .eq('id', selectedLead.id);
        
        if (leadError) throw leadError;
      }

      toast.success(liberate ? "Acesso Liberado e Senha Definida!" : "Dados de Acesso Atualizados!");
      setShowAccessModal(false);
      fetchLeadsAndPayments(true);
    } catch (err: any) {
      toast.error("Erro ao salvar: " + err.message);
    } finally {
      setAccessLoading(false);
    }
  };

  const handleToggleBlock = async () => {
    if (!selectedLead) return;
    
    const isBanned = selectedLead.status === 'banido';
    const newStatus = isBanned ? 'pagou' : 'banido';
    
    setAccessLoading(true);
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', selectedLead.id);

      if (error) throw error;
      
      toast.success(isBanned ? "Acesso desbloqueado!" : "Acesso bloqueado!");
      setShowAccessModal(false);
      fetchLeadsAndPayments(true);
    } catch (err: any) {
      toast.error("Erro ao alterar status de bloqueio.");
    } finally {
      setAccessLoading(false);
    }
  };

  const handleAddCredits = async () => {
    if (!selectedLead) return;
    setAccessLoading(true);
    try {
      const { error } = await supabase.functions.invoke('manage-credits', {
        body: { 
          leadId: selectedLead.id,
          action: 'add',
          amount: creditAmount
        },
      });

      if (error) throw error;

      toast.success("Créditos injetados com sucesso!");
      setShowCreditsModal(false);
      fetchLeadsAndPayments(true);
    } catch (err: any) {
      toast.error("Erro ao processar: " + err.message);
    } finally {
      setAccessLoading(false);
    }
  };

  const handleRemoveCredits = async () => {
    if (!selectedLead) return;
    if (!window.confirm("Deseja realmente remover TODOS os créditos deste lead?")) return;
    
    setAccessLoading(true);
    try {
      const { error } = await supabase.functions.invoke('manage-credits', {
        body: { 
          leadId: selectedLead.id,
          action: 'remove'
        },
      });

      if (error) throw error;

      toast.success("Todos os créditos foram removidos!");
      setShowCreditsModal(false);
      fetchLeadsAndPayments(true);
    } catch (err: any) {
      toast.error("Erro ao processar: " + err.message);
    } finally {
      setAccessLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f0f12] flex flex-col items-center justify-center gap-4">
      <Loader />
      <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Iniciando Sistemas...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f12] text-gray-200 font-sans selection:bg-purple-500/30">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl shadow-xl">
                <ShieldCheck className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Command Center</h1>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.3em]">Operador Autenticado</p>
              </div>
            </div>
            
            <nav className="flex gap-2">
              <TabButton active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} icon={Users} label="Leads" />
              <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={MapIcon} label="Geolocalização" />
              <TabButton active={activeTab === 'sales'} onClick={() => setActiveTab('sales')} icon={BarChart3} label="Vendas" />
            </nav>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="flex-1 lg:flex-none flex flex-col items-end px-6 py-4 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-3xl shadow-2xl">
               <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Faturamento</span>
               <span className="text-2xl font-black text-green-500 tabular-nums">R$ {metrics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <button onClick={() => { localStorage.removeItem('spygram_admin_auth'); navigate('/admin-login'); }} className="p-5 bg-red-600/10 border border-red-600/20 text-red-500 rounded-2xl hover:bg-red-600/20 transition-all shadow-lg">
              <LogOut size={22} />
            </button>
          </div>
        </header>

        {activeTab === 'leads' && (
          <section className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6 backdrop-blur-3xl shadow-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Filtrar por alvo ou dados do lead..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm focus:border-purple-500 outline-none transition-all placeholder:text-gray-600"
                />
              </div>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-[10px] font-black uppercase outline-none cursor-pointer hover:bg-black/60"
              >
                <option value="all">Todos Status</option>
                <option value="pesquisou">Pesquisou</option>
                <option value="gerou_pix">Gerou PIX</option>
                <option value="pagou">Pago</option>
                <option value="banido">Banido</option>
              </select>
              <button onClick={() => fetchLeadsAndPayments(true)} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-gray-400 transition-colors">
                <RotateCcw size={20} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-gray-600 uppercase font-black border-b border-white/5">
                    <th className="pb-4 px-4">Alvo</th>
                    <th className="pb-4 px-4">Informações do Lead</th>
                    <th className="pb-4 px-4">Localização</th>
                    <th className="pb-4 px-4">Produtos Comprados</th>
                    <th className="pb-4 px-4">Status</th>
                    <th className="pb-4 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {filteredLeads.length > 0 ? (
                    filteredLeads.map((lead) => {
                      const purchasedItems = getPurchasedItems(lead);
                      return (
                        <tr key={lead.id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="py-5 px-4">
                            <div className="flex items-center gap-4">
                              <img src={lead.profile_pic || '/perfil.jpg'} className="w-12 h-12 rounded-2xl object-cover border border-white/10 shadow-lg" />
                              <div>
                                <p className="text-sm font-black text-white tracking-tight">@{lead.username_searched}</p>
                                <p className="text-[10px] text-gray-500 font-bold">
                                  {new Date(lead.created_at).toLocaleDateString('pt-BR')} - {new Date(lead.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-5 px-4">
                            <p className="text-xs font-black text-gray-300 uppercase truncate max-w-[150px]">{lead.full_name || 'Anônimo'}</p>
                            <p className="text-[11px] text-gray-500 lowercase opacity-60">{lead.email || '---'}</p>
                            <div className="flex gap-2 mt-1">
                                <p className="text-[10px] text-gray-400 font-bold">{lead.phone || 'S/ Tel'}</p>
                                <p className="text-[10px] text-gray-400 font-bold">| {lead.document || 'S/ CPF'}</p>
                            </div>
                          </td>
                          <td className="py-5 px-4">
                            <p className="text-xs font-bold text-gray-300">{lead.city || '???'}</p>
                            <p className="text-[10px] text-gray-500 uppercase font-black">{lead.state || '???'}</p>
                          </td>
                          <td className="py-5 px-4 max-w-[200px]">
                            {purchasedItems.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {purchasedItems.map((item, idx) => (
                                  <span key={idx} className="text-[8px] font-black px-2 py-1 bg-white/5 border border-white/5 rounded-md text-purple-400 uppercase tracking-tight">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-600 font-bold italic">Nenhum</span>
                            )}
                          </td>
                          <td className="py-5 px-4">
                            <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border ${
                              lead.status === 'pagou' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                              lead.status === 'banido' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                              lead.status === 'gerou_pix' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : 'bg-gray-800/50 text-gray-500 border-white/5'
                            }`}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="py-5 px-4">
                            <div className="flex items-center justify-center gap-3">
                              <ActionButton onClick={() => handleOpenAccessModal(lead)} icon={Key} color="text-purple-400" title="Gerenciar Acesso" />
                              <ActionButton onClick={() => { setSelectedLead(lead); setCreditAmount(49.50); setShowCreditsModal(true); }} icon={Coins} color="text-yellow-400" title="Adicionar/Remover Créditos" />
                              <ActionButton onClick={() => { setSelectedLead(lead); setShowPixModal(true); setGeneratedPix(null); }} icon={QrCode} color="text-yellow-500" title="Gerar PIX" />
                              <ActionButton onClick={() => window.open(`https://wa.me/55${lead.phone?.replace(/\D/g, '')}`, '_blank')} icon={MessageCircle} color="text-green-500" title="WhatsApp" />
                              <ActionButton onClick={() => handleDeleteLead(lead.id)} icon={Trash2} color="text-red-500" title="Excluir Lead" />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-gray-600 font-bold uppercase tracking-widest text-xs">Nenhum registro encontrado</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Mantém as outras abas intocadas */}
      </div>

      {/* Mantém modais */}
    </div>
  );
};

// Mantém TabButton e ActionButton
export default AdminPage;