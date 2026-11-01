module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            // 👇 This forces Hermes-compatible syntax for private fields
            '@babel/plugin-transform-private-property-in-object',
            '@babel/plugin-transform-class-properties',
            '@babel/plugin-transform-private-methods'
        ],
    };
};