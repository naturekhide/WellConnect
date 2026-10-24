/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
    // 🚨 ADD THIS LINE
    serverExternalPackages: ["@vercel/blob"],
    experimental: {
        outputFileTracingIncludes: {
            "/api/**/*": ["./node_modules/.prisma/client/**/*"],
        },
    },
};

export default nextConfig;