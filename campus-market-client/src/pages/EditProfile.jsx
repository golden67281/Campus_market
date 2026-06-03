import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMe, updateProfile } from '../api/userApi';
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
      updateUser(res.data);
      toast.success('✅ Profile saved');
      navigate('/profile');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to save'); }
    finally { setLoading(false); }
  };

  const handlePasswordChange = async () => {
    if (pwdForm.newPwd !== pwdForm.confirm) { toast.error("Passwords don't match"); return; }
    setPwdLoading(true);
    try {
      await updateProfile({ currentPassword: pwdForm.current, newPassword: pwdForm.newPwd });
      toast.success('Password updated!');
      setPwdForm({ current: '', newPwd: '', confirm: '' });
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to update password'); }
    finally { setPwdLoading(false); }
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
              <div>
                <label className="label">College Email <span className="font-normal text-gray-400">(for Verified badge)</span></label>
                <input className="input" type="email" placeholder="you@college.ac.in" value={form.collegeEmail} onChange={(e) => set('collegeEmail', e.target.value)} />
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