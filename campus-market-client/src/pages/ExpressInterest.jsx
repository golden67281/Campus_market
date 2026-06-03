import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Copy, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProduct } from '../api/productApi';
import { expressInterest, getSellerContact } from '../api/interestApi';
import useAuthStore from '../store/authStore';
import StepProgressBar from '../components/forms/StepProgressBar';
import SafetyBanner from '../components/common/SafetyBanner';
import VerifiedBadge from '../components/common/VerifiedBadge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import PageWrapper from '../components/layout/PageWrapper';
import { formatPrice, initials } from '../utils/formatters';

const CHECKLIST = [
  'I will meet the seller in a public campus location',
  'I will not share my bank account details',
  'I will inspect the item before paying',
  "I understand Campus Market doesn't guarantee transactions",
  'I will report suspicious behavior',
];

export default function ExpressInterest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [product, setProduct] = useState(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ buyerName: '', buyerPhone: '', buyerArea: '', message: '' });
  const [checked, setChecked] = useState([]);
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProduct(id);
        setProduct(res.data);
        // Pre-fill from user profile
        setForm({
          buyerName: user?.name || '',
          buyerPhone: user?.mobile || '',
          buyerArea: user?.area || '',
          message: '',
        });
        // Check if already expressed interest
        if (res.data.userContact) { setContact(res.data.userContact); setStep(3); }
      } catch { navigate('/404'); }
      finally { setPageLoading(false); }
    };
    load();
  }, [id]);

  const handleSendInterest = async () => {
    setLoading(true);
    try {
      await expressInterest({ productId: id, ...form });
      setStep(2);
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to send interest'); }
    finally { setLoading(false); }
  };

  const handleRevealContact = async () => {
    setLoading(true);
    try {
      const res = await getSellerContact(id);
      setContact(res.data);
      setStep(3);
    } catch { toast.error('Failed to get contact info'); }
    finally { setLoading(false); }
  };

  const toggleCheck = (i) => {
    setChecked((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(contact?.phone || '');
    toast.success('Copied!');
  };

  if (pageLoading) return <div className="min-h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <PageWrapper className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <StepProgressBar currentStep={step} totalSteps={3} labels={['Confirm', 'Safety', 'Contact']} />

          {/* Step 1 */}
          {step === 1 && product && (
            <div className="space-y-5">
              <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {product.images?.[0] ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full text-2xl">📦</span>}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 line-clamp-2">{product.title}</p>
                  <p className="text-lg font-bold text-indigo-600 mt-1">{formatPrice(product.price, product.isFree)}</p>
                </div>
              </div>

              <p className="text-sm font-medium text-gray-500">Your contact info (shared with seller):</p>

              {[
                { label: 'Name', key: 'buyerName', placeholder: 'Your name' },
                { label: 'Phone', key: 'buyerPhone', placeholder: 'Your mobile number' },
                { label: 'Area', key: 'buyerArea', placeholder: 'Your locality' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <input className="input" placeholder={placeholder} value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}

              <div>
                <label className="label">Message to seller <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea className="input" rows={3} placeholder="Is this still available?" value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
              </div>

              <Button variant="primary" className="w-full justify-center py-3" onClick={handleSendInterest} loading={loading}>
                Send Interest →
              </Button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <span className="text-4xl">🛡️</span>
                <p className="font-semibold mt-2">Before we reveal the seller's contact:</p>
              </div>
              {CHECKLIST.map((item, i) => (
                <label key={i} className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition">
                  <input
                    type="checkbox"
                    checked={checked.includes(i)}
                    onChange={() => toggleCheck(i)}
                    className="mt-0.5 accent-indigo-600 w-4 h-4 flex-shrink-0"
                  />
                  <span className="text-sm text-gray-700">{item}</span>
                </label>
              ))}
              <Button
                variant="primary"
                className="w-full justify-center py-3 mt-4"
                onClick={handleRevealContact}
                disabled={checked.length < CHECKLIST.length}
                loading={loading}
              >
                Agree & See Contact Details
              </Button>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && contact && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">✅</span>
                </div>
                <p className="font-semibold text-gray-900">Seller has been notified!</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 overflow-hidden">
                  {contact.seller?.avatar ? <img src={contact.seller.avatar} alt="" className="w-full h-full object-cover" /> : initials(contact.seller?.name || 'S')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{contact.seller?.name}</p>
                    {contact.seller?.verified && <VerifiedBadge />}
                  </div>
                  <p className="text-sm text-gray-500">{contact.seller?.college}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Phone size={18} className="text-indigo-500" />
                    <span className="font-medium">{contact.phone}</span>
                  </div>
                  <button onClick={handleCopyPhone} className="flex items-center gap-1 text-sm text-indigo-600 hover:underline">
                    <Copy size={14} /> Copy
                  </button>
                </div>

                {contact.whatsapp && (
                  <a
                    href={`https://wa.me/91${contact.phone}?text=Hi, I'm interested in your ${product?.title} on Campus Market.`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition"
                  >
                    💬 Open in WhatsApp →
                  </a>
                )}

                {contact.meetingSpot && (
                  <p className="text-sm text-gray-500 text-center">📍 Preferred meeting: {contact.meetingSpot}</p>
                )}
              </div>

              <SafetyBanner />

              <div className="flex gap-3">
                <Link to={`/product/${id}`} className="flex-1">
                  <Button variant="secondary" className="w-full justify-center">← Back to Listing</Button>
                </Link>
                <Link to="/home" className="flex-1">
                  <Button variant="ghost" className="w-full justify-center">🏠 Home</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </PageWrapper>
    </div>
  );
}