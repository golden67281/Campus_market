import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import PageWrapper from '../components/layout/PageWrapper';
import { CATEGORIES } from '../utils/constants';

export default function Landing() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/home');
  }, [user, navigate]);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-white -z-10" />
        <PageWrapper>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
              Your Campus. <br />
              <span className="text-indigo-600">Your Marketplace.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Buy and sell everything from textbooks to electronics with verified students at your college. Simple, safe, and student-focused.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button variant="primary" className="w-full sm:w-auto text-lg px-8 py-4 justify-center">
                  Start Selling →
                </Button>
              </Link>
              <Link to="/search" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full sm:w-auto text-lg px-8 py-4 justify-center">
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        </PageWrapper>
      </section>

      {/* Stats Bar */}
      <div className="border-y border-gray-100 bg-gray-50/50 py-6">
        <PageWrapper>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">120+</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Colleges</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">3,400+</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Listings</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">8,200+</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Students</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">15+</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Cities</p>
            </div>
          </div>
        </PageWrapper>
      </div>

      {/* Category Strip */}
      <section className="py-12 border-b border-gray-100 overflow-hidden">
        <PageWrapper>
          <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <Link 
                key={cat.value} 
                to={`/search?category=${cat.value}`}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:border-indigo-600 hover:text-indigo-600 transition bg-white text-sm font-medium shadow-sm"
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </Link>
            ))}
          </div>
        </PageWrapper>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <PageWrapper>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-gray-500">Three simple steps to start trading on campus.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: '🎓', title: 'Sign Up Free', desc: 'Verify your college email and join your campus community.' },
              { icon: '📸', title: 'List or Browse', desc: 'Post your items in 2 minutes or browse thousands of listings near you.' },
              { icon: '🤝', title: 'Meet & Deal', desc: 'Contact the seller, meet in a public campus space, and close the deal.' }
            ].map((step, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 bg-indigo-50 text-3xl flex items-center justify-center rounded-2xl mx-auto mb-6 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </PageWrapper>
      </section>

      {/* Trust Badges */}
      <section className="py-20 bg-gray-50">
        <PageWrapper>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Verified Students Only', desc: 'Trust who you buy from.', color: 'bg-blue-500' },
              { title: 'Safe Campus Meetings', desc: 'Deal in public spaces.', color: 'bg-green-500' },
              { title: 'Hyperlocal Discovery', desc: 'Items right next door.', color: 'bg-indigo-500' },
              { title: 'Student-Friendly Prices', desc: 'Save on everything.', color: 'bg-amber-500' }
            ].map((badge, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className={`w-2 h-8 ${badge.color} rounded-full mb-4`} />
                <h4 className="font-bold text-gray-900 mb-1">{badge.title}</h4>
                <p className="text-sm text-gray-500">{badge.desc}</p>
              </div>
            ))}
          </div>
        </PageWrapper>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <PageWrapper>
          <div className="bg-indigo-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl" />
            
            <h2 className="text-4xl font-extrabold mb-6">Ready to clear your hostel room?</h2>
            <p className="text-indigo-100 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of students already buying and selling on Campus Market.
            </p>
            <Link to="/signup">
              <Button variant="secondary" className="bg-white border-transparent text-indigo-600 hover:bg-indigo-50 px-10 py-4 text-lg">
                Create Free Account
              </Button>
            </Link>
          </div>
        </PageWrapper>
      </section>
    </div>
  );
}