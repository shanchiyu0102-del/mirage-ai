/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router 已稳定，无需 experimental
  appDir: true,

  images: {
    // 使用 remotePatterns 替代废弃的 domains（更安全）
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.translate.alibaba.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'your-bucket.oss-cn-beijing.aliyuncs.com',
        port: '',
        pathname: '/**',
      },
      // 👇 如果你的 DashScope 图片来自阿里云 OSS，请取消注释并替换为实际域名
      // {
      //   protocol: 'https',
      //   hostname: 'dashscope-result-bj.oss-cn-beijing.aliyuncs.com',
      //   port: '',
      //   pathname: '/**',
      // },
    ],
  },
}

module.exports = nextConfig