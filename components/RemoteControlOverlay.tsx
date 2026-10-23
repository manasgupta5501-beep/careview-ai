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
  X, 
  HelpCircle,
  Volume2,
  VolumeX,
  Keyboard
} from 'lucide-react';
import { playTVSound } from '@/lib/preferences';

interface RemoteControlOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSendKey: (key: string) => void;
  onVoiceTrigger: () => void;
  onHomeTrigger: () => void;
}

export const RemoteControlOverlay: React.FC<RemoteControlOverlayProps> = ({
  isOpen,
  onClose,
  onSendKey,
  onVoiceTrigger,
  onHomeTrigger,
}) => {
  if (!isOpen) return null;

  const handleDpad = (key: string, sound: 'focus' | 'select' | 'back' = 'focus') => {
    playTVSound(sound);
    onSendKey(key);
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-center bg-slate-950/95 text-slate-100 border-2 border-cyan-500/60 rounded-3xl p-5 shadow-2xl shadow-cyan-950/80 backdrop-blur-xl w-72 animate-in fade-in slide-in-from-bottom-5 duration-200 select-none"
      role="dialog"
      aria-label="Virtual Amazon Fire TV Remote"
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Fire TV Remote
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close Remote Simulator"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Voice Alexa / Mic Button */}
      <div className="my-4">
        <button
          type="button"
          onClick={() => {
            playTVSound('select');
            onVoiceTrigger();
          }}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-600 to-teal-400 text-slate-950 flex flex-col items-center justify-center shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-transform"
          title="Push to Talk / Voice Input (Alexa Voice Remote)"
          aria-label="Fire TV Mic Button"
        >
          <Mic className="w-8 h-8 stroke-[2.5]" />
        </button>
      </div>

      {/* D-Pad Directional Ring */}
      <div className="relative w-44 h-44 bg-slate-900 border-2 border-slate-700/80 rounded-full flex items-center justify-center shadow-inner my-2">
        {/* UP */}
        <button
          type="button"
          onClick={() => handleDpad('ArrowUp', 'focus')}
          className="absolute top-1 left-1/2 -translate-x-1/2 w-14 h-12 flex items-center justify-center text-slate-300 hover:text-cyan-300 active:bg-cyan-500/20 rounded-t-full transition"
          aria-label="D-Pad Up"
        >
          <ArrowUp className="w-6 h-6" />
        </button>

        {/* DOWN */}
        <button
          type="button"
          onClick={() => handleDpad('ArrowDown', 'focus')}
          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-14 h-12 flex items-center justify-center text-slate-300 hover:text-cyan-300 active:bg-cyan-500/20 rounded-b-full transition"
          aria-label="D-Pad Down"
        >
          <ArrowDown className="w-6 h-6" />
        </button>

        {/* LEFT */}
        <button
          type="button"
          onClick={() => handleDpad('ArrowLeft', 'focus')}
          className="absolute left-1 top-1/2 -translate-y-1/2 w-12 h-14 flex items-center justify-center text-slate-300 hover:text-cyan-300 active:bg-cyan-500/20 rounded-l-full transition"
          aria-label="D-Pad Left"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* RIGHT */}
        <button
          type="button"
          onClick={() => handleDpad('ArrowRight', 'focus')}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-12 h-14 flex items-center justify-center text-slate-300 hover:text-cyan-300 active:bg-cyan-500/20 rounded-r-full transition"
          aria-label="D-Pad Right"
        >
          <ArrowRight className="w-6 h-6" />
        </button>

        {/* CENTER / SELECT (OK) BUTTON */}
        <button
          type="button"
          onClick={() => handleDpad('Enter', 'select')}
          className="w-18 h-18 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 text-white font-black text-sm tracking-widest flex items-center justify-center shadow-md transition-all active:scale-95"
          aria-label="D-Pad Select / OK"
        >
          SELECT
        </button>
      </div>

      {/* Navigation Buttons Row: Back, Home, Menu */}
      <div className="grid grid-cols-3 gap-3 w-full mt-4">
        <button
          type="button"
          onClick={() => handleDpad('Escape', 'back')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition active:scale-95"
          title="Back (Escape)"
          aria-label="Back"
        >
          <CornerDownLeft className="w-5 h-5 mb-1" />
          <span className="text-[10px] uppercase font-bold text-slate-400">Back</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playTVSound('select');
            onHomeTrigger();
          }}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition active:scale-95"
          title="Home"
          aria-label="Home"
        >
          <Home className="w-5 h-5 mb-1 text-cyan-400" />
          <span className="text-[10px] uppercase font-bold text-slate-400">Home</span>
        </button>

        <button
          type="button"
          onClick={() => handleDpad('Tab', 'focus')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition active:scale-95"
          title="Tab / Next Focus"
          aria-label="Tab"
        >
          <Keyboard className="w-5 h-5 mb-1 text-teal-400" />
          <span className="text-[10px] uppercase font-bold text-slate-400">Tab</span>
        </button>
      </div>

      {/* Keyboard instructions footer */}
      <div className="w-full mt-4 pt-3 border-t border-slate-900 text-center">
        <p className="text-[11px] text-slate-400 font-medium">
          Physical keyboard shortcuts:
        </p>
        <p className="text-[10px] text-cyan-300/80 font-mono mt-0.5">
          Arrows: Move • Enter: OK • Esc: Back
        </p>
      </div>
    </div>
  );
};
