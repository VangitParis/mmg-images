import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    // Autorise nos URLs locales avec query string (ex: /api/preview?url=...&title=...)
    localPatterns: [{ pathname: "/api/preview" }],
    // On retire temporairement la config domains dépréciée
  },
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
