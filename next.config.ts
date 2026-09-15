import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/wedding-invite-app",
  assetPrefix: "/wedding-invite-app/",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;