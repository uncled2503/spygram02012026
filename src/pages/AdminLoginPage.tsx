import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, User } from 'lucide-react';
import BackgroundLayout from '../components/BackgroundLayout';
import toast from 'react-hot-toast';

const AdminLoginPage: React.FC = () => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const navigate = useNavigate();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // NOTA: Em produção, validamos isso via Supabase.
    // Para este teste, usamos uma credencial temporária.
    if (user === 'admin' && pass === 'mudar_senha_urgente') {
      localStorage.setItem('spygram_admin_auth', 'true');
      toast.success('Acesso concedido.');
      navigate('/admin');
    } else {
      toast.error('Acesso negado.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#050505]/90 backdrop-blur-2xl border-2 border-red-900/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(255,0,0,0.1)] relative">
        <div className="text-center mb-10">
          <ShieldAlert className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white uppercase">Painel de Comando</h1>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-6">
          <input
            type="text"
            placeholder="OPERADOR"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="w-full bg-black/50 border border-gray-800 rounded-xl py-4 px-4 text-white outline-none"
          />
          <input
            type="password"
            placeholder="CÓDIGO"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="w-full bg-black/50 border border-gray-800 rounded-xl py-4 px-4 text-white outline-none"
          />
          <button type="submit" className="w-full bg-red-600 text-white font-black py-4 rounded-xl">
            Autenticar
          </button>
        </form>
      </div>
    </div>
  );
};

export default () => <BackgroundLayout><AdminLoginPage /></BackgroundLayout>;