/* eslint-env node */

const path = require('path')

module.exports = {
    mode: 'production',
    entry: './src/chartjs-cdzt-plugin.js',
    output: {
          path: path.resolve(__dirname, 'dist'),
          filename: 'cdzt.js',
          libraryTarget: 'umd',
          globalObject: 'this',
          library: 'cdzt'
        },
    module: {
          rules: [
                  {
                            test: /\.(js)$/,
                            exclude: /node_modules/,
                            use: 'babel-loader'
                          }
                ]
        }
}
