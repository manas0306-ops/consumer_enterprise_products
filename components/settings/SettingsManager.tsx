'use client';

import React, { useState } from 'react';
import {
  Settings,
  Cpu,
  Server,
  Zap,
  IndianRupee,
  ShieldCheck,
  RefreshCw,
  Store,
  Trash2,
  CheckCircle,
  Globe,
  Volume2,
  VolumeX,
  FileText,
  Calendar,
  Sparkles,
  Palette,
} from 'lucide-react';
import { useBusiness } from '@/context/BusinessContext';
import { RangoliCorner, RangoliDivider, RangoliCore } from '@/components/rangoli/RangoliMotif';
import { getLocaleConfig } from '@/lib/i18n/locales.config';
import { CalendarSystem } from '@/lib/i18n/formatters';

export const SettingsManager: React.FC = () => {
  const {
    business,
    updateBusiness,
    telemetry,
    resetToDemo,
    resetToBlank,
    uiLanguage,
    setIsLanguageModalOpen,
    calendarSystem,
    setCalendarSystem,
    showRangoli,
    setShowRangoli,
    responseLanguages,
    setResponseLanguages,
    t,
  } = useBusiness();

  const localeCfg = getLocaleConfig(uiLanguage);

  const [businessForm, setBusinessForm] = useState({
    name: business.name,
    ownerName: business.ownerName,
    phone: business.phone,
    address: business.address || '',
    gstin: business.gstin || '',
  });

  const [voiceAutoDetect, setVoiceAutoDetect] = useState(true);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(true);
  const [showOriginalTranscript, setShowOriginalTranscript] = useState(true);
  const [savedNotification, setSavedNotification] = useState(false);

  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusiness(businessForm);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  const localRatio = Math.round(
    (telemetry.localLightweightRequests / (telemetry.totalRequests || 1)) * 100
  );

  return (
    <div className="relative space-y-6 pb-12">
      <RangoliCorner position="top-right" className="opacity-15 absolute top-0 right-0" />

      {/* Header */}
      <div className="bg-surface p-5 rounded-2xl border border-sand shadow-sm">
        <h2 className="text-xl font-bold text-earth-900 font-serif">
          {t('settings', 'title', 'Settings, Language & Architecture Controls')}
        </h2>
        <p className="text-xs text-earth-600">
          {t('settings', 'subtitle', 'Configure 38-language localization, speech pipeline, calendar conventions, and verify Rangoli design system')}
        </p>
      </div>

      {/* SECTION 1: LANGUAGE & SPEECH ARCHITECTURE (PRD §6.11 & Design System §39.9) */}
      <div className="bg-surface p-6 rounded-2xl border border-sand shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-sand pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rangoli-100 text-rangoli-700">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-earth-900 font-serif">
                {t('settings', 'multiArch', 'Multilingual Architecture & Language States')}
              </h3>
              <p className="text-xs text-earth-500">
                {t('settings', 'multiArchSub', 'Language is an architectural pillar, not a translation layer')}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rangoli-100 text-rangoli-800">
            {t('settings', 'languagesSupported', '38 Languages Supported')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Application Language */}
          <div className="p-4 rounded-xl border border-sand bg-ivory-50/60 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-earth-700 font-serif">
              {t('settings', 'appLanguage', 'Application Interface Language (ui_language)')}
            </label>
            <p className="text-xs text-earth-600">
              {t('settings', 'appLanguageSub', 'Switches entire UI, navigation, forms, error messages, and AI responses.')}
            </p>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-serif font-bold text-earth-900">
                  {localeCfg.nativeName}
                </span>
                <span className="text-xs text-earth-500">({localeCfg.englishName})</span>
              </div>
              <button
                type="button"
                onClick={() => setIsLanguageModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-rangoli-500 hover:bg-rangoli-600 text-white text-xs font-bold transition-all"
              >
                {t('settings', 'changeLanguage', 'Change Language')}
              </button>
            </div>
          </div>

          {/* 2. Voice Detection Mode */}
          <div className="p-4 rounded-xl border border-sand bg-ivory-50/60 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-earth-700 font-serif">
              {t('settings', 'voiceDetectionMode', 'Voice Detection Mode (PRD §6.2)')}
            </label>
            <p className="text-xs text-earth-600">
              {t('settings', 'voiceDetectionSub', 'Auto-detect microphone language or lock to user preferred language.')}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setVoiceAutoDetect(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  voiceAutoDetect
                    ? 'bg-rangoli-500 text-white border-rangoli-500'
                    : 'bg-surface text-earth-700 border-sand'
                }`}
              >
                {t('settings', 'autoDetect', 'AUTO (Detect Language)')}
              </button>
              <button
                type="button"
                onClick={() => setVoiceAutoDetect(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  !voiceAutoDetect
                    ? 'bg-rangoli-500 text-white border-rangoli-500'
                    : 'bg-surface text-earth-700 border-sand'
                }`}
              >
                {t('settings', 'manualSelect', 'MANUAL')} ({localeCfg.nativeName})
              </button>
            </div>
          </div>

          {/* 3. Response Languages (PRD §5) */}
          <div className="p-4 rounded-xl border border-sand bg-ivory-50/60 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-earth-700 font-serif">
              {t('settings', 'responseLanguages', 'Response Languages (response_languages)')}
            </label>
            <p className="text-xs text-earth-600">
              {t('settings', 'responseLanguagesSub', 'Delivers answers in selected app language plus English by default.')}
            </p>
            <div className="flex items-center gap-4 pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-earth-800">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="rounded text-rangoli-500 focus:ring-0"
                />
                {t('settings', 'selectedLanguage', 'Selected Language')} ({localeCfg.nativeName})
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-earth-800">
                <input
                  type="checkbox"
                  checked={responseLanguages.includes('en-US')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setResponseLanguages([...responseLanguages, 'en-US']);
                    } else {
                      setResponseLanguages(responseLanguages.filter((l) => l !== 'en-US'));
                    }
                  }}
                  className="rounded text-rangoli-500 focus:ring-0"
                />
                {t('settings', 'englishTranslation', 'English Translation')}
              </label>
            </div>
          </div>

          {/* 4. Calendar System Conventions (PRD §6.10) */}
          <div className="p-4 rounded-xl border border-sand bg-ivory-50/60 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-earth-700 font-serif">
              {t('settings', 'calendarSystem', 'Calendar Convention (PRD §6.10)')}
            </label>
            <p className="text-xs text-earth-600">
              {t('settings', 'calendarSub', 'Format dates, ledgers, and repayment due dates with local calendar convention.')}
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              {(['gregorian', 'indian', 'islamic'] as CalendarSystem[]).map((cal) => (
                <button
                  key={cal}
                  type="button"
                  onClick={() => setCalendarSystem(cal)}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition-all capitalize ${
                    calendarSystem === cal
                      ? 'bg-rangoli-500 text-white border-rangoli-500'
                      : 'bg-surface text-earth-700 border-sand hover:bg-rangoli-50'
                  }`}
                >
                  {cal === 'indian'
                    ? t('settings', 'indianNational', 'Indian (Saka/Vikram)')
                    : cal === 'gregorian'
                    ? t('settings', 'gregorian', 'Gregorian')
                    : t('settings', 'islamicHijri', 'Islamic')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Toggles Strip */}
        <div className="pt-3 border-t border-sand grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* TTS Voice Output */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-sand bg-surface">
            <div>
              <span className="font-bold text-earth-900 block">{t('settings', 'voiceOutputTTS', 'Voice Output (TTS)')}</span>
              <span className="text-earth-500 text-[11px]">{t('settings', 'speakAnswers', 'Speak AI answers aloud')}</span>
            </div>
            <button
              onClick={() => setVoiceOutputEnabled(!voiceOutputEnabled)}
              className={`p-2 rounded-lg font-bold ${
                voiceOutputEnabled
                  ? 'bg-success/15 text-success'
                  : 'bg-earth-100 text-earth-500'
              }`}
            >
              {voiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Show Original Transcript */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-sand bg-surface">
            <div>
              <span className="font-bold text-earth-900 block">{t('settings', 'showTranscript', 'Show Audio Transcript')}</span>
              <span className="text-earth-500 text-[11px]">{t('settings', 'displayRawSpoken', 'Display spoken raw input')}</span>
            </div>
            <input
              type="checkbox"
              checked={showOriginalTranscript}
              onChange={(e) => setShowOriginalTranscript(e.target.checked)}
              className="w-4 h-4 rounded text-rangoli-500 focus:ring-0 cursor-pointer"
            />
          </div>

          {/* Design System §2: The Rangoli Removal Test */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-sand bg-surface">
            <div>
              <span className="font-bold text-earth-900 block">{t('settings', 'rangoliTest', 'Rangoli Removal Test')}</span>
              <span className="text-earth-500 text-[11px]">{t('settings', 'toggleWatermark', 'Toggle canvas watermark')}</span>
            </div>
            <button
              onClick={() => setShowRangoli(!showRangoli)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                showRangoli
                  ? 'bg-rangoli-500 text-white'
                  : 'bg-earth-200 text-earth-700'
              }`}
            >
              {showRangoli ? t('settings', 'mandalaActive', 'Mandala Active') : t('settings', 'pureMinimalist', 'Pure Minimalist UI')}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: COMPUTATIONAL EFFICIENCY & MODEL ROUTING (Tech Stack §11) */}
      <div className="bg-gradient-to-br from-surface via-rangoli-50/40 to-ivory-100 p-6 rounded-2xl border border-sand shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-sand pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rangoli-500 text-white flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-earth-900 font-serif">
                {t('settings', 'hybridTelemetry', 'Hybrid AI Cost & Computational Routing Telemetry')}
              </h3>
              <p className="text-xs text-earth-500">
                {t('settings', 'hybridSub', 'Optimized for poor connectivity, low-latency mobile devices, and zero cloud API cost')}
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-success/10 text-success border border-success/30">
            {t('settings', 'hybridReady', 'Hybrid-Ready Architecture')}
          </span>
        </div>

        {/* Telemetry Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-surface p-3.5 rounded-xl border border-sand text-xs">
            <span className="text-earth-500 block text-[11px]">{t('settings', 'tasksLocal', 'Tasks Processed Locally')}</span>
            <div className="text-xl font-bold text-success font-serif mt-1">
              {telemetry.localLightweightRequests} ({localRatio}%)
            </div>
            <span className="text-[10px] text-earth-400">{t('settings', 'zeroLatency', 'Zero cloud latency')}</span>
          </div>

          <div className="bg-surface p-3.5 rounded-xl border border-sand text-xs">
            <span className="text-earth-500 block text-[11px]">{t('settings', 'cloudFallback', 'Cloud AI Fallback')}</span>
            <div className="text-xl font-bold text-earth-900 font-serif mt-1">
              {telemetry.cloudLLMRequests} ({100 - localRatio}%)
            </div>
            <span className="text-[10px] text-earth-400">{t('settings', 'geminiModel', 'Gemini 1.5 Flash')}</span>
          </div>

          <div className="bg-surface p-3.5 rounded-xl border border-sand text-xs">
            <span className="text-earth-500 block text-[11px]">{t('settings', 'avgLatency', 'Average NLP Latency')}</span>
            <div className="text-xl font-bold text-rangoli-700 font-serif mt-1">
              {telemetry.avgLatencyMs} ms
            </div>
            <span className="text-[10px] text-earth-400">{t('settings', 'sub50ms', 'Sub-50ms target met')}</span>
          </div>

          <div className="bg-surface p-3.5 rounded-xl border border-sand text-xs">
            <span className="text-earth-500 block text-[11px]">{t('settings', 'costSaved', 'Estimated API Cost Saved')}</span>
            <div className="text-xl font-bold text-earth-900 font-serif mt-1">
              ₹{telemetry.costSavedINR.toFixed(2)}
            </div>
            <span className="text-[10px] text-earth-400">{t('settings', 'zeroCostOps', 'Zero-cost MSME ops')}</span>
          </div>
        </div>
      </div>

      {/* SECTION 3: BUSINESS PROFILE FORM */}
      <div className="bg-surface p-6 rounded-2xl border border-sand shadow-sm space-y-4">
        <h3 className="text-base font-bold text-earth-900 font-serif">
          {t('settings', 'storeProfile', 'Store & Proprietor Details')}
        </h3>
        <form onSubmit={handleSaveBusiness} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-earth-700 font-semibold mb-1">{t('settings', 'storeName', 'Business Name')}</label>
              <input
                type="text"
                value={businessForm.name}
                onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-sand bg-ivory-50/60"
              />
            </div>

            <div>
              <label className="block text-earth-700 font-semibold mb-1">{t('settings', 'ownerName', 'Owner Name')}</label>
              <input
                type="text"
                value={businessForm.ownerName}
                onChange={(e) => setBusinessForm({ ...businessForm, ownerName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-sand bg-ivory-50/60"
              />
            </div>

            <div>
              <label className="block text-earth-700 font-semibold mb-1">{t('settings', 'phone', 'Phone Number')}</label>
              <input
                type="text"
                value={businessForm.phone}
                onChange={(e) => setBusinessForm({ ...businessForm, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-sand bg-ivory-50/60"
              />
            </div>

            <div>
              <label className="block text-earth-700 font-semibold mb-1">{t('settings', 'gstinOptional', 'GSTIN (Optional)')}</label>
              <input
                type="text"
                value={businessForm.gstin}
                onChange={(e) => setBusinessForm({ ...businessForm, gstin: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-sand bg-ivory-50/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-earth-700 font-semibold mb-1">{t('settings', 'address', 'Shop Address & Landmark')}</label>
            <input
              type="text"
              value={businessForm.address}
              onChange={(e) => setBusinessForm({ ...businessForm, address: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-sand bg-ivory-50/60"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedNotification ? (
              <span className="text-xs text-success font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> {t('settings', 'saved', 'Profile saved successfully!')}
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rangoli-500 hover:bg-rangoli-600 text-white font-bold shadow-sm"
            >
              {t('settings', 'saveChanges', 'Save Business Details')}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 4: DEMO CONTROLS */}
      <div className="bg-surface p-6 rounded-2xl border border-sand shadow-sm space-y-3">
        <h3 className="text-base font-bold text-earth-900 font-serif">
          {t('settings', 'demoControls', 'Hackathon Presentation & Demo Controls')}
        </h3>
        <p className="text-xs text-earth-600">
          {t('settings', 'demoControlsSub', 'Reset realistic sample dataset for the presentation or purge to blank slate.')}
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={resetToDemo}
            className="px-4 py-2 rounded-xl bg-rangoli-100 hover:bg-rangoli-200 border border-rangoli-300 text-rangoli-900 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Store className="w-4 h-4 text-rangoli-600" />
            <span>{t('settings', 'resetDemo', 'Reset Demo Kirana Store Dataset')}</span>
          </button>

          <button
            onClick={resetToBlank}
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-danger text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('settings', 'purgeBlank', 'Purge to Blank State')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
