module.exports = {
  content: [
    "./{components,contents,popup}/**/*.{js,jsx,ts,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "rgb(9, 9, 11)", // zinc-950
        foreground: "rgb(244, 244, 245)", // zinc-100
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "rgb(39, 39, 42)", // zinc-800
          foreground: "rgb(244, 244, 245)" // zinc-100
        },
        destructive: {
          DEFAULT: "rgb(153, 27, 27)", // red-800
          foreground: "rgb(248, 113, 113)" // red-400
        },
        muted: {
          DEFAULT: "rgb(39, 39, 42)", // zinc-800
          foreground: "rgb(161, 161, 170)" // zinc-400
        },
        accent: {
          DEFAULT: "rgb(39, 39, 42)", // zinc-800
          foreground: "rgb(244, 244, 245)" // zinc-100
        },
        popover: {
          DEFAULT: "rgb(24, 24, 27)", // zinc-900
          foreground: "rgb(244, 244, 245)" // zinc-100
        },
        card: {
          DEFAULT: "rgb(24, 24, 27)", // zinc-900
          foreground: "rgb(244, 244, 245)" // zinc-100
        }
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
}
