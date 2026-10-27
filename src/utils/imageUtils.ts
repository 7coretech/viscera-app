/**
 * Utility to normalize and fix profile image URLs.
 * Handles:
 * - Direct URLs
 * - URLs missing the DigitalOcean Spaces bucket subdomain (e.g. sfo3.cdn.digitaloceanspaces.com/viscera/...)
 * - Object with .url property
 */
export const cleanProfileImageUrl = (url: any): string | null => {
  if (!url) return null;
  const rawUrl = typeof url === 'string' ? url : url?.url;
  if (!rawUrl || typeof rawUrl !== 'string') return null;

  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return null;

  // Fix DigitalOcean Spaces CDN URLs where bucket was put in path instead of subdomain
  if (trimmed.includes('.cdn.digitaloceanspaces.com/viscera/')) {
    return trimmed.replace(
      /https:\/\/([a-z0-9-]+)\.cdn\.digitaloceanspaces\.com\/viscera\//gi,
      'https://viscera.$1.cdn.digitaloceanspaces.com/'
    );
  }

  // Fix direct sfo3 CDN URL
  if (trimmed.includes('https://sfo3.cdn.digitaloceanspaces.com/viscera/')) {
    return trimmed.replace(
      'https://sfo3.cdn.digitaloceanspaces.com/viscera/',
      'https://viscera.sfo3.cdn.digitaloceanspaces.com/'
    );
  }

  // Fix direct sfo3 spaces URL if needed
  if (trimmed.includes('https://sfo3.digitaloceanspaces.com/viscera/')) {
    return trimmed.replace(
      'https://sfo3.digitaloceanspaces.com/viscera/',
      'https://viscera.sfo3.cdn.digitaloceanspaces.com/'
    );
  }

  return trimmed;
};
