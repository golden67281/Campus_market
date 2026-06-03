/**
 * Utility helper to normalize image URLs returned to the client.
 * Always uses HTTPS to avoid mixed-content browser warnings.
 * Cloudinary URLs are returned as-is (they are always HTTPS).
 */

/**
 * Gets the correct base URL for the server, always preferring HTTPS.
 * Render (and most cloud hosts) run behind a TLS proxy, so req.protocol
 * returns 'http' even when the public URL is HTTPS. We fix this by
 * checking the X-Forwarded-Proto header.
 */
function getBaseUrl(req) {
  if (process.env.BASE_URL) return process.env.BASE_URL;
  // X-Forwarded-Proto is set by Render/Vercel/Heroku proxies to the real protocol
  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  // Always use HTTPS on production (if proto contains 'https')
  const scheme = proto.includes('https') ? 'https' : proto;
  return `${scheme}://${req.get('host')}`;
}

export function normalizeProduct(product, req) {
  if (!product) return product;

  const normalized = { ...product };
  const baseUrl = getBaseUrl(req);

  if (normalized.images && Array.isArray(normalized.images)) {
    normalized.images = normalized.images.map(img => {
      if (!img) return img;
      // Cloudinary URLs — already absolute HTTPS, return as-is
      if (img.startsWith('https://res.cloudinary.com')) return img;
      // Already absolute URL — fix http → https and fix localhost
      if (img.startsWith('http://') || img.startsWith('https://')) {
        return img
          .replace('http://localhost:5000', baseUrl)
          .replace(/^http:\/\//, 'https://');  // upgrade any http to https
      }
      // Relative path (e.g. '/uploads/products/abc.jpg') — prepend baseUrl
      const leadingSlash = img.startsWith('/') ? '' : '/';
      return `${baseUrl}${leadingSlash}${img}`;
    });
  }

  if (normalized.seller) {
    normalized.seller = normalizeUser(normalized.seller, req);
  }

  return normalized;
}

export function normalizeUser(user, req) {
  if (!user) return user;

  const normalized = { ...user };
  normalized.verified = !!normalized.collegeEmailVerified;

  if (normalized.avatar) {
    const baseUrl = getBaseUrl(req);
    let avatar = normalized.avatar;

    // Cloudinary URLs — already absolute HTTPS, return as-is
    if (avatar.startsWith('https://res.cloudinary.com')) {
      normalized.avatar = avatar;
      return normalized;
    }

    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      avatar = avatar
        .replace('http://localhost:5000', baseUrl)
        .replace(/^http:\/\//, 'https://'); // upgrade http → https
    } else {
      const leadingSlash = avatar.startsWith('/') ? '' : '/';
      avatar = `${baseUrl}${leadingSlash}${avatar}`;
    }
    normalized.avatar = avatar;
  }

  return normalized;
}
