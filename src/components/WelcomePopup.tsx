import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Terminal, ArrowRight } from 'lucide-react';
import ShineButton from './ui/ShineButton';

const WelcomePopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Verifica se já foi visualizado nesta sessão
    const dismissed = sessionStorage.getItem('spygram_welcome_dismissed');
    if (!dismissed) {
      // Pequeno atraso para o usuário se situar na página antes do popup
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('spygram_welcome_dismissed', 'true');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[99999] p-4"
        >
          {/* Brilho de fundo decorativo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 150 }}
            className="bg-[#0c0d12] border-2 border-purple-500/30 rounded-[2.5rem] shadow-[0_0_50px_rgba(147,51,234,0.15)] p-8 max-w-sm w-full text-center relative overflow-hidden"
          >
            {/* Header / Linha estilo terminal */}
            <div className="flex items-center justify-center gap-2 mb-6 text-purple-400">
              <Terminal size={14} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] font-mono">Diretriz do Servidor</span>
            </div>

            {/* Ícone de Alerta */}
            <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 bg-yellow-500/10 rounded-full blur-md animate-ping" />
              <div className="relative p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-500 shadow-xl shadow-yellow-500/5">
                <ShieldAlert size={28} />
              </div>
            </div>

            {/* Títulos */}
            <h2 className="text-2xl font-black text-white leading-none uppercase tracking-tight mb-3">
              Limite de <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
                Invasão Teste
              </span>
            </h2>

            {/* Mensagem da Copy */}
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Atenção operador: devido à alta carga nos nossos servidores de infiltração, o seu endereço de IP está limitado a realizar <span className="text-white font-extrabold">apenas 1 (uma) invasão teste gratuita</span>. 
              <span className="block mt-3 text-yellow-400/95 font-semibold">
                Escolha o seu alvo com extrema sabedoria e use esta ferramenta com responsabilidade.
              </span>
            </p>

            {/* Botão de CTA */}
            <div className="w-full">
              <ShineButton
                onClick={handleDismiss}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-pink-600 focus:ring-purple-500 active:scale-95 text-xs py-3.5 rounded-2xl flex items-center justify-center gap-2"
                shineColorClasses="bg-white/20"
              >
                <span>ESTOU CIENTE, PROSSEGUIR</span>
                <ArrowRight size={14} />
              </ShineButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomePopup;