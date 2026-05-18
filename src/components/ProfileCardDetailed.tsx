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
  const bioLine1 = bioLines[0] || '';
  const remainingBio = bioLines.slice(1).join('\n');

  return (
    <div className="relative p-8 group">
      {/* Detalhe de Brilho no Topo (Mapeado para o novo container pai) */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
      
      <div className="flex flex-col items-center text-center">
        {/* Avatar com Anel de Gradiente */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
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
        <div className="grid grid-cols-3 w-full gap-4 mb-8">
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

        {/* Bio */}
        {(bioLine1 || remainingBio) && (
          <div className="w-full text-left bg-black/40 rounded-2xl p-4 border border-white/5">
            {bioLine1 && (
              <div className="flex items-start gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-200 font-medium leading-tight">{bioLine1}</span>
              </div>
            )}
            {remainingBio && (
              <p className="text-xs text-gray-400 whitespace-pre-wrap leading-relaxed">{remainingBio}</p>
            )}
          </div>
        )}

        {/* Status Privado */}
        {profileData.isPrivate && (
          <div className="mt-6 flex items-center gap-2 text-red-400 text-xs font-black uppercase tracking-widest bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
            <Shield className="w-3.5 h-3.5" />
            Criptografia de Conta Privada Quebrada
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCardDetailed;