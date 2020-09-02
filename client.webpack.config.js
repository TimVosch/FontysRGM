const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const { SourceMapDevToolPlugin } = require("webpack");

module.exports = {
  mode: "development",
  entry: "./src/client/index.ts",
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].bundle.js",
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
  },
  target: "web",
  module: {
    rules: [
      {
        test: /\.[j|t]s$/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
      {
        test: /.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: "client.tsconfig.json",
            },
          },
        ],
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
