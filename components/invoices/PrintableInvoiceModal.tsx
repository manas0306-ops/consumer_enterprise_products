'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X, FileText } from 'lucide-react';
import { Sale, Business } from '@/types';

interface PrintableInvoiceModalProps {
  invoice: Sale | null;
  business: Business;
  onClose: () => void;
}

export const PrintableInvoiceModal: React.FC<PrintableInvoiceModalProps> = ({
  invoice,
  business,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.classList.add('has-printable-invoice');

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('has-printable-invoice');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const isCredit = invoice.paymentStatus === 'credit';

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] printable-modal-overlay bg-earth-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal Container / Print Bill Sheet */}
      <div className="print-bill-sheet relative bg-white rounded-2xl border-2 border-rangoli-400 shadow-rangoli-lg max-w-2xl w-full p-6 sm:p-8 overflow-hidden font-sans text-earth-900 my-auto animate-in fade-in zoom-in-95">
        
        {/* =========================================================================
            TRANSLUCENT RANGOLI MANDALA BACKGROUND WATERMARK (SPECIFICATION & USER REQUEST)
            Always visible in screen and forced in print/PDF via print-color-adjust
           ========================================================================= */}
        <div
          className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden z-0 print-rangoli-watermark"
          style={{ opacity: 0.16 }}
        >
          {/* Central Radial Rangoli Mandala Watermark */}
          <svg
            viewBox="0 0 500 500"
            className="w-[440px] h-[440px] text-rangoli-500 transform rotate-12"
            style={{ color: '#C88A24' }}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Concentric Decorative Rings */}
            <circle cx="250" cy="250" r="230" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="250" cy="250" r="220" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="250" cy="250" r="190" stroke="currentColor" strokeWidth="2" />
            <circle cx="250" cy="250" r="140" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 3" />
            <circle cx="250" cy="250" r="90" stroke="currentColor" strokeWidth="2" />
            <circle cx="250" cy="250" r="45" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="250" cy="250" r="18" fill="currentColor" fillOpacity="0.4" />

            {/* Central 8-petal Lotus Core */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <g key={`core-${i}`} transform={`rotate(${angle} 250 250)`}>
                <path
                  d="M250 205 C265 220 265 235 250 250 C235 235 235 220 250 205 Z"
                  fill="currentColor"
                  fillOpacity="0.3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle cx="250" cy="195" r="4" fill="currentColor" />
              </g>
            ))}

            {/* 16 Middle Kalash / Petal Arches */}
            {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((angle, i) => (
              <g key={`mid-${i}`} transform={`rotate(${angle} 250 250)`}>
                <path
                  d="M250 140 C270 160 280 180 250 205 C220 180 230 160 250 140 Z"
                  fill="currentColor"
                  fillOpacity="0.15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path d="M250 145 L250 185" stroke="currentColor" strokeWidth="1" />
              </g>
            ))}

            {/* 12 Outer Intricate Peacock Fan Petals */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
              <g key={`outer-${i}`} transform={`rotate(${angle} 250 250)`}>
                <path
                  d="M250 40 C290 80 300 130 250 170 C200 130 210 80 250 40 Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="currentColor"
                  fillOpacity="0.1"
                />
                {/* Fine Symmetrical Inner Rays */}
                <path d="M250 50 L250 120" stroke="currentColor" strokeWidth="1.2" />
                <path d="M240 60 L248 115" stroke="currentColor" strokeWidth="0.8" />
                <path d="M260 60 L252 115" stroke="currentColor" strokeWidth="0.8" />
                <circle cx="250" cy="30" r="5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.3" />
              </g>
            ))}
          </svg>

          {/* 4 Decorative Corner Rangoli Motifs */}
          <div className="absolute top-2 left-2 w-16 h-16 text-rangoli-500 opacity-25">
            <svg viewBox="0 0 100 100" fill="none">
              <path d="M0 0 C30 5, 50 15, 60 40 C70 60, 80 80, 100 100" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" />
              <circle cx="25" cy="25" r="15" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="25" cy="25" r="6" fill="currentColor" />
            </svg>
          </div>
          <div className="absolute top-2 right-2 w-16 h-16 text-rangoli-500 opacity-25 transform rotate-90">
            <svg viewBox="0 0 100 100" fill="none">
              <path d="M0 0 C30 5, 50 15, 60 40 C70 60, 80 80, 100 100" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" />
              <circle cx="25" cy="25" r="15" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="25" cy="25" r="6" fill="currentColor" />
            </svg>
          </div>
          <div className="absolute bottom-2 left-2 w-16 h-16 text-rangoli-500 opacity-25 transform -rotate-90">
            <svg viewBox="0 0 100 100" fill="none">
              <path d="M0 0 C30 5, 50 15, 60 40 C70 60, 80 80, 100 100" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" />
              <circle cx="25" cy="25" r="15" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="25" cy="25" r="6" fill="currentColor" />
            </svg>
          </div>
          <div className="absolute bottom-2 right-2 w-16 h-16 text-rangoli-500 opacity-25 transform rotate-180">
            <svg viewBox="0 0 100 100" fill="none">
              <path d="M0 0 C30 5, 50 15, 60 40 C70 60, 80 80, 100 100" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" />
              <circle cx="25" cy="25" r="15" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="25" cy="25" r="6" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* =========================================================================
            PRINTABLE CONTENT FOREGROUND (Layered cleanly above translucent Rangoli)
           ========================================================================= */}
        <div className="relative z-10 space-y-4 print-foreground-content">
          
          {/* Traditional Top Auspicious Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-rangoli-700 tracking-widest uppercase font-serif">
              <span>卐</span>
              <span>॥ श्री गणेशाय नमः • शुभ लाभ ॥</span>
              <span>卐</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-earth-900 tracking-tight mt-1">
              {business.name}
            </h2>
            <p className="text-xs text-earth-700 font-medium mt-0.5">
              {business.address}
            </p>
            <div className="text-[11px] text-earth-600 flex flex-wrap items-center justify-center gap-3 mt-1">
              <span><b>Mobile:</b> {business.phone}</span>
              <span>•</span>
              <span><b>GSTIN:</b> {business.gstin}</span>
              <span>•</span>
              <span className="font-semibold text-rangoli-800">TAX INVOICE / CASH MEMO</span>
            </div>
          </div>

          {/* Ornamental Divider */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-rangoli-400 to-transparent my-2" />

          {/* Invoice Meta Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-ivory-100/90 p-3.5 rounded-xl border border-rangoli-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-earth-500 block">
                Billed To (Customer):
              </span>
              <span className="text-sm font-bold text-earth-900 block mt-0.5">
                {invoice.customerName}
              </span>
              <span className="text-[11px] text-earth-600">
                Payment Mode: <b className="capitalize text-rangoli-800">{invoice.paymentStatus === 'credit' ? 'Udhar (Credit)' : invoice.paymentStatus.toUpperCase()}</b>
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-earth-500 block">
                Invoice Details:
              </span>
              <span className="font-mono font-bold text-earth-900 text-sm block mt-0.5">
                {invoice.invoiceNo}
              </span>
              <span className="text-[11px] text-earth-600 block">
                Date: <b>{new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</b>
              </span>
              {isCredit && invoice.paymentDueDate && (
                <span className="text-[11px] text-danger font-semibold block">
                  Due Date: {invoice.paymentDueDate}
                </span>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-rangoli-200 rounded-xl overflow-hidden bg-white/95">
            <table className="w-full text-left text-xs">
              <thead className="bg-rangoli-100/80 border-b border-rangoli-200 text-earth-800 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rangoli-100 text-earth-900 font-medium">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-rangoli-50/50">
                    <td className="py-2 px-3 text-earth-400 text-[11px]">{idx + 1}</td>
                    <td className="py-2 px-3 font-semibold">{item.productName}</td>
                    <td className="py-2 px-3 text-right">{item.quantity} {item.unit}</td>
                    <td className="py-2 px-3 text-right font-mono">₹{item.unitPrice}</td>
                    <td className="py-2 px-3 text-right font-bold font-mono">₹{item.totalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Settlement Calculation */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-xs text-earth-600 space-y-1">
              <div className="font-semibold text-earth-800">
                Terms & Conditions:
              </div>
              <p className="text-[10px] leading-relaxed text-earth-500">
                1. Goods once sold will not be returned without bill.<br />
                2. Subject to local state jurisdiction.<br />
                3. Computer generated invoice under KINETIC MSME OS.
              </p>
            </div>

            <div className="space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-earth-600">
                <span>Sub Total:</span>
                <span className="font-mono font-semibold">₹{invoice.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-earth-600">
                <span>CGST / SGST (Included):</span>
                <span className="font-mono">₹0.00</span>
              </div>
              <div className="border-t-2 border-dashed border-rangoli-300 pt-2 flex justify-between items-center text-sm font-bold text-earth-900">
                <span className="text-base font-serif">Total Payable:</span>
                <span className="text-xl font-bold font-serif text-rangoli-700">
                  ₹{invoice.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Auspicious Greeting & Signature Line */}
          <div className="pt-4 border-t border-rangoli-200 flex items-end justify-between text-xs">
            <div>
              <p className="font-serif italic font-bold text-earth-800 text-sm">
                धन्यवाद • फिर पधारिएगा! 🙏
              </p>
              <p className="text-[10px] text-earth-500">
                Thank you for shopping at {business.name}
              </p>
            </div>

            <div className="text-center">
              <div className="h-8 border-b border-earth-400 w-36 mb-1" />
              <span className="text-[10px] font-bold text-earth-600 uppercase tracking-wider block">
                Authorized Signatory
              </span>
            </div>
          </div>

          {/* Screen-Only Action Buttons (Hidden during Print / PDF generation) */}
          <div className="no-print pt-4 border-t border-earth-200 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-earth-300 hover:bg-earth-50 text-xs font-semibold text-earth-700 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rangoli-500 to-rangoli-600 hover:from-rangoli-600 hover:to-rangoli-700 text-white text-xs font-bold shadow-md hover:shadow-rangoli transition-all flex items-center gap-2 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print Bill / Save PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(modalContent, document.body);
};
