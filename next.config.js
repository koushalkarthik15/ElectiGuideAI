const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow external images for candidate photos
      },
    ],
  },
};

module.exports = nextConfig;
