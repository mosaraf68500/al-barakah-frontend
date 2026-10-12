import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Tree-shake barrel imports (lucide icons, motion) into per-module chunks.
  experimental: {
    optimizePackageImports: ['lucide-react', 'motion'],
  },
  // Smaller prod JS; keep warn/error for real issues.
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  poweredByHeader: false,
  images: {
    // Decision 7: allow-list the image hosts referenced by the data (Unsplash, Cloudinary, Google/Firebase-hosted assets, avatars).
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: '**.firebasestorage.app' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
    ],
  },
  async headers() {
    return [
      {
        // Firebase Google popup needs to read window.closed on the opener.
        source: '/:path*',
        headers: [{ key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' }],
      },
    ];
  },
};

export default nextConfig;
