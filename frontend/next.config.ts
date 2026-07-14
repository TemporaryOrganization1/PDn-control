import type { NextConfig } from "next";

const basePath =
  process.env.BASE_PATH !== undefined ? process.env.BASE_PATH : "";

const nextConfig: NextConfig = {
  output: "export",

  turbopack: {
    root: __dirname,
  },

  ...(basePath && {
    basePath,
    assetPrefix: basePath,
  }),

  ...(process.env.OUTPUT_MODE === "export" && {
    images: {
      unoptimized: true,
    },
  }),
  allowedDevOrigins: ["*"],

  devIndicators: false,
  poweredByHeader: false,
  reactStrictMode: true,
  async rewrites() {
    const backendOrigin = process.env.BACKEND_ORIGIN;
    if (!backendOrigin) return [];

    return [
      {
        source: "/api/auth/:path*",
        destination: `${backendOrigin}/api/auth/:path*`,
      },
      {
        source: "/api/check",
        destination: `${backendOrigin}/api/check`,
      },
      {
        source: "/api/progress/:path*",
        destination: `${backendOrigin}/api/progress/:path*`,
      },
      {
        source: "/api/reports/:path*",
        destination: `${backendOrigin}/api/reports/:path*`,
      },
      {
        source: "/api/guest/:path*",
        destination: `${backendOrigin}/api/guest/:path*`,
      },
      {
        source: "/api/usage",
        destination: `${backendOrigin}/api/usage`,
      },
      {
        source: "/api/img/:path*",
        destination: `${backendOrigin}/api/img/:path*`,
      },
      {
        source: "/api/workers",
        destination: `${backendOrigin}/api/workers`,
      },
      {
        source: "/api/subscription/:path*",
        destination: `${backendOrigin}/api/subscription/:path*`,
      },
    ];
  },
};

export default nextConfig;
