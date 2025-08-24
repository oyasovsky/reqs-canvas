/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      typedRoutes: true,
    },
    output: 'export',
    trailingSlash: true,
    basePath: '/reqs-canvas',
    assetPrefix: '/reqs-canvas',
    images: {
      unoptimized: true,
    },
  };
  export default nextConfig;
  