import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ChevronRight, ShoppingCart, Check, QrCode, Copy, Loader2, AlertCircle } from 'lucide-react';
import SalesNotification from '../components/SalesNotification';
import { supabase } from '../integrations/supabase/client';
import toast from 'react-hot-toast';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(252);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pixData, setPixData] = useState<{ qrcode: string, copyPaste: string } | null>(null);
  
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
    pro: { title: 'ACESSO VITALÍCIO PRO', price: 9.90, img: '/order-bumps/vitalicio.jpg', desc: 'Acesso permanente!' },
    social: { title: 'ESPIÃO REDES SOCIAIS', price: 19.90, img: '/order-bumps/social.jpg', desc: 'Instagram + Facebook + Whats!' },
    recover: { title: 'RECUPERADOR MENSAGENS', price: 15.90, img: '/order-bumps/recover.jpg', desc: 'Recupere tudo!' },
    track: { title: 'RASTREAMENTO 24H', price: 15.90, img: '/order-bumps/track.jpg', desc: 'Saiba cada passo!' }
  };

  const adicionais = Object.keys(bumps).reduce((acc, key) => {
    return bumps[key as keyof typeof bumps] ? acc + bumpDetails[key as keyof typeof bumps].price : acc;
  }, 0);

  const total = basePrice + adicionais;

  const handleToggleBump = (key: keyof typeof bumps) => {
    setBumps(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFinalize = async () => {
    if (!formData.nome || !formData.email || !formData.documento) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (formData.email !== formData.confirmarEmail) {
      toast.error("Os e-mails não coincidem.");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('royal-pix', {
        body: {
          amount: total,
          name: formData.nome,
          email: formData.email,
          document: formData.documento,
          description: "Relatório SpyGram Completo + Adicionais"
        }
      });

      if (error) throw error;

      // Supondo que a API Royal retorne qrcode (imagem/base64) e pix_copia_e_cola
      setPixData({
        qrcode: data.pix?.qrcode_image || '', // Ajustar conforme retorno exato da Royal
        copyPaste: data.pix?.copy_paste || data.pix?.payload || ''
      });
      
      toast.success("PIX Gerado com sucesso!");
      // Rola para o topo para mostrar o PIX
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar PIX. Tente novamente mais tarde.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (pixData?.copyPaste) {
      navigator.clipboard.writeText(pixData.copyPaste);
      toast.success("Código PIX copiado!");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-[#333] font-sans pb-20">
      <SalesNotification />

      <div className="w-full bg-[#f15c5c] text-white py-2 text-center text-[11px] font-bold uppercase sticky top-0 z-50">
        SUA VAGA ESTÁ GARANTIDA ENQUANTO ESTIVER NESSA PÁGINA! <span className="ml-2 font-mono">{formatTimer(timeLeft)}</span>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">
        
        {/* ÁREA DO PIX GERADO */}
        {pixData && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-green-500 mb-10 flex flex-col items-center text-center"
          >
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-xs font-black uppercase mb-6 flex items-center gap-2">
              <Check size={16} /> PIX Gerado com Sucesso!
            </div>
            
            <p className="text-sm font-bold text-gray-600 mb-6">Escaneie o QR Code abaixo com o app do seu banco:</p>
            
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6">
              {/* Se o qrcode for base64, renderiza imagem, senão componente de QR */}
              {pixData.qrcode.startsWith('data:') ? (
                <img src={pixData.qrcode} alt="QR Code PIX" className="w-48 h-48" />
              ) : (
                <div className="w-48 h-48 bg-gray-200 flex items-center justify-center"><QrCode size={64} className="text-gray-400" /></div>
              )}
            </div>

            <div className="w-full max-w-sm space-y-4">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Ou use o código Copia e Cola:</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={pixData.copyPaste} 
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-xs font-mono truncate outline-none"
                />
                <button 
                  onClick={copyToClipboard}
                  className="bg-gray-800 text-white p-3 rounded-lg hover:bg-black transition-colors"
                >
                  <Copy size={20} />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 italic">O acesso será enviado imediatamente para {formData.email} após o pagamento.</p>
            </div>
          </motion.div>
        )}

        {/* --- RESTO DO CHECKOUT (SÓ APARECE SE NÃO TIVER PIX DATA OU SEMPRE) --- */}
        {!pixData && (
          <>
            {/* Banner Topo */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm mb-8">
              <img src="/banner-topo.png" alt="Banner" className="w-full h-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Formulário */}
              <div className="md:col-span-8 space-y-8">
                <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-black">1</div>
                    <h2 className="text-xs font-black uppercase tracking-widest">DADOS PESSOAIS</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-5">
                    <input type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="NOME COMPLETO" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm outline-none focus:border-red-500" />
                    <input type="text" name="documento" value={formData.documento} onChange={handleChange} placeholder="CPF OU CNPJ" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm outline-none focus:border-red-500" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="E-MAIL" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm outline-none focus:border-red-500" />
                      <input type="email" name="confirmarEmail" value={formData.confirmarEmail} onChange={handleChange} placeholder="CONFIRMAR E-MAIL" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm outline-none focus:border-red-500" />
                    </div>
                    <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="WHATSAPP" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm outline-none focus:border-red-500" />
                  </div>
                </section>

                {/* Bumps */}
                <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-black">2</div>
                    <h2 className="text-xs font-black uppercase tracking-widest">TURBINE SEU ACESSO</h2>
                  </div>
                  <div className="space-y-4">
                    {(Object.keys(bumps) as Array<keyof typeof bumps>).map((key) => (
                      <div key={key} onClick={() => handleToggleBump(key)} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex gap-4 ${bumps[key] ? 'border-green-500 bg-green-50' : 'border-gray-50 bg-gray-50'}`}>
                        <img src={bumpDetails[key].img} className="w-16 h-16 object-cover rounded-lg" alt="" />
                        <div className="flex-1">
                          <p className="text-xs font-black uppercase text-gray-700">{bumpDetails[key].title} (+R$ {bumpDetails[key].price.toFixed(2)})</p>
                          <p className="text-[10px] text-gray-500 font-bold mt-1">{bumpDetails[key].desc}</p>
                        </div>
                        <input type="checkbox" checked={bumps[key]} readOnly className="w-5 h-5 accent-green-500" />
                      </div>
                    ))}
                  </div>
                </section>

                <button 
                  onClick={handleFinalize} 
                  disabled={isGenerating}
                  className="w-full bg-[#78cc6d] hover:bg-[#6ab961] text-white py-5 rounded-2xl font-black text-xl uppercase flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isGenerating ? <><Loader2 className="animate-spin" /> GERANDO PIX...</> : <>GERAR PIX AGORA <ChevronRight /></>}
                </button>
              </div>

              {/* Sidebar Resumo */}
              <div className="md:col-span-4">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest text-center mb-6">RESUMO DO PEDIDO</h3>
                  <div className="space-y-4 text-xs">
                    <div className="flex justify-between font-bold"><span>Relatório VIP</span><span>R$ {basePrice.toFixed(2)}</span></div>
                    {adicionais > 0 && <div className="flex justify-between font-bold text-green-600"><span>Adicionais</span><span>+ R$ {adicionais.toFixed(2)}</span></div>}
                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                      <span className="font-black text-sm">TOTAL:</span>
                      <span className="text-lg font-black text-green-600">R$ {total.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <footer className="mt-20 text-center px-4">
        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 mb-4 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          <span className="text-[10px] font-black uppercase text-gray-400">Pagamento Processado com Segurança</span>
        </div>
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">© 2024 SpyGram - Royal Banking Secured</p>
      </footer>
    </div>
  );
};

export default CheckoutPage;