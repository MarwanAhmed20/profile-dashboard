import React from "react";

export default function DomainCard({ domain }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-[11px] text-slate-400 uppercase tracking-[.16em]">
            {domain.key.toUpperCase()}
          </div>
          <div className="text-sm font-semibold tracking-tight">
            {domain.name}
          </div>
        </div>
        <div className="flex flex-col items-end text-right">
          <div className="text-xs text-slate-400">Score</div>
          <div className="text-lg font-semibold tracking-tight">
            {domain.score}
            <span className="text-[11px] text-slate-500"> / 100</span>
          </div>
        </div>
      </div>
      <div className="mt-1 flex flex-col gap-2">
        <div className="flex gap-2 text-[11px]">
          <span className="mt-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-[2px]">
            Strengths
          </span>
          <div className="flex flex-wrap gap-1.5">
            {domain.strengths.map((s, i) => (
              <span
                key={i}
                className="rounded-full bg-slate-900/80 border border-slate-700 px-2 py-[2px] text-[11px] text-slate-200"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2 text-[11px]">
          <span className="mt-0.5 rounded-full bg-red-500/10 text-red-300 border border-red-500/20 px-2 py-[2px]">
            Weaknesses
          </span>
          <div className="flex flex-wrap gap-1.5">
            {domain.weaknesses.map((w, i) => (
              <span
                key={i}
                className="rounded-full bg-slate-900/80 border border-slate-800 px-2 py-[2px] text-[11px] text-slate-300"
              >
                {w}
              </span>
            ))}
          </div>
        </div>
      </div>
      {domain.notes && (
        <div className="mt-1 rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-[11px] text-slate-300">
          {domain.notes}
        </div>
      )}
    </div>
  );
}
