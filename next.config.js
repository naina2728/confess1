/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false,
  },
  // Ensure proper app directory configuration
  experimental: {
    // Remove this if using stable App Router
  },
  // Ensure static export is not enabled (causes routes manifest issues)
  trailingSlash: false,
  // Ensure proper image optimization
  images: {
    domains: ['confess1.vercel.app'],
  },
}

module.exports = nextConfig
