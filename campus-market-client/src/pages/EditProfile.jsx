import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMe, updateProfile, changePassword, sendVerificationOTP, verifyCollegeOTP } from '../api/userApi';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import PageWrapper from '../components/layout/PageWrapper';
import { YEARS } from '../utils/constants';
import { useLocation } from '../hooks/useLocation';
import { initials } from '../utils/formatters';

export default function EditProfile() {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const { detect: detectGps, loading: gpsLoading } = useLocation();

  const [form, setForm] = useState({ name: '', username: '', college: '', city: '', year: '', department: '', area: '', collegeEmail: '' });
  const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    getMe().then((res) => {
      const p = res.data;
      setForm({
        name: p.name || '', username: p.username || '', college: p.college || '',
        city: p.city || '', year: p.year || '', department: p.department || '',
        area: p.area || '', collegeEmail: p.collegeEmail || '',
      });
      setAvatarPreview(p.avatar || null);
      setIsVerified(!!p.collegeEmailVerified);
    }).catch(() => {});
  }, []);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleGps = async () => {
    try {
      const { lat, lng } = await detectGps();
      set('lat', lat); set('lng', lng);
      set('area', `${lat.toFixed(3)}, ${lng.toFixed(3)}`);
      toast.success('Location updated!');
    } catch { toast.error('Could not get location'); }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (avatarFile) fd.append('avatar', avatarFile);
      const res = await updateProfile(fd);
      updateUser(res.data.user || res.data);
      toast.success('✅ Profile saved');
      navigate('/profile');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to save'); }
    finally { setLoading(false); }
  };

  const handlePasswordChange = async () => {
    if (pwdForm.newPwd !== pwdForm.confirm) { toast.error("Passwords don't match"); return; }
    setPwdLoading(true);
    try {
      await changePassword(pwdForm.current, pwdForm.newPwd);
      toast.success('Password updated!');
      setPwdForm({ current: '', newPwd: '', confirm: '' });
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to update password'); }
    finally { setPwdLoading(false); }
  };

  const handleSendOTP = async () => {
    if (!form.collegeEmail) { toast.error('Enter your college email first'); return; }
    setVerifyLoading(true);
    try {
      await sendVerificationOTP(form.collegeEmail);
      setOtpSent(true);
      setOtpValue('');
      toast.success(`Code sent to ${form.collegeEmail}`);
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to send code'); }
    finally { setVerifyLoading(false); }
  };

  const handleVerifyOTP = async () => {
    if (!otpValue || otpValue.length !== 6) { toast.error('Enter the 6-digit code'); return; }
    setVerifyLoading(true);
    try {
      const res = await verifyCollegeOTP(otpValue);
      updateUser(res.data.user || res.data);
      setIsVerified(true);
      setOtpSent(false);
      toast.success('🎓 Verified Student badge earned!');
    } catch (e) { toast.error(e.response?.data?.message || 'Verification failed'); }
    finally { setVerifyLoading(false); }
  };

  return (
    <div className="pb-20 md:pb-0">
      <PageWrapper className="py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

        <div className="space-y-6">
          {/* Avatar */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold mb-4">Profile Photo</h2>
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-indigo-700">{initials(form.name || 'U')}</span>
                )}
              </div>
              <label className="cursor-pointer">
                <span className="btn-secondary text-sm">Change Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
          </div>

          {/* Personal Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold mb-4">Personal Info</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} />
              </div>
              <div>
                <label className="label">Username</label>
                <input className="input" value={form.username} onChange={(e) => set('username', e.target.value)} />
              </div>
            </div>
          </div>

          {/* College Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold mb-4">College Info</h2>
            <div className="space-y-4">
              <div>
                <label className="label">College / University</label>
                <input className="input" value={form.college} onChange={(e) => set('college', e.target.value)} />
                {form.college !== user?.college && <p className="text-xs text-amber-600 mt-1">⚠️ Changing college will reset your Verified badge.</p>}
              </div>
              <div>
                <label className="label">City</label>
                <input className="input" value={form.city} onChange={(e) => set('city', e.target.value)} />
              </div>
              {/* College Email Verification — 2-Step OTP Flow */}
              <div>
                <label className="label">College Email <span className="font-normal text-gray-400">(for Verified Student badge)</span></label>

                {/* Already verified */}
                {isVerified ? (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 1.5L2.5 3.5V8c0 3.3 2.5 5.7 5.5 6.5C11 13.7 13.5 11.3 13.5 8V3.5L8 1.5Z" fill="#22c55e" fillOpacity="0.2" stroke="#22c55e" strokeWidth="1" />
                        <path d="M5.5 8L7 9.5L10.5 6" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-green-800">🎓 Verified Student</p>
                      <p className="text-xs text-green-600 truncate">{form.collegeEmail}</p>
                    </div>
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-semibold flex-shrink-0">Active ✓</span>
                  </div>

                /* Step 2: Enter OTP */
                ) : otpSent ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                      <span className="text-indigo-500">📧</span>
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
                        placeholder="_ _ _ _ _ _"
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      />
                      <Button
                        variant="primary"
                        onClick={handleVerifyOTP}
                        loading={verifyLoading}
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
                        onClick={() => { setOtpSent(false); setOtpValue(''); }}
                      >
                        ← Change email / Resend
                      </button>
                    </div>
                  </div>

                /* Step 1: Enter email */
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        className="input flex-1"
                        type="email"
                        placeholder="you@college.ac.in"
                        value={form.collegeEmail}
                        onChange={(e) => set('collegeEmail', e.target.value)}
                      />
                      <Button
                        variant="primary"
                        onClick={handleSendOTP}
                        loading={verifyLoading}
                        className="flex-shrink-0 whitespace-nowrap"
                      >
                        Send Code
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400">
                      Accepted: <code className="bg-gray-100 px-1 rounded">.ac.in</code> · <code className="bg-gray-100 px-1 rounded">.edu</code> · <code className="bg-gray-100 px-1 rounded">.edu.in</code>
                    </p>
                    <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <span className="text-amber-500 flex-shrink-0">✉️</span>
                      <p className="text-xs text-amber-800">
                        Enter your official college email and click <strong>Send Code</strong>. We'll email you a 6-digit verification code.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="label">Year</label>
                <select className="input" value={form.year} onChange={(e) => set('year', e.target.value)}>
                  {YEARS.map((y) => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Department / Stream</label>
                <input className="input" value={form.department} onChange={(e) => set('department', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Location & Contact */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold mb-4">Location & Contact</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Area / Locality</label>
                <div className="flex gap-2">
                  <input className="input flex-1" placeholder="e.g. Navrangpura, Ahmedabad" value={form.area} onChange={(e) => set('area', e.target.value)} />
                  <Button variant="secondary" onClick={handleGps} loading={gpsLoading}><MapPin size={16} /></Button>
                </div>
              </div>

            </div>
          </div>

          <Button variant="primary" className="w-full justify-center py-3" onClick={handleSave} loading={loading}>
            Save Profile
          </Button>

          {/* Change Password */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold mb-4">Change Password</h2>
            <div className="space-y-4">
              {['current', 'newPwd', 'confirm'].map((k) => (
                <div key={k}>
                  <label className="label">
                    {k === 'current' ? 'Current Password' : k === 'newPwd' ? 'New Password' : 'Confirm New Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      className="input pr-10"
                      value={pwdForm[k]}
                      onChange={(e) => setPwdForm((f) => ({ ...f, [k]: e.target.value }))}
                    />
                    {k === 'newPwd' && (
                      <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <Button variant="secondary" onClick={handlePasswordChange} loading={pwdLoading} className="w-full justify-center">
                Update Password
              </Button>
            </div>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}