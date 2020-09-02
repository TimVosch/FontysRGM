const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  mode: "development",
  entry: {
    server: "./src/server/index.ts",
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].bundle.js",
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
  },
  target: "node",
  devtool: "source-map",
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: "server.tsconfig.json",
            },
          },
        ],
      },
    ],
  },
};
