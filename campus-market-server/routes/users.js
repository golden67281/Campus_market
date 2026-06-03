import express from 'express';
import { readTable, writeTable } from '../utils/db.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { normalizeProduct, normalizeUser } from '../utils/imageHelper.js';

const router = express.Router();

// 1. Check Username Availability (Public)
router.get('/check-username', async (req, res, next) => {
  try {
    const { u } = req.query;
    if (!u || u.length < 4) {
      return res.status(400).json({ message: 'Username must be at least 4 characters' });
    }

    const users = await readTable('users');
    const exists = users.some(user => user.username === u.toLowerCase());

    res.status(200).json({ available: !exists });
  } catch (err) {
    next(err);
  }
});

// All following routes require JWT authentication
router.use(authMiddleware);

// 2. Get Current User Profile
router.get('/me', async (req, res, next) => {
  try {
    const users = await readTable('users');
    const user = users.find(u => u._id === req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    const normalized = normalizeUser(userWithoutPassword, req);
    res.status(200).json(normalized);
  } catch (err) {
    next(err);
  }
});

// 3. Update User Profile
router.put('/me', async (req, res, next) => {
  try {
    const updates = req.body;
    const users = await readTable('users');
    const idx = users.findIndex(u => u._id === req.user._id);

    if (idx === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out fields that should not be updated directly or require safety checks
    const fieldsToIgnore = ['_id', 'password', 'role', 'status', 'createdAt', 'collegeEmailVerified'];
    fieldsToIgnore.forEach(f => delete updates[f]);

    // Check if college has changed: resetting verification badge
    if (updates.college && updates.college !== users[idx].college) {
      users[idx].collegeEmailVerified = false;
      users[idx].collegeEmail = null;
    }

    // Assign updates
    Object.assign(users[idx], updates);

    await writeTable('users', users);

    const { password: _, ...userWithoutPassword } = users[idx];
    res.status(200).json({
      message: 'Profile updated successfully!',
      user: normalizeUser(userWithoutPassword, req)
    });
  } catch (err) {
    next(err);
  }
});

// 4. Verify College Email
router.post('/verify-college-email', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'College email is required' });
    }

    // Simple suffix check (.edu, .ac.in, .edu.in)
    const isValidDomain = email.endsWith('.edu') || email.endsWith('.ac.in') || email.endsWith('.edu.in');
    if (!isValidDomain) {
      return res.status(400).json({ message: 'Only official college emails (.edu, .ac.in) are supported for verification.' });
    }

    const users = await readTable('users');
    const idx = users.findIndex(u => u._id === req.user._id);

    if (idx === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    users[idx].collegeEmail = email;
    users[idx].collegeEmailVerified = true; // Auto-verify for simplicity in V1 Mock

    await writeTable('users', users);

    const { password: _, ...userWithoutPassword } = users[idx];
    res.status(200).json({
      message: 'Student status successfully verified! ✅',
      user: normalizeUser(userWithoutPassword, req)
    });
  } catch (err) {
    next(err);
  }
});

// 5. Get Current User's Listings
router.get('/me/listings', async (req, res, next) => {
  try {
    const products = await readTable('products');
    const myListings = products.filter(p => p.sellerId === req.user._id && p.status !== 'deleted');
    const normalized = myListings.map(p => normalizeProduct(p, req));

    res.status(200).json(normalized);
  } catch (err) {
    next(err);
  }
});

// 6. Get Another User's Listings
router.get('/:id/listings', async (req, res, next) => {
  try {
    const { id } = req.params;
    const products = await readTable('products');
    const userListings = products.filter(p => p.sellerId === id && p.status === 'active');
    const normalized = userListings.map(p => normalizeProduct(p, req));

    res.status(200).json(normalized);
  } catch (err) {
    next(err);
  }
});

// 7. Get Another User's Public Details
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const users = await readTable('users');
    const user = users.find(u => u._id === id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Redact sensitive details for public profile
    const publicProfile = {
      _id: user._id,
      name: user.name,
      username: user.username,
      college: user.college,
      collegeCity: user.collegeCity,
      collegeEmailVerified: user.collegeEmailVerified,
      year: user.year,
      department: user.department,
      area: user.area,
      avatar: user.avatar,
      createdAt: user.createdAt
    };

    const normalized = normalizeUser(publicProfile, req);
    res.status(200).json(normalized);
  } catch (err) {
    next(err);
  }
});

// 8. Deactivate or Delete Account
router.delete('/me', async (req, res, next) => {
  try {
    const { action } = req.query;
    const users = await readTable('users');
    const idx = users.findIndex(u => u._id === req.user._id);

    if (idx === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (action === 'delete') {
      // Soft-delete: mark status as deleted and clear personal info
      users[idx].status = 'deleted';
      users[idx].name = 'Deleted User';
      users[idx].mobile = '0000000000';
      users[idx].email = null;
      users[idx].collegeEmail = null;
      users[idx].avatar = null;

      // Soft-delete their listings
      const products = await readTable('products');
      products.forEach(p => {
        if (p.sellerId === req.user._id) p.status = 'deleted';
      });
      await writeTable('products', products);

    } else {
      // Deactivate account
      users[idx].status = 'deactivated';

      // Hide active listings
      const products = await readTable('products');
      products.forEach(p => {
        if (p.sellerId === req.user._id && p.status === 'active') p.status = 'inactive';
      });
      await writeTable('products', products);
    }

    await writeTable('users', users);

    res.status(200).json({ message: `Account successfully ${action === 'delete' ? 'deleted' : 'deactivated'}.` });
  } catch (err) {
    next(err);
  }
});

export default router;
