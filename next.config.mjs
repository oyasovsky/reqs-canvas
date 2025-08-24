/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      typedRoutes: true,
    },
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
  };
  export default nextConfig;
  