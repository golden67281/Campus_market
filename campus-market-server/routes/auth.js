import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readTable, writeTable, generateId } from '../utils/db.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'campus_market_super_secure_secret_token_key_123';

// Helper to normalize mobile numbers to always include +91 prefix
function normalizeMobile(mobile) {
  if (!mobile) return '';
  let str = String(mobile).trim();
  if (/^[6-9]\d{9}$/.test(str)) {
    return `+91${str}`;
  }
  if (/^\+91[6-9]\d{9}$/.test(str)) {
    return str;
  }
  return str;
}

// 1. Check Mobile Availability (checks if mobile number already exists)
router.post('/check-mobile', async (req, res, next) => {
  try {
    const { mobile } = req.body;
    const normalized = normalizeMobile(mobile);
    if (!normalized || !/^\+91[6-9]\d{9}$/.test(normalized)) {
      return res.status(400).json({ message: 'Enter a valid 10-digit mobile number' });
    }

    const users = await readTable('users');
    const exists = users.some(u => normalizeMobile(u.mobile) === normalized);
    res.status(200).json({ available: !exists });
  } catch (err) {
    next(err);
  }
});

// 2. Fetch Security Question (Forgot Password step 1)
router.post('/security-question', async (req, res, next) => {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      return res.status(400).json({ message: 'Mobile number is required' });
    }

    const normalized = normalizeMobile(mobile);
    const users = await readTable('users');
    const user = users.find(u => normalizeMobile(u.mobile) === normalized && u.status === 'active');
    
    if (!user) {
      return res.status(404).json({ message: 'No active account found with this mobile number.' });
    }

    if (!user.securityQuestion) {
      return res.status(400).json({ 
        message: 'This account has no security question configured. Please contact support.' 
      });
    }

    res.status(200).json({ question: user.securityQuestion });
  } catch (err) {
    next(err);
  }
});

// Deprecated OTP routes kept for backward-compatibility checks if needed
router.post('/send-otp', (req, res) => {
  res.status(200).json({ message: 'OTP sending bypassed securely.' });
});
router.post('/verify-otp', (req, res) => {
  res.status(200).json({ message: 'OTP verification bypassed securely.' });
});
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { mobile } = req.body;
    const normalized = normalizeMobile(mobile);
    const users = await readTable('users');
    const user = users.find(u => normalizeMobile(u.mobile) === normalized && u.status === 'active');
    if (!user) {
      return res.status(404).json({ message: 'No registered account found with this mobile number' });
    }
    res.status(200).json({ message: 'Enter your security answer to reset.', question: user.securityQuestion });
  } catch (err) {
    next(err);
  }
});

// 3. Sign Up (OTP-free, secures security question and answer)
router.post('/signup', upload.single('avatar'), async (req, res, next) => {
  try {
    const {
      name, username, mobile, college, city, collegeEmail, year, department, area, lat, lng, password, securityQuestion, securityAnswer
    } = req.body;

    if (!name || !username || !mobile || !college || !password || !securityQuestion || !securityAnswer) {
      return res.status(400).json({ message: 'Missing required signup fields, security question, or answer.' });
    }

    const normalizedMobile = normalizeMobile(mobile);

    const users = await readTable('users');
    // Check if username or mobile already exists
    if (users.find(u => u.username === username.toLowerCase())) {
      return res.status(400).json({ message: 'Username is already taken' });
    }
    if (users.find(u => normalizeMobile(u.mobile) === normalizedMobile)) {
      return res.status(400).json({ message: 'Mobile number is already registered' });
    }

    // Hash password & security answer
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const answerHash = await bcrypt.hash(securityAnswer.toLowerCase().trim(), salt);

    // Save avatar path if uploaded
    let avatarUrl = null;
    if (req.file) {
      avatarUrl = `http://localhost:5000/uploads/avatars/${req.file.filename}`;
    }

    const newUser = {
      _id: generateId('u'),
      name,
      username: username.toLowerCase(),
      mobile: normalizedMobile,
      email: null,
      collegeEmail: collegeEmail || null,
      collegeEmailVerified: !!collegeEmail, 
      college,
      collegeCity: city || '',
      year: year || '',
      department: department || '',
      area: area || '',
      lat: lat ? Number(lat) : null,
      lng: lng ? Number(lng) : null,
      avatar: avatarUrl,
      password: passwordHash,
      securityQuestion,
      securityAnswer: answerHash,
      role: 'user',
      status: 'active',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeTable('users', users);

    // Generate JWT token
    const token = jwt.sign({ _id: newUser._id, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });

    // Clean user object before response (do not send password or security answer hash)
    const { password: _, securityAnswer: __, ...userWithoutSecrets } = newUser;

    res.status(201).json({
      user: userWithoutSecrets,
      token
    });
  } catch (err) {
    next(err);
  }
});

// 4. Log In
router.post('/login', async (req, res, next) => {
  try {
    const { mobile, email, password } = req.body;

    if ((!mobile && !email) || !password) {
      return res.status(400).json({ message: 'Please provide identity credentials and password' });
    }

    const users = await readTable('users');
    let user = null;

    if (mobile) {
      const normalizedMobile = normalizeMobile(mobile);
      user = users.find(u => normalizeMobile(u.mobile) === normalizedMobile && u.status === 'active');
    } else if (email) {
      user = users.find(u => (u.email === email || u.collegeEmail === email) && u.status === 'active');
    }

    if (!user) {
      return res.status(400).json({ message: 'Account not found or inactive' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    const token = jwt.sign({ _id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    const { password: _, securityAnswer: __, ...userWithoutSecrets } = user;

    res.status(200).json({
      user: userWithoutSecrets,
      token
    });
  } catch (err) {
    next(err);
  }
});

// 5. Reset Password (using Security Answer verification)
router.put('/reset-password', async (req, res, next) => {
  try {
    const { mobile, securityAnswer, password } = req.body;
    if (!mobile || !password || !securityAnswer) {
      return res.status(400).json({ message: 'Missing fields for password reset' });
    }

    const normalizedMobile = normalizeMobile(mobile);
    const users = await readTable('users');
    const userIdx = users.findIndex(u => normalizeMobile(u.mobile) === normalizedMobile && u.status === 'active');
    
    if (userIdx === -1) {
      return res.status(404).json({ message: 'Active account with this mobile number was not found.' });
    }

    const user = users[userIdx];
    if (!user.securityAnswer) {
      return res.status(400).json({ 
        message: 'This account has no security answer configured. Please contact support.' 
      });
    }

    // Verify answer
    const answerMatch = await bcrypt.compare(securityAnswer.toLowerCase().trim(), user.securityAnswer);
    if (!answerMatch) {
      return res.status(400).json({ message: 'Incorrect security answer. Reset denied.' });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    users[userIdx].password = await bcrypt.hash(password, salt);
    await writeTable('users', users);

    res.status(200).json({ message: 'Password reset successfully!' });
  } catch (err) {
    next(err);
  }
});

export default router;
