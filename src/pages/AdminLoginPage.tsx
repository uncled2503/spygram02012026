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

    // Credenciais exclusivas do sistema (Diferentes do login de membros)
    const ADMIN_USER = 'admin';
    const ADMIN_PASS = 'spygram@2024';

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      localStorage.setItem('spygram_admin_auth', 'true');
      toast.success('Acesso concedido, comandante.');
      navigate('/admin');
    } else {
      toast.error('Credenciais administrativas inválidas.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#050505]/90 backdrop-blur-2xl border-2 border-red-900/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(255,0,0,0.1)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
        
        <div className="text-center mb-10">
          <ShieldAlert className="w-16 h-16 text-red-600 mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Painel de Comando</h1>
          <p className="text-gray-500 text-xs mt-1 font-bold">ACESSO RESTRITO - NIVEL 5</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-6">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
            <input
              type="text"
              placeholder="OPERADOR"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full bg-black/50 border border-gray-800 rounded-xl py-4 pl-12 pr-4 text-white text-sm focus:border-red-600 outline-none transition-all uppercase tracking-widest font-bold"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
            <input
              type="password"
              placeholder="CÓDIGO DE ACESSO"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full bg-black/50 border border-gray-800 rounded-xl py-4 pl-12 pr-4 text-white text-sm focus:border-red-600 outline-none transition-all uppercase tracking-widest font-bold"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.3)] uppercase tracking-widest"
          >
            Autenticar
          </button>
        </form>

        <div className="mt-8 text-center">
            <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.2em]">Conexão Criptografada via Túnel Seguro</p>
        </div>
      </div>
    </div>
  );
};

const AdminLoginPageWithBackground = () => (
  <BackgroundLayout>
    <AdminLoginPage />
  </BackgroundLayout>
);

export default AdminLoginPageWithBackground;