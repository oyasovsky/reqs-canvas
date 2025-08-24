/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      typedRoutes: true,
    },
    // Comment out static export for now since we have API routes
    // output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
  };
  export default nextConfig;
  