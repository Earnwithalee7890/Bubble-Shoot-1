/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        // Phaser webpack configuration
        config.resolve.alias = {
            ...config.resolve.alias,
        };
        return config;
    },
    images: {
        domains: [],
    },
};

export default nextConfig;
