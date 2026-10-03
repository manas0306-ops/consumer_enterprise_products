'use client';

import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileImage,
  Clipboard,
  Layers,
} from 'lucide-react';
import { useBusiness } from '@/context/BusinessContext';
import { parseBusinessIntent } from '@/lib/ai/nlpEngine';
import { AIIntentResult } from '@/types';
import { RangoliCorner, RangoliLoader } from '@/components/rangoli/RangoliMotif';

export const DocumentProcessor: React.FC = () => {
  const { products, customers, recordSale, recordTelemetry } = useBusiness();

  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedResult, setExtractedResult] = useState<AIIntentResult | null>(null);
  const [commitStatus, setCommitStatus] = useState<string | null>(null);

  // Sample handwritten slip / informal note presets commonly seen on Indian Kirana counters
  const sampleSlips = [
    {
      title: 'Informal Slip #1 (Parchi)',
      text: 'Ramesh 5 rice 600 udhar agle hafte',
    },
    {
      title: 'Informal Slip #2 (Kacha Bill)',
      text: 'Sharma ji ko 10 kg atta 420 rupaye nakad',
    },
    {
      title: 'Informal Slip #3 (Delivery Note)',
      text: 'Sunita 2 mustard oil 330 udhar',
    },
  ];

  const handleProcessSlip = (textToProcess: string) => {
    if (!textToProcess.trim()) return;

    setIsProcessing(true);
    setCommitStatus(null);

    setTimeout(() => {
      const parsed = parseBusinessIntent(textToProcess, products, customers);
      setExtractedResult(parsed);
      setIsProcessing(false);

      recordTelemetry(false, 18, 64);
    }, 600);
  };

  const handleCommitTransaction = () => {
    if (!extractedResult || !extractedResult.extractedEntities) return;

    const ent = extractedResult.extractedEntities;
    const res = recordSale({
      customerName: ent.customerName || 'Customer',
      items: [
        {
          productName: ent.productName || 'Basmati Rice Premium',
          quantity: ent.quantity || 1,
          unit: ent.unit || 'kg',
          unitPrice: Math.round((ent.amount || 500) / (ent.quantity || 1)),
        },
      ],
      totalAmount: ent.amount || 0,
      paymentStatus: ent.paymentStatus || 'credit',
      paymentDueDate: ent.expectedPaymentDate,
      notes: 'Imported from Informal Bill / Handwritten Note',
    });

    setCommitStatus(`Success: ${res.message}`);
    setExtractedResult(null);
    setRawText('');
  };

  return (
    <div className="relative space-y-6 pb-12">
      <RangoliCorner position="top-right" className="opacity-15 absolute top-0 right-0" />

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-rangoli-200/90 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold tracking-widest text-rangoli-700 bg-rangoli-100 px-2 py-0.5 rounded-full border border-rangoli-300">
            Document Intelligence
          </span>
        </div>
        <h2 className="text-xl font-bold text-earth-900 font-serif mt-1">
          Informal Bill & Parchi Scanner
        </h2>
        <p className="text-xs text-earth-600 mt-0.5">
          Converts informal shop notes, supplier slips, and handwritten kacha-bills into structured database transactions
        </p>
      </div>

      {/* Presets and Try buttons */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-earth-700 uppercase tracking-wider flex items-center gap-1.5">
          <Clipboard className="w-3.5 h-3.5 text-rangoli-500" />
          Load Sample Informal Kirana Notes:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {sampleSlips.map((slip, i) => (
            <button
              key={i}
              onClick={() => {
                setRawText(slip.text);
                handleProcessSlip(slip.text);
              }}
              className="p-3 rounded-xl border border-rangoli-200 bg-white hover:bg-rangoli-50 text-left transition-all shadow-xs hover:border-rangoli-400 group"
            >
              <div className="font-bold text-xs text-earth-900 group-hover:text-rangoli-700">
                {slip.title}
              </div>
              <div className="text-[11px] text-earth-600 italic font-mono mt-1">
                "{slip.text}"
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Input / Upload Panel */}
      <div className="bg-white p-5 rounded-2xl border border-rangoli-200/90 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-earth-700 uppercase tracking-wider mb-2">
            Paste Informal Note or Extracted Text:
          </label>
          <textarea
            rows={3}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Type or paste informal note, e.g.: 'Ramesh 5 rice 600 udhar agle hafte'..."
            className="w-full p-3 rounded-xl border border-rangoli-300 text-xs text-earth-900 font-medium placeholder:text-earth-400 focus:outline-none focus:ring-1 focus:ring-rangoli-500"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Simulated File Upload Button */}
          <div className="flex items-center gap-2">
            <label className="px-3.5 py-2 rounded-xl border border-rangoli-300 hover:bg-rangoli-50 text-earth-800 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-2">
              <FileImage className="w-4 h-4 text-rangoli-600" />
              <span>Upload Bill / Photo</span>
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    // Simulate OCR extraction from photo
                    const sampleNote = 'Ramesh 5 rice 600 udhar agle hafte';
                    setRawText(sampleNote);
                    handleProcessSlip(sampleNote);
                  }
                }}
              />
            </label>
            <span className="text-[11px] text-earth-400">Supports JPG, PNG, PDF</span>
          </div>

          <button
            onClick={() => handleProcessSlip(rawText)}
            disabled={!rawText.trim() || isProcessing}
            className="px-5 py-2 rounded-xl bg-rangoli-500 hover:bg-rangoli-600 disabled:opacity-50 text-white text-xs font-bold shadow-md hover:shadow-rangoli transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Process & Extract Entities</span>
          </button>
        </div>
      </div>

      {/* Processing Loader */}
      {isProcessing && (
        <div className="bg-white p-6 rounded-2xl border border-rangoli-200 shadow-sm flex items-center justify-center">
          <RangoliLoader size={32} label="Executing OCR & Entity Extraction Pipeline..." />
        </div>
      )}

      {/* Extracted Structured Card */}
      {extractedResult && (
        <div className="bg-white p-5 rounded-2xl border-2 border-rangoli-400 shadow-rangoli-lg space-y-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-rangoli-100 pb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <h3 className="text-base font-bold text-earth-900 font-serif">
                Extracted Structured Business Transaction
              </h3>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-success/10 text-success font-bold">
              High Confidence (96%)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-ivory-50 p-4 rounded-xl border border-rangoli-200 text-xs">
            <div>
              <span className="text-earth-500 block text-[11px]">Customer</span>
              <span className="font-bold text-sm text-earth-900">
                {extractedResult.extractedEntities.customerName || 'Customer'}
              </span>
            </div>
            <div>
              <span className="text-earth-500 block text-[11px]">Product</span>
              <span className="font-bold text-sm text-earth-900">
                {extractedResult.extractedEntities.productName}
              </span>
            </div>
            <div>
              <span className="text-earth-500 block text-[11px]">Quantity</span>
              <span className="font-bold text-sm text-earth-900">
                {extractedResult.extractedEntities.quantity} {extractedResult.extractedEntities.unit}
              </span>
            </div>
            <div>
              <span className="text-earth-500 block text-[11px]">Amount & Payment</span>
              <span className="font-bold text-base text-rangoli-700 font-serif">
                ₹{extractedResult.extractedEntities.amount} ({extractedResult.extractedEntities.paymentStatus?.toUpperCase()})
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setExtractedResult(null)}
              className="px-4 py-2 rounded-xl border border-earth-300 text-earth-700 text-xs font-semibold hover:bg-earth-50"
            >
              Discard
            </button>
            <button
              onClick={handleCommitTransaction}
              className="px-5 py-2 rounded-xl bg-success hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Write to Relational DB</span>
            </button>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {commitStatus && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
          <span>{commitStatus}</span>
        </div>
      )}
    </div>
  );
};
