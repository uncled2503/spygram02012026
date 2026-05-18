import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Lock, CreditCard, QrCode, Check, Clock, Star, Mail, ShieldCheck, ChevronRight, ShoppingCart, Banknote, LayoutList, MessageSquare, Heart, Bookmark, Eye, CheckCircle2, MoreHorizontal } from 'lucide-react';
import SalesNotification from '../components/SalesNotification';

const CHECKOUT_URL = 'https://go.perfectpay.com.br/PPU38CPUD1S';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(252);
  const [formData, setFormData] = useState({ nome: '', email: '', whatsapp: '', documento: '' });
  const [bumps, setBumps] = useState({ pro: false, social: false, recover: false, track: false });

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
    pro: { title: 'ADQUIRIR TAMBÉM ACESSO VITALÍCIO AO SPYGRAM PRO', price: 9.90, img: '/order-bumps/vitalicio.jpg', desc: 'Tenha acesso permanente a ferramenta SpyGram PRO!' },
    social: { title: 'ADQUIRIR TAMBÉM ESPIÃO INSTAGRAM + FACEBOOK + WHATSAPP', price: 19.90, img: '/order-bumps/social.jpg', desc: 'Tenha acesso a todas as redes sociais de quem você quiser!' },
    recover: { title: 'ADQUIRIR TAMBÉM RECUPERADOR DE MENSAGENS APAGADAS', price: 15.90, img: '/order-bumps/recover.jpg', desc: 'Recupere todas as mensagens apagadas do instagram!' },
    track: { title: 'ADQUIRIR TAMBÉM RASTREAMENTO 24 HORAS', price: 15.90, img: '/order-bumps/track.jpg', desc: 'Rastreie a pessoa que quiser usando somente o celular por tempo ilimitado!' }
  };

  const total = basePrice + Object.keys(bumps).reduce((acc, key) => bumps[key as keyof typeof bumps] ? acc + bumpDetails[key as keyof typeof bumps].price : acc, 0);

  const handleToggleBump = (key: keyof typeof bumps) => setBumps(prev => ({ ...prev, [key]: !prev[key] }));
  const handleFinalize = () => {
    sessionStorage.setItem('hasPurchased', 'true');
    window.location.href = CHECKOUT_URL;
  };

  const maskPhone = (value: string) => value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").substring(0, 15);
  const maskCPFCNPJ = (value: string) => {
    const raw = value.replace(/\D/g, "");
    if (raw.length <= 11) return raw.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return raw.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2").substring(0, 18);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'whatsapp') formattedValue = maskPhone(value);
    else if (name === 'documento') formattedValue = maskCPFCNPJ(value);
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-[#333] font-sans">
      <SalesNotification />
      
      {/* Header Sticky Timer */}
      <div className="w-full bg-[#f15c5c] text-white py-2 text-center text-[13px] font-bold uppercase sticky top-0 z-[100] shadow-md flex items-center justify-center gap-2">
        <span>SUA VAGA ESTÁ GARANTIDA ENQUANTO ESTIVER NESSA PÁGINA!</span>
        <div className="flex items-center gap-1 bg-black/10 px-2 py-0.5 rounded">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{formatTimer(timeLeft)}</span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Top Branding Section */}
        <div className="flex flex-col items-center mb-12">
            <div className="relative mb-6">
                <img src="/banner-topo.png" alt="SpyGram Community" className="w-full max-w-2xl h-auto" />
                <img src="/spygram_transparentebranco.png" alt="Logo" className="absolute top-0 right-0 h-10 invert brightness-0" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-center text-[#111] mb-2">+12,3mil pessoas utilizam e aprovam o SpyGram®.</h1>
            <p className="text-[#666] text-sm md:text-base text-center max-w-2xl leading-relaxed">
                Este aplicativo foi testado e aprovado por profissionais, contando com o selo de confiança 'Google Reviews'.
            </p>
        </div>

        {/* Google Reviews Block */}
        <div className="bg-white rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between border border-gray-100 shadow-sm mb-10 max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_Logo.svg" alt="Google" className="h-8" />
                <div>
                    <p className="text-xl font-black text-[#444] uppercase tracking-tight">Google Reviews:</p>
                    <p className="text-sm font-bold text-gray-500">(12,3mil) Avaliações</p>
                </div>
            </div>
            <div className="flex flex-col items-center">
                <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />)}
                </div>
                <span className="text-lg font-black text-gray-700">(4,9)</span>
            </div>
        </div>

        {/* Info Strip */}
        <div className="bg-white border-y border-gray-100 py-3 mb-10 flex items-center gap-3 px-6 rounded-lg shadow-sm">
            <ShoppingCart className="w-5 h-5 text-gray-400" />
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">VOCÊ ESTÁ ADQUIRINDO:</span>
                <span className="text-xs font-black text-[#111]">Relatório SpyGram Completo</span>
            </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column (Main Forms) */}
            <div className="lg:col-span-8 space-y-10">
                
                {/* Desktop Promo Banner */}
                <div className="hidden md:block relative bg-gradient-to-br from-[#1a0b0b] to-[#121212] rounded-[2rem] overflow-hidden shadow-2xl border border-white/5">
                    <div className="grid grid-cols-2">
                        <div className="p-10 flex flex-col justify-center">
                            <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full w-fit mb-4 uppercase">Descubra tudo do instagram!</span>
                            <h2 className="text-4xl font-black text-white leading-tight mb-4">
                                Finalize a compra do <span className="text-[#f15c5c]">Relatório Completo</span>
                            </h2>
                            <p className="text-gray-300 text-lg mb-8">E tenha <span className="font-black text-white">acesso imediato</span> a tudo que acontece no <span className="font-black text-white italic">Instagram!</span></p>
                            
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-white text-sm font-bold">
                                    <div className="bg-red-600/20 border border-red-600/50 p-0.5 rounded"><Check className="w-3 h-3 text-red-600" /></div>
                                    Espione qualquer perfil
                                </div>
                                <div className="flex items-center gap-2 text-white text-sm font-bold">
                                    <div className="bg-red-600/20 border border-red-600/50 p-0.5 rounded"><Check className="w-3 h-3 text-red-600" /></div>
                                    Não precisa da senha
                                </div>
                                <div className="flex items-center gap-2 text-white text-sm font-bold">
                                    <div className="bg-red-600/20 border border-red-600/50 p-0.5 rounded"><Check className="w-3 h-3 text-red-600" /></div>
                                    Garantia de 7 dias
                                </div>
                            </div>
                        </div>
                        <div className="p-8 flex items-center justify-center bg-black/20">
                            {/* Visual Feedback Mockups */}
                            <div className="space-y-4 w-full">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-800" />
                                        <div className="flex-1">
                                            <div className="h-3 w-20 bg-white/20 rounded mb-1" />
                                            <div className="h-2 w-32 bg-white/10 rounded" />
                                        </div>
                                        <MoreHorizontal className="w-4 h-4 text-white/40" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Bottom Gradient Accent */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-purple-600 to-pink-500" />
                </div>

                {/* Forms Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Step 1: Personal */}
                    <section className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-black">1</div>
                                <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest">DADOS PESSOAIS</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[11px] font-black text-gray-700 uppercase mb-1.5 block">Nome completo</label>
                                    <input type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="Digite seu nome completo" className="w-full bg-[#fafafa] border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-gray-700 uppercase mb-1.5 block">E-mail</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="E-mail" className="w-full bg-[#fafafa] border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-gray-700 uppercase mb-1.5 block">Telefone</label>
                                    <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="Telefone" className="w-full bg-[#fafafa] border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Step 2: Payment */}
                    <section className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-black">2</div>
                                <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest">PAGAMENTO</h3>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <button className="flex items-center justify-center gap-2 border border-gray-200 p-2 rounded-xl text-xs font-bold text-gray-400"><CreditCard className="w-4 h-4" /> Cartão</button>
                                <button className="flex items-center justify-center gap-2 border border-gray-200 p-2 rounded-xl text-xs font-bold text-gray-400"><LayoutList className="w-4 h-4" /> Boleto</button>
                            </div>
                            <button className="w-full flex items-center justify-center gap-2 border-2 border-green-500 p-3 rounded-xl text-xs font-black text-green-600 mb-6 relative">
                                <QrCode className="w-5 h-5" /> Pix
                                <div className="absolute -top-2 -right-1 bg-green-500 text-white rounded-full p-1"><Check className="w-3 h-3" /></div>
                            </button>

                            <div className="bg-[#f9f9f9] p-4 rounded-xl mb-6 text-[10px] text-gray-400 leading-relaxed space-y-2 font-medium">
                                <p>01. Pagamento em segundos, sem complicações</p>
                                <p>02. Basta escanear o QRCode que iremos gerar.</p>
                                <p>03. O PIX é 100% seguro e instantâneo.</p>
                            </div>

                            <div>
                                <label className="text-[11px] font-black text-gray-700 uppercase mb-1.5 block">CPF ou CNPJ</label>
                                <input type="tel" name="documento" value={formData.documento} onChange={handleChange} placeholder="CPF ou CNPJ" className="w-full bg-[#fafafa] border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500" />
                            </div>
                        </div>
                    </section>
                </div>

                {/* Step 3: Bumps */}
                <section className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-black">3</div>
                            <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest">COMPRE JUNTO</h3>
                        </div>

                        <div className="bg-[#78cc6d] text-white px-4 py-1.5 rounded-sm text-[11px] font-black uppercase w-fit mb-6 relative -ml-10">
                            APROVEITE!
                            <div className="absolute top-full left-0 w-0 h-0 border-t-[6px] border-t-[#5a9c51] border-l-[6px] border-l-transparent"></div>
                        </div>

                        <p className="text-xs font-medium text-gray-600 mb-8">
                            <span className="font-bold text-black">70% das pessoas</span> que compraram também se interessaram por:
                        </p>

                        <div className="space-y-4">
                            {(Object.keys(bumps) as Array<keyof typeof bumps>).map((key) => (
                                <div 
                                  key={key} 
                                  onClick={() => handleToggleBump(key)}
                                  className={`bg-[#f7f7f7] border-2 rounded-2xl p-4 flex gap-6 cursor-pointer transition-all duration-300 ${
                                    bumps[key] ? 'border-[#78cc6d] shadow-md' : 'border-gray-100'
                                  }`}
                                >
                                    <div className="w-24 h-24 bg-white rounded-xl p-2 shadow-sm flex items-center justify-center">
                                        <img src={bumpDetails[key].img} alt="" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <input type="checkbox" checked={bumps[key]} readOnly className="w-5 h-5 rounded text-green-600 pointer-events-none" />
                                            <p className="text-[10px] font-black text-gray-700 uppercase leading-tight">
                                                {bumpDetails[key].title} <span className="text-green-600 block">À VISTA POR R$ {bumpDetails[key].price.toFixed(2).replace('.', ',')}</span>
                                            </p>
                                        </div>
                                        <p className="text-[11px] font-black text-red-500 leading-tight">{bumpDetails[key].desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 flex flex-col items-center">
                            <button onClick={handleFinalize} className="w-full max-w-lg bg-[#78cc6d] hover:bg-[#6ab961] text-white py-4 px-8 rounded-xl font-black text-xl uppercase flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98]">
                                Finalizar Compra <ChevronRight className="w-6 h-6" />
                            </button>
                            <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-green-600 uppercase">
                                <ShieldCheck className="w-4 h-4" /> Pagamento 100% seguro processado com criptografia.
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Right Column (Summary) */}
            <div className="lg:col-span-4 sticky top-24">
                <section className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-[#e0e0e0] py-1.5 text-center">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">RESUMO DA COMPRA</span>
                    </div>
                    <div className="p-10 flex flex-col items-center">
                        <div className="w-32 h-32 mb-8 bg-[#f8f9fb] rounded-full p-6 flex items-center justify-center relative">
                            <img src="/spygram_transparentebranco.png" alt="Logo" className="w-full h-auto invert brightness-0" />
                        </div>
                        <h3 className="text-base font-black text-[#111] uppercase mb-1 text-center">Relatório SpyGram Completo</h3>
                        <p className="text-[11px] text-gray-400 font-bold mb-10">Relatório Completo SpyGram® 🔒 ✅</p>

                        <div className="w-full space-y-4 pt-6 border-t border-gray-50">
                            <div className="flex justify-between text-xs font-bold text-gray-500">
                                <span>Relatório SpyGram Completo</span>
                                <span className="text-green-600">R$ {basePrice.toFixed(2).replace('.', ',')}</span>
                            </div>
                            {Object.entries(bumps).map(([key, isActive]) => isActive && (
                                <div key={key} className="flex justify-between text-[11px] font-bold text-gray-400">
                                    <span className="max-w-[180px]">{bumpDetails[key as keyof typeof bumpDetails].title.substring(0, 30)}...</span>
                                    <span className="text-green-600">+ R$ {bumpDetails[key as keyof typeof bumpDetails].price.toFixed(2).replace('.', ',')}</span>
                                </div>
                            ))}
                            <div className="flex justify-between items-center bg-[#f8f9fb] p-5 rounded-2xl mt-8">
                                <span className="text-sm font-black text-[#111]">Total Hoje:</span>
                                <span className="text-sm font-black text-green-600">R$ {total.toFixed(2).replace('.', ',')}</span>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Visual Security Seals Desktop */}
                <div className="mt-8 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 bg-[#78cc6d] text-white px-4 py-2 rounded-full text-[10px] font-black uppercase shadow-sm">
                        <ShieldCheck className="w-4 h-4" /> COMPRA 100% SEGURA
                    </div>
                    <img src="https://static.perfectpay.com.br/assets/img/logos/perfectpay-v2.png" alt="PerfectPay" className="h-6 opacity-40 grayscale" />
                </div>
            </div>
        </div>

        {/* Footer Branding Web */}
        <footer className="mt-32 pt-16 border-t border-gray-200 flex flex-col items-center text-center space-y-6 pb-20">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-10">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">E-MAIL DE SUPORTE: contato@spygram.com.br</p>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-gray-400">PAGAMENTO PROCESSADO POR:</span>
                    <img src="https://static.perfectpay.com.br/assets/img/logos/perfectpay-v2.png" alt="PerfectPay" className="h-5" />
                </div>
            </div>
            
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest max-w-2xl leading-loose">
                Esta compra será processada por PerfectPay © 2026 - Todos os direitos reservados.
                <br />* * Taxa de 2,99% a.m.
                <br />Ao continuar nesta compra, você concorda com os <span className="text-gray-600 underline">Termos de Compra</span> e <span className="text-gray-600 underline">Termos de Privacidade</span>.
            </p>
            
            <div className="text-[10px] text-gray-300 font-medium">Ref: PPA22ZU8 | SN: 6A0B849508A08N</div>
        </footer>
      </main>
    </div>
  );
};

export default CheckoutPage;