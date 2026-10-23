'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Square, 
  Play, 
  Pause, 
  Send, 
  AlertTriangle, 
  Sparkles, 
  RotateCcw,
  Info,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { AccessibleButton } from './AccessibleButton';
import { TVSpeechRecognizer, TVSpeechSynthesizer } from '@/lib/speech';
import { PatientPreferences, AskResponse } from '@/types';
import { FREQUENT_QUESTIONS, HOSPITAL_METADATA } from '@/lib/hospitalKnowledge';
import { playTVSound } from '@/lib/preferences';

interface VoiceAssistantProps {
  preferences: PatientPreferences;
  onNavigateHome: () => void;
  onRequestAssistance: (category?: string, note?: string) => void;
  initialQuestion?: string;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  preferences,
  onNavigateHome,
  onRequestAssistance,
  initialQuestion = '',
}) => {
  const [questionInput, setQuestionInput] = useState<string>(initialQuestion);
  const [activeQuestion, setActiveQuestion] = useState<string>('');
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isAudioPaused, setIsAudioPaused] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPermissionDenied, setIsPermissionDenied] = useState<boolean>(false);

  const recognizerRef = useRef<TVSpeechRecognizer | null>(null);
  const micButtonRef = useRef<HTMLButtonElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  const isHi = preferences.language === 'hi';
  const isHighContrast = preferences.highContrast;

  // Initialize Speech Recognizer
  useEffect(() => {
    recognizerRef.current = new TVSpeechRecognizer();

    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      TVSpeechSynthesizer.stop();
    };
  }, []);

  // Handle auto-execution of initialQuestion if passed
  useEffect(() => {
    if (initialQuestion && initialQuestion.trim().length > 0) {
      handleAskQuestion(initialQuestion);
    }
  }, [initialQuestion]);

  const handleStartListening = () => {
    setErrorMessage(null);
    setIsPermissionDenied(false);

    if (!recognizerRef.current || !recognizerRef.current.isSupported()) {
      setErrorMessage(
        isHi
          ? 'इस ब्राउज़र में आवाज़ पहचान समर्थित नहीं है। कृपया नीचे लिखकर पूछें।'
          : 'Voice recognition is not supported in this browser. Please use the text input below.'
      );
      return;
    }

    // Stop speaking if currently speaking
    TVSpeechSynthesizer.stop();
    setIsSpeaking(false);

    recognizerRef.current.start(preferences.language, {
      onStart: () => {
        setIsListening(true);
        playTVSound('focus');
      },
      onResult: (transcript: string, isFinal: boolean) => {
        setQuestionInput(transcript);
        if (isFinal && transcript.trim().length > 0) {
          setIsListening(false);
          handleAskQuestion(transcript);
        }
      },
      onError: (err: string, isPerm: boolean) => {
        setIsListening(false);
        setIsPermissionDenied(isPerm);
        setErrorMessage(err);
        playTVSound('alert');
      },
      onEnd: () => {
        setIsListening(false);
      }
    });
  };

  const handleStopListening = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
    setIsListening(false);
  };

  const handleAskQuestion = async (queryToAsk?: string) => {
    const finalQuery = (queryToAsk || questionInput).trim();
    if (!finalQuery) return;

    // Stop mic if listening
    handleStopListening();
    TVSpeechSynthesizer.stop();
    setIsSpeaking(false);
    setIsAudioPaused(false);
    setErrorMessage(null);

    setActiveQuestion(finalQuery);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: finalQuery,
          language: preferences.language,
          roomNumber: preferences.roomNumber
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data: AskResponse = await res.json();
      setResponse(data);
      playTVSound(data.escalation ? 'alert' : 'success');

      // Auto-speak response if enabled in patient preferences
      if (preferences.autoSpeak && preferences.speechVolume > 0 && data.spokenAnswer) {
        speakResponse(data.spokenAnswer);
      }
    } catch (err: any) {
      console.error('Error querying assistant:', err);
      setErrorMessage(
        isHi
          ? 'उत्तर प्राप्त करने में असमर्थ। कृपया पुनः प्रयास करें या रिसेप्शन से संपर्क करें।'
          : 'Unable to reach assistant. Please try again or contact hospital reception.'
      );
      playTVSound('alert');
    } finally {
      setIsLoading(false);
    }
  };

  const speakResponse = (textToSpeak: string) => {
    if (!TVSpeechSynthesizer.isSupported() || preferences.speechVolume === 0) return;

    TVSpeechSynthesizer.speak(textToSpeak, {
      language: preferences.language,
      rate: preferences.speechRate,
      volume: preferences.speechVolume,
      onStart: () => {
        setIsSpeaking(true);
        setIsAudioPaused(false);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setIsAudioPaused(false);
      },
      onError: () => {
        setIsSpeaking(false);
        setIsAudioPaused(false);
      }
    });
  };

  const handleStopAudio = () => {
    TVSpeechSynthesizer.stop();
    setIsSpeaking(false);
    setIsAudioPaused(false);
    playTVSound('back');
  };

  const handleTogglePauseAudio = () => {
    if (isAudioPaused) {
      TVSpeechSynthesizer.resume();
      setIsAudioPaused(false);
      setIsSpeaking(true);
    } else {
      TVSpeechSynthesizer.pause();
      setIsAudioPaused(true);
      setIsSpeaking(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 py-4 animate-in fade-in duration-300">
      {/* Title & Screen Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span className={isHighContrast ? 'text-yellow-300' : 'text-cyan-400'}>
              {isHi ? 'CareView AI सहायक' : 'Ask CareView Assistant'}
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 mt-1">
            {isHi
              ? 'माइक दबाएं और बोलें, या नीचे से सवाल चुनें।'
              : 'Press the microphone and speak, or choose a common hospital question.'}
          </p>
        </div>

        {/* Status / Model Badge */}
        {response && (
          <div
            className={`self-start sm:self-auto px-4 py-2 rounded-2xl border text-sm font-semibold flex items-center gap-2 ${
              isHighContrast
                ? 'bg-zinc-900 border-yellow-300 text-yellow-300'
                : 'bg-slate-800/80 border-slate-700 text-cyan-300'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{response.modelUsed || 'Hospital Knowledge Base'}</span>
          </div>
        )}
      </div>

      {/* Primary Voice Action Banner */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 border-2 transition-all duration-300 ${
          isListening
            ? 'bg-gradient-to-br from-cyan-950 via-slate-900 to-teal-950 border-cyan-400 shadow-2xl shadow-cyan-500/30'
            : isHighContrast
            ? 'bg-black border-yellow-400'
            : 'bg-slate-800/80 border-slate-700 shadow-xl'
        }`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          {/* Mic Button & Waveform */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              {isListening && (
                <div className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-40 scale-125" />
              )}
              <AccessibleButton
                ref={micButtonRef}
                variant={isListening ? 'danger' : 'primary'}
                size="xl"
                highContrast={isHighContrast}
                onClick={isListening ? handleStopListening : handleStartListening}
                className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center shadow-2xl ${
                  isListening
                    ? 'ring-8 ring-cyan-400/50 bg-rose-600 hover:bg-rose-500 text-white'
                    : ''
                }`}
                aria-label={isListening ? 'Stop listening' : 'Start speaking'}
              >
                {isListening ? (
                  <>
                    <Square className="w-10 h-10 fill-current" />
                    <span className="text-xs uppercase font-black mt-1">
                      {isHi ? 'रोकें' : 'STOP'}
                    </span>
                  </>
                ) : (
                  <>
                    <Mic className="w-12 h-12 stroke-[2.5]" />
                    <span className="text-xs uppercase font-black mt-1">
                      {isHi ? 'बोलें' : 'SPEAK'}
                    </span>
                  </>
                )}
              </AccessibleButton>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                {isListening
                  ? isHi
                    ? 'सुन रहा हूँ... कृपया बोलें'
                    : 'Listening... Please speak your question'
                  : isHi
                  ? 'आवाज़ से पूछने के लिए माइक दबाएं'
                  : 'Press microphone to ask with your voice'}
              </h3>
              <p className="text-base sm:text-lg text-slate-300 mt-1 max-w-xl">
                {isListening
                  ? isHi
                    ? 'उदाहरण: "कैफेटेरिया कहाँ है?" या "मुलाकात का समय क्या है?"'
                    : 'Example: "Where is the cafeteria?" or "What are visiting hours?"'
                  : isHi
                  ? 'रिमोट का [M] बटन दबाकर भी बोल सकते हैं।'
                  : 'You can also press [M] on your TV remote or use text input.'}
              </p>
            </div>
          </div>

          {/* Sound Wave Animation when active */}
          {isListening && (
            <div className="flex items-center gap-2 h-14 px-6 py-2 rounded-2xl bg-cyan-950/60 border border-cyan-500/40">
              <span className="w-2 bg-cyan-400 rounded-full animate-soundWave" style={{ animationDelay: '0ms' }} />
              <span className="w-2 bg-cyan-400 rounded-full animate-soundWave" style={{ animationDelay: '150ms' }} />
              <span className="w-2 bg-cyan-400 rounded-full animate-soundWave" style={{ animationDelay: '300ms' }} />
              <span className="w-2 bg-cyan-400 rounded-full animate-soundWave" style={{ animationDelay: '450ms' }} />
              <span className="w-2 bg-cyan-400 rounded-full animate-soundWave" style={{ animationDelay: '200ms' }} />
              <span className="w-2 bg-cyan-400 rounded-full animate-soundWave" style={{ animationDelay: '350ms' }} />
              <span className="text-cyan-300 font-bold ml-2 text-sm uppercase tracking-wider">
                {isHi ? 'आवाज़ रिकॉर्ड हो रही है' : 'Active'}
              </span>
            </div>
          )}
        </div>

        {/* Text Input Fallback Bar */}
        <div className="mt-6 pt-6 border-t border-slate-700/80 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              ref={textInputRef}
              type="text"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAskQuestion();
                }
              }}
              placeholder={
                isHi
                  ? 'यहाँ सवाल लिखें (उदा. कैफेटेरिया, वाई-फाई, नर्स)...'
                  : 'Type question here (e.g., cafeteria, visiting hours, nurse)...'
              }
              className={`w-full px-5 py-3.5 text-lg sm:text-xl rounded-2xl outline-none transition font-medium ${
                isHighContrast
                  ? 'bg-zinc-900 border-2 border-yellow-300 text-white placeholder-zinc-400 focus:ring-4 focus:ring-yellow-300'
                  : 'bg-slate-900/90 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/30'
              }`}
            />
          </div>

          <AccessibleButton
            variant="primary"
            size="lg"
            highContrast={isHighContrast}
            onClick={() => handleAskQuestion()}
            disabled={isLoading || !questionInput.trim()}
            className="w-full sm:w-auto px-8 whitespace-nowrap gap-2"
          >
            {isLoading ? (
              <span>{isHi ? 'खोज रहा है...' : 'Searching...'}</span>
            ) : (
              <>
                <Send className="w-6 h-6" />
                <span>{isHi ? 'पूछें' : 'Ask Question'}</span>
              </>
            )}
          </AccessibleButton>
        </div>
      </div>

      {/* Error or Permission Denied Message */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-4 p-5 rounded-2xl bg-amber-950/80 border-2 border-amber-500/80 text-amber-200 animate-in fade-in"
        >
          <AlertTriangle className="w-7 h-7 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xl font-bold text-amber-300">
              {isPermissionDenied
                ? isHi ? 'माइक्रोफ़ोन अनुमति आवश्यक है' : 'Microphone Permission Required'
                : isHi ? 'सूचना' : 'Notice'}
            </h4>
            <p className="text-base text-amber-200 mt-1">{errorMessage}</p>
          </div>
          <AccessibleButton
            variant="secondary"
            size="md"
            highContrast={isHighContrast}
            onClick={() => setErrorMessage(null)}
          >
            {isHi ? 'बंद करें' : 'Dismiss'}
          </AccessibleButton>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="p-8 rounded-3xl bg-slate-800/60 border border-slate-700 animate-pulse flex flex-col gap-4">
          <div className="h-6 bg-slate-700 rounded-xl w-1/3" />
          <div className="h-10 bg-slate-700 rounded-2xl w-3/4" />
          <div className="h-10 bg-slate-700 rounded-2xl w-1/2" />
        </div>
      )}

      {/* Answer & Spoken Response Card */}
      {response && !isLoading && (
        <div
          role="region"
          aria-label="Assistant Response"
          className={`rounded-3xl p-6 sm:p-8 border-2 shadow-2xl transition-all duration-300 ${
            response.escalation
              ? 'bg-rose-950/70 border-rose-500 shadow-rose-900/30'
              : isHighContrast
              ? 'bg-black border-yellow-300 text-white'
              : 'bg-slate-800/95 border-cyan-500/50 shadow-cyan-950/40 text-slate-50'
          }`}
        >
          {/* Recognized Question Tag */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-700/60">
            <div className="flex items-center gap-2 text-slate-300 text-lg">
              <span className="font-semibold text-slate-400">
                {isHi ? 'आपने पूछा:' : 'You asked:'}
              </span>
              <span className="font-bold text-white italic">"{activeQuestion}"</span>
            </div>

            {/* Audio Controls Bar */}
            <div className="flex items-center gap-2">
              {isSpeaking && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-900/50 border border-cyan-400 text-cyan-300 text-sm font-semibold">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>{isHi ? 'ऑडियो सक्रिय' : 'Speaking'}</span>
                </div>
              )}

              <AccessibleButton
                variant={isSpeaking ? 'danger' : 'secondary'}
                size="md"
                highContrast={isHighContrast}
                onClick={
                  isSpeaking
                    ? handleStopAudio
                    : () => speakResponse(response.spokenAnswer || response.answer)
                }
                className="gap-2"
                title={isSpeaking ? 'Stop Spoken Audio' : 'Read Answer Aloud'}
              >
                {isSpeaking ? (
                  <>
                    <Square className="w-5 h-5 fill-current" />
                    <span>{isHi ? 'ऑडियो रोकें' : 'Stop Audio'}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5 text-cyan-400" />
                    <span>{isHi ? 'सुनें' : 'Listen'}</span>
                  </>
                )}
              </AccessibleButton>
            </div>
          </div>

          {/* Critical Emergency Banner if triggered */}
          {response.escalation && (
            <div className="mt-4 p-4 rounded-2xl bg-rose-900/80 border-2 border-rose-400 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-9 h-9 text-rose-300 animate-bounce shrink-0" />
                <div>
                  <h4 className="text-xl font-black text-rose-200">
                    {isHi ? 'तुरंत नर्स कॉल बटन दबाएं!' : 'URGENT: Press Red Bedside Nurse Button!'}
                  </h4>
                  <p className="text-sm text-rose-100">
                    {isHi
                      ? 'CareView AI आपातकालीन निदान नहीं कर सकता। नर्सिंग स्टाफ तुरंत पहुंचेगा।'
                      : 'CareView AI cannot treat acute medical symptoms. The emergency team is ready.'}
                  </p>
                </div>
              </div>
              <AccessibleButton
                variant="danger"
                size="lg"
                highContrast={isHighContrast}
                onClick={() => onRequestAssistance('Medical / Nurse', `Urgent alert regarding: ${activeQuestion}`)}
                className="whitespace-nowrap px-6"
              >
                {isHi ? 'सहायता का अनुरोध भेजें' : 'Log Nurse Alert'}
              </AccessibleButton>
            </div>
          )}

          {/* Large, Readable Answer Display */}
          <div className="mt-6">
            <p
              className={`font-semibold leading-relaxed ${
                preferences.textSize === 'extra-large'
                  ? 'text-3xl sm:text-4xl leading-snug'
                  : preferences.textSize === 'standard'
                  ? 'text-xl sm:text-2xl leading-relaxed'
                  : 'text-2xl sm:text-3xl leading-relaxed'
              } ${isHighContrast ? 'text-yellow-200' : 'text-slate-50'}`}
            >
              {response.answer}
            </p>
          </div>

          {/* Follow-up Question Suggestions */}
          {((isHi ? response.suggestedFollowUpsHi : response.suggestedFollowUps) || []).length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-700/60">
              <p className="text-sm uppercase font-bold text-slate-400 tracking-wider mb-3">
                {isHi ? 'संबंधित प्रश्न पूछें:' : 'Related Questions:'}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {((isHi ? response.suggestedFollowUpsHi : response.suggestedFollowUps) || []).map(
                  (q, idx) => (
                    <AccessibleButton
                      key={idx}
                      variant="outline"
                      size="md"
                      highContrast={isHighContrast}
                      onClick={() => handleAskQuestion(q)}
                      className="text-base text-cyan-300"
                    >
                      <span>{q}</span>
                      <ArrowRight className="w-4 h-4 ml-1 opacity-70" />
                    </AccessibleButton>
                  )
                )}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="mt-8 pt-6 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                {isHi
                  ? 'सेंट ज्यूड अस्पताल ज्ञानकोष से सत्यापित'
                  : 'Verified with St. Jude Hospital Knowledge Base'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <AccessibleButton
                variant="secondary"
                size="md"
                highContrast={isHighContrast}
                onClick={() => {
                  setResponse(null);
                  setQuestionInput('');
                  setActiveQuestion('');
                  handleStopAudio();
                }}
                className="gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>{isHi ? 'नया सवाल पूछें' : 'Ask Another'}</span>
              </AccessibleButton>

              <AccessibleButton
                variant="primary"
                size="md"
                highContrast={isHighContrast}
                onClick={() => onRequestAssistance('General Request', `Follow-up to question: ${activeQuestion}`)}
                className="gap-2"
              >
                <span>{isHi ? 'नर्स से मदद मांगें' : 'Need Nurse Help'}</span>
              </AccessibleButton>
            </div>
          </div>
        </div>
      )}

      {/* Common Quick Questions Grid */}
      <div className="mt-2">
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-cyan-400" />
          <span>{isHi ? 'अक्सर पूछे जाने वाले सवाल' : 'Frequently Asked Questions'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {FREQUENT_QUESTIONS.map((item, idx) => {
            const label = isHi ? item.hi : item.en;
            const isDanger = item.category === 'emergency';

            return (
              <AccessibleButton
                key={idx}
                variant={isDanger ? 'danger' : 'card'}
                size="lg"
                highContrast={isHighContrast}
                onClick={() => handleAskQuestion(label)}
                className={`w-full justify-start text-left p-4 rounded-2xl border ${
                  isDanger
                    ? 'border-rose-500/70'
                    : isHighContrast
                    ? 'border-zinc-700'
                    : 'border-slate-700/80 hover:border-cyan-500/50'
                }`}
              >
                <div className="flex items-center justify-between w-full gap-3">
                  <span className="text-lg font-medium leading-snug">{label}</span>
                  <ArrowRight className="w-5 h-5 shrink-0 text-cyan-400" />
                </div>
              </AccessibleButton>
            );
          })}
        </div>
      </div>
    </div>
  );
};
