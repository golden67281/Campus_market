import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, Flag, MapPin, Eye, Clock, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProduct, incrementView } from '../api/productApi';
import { addToWishlist, removeFromWishlist } from '../api/wishlistApi';
import { reportListing } from '../api/userApi';
import useAuthStore from '../store/authStore';
import ProductImageGallery from '../components/product/ProductImageGallery';
import SellerCard from '../components/seller/SellerCard';
import ConditionBadge from '../components/product/ConditionBadge';
import SafetyBanner from '../components/common/SafetyBanner';
import ProductGrid from '../components/product/ProductGrid';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import PageWrapper from '../components/layout/PageWrapper';
import Spinner from '../components/ui/Spinner';
import { formatPrice, timeAgo } from '../utils/formatters';
import { REPORT_REASONS } from '../utils/constants';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportOther, setReportOther] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    loadProduct();
    incrementView(id).catch(() => {});
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const res = await getProduct(id);
      setProduct(res.data);
    } catch { navigate('/404'); }
    finally { setLoading(false); }
  };

  const handleWishlist = async () => {
    if (!user) { setLoginModalOpen(true); return; }
    try {
      if (saved) { await removeFromWishlist(id); setSaved(false); toast('Removed from wishlist'); }
      else { await addToWishlist(id); setSaved(true); toast.success('❤️ Added to wishlist'); }
    } catch { toast.error('Something went wrong'); }
  };

  const handleContact = () => {
    if (!user) { setLoginModalOpen(true); return; }
    // Use sellerId as fallback in case seller._id is null (MongoDB migration edge case)
    const sellerId = product.seller?._id || product.sellerId;
    if (!sellerId) { toast.error('Seller information unavailable'); return; }
    navigate(`/chat/${product._id}/${sellerId}`);
  };

  const handleReport = async () => {
    setReportLoading(true);
    try {
      await reportListing(id, { reason: reportReason === 'Other' ? reportOther : reportReason });
      toast.success("Thanks for reporting. We'll review within 24 hours.");
      setReportOpen(false);
    } catch { toast.error('Failed to submit report'); }
    finally { setReportLoading(false); }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  if (!product) return null;

  const isOwn = user?._id === product.seller?._id;
  const isSold = product.status === 'sold';

  return (
    <PageWrapper className="py-8">
      {/* Status banners */}
      {isSold && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
          🔴 This item has been sold.
        </div>
      )}
      {product.status === 'flagged' && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl text-sm font-medium">
          🟡 This listing is under review by our team.
        </div>
      )}

      <div className="grid lg:grid-cols-[55%_45%] gap-8 mb-10">
        {/* Left: Gallery */}
        <div>
          <ProductImageGallery images={product.images || []} />
        </div>

        {/* Right: Info */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price, product.isFree)}</span>
            {product.isNegotiable && (
              <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Negotiable</span>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <ConditionBadge condition={product.condition} />
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Tag size={14} /> {product.category}
            </span>
          </div>

          <div className="space-y-1.5 text-sm text-gray-500">
            <p className="flex items-center gap-2"><MapPin size={14} className="text-indigo-500" /> {product.college} · {product.city}</p>
            <p className="flex items-center gap-2"><Clock size={14} /> Posted {timeAgo(product.createdAt)}</p>
            <p className="flex items-center gap-2"><Eye size={14} /> {product.views || 0} views</p>
          </div>

          <SellerCard seller={product.seller} />

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleWishlist}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium transition ${
                saved ? 'border-red-400 text-red-500 bg-red-50' : 'border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-400'
              }`}
            >
              <Heart size={18} className={saved ? 'fill-red-500' : ''} />
              {saved ? 'Saved to Wishlist' : 'Save to Wishlist'}
            </button>

            {!isOwn ? (
              <Button
                variant="primary"
                className="w-full justify-center py-3 text-base"
                onClick={handleContact}
                disabled={isSold}
              >
                {isSold ? 'Item Sold' : '💬 Contact Seller'}
              </Button>
            ) : (
              <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm px-4 py-3 rounded-xl text-center font-medium">
                📦 This is your listing
              </div>
            )}

            {!isOwn && (
              <button
                onClick={() => setReportOpen(true)}
                className="w-full text-sm text-gray-400 hover:text-red-500 flex items-center justify-center gap-1.5 transition"
              >
                <Flag size={14} /> Report Listing
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-3">📝 Description</h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>
        {product.tags?.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">🏷️ Tags</h3>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        )}
        <SafetyBanner />
      </div>

      {/* Report Modal */}
      <Modal isOpen={reportOpen} onClose={() => setReportOpen(false)} title="🚩 Report Listing">
        <div className="space-y-3">
          {REPORT_REASONS.map((r) => (
            <label key={r} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="reason" value={r} checked={reportReason === r} onChange={() => setReportReason(r)} className="accent-indigo-600" />
              <span className="text-sm text-gray-700">{r}</span>
            </label>
          ))}
          {reportReason === 'Other' && (
            <textarea className="input text-sm" rows={3} placeholder="Please describe the issue..." value={reportOther} onChange={(e) => setReportOther(e.target.value)} />
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setReportOpen(false)} className="flex-1 justify-center">Cancel</Button>
            <Button variant="danger" onClick={handleReport} loading={reportLoading} disabled={!reportReason} className="flex-1 justify-center">
              Submit Report
            </Button>
          </div>
        </div>
      </Modal>

      {/* Login Modal */}
      <Modal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} title="Login to continue">
        <p className="text-sm text-gray-500 mb-6">You need to be logged in to use this feature.</p>
        <div className="flex gap-3">
          <Link to="/login" className="flex-1"><Button variant="secondary" className="w-full justify-center">Login</Button></Link>
          <Link to="/signup" className="flex-1"><Button variant="primary" className="w-full justify-center">Sign Up</Button></Link>
        </div>
      </Modal>
    </PageWrapper>
  );
}