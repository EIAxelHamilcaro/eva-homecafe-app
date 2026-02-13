import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@packages/ui", "@packages/drizzle", "@packages/ddd-kit"],
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    unoptimized: process.env.NODE_ENV === "development",
  },
  webpack: (config) => {
    // Prioritize .web.tsx over .tsx for web platform
    // Order: .web.tsx -> .tsx -> .ts -> .js
    config.resolve.extensions = [
      ".web.tsx",
      ".web.ts",
      ".web.js",
      ...config.resolve.extensions,
    ];
    return config;
  },
};

const withNextIntl = createNextIntlPlugin("./common/i18n/request.ts");

export default withNextIntl(nextConfig);
