'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Globe, 
  Type, 
  Contrast, 
  Volume2, 
  Mic, 
  Check, 
  RotateCcw, 
  Sliders, 
  Sparkles,
  Play,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BedDouble
} from 'lucide-react';
import { AccessibleButton } from './AccessibleButton';
import { PatientPreferences, Language, TextSize } from '@/types';
import { TVSpeechSynthesizer, TVSpeechRecognizer } from '@/lib/speech';
import { DEFAULT_PREFERENCES, playTVSound } from '@/lib/preferences';

interface SettingsViewProps {
  preferences: PatientPreferences;
  onUpdatePreferences: (updates: Partial<PatientPreferences>) => void;
  onNavigateHome: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  preferences,
  onUpdatePreferences,
  onNavigateHome,
}) => {
  const [micTestStatus, setMicTestStatus] = useState<string | null>(null);
  const [isTestingMic, setIsTestingMic] = useState<boolean>(false);

  const isHi = preferences.language === 'hi';
  const isHighContrast = preferences.highContrast;

  const handleTestAudio = () => {
    const sample = isHi
      ? 'नमस्कार, मैं CareView AI हूँ। अस्पताल में आपकी सहायता के लिए तैयार।'
      : 'Hello, this is CareView AI. Your smart hospital assistant audio is working properly.';

    TVSpeechSynthesizer.speak(sample, {
      language: preferences.language,
      rate: preferences.speechRate,
      volume: preferences.speechVolume,
      onStart: () => playTVSound('select')
    });
  };

  const handleTestMic = () => {
    const recognizer = new TVSpeechRecognizer();
    if (!recognizer.isSupported()) {
      setMicTestStatus(isHi ? 'इस ब्राउज़र में आवाज़ पहचान समर्थित नहीं है।' : 'Speech recognition not supported in this browser.');
      return;
    }

    setIsTestingMic(true);
    setMicTestStatus(isHi ? 'सुन रहा हूँ... कुछ बोलें' : 'Listening... Speak something into your microphone');

    recognizer.start(preferences.language, {
      onResult: (text, isFinal) => {
        setMicTestStatus(isHi ? `आवाज़ प्राप्त हुई: "${text}"` : `Recognized: "${text}"`);
        if (isFinal) {
          setIsTestingMic(false);
          playTVSound('success');
        }
      },
      onError: (err) => {
        setMicTestStatus(`Error: ${err}`);
        setIsTestingMic(false);
        playTVSound('alert');
      },
      onEnd: () => {
        setIsTestingMic(false);
      }
    });
  };

  const handleReset = () => {
    onUpdatePreferences(DEFAULT_PREFERENCES);
    playTVSound('back');
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 py-4 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            <span className={isHighContrast ? 'text-yellow-300' : 'text-cyan-400'}>
              {isHi ? 'सेटिंग्स और सुलभता' : 'Settings & Accessibility'}
            </span>
          </h2>
          <p className="text-lg text-slate-300 mt-1">
            {isHi
              ? 'आवाज़, भाषा और स्क्रीन का आकार अपनी सुविधानुसार सेट करें।'
              : 'Customize voice speed, font size, high contrast, and remote audio cues.'}
          </p>
        </div>

        <AccessibleButton
          variant="secondary"
          size="md"
          highContrast={isHighContrast}
          onClick={handleReset}
          className="self-start sm:self-auto gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{isHi ? 'डिफ़ॉल्ट सेट करें' : 'Reset to Defaults'}</span>
        </AccessibleButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Language Preference */}
        <div
          className={`p-6 rounded-3xl border-2 flex flex-col gap-4 ${
            isHighContrast
              ? 'bg-black border-yellow-300 text-white'
              : 'bg-slate-800/80 border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {isHi ? 'भाषा (Language)' : 'Language'}
              </h3>
              <p className="text-sm text-slate-400">
                {isHi ? 'पसंदीदा भाषा चुनें' : 'Select assistant display & speech language'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <AccessibleButton
              variant={preferences.language === 'en' ? 'primary' : 'secondary'}
              size="lg"
              highContrast={isHighContrast}
              onClick={() => onUpdatePreferences({ language: 'en' })}
              className="font-bold text-lg"
            >
              English
            </AccessibleButton>

            <AccessibleButton
              variant={preferences.language === 'hi' ? 'primary' : 'secondary'}
              size="lg"
              highContrast={isHighContrast}
              onClick={() => onUpdatePreferences({ language: 'hi' })}
              className="font-bold text-lg"
            >
              हिंदी (Hindi)
            </AccessibleButton>
          </div>
        </div>

        {/* 2. Text Size Preference */}
        <div
          className={`p-6 rounded-3xl border-2 flex flex-col gap-4 ${
            isHighContrast
              ? 'bg-black border-yellow-300 text-white'
              : 'bg-slate-800/80 border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400">
              <Type className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {isHi ? 'अक्षर का आकार' : 'Text Size (10-Foot TV)'}
              </h3>
              <p className="text-sm text-slate-400">
                {isHi ? 'दूर से पढ़ने के लिए बड़ा आकार' : 'Optimized for viewing from a hospital bed'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2">
            {(['standard', 'large', 'extra-large'] as TextSize[]).map((size) => (
              <AccessibleButton
                key={size}
                variant={preferences.textSize === size ? 'primary' : 'secondary'}
                size="md"
                highContrast={isHighContrast}
                onClick={() => onUpdatePreferences({ textSize: size })}
                className="capitalize text-base font-bold py-3.5"
              >
                {size.replace('-', ' ')}
              </AccessibleButton>
            ))}
          </div>
        </div>

        {/* 3. High Contrast & Display */}
        <div
          className={`p-6 rounded-3xl border-2 flex flex-col gap-4 ${
            isHighContrast
              ? 'bg-black border-yellow-300 text-white'
              : 'bg-slate-800/80 border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-400">
              <Contrast className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {isHi ? 'उच्च कंट्रास्ट मोड' : 'High Contrast Mode'}
              </h3>
              <p className="text-sm text-slate-400">
                {isHi ? 'काली पृष्ठभूमि और चमकदार पीला टेक्स्ट' : 'Deep black with bright yellow & cyan accents'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700 mt-2">
            <span className="font-bold text-lg text-white">
              {isHighContrast ? 'High Contrast ON' : 'Standard Contrast'}
            </span>
            <AccessibleButton
              variant={isHighContrast ? 'primary' : 'secondary'}
              size="md"
              highContrast={isHighContrast}
              onClick={() => onUpdatePreferences({ highContrast: !preferences.highContrast })}
            >
              {isHighContrast ? 'Enabled' : 'Disabled'}
            </AccessibleButton>
          </div>
        </div>

        {/* 4. Speech Rate & Volume */}
        <div
          className={`p-6 rounded-3xl border-2 flex flex-col gap-4 ${
            isHighContrast
              ? 'bg-black border-yellow-300 text-white'
              : 'bg-slate-800/80 border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Volume2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {isHi ? 'आवाज़ की गति व टेस्ट' : 'Voice Speech Rate'}
                </h3>
                <p className="text-sm text-slate-400">
                  {isHi ? 'बुजुर्गों के लिए शांत और धीमी आवाज़' : 'Calm pacing for clear understanding'}
                </p>
              </div>
            </div>

            <AccessibleButton
              variant="outline"
              size="md"
              highContrast={isHighContrast}
              onClick={handleTestAudio}
              className="gap-2 text-sm"
              title="Test Voice Output"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Test Voice</span>
            </AccessibleButton>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-2">
            {[
              { rate: 0.75, label: '0.75x Slow' },
              { rate: 0.9, label: '0.9x TV' },
              { rate: 1.0, label: '1.0x Normal' },
              { rate: 1.25, label: '1.25x Fast' },
            ].map((item) => (
              <AccessibleButton
                key={item.rate}
                variant={preferences.speechRate === item.rate ? 'primary' : 'secondary'}
                size="md"
                highContrast={isHighContrast}
                onClick={() => onUpdatePreferences({ speechRate: item.rate })}
                className="text-sm py-2.5 font-bold"
              >
                {item.label}
              </AccessibleButton>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-slate-300 text-sm font-medium">
              {isHi ? 'उत्तर अपने आप बोलें' : 'Auto-Read Answers Aloud'}
            </span>
            <AccessibleButton
              variant={preferences.autoSpeak ? 'primary' : 'secondary'}
              size="md"
              highContrast={isHighContrast}
              onClick={() => onUpdatePreferences({ autoSpeak: !preferences.autoSpeak })}
              className="text-xs px-3 py-1.5"
            >
              {preferences.autoSpeak ? 'ON' : 'OFF'}
            </AccessibleButton>
          </div>
        </div>

        {/* 5. Microphone Diagnostic Test */}
        <div
          className={`p-6 rounded-3xl border-2 flex flex-col gap-4 md:col-span-2 ${
            isHighContrast
              ? 'bg-black border-yellow-300 text-white'
              : 'bg-slate-800/80 border-slate-700'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {isHi ? 'माइक्रोफ़ोन हार्डवेयर टेस्ट' : 'Microphone & Speech Diagnostic'}
                </h3>
                <p className="text-sm text-slate-400">
                  {isHi ? 'चेक करें कि टीवी रिमोट या ब्राउज़र का माइक काम कर रहा है' : 'Verify Web Speech API recognition and microphone permissions'}
                </p>
              </div>
            </div>

            <AccessibleButton
              variant={isTestingMic ? 'danger' : 'primary'}
              size="lg"
              highContrast={isHighContrast}
              onClick={handleTestMic}
              className="gap-2 whitespace-nowrap self-start sm:self-auto"
            >
              <Mic className="w-5 h-5" />
              <span>
                {isTestingMic
                  ? isHi ? 'सुन रहा हूँ...' : 'Listening...'
                  : isHi ? 'माइक टेस्ट करें' : 'Test Microphone'}
              </span>
            </AccessibleButton>
          </div>

          {micTestStatus && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 text-cyan-300 text-base font-mono">
              {micTestStatus}
            </div>
          )}
        </div>

        {/* 6. Patient Room Configuration */}
        <div
          className={`p-6 rounded-3xl border-2 flex flex-col gap-4 md:col-span-2 ${
            isHighContrast
              ? 'bg-black border-yellow-300 text-white'
              : 'bg-slate-800/80 border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <BedDouble className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {isHi ? 'मरीज कमरा और पहचान' : 'Patient Room & Identification'}
              </h3>
              <p className="text-sm text-slate-400">
                {isHi ? 'अस्पताल के टीवी के लिए कमरा नंबर और मरीज का नाम' : 'Configure current hospital room display for personalized assistance'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-xs uppercase font-bold text-slate-400 mb-1">
                Room Number
              </label>
              <input
                type="text"
                value={preferences.roomNumber}
                onChange={(e) => onUpdatePreferences({ roomNumber: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white font-bold text-lg outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-400 mb-1">
                Patient Name
              </label>
              <input
                type="text"
                value={preferences.patientName}
                onChange={(e) => onUpdatePreferences({ patientName: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white font-bold text-lg outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
