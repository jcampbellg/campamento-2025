import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // // Allow assets to be served properly when accessed through a proxy
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/registro' : '',

  // // Ensure server knows to serve static assets from _next path
  // poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  }
}

export default nextConfig
