import React from 'react';
import { KeyRound, Sun, Moon, Sparkles } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onSelectPreset: (keyword: string, plaintext: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  setIsDark,
  onSelectPreset,
}) => {
  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-0.5 shadow-md shadow-indigo-500/20 shrink-0">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 dark:from-white dark:via-cyan-200 dark:to-purple-300 bg-clip-text text-transparent">
                Playfair Cipher
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                Visualizer & Studio
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden md:block">
              Interactive 5×5 Matrix Cryptography Engine
            </p>
          </div>
        </div>

        {/* Theme Toggle & Preset Quick Launch */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectPreset('MONARCHY', 'INSTRUMENT')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 transition-colors"
            title="Load classical Monarchy example"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Preset: MONARCHY</span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
            aria-label="Toggle dark/light theme"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
