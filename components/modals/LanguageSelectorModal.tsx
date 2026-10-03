'use client';

import React, { useState } from 'react';
import { Search, Check, Globe, Sparkles, X } from 'lucide-react';
import { LAUNCH_LANGUAGES, LocaleConfig } from '@/lib/i18n/locales.config';
import { RangoliCore, RangoliLoader } from '@/components/rangoli/RangoliMotif';

import { useBusiness } from '@/context/BusinessContext';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocale: string;
  onSelectLocale: (locale: string) => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
  currentLocale,
  onSelectLocale,
}) => {
  const { t } = useBusiness();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSwitching, setIsSwitching] = useState(false);
  const [targetLocale, setTargetLocale] = useState<LocaleConfig | null>(null);

  if (!isOpen) return null;

  const filteredLanguages = LAUNCH_LANGUAGES.filter((lang) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      lang.nativeName.toLowerCase().includes(q) ||
      lang.englishName.toLowerCase().includes(q) ||
      lang.script.toLowerCase().includes(q) ||
      lang.code.toLowerCase().includes(q)
    );
  });

  const internationalList = filteredLanguages.filter((l) => l.group === 'international');
  const indianList = filteredLanguages.filter((l) => l.group === 'indian');

  const handleSelect = (lang: LocaleConfig) => {
    setTargetLocale(lang);
    setIsSwitching(true);
    // 700ms smooth personalizing animation per Design System §18
    setTimeout(() => {
      onSelectLocale(lang.code);
      setIsSwitching(false);
      onClose();
    }, 750);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-earth-900/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-modal-title"
    >
      {/* "Personalizing KINETIC..." overlay screen */}
      {isSwitching && targetLocale && (
        <div className="absolute inset-0 z-50 bg-ivory-50/95 backdrop-blur-md flex flex-col items-center justify-center gap-4 animate-fade-in">
          <RangoliLoader size={64} label={`Personalizing KINETIC for ${targetLocale.nativeName}...`} />
          <p className="text-xs text-earth-600 font-sans">
            Configuring typography, direction ({targetLocale.dir.toUpperCase()}), and locale formatting
          </p>
        </div>
      )}

      {/* Main S2 Glass Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-surface/90 backdrop-blur-xl border border-rangoli-300/40 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-sand flex items-center justify-between bg-gradient-to-r from-rangoli-50/50 via-surface to-rangoli-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rangoli-100/80 text-rangoli-700 border border-rangoli-300/50">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 id="lang-modal-title" className="text-lg sm:text-xl font-bold text-earth-900 font-serif">
                {t('modals', 'chooseLanguage', 'Choose your KINETIC language')}
              </h2>
              <p className="text-xs sm:text-sm text-earth-600">
                &ldquo;Your language should shape your entire experience.&rdquo;
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-earth-500 hover:text-earth-900 hover:bg-rangoli-100 transition-colors"
            aria-label="Close language selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Field */}
        <div className="p-4 sm:px-6 border-b border-sand/60 bg-surface/50">
          <div className="relative">
            <Search className="w-4 h-4 text-earth-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('modals', 'searchLangPlaceholder', 'Search by native name, English, or script (e.g., ਪੰਜਾਬੀ, Tamil, Arabic)...')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand bg-ivory-50/80 text-earth-900 text-sm focus:outline-none focus:ring-2 focus:ring-rangoli-400 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Scrollable Language Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Section 1: 16 International Languages */}
          {internationalList.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">🌍</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-earth-700 font-serif">
                  {t('modals', 'internationalLanguages', 'International Languages')} ({internationalList.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {internationalList.map((lang) => {
                  const isSelected = currentLocale.toLowerCase() === lang.code.toLowerCase();
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleSelect(lang)}
                      className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-rangoli-50/90 border-rangoli-400 shadow-sm ring-1 ring-rangoli-400'
                          : 'bg-surface hover:bg-rangoli-50/40 border-sand/80 hover:border-rangoli-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-earth-900 text-base leading-tight">
                            {lang.nativeName}
                          </div>
                          <div className="text-xs text-earth-600 mt-0.5">
                            {lang.englishName} • <span className="text-earth-400">{lang.script}</span>
                          </div>
                        </div>
                        {isSelected ? (
                          <div className="p-1 rounded-full bg-rangoli-500 text-white">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          lang.dir === 'rtl' && (
                            <span className="text-[10px] font-mono uppercase bg-earth-100 text-earth-700 px-1.5 py-0.5 rounded">
                              RTL
                            </span>
                          )
                        )}
                      </div>

                      {/* Capability dots: UI • Voice • Speak-back */}
                      <div className="flex items-center gap-3 mt-3 pt-2 border-t border-sand/40 text-[11px] text-earth-500">
                        <span className="flex items-center gap-1">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              lang.capabilities.ui === 'full' ? 'bg-success' : 'bg-warning'
                            }`}
                          />
                          UI
                        </span>
                        <span className="flex items-center gap-1">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              lang.capabilities.asr === 'full'
                                ? 'bg-success'
                                : lang.capabilities.asr === 'partial'
                                ? 'bg-warning'
                                : 'bg-earth-300'
                            }`}
                          />
                          Voice
                        </span>
                        <span className="flex items-center gap-1">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              lang.capabilities.tts === 'full'
                                ? 'bg-success'
                                : lang.capabilities.tts === 'partial'
                                ? 'bg-warning'
                                : 'bg-earth-300'
                            }`}
                          />
                          TTS
                        </span>
                        {lang.capabilities.asr !== 'full' && (
                          <span className="ml-auto text-[10px] text-warning font-medium">
                            Partial
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 2: 22 Indian Scheduled Languages */}
          {indianList.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">🇮🇳</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-earth-700 font-serif">
                  {t('modals', 'indianLanguages', 'Indian Scheduled & Regional Languages')} ({indianList.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {indianList.map((lang) => {
                  const isSelected = currentLocale.toLowerCase() === lang.code.toLowerCase();
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleSelect(lang)}
                      className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-rangoli-50/90 border-rangoli-400 shadow-sm ring-1 ring-rangoli-400'
                          : 'bg-surface hover:bg-rangoli-50/40 border-sand/80 hover:border-rangoli-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-earth-900 text-base leading-tight">
                            {lang.nativeName}
                          </div>
                          <div className="text-xs text-earth-600 mt-0.5">
                            {lang.englishName} • <span className="text-earth-400">{lang.script}</span>
                          </div>
                        </div>
                        {isSelected ? (
                          <div className="p-1 rounded-full bg-rangoli-500 text-white">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          lang.dir === 'rtl' && (
                            <span className="text-[10px] font-mono uppercase bg-earth-100 text-earth-700 px-1.5 py-0.5 rounded">
                              RTL
                            </span>
                          )
                        )}
                      </div>

                      {/* Capability dots */}
                      <div className="flex items-center gap-3 mt-3 pt-2 border-t border-sand/40 text-[11px] text-earth-500">
                        <span className="flex items-center gap-1">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              lang.capabilities.ui === 'full' ? 'bg-success' : 'bg-warning'
                            }`}
                          />
                          UI
                        </span>
                        <span className="flex items-center gap-1">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              lang.capabilities.asr === 'full'
                                ? 'bg-success'
                                : lang.capabilities.asr === 'partial'
                                ? 'bg-warning'
                                : 'bg-earth-300'
                            }`}
                          />
                          Voice
                        </span>
                        <span className="flex items-center gap-1">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              lang.capabilities.tts === 'full'
                                ? 'bg-success'
                                : lang.capabilities.tts === 'partial'
                                ? 'bg-warning'
                                : 'bg-earth-300'
                            }`}
                          />
                          TTS
                        </span>
                        {lang.capabilities.asr !== 'full' && (
                          <span className="ml-auto text-[10px] text-warning font-medium">
                            {lang.capabilities.asr === 'none' ? 'Text Only' : 'Partial'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer info banner */}
        <div className="p-4 border-t border-sand bg-ivory-50/90 text-xs text-earth-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RangoliCore size={16} className="text-rangoli-600" />
            <span>Honest capability matrix: 16 International + 22 Indian Scheduled Languages</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-sand bg-surface font-medium hover:bg-rangoli-50 transition-colors"
          >
            {t('common', 'close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
