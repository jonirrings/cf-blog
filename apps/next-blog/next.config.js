/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  distDir: "../dist/next",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // 禁用构建时的类型检查
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
