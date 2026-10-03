'use client';

import React from 'react';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Package,
  Wallet,
  CheckCircle2,
  X,
  ArrowRight,
} from 'lucide-react';
import { useBusiness } from '@/context/BusinessContext';
import { RangoliCorner } from '@/components/rangoli/RangoliMotif';

export const AlertsManager: React.FC<{ onNavigateTo?: (tab: string) => void }> = ({
  onNavigateTo,
}) => {
  const { alerts, dismissAlert, t } = useBusiness();

  const activeAlerts = alerts.filter((a) => !a.dismissed);

  const getAlertTitle = (a: typeof alerts[0]) => {
    if (a.type === 'out_of_stock') return t('alerts', 'stockDepleted', 'Stock Depleted');
    if (a.type === 'low_stock') return t('alerts', 'lowStockThreshold', 'Low Stock Threshold Reached');
    if (a.type === 'overdue_payment') return t('alerts', 'overduePayment', 'Overdue Udhar Payment');
    if (a.type === 'credit_threshold') return t('alerts', 'creditLimitExceeded', 'Credit Limit Exceeded');
    return a.title;
  };

  const getAlertMessage = (a: typeof alerts[0]) => {
    if (a.type === 'out_of_stock') {
      return `${a.actionableEntity?.name || ''} ${t('alerts', 'outOfStockMsg', 'is completely OUT OF STOCK (0 units). Customers cannot purchase.')}`;
    }
    if (a.type === 'low_stock') {
      return `${a.actionableEntity?.name || ''} ${t('alerts', 'lowStockMsg', 'has reached critical reorder threshold. Replenish immediately.')}`;
    }
    if (a.type === 'overdue_payment') {
      return `${a.actionableEntity?.name || ''} ${t('alerts', 'overduePaymentMsg', 'has an overdue balance exceeding payment terms.')}`;
    }
    if (a.type === 'credit_threshold') {
      return `${a.actionableEntity?.name || ''} ${t('alerts', 'creditLimitMsg', 'has exceeded the maximum allowable credit ceiling.')}`;
    }
    return a.message;
  };

  const getAlertTypeLabel = (type: string) => {
    if (type === 'out_of_stock') return t('common', 'outOfStock', 'Out of Stock');
    if (type === 'low_stock') return t('common', 'lowStock', 'Low Stock');
    if (type === 'overdue_payment') return t('common', 'overdue', 'Overdue');
    if (type === 'credit_threshold') return t('customers', 'creditLimit', 'Credit Limit');
    return type.replace('_', ' ');
  };

  return (
    <div className="relative space-y-6 pb-12">
      <RangoliCorner position="top-right" className="opacity-15 absolute top-0 right-0" />

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-rangoli-200/90 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-earth-900 font-serif">
            {t('alerts', 'title', 'Live Actionable System Alerts')}
          </h2>
          <p className="text-xs text-earth-600">
            {t('alerts', 'subtitle', 'Real-time trigger alerts generated from database thresholds (stock depletion, overdue credit, high debt risk)')}
          </p>
        </div>

        <span className="text-xs px-3 py-1 rounded-full font-bold bg-danger/10 text-danger border border-danger/20">
          {activeAlerts.length} {t('alerts', 'activeAlerts', 'Active Alerts')}
        </span>
      </div>

      {/* Alerts List */}
      {activeAlerts.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-rangoli-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-success/10 text-success mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-earth-900 font-serif">
            {t('alerts', 'allClear', 'All Clear! No Critical Alerts')}
          </h3>
          <p className="text-xs text-earth-500 max-w-sm mx-auto">
            {t('alerts', 'allClearSub', 'Your stock levels are above reorder thresholds, and all active receivables are within agreed terms.')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeAlerts.map((alert) => {
            const isDanger = alert.severity === 'danger';
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDanger
                    ? 'bg-rose-50/60 border-rose-300 text-rose-950'
                    : 'bg-amber-50/60 border-amber-300 text-amber-950'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isDanger ? 'bg-danger text-white' : 'bg-warning text-white'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm font-serif">{getAlertTitle(alert)}</h4>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/80 border border-current">
                        {getAlertTypeLabel(alert.type)}
                      </span>
                    </div>
                    <p className="text-xs mt-1 text-earth-700 leading-relaxed">
                      {getAlertMessage(alert)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {alert.actionType === 'reorder' && onNavigateTo && (
                    <button
                      onClick={() => onNavigateTo('purchases')}
                      className="px-3 py-1.5 rounded-xl bg-rangoli-500 hover:bg-rangoli-600 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      {t('purchases', 'recordNewPurchase', 'Record Purchase')}
                    </button>
                  )}

                  {alert.actionType === 'collect_payment' && onNavigateTo && (
                    <button
                      onClick={() => onNavigateTo('receivables')}
                      className="px-3 py-1.5 rounded-xl bg-earth-900 hover:bg-earth-800 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      {t('receivables', 'settlePayment', 'Collect Payment')}
                    </button>
                  )}

                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="p-1.5 rounded-xl text-earth-400 hover:text-earth-700 hover:bg-black/5 transition-colors"
                    title={t('alerts', 'dismiss', 'Dismiss alert')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
