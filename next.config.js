/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['cdn.translate.alibaba.com', 'your-bucket.oss-cn-beijing.aliyuncs.com'],
  },
}

module.exports = nextConfig