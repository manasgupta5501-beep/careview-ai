'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  Utensils, 
  HelpCircle, 
  Compass, 
  ShieldPlus, 
  AlertTriangle, 
  MapPin, 
  Phone, 
  Search, 
  Volume2, 
  MessageSquareQuote, 
  Info,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { AccessibleButton } from './AccessibleButton';
import { HOSPITAL_KNOWLEDGE_BASE, HOSPITAL_METADATA } from '@/lib/hospitalKnowledge';
import { PatientPreferences, HospitalInfoItem } from '@/types';
import { TVSpeechSynthesizer } from '@/lib/speech';
import { playTVSound } from '@/lib/preferences';

interface HospitalInformationProps {
  preferences: PatientPreferences;
  onAskAboutItem: (question: string) => void;
  onRequestAssistance: (category: string) => void;
}

export const HospitalInformation: React.FC<HospitalInformationProps> = ({
  preferences,
  onAskAboutItem,
  onRequestAssistance,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [readingItemId, setReadingItemId] = useState<string | null>(null);

  const isHi = preferences.language === 'hi';
  const isHighContrast = preferences.highContrast;

  const categories = [
    { id: 'all', label: isHi ? 'सभी जानकारी' : 'All Information', icon: Info },
    { id: 'visiting', label: isHi ? 'मुलाकात का समय' : 'Visiting Hours', icon: Clock },
    { id: 'cafeteria', label: isHi ? 'कैफेटेरिया व भोजन' : 'Cafeteria & Dining', icon: Utensils },
    { id: 'reception', label: isHi ? 'रिसेप्शन व सहायता' : 'Reception & Help', icon: HelpCircle },
    { id: 'navigation', label: isHi ? 'अस्पताल नक्शा' : 'Navigation & Floors', icon: Compass },
    { id: 'services', label: isHi ? 'मरीज सुविधाएं' : 'Services & Wi-Fi', icon: ShieldPlus },
    { id: 'emergency', label: isHi ? 'इमरजेंसी नियम' : 'Emergency Safety', icon: AlertTriangle },
  ];

  const filteredItems = HOSPITAL_KNOWLEDGE_BASE.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const title = (isHi ? item.titleHi : item.title).toLowerCase();
    const summary = (isHi ? item.summaryHi : item.summary).toLowerCase();
    const location = (item.location || '').toLowerCase();
    return title.includes(q) || summary.includes(q) || location.includes(q);
  });

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Clock': return Clock;
      case 'Utensils': return Utensils;
      case 'HelpCircle': return HelpCircle;
      case 'Compass': return Compass;
      case 'ShieldPlus': return ShieldPlus;
      case 'AlertTriangle': return AlertTriangle;
      default: return Info;
    }
  };

  const handleReadCardAloud = (item: HospitalInfoItem) => {
    const textToRead = isHi
      ? `${item.titleHi}. ${item.summaryHi}. ${item.detailsHi.join('. ')}`
      : `${item.title}. ${item.summary}. ${item.details.join('. ')}`;

    if (readingItemId === item.id) {
      TVSpeechSynthesizer.stop();
      setReadingItemId(null);
      return;
    }

    setReadingItemId(item.id);
    TVSpeechSynthesizer.speak(textToRead, {
      language: preferences.language,
      rate: preferences.speechRate,
      volume: preferences.speechVolume,
      onEnd: () => setReadingItemId(null),
      onError: () => setReadingItemId(null),
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 py-4 animate-in fade-in duration-300">
      {/* Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            <span className={isHighContrast ? 'text-yellow-300' : 'text-cyan-400'}>
              {isHi ? 'अस्पताल निर्देशिका और सुविधाएं' : 'Hospital Guide & Services'}
            </span>
          </h2>
          <p className="text-lg text-slate-300 mt-1">
            {isHi
              ? `${HOSPITAL_METADATA.nameHi} की आधिकारिक जानकारी`
              : `Official patient guide for ${HOSPITAL_METADATA.name}`}
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isHi ? 'सर्च करें...' : 'Search guide...'}
            className={`w-full pl-12 pr-4 py-3 rounded-2xl outline-none font-medium text-base transition ${
              isHighContrast
                ? 'bg-zinc-900 border-2 border-yellow-300 text-white placeholder-zinc-400'
                : 'bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 focus:border-cyan-400'
            }`}
          />
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;

          return (
            <AccessibleButton
              key={cat.id}
              variant={isActive ? 'primary' : 'secondary'}
              size="md"
              highContrast={isHighContrast}
              onClick={() => {
                setSelectedCategory(cat.id);
                playTVSound('focus');
              }}
              className="whitespace-nowrap px-5 py-3 rounded-2xl gap-2 font-bold"
            >
              <Icon className="w-5 h-5" />
              <span>{cat.label}</span>
            </AccessibleButton>
          );
        })}
      </div>

      {/* Hospital Information Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredItems.map((item) => {
          const Icon = getCategoryIcon(item.iconName);
          const title = isHi ? item.titleHi : item.title;
          const summary = isHi ? item.summaryHi : item.summary;
          const details = isHi ? item.detailsHi : item.details;
          const importantNote = isHi ? item.importantNoteHi : item.importantNote;
          const isReading = readingItemId === item.id;
          const isEmergency = item.category === 'emergency';

          return (
            <div
              key={item.id}
              className={`rounded-3xl p-6 sm:p-7 border-2 flex flex-col justify-between transition-all duration-200 ${
                isEmergency
                  ? 'bg-rose-950/40 border-rose-500/70 shadow-rose-950/30'
                  : isHighContrast
                  ? 'bg-black border-yellow-300 text-white'
                  : 'bg-slate-800/80 border-slate-700 shadow-xl hover:border-cyan-500/40'
              }`}
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-2xl ${
                        isEmergency
                          ? 'bg-rose-600 text-white'
                          : isHighContrast
                          ? 'bg-yellow-400 text-black'
                          : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      }`}
                    >
                      <Icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">
                        {title}
                      </h3>
                      <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                        {item.category.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Read Aloud Button */}
                  <AccessibleButton
                    variant={isReading ? 'danger' : 'ghost'}
                    size="md"
                    highContrast={isHighContrast}
                    onClick={() => handleReadCardAloud(item)}
                    className="p-2.5 rounded-xl border border-slate-700 hover:border-cyan-400"
                    title={isReading ? 'Stop Reading' : 'Read Card Aloud'}
                    aria-label={`Read ${title} aloud`}
                  >
                    <Volume2 className={`w-5 h-5 ${isReading ? 'text-white animate-pulse' : 'text-cyan-400'}`} />
                  </AccessibleButton>
                </div>

                {/* Summary */}
                <p className="mt-4 text-xl font-medium text-slate-200 leading-relaxed">
                  {summary}
                </p>

                {/* Meta badges: Location, Hours, Contact */}
                <div className="flex flex-wrap gap-2.5 my-4">
                  {item.location && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-sm text-slate-300">
                      <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{item.location}</span>
                    </div>
                  )}

                  {item.hours && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-sm text-slate-300">
                      <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{item.hours}</span>
                    </div>
                  )}

                  {item.contact && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-sm text-slate-300">
                      <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{item.contact}</span>
                    </div>
                  )}
                </div>

                {/* Details list */}
                <ul className="space-y-2.5 mt-2">
                  {details.map((detail, dIdx) => (
                    <li key={dIdx} className="flex items-start gap-2.5 text-base sm:text-lg text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 mt-2.5 shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                {/* Important notice if present */}
                {importantNote && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/50 text-amber-200 text-sm flex items-start gap-2.5">
                    <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{importantNote}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="mt-6 pt-4 border-t border-slate-700/80 flex items-center justify-between gap-3">
                <AccessibleButton
                  variant="outline"
                  size="md"
                  highContrast={isHighContrast}
                  onClick={() => onAskAboutItem(title)}
                  className="gap-2 text-cyan-300 border-cyan-500/40"
                >
                  <MessageSquareQuote className="w-5 h-5" />
                  <span>{isHi ? 'इसके बारे में पूछें' : 'Ask AI About This'}</span>
                </AccessibleButton>

                <AccessibleButton
                  variant={isEmergency ? 'danger' : 'secondary'}
                  size="md"
                  highContrast={isHighContrast}
                  onClick={() => onRequestAssistance(title)}
                  className="gap-2"
                >
                  <span>{isHi ? 'सहायता मांगें' : 'Request Help'}</span>
                  <ChevronRight className="w-4 h-4" />
                </AccessibleButton>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
