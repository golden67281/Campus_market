import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, MessageSquare, User } from 'lucide-react';
import useNotificationStore from '../../store/notificationStore';
import useAuthStore from '../../store/authStore';
import { getConversations } from '../../api/chatApi';

export default function BottomTabBar() {
  const { pathname } = useLocation();
  const { unreadCount } = useNotificationStore();
  const { user } = useAuthStore();

  const [unreadChats, setUnreadChats] = useState(0);

  useEffect(() => {
    if (!user) return;
    const checkUnread = async () => {
      try {
        const res = await getConversations();
        const total = res.data.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        setUnreadChats(total);
      } catch {}
    };
    checkUnread();
    const interval = setInterval(checkUnread, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const tabs = [
    { label: 'Home', path: user ? '/home' : '/', icon: Home },
    { label: 'Search', path: '/search', icon: Search },
    { label: 'Sell', path: '/sell', icon: PlusSquare },
    { label: 'Chats', path: '/chats', icon: MessageSquare, badge: unreadChats },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-gray-100/80 shadow-[0_12px_40px_rgba(0,0,0,0.06)] flex items-center justify-around h-16 px-3 rounded-2xl z-40 pb-safe transition-all duration-300">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.path;
        return (
          <Link 
            key={tab.label} 
            to={tab.path}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transform active:scale-95 transition-all duration-200 ${isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <div className="relative">
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
              {tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border border-white font-bold">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-semibold transition-all duration-200 ${isActive ? 'opacity-100 tracking-tight' : 'opacity-80'}`}>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
