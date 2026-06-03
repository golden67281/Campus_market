import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, MapPin, MessageCircle, Zap, Search, Bell,
  Package, Star, TrendingUp, Users, Heart, BookOpen, ChevronRight
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';

/* ─── Intersection Observer hook for scroll-reveal ─── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ─── Animated counter ─── */
function Counter({ to, suffix = '' }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView(0.5);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(to / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(start);
    }, 20);
    return () => clearInterval(timer);
  }, [inView, to]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─── Reveal wrapper ─── */
function Reveal({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─── Data ─── */
const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Verified Students Only',
    desc: 'Every account on Campus Market is tied to a real student profile. College email verification ensures you only deal with genuine fellow students.',
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    icon: MapPin,
    title: 'Hyperlocal Discovery',
    desc: 'See listings from your own campus first. Our geo-based radius filter shows products closest to you, making meet-ups fast and easy.',
    gradient: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
  },
  {
    icon: MessageCircle,
    title: 'In-App Direct Chat',
    desc: 'No sharing phone numbers with strangers. Our built-in chat lets buyers and sellers negotiate safely inside the app.',
    gradient: 'from-green-500 to-emerald-500',
    bg: 'bg-green-50',
    border: 'border-green-100',
  },
  {
    icon: Zap,
    title: 'List in 2 Minutes',
    desc: 'Upload up to 6 photos, add a description, set your price and location — your listing is live in under 2 minutes.',
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
  {
    icon: Search,
    title: 'Smart Filters & Search',
    desc: 'Filter by category, price range, condition (New / Like New / Good / Fair), and distance radius. Find exactly what you need instantly.',
    gradient: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
  },
  {
    icon: Bell,
    title: 'Real-Time Notifications',
    desc: 'Instant in-app alerts when someone messages you, shows interest in your listing, or your item gets a new view.',
    gradient: 'from-indigo-500 to-blue-500',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
  },
  {
    icon: Heart,
    title: 'Wishlist & Saves',
    desc: 'Save any listing to your personal wishlist and revisit whenever you\'re ready to buy. Never lose track of a good deal.',
    gradient: 'from-red-500 to-rose-500',
    bg: 'bg-red-50',
    border: 'border-red-100',
  },
  {
    icon: Package,
    title: 'My Listings Dashboard',
    desc: 'Manage all your active, sold, and draft listings in one place. Renew listings, mark as sold, edit details, or delete — all in a tap.',
    gradient: 'from-teal-500 to-cyan-600',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
  },
  {
    icon: Star,
    title: 'Condition Badges',
    desc: 'Every listing shows a clear condition badge — New, Like New, Good, or Fair. Buyers always know exactly what they\'re getting.',
    gradient: 'from-yellow-500 to-amber-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-100',
  },
];

const STEPS = [
  { emoji: '🎓', step: '01', title: 'Sign Up Free', desc: 'Create your account with your mobile number, set your college and location details.' },
  { emoji: '✅', step: '02', title: 'Verify Your Identity', desc: 'Add your college email to earn the Verified Student badge and build instant trust.' },
  { emoji: '📸', step: '03', title: 'Post Your Listing', desc: 'Upload photos, write a description, set your price and condition. Done in 2 minutes.' },
  { emoji: '💬', step: '04', title: 'Chat with Buyers', desc: 'Interested buyers message you directly inside the app — no phone numbers exchanged.' },
  { emoji: '🤝', step: '05', title: 'Meet & Close the Deal', desc: 'Meet on campus, hand over the item, get paid — simple, safe, and student-friendly.' },
];

const CATEGORIES = [
  { emoji: '📚', label: 'Books & Stationery' },
  { emoji: '💻', label: 'Electronics' },
  { emoji: '🪑', label: 'Furniture' },
  { emoji: '👗', label: 'Clothing' },
  { emoji: '🎸', label: 'Instruments' },
  { emoji: '🏋️', label: 'Sports Gear' },
  { emoji: '🍳', label: 'Kitchen Items' },
  { emoji: '🧪', label: 'Lab Equipment' },
  { emoji: '📐', label: 'Stationery' },
  { emoji: '📦', label: 'Other Items' },
];

const STATS = [
  { value: 120, suffix: '+', label: 'Colleges', icon: BookOpen, color: 'text-indigo-600' },
  { value: 3400, suffix: '+', label: 'Listings', icon: Package, color: 'text-violet-600' },
  { value: 8200, suffix: '+', label: 'Students', icon: Users, color: 'text-pink-600' },
  { value: 15, suffix: '+', label: 'Cities', icon: MapPin, color: 'text-amber-600' },
];

const TESTIMONIALS = [
  { name: 'Priya M.', college: 'IIT Gandhinagar', text: 'Sold my old laptop in 3 hours! The chat feature made negotiating so easy without sharing my number.', stars: 5 },
  { name: 'Rahul K.', college: 'NIT Surat', text: 'Found a second-hand physics textbook for 80% less than market price. This app is a lifesaver for hostel budgets!', stars: 5 },
  { name: 'Anjali S.', college: 'SVNIT', text: 'Listed my guitar and got 5 interested buyers the same day. The verified badge made buyers trust me immediately.', stars: 5 },
];

/* ─────────────────────────────── PAGE ─────────────────────────────── */
export default function About() {
  return (
    <div className="pb-20 md:pb-0 overflow-hidden">

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-800" />

        {/* Floating decorative orbs */}
        <div className="absolute top-16 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Dot-grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />

        <PageWrapper className="relative z-10 text-center text-white py-24">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 text-sm font-semibold mb-8 animate-bounce" style={{ animationDuration: '3s' }}>
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            Built by students, for students 🎓
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 drop-shadow-lg">
            About{' '}
            <span className="relative inline-block">
              <span className="relative z-10">Campus Market</span>
              <span className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-pink-400 to-amber-400 rounded-full opacity-60 blur-sm" />
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-indigo-200 max-w-2xl mx-auto leading-relaxed mb-12">
            India's smartest peer-to-peer marketplace made exclusively for college students — buy, sell, and connect right from your campus.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-4 rounded-2xl hover:bg-indigo-50 transition-all hover:shadow-2xl hover:-translate-y-1"
              id="about-signup-cta"
            >
              Join for Free <ChevronRight size={20} />
            </Link>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/20 transition-all hover:-translate-y-1"
              id="about-browse-cta"
            >
              Browse Listings
            </Link>
          </div>
        </PageWrapper>

        {/* wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-16 md:h-20">
            <path d="M0 80L60 69.3C120 58.7 240 37.3 360 32C480 26.7 600 37.3 720 42.7C840 48 960 48 1080 42.7C1200 37.3 1320 26.7 1380 21.3L1440 16V80H0Z" fill="rgb(248 250 252)" />
          </svg>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section className="bg-slate-50 py-6">
        <PageWrapper>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.label} delay={i * 100}>
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 text-center hover:-translate-y-1 transition-transform duration-300">
                    <div className={`w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3 ${s.color}`}>
                      <Icon size={22} />
                    </div>
                    <p className={`text-3xl font-black ${s.color} mb-1`}>
                      <Counter to={s.value} suffix={s.suffix} />
                    </p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </PageWrapper>
      </section>

      {/* ═══════════ MISSION ═══════════ */}
      <section className="py-24 bg-slate-50">
        <PageWrapper className="max-w-4xl">
          <Reveal>
            <div className="text-center mb-6">
              <span className="text-xs font-bold tracking-widest uppercase text-indigo-500 bg-indigo-50 px-4 py-2 rounded-full">Our Mission</span>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="text-4xl md:text-5xl font-black text-center text-gray-900 mb-8 leading-tight">
              Making campus life{' '}
              <span className="text-gradient">smarter & cheaper</span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Every year, millions of students buy expensive textbooks, gadgets, and hostel essentials — only to leave them behind at graduation. We built <strong className="text-gray-900">Campus Market</strong> to change that.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our mission is simple: connect students who have things they no longer need with students who need those same things at a fraction of the price — safely, quickly, and entirely within their campus community.
              </p>
            </div>
          </Reveal>
        </PageWrapper>
      </section>

      {/* ═══════════ FEATURES GRID ═══════════ */}
      <section className="py-24 bg-white">
        <PageWrapper>
          <Reveal>
            <div className="text-center mb-4">
              <span className="text-xs font-bold tracking-widest uppercase text-violet-500 bg-violet-50 px-4 py-2 rounded-full">Platform Features</span>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="text-4xl md:text-5xl font-black text-center mb-4 text-gray-900">
              Everything you need. <span className="text-gradient">Nothing you don't.</span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-center text-gray-500 max-w-xl mx-auto mb-16">
              Campus Market is packed with features designed specifically for the student experience.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={(i % 3) * 100}>
                  <div className={`group relative overflow-hidden rounded-3xl border-2 ${f.border} ${f.bg} p-7 h-full flex flex-col gap-4 hover:-translate-y-2 hover:shadow-xl transition-all duration-300`}>
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                      <Icon size={22} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
                    </div>
                    {/* Decorative blob */}
                    <div className={`absolute -bottom-8 -right-8 w-28 h-28 bg-gradient-to-br ${f.gradient} opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity`} />
                  </div>
                </Reveal>
              );
            })}
          </div>
        </PageWrapper>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />

        <PageWrapper className="relative z-10">
          <Reveal>
            <div className="text-center mb-4">
              <span className="text-xs font-bold tracking-widest uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full">How It Works</span>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="text-4xl md:text-5xl font-black text-center text-white mb-16">
              From listing to deal — <span className="text-gradient">in 5 steps</span>
            </h2>
          </Reveal>

          <div className="relative">
            {/* Connector line (desktop) */}
            <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/40 to-violet-500/0" />

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {STEPS.map((step, i) => (
                <Reveal key={step.step} delay={i * 120}>
                  <div className="flex flex-col items-center text-center group">
                    {/* Circle */}
                    <div className="relative mb-5">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                        {step.emoji}
                      </div>
                      <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white text-indigo-700 text-xs font-black flex items-center justify-center shadow-md">
                        {step.step}
                      </div>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                    <p className="text-indigo-300 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </PageWrapper>
      </section>

      {/* ═══════════ CATEGORIES ═══════════ */}
      <section className="py-24 bg-white">
        <PageWrapper>
          <Reveal>
            <div className="text-center mb-4">
              <span className="text-xs font-bold tracking-widest uppercase text-pink-500 bg-pink-50 px-4 py-2 rounded-full">What We Sell</span>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="text-4xl md:text-5xl font-black text-center text-gray-900 mb-4">
              10 Categories. <span className="text-gradient">Endless Deals.</span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-center text-gray-500 max-w-lg mx-auto mb-14">
              From textbooks and laptops to guitars and gym gear — if students use it, you'll find it here.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {CATEGORIES.map((cat, i) => (
              <Reveal key={cat.label} delay={(i % 5) * 80}>
                <Link
                  to={`/search?category=${cat.label.toLowerCase().split(' ')[0]}`}
                  className="group flex flex-col items-center gap-3 p-5 bg-gray-50 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-violet-50 border-2 border-transparent hover:border-indigo-200 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="text-4xl group-hover:scale-125 transition-transform duration-300">{cat.emoji}</span>
                  <span className="text-sm font-semibold text-gray-700 text-center leading-snug">{cat.label}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </PageWrapper>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="py-24 bg-gradient-to-br from-indigo-50 via-violet-50/50 to-pink-50/40">
        <PageWrapper>
          <Reveal>
            <div className="text-center mb-4">
              <span className="text-xs font-bold tracking-widest uppercase text-amber-600 bg-amber-50 px-4 py-2 rounded-full">Student Stories</span>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="text-4xl md:text-5xl font-black text-center text-gray-900 mb-16">
              What students <span className="text-gradient">are saying</span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 120}>
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                  {/* Stars */}
                  <div className="flex gap-1">
                    {[...Array(t.stars)].map((_, j) => (
                      <Star key={j} size={16} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed italic">"{t.text}"</p>
                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.college}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </PageWrapper>
      </section>

      {/* ═══════════ WHY US ═══════════ */}
      <section className="py-24 bg-white">
        <PageWrapper className="max-w-5xl">
          <Reveal>
            <h2 className="text-4xl md:text-5xl font-black text-center text-gray-900 mb-16">
              Why <span className="text-gradient">Campus Market?</span>
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { emoji: '🔒', title: 'No strangers, only students', desc: 'Everyone on Campus Market is a verified student. No random buyers from the internet — just your campus community.' },
              { emoji: '💸', title: 'Zero fees, zero commissions', desc: 'We don\'t charge a single rupee. No listing fee, no success fee, no subscription. Completely free forever.' },
              { emoji: '⚡', title: 'Faster than social media groups', desc: 'No more scrolling through chaotic WhatsApp groups. Campus Market has search, filters, categories, and instant chat.' },
              { emoji: '🛡️', title: 'Safe by design', desc: 'In-app chat means you never need to share your personal phone number. Meet in public campus spaces. Buy and sell with confidence.' },
              { emoji: '📍', title: 'Right on your campus', desc: 'Our geo-filter shows listings from your campus first. No long-distance travel, no courier charges — everything is nearby.' },
              { emoji: '🎯', title: 'Built for Indian students', desc: 'From IITs to engineering colleges, from metros to tier-2 cities — Campus Market understands the Indian student lifestyle.' },
            ].map((item, i) => (
              <Reveal key={item.title} delay={(i % 2) * 100}>
                <div className="flex gap-5 p-6 bg-gray-50 hover:bg-white border-2 border-transparent hover:border-indigo-100 rounded-3xl transition-all duration-300 hover:shadow-lg group">
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0">{item.emoji}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </PageWrapper>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="py-24">
        <PageWrapper className="max-w-4xl">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-14 text-center text-white shadow-2xl shadow-indigo-300/40">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

              <div className="relative">
                <div className="text-6xl mb-6">🚀</div>
                <h2 className="text-3xl md:text-5xl font-black mb-5">Ready to join the revolution?</h2>
                <p className="text-indigo-200 text-lg mb-10 max-w-xl mx-auto">
                  Join thousands of students already saving money and decluttering their hostels on Campus Market.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center gap-2 bg-white text-indigo-700 font-black px-10 py-4 rounded-2xl hover:bg-indigo-50 transition-all hover:shadow-2xl hover:-translate-y-1 text-lg"
                    id="about-final-signup"
                  >
                    Create Free Account <ChevronRight size={20} />
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/20 transition-all hover:-translate-y-1"
                    id="about-contact-link"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </PageWrapper>
      </section>

    </div>
  );
}
