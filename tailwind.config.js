/** @type {import('tailwindcss').Config} */
export default {
  // Archivos a escanear para clases de Tailwind
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // IMPORTANTE: Usamos 'extend' para NO reemplazar los defaults de Tailwind
    // Esto permite que las clases estándar de Tailwind sigan funcionando
    extend: {
      // ========================================
      // COLORES INSTITUCIONALES
      // Colina Campestre School
      // ========================================
      colors: {
        // Paleta principal institucional
        'deep-blue': {
          DEFAULT: '#001D38',
          50: '#E6EBF0',
          100: '#CCD7E1',
          200: '#99AFC3',
          300: '#6687A5',
          400: '#335F87',
          500: '#001D38', // Color base
          600: '#001730',
          700: '#001128',
          800: '#000C20',
          900: '#000618',
        },
        'medium-blue': {
          DEFAULT: '#00386B',
          50: '#E6EFF5',
          100: '#CCDFEB',
          200: '#99BFD7',
          300: '#669FC3',
          400: '#337FAF',
          500: '#00386B', // Color base
          600: '#003260',
          700: '#002C55',
          800: '#00264A',
          900: '#00203F',
        },
        'gold': {
          DEFAULT: '#FFD600',
          50: '#FFFEF0',
          100: '#FFFCE0',
          200: '#FFF9C2',
          300: '#FFF6A3',
          400: '#FFF385',
          500: '#FFD600', // Color base
          600: '#E6C100',
          700: '#CCAC00',
          800: '#B39700',
          900: '#998200',
        },
        // Colores neutrales institucionales
        'light-gray': {
          DEFAULT: '#CFD1D0',
          50: '#F9F9F9',
          100: '#F3F3F3',
          200: '#E7E8E7',
          300: '#DBDCDB',
          400: '#CFD1D0', // Color base
          500: '#B8BAB9',
          600: '#9FA1A0',
          700: '#868887',
          800: '#6D6F6E',
          900: '#545655',
        },
        'off-white': {
          DEFAULT: '#F5F5F5',
          50: '#FFFFFF',
          100: '#FEFEFE',
          200: '#FCFCFC',
          300: '#FAFAFA',
          400: '#F7F7F7',
          500: '#F5F5F5', // Color base
          600: '#E8E8E8',
          700: '#DBDBDB',
          800: '#CECECE',
          900: '#C1C1C1',
        },

        // Orchid Blue - Accent Color (Paleta oficial)
        'orchid-blue': {
          DEFAULT: '#0F2358',
          70: '#0F2358',
          60: '#1A3C57',
          50: '#1F4CC0',
          40: '#4272B7',
          30: '#65A8BF',
          20: '#A4B0F0',
          10: '#CAC9FF',
          5: '#E4F0FF',
        },

        // Additional Colors - The Short Rainbow
        'magenta': {
          DEFAULT: '#F12E78',
          ds: '#F12E78',
          cc: '#A52C5F',
        },
        'peach': {
          DEFAULT: '#FF5B36',
          ds: '#FF5B36',
          cc: '#FF5C3F',
        },
        'yellow': {
          DEFAULT: '#FFD600',
          ds: '#FFD600',
          cc: '#F4B527',
        },
        'tosca': {
          DEFAULT: '#0FCDC8',
          ds: '#0FCDC8',
          cc: '#0FCDC8',
        },

        // Colores de estado (semánticos)
        success: {
          light: '#D4EDDA',
          DEFAULT: '#28A745',
          dark: '#1E7E34',
        },
        warning: {
          light: '#FFF3CD',
          DEFAULT: '#FFC107',
          dark: '#E0A800',
        },
        error: {
          light: '#F8D7DA',
          DEFAULT: '#DC3545',
          dark: '#BD2130',
        },
        info: {
          light: '#D1ECF1',
          DEFAULT: '#17A2B8',
          dark: '#117A8B',
        },
      },

      // ========================================
      // TIPOGRAFÍA
      // ========================================
      fontFamily: {
        // Fuente principal institucional
        nunito: ['Nunito', 'sans-serif'],
        // Alias para mantener compatibilidad
        sans: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Tamaños personalizados basados en el sistema actual
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },

      // ========================================
      // ESPACIADO Y LAYOUT
      // ========================================
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        'sm': '0.25rem',    // 4px
        'DEFAULT': '0.375rem', // 6px
        'md': '0.5rem',     // 8px
        'lg': '0.75rem',    // 12px
        'xl': '1rem',       // 16px
        '2xl': '1.5rem',    // 24px
        '3xl': '2rem',      // 32px
      },

      // ========================================
      // SOMBRAS
      // Inspiradas en el diseño de referencia
      // ========================================
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-active': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'sidebar': '-2px 0 8px 0 rgba(0, 29, 56, 0.1)',
        'dropdown': '0 10px 25px rgba(0, 0, 0, 0.15)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },

      // ========================================
      // TRANSICIONES Y ANIMACIONES
      // ========================================
      transitionDuration: {
        '0': '0ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-in': 'bounceIn 0.5s ease-in-out',
        'ripple': 'ripple 0.6s linear',
        'spin-slow': 'spin 3s linear infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },

      // ========================================
      // BREAKPOINTS PERSONALIZADOS
      // ========================================
      screens: {
        'xs': '475px',
        // sm: 640px (default)
        // md: 768px (default)
        // lg: 1024px (default)
        // xl: 1280px (default)
        '2xl': '1536px',
        '3xl': '1920px',
      },

      // ========================================
      // Z-INDEX
      // ========================================
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        'sidebar': '100',
        'navbar': '200',
        'dropdown': '300',
        'modal': '400',
        'toast': '500',
        'tooltip': '600',
      },
    },
  },
  plugins: [],
  // Configuración para evitar conflictos con CSS existente
  corePlugins: {
    // Mantener preflight activado, pero nuestras variables CSS tienen mayor especificidad
    preflight: true,
  },
}
