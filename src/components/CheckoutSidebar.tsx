import React from 'react';

interface CheckoutSidebarProps {
  total: number;
}

const CheckoutSidebar: React.FC<CheckoutSidebarProps> = ({ total }) => {
  return (
    <aside className="hidden lg:block w-80 flex-shrink-0 sticky top-24 h-fit">
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-200/50 py-3 px-6 text-center">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resumo da Compra</span>
        </div>
        
        <div className="p-8 flex flex-col items-center">
          <div className="mb-8">
            <img src="/spygram_transparentebranco.png" className="h-16 brightness-0 opacity-80" alt="SpyGram" />
          </div>

          <div className="w-full text-center mb-8">
            <h4 className="text-sm font-black text-gray-800 leading-tight">Relatório SpyGram Completo</h4>
            <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Relatório Completo SpyGram® 🕵️ ✅</p>
          </div>

          <div className="w-full space-y-4 border-t border-gray-50 pt-6">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500 font-bold">Relatório SpyGram Completo</span>
              <span className="text-[10px] text-green-600 font-black">R$ 29,90</span>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center mt-6">
              <span className="text-[10px] font-black text-gray-400 uppercase">Total Hoje:</span>
              <span className="text-xs font-black text-green-600">R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default CheckoutSidebar;