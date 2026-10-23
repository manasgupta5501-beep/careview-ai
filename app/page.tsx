'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ScreenView, PatientPreferences } from '@/types';
import { 
  DEFAULT_PREFERENCES, 
  loadPatientPreferences, 
  savePatientPreferences,
  playTVSound 
} from '@/lib/preferences';
import { TVSpeechSynthesizer } from '@/lib/speech';
import { TVHeader } from '@/components/TVHeader';
import { HomeScreen } from '@/components/HomeScreen';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { HospitalInformation } from '@/components/HospitalInformation';
import { RequestAssistance } from '@/components/RequestAssistance';
import { StaffDashboard } from '@/components/StaffDashboard';
import { SettingsView } from '@/components/SettingsView';
import { RemoteNavigationFooter } from '@/components/RemoteNavigationFooter';
import { RemoteControlOverlay } from '@/components/RemoteControlOverlay';

export default function CareViewAIPage() {
  const [currentView, setCurrentView] = useState<ScreenView>('home');
  const [preferences, setPreferences] = useState<PatientPreferences>(DEFAULT_PREFERENCES);
  const [initialQuestion, setInitialQuestion] = useState<string>('');
  const [assistanceCategory, setAssistanceCategory] = useState<string>('Need a Nurse');
  const [assistanceNote, setAssistanceNote] = useState<string>('');
  const [isRemoteOverlayOpen, setIsRemoteOverlayOpen] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    const loaded = loadPatientPreferences();
    setPreferences(loaded);
  }, []);

  // Update preferences and persist
  const handleUpdatePreferences = (updates: Partial<PatientPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates };
      savePatientPreferences(next);
      return next;
    });
  };

  // Safe navigation with audio feedback and speech cancel
  const navigateTo = useCallback((view: ScreenView) => {
    TVSpeechSynthesizer.stop();
    setIsSpeaking(false);
    playTVSound('select');
    setCurrentView(view);
  }, []);

  const handleVoiceTrigger = useCallback(() => {
    TVSpeechSynthesizer.stop();
    setIsSpeaking(false);
    setInitialQuestion('');
    navigateTo('assistant');
  }, [navigateTo]);

  const handleAskPreset = useCallback((question: string) => {
    setInitialQuestion(question);
    navigateTo('assistant');
  }, [navigateTo]);

  const handleRequestAssistance = useCallback((category: string = 'Need a Nurse', note: string = '') => {
    setAssistanceCategory(category);
    setAssistanceNote(note);
    navigateTo('request-assistance');
  }, [navigateTo]);

  // Global D-Pad and Fire TV Remote Keyboard Controller
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing inside an input or textarea
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = targetTag === 'input' || targetTag === 'textarea';

      if (e.key === 'Escape' || e.key === 'Backspace') {
        if (!isInput && currentView !== 'home') {
          e.preventDefault();
          playTVSound('back');
          setCurrentView('home');
        }
      } else if ((e.key === 'm' || e.key === 'M') && !isInput) {
        e.preventDefault();
        handleVoiceTrigger();
      } else if ((e.key === 'h' || e.key === 'H') && !isInput) {
        e.preventDefault();
        playTVSound('select');
        setCurrentView('home');
      } else if ((e.key === 'c' || e.key === 'C') && !isInput) {
        e.preventDefault();
        handleUpdatePreferences({ highContrast: !preferences.highContrast });
      } else if ((e.key === 'l' || e.key === 'L') && !isInput) {
        e.preventDefault();
        const nextLang = preferences.language === 'en' ? 'hi' : 'en';
        handleUpdatePreferences({ language: nextLang });
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [currentView, preferences, handleVoiceTrigger]);

  // Handle synthetic keys dispatched by the Virtual Fire TV Remote
  const handleVirtualRemoteKey = (key: string) => {
    if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
      // Find all focusable elements and advance
      const focusable = Array.from(
        document.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);

      if (focusable.length > 0) {
        const activeIndex = focusable.indexOf(document.activeElement as HTMLElement);
        let nextIndex = 0;
        if (key === 'ArrowDown' || key === 'ArrowRight') {
          nextIndex = activeIndex >= 0 ? (activeIndex + 1) % focusable.length : 0;
        } else {
          nextIndex = activeIndex > 0 ? activeIndex - 1 : focusable.length - 1;
        }
        focusable[nextIndex]?.focus();
      }
    } else if (key === 'Enter') {
      const activeEl = document.activeElement as HTMLElement;
      if (activeEl && typeof activeEl.click === 'function') {
        activeEl.click();
      }
    } else if (key === 'Escape') {
      if (currentView !== 'home') {
        navigateTo('home');
      }
    } else if (key === 'Tab') {
      const focusable = Array.from(
        document.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
      if (focusable.length > 0) {
        const activeIndex = focusable.indexOf(document.activeElement as HTMLElement);
        const nextIndex = (activeIndex + 1) % focusable.length;
        focusable[nextIndex]?.focus();
      }
    }
  };

  // Determine root container classes for high contrast & text size
  let textSizeClass = 'text-lg';
  if (preferences.textSize === 'large') {
    textSizeClass = 'text-xl';
  } else if (preferences.textSize === 'extra-large') {
    textSizeClass = 'text-2xl';
  }

  const isHighContrast = preferences.highContrast;

  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors duration-200 ${
        isHighContrast
          ? 'high-contrast bg-black text-white'
          : 'bg-[#07131e] text-slate-100'
      } ${textSizeClass}`}
    >
      {/* Top TV Header */}
      <TVHeader
        currentView={currentView}
        onNavigate={navigateTo}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
        onToggleRemoteModal={() => setIsRemoteOverlayOpen(!isRemoteOverlayOpen)}
        isSpeaking={isSpeaking}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full px-4 sm:px-8 py-6 flex flex-col justify-center">
        {currentView === 'home' && (
          <HomeScreen
            preferences={preferences}
            onNavigate={navigateTo}
            onVoiceTrigger={handleVoiceTrigger}
            onAskPreset={handleAskPreset}
          />
        )}

        {currentView === 'assistant' && (
          <VoiceAssistant
            preferences={preferences}
            onNavigateHome={() => navigateTo('home')}
            onRequestAssistance={(category, note) => handleRequestAssistance(category, note)}
            initialQuestion={initialQuestion}
          />
        )}

        {currentView === 'hospital-info' && (
          <HospitalInformation
            preferences={preferences}
            onAskAboutItem={handleAskPreset}
            onRequestAssistance={(category) => handleRequestAssistance(category)}
          />
        )}

        {currentView === 'request-assistance' && (
          <RequestAssistance
            preferences={preferences}
            onNavigateHome={() => navigateTo('home')}
            onNavigateStaff={() => navigateTo('staff-dashboard')}
            initialCategory={assistanceCategory}
            initialNote={assistanceNote}
          />
        )}

        {currentView === 'staff-dashboard' && (
          <StaffDashboard
            preferences={preferences}
            onNavigateHome={() => navigateTo('home')}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
            onNavigateHome={() => navigateTo('home')}
          />
        )}
      </main>

      {/* Bottom Remote Navigation Key Legend */}
      <RemoteNavigationFooter
        onToggleRemote={() => setIsRemoteOverlayOpen(!isRemoteOverlayOpen)}
        highContrast={isHighContrast}
        language={preferences.language}
      />

      {/* Virtual Fire TV Remote Control Simulator */}
      <RemoteControlOverlay
        isOpen={isRemoteOverlayOpen}
        onClose={() => setIsRemoteOverlayOpen(false)}
        onSendKey={handleVirtualRemoteKey}
        onVoiceTrigger={handleVoiceTrigger}
        onHomeTrigger={() => navigateTo('home')}
      />
    </div>
  );
}
