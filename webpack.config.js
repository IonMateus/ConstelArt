const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js', // Ponto de entrada do aplicativo
  output: {
    path: path.resolve(__dirname, 'dist'), // Pasta de saída
    filename: 'bundle.js', // Nome do arquivo empacotado
    clean: true, // Limpa a pasta de saída antes de cada build
  },
  mode: 'development', // Modo de desenvolvimento
  devServer: {
    static: './dist',
    port: 8080,
    open: true, // Abre o navegador automaticamente
  },
  module: {
    rules: [
      {
        test: /\.css$/i, // Para arquivos CSS
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i, // Para imagens
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', // Template HTML
    }),
  ],
};
