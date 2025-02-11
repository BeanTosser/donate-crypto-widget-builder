// webpack.config.js

const path = require("path");

module.exports = {
  entry: "./src/index.tsx",
  devtool: 'inline-source-map',
  devServer: { 
    static: path.join(__dirname, './build'),
    port: 8080
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.html', '.test', '.css'],
  },
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "build"),
  },
  module: {
    "resolutions": {
      "graceful-fs": "^4.2.11"
    },
    rules: [
        {
          resourceQuery: /raw/,
          use: {
            loader: "raw-loader"
          }
        },
        {
          test: /\/template\/index\.js?/,
          use: {
            loader: "raw-loader"
          }
        },
        {
            test: /\.(?:ts|tsx)$/,
            exclude: ['/node_modules/', '/src/template/'],
            use: {
                loader: 'babel-loader'
            }
        },

        {
          test: /\.ttf$/i, 
          type: 'asset/resource'
        },
    ]
  }
};