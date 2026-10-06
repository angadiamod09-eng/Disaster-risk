import React from 'react';
import { ShieldAlert, Activity, FileSpreadsheet } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  totalAssessmentsCount: number;
}

export const Header: React.FC<HeaderProps> = ({ totalAssessmentsCount }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Titles */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                Disaster Risk Assessment System
              </h1>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Assess environmental disaster risk and support preparedness.
              </p>
            </div>
          </div>

          {/* Right Status / Indicators */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-medium">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Rule Engine Active</span>
            </div>

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
              <span>Assessments: <strong>{totalAssessmentsCount}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
