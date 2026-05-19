import React, { useState, useEffect } from 'react';
import { Coins, Zap, Infinity, Star, ChevronRight, Check, ShieldCheck, Sparkles, Terminal, ShieldAlert, Search, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import AppHeader from '../components/AppHeader';

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
            toast.error("CRÉDITOS INSUFICIENTES", { duration: 4000 });
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
    <div className="min-h-screen bg-transparent text-gray-200 font-sans selection:bg-purple-500/30 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[4px]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-900/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <AppHeader />

        <AnimatePresence mode="wait">
          {stage === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-xl mx-auto text-center mt-10"
            >
              <div className="inline-flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full mb-8">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Console de Infiltração</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 uppercase tracking-tighter">Pronto para <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Operar?</span></h2>
              <p className="text-gray-500 text-sm font-medium mb-10">Insira o nome de usuário do Instagram que você deseja extrair os dados e iniciar o monitoramento remoto.</p>
              
              <div className="relative group max-w-md mx-auto">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="EX: NEYMARJR"
                  value={targetUsername}
                  onChange={(e) => setTargetUsername(e.target.value.replace('@', '').toLowerCase())}
                  className="w-full bg-white/5 border-2 border-white/10 rounded-full py-5 pl-14 pr-6 text-white outline-none focus:border-blue-500/50 transition-all font-black tracking-widest uppercase text-sm"
                />
              </div>

              <button 
                onClick={handleStartInvasion}
                className="mt-8 group relative w-full sm:max-w-xs h-16 rounded-full overflow-hidden flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all active:scale-95 shadow-xl shadow-blue-600/20 mx-auto"
              >
                <Sparkles className="w-5 h-5 text-white" />
                <span className="text-white font-black text-lg uppercase tracking-tight">Iniciar Infiltração</span>
              </button>
            </motion.div>
          )}

          {stage === 'searching' && (
            <motion.div 
              key="searching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto mt-20 p-8 bg-black/40 border border-white/10 rounded-3xl backdrop-blur-3xl"
            >
              <div className="flex flex-col items-center gap-6 mb-8">
                <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <h3 className="text-xl font-black text-white uppercase tracking-widest">Processando...</h3>
              </div>
              <div className="space-y-3 font-mono text-[10px] text-blue-400/80 text-left">
                {searchLogs.map((log, i) => (
                  <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="flex gap-2">
                    <span className="text-blue-500">{'>'}</span> {log}
                  </motion.p>
                ))}
              </div>
            </motion.div>
          )}

          {stage === 'error' && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full"
            >
              {/* Alerta de Créditos */}
              <div className="max-w-xl mx-auto bg-red-600/10 border-2 border-red-600 rounded-[2.5rem] p-8 mb-16 backdrop-blur-xl text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <ShieldAlert size={120} className="text-red-600" />
                </div>
                <ShieldAlert className="w-12 h-12 text-red-600 mx-auto mb-4 animate-bounce" />
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Créditos Insuficientes</h2>
                <p className="text-red-200/70 text-sm font-bold uppercase tracking-widest mb-6">Operação Bloqueada no Servidor</p>
                <div className="bg-red-600/20 rounded-2xl py-4 px-6 inline-flex items-center gap-4 border border-red-600/30">
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Seu Saldo Atual</span>
                    <span className="text-2xl font-black text-white">0.00 CRÉDITOS</span>
                  </div>
                  <div className="w-px h-10 bg-red-600/30"></div>
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-8">Realize uma recarga imediata para liberar a extração de dados de @{targetUsername}</p>
              </div>

              {/* Pacotes de Créditos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full mb-10">
                {creditPackages.map((pkg) => (
                  <motion.div
                    key={pkg.id}
                    whileHover={{ scale: 1.02, translateY: -5 }}
                    onClick={() => handleCardClick(pkg.checkoutUrl)}
                    className={`relative group bg-white/5 backdrop-blur-xl border rounded-[2.5rem] p-8 flex flex-col items-center transition-all duration-300 cursor-pointer shadow-2xl
                      ${pkg.highlight ? 'border-purple-500 bg-white/10' : 'border-white/10 hover:border-purple-500/50'}`}
                  >
                    {pkg.highlight && (
                      <div className="absolute -top-4 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl">
                        Mais Popular
                      </div>
                    )}
                    
                    <div className={`p-4 rounded-2xl mb-6 ${pkg.highlight ? 'bg-purple-500/20' : 'bg-white/5'}`}>
                      <pkg.icon className={`w-8 h-8 ${pkg.highlight ? 'text-purple-400' : 'text-gray-400'}`} />
                    </div>

                    <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">{pkg.title}</h2>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-black text-white">{pkg.price}</span>
                    </div>
                    
                    <p className="text-gray-500 text-xs text-center mb-8 font-medium leading-relaxed">{pkg.description}</p>

                    <div className="w-full space-y-3 mb-8">
                      {pkg.features.map((feature, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-3">
                          <Check className={`w-4 h-4 ${pkg.highlight ? 'text-purple-400' : 'text-gray-600'}`} />
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest text-left leading-tight">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all
                      ${pkg.highlight ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-white/5 text-gray-300 group-hover:bg-purple-600 group-hover:text-white'}`}>
                      Recarregar Agora
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Rodapé de Segurança */}
              <div className="flex flex-col items-center justify-center gap-6 mt-16">
                <div className="w-full sm:max-w-sm h-14 rounded-full border-2 border-red-900/40 bg-[#120000]/80 flex items-center justify-center gap-3 px-6 backdrop-blur-sm shadow-xl">
                  <ShieldCheck className="w-5 h-5 text-red-600" />
                  <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.2em]">Gateway de Pagamento Seguro</span>
                </div>
                <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.4em]">SpyGram © 2024 Intelligence</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreditsPage;