import { useState, useEffect } from 'react';
import { getWishlist, addToWishlist, removeFromWishlist } from '../api/wishlistApi';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export function useWishlist() {
  const [wishlistIds, setWishlistIds] = useState([]);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      getWishlist().then((res) => {
        setWishlistIds(res.data.map((w) => w.productId));
      }).catch(() => {});
    }
  }, [user]);

  const toggle = async (productId) => {
    if (!user) return false; // caller handles redirect
    if (wishlistIds.includes(productId)) {
      await removeFromWishlist(productId);
      setWishlistIds((prev) => prev.filter((id) => id !== productId));
      toast('Removed from wishlist');
    } else {
      await addToWishlist(productId);
      setWishlistIds((prev) => [...prev, productId]);
      toast.success('❤️ Added to wishlist');
    }
    return true;
  };

  return { wishlistIds, toggle, isSaved: (id) => wishlistIds.includes(id) };
}
