import express from 'express';
import { readTable, writeTable, generateId } from '../utils/db.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { normalizeProduct } from '../utils/imageHelper.js';

const router = express.Router();

// All interest routes require JWT authentication
router.use(authMiddleware);

// 1. Express Interest in a Product
router.post('/', async (req, res, next) => {
  try {
    const { productId, buyerName, buyerPhone, buyerArea, message } = req.body;
    const buyerId = req.user._id;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const products = await readTable('products');
    const productIdx = products.findIndex(p => p._id === productId);

    if (productIdx === -1 || products[productIdx].status === 'deleted') {
      return res.status(404).json({ message: 'Product listing not found' });
    }

    const product = products[productIdx];

    // Cannot express interest in own listing
    if (product.sellerId === buyerId) {
      return res.status(400).json({ message: 'You cannot contact yourself on your own listing.' });
    }

    const interests = await readTable('interests');

    // Check if interest is already expressed
    let existing = interests.find(i => i.productId === productId && i.buyerId === buyerId);
    if (!existing) {
      existing = {
        _id: generateId('i'),
        productId,
        buyerId,
        buyerName: buyerName || req.user.username,
        buyerPhone: buyerPhone || '',
        buyerArea: buyerArea || '',
        message: message || '',
        contactRevealed: false,
        createdAt: new Date().toISOString()
      };

      interests.push(existing);
      await writeTable('interests', interests);

      // Increment interest count
      products[productIdx].interestCount = (products[productIdx].interestCount || 0) + 1;
      await writeTable('products', products);

      // Create Notification for the Seller
      const notifications = await readTable('notifications');
      notifications.push({
        _id: generateId('n'),
        userId: product.sellerId,
        type: 'buyer_interest',
        title: `${buyerName || 'A student'} is interested in your ${product.title}`,
        body: message || 'Is this still available?',
        relatedProductId: productId,
        relatedUserId: buyerId,
        read: false,
        createdAt: new Date().toISOString()
      });
      await writeTable('notifications', notifications);
    }

    res.status(201).json(existing);
  } catch (err) {
    next(err);
  }
});

// 2. Get expressed interests of current buyer
router.get('/mine', async (req, res, next) => {
  try {
    const interests = await readTable('interests');
    const products = await readTable('products');
    const myInterests = interests.filter(i => i.buyerId === req.user._id);

    // Map product info onto interests
    const populated = myInterests.map(i => {
      const prod = products.find(p => p._id === i.productId);
      return { ...i, product: prod };
    });

    const normalized = populated.map(i => ({
      ...i,
      product: normalizeProduct(i.product, req)
    }));

    res.status(200).json(normalized);
  } catch (err) {
    next(err);
  }
});

// 3. Get all interests for a single product (Seller Only)
router.get('/product/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const products = await readTable('products');
    const product = products.find(p => p._id === productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.sellerId !== req.user._id) {
      return res.status(403).json({ message: 'Unauthorized. You are not the seller.' });
    }

    const interests = await readTable('interests');
    const productInterests = interests.filter(i => i.productId === productId);

    res.status(200).json(productInterests);
  } catch (err) {
    next(err);
  }
});

// 4. Get Seller Contact (Post-checklist checklist reveal)
router.get('/contact/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const buyerId = req.user._id;

    const interests = await readTable('interests');
    const interest = interests.find(i => i.productId === productId && i.buyerId === buyerId);

    if (!interest) {
      return res.status(400).json({ message: 'Please express interest first before fetching contact details.' });
    }

    // Mark contact revealed
    if (!interest.contactRevealed) {
      interest.contactRevealed = true;
      await writeTable('interests', interests);
    }

    const products = await readTable('products');
    const product = products.find(p => p._id === productId);
    if (!product) {
      return res.status(404).json({ message: 'Product listing not found' });
    }

    const users = await readTable('users');
    const seller = users.find(u => u._id === product.sellerId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Return custom contact object required by client
    res.status(200).json({
      phone: seller.mobile,
      whatsapp: seller.showWhatsapp && product.showWhatsapp !== false,
      meetingSpot: product.meetingSpot || seller.area || '',
      seller: {
        _id: seller._id,
        name: seller.name,
        avatar: seller.avatar,
        college: seller.college,
        verified: seller.collegeEmailVerified
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
