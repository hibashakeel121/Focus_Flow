import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const themes = {
  light: {
    name: 'Light',
    bg: 'bg-gray-100 text-gray-900',
    card: 'bg-white border-gray-200 shadow-md text-gray-800',
    navbar: 'bg-white border-b border-gray-200 text-gray-800',
    navActive: 'bg-blue-600 text-white',
    navInactive: 'text-gray-600 hover:bg-gray-100',
  },
  dark: {
    name: 'Dark',
    bg: 'bg-gray-950 text-gray-100',
    card: 'bg-gray-900 border-gray-800 shadow-xl text-gray-100',
    navbar: 'bg-gray-900 border-b border-gray-800 text-gray-100',
    navActive: 'bg-indigo-600 text-white',
    navInactive: 'text-gray-400 hover:bg-gray-800',
  },
  aesthetic: {
    name: 'Aesthetic',
    bg: 'bg-rose-50 text-rose-950',
    card: 'bg-white/80 backdrop-blur-md border-rose-200 shadow-lg text-rose-900 rounded-2xl',
    navbar: 'bg-pink-100/70 backdrop-blur-md border-b border-pink-200 text-rose-900',
    navActive: 'bg-rose-400 text-white shadow-sm',
    navInactive: 'text-rose-700 hover:bg-rose-200/50',
  },
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeStyles: themes[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);