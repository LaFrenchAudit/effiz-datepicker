import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

// The default build (`vite build`) produces the distributable component library.
// `vite build --mode demo` produces the static demo site (see index.html / src/demo).
export default defineConfig(({ mode }) => {
  const isDemo = mode === 'demo'

  return {
    plugins: [
      vue(),
      // Only emit type declarations and inject CSS for the library build.
      ...(isDemo
        ? []
        : [
            dts({
              include: ['src/index.ts', 'src/components/**/*.vue', 'src/utils/**/*.ts', 'src/types.ts'],
              rollupTypes: true,
              tsconfigPath: './tsconfig.app.json',
            }),
          ]),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    ...(isDemo
      ? {
          base: './',
          build: {
            outDir: 'dist-demo',
          },
        }
      : {
          build: {
            lib: {
              entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
              name: 'EffizDatepicker',
              fileName: 'effiz-datepicker',
              formats: ['es', 'umd'],
            },
            rollupOptions: {
              external: ['vue'],
              output: {
                exports: 'named',
                globals: {
                  vue: 'Vue',
                },
                // Keep a stable name for the standalone stylesheet export.
                assetFileNames: 'effiz-datepicker.[ext]',
              },
            },
          },
        }),
  }
})
