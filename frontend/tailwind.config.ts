import type { Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultConfig"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        // Civic theme colors
        saffron: "#FF9933",
        "india-green": "#138808",
        navy: "#000080",
        "civic-light": "#F5F5F5",
        "civic-dark": "#1a1a1a",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideInRight: {
          from: { transform: "translateX(20px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        slideInLeft: {
          from: { transform: "translateX(-20px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        fadeIn: "fadeIn 0.5s ease-in",
        slideInRight: "slideInRight 0.3s ease-out",
        slideInLeft: "slideInLeft 0.3s ease-out",
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        noto: ["var(--font-noto-sans)", ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        "civic-sm": "0 1px 2px 0 rgba(255, 153, 51, 0.05)",
        "civic-md": "0 4px 6px -1px rgba(19, 136, 8, 0.1)",
        "civic-lg": "0 10px 15px -3px rgba(0, 0, 128, 0.1)",
        "civic-xl": "0 20px 25px -5px rgba(255, 153, 51, 0.15)",
      },
      backgroundImage: {
        "gradient-civic": "linear-gradient(135deg, #FF9933 0%, #138808 50%, #000080 100%)",
        "gradient-civic-light": "linear-gradient(135deg, #FFE4CC 0%, #E8F5E9 50%, #E0E8F0 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
