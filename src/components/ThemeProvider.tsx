
import React, { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ColorTheme = {
  primary: string
  secondary: string
  accent: string
  background: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  colors: ColorTheme
  setColors: (colors: ColorTheme) => void
}

const defaultColors: ColorTheme = {
  primary: "#9b87f5",
  secondary: "#7E69AB",
  accent: "#6E59A5",
  background: "#1A1F2C",
}

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
  colors: defaultColors,
  setColors: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  const [colors, setColors] = useState<ColorTheme>(() => {
    const savedColors: Partial<ColorTheme> = {};
    Object.keys(defaultColors).forEach((key) => {
      const savedColor = localStorage.getItem(`theme-${key}`);
      if (savedColor) {
        savedColors[key as keyof ColorTheme] = savedColor;
      }
    });
    return { ...defaultColors, ...savedColors };
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);

    // Applica i colori salvati
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }, [theme, colors]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    colors,
    setColors: (newColors: ColorTheme) => {
      Object.entries(newColors).forEach(([key, value]) => {
        localStorage.setItem(`theme-${key}`, value);
      });
      setColors(newColors);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
}
