/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['vercel.app', 'localhost'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
