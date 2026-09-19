export const colors = {
  background: '#09070F',
  surface: '#141020',
  surfaceLight: '#1D1630',
  card: '#171226',
  purple: '#9B5CFF',
  purpleBright: '#C084FC',
  violet: '#6D28D9',
  pink: '#F472B6',
  lime: '#B8F500',
  white: '#FAF8FF',
  muted: '#AAA2BD',
  line: '#2D2442',
  danger: '#FF6B81',
};

export const shadow = {
  boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.28)',
  elevation: 7,
};

export const formatPrice = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value);
