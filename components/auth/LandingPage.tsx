'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Mic,
  ShieldCheck,
  Zap,
  Store,
  ChevronRight,
  Languages,
  Database,
  Lock,
} from 'lucide-react';
import { RangoliEmblem, RangoliBackground, RangoliCorner, RangoliDivider } from '@/components/rangoli/RangoliMotif';
import { useBusiness } from '@/context/BusinessContext';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const { business, updateBusiness, resetToDemo, t } = useBusiness();
  const [storeName, setStoreName] = useState(business.name);
  const [ownerName, setOwnerName] = useState(business.ownerName);
  const [isCustomizing, setIsCustomizing] = useState(false);

  const handleLaunchWithCustom = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusiness({
      name: storeName || 'My Kirana Store',
      ownerName: ownerName || 'Trader',
    });
    onEnterApp();
  };

  return (
    <div className="relative min-h-screen bg-ivory-50 text-earth-900 flex flex-col justify-between overflow-hidden selection:bg-rangoli-200">
      {/* Signature Translucent Indian Rangoli Canvas Background */}
      <RangoliBackground opacity={0.18} />

      {/* Header */}
      <header className="relative z-10 p-4 sm:p-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-rangoli-300 shadow-sm flex items-center justify-center p-1.5">
            <RangoliEmblem size={28} />
          </div>
          <div>
            <span className="font-serif font-bold text-xl tracking-tight text-earth-900">
              KINETIC
            </span>
            <span className="text-[10px] ml-1.5 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rangoli-100 text-rangoli-800 border border-rangoli-300">
              MSME OS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold text-earth-600">
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white border border-rangoli-300 text-rangoli-800 font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-rangoli-600" />
            <span>Sign In</span>
          </Link>
          <Link
            href="/register"
            className="hidden sm:inline-flex px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white border border-rangoli-300 text-earth-800 font-bold transition-all shadow-xs"
          >
            Register MSME
          </Link>
          <button
            onClick={() => {
              resetToDemo();
              onEnterApp();
            }}
            className="px-4 py-1.5 rounded-full bg-rangoli-500 hover:bg-rangoli-600 text-white font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-200" />
            <span>{t('landing', 'launchDemo', 'Demo Mode')}</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-16 text-center space-y-6">
        {/* Hackathon Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-rangoli-300 text-xs font-semibold text-rangoli-800 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-success animate-ping" />
          <span>IndustrySolve Hackathon 2026 | IIIT Delhi</span>
          <span className="text-earth-400">•</span>
          <span>Theme: AI Consumer & Enterprise</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-earth-900 font-serif leading-tight">
            KINETIC
          </h1>
          <p className="text-lg sm:text-xl font-medium text-rangoli-700 max-w-2xl mx-auto font-serif">
            {t('landing', 'heroSubtitle', 'AI-powered business intelligence for the businesses that keep India moving.')}
          </p>
          <div className="text-sm sm:text-base font-semibold uppercase tracking-widest text-earth-600 font-serif">
            {t('landing', 'heroTagline', 'Speak • Record • Understand • Act')}
          </div>
        </div>

        {/* Decorative Rangoli Divider */}
        <RangoliDivider className="max-w-md mx-auto my-4" />

        {/* Value Proposition Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left text-xs">
          <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-rangoli-200 shadow-xs space-y-1">
            <div className="font-bold text-earth-900 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-rangoli-500" />
              <span>{t('landing', 'kiranaVoiceFirst', 'Multilingual Voice First')}</span>
            </div>
            <p className="text-earth-600 leading-snug">
              {t('landing', 'kiranaVoiceFirstDesc', 'Speak in Hindi, Punjabi, or English to record khata & sales instantly.')}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-rangoli-200 shadow-xs space-y-1">
            <div className="font-bold text-earth-900 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-rangoli-500" />
              <span>{t('dashboard', 'liveData', 'Real Relational Data')}</span>
            </div>
            <p className="text-earth-600 leading-snug">
              {t('landing', 'realDataSync', 'Actual database synchronization: sales decrement stock, credit tracks receivables, and alerts trigger automatically.')}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-rangoli-200 shadow-xs space-y-1">
            <div className="font-bold text-earth-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-rangoli-500" />
              <span>{t('landing', 'offlineHybrid', 'Hybrid Architecture')}</span>
            </div>
            <p className="text-earth-600 leading-snug">
              {t('landing', 'offlineHybridDesc', 'Fast on-device deterministic processing for privacy and zero cloud cost.')}
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        {!isCustomizing ? (
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                resetToDemo();
                onEnterApp();
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-rangoli-500 to-rangoli-600 hover:from-rangoli-600 hover:to-rangoli-700 text-white font-bold text-sm shadow-rangoli hover:shadow-rangoli-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Store className="w-4 h-4" />
              <span>{t('landing', 'enterPlatform', 'Enter Operating System (Live Demo)')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsCustomizing(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-ivory-100 border border-rangoli-300 text-earth-800 font-semibold text-sm transition-all"
            >
              {t('landing', 'customizeStore', 'Setup Custom Store')}
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleLaunchWithCustom}
            className="bg-white/95 p-5 rounded-2xl border border-rangoli-300 shadow-rangoli max-w-md mx-auto text-left space-y-3 animate-in fade-in"
          >
            <h3 className="font-bold text-sm font-serif text-earth-900">
              {t('landing', 'customizeStore', 'Setup Your Kirana / MSME Store')}
            </h3>

            <div>
              <label className="block text-[11px] font-semibold text-earth-600 mb-1">
                {t('settings', 'storeName', 'Store Name')}
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-rangoli-300 text-xs"
                placeholder="e.g. Verma General Store"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-earth-600 mb-1">
                {t('settings', 'ownerName', 'Your Name')}
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-rangoli-300 text-xs"
                placeholder="e.g. Rajesh Verma"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCustomizing(false)}
                className="px-3 py-1.5 rounded-lg border border-earth-300 text-xs"
              >
                {t('common', 'cancel', 'Back')}
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded-lg bg-rangoli-500 text-white font-bold text-xs shadow-sm"
              >
                {t('landing', 'launchDemo', 'Launch KINETIC OS')}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center text-xs text-earth-500 border-t border-rangoli-200/50 bg-white/40">
        <p>
          KINETIC MSME Operating System • Designed for IndustrySolve Hackathon | IIIT Delhi 2026
        </p>
        <p className="text-[11px] text-earth-400 mt-0.5">
          Traditional Indian Rangoli Aesthetic × Modern AI Architecture
        </p>
      </footer>
    </div>
  );
};
