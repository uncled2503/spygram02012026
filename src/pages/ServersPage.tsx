import React, { useState, useEffect } from 'react';
import { ShieldCheck, Server, Globe, Users as UsersIcon, Zap, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ServerCardProps {
  serverNumber: number;
  ping: number;
  onClick: () => void;
}

const ServerCard: React.FC<ServerCardProps> = ({ serverNumber, ping, onClick }) => {
  // Cor baseada no ping: Verde para baixo, Amarelo médio, Vermelho alto
  const getPingColor = (p: number) => {
    if (p < 30) return 'text-green-400';
    if (p < 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusColor = (p: number) => {
    if (p < 30) return 'bg-green-500';
    if (p < 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, translateY: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 w-full flex flex-col items-start transition-all duration-300 hover:border-purple-500/50 hover:bg-white/10 overflow-hidden shadow-2xl"
    >
      {/* Glow effect on hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-0 group-hover:opacity-10 transition duration-500"></div>
      
      <div className="flex justify-between items-start w-full mb-6">
        <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
          <Server className="w-5 h-5 text-purple-400" />
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/40 border border-white/5">
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${getStatusColor(ping)}`}></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Online</span>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-white font-black text-sm uppercase tracking-tighter">Servidor #{serverNumber}</h3>
        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Localização: LATAM-BR</p>
      </div>

      <div className="w-full space-y-2 mt-auto">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Latência</span>
          <span className={`text-xs font-black tabular-nums ${getPingColor(ping)}`}>{ping}ms</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(10, 100 - ping)}%` }}
            className={`h-full rounded-full ${ping < 60 ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-red-500'}`}
          ></motion.div>
        </div>
      </div>
    </motion.button>
  );
};

const ServersPage: React.FC = () => {
  const navigate = useNavigate();
  const [onlineUsers, setOnlineUsers] = useState(423);
  const [servers, setServers] = useState([
    { id: 0, ping: 24 }, { id: 1, ping: 42 }, { id: 2, ping: 18 },
    { id: 3, ping: 35 }, { id: 4, ping: 51 }, { id: 5, ping: 12 }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setServers(prev => prev.map(s => ({
        ...s,
        ping: Math.floor(Math.random() * (70 - 10 + 1)) + 10
      })));
      setOnlineUsers(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 font-sans selection:bg-purple-500/30 overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-900/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md">
              <img src="/spygram_transparentebranco.png" alt="SpyGram" className="h-6" />
            </div>
            <span className="text-xl font-black text-white uppercase tracking-tighter">SpyGram</span>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
             <div className="flex flex-col items-end">
               <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Créditos</span>
               <span className="text-sm font-black text-purple-400">0</span>
             </div>
             <div className="w-px h-6 bg-white/10"></div>
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-[1px]">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                    <img src="/perfil.jpg" alt="User" className="w-full h-full object-cover opacity-50" />
                  </div>
                </div>
                <span className="text-xs font-bold text-white">@user-403</span>
             </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <Activity className="w-5 h-5 text-pink-500" />
              <span className="text-xs font-black text-pink-500 uppercase tracking-[0.3em]">Status da Rede</span>
            </motion.div>
            <h1 className="text-6xl font-black text-white mb-6 tracking-tighter leading-none">
              NÓS <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">SERVERS.</span>
            </h1>
            <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-lg">
              Arquitetura de rede distribuída globalmente. Selecione o ponto de entrada com a menor latência para garantir uma infiltração 100% estável e anônima.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center p-6 bg-white/5 border border-white/10 rounded-[2rem] min-w-[140px] backdrop-blur-xl">
               <UsersIcon className="w-6 h-6 text-purple-400 mb-2" />
               <span className="text-2xl font-black text-white tabular-nums">{onlineUsers}</span>
               <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Operadores</span>
            </div>
            <div className="flex flex-col items-center p-6 bg-white/5 border border-white/10 rounded-[2rem] min-w-[140px] backdrop-blur-xl">
               <Zap className="w-6 h-6 text-yellow-400 mb-2" />
               <span className="text-2xl font-black text-white tabular-nums">99.9%</span>
               <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Uptime</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <Globe className="w-4 h-4 text-purple-500" />
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Selecione um ponto de entrada seguro</h2>
        </div>

        {/* Servers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-20">
          {servers.map((server) => (
            <ServerCard 
              key={server.id} 
              serverNumber={server.id} 
              ping={server.ping} 
              onClick={() => navigate('/credits')} 
            />
          ))}
        </div>

        {/* Footer */}
        <footer className="pt-12 border-t border-white/5 flex flex-col items-center">
          <div className="inline-flex items-center gap-3 bg-green-500/10 border border-green-500/20 px-6 py-3 rounded-full mb-6 backdrop-blur-md">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <span className="text-xs font-black text-green-500 uppercase tracking-widest">Conexão 100% Criptografada (SSL)</span>
          </div>
          <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.5em]">© 2024 SpyGram Intelligence Division</p>
        </footer>
      </div>
    </div>
  );
};

export default ServersPage;