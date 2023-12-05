import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

rules.push({
  test: /\.(css|s[ac]ss)$/,
  use: [
    { loader: 'url-loader' },
    { loader: 'style-loader' },
    { loader: 'css-loader' },
    {
      loader: 'sass-loader',
      options: {
        sourceMap: true,
      },
    },
  ],
});

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
