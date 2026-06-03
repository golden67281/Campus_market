import { Link } from 'react-router-dom';
import VerifiedBadge from '../common/VerifiedBadge';
import { formatDate, initials } from '../../utils/formatters';

export default function SellerCard({ seller }) {
  if (!seller) return null;
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center flex-shrink-0">
          {seller.avatar ? (
            <img src={seller.avatar} alt={seller.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-indigo-700 font-bold">{initials(seller.name || 'U')}</span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900">{seller.name}</p>
            {seller.verified && <VerifiedBadge />}
          </div>
          <p className="text-sm text-gray-500">{seller.college}</p>
          <p className="text-xs text-gray-400">Member since {formatDate(seller.createdAt)}</p>
        </div>
      </div>
      <Link
        to={`/search?seller=${seller._id}`}
        className="text-sm text-indigo-600 hover:underline"
      >
        View other listings →
      </Link>
    </div>
  );
}
