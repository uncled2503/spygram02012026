import React from 'react';
import { CheckCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProfileData } from '../../types';

interface InvasionSuccessCardProps {
  profileData: ProfileData;
}

const InvasionSuccessCard: React.FC<InvasionSuccessCardProps> = ({ profileData }) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="relative w-full max-w-sm mx-auto p-8 bg-[#0a0a0a]/90 backdrop-blur-2xl border border-green-500/30 rounded-[2.5rem] shadow-[0_0_50px_rgba(34,197,94,0.15)] text-center overflow-hidden"
    >
      {/* Efeito de brilho de fundo */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-green-500/10 blur-[80px] rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-green-500/10 blur-[80px] rounded-full" />

      <div className="relative z-10">
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="relative w-20 h-20 mx-auto mb-6"
        >
          <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse" />
          <CheckCircle className="relative w-full h-full text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
        </motion.div>

        <h2 className="text-3xl font-[900] text-white mb-2 tracking-tighter uppercase leading-none">
          INVASÃO <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">BEM-SUCEDIDA!</span>
        </h2>
        
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8 opacity-80">
          Acesso total concedido ao perfil de:
        </p>
        
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 mb-8"
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-full blur-sm opacity-50" />
            <img
              src={profileData.profilePicUrl}
              alt={profileData.username}
              className="relative w-14 h-14 rounded-full object-cover border-2 border-black"
            />
          </div>
          <div className="text-left">
            <p className="text-lg font-black text-white tracking-tight">@{profileData.username}</p>
            <p className="text-xs text-gray-400 font-medium">{profileData.fullName}</p>
          </div>
        </motion.div>

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span className="text-green-500 text-[9px] font-black uppercase tracking-widest">Conexão Estável</span>
          </div>
          
          <p className="text-xs text-gray-500 font-bold animate-pulse mt-2">
            Preparando a visualização do feed...
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default InvasionSuccessCard;