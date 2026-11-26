'use client';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // Check local storage or system preference on load
  useEffect(() => {
    const isDarkMode = 
      localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDark(isDarkMode);
    if (isDarkMode) document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button 
      onClick={toggleTheme} 
      className="flex items-center justify-center rounded-full bg-neutral-200 p-2 transition-all duration-300 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700"
      aria-label="Toggle Dark Mode"
    >
      {/* Animation logic: Rotate and scale the icons */}
      <div className="relative w-5 h-5">
        <Sun className={`absolute inset-0 text-neutral-700 transition-all duration-500 transform dark:text-neutral-200 ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} size={20} />
        <Moon className={`absolute inset-0 text-neutral-700 transition-all duration-500 transform dark:text-neutral-200 ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`} size={20} />
      </div>
    </button>
  );
}