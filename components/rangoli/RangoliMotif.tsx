'use client';

import React from 'react';
import Image from 'next/image';

interface RangoliProps {
  className?: string;
  size?: number;
  opacity?: number;
  rotate?: boolean;
}

/**
 * Signature KINETIC Rangoli Core (Design System §38)
 * 8 rounded petals around a gold center dot, inside a thin dotted ring.
 * Used for Logo mark, AI icon, loader, active navigation, and confirmation.
 */
export const RangoliCore: React.FC<{
  size?: number;
  className?: string;
  illuminatedCount?: number;
  active?: boolean;
}> = ({ size = 24, className = '', illuminatedCount = 8, active = false }) => {
  const petals = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${active ? 'animate-mandala-spin-slow' : ''} ${className}`}
    >
      {/* Outer thin dotted ring */}
      <circle
        cx="20"
        cy="20"
        r="18"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="2 2"
        opacity="0.6"
      />
      {/* 8 rounded petals */}
      {petals.map((angle, idx) => {
        const isIlluminated = idx < illuminatedCount;
        return (
          <path
            key={angle}
            d="M20 7 C22.5 12 22.5 15 20 20 C17.5 15 17.5 12 20 7 Z"
            transform={`rotate(${angle} 20 20)`}
            fill="currentColor"
            fillOpacity={isIlluminated ? 0.75 : 0.2}
            stroke="currentColor"
            strokeWidth="0.8"
            className="transition-all duration-300"
          />
        );
      })}
      {/* Inner gold center dot */}
      <circle cx="20" cy="20" r="3.5" fill="#B8862B" />
      <circle cx="20" cy="20" r="1.5" fill="#3B2A1E" />
    </svg>
  );
};

export const RangoliEmblem: React.FC<{ size?: number; className?: string; rotate?: boolean }> = ({
  size = 32,
  className = '',
  rotate = false,
}) => {
  return <RangoliCore size={size} className={className} active={rotate} />;
};

/**
 * Large 16-Fold Mandala (Design System §5.1)
 * Used for Login & Dashboard Canvas
 */
export const MandalaLarge: React.FC<{ size?: number; className?: string; opacity?: number }> = ({
  size = 500,
  className = '',
  opacity = 0.1,
}) => {
  const angles = Array.from({ length: 16 }, (_, i) => i * 22.5);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none text-rangoli-500 ${className}`}
      style={{ opacity }}
    >
      {/* Concentric rings */}
      <circle cx="100" cy="100" r="92" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
      <circle cx="100" cy="100" r="76" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="100" cy="100" r="54" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 2" />
      <circle cx="100" cy="100" r="32" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="12" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
      <circle cx="100" cy="100" r="4" fill="currentColor" />

      {/* 16 Radial Floral Lattice Petals */}
      {angles.map((angle) => (
        <g key={angle} transform={`rotate(${angle} 100 100)`}>
          <path
            d="M100 24 C108 45 112 70 100 100 C88 70 92 45 100 24 Z"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="currentColor"
            fillOpacity="0.04"
          />
          <path
            d="M100 46 C105 60 106 80 100 100 C94 80 95 60 100 46 Z"
            stroke="currentColor"
            strokeWidth="0.8"
            fill="currentColor"
            fillOpacity="0.08"
          />
          <circle cx="100" cy="18" r="2.5" fill="currentColor" opacity="0.6" />
        </g>
      ))}
    </svg>
  );
};

/**
 * Medium 12-Fold Mandala (Design System §5.1)
 * Used for AI Assistant panel & Analytics background
 */
export const MandalaMedium: React.FC<{ size?: number; className?: string; opacity?: number }> = ({
  size = 320,
  className = '',
  opacity = 0.12,
}) => {
  const angles = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none text-rangoli-500 ${className}`}
      style={{ opacity }}
    >
      <circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
      <circle cx="80" cy="80" r="56" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="80" cy="80" r="38" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
      <circle cx="80" cy="80" r="18" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="80" cy="80" r="5" fill="currentColor" />

      {angles.map((angle) => (
        <g key={angle} transform={`rotate(${angle} 80 80)`}>
          <path
            d="M80 24 C86 40 88 60 80 80 C72 60 74 40 80 24 Z"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="currentColor"
            fillOpacity="0.06"
          />
          <circle cx="80" cy="18" r="2" fill="currentColor" />
        </g>
      ))}
    </svg>
  );
};

/**
 * Corner Floral Motif (Design System §5.1)
 * Quarter-mandala with petal sprays for customers, cards, modals
 */
export const RangoliCorner: React.FC<{
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
  size?: number;
}> = ({ position = 'top-right', className = '', size = 64 }) => {
  const getRotation = () => {
    switch (position) {
      case 'top-left': return 'rotate-0';
      case 'top-right': return 'rotate-90';
      case 'bottom-right': return 'rotate-180';
      case 'bottom-left': return '-rotate-90';
      default: return '';
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none text-rangoli-500 opacity-20 ${getRotation()} ${className}`}
    >
      <path
        d="M0 0 C 40 5, 60 20, 75 45 C 85 60, 95 80, 100 100"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="4 2"
      />
      <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="5" fill="currentColor" fillOpacity="0.4" />
      <path
        d="M20 6 C 24 12, 24 16, 20 20 C 16 16, 16 12, 20 6 Z"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="currentColor"
        fillOpacity="0.4"
      />
      <path
        d="M6 20 C 12 24, 16 24, 20 20 C 16 16, 12 16, 6 20 Z"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="currentColor"
        fillOpacity="0.4"
      />
      <circle cx="50" cy="50" r="3.5" fill="currentColor" />
    </svg>
  );
};

/**
 * Symmetrical Rangoli Divider for Section Headers
 */
export const RangoliDivider: React.FC<{ label?: string; className?: string }> = ({ label, className = '' }) => {
  return (
    <div className={`flex items-center justify-center my-6 gap-3 ${className}`}>
      <div className="h-[1px] flex-1 max-w-xs bg-gradient-to-r from-transparent via-rangoli-300 to-rangoli-500 opacity-60" />
      <div className="flex items-center gap-1.5 text-rangoli-600">
        <span className="w-1.5 h-1.5 rounded-full bg-rangoli-400 opacity-75" />
        <RangoliCore size={20} className="text-rangoli-600" />
        <span className="w-1.5 h-1.5 rounded-full bg-rangoli-400 opacity-75" />
      </div>
      {label && (
        <span className="text-xs uppercase tracking-widest font-semibold text-earth-700 px-2 font-serif">
          {label}
        </span>
      )}
      <div className="h-[1px] flex-1 max-w-xs bg-gradient-to-l from-transparent via-rangoli-300 to-rangoli-500 opacity-60" />
    </div>
  );
};

/**
 * Mini 8-Petal Motif for Empty States and Badges (Design System §5.1, §28)
 */
export const MiniMotif: React.FC<{ size?: number; className?: string }> = ({ size = 64, className = '' }) => {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <RangoliCore size={size} className="text-rangoli-500 opacity-30" />
    </div>
  );
};

/**
 * Signature Rangoli AI Visualizer (Design System §15 & §16)
 * Radial pattern driving states: idle | listening | processing | reasoning | complete | failure
 */
export type VisualizerState =
  | 'idle'
  | 'listening'
  | 'detecting'
  | 'detected'
  | 'processing'
  | 'reasoning'
  | 'complete'
  | 'failure';

export const VoiceVisualizer: React.FC<{
  state: VisualizerState;
  amplitude?: number; // 0 to 1
  size?: number;
}> = ({ state, amplitude = 0, size = 120 }) => {
  const petals = Array.from({ length: 12 }, (_, i) => i * 30);
  const scale = state === 'listening' ? 1 + Math.min(amplitude * 0.15, 0.15) : 1;

  return (
    <div
      className="relative flex items-center justify-center transition-transform duration-150"
      style={{ width: size, height: size, transform: `scale(${scale})` }}
      aria-live="polite"
      role="status"
    >
      {/* Concentric rings scaling with amplitude */}
      <div
        className={`absolute inset-0 rounded-full border-2 border-rangoli-300/40 transition-all duration-300 ${
          state === 'processing' || state === 'detecting' ? 'animate-spin' : ''
        }`}
        style={{ animationDuration: state === 'processing' ? '20s' : '4s' }}
      />
      <div
        className={`absolute inset-2 rounded-full border border-rangoli-400/50 border-dashed ${
          state === 'listening' ? 'scale-105' : ''
        }`}
      />

      {/* Radial 12-segment SVG */}
      <svg
        width={size * 0.8}
        height={size * 0.8}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-colors duration-300 ${
          state === 'failure' ? 'text-amber-600' : 'text-rangoli-600'
        }`}
      >
        <circle cx="50" cy="50" r="16" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="6" fill="#B8862B" />

        {petals.map((angle, idx) => {
          let opacity = 0.3;
          if (state === 'idle') opacity = 0.4;
          if (state === 'listening') opacity = 0.5 + Math.random() * 0.4;
          if (state === 'processing' || state === 'reasoning') {
            opacity = ((idx * 2) % 12) / 12 + 0.3;
          }
          if (state === 'complete') opacity = 0.9;
          if (state === 'failure') opacity = idx === 0 ? 0.9 : 0.2;

          return (
            <path
              key={angle}
              d="M50 18 C53 28 54 38 50 50 C46 38 47 28 50 18 Z"
              transform={`rotate(${angle} 50 50)`}
              fill="currentColor"
              fillOpacity={opacity}
              stroke="currentColor"
              strokeWidth="0.8"
            />
          );
        })}
      </svg>
    </div>
  );
};

// Signature Full-Canvas Translucent Indian Rangoli Background (Design System §5 & §39)
export const RangoliBackground: React.FC<{
  opacity?: number;
  className?: string;
  variant?: 'center' | 'right' | 'subtle';
}> = ({
  opacity = 0.12,
  className = '',
  variant = 'center',
}) => {
  return (
    <div
      className={`fixed inset-0 pointer-events-none select-none overflow-hidden flex items-center justify-center ${className}`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <div
        className={`relative w-[850px] h-[850px] sm:w-[1100px] sm:h-[1100px] lg:w-[1350px] lg:h-[1350px] animate-mandala-spin-slow mix-blend-multiply transition-opacity duration-700 ${
          variant === 'right' ? 'translate-x-1/4' : ''
        }`}
        style={{ opacity }}
      >
        <Image
          src="/assets/rangoli_mandala.jpg"
          alt="Traditional Indian Rangoli Canvas"
          fill
          sizes="(max-width: 768px) 850px, (max-width: 1200px) 1100px, 1350px"
          className="object-contain filter contrast-125"
          priority
        />
      </div>
    </div>
  );
};

// Dynamic Animated Rangoli Loader for AI Operations & Transactions
export const RangoliLoader: React.FC<{ size?: number; label?: string }> = ({ size = 48, label = 'Processing...' }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4">
      <div className="relative" style={{ width: size, height: size }}>
        <div className="absolute inset-0 rounded-full border-2 border-rangoli-300 border-dashed animate-spin" style={{ animationDuration: '8s' }} />
        <RangoliCore size={size} active={true} className="text-rangoli-600" />
      </div>
      {label && (
        <p className="text-xs font-medium text-earth-700 font-serif tracking-wide animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
};
