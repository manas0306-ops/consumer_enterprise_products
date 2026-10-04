'use client';

import React, { useState } from 'react';
import {
  Cpu,
  Mic,
  Volume2,
  Tv,
  Wifi,
  Radio,
  HardDrive,
  BatteryCharging,
  ShieldAlert,
  Sparkles,
  Terminal,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCw,
} from 'lucide-react';
import { useBusiness } from '@/context/BusinessContext';
import { RangoliCorner, MandalaMedium } from '@/components/rangoli/RangoliMotif';

export const DeviceManager: React.FC = () => {
  const {
    deviceTelemetry,
    updateDeviceTelemetry,
    isOnline,
    syncQueue,
  } = useBusiness();

  const [serialLogs, setSerialLogs] = useState<string[]>([
    '[ESP32-S3-INIT] Bootloader v4.4-dev initialized',
    '[WIFI] Connected to SSID: Sharma_Kirana_5G (IP: 192.168.1.144)',
    '[AUDIO-I2S] MEMS Microphone sampling rate set to 16000Hz PCM',
    '[STORAGE] MicroSD SPI Flash mounted successfully (Capacity: 16MB SPI + 32GB SD)',
    '[CELLULAR] Quectel EC200U LTE Cat-1 modem standby initialized',
    '[CLOUD-SYNC] KINETIC Heartbeat ping acknowledged (RTT: 28ms)',
    '[SYSTEM] Voice Terminal #001 ready for conversational business input',
  ]);

  const handlePing = () => {
    const timestamp = new Date().toLocaleTimeString();
    setSerialLogs((prev) => [
      ...prev,
      `[PING @ ${timestamp}] Keepalive signal sent → Host acknowledged (RSSI: ${deviceTelemetry.rssi} dBm)`,
    ]);
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
            <span className="text-[11px] font-bold tracking-widest uppercase bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-amber-700" />
              Hardware Specification & Telemetry
            </span>
            <span className="text-xs bg-earth-100 text-earth-700 font-mono px-2 py-0.5 rounded-md font-bold">
              PROTOTYPE SIMULATION
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-earth-900 tracking-tight">
            KINETIC Smart Voice Terminal
          </h1>
          <p className="text-xs sm:text-sm text-earth-600 mt-1 max-w-2xl">
            Physical counter-top appliance designed for Indian kirana counters: tactile speech trigger, local audio buffering, and dual-mode Wi-Fi/LTE synchronization.
          </p>
        </div>

        {/* Device Status Badge */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-ivory-50 border border-rangoli-200 self-start md:self-auto">
          <div
            className={`w-3 h-3 rounded-full ${
              isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <div>
            <div className="text-xs font-bold text-earth-900">
              Terminal #001 {isOnline ? 'Online' : 'Buffering Mode'}
            </div>
            <div className="text-[10px] text-earth-500 font-mono">
              Model: ESP32-S3 Pro
            </div>
          </div>
        </div>
      </div>

      {/* Responsible Transparency Disclaimer (Section 20 & 34) */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong>Hardware Status Transparency:</strong> This panel monitors the architectural specifications and protocol telemetry for the KINETIC physical terminal prototype. Connectivity, audio sub-systems, and buffering states are simulated in this hackathon environment to demonstrate end-to-end hardware-software integration.
        </div>
      </div>

      {/* Visual Terminal Hardware Blueprint Card */}
      <div className="bg-gradient-to-br from-earth-900 to-earth-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Schematic Graphic representation */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-earth-950/60 rounded-2xl border border-white/10">
            {/* Terminal Body */}
            <div className="w-48 h-56 rounded-3xl bg-neutral-900 border-2 border-rangoli-500/40 p-4 shadow-2xl flex flex-col justify-between items-center relative">
              {/* Top Speaker Grille */}
              <div className="w-full flex justify-center gap-1.5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
                ))}
              </div>

              {/* OLED Mini Display */}
              <div className="w-full bg-neutral-950 rounded-xl border border-neutral-700 p-2.5 text-center font-mono">
                <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                  KINETIC OS • READY
                </div>
                <div className="text-[12px] text-white font-bold font-serif mt-1">
                  ₹{syncQueue.length > 0 ? `SYNC: ${syncQueue.length}` : 'ONLINE'}
                </div>
              </div>

              {/* Push Button with Indian Mandala Accent */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-rangoli-600 border-2 border-white/40 flex items-center justify-center shadow-lg transform active:scale-95 cursor-pointer">
                  <Mic className="w-7 h-7 text-white" />
                </div>
              </div>

              {/* Status LED */}
              <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ESP32-S3 Dual-Core</span>
              </div>
            </div>
          </div>

          {/* Core Hardware Components Grid */}
          <div className="md:col-span-7 space-y-4">
            <h3 className="text-lg font-bold font-serif text-rangoli-200">
              Voice Terminal #001 Specifications
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-rangoli-300 font-semibold mb-1">
                  <Mic className="w-4 h-4" /> Microphone
                </div>
                <div className="font-bold">I2S Digital MEMS</div>
                <div className="text-[11px] text-white/60">Noise canceling array</div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-rangoli-300 font-semibold mb-1">
                  <Volume2 className="w-4 h-4" /> Audio Speaker
                </div>
                <div className="font-bold">3W Class-D Speaker</div>
                <div className="text-[11px] text-white/60">Voice feedback ready</div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-rangoli-300 font-semibold mb-1">
                  <Tv className="w-4 h-4" /> Counter Display
                </div>
                <div className="font-bold">2.8" SPI TFT Color</div>
                <div className="text-[11px] text-white/60">Dual customer verification</div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-rangoli-300 font-semibold mb-1">
                  <HardDrive className="w-4 h-4" /> Local Storage
                </div>
                <div className="font-bold">16MB SPI Flash + SD</div>
                <div className="text-[11px] text-white/60">Offline transaction buffer</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Component Telemetry Status Cards (Section 20) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-rangoli-200 shadow-sm">
          <span className="text-earth-500 font-medium block">Microphone</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-earth-900 text-sm">Ready</span>
          </div>
          <span className="text-[11px] text-earth-500 block mt-0.5">INMP441 I2S Bus</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rangoli-200 shadow-sm">
          <span className="text-earth-500 font-medium block">Speaker Feedback</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-earth-900 text-sm">Ready</span>
          </div>
          <span className="text-[11px] text-earth-500 block mt-0.5">MAX98357A I2S Amp</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rangoli-200 shadow-sm">
          <span className="text-earth-500 font-medium block">TFT Display</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-earth-900 text-sm">Active</span>
          </div>
          <span className="text-[11px] text-earth-500 block mt-0.5">ST7789 240x320</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rangoli-200 shadow-sm">
          <span className="text-earth-500 font-medium block">Power / Battery</span>
          <div className="flex items-center gap-2 mt-1">
            <BatteryCharging className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-earth-900 text-sm">{deviceTelemetry.batteryPct}%</span>
          </div>
          <span className="text-[11px] text-earth-500 block mt-0.5">USB-C 5V 2A Main</span>
        </div>
      </div>

      {/* Serial Diagnostic Stream Console */}
      <div className="bg-neutral-900 text-neutral-200 rounded-3xl p-6 border border-neutral-800 shadow-sm font-mono text-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-neutral-400">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Terminal Serial Monitor (115200 Baud)</span>
          </div>
          <button
            onClick={handlePing}
            className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-bold flex items-center gap-1.5 transition-all"
          >
            <RotateCw className="w-3 h-3" />
            Send Ping
          </button>
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto text-[11px] text-emerald-400/90 leading-relaxed">
          {serialLogs.map((log, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-neutral-500 select-none">&gt;</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
