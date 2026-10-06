import React from 'react';
import { RiskLevel } from '../types/disaster';

interface RiskMeterProps {
  score: number;
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ score, level, size = 'md' }) => {
  const clampedScore = Math.min(100, Math.max(0, Math.round(score)));

  // Color config based on risk level
  const config = {
    LOW: {
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500',
      lightBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      ringColor: '#10b981',
      badgeBorder: 'border-emerald-300',
    },
    MODERATE: {
      color: 'text-amber-600',
      bgColor: 'bg-amber-500',
      lightBg: 'bg-amber-50 text-amber-800 border-amber-200',
      ringColor: '#f59e0b',
      badgeBorder: 'border-amber-300',
    },
    HIGH: {
      color: 'text-orange-600',
      bgColor: 'bg-orange-500',
      lightBg: 'bg-orange-50 text-orange-800 border-orange-200',
      ringColor: '#f97316',
      badgeBorder: 'border-orange-300',
    },
    'VERY HIGH': {
      color: 'text-rose-600',
      bgColor: 'bg-rose-600',
      lightBg: 'bg-rose-50 text-rose-800 border-rose-200',
      ringColor: '#e11d48',
      badgeBorder: 'border-rose-300',
    },
  }[level];

  // SVG Gauge calculation for semi-circle
  const radius = 80;
  const strokeWidth = 14;
  const circumference = Math.PI * radius; // Half-circle
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      {/* Semi-circle Gauge */}
      <div className="relative w-52 h-28 flex items-end justify-center overflow-hidden">
        <svg
          viewBox="0 0 200 110"
          className="w-full h-full transform"
        >
          {/* Background track */}
          <path
            d="M 20,100 A 80,80 0 0,1 180,100"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Zones indicator dashes */}
          {/* Low: 0-30% */}
          <path
            d="M 20,100 A 80,80 0 0,1 62,42"
            fill="none"
            stroke="#10b981"
            strokeWidth={4}
            strokeOpacity={0.25}
          />
          {/* Moderate: 31-60% */}
          <path
            d="M 62,42 A 80,80 0 0,1 126,38"
            fill="none"
            stroke="#f59e0b"
            strokeWidth={4}
            strokeOpacity={0.25}
          />
          {/* High: 61-80% */}
          <path
            d="M 126,38 A 80,80 0 0,1 168,76"
            fill="none"
            stroke="#f97316"
            strokeWidth={4}
            strokeOpacity={0.25}
          />
          {/* Very High: 81-100% */}
          <path
            d="M 168,76 A 80,80 0 0,1 180,100"
            fill="none"
            stroke="#e11d48"
            strokeWidth={4}
            strokeOpacity={0.25}
          />

          {/* Active progress fill */}
          <path
            d="M 20,100 A 80,80 0 0,1 180,100"
            fill="none"
            stroke={config.ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Score readout */}
        <div className="absolute bottom-1 text-center">
          <div className="text-3xl font-extrabold tracking-tight text-slate-900 leading-none">
            {clampedScore}
            <span className="text-xs font-semibold text-slate-400 ml-1">/ 100</span>
          </div>
          <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase mt-0.5">
            Risk Score
          </div>
        </div>
      </div>

      {/* Risk Level Badge */}
      <div className="mt-2 text-center">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold tracking-wider uppercase border ${config.lightBg}`}
        >
          <span className={`w-2 h-2 rounded-full mr-1.5 ${config.bgColor}`} />
          {level}
        </span>
      </div>

      {/* Scale Legend */}
      <div className="grid grid-cols-4 gap-1 w-full max-w-xs mt-3 pt-2 border-t border-slate-100 text-[10px] text-center text-slate-500">
        <div className={level === 'LOW' ? 'font-bold text-emerald-700' : ''}>
          0–30 <span className="block text-[9px]">LOW</span>
        </div>
        <div className={level === 'MODERATE' ? 'font-bold text-amber-700' : ''}>
          31–60 <span className="block text-[9px]">MOD</span>
        </div>
        <div className={level === 'HIGH' ? 'font-bold text-orange-700' : ''}>
          61–80 <span className="block text-[9px]">HIGH</span>
        </div>
        <div className={level === 'VERY HIGH' ? 'font-bold text-rose-700' : ''}>
          81–100 <span className="block text-[9px]">V.HIGH</span>
        </div>
      </div>
    </div>
  );
};
