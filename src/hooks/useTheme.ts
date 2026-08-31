/**
 * useTheme Hook
 * Hook for managing theme (light/dark/system)
 */

import { useState, useEffect, useContext, createContext } from 'react';
import { DesignTokens, lightTheme, darkTheme, ThemeContextType, ThemeProviderProps } from '../types/theme';

// Create theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider component
export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(defaultTheme);

  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  const getCurrentTheme = (): 'light' | 'dark' => {
    if (theme === 'system') {
      return getSystemTheme();
    }
    return theme;
  };

  const tokens = getCurrentTheme() === 'dark' ? darkTheme : lightTheme;

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const currentTheme = getCurrentTheme();
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(currentTheme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, tokens, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
