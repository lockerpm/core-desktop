const CracoLessPlugin = require('craco-less');
const { styles } = require("@ckeditor/ckeditor5-dev-utils")

const getLoaderByRegex = (loaders, regex) => loaders.find(
  item => !Array.isArray(item.test) && (String(item.test) === String(regex))
)

const cssRegex = /\.css$/
const cssModuleRegex = /\.module\.css$/
const CKEditorRegExp = {
  cssExp: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
  svgExp: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
}

const CKEditor5WebpackConfigPlugin = {
  overrideWebpackConfig: ({ webpackConfig, options = {} }) => {
    const { oneOf } = webpackConfig.module.rules.find(rule => rule.oneOf)
    oneOf.unshift(
      {
        test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
        type: 'asset/source',
      },
      {
        test: CKEditorRegExp.cssExp,
        use: [
          {
            loader: "style-loader",
            options: {
              injectType: "singletonStyleTag"
            }
          },
          'css-loader',
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: styles.getPostCssConfig({
                themeImporter: {
                  themePath: require.resolve("@ckeditor/ckeditor5-theme-lark")
                },
                minify: true
              })
            }
          }
        ]
      }
    )

    // Make sure cssRegex doesn't use loader for CKEditor5
    getLoaderByRegex(oneOf, cssRegex).exclude = [cssModuleRegex, CKEditorRegExp.cssExp]
    // Make sure cssModuleRegex doesn't use loader for CKEditor5
    getLoaderByRegex(oneOf, cssModuleRegex).exclude = [CKEditorRegExp.cssExp]

    return webpackConfig
  }
}

module.exports = {
  babel: {
    plugins: [
      ['import', { libraryName: '@lockerpm/design', libraryDirectory: 'es', style: true }],
    ],
  },
  plugins: [
    {
      plugin: CKEditor5WebpackConfigPlugin
    },
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
