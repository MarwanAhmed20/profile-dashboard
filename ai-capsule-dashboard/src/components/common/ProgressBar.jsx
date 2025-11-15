import React from "react";

export default function ProgressBar({ value, height = "h-2" }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`w-full ${height} rounded-full bg-slate-900/80 border border-slate-800 overflow-hidden`}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-sky-400 transition-all duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
