import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Calendar, ChevronRight } from 'lucide-react';
import { getConversations } from '../api/chatApi';
import PageWrapper from '../components/layout/PageWrapper';
import Spinner from '../components/ui/Spinner';
import { formatPrice, initials, timeAgo } from '../utils/formatters';

export default function ChatList() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConvos = async () => {
      try {
        const res = await getConversations();
        setConversations(res.data);
      } catch (err) {
        console.error('Failed to load conversations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConvos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <PageWrapper className="py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
          <MessageSquare size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
          <p className="text-xs text-gray-400">Your conversations with buyers & sellers</p>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="glass-card text-center py-16 px-6 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4">💬</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No chats yet</h3>
          <p className="text-sm text-gray-400 max-w-sm">
            When you contact a seller or a buyer messages you about a listing, the chat will show up here.
          </p>
          <Link to="/home" className="mt-6 inline-flex items-center justify-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition shadow-sm">
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((convo) => {
            const partner = convo.partner;
            const product = convo.product;
            const lastMsg = convo.lastMessage;
            const hasUnread = convo.unreadCount > 0;

            return (
              <Link
                key={`${convo.productId}_${convo.partnerId}`}
                to={`/chat/${convo.productId}/${convo.partnerId}`}
                className={`block glass-card p-4 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:scale-[1.01] active:scale-100 transition-all duration-300 ${
                  hasUnread ? 'border-l-4 border-l-indigo-600 pl-3.5 bg-indigo-50/10' : ''
                }`}
              >
                <div className="flex gap-4 items-center">
                  {/* Partner Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 border border-gray-100/50 flex items-center justify-center text-indigo-700 font-bold text-sm overflow-hidden shadow-sm">
                      {partner.avatar ? (
                        <img src={partner.avatar} alt={partner.name} className="w-full h-full object-cover" />
                      ) : (
                        initials(partner.name || 'U')
                      )}
                    </div>
                    {hasUnread && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border border-white font-bold animate-pulse">
                        {convo.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2 mb-0.5">
                      <p className="font-semibold text-gray-900 text-sm truncate">{partner.name}</p>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {timeAgo(lastMsg.createdAt)}
                      </span>
                    </div>

                    {/* Listing reference info */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                      <span className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded font-medium truncate max-w-[150px]">
                        {product.title}
                      </span>
                      <span>·</span>
                      <span className="font-bold text-gray-700">{formatPrice(product.price)}</span>
                    </div>

                    {/* Last message text preview */}
                    <p className={`text-xs truncate ${hasUnread ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                      {lastMsg.senderId === convo.partnerId ? '' : 'You: '}
                      {lastMsg.text}
                    </p>
                  </div>

                  {/* Navigation arrow */}
                  <div className="text-gray-300">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}
