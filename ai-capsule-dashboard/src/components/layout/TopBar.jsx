import React from "react";
import { Menu, User, LogOut } from "lucide-react";

function RoleToggle({ value, onChange }) {
  return (
    <div className="inline-flex rounded-full bg-slate-900 border border-slate-700 p-0.5 text-[11px]">
      <button
        onClick={() => onChange("admin")}
        className={`px-3 py-1 rounded-full transition text-xs ${
          value === "admin"
            ? "bg-emerald-500 text-slate-950 shadow-sm"
            : "text-slate-300"
        }`}
      >
        Admin view
      </button>
      <button
        onClick={() => onChange("student")}
        className={`px-3 py-1 rounded-full transition text-xs ${
          value === "student"
            ? "bg-sky-500 text-slate-950 shadow-sm"
            : "text-slate-300"
        }`}
      >
        Student view
      </button>
    </div>
  );
}

export default function TopBar({
  role,
  onRoleChange,
  onToggleSidebar,
  showRoleToggle = true,
  onLogout,
}) {
  return (
    <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between h-14">
        <div className="flex items-center gap-2">
          {role === "student" && (
            <button
              className="md:hidden inline-flex items-center justify-center rounded-xl border border-slate-800 p-1.5"
              onClick={onToggleSidebar}
            >
              <Menu className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center text-xs font-bold">
              AI
            </div>
            <div className="text-sm">
              <div className="font-semibold tracking-tight">AI-Capsule</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-[.18em]">
                Student Profiles
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {showRoleToggle && (
            <RoleToggle value={role} onChange={onRoleChange} />
          )}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <User className="w-4 h-4" />
            <span>{role === "admin" ? "Trainer" : "Student"}</span>
          </div>
          <button
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-800 px-3 py-1 text-xs text-slate-300 hover:bg-slate-900"
            onClick={onLogout}
          >
            <LogOut className="w-3 h-3" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
