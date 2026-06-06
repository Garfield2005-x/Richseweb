/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure next-auth is transpiled so vendor chunks are generated correctly
  transpilePackages: ['next-auth'],
};
module.exports = nextConfig;
