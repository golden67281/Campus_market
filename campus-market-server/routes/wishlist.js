import express from 'express';
import { readTable, writeTable, generateId } from '../utils/db.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { normalizeProduct } from '../utils/imageHelper.js';

const router = express.Router();

router.use(authMiddleware);

// 1. Get User's Wishlist (populated with product details)
router.get('/', async (req, res, next) => {
  try {
    const wishlist = await readTable('wishlist');
    const products = await readTable('products');
    const users = await readTable('users');

    const userWishlist = wishlist.filter(w => w.userId === req.user._id);

    // Populate each wishlist entry with the corresponding product object
    const populated = await Promise.all(
      userWishlist.map(async (item) => {
        const prod = products.find(p => p._id === item.productId && p.status !== 'deleted');
        if (!prod) return null;

        // Populate seller for this product
        const seller = users.find(u => u._id === prod.sellerId);
        const safeSeller = seller ? {
          _id: seller._id,
          name: seller.name,
          username: seller.username,
          college: seller.college,
          avatar: seller.avatar,
          verified: seller.collegeEmailVerified
        } : null;

        return {
          ...item,
          product: { ...prod, seller: safeSeller }
        };
      })
    );

    const normalized = populated
      .filter(x => x !== null)
      .map(item => ({
        ...item,
        product: normalizeProduct(item.product, req)
      }));

    res.status(200).json(normalized);
  } catch (err) {
    next(err);
  }
});

// 2. Add a Product to Wishlist
router.post('/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const products = await readTable('products');
    const prodIdx = products.findIndex(p => p._id === productId && p.status === 'active');
    if (prodIdx === -1) {
      return res.status(404).json({ message: 'Active product not found' });
    }

    const wishlist = await readTable('wishlist');

    // Avoid duplicate saves
    let item = wishlist.find(w => w.userId === userId && w.productId === productId);
    if (!item) {
      item = {
        _id: generateId('w'),
        userId,
        productId,
        savedAt: new Date().toISOString()
      };
      wishlist.push(item);
      await writeTable('wishlist', wishlist);

      // Increment wishlist count on product
      products[prodIdx].wishlistCount = (products[prodIdx].wishlistCount || 0) + 1;
      await writeTable('products', products);
    }

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// 3. Remove a Product from Wishlist
router.delete('/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const wishlist = await readTable('wishlist');
    const filtered = wishlist.filter(w => !(w.userId === userId && w.productId === productId));

    if (filtered.length !== wishlist.length) {
      await writeTable('wishlist', filtered);

      // Decrement wishlist count on product (safely)
      const products = await readTable('products');
      const prodIdx = products.findIndex(p => p._id === productId);
      if (prodIdx !== -1) {
        products[prodIdx].wishlistCount = Math.max(0, (products[prodIdx].wishlistCount || 0) - 1);
        await writeTable('products', products);
      }
    }

    res.status(200).json({ message: 'Removed from wishlist successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
