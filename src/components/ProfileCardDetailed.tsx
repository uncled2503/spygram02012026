import React from 'react';
import { ProfileData } from '../../types';
import { Zap, BadgeCheck, Shield } from 'lucide-react';

interface ProfileCardDetailedProps {
  profileData: ProfileData;
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('pt-BR').format(num);
};

const ProfileCardDetailed: React.FC<ProfileCardDetailedProps> = ({ profileData }) => {
  const bioLines = profileData.biography ? profileData.biography.split('\n').filter(line => line.trim() !== '') : [];

  return (
    <div className="relative p-8 group">
      {/* Detalhe de Brilho no Topo */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      
      <div className="flex flex-col items-center text-center">
        {/* Avatar com Anel de Gradiente */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-full blur-md opacity-40 group-hover:opacity-70 transition-opacity" />
          <img
            src={profileData.profilePicUrl}
            alt={profileData.username}
            className="relative w-28 h-28 rounded-full object-cover border-4 border-black"
          />
        </div>

        {/* Nomes */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <h2 className="text-2xl font-black text-white tracking-tight">@{profileData.username}</h2>
            {profileData.isVerified && <BadgeCheck className="w-6 h-6 text-blue-400 fill-blue-400/10" />}
          </div>
          <p className="text-gray-400 font-medium">{profileData.fullName}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 w-full gap-3 mb-8">
          <div className="bg-white/5 rounded-2xl py-3 border border-white/5">
            <p className="text-lg font-black text-white">{formatNumber(profileData.postsCount)}</p>
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Posts</p>
          </div>
          <div className="bg-white/5 rounded-2xl py-3 border border-white/5">
            <p className="text-lg font-black text-white">{formatNumber(profileData.followers)}</p>
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Seguidores</p>
          </div>
          <div className="bg-white/5 rounded-2xl py-3 border border-white/5">
            <p className="text-lg font-black text-white">{formatNumber(profileData.following)}</p>
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Seguindo</p>
          </div>
        </div>

        {/* Bio - Totalmente padronizada com ícone alinhado */}
        {bioLines.length > 0 && (
          <div className="w-full text-left bg-black/40 rounded-2xl p-4 border border-white/5 flex gap-3">
            <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col">
              {bioLines.map((line, index) => (
                <p key={index} className="text-xs text-gray-400 font-medium leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Status Privado */}
        {profileData.isPrivate && (
          <div className="mt-6 flex items-center gap-2 text-red-400 text-[10px] font-black uppercase tracking-widest bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
            <Shield className="w-3.5 h-3.5" />
            Criptografia de Conta Privada Quebrada
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCardDetailed;