import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    typescript: {
    ignoreBuildErrors: false, // Should be false for production
  },
  eslint: {
    ignoreDuringBuilds: true, // Only if you're skipping linting
  }
};

export default nextConfig;
