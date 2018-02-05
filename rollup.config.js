import babel from 'rollup-plugin-babel';
import pkg from './package.json';

export default {
  input: 'src/unstated.js',
  output: [
    {
      file: pkg.main,
      format: 'cjs'
    },
    {
      file: pkg.module,
      format: 'es'
    },
    {
      file: 'lib/unstated.umd.js',
      format: 'umd',
      name: pkg.name,
    }
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
  ],
  plugins: [babel()]
};
