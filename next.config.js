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
        hostname: '*',
      },
    ],
  },
  // Simplified configuration
  trailingSlash: true,
  basePath: '',
};

module.exports = nextConfig;