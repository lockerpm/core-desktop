const CracoLessPlugin = require('craco-less');

module.exports = {
  babel: {
    plugins: [
      ['import', { libraryName: '@lockerpm/design', libraryDirectory: 'es', style: true }],
    ],
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              '@primary-color': '#42a5f5',
              '@text-selection-bg': '#1890ff',
            },
            javascriptEnabled: true
          },
        },
      },
    },
  ],
  typescript: {
    enableTypeChecking: false,
  },
};
