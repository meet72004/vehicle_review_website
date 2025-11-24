/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["imgd.aeplcdn.com"], // allow carwale images
  },

  // ✅ Add this block
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
