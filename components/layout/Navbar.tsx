'use client';

import React from 'react';
import Link from 'next/link';
import {
  Menu,
  Sparkles,
  PlusCircle,
  Cpu,
  IndianRupee,
  Bell,
  Globe,
  RotateCcw,
  Mic,
  Lock,
  LogOut,
} from 'lucide-react';
import { useBusiness } from '@/context/BusinessContext';
import { ActiveTab } from './Sidebar';
import { RangoliCore } from '@/components/rangoli/RangoliMotif';
import { getLocaleConfig } from '@/lib/i18n/locales.config';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  onOpenQuickSale: () => void;
  onOpenQuickPayment: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
  onOpenQuickSale,
  onOpenQuickPayment,
}) => {
  const {
    business,
    alerts,
    telemetry,
    uiLanguage,
    setIsLanguageModalOpen,
    canUndo,
    undoLastTransaction,
    user,
    isDemoMode,
    logout,
    t,
  } = useBusiness();

  const activeAlerts = alerts.filter((a) => !a.dismissed);
  const localeCfg = getLocaleConfig(uiLanguage);

  const getPageTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'dashboard': return t('dashboard', 'title', 'Business Command Dashboard');
      case 'voice': return 'Voice Transaction Center';
      case 'ask': return 'Ask KINETIC — Business Intelligence';
      case 'assistant': return t('assistant', 'title', 'KINETIC Conversational AI');
      case 'sales': return t('sales', 'title', 'Sales Register & Invoices');
      case 'purchases': return t('purchases', 'title', 'Stock Procurement & Purchases');
      case 'inventory': return t('inventory', 'title', 'Inventory & Stock Engine');
      case 'customers': return t('customers', 'title', 'Customer Directory & Khata');
      case 'receivables': return t('receivables', 'title', 'Udhar / Receivables Ledger');
      case 'sync': return 'Connectivity & Sync Center';
      case 'device': return 'KINETIC Smart Voice Terminal';
      case 'analytics': return t('analytics', 'title', 'Financial Analytics & Trends');
      case 'insights': return t('insights', 'title', 'AI Business Insights');
      case 'alerts': return t('alerts', 'title', 'Live System Alerts');
      case 'documents': return t('documents', 'title', 'Bill & Informal Note Scanner');
      case 'settings': return t('settings', 'title', 'Settings & Language');
      default: return t('nav', 'title', 'KINETIC MSME OS');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-sand px-4 py-3 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpenMobile(!isOpenMobile)}
            className="p-2 rounded-lg text-earth-700 hover:bg-rangoli-100 lg:hidden"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <RangoliCore size={18} className="text-rangoli-600 hidden sm:inline" />
              <h2 className="text-lg lg:text-xl font-bold text-earth-900 font-serif leading-tight">
                {getPageTitle(activeTab)}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-earth-600 mt-0.5">
              <span className="font-semibold text-rangoli-700">{business.name}</span>
              <span>•</span>
              {isDemoMode ? (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md border border-amber-300">
                  Demo Mode
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-300">
                  PostgreSQL Cloud
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick actions, hybrid routing badge, alerts, language */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Design System §19: 8-second Transaction Undo Pill */}
          {canUndo && (
            <div className="animate-fade-in flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/15 border border-success/30 text-success text-xs font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-success animate-ping" />
              <span className="hidden sm:inline">{t('nav', 'recorded', 'Recorded')}</span>
              <button
                onClick={undoLastTransaction}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-success text-white hover:bg-success/90 transition-all font-bold text-[11px]"
              >
                <RotateCcw className="w-3 h-3" />
                {t('nav', 'undo', 'Undo (8s)')}
              </button>
            </div>
          )}

          {/* Hybrid AI Efficiency Pill */}
          <div
            onClick={() => setActiveTab('settings')}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-rangoli-50 border border-rangoli-300 text-xs text-rangoli-800 cursor-pointer hover:bg-rangoli-100 transition-colors shadow-sm"
            title="Click to view Hybrid AI routing and compute efficiency metrics"
          >
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <Cpu className="w-3.5 h-3.5 text-rangoli-600" />
            <span className="font-medium">{t('nav', 'hybridAI', 'Hybrid AI')}:</span>
            <span className="font-bold text-earth-800">
              {Math.round(
                (telemetry.localLightweightRequests / (telemetry.totalRequests || 1)) * 100
              )}
              % {t('nav', 'local', 'Local')}
            </span>
            <span className="text-earth-500">({telemetry.avgLatencyMs}ms)</span>
          </div>

          {/* Quick Action: New Sale */}
          <button
            onClick={onOpenQuickSale}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rangoli-500 hover:bg-rangoli-600 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t('nav', 'quickSale', '+ Sale')}</span>
          </button>

          {/* Quick Action: Settle Payment */}
          <button
            onClick={onOpenQuickPayment}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ivory-100 hover:bg-ivory-200 border border-rangoli-300 text-earth-800 text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <IndianRupee className="w-3.5 h-3.5 text-success" />
            <span>{t('nav', 'settleUdhar', 'Settle Udhar')}</span>
          </button>

          {/* Persistent "Ask KINETIC" Mic Button (PRD §6.2, Design System §12 & §15) */}
          <button
            onClick={() => setActiveTab('assistant')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-rangoli-500 to-rangoli-600 text-white text-xs font-semibold shadow-md hover:shadow-rangoli transition-all active:scale-95"
            title="Ask KINETIC Voice Assistant"
          >
            <Mic className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{t('nav', 'askKinetic', 'Ask KINETIC')}</span>
          </button>

          {/* Language Selector Chip showing Native Script (PRD §6.1, Design System §17) */}
          <button
            onClick={() => setIsLanguageModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg border border-rangoli-300 bg-surface hover:bg-rangoli-50 text-earth-900 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            title="Change Application Language (38 Languages)"
          >
            <Globe className="w-3.5 h-3.5 text-rangoli-600" />
            <span className="font-serif">{localeCfg.nativeName}</span>
          </button>

          {/* Alerts Bell */}
          <button
            onClick={() => setActiveTab('alerts')}
            className="relative p-2 rounded-lg border border-sand hover:bg-rangoli-50 text-earth-700 transition-colors"
            title="View system alerts"
          >
            <Bell className="w-4 h-4 text-earth-700" />
            {activeAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {activeAlerts.length}
              </span>
            )}
          </button>

          {/* User Account / Session Pill */}
          {user && !isDemoMode ? (
            <button
              onClick={() => logout()}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg border border-rangoli-200 bg-white hover:bg-rangoli-50 text-xs font-semibold text-earth-700 transition-colors flex items-center gap-1.5 shadow-xs"
              title={`Logged in as ${user.email}. Click to sign out.`}
            >
              <div className="w-5 h-5 rounded-full bg-rangoli-500 text-white font-bold text-[10px] flex items-center justify-center">
                {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
              </div>
              <span className="hidden lg:inline">{user.fullName || user.email.split('@')[0]}</span>
              <LogOut className="w-3 h-3 text-earth-400 hover:text-earth-700 ml-0.5" />
            </button>
          ) : (
            <Link
              href="/login"
              className="px-2.5 py-1.5 rounded-lg border border-rangoli-300 bg-white hover:bg-rangoli-50 text-xs font-bold text-rangoli-700 transition-colors flex items-center gap-1 shadow-xs"
              title="Sign in with Cloud PostgreSQL database"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
