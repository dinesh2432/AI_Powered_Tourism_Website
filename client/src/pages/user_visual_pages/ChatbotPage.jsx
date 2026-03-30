import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const suggestions = [
  '🗼 Best cafes in Paris?',
  '🌴 Bali nightlife tips?',
  '🌸 Best time to visit Japan?',
  '🛂 Thailand visa process?',
  '🏟️ Must-see spots in Rome?',
  '🎒 Beach vacation packing list?',
];

const ChatbotPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your AI travel assistant. I can help you plan trips, find destinations, suggest activities, and answer any travel questions you have. Where would you like to go?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const context = messages.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n');
      const { data } = await api.post('/trips/chatbot', { question: userMsg, context });
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch {
      toast.error('Could not reach AI service. Please try again.');
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't get a response right now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); sendMessage(); };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col bg-slate-950 grid-bg relative overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header Area */}
      <div className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md px-10 py-6 z-10">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white text-slate-950 flex items-center justify-center text-2xl font-black">
                    AI
                </div>
                <div>
                <h1 className="text-white text-[10px] font-black uppercase tracking-[0.5em] leading-none mb-2 text-primary-500">AI Travel Assistant</h1>
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-green-500 animate-pulse" />
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Active now</span>
                    </div>
                </div>
            </div>
            {/* <div className="flex gap-4">
                <button
                    onClick={() => setMessages([{ role: 'assistant', content: `Buffer Purged. Ready for new mission parameters.` }])}
                    className="text-[9px] font-black text-slate-600 uppercase tracking-widest border border-white/5 px-4 py-2 hover:text-white hover:border-white/10 transition-all"
                >
                    PURGE BUFFER
                </button>
            </div> */}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-10 py-12 no-scrollbar">
        <div className="max-w-5xl mx-auto space-y-12">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className={`flex gap-8 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-12 h-12 flex items-center justify-center font-black text-xs shrink-0 border ${
                  msg.role === 'user'
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : 'bg-white border-white text-slate-950'
                }`}>
                  {msg.role === 'user' ? 'YOU' : 'AI'}
                </div>

                <div className={`max-w-2xl border px-8 py-6 ${
                  msg.role === 'user'
                    ? 'bg-primary-500/5 border-primary-500/20 text-white'
                    : 'bg-white/5 border-white/10 text-slate-300'
                }`}>
                  <div className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em] mb-4">
                    {msg.role === 'user' ? 'You' : 'AI Assistant'}
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                    {msg.content.split('\n').map((line, j) => (
                      <p key={j} className={j > 0 && line ? 'mt-3' : j > 0 ? 'mt-1' : ''}>{line}</p>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-8"
            >
              <div className="w-12 h-12 bg-white flex items-center justify-center font-black text-xs text-slate-950">AI</div>
              <div className="border border-white/10 bg-white/5 px-8 py-6 flex gap-2 items-center">
                <span className="w-1.5 h-1.5 bg-primary-500 animate-pulse" />
                <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">Processing Info...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-slate-950/80 backdrop-blur-md border-t border-white/5 p-10 z-10 shadow-2xl">
        <div className="max-w-5xl mx-auto space-y-8">
            {messages.length <= 1 && (
                <div className="flex flex-wrap gap-3">
                    {suggestions.slice(0, 4).map((s) => (
                        <button
                            key={s}
                            onClick={() => sendMessage(s)}
                            className="text-[9px] font-black text-slate-600 uppercase tracking-widest border border-white/5 px-4 py-2 hover:text-white hover:bg-white/5 hover:border-white/10 transition-all"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            <form onSubmit={handleSubmit} className="relative group">
                <input
                    ref={inputRef}
                    type="text"
                    className="w-full bg-white/5 border border-white/10 h-20 px-10 text-[11px] font-black uppercase tracking-[0.2em] text-white focus:outline-none focus:border-white focus:bg-white/10 transition-all placeholder:text-slate-700"
                    placeholder="Ask any question: What is the best plac to visit?"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    autoFocus
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="absolute right-4 top-4 h-12 px-6 bg-white text-slate-950 font-black text-[10px] uppercase tracking-widest hover:bg-primary-500 hover:text-white disabled:opacity-30 disabled:hover:bg-white transition-all"
                >
                    SEND COMMAND
                </button>
            </form>
            {/* <div className="flex justify-between items-center text-slate-600 text-[9px] font-black uppercase tracking-[0.3em]">
                <div>STATUS: ENCRYPTED UPLINK ACTIVE</div>
                <div>SECURE SECTOR ACCESS // V2.0.4</div>
            </div> */}
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
