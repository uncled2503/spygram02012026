import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ChevronRight, QrCode, ShieldCheck, Lock, Check, Clock, CreditCard, Mail, User, Phone, FileText, Star, X } from 'lucide-react';
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
    window.scrollTo(0, 0);
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
    pro: { title: 'ACESSO VITALÍCIO PRO', price: 9.90, img: '/order-bumps/vitalicio.jpg', desc: 'Tenha acesso permanente a ferramenta SpyGram PRO!', checkText: 'ADQUIRIR TAMBÉM ACESSO VITALÍCIO AO SPYGRAM PRO ✅ À VISTA POR R$ 9,90' },
    social: { title: 'ESPIÃO SOCIAL COMPLETO', price: 19.90, img: '/order-bumps/social.jpg', desc: 'Tenha acesso a todas as redes sociais de quem você quiser!', checkText: 'ADQUIRIR TAMBÉM ESPIÃO INSTAGRAM + FACEBOOK + WHATSAPP À VISTA POR R$ 19,90' },
    recover: { title: 'RECUPERADOR DE MENSAGENS', price: 15.90, img: '/order-bumps/recover.jpg', desc: 'Recupere todas as mensagens apagadas do instagram!', checkText: 'ADQUIRIR TAMBÉM RECUPERADOR DE MENSAGENS APAGADAS À VISTA POR R$ 15,90' },
    track: { title: 'RASTREAMENTO 24H', price: 15.90, img: '/order-bumps/track.jpg', desc: 'Rastreie a pessoa que quiser usando somente o celular por tempo ilimitado! Saiba cada passo dela!', checkText: 'ADQUIRIR TAMBÉM RASTREAMENTO 24 HORAS À VISTA POR R$ 15,90' }
  };

  const adicionais = Object.keys(bumps).reduce((acc, key) => {
    return bumps[key as keyof typeof bumps] ? acc + (bumpDetails[key as keyof typeof bumpDetails]?.price || 0) : acc;
  }, 0);

  const total = basePrice + adicionais;

  const handleFinalize = async () => {
    if (!formData.nome || !formData.email || !formData.confirmarEmail || !formData.documento) {
        toast.error("Preencha todos os dados.");
        return;
    }

    if (formData.email.trim().toLowerCase() !== formData.confirmarEmail.trim().toLowerCase()) {
        toast.error("Os e-mails não coincidem.");
        return;
    }

    setIsProcessing(true);
    const toastId = toast.loading("Gerando PIX...");

    const currentLeadId = sessionStorage.getItem('current_lead_id');
    const invasionDataRaw = sessionStorage.getItem('invasionData');
    const invasionData = invasionDataRaw ? JSON.parse(invasionDataRaw) : null;

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
    <div className="min-h-screen bg-[#f4f4f4] text-[#333] font-sans pb-20">
      <SalesNotification />
      
      {/* Timer Header */}
      <div className="w-full bg-[#f15c5c] text-white py-2 px-4 flex flex-col md:flex-row items-center justify-center sticky top-0 z-50 shadow-md gap-2">
        <div className="flex items-center gap-2">
           <span className="text-[11px] font-bold uppercase tracking-tight">SUA VAGA ESTÁ GARANTIDA ENQUANTO ESTIVER NESSA PÁGINA!</span>
           <Clock size={16} />
           <span className="text-[14px] font-black uppercase">{formatTimer(timeLeft)}</span>
        </div>
      </div>

      {/* Hero Section Web */}
      <section className="bg-white pt-10 pb-16 flex flex-col items-center border-b border-gray-100">
        <div className="relative mb-8">
          <img src="/spygram_transparentebranco.png" alt="SpyGram" className="h-12 brightness-0 mx-auto mb-6" />
          {/* Avatar bubbles mockup simulation based on print */}
          <div className="flex justify-center -space-x-4 mb-10">
            {[1,2,3,4,5,6,7].map(i => (
              <div key={i} className="w-16 h-16 rounded-full border-2 border-white shadow-lg overflow-hidden bg-gray-200">
                <img src="/perfil.jpg" alt="User" className="w-full h-full object-cover grayscale opacity-60" />
              </div>
            ))}
          </div>
        </div>

        <div className="text-center max-w-2xl px-4">
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter uppercase leading-tight">
            +12,3mil pessoas utilizam <br /> e aprovam o SpyGram®.
          </h1>
          <p className="text-gray-500 text-sm md:text-lg font-medium leading-relaxed mb-10">
            Este aplicativo foi testado e aprovado por profissionais, contando com o selo de confiança 'Google Reviews'.
          </p>

          {/* Google Reviews Badge */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm inline-flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-4">
              <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" alt="Google" className="h-6" />
              <div className="text-left">
                <p className="font-black text-sm uppercase tracking-widest text-gray-400">Google Reviews:</p>
                <p className="font-black text-xl">(12,3mil) Avaliações</p>
              </div>
            </div>
            <div className="h-px w-full md:h-12 md:w-px bg-gray-200"></div>
            <div className="flex items-center gap-3">
              <div className="flex text-yellow-400">
                {[1,2,3,4,5].map(i => <Star key={i} size={24} fill="currentColor" />)}
              </div>
              <span className="font-black text-2xl text-gray-500">(4,9)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Info Bar */}
      <div className="w-full bg-white border-b border-gray-200 py-3 mb-10">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-3">
          <ShoppingCart size={18} className="text-gray-400" />
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
            VOCÊ ESTÁ ADQUIRIRINDO: <span className="text-gray-600">Relatório SpyGram Completo</span>
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Banner & Forms */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Banner Section */}
            <div className="w-full rounded-[2rem] overflow-hidden shadow-2xl">
              <img src="/banner-checkout-final.jpg" alt="Finalize sua compra" className="w-full h-auto block" />
            </div>

            {/* Sections 1 & 2 side by side on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Section 1: Dados Pessoais */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center gap-3">
                   <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-[10px] font-black">1</div>
                   <h3 className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Dados Pessoais</h3>
                </div>
                <div className="p-6 space-y-5">
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Nome completo</label>
                      <input type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="Seu nome aqui" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#78cc6d] outline-none transition-all bg-gray-50/30" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">E-mail</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="seu@email.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#78cc6d] outline-none transition-all bg-gray-50/30" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Telefone</label>
                      <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="(21) 998510231" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#78cc6d] outline-none transition-all bg-gray-50/30" />
                   </div>
                </div>
              </div>

              {/* Section 2: Pagamento */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center gap-3">
                   <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-[10px] font-black">2</div>
                   <h3 className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Pagamento</h3>
                </div>
                
                <div className="p-6">
                   <div className="grid grid-cols-2 gap-2 mb-6">
                      <button className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-xl text-[9px] font-black uppercase text-gray-400 opacity-50"><CreditCard size={18} />Cartão</button>
                      <button className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-xl text-[9px] font-black uppercase text-gray-400 opacity-50"><FileText size={18} />Boleto</button>
                      <button className="flex flex-col items-center justify-center p-3 border-2 border-[#78cc6d] bg-green-50 rounded-xl text-[9px] font-black uppercase text-[#78cc6d] relative">
                        <Check size={12} className="absolute top-1 right-1" />
                        <QrCode size={18} />Pix
                      </button>
                      <button className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-xl text-[9px] font-black uppercase text-gray-400 opacity-50">PicPay</button>
                   </div>

                   <div className="space-y-4">
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-[10px] text-gray-500 space-y-2 leading-tight">
                         <p>01. Pagamento em segundos, sem complicações</p>
                         <p>02. Basta escanear, com o aplicativo do seu banco, o QRCode que iremos gerar sua compra</p>
                         <p>03. O PIX foi desenvolvido pelo Banco Central para facilitar suas compras e é 100% seguro.</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">CPF ou CNPJ</label>
                        <input type="text" name="documento" value={formData.documento} onChange={handleChange} placeholder="Digite seu CPF ou CNPJ" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#78cc6d] outline-none transition-all bg-white shadow-inner" />
                      </div>
                   </div>
                </div>
              </div>

            </div>

            {/* Section 3: Compre Junto */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center gap-3">
                 <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-[10px] font-black">3</div>
                 <h3 className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Compre Junto</h3>
              </div>
              
              <div className="p-8">
                 <div className="bg-[#78cc6d] text-white py-1 px-3 rounded-lg text-[9px] font-black uppercase inline-block mb-4">Aproveite!</div>
                 <p className="text-xs font-bold mb-8 leading-tight">70% das pessoas que compraram <span className="text-gray-800">Relatório SpyGram Completo</span> também se interessaram por:</p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                   {Object.entries(bumpDetails).map(([key, item]) => (
                     <div key={key} onClick={() => toggleBump(key as keyof typeof bumps)} className={`p-5 border border-gray-100 rounded-3xl transition-all cursor-pointer relative overflow-hidden group ${bumps[key as keyof typeof bumps] ? 'bg-green-50 border-[#78cc6d]' : 'bg-[#fcfcfc] hover:bg-gray-50'}`}>
                        <div className="flex items-start gap-4 mb-3">
                           <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm border border-gray-200 flex-shrink-0">
                             <img src={item.img} className="w-full h-full object-cover" alt="Bump" />
                           </div>
                           <div className="flex-1">
                              <div className="flex justify-between items-start">
                                 <p className="text-[9px] font-black leading-tight text-gray-500 uppercase max-w-[150px]">{item.checkText}</p>
                                 <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors flex-shrink-0 ${bumps[key as keyof typeof bumps] ? 'bg-[#78cc6d] border-[#78cc6d]' : 'bg-white border-gray-300'}`}>
                                    {bumps[key as keyof typeof bumps] && <Check size={12} className="text-white" />}
                                 </div>
                              </div>
                              <p className="text-[12px] font-black text-[#78cc6d] mt-2 tracking-tighter">POR APENAS R$ {item.price.toFixed(2).replace('.', ',')}</p>
                           </div>
                        </div>
                        <p className="text-[10px] text-red-500 font-bold leading-tight mt-2 opacity-80">{item.desc}</p>
                     </div>
                   ))}
                 </div>

                 <button onClick={handleFinalize} disabled={isProcessing} className="w-full bg-[#78cc6d] hover:bg-[#6ab961] text-white py-5 rounded-2xl font-black text-lg uppercase shadow-xl shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                    {isProcessing ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Finalizar Compra <ChevronRight size={22} /></>}
                 </button>
                 
                 <div className="flex flex-col items-center gap-3 mt-6">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-green-600">
                       <Lock size={14} /> Pagamento 100% seguro, processado com criptografia 128bits.
                    </div>
                    <p className="text-[10px] text-gray-400 text-center leading-relaxed">Produto digital, os dados para acesso serão enviados por email imediatamente após a confirmação.</p>
                 </div>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary (Sticky) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
               <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
                  <div className="bg-gray-200/50 p-4 border-b border-gray-200 flex justify-center">
                    <h3 className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Resumo da Compra</h3>
                  </div>
                  <div className="p-10 flex flex-col items-center">
                     <img src="/spygram_transparentebranco.png" className="h-20 brightness-0 opacity-80 mb-10" alt="SpyGram Logo" />
                     <div className="w-full border-t border-gray-100 pt-8 space-y-6">
                        <div className="flex justify-between items-start gap-4">
                           <div className="flex flex-col">
                             <span className="text-sm font-black text-gray-800 leading-tight">Relatório SpyGram Completo</span>
                             <span className="text-[10px] text-[#78cc6d] font-bold uppercase mt-1">✓ Relatório Completo SpyGram® 🕵️</span>
                           </div>
                           <span className="text-sm font-bold text-gray-400 tabular-nums">R$ 29,90</span>
                        </div>
                        
                        {/* Selected Bumps List */}
                        {Object.entries(bumps).map(([key, isActive]) => isActive && (
                          <div key={key} className="flex justify-between items-center animate-fade-in">
                            <span className="text-xs font-bold text-gray-600">{bumpDetails[key as keyof typeof bumpDetails].title}</span>
                            <span className="text-xs font-bold text-gray-400 tabular-nums">R$ {bumpDetails[key as keyof typeof bumpDetails].price.toFixed(2).replace('.', ',')}</span>
                          </div>
                        ))}

                        <div className="bg-gray-50 p-5 rounded-2xl flex justify-between items-center mt-10 border border-gray-100">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Hoje:</span>
                           <span className="text-xl font-black text-[#78cc6d] tabular-nums">R$ {total.toFixed(2).replace('.', ',')}</span>
                        </div>
                     </div>
                  </div>
               </div>
               
               {/* Additional Trust Seals */}
               <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full border border-gray-200 shadow-sm">
                    <ShieldCheck className="text-[#78cc6d] w-5 h-5" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Compra Protegida</span>
                  </div>
               </div>
            </div>
          </div>

        </div>

        {/* Footer info Web */}
        <footer className="mt-20 pt-10 border-t border-gray-200 text-center space-y-10">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4 py-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-[11px] font-bold text-gray-500 uppercase">E-MAIL DE SUPORTE: contato@spygram.com.br</p>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                   <span className="text-[8px] font-black text-gray-400 uppercase">Pagamento processado por:</span>
                   <img src="https://perfectpay.com.br/wp-content/uploads/2021/04/logo-perfectpay-site.png" className="h-4 mt-1" alt="PerfectPay" />
                </div>
                <div className="bg-[#78cc6d] text-white py-2 px-6 rounded-xl inline-flex items-center gap-3 text-[10px] font-black uppercase shadow-lg shadow-green-500/20">
                   <ShieldCheck size={16} /> COMPRA 100% SEGURA
                </div>
              </div>
           </div>

           <div className="space-y-4 max-w-2xl mx-auto">
             <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
               Esta compra será processada por: PerfectPay © 2026 - Todos os direitos reservados. <br />
               * * Taxa de 2,99% a.m. <br />
               Ao continuar nesta compra, você concorda com os <span className="underline cursor-pointer">Termos de Compra</span> e <span className="underline cursor-pointer">Termos de Privacidade</span>.
             </p>
             <div className="text-[9px] text-gray-300 font-bold uppercase tracking-widest">
               Ref: PPA22ZU8 <br /> SN: 6A0BEB66D8980N
             </div>
             
             {/* Reclame Aqui Mockup */}
             <div className="pt-6">
               <div className="bg-white border border-gray-100 rounded-xl p-3 inline-flex items-center gap-4 shadow-sm">
                 <img src="https://static.reclameaqui.com.br/core/images/logo-reclame-aqui.png" alt="Reclame Aqui" className="h-6" />
                 <div className="flex flex-col items-start">
                    <span className="text-[10px] font-black text-green-600 uppercase">Selo RA 1000</span>
                    <span className="text-[8px] font-bold text-gray-400">Excelente Reputação</span>
                 </div>
               </div>
             </div>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default CheckoutPage;