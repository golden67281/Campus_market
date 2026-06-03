import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import { useWishlist } from '../../hooks/useWishlist';

export default function ProductGrid({ products, loading, skeletonCount = 8 }) {
  const { isSaved, toggle } = useWishlist();

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          isSaved={isSaved(product._id)}
          onWishlistToggle={toggle}
        />
      ))}
    </div>
  );
}
