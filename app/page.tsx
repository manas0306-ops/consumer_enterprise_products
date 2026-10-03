'use client';

import React, { useState } from 'react';
import { Sidebar, ActiveTab } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { AIAssistant } from '@/components/assistant/AIAssistant';
import { SalesManager } from '@/components/sales/SalesManager';
import { PurchasesManager } from '@/components/purchases/PurchasesManager';
import { InventoryManager } from '@/components/inventory/InventoryManager';
import { CustomerManager } from '@/components/customers/CustomerManager';
import { ReceivablesManager } from '@/components/receivables/ReceivablesManager';
import { AnalyticsManager } from '@/components/analytics/AnalyticsManager';
import { AIInsights } from '@/components/insights/AIInsights';
import { AlertsManager } from '@/components/alerts/AlertsManager';
import { DocumentProcessor } from '@/components/documents/DocumentProcessor';
import { SettingsManager } from '@/components/settings/SettingsManager';
import { LandingPage } from '@/components/auth/LandingPage';
import { QuickSaleModal } from '@/components/modals/QuickSaleModal';
import { QuickPaymentModal } from '@/components/modals/QuickPaymentModal';
import { LanguageSelectorModal } from '@/components/modals/LanguageSelectorModal';
import { HackathonDemoGuide } from '@/components/demo/HackathonDemoGuide';
import { RangoliBackground } from '@/components/rangoli/RangoliMotif';
import { useBusiness } from '@/context/BusinessContext';
import { getLocaleConfig } from '@/lib/i18n/locales.config';

export default function Home() {
  const [inApp, setInApp] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [showQuickSale, setShowQuickSale] = useState(false);
  const [showQuickPayment, setShowQuickPayment] = useState(false);

  const {
    uiLanguage,
    setUiLanguage,
    showRangoli,
    isLanguageModalOpen,
    setIsLanguageModalOpen,
  } = useBusiness();

  const localeCfg = getLocaleConfig(uiLanguage);
  const isRTL = localeCfg.dir === 'rtl';

  // If user is on landing page, display the Hero presentation
  if (!inApp) {
    return <LandingPage onEnterApp={() => setInApp(true)} />;
  }

  return (
    <div
      className={`min-h-screen bg-canvas flex flex-col relative overflow-x-hidden ${
        isRTL ? 'font-sans' : ''
      }`}
      dir={localeCfg.dir}
    >
      {/* Signature Translucent Indian Rangoli Canvas (User Uploaded Motif) */}
      {showRangoli && <RangoliBackground opacity={0.12} />}

      {/* Responsive Sidebar (264px solid S1, auto-flipped in RTL) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* Main Content Area */}
      <div
        className={`flex flex-col flex-1 min-w-0 transition-all ${
          isRTL ? 'lg:pr-[264px]' : 'lg:pl-[264px]'
        }`}
      >
        {/* Sticky Header */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpenMobile={isOpenMobile}
          setIsOpenMobile={setIsOpenMobile}
          onOpenQuickSale={() => setShowQuickSale(true)}
          onOpenQuickPayment={() => setShowQuickPayment(true)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              setActiveTab={setActiveTab}
              onOpenQuickSale={() => setShowQuickSale(true)}
              onOpenQuickPayment={() => setShowQuickPayment(true)}
            />
          )}

          {activeTab === 'assistant' && (
            <AIAssistant onNavigateTo={(tab) => setActiveTab(tab as ActiveTab)} />
          )}

          {activeTab === 'sales' && (
            <SalesManager onOpenQuickSale={() => setShowQuickSale(true)} />
          )}

          {activeTab === 'purchases' && <PurchasesManager />}

          {activeTab === 'inventory' && <InventoryManager />}

          {activeTab === 'customers' && <CustomerManager />}

          {activeTab === 'receivables' && (
            <ReceivablesManager onOpenQuickPayment={() => setShowQuickPayment(true)} />
          )}

          {activeTab === 'analytics' && <AnalyticsManager />}

          {activeTab === 'insights' && (
            <AIInsights onNavigateTo={(tab) => setActiveTab(tab as ActiveTab)} />
          )}

          {activeTab === 'alerts' && (
            <AlertsManager onNavigateTo={(tab) => setActiveTab(tab as ActiveTab)} />
          )}

          {activeTab === 'documents' && <DocumentProcessor />}

          {activeTab === 'settings' && <SettingsManager />}
        </main>
      </div>

      {/* Global Modals */}
      <QuickSaleModal
        isOpen={showQuickSale}
        onClose={() => setShowQuickSale(false)}
      />

      <QuickPaymentModal
        isOpen={showQuickPayment}
        onClose={() => setShowQuickPayment(false)}
      />

      {/* 38-Language Selector Modal (S2 Glass Modal per Design System §17) */}
      <LanguageSelectorModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        currentLocale={uiLanguage}
        onSelectLocale={setUiLanguage}
      />

      {/* Hackathon 3-Minute Demo Presentation Guide Widget */}
      <HackathonDemoGuide
        setActiveTab={setActiveTab}
        onRunVoiceSample={(_sampleText) => {
          setActiveTab('assistant');
        }}
      />
    </div>
  );
}
