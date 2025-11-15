import React from "react";
import { X } from "lucide-react";

export default function StudentFormModal({
  open,
  mode = "add",
  student,
  onClose,
}) {
  const isEdit = mode === "edit";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-950/95 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div>
            <div className="text-xs font-semibold tracking-tight text-slate-50">
              {isEdit ? "Edit student" : "Add new student"}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {isEdit
                ? "Update core profile information for this AI-Capsule student."
                : "Create a new AI-Capsule student profile for this cohort."}
            </div>
          </div>
          <button
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-slate-400 hover:bg-slate-900"
            onClick={onClose}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="px-4 pt-4 pb-3 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-slate-300">Full name</label>
              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500/70 placeholder:text-slate-500"
                placeholder="Omar Hassan"
                defaultValue={isEdit ? student?.name : ""}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-slate-300">Email</label>
              <input
                type="email"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500/70 placeholder:text-slate-500"
                placeholder="omar.hassan@example.com"
                defaultValue={isEdit ? student?.email : ""}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-slate-300">Group / Cohort</label>
              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500/70 placeholder:text-slate-500"
                placeholder="Cohort A – Track: GenAI Engineer"
                defaultValue={isEdit ? student?.group : ""}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-slate-300">Track</label>
              <select className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500/70 text-slate-200">
                <option>GenAI Engineer</option>
                <option>ML Engineer</option>
                <option>Data Scientist</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-slate-300">Progress (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500/70 placeholder:text-slate-500"
                placeholder="76"
                defaultValue={isEdit ? student?.progress : ""}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-300">
              Overall performance summary
            </label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500/70 placeholder:text-slate-500 text-xs"
              placeholder="High-level summary of the student's performance across domains..."
              defaultValue={isEdit ? student?.overallSummary : ""}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-300">Trainer feedback</label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500/70 placeholder:text-slate-500 text-xs"
              placeholder="Specific actions and focus areas for the next capsule..."
              defaultValue={isEdit ? student?.trainerFeedback : ""}
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-950/95 text-[11px]">
          <span className="text-slate-500">
            This is a UI-only modal. Saving will be wired to the API later.
          </span>
          <div className="flex items-center gap-2">
            <button
              className="rounded-full border border-slate-700 px-3 py-1.5 text-slate-300 hover:bg-slate-900"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="rounded-full border border-emerald-500 bg-emerald-500 text-slate-950 px-3 py-1.5 font-medium hover:bg-emerald-400">
              {isEdit ? "Save changes" : "Create student"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
