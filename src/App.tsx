import React, { useState, useEffect } from 'react';
import { ToastProvider } from './components/Toast';
import { Header } from './components/Header';
import { CipherStudio } from './components/CipherStudio';

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(true);

  // Preset loading state for studio
  const [presetKey, setPresetKey] = useState<string>('MONARCHY');
  const [presetText, setPresetText] = useState<string>('INSTRUMENT');

  useEffect(() => {
    // Set initial dark mode on mount
    document.documentElement.classList.add('dark');
  }, []);

  const handleSelectPreset = (key: string, text: string) => {
    setPresetKey(key);
    setPresetText(text);
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Background Subtle Gradient Blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40 dark:opacity-30">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>

        {/* Header Navigation */}
        <Header
          isDark={isDark}
          setIsDark={setIsDark}
          onSelectPreset={handleSelectPreset}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          <CipherStudio
            key={`${presetKey}-${presetText}`}
            initialKeyword={presetKey}
            initialPlaintext={presetText}
          />
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400 relative z-10 glass-panel">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>Playfair Cipher Visualizer & Studio</span>
            <div className="flex items-center gap-4">
              <span>5×5 Matrix Cryptography Engine</span>
              <span>•</span>
              <span>1854 Historical Algorithm</span>
            </div>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}
