/**
 * Speech Recognition and Speech Synthesis Utilities for CareView AI
 * Designed for TV environments and accessible elderly interaction.
 */

// Global type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export type RecognitionState = 'idle' | 'listening' | 'processing' | 'error' | 'unsupported';

export interface RecognitionCallbacks {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (errorMessage: string, isPermissionError: boolean) => void;
  onEnd?: () => void;
}

export class TVSpeechRecognizer {
  private recognition: any = null;
  private isListening = false;
  private timeoutId: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public start(
    language: 'en' | 'hi' = 'en',
    callbacks: RecognitionCallbacks
  ): void {
    if (!this.recognition) {
      callbacks.onError?.('Voice recognition is not supported in this browser. Please use text input below.', false);
      return;
    }

    if (this.isListening) {
      this.stop();
    }

    this.recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      callbacks.onStart?.();

      // Guardrail: Safety timeout so elderly patients are never trapped in infinite listening state
      this.clearSafetyTimeout();
      this.timeoutId = setTimeout(() => {
        if (this.isListening) {
          this.stop();
          callbacks.onEnd?.();
        }
      }, 10000); // 10 second timeout
    };

    this.recognition.onresult = (event: any) => {
      this.clearSafetyTimeout();
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const resultText = final || interim;
      callbacks.onResult?.(resultText, Boolean(final));
    };

    this.recognition.onerror = (event: any) => {
      this.clearSafetyTimeout();
      this.isListening = false;
      const isPermission = event.error === 'not-allowed' || event.error === 'service-not-allowed';
      let message = 'Could not understand audio. Please try speaking again or use text input.';
      
      if (isPermission) {
        message = 'Microphone access was denied. Please allow microphone permissions in browser settings or use text.';
      } else if (event.error === 'no-speech') {
        message = 'No speech was detected. Please select the microphone and speak clearly.';
      } else if (event.error === 'network') {
        message = 'Speech recognition network error. Please check connection or use text input.';
      }

      callbacks.onError?.(message, isPermission);
    };

    this.recognition.onend = () => {
      this.clearSafetyTimeout();
      this.isListening = false;
      callbacks.onEnd?.();
    };

    try {
      this.recognition.start();
    } catch (err: any) {
      this.clearSafetyTimeout();
      this.isListening = false;
      callbacks.onError?.(err?.message || 'Failed to start speech recognition.', false);
    }
  }

  public stop(): void {
    this.clearSafetyTimeout();
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore stop errors
      }
    }
    this.isListening = false;
  }

  private clearSafetyTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

/**
 * Text-to-Speech (TTS) Synthesizer
 */
export class TVSpeechSynthesizer {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static currentUtterance: SpeechSynthesisUtterance | null = null;

  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public static speak(
    text: string,
    options: {
      language?: 'en' | 'hi';
      rate?: number;
      volume?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    } = {}
  ): void {
    if (!this.isSupported() || !this.synth) {
      options.onEnd?.();
      return;
    }

    // Cancel any previous speech immediately
    this.stop();

    const cleanText = text.replace(/[*#_`]/g, '').trim();
    if (!cleanText) {
      options.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = options.language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = options.rate ?? 0.95; // Slightly slower for elderly patients
    utterance.volume = options.volume ?? 1.0;
    utterance.pitch = 1.0;

    // Try finding matching voice
    const voices = this.synth.getVoices();
    const targetPrefix = options.language === 'hi' ? 'hi' : 'en';
    const voice = voices.find(v => v.lang.toLowerCase().startsWith(targetPrefix));
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      // Many browsers fire error when cancelled manually
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        options.onError?.(e);
      }
      options.onEnd?.();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public static pause(): void {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  public static resume(): void {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public static stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public static isSpeaking(): boolean {
    return Boolean(this.synth && this.synth.speaking);
  }

  public static isPaused(): boolean {
    return Boolean(this.synth && this.synth.paused);
  }
}
