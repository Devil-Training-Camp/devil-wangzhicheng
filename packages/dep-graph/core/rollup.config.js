import typescript from 'rollup-plugin-typescript2'
import commonjs from '@rollup/plugin-commonjs'
import externals from 'rollup-plugin-node-externals'

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'es'
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json'
    }),
    commonjs(),
    externals()
  ]
}
