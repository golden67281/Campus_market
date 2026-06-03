/**
 * Utility helper to normalize image URLs returned to the client.
 * Replaces hardcoded localhost values with the current request protocol and host,
 * and prepends base URLs for relative local files.
 */

export function normalizeProduct(product, req) {
  if (!product) return product;

  // Clone product to avoid modifying memory cache directly
  const normalized = { ...product };

  // Determine current host base URL
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

  if (normalized.images && Array.isArray(normalized.images)) {
    normalized.images = normalized.images.map(img => {
      if (!img) return img;
      if (img.startsWith('http://') || img.startsWith('https://')) {
        // If it points to localhost:5000 but the host is different (e.g. Render), replace it
        if (img.includes('localhost:5000')) {
          return img.replace('http://localhost:5000', baseUrl);
        }
        return img;
      }
      // If it is a relative path (e.g. 'uploads/...'), prepend baseUrl
      const leadingSlash = img.startsWith('/') ? '' : '/';
      return `${baseUrl}${leadingSlash}${img}`;
    });
  }

  // Handle seller details avatar if present
  if (normalized.seller) {
    normalized.seller = normalizeUser(normalized.seller, req);
  }

  return normalized;
}

export function normalizeUser(user, req) {
  if (!user) return user;

  const normalized = { ...user };
  if (normalized.avatar) {
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    let avatar = normalized.avatar;
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      if (avatar.includes('localhost:5000')) {
        avatar = avatar.replace('http://localhost:5000', baseUrl);
      }
    } else {
      const leadingSlash = avatar.startsWith('/') ? '' : '/';
      avatar = `${baseUrl}${leadingSlash}${avatar}`;
    }
    normalized.avatar = avatar;
  }
  return normalized;
}
