import express from 'express';
import bcrypt from 'bcryptjs';
import { readTable, writeTable } from '../utils/db.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { normalizeProduct, normalizeUser } from '../utils/imageHelper.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { sendVerificationOTP } from '../utils/mailer.js';
import { uploadAvatarToCloudinary } from '../utils/cloudinary.js';

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

    // Fetch and aggregate listings info dynamically
    const products = await readTable('products');
    const userProducts = products.filter(p => p.sellerId === user._id && p.status !== 'deleted');
    const activeProducts = userProducts.filter(p => p.status === 'active');
    const soldProducts = userProducts.filter(p => p.status === 'sold');

    const listingCount = activeProducts.length;
    const totalViews = userProducts.reduce((sum, p) => sum + (p.views || 0), 0);
    const dealsCount = soldProducts.length;

    const recentListings = activeProducts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(p => normalizeProduct(p, req));

    res.status(200).json({
      ...normalized,
      listingCount,
      totalViews,
      dealsCount,
      recentListings
    });
  } catch (err) {
    next(err);
  }
});

// 3. Update User Profile (profile info only, NOT password)
router.put('/me', upload.single('avatar'), async (req, res, next) => {
  try {
    const users = await readTable('users');
    const idx = users.findIndex(u => u._id === req.user._id);

    if (idx === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // WHITELIST: Only allow safe profile fields to be updated
    const allowedFields = ['name', 'username', 'college', 'city', 'year', 'department', 'area', 'collegeEmail', 'lat', 'lng'];
    const rawUpdates = req.body;
    const updates = {};

    allowedFields.forEach(field => {
      if (rawUpdates[field] !== undefined) {
        // Skip empty strings — don't overwrite existing data with blank values
        if (rawUpdates[field] !== '' && rawUpdates[field] !== 'undefined' && rawUpdates[field] !== 'null') {
          updates[field] = rawUpdates[field];
        }
      }
    });

    // Check if college has changed: resetting verification badge
    if (updates.college && updates.college !== users[idx].college) {
      users[idx].collegeEmailVerified = false;
      users[idx].collegeEmail = null;
    }

    // Upload avatar to Cloudinary if a new file was provided
    if (req.file) {
      try {
        updates.avatar = await uploadAvatarToCloudinary(req.file.buffer);
      } catch (uploadErr) {
        console.error('[Avatar Upload Error during profile update]', uploadErr.message);
        // Don't fail the whole update if avatar upload fails
      }
    }

    // Safely merge only whitelisted updates
    Object.assign(users[idx], updates);

    await writeTable('users', users);

    const { password: _, securityAnswer: __, ...userWithoutSecrets } = users[idx];
    res.status(200).json({
      message: 'Profile updated successfully!',
      user: normalizeUser(userWithoutSecrets, req)
    });
  } catch (err) {
    next(err);
  }
});

// 3b. Change Password (separate endpoint to avoid contaminating profile data)
router.put('/me/password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const users = await readTable('users');
    const idx = users.findIndex(u => u._id === req.user._id);

    if (idx === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, users[idx].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    users[idx].password = await bcrypt.hash(newPassword, salt);

    await writeTable('users', users);

    res.status(200).json({ message: 'Password updated successfully!' });
  } catch (err) {
    next(err);
  }
});

// 4a. Send OTP to College Email
router.post('/send-verification-otp', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'College email is required' });
    }

    // Validate domain
    const validDomains = ['.edu', '.ac.in', '.edu.in', '.ac.uk', '.edu.au'];
    const isValidDomain = validDomains.some(d => email.toLowerCase().endsWith(d));
    if (!isValidDomain) {
      return res.status(400).json({
        message: 'Only official college emails are accepted (.ac.in, .edu, .edu.in)'
      });
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return res.status(503).json({
        message: 'Email service not configured. Please contact support.'
      });
    }

    const users = await readTable('users');
    const idx = users.findIndex(u => u._id === req.user._id);
    if (idx === -1) return res.status(404).json({ message: 'User not found' });

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

    // Save OTP + pending email on user
    users[idx].pendingCollegeEmail = email;
    users[idx].collegeEmailOTP = otp;
    users[idx].collegeEmailOTPExpiry = otpExpiry;
    await writeTable('users', users);

    // Send email
    await sendVerificationOTP(email, otp, users[idx].name);

    res.status(200).json({ message: `Verification code sent to ${email}` });
  } catch (err) {
    console.error('[OTP Send Error]', err.message);
    next(err);
  }
});

// 4b. Verify OTP and grant Verified Student badge
router.post('/verify-college-otp', async (req, res, next) => {
  try {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ message: 'OTP is required' });

    const users = await readTable('users');
    const idx = users.findIndex(u => u._id === req.user._id);
    if (idx === -1) return res.status(404).json({ message: 'User not found' });

    const user = users[idx];

    if (!user.collegeEmailOTP) {
      return res.status(400).json({ message: 'No verification code found. Please request a new one.' });
    }

    // Check expiry
    if (new Date() > new Date(user.collegeEmailOTPExpiry)) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    // Check OTP match
    if (otp.trim() !== user.collegeEmailOTP) {
      return res.status(400).json({ message: 'Incorrect code. Please check and try again.' });
    }

    // ✅ OTP correct — grant the badge
    users[idx].collegeEmail = user.pendingCollegeEmail;
    users[idx].collegeEmailVerified = true;

    // Clear OTP fields
    delete users[idx].collegeEmailOTP;
    delete users[idx].collegeEmailOTPExpiry;
    delete users[idx].pendingCollegeEmail;

    await writeTable('users', users);

    const { password: _, securityAnswer: __, collegeEmailOTP: ___, ...clean } = users[idx];
    res.status(200).json({
      message: '🎓 Verified Student badge earned!',
      user: normalizeUser(clean, req)
    });
  } catch (err) {
    next(err);
  }
});

// 4c. Legacy route kept for backward compatibility
router.post('/verify-college-email', async (req, res) => {
  res.status(410).json({ message: 'This endpoint is deprecated. Use /send-verification-otp and /verify-college-otp instead.' });
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

    // Fetch and aggregate listings info dynamically for public details
    const products = await readTable('products');
    const userProducts = products.filter(p => p.sellerId === user._id && p.status !== 'deleted');
    const activeProducts = userProducts.filter(p => p.status === 'active');
    const soldProducts = userProducts.filter(p => p.status === 'sold');

    const listingCount = activeProducts.length;
    const totalViews = userProducts.reduce((sum, p) => sum + (p.views || 0), 0);
    const dealsCount = soldProducts.length;

    const recentListings = activeProducts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(p => normalizeProduct(p, req));

    res.status(200).json({
      ...normalized,
      listingCount,
      totalViews,
      dealsCount,
      recentListings
    });
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
