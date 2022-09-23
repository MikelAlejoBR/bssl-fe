const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const { SourceMapDevToolPlugin } = require('webpack');

module.exports = {
    devtool: "source-map",

    entry: {
        content_script: { import: './src/content_scripts/content_script.ts', filename: 'content_script.js' },
        background_script: { import: './src/background_scripts/background_script.ts', filename: 'background_script.js' },
    },

    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.tsx?$/,
                use: 'ts-loader',
            },
        ],
    },

    output: {
        filename: '[name][ext]',
        path: path.resolve(__dirname, 'dist'),
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },

    plugins: [
        new CopyPlugin({
            patterns: [
                { from: './src/icons', to: 'icons' },
                { from: './src/manifest.json', to: 'manifest.json' },
            ]
        }),
    ]
}
