const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const { SourceMapDevToolPlugin } = require("webpack");

module.exports = {
  mode: "development",
  entry: "./src/client/index.tsx",
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].bundle.js",
    chunkFilename: "[name].chunk.js",
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
  },
  target: "web",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.[j|t]sx?$/,
        exclude: /node_modules/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
      {
        test: /.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
          },
          {
            loader: "ts-loader",
            options: {
              configFile: "client.tsconfig.json",
            },
          },
        ],
      },
      {
        test: /.js$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
    ],
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: "src/client/index.html",
    }),
    new SourceMapDevToolPlugin({
      filename: "[file].map",
    }),
  ],
};
