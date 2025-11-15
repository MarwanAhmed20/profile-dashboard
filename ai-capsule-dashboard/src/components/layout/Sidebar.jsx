import React from "react";
import { LayoutDashboard, BarChart3 } from "lucide-react";

function SidebarItem({ icon: Icon, label, subtitle, active, disabled, onClick }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`w-full flex flex-col items-start rounded-xl px-3 py-2 text-left border transition text-xs ${
        active
          ? "bg-slate-900/80 border-slate-700 text-slate-50 shadow-sm"
          : "border-transparent text-slate-300 hover:bg-slate-900/60"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        <span className="font-medium tracking-tight text-[13px]">
          {label}
        </span>
      </span>
      {subtitle && (
        <span className="mt-0.5 text-[11px] text-slate-500">{subtitle}</span>
      )}
    </button>
  );
}

export default function Sidebar({
  role,
  studentTab,
  onStudentTabChange,
  open,
  onClose,
}) {
  if (role !== "student") return null;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed md:static z-30 inset-y-0 left-0 w-60 bg-slate-950/90 border-r border-slate-800 backdrop-blur flex flex-col transform transition-transform duration-200 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex-1 flex flex-col py-4">
          <nav className="px-3 space-y-1">
            <SidebarItem
              icon={LayoutDashboard}
              label="Home"
              active={studentTab === "home"}
              onClick={() => onStudentTabChange("home")}
            />
            <SidebarItem
              icon={BarChart3}
              label="Analysis"
              active={studentTab === "analysis"}
              onClick={() => onStudentTabChange("analysis")}
            />
          </nav>
          <div className="mt-auto px-3 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
            <div>AI-Capsule v0.1</div>
            <div className="text-slate-600">Frontend preview only</div>
          </div>
        </div>
      </aside>
    </>
  );
}
