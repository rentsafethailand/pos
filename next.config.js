/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')('./src/i18n.ts')

const nextConfig = {
  images: {
    domains: ['localhost', 'your-supabase-url.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = withNextIntl(nextConfig)
