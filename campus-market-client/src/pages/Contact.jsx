import { useState } from 'react';
import { Phone, MessageCircle, Share2, Mail, MapPin, Clock, ChevronRight } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';

const CONTACT_CARDS = [
  {
    id: 'whatsapp',
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+91 6287089715',
    sub: 'Message us anytime',
    color: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50',
    border: 'border-green-100',
    text: 'text-green-700',
    href: 'https://wa.me/916287089715?text=Hi%2C%20I%20have%20a%20question%20about%20Campus%20Market!',
    cta: 'Chat on WhatsApp',
  },
  {
    id: 'phone',
    icon: Phone,
    label: 'Phone',
    value: '+91 6287089715',
    sub: 'Mon – Sat, 10am – 7pm IST',
    color: 'from-indigo-500 to-violet-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    text: 'text-indigo-700',
    href: 'tel:+916287089715',
    cta: 'Call Now',
  },
  {
    id: 'instagram',
    icon: Share2,
    label: 'Instagram',
    value: '@satyam_sharma728',
    sub: 'DM us on Instagram',
    color: 'from-pink-500 via-rose-500 to-orange-400',
    bg: 'bg-pink-50',
    border: 'border-pink-100',
    text: 'text-pink-700',
    href: 'https://instagram.com/satyam_sharma728',
    cta: 'Follow & DM',
  },
];

const FAQS = [
  { q: 'How do I list a product?', a: 'Sign up, go to "Sell", fill in the product details, upload photos, and hit publish. Your listing goes live instantly!' },
  { q: 'Is Campus Market free to use?', a: 'Yes! Campus Market is completely free for buyers and sellers. No listing fees, no commissions.' },
  { q: 'How do I contact a seller?', a: 'Open any product listing and click "Contact Seller" — it opens a direct in-app chat. No phone numbers needed!' },
  { q: 'What if I face an issue with my order?', a: 'Reach out to us on WhatsApp or Instagram and we will resolve it within 24 hours.' },
];

export default function Contact() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="pb-20 md:pb-0 min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/40">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700" />
        {/* decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-32 -translate-y-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full -translate-x-20 translate-y-20 blur-3xl" />

        <PageWrapper className="relative py-20 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            We reply within a few hours
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            Get in Touch 👋
          </h1>
          <p className="text-lg text-indigo-200 max-w-xl mx-auto">
            Have a question, suggestion, or need support? Reach us through any of the channels below — we're always happy to help!
          </p>
        </PageWrapper>
      </div>

      <PageWrapper className="py-14 max-w-5xl">

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {CONTACT_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <a
                key={card.id}
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative overflow-hidden rounded-3xl border-2 ${card.border} ${card.bg} p-7 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-100`}
              >
                {/* Gradient Icon Circle */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={26} className="text-white" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
                  <p className={`text-lg font-bold ${card.text} leading-snug`}>{card.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{card.sub}</p>
                </div>

                <div className={`flex items-center gap-1.5 text-sm font-semibold ${card.text} mt-auto`}>
                  {card.cta}
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Decorative gradient corner blob */}
                <div className={`absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br ${card.color} opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity`} />
              </a>
            );
          })}
        </div>

        {/* Info Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          {[
            { icon: Clock, label: 'Response Time', value: 'Within a few hours', color: 'text-amber-500' },
            { icon: MapPin, label: 'Based in', value: 'India 🇮🇳', color: 'text-rose-500' },
            { icon: Mail, label: 'Platform', value: 'Campus Market', color: 'text-indigo-500' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 px-6 py-4 shadow-sm">
                <div className={`w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center ${item.color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                  <p className="font-semibold text-gray-800 text-sm">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-16">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
            <p className="text-indigo-200 text-sm mt-1">Quick answers to common questions</p>
          </div>
          <div className="divide-y divide-gray-50">
            {FAQS.map((faq, i) => (
              <div key={i} className="px-8 py-5">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left group"
                  id={`faq-${i}`}
                >
                  <span className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">{faq.q}</span>
                  <span className={`text-indigo-500 flex-shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-90' : ''}`}>
                    <ChevronRight size={18} />
                  </span>
                </button>
                {openFaq === i && (
                  <p className="mt-3 text-sm text-gray-500 leading-relaxed animate-fadeIn">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-10 text-center text-white shadow-2xl shadow-indigo-200">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-2xl font-black mb-3">Still have a question?</h3>
            <p className="text-indigo-200 mb-7 max-w-sm mx-auto text-sm">
              Don't hesitate to reach out — we're a small team and we personally respond to every message.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/916287089715?text=Hi%2C%20I%20have%20a%20question%20about%20Campus%20Market!"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-all hover:shadow-lg hover:-translate-y-0.5"
                id="contact-whatsapp-cta"
              >
                <MessageCircle size={18} /> WhatsApp Us
              </a>
                <a
                href="https://instagram.com/satyam_sharma728"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/20 transition-all hover:-translate-y-0.5"
                id="contact-instagram-cta"
              >
                <Share2 size={18} /> Follow on Instagram
              </a>
            </div>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}
