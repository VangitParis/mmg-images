import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "scontent-fra3-1.xx.fbcdn.net",
      "scontent-fra5-2.xx.fbcdn.net",
      "scontent.xx.fbcdn.net",
      "scontent.cdninstagram.com",
    ],
  },
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
