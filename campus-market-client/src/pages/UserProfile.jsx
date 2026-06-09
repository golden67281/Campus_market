import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { getUserProfile } from '../api/userApi';
import useAuthStore from '../store/authStore';
import ProductGrid from '../components/product/ProductGrid';
import VerifiedBadge from '../components/common/VerifiedBadge';
import PageWrapper from '../components/layout/PageWrapper';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { formatDate, initials } from '../utils/formatters';

export default function UserProfile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getUserProfile(userId);
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to load user profile', err);
        setError('User not found or profile unavailable');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <PageWrapper className="py-12">
        <EmptyState
          icon="👤"
          title="Profile Unavailable"
          description={error || "The profile you are trying to view is not available."}
          action={
            <Button onClick={() => navigate(-1)} variant="secondary" className="flex items-center gap-2">
              <ArrowLeft size={16} /> Go Back
            </Button>
          }
        />
      </PageWrapper>
    );
  }

  const isMe = currentUser?._id === profile._id || currentUser?.id === profile.id;

  return (
    <div className="pb-20 md:pb-0">
      <PageWrapper className="py-8">
        {/* Navigation & Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft size={16} /> Back
          </button>
          {isMe && (
            <Link to="/profile/edit">
              <Button variant="secondary" size="sm">
                Edit My Profile
              </Button>
            </Link>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            <div className="w-20 h-20 rounded-full bg-indigo-100 overflow-hidden flex items-center justify-center flex-shrink-0 border border-gray-100">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-indigo-700">{initials(profile.name || 'U')}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-gray-900 truncate">{profile.name}</h1>
                    {(profile.verified || profile.collegeEmailVerified) && <VerifiedBadge />}
                  </div>
                  <p className="text-gray-500 text-sm">@{profile.username}</p>
                  <div className="text-sm text-gray-500 space-y-0.5 mt-2">
                    <p>🎓 {profile.college || 'College not specified'} · {profile.year || 'Year N/A'} · {profile.department || 'Dept N/A'}</p>
                    <p>📍 {profile.collegeCity || profile.area || 'Location N/A'}</p>
                    <p>📅 Member since {formatDate(profile.createdAt)}</p>
                  </div>
                </div>

                {!isMe && profile.recentListings?.length > 0 && (
                  <Button
                    onClick={() => {
                      // Navigate to chat with this user for their most recent active listing
                      const firstProduct = profile.recentListings[0];
                      navigate(`/chat/${firstProduct._id}/${profile._id}`);
                    }}
                    variant="primary"
                    className="flex items-center gap-2 flex-shrink-0"
                  >
                    <MessageSquare size={16} /> Chat with Seller
                  </Button>
                )}
              </div>

              {/* Stats Panel */}
              <div className="flex gap-8 mt-5 pt-4 border-t border-gray-100">
                <div>
                  <p className="font-bold text-lg text-gray-900">{profile.listingCount || 0}</p>
                  <p className="text-xs text-gray-500">Active Listings</p>
                </div>
                <div>
                  <p className="font-bold text-lg text-gray-900">{profile.dealsCount || 0}</p>
                  <p className="text-xs text-gray-500">Deals Done</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User's Listings */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {isMe ? 'My Active Listings' : `Listings by ${profile.name}`}
          </h2>
          {profile.recentListings?.length > 0 ? (
            <ProductGrid products={profile.recentListings} loading={false} />
          ) : (
            <EmptyState
              icon="📦"
              title="No active listings"
              description={isMe ? "You haven't posted any active listings yet." : "This seller currently has no active listings."}
              action={isMe && (
                <Link to="/sell">
                  <Button variant="primary">+ Create Listing</Button>
                </Link>
              )}
            />
          )}
        </div>
      </PageWrapper>
    </div>
  );
}
