import React, { useState, useEffect } from 'react';
import { Zap, Infinity, Star, ChevronRight, Check, ShieldAlert, Search, Sparkles, Coins, AlertCircle, Eye, ShieldCheck } from 'lucide-react';
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
      title: "PROTOCOLO LITE",
      price: "R$ 49,50",
      description: "Infiltração básica para monitoramento rápido.",
      checkoutUrl: "https://checkout.perfectpay.com.br/pay/PPU38COTFU1",
      icon: Zap,
      features: ['10 Extrações de Dados', 'Bypass de Criptografia', 'Suporte Técnico']
    },
    {
      id: 2,
      amount: 30,
      title: "PROTOCOLO ELITE",
      price: "R$ 79,50",
      description: "Vigilância avançada com recuperação de arquivos.",
      checkoutUrl: "https://checkout.perfectpay.com.br/pay/PPU38COTFU6",
      icon: Star,
      highlight: true,
      features: ['30 Extrações Completas', 'Recuperador de Mensagens', 'Localização GPS Real-Time', 'Painel de Controle VIP']
    },
    {
      id: 3,
      amount: "Ilimitados",
      title: "DOMINAÇÃO TOTAL",
      price: "R$ 149,00",
      description: "Controle absoluto e permanente sem restrições.",
      checkoutUrl: "https://checkout.perfectpay.com.br/pay/PPU38COTFU8",
      icon: Infinity,
      features: ['Extrações Ilimitadas', 'Invasão em Massa', 'Acesso Vitalício Garantido', 'Inteligência de Rede 24/7']
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
        `Iniciando varredura de satélite no perfil @${targetUsername}...`,
        `Identificando vulnerabilidades no servidor Meta...`,
        `Quebrando firewall de autenticação de dois fatores...`,
        `Acessando banco de dados de mensagens criptografadas...`,
        `Extraindo histórico de localização em tempo real...`,
        `ERRO CRÍTICO: Token de acesso expirado. Recarga necessária.`,
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
      
      <main className="relative z-10 max-w-xl mx-auto px-6 py-12 flex flex-col items-center">
        
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8">
           <div className="p-3 bg-black/60 border border-white/10 rounded-2xl mb-4 shadow-2xl">
              <img src="/spygram_transparentebranco.png" alt="SpyGram" className="h-10 w-auto" />
           </div>
           <h1 className="text-2xl font-black tracking-tighter uppercase">
             Spy<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Gram</span>
           </h1>
           <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mt-1">SISTEMA DE VIGILÂNCIA</p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-1 mb-12 shadow-2xl">
           <div className="flex flex-col items-end px-4 py-1">
              <div className="flex items-center gap-1">
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Créditos</span>
                <Coins className="w-2.5 h-2.5 text-yellow-500" />
              </div>
              <span className="text-sm font-black tabular-nums">0</span>
           </div>
           <div className="w-px h-6 bg-white/10 mx-1"></div>
           <div className="flex items-center gap-3 pl-1 pr-4 py-1">
              <div className="w-8 h-8 rounded-full bg-gray-800 border border-white/10 overflow-hidden grayscale opacity-30">
                 <img src="/perfil.jpg" alt="User" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-tight">OPERADOR-403</span>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[7px] font-black text-green-500 uppercase tracking-widest">ONLINE</span>
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
              <h2 className="text-4xl sm:text-5xl font-black mb-4 leading-tight tracking-tighter uppercase">
                VIGILÂNCIA <span className="text-[#3b82f6]">TOTAL</span>
              </h2>
              <p className="text-gray-300 text-lg font-bold mb-10 max-w-md mx-auto leading-tight">
                Extraia conversas secretas, fotos apagadas e localização exata sem deixar nenhum rastro. <span className="text-blue-500">A verdade está a um clique.</span>
              </p>
              
              <div className="space-y-6 w-full max-w-md mx-auto">
                <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#3b82f6] transition-colors" />
                  <input 
                    type="text" 
                    placeholder="DIGITE O @ DO ALVO"
                    value={targetUsername}
                    onChange={(e) => setTargetUsername(e.target.value.replace('@', '').toLowerCase())}
                    className="w-full bg-black/60 border border-white/10 rounded-full py-5 pl-14 pr-6 text-white outline-none focus:border-[#3b82f6]/50 transition-all font-black tracking-widest uppercase text-sm shadow-inner"
                  />
                </div>

                <button 
                  onClick={handleStartInvasion}
                  className="w-full h-16 rounded-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#2563eb] to-[#4f46e5] hover:brightness-110 transition-all active:scale-95 shadow-xl shadow-blue-600/30"
                >
                  <Eye className="w-5 h-5 text-white" />
                  <span className="text-white font-black text-sm uppercase tracking-widest">EXPOR VERDADE AGORA</span>
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
              className="w-full mt-10 p-10 bg-black/60 border border-blue-500/10 rounded-[3rem] backdrop-blur-3xl shadow-2xl"
            >
              <div className="flex flex-col items-center gap-6 mb-12">
                <div className="w-16 h-16 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
                <h3 className="text-sm font-black text-blue-400 uppercase tracking-[0.5em]">OPERANDO...</h3>
              </div>
              <div className="space-y-5 font-mono text-[11px] text-blue-400/60 text-left">
                {searchLogs.map((log, i) => (
                  <motion.p initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} key={i} className="flex gap-4">
                    <span className="text-blue-500 font-bold">{'>'}</span> {log}
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
              <div className="bg-red-600/5 border border-red-600/20 rounded-[3rem] p-10 mb-12 backdrop-blur-xl text-center shadow-2xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 opacity-5">
                   <ShieldAlert size={200} className="text-red-600" />
                </div>
                <ShieldAlert className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">ACESSO BLOQUEADO</h2>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-10">O sistema detectou saldo insuficiente para finalizar a extração.</p>
                
                <div className="inline-flex items-center gap-8 px-10 py-5 bg-black/60 border border-red-600/10 rounded-2xl">
                  <div className="text-left">
                    <span className="block text-[9px] font-black text-gray-600 uppercase tracking-widest">SISTEMA</span>
                    <span className="text-sm font-black text-red-500">OFFLINE</span>
                  </div>
                  <div className="w-px h-8 bg-white/10"></div>
                  <div className="text-left">
                    <span className="block text-[9px] font-black text-gray-600 uppercase tracking-widest">ALVO</span>
                    <span className="text-sm font-black text-white uppercase tracking-tight">@{targetUsername}</span>
                  </div>
                </div>
                
                <p className="mt-10 text-sm text-yellow-500 font-black uppercase tracking-widest italic">
                   ⚠ A VERDADE ESTÁ SENDO PROCESSADA. RECARREGUE PARA LIBERAR.
                </p>
              </div>

              {/* Pacotes de Invasão */}
              <div className="space-y-6 mb-16">
                {creditPackages.map((pkg) => (
                  <motion.div
                    key={pkg.id}
                    onClick={() => handleCardClick(pkg.checkoutUrl)}
                    className={`relative bg-white/5 border-[1.5px] rounded-[2.5rem] p-8 flex flex-col transition-all duration-300 cursor-pointer group
                      ${pkg.highlight ? 'border-[#3b82f6] bg-white/[0.08] shadow-[0_0_30px_rgba(59,130,246,0.1)]' : 'border-white/5 hover:border-white/20'}`}
                  >
                    <div className="flex items-center justify-between mb-6">
                       <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl ${pkg.highlight ? 'bg-blue-500/20 text-blue-500' : 'bg-white/5 text-gray-500'}`}>
                            <pkg.icon size={22} />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-tighter">{pkg.title}</h3>
                            <p className="text-xs font-bold text-gray-500 mt-0.5">{pkg.description}</p>
                          </div>
                       </div>
                       <p className="text-2xl font-black text-white">{pkg.price}</p>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-3 mb-8">
                      {pkg.features.map((feature, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2">
                          <Check className={`w-3 h-3 ${pkg.highlight ? 'text-blue-500' : 'text-gray-600'}`} />
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all
                      ${pkg.highlight ? 'bg-[#2563eb] text-white shadow-xl shadow-blue-600/30' : 'bg-white/5 text-gray-400 group-hover:bg-white group-hover:text-black'}`}>
                      LIBERAR PROTOCOLO
                      <ChevronRight size={16} />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer Trust */}
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Criptografia Militar Ativa</span>
                </div>
                <p className="text-[8px] font-black text-gray-700 uppercase tracking-[0.6em]">SpyGram INTELLIGENCE DIVISION</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default CreditsPage;