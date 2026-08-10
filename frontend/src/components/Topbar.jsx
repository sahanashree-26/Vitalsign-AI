import React from "react";
import { Search, Bell } from "lucide-react";

export default function Topbar({ title, subtitle, onSearch }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        {onSearch && (
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              className="input-field pl-9 w-64"
              placeholder="Search patients, IDs, reports..."
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        )}
        <button className="relative w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50">
          <Bell size={16} className="text-slate-500" />
        </button>
      </div>
    </div>
  );
}
