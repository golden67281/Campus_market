import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit2 } from 'lucide-react';
import { getMe } from '../api/userApi';
import { getMyInterests } from '../api/interestApi';
import { getWishlist } from '../api/wishlistApi';
import useAuthStore from '../store/authStore';
import ProductGrid from '../components/product/ProductGrid';
import VerifiedBadge from '../components/common/VerifiedBadge';
import PageWrapper from '../components/layout/PageWrapper';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { formatDate, initials, timeAgo } from '../utils/formatters';

const TABS = ['Overview', 'My Listings', 'My Interests', 'Wishlist'];

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [interests, setInterests] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [meRes, intRes, wlRes] = await Promise.all([getMe(), getMyInterests(), getWishlist()]);
        setProfile(meRes.data);
        setInterests(intRes.data || []);
        setWishlist(wlRes.data || []);
        updateUser(meRes.data);
      } catch { }
      finally { setLoading(false); }
    };
    loadAll();
  }, []);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;

  const p = profile || user;

  return (
    <div className="pb-20 md:pb-0">
      <PageWrapper className="py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            <div className="w-20 h-20 rounded-full bg-indigo-100 overflow-hidden flex items-center justify-center flex-shrink-0">
              {p?.avatar ? (
                <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-indigo-700">{initials(p?.name || 'U')}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-gray-900">{p?.name}</h1>
                    {p?.verified && <VerifiedBadge />}
                  </div>
                  <p className="text-gray-500">@{p?.username}</p>
                  <div className="text-sm text-gray-500 space-y-0.5 mt-1">
                    <p>🎓 {p?.college} · {p?.year} · {p?.department}</p>
                    <p>📍 {p?.city || p?.area}</p>
                    <p>📅 Member since {formatDate(p?.createdAt)}</p>
                  </div>
                </div>
                <Link to="/profile/edit">
                  <Button variant="secondary">
                    <Edit2 size={16} /> Edit Profile
                  </Button>
                </Link>
              </div>
              <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="font-bold text-lg">{p?.listingCount || 0}</p>
                  <p className="text-xs text-gray-500">Listings</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">{p?.totalViews || 0}</p>
                  <p className="text-xs text-gray-500">Views</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">{p?.dealsCount || 0}</p>
                  <p className="text-xs text-gray-500">Deals</p>
                </div>
              </div>
            </div>
          </div>

          {/* College email verification */}
          {!p?.verified && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
              <p className="text-sm text-gray-600">🎓 Verify your college email to get a <strong>Verified Student</strong> badge.</p>
              <Link to="/profile/edit"><Button variant="secondary">Verify Now</Button></Link>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium transition whitespace-nowrap border-b-2 -mb-px ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === 'Overview' && (
          <div>
            {profile?.recentListings?.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-gray-800">Recent Listings</h2>
                  <Link to="/my-listings" className="text-sm text-indigo-600 hover:underline">View all →</Link>
                </div>
                <ProductGrid products={profile.recentListings.slice(0, 3)} loading={false} />
              </>
            ) : (
              <EmptyState icon="📦" title="No listings yet" description="Start selling on Campus Market today!"
                action={<Link to="/sell"><Button>+ Post First Listing</Button></Link>} />
            )}
          </div>
        )}

        {/* Tab: My Listings */}
        {activeTab === 'My Listings' && (
          <div className="text-center py-8">
            <Link to="/my-listings"><Button variant="primary">Go to My Listings →</Button></Link>
          </div>
        )}

        {/* Tab: My Interests */}
        {activeTab === 'My Interests' && (
          interests.length === 0 ? (
            <EmptyState icon="🛒" title="No interests yet" description="You haven't contacted any sellers yet." />
          ) : (
            <div className="space-y-3">
              {interests.map((interest) => (
                <Link key={interest._id} to={`/product/${interest.productId}`}
                  className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition">
                  <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {interest.product?.images?.[0] && <img src={interest.product.images[0]} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{interest.product?.title}</p>
                    <p className="text-sm text-indigo-600">₹ {interest.product?.price}</p>
                    <p className="text-xs text-gray-400">{timeAgo(interest.createdAt)}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full self-start font-medium ${interest.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {interest.status || 'Active'}
                  </span>
                </Link>
              ))}
            </div>
          )
        )}

        {/* Tab: Wishlist */}
        {activeTab === 'Wishlist' && (
          wishlist.length === 0 ? (
            <EmptyState icon="❤️" title="Wishlist is empty" description="Save products you like to view them later." />
          ) : (
            <ProductGrid products={wishlist.map((w) => w.product).filter(Boolean)} loading={false} />
          )
        )}
      </PageWrapper>
    </div>
  );
}