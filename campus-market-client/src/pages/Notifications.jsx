import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markAllRead, markOneRead } from '../api/notificationApi';
import useNotificationStore from '../store/notificationStore';
import PageWrapper from '../components/layout/PageWrapper';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { timeAgo } from '../utils/formatters';

const TYPE_ICONS = {
  buyer_interest: '👤',
  listing_views: '🔥',
  wishlist_save: '❤️',
  welcome: '🎉',
  listing_expire: '⏰',
  report_resolved: '✅',
};

const groupByDate = (notifications) => {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  return notifications.reduce((acc, n) => {
    const d = new Date(n.createdAt).toDateString();
    const key = d === today ? 'Today' : d === yesterday ? 'Yesterday' : d;
    acc[key] = acc[key] ? [...acc[key], n] : [n];
    return acc;
  }, {});
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setNotifications: setStore, markAllRead: markStoreRead } = useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => {
    getNotifications()
      .then((res) => {
        const data = res.data || [];
        setNotifications(data);
        setStore(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAll = async () => {
    try {
      await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      markStoreRead();
    } catch { }
  };

  const handleClick = async (n) => {
    if (!n.read) {
      try {
        await markOneRead(n._id);
        setNotifications((prev) => prev.map((x) => x._id === n._id ? { ...x, read: true } : x));
      } catch { }
    }
    if (n.link) navigate(n.link);
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;

  const grouped = groupByDate(notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="pb-20 md:pb-0">
      <PageWrapper className="py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Button variant="ghost" onClick={handleMarkAll}>Mark all as read</Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <EmptyState icon="🔔" title="No notifications yet" description="When something happens, we'll let you know here." />
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{date}</p>
                <div className="space-y-2">
                  {items.map((n) => (
                    <button
                      key={n._id}
                      onClick={() => handleClick(n)}
                      className={`w-full flex items-start gap-3 p-4 rounded-xl text-left transition ${n.read ? 'bg-white border border-gray-100' : 'bg-indigo-50 border border-indigo-100'}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                        {n.senderAvatar ? (
                          <img src={n.senderAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          TYPE_ICONS[n.type] || '🔔'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${n.read ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>{n.message}</p>
                        {n.subMessage && <p className="text-xs text-gray-400 mt-0.5 italic">"{n.subMessage}"</p>}
                        <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-2" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </PageWrapper>
    </div>
  );
}