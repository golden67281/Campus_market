import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Heart, Plus, User, LogOut, Settings, Package, MapPin, Menu, X, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import Button from '../ui/Button';
import { useDebounce } from '../../hooks/useDebounce';
import { initials } from '../../utils/formatters';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-4">

          {/* Logo */}
          <Link to={user ? '/home' : '/'} className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">🎓</span>
            <span className="font-bold text-lg tracking-tight hidden sm:block text-gray-900">Campus Market</span>
          </Link>

          {/* Center: Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              />
            </div>
          </form>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {user ? (
              <>
                {/* Notifications */}
                <Link
                  to="/notifications"
                  className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Chats */}
                <Link
                  to="/chats"
                  className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition"
                >
                  <MessageSquare size={20} />
                </Link>

                {/* Wishlist */}
                <Link to="/wishlist" className="hidden sm:block p-2 text-gray-500 hover:bg-gray-50 rounded-full transition">
                  <Heart size={20} />
                </Link>

                {/* Sell */}
                <Link to="/sell" className="hidden sm:block">
                  <Button variant="primary" className="gap-1.5">
                    <Plus size={16} />
                    <span>Sell</span>
                  </Button>
                </Link>

                {/* Avatar Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-1.5 p-1 hover:bg-gray-50 rounded-full border border-transparent hover:border-gray-100 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs overflow-hidden">
                      {user.avatar
                        ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                        : initials(user.name || 'U')
                      }
                    </div>
                    <span className="text-[10px] text-gray-400 hidden sm:block">▼</span>
                  </button>

                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2 overflow-hidden">
                        <div className="px-4 py-2 border-b border-gray-50 mb-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-400 truncate">@{user.username}</p>
                        </div>
                        {[
                          { icon: User, label: 'My Profile', to: '/profile' },
                          { icon: MessageSquare, label: 'Chats', to: '/chats' },
                          { icon: Package, label: 'My Listings', to: '/my-listings' },
                          { icon: Heart, label: 'Wishlist', to: '/wishlist' },
                          { icon: Settings, label: 'Settings', to: '/settings' },
                        ].map(({ icon: Icon, label, to }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                          >
                            <Icon size={16} className="text-gray-400" /> {label}
                          </Link>
                        ))}
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                        >
                          <LogOut size={16} /> Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login"><Button variant="secondary">Login</Button></Link>
                <Link to="/signup"><Button variant="primary">Sign Up</Button></Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-full"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </form>
          {!user ? (
            <div className="grid grid-cols-2 gap-2">
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="secondary" className="w-full justify-center">Login</Button>
              </Link>
              <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                <Button variant="primary" className="w-full justify-center">Sign Up</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link to="/sell" onClick={() => setIsMenuOpen(false)}>
                <Button variant="primary" className="w-full justify-center"><Plus size={16} /> Sell</Button>
              </Link>
              <Link to="/wishlist" onClick={() => setIsMenuOpen(false)}>
                <Button variant="secondary" className="w-full justify-center"><Heart size={16} /> Wishlist</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
