import React from 'react';
import { ShieldCheck, AlertCircle, CheckCircle, Scale } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Primary Mandatory Statement Card */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              About the System
            </h2>
            <p className="text-xs text-slate-500">
              System Purpose & Operational Scope
            </p>
          </div>
        </div>

        {/* Required Primary Text */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-800 leading-relaxed font-medium">
          "Disaster Risk Assessment System is an academic decision-support prototype that evaluates environmental conditions and provides a disaster risk level to support awareness and preparedness."
        </div>

        {/* Required Advisory Disclaimer */}
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="font-semibold leading-relaxed">
            "This system is not an official government warning or emergency alert system."
          </p>
        </div>

        {/* Core Technical Specifications Overview */}
        <div className="pt-2 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
            <Scale className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Evaluation Framework Specifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="font-bold text-slate-900 mb-1 flex items-center">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                Supported Disaster Models
              </div>
              <p className="text-slate-600 text-[11px]">
                1. Flood &nbsp;•&nbsp; 2. Drought &nbsp;•&nbsp; 3. Landslide &nbsp;•&nbsp; 4. Forest Fire &nbsp;•&nbsp; 5. Cyclone
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="font-bold text-slate-900 mb-1 flex items-center">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                Standard Risk Scale (0–100)
              </div>
              <p className="text-slate-600 text-[11px]">
                0–30: LOW &nbsp;•&nbsp; 31–60: MODERATE &nbsp;•&nbsp; 61–80: HIGH &nbsp;•&nbsp; 81–100: VERY HIGH
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
