'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export type VoiceState =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'understanding'
  | 'action_detected'
  | 'confirmation_required'
  | 'completed'
  | 'error';

interface UseVoiceRecognitionOptions {
  onTranscriptReady?: (transcript: string) => void;
  language?: string; // 'hi-IN' | 'en-IN' | 'en-US'
}

export function useVoiceRecognition({
  onTranscriptReady,
  language = 'hi-IN',
}: UseVoiceRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceState('listening');
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTrans = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (currentInterim) {
          setInterimTranscript(currentInterim);
        }

        if (finalTrans) {
          setTranscript(finalTrans);
          setVoiceState('understanding');
          if (onTranscriptReady) {
            onTranscriptReady(finalTrans);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          setErrorMessage('No speech heard. Please try again.');
        } else if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions.');
        } else {
          setErrorMessage(`Microphone error: ${event.error}`);
        }
        setIsListening(false);
        setVoiceState('idle');
      };

      recognition.onend = () => {
        setIsListening(false);
        if (voiceState === 'listening') {
          setVoiceState('idle');
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [language, onTranscriptReady, voiceState]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      // Fallback message
      setErrorMessage('Speech recognition is not supported in this browser. You can type or use sample voice commands.');
      return;
    }
    setTranscript('');
    setInterimTranscript('');
    setErrorMessage(null);
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.warn('Could not start recognition', e);
      try {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current?.start(), 100);
      } catch (err) {
        // ignore
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const simulateVoiceInput = useCallback((sampleText: string) => {
    setVoiceState('listening');
    setTranscript('');
    setInterimTranscript('Listening to sample audio...');
    
    setTimeout(() => {
      setVoiceState('understanding');
      setTranscript(sampleText);
      setInterimTranscript('');
      if (onTranscriptReady) {
        onTranscriptReady(sampleText);
      }
    }, 600);
  }, [onTranscriptReady]);

  // Text to Speech Helper for Multilingual Voice Feedback
  const speakResponse = useCallback((textToSpeak: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        // Try finding an Indian English or Hindi voice
        const voices = window.speechSynthesis.getVoices();
        const indianVoice = voices.find(
          (v) => v.lang.includes('hi') || v.lang.includes('en-IN')
        );
        if (indianVoice) {
          utterance.voice = indianVoice;
        }
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis error', e);
      }
    }
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    voiceState,
    setVoiceState,
    isSupported,
    errorMessage,
    startListening,
    stopListening,
    simulateVoiceInput,
    speakResponse,
  };
}
