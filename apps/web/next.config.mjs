/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        outputFileTracingIncludes: {
            "/api/**/*": ["./node_modules/.prisma/client/**/*"],
        },
    },
};

export default nextConfig;