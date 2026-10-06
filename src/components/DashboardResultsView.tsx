import React, { useState } from 'react';
import { AssessmentResult } from '../types/disaster';
import { RiskMeter } from './RiskMeter';
import { getDisasterPreparednessActions } from '../utils/calculator';
import {
  AlertTriangle,
  History,
  Trash2,
  Download,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface DashboardResultsViewProps {
  currentResult: AssessmentResult | null;
  history: AssessmentResult[];
  onSelectHistoryItem: (item: AssessmentResult) => void;
  onClearHistory: () => void;
  onNavigateToAssessment: () => void;
}

export const DashboardResultsView: React.FC<DashboardResultsViewProps> = ({
  currentResult,
  history,
  onSelectHistoryItem,
  onClearHistory,
  onNavigateToAssessment,
}) => {
  const [historyFilterDisaster, setHistoryFilterDisaster] = useState<string>('all');
  const [historyFilterLevel, setHistoryFilterLevel] = useState<string>('all');

  const filteredHistory = history.filter((item) => {
    const matchDisaster =
      historyFilterDisaster === 'all' || item.disasterType === historyFilterDisaster;
    const matchLevel = historyFilterLevel === 'all' || item.level === historyFilterLevel;
    return matchDisaster && matchLevel;
  });

  const exportHistoryToCsv = () => {
    if (history.length === 0) return;

    const headers = 'ID,Date,Time,State,District,Disaster,Score,Risk_Level,Recommendation\n';
    const rows = history
      .map((h) => {
        const dateObj = new Date(h.timestamp);
        const d = dateObj.toLocaleDateString();
        const t = dateObj.toLocaleTimeString();
        return `"${h.id}","${d}","${t}","${h.state}","${h.district}","${h.disasterType}",${h.score},"${h.level}","${h.recommendation.replace(/"/g, '""')}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment_history_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Active Assessment Result Banner / Card */}
      {currentResult ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="bg-slate-900 text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2 text-xs text-amber-400 font-semibold tracking-wider uppercase mb-1">
                <span>Active Risk Assessment</span>
                <span>•</span>
                <span className="text-slate-300 font-mono">
                  {new Date(currentResult.timestamp).toLocaleDateString()} {new Date(currentResult.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">
                {currentResult.district}, {currentResult.state}
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-amber-300 border border-slate-700 text-xs font-bold uppercase tracking-wider">
                {currentResult.disasterType.replace('_', ' ')}
              </span>
              <button
                onClick={onNavigateToAssessment}
                className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition flex items-center space-x-1"
              >
                <span>New Evaluation</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* Visual Risk Indicator & Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Left Meter */}
              <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200">
                <RiskMeter score={currentResult.score} level={currentResult.level} />

                <div className="mt-4 text-center">
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    Calculated Classification
                  </div>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">
                    Risk Category: <span className="underline">{currentResult.level}</span>
                  </div>
                </div>
              </div>

              {/* Right Recommendation & Summary */}
              <div className="md:col-span-7 space-y-4">
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                        System Recommendation
                      </h4>
                      <p className="text-sm font-semibold text-slate-800 mt-1 leading-snug">
                        "{currentResult.recommendation}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Score Summary Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="text-[11px] text-slate-500 uppercase font-semibold">
                      Normalized Index
                    </div>
                    <div className="text-xl font-bold text-slate-900 mt-0.5">
                      {currentResult.score} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="text-[11px] text-slate-500 uppercase font-semibold">
                      Severity Threshold
                    </div>
                    <div className="text-xs font-bold text-slate-800 mt-1">
                      {currentResult.score <= 30 && '0–30 (Low Risk Zone)'}
                      {currentResult.score > 30 && currentResult.score <= 60 && '31–60 (Moderate Risk Zone)'}
                      {currentResult.score > 60 && currentResult.score <= 80 && '61–80 (High Alert Zone)'}
                      {currentResult.score > 80 && '81–100 (Critical Action Zone)'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contributing Environmental Factors Breakdown */}
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center">
                  <Layers className="w-4 h-4 mr-1.5 text-slate-600" />
                  Main Contributing Factors Breakdown
                </h3>
                <span className="text-xs text-slate-500">Relative impact scoring</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentResult.contributingFactors.map((factor, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50/70 transition"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
                      <span>
                        {factor.name}: <strong>{factor.value} {factor.unit || ''}</strong>
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          factor.impact === 'Severe'
                            ? 'bg-rose-100 text-rose-800'
                            : factor.impact === 'High'
                            ? 'bg-orange-100 text-orange-800'
                            : factor.impact === 'Moderate'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {factor.impact} ({factor.scoreContribution}/100)
                      </span>
                    </div>

                    {/* Progress Bar of Factor Contribution */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden my-2">
                      <div
                        className={`h-full rounded-full ${
                          factor.scoreContribution > 80
                            ? 'bg-rose-600'
                            : factor.scoreContribution > 60
                            ? 'bg-orange-500'
                            : factor.scoreContribution > 30
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${factor.scoreContribution}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-500 leading-snug">
                      {factor.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Practical Preparedness Actions */}
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                Targeted Preparedness Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                {getDisasterPreparednessActions(currentResult.disasterType, currentResult.level).map(
                  (action, i) => (
                    <div
                      key={i}
                      className="flex items-start space-x-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2 opacity-70" />
          <h3 className="text-lg font-bold text-slate-800">No Assessment Evaluated Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Select a location and enter environmental parameters in the Risk Assessment or Manual Assessment tab to view complete results.
          </p>
          <button
            onClick={onNavigateToAssessment}
            className="px-5 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition"
          >
            Go to Risk Assessment
          </button>
        </div>
      )}

      {/* SECTION 17: ASSESSMENT HISTORY */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-slate-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Assessment History & Logs
              </h3>
              <p className="text-xs text-slate-500">
                Track previous disaster assessments and comparison records.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {history.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={exportHistoryToCsv}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export History</span>
                </button>

                <button
                  type="button"
                  onClick={onClearHistory}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* History Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="flex items-center space-x-1.5 text-slate-600 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter By:</span>
          </div>

          <select
            value={historyFilterDisaster}
            onChange={(e) => setHistoryFilterDisaster(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800"
          >
            <option value="all">All Disasters</option>
            <option value="flood">Flood</option>
            <option value="drought">Drought</option>
            <option value="landslide">Landslide</option>
            <option value="forest_fire">Forest Fire</option>
            <option value="cyclone">Cyclone</option>
          </select>

          <select
            value={historyFilterLevel}
            onChange={(e) => setHistoryFilterLevel(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800"
          >
            <option value="all">All Risk Levels</option>
            <option value="LOW">LOW</option>
            <option value="MODERATE">MODERATE</option>
            <option value="HIGH">HIGH</option>
            <option value="VERY HIGH">VERY HIGH</option>
          </select>

          <span className="text-slate-400 text-xs ml-auto">
            Showing {filteredHistory.length} of {history.length} records
          </span>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-3.5 py-2.5 text-left">Date / Time</th>
                <th className="px-3.5 py-2.5 text-left">Location</th>
                <th className="px-3.5 py-2.5 text-left">Disaster</th>
                <th className="px-3.5 py-2.5 text-center">Score</th>
                <th className="px-3.5 py-2.5 text-left">Risk Level</th>
                <th className="px-3.5 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No assessment history records found.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-3.5 py-2.5 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                        <span className="text-slate-400">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-3.5 py-2.5 font-semibold text-slate-900">
                      {item.district}, {item.state}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className="px-2 py-0.5 rounded uppercase font-bold text-[10px] bg-slate-100 text-slate-800">
                        {item.disasterType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-center font-mono font-bold text-slate-900">
                      {item.score} / 100
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.level === 'VERY HIGH'
                            ? 'bg-rose-100 text-rose-800'
                            : item.level === 'HIGH'
                            ? 'bg-orange-100 text-orange-800'
                            : item.level === 'MODERATE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.level}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-right">
                      <button
                        onClick={() => onSelectHistoryItem(item)}
                        className="text-amber-700 hover:text-amber-800 font-semibold underline underline-offset-2 text-[11px]"
                      >
                        Load Result
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
