import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { 
  Users, DollarSign, Search, ShieldCheck, 
  CreditCard, LogOut, RotateCcw,
  Trash2, MessageCircle, Key, BarChart3, 
  Map as MapIcon, QrCode, Download, X, FileText
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
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

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leads' | 'analytics' | 'sales'>('leads');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [showPixModal, setShowPixModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [pixAmount, setPixAmount] = useState('29.90');
  const [generatedPix, setGeneratedPix] = useState<any>(null);
  const [pixLoading, setPixLoading] = useState(false);
  const pixPdfRef = useRef<HTMLDivElement>(null);

  const fetchLeads = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setLeads(data);
      if (silent) toast.success('Dados sincronizados!');
    } catch (error: any) {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    const channel = supabase
      .channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchLeads(true);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const metrics = useMemo(() => {
    const total = leads.length;
    const paid = leads.filter(l => l.status === 'pagou');
    const revenue = paid.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
    
    const geoMap: Record<string, { count: number, cities: Record<string, number> }> = {};
    leads.forEach(l => {
      const st = l.state || 'N/A';
      const ct = l.city || 'Desconhecida';
      if (!geoMap[st]) geoMap[st] = { count: 0, cities: {} };
      geoMap[st].count++;
      geoMap[st].cities[ct] = (geoMap[st].cities[ct] || 0) + 1;
    });

    const geoData = Object.entries(geoMap)
      .map(([uf, data]) => ({
        uf,
        count: data.count,
        percent: ((data.count / (total || 1)) * 100).toFixed(1),
        mainCities: Object.entries(data.cities)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
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
      if (salesByDate[date] !== undefined) {
        salesByDate[date] += Number(l.total_amount);
      }
    });

    const chartData = Object.entries(salesByDate).map(([date, amount]) => ({
      date: date.split('-').slice(1).reverse().join('/'),
      amount
    }));

    return { total, paidCount: paid.length, revenue, geoData, chartData };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const searchLower = searchTerm.toLowerCase().trim();
    return leads.filter(lead => {
      const matchesSearch = searchLower === '' || 
        (lead.username_searched || '').toLowerCase().includes(searchLower) ||
        (lead.email || '').toLowerCase().includes(searchLower) ||
        (lead.full_name || '').toLowerCase().includes(searchLower);
      return matchesSearch && (statusFilter === 'all' || lead.status === statusFilter);
    });
  }, [leads, searchTerm, statusFilter]);

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

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center gap-4">
      <Loader />
      <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Sincronizando Banco de Dados...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-gray-200 font-sans selection:bg-purple-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-2.5 bg-white/5 border border-white/10 rounded-2xl">
                <ShieldCheck className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Command Center</h1>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.3em]">Operador Autenticado</p>
              </div>
            </div>
            
            <nav className="flex gap-2 mt-6">
              <TabButton active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} icon={Users} label="Leads" />
              <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={MapIcon} label="Geo" />
              <TabButton active={activeTab === 'sales'} onClick={() => setActiveTab('sales')} icon={BarChart3} label="Vendas" />
            </nav>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="flex-1 lg:flex-none flex flex-col items-end px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
               <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Faturamento Total</span>
               <span className="text-2xl font-black text-green-500 tabular-nums">R$ {metrics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <button onClick={() => { localStorage.removeItem('spygram_admin_auth'); navigate('/admin-login'); }} className="p-4 bg-red-600/10 border border-red-600/20 text-red-500 rounded-2xl hover:bg-red-600/20 transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Content Tabs */}
        <div className="space-y-8">
          {activeTab === 'leads' && (
            <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-6 backdrop-blur-3xl shadow-2xl">
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Filtrar por alvo, nome ou e-mail..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-purple-500 outline-none transition-all placeholder:text-gray-700"
                  />
                </div>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-black uppercase outline-none cursor-pointer hover:border-white/10"
                >
                  <option value="all">Todos os Status</option>
                  <option value="pesquisou">Pesquisou</option>
                  <option value="checkout">Checkout</option>
                  <option value="gerou_pix">Gerou PIX</option>
                  <option value="pagou">Pago</option>
                </select>
                <button onClick={() => fetchLeads(true)} className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 text-gray-400">
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
                      <th className="pb-4 px-4">Status</th>
                      <th className="pb-4 px-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="group hover:bg-white/[0.01] transition-colors">
                        <td className="py-5 px-4">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img src={lead.profile_pic || '/perfil.jpg'} className="w-12 h-12 rounded-2xl object-cover border border-white/10" />
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0a0c]" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-white tracking-tight">@{lead.username_searched}</p>
                              <p className="text-[10px] text-gray-500 font-bold">{new Date(lead.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-4">
                          <p className="text-xs font-black text-gray-300 uppercase truncate max-w-[150px]">{lead.full_name || 'Desconhecido'}</p>
                          <p className="text-[11px] text-gray-500 lowercase opacity-60">{lead.email || 'sem e-mail'}</p>
                        </td>
                        <td className="py-5 px-4">
                          <p className="text-xs font-bold text-gray-300">{lead.city || '???'}</p>
                          <p className="text-[10px] text-gray-500 uppercase font-black">{lead.state || '???'}</p>
                        </td>
                        <td className="py-5 px-4">
                          <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border ${
                            lead.status === 'pagou' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            lead.status === 'gerou_pix' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : 'bg-gray-800/50 text-gray-500 border-white/5'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-5 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <ActionButton onClick={() => { setSelectedLead(lead); setShowPixModal(true); setGeneratedPix(null); }} icon={QrCode} color="text-yellow-500" />
                            <ActionButton onClick={() => window.open(`https://wa.me/55${lead.phone?.replace(/\D/g, '')}`, '_blank')} icon={MessageCircle} color="text-green-500" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'analytics' && (
            <section className="grid grid-cols-1 gap-8">
              <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-3xl">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                  <MapIcon className="text-purple-500" /> Concentração de Operações
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {metrics.geoData.map((item, idx) => (
                    <div key={idx} className="bg-black/40 border border-white/5 rounded-3xl p-6 group hover:border-purple-500/20 transition-all">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-black text-white w-14">{item.uf}</span>
                          <span className="text-xs font-black text-purple-500 bg-purple-500/10 px-3 py-1 rounded-full">{item.percent}%</span>
                        </div>
                        <span className="text-xl font-black text-white">{item.count} <span className="text-[10px] text-gray-600 uppercase">Leads</span></span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-gradient-to-r from-purple-600 to-pink-500" style={{ width: `${item.percent}%` }} />
                      </div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed">
                        <span className="text-gray-400 mr-2">Top Cidades:</span> {item.mainCities}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'sales' && (
            <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-3xl">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-10 flex items-center gap-3">
                <BarChart3 className="text-green-500" /> Fluxo de Caixa (7 Dias)
              </h2>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.chartData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                    <XAxis dataKey="date" stroke="#525252" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#525252" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f0f12', border: '1px solid #262626', borderRadius: '16px' }}
                      itemStyle={{ color: '#a78bfa', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* PIX Modal */}
      <AnimatePresence>
        {showPixModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-[#0f0f12] border border-white/5 w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl">
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Geração Manual de PIX</h3>
                  <button onClick={() => setShowPixModal(false)} className="p-3 bg-white/5 rounded-full hover:bg-white/10"><X size={20} /></button>
                </div>

                {!generatedPix ? (
                  <div className="space-y-8">
                    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center gap-5">
                      <img src={selectedLead?.profile_pic || '/perfil.jpg'} className="w-14 h-14 rounded-2xl object-cover border border-white/10" />
                      <div>
                        <p className="text-lg font-black text-white tracking-tight">@{selectedLead?.username_searched}</p>
                        <p className="text-xs text-gray-500 font-medium">{selectedLead?.email}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 block">Valor do Acesso (R$)</label>
                      <input 
                        type="number" 
                        value={pixAmount}
                        onChange={(e) => setPixAmount(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-8 text-white text-2xl font-black outline-none focus:border-purple-500 transition-all"
                      />
                    </div>
                    <button 
                      onClick={handleGeneratePix}
                      disabled={pixLoading}
                      className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      {pixLoading ? <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" /> : <><QrCode size={20} /> GERAR CÓDIGO DE PAGAMENTO</>}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8 flex flex-col items-center">
                    <div ref={pixPdfRef} className="bg-white p-12 rounded-[2.5rem] text-black w-full text-center shadow-xl">
                      <img src="/spygram_transparentebranco.png" alt="SpyGram" className="h-10 mx-auto mb-8 brightness-0" />
                      <div className="mb-8">
                        <h4 className="text-xl font-black uppercase tracking-tighter">Protocolo de Pagamento</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Ref: {selectedLead?.username_searched}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-8 rounded-3xl inline-block mb-8 border border-gray-100">
                        <img src={`data:image/png;base64,${generatedPix.paymentCodeBase64}`} className="w-48 h-48" />
                      </div>
                      
                      <div className="text-left space-y-4 border-t border-gray-100 pt-8">
                        <div className="flex justify-between items-end">
                           <div>
                             <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Destinatário</p>
                             <p className="text-sm font-black">SPYGRAM INTELLIGENCE</p>
                           </div>
                           <div className="text-right">
                             <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Valor Total</p>
                             <p className="text-2xl font-black">R$ {parseFloat(pixAmount).toFixed(2)}</p>
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 w-full">
                      <button 
                        onClick={() => { navigator.clipboard.writeText(generatedPix.paymentCode); toast.success('Copiado!'); }}
                        className="flex-1 bg-white/5 border border-white/10 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
                      >
                        <FileText size={18} /> COPIAR
                      </button>
                      <button 
                        onClick={downloadPixPdf}
                        className="flex-1 bg-purple-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-purple-500 shadow-xl shadow-purple-600/20 transition-all"
                      >
                        <Download size={18} /> SALVAR PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest border
      ${active ? 'bg-white text-black border-white' : 'bg-white/5 text-gray-500 border-white/5 hover:bg-white/10 hover:text-gray-300'}`}
  >
    <Icon size={14} />
    {label}
  </button>
);

const ActionButton = ({ onClick, icon: Icon, color, title }: any) => (
  <button 
    onClick={onClick}
    title={title}
    className={`p-2.5 bg-white/5 border border-white/5 rounded-xl transition-all hover:bg-white/10 ${color}`}
  >
    <Icon size={16} />
  </button>
);

export default AdminPage;