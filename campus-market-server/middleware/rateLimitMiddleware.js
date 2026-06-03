// In-memory rate limits map: IP -> array of request timestamps
const limits = new Map();

/**
 * Creates a rate limiting Express middleware.
 * 
 * @param {number} maxRequests Maximum number of requests allowed per window
 * @param {number} windowMs Time window in milliseconds
 */
export function rateLimiter(maxRequests = 100, windowMs = 15 * 60 * 1000) {
  return (req, res, next) => {
    // Read Client IP
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

    // Whitelist localhost/local testing IPs to prevent developer self-blocking
    if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
      return next();
    }

    const now = Date.now();

    if (!limits.has(ip)) {
      limits.set(ip, []);
    }

    // Filter out timestamps outside the active window
    const activeTimestamps = limits.get(ip).filter(timestamp => now - timestamp < windowMs);

    if (activeTimestamps.length >= maxRequests) {
      return res.status(429).json({
        message: 'Too many requests from this device. Please try again later.'
      });
    }

    // Add current request timestamp
    activeTimestamps.push(now);
    limits.set(ip, activeTimestamps);

    next();
  };
}
