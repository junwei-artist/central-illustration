/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', '10.5.224.54'],
  },
  experimental: {
    allowedDevOrigins: ['http://10.5.224.54:3000'],
  },
}

module.exports = nextConfig

