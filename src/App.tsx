/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DisasterType, AssessmentResult } from './types/disaster';
import { Header } from './components/Header';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { RiskAssessmentView } from './components/RiskAssessmentView';
import { ManualAssessmentView } from './components/ManualAssessmentView';
import { DashboardResultsView } from './components/DashboardResultsView';
import { AboutView } from './components/AboutView';
import { evaluateDisasterRisk } from './utils/calculator';

const LOCAL_STORAGE_KEY = 'dras_assessment_history_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('risk-assessment');
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterType>('flood');
  const [currentResult, setCurrentResult] = useState<AssessmentResult | null>(null);
  const [history, setHistory] = useState<AssessmentResult[]>([]);

  // Initialize seed assessment history on first load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
          setCurrentResult(parsed[0]);
          return;
        }
      }
    } catch {
      // ignore JSON parse errors
    }

    // Default initial assessment (Karnataka - Kalaburagi)
    const initialFlood = evaluateDisasterRisk('flood', 'Karnataka', 'Kalaburagi', {
      rainfall: 140,
      waterLevel: 6.8,
      soilMoisture: 78,
      drainageCondition: 'Inadequate',
    });

    const initialDrought = evaluateDisasterRisk('drought', 'Karnataka', 'Kalaburagi', {
      rainfall: 12,
      temperature: 42.0,
      soilMoisture: 18,
    });

    const initialWayanad = evaluateDisasterRisk('landslide', 'Kerala', 'Wayanad', {
      rainfall: 210,
      slope: 52,
      soilCondition: 'Saturated & Unstable',
    });

    const defaultSeed = [initialFlood, initialDrought, initialWayanad];
    setHistory(defaultSeed);
    setCurrentResult(initialFlood);
  }, []);

  // Save history updates to localStorage
  const saveHistory = (newHistory: AssessmentResult[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHistory));
    } catch {
      // local storage quota exceeded or disabled
    }
  };

  const handleAssessmentCompleted = (result: AssessmentResult) => {
    setCurrentResult(result);
    // Add to top of history, keeping latest 50 records
    const updated = [result, ...history.filter((h) => h.id !== result.id)].slice(0, 50);
    saveHistory(updated);
  };

  const handleSelectHistoryItem = (item: AssessmentResult) => {
    setCurrentResult(item);
    setSelectedDisaster(item.disasterType);
  };

  const handleClearHistory = () => {
    saveHistory([]);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <Header
        activeTab={activeTab}
        totalAssessmentsCount={history.length}
      />

      {/* Main Layout Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedDisaster={selectedDisaster}
          onQuickDisasterSelect={(disaster) => setSelectedDisaster(disaster)}
        />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'risk-assessment' && (
            <RiskAssessmentView
              selectedDisaster={selectedDisaster}
              onDisasterChange={setSelectedDisaster}
              onAssessmentCompleted={handleAssessmentCompleted}
              currentResult={currentResult}
              onNavigateToResults={() => setActiveTab('dashboard-results')}
            />
          )}

          {activeTab === 'manual-assessment' && (
            <ManualAssessmentView
              onAssessmentCompleted={handleAssessmentCompleted}
              onNavigateToResults={() => setActiveTab('dashboard-results')}
            />
          )}

          {activeTab === 'dashboard-results' && (
            <DashboardResultsView
              currentResult={currentResult}
              history={history}
              onSelectHistoryItem={handleSelectHistoryItem}
              onClearHistory={handleClearHistory}
              onNavigateToAssessment={() => setActiveTab('risk-assessment')}
            />
          )}

          {activeTab === 'about-system' && <AboutView />}
        </main>
      </div>
    </div>
  );
}
