'use client';

import { useThemeStore } from '../store/themeStore';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 20,
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        fontSize: 18,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme === 'dark' ? '#e2e8f0' : '#1e293b',
        color: theme === 'dark' ? '#1e293b' : '#e2e8f0',
      }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
