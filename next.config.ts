import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 生成自包含的服务端产物，用于 Docker 部署
  output: "standalone",
  // better-sqlite3 通过 bindings 动态查找 .node，需要显式声明才能打进 standalone
  outputFileTracingIncludes: {
    "/**": ["./node_modules/better-sqlite3/**/*.node"],
  },
};

export default nextConfig;
