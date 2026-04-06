module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#e6f4f5', 100: '#b3dfe1', 200: '#80cace',
          300: '#4db5ba', 400: '#26a5ab', 500: '#0D7377',
          600: '#0b6669', 700: '#09565a', 800: '#07464b',
          900: '#04303c',
        },
        accent: {
          50:  '#fef6ec', 100: '#fde5c8', 200: '#fad4a3',
          300: '#f7c17e', 400: '#f5b263', 500: '#F4A261',
          600: '#e08c47', 700: '#c2712e', 800: '#a35618',
          900: '#7d3d07',
        },
        warm: {
          50: '#fafaf8', 100: '#f4f3ef', 200: '#e8e6df',
          300: '#d6d3c8', 400: '#b8b4a5', 500: '#9a9587',
        },
      },
      borderRadius: {
        '2xl': '1rem', '3xl': '1.5rem', '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 2px 16px 0 rgba(13,115,119,0.08)',
        'card-hover': '0 8px 32px 0 rgba(13,115,119,0.16)',
        'bottom-nav': '0 -4px 24px 0 rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}