import type { NextConfig } from "next";
import pkg from "./package.json";

const nextConfig: NextConfig = {
  output: "export",
  // Footer version comes from package.json so the two can't drift.
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
  },
  basePath: process.env.NODE_ENV === "production" ? "/five" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
