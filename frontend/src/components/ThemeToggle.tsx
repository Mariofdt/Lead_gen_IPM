import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="btn-futuristic hover-lift glow-cyan relative overflow-hidden group"
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <div className="flex items-center gap-2">
        {isDark ? (
          <>
            <span className="text-lg">☀️</span>
            <span className="hidden sm:inline">Light Mode</span>
          </>
        ) : (
          <>
            <span className="text-lg">🌙</span>
            <span className="hidden sm:inline">Dark Mode</span>
          </>
        )}
      </div>
      
      {/* Effetto hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
    </button>
  );
};
