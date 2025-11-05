/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use isolated build directory to prevent conflicts with other projects
  distDir: '.next-simple-template',
}

module.exports = nextConfig

