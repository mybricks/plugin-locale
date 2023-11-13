const commonjs = require('@rollup/plugin-commonjs')
const typescript = require('rollup-plugin-typescript2')
const json = require('@rollup/plugin-json')
const path = require('path')
const { babel } = require('@rollup/plugin-babel')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const postcss = require('rollup-plugin-postcss')
const less = require('less')

const packageJson = require('./package.json')

const babelOptions = {
  presets: ['@babel/preset-env'],
  extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss'],
  exclude: '**/node_modules/**',
}

const processLess = function (context, payload) {
  return new Promise((resolve, reject) => {
    less.render(
      {
        file: context,
      },
      function (err, result) {
        if (!err) {
          resolve(result)
        } else {
          reject(err)
        }
      }
    )
    less.render(context, {}).then(
      function (output) {
        // output.css = string of css
        // output.map = string of sourcemap
        // output.imports = array of string filenames of the imports referenced
        if (output && output.css) {
          resolve(output.css)
        } else {
          reject({})
        }
      },
      function (err) {
        reject(err)
      }
    )
  })
}

module.exports = [
  {
    input: path.resolve(__dirname, 'src/index.tsx'),
    output: [
      { file: path.resolve(__dirname, packageJson.module), format: 'esm' },
    ],
    external: ['react', 'react-dom'],
    plugins: [
      postcss({
        extract: false,
        modules: true,
        process: processLess,
      }),
      // nodeResolve(),
      commonjs(),
      typescript({
        check: false, // 不检查ts报错
      }),
      json(),
      babel(babelOptions),
    ],
  },
  {
    input: path.resolve(__dirname, 'src/index.tsx'),
    output: [
      { file: path.resolve(__dirname, packageJson.main), format: 'umd', name: packageJson.name },
    ],
    external: [
      'react',
      'react-dom',
      'antd'
    ],
    plugins: [
      postcss({
        extract: false,
        modules: true,
        process: processLess,
      }),
      // nodeResolve(),
      commonjs(),
      typescript({
        check: false, // 不检查ts报错
      }),
      json(),
      babel(babelOptions),
    ],
  }
]
