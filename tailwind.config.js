const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './dist/**/*.html',
    './src/Site/**/*.purs',
    './src/Site/**/*.js',
    './src/components/**/*.purs',
    './src/layouts/**/*.purs',
    './src/pages/**/*.purs',
    './src/posts/**/*.md'
  ],
  darkMode: 'class',
  theme: {
    screens: {
      '2xl': {'max': '1535px'},
      // => @media (max-width: 1535px) { ... }
      'xl': {'max': '1279px'},
      // => @media (max-width: 1279px) { ... }
      'lg': {'max': '1023px'},
      // => @media (max-width: 1023px) { ... }
      'md': {'max': '767px'},
      // => @media (max-width: 767px) { ... }
      'sm': {'max': '639px'},
      // => @media (max-width: 639px) { ... }
    },
    extend: {
      fontFamily: {
        'sans': ['JetBrainsMono', ...fontFamily.sans],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
