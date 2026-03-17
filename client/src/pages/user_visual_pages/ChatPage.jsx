import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ChatPage = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [msgsRes] = await Promise.all([
          api.get(`/chat/${userId}`),
        ]);
        setMessages(msgsRes.data.messages);
        if (msgsRes.data.messages.length > 0) {
          const lastMsg = msgsRes.data.messages[0];
          const other = lastMsg.senderId?._id === user._id ? lastMsg.receiverId : lastMsg.senderId;
          setOtherUser(other);
        }
      } catch {
        toast.error('Could not load chat');
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 5000); // Polling every 5 seconds
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    try {
      await api.post('/chat/send', { receiverId: userId, originalText: input.trim() });
      setInput('');
      const { data } = await api.get(`/chat/${userId}`);
      setMessages(data.messages);
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const isMe = (msg) => msg.senderId?._id === user._id || msg.senderId === user._id;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Chat header */}
      <div className="sticky top-16 bg-slate-900/90 backdrop-blur-sm border-b border-slate-800 px-4 py-3 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center font-bold">
            {otherUser?.name?.charAt(0) || '?'}
          </div>
          <div>
            <h2 className="text-white font-semibold">{otherUser?.name || 'Chat'}</h2>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-xs text-slate-400">Active</span>
            </div>
          </div>
          <div className="ml-auto text-xs text-primary-400 bg-primary-500/10 rounded-full px-3 py-1">
            🌐 AI Translation Active
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {loading ? (
            <div className="text-center text-slate-400 mt-24">
              <div className="text-4xl animate-pulse mb-2">💬</div>
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-slate-400 mt-24">
              <div className="text-6xl mb-3">👋</div>
              <p>Start the conversation! Messages are automatically translated.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const mine = isMe(msg);
              return (
                <div key={msg._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs sm:max-w-sm ${mine ? 'order-2' : 'order-1'}`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm ${
                      mine ? 'bg-primary-500 text-white rounded-br-sm' : 'bg-slate-800 text-slate-200 rounded-bl-sm'
                    }`}>
                      <p>{mine ? msg.originalText : (msg.translatedText || msg.originalText)}</p>
                    </div>
                    {!mine && msg.translatedText && msg.translatedText !== msg.originalText && (
                      <div className="mt-1 px-4 py-2 bg-slate-700/50 rounded-lg text-xs text-slate-400 italic">
                        Original: "{msg.originalText}"
                      </div>
                    )}
                    <p className={`text-xs text-slate-500 mt-1 ${mine ? 'text-right' : ''}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-slate-900/90 backdrop-blur-sm border-t border-slate-800 p-4">
        <form onSubmit={handleSend} className="max-w-2xl mx-auto flex gap-3">
          <input
            type="text"
            className="input-field flex-1"
            placeholder="Type a message... (will be auto-translated)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
          />
          <button type="submit" disabled={sending || !input.trim()} className="btn-primary px-5 py-3">
            {sending ? '⏳' : '➤'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
