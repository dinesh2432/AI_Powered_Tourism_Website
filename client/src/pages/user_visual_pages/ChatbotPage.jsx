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
    <div
      className="flex flex-col relative overflow-hidden"
      style={{
        height: 'calc(100vh - 64px)',
        background: 'var(--bg-primary)',
        fontFamily: "'Inter', 'Outfit', sans-serif",
      }}
    >
      {/* ── Header ── */}
      <div
        className="px-6 md:px-10 py-5 z-10 flex items-center gap-5"
        style={{
          background: 'var(--navbar-bg)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0"
          style={{ background: `rgb(var(--accent))` }}
        >
          AI
        </div>
        <div>
          <h1
            className="font-black text-sm uppercase tracking-widest leading-none mb-1"
            style={{ color: `rgb(var(--accent))` }}
          >
            AI Travel Assistant
          </h1>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Online · Ready to help
            </span>
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div
        className="flex-1 overflow-y-auto px-4 md:px-10 py-8 no-scrollbar"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div className="max-w-3xl mx-auto space-y-8">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12, x: msg.role === 'user' ? 12 : -12 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.35 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0"
                  style={
                    msg.role === 'user'
                      ? { background: `rgb(var(--accent))`, color: '#fff' }
                      : { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }
                  }
                >
                  {msg.role === 'user'
                    ? (user?.name?.charAt(0).toUpperCase() || 'U')
                    : 'AI'}
                </div>

                {/* Bubble */}
                <div
                  className="max-w-[75%] px-5 py-4 rounded-2xl text-sm leading-relaxed"
                  style={
                    msg.role === 'user'
                      ? {
                          background: `rgba(var(--accent), 0.12)`,
                          color: 'var(--text-primary)',
                          border: `1px solid rgba(var(--accent), 0.25)`,
                        }
                      : {
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                        }
                  }
                >
                  <div
                    className="text-[10px] font-bold uppercase tracking-wider mb-2 opacity-50"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {msg.role === 'user' ? (user?.name?.split(' ')[0] || 'You') : 'AI Assistant'}
                  </div>
                  {msg.content.split('\n').map((line, j) => (
                    <p key={j} className={j > 0 && line ? 'mt-2' : j > 0 ? 'mt-1' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0"
                style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
              >
                AI
              </div>
              <div
                className="px-5 py-4 rounded-2xl flex items-center gap-3"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full animate-bounce"
                  style={{ background: `rgb(var(--accent))`, animationDelay: '0ms' }}
                />
                <span
                  className="inline-block w-2 h-2 rounded-full animate-bounce"
                  style={{ background: `rgb(var(--accent))`, animationDelay: '150ms' }}
                />
                <span
                  className="inline-block w-2 h-2 rounded-full animate-bounce"
                  style={{ background: `rgb(var(--accent))`, animationDelay: '300ms' }}
                />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input Section ── */}
      <div
        className="z-10 px-4 md:px-10 py-6"
        style={{
          background: 'var(--navbar-bg)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Suggestion chips (only on first message) */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 4).map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-4 py-2 rounded-xl transition-all duration-200 font-medium hover:-translate-y-0.5"
                  style={{
                    background: 'var(--bg-card)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `rgba(var(--accent), 0.4)`;
                    e.currentTarget.style.color = `rgb(var(--accent))`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input form */}
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 input-field h-12 text-sm"
              placeholder="Ask anything about travel…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-primary h-12 px-6 text-sm whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Send →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
