module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            // 👇 This MUST run first to strip TypeScript syntax (like `declare class`)
            '@babel/plugin-transform-typescript',

            // 👇 These run after to handle the class features
            '@babel/plugin-transform-class-properties',
            '@babel/plugin-transform-private-methods',
            '@babel/plugin-transform-private-property-in-object'
        ],
    };
};