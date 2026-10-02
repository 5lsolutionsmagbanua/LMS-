// client/src/context/ThemeContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'

export const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    return (
      localStorage.getItem('theme-mode') === 'dark' ||
      document.documentElement.classList.contains('dark')
    )
  })

  const [colorTheme, setColorTheme] = useState(() => {
    return localStorage.getItem('color-theme') || 'default'
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
      return // Exit early, unable to change color
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
