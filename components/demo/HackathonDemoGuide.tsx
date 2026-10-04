'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  Mic,
  HelpCircle,
  Truck,
  IndianRupee,
  Layers,
  Cpu,
} from 'lucide-react';
import { useBusiness } from '@/context/BusinessContext';
import { ActiveTab } from '../layout/Sidebar';

interface HackathonDemoGuideProps {
  setActiveTab: (tab: ActiveTab) => void;
  onRunVoiceSample: (sampleText: string) => void;
}

export const HackathonDemoGuide: React.FC<HackathonDemoGuideProps> = ({
  setActiveTab,
  onRunVoiceSample,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<'FLOW' | 'PRESETS'>('FLOW');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { products, customers, sales, receivables, resetToDemo, t } = useBusiness();

  // Presets from Section 23
  const presets = [
    {
      id: 'p1',
      title: 'Standard Credit Sale',
      text: 'Ramesh ko 5 kilo chawal ₹600 mein udhaar diya.',
      type: 'Sale',
      description: 'Creates sale, updates rice stock, creates ₹600 receivable.',
      badge: 'Hero Demo',
    },
    {
      id: 'p2',
      title: 'Uncertainty / Ambiguity Case',
      text: 'Ramesh ko chawal diya.',
      type: 'Ambiguity',
      description: 'Triggers clarification question: "Which quantity should I record?".',
      badge: 'Uncertainty State',
    },
    {
      id: 'p3',
      title: 'Restock Procurement Scenario',
      text: '50 kilo cheeni khareedi ₹2,000 cash.',
      type: 'Purchase',
      description: 'Records supplier purchase and increments sugar stock.',
      badge: 'Inventory Restock',
    },
    {
      id: 'p4',
      title: 'Payment Collection / Jama',
      text: 'Suresh ne ₹1,000 cash jama kiya.',
      type: 'Payment',
      description: 'Records customer debt clearance and logs settlement.',
      badge: 'Khata Settlement',
    },
  ];

  // 60-Second Judge Demo Flow from Section 35
  const flowSteps = [
    {
      num: 1,
      time: '00:00 - 00:10',
      title: 'Business Pulse Dashboard',
      description: 'Inspect live sales, real receivables, stock health, and event activity.',
      actionLabel: 'Go to Dashboard',
      action: () => {
        setActiveTab('dashboard');
        toggleStep(1);
      },
    },
    {
      num: 2,
      time: '00:10 - 00:25',
      title: 'Voice Transaction Hero',
      description: 'Speak in Hindi/Punjabi/English: "Ramesh ko 5 kilo chawal ₹600 mein udhaar diya."',
      actionLabel: 'Open Voice Center',
      action: () => {
        onRunVoiceSample('Ramesh ko 5 kilo chawal ₹600 mein udhaar diya.');
        toggleStep(2);
      },
    },
    {
      num: 3,
      time: '00:25 - 00:35',
      title: 'Verification Screen',
      description: 'Review structured customer, product, quantity, amount, and credit terms before confirming.',
      actionLabel: 'Verify Review',
      action: () => {
        setActiveTab('voice');
        toggleStep(3);
      },
    },
    {
      num: 4,
      time: '00:35 - 00:45',
      title: 'Cascade Execution & Khata',
      description: 'Verify instant updates to Inventory (-5kg), Receivables (+₹600), and Customer profile.',
      actionLabel: 'Check Customers & Khata',
      action: () => {
        setActiveTab('customers');
        toggleStep(4);
      },
    },
    {
      num: 5,
      time: '00:45 - 00:55',
      title: 'Ask KINETIC Intelligence',
      description: 'Structured answers to "Who still owes me money?" with WhatsApp reminder triggers.',
      actionLabel: 'Ask KINETIC',
      action: () => {
        setActiveTab('ask');
        toggleStep(5);
      },
    },
    {
      num: 6,
      time: '00:55 - 01:05',
      title: 'Sync Center & Hardware Terminal',
      description: 'Demonstrate offline LocalStorage queue and KINETIC ESP32-S3 terminal concept.',
      actionLabel: 'Open Sync Center',
      action: () => {
        setActiveTab('sync');
        toggleStep(6);
      },
    },
  ];

  const toggleStep = (num: number) => {
    setCompletedSteps((prev) =>
      prev.includes(num) ? prev.filter((s) => s !== num) : [...prev, num]
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm w-full select-none">
      {/* Collapsed Bar / Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="bg-earth-900 hover:bg-earth-800 text-white p-3 rounded-2xl shadow-rangoli-lg border border-rangoli-400 cursor-pointer flex items-center justify-between transition-all"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-rangoli-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            🎯
          </div>
          <div>
            <div className="text-xs font-bold font-serif flex items-center gap-1.5">
              <span>KINETIC Demo Mode</span>
              <span className="text-[9px] font-sans font-bold px-1.5 py-0.2 rounded-full bg-rangoli-500 text-white">
                60s Flow
              </span>
            </div>
            <div className="text-[10px] text-earth-300">
              {completedSteps.length} of {flowSteps.length} demo stages validated
            </div>
          </div>
        </div>

        {isOpen ? <ChevronDown className="w-4 h-4 text-earth-300" /> : <ChevronUp className="w-4 h-4 text-earth-300" />}
      </div>

      {/* Expanded Demo Modal */}
      {isOpen && (
        <div className="mt-2 bg-white rounded-2xl border border-rangoli-300 shadow-rangoli-lg p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 text-xs max-h-[80vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-rangoli-100 pb-2.5">
            <div>
              <span className="font-bold text-earth-900 font-serif block">
                Hackathon Presentation Mode
              </span>
              <span className="text-[10px] text-earth-500">
                Core Loop: SPEAK → VERIFY → ACT → INSIGHT
              </span>
            </div>
            <button
              onClick={() => {
                resetToDemo();
                setCompletedSteps([]);
              }}
              className="text-[11px] text-rangoli-600 hover:text-rangoli-800 font-semibold flex items-center gap-1 px-2 py-1 rounded-lg bg-rangoli-50"
              title="Reset all data to clean initial state"
            >
              <RotateCcw className="w-3 h-3" /> Reset Demo
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-ivory-100 p-1 text-[11px] font-bold">
            <button
              onClick={() => setActiveMode('FLOW')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeMode === 'FLOW'
                  ? 'bg-white text-earth-900 shadow-2xs'
                  : 'text-earth-600 hover:text-earth-900'
              }`}
            >
              60s Judge Flow
            </button>
            <button
              onClick={() => setActiveMode('PRESETS')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeMode === 'PRESETS'
                  ? 'bg-white text-earth-900 shadow-2xs'
                  : 'text-earth-600 hover:text-earth-900'
              }`}
            >
              Demo Presets (Sec 23)
            </button>
          </div>

          {/* Mode 1: 60-Second Judge Flow */}
          {activeMode === 'FLOW' && (
            <div className="space-y-2">
              {flowSteps.map((st) => {
                const isDone = completedSteps.includes(st.num);
                return (
                  <div
                    key={st.num}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isDone
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                        : 'bg-ivory-50/80 border-rangoli-200 text-earth-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => toggleStep(st.num)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold mt-0.5 shrink-0 ${
                            isDone ? 'bg-success text-white' : 'border border-earth-300 text-earth-600'
                          }`}
                        >
                          {isDone ? '✓' : st.num}
                        </button>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-earth-900">{st.title}</span>
                            <span className="font-mono text-[9px] text-earth-400">{st.time}</span>
                          </div>
                          <div className="text-[11px] text-earth-600 mt-0.5 leading-snug">
                            {st.description}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-earth-100/60 flex justify-end">
                      <button
                        onClick={st.action}
                        className="px-2.5 py-1 rounded-lg bg-rangoli-500 hover:bg-rangoli-600 text-white text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-all active:scale-95"
                      >
                        <PlayCircle className="w-3 h-3" />
                        <span>{st.actionLabel}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mode 2: Presets (Section 23) */}
          {activeMode === 'PRESETS' && (
            <div className="space-y-2">
              {presets.map((pr) => (
                <div
                  key={pr.id}
                  className="p-3 rounded-xl bg-ivory-50/80 border border-rangoli-200 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-earth-900">{pr.title}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rangoli-100 text-rangoli-800 border border-rangoli-200">
                      {pr.badge}
                    </span>
                  </div>

                  <p className="text-[11px] font-serif italic text-rangoli-900 bg-white/80 p-2 rounded-lg border border-rangoli-100">
                    "{pr.text}"
                  </p>

                  <p className="text-[10px] text-earth-500">
                    {pr.description}
                  </p>

                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => {
                        onRunVoiceSample(pr.text);
                      }}
                      className="px-3 py-1 rounded-lg bg-rangoli-500 hover:bg-rangoli-600 text-white text-[11px] font-bold shadow-2xs flex items-center gap-1.5 transition-all"
                    >
                      <Mic className="w-3 h-3" />
                      <span>Run Preset</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
