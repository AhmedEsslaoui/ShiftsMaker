/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/modern-schedule-maker',
  assetPrefix: '/modern-schedule-maker/',
}

module.exports = nextConfig