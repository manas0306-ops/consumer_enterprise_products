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
  User,
  Phone,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { RangoliEmblem, RangoliBackground, RangoliDivider } from '@/components/rangoli/RangoliMotif';
import { useBusiness } from '@/context/BusinessContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register, enterDemoMode } = useBusiness();

  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessType, setBusinessType] = useState('Kirana & Grocery');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName || !businessName || !email || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await register({
        fullName,
        businessName,
        email,
        phone,
        businessType,
        password,
      });

      if (res.success) {
        router.push('/');
      } else {
        setErrorMessage(res.error || 'Registration failed. Please check your details.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during registration.');
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

      {/* Main Registration Container */}
      <main className="relative z-10 max-w-5xl mx-auto w-full px-4 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1">
        {/* Left Feature Showcase */}
        <div className="lg:col-span-5 space-y-5 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rangoli-100/80 border border-rangoli-300 text-[11px] font-bold text-rangoli-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Multi-Tenant Business Provisioning</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-earth-900 leading-tight">
            Register your <br />
            <span className="text-rangoli-600">Kirana or MSME</span>
          </h1>

          <p className="text-sm text-earth-600 font-sans leading-relaxed">
            Get an instant cloud operating system with isolated Row Level Security, voice bahi-khata ledger, catalog tracking, and multilingual AI queries.
          </p>

          <RangoliDivider className="max-w-xs my-2" />

          <div className="space-y-3 pt-1 text-xs text-earth-700">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Dedicated tenant database partition with strict RLS policies</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Offline sync buffer for intermittent Indian broadband</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Natural voice transaction engine in Hindi, Punjabi & English</span>
            </div>
          </div>
        </div>

        {/* Right Registration Card */}
        <div className="lg:col-span-7 w-full max-w-lg mx-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-rangoli-200/90 shadow-rangoli-lg p-6 sm:p-8 space-y-5">
            <div className="space-y-1">
              <h2 className="text-2xl font-serif font-bold text-earth-900">
                Create Business Account
              </h2>
              <p className="text-xs text-earth-500">
                Setup your store profile and start operating in under a minute
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-earth-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-earth-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ramesh Sharma"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-earth-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rangoli-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-earth-700 mb-1">
                    Store / Business Name *
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-earth-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Sharma Kirana Store"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-earth-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rangoli-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-earth-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-earth-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="owner@sharmakirana.in"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-earth-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rangoli-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-earth-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-earth-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-earth-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rangoli-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-earth-700 mb-1">
                  Business Industry / Category
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-earth-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-earth-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rangoli-500 bg-white"
                  >
                    <option value="Kirana & Grocery">Kirana & Grocery (किराना और राशन)</option>
                    <option value="Hardware & Electrical">Hardware & Electrical (हार्डवेयर)</option>
                    <option value="Textiles & Garments">Textiles & Garments (कपड़ा व्यापार)</option>
                    <option value="Pharmacy & Medical">Pharmacy & Medical (दवा दुकान)</option>
                    <option value="Electronics & Mobile">Electronics & Mobile Accessories</option>
                    <option value="Wholesale Distributor">Wholesale Distributor (थोक विक्रेता)</option>
                    <option value="General Retail">General Retail & Departmental</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-earth-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-earth-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      required
                      className="w-full pl-9 pr-9 py-2 rounded-xl border border-earth-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rangoli-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-earth-700 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-earth-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-earth-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rangoli-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rangoli-500 to-rangoli-600 hover:from-rangoli-600 hover:to-rangoli-700 text-white font-bold text-sm shadow-rangoli transition-all active:scale-98 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Business OS...</span>
                  </>
                ) : (
                  <>
                    <span>Register Business & Launch</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center text-xs text-earth-600 pt-1">
              Already have an MSME account?{' '}
              <Link href="/login" className="font-bold text-rangoli-600 hover:underline">
                Sign In
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
