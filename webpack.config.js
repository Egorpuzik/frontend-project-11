import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url)); 
const isProduction = process.env.NODE_ENV === 'production'; 

export default {
  mode: isProduction ? 'production' : 'development', 
  entry: './src/index.js', 
  output: {
    filename: '[name].[contenthash].js',  // Добавлен хэш для уникальности
    path: path.resolve(__dirname, 'dist'), 
    clean: true, 
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './index.html' }), 
    new MiniCssExtractPlugin({ filename: '[name].[contenthash].css' }),  // Добавлен хэш для CSS
  ],
  module: {
    rules: [
      {
        test: /\.css$/i, 
        use: [MiniCssExtractPlugin.loader, 'css-loader'], 
      },
    ],
  },
  optimization: {
    splitChunks: { chunks: 'all' },  // Код разделяется на чанки
  },
  devServer: {
    static: './dist',  // Путь для статики
  },
};

