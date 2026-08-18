/**
 * Tailwind is only used by the demo site (src/demo). The datepicker component
 * itself ships fully self-contained, scoped CSS and does NOT require Tailwind
 * in consumer projects.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./index.html', './src/demo/**/*.{vue,js,ts}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
