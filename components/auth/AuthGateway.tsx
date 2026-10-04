'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Store,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Mic,
  Database,
  User,
  Phone,
  Tag,
  Globe,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { RangoliEmblem, RangoliBackground, RangoliDivider } from '@/components/rangoli/RangoliMotif';
import { useBusiness } from '@/context/BusinessContext';
import { getLocaleConfig } from '@/lib/i18n/locales.config';

interface AuthGatewayProps {
  onViewLanding?: () => void;
}

export const AuthGateway: React.FC<AuthGatewayProps> = ({ onViewLanding }) => {
  const {
    login,
    register,
    enterDemoMode,
    uiLanguage,
    setIsLanguageModalOpen,
    t,
  } = useBusiness();

  const localeCfg = getLocaleConfig(uiLanguage);

  const [activeMode, setActiveMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regStoreName, setRegStoreName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regBusinessType, setRegBusinessType] = useState('Kirana & Grocery');
  const [regPassword, setRegPassword] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginEmail || !loginPassword) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(loginEmail, loginPassword);
      if (!res.success) {
        setErrorMessage(res.error || 'Invalid credentials. Please verify or use Instant Demo Mode.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regFullName || !regStoreName || !regEmail || !regPassword) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await register({
        fullName: regFullName,
        businessName: regStoreName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        businessType: regBusinessType,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to complete registration. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory-50 text-earth-900 flex flex-col justify-between relative overflow-hidden selection:bg-rangoli-200">
      {/* Translucent Rangoli Background Motif */}
      <RangoliBackground opacity={0.16} />

      {/* Top Navigation */}
      <header className="relative z-10 max-w-7xl mx-auto w-full p-4 sm:p-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-white border border-rangoli-300 shadow-sm flex items-center justify-center p-1.5">
            <RangoliEmblem size={26} />
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

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector Chip */}
          <button
            onClick={() => setIsLanguageModalOpen(true)}
            className="px-3 py-1.5 rounded-full border border-rangoli-300 bg-white/90 hover:bg-white text-earth-900 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
            title="Change Application Language"
          >
            <Globe className="w-3.5 h-3.5 text-rangoli-600" />
            <span className="font-serif">{localeCfg.nativeName}</span>
          </button>

          {/* Product Tour Trigger */}
          {onViewLanding && (
            <button
              onClick={onViewLanding}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white border border-rangoli-300 text-xs font-semibold text-earth-700 shadow-2xs transition-all"
            >
              <span>Explore Features</span>
            </button>
          )}

          {/* Instant Demo Bypass */}
          <button
            onClick={() => enterDemoMode()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rangoli-500 hover:bg-rangoli-600 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 text-amber-200" />
            <span>Instant Demo</span>
          </button>
        </div>
      </header>

      {/* Main Form & Showcase Split Section */}
      <main className="relative z-10 max-w-5xl mx-auto w-full px-4 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1">
        {/* Left Branding Column */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-rangoli-300 text-xs font-bold text-rangoli-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Voice-First Operating System for MSMEs</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-earth-900 leading-tight">
            Natural Speech into <br />
            <span className="text-rangoli-600">Verified Business Operations</span>
          </h1>

          <p className="text-sm sm:text-base text-earth-600 font-sans max-w-lg leading-relaxed">
            KINETIC turns spoken Hindi, Punjabi, and English into verified transactions, automated inventory adjustments, customer credit ledgers, and live business intelligence.
          </p>

          <RangoliDivider className="max-w-xs my-2" />

          {/* Value Highlights */}
          <div className="space-y-3.5 pt-2 text-xs sm:text-sm text-earth-700">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-rangoli-100 border border-rangoli-300 flex items-center justify-center shrink-0 mt-0.5 text-rangoli-700">
                <Mic className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-earth-900">Voice-First Bahi-Khata:</span> 6-second natural language parsing with multi-item cart breakdown.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-rangoli-100 border border-rangoli-300 flex items-center justify-center shrink-0 mt-0.5 text-rangoli-700">
                <Database className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-earth-900">Multi-Tenant PostgreSQL:</span> Row-level security isolating your store data with offline buffer sync.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-rangoli-100 border border-rangoli-300 flex items-center justify-center shrink-0 mt-0.5 text-rangoli-700">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-earth-900">Responsible AI Loop:</span> AI proposes transactions, business owners verify. Zero silent hallucinations.
              </div>
            </div>
          </div>
        </div>

        {/* Right Authentication Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-rangoli-200 shadow-rangoli-lg p-6 sm:p-8 space-y-5">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-ivory-100 border border-rangoli-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setActiveMode('login');
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-xl transition-all ${
                  activeMode === 'login'
                    ? 'bg-white text-earth-900 shadow-sm border border-rangoli-200'
                    : 'text-earth-600 hover:text-earth-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveMode('register');
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-xl transition-all ${
                  activeMode === 'register'
                    ? 'bg-white text-earth-900 shadow-sm border border-rangoli-200'
                    : 'text-earth-600 hover:text-earth-900'
                }`}
              >
                Register MSME
              </button>
            </div>

            {/* Title / Description */}
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-earth-900">
                {activeMode === 'login' ? 'Sign In to Store' : 'Create Business Tenancy'}
              </h2>
              <p className="text-xs text-earth-500">
                {activeMode === 'login'
                  ? 'Access your inventory, bahi-khata, and voice command center'
                  : 'Register your Kirana or MSME with isolated PostgreSQL schema'}
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-800 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            {activeMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-earth-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-earth-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="owner@sharmakiranastore.in"
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-earth-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rangoli-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-earth-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-earth-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-earth-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rangoli-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-rangoli-500 to-rangoli-600 hover:from-rangoli-600 hover:to-rangoli-700 text-white font-bold text-xs sm:text-sm shadow-rangoli transition-all active:scale-98 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Operating System</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* REGISTER FORM */}
            {activeMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-earth-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-earth-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="Ramesh Sharma"
                        required
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-earth-300 text-xs focus:outline-none focus:ring-2 focus:ring-rangoli-500 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-earth-700 mb-1">
                      Store Name *
                    </label>
                    <div className="relative">
                      <Store className="w-4 h-4 text-earth-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={regStoreName}
                        onChange={(e) => setRegStoreName(e.target.value)}
                        placeholder="Sharma Kirana Store"
                        required
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-earth-300 text-xs focus:outline-none focus:ring-2 focus:ring-rangoli-500 bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-earth-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-earth-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="owner@sharmakiranastore.in"
                      required
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-earth-300 text-xs focus:outline-none focus:ring-2 focus:ring-rangoli-500 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-earth-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-earth-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-earth-300 text-xs focus:outline-none focus:ring-2 focus:ring-rangoli-500 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-earth-700 mb-1">
                      Business Type
                    </label>
                    <div className="relative">
                      <Tag className="w-4 h-4 text-earth-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={regBusinessType}
                        onChange={(e) => setRegBusinessType(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-earth-300 text-xs focus:outline-none focus:ring-2 focus:ring-rangoli-500 bg-white"
                      >
                        <option value="Kirana & Grocery">Kirana & Grocery</option>
                        <option value="Clothing & Apparel">Clothing & Apparel</option>
                        <option value="Electronics & Hardware">Electronics & Hardware</option>
                        <option value="Pharmacy & Healthcare">Pharmacy</option>
                        <option value="Wholesale Distribution">Wholesale</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-earth-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-earth-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-10 py-2 rounded-xl border border-earth-300 text-xs focus:outline-none focus:ring-2 focus:ring-rangoli-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rangoli-500 to-rangoli-600 hover:from-rangoli-600 hover:to-rangoli-700 text-white font-bold text-xs sm:text-sm shadow-rangoli transition-all active:scale-98 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Provisioning Store...</span>
                    </>
                  ) : (
                    <>
                      <span>Register MSME & Launch</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-earth-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                <span className="bg-white px-3 text-earth-400">or evaluate instantly</span>
              </div>
            </div>

            {/* 1-Click Instant Evaluator Mode */}
            <button
              type="button"
              onClick={() => enterDemoMode()}
              className="w-full py-2.5 rounded-xl bg-rangoli-50 hover:bg-rangoli-100 border border-rangoli-300 text-rangoli-800 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-98"
            >
              <Zap className="w-4 h-4 text-rangoli-600" />
              <span>Launch Demo Mode (Preloaded Sharma Kirana Store)</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-4 text-center text-[11px] text-earth-500 border-t border-rangoli-200/50 bg-white/40">
        KINETIC MSME Operating System • Built for IndustrySolve Hackathon 2026 | IIIT Delhi
      </footer>
    </div>
  );
};
