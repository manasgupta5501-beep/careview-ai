'use client';

import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Volume2, 
  VolumeX, 
  Globe, 
  Contrast, 
  Home, 
  Clock, 
  Sparkles,
  Gamepad2,
  ShieldAlert
} from 'lucide-react';
import { AccessibleButton } from './AccessibleButton';
import { PatientPreferences, ScreenView } from '@/types';
import { HOSPITAL_METADATA } from '@/lib/hospitalKnowledge';
import { TVSpeechSynthesizer } from '@/lib/speech';

interface TVHeaderProps {
  currentView: ScreenView;
  onNavigate: (view: ScreenView) => void;
  preferences: PatientPreferences;
  onUpdatePreferences: (updates: Partial<PatientPreferences>) => void;
  onToggleRemoteModal?: () => void;
  isSpeaking?: boolean;
}

export const TVHeader: React.FC<TVHeaderProps> = ({
  currentView,
  onNavigate,
  preferences,
  onUpdatePreferences,
  onToggleRemoteModal,
  isSpeaking = false,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      setCurrentTime(`${timeStr} • ${dateStr}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleLanguage = () => {
    const nextLang = preferences.language === 'en' ? 'hi' : 'en';
    onUpdatePreferences({ language: nextLang });
    if (TVSpeechSynthesizer.isSpeaking()) {
      TVSpeechSynthesizer.stop();
    }
  };

  const toggleHighContrast = () => {
    onUpdatePreferences({ highContrast: !preferences.highContrast });
  };

  const toggleMute = () => {
    if (preferences.speechVolume > 0) {
      TVSpeechSynthesizer.stop();
      onUpdatePreferences({ speechVolume: 0 });
    } else {
      onUpdatePreferences({ speechVolume: 1.0 });
    }
  };

  const isHighContrast = preferences.highContrast;

  return (
    <header
      role="banner"
      className={`w-full px-6 py-4 transition-colors duration-200 border-b ${
        isHighContrast
          ? 'bg-black border-yellow-400 text-white'
          : 'bg-slate-900/90 backdrop-blur-md border-slate-800 text-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand + Room info */}
        <div className="flex items-center gap-4">
          {currentView !== 'home' ? (
            <AccessibleButton
              variant="outline"
              size="md"
              highContrast={isHighContrast}
              onClick={() => onNavigate('home')}
              className="gap-2 focus:ring-4"
              aria-label="Back to Home Screen"
            >
              <Home className="w-6 h-6 text-cyan-400" />
              <span>{preferences.language === 'hi' ? 'होम स्क्रीन' : 'Home'}</span>
            </AccessibleButton>
          ) : (
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-2xl flex items-center justify-center shadow-lg ${
                  isHighContrast
                    ? 'bg-yellow-400 text-black'
                    : 'bg-gradient-to-tr from-cyan-600 to-teal-400 text-slate-950 shadow-cyan-500/20'
                }`}
              >
                <Tv className="w-8 h-8 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight flex items-center gap-1.5">
                    <span>CareView</span>
                    <span className={isHighContrast ? 'text-yellow-300' : 'text-cyan-400'}>AI</span>
                  </h1>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isHighContrast
                        ? 'bg-yellow-400 text-black'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    TV Assistant
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  {preferences.language === 'hi'
                    ? HOSPITAL_METADATA.nameHi
                    : HOSPITAL_METADATA.name}
                </p>
              </div>
            </div>
          )}

          {/* Patient Room Badge */}
          <div
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium ${
              isHighContrast
                ? 'bg-zinc-900 border-zinc-700 text-yellow-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-300'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{preferences.roomNumber}</span>
            <span className="text-slate-500">•</span>
            <span>{preferences.patientName}</span>
          </div>
        </div>

        {/* Center: Live Time for Orientation */}
        <div className="hidden lg:flex items-center gap-2 text-slate-300 text-lg font-medium px-4 py-1.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <Clock className="w-5 h-5 text-cyan-400" />
          <span>{currentTime || 'Loading...'}</span>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Speaking Audio Badge */}
          {isSpeaking && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 animate-pulse text-sm font-medium">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              <span>{preferences.language === 'hi' ? 'बोल रहा है...' : 'Speaking...'}</span>
            </div>
          )}

          {/* Volume Mute Toggle */}
          <AccessibleButton
            variant="ghost"
            size="md"
            highContrast={isHighContrast}
            onClick={toggleMute}
            className="p-3"
            title={preferences.speechVolume === 0 ? 'Unmute Audio' : 'Mute Audio'}
            aria-label="Toggle Audio Volume"
          >
            {preferences.speechVolume === 0 ? (
              <VolumeX className="w-6 h-6 text-rose-400" />
            ) : (
              <Volume2 className="w-6 h-6 text-cyan-400" />
            )}
          </AccessibleButton>

          {/* Language Switch */}
          <AccessibleButton
            variant="secondary"
            size="md"
            highContrast={isHighContrast}
            onClick={toggleLanguage}
            className="gap-2 font-bold"
            aria-label="Switch Language between English and Hindi"
          >
            <Globe className="w-5 h-5 text-cyan-400" />
            <span>{preferences.language === 'en' ? 'हिंदी' : 'English'}</span>
          </AccessibleButton>

          {/* High Contrast Toggle */}
          <AccessibleButton
            variant={isHighContrast ? 'primary' : 'secondary'}
            size="md"
            highContrast={isHighContrast}
            onClick={toggleHighContrast}
            className="gap-2"
            title="Toggle High Contrast Display"
            aria-label="Toggle High Contrast Display"
          >
            <Contrast className="w-5 h-5" />
            <span className="hidden sm:inline">
              {isHighContrast ? 'Contrast ON' : 'High Contrast'}
            </span>
          </AccessibleButton>

          {/* Virtual Fire TV Remote Controller Button */}
          {onToggleRemoteModal && (
            <AccessibleButton
              variant="outline"
              size="md"
              highContrast={isHighContrast}
              onClick={onToggleRemoteModal}
              className="gap-2 text-cyan-400 border-cyan-500/40"
              title="Open Virtual Fire TV Remote Simulator"
              aria-label="Open Virtual Fire TV Remote Simulator"
            >
              <Gamepad2 className="w-5 h-5" />
              <span className="hidden xl:inline">TV Remote</span>
            </AccessibleButton>
          )}
        </div>
      </div>
    </header>
  );
};
