import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { login as loginApi, resetPassword, getSecurityQuestion } from '../api/authApi';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import PageWrapper from '../components/layout/PageWrapper';

export default function Login() {
  const { user, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [useEmail, setUseEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [fpStep, setFpStep] = useState(1);
  const [fpMobile, setFpMobile] = useState('');
  const [fpOtp, setFpOtp] = useState('');
  const [fpLoading, setFpLoading] = useState(false);
  const [fpNewPwd, setFpNewPwd] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (user) navigate('/home');
  }, [user, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await loginApi(data);
      setAuth(res.data.user, res.data.token);
      toast.success('Welcome back! 👋');
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const [fpQuestion, setFpQuestion] = useState('');
  const [fpAnswer, setFpAnswer] = useState('');

  const handleForgot = async () => {
    setFpLoading(true);
    try {
      if (fpStep === 1) {
        if (!/^[6-9]\d{9}$/.test(fpMobile)) { toast.error('Enter a valid 10-digit mobile number starting with 6-9'); return; }
        const res = await getSecurityQuestion(fpMobile);
        setFpQuestion(res.data.question);
        setFpStep(2);
        toast.success('Security question loaded! ✓');
      } else if (fpStep === 2) {
        if (!fpAnswer.trim()) { toast.error('Please enter the security answer'); return; }
        setFpStep(3);
      } else {
        if (!fpNewPwd.trim() || fpNewPwd.length < 8) { toast.error('Password must be at least 8 characters long'); return; }
        await resetPassword({ mobile: fpMobile, securityAnswer: fpAnswer, password: fpNewPwd });
        toast.success('Password updated! Please log in. 🔑');
        setForgotOpen(false);
        setFpStep(1);
        setFpAnswer('');
        setFpNewPwd('');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to verify. Check number or answer.');
    } finally {
      setFpLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <PageWrapper className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div id="recaptcha-container-fp"></div>
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-4xl">🎓</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-3 mb-1">Welcome back</h1>
            <p className="text-sm text-gray-500">Log in to your Campus Market account</p>
          </div>

          {/* Toggle: Mobile / Email */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setUseEmail(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${!useEmail ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >
              <Phone size={15} /> Mobile
            </button>
            <button
              onClick={() => setUseEmail(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${useEmail ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >
              <Mail size={15} /> Email
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!useEmail ? (
              <div>
                <label className="label">Mobile Number</label>
                <div className="flex gap-2">
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 text-gray-500 font-medium text-sm">
                    +91
                  </div>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    className="input flex-1"
                    {...register('mobile', {
                      required: 'Mobile number is required',
                      pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit mobile number' }
                    })}
                  />
                </div>
                {errors.mobile && <p className="error-text">{errors.mobile.message}</p>}
              </div>
            ) : (
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="input"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' }
                  })}
                />
                {errors.email && <p className="error-text">{errors.email.message}</p>}
              </div>
            )}

            <div>
              <div className="flex justify-between mb-1">
                <label className="label">Password</label>
                <button type="button" onClick={() => setForgotOpen(true)} className="text-xs text-indigo-600 hover:underline">
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  className="input pr-10"
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            <Button type="submit" variant="primary" loading={loading} className="w-full justify-center py-3">
              Log In
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-600 font-medium hover:underline">
              Sign Up →
            </Link>
          </p>
        </div>

        {/* Forgot Password Modal */}
        <Modal isOpen={forgotOpen} onClose={() => { setForgotOpen(false); setFpStep(1); setFpAnswer(''); }} title="Reset Password">
          <div className="space-y-4">
            {fpStep === 1 && (
              <>
                <p className="text-sm text-gray-500">Enter your registered mobile number.</p>
                <div className="flex gap-2">
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 text-gray-500 font-medium text-sm">
                    +91
                  </div>
                  <input
                    type="tel"
                    placeholder="Mobile number"
                    className="input flex-1"
                    value={fpMobile}
                    onChange={(e) => setFpMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  />
                </div>
              </>
            )}
            {fpStep === 2 && (
              <>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Security Question</p>
                <div className="bg-indigo-50/60 text-indigo-900 border border-indigo-100 rounded-xl p-3.5 text-sm font-medium">
                  {fpQuestion}
                </div>
                <div>
                  <label className="label">Your Answer</label>
                  <input
                    type="text"
                    placeholder="Type your security answer"
                    className="input"
                    value={fpAnswer}
                    onChange={(e) => setFpAnswer(e.target.value)}
                  />
                </div>
              </>
            )}
            {fpStep === 3 && (
              <>
                <p className="text-sm text-gray-500">Enter your new password.</p>
                <input
                  type="password"
                  placeholder="New password (min 8 chars)"
                  className="input"
                  value={fpNewPwd}
                  onChange={(e) => setFpNewPwd(e.target.value)}
                />
              </>
            )}
            <Button variant="primary" onClick={handleForgot} loading={fpLoading} className="w-full justify-center">
              {fpStep === 1 ? 'Retrieve Question' : fpStep === 2 ? 'Verify Answer' : 'Reset Password'}
            </Button>
          </div>
        </Modal>
      </PageWrapper>
    </div>
  );
}