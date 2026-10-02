'use client';

import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  ShoppingBag,
  PackageSearch,
  Users,
  WalletCards,
  TrendingUp,
  Lightbulb,
  Bell,
  FileText,
  Settings,
  Store,
  Truck,
  RotateCcw,
  Zap,
  Globe,
} from 'lucide-react';
import { RangoliCore, RangoliCorner } from '@/components/rangoli/RangoliMotif';
import { useBusiness } from '@/context/BusinessContext';
import { getLocaleConfig } from '@/lib/i18n/locales.config';

export type ActiveTab =
  | 'dashboard'
  | 'assistant'
  | 'sales'
  | 'purchases'
  | 'inventory'
  | 'customers'
  | 'receivables'
  | 'analytics'
  | 'insights'
  | 'alerts'
  | 'documents'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const {
    business,
    alerts,
    resetToDemo,
    uiLanguage,
    setIsLanguageModalOpen,
    t,
  } = useBusiness();

  const localeCfg = getLocaleConfig(uiLanguage);
  const isRTL = localeCfg.dir === 'rtl';
  const activeAlertsCount = alerts.filter((a) => !a.dismissed).length;

  interface NavItem {
    id: ActiveTab;
    label: string;
    icon: any;
    highlight?: boolean;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: t('dashboard', 'title') || 'Dashboard', icon: LayoutDashboard },
    { id: 'assistant', label: t('assistant', 'title') || 'AI Assistant', icon: Sparkles, highlight: true },
    { id: 'sales', label: 'Sales & Invoices', icon: ShoppingBag },
    { id: 'purchases', label: 'Purchases / Mal', icon: Truck },
    { id: 'inventory', label: t('inventory', 'title') || 'Inventory (Stock)', icon: PackageSearch },
    { id: 'customers', label: t('customers', 'title') || 'Customers & Khata', icon: Users },
    { id: 'receivables', label: t('receivables', 'title') || 'Udhar / Receivables', icon: WalletCards },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'insights', label: 'AI Insights', icon: Lightbulb },
    { id: 'alerts', label: t('alerts', 'title') || 'Alerts', icon: Bell, badge: activeAlertsCount },
    { id: 'documents', label: t('documents', 'title') || 'Bills & Documents', icon: FileText },
    { id: 'settings', label: t('settings', 'title') || 'Settings & Language', icon: Settings },
  ];

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-earth-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Main Desktop Sidebar (264px, Solid S1, Design System §12 & §33) */}
      <aside
        className={`fixed top-0 bottom-0 z-50 w-64 lg:w-[264px] bg-surface border-sand shadow-sm flex flex-col transition-transform duration-300 ${
          isRTL
            ? 'right-0 border-l lg:translate-x-0 ' + (isOpenMobile ? 'translate-x-0' : 'translate-x-full')
            : 'left-0 border-r lg:translate-x-0 ' + (isOpenMobile ? 'translate-x-0' : '-translate-x-full')
        }`}
      >
        <RangoliCorner position={isRTL ? 'top-left' : 'top-right'} className="opacity-15 top-0 absolute pointer-events-none" />

        {/* Brand Header */}
        <div className="p-5 border-b border-sand bg-gradient-to-b from-rangoli-50/40 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface border border-rangoli-300 shadow-sm flex items-center justify-center p-1.5">
              <RangoliCore size={26} className="text-rangoli-600" active={true} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-bold tracking-tight text-earth-900 font-serif">
                  KINETIC
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-rangoli-100 text-rangoli-800 border border-rangoli-300/80">
                  MSME OS
                </span>
              </div>
              <p className="text-xs text-earth-600 truncate font-medium max-w-[160px]">
                {business.name}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id as ActiveTab)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-rangoli-50 text-earth-900 border-s-4 border-rangoli-500 font-semibold shadow-xs'
                    : 'text-earth-700 hover:bg-rangoli-50/60 hover:text-earth-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-rangoli-600' : item.highlight ? 'text-rangoli-500' : 'text-earth-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && item.badge > 0 ? (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-rangoli-200 text-rangoli-800'
                          : 'bg-danger text-white animate-pulse'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}

                  {isActive ? (
                    <RangoliCore size={14} className="text-rangoli-600" />
                  ) : item.highlight ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-rangoli-400 animate-ping" />
                  ) : null}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom Fast Action, Language Chip & Demo Reset */}
        <div className="p-3 border-t border-sand bg-ivory-50/80 space-y-2">
          {/* Quick Language switch trigger */}
          <button
            onClick={() => setIsLanguageModalOpen(true)}
            className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg border border-sand bg-surface text-xs text-earth-800 hover:bg-rangoli-50 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-rangoli-600" />
              <span className="font-serif font-semibold">{localeCfg.nativeName}</span>
            </div>
            <span className="text-[10px] text-earth-500 uppercase">{localeCfg.code}</span>
          </button>

          <div className="flex items-center justify-between text-xs text-earth-600 px-1 py-0.5">
            <span className="flex items-center gap-1 font-medium">
              <Store className="w-3 h-3 text-rangoli-600" /> IIIT-D PS #4
            </span>
            <button
              onClick={() => {
                resetToDemo();
                setActiveTab('dashboard');
              }}
              title="Reset sample Kirana store dataset for presentation"
              className="text-[11px] font-semibold text-rangoli-600 hover:text-rangoli-800 flex items-center gap-1 hover:underline"
            >
              <RotateCcw className="w-3 h-3" /> Reset Demo
            </button>
          </div>

          <button
            onClick={() => handleSelect('assistant')}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-rangoli-500 to-rangoli-600 text-white text-xs font-semibold shadow-sm hover:from-rangoli-600 hover:to-rangoli-700 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Speak or Type to AI</span>
          </button>
        </div>
      </aside>
    </>
  );
};
