import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

const THEME_KEY = 'gamecube_theme';
const darkPalette = {
  background: '#09070F',
  surface: '#141020',
  surfaceLight: '#1D1630',
  card: '#171226',
  purple: '#9B5CFF',
  purpleBright: '#C084FC',
  violet: '#6D28D9',
  pink: '#F472B6',
  lime: '#B8F500',
  ink: '#08070C',
  white: '#FAF8FF',
  muted: '#AAA2BD',
  line: '#2D2442',
  danger: '#FF6B81',
};
const lightPalette = {
  background: '#F5F3FA',
  surface: '#FFFFFF',
  surfaceLight: '#EEEAF5',
  card: '#FFFFFF',
  purple: '#7541B7',
  purpleBright: '#7541B7',
  violet: '#7040B5',
  pink: '#D83D86',
  lime: '#9AC500',
  ink: '#211C2C',
  white: '#201A2D',
  muted: '#6F687D',
  line: '#DDD7E8',
  danger: '#C92E4D',
};

let activeTheme = 'dark';

export const colors = {};
Object.defineProperties(colors, Object.fromEntries(Object.keys(darkPalette).map((key) => [
  key,
  { enumerable: true, get: () => (activeTheme === 'light' ? lightPalette : darkPalette)[key] },
])));

const adaptiveColorMap = {
  ...Object.fromEntries(Object.keys(darkPalette).map((key) => [darkPalette[key].toLowerCase(), lightPalette[key]])),
  '#100c1a': lightPalette.surface,
  '#202911': '#EEF4DC',
  '#354516': '#D7E5B5',
  '#28320b': '#E5EECB',
  '#423817': '#F5EDD1',
  '#203b27': '#E2F1E3',
  '#46232b': '#F7E5E8',
  '#693440': '#E9C9D0',
  '#321a25': '#FBECEF',
  '#ded5ee': '#5C536B',
  '#e7daff': '#5C536B',
  '#c1b8d0': lightPalette.muted,
};

export function createAdaptiveStyles(definitions) {
  const styles = StyleSheet.create(definitions);
  return new Proxy(styles, {
    get(target, key, receiver) {
      const style = Reflect.get(target, key, receiver);
      if (!style || typeof style !== 'object') return style;
      const adaptiveStyle = { ...style };
      return new Proxy(adaptiveStyle, {
        get(styleTarget, property, styleReceiver) {
          const value = Reflect.get(styleTarget, property, styleReceiver);
          if (activeTheme === 'light' && typeof value === 'string') return adaptiveColorMap[value.toLowerCase()] || value;
          return value;
        },
      });
    },
  });
}

const ThemeContext = createContext({ themeMode: 'dark', toggleTheme: () => {}, ready: true });

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState('dark');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(THEME_KEY).then((savedTheme) => {
      if (!mounted) return;
      const nextTheme = savedTheme === 'light' ? 'light' : 'dark';
      activeTheme = nextTheme;
      setThemeMode(nextTheme);
    }).catch((error) => {
      console.warn('No se pudo recuperar el tema guardado:', error);
    }).finally(() => {
      if (mounted) setReady(true);
    });
    return () => { mounted = false; };
  }, []);

  const toggleTheme = () => {
    const nextTheme = themeMode === 'dark' ? 'light' : 'dark';
    activeTheme = nextTheme;
    setThemeMode(nextTheme);
    AsyncStorage.setItem(THEME_KEY, nextTheme).catch((error) => console.warn('No se pudo guardar el tema:', error));
  };

  const value = useMemo(() => ({ themeMode, toggleTheme, ready }), [themeMode, ready]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export const shadow = {
  boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.28)',
  elevation: 7,
};

export const formatPrice = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value);
