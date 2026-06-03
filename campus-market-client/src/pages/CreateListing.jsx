import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MapPin, ToggleLeft, ToggleRight } from 'lucide-react';
import { createProduct, uploadImage } from '../api/productApi';
import useAuthStore from '../store/authStore';
import StepProgressBar from '../components/forms/StepProgressBar';
import ImageUploader from '../components/forms/ImageUploader';
import TagInput from '../components/forms/TagInput';
import Button from '../components/ui/Button';
import ConditionBadge from '../components/product/ConditionBadge';
import PageWrapper from '../components/layout/PageWrapper';
import { CATEGORIES, CONDITIONS } from '../utils/constants';
import { useLocation } from '../hooks/useLocation';
import { formatPrice } from '../utils/formatters';

const DRAFT_KEY = 'listing-draft';
const STEPS = ['Basic Info', 'Photos & Details', 'Location', 'Review & Post'];

const SUB_CATEGORIES = {
  books: ['Textbooks', 'Notes', 'Novels', 'Exam Guides'],
  electronics: ['Laptop', 'Phone', 'Tablet', 'Headphones', 'Camera', 'Other'],
  furniture: ['Chair', 'Table', 'Bed', 'Wardrobe', 'Other'],
};

const INITIAL = {
  title: '', category: '', subCategory: '', condition: '', price: '',
  isNegotiable: false, isFree: false, images: [], description: '', tags: [],
  location: '', meetingSpot: '', showWhatsapp: true, whatsappNumber: '',
};

export default function CreateListing() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { detect: detectGps, loading: gpsLoading } = useLocation();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) setHasDraft(true);
    // pre-fill from profile
    setForm((f) => ({ ...f, location: user?.area || '', whatsappNumber: user?.mobile || '' }));
  }, []);

  const set = (key, val) => {
    setForm((f) => {
      const updated = { ...f, [key]: val };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const restoreDraft = () => {
    try {
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEY));
      setForm(draft);
      setHasDraft(false);
      toast.success('Draft restored!');
    } catch { }
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.title || form.title.length < 5) e.title = 'Title must be at least 5 characters';
    if (!form.category) e.category = 'Category is required';
    if (!form.condition) e.condition = 'Condition is required';
    if (!form.isFree && (!form.price || form.price < 1)) e.price = 'Enter a valid price or mark as free';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (form.images.length === 0) e.images = 'Add at least one photo';
    if (!form.description || form.description.length < 20) e.description = 'Description must be at least 20 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setErrors({});
    setStep((s) => s + 1);
  };

  const handleGps = async () => {
    try {
      const { lat, lng } = await detectGps();
      set('lat', lat); set('lng', lng);
      set('location', `Detected (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
      toast.success('Location set!');
    } catch { toast.error('Could not detect location'); }
  };

  const handlePost = async () => {
    setSubmitting(true);
    try {
      // Upload images first
      const imageUrls = await Promise.all(
        form.images.map(async (img) => {
          if (typeof img === 'string') return img;
          const fd = new FormData(); fd.append('image', img);
          const res = await uploadImage(fd);
          return res.data.url;
        })
      );
      const payload = { ...form, images: imageUrls, price: form.isFree ? 0 : Number(form.price) };
      const res = await createProduct(payload);
      localStorage.removeItem(DRAFT_KEY);
      toast.success('✅ Your listing is live!');
      navigate(`/product/${res.data._id}`);
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to post listing'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="py-10 pb-20 md:pb-10">
      <PageWrapper className="max-w-2xl">
        {hasDraft && (
          <div className="mb-6 flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
            <p className="text-sm text-indigo-700">📝 You have a saved draft.</p>
            <div className="flex gap-2">
              <button onClick={restoreDraft} className="text-sm font-medium text-indigo-600 hover:underline">Resume</button>
              <button onClick={() => { localStorage.removeItem(DRAFT_KEY); setHasDraft(false); }} className="text-sm text-gray-400 hover:underline">Discard</button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold mb-6">Create Listing</h1>
          <StepProgressBar currentStep={step} totalSteps={4} labels={STEPS} />

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="label">Product Name *</label>
                <input className="input" placeholder="e.g. Engineering Drawing Set" value={form.title} onChange={(e) => set('title', e.target.value)} />
                {errors.title && <p className="error-text">{errors.title}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Category *</label>
                  <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                  </select>
                  {errors.category && <p className="error-text">{errors.category}</p>}
                </div>
                {SUB_CATEGORIES[form.category] && (
                  <div>
                    <label className="label">Sub-category</label>
                    <select className="input" value={form.subCategory} onChange={(e) => set('subCategory', e.target.value)}>
                      <option value="">Select...</option>
                      {SUB_CATEGORIES[form.category].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label className="label">Condition *</label>
                <div className="flex gap-3 flex-wrap">
                  {CONDITIONS.map((c) => (
                    <button key={c} type="button"
                      onClick={() => set('condition', c)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition ${form.condition === c ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                {errors.condition && <p className="error-text">{errors.condition}</p>}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label">Price (₹) *</label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <button type="button" onClick={() => set('isFree', !form.isFree)}>
                      {form.isFree ? <ToggleRight size={24} className="text-indigo-600" /> : <ToggleLeft size={24} className="text-gray-400" />}
                    </button>
                    Mark as Free
                  </label>
                </div>
                {!form.isFree && (
                  <input type="number" className="input" placeholder="e.g. 500" value={form.price} onChange={(e) => set('price', e.target.value)} />
                )}
                {errors.price && <p className="error-text">{errors.price}</p>}
                <label className="flex items-center gap-2 text-sm mt-2 cursor-pointer">
                  <button type="button" onClick={() => set('isNegotiable', !form.isNegotiable)}>
                    {form.isNegotiable ? <ToggleRight size={22} className="text-indigo-600" /> : <ToggleLeft size={22} className="text-gray-400" />}
                  </button>
                  <span className="text-gray-600">Price is negotiable</span>
                </label>
              </div>
              <Button variant="primary" className="w-full justify-center py-3" onClick={next}>Next →</Button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="label">Photos * <span className="font-normal text-gray-400">(first photo will be the cover)</span></label>
                <ImageUploader images={form.images} onAdd={(files) => set('images', [...form.images, ...files])} onRemove={(i) => set('images', form.images.filter((_, idx) => idx !== i))} />
                {errors.images && <p className="error-text">{errors.images}</p>}
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="label">Description *</label>
                  <span className="text-xs text-gray-400">{form.description.length} / 1000</span>
                </div>
                <textarea className="input" rows={5} placeholder="Describe your item — condition, what's included, why you're selling..." value={form.description} onChange={(e) => set('description', e.target.value.slice(0, 1000))} />
                {errors.description && <p className="error-text">{errors.description}</p>}
              </div>
              <div>
                <label className="label">Tags <span className="font-normal text-gray-400">(optional, up to 10)</span></label>
                <TagInput tags={form.tags} onChange={(t) => set('tags', t)} />
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(1)} className="flex-1 justify-center">← Back</Button>
                <Button variant="primary" onClick={next} className="flex-1 justify-center">Next →</Button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="label">Location</label>
                <div className="flex gap-2">
                  <input className="input flex-1" placeholder="e.g. Navrangpura, Ahmedabad" value={form.location} onChange={(e) => set('location', e.target.value)} />
                  <Button variant="secondary" onClick={handleGps} loading={gpsLoading}><MapPin size={16} /></Button>
                </div>
              </div>
              <div>
                <label className="label">Preferred Meeting Spot <span className="font-normal text-gray-400">(optional)</span></label>
                <input className="input" placeholder="e.g. College canteen, Main gate" value={form.meetingSpot} onChange={(e) => set('meetingSpot', e.target.value)} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="label">Show WhatsApp</label>
                  <button type="button" onClick={() => set('showWhatsapp', !form.showWhatsapp)}>
                    {form.showWhatsapp ? <ToggleRight size={24} className="text-indigo-600" /> : <ToggleLeft size={24} className="text-gray-400" />}
                  </button>
                </div>
                {form.showWhatsapp && (
                  <input className="input" placeholder="WhatsApp number" value={form.whatsappNumber} onChange={(e) => set('whatsappNumber', e.target.value)} />
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(2)} className="flex-1 justify-center">← Back</Button>
                <Button variant="primary" onClick={() => setStep(4)} className="flex-1 justify-center">Review →</Button>
              </div>
            </div>
          )}

          {/* Step 4 — Review */}
          {step === 4 && (
            <div className="space-y-5">
              <p className="text-sm text-gray-500 font-medium">Preview (as buyers will see it):</p>
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                {form.images[0] && (
                  <img src={typeof form.images[0] === 'string' ? form.images[0] : URL.createObjectURL(form.images[0])} alt="" className="w-full aspect-[4/3] object-cover" />
                )}
                <div className="p-5 space-y-2">
                  <h2 className="text-xl font-bold">{form.title}</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold">{form.isFree ? 'Free' : `₹ ${Number(form.price).toLocaleString('en-IN')}`}</span>
                    {form.isNegotiable && <span className="text-sm text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Negotiable</span>}
                  </div>
                  <ConditionBadge condition={form.condition} />
                  <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={14} />{form.location}</p>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{form.description}</p>
                  {form.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {form.tags.map((t) => <span key={t} className="text-xs bg-gray-100 px-2 py-1 rounded-full">{t}</span>)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(3)} className="flex-1 justify-center">← Edit</Button>
                <Button variant="primary" onClick={handlePost} loading={submitting} className="flex-1 justify-center py-3">
                  🚀 Post Listing
                </Button>
              </div>
            </div>
          )}
        </div>
      </PageWrapper>
    </div>
  );
}