import React from "react";
import { X } from "lucide-react";

export default function EvaluationEditor({ student, onClose }) {
  const domains = student?.domains || [];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-5xl rounded-3xl border border-slate-800 bg-slate-950/95 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div>
            <div className="text-xs font-semibold tracking-tight text-slate-50 flex items-center gap-2">
              Edit domain evaluations
              {student && (
                <span className="rounded-full border border-slate-700 bg-slate-950/80 px-2 py-[2px] text-[10px] text-slate-300 uppercase tracking-[.16em]">
                  {student.name}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Update scores, strengths, weaknesses, and notes across all
              AI-Capsule domains.
            </div>
          </div>
          <button
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-slate-400 hover:bg-slate-900"
            onClick={onClose}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-xs">
          {domains.map((d) => (
            <div
              key={d.key}
              className="rounded-2xl border border-slate-800 bg-slate-950/90 px-3 py-3 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-[.16em]">
                    {d.key.toUpperCase()}
                  </div>
                  <div className="text-sm font-semibold tracking-tight text-slate-50">
                    {d.name}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Score</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={d.score}
                    className="w-16 rounded-lg border border-slate-700 bg-slate-950/80 px-2 py-1 text-right text-[11px] outline-none focus:ring-1 focus:ring-emerald-500/70"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="block text-slate-300">Strengths</label>
                  <textarea
                    rows={2}
                    defaultValue={d.strengths?.join(", ")}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-2.5 py-2 text-[11px] outline-none focus:ring-1 focus:ring-emerald-500/70 placeholder:text-slate-500"
                    placeholder="Comma-separated strengths (e.g. Linear algebra, Calculus basics)"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-slate-300">Weaknesses</label>
                  <textarea
                    rows={2}
                    defaultValue={d.weaknesses?.join(", ")}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-2.5 py-2 text-[11px] outline-none focus:ring-1 focus:ring-emerald-500/70 placeholder:text-slate-500"
                    placeholder="Comma-separated weaknesses (e.g. Hypothesis testing, Transformers)"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-300">Notes</label>
                <textarea
                  rows={2}
                  defaultValue={d.notes}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-2.5 py-2 text-[11px] outline-none focus:ring-1 focus:ring-emerald-500/70 placeholder:text-slate-500"
                  placeholder="Trainer notes or next steps for this domain..."
                />
              </div>
            </div>
          ))}

          {domains.length === 0 && (
            <div className="text-[11px] text-slate-500">
              No domains configured for this student yet. Once you add domain
              evaluations, they will appear here.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-950/95 text-[11px]">
          <span className="text-slate-500">
            Changes are not persisted yet. We will connect this editor to the
            DRF API layer.
          </span>
          <div className="flex items-center gap-2">
            <button
              className="rounded-full border border-slate-700 px-3 py-1.5 text-slate-300 hover:bg-slate-900"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="rounded-full border border-emerald-500 bg-emerald-500 text-slate-950 px-3 py-1.5 font-medium hover:bg-emerald-400">
              Save evaluations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
