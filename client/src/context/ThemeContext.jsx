// client/src/context/ThemeContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { DEFAULT_THEME, THEME_IDS } from '../config/themeOptions'

export const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    return (
      localStorage.getItem('theme-mode') === 'dark' ||
      document.documentElement.classList.contains('dark')
    )
  })

  // Validate the saved theme so an unknown or outdated value falls back to the default
  const [colorTheme, setColorTheme] = useState(() => {
    const saved = localStorage.getItem('color-theme')
    return THEME_IDS.includes(saved) ? saved : DEFAULT_THEME
  })

  // Optional: A flag to lock/disable theme changes if needed (e.g., user role restriction)
  const [isThemeLocked, setIsThemeLocked] = useState(false)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme-mode', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme-mode', 'light')
    }
  }, [isDark])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', colorTheme)
    localStorage.setItem('color-theme', colorTheme)
  }, [colorTheme])

  // Function to handle color changes with a safety lock check
  const handleThemeChange = (newTheme) => {
    if (isThemeLocked) {
      console.warn('Theme changes are currently locked.')
      return
    }
    if (!THEME_IDS.includes(newTheme)) {
      console.warn(`Unknown theme: ${newTheme}`)
      return
    }
    setColorTheme(newTheme)
  }

  const toggleDarkMode = () => {
    if (isThemeLocked) return
    setIsDark((prev) => !prev)
  }

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        colorTheme,
        toggleDarkMode,
        handleThemeChange,
        isThemeLocked,
        setIsThemeLocked,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

// Custom hook exported directly from the same file
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
