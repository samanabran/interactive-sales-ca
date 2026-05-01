/**
 * Tailwind CSS v4 Configuration
 * Note: With Tailwind v4, most configuration is done via CSS @theme directive
 * This file only contains non-color extensions
 */

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  
  // Note: Colors are now defined in src/index.css via @theme directive
  // This avoids conflicts with the CSS-based theme system
  
  extend: {
    screens: {
      'xs': '375px',      // Extra small phones
      'sm': '640px',      // Small devices (tablets)
      'md': '768px',      // Medium devices (small laptops)
      'lg': '1024px',     // Large devices (desktops)
      'xl': '1280px',     // Extra large devices
      '2xl': '1536px',    // 2x Extra large devices
      // Custom utility screens
      'coarse': { raw: "(pointer: coarse)" },
      'fine': { raw: "(pointer: fine)" },
      'pwa': { raw: "(display-mode: standalone)" },
      'touch': { raw: "(hover: none) and (pointer: coarse)" },
      'mouse': { raw: "(hover: hover) and (pointer: fine)" },
    },
    borderRadius: {
      sm: "var(--radius-sm)",
      md: "var(--radius-md)",
      lg: "var(--radius-lg)",
      xl: "var(--radius-xl)",
      "2xl": "var(--radius-2xl)",
      full: "var(--radius-full)",
    },
  },
  
  // Dark mode via data attribute (handled in CSS)
  darkMode: ["selector", '[data-appearance="dark"]'],
}
