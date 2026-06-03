import { useState, useEffect } from 'react';
import { getWishlist, removeFromWishlist } from '../api/wishlistApi';
import PageWrapper from '../components/layout/PageWrapper';
import ProductCard from '../components/product/ProductCard';
import ProductCardSkeleton from '../components/product/ProductCardSkeleton';
import EmptyState from '../components/ui/EmptyState';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWishlist()
      .then((res) => setWishlist(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
      setWishlist((prev) => prev.filter((w) => w.productId !== productId));
      toast('Removed from wishlist');
    } catch { toast.error('Failed to remove'); }
  };

  return (
    <div className="pb-20 md:pb-0">
      <PageWrapper className="py-8">
        <h1 className="text-2xl font-bold mb-6">Your Wishlist ({wishlist.length})</h1>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : wishlist.length === 0 ? (
          <EmptyState
            icon="❤️"
            title="Your wishlist is empty"
            description="Save products you like and come back to them anytime."
            action={<Link to="/search"><Button>Browse Products →</Button></Link>}
          />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {wishlist.map((item) => {
              const product = item.product;
              if (!product) return null;
              return (
                <div key={item.productId} className="relative">
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="absolute top-2 left-2 z-10 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm text-lg font-bold"
                    title="Remove"
                  >
                    ×
                  </button>
                  <ProductCard
                    product={product}
                    isSaved={true}
                    onWishlistToggle={() => handleRemove(item.productId)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </PageWrapper>
    </div>
  );
}