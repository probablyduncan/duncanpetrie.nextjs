/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/w/index',
        destination: '/w',
        permanent: true,
      },
      {
        source: '/w/cultures',
        destination: '/w?filter=cultures',
        permanent: true,
      },
      {
        source: '/w/towns',
        destination: '/w?filter=towns',
        permanent: true,
      },
      {
        source: '/w/regions',
        destination: '/w?filter=regions',
        permanent: true,
      },
      {
        source: '/w/stories',
        destination: '/w?filter=stories',
        permanent: true,
      },
      {
        source: '/a',
        destination: '/i/all',
        permanent: true,
      },
      {
        source: '/i',
        destination: '/i/all',
        permanent: true,
      },
    ]
  },
  transpilePackages: ["geist"],
}

module.exports = nextConfig
