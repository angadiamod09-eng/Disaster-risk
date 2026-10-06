import React from 'react';
import {
  Compass,
  SlidersHorizontal,
  LayoutDashboard,
  Info,
  Flame,
  CloudRain,
  Sun,
  Mountain,
  Wind
} from 'lucide-react';
import { DisasterType } from '../types/disaster';

export type NavigationTab = 'risk-assessment' | 'manual-assessment' | 'dashboard-results' | 'about-system';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  selectedDisaster?: DisasterType;
  onQuickDisasterSelect?: (type: DisasterType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  selectedDisaster,
  onQuickDisasterSelect
}) => {
  const navItems: { id: NavigationTab; label: string; number: string; icon: React.ReactNode }[] = [
    {
      id: 'risk-assessment',
      label: 'Risk Assessment',
      number: '1',
      icon: <Compass className="w-4 h-4" />
    },
    {
      id: 'manual-assessment',
      label: 'Manual Assessment',
      number: '2',
      icon: <SlidersHorizontal className="w-4 h-4" />
    },
    {
      id: 'dashboard-results',
      label: 'Dashboard / Results',
      number: '3',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'about-system',
      label: 'About System',
      number: '4',
      icon: <Info className="w-4 h-4" />
    }
  ];

  const disasterBadges: { type: DisasterType; label: string; icon: React.ReactNode; color: string }[] = [
    { type: 'flood', label: 'Flood', icon: <CloudRain className="w-3.5 h-3.5" />, color: 'text-blue-600' },
    { type: 'drought', label: 'Drought', icon: <Sun className="w-3.5 h-3.5" />, color: 'text-amber-600' },
    { type: 'landslide', label: 'Landslide', icon: <Mountain className="w-3.5 h-3.5" />, color: 'text-stone-600' },
    { type: 'forest_fire', label: 'Forest Fire', icon: <Flame className="w-3.5 h-3.5" />, color: 'text-red-600' },
    { type: 'cyclone', label: 'Cyclone', icon: <Wind className="w-3.5 h-3.5" />, color: 'text-cyan-600' }
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-200 flex-shrink-0 flex flex-col justify-between">
      <div className="p-4 sm:p-5">
        {/* Navigation list */}
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3 px-2">
          System Menu
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={isActive ? 'text-slate-950' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                    isActive ? 'bg-amber-300 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.number}
                </span>
              </button>
            );
          })}
        </nav>

        {/* 5 Disasters Quick Access */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5 px-2">
            Disaster Models (5)
          </div>
          <div className="space-y-1">
            {disasterBadges.map((d) => (
              <button
                key={d.type}
                onClick={() => {
                  if (onQuickDisasterSelect) onQuickDisasterSelect(d.type);
                  onTabChange('risk-assessment');
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedDisaster === d.type
                    ? 'bg-slate-800 text-amber-400 border border-slate-700'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className={d.color}>{d.icon}</span>
                  <span>{d.label}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">0-100</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Prototype Notice */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/40">
        <div className="font-semibold text-slate-300 mb-0.5">Decision Support Tool</div>
        <p className="leading-snug text-slate-400">
          Normalized environmental risk assessment engine.
        </p>
      </div>
    </aside>
  );
};
