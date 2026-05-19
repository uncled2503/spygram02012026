"use client";

import React, { useState } from 'react';
import { Search, Code, User, BarChart3, Database } from 'lucide-react';
import BackgroundLayout from '../components/BackgroundLayout';
import { fetchProfileData } from '../services/profileService';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { motion } from 'framer-motion';

const ResultadosPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTestSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Usamos o serviço que já bate na Edge Function configurada com a sua chave
      const data = await fetchProfileData(username.trim());
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar dados da API');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-black/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <Database className="text-purple-500" /> API Debugger
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Endpoint: instagram120 / userInfo</p>
          </div>
          <div className="px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Serviço Ativo</span>
          </div>
        </div>

        {/* Search Area */}
        <div className="p-8">
          <form onSubmit={handleTestSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Digite o username para teste (ex: instagram)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:border-purple-500 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? 'Buscando...' : 'Testar'}
            </button>
          </form>

          {error && <div className="mt-6"><ErrorMessage message={error} /></div>}

          {isLoading && (
            <div className="mt-12 flex flex-col items-center gap-4">
              <Loader />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">Processando requisição...</p>
            </div>
          )}

          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-6"
            >
              {/* Resumo do Perfil Encontrado */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center">
                  <User className="w-5 h-5 text-blue-400 mb-2" />
                  <p className="text-xl font-black text-white">@{result.profile.username}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Username</p>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center">
                  <BarChart3 className="text-pink-500 mb-2" />
                  <p className="text-xl font-black text-white">{result.profile.followers.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Seguidores</p>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center">
                  <Code className="text-yellow-500 mb-2" />
                  <p className="text-xl font-black text-white">{result.profile.isPrivate ? 'Sim' : 'Não'}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Privado</p>
                </div>
              </div>

              {/* Visualizador de JSON Raw */}
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-4 px-2">
                  <Code size={16} className="text-gray-500" />
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Resposta Raw da API (JSON)</h3>
                </div>
                <div className="bg-black/60 rounded-3xl p-6 border border-white/5 font-mono text-[11px] overflow-x-auto text-green-400/80 leading-relaxed shadow-inner">
                  <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default () => <BackgroundLayout><ResultadosPage /></BackgroundLayout>;