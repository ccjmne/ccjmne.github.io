import { resolve } from 'path';
import { Configuration } from 'webpack';

import CopyWebpackPlugin from 'copy-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HtmlWebpackPlugin, { MinifyOptions } from 'html-webpack-plugin';
import ImageminPlugin from 'imagemin-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ScriptExtHtmlWebpackPlugin from 'script-ext-html-webpack-plugin';
import StyleExtHtmlWebpackPlugin from 'style-ext-html-webpack-plugin';

import { author, description, keywords, repository } from './package.json';

const HTML_MINIFY_OPTS: MinifyOptions = {
  removeComments: true,
  collapseWhitespace: true,
  conservativeCollapse: true,
  removeAttributeQuotes: true,
  useShortDoctype: true,
  keepClosingSlash: true,
  minifyJS: true,
  minifyCSS: true,
  removeScriptTypeAttributes: true,
};

const assets = resolve(__dirname, 'assets');
const src = resolve(__dirname, 'src');
const sass = resolve(__dirname, 'sass');

export default (_env: string, argv: { mode?: 'production' | 'development', analyze?: boolean }): Configuration => ({
  entry: {
    'main': resolve(src, 'index.ts'),
    'global-styles': resolve(src, 'main.scss'),
  },
  devtool: (argv.mode === 'production' ? false : 'cheap-module-eval-source-map'),
  optimization: {
    usedExports: true,
  },
  module: {
    rules: [{
      test: /\.ttf$/,
      use: [
        { loader: 'file-loader' },
      ],
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env', { targets: { node: 'current' } }],
          ],
          plugins: ['@babel/plugin-syntax-dynamic-import'],
        },
      }],
    }, {
      test: /\.html$/,
      use: [{
        loader: 'html-loader',
        options: {
          attrs: ['img:src', 'img:data-src', 'video:src', 'video:data-src'],
          interpolate: true,
          root: __dirname,
          minimize: argv.mode === 'production' && HTML_MINIFY_OPTS,
        },
      }],
    }, {
      test: /(?<!\.inline)\.s?css$/,
      enforce: 'pre',
      use: [
        { loader: MiniCssExtractPlugin.loader },
      ],
    }, {
      test: /\.s?css$/,
      enforce: 'pre',
      use: [
        { loader: 'css-loader' },
      ],
    }, {
      test: /\.scss$/,
      enforce: 'pre',
      use: [
        { loader: 'sass-loader' },
        { loader: 'sass-resources-loader', options: { resources: resolve(sass, 'scss-inject.scss') } },
      ],
    }, {
      test: /\.(png|jpe?g|gif|ico|webp|mp4)$/,
      use: [
        { loader: 'url-loader', options: { limit: 2048, outputPath: assets } },
      ],
    }, {
      test: /\.svg$/,
      issuer: /\.(html|js)$/,
      use: [
        { loader: 'file-loader', options: { outputPath: assets } },
      ],
    }, {
      test: /\.svg$/,
      issuer: /\.s?css$/,
      use: [
        { loader: 'svg-url-loader' },
      ],
    }, {
      test: /\.(png|jpe?g|gif|ico|svg|webp|mp4)$/,
      enforce: 'pre',
      use: [
        { loader: 'image-webpack-loader' },
      ],
    }],
  },
  plugins: [].concat(
    argv.mode === 'production' ? new CleanWebpackPlugin() : [],
    new CopyWebpackPlugin([{ from: resolve(assets, 'favicons'), to: 'favicons' }]),
    argv.analyze ? new BundleAnalyzerPlugin() : [],
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new HtmlWebpackPlugin({
      template: resolve(__dirname, 'index.html'),
      chunks: ['commons', 'main', 'logo'],
      chunksSortMode: 'manual',
      minify: HTML_MINIFY_OPTS,
      meta: { author, description, repository, keywords: keywords.join(', ') },
    }),
    new ScriptExtHtmlWebpackPlugin({ defaultAttribute: 'defer' }),
    new StyleExtHtmlWebpackPlugin(),
    argv.mode === 'production' ? new ImageminPlugin({}) : [],
  ),
});
