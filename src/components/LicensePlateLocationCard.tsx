import React from 'react';
import { motion } from 'framer-motion';
import { Car, MapPin, AlertTriangle } from 'lucide-react';
import ShineButton from './ui/ShineButton';

interface LicensePlateLocationCardProps {
  onUnlockClick: () => void;
  userCity: string; // Adicionado prop para a cidade
}

const LicensePlateLocationCard: React.FC<LicensePlateLocationCardProps> = ({ onUnlockClick, userCity }) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 1.2 }}
      className="mt-12 mb-12 p-6 text-center w-full mx-auto relative overflow-hidden"
    >
      <div className="relative z-10">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Car className="w-10 h-10 text-blue-400 animate-pulse" />
          <h2 className="text-3xl font-extrabold text-white">
            <span className="bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 text-transparent bg-clip-text">
              RASTREAMENTO VEICULAR
            </span>
          </h2>
          <MapPin className="w-10 h-10 text-purple-400 animate-pulse" />
        </div>

        {/* MENSAGEM EM DESTAQUE SOLICITADA */}
        <div className="mb-8 p-4 bg-red-600/20 border-2 border-red-500 rounded-xl inline-flex flex-col items-center gap-2 animate-pulse">
            <div className="flex items-center gap-2 text-red-500 font-black text-lg">
                <AlertTriangle className="w-6 h-6" />
                <span>ALERTA DE MOVIMENTAÇÃO</span>
            </div>
            <p className="text-white font-bold text-xl leading-tight">
                Perfil encontrado recentemente em um <span className="text-yellow-400 underline italic">Motel</span> perto de <span className="uppercase">{userCity}</span>
            </p>
        </div>

        <p className="text-gray-200 mb-6 max-w-md mx-auto text-lg font-medium">
          **NOVIDADE!** Descubra a localização exata do veículo do seu alvo, apenas com a placa. Rastreamento em tempo real via satélite.
        </p>
        
        {/* Imagem Atualizada */}
        <div className="relative w-full max-w-md mx-auto mb-8">
          <img 
            src="/tracking-satellite.png" 
            alt="Rastreamento Veicular por Satélite" 
            className="w-full h-auto object-contain drop-shadow-2xl select-none pointer-events-none" 
          />
        </div>

        <p className="text-xl text-yellow-300 font-bold mb-6">
          Não deixe rastros. Saiba onde o carro está agora!
        </p>

        <ShineButton 
          onClick={onUnlockClick} 
          className="w-full bg-blue-600 focus:ring-blue-500 active:scale-95"
          shineColorClasses="bg-blue-600"
        >
          RASTREAR PLACA AGORA
        </ShineButton>
      </div>
    </motion.div>
  );
};

export default LicensePlateLocationCard;