import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(222.2 84% 4.9%)",
        foreground: "hsl(210 40% 98%)",
        muted: "hsl(217.2 32.6% 17.5%)",
        mutedForeground: "hsl(215 20.2% 65.1%)",
        border: "hsl(217.2 32.6% 17.5%)",
        primary: "hsl(210 40% 98%)",
        primaryForeground: "hsl(222.2 47.4% 11.2%)",
        destructive: "hsl(0 62.8% 30.6%)",
        destructiveForeground: "hsl(210 40% 98%)"
      }
    }
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.transform-style-3d': {
          'transform-style': 'preserve-3d',
        },
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      }
      addUtilities(newUtilities)
    }
  ]
} satisfies Config;