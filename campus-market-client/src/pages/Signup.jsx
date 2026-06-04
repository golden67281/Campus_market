import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, MapPin, CheckCircle, XCircle, Mail, ShieldCheck } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { signup, checkMobile } from '../api/authApi';
import { checkUsername, sendSignupEmailOTP, verifySignupEmailOTP } from '../api/userApi';
import StepProgressBar from '../components/forms/StepProgressBar';
import Button from '../components/ui/Button';
import PageWrapper from '../components/layout/PageWrapper';
import { YEARS } from '../utils/constants';
import { useLocation } from '../hooks/useLocation';

const COLLEGES = [
  'IIT Bombay', 'IIT Delhi', 'IIT Gandhinagar', 'IIT Madras', 'IIT Kanpur',
  'IIT Roorkee', 'IIT Kharagpur', 'NIT Trichy', 'NIT Warangal', 'NIT Surathkal',
  'BITS Pilani', 'VIT Vellore', 'Manipal University', 'NMIMS Mumbai',
  'Pune University', 'Mumbai University', 'Delhi University', 'Gujarat University',
  'Anna University', 'Osmania University', 'Amity University', 'SRM University',
];

const STEPS = ['Mobile', 'Details', 'College', 'Security & Password'];

const SECURITY_QUESTIONS = [
  "What is the name of your first pet?",
  "What was the name of your primary school?",
  "In what city were you born?",
  "What is your mother's maiden name?",
  "What is your favorite book or movie?"
];

export default function Signup() {
  const { user, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const { detect: detectGps, loading: gpsLoading } = useLocation();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    mobile: '', name: '', username: '', avatar: null,
    college: '', city: '', collegeEmail: '', year: '', department: '',
    area: '', lat: null, lng: null, password: '', confirmPassword: '',
    securityQuestion: '', securityAnswer: '',
  });

  // Email OTP state for Step 3
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpValue, setEmailOtpValue] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);

  const [usernameStatus, setUsernameStatus] = useState(null); // 'checking' | 'ok' | 'taken'
  const [collegeSearch, setCollegeSearch] = useState('');
  const [showCollegeList, setShowCollegeList] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [mobileLoading, setMobileLoading] = useState(false);

  useEffect(() => { if (user) navigate('/home'); }, [user, navigate]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleCheckMobile = async () => {
    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      toast.error('Enter a valid 10-digit mobile number starting with 6-9');
      return;
    }
    setMobileLoading(true);
    try {
      const res = await checkMobile(form.mobile);
      if (res.data.available) {
        toast.success('Mobile number is available! ✓');
        setStep(2);
      } else {
        toast.error('Mobile number is already registered. Please log in.');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Verification failed. Try again.');
    } finally {
      setMobileLoading(false);
    }
  };

  const handleUsernameBlur = async () => {
    if (form.username.length < 4) return;
    setUsernameStatus('checking');
    try {
      const res = await checkUsername(form.username);
      setUsernameStatus(res.data.available ? 'ok' : 'taken');
    } catch { setUsernameStatus(null); }
  };

  const pwdStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    return score; // 0-3
  };
  const strength = pwdStrength(form.password);
  const strengthLabels = ['', 'Weak', 'Medium', 'Strong'];
  const strengthColors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-green-500'];

  const handleGps = async () => {
    try {
      const { lat, lng } = await detectGps();
      set('lat', lat); set('lng', lng);
      set('area', `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
      toast.success('Location detected!');
    } catch { toast.error('Could not detect location.'); }
  };

  // Email OTP handlers
  const handleSendEmailOTP = async () => {
    if (!form.collegeEmail) { toast.error('Enter your college email first'); return; }
    setEmailOtpLoading(true);
    try {
      await sendSignupEmailOTP(form.collegeEmail, form.name);
      setEmailOtpSent(true);
      setEmailOtpValue('');
      toast.success(`Verification code sent to ${form.collegeEmail}`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send code');
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const handleVerifyEmailOTP = async () => {
    if (!emailOtpValue || emailOtpValue.length !== 6) { toast.error('Enter the 6-digit code'); return; }
    setEmailOtpLoading(true);
    try {
      await verifySignupEmailOTP(form.collegeEmail, emailOtpValue);
      setEmailVerified(true);
      setEmailOtpSent(false);
      toast.success('🎓 College email verified!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Incorrect code. Please try again.');
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (strength < 2) { toast.error('Please use a stronger password'); return; }
    setSubmitLoading(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null) {
          if (k === 'mobile') {
            payload.append(k, `+91${v}`);
          } else {
            payload.append(k, v);
          }
        }
      });
      // Send verified email flag so server can store it
      if (emailVerified) {
        payload.set('collegeEmailVerified', 'true');
      }
      const res = await signup(payload);
      setAuth(res.data.user, res.data.token);
      toast.success('Welcome to Campus Market! 🎉');
      navigate('/home');
    } catch (e) { toast.error(e.response?.data?.message || 'Signup failed'); }
    finally { setSubmitLoading(false); }
  };

  const filteredColleges = COLLEGES.filter((c) => c.toLowerCase().includes(collegeSearch.toLowerCase()));

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <PageWrapper className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div id="recaptcha-container"></div>
          <div className="text-center mb-6">
            <span className="text-3xl">🎓</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">Create Your Account</h1>
          </div>

          <StepProgressBar currentStep={step} totalSteps={4} labels={STEPS} />

          {/* STEP 1: Mobile Validation */}
          {step === 1 && (
            <div className="space-y-4">
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
                    value={form.mobile}
                    onChange={(e) => set('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  />
                </div>
              </div>
              <Button
                variant="primary"
                onClick={handleCheckMobile}
                loading={mobileLoading}
                className="w-full justify-center mt-4"
                disabled={form.mobile.length < 10}
              >
                Continue →
              </Button>
            </div>
          )}

          {/* STEP 2: Personal Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input" placeholder="e.g. Aarav Shah" value={form.name} onChange={(e) => set('name', e.target.value)} />
              </div>
              <div>
                <label className="label">Username</label>
                <div className="relative">
                  <input
                    className="input pr-8"
                    placeholder="e.g. aarav_shah"
                    value={form.username}
                    onChange={(e) => set('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    onBlur={handleUsernameBlur}
                  />
                  {usernameStatus === 'ok' && <CheckCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />}
                  {usernameStatus === 'taken' && <XCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />}
                </div>
                {usernameStatus === 'taken' && <p className="error-text">Username already taken</p>}
                {usernameStatus === 'ok' && <p className="text-xs text-green-600 mt-1">Username available ✓</p>}
              </div>
              <Button
                variant="primary"
                className="w-full justify-center"
                disabled={!form.name || !form.username || usernameStatus === 'taken'}
                onClick={() => setStep(3)}
              >
                Next →
              </Button>
            </div>
          )}

          {/* STEP 3: College Details + Email Verification */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="relative">
                <label className="label">College / University</label>
                <input
                  className="input"
                  placeholder="Search your college..."
                  value={collegeSearch || form.college}
                  onChange={(e) => { setCollegeSearch(e.target.value); set('college', e.target.value); setShowCollegeList(true); }}
                  onFocus={() => setShowCollegeList(true)}
                />
                {showCollegeList && filteredColleges.length > 0 && (
                  <div className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto mt-1">
                    {filteredColleges.map((c) => (
                      <button key={c} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                        onClick={() => { set('college', c); setCollegeSearch(c); setShowCollegeList(false); }}>
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="label">City</label>
                <input className="input" placeholder="e.g. Ahmedabad" value={form.city} onChange={(e) => set('city', e.target.value)} />
              </div>

              {/* College Email OTP Verification */}
              <div>
                <label className="label flex items-center gap-2">
                  College Email
                  <span className="text-gray-400 font-normal text-xs">(verify to earn the Verified Student badge)</span>
                </label>

                {/* Already verified */}
                {emailVerified ? (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck size={18} className="text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-green-800">🎓 Verified Student!</p>
                      <p className="text-xs text-green-600 truncate">{form.collegeEmail}</p>
                    </div>
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-semibold flex-shrink-0">✓ Done</span>
                  </div>

                ) : emailOtpSent ? (
                  /* Step 2: Enter OTP */
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                      <Mail size={16} className="text-indigo-500 flex-shrink-0" />
                      <p className="text-sm text-indigo-700">
                        Code sent to <strong>{form.collegeEmail}</strong>. Check your inbox.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <input
                        className="input flex-1 text-center text-2xl font-bold tracking-[0.5em] placeholder:text-sm placeholder:tracking-normal"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="______"
                        value={emailOtpValue}
                        onChange={(e) => setEmailOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      />
                      <Button
                        variant="primary"
                        onClick={handleVerifyEmailOTP}
                        loading={emailOtpLoading}
                        className="flex-shrink-0"
                      >
                        Verify ✓
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">⏱ Code expires in 10 minutes</p>
                      <button
                        type="button"
                        className="text-xs text-indigo-600 hover:underline font-medium"
                        onClick={() => { setEmailOtpSent(false); setEmailOtpValue(''); }}
                      >
                        ← Change email / Resend
                      </button>
                    </div>
                  </div>

                ) : (
                  /* Step 1: Enter email and send OTP */
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        className="input flex-1"
                        type="email"
                        placeholder="you@college.ac.in"
                        value={form.collegeEmail}
                        onChange={(e) => { set('collegeEmail', e.target.value); setEmailVerified(false); }}
                      />
                      <Button
                        variant="primary"
                        onClick={handleSendEmailOTP}
                        loading={emailOtpLoading}
                        className="flex-shrink-0 whitespace-nowrap"
                        disabled={!form.collegeEmail}
                      >
                        Send Code
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400">
                      Accepted: <code className="bg-gray-100 px-1 rounded">.ac.in</code> · <code className="bg-gray-100 px-1 rounded">.edu</code> · <code className="bg-gray-100 px-1 rounded">.edu.in</code>
                    </p>
                    {!form.collegeEmail && (
                      <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                        <span className="text-amber-500 flex-shrink-0">✉️</span>
                        <p className="text-xs text-amber-800">
                          Enter your official college email and click <strong>Send Code</strong> to get the <strong>Verified Student</strong> badge.
                          <br />
                          <span className="text-amber-600">You can also skip this and verify later from your profile.</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="label">Current Year</label>
                <select className="input" value={form.year} onChange={(e) => set('year', e.target.value)}>
                  <option value="">Select year</option>
                  {YEARS.map((y) => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Department / Stream</label>
                <input className="input" placeholder="e.g. Computer Engineering" value={form.department} onChange={(e) => set('department', e.target.value)} />
              </div>
              <Button variant="primary" className="w-full justify-center" disabled={!form.college} onClick={() => setStep(4)}>
                Next →
              </Button>
            </div>
          )}

          {/* STEP 4: Location & Password */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="label">Area / Locality</label>
                <div className="flex gap-2">
                  <input className="input flex-1" placeholder="e.g. Navrangpura, Ahmedabad" value={form.area} onChange={(e) => set('area', e.target.value)} />
                  <Button variant="secondary" onClick={handleGps} loading={gpsLoading}>
                    <MapPin size={16} />
                  </Button>
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    className="input pr-10"
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3].map((i) => (
                        <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= strength ? strengthColors[strength] : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <p className={`text-xs ${strength === 3 ? 'text-green-600' : strength === 2 ? 'text-yellow-600' : 'text-red-500'}`}>
                      {strengthLabels[strength]}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Repeat password"
                  className={`input ${form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-400' : ''}`}
                  value={form.confirmPassword}
                  onChange={(e) => set('confirmPassword', e.target.value)}
                />
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="error-text">Passwords don't match</p>
                )}
              </div>
              <div>
                <label className="label">Security Question (For Password Recovery)</label>
                <select
                  className="input"
                  value={form.securityQuestion}
                  onChange={(e) => set('securityQuestion', e.target.value)}
                >
                  <option value="">Select a security question</option>
                  {SECURITY_QUESTIONS.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Security Answer</label>
                <input
                  type="text"
                  placeholder="Your answer (case insensitive)"
                  className="input"
                  value={form.securityAnswer}
                  onChange={(e) => set('securityAnswer', e.target.value)}
                />
              </div>
              <Button
                variant="primary"
                className="w-full justify-center py-3"
                loading={submitLoading}
                onClick={handleSubmit}
                disabled={!form.password || form.password !== form.confirmPassword || strength < 2 || !form.securityQuestion || !form.securityAnswer}
              >
                Create Account 🎉
              </Button>
            </div>
          )}

          {step > 1 && (
            <button onClick={() => setStep((s) => s - 1)} className="mt-4 text-sm text-gray-500 hover:text-gray-700 w-full text-center">
              ← Back
            </button>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-medium hover:underline">Log in</Link>
          </p>
        </div>
      </PageWrapper>
    </div>
  );
}