import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
    transpilePackages: ["@tailwindcss/postcss"],
    experimental: {
        // This tells Turbopack it's allowed to read the root node_modules
        externalDir: true,
    },
};

export default nextConfig;