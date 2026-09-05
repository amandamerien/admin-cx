import preset from '@repo/ui/tailwind-preset'
import type { Config } from 'tailwindcss'

export default {
  presets: [preset],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        /* A área de clientes marca a fonte explicitamente (font-inter) em vez
           de herdar de `sans` — o token vem do site de origem. */
        inter: ['Inter', 'sans-serif'],
      },
      /* O Tailwind v3 só gera o modificador de opacidade (`border-white/8`)
         para valores presentes nesta escala. A área de clientes foi escrita no
         v4, que aceita qualquer número — estes são os degraus que ela usa. */
      opacity: {
        2: '0.02',
        3: '0.03',
        4: '0.04',
        6: '0.06',
        8: '0.08',
        12: '0.12',
        15: '0.15',
        16: '0.16',
      },
    },
  },
} satisfies Config
