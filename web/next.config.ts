/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      // Supabase storage: add your project hostname, e.g. "abcdefgh.supabase.co"
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/**" },
      { protocol: "https", hostname: "*.supabase.in", pathname: "/storage/v1/object/**" },
    ],
  },
};

module.exports = nextConfig;
