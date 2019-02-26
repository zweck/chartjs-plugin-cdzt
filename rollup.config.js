// rollup.config.js
import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'

export default {
  input: 'src/chartjs-cdzt-plugin.js',
  output: {
    exports: 'named',
    file: 'lib/cdzt.js',
    name: 'cdzt',
    format: 'umd'
  },
  plugins: [
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    }),
    resolve({ browser: true })
  ]
}
