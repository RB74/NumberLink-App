// FILE: src/theme.ts
// Shared design tokens for consistent UI

export const theme = {
  colors: {
    background: '#f5f2eb',
    surface: '#ffffff',
    surfaceElevated: '#ffffff',
    primary: '#b8860b',
    primaryPressed: '#8b6914',
    secondary: '#2d5a4a',
    secondaryPressed: '#234a3d',
    success: '#2d6a4f',
    error: '#b91c1c',
    text: '#1c1917',
    textSecondary: '#57534e',
    textMuted: '#78716c',
    border: '#e7e5e4',
    borderStrong: '#d6d3d1',
    overlay: 'rgba(28, 25, 23, 0.6)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    full: 9999,
  },
  typography: {
    title: { fontSize: 26, fontWeight: '700' as const },
    titleSmall: { fontSize: 20, fontWeight: '700' as const },
    body: { fontSize: 16, fontWeight: '500' as const },
    bodySmall: { fontSize: 14, fontWeight: '500' as const },
    caption: { fontSize: 13, fontWeight: '400' as const },
    label: { fontSize: 14, fontWeight: '600' as const },
  },
  shadow: {
    sm: {
      shadowColor: '#1c1917',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#1c1917',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: '#1c1917',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 8,
    },
  },
};

export type Theme = typeof theme;
