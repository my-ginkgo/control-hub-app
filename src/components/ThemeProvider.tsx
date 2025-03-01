
import React, { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light"

type ThemeColors = {
  primary: string
  secondary: string
  accent: string
  background: string
}

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  colors: ThemeColors
  setColors: (colors: ThemeColors) => void
}

const defaultColors: ThemeColors = {
  primary: "#9b87f5",    // Purple
  secondary: "#7E69AB",  // Secondary Purple
  accent: "#6E59A5",     // Darker Purple
  background: "#1A1F2C", // Dark Background
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

  const [colors, setColors] = useState<ThemeColors>(() => {
    const savedColors = localStorage.getItem("theme-colors")
    return savedColors ? JSON.parse(savedColors) : defaultColors
  })

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
    localStorage.setItem(storageKey, theme)
  }, [theme, storageKey])

  useEffect(() => {
    localStorage.setItem("theme-colors", JSON.stringify(colors))
    const root = document.documentElement.style
    Object.entries(colors).forEach(([key, value]) => {
      root.setProperty(`--${key}`, value)
    })
  }, [colors])

  const value = {
    theme,
    setTheme,
    colors,
    setColors,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
