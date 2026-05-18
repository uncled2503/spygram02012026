import React, { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Users, DollarSign, Target, TrendingUp, Search, Calendar, MapPin, ExternalLink } from 'lucide-react';
import Loader from '../components/Loader';

interface Lead {
  id: string;
  username_searched: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  total_amount: number;
  city: string;
  state: string;
  created_at: string;
}

const AdminPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, revenue: 0, conversion: 0 });

  useEffect(() => {
    fetchLeads();
    
    // Inscrição em tempo real para novos leads
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchLeads();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setLeads(data);
      const paid = data.filter(l => l.status === 'pagou');
      const totalRevenue = paid.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
      setStats({
        total: data.length,
        revenue: totalRevenue,
        conversion: data.length > 0 ? (paid.length / data.length) * 100 : 0
      });
    }
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader /></div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 p-8">
      <header className="mb-12 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Monitoramento de leads em tempo real</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-500 text-xs font-bold">LIVE TRACKING</span>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <Users className="text-purple-500" />
            <span className="text-xs font-bold text-gray-500 uppercase">Total Leads</span>
          </div>
          <p className="text-3xl font-black text-white">{stats.total}</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <DollarSign className="text-green-500" />
            <span className="text-xs font-bold text-gray-500 uppercase">Receita Total</span>
          </div>
          <p className="text-3xl font-black text-white">R$ {stats.revenue.toFixed(2)}</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <TrendingUp className="text-blue-500" />
            <span className="text-xs font-bold text-gray-500 uppercase">Conversão</span>
          </div>
          <p className="text-3xl font-black text-white">{stats.conversion.toFixed(1)}%</p>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-8 py-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="font-black uppercase tracking-widest text-sm">Leads Recentes</h2>
          <button onClick={fetchLeads} className="text-xs text-purple-500 font-bold hover:underline">Atualizar</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-gray-500 uppercase font-black border-b border-gray-800 bg-black/20">
                <th className="px-8 py-4">Alvo</th>
                <th className="px-8 py-4">Lead / Contato</th>
                <th className="px-8 py-4">Localização</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-500/20 p-2 rounded-lg">
                        <Search size={14} className="text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">@{lead.username_searched}</p>
                        <p className="text-[10px] text-gray-500">{lead.full_name || 'Nome não capturado'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="text-sm">
                      <p className="font-medium text-gray-300">{lead.email || '-'}</p>
                      <p className="text-[10px] text-gray-500">{lead.phone || '-'}</p>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <MapPin size={12} />
                      <span>{lead.city || 'Desconhecida'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${
                      lead.status === 'pagou' ? 'bg-green-500/10 text-green-500' :
                      lead.status === 'checkout' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-gray-800 text-gray-400'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-xs text-gray-500">
                    {new Date(lead.created_at).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;