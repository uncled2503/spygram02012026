import React, { useState, useEffect } from 'react';
import { Zap, Infinity, Star, ChevronRight, Check, ShieldAlert, Search, Sparkles, Coins, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface CreditPackage {
  id: number;
  amount: number | string;
  title: string;
  price: string;
  description: string;
  checkoutUrl: string;
  icon: React.ElementType;
  highlight?: boolean;
  features: string[];
}

const CreditsPage: React.FC = () => {
  const [stage, setStage] = useState<'idle' | 'searching' | 'error'>('idle');
  const [targetUsername, setTargetUsername] = useState('');
  const [searchLogs, setSearchLogs] = useState<string[]>([]);

  const creditPackages: CreditPackage[] = [
    {
      id: 1,
      amount: 10,
      title: "Pacote Lite",
      price: "R$ 49,50",
      description: "Ideal para invasões pontuais e rápidas.",
      checkoutUrl: "https://checkout.perfectpay.com.br/pay/PPU38COTFU1",
      icon: Zap,
      features: ['10 Créditos de Invasão', 'Acesso 24h', 'Suporte Padrão']
    },
    {
      id: 2,
      amount: 30,
      title: "Pacote Premium",
      price: "R$ 79,50",
      description: "O favorito dos investigadores profissionais.",
      checkoutUrl: "https://checkout.perfectpay.com.br/pay/PPU38COTFU6",
      icon: Star,
      highlight: true,
      features: ['30 Créditos de Invasão', 'Recuperador de Mensagens', 'Localização em Tempo Real', 'Suporte VIP']
    },
    {
      id: 3,
      amount: "Ilimitados",
      title: "Acesso Vitalício",
      price: "R$ 149,00",
      description: "Controle total e permanente sem limites.",
      checkoutUrl: "https://checkout.perfectpay.com.br/pay/PPU38COTFU8",
      icon: Infinity,
      features: ['Créditos Ilimitados', 'Todas as Ferramentas Pro', 'Acesso Vitalício', 'Suporte Prioritário 24/7']
    },
  ];

  const handleStartInvasion = () => {
    if (!targetUsername.trim()) {
      toast.error("Insira o @ do alvo.");
      return;
    }
    setStage('searching');
    setSearchLogs([]);
  };

  useEffect(() => {
    if (stage === 'searching') {
      const logs = [
        `Estabelecendo conexão com servidor LATAM...`,
        `Injetando scripts de bypass em @${targetUsername}...`,
        `Quebrando criptografia ponta-a-ponta...`,
        `Validando tokens de sessão...`,
        `Acesso parcial detectado. Aguardando autorização de créditos...`,
      ];

      let currentLog = 0;
      const interval = setInterval(() => {
        if (currentLog < logs.length) {
          setSearchLogs(prev => [...prev, logs[currentLog]]);
          currentLog++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setStage('error');
            toast.error("SISTEMA: CRÉDITOS INSUFICIENTES", { 
                style: { background: '#ef4444', color: '#fff', fontWeight: 'bold' } 
            });
          }, 1000);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [stage, targetUsername]);

  const handleCardClick = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-transparent text-white font-sans overflow-x-hidden selection:bg-blue-500/30">
      
      <main className="relative z-10 max-w-lg mx-auto px-6 py-12 flex flex-col items-center">
        
        {/* Logo Header (Centralizado) */}
        <div className="flex flex-col items-center mb-8">
           <div className="p-3 bg-black/60 border border-white/10 rounded-2xl mb-4 shadow-2xl">
              <img src="/spygram_transparentebranco.png" alt="SpyGram" className="h-10 w-auto" />
           </div>
           <h1 className="text-2xl font-black tracking-tighter uppercase">
             Spy<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Gram</span>
           </h1>
           <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mt-1">Intelligence</p>
        </div>

        {/* Status Pill (Créditos + Perfil) */}
        <div className="flex items-center gap-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-1 mb-16 shadow-2xl">
           <div className="flex flex-col items-end px-4 py-1">
              <div className="flex items-center gap-1">
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Créditos</span>
                <Coins className="w-2.5 h-2.5 text-yellow-500" />
              </div>
              <span className="text-sm font-black tabular-nums">0</span>
           </div>
           <div className="w-px h-6 bg-white/10 mx-1"></div>
           <div className="flex items-center gap-3 pl-1 pr-4 py-1">
              <div className="w-8 h-8 rounded-full bg-gray-800 border border-white/10 overflow-hidden grayscale opacity-50">
                 <img src="/perfil.jpg" alt="User" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-tight">@user-403</span>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[7px] font-black text-green-500 uppercase tracking-widest">Online</span>
                </div>
              </div>
           </div>
        </div>

        <AnimatePresence mode="wait">
          {stage === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full text-center"
            >
              <h2 className="text-4xl font-black mb-3 leading-tight tracking-tighter">
                INICIAR <span className="text-[#3b82f6]">INFILTRAÇÃO</span>
              </h2>
              <p className="text-gray-400 text-sm font-medium mb-12 max-w-xs mx-auto">
                Identifique o alvo para iniciar a extração remota de dados.
              </p>
              
              <div className="space-y-6 w-full">
                <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#3b82f6] transition-colors" />
                  <input 
                    type="text" 
                    placeholder="EX: NEYMARJR"
                    value={targetUsername}
                    onChange={(e) => setTargetUsername(e.target.value.replace('@', '').toLowerCase())}
                    className="w-full bg-black/60 border border-white/10 rounded-full py-5 pl-14 pr-6 text-white outline-none focus:border-[#3b82f6]/50 transition-all font-black tracking-widest uppercase text-sm shadow-inner"
                  />
                </div>

                <button 
                  onClick={handleStartInvasion}
                  className="w-full h-16 rounded-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#2563eb] to-[#4f46e5] hover:brightness-110 transition-all active:scale-95 shadow-xl shadow-blue-600/20"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                  <span className="text-white font-black text-sm uppercase tracking-widest">Iniciar Infiltração</span>
                </button>
              </div>
            </motion.div>
          )}

          {stage === 'searching' && (
            <motion.div 
              key="searching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full mt-10 p-8 bg-black/60 border border-white/5 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl"
            >
              <div className="flex flex-col items-center gap-6 mb-10">
                <div className="w-12 h-12 border-2 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em]">Sincronizando...</h3>
              </div>
              <div className="space-y-4 font-mono text-[10px] text-blue-400/60 text-left">
                {searchLogs.map((log, i) => (
                  <motion.p initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} key={i} className="flex gap-3">
                    <span className="text-blue-500/40">{'>'}</span> {log}
                  </motion.p>
                ))}
              </div>
            </motion.div>
          )}

          {stage === 'error' && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              {/* Alerta Estilo Hacker */}
              <div className="bg-red-600/5 border border-red-600/20 rounded-[2.5rem] p-8 mb-12 backdrop-blur-xl text-center shadow-2xl">
                <ShieldAlert className="w-10 h-10 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Acesso Negado</h2>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-8">Saldo de Créditos Insuficiente</p>
                
                <div className="inline-flex items-center gap-6 px-8 py-4 bg-black/60 border border-white/5 rounded-2xl">
                  <div className="text-left">
                    <span className="block text-[8px] font-black text-gray-600 uppercase tracking-widest">Status</span>
                    <span className="text-xs font-black text-red-500">BLOQUEADO</span>
                  </div>
                  <div className="w-px h-6 bg-white/10"></div>
                  <div className="text-left">
                    <span className="block text-[8px] font-black text-gray-600 uppercase tracking-widest">Alvo</span>
                    <span className="text-xs font-black text-white uppercase tracking-tight">@{targetUsername}</span>
                  </div>
                </div>
              </div>

              {/* Pacotes Clean */}
              <div className="space-y-4 mb-16">
                {creditPackages.map((pkg) => (
                  <motion.div
                    key={pkg.id}
                    onClick={() => handleCardClick(pkg.checkoutUrl)}
                    className={`relative bg-white/5 border rounded-3xl p-6 flex flex-col transition-all duration-300 cursor-pointer group
                      ${pkg.highlight ? 'border-[#3b82f6] bg-white/[0.08]' : 'border-white/5 hover:border-white/20'}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${pkg.highlight ? 'bg-blue-500/20 text-blue-500' : 'bg-white/5 text-gray-500'}`}>
                            <pkg.icon size={18} />
                          </div>
                          <h3 className="text-sm font-black text-white uppercase tracking-tighter">{pkg.title}</h3>
                       </div>
                       <p className="text-lg font-black text-white">{pkg.price}</p>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6">
                      {pkg.features.slice(0, 2).map((feature, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-gray-600" />
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all
                      ${pkg.highlight ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 text-gray-400 group-hover:bg-white group-hover:text-black'}`}>
                      Selecionar Plano
                      <ChevronRight size={14} />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer Minimalista */}
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5">
                  <ShieldCheck className="w-4 h-4 text-gray-500" />
                  <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em]">Criptografia Militar Ativa</span>
                </div>
                <p className="text-[8px] font-black text-gray-800 uppercase tracking-[0.5em]">SpyGram intelligence Division</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default CreditsPage;