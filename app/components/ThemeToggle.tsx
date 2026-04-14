'use client';

import { useThemeStore } from '../store/themeStore';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        height: 28,
        borderRadius: 5,
        border: '1px solid var(--jf-panel-border, #333)',
        cursor: 'pointer',
        fontSize: 11,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: '0 8px',
        backgroundColor: 'var(--jf-surface, #1e1e1e)',
        color: isDark ? 'var(--jf-text-secondary, #ccc)' : '#f59e0b',
        transition: 'background 0.15s ease, border-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--jf-surface-hover, #2a2a2a)';
        e.currentTarget.style.borderColor = 'var(--jf-panel-border-strong, #555)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--jf-surface, #1e1e1e)';
        e.currentTarget.style.borderColor = 'var(--jf-panel-border, #333)';
      }}
    >
      {isDark ? '\u2600' : '\u263E'}
    </button>
  );
}
