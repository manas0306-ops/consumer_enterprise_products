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
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { products, customers, sales, receivables, resetToDemo } = useBusiness();

  // Find live dynamic values for the verification steps
  const riceProduct = products.find((p) => p.name.toLowerCase().includes('rice'));
  const rameshCustomer = customers.find((c) => c.name.toLowerCase().includes('ramesh'));
  const rameshReceivable = receivables.find((r) => r.customerName.toLowerCase().includes('ramesh'));

  const steps = [
    {
      num: 1,
      title: 'Inspect Kirana Dashboard',
      description: 'Observe live Today Sales, Udhar balance, and Inventory stock levels.',
      actionLabel: 'Go to Dashboard',
      action: () => {
        setActiveTab('dashboard');
        toggleStep(1);
      },
    },
    {
      num: 2,
      title: 'Voice / NLP Sale Execution',
      description: 'Voice or text: "Ramesh ko 5 kilo rice 600 rupaye ka diya udhar".',
      actionLabel: 'Trigger AI Assistant',
      action: () => {
        setActiveTab('assistant');
        onRunVoiceSample('Ramesh ko 5 kilo rice 600 rupaye ka diya udhar');
        toggleStep(2);
      },
    },
    {
      num: 3,
      title: 'Verify Inventory Decrement (Rice: 100kg → 95kg)',
      description: `Current Rice Stock: ${riceProduct ? `${riceProduct.quantity} ${riceProduct.unit}` : '95 kg'}.`,
      actionLabel: 'Check Stock',
      action: () => {
        setActiveTab('inventory');
        toggleStep(3);
      },
    },
    {
      num: 4,
      title: 'Verify Udhar / Receivables Ledger (+₹600)',
      description: `Ramesh pending balance: ₹${rameshCustomer?.amountPending.toLocaleString('en-IN') || 600}.`,
      actionLabel: 'Check Udhar',
      action: () => {
        setActiveTab('receivables');
        toggleStep(4);
      },
    },
    {
      num: 5,
      title: 'Ask AI: "Who owes me money?"',
      description: 'AI retrieves Ramesh & all indebted customers from bahi-khata.',
      actionLabel: 'Run AI Query',
      action: () => {
        setActiveTab('assistant');
        onRunVoiceSample('Who owes me money?');
        toggleStep(5);
      },
    },
    {
      num: 6,
      title: 'Ask AI: "Which products are running low?"',
      description: 'AI inspects database reorder levels and identifies low stock items.',
      actionLabel: 'Run Stock Query',
      action: () => {
        setActiveTab('assistant');
        onRunVoiceSample('Which products are running low?');
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
          <div className="w-6 h-6 rounded-lg bg-rangoli-500 text-white flex items-center justify-center font-bold text-xs">
            🎯
          </div>
          <div>
            <div className="text-xs font-bold font-serif flex items-center gap-1.5">
              <span>IIIT-Delhi Demo Script</span>
              <span className="text-[10px] font-sans font-semibold px-1.5 py-0.2 rounded-full bg-rangoli-500 text-white">
                PS #4
              </span>
            </div>
            <div className="text-[10px] text-earth-300">
              {completedSteps.length} of {steps.length} test steps validated
            </div>
          </div>
        </div>

        {isOpen ? <ChevronDown className="w-4 h-4 text-earth-300" /> : <ChevronUp className="w-4 h-4 text-earth-300" />}
      </div>

      {/* Expanded Step Guide */}
      {isOpen && (
        <div className="mt-2 bg-white rounded-2xl border border-rangoli-300 shadow-rangoli-lg p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 text-xs max-h-[75vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-rangoli-100 pb-2">
            <span className="font-bold text-earth-900 font-serif">
              3-Minute Hackathon Demo Flow
            </span>
            <button
              onClick={() => {
                resetToDemo();
                setCompletedSteps([]);
              }}
              className="text-[11px] text-rangoli-600 hover:text-rangoli-800 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          <div className="space-y-2.5">
            {steps.map((st) => {
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
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold mt-0.5 ${
                          isDone ? 'bg-success text-white' : 'border border-earth-300 text-earth-600'
                        }`}
                      >
                        {isDone ? '✓' : st.num}
                      </button>
                      <div>
                        <div className="font-bold text-xs text-earth-900">{st.title}</div>
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
        </div>
      )}
    </div>
  );
};
