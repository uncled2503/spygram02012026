import React from 'react';
import { Coins, Zap, Infinity, Star, ChevronRight, Check, ShieldCheck, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
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

  const handleCardClick = (url: string) => {
    window.open(url, '_blank');
  };

  const handleInvadeClick = () => {
    toast.error("Você está sem créditos, realize uma recarga pra conseguir invadir uma conta");
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

        <div className="text-center mb-12 sm:mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-full mb-6"
          >
            <Coins className="w-4 sm:w-5 h-4 sm:h-5 text-purple-400" />
            <span className="text-[10px] sm:text-xs font-black text-purple-400 uppercase tracking-[0.3em]">Recarga de Sistema</span>
          </motion.div>
          <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 tracking-tighter uppercase leading-tight">
            ADQUIRIR <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">CRÉDITOS.</span>
          </h1>
          <p className="text-gray-500 text-sm sm:text-base font-medium max-w-2xl mx-auto leading-relaxed px-4">
            Escolha a potência do seu acesso. Cada crédito libera uma invasão completa com extração total de dados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full mb-20">
          {creditPackages.map((pkg) => (
            <motion.div
              key={pkg.id}
              whileHover={{ scale: 1.02, translateY: -5 }}
              onClick={() => handleCardClick(pkg.checkoutUrl)}
              className={`relative group bg-white/5 backdrop-blur-xl border rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 flex flex-col items-center transition-all duration-300 cursor-pointer shadow-2xl
                ${pkg.highlight ? 'border-purple-500 bg-white/10' : 'border-white/10 hover:border-purple-500/50'}`}
            >
              {pkg.highlight && (
                <div className="absolute -top-4 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl">
                  Mais Popular
                </div>
              )}
              
              <div className={`p-4 rounded-xl sm:rounded-2xl mb-6 ${pkg.highlight ? 'bg-purple-500/20' : 'bg-white/5'}`}>
                <pkg.icon className={`w-6 sm:w-8 h-6 sm:h-8 ${pkg.highlight ? 'text-purple-400' : 'text-gray-400'}`} />
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white mb-2 uppercase tracking-tighter">{pkg.title}</h2>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-2xl sm:text-3xl font-black text-white">{pkg.price}</span>
              </div>
              
              <p className="text-gray-500 text-[10px] sm:text-xs text-center mb-8 font-medium leading-relaxed">{pkg.description}</p>

              <div className="w-full space-y-3 mb-8">
                {pkg.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-3">
                    <Check className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${pkg.highlight ? 'text-purple-400' : 'text-gray-600'}`} />
                    <span className="text-[9px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest text-left leading-tight">{feature}</span>
                  </div>
                ))}
              </div>

              <div className={`w-full py-4 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all
                ${pkg.highlight ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-white/5 text-gray-300 group-hover:bg-purple-600 group-hover:text-white'}`}>
                Selecionar Plano
                <ChevronRight className="w-3 sm:w-4 h-3 sm:h-4" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Rodapé Redesenhado - Centralização Absoluta */}
        <div className="flex flex-col items-center justify-center gap-6 w-full max-w-xl mx-auto mt-10">
          
          {/* Botão Realizar Nova Invasão Estilo Pílula */}
          <button 
            onClick={handleInvadeClick}
            className="group relative w-full sm:max-w-md h-16 rounded-full overflow-hidden flex items-center justify-center gap-3 bg-gradient-to-r from-[#9d4edd] via-[#f72585] to-[#ffbe0b] transition-all duration-300 active:scale-95 shadow-[0_0_30px_rgba(247,37,133,0.3)]"
          >
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-white font-black text-lg uppercase tracking-tight">Realizar Nova Invasão</span>
          </button>

          {/* Selo Gateway Seguro Estilo Pílula Escuro */}
          <div className="w-full sm:max-w-sm h-14 rounded-full border-2 border-red-900/40 bg-[#120000]/80 flex items-center justify-center gap-3 px-6 backdrop-blur-sm shadow-xl">
            <ShieldCheck className="w-5 h-5 text-red-600" />
            <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.2em]">Gateway de Pagamento Seguro</span>
          </div>

          {/* Copyright Final */}
          <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.4em] mt-2">
            SpyGram © 2024 Intelligence
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreditsPage;