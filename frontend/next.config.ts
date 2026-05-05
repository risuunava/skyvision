import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow images from external sources (OpenStreetMap tiles, CDN)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.openstreetmap.org' },
      { protocol: 'https', hostname: 'cdnjs.cloudflare.com' },
    ],
  },

  // Transpile leaflet & react-leaflet for SSR compatibility
  transpilePackages: ['leaflet', 'react-leaflet'],

  // Allow cross-origin requests from ML & backend in dev
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
      },
    ];
  },
};

export default nextConfig;
