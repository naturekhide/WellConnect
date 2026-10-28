/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
    experimental: {
        outputFileTracingIncludes: {
            "/api/**/*": ["./node_modules/.prisma/client/**/*"],
        },
    },
};

export default nextConfig;