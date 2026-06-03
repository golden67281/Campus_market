import express from 'express';
import jwt from 'jsonwebtoken';
import { readTable, writeTable, generateId } from '../utils/db.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { getDistanceKm } from '../utils/distance.js';

const router = express.Router();

// Helper to populate seller details for a product
async function populateSeller(product, usersList = null) {
  const users = usersList || await readTable('users');
  const seller = users.find(u => u._id === product.sellerId);
  if (seller) {
    const { password, ...safeSeller } = seller;
    return { ...product, seller: safeSeller };
  }
  return product;
}

// 1. Get Listings (filtered, sorted, coordinates-prioritized)
router.get('/', async (req, res, next) => {
  try {
    let { category, minPrice, maxPrice, conditions, sort, lat, lng, radius } = req.query;
    let products = await readTable('products');
    const users = await readTable('users');

    // Only active listings
    products = products.filter(p => p.status === 'active');

    // Filter by Category
    if (category) {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by Price Range
    if (minPrice) {
      products = products.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      products = products.filter(p => p.price <= Number(maxPrice));
    }

    // Filter by Condition List
    if (conditions) {
      // Normalize array input (Express might parse conditions as string or array)
      const conditionArr = Array.isArray(conditions) ? conditions : [conditions];
      products = products.filter(p => conditionArr.includes(p.condition));
    }

    // Radius Filter (if lat/lng provided)
    if (lat && lng && radius) {
      const userLat = Number(lat);
      const userLng = Number(lng);
      const limitRadius = Number(radius);

      products = products.filter(p => {
        if (p.lat === null || p.lng === null) return false;
        const dist = getDistanceKm(userLat, userLng, p.lat, p.lng);
        return dist <= limitRadius;
      });
    }

    // Sort listings
    if (sort === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'views') {
      products.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else {
      // 'newest' (default)
      products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Populate seller for each product
    const populated = await Promise.all(products.map(p => populateSeller(p, users)));

    res.status(200).json(populated);
  } catch (err) {
    next(err);
  }
});

// 2. Search listings (by query term in title, description, or tags)
router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    let products = await readTable('products');
    const users = await readTable('users');

    products = products.filter(p => p.status === 'active');

    if (q) {
      const term = q.toLowerCase();
      products = products.filter(p => 
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(term)))
      );
    }

    const populated = await Promise.all(products.map(p => populateSeller(p, users)));
    res.status(200).json(populated);
  } catch (err) {
    next(err);
  }
});

// 3. Get Single Listing Details
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const products = await readTable('products');
    const product = products.find(p => p._id === id);

    if (!product || product.status === 'deleted') {
      return res.status(404).json({ message: 'Product listing not found' });
    }

    const populated = await populateSeller(product);

    // Try to see if requesting user has expressed interest and revealed contact
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campus_market_super_secure_secret_token_key_123');
        const userId = decoded._id;

        const interests = await readTable('interests');
        const interest = interests.find(i => i.productId === id && i.buyerId === userId);
        if (interest) {
          const users = await readTable('users');
          const seller = users.find(u => u._id === product.sellerId);
          if (seller) {
            populated.userContact = {
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
            };
          }
        }
      } catch (err) {
        // Ignore token error for public view
      }
    }

    res.status(200).json(populated);
  } catch (err) {
    next(err);
  }
});

// All subsequent routes require JWT authentication
router.use(authMiddleware);

// 4. Create new Product Listing
router.post('/', async (req, res, next) => {
  try {
    const {
      title, category, subCategory, condition, price, isNegotiable, isFree, description, images, tags, location, meetingSpot, showWhatsapp, whatsappNumber
    } = req.body;

    if (!title || !category || !condition || (!isFree && price === undefined)) {
      return res.status(400).json({ message: 'Missing listing parameters' });
    }

    const users = await readTable('users');
    const seller = users.find(u => u._id === req.user._id);
    if (!seller) {
      return res.status(404).json({ message: 'Seller profile not found' });
    }

    const products = await readTable('products');

    const newProduct = {
      _id: generateId('p'),
      sellerId: req.user._id,
      title,
      category,
      subCategory: subCategory || '',
      condition,
      price: isFree ? 0 : Number(price),
      isNegotiable: !!isNegotiable,
      isFree: !!isFree,
      description: description || '',
      images: images || [],
      tags: tags || [],
      location: location || seller.area || '',
      meetingSpot: meetingSpot || '',
      lat: seller.lat,
      lng: seller.lng,
      college: seller.college,
      city: seller.collegeCity || seller.city || '',
      status: 'active',
      views: 0,
      wishlistCount: 0,
      interestCount: 0,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days expiry
    };

    products.push(newProduct);
    await writeTable('products', products);

    const populated = await populateSeller(newProduct, users);
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

// 5. Update Product Listing (Owner Only)
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const products = await readTable('products');
    const idx = products.findIndex(p => p._id === id);

    if (idx === -1 || products[idx].status === 'deleted') {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Ownership check
    if (products[idx].sellerId !== req.user._id) {
      return res.status(403).json({ message: 'Unauthorized. You do not own this listing.' });
    }

    // Ignore read-only/counter fields
    const fieldsToIgnore = ['_id', 'sellerId', 'views', 'wishlistCount', 'interestCount', 'createdAt', 'expiresAt'];
    fieldsToIgnore.forEach(f => delete updates[f]);

    Object.assign(products[idx], updates);
    await writeTable('products', products);

    const populated = await populateSeller(products[idx]);
    res.status(200).json(populated);
  } catch (err) {
    next(err);
  }
});

// 6. Soft-delete Product Listing (Owner Only)
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const products = await readTable('products');
    const idx = products.findIndex(p => p._id === id);

    if (idx === -1) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Ownership check
    if (products[idx].sellerId !== req.user._id) {
      return res.status(403).json({ message: 'Unauthorized. You do not own this listing.' });
    }

    products[idx].status = 'deleted';
    await writeTable('products', products);

    res.status(200).json({ message: 'Listing deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// 7. Mark as Sold (Owner Only)
router.put('/:id/mark-sold', async (req, res, next) => {
  try {
    const { id } = req.params;
    const products = await readTable('products');
    const idx = products.findIndex(p => p._id === id);

    if (idx === -1 || products[idx].status === 'deleted') {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Ownership check
    if (products[idx].sellerId !== req.user._id) {
      return res.status(403).json({ message: 'Unauthorized. You do not own this listing.' });
    }

    products[idx].status = 'sold';
    await writeTable('products', products);

    res.status(200).json({ message: 'Listing marked as sold' });
  } catch (err) {
    next(err);
  }
});

// 8. Renew Listing for 30 Days (Owner Only)
router.put('/:id/renew', async (req, res, next) => {
  try {
    const { id } = req.params;
    const products = await readTable('products');
    const idx = products.findIndex(p => p._id === id);

    if (idx === -1 || products[idx].status === 'deleted') {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Ownership check
    if (products[idx].sellerId !== req.user._id) {
      return res.status(403).json({ message: 'Unauthorized. You do not own this listing.' });
    }

    products[idx].expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    products[idx].status = 'active'; // Re-activate if expired or sold
    await writeTable('products', products);

    res.status(200).json({ message: 'Listing renewed for 30 additional days!' });
  } catch (err) {
    next(err);
  }
});

// 9. Increment View Count (Public, but post-only)
router.post('/:id/view', async (req, res, next) => {
  try {
    const { id } = req.params;
    const products = await readTable('products');
    const idx = products.findIndex(p => p._id === id);

    if (idx !== -1 && products[idx].status === 'active') {
      products[idx].views = (products[idx].views || 0) + 1;
      await writeTable('products', products);
    }

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

export default router;
