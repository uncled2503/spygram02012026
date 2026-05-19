import React, { useMemo } from 'react';
import { cn } from '../lib/utils';

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+=-[]{}|;:,.<>?/~`';
const SPYGRAM = 'SPYGRAM';
const COLUMN_COUNT = 40; 
const FONT_SIZE = 20; 
const RAIN_LENGTH = 100; 

const generateStyledColumn = (columnIndex: number) => {
  const characters = [];
  let spygramIndex = 0;
  const shouldInsertSpygram = columnIndex % 7 === 0; 
  
  for (let i = 0; i < RAIN_LENGTH; i++) {
    let char = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
    // Cor base ajustada para ser visível mas sutil (cinza escuro em vez de quase preto)
    let className = 'text-white/5'; 

    if (shouldInsertSpygram && spygramIndex < SPYGRAM.length && i % 10 === 0) { 
      char = SPYGRAM[spygramIndex];
      className = 'text-purple-500/40 font-bold'; 
      spygramIndex++;
    } else if (Math.random() < 0.05) { 
      className = Math.random() > 0.5 ? 'text-purple-900/30' : 'text-pink-900/30';
    }

    characters.push(
      <span key={i} className={className}>
        {char}
      </span>
    );
  }
  return characters;
};

const MatrixRainBackground: React.FC = () => {
  const columnData = useMemo(() => {
    return Array(COLUMN_COUNT).fill(0).map((_, index) => ({
      content: generateStyledColumn(index),
      duration: Math.random() * 15 + 10, 
      delay: Math.random() * -10, 
    }));
  }, []);

  return (
    <>
      <style>{`
        @keyframes matrix-fall {
          0% { transform: translateY(-100%); } 
          100% { transform: translateY(100vh); }
        }
        .matrix-column {
          position: absolute;
          top: 0; 
          font-size: ${FONT_SIZE}px;
          line-height: ${FONT_SIZE}px;
          white-space: pre;
          animation-name: matrix-fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          opacity: 0.8; 
          display: flex;
          flex-direction: column;
          filter: blur(1px);
        }
      `}</style>
      <div className="fixed inset-0 overflow-hidden z-0 bg-[#050505]">
        {/* Gradiente de profundidade */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-black z-10 pointer-events-none"></div>
        
        {columnData.map((col, index) => (
          <div
            key={index}
            className={cn("matrix-column")}
            style={{
              left: `${(index / COLUMN_COUNT) * 100}%`,
              animationDuration: `${col.duration}s`,
              animationDelay: `${col.delay}s`,
            }}
          >
            {col.content}
          </div>
        ))}
      </div>
    </>
  );
};

export default MatrixRainBackground;