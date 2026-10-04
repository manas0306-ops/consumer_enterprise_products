'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ArrowLeft,
  Layers,
} from 'lucide-react';
import { RangoliEmblem, RangoliBackground, RangoliDivider } from '@/components/rangoli/RangoliMotif';
import { useBusiness } from '@/context/BusinessContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, enterDemoMode, isDemoMode, user, t } = useBusiness();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        router.push('/');
      } else {
        setErrorMessage(res.error || 'Failed to authenticate. Please check your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = () => {
    enterDemoMode();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-ivory-50 text-earth-900 flex flex-col justify-between relative overflow-hidden">
      {/* Translucent Rangoli Background Motif */}
      <RangoliBackground opacity={0.16} />

      {/* Top Navbar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full p-4 sm:p-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-white border border-rangoli-300 shadow-sm flex items-center justify-center p-1.5 transition-transform group-hover:scale-105">
            <RangoliEmblem size={24} />
          </div>
          <div>
            <span className="font-serif font-bold text-lg tracking-tight text-earth-900">
              KINETIC
            </span>
            <span className="text-[9px] ml-1.5 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rangoli-100 text-rangoli-800 border border-rangoli-300">
              MSME OS
            </span>
          </div>
        </Link>

        <button
          onClick={handleDemoAccess}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white border border-rangoli-300 text-xs font-semibold text-rangoli-800 shadow-xs transition-all hover:scale-102"
        >
          <Zap className="w-3.5 h-3.5 text-amber-600" />
          <span>Instant Demo Bypass</span>
        </button>
      </header>

      {/* Main Container - Split View on Large Screens */}
      <main className="relative z-10 max-w-5xl mx-auto w-full px-4 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1">
        {/* Left Branding Showcase */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rangoli-100/80 border border-rangoli-300 text-[11px] font-bold text-rangoli-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Secure Business Authentication • Supabase PostgreSQL</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-earth-900 leading-tight">
            Welcome to your <br />
            <span className="text-rangoli-600">Business Command Center</span>
          </h1>

          <p className="text-sm sm:text-base text-earth-600 font-sans max-w-lg leading-relaxed">
            Turn natural spoken Hindi, Punjabi, and English conversations into verified sales, inventory deductions, customer credit ledgers, and real-time intelligence.
          </p>

          <RangoliDivider className="max-w-xs my-2" />

          {/* Highlights checklist */}
          <div className="space-y-3 pt-2 text-xs sm:text-sm text-earth-700">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-md bg-rangoli-100 border border-rangoli-300 flex items-center justify-center shrink-0 mt-0.5 text-rangoli-700">
                <Mic className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-earth-900">Voice-First Bahi-Khata:</span> 6-second natural language processing with multi-item cart resolution.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-md bg-rangoli-100 border border-rangoli-300 flex items-center justify-center shrink-0 mt-0.5 text-rangoli-700">
                <Database className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-earth-900">Multi-Tenant PostgreSQL:</span> Row-level security isolating your Kirana data from unauthorized access.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-md bg-rangoli-100 border border-rangoli-300 flex items-center justify-center shrink-0 mt-0.5 text-rangoli-700">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-earth-900">Human-in-the-Loop Gate:</span> AI proposes transactions, business owners confirm them. Zero auto-hallucination.
              </div>
            </div>
          </div>
        </div>

        {/* Right Authentication Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-rangoli-200/90 shadow-rangoli-lg p-6 sm:p-8 space-y-6">
            <div className="space-y-1 text-center">
              <h2 className="text-2xl font-serif font-bold text-earth-900">
                Sign In to KINETIC
              </h2>
              <p className="text-xs text-earth-500">
                Enter your business credentials to access your store
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-earth-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-earth-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rangoli-500 to-rangoli-600 hover:from-rangoli-600 hover:to-rangoli-700 text-white font-bold text-sm shadow-rangoli transition-all active:scale-98 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
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

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-earth-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                <span className="bg-white px-3 text-earth-400">or evaluate instantly</span>
              </div>
            </div>

            {/* Quick Demo Bypass for Hackathon Evaluators */}
            <button
              type="button"
              onClick={handleDemoAccess}
              className="w-full py-2.5 rounded-xl bg-rangoli-50 hover:bg-rangoli-100 border border-rangoli-300 text-rangoli-800 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-2xs"
            >
              <Zap className="w-4 h-4 text-rangoli-600" />
              <span>Launch Demo Mode (Preloaded Sharma Kirana Store)</span>
            </button>

            <div className="text-center text-xs text-earth-600 pt-2">
              Don&apos;t have a business registered?{' '}
              <Link href="/register" className="font-bold text-rangoli-600 hover:underline">
                Register Your MSME
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-4 text-center text-[11px] text-earth-500 border-t border-rangoli-200/50 bg-white/40">
        KINETIC MSME Operating System • Built for IndustrySolve Hackathon 2026 | IIIT Delhi
      </footer>
    </div>
  );
}
