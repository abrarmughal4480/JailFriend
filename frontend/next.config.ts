import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  },
  async rewrites() {
    return [
      // Rewrite page URLs (like /omnifier) to the dashboard page route
      // This will only apply if the route doesn't match existing routes
      {
        source: '/:slug',
        destination: '/dashboard/pages/:slug',
        has: [
          {
            type: 'header',
            key: 'accept',
            value: '.*text/html.*',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
