import React from "react";
import { Menu, User, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

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
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/90 backdrop-blur-xl sticky top-0 z-20 shadow-lg">
      <div className="w-full px-6 md:px-8 lg:px-10 flex items-center justify-between h-20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center text-lg font-bold shadow-lg">
            AI
          </div>
          <div className="text-base">
            <div className="font-bold tracking-tight text-xl text-slate-900 dark:text-slate-100">
              AI-Capsule
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-widest font-medium">
              Profile Dashboard
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {role === "student" && (
            <button
              className="md:hidden inline-flex items-center justify-center rounded-xl border border-slate-700 p-2 hover:bg-slate-900 transition-colors"
              onClick={onToggleSidebar}
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          {showRoleToggle && (
            <RoleToggle value={role} onChange={onRoleChange} />
          )}
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm">
              <div className="font-semibold text-slate-700 dark:text-slate-200">
                {role === "admin" ? "Admin" : "Student"}
              </div>
            </div>
          </div>
          <button
            className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-red-300 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20 px-5 py-2.5 text-sm font-medium text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
