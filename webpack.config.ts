import * as path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { Configuration, HotModuleReplacementPlugin } from 'webpack';
import 'webpack-dev-server';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

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
  resolve: {
    extensions: ['.ts'],
  },
  plugins: [
    new HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.css',
    }),
  ],
  module: {
    rules: [
      {
        exclude: /node_modules/,
        use: 'ts-loader',
        test: /\.ts$/,
      },
      {
        use: [{ loader: MiniCssExtractPlugin.loader }, 'css-loader', 'sass-loader'],
        test: /\.scss$/,
      },
    ],
  },
};

export default webpackConfig;
