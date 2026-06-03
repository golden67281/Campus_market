import { Heart, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ConditionBadge from './ConditionBadge';
import { formatPrice, timeAgo } from '../../utils/formatters';
import useAuthStore from '../../store/authStore';

export default function ProductCard({ product, isSaved, onWishlistToggle }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (onWishlistToggle) onWishlistToggle(product._id);
  };

  return (
    <Link to={`/product/${product._id}`} className="block">
      <div className="card p-0 overflow-hidden group cursor-pointer">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling?.style && (e.target.nextSibling.style.display = 'flex');
              }}
            />
          ) : null}
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300" style={{ display: product.images?.[0] ? 'none' : 'flex' }}>📦</div>
          {/* Sold overlay */}
          {product.status === 'sold' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">SOLD</span>
            </div>
          )}
          {/* Wishlist heart */}
          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform z-10"
          >
            <Heart
              size={16}
              className={isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400'}
            />
          </button>
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">{product.title}</p>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-bold text-gray-900">
              {formatPrice(product.price, product.isFree)}
            </span>
            {product.isNegotiable && (
              <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Negotiable</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
            <MapPin size={10} />
            <span className="truncate">{product.college || product.city}</span>
          </div>
          <div className="flex items-center justify-between">
            <ConditionBadge condition={product.condition} />
            <span className="text-[10px] text-gray-400">{timeAgo(product.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
