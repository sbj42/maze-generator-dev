var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

function webDemoAlgorithm(algorithmName, algorithmModulePath, outPath) {
    webpack({
        context: __dirname,
        entry: ['./web-demo-main'],
        output: {
            path: outPath,
            filename: 'mgdemo.js'
        },
        resolve: {
            alias: {
                'mg-algorithm': algorithmModulePath
            }
        },
        plugins: [new HtmlWebpackPlugin({
            title: algorithmName + ' demo'
        })]
    }, function() {
    });
}

module.exports = webDemoAlgorithm;
