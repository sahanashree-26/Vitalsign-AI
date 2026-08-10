import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutGrid, Stethoscope, User, AlertTriangle, BarChart3,
  FileUp, Settings as SettingsIcon, HeartPulse,
} from "lucide-react";
import { useAuth } from "../AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/clinical-dashboard", label: "Clinical Dashboard", icon: Stethoscope },
  { to: "/patient-summary", label: "Patient Summary", icon: User },
  { to: "/risk-alerts", label: "Risk Alerts", icon: AlertTriangle },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/medical-report-upload", label: "Medical Report Upload", icon: FileUp },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col">
      <div className="px-5 py-5 flex items-center gap-2 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
          <HeartPulse size={18} />
        </div>
        <div>
          <div className="font-semibold text-brand-700 leading-tight">VitalSignAI</div>
          <div className="text-[11px] text-slate-400 leading-tight">Clinical Precision</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-brand-50 text-brand-700 font-medium"
                  : "text-slate-600 hover:bg-slate-50"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive ? "bg-brand-50 text-brand-700 font-medium" : "text-slate-600 hover:bg-slate-50"
            }`
          }
        >
          <SettingsIcon size={17} />
          Settings
        </NavLink>
      </div>

      {user && (
        <div className="px-4 py-3 border-t border-slate-100 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold">
            {user.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-medium">{user.name}</div>
            <div className="text-xs text-slate-400">{user.specialty}</div>
          </div>
        </div>
      )}
    </aside>
  );
}
