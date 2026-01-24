import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 禁用 React StrictMode 以解决 Supabase SDK 的 AbortError 问题
  // 这是 React 18 + Supabase 的已知兼容性问题
  // 生产环境不受影响，此配置仅影响开发体验
  reactStrictMode: false,
};

export default nextConfig;
