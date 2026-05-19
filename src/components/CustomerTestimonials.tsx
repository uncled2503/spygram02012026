import React from 'react';
import { MessageSquareQuote, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const CustomerTestimonials: React.FC = () => {
  const screenshots = [
    { src: '/testimonials/mariana.png', name: 'Mariana Alves' },
    { src: '/testimonials/rafael.png', name: 'Rafael Souza' },
    { src: '/testimonials/juliana.png', name: 'Juliana Martins' }
  ];

  return (
    <div className="mt-16 w-full px-2">
      <div className="flex flex-col items-center justify-center gap-2 mb-8 text-center">
        <div className="flex items-center gap-3">
          <MessageSquareQuote className="w-7 h-7 text-purple-400" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">O QUE DIZEM NOSSOS CLIENTES</h2>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
          <CheckCircle2 className="w-3 h-3 text-green-500" />
          <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Depoimentos Verificados</span>
        </div>
      </div>

      <div className="space-y-8">
        {screenshots.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            viewport={{ once: true, margin: "-100px" }}
            className="group relative"
          >
            {/* Efeito de brilho ao redor do print */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
            
            <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-black/40 backdrop-blur-sm">
              <img 
                src={item.src} 
                alt={`Depoimento de ${item.name}`} 
                className="w-full h-auto block"
              />
            </div>
            
            {/* Tag de nome flutuante */}
            <div className="absolute -bottom-3 right-6 bg-white text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg transform group-hover:scale-110 transition-transform">
               Cliente: {item.name.split(' ')[0]} ✅
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-10 p-6 bg-white/5 border border-dashed border-white/10 rounded-3xl text-center">
        <p className="text-gray-400 text-sm font-medium leading-relaxed italic">
          "A verdade pode ser dolorosa, mas a dúvida é uma tortura constante. Junte-se aos milhares de usuários que escolheram a clareza."
        </p>
      </div>
    </div>
  );
};

export default CustomerTestimonials;