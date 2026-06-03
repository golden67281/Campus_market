import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMyListings } from '../api/userApi';
import { markSold, deleteProduct, renewListing } from '../api/productApi';
import { getProductInterests } from '../api/interestApi';
import PageWrapper from '../components/layout/PageWrapper';
import ConditionBadge from '../components/product/ConditionBadge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { formatPrice, timeAgo } from '../utils/formatters';
import { Eye, Heart, MessageCircle, Edit2, Trash2, CheckCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

const TABS = ['Active', 'Sold', 'Drafts'];

export default function MyListings() {
  const [activeTab, setActiveTab] = useState('Active');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [buyersMap, setBuyersMap] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, type: '' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { loadListings(); }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      const res = await getMyListings();
      setListings(res.data || []);
    } catch { }
    finally { setLoading(false); }
  };

  const filtered = listings.filter((l) => {
    if (activeTab === 'Active') return l.status === 'active';
    if (activeTab === 'Sold') return l.status === 'sold';
    if (activeTab === 'Drafts') return l.status === 'draft';
    return true;
  });

  const handleMarkSold = async () => {
    setActionLoading(true);
    try {
      await markSold(confirmDialog.id);
      setListings((prev) => prev.map((l) => l._id === confirmDialog.id ? { ...l, status: 'sold' } : l));
      toast.success('Marked as sold');
    } catch { toast.error('Failed'); }
    finally { setActionLoading(false); setConfirmDialog({ open: false, id: null, type: '' }); }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteProduct(confirmDialog.id);
      setListings((prev) => prev.filter((l) => l._id !== confirmDialog.id));
      toast.success('Listing removed');
    } catch { toast.error('Failed'); }
    finally { setActionLoading(false); setConfirmDialog({ open: false, id: null, type: '' }); }
  };

  const handleRenew = async (id) => {
    try {
      await renewListing(id);
      toast.success('Listing renewed for 30 days');
    } catch { toast.error('Failed to renew'); }
  };

  const toggleBuyers = async (id) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (!buyersMap[id]) {
      try {
        const res = await getProductInterests(id);
        setBuyersMap((m) => ({ ...m, [id]: res.data || [] }));
      } catch { setBuyersMap((m) => ({ ...m, [id]: [] })); }
    }
  };

  const onConfirm = () => {
    if (confirmDialog.type === 'sold') handleMarkSold();
    if (confirmDialog.type === 'delete') handleDelete();
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="pb-20 md:pb-0">
      <PageWrapper className="py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Listings</h1>
          <Link to="/sell"><Button variant="primary">+ New Listing</Button></Link>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 mb-6">
          {TABS.map((tab) => {
            const count = listings.filter((l) =>
              tab === 'Active' ? l.status === 'active' : tab === 'Sold' ? l.status === 'sold' : l.status === 'draft'
            ).length;
            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}>
                {tab} ({count})
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={activeTab === 'Active' ? '📦' : activeTab === 'Sold' ? '🤝' : '✏️'}
            title={activeTab === 'Active' ? "No active listings" : activeTab === 'Sold' ? "No sold items yet" : "No drafts saved"}
            description={activeTab === 'Active' ? "Start selling today!" : ""}
            action={activeTab === 'Active' ? <Link to="/sell"><Button>+ Post First Listing</Button></Link> : null}
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((listing) => (
              <div key={listing._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-4 flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    {listing.images?.[0] && <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/product/${listing._id}`} className="font-semibold text-gray-900 hover:text-indigo-600 truncate">
                        {listing.title}
                      </Link>
                      <ConditionBadge condition={listing.condition} />
                    </div>
                    <p className="text-lg font-bold text-indigo-600 mt-0.5">{formatPrice(listing.price, listing.isFree)}</p>
                    <p className="text-xs text-gray-400">Posted {timeAgo(listing.createdAt)}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Eye size={12} /> {listing.views || 0}</span>
                      <span className="flex items-center gap-1"><Heart size={12} /> {listing.wishlistCount || 0}</span>
                      <button
                        onClick={() => toggleBuyers(listing._id)}
                        className="flex items-center gap-1 hover:text-indigo-600 transition"
                      >
                        <MessageCircle size={12} /> {listing.interestCount || 0} interested
                        {expandedId === listing._id ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                      </button>
                    </div>
                    {/* Action buttons */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {listing.status === 'active' && (
                        <>
                          <Link to={`/sell?edit=${listing._id}`}>
                            <Button variant="secondary" className="text-xs py-1.5 px-3">
                              <Edit2 size={13} /> Edit
                            </Button>
                          </Link>
                          <Button variant="secondary" className="text-xs py-1.5 px-3"
                            onClick={() => setConfirmDialog({ open: true, id: listing._id, type: 'sold' })}>
                            <CheckCircle size={13} /> Mark Sold
                          </Button>
                          <Button onClick={() => handleRenew(listing._id)} variant="ghost" className="text-xs py-1.5 px-3">
                            <RefreshCw size={13} /> Renew
                          </Button>
                        </>
                      )}
                      <Button variant="danger" className="text-xs py-1.5 px-3"
                        onClick={() => setConfirmDialog({ open: true, id: listing._id, type: 'delete' })}>
                        <Trash2 size={13} /> Delete
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Interested Buyers Expanded */}
                {expandedId === listing._id && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-500 mb-3">Interested Buyers</p>
                    {!buyersMap[listing._id] ? (
                      <Spinner size="sm" />
                    ) : buyersMap[listing._id].length === 0 ? (
                      <p className="text-sm text-gray-400">No buyers yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {buyersMap[listing._id].map((b, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0">
                              {b.buyer?.name?.[0] || 'B'}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{b.buyer?.name} · {b.buyer?.college}</p>
                              {b.message && <p className="text-xs text-gray-500 italic">"{b.message}"</p>}
                              <p className="text-xs text-gray-400">📞 {b.buyerPhone} · {timeAgo(b.createdAt)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </PageWrapper>

      <ConfirmDialog
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, id: null, type: '' })}
        onConfirm={onConfirm}
        loading={actionLoading}
        title={confirmDialog.type === 'delete' ? 'Delete Listing?' : 'Mark as Sold?'}
        message={confirmDialog.type === 'delete' ? 'This will permanently remove the listing.' : 'This will mark the listing as sold and hide it from buyers.'}
        confirmText={confirmDialog.type === 'delete' ? 'Delete' : 'Mark as Sold'}
        danger={confirmDialog.type === 'delete'}
      />
    </div>
  );
}