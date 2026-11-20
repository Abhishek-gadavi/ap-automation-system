import React from 'react';

export default function Navbar({ currentRole, setCurrentRole, onResetData }) {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Organization */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-blue-500/30">
            TG
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              AP Flow <span className="text-xs bg-blue-500/20 text-blue-400 font-semibold px-2 py-0.5 rounded border border-blue-500/30">v2.0 OCR</span>
            </div>
            <div className="text-xs text-slate-400">Templegate Technologies & Services</div>
          </div>
        </div>

        {/* Global Controls & Role Selector */}
        <div className="flex items-center space-x-3">
          
          {/* Storage Persistence Indicator */}
          <div className="hidden lg:flex items-center space-x-1.5 text-[11px] bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Auto-Save Active (Persistent)</span>
          </div>

          <div className="flex items-center bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-400 mr-2 font-medium">Role:</span>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              className="bg-transparent text-xs font-semibold text-blue-400 focus:outline-none cursor-pointer"
            >
              <option value="AP Clerk" className="bg-slate-900 text-white">AP Clerk (Reviewer)</option>
              <option value="Finance Team Lead" className="bg-slate-900 text-white">Finance Team Lead</option>
              <option value="Finance Controller" className="bg-slate-900 text-white">Finance Controller</option>
              <option value="CFO" className="bg-slate-900 text-white">Chief Financial Officer (CFO)</option>
            </select>
          </div>

          {onResetData && (
            <button
              onClick={onResetData}
              title="Reset data back to initial seed if needed"
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
            >
              ↺ Reset
            </button>
          )}

          <div className="flex items-center space-x-2 pl-2 border-l border-slate-700">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-blue-300">
              AG
            </div>
            <span className="text-xs font-medium text-slate-300 hidden md:inline">Abhishek Gadavi</span>
          </div>
        </div>

      </div>
    </header>
  );
}
