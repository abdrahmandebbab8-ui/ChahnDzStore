import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeMode } from '../types/store';

interface ThemeContextType {
  themeMode: ThemeMode;
  effectiveTheme: 'dark' | 'light';
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'chahndz_theme_mode';

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'dark',
  effectiveTheme: 'dark',
  setThemeMode: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'dark'; // Default gaming theme
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  // Watch system color-scheme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, []);

  const effectiveTheme: 'dark' | 'light' = useMemo(() => {
    if (themeMode === 'system') {
      return systemIsDark ? 'dark' : 'light';
    }
    return themeMode;
  }, [themeMode, systemIsDark]);

  // Persist preference and synchronize DOM classes/attributes
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch {
      // ignore
    }

    const root = document.documentElement;
    root.setAttribute('data-theme', effectiveTheme);
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [themeMode, effectiveTheme]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const toggleTheme = () => {
    setThemeModeState((prev) => {
      if (prev === 'dark') return 'light';
      return 'dark';
    });
  };

  return (
    <ThemeContext.Provider value={{ themeMode, effectiveTheme, setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
