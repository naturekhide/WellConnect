// @ts-nocheck
/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },

    // 👇 Allow images from Vercel Blob
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.public.blob.vercel-storage.com',
            },
        ],
    },

    webpack: (config, { isServer }) => {
        if (isServer) {
            config.externals.push('pdfkit');
        }
        return config;
    },

    experimental: {
        outputFileTracingIncludes: {
            "/api/**/*": ["./node_modules/.prisma/client/**/*"],
            "/api/users/export-pdf": [
                "../../node_modules/.pnpm/pdfkit*/node_modules/pdfkit/js/data/*.afm",
                "../../node_modules/.pnpm/pdfkit*/node_modules/pdfkit/js/standard-fonts/*.cjs"
            ]
        },
    },
};

export default nextConfig;