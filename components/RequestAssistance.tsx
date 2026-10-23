'use client';

import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Droplet, 
  Footprints, 
  Bed, 
  Pill, 
  MapPin, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Mic, 
  ArrowLeft, 
  Clock, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { AccessibleButton } from './AccessibleButton';
import { PatientPreferences, AssistanceRequest } from '@/types';
import { TVSpeechRecognizer, TVSpeechSynthesizer } from '@/lib/speech';
import { playTVSound } from '@/lib/preferences';

interface RequestAssistanceProps {
  preferences: PatientPreferences;
  onNavigateHome: () => void;
  onNavigateStaff: () => void;
  initialCategory?: string;
  initialNote?: string;
}

export const RequestAssistance: React.FC<RequestAssistanceProps> = ({
  preferences,
  onNavigateHome,
  onNavigateStaff,
  initialCategory,
  initialNote = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'Need a Nurse');
  const [note, setNote] = useState<string>(initialNote);
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRequest, setSubmittedRequest] = useState<AssistanceRequest | null>(null);
  const [isRecordingNote, setIsRecordingNote] = useState<boolean>(false);

  const isHi = preferences.language === 'hi';
  const isHighContrast = preferences.highContrast;

  const categories = [
    {
      id: 'Need a Nurse',
      label: isHi ? 'नर्स की आवश्यकता है' : 'Need a Nurse',
      sub: isHi ? 'सामान्य जांच या सहायता' : 'General nurse assistance',
      icon: HeartHandshake,
      color: 'cyan'
    },
    {
      id: 'Water or Ice',
      label: isHi ? 'पीने का पानी या बर्फ' : 'Water or Ice',
      sub: isHi ? 'कमरे में पानी की डिलीवरी' : 'Bedside water refill',
      icon: Droplet,
      color: 'blue'
    },
    {
      id: 'Bathroom / Mobility Help',
      label: isHi ? 'बाथरूम / चलने में मदद' : 'Bathroom / Mobility Help',
      sub: isHi ? 'गिरने से बचाव के लिए सहारा' : 'Fall prevention & walking aid',
      icon: Footprints,
      color: 'teal'
    },
    {
      id: 'Extra Blanket / Pillow',
      label: isHi ? 'अतिरिक्त कंबल या तकिया' : 'Extra Blanket / Pillow',
      sub: isHi ? 'बिस्तर की गर्माहट व आराम' : 'Comfort & warmth',
      icon: Bed,
      color: 'indigo'
    },
    {
      id: 'Pain Relief (Notify Nurse)',
      label: isHi ? 'दर्द राहत (नर्स को बताएं)' : 'Pain Relief (Notify Nurse)',
      sub: isHi ? 'नर्सिंग टीम को सूचना' : 'Notify floor nurse of pain',
      icon: Pill,
      color: 'rose'
    },
    {
      id: 'Hospital Navigation',
      label: isHi ? 'अस्पताल मार्गदर्शन' : 'Hospital Guide / Reception',
      sub: isHi ? 'व्हीलचेयर या दिशा सहायता' : 'Wheelchair escort or directions',
      icon: MapPin,
      color: 'emerald'
    }
  ];

  const handleVoiceRecordNote = () => {
    const recognizer = new TVSpeechRecognizer();
    if (!recognizer.isSupported()) {
      alert(isHi ? 'आवाज़ पहचान समर्थित नहीं है।' : 'Voice recognition not supported.');
      return;
    }

    setIsRecordingNote(true);
    recognizer.start(preferences.language, {
      onResult: (text, isFinal) => {
        setNote(text);
        if (isFinal) {
          setIsRecordingNote(false);
        }
      },
      onError: () => setIsRecordingNote(false),
      onEnd: () => setIsRecordingNote(false)
    });
  };

  const handleSubmitRequest = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          description: note.trim() || `${selectedCategory} requested via CareView AI`,
          roomNumber: preferences.roomNumber,
          patientName: preferences.patientName,
          priority
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      setSubmittedRequest(data.request);
      playTVSound('success');

      // Speak confirmation
      if (preferences.autoSpeak && preferences.speechVolume > 0) {
        const spoken = isHi
          ? `आपकी सहायता का अनुरोध दर्ज कर लिया गया है। अनुरोध संख्या ${data.request.id}`
          : `Your assistance request has been submitted. Request ID ${data.request.id}.`;
        TVSpeechSynthesizer.speak(spoken, { language: preferences.language });
      }
    } catch (err) {
      console.error('Failed to submit assistance request:', err);
      alert(isHi ? 'अनुरोध दर्ज करने में विफल।' : 'Failed to submit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 py-4 animate-in fade-in duration-300">
      {/* Critical Emergency Banner */}
      <div
        role="alert"
        className="p-5 sm:p-6 rounded-3xl bg-rose-950/80 border-2 border-rose-500 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl shadow-rose-950/40"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-rose-600 text-white shrink-0">
            <ShieldAlert className="w-9 h-9 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-rose-200">
              {isHi
                ? 'आपातकालीन सूचना: यह आपातकालीन प्रणाली नहीं है'
                : 'IMPORTANT: CareView AI is NOT an Emergency Response System'}
            </h3>
            <p className="text-base sm:text-lg text-rose-100 mt-0.5 max-w-3xl">
              {isHi
                ? 'यदि सीने में दर्द, सांस लेने में अत्यधिक तकलीफ या चक्कर आ रहा है, तो तुरंत अपने तकिए के पास मौजूद लाल बटन दबाएं।'
                : 'For acute emergencies, severe pain, or bleeding, press the RED physical call button on your bedside remote or pull the bathroom cord immediately.'}
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Screen if request submitted */}
      {submittedRequest ? (
        <div
          className={`rounded-3xl p-8 border-2 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 ${
            isHighContrast
              ? 'bg-black border-yellow-300 text-white'
              : 'bg-slate-800/90 border-cyan-500/50 text-slate-100'
          }`}
        >
          <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-4">
            <CheckCircle2 className="w-16 h-16" />
          </div>

          <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-400 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-800">
            {isHi ? 'अनुरोध दर्ज हुआ (डेमो मोड)' : 'Request Submitted (Demonstration Mode)'}
          </span>

          <h3 className="text-3xl sm:text-4xl font-extrabold text-white mt-4">
            {isHi ? 'सहायता अनुरोध प्राप्त हो गया है' : 'Assistance Request Logged'}
          </h3>

          <p className="text-xl text-slate-300 mt-2 max-w-xl">
            {isHi
              ? `अनुरोध आईडी: ${submittedRequest.id} • कमरा: ${submittedRequest.roomNumber}`
              : `Request Reference ID: ${submittedRequest.id} for ${submittedRequest.roomNumber}`}
          </p>

          <div className="w-full max-w-md p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 my-6 text-left space-y-2">
            <div className="flex justify-between text-base">
              <span className="text-slate-400">{isHi ? 'श्रेणी:' : 'Category:'}</span>
              <span className="font-bold text-white">{submittedRequest.category}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-slate-400">{isHi ? 'स्थिति:' : 'Status:'}</span>
              <span className="font-bold text-amber-400">{submittedRequest.status}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-slate-400">{isHi ? 'समय:' : 'Time:'}</span>
              <span className="text-slate-300">
                {new Date(submittedRequest.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Demonstration Notice */}
          <p className="text-sm text-slate-400 max-w-lg mb-6 italic">
            {isHi
              ? 'यह एक लाइव प्रदर्शन है। अस्पताल के वास्तविक ईएचआर/पेजर से जुड़े बिना वास्तविक कर्मचारियों को सूचना नहीं भेजी जाएगी।'
              : 'Demonstration notification: CareView AI logs requests to the internal staff dashboard for review.'}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <AccessibleButton
              variant="outline"
              size="lg"
              highContrast={isHighContrast}
              onClick={() => {
                setSubmittedRequest(null);
                setNote('');
              }}
              className="gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{isHi ? 'एक और अनुरोध भेजें' : 'Submit Another Request'}</span>
            </AccessibleButton>

            <AccessibleButton
              variant="primary"
              size="lg"
              highContrast={isHighContrast}
              onClick={onNavigateStaff}
              className="gap-2"
            >
              <ExternalLink className="w-5 h-5" />
              <span>{isHi ? 'स्टाफ डैशबोर्ड पर देखें' : 'View on Staff Dashboard'}</span>
            </AccessibleButton>
          </div>
        </div>
      ) : (
        /* Request Form */
        <div
          className={`rounded-3xl p-6 sm:p-8 border-2 shadow-2xl flex flex-col gap-6 ${
            isHighContrast
              ? 'bg-black border-yellow-300 text-white'
              : 'bg-slate-800/80 border-slate-700'
          }`}
        >
          <div>
            <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
              <span className={isHighContrast ? 'text-yellow-300' : 'text-cyan-400'}>
                {isHi ? 'अस्पताल सहायता का अनुरोध करें' : 'Request Hospital Assistance'}
              </span>
            </h2>
            <p className="text-lg text-slate-300 mt-1">
              {isHi
                ? 'अपनी आवश्यकता चुनें। स्टाफ बोर्ड पर आपका अनुरोध दर्ज कर दिया जाएगा।'
                : 'Select an assistance option below to alert the nursing support staff for your room.'}
            </p>
          </div>

          {/* Category Selection Grid */}
          <div>
            <label className="block text-sm uppercase tracking-wider font-bold text-slate-400 mb-3">
              {isHi ? '1. सहायता की श्रेणी चुनें:' : '1. Select Assistance Category:'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;

                return (
                  <AccessibleButton
                    key={cat.id}
                    variant={isSelected ? 'primary' : 'card'}
                    size="lg"
                    highContrast={isHighContrast}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      playTVSound('focus');
                    }}
                    className={`justify-start text-left p-4.5 rounded-2xl border ${
                      isSelected
                        ? 'border-cyan-400 ring-2 ring-cyan-400/50'
                        : isHighContrast
                        ? 'border-zinc-700'
                        : 'border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div
                        className={`p-2.5 rounded-xl ${
                          isSelected
                            ? 'bg-slate-950 text-cyan-300'
                            : 'bg-slate-900 text-cyan-400'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="text-lg font-bold">{cat.label}</div>
                        <div className="text-xs text-slate-300 font-normal">{cat.sub}</div>
                      </div>
                    </div>
                  </AccessibleButton>
                );
              })}
            </div>
          </div>

          {/* Additional Notes or Voice Note */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm uppercase tracking-wider font-bold text-slate-400">
                {isHi ? '2. अतिरिक्त विवरण या बोलकर बताएं (वैकल्पिक):' : '2. Optional Notes or Voice Message:'}
              </label>
              <AccessibleButton
                variant={isRecordingNote ? 'danger' : 'outline'}
                size="md"
                highContrast={isHighContrast}
                onClick={handleVoiceRecordNote}
                className="gap-2 py-2 text-sm"
              >
                <Mic className="w-4 h-4" />
                <span>
                  {isRecordingNote
                    ? isHi ? 'सुन रहा हूँ...' : 'Recording...'
                    : isHi ? 'बोलकर लिखें' : 'Speak Note'}
                </span>
              </AccessibleButton>
            </div>

            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                isHi
                  ? 'उदा: कृपया एक अतिरिक्त तकिया और गर्म पानी की बोतल भिजवा दें...'
                  : 'E.g., Please bring an extra warm blanket and drinking water...'
              }
              className={`w-full p-4 rounded-2xl outline-none font-medium text-lg transition ${
                isHighContrast
                  ? 'bg-zinc-900 border-2 border-yellow-300 text-white placeholder-zinc-500'
                  : 'bg-slate-900/90 border border-slate-700 text-white placeholder-slate-400 focus:border-cyan-400'
              }`}
            />
          </div>

          {/* Patient Room Details Confirmation */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/80 flex flex-wrap items-center justify-between gap-4 text-base">
            <div className="flex items-center gap-3">
              <span className="text-slate-400">{isHi ? 'मरीज कमरा:' : 'Assigned Room:'}</span>
              <span className="font-extrabold text-cyan-300">{preferences.roomNumber}</span>
              <span className="text-slate-500">•</span>
              <span className="font-bold text-slate-200">{preferences.patientName}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">{isHi ? 'प्राथमिकता:' : 'Priority:'}</span>
              <button
                type="button"
                onClick={() => setPriority(priority === 'normal' ? 'urgent' : 'normal')}
                className={`px-3 py-1 rounded-xl text-xs font-bold uppercase transition ${
                  priority === 'urgent'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {priority === 'urgent'
                  ? isHi ? 'अति आवश्यक' : 'Urgent Request'
                  : isHi ? 'सामान्य' : 'Normal Priority'}
              </button>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="flex items-center justify-end gap-4 pt-2">
            <AccessibleButton
              variant="primary"
              size="xl"
              highContrast={isHighContrast}
              onClick={handleSubmitRequest}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-10 gap-3"
            >
              <Send className="w-7 h-7" />
              <span>
                {isSubmitting
                  ? isHi ? 'भेज रहा है...' : 'Logging Request...'
                  : isHi ? 'अनुरोध भेजें' : 'Send Assistance Request'}
              </span>
            </AccessibleButton>
          </div>
        </div>
      )}
    </div>
  );
};
