import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    transpilePackages: ["@tailwindcss/postcss"],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.public.blob.vercel-storage.com',
            },
        ],
    },
};

export default nextConfig;