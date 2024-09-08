const path = require('path');

module.exports = {
    entry: './src/index.mjs',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'erm-format.js',
        library: 'erm-format',
        libraryTarget: 'umd',
        globalObject: 'this',
    },
    mode: 'production',
    resolve: {
        fallback: {
            fs: false, // Disable 'fs' for browser builds
        },
    },
};