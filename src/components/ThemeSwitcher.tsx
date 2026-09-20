import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Eye } from 'lucide-react';

interface ThemeSwitcherProps {
  variant?: 'compact' | 'full' | 'pill';
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  variant = 'compact',
  className = ''
}) => {
  const { theme, toggleTheme, isHighContrastLight } = useTheme();

  const titleText = isHighContrastLight
    ? 'Switch to Dark Surveillance Theme'
    : 'Switch to High-Contrast Light Theme (WCAG AAA Accessibility Standard)';

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border shadow-sm ${
          isHighContrastLight
            ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
        } ${className}`}
        aria-label={titleText}
        title={titleText}
      >
        {isHighContrastLight ? (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-semibold">Light (High Contrast)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold">
              WCAG AAA
            </span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-blue-400" />
            <span>Dark Theme</span>
          </>
        )}
      </button>
    );
  }

  if (variant === 'full') {
    return (
      <div
        className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
          isHighContrastLight
            ? 'bg-white border-slate-300 shadow-sm'
            : 'bg-slate-900 border-slate-800'
        } ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-lg ${
              isHighContrastLight
                ? 'bg-amber-100 text-amber-800'
                : 'bg-slate-800 text-blue-400'
            }`}
          >
            {isHighContrastLight ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {isHighContrastLight ? 'High-Contrast Light' : 'Dark Surveillance'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                WCAG 2.1
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              {isHighContrastLight
                ? 'Calibrated for GIGW & Section 508 accessibility compliance (7:1+ contrast)'
                : 'Optimized for high-density command and telemetry surveillance'}
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isHighContrastLight}
          onClick={toggleTheme}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
            isHighContrastLight ? 'bg-blue-600' : 'bg-slate-700'
          }`}
          aria-label={titleText}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              isHighContrastLight ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    );
  }

  // Compact variant (default for Navbar)
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`group relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition border shadow-sm ${
        isHighContrastLight
          ? 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300 hover:border-slate-400'
          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
      } ${className}`}
      aria-label={titleText}
      title={titleText}
    >
      {isHighContrastLight ? (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-600 transition group-hover:rotate-45" />
          <span className="hidden md:inline font-semibold text-slate-900">Light Mode</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 hidden lg:inline">
            7:1+ Contrast
          </span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-blue-400 transition group-hover:-rotate-12" />
          <span className="hidden md:inline text-slate-200">Dark Mode</span>
          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 hidden lg:inline">
            Theme
          </span>
        </>
      )}
    </button>
  );
};
