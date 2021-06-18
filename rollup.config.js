const { uglify } = require('rollup-plugin-uglify');
const { babel } = require('@rollup/plugin-babel');
const { nodeResolve } = require('@rollup/plugin-node-resolve');

const isProdEnv = process.env.NODE_ENV === 'production';
const extensions = ['.js', '.ts', '.jsx', '.tsx'];

/** @type {import('rollup').RollupOptions} */
module.exports = {
  input: './src/index.ts',
  output: {
    file: './lib/index.js',
    format: 'esm'
  },
  plugins: [
    nodeResolve({
      extensions,
      modulesOnly: true
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      extensions
    }),
    // isProdEnv && uglify()
  ],
  external: ['react', 'react-dom']
};
