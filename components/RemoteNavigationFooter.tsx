'use client';

import React from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  CornerDownLeft, 
  Home, 
  Mic, 
  Gamepad2, 
  Contrast, 
  Globe 
} from 'lucide-react';

interface RemoteNavigationFooterProps {
  onToggleRemote: () => void;
  highContrast?: boolean;
  language: 'en' | 'hi';
}

export const RemoteNavigationFooter: React.FC<RemoteNavigationFooterProps> = ({
  onToggleRemote,
  highContrast = false,
  language = 'en',
}) => {
  const isHi = language === 'hi';

  return (
    <footer
      role="contentinfo"
      aria-label="Fire TV Remote Navigation Guide"
      className={`w-full py-3 px-6 border-t select-none transition-colors duration-200 ${
        highContrast
          ? 'bg-black border-yellow-400 text-yellow-300'
          : 'bg-slate-950/80 backdrop-blur-md border-slate-800 text-slate-300'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm font-semibold">
        {/* Navigation Legends */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-xs">
              ↑ ↓ ← →
            </span>
            <span>{isHi ? 'नेविगेट करें' : 'Move Focus'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-xs">
              Enter / OK
            </span>
            <span>{isHi ? 'चुनें' : 'Select'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-xs">
              Esc / Back
            </span>
            <span>{isHi ? 'पीछे' : 'Back / Home'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-1 rounded-lg bg-cyan-900 border border-cyan-600 text-cyan-200 font-mono text-xs">
              [M]
            </span>
            <span>{isHi ? 'माइक' : 'Mic Voice'}</span>
          </div>
        </div>

        {/* Right side remote button helper */}
        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-slate-400 text-xs">
            {isHi ? '10-फुट टीवी रिमोट समर्थित' : 'Amazon Fire TV 10-Foot Remote Ready'}
          </span>
          <button
            type="button"
            onClick={onToggleRemote}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-bold transition active:scale-95"
            aria-label="Toggle Virtual Remote Simulator"
          >
            <Gamepad2 className="w-4 h-4 text-cyan-400" />
            <span>Virtual Remote</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
