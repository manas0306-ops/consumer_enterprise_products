'use client';

import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  Radio,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useBusiness } from '@/context/BusinessContext';
import { RangoliCorner, MandalaMedium } from '@/components/rangoli/RangoliMotif';

export const SyncCenterManager: React.FC = () => {
  const {
    isOnline,
    setIsOnline,
    syncQueue,
    addToSyncQueue,
    syncPendingQueue,
    clearSyncQueue,
    deviceTelemetry,
    updateDeviceTelemetry,
    t,
  } = useBusiness();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusBanner, setSyncStatusBanner] = useState<string | null>(null);

  // Toggle Simulated Connectivity
  const handleToggleConnection = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);

    updateDeviceTelemetry({
      status: nextState ? 'online' : 'buffering',
      wifiStatus: nextState ? 'connected' : 'disconnected',
      cellularStatus: nextState ? 'standby' : 'active',
    });

    if (nextState) {
      setSyncStatusBanner('Connection restored. Ready to synchronize buffered records.');
    } else {
      setSyncStatusBanner('Offline simulation active: New transactions will be preserved in local persistent storage.');
    }
  };

  // Trigger demo transaction buffering
  const handleBufferDemoTransaction = () => {
    const demoItems = [
      { name: 'Ramesh Verma', item: 'Basmati Rice 5kg', amount: 600 },
      { name: 'Amit Kumar', item: 'Mustard Oil 2L', amount: 330 },
      { name: 'Suresh Kirana', item: 'Refined Sugar 10kg', amount: 460 },
    ];
    const picked = demoItems[Math.floor(Math.random() * demoItems.length)];

    addToSyncQueue({
      type: 'sale',
      payload: {
        customerName: picked.name,
        items: [{ productName: picked.item, quantity: 1, unitPrice: picked.amount, unit: 'packet' }],
        totalAmount: picked.amount,
        paymentStatus: 'credit',
        notes: 'Offline Buffer Entry',
      },
      summary: `${picked.name} → ${picked.item}`,
      amount: picked.amount,
      partyName: picked.name,
    });
  };

  // Perform Synchronization
  const handleSynchronize = async () => {
    if (syncQueue.length === 0) return;
    setIsSyncing(true);
    setSyncStatusBanner('Synchronizing with KINETIC Cloud Platform...');

    // Smooth deterministic sync animation
    await new Promise((r) => setTimeout(r, 1200));

    const count = syncQueue.length;
    await syncPendingQueue();
    setIsSyncing(false);
    setSyncStatusBanner(`${count} transaction(s) synchronized successfully ✓`);
  };

  return (
    <div className="relative space-y-6 pb-12 max-w-5xl mx-auto">
      <MandalaMedium
        size={360}
        opacity={0.06}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      />
      <RangoliCorner position="top-right" className="opacity-15 absolute top-0 right-0" />

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-rangoli-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold tracking-widest uppercase bg-rangoli-100 text-rangoli-800 px-2.5 py-0.5 rounded-full border border-rangoli-200 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-rangoli-600" />
              Connectivity Resilience
            </span>
            <span className="text-xs text-earth-500 font-mono">
              ESP32 Buffer → Local Flash → Auto-Sync
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-earth-900 tracking-tight">
            Sync Center & Offline Resilience
          </h1>
          <p className="text-xs sm:text-sm text-earth-600 mt-1 max-w-2xl">
            "We don't treat poor connectivity as a failure state. KINETIC treats it as a temporary state — the transaction is preserved locally and synchronized when connectivity returns."
          </p>
        </div>

        {/* Simulation Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleToggleConnection}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs ${
              isOnline
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isOnline ? (
              <>
                <WifiOff className="w-4 h-4 text-amber-700" />
                <span>Simulate Offline Drop</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4" />
                <span>Restore Connectivity</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Connectivity Health Indicators (Section 19) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Wi-Fi Status */}
        <div className="bg-white p-5 rounded-2xl border border-rangoli-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-earth-600">Wi-Fi (802.11 b/g/n)</span>
            <Wifi className={`w-4 h-4 ${isOnline ? 'text-emerald-600' : 'text-red-500'}`} />
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                }`}
              />
              <span className="text-base font-bold text-earth-900 font-serif">
                {isOnline ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <span className="text-[11px] text-earth-500 block mt-0.5">
              {isOnline ? 'Primary Gateway: -58 dBm' : 'Gateway unreachable'}
            </span>
          </div>
        </div>

        {/* Cellular Module */}
        <div className="bg-white p-5 rounded-2xl border border-rangoli-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-earth-600">Cellular (LTE-M / GSM)</span>
            <Radio className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  !isOnline ? 'bg-blue-500 animate-pulse' : 'bg-earth-300'
                }`}
              />
              <span className="text-base font-bold text-earth-900 font-serif">
                {!isOnline ? 'Active (Fallback)' : 'Standby'}
              </span>
            </div>
            <span className="text-[11px] text-earth-500 block mt-0.5">
              SIM 1: Jio 4G (Roaming Ready)
            </span>
          </div>
        </div>

        {/* Local Storage Buffer */}
        <div className="bg-white p-5 rounded-2xl border border-rangoli-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-earth-600">Local Flash / MicroSD</span>
            <HardDrive className="w-4 h-4 text-rangoli-600" />
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-base font-bold text-earth-900 font-serif">
                Ready
              </span>
            </div>
            <span className="text-[11px] text-earth-500 block mt-0.5">
              16 MB SPI Flash + MicroSD Slot
            </span>
          </div>
        </div>

        {/* Pending Sync Count */}
        <div className="bg-white p-5 rounded-2xl border border-rangoli-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-earth-600">Pending Sync Queue</span>
            <Clock className={`w-4 h-4 ${syncQueue.length > 0 ? 'text-amber-600' : 'text-earth-400'}`} />
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-serif text-rangoli-700">
                {syncQueue.length}
              </span>
              <span className="text-xs text-earth-500">items</span>
            </div>
            <span className="text-[11px] text-earth-500 block mt-0.5">
              {syncQueue.length === 0 ? 'Fully in sync' : 'Stored in offline buffer'}
            </span>
          </div>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncStatusBanner && (
        <div className="p-4 rounded-2xl bg-rangoli-50 border border-rangoli-200 text-xs text-rangoli-900 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rangoli-600" />
            <span>{syncStatusBanner}</span>
          </div>
          <button
            onClick={() => setSyncStatusBanner(null)}
            className="text-rangoli-700 font-bold hover:underline"
          >
            ✕
          </button>
        </div>
      )}

      {/* Architecture Concept Callout (Section 18) */}
      <div className="bg-ivory-50 rounded-3xl border border-rangoli-200/80 p-5 text-xs text-earth-800 space-y-2">
        <div className="font-bold uppercase tracking-wider text-rangoli-800 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-rangoli-600" />
          KINETIC Smart Business Voice Terminal Architecture
        </div>
        <p className="text-earth-600">
          The physical voice terminal buffers audio waveforms and structured transactions onto onboard non-volatile SPI Flash storage when internet connectivity is spotty. Once either Wi-Fi or cellular connectivity reconnects, transactions are synchronized with the central cloud database without data loss.
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-mono font-bold text-earth-700">
          <span className="bg-white px-2.5 py-1 rounded-lg border border-rangoli-200">ESP32-S3 Controller</span>
          <span>→</span>
          <span className="bg-white px-2.5 py-1 rounded-lg border border-rangoli-200">Local Flash Buffer</span>
          <span>→</span>
          <span className="bg-white px-2.5 py-1 rounded-lg border border-rangoli-200">Wi-Fi / Cellular Auto-Switch</span>
          <span>→</span>
          <span className="bg-white px-2.5 py-1 rounded-lg border border-rangoli-200">KINETIC AI Validation</span>
          <span>→</span>
          <span className="bg-white px-2.5 py-1 rounded-lg border border-rangoli-200">Live Dashboard</span>
        </div>
      </div>

      {/* Pending Sync Queue Card */}
      <div className="bg-white rounded-3xl border border-rangoli-200/90 shadow-sm p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rangoli-100">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-serif text-earth-900">
              Offline Buffered Transactions
            </h2>
            <p className="text-xs text-earth-600 mt-0.5">
              {syncQueue.length === 0
                ? 'All transactions are currently synchronized with the cloud database.'
                : `${syncQueue.length} transaction(s) safely preserved in local storage waiting for synchronization.`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBufferDemoTransaction}
              className="px-3.5 py-2 rounded-xl border border-rangoli-200 bg-ivory-50 hover:bg-rangoli-50 text-xs font-semibold text-earth-800 transition-all"
            >
              + Buffer Test Transaction
            </button>

            <button
              onClick={handleSynchronize}
              disabled={syncQueue.length === 0 || isSyncing}
              className="px-5 py-2 rounded-xl bg-rangoli-600 hover:bg-rangoli-700 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-rangoli"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing...' : 'Synchronize Now'}</span>
            </button>
          </div>
        </div>

        {/* Queue Items List */}
        {syncQueue.length === 0 ? (
          <div className="py-12 text-center text-earth-500 text-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <div className="font-bold text-earth-800 text-sm">
              All transactions are synchronized ✓
            </div>
            <p className="text-earth-500 mt-1 max-w-sm mx-auto">
              No pending transactions in local storage buffer. Use the voice terminal or click "+ Buffer Test Transaction" to simulate offline storage.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-rangoli-100 mt-4">
            {syncQueue.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="font-bold text-earth-900 flex items-center gap-2">
                    <span>{item.summary}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                      Buffered Locally
                    </span>
                  </div>
                  <div className="text-[11px] text-earth-500 flex items-center gap-3 mt-1 font-mono">
                    <span>Customer: {item.partyName}</span>
                    <span>•</span>
                    <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-base font-bold font-serif text-rangoli-700">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="block text-[10px] text-earth-500">
                      Waiting for sync...
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
