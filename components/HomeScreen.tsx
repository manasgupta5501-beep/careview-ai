'use client';

import React, { useRef } from 'react';
import { 
  Mic, 
  MessageSquare, 
  Building2, 
  HeartHandshake, 
  Globe, 
  Settings, 
  Users, 
  ShieldAlert, 
  Sparkles, 
  ArrowRight,
  Clock,
  Compass,
  Volume2
} from 'lucide-react';
import { AccessibleButton } from './AccessibleButton';
import { PatientPreferences, ScreenView } from '@/types';
import { HOSPITAL_METADATA } from '@/lib/hospitalKnowledge';
import { playTVSound } from '@/lib/preferences';

interface HomeScreenProps {
  preferences: PatientPreferences;
  onNavigate: (view: ScreenView) => void;
  onVoiceTrigger: () => void;
  onAskPreset: (question: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  preferences,
  onNavigate,
  onVoiceTrigger,
  onAskPreset,
}) => {
  const isHi = preferences.language === 'hi';
  const isHighContrast = preferences.highContrast;

  const quickPrompts = [
    { en: 'Where is the cafeteria?', hi: 'कैफेटेरिया कहाँ है?' },
    { en: 'What are visiting hours?', hi: 'मुलाकात का समय क्या है?' },
    { en: 'How to connect to Wi-Fi?', hi: 'वाई-फाई कैसे कनेक्ट करें?' },
    { en: 'I need an extra blanket', hi: 'मुझे अतिरिक्त कंबल चाहिए' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 py-2 animate-in fade-in duration-300">
      {/* Patient Welcome Hero Card */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-10 border-2 transition-all duration-300 ${
          isHighContrast
            ? 'bg-black border-yellow-400 text-white'
            : 'bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950/80 border-cyan-500/40 shadow-2xl shadow-cyan-950/60'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Greeting info */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{isHi ? 'स्मार्ट अस्पताल टीवी सहायक' : 'Smart Hospital TV Assistant'}</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              {isHi
                ? `नमस्ते, ${preferences.patientName}`
                : `Hello, ${preferences.patientName}`}
            </h2>

            <p className="text-xl sm:text-2xl text-slate-300 mt-2 font-medium">
              {isHi
                ? `${preferences.roomNumber} (${HOSPITAL_METADATA.defaultWingHi}) में आपका स्वागत है। आज CareView आपकी क्या सहायता कर सकता है?`
                : `Welcome to ${preferences.roomNumber} (${HOSPITAL_METADATA.defaultWing}). How can CareView assist you today?`}
            </p>

            {/* Quick voice prompts */}
            <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider w-full lg:w-auto">
                {isHi ? 'जल्दी पूछें:' : 'Quick Questions:'}
              </span>
              {quickPrompts.map((q, idx) => {
                const label = isHi ? q.hi : q.en;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onAskPreset(label)}
                    className="px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-400 text-cyan-200 text-sm font-semibold transition active:scale-95 shadow-sm"
                  >
                    "{label}"
                  </button>
                );
              })}
            </div>
          </div>

          {/* Big Voice Hero Button */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-cyan-400 animate-pulseRing opacity-30" />
              <AccessibleButton
                variant="primary"
                size="xl"
                highContrast={isHighContrast}
                onClick={onVoiceTrigger}
                className="w-36 h-36 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center shadow-2xl relative z-10 gap-2 border-4 border-cyan-300/40"
                aria-label="Push to speak with CareView AI"
              >
                <Mic className="w-16 h-16 sm:w-20 sm:h-20 stroke-[2.5]" />
                <span className="text-sm sm:text-base uppercase font-black tracking-wider">
                  {isHi ? 'माइक दबाएं' : 'PRESS TO TALK'}
                </span>
              </AccessibleButton>
            </div>
            <p className="text-sm font-bold text-cyan-300 mt-3 flex items-center gap-1.5">
              <span>{isHi ? 'रिमोट का [M] बटन दबाएं' : 'Or press [M] on remote'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Action Cards Grid (Accessible 10-Foot TV Experience) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Ask CareView */}
        <AccessibleButton
          variant="card"
          size="lg"
          highContrast={isHighContrast}
          onClick={() => onNavigate('assistant')}
          className={`h-full p-6 rounded-3xl border-2 flex flex-col justify-between group ${
            isHighContrast
              ? 'bg-black border-yellow-300 hover:bg-zinc-900'
              : 'bg-slate-800/80 border-slate-700/90 hover:border-cyan-400 hover:bg-slate-800'
          }`}
          aria-label="Ask CareView AI Assistant"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-400 text-slate-950 font-black shadow-lg shadow-cyan-500/20">
                <Mic className="w-8 h-8 stroke-[2.5]" />
              </div>
              <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                Voice & Text
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
              {isHi ? 'CareView से पूछें' : 'Ask CareView'}
            </h3>
            <p className="text-base text-slate-300 mt-2 font-normal">
              {isHi
                ? 'आवाज़ या लिखकर अस्पताल संबंधी कोई भी सवाल पूछें और तुरंत जवाब सुनें।'
                : 'Ask hospital questions with your voice or text and receive large spoken answers.'}
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-cyan-400 font-bold text-base">
            <span>{isHi ? 'सर्च शुरू करें' : 'Open Assistant'}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </AccessibleButton>

        {/* Card 2: Hospital Information */}
        <AccessibleButton
          variant="card"
          size="lg"
          highContrast={isHighContrast}
          onClick={() => onNavigate('hospital-info')}
          className={`h-full p-6 rounded-3xl border-2 flex flex-col justify-between group ${
            isHighContrast
              ? 'bg-black border-yellow-300 hover:bg-zinc-900'
              : 'bg-slate-800/80 border-slate-700/90 hover:border-cyan-400 hover:bg-slate-800'
          }`}
          aria-label="Hospital Information Directory"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Compass className="w-8 h-8" />
              </div>
              <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-700">
                Directory
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
              {isHi ? 'अस्पताल जानकारी' : 'Hospital Information'}
            </h3>
            <p className="text-base text-slate-300 mt-2 font-normal">
              {isHi
                ? 'मुलाकात का समय, कैफेटेरिया भोजन, फार्मेसी, लिफ्ट नक्शा और सेवाएं।'
                : 'Visiting hours, cafeteria dining times, floor guide, Wi-Fi, and pharmacy details.'}
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-cyan-400 font-bold text-base">
            <span>{isHi ? 'निर्देशिका देखें' : 'View Directory'}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </AccessibleButton>

        {/* Card 3: Request Assistance */}
        <AccessibleButton
          variant="card"
          size="lg"
          highContrast={isHighContrast}
          onClick={() => onNavigate('request-assistance')}
          className={`h-full p-6 rounded-3xl border-2 flex flex-col justify-between group ${
            isHighContrast
              ? 'bg-black border-yellow-300 hover:bg-zinc-900'
              : 'bg-slate-800/80 border-slate-700/90 hover:border-cyan-400 hover:bg-slate-800'
          }`}
          aria-label="Request Hospital Assistance"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3.5 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
                <HeartHandshake className="w-8 h-8" />
              </div>
              <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                Nurse Call
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
              {isHi ? 'सहायता का अनुरोध करें' : 'Request Assistance'}
            </h3>
            <p className="text-base text-slate-300 mt-2 font-normal">
              {isHi
                ? 'नर्स को बुलाएं, अतिरिक्त कंबल, पानी या बाथरूम में मदद का अनुरोध करें।'
                : 'Request nurse support, extra warm blankets, fresh water, or mobility aid.'}
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-cyan-400 font-bold text-base">
            <span>{isHi ? 'मदद मांगें' : 'Get Help'}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </AccessibleButton>

        {/* Card 4: Staff Dashboard */}
        <AccessibleButton
          variant="card"
          size="lg"
          highContrast={isHighContrast}
          onClick={() => onNavigate('staff-dashboard')}
          className={`h-full p-6 rounded-3xl border-2 flex flex-col justify-between group ${
            isHighContrast
              ? 'bg-black border-yellow-300 hover:bg-zinc-900'
              : 'bg-slate-800/80 border-slate-700/90 hover:border-cyan-400 hover:bg-slate-800'
          }`}
          aria-label="Staff Request Dashboard"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                <Users className="w-8 h-8" />
              </div>
              <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                Staff Portal
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
              {isHi ? 'स्टाफ डैशबोर्ड' : 'Staff Dashboard'}
            </h3>
            <p className="text-base text-slate-300 mt-2 font-normal">
              {isHi
                ? 'नर्सिंग टीम द्वारा रोगी अनुरोधों की समीक्षा और स्थिति अपडेट (डेमो)।'
                : 'Review patient request queue, acknowledge alerts, and log nursing updates.'}
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-cyan-400 font-bold text-base">
            <span>{isHi ? 'डैशबोर्ड खोलें' : 'Open Staff Board'}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </AccessibleButton>

        {/* Card 5: Language Switch */}
        <AccessibleButton
          variant="card"
          size="lg"
          highContrast={isHighContrast}
          onClick={() => {
            const nextLang = preferences.language === 'en' ? 'hi' : 'en';
            onNavigate('settings');
          }}
          className={`h-full p-6 rounded-3xl border-2 flex flex-col justify-between group ${
            isHighContrast
              ? 'bg-black border-yellow-300 hover:bg-zinc-900'
              : 'bg-slate-800/80 border-slate-700/90 hover:border-cyan-400 hover:bg-slate-800'
          }`}
          aria-label="Change Language"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Globe className="w-8 h-8" />
              </div>
              <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                {preferences.language === 'en' ? 'English Active' : 'हिंदी सक्रिय'}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
              {isHi ? 'भाषा बदलें (Language)' : 'Language Selection'}
            </h3>
            <p className="text-base text-slate-300 mt-2 font-normal">
              {isHi
                ? 'CareView AI स्क्रीन और आवाज़ को अंग्रेजी या हिंदी में बदलें।'
                : 'Switch CareView display and voice between English and Hindi (हिंदी).'}
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-cyan-400 font-bold text-base">
            <span>{preferences.language === 'en' ? 'Switch to हिंदी' : 'Switch to English'}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </AccessibleButton>

        {/* Card 6: Settings & Accessibility */}
        <AccessibleButton
          variant="card"
          size="lg"
          highContrast={isHighContrast}
          onClick={() => onNavigate('settings')}
          className={`h-full p-6 rounded-3xl border-2 flex flex-col justify-between group ${
            isHighContrast
              ? 'bg-black border-yellow-300 hover:bg-zinc-900'
              : 'bg-slate-800/80 border-slate-700/90 hover:border-cyan-400 hover:bg-slate-800'
          }`}
          aria-label="Accessibility & TV Settings"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                <Settings className="w-8 h-8" />
              </div>
              <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                Accessibility
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
              {isHi ? 'सुलभता व सेटिंग्स' : 'Accessibility & TV Settings'}
            </h3>
            <p className="text-base text-slate-300 mt-2 font-normal">
              {isHi
                ? 'टेक्स्ट का आकार, उच्च कंट्रास्ट, आवाज़ की गति और माइक्रोफ़ोन टेस्ट।'
                : 'Adjust text size for TV distance, contrast mode, voice speed, and mic diagnostics.'}
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-cyan-400 font-bold text-base">
            <span>{isHi ? 'सेटिंग्स खोलें' : 'Configure TV'}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </AccessibleButton>
      </div>

      {/* Emergency Notice Footer */}
      <div className="mt-2 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 text-rose-200 text-sm flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
        <span>
          {isHi
            ? 'महत्वपूर्ण: CareView AI आपातकालीन जीवन-रक्षक प्रणाली नहीं है। किसी भी गंभीर स्थिति में कृपया अपने तकिए के पास लगा लाल बटन दबाएं।'
            : 'Emergency Safety Notice: CareView AI is an informational assistant. For acute medical pain or emergencies, always press the RED call button on your bedside remote.'}
        </span>
      </div>
    </div>
  );
};
