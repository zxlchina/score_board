import type { NextConfig } from "next";

const basePath = process.env.NEXT_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: basePath || undefined,
  trailingSlash: true,
};

export default nextConfig;
