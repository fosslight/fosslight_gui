/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    fontFamily: {
      body: ['Spoqa Han Sans Neo', 'sans-serif']
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      black: '#000000',
      LGRed: {
        100: '#F7F2F2',
        200: '#F0E4E5',
        300: '#DFC6C8',
        400: '#CEA1A6',
        500: '#BB727B',
        600: '#A50034',
        700: '#94002F',
        800: '#800028',
        900: '#680021',
        1000: '#4A0017'
      },
      LGGray: {
        100: '#F4F4F4',
        200: '#E9E9E9',
        300: '#D1D1D1',
        400: '#B5B5B5',
        500: '#959595',
        600: '#6B6B6B',
        700: '#606060',
        800: '#535353',
        900: '#444444',
        1000: '#303030'
      },
      PaleGray: {
        50: '#F2F4F5',
        100: '#EDEEF0',
        200: '#E7E9EC',
        300: '#D7DADE',
        400: '#BDC1C7',
        500: '#A1A9B0',
        600: '#7F8C96',
        700: '#727C86',
        800: '#626B74',
        900: '#3C4145',
        1000: '#202224'
      },
      Red: {
        100: '#FFF2F2',
        200: '#FFE5E5',
        300: '#FFC8C7',
        400: '#FFA5A4',
        500: '#FF7976',
        600: '#FF2E23',
        700: '#E4291F',
        800: '#C6241B',
        900: '#A11D16',
        1000: '#721510'
      },
      Yellow: {
        100: '#FFFAF2',
        200: '#FFF5E5',
        300: '#FFEAC7',
        400: '#FFDEA4',
        500: '#FFD278',
        600: '#FFC529',
        700: '#E4B025',
        800: '#C69920',
        900: '#A17D1A',
        1000: '#725812'
      },
      Teal: {
        100: '#F2FAF9',
        200: '#E4F6F3',
        300: '#C6ECE6',
        400: '#A2E2D8',
        500: '#74D7CA',
        600: '#17CCBA',
        700: '#15B6A6',
        800: '#129E90',
        900: '#0F8176',
        1000: '#0A5B53'
      },
      Blue: {
        100: '#F2F7FF',
        200: '#E5EFFF',
        300: '#C7DAFF',
        400: '#A4C2FF',
        500: '#77A2FF',
        600: '#2781FF',
        700: '#2373E4',
        800: '#1E64C6',
        900: '#1952A1',
        1000: '#113A72'
      },
      Purple: {
        100: '#F6F3FD',
        200: '#EDE7FB',
        300: '#DACBF6',
        400: '#C4ACF2',
        500: '#AC85EE',
        600: '#904CE9',
        700: '#8144D0',
        800: '#703BB4',
        900: '#5B3093',
        1000: '#402268'
      }
    },
    extend: {
      boxShadow: {
        300: '0px 2px 4px -2px rgba(29, 52, 97, 0.06), 0px 2px 8px -2px rgba(29, 52, 97, 0.10);'
      }
    }
  },
  plugins: [
    ({ addUtilities }) => {
      addUtilities({
        '.draggable': {
          '-webkit-app-region': 'drag'
        },
        '.undraggable': {
          '-webkit-app-region': 'no-drag'
        }
      });
    }
  ]
};
