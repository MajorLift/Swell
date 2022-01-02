const path = require('path');
const { LoaderOptionsPlugin } = require('webpack');
const { merge } = require('webpack-merge');
const { spawn } = require('child_process');
const base = require('./webpack.config');

module.exports = merge(base, {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    host: 'localhost',
    port: '8080',
    hot: true,
    proxy: {
      '/webhookServer': {
        target: 'http://localhost:3000',
        secure: false,
      },
      '/webhook': {
        target: 'http://localhost:3000',
        secure: false,
      },
      '/server/**': {
        target: 'http://localhost:3000/',
        secure: false,
      },
    },
    compress: true,
    onBeforeSetupMiddleware() {
      spawn('electron', ['.', 'dev'], {
        shell: true,
        env: process.env,
        stdio: 'inherit',
      })
        .on('close', (code) => process.exit(0))
        .on('error', (spawnError) => console.error(spawnError));
    },
  },
  watchOptions: {
    ignored: /node_modules/,
  },
  plugins: [
    new LoaderOptionsPlugin({
      options: {
        contentBase: path.resolve(__dirname, 'dist'),
        watchContentBase: true,
      },
    }),
  ],
});
