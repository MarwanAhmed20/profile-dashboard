import React from "react";

export default function StatCard({ label, value, trend }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 flex flex-col gap-2">
      <div className="text-[11px] text-slate-500 uppercase tracking-[.16em]">
        {label}
      </div>
      <div className="text-lg font-semibold tracking-tight">{value}</div>
      <div className="text-[11px] text-emerald-400/90">{trend}</div>
    </div>
  );
}
