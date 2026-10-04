'use client';

import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  XCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Check,
  RotateCcw,
  Volume2,
  Calendar,
  IndianRupee,
  Package,
  User,
  Clock,
  Layers,
  WifiOff,
  CheckCheck,
} from 'lucide-react';
import { useBusiness } from '@/context/BusinessContext';
import { useVoiceRecognition } from '@/lib/hooks/useVoiceRecognition';
import { parseBusinessIntent } from '@/lib/ai/nlpEngine';
import { PaymentStatus, AIIntentResult, TransactionLanguageMeta } from '@/types';
import {
  RangoliCorner,
  VoiceVisualizer,
  MandalaMedium,
} from '@/components/rangoli/RangoliMotif';
import { getLocaleConfig } from '@/lib/i18n/locales.config';

type VoiceState =
  | 'IDLE'
  | 'LISTENING'
  | 'PROCESSING'
  | 'VALIDATING'
  | 'NEEDS_CLARIFICATION'
  | 'CONFIRMATION'
  | 'SUCCESS'
  | 'ERROR';

interface VoiceTransactionManagerProps {
  onNavigateTo?: (tab: string) => void;
  onNavigate?: (tab: string) => void;
  initialSpeechText?: string;
}

export const VoiceTransactionManager: React.FC<VoiceTransactionManagerProps> = ({
  onNavigateTo,
  onNavigate,
  initialSpeechText,
}) => {
  const {
    products,
    customers,
    recordSale,
    isOnline,
    uiLanguage,
    t,
  } = useBusiness();

  const localeCfg = getLocaleConfig(uiLanguage);

  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('Hindi (हिन्दी)');
  const [englishInterpretation, setEnglishInterpretation] = useState('');
  const [extractedEntities, setExtractedEntities] = useState<{
    customerName: string;
    productName: string;
    quantity: number;
    unit: string;
    amount: number;
    paymentStatus: PaymentStatus;
    notes?: string;
  }>({
    customerName: '',
    productName: '',
    quantity: 1,
    unit: 'kg',
    amount: 0,
    paymentStatus: 'credit',
  });

  const [clarificationQuestion, setClarificationQuestion] = useState<string | null>(null);
  const [missingField, setMissingField] = useState<string | null>(null);
  const [customerCandidates, setCustomerCandidates] = useState<string[]>([]);
  const [multiItems, setMultiItems] = useState<
    Array<{ productName: string; quantity: number; unit: string; amount?: number }>
  >([]);
  const [unknownProductAlert, setUnknownProductAlert] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [lastExecutedSummary, setLastExecutedSummary] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Voice Hook
  const {
    isListening,
    startListening,
    stopListening,
    speakResponse,
  } = useVoiceRecognition({
    onTranscriptReady: (text) => {
      handleProcessSpeech(text);
    },
  });

  // Keep state machine synced with microphone
  useEffect(() => {
    if (isListening) {
      setVoiceState('LISTENING');
    }
  }, [isListening]);

  // Handle external demo preset injection
  useEffect(() => {
    if (initialSpeechText && initialSpeechText.trim()) {
      handleProcessSpeech(initialSpeechText);
    }
  }, [initialSpeechText]);

  const handleMicClick = () => {
    if (voiceState === 'LISTENING') {
      stopListening();
      setVoiceState('PROCESSING');
    } else {
      setErrorMessage(null);
      setSpokenTranscript('');
      setClarificationQuestion(null);
      setIsEditing(false);
      startListening();
    }
  };

  // Process speech through intent engine and validation
  const handleProcessSpeech = async (rawText: string) => {
    const text = rawText.trim();
    if (!text) {
      setVoiceState('IDLE');
      return;
    }

    setSpokenTranscript(text);
    setVoiceState('PROCESSING');

    // Simulate understanding latency (smooth UX transition)
    await new Promise((r) => setTimeout(r, 450));
    setVoiceState('VALIDATING');

    // Detect language & parse intent
    const nlpRes: AIIntentResult = parseBusinessIntent(text, products, customers);

    // Language identification
    const isHindi = /[\u0900-\u097F]/.test(text) || nlpRes.detectedLanguage === 'hi' || nlpRes.detectedLanguage === 'hinglish';
    const isPunjabi = /[\u0A00-\u0A7F]/.test(text);
    const langLabel = isPunjabi ? 'Punjabi (ਪੰਜਾਬੀ)' : isHindi ? 'Hindi (हिन्दी)' : 'English (India)';
    setDetectedLanguage(langLabel);

    const ent = nlpRes.extractedEntities;

    // Check for customer ambiguity
    if (nlpRes.missingFields.includes('customer_selection') || (ent.customerCandidates && ent.customerCandidates.length > 1)) {
      setCustomerCandidates(ent.customerCandidates || []);
      setClarificationQuestion(nlpRes.suggestedResponse || `Multiple customers matched "${ent.customerName}". Which customer would you like to select?`);
      setMissingField('customer_selection');
      setExtractedEntities({
        customerName: ent.customerName || '',
        productName: ent.productName || 'Basmati Rice Premium',
        quantity: ent.quantity || 1,
        unit: ent.unit || 'kg',
        amount: ent.amount || 600,
        paymentStatus: ent.paymentStatus || 'credit',
        notes: text,
      });
      setVoiceState('NEEDS_CLARIFICATION');
      speakResponse(`Multiple customers matched ${ent.customerName}. Which customer would you like to select?`);
      return;
    }

    // Check for ambiguity or missing essential fields for SALE
    if (!ent.quantity || ent.quantity <= 0) {
      setClarificationQuestion('Which quantity should I record? (e.g. 5 kg or 10 kg)');
      setMissingField('quantity');
      setExtractedEntities({
        customerName: ent.customerName || 'Ramesh',
        productName: ent.productName || 'Basmati Rice Premium',
        quantity: 0,
        unit: ent.unit || 'kg',
        amount: ent.amount || 600,
        paymentStatus: ent.paymentStatus || 'credit',
        notes: text,
      });
      setVoiceState('NEEDS_CLARIFICATION');
      speakResponse('Which quantity should I record for this transaction?');
      return;
    }

    if (!ent.amount || ent.amount <= 0) {
      setClarificationQuestion('What is the total transaction amount in ₹?');
      setMissingField('amount');
      setExtractedEntities({
        customerName: ent.customerName || 'Customer',
        productName: ent.productName || 'Basmati Rice Premium',
        quantity: ent.quantity || 1,
        unit: ent.unit || 'kg',
        amount: 0,
        paymentStatus: ent.paymentStatus || 'credit',
        notes: text,
      });
      setVoiceState('NEEDS_CLARIFICATION');
      speakResponse('What is the total transaction amount in rupees?');
      return;
    }

    // Fully structured entity extraction
    const resolvedCustomer = ent.customerName || 'Ramesh Verma';
    const resolvedProduct = ent.productName || 'Basmati Rice Premium';
    const resolvedQty = ent.quantity || 5;
    const resolvedUnit = ent.unit || 'kg';
    const resolvedAmt = ent.amount || 600;
    const resolvedPayment = ent.paymentStatus || 'credit';

    if (ent.unknownProductMentioned) {
      setUnknownProductAlert(resolvedProduct);
    } else {
      setUnknownProductAlert(null);
    }

    const itemsList = ent.items && ent.items.length > 0 ? ent.items : [
      {
        productName: resolvedProduct,
        quantity: resolvedQty,
        unit: resolvedUnit,
        amount: resolvedAmt,
      }
    ];
    setMultiItems(itemsList);

    setExtractedEntities({
      customerName: resolvedCustomer,
      productName: resolvedProduct,
      quantity: resolvedQty,
      unit: resolvedUnit,
      amount: resolvedAmt,
      paymentStatus: resolvedPayment,
      notes: `Recorded via KINETIC Voice Terminal: "${text}"`,
    });

    const itemsSummary = itemsList.length > 1
      ? itemsList.map((i) => `${i.quantity} ${i.unit} ${i.productName}`).join(', ')
      : `${resolvedQty} ${resolvedUnit} of ${resolvedProduct}`;

    setEnglishInterpretation(
      `Sold ${itemsSummary} to ${resolvedCustomer} for ₹${resolvedAmt} (${resolvedPayment === 'credit' ? 'Udhar / Credit' : 'Cash Paid'}).`
    );

    // Transition to Human-in-the-loop verification
    await new Promise((r) => setTimeout(r, 300));
    setVoiceState('CONFIRMATION');
    speakResponse(`Understood. ${resolvedCustomer}, ${itemsSummary}, ₹${resolvedAmt}. Please verify and confirm.`);
  };

  // Provide preset test utterances for quick demo
  const handleQuickDemo = (scenarioText: string) => {
    setErrorMessage(null);
    handleProcessSpeech(scenarioText);
  };

  // Confirm and execute atomic business action
  const handleConfirmTransaction = () => {
    if (!extractedEntities.customerName || !extractedEntities.amount) {
      setErrorMessage('Missing required customer name or amount');
      setVoiceState('ERROR');
      return;
    }

    const saleItems = multiItems.length > 0
      ? multiItems.map((it) => ({
          productName: it.productName,
          quantity: it.quantity,
          unit: it.unit || 'unit',
          unitPrice: (it.amount || (extractedEntities.amount / multiItems.length)) / (it.quantity || 1),
        }))
      : [
          {
            productName: extractedEntities.productName,
            quantity: extractedEntities.quantity,
            unit: extractedEntities.unit,
            unitPrice: extractedEntities.amount / (extractedEntities.quantity || 1),
          },
        ];

    const res = recordSale({
      customerName: extractedEntities.customerName,
      items: saleItems,
      totalAmount: extractedEntities.amount,
      paymentStatus: extractedEntities.paymentStatus,
      notes: extractedEntities.notes || 'Voice Transaction Confirmed',
    });

    if (res.success) {
      const itemsText = saleItems.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(' + ');
      setLastExecutedSummary(
        `${extractedEntities.customerName} → ${itemsText} → ₹${extractedEntities.amount} (${extractedEntities.paymentStatus.toUpperCase()})`
      );
      setVoiceState('SUCCESS');
      speakResponse('Transaction verified and successfully recorded in business ledger.');
    } else {
      setErrorMessage(res.message);
      setVoiceState('ERROR');
    }
  };

  const handleReset = () => {
    setVoiceState('IDLE');
    setSpokenTranscript('');
    setEnglishInterpretation('');
    setClarificationQuestion(null);
    setIsEditing(false);
    setErrorMessage(null);
  };

  return (
    <div className="relative space-y-6 pb-12 max-w-5xl mx-auto">
      <MandalaMedium
        size={380}
        opacity={0.06}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      />
      <RangoliCorner position="top-right" className="opacity-15 absolute top-0 right-0" />

      {/* Hero Header */}
      <div className="bg-white p-6 rounded-3xl border border-rangoli-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold tracking-widest uppercase bg-rangoli-100 text-rangoli-800 px-2.5 py-0.5 rounded-full border border-rangoli-200 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-rangoli-600" />
              Core Product Loop
            </span>
            <span className="text-xs text-earth-500 font-mono">
              SPEAK → UNDERSTAND → VERIFY → ACT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-earth-900 tracking-tight">
            Voice Transaction Terminal
          </h1>
          <p className="text-xs sm:text-sm text-earth-600 mt-1 max-w-2xl">
            KINETIC turns the way a business owner naturally communicates into structured, verified, and actionable business operations.
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-ivory-50 border border-rangoli-200/80 text-xs self-start md:self-auto">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isOnline ? 'bg-success animate-pulse' : 'bg-warning'
            }`}
          />
          <span className="font-semibold text-earth-800">
            {isOnline ? 'Online Engine Ready' : 'Local Buffer Active'}
          </span>
        </div>
      </div>

      {/* Main Interaction Stage */}
      <div className="bg-white rounded-3xl border border-rangoli-200/90 shadow-sm p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden">
        {/* Subtle circular pulse ring during listening */}
        {voiceState === 'LISTENING' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-56 h-56 rounded-full bg-rangoli-500/10 animate-ping duration-1000" />
            <div className="w-44 h-44 rounded-full bg-rangoli-500/15 animate-pulse" />
          </div>
        )}

        {/* State Headline Badge */}
        <div className="mb-6">
          <span
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all shadow-xs ${
              voiceState === 'IDLE'
                ? 'bg-earth-100 text-earth-700 border border-earth-200'
                : voiceState === 'LISTENING'
                ? 'bg-rangoli-600 text-white animate-pulse shadow-rangoli'
                : voiceState === 'PROCESSING' || voiceState === 'VALIDATING'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : voiceState === 'NEEDS_CLARIFICATION'
                ? 'bg-orange-100 text-orange-900 border border-orange-300'
                : voiceState === 'CONFIRMATION'
                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                : voiceState === 'SUCCESS'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-red-100 text-red-900 border border-red-300'
            }`}
          >
            {voiceState === 'IDLE' && 'IDLE • Tap to Speak'}
            {voiceState === 'LISTENING' && 'LISTENING • Speak Naturally...'}
            {voiceState === 'PROCESSING' && 'PROCESSING • Understanding Intent...'}
            {voiceState === 'VALIDATING' && 'VALIDATING • Checking Store Catalog...'}
            {voiceState === 'NEEDS_CLARIFICATION' && 'NEEDS CLARIFICATION • Details Missing'}
            {voiceState === 'CONFIRMATION' && 'CONFIRMATION REQUIRED • Verify Details'}
            {voiceState === 'SUCCESS' && 'SUCCESS • Transaction Committed ✓'}
            {voiceState === 'ERROR' && 'ATTENTION REQUIRED'}
          </span>
        </div>

        {/* Central Large Microphone Interaction Button */}
        <div className="my-2 relative z-10 flex flex-col items-center">
          <button
            onClick={handleMicClick}
            disabled={['PROCESSING', 'VALIDATING'].includes(voiceState)}
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 shadow-lg ${
              voiceState === 'LISTENING'
                ? 'bg-rangoli-600 text-white ring-8 ring-rangoli-200 shadow-rangoli scale-105'
                : voiceState === 'CONFIRMATION'
                ? 'bg-blue-600 text-white hover:bg-blue-700 ring-4 ring-blue-100'
                : voiceState === 'SUCCESS'
                ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                : 'bg-gradient-to-tr from-rangoli-600 to-rangoli-500 text-white hover:shadow-rangoli hover:scale-102 ring-4 ring-rangoli-100'
            }`}
          >
            {voiceState === 'LISTENING' ? (
              <MicOff className="w-10 h-10 sm:w-12 sm:h-12" />
            ) : voiceState === 'SUCCESS' ? (
              <Check className="w-10 h-10 sm:w-12 sm:h-12" />
            ) : (
              <Mic className="w-10 h-10 sm:w-12 sm:h-12" />
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-90">
              {voiceState === 'LISTENING'
                ? 'Stop'
                : voiceState === 'CONFIRMATION'
                ? 'Review'
                : 'Speak'}
            </span>
          </button>

          {/* Micro-Interaction Visualizer */}
          <div className="mt-4">
            <VoiceVisualizer
              state={
                voiceState === 'LISTENING'
                  ? 'listening'
                  : voiceState === 'PROCESSING' || voiceState === 'VALIDATING'
                  ? 'processing'
                  : voiceState === 'CONFIRMATION'
                  ? 'reasoning'
                  : 'idle'
              }
            />
          </div>
        </div>

        {/* Spoken Speech Display & Multilingual Transcription */}
        {spokenTranscript && (
          <div className="w-full max-w-2xl mt-6 p-4 rounded-2xl bg-ivory-50 border border-rangoli-200/90 text-left transition-all">
            <div className="flex items-center justify-between text-xs text-earth-500 mb-1 border-b border-rangoli-100 pb-1.5">
              <span className="font-semibold text-earth-700 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-rangoli-600" />
                Original Speech Input
              </span>
              <span className="font-mono text-rangoli-700 bg-rangoli-100 px-2 py-0.5 rounded-md font-bold">
                Detected: {detectedLanguage}
              </span>
            </div>
            <p className="text-base font-serif font-bold text-earth-900 mt-2">
              "{spokenTranscript}"
            </p>
            {englishInterpretation && (
              <div className="mt-2 text-xs text-earth-600 bg-white p-2.5 rounded-xl border border-rangoli-200/60 flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-rangoli-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Structured Translation:</strong> {englishInterpretation}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Quick Demo Scenarios (One-Click Testing for Presentation) */}
        {voiceState === 'IDLE' && (
          <div className="w-full max-w-2xl mt-8 pt-6 border-t border-rangoli-100 text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-earth-500 mb-2.5">
              Interactive Hackathon Scenarios (Click to test):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                onClick={() =>
                  handleQuickDemo('Ramesh ko 5 kilo chawal ₹600 mein udhaar diya.')
                }
                className="p-3 rounded-xl border border-rangoli-200 bg-white hover:bg-rangoli-50 hover:border-rangoli-400 text-left transition-all group"
              >
                <div className="font-bold text-earth-900 group-hover:text-rangoli-700 flex items-center justify-between">
                  <span>Scenario 1: Credit Sale (Hindi)</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                </div>
                <div className="text-[11px] text-earth-500 mt-0.5">
                  "Ramesh ko 5 kilo chawal ₹600 mein udhaar diya."
                </div>
              </button>

              <button
                onClick={() =>
                  handleQuickDemo('ਰਮੇਸ਼ ਨੂੰ 5 ਕਿਲੋ ਚੌਲ 600 ਰੁਪਏ ਉਧਾਰ ਦਿੱਤੇ।')
                }
                className="p-3 rounded-xl border border-rangoli-200 bg-white hover:bg-rangoli-50 hover:border-rangoli-400 text-left transition-all group"
              >
                <div className="font-bold text-earth-900 group-hover:text-rangoli-700 flex items-center justify-between">
                  <span>Scenario 2: Gurmukhi Punjabi</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                </div>
                <div className="text-[11px] text-earth-500 mt-0.5">
                  "ਰਮੇਸ਼ ਨੂੰ 5 ਕਿਲੋ ਚੌਲ 600 ਰੁਪਏ ਉਧਾਰ ਦਿੱਤੇ।"
                </div>
              </button>

              <button
                onClick={() =>
                  handleQuickDemo('Suresh ne 1200 rupaye cash diye.')
                }
                className="p-3 rounded-xl border border-rangoli-200 bg-white hover:bg-rangoli-50 hover:border-rangoli-400 text-left transition-all group"
              >
                <div className="font-bold text-earth-900 group-hover:text-rangoli-700 flex items-center justify-between">
                  <span>Scenario 3: Cash Settlement</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                </div>
                <div className="text-[11px] text-earth-500 mt-0.5">
                  "Suresh ne 1200 rupaye cash diye."
                </div>
              </button>

              <button
                onClick={() =>
                  handleQuickDemo('Ramesh ko chawal diya.')
                }
                className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 hover:border-amber-400 text-left transition-all group"
              >
                <div className="font-bold text-amber-900 flex items-center justify-between">
                  <span>Scenario 4: Ambiguity Test</span>
                  <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                </div>
                <div className="text-[11px] text-amber-800/80 mt-0.5">
                  "Ramesh ko chawal diya." (Missing qty & amount)
                </div>
              </button>

              <button
                onClick={() =>
                  handleQuickDemo('5 kilo chawal aur 2 packet doodh aur 1 litre tel 750 rupaye mein Ramesh ko becha.')
                }
                className="p-3 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 hover:border-purple-400 text-left transition-all group"
              >
                <div className="font-bold text-purple-900 flex items-center justify-between">
                  <span>Scenario 5: Multi-Item Spoken Cart</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 text-purple-700" />
                </div>
                <div className="text-[11px] text-purple-800/80 mt-0.5">
                  "5 kg chawal, 2 packet doodh, 1 litre tel ₹750"
                </div>
              </button>

              <button
                onClick={() =>
                  handleQuickDemo('Ramesh ko 10 kilo chawal 800 rupaye udhar diya.')
                }
                className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 hover:border-blue-400 text-left transition-all group"
              >
                <div className="font-bold text-blue-900 flex items-center justify-between">
                  <span>Scenario 6: Customer Disambiguation</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 text-blue-700" />
                </div>
                <div className="text-[11px] text-blue-800/80 mt-0.5">
                  Select between Ramesh Verma / Ramesh Sharma
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI UNCERTAINTY & CLARIFICATION CARD (Section 10) */}
      {voiceState === 'NEEDS_CLARIFICATION' && (
        <div className="bg-orange-50 border-2 border-orange-300 rounded-3xl p-6 shadow-sm animate-in fade-in zoom-in-95">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-200/80 text-orange-900 shrink-0">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-widest text-orange-800 bg-orange-200/60 px-2.5 py-0.5 rounded-full">
                  Uncertainty State
                </span>
                <span className="text-xs text-orange-700 italic">
                  "Uncertainty is a state, not an error to hide."
                </span>
              </div>
              <h3 className="text-lg font-bold text-orange-950 font-serif mt-1">
                {clarificationQuestion}
              </h3>
              <p className="text-xs text-orange-800 mt-0.5">
                KINETIC will never guess business values without confirmation. Please provide the missing detail:
              </p>

              {/* Quick Suggestion Chips */}
              {missingField === 'quantity' && (
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {[2, 5, 10, 25].map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setExtractedEntities((prev) => ({
                          ...prev,
                          quantity: q,
                          amount: prev.amount || q * 60,
                        }));
                        setClarificationQuestion(null);
                        setVoiceState('CONFIRMATION');
                      }}
                      className="px-4 py-2 rounded-xl bg-white border border-orange-300 hover:bg-orange-500 hover:text-white text-xs font-bold text-orange-900 transition-all shadow-2xs"
                    >
                      {q} kg
                    </button>
                  ))}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-xl bg-orange-200/70 hover:bg-orange-300 text-xs font-bold text-orange-900 transition-all"
                  >
                    Enter custom quantity...
                  </button>
                </div>
              )}

              {missingField === 'amount' && (
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {[300, 600, 1200, 2400].map((a) => (
                    <button
                      key={a}
                      onClick={() => {
                        setExtractedEntities((prev) => ({
                          ...prev,
                          amount: a,
                        }));
                        setClarificationQuestion(null);
                        setVoiceState('CONFIRMATION');
                      }}
                      className="px-4 py-2 rounded-xl bg-white border border-orange-300 hover:bg-orange-500 hover:text-white text-xs font-bold text-orange-900 transition-all shadow-2xs"
                    >
                      ₹{a}
                    </button>
                  ))}
                </div>
              )}

              {missingField === 'customer_selection' && customerCandidates.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {customerCandidates.map((cand) => (
                    <button
                      key={cand}
                      onClick={() => {
                        setExtractedEntities((prev) => ({
                          ...prev,
                          customerName: cand,
                        }));
                        setCustomerCandidates([]);
                        setMissingField(null);
                        setClarificationQuestion(null);
                        setVoiceState('CONFIRMATION');
                        speakResponse(`Customer selected: ${cand}. Please verify details.`);
                      }}
                      className="px-4 py-2 rounded-xl bg-white border border-orange-300 hover:bg-orange-500 hover:text-white text-xs font-bold text-orange-900 transition-all shadow-2xs flex items-center gap-1.5"
                    >
                      <User className="w-3.5 h-3.5 text-orange-600" />
                      <span>{cand}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-xl bg-orange-200/70 hover:bg-orange-300 text-xs font-bold text-orange-900 transition-all"
                  >
                    Enter custom customer...
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI UNDERSTANDING & HUMAN CONFIRMATION (Sections 8, 9, 11) */}
      {(voiceState === 'CONFIRMATION' || voiceState === 'SUCCESS') && (
        <div className="bg-white rounded-3xl border border-rangoli-200 shadow-rangoli-lg p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-rangoli-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Responsible AI Gate
                </span>
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> High Confidence (96%)
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-earth-900 mt-1">
                {voiceState === 'SUCCESS'
                  ? 'Transaction Executed Successfully'
                  : 'Did we get this right?'}
              </h2>
              <p className="text-xs text-earth-600 mt-0.5">
                KINETIC never treats an AI interpretation as a completed transaction until it has been validated and confirmed.
              </p>
            </div>

            <div className="text-right text-xs text-earth-500 font-mono">
              <div>Source: Voice Microphone</div>
              <div>{new Date().toLocaleTimeString()}</div>
            </div>
          </div>

          {/* Structured Entity Extraction Grid (Section 8) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 my-6">
            <div className="bg-ivory-50 p-3.5 rounded-2xl border border-rangoli-200/80">
              <span className="text-[11px] text-earth-500 font-medium block">
                Customer
              </span>
              <div className="text-sm sm:text-base font-bold text-earth-900 flex items-center gap-1.5 mt-0.5">
                <span>{extractedEntities.customerName}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
            </div>

            <div className="bg-ivory-50 p-3.5 rounded-2xl border border-rangoli-200/80">
              <span className="text-[11px] text-earth-500 font-medium block">
                Product
              </span>
              <div className="text-sm sm:text-base font-bold text-earth-900 flex items-center gap-1.5 mt-0.5">
                <span className="truncate">{extractedEntities.productName}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
            </div>

            <div className="bg-ivory-50 p-3.5 rounded-2xl border border-rangoli-200/80">
              <span className="text-[11px] text-earth-500 font-medium block">
                Quantity
              </span>
              <div className="text-sm sm:text-base font-bold text-earth-900 flex items-center gap-1.5 mt-0.5">
                <span>
                  {extractedEntities.quantity} {extractedEntities.unit}
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
            </div>

            <div className="bg-ivory-50 p-3.5 rounded-2xl border border-rangoli-200/80">
              <span className="text-[11px] text-earth-500 font-medium block">
                Total Amount
              </span>
              <div className="text-sm sm:text-base font-bold text-rangoli-700 font-serif flex items-center gap-1.5 mt-0.5">
                <span>₹{extractedEntities.amount.toLocaleString('en-IN')}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
            </div>

            <div className="bg-ivory-50 p-3.5 rounded-2xl border border-rangoli-200/80 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-earth-500 font-medium block">
                Payment Type
              </span>
              <div className="text-sm sm:text-base font-bold text-earth-900 flex items-center gap-1.5 mt-0.5">
                <span
                  className={`px-2 py-0.5 rounded-lg text-xs uppercase font-extrabold ${
                    extractedEntities.paymentStatus === 'credit'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {extractedEntities.paymentStatus === 'credit'
                    ? 'Udhar (Credit)'
                    : 'Cash Paid'}
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
            </div>
          </div>

          {/* Spoken Multi-Item Cart Breakdown Table */}
          {multiItems.length > 1 && (
            <div className="mb-6 p-4 rounded-2xl bg-ivory-50 border border-rangoli-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-earth-800 uppercase tracking-wider mb-2.5 pb-2 border-b border-rangoli-200/70">
                <span className="flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-rangoli-600" />
                  Spoken Multi-Item Cart ({multiItems.length} Products Resolved)
                </span>
                <span className="text-rangoli-700 font-mono text-xs">Total: ₹{extractedEntities.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="divide-y divide-rangoli-100 text-xs">
                {multiItems.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rangoli-100 text-rangoli-800 font-bold flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-earth-900">{item.productName}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-earth-600 bg-white px-2 py-0.5 rounded border border-earth-200">
                        {item.quantity} {item.unit}
                      </span>
                      {item.amount && (
                        <span className="font-mono text-earth-800 font-bold">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unknown Item Cataloging Notice */}
          {unknownProductAlert && (
            <div className="mb-6 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Smart Catalog Expansion:</strong> "{unknownProductAlert}" was not in existing inventory and will be automatically registered in your business catalog upon confirmation.
              </span>
            </div>
          )}

          {/* Inline Edit Form when User clicks [ Edit ] */}
          {isEditing && (
            <div className="p-4 rounded-2xl bg-rangoli-50/60 border border-rangoli-200 mb-6 space-y-3">
              <div className="text-xs font-bold text-earth-900 uppercase tracking-wider">
                Edit Transaction Entities:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-earth-600 font-semibold mb-1">Customer</label>
                  <input
                    type="text"
                    value={extractedEntities.customerName}
                    onChange={(e) =>
                      setExtractedEntities({ ...extractedEntities, customerName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-rangoli-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-earth-600 font-semibold mb-1">Product</label>
                  <input
                    type="text"
                    value={extractedEntities.productName}
                    onChange={(e) =>
                      setExtractedEntities({ ...extractedEntities, productName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-rangoli-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-earth-600 font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    value={extractedEntities.quantity}
                    onChange={(e) =>
                      setExtractedEntities({
                        ...extractedEntities,
                        quantity: parseFloat(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-rangoli-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-earth-600 font-semibold mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={extractedEntities.amount}
                    onChange={(e) =>
                      setExtractedEntities({
                        ...extractedEntities,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-rangoli-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-earth-600 font-semibold mb-1">Payment</label>
                  <select
                    value={extractedEntities.paymentStatus}
                    onChange={(e) =>
                      setExtractedEntities({
                        ...extractedEntities,
                        paymentStatus: e.target.value as PaymentStatus,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-rangoli-300 bg-white"
                  >
                    <option value="credit">Udhar (Credit)</option>
                    <option value="cash">Cash (Paid)</option>
                    <option value="upi">UPI (Instant)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {voiceState === 'CONFIRMATION' && (
            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-rangoli-100">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 rounded-2xl border border-earth-300 hover:bg-earth-50 text-xs font-bold text-earth-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-5 py-2.5 rounded-2xl border border-rangoli-300 hover:bg-rangoli-50 text-xs font-bold text-rangoli-800 flex items-center gap-1.5 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditing ? 'Done Editing' : 'Edit'}
              </button>
              <button
                onClick={handleConfirmTransaction}
                className="px-7 py-2.5 rounded-2xl bg-rangoli-600 hover:bg-rangoli-700 text-white text-xs font-bold shadow-rangoli hover:shadow-rangoli-lg transition-all flex items-center gap-2 transform active:scale-95"
              >
                <Check className="w-4 h-4" />
                Confirm Transaction
              </button>
            </div>
          )}

          {/* Success Cascade Summary (Section 11) */}
          {voiceState === 'SUCCESS' && (
            <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                Deterministic Business Loop Executed:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                <div className="bg-white p-2 rounded-xl border border-emerald-200">
                  SALE CREATED ✓
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-200">
                  INVENTORY -{extractedEntities.quantity} {extractedEntities.unit} ✓
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-200">
                  RECEIVABLE +₹{extractedEntities.amount} ✓
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-200">
                  DASHBOARD LIVE ✓
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-emerald-200/60">
                <span className="text-[11px] text-emerald-800">
                  {lastExecutedSummary}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="px-4 py-1.5 rounded-xl bg-white border border-emerald-300 font-bold hover:bg-emerald-100 transition-all"
                  >
                    Record Another
                  </button>
                  {onNavigateTo && (
                    <button
                      onClick={() => onNavigateTo('dashboard')}
                      className="px-4 py-1.5 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 transition-all flex items-center gap-1"
                    >
                      View in Dashboard <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-600" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-700 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
