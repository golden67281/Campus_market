import jwt from 'jsonwebtoken';
import { readTable } from '../utils/db.js';

export default async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Unauthorized.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campus_market_super_secure_secret_token_key_123');

    // Always look up the user from the database using username (from JWT)
    // This ensures req.user._id is always the real database _id,
    // even if an old JWT token was issued when _id was null (MongoDB migration bug)
    const users = await readTable('users');

    let dbUser = null;

    // First try matching by _id (works for new tokens)
    if (decoded._id) {
      dbUser = users.find(u => u._id === decoded._id && u.status === 'active');
    }

    // Fallback: match by username (fixes old tokens where _id was null)
    if (!dbUser && decoded.username) {
      dbUser = users.find(u => u.username === decoded.username && u.status === 'active');
    }

    if (!dbUser) {
      return res.status(401).json({ message: 'Session invalid: user profile not found. Please log in again.' });
    }

    // Always use the real database _id (never the potentially-null JWT _id)
    req.user = { ...decoded, _id: dbUser._id, username: dbUser.username };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Session expired or invalid token. Please login again.' });
  }
}
