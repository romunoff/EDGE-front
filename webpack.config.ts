import * as path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { Configuration, HotModuleReplacementPlugin } from 'webpack';
import 'webpack-dev-server';

const webpackConfig: Configuration = {
  mode: 'development',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
  },
  devServer: {
    port: 3000,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new HotModuleReplacementPlugin(),
  ],
  module: {
    rules: [
      {
        exclude: /node_modules/,
        use: 'ts-loader',
        test: /\.ts$/,
      },
    ],
  },
};

export default webpackConfig;
