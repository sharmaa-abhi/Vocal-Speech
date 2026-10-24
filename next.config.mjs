/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  // Export plain static files: no API routes, server actions, or runtime app server.
  output: "export",
  trailingSlash: true,
  transpilePackages: ["three"]
};
export default nextConfig;
