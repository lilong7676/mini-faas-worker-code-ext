//@ts-check
"use strict";

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/
/** @typedef {import('webpack-dev-server').Configuration} DevServerConfiguration **/

const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const myCopyWebpackPlugin = require("./copy-webpack-plugin");

const NODE_ENV = process.env.NODE_ENV;

// env
const dotenv = require("dotenv");
const env = dotenv.config({
  path: path.resolve(process.cwd(), `.${NODE_ENV}.env`),
}).parsed;
if (!env) {
  throw new Error('no env!');
}
const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

console.log('---envKeys', envKeys);

const PORT = env?.DEV_PORT || 9000;

/** @type WebpackConfig */
const webExtensionConfig = {
  mode: "none", // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
  entry: {
    app: "./src/index.tsx",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(process.cwd(), "dist"),
    // path: path.resolve(process.cwd(), "../../resources/web"),
    publicPath: "/",
  },
  resolve: {
    extensions: [".tsx",".ts", ".js"],
    alias: {
      // provides alternate implementation for node module and source files
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new myCopyWebpackPlugin({
      dest: path.resolve(process.cwd(), "../../resources/web"),
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: "sandpack client",
      template: "src/index.html",
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1, // disable chunks by default since web extensions must be a single bundle
    }),
    new webpack.DefinePlugin(envKeys),
  ],
  externals: {},
  performance: {
    hints: false,
  },
  devtool: "nosources-source-map", // create a source map that points to the original source file
  infrastructureLogging: {
    level: "log", // enables logging required for problem matchers
  },
  devServer: {
    hot: false,
    liveReload: true,
    static: {
      directory: path.join(__dirname, "public"),
    },
    compress: true,
    port: PORT,
    allowedHosts: "all",
    client: {
      webSocketURL: {
        hostname: "localhost",
        port: PORT,
        protocol: "ws",
        pathname: "/ws",
      },
    },
    watchFiles: [
      "src/**/*",
      "node_modules/@codesandbox/sandpack-client/dist/**/*",
    ],
    devMiddleware: {
      writeToDisk: true,
    },
  },
};

module.exports = [webExtensionConfig];
