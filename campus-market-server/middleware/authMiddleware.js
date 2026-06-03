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
    
    // Verify that the user still exists and is active in the database
    const users = await readTable('users');
    const userExists = users.some(u => u._id === decoded._id && u.status === 'active');
    if (!userExists) {
      return res.status(401).json({ message: 'Session invalid: user profile not found. Please log in again.' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Session expired or invalid token. Please login again.' });
  }
}
