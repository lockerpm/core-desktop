import type { ModuleOptions } from 'webpack';

export const rules: Required<ModuleOptions>['rules'] = [
  {
    test: /native_modules[/\\].+\.node$/,
    use: 'node-loader',
  },
  {
    test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@vercel/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },
  {
    test: /\.tsx?$/,
    exclude: /(node_modules|\.webpack)/,
    use: {
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
      },
    },
  },
  {
    test: /\.(js|jsx)$/,
    exclude: /(node_modules|\.webpack)/,
    use: {
      loader: 'babel-loader',
      options: { presets: ['@babel/preset-react'] },
    },
  },
  {
    test: /\.svg$/,
    use: [
      {
        loader: 'url-loader',
      },
    ],
  },
  {
    test: /\.(png|jpg|jpeg|webp|gif|svg|mp4)$/,
    use: [
      {
        loader: 'file-loader',
      },
    ],
  },
];
