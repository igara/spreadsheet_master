const path = require("path");
const GasPlugin = require("gas-webpack-plugin");
const Es3ifyPlugin = require("es3ify-webpack-plugin");
const glob = require("glob");
const entries = {};
glob.sync("./**/*.ts", {
  cwd: "./src/gas"
}).map((fileName) => {
  entries[fileName] = path.resolve("./src/gas", fileName);
});
console.log(entries)
module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  context: __dirname,
  entry: entries,
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: '[name].js',
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.[tj]s$/,
        loader: "babel-loader",
      },
      {
        test: /\.(yml)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]"
            }
          }
        ]
      },
    ],
  },
  plugins: [new GasPlugin(), new Es3ifyPlugin()],
  resolve: {
    extensions: [".ts", ".json"],
    alias: {
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@src": path.resolve(__dirname, "./src"),
      "@root": path.resolve(__dirname, "./"),
    },
  },
};
