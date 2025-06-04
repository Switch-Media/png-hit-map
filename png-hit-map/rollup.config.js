import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default [
  // UMD build (for browsers)
  {
    input: 'src/index.ts',
    output: {
      name: 'PngHitMap',
      file: 'dist/index.js',
      format: 'umd',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        sourceMap: true
      }),
      terser()
    ]
  },
  // ESM build (for modern bundlers)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        sourceMap: true
      }),
      terser()
    ]
  }
]; 