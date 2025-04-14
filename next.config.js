/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep output: 'standalone' as it's needed for production
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'primecostwebapp.vercel.app',
      },
      {
        protocol: 'https',
        hostname: '*',
      },
    ],
  },
  // Add trailing slashes to help with routing
  trailingSlash: true,
  // Ensure proper handling of base path
  basePath: '',
  // Add asset prefix for production
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://primecostwebapp.vercel.app' : '',
};

module.exports = nextConfig;