import React from 'react';

export default function Navbar({ currentRole, setCurrentRole }) {
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
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-400 mr-2 font-medium">Acting Role:</span>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              className="bg-transparent text-sm font-semibold text-blue-400 focus:outline-none cursor-pointer"
            >
              <option value="AP Clerk" className="bg-slate-900 text-white">AP Clerk (Reviewer)</option>
              <option value="Finance Team Lead" className="bg-slate-900 text-white">Finance Team Lead</option>
              <option value="Finance Controller" className="bg-slate-900 text-white">Finance Controller</option>
              <option value="CFO" className="bg-slate-900 text-white">Chief Financial Officer (CFO)</option>
            </select>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span>OCR AI Engine: Active</span>
          </div>

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
