
export const lightColors = {
  background: "hsl(0 0% 100%)",
  foreground: "hsl(222 47% 11%)",
  card: {
    background: "hsl(0 0% 100%)",
    foreground: "hsl(222 47% 11%)",
  },
  popover: {
    background: "hsl(0 0% 100%)",
    foreground: "hsl(222 47% 11%)",
  },
  primary: {
    DEFAULT: "hsl(221 83% 53%)",
    foreground: "hsl(210 40% 98%)",
  },
  secondary: {
    DEFAULT: "hsl(210 40% 96.1%)",
    foreground: "hsl(222 47% 11%)",
  },
  muted: {
    DEFAULT: "hsl(210 40% 96.1%)",
    foreground: "hsl(215.4 16.3% 46.9%)",
  },
  accent: {
    DEFAULT: "hsl(210 40% 96.1%)",
    foreground: "hsl(222 47% 11%)",
  },
  destructive: {
    DEFAULT: "hsl(0 84.2% 60.2%)",
    foreground: "hsl(210 40% 98%)",
  },
  border: "hsl(214.3 31.8% 91.4%)",
  input: "hsl(214.3 31.8% 91.4%)",
  ring: "hsl(221 83% 53%)",
  sidebar: {
    background: "hsl(0 0% 100%)",
    foreground: "hsl(222 47% 11%)",
    border: "hsl(214.3 31.8% 91.4%)",
    accent: "hsl(210 40% 96.1%)",
    accentForeground: "hsl(222 47% 11%)",
    ring: "hsl(221 83% 53%)",
  },
};

export const darkColors = {
  background: "hsl(240 10% 3.9%)",
  foreground: "hsl(0 0% 98%)",
  card: {
    background: "hsl(240 10% 3.9%)",
    foreground: "hsl(0 0% 98%)",
  },
  popover: {
    background: "hsl(240 10% 3.9%)",
    foreground: "hsl(0 0% 98%)",
  },
  primary: {
    DEFAULT: "hsl(0 0% 98%)",
    foreground: "hsl(240 5.9% 10%)",
  },
  secondary: {
    DEFAULT: "hsl(240 3.7% 15.9%)",
    foreground: "hsl(0 0% 98%)",
  },
  muted: {
    DEFAULT: "hsl(240 3.7% 15.9%)",
    foreground: "hsl(240 5% 64.9%)",
  },
  accent: {
    DEFAULT: "hsl(240 3.7% 15.9%)",
    foreground: "hsl(0 0% 98%)",
  },
  destructive: {
    DEFAULT: "hsl(0 62.8% 30.6%)",
    foreground: "hsl(0 0% 98%)",
  },
  border: "hsl(240 3.7% 15.9%)",
  input: "hsl(240 3.7% 15.9%)",
  ring: "hsl(240 4.9% 83.9%)",
  sidebar: {
    background: "hsl(225 25% 12%)",
    foreground: "hsl(0 0% 98%)",
    border: "hsl(225 25% 18%)",
    accent: "hsl(225 25% 15%)",
    accentForeground: "hsl(0 0% 98%)",
    ring: "hsl(225 25% 25%)",
  },
};

// Utility gradients
export const gradients = {
  card: "bg-gradient-to-br from-card to-secondary/80 backdrop-blur-sm",
  glass: "bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl",
};

// Additional theme colors
export const themeColors = {
  time: {
    primary: "#4F46E5",
    secondary: "#6366F1",
    accent: "#818CF8",
  },
  pastel: {
    green: "#F2FCE2",
    yellow: "#FEF7CD",
    orange: "#FEC6A1",
    purple: "#E5DEFF",
    pink: "#FFDEE2",
    peach: "#FDE1D3",
    blue: "#D3E4FD",
    gray: "#F1F0FB",
  },
  vivid: {
    purple: "#8B5CF6",
    magenta: "#D946EF",
    orange: "#F97316",
    blue: "#0EA5E9",
  },
};

// Export all colors
export const colors = {
  light: lightColors,
  dark: darkColors,
  gradients,
  theme: themeColors,
} as const;

export default colors;
