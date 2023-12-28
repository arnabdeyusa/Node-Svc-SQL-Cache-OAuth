 const path = require('path');
 const CopyWebpackPlugin = require("copy-webpack-plugin");
 const SwaggerJSDocWebpackPlugin = require('./plugins');
 //const TerserPlugin = require('terser-webpack-plugin')
 const nodeExternals = require('webpack-node-externals');



module.exports = { 
  externals: [nodeExternals()],
  target: 'node',
  entry: ["babel-polyfill", "./server.js"],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
   
  },
   module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, 'app')],
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['babel-preset-env'],
        },
      }
    ],
  },
     resolve: {
    extensions: ['.js', '.json'],
    modules: ['node_modules', 'app'],
  },
     node: {
    __dirname: false
  },
  plugins: [
    new CopyWebpackPlugin(
        [
            './node_modules/swagger-ui-dist/swagger-ui.css',
            './node_modules/swagger-ui-dist/swagger-ui-bundle.js',
            './node_modules/swagger-ui-dist/swagger-ui-standalone-preset.js',
            './node_modules/swagger-ui-dist/favicon-16x16.png',
            './node_modules/swagger-ui-dist/favicon-32x32.png'
        ]
    ),
],
};
