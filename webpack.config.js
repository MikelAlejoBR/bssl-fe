const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const { SourceMapDevToolPlugin } = require('webpack');

module.exports = {
    devtool: "source-map",

    entry: './src/background_script.ts',

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
        filename: 'background_script.js',
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
