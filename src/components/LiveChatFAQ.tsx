import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MessageSquare, User, ShieldCheck, Send, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessageProps {
  sender: 'user' | 'admin' | 'current_user';
  message: string;
  time: string;
  username?: string;
}

const USER_COLORS: { [key: string]: string } = {
  'user921': 'text-yellow-400',
  'user333': 'text-pink-400',
  'user403': 'text-blue-400',
  'user111': 'text-green-400',
};

const ChatMessage: React.FC<ChatMessageProps> = ({ sender, message, time, username }) => {
  const isCurrentUser = sender === 'current_user';
  const isAdmin = sender === 'admin';
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col mb-4 ${isCurrentUser ? 'items-end' : 'items-start'}`}
    >
      {!isCurrentUser && (
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className={`text-[10px] font-black uppercase tracking-widest ${isAdmin ? 'text-green-400' : USER_COLORS[username || ''] || 'text-gray-400'}`}>
            {isAdmin ? '🛡️ SUPORTE SPYGRAM' : username}
          </span>
        </div>
      )}
      
      <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-xl leading-relaxed ${
        isCurrentUser 
          ? 'bg-purple-600 text-white rounded-tr-none' 
          : isAdmin 
            ? 'bg-white/10 text-white border border-white/10 rounded-tl-none' 
            : 'bg-gray-800 text-gray-200 rounded-tl-none'
      }`}>
        {message}
      </div>
      <span className="text-[9px] text-gray-500 mt-1 uppercase font-bold tracking-tighter px-1">{time}</span>
    </motion.div>
  );
};

const INITIAL_CONVERSATION: ChatMessageProps[] = [
    { sender: 'user', username: 'user921', message: 'O acesso é realmente vitalício?', time: '14:30' },
    { sender: 'admin', message: 'Sim! Pagamento único. Sem mensalidades escondidas.', time: '14:31' },
    { sender: 'user', username: 'user333', message: 'Aceita PIX?', time: '14:32' },
    { sender: 'admin', message: 'Com certeza. Liberação imediata após o pagamento.', time: '14:33' },
];

const LiveChatFAQ: React.FC = () => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [displayedMessages, setDisplayedMessages] = useState<ChatMessageProps[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationFinished, setConversationFinished] = useState(false);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    let index = 0;
    let timer: NodeJS.Timeout;

    const addMessage = () => {
      if (index < INITIAL_CONVERSATION.length) {
        const msg = INITIAL_CONVERSATION[index];
        if (msg.sender === 'admin') {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            setDisplayedMessages(prev => [...prev, msg]);
            index++;
            timer = setTimeout(addMessage, 2000);
          }, 1000);
        } else {
          setDisplayedMessages(prev => [...prev, msg]);
          index++;
          timer = setTimeout(addMessage, 2000);
        }
      } else {
        setConversationFinished(true);
      }
    };

    timer = setTimeout(addMessage, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [displayedMessages, isTyping]);

  const handleSendMessage = (text: string) => {
    if (!text.trim() || !conversationFinished) return;
    
    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setDisplayedMessages(prev => [...prev, { sender: 'current_user', message: text, time: now }]);
    setInputText('');
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setDisplayedMessages(prev => [...prev, { 
        sender: 'admin', 
        message: 'Estamos com uma alta demanda, mas sua dúvida foi recebida! A liberação do acesso é imediata após a confirmação do pagamento.', 
        time: now 
      }]);
    }, 2000);
  };

  const handleQuestionClick = (question: string) => {
    handleSendMessage(question);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  return (
    <div className="mt-16 w-full">
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="bg-purple-500/20 p-2 rounded-lg">
            <MessageSquare className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Atendimento</h2>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
          <Circle className="w-2 h-2 fill-green-500 text-green-500 animate-pulse" />
          <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Ao Vivo</span>
        </div>
      </div>
      
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden flex flex-col h-[500px] shadow-2xl">
        {/* Chat Messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {displayedMessages.map((msg, index) => (
            <ChatMessage key={index} {...msg} />
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce [animation-delay:0.2s]">.</span>
              <span className="animate-bounce [animation-delay:0.4s]">.</span>
              Suporte digitando
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black/40 border-t border-white/5 space-y-4">
          {/* Quick Suggestions */}
          <div className="flex flex-wrap gap-2 justify-center">
            {['Aceita PIX?', 'É seguro?', 'Acesso imediato?'].map((q) => (
              <button
                key={q}
                onClick={() => handleQuestionClick(q)}
                disabled={!conversationFinished}
                className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Text Input */}
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={conversationFinished ? "Escreva sua dúvida..." : "Aguarde o atendente..."}
              disabled={!conversationFinished}
              className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-5 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || !conversationFinished}
              className="absolute right-2 p-2 bg-purple-600 text-white rounded-full hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:bg-gray-700"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LiveChatFAQ;