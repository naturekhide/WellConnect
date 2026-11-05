// @ts-nocheck
/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },

    webpack: (config, { isServer }) => {
        if (isServer) {
            // Tell Webpack to treat pdfkit as an external CommonJS module
            config.externals.push('pdfkit');
        }
        return config;
    },

    experimental: {
        outputFileTracingIncludes: {
            // Include Prisma client
            "/api/**/*": ["./node_modules/.prisma/client/**/*"],
            // Include PDFKit font files (essential for pdfkit to work)
            "/api/users/export-pdf": [
                "../../node_modules/.pnpm/pdfkit*/node_modules/pdfkit/js/data/*.afm",
                "../../node_modules/.pnpm/pdfkit*/node_modules/pdfkit/js/standard-fonts/*.cjs"
            ]
        },
    },
};

export default nextConfig;