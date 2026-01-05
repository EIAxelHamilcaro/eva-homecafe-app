/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "../../packages/ui/src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // HomeCafe Brand Colors
        homecafe: {
          pink: "#FFB6C1",
          "pink-light": "#FFE4E8",
          "pink-dark": "#E91E63",
          cream: "#FFF8F0",
          beige: "#F5E6D3",
          green: "#4CAF50",
          "green-light": "#C8E6C9",
          orange: "#FF9800",
          "orange-light": "#FFE0B2",
        },
        // Semantic Colors
        background: "#FFFAF5",
        foreground: "#3D2E2E",
        card: "#FFFFFF",
        "card-foreground": "#3D2E2E",
        popover: "#FFFFFF",
        "popover-foreground": "#3D2E2E",
        primary: "#FFB6C1",
        "primary-foreground": "#FFFFFF",
        secondary: "#F5E6D3",
        "secondary-foreground": "#5D4E4E",
        muted: "#F5F0EB",
        "muted-foreground": "#8D7E7E",
        accent: "#FF9800",
        "accent-foreground": "#3D2E2E",
        destructive: "#E53935",
        "destructive-foreground": "#FFFFFF",
        success: "#4CAF50",
        "success-foreground": "#FFFFFF",
        warning: "#FF9800",
        "warning-foreground": "#3D2E2E",
        border: "#E8DED4",
        input: "#F5F0EB",
        ring: "#FFB6C1",
      },
      borderRadius: {
        sm: "8px",
        md: "10px",
        lg: "12px",
        xl: "16px",
      },
    },
  },
  plugins: [],
};
