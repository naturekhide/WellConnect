/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ["@prisma/client", "next-auth", "lucide-react"],
    },
};

export default nextConfig;