import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { deactivateAccount, deleteAccount } from '../api/userApi';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center justify-between cursor-pointer py-2">
    <span className="text-sm text-gray-700">{label}</span>
    <div onClick={onChange} className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-300'}`}>
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </div>
  </label>
);

export default function Settings() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState({
    allNotifs: true, buyerAlerts: true, viewMilestones: true, wishlistAlerts: true,
    profileVisibility: 'all', showWhatsapp: true,
  });
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const handleDeactivate = async () => {
    setActionLoading(true);
    try {
      await deactivateAccount();
      logout();
      navigate('/');
      toast('Your account has been deactivated.');
    } catch { toast.error('Failed to deactivate account'); }
    finally { setActionLoading(false); setDeactivateOpen(false); }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== 'DELETE') { toast.error('Type DELETE to confirm'); return; }
    setActionLoading(true);
    try {
      await deleteAccount();
      logout();
      navigate('/');
      toast('Your account has been deleted.');
    } catch { toast.error('Failed to delete account'); }
    finally { setActionLoading(false); setDeleteOpen(false); }
  };

  return (
    <div className="pb-20 md:pb-0">
      <PageWrapper className="py-8 max-w-xl">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <div className="space-y-4">
          {/* Notification Preferences */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold mb-4">🔔 Notification Preferences</h2>
            <div className="divide-y divide-gray-50">
              <Toggle checked={prefs.allNotifs} onChange={() => toggle('allNotifs')} label="All notifications" />
              <Toggle checked={prefs.buyerAlerts} onChange={() => toggle('buyerAlerts')} label="Buyer interest alerts" />
              <Toggle checked={prefs.viewMilestones} onChange={() => toggle('viewMilestones')} label="View milestones (100, 500 views)" />
              <Toggle checked={prefs.wishlistAlerts} onChange={() => toggle('wishlistAlerts')} label="Wishlist save alerts" />
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold mb-4">🔒 Privacy</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Profile visible to</p>
                {['All users', 'Same college only'].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer mb-1">
                    <input type="radio" name="visibility" checked={prefs.profileVisibility === opt} onChange={() => setPrefs((p) => ({ ...p, profileVisibility: opt }))} className="accent-indigo-600" />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
              <Toggle checked={prefs.showWhatsapp} onChange={() => toggle('showWhatsapp')} label="Show WhatsApp number to interested buyers" />
            </div>
          </div>

          {/* Account */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold mb-4">⚙️ Account</h2>
            <div className="space-y-3">
              <Button
                variant="secondary"
                className="w-full justify-center text-amber-600 border-amber-200 hover:bg-amber-50"
                onClick={() => setDeactivateOpen(true)}
              >
                Deactivate Account
              </Button>
              <Button
                variant="danger"
                className="w-full justify-center"
                onClick={() => setDeleteOpen(true)}
              >
                Delete Account
              </Button>
            </div>
          </div>

          {/* App Info */}
          <div className="text-center text-xs text-gray-400 py-4">
            <p>Campus Market v1.0</p>
            <p>Made with ❤️ for Indian students</p>
          </div>
        </div>
      </PageWrapper>

      {/* Deactivate Confirm */}
      <ConfirmDialog
        isOpen={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        onConfirm={handleDeactivate}
        loading={actionLoading}
        title="Deactivate Account?"
        message="Your account will be temporarily hidden. You can reactivate it by logging in again."
        confirmText="Deactivate"
        danger
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={actionLoading}
        title="Permanently Delete Account?"
        message={
          <div>
            <p className="mb-3 text-red-600 font-medium">⚠️ This cannot be undone. All your data will be erased.</p>
            <input className="input" placeholder='Type "DELETE" to confirm' value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} />
          </div>
        }
        confirmText="Delete Forever"
        danger
      />
    </div>
  );
}