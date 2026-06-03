import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { getChatHistory, sendMessage } from '../api/chatApi';
import useAuthStore from '../store/authStore';
import PageWrapper from '../components/layout/PageWrapper';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { formatPrice, initials } from '../utils/formatters';

export default function ChatRoom() {
  const { productId, partnerId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [chatData, setChatData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Initial history fetch
    loadHistory(true);

    // Set up background polling every 4 seconds for "live" messages
    const interval = setInterval(() => {
      loadHistory(false);
    }, 4000);

    return () => clearInterval(interval);
  }, [productId, partnerId]);

  const loadHistory = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await getChatHistory(productId, partnerId);
      setChatData(res.data);
      setMessages(res.data.messages);
      
      // Auto-scroll on initial load or if new messages arrive
      if (showLoading || res.data.messages.length !== messages.length) {
        setTimeout(scrollToBottom, 50);
      }
    } catch (err) {
      console.error('Failed to load chat history', err);
      if (showLoading) navigate('/chats');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;

    setSending(true);
    try {
      const payload = {
        productId,
        receiverId: partnerId,
        text: text.trim()
      };
      const res = await sendMessage(payload);
      
      // Clear input and append new message instantly
      setText('');
      setMessages((prev) => [...prev, res.data]);
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!chatData) return null;

  const { partner, product } = chatData;
  const isSold = product?.status === 'sold';

  return (
    <PageWrapper className="py-4 max-w-2xl h-[calc(100vh-5rem)] flex flex-col">
      {/* Header Panel */}
      <div className="glass-card p-3 flex items-center gap-3 mb-3 shrink-0 rounded-2xl">
        <Link to="/chats" className="p-2 text-gray-500 hover:bg-gray-50 rounded-full shrink-0">
          <ArrowLeft size={18} />
        </Link>

        {/* Partner Info */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-indigo-50 border border-gray-100 flex items-center justify-center font-bold text-indigo-700 text-xs overflow-hidden shrink-0">
            {partner.avatar ? <img src={partner.avatar} alt="" className="w-full h-full object-cover" /> : initials(partner.name || 'U')}
          </div>
          <div className="truncate">
            <h2 className="font-semibold text-gray-900 text-sm truncate leading-tight">{partner.name}</h2>
            <p className="text-[10px] text-gray-400 leading-tight">@{partner.username}</p>
          </div>
        </div>

        {/* Product Reference */}
        {product && (
          <Link to={`/product/${product._id}`} className="flex items-center gap-2 p-1.5 bg-gray-50 hover:bg-gray-100/80 rounded-xl max-w-[180px] sm:max-w-[220px] transition shrink-0">
            <div className="w-8 h-8 bg-gray-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
              {product.images?.[0] ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" /> : <span className="text-xs">📦</span>}
            </div>
            <div className="truncate text-left">
              <p className="text-[10px] font-semibold text-gray-900 truncate leading-none mb-0.5">{product.title}</p>
              <p className="text-[10px] font-bold text-indigo-600 leading-none">{formatPrice(product.price)}</p>
            </div>
          </Link>
        )}
      </div>

      {/* Messages Scrolling Container */}
      <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-4 overflow-y-auto space-y-3 mb-3 min-h-0 shadow-sm scrollbar-thin">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-8">
            <span className="text-3xl mb-2">👋</span>
            <p className="text-sm font-semibold text-gray-700">Say hello!</p>
            <p className="text-xs max-w-xs mt-1">Start your conversation about this listing. Ask about condition, meeting spots, or availability.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user._id;
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="break-words leading-relaxed">{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      isMe ? 'text-indigo-200' : 'text-gray-400'
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Panel */}
      <form onSubmit={handleSend} className="flex gap-2 shrink-0">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isSold ? "This item is sold" : "Type a message..."}
          disabled={isSold}
          className="flex-1 input rounded-full py-3 px-5 text-sm border-gray-200/80 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400"
        />
        <Button
          type="submit"
          variant="primary"
          disabled={!text.trim() || sending || isSold}
          className="rounded-full w-12 h-12 p-0 flex items-center justify-center shrink-0 shadow-md"
        >
          <Send size={18} />
        </Button>
      </form>
    </PageWrapper>
  );
}
