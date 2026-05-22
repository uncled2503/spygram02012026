"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Check } from 'lucide-react';
import ShineButton from './ui/ShineButton';

const TestWarningModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Exibe apenas se não foi visto nesta sessão de navegação
    const hasSeenWarning = sessionStorage.getItem('spygram_warning_seen');
    if (!hasSeenWarning) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000); // 1 segundo de delay para carregar de forma elegante
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('spygram_warning_seen', 'true');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          {/* Backdrop animado */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={handleDismiss}
          />

          {/* Card do Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            className="relative bg-[#0d0d11]/90 border border-red-500/30 rounded-[2rem] p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.15)] overflow-hidden"
          >
            {/* Brilho decorativo de fundo */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 blur-[80px] rounded-full pointer-events-none" />

            {/* Ícone de Alerta Piscando */}
            <div className="relative w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-md animate-pulse" />
              <ShieldAlert className="relative w-8 h-8 text-red-500" />
            </div>

            {/* Título de Alerta de Segurança */}
            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-3">
              Alerta de Protocolo
            </h2>

            {/* Copy Persuasiva */}
            <p className="text-gray-300 text-sm leading-relaxed mb-6 font-medium">
              Devido à alta carga de processamento dos nossos servidores, você possui direito a apenas <span className="text-red-400 font-extrabold underline">1 (uma) única invasão teste</span> por IP neste navegador. 
              <span className="block mt-3 text-yellow-400 font-bold">Use com total responsabilidade e escolha bem o seu alvo.</span>
            </p>

            {/* Lista de Recursos de Segurança */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 mb-6 flex flex-col gap-1.5 items-start text-[11px] font-bold text-gray-400 uppercase tracking-wide">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-green-500" />
                <span>100% Seguro e Anônimo</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-green-500" />
                <span>Criptografia de IP Ativa</span>
              </div>
            </div>

            {/* Botão de Consentimento */}
            <ShineButton
              onClick={handleDismiss}
              className="w-full bg-red-600 focus:ring-red-500 active:scale-95 py-3.5"
              shineColorClasses="bg-white/20"
            >
              Ciente, Entrar no Painel
            </ShineButton>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TestWarningModal;