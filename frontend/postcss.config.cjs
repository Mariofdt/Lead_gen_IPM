// PostCSS config (CommonJS) compatibile con Vite e Tailwind v4
module.exports = {
  plugins: [require('@tailwindcss/postcss')(), require('autoprefixer')()],
};



