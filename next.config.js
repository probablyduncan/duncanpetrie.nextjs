/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/w',
        destination: '/world',
        permanent: true,
      },
      {
        source: '/a/',
        destination: '/i/all',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
