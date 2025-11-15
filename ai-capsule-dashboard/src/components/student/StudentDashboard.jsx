import React from "react";
import { ArrowLeft } from "lucide-react";
import ProgressBar from "../common/ProgressBar";
import { getInitials } from "../../utils/getInitials";
import StudentDomainsSection from "./StudentDomainsSection";
import StudentAnalysisSection from "./StudentAnalysisSection";

export default function StudentDashboard({
  student,
  tab,
  domainScores = [],
  onBack,
  showBackForAdmin,
}) {
  console.log("StudentDashboard - student:", student);
  console.log("StudentDashboard - domainScores:", domainScores);

  if (!student) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading student data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          {showBackForAdmin && onBack && (
            <button
              onClick={onBack}
              className="mt-0.5 inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-950/80 px-2.5 py-1.5 text-[11px] text-slate-300 hover:bg-slate-900"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back to admin
            </button>
          )}
          <div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-2">
              Student Dashboard
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Personal AI-Capsule profile, progress, and domain evaluations.
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-500/5 px-3 py-1 text-[11px] text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          View mode · Read only
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-4 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center text-sm font-semibold">
              {getInitials(student.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight">
                  {student.name}
                </h2>
                <span className="rounded-full border border-slate-700 bg-slate-950/80 px-2 py-[3px] text-[11px] text-slate-300 uppercase tracking-[.16em]">
                  AI-Capsule Student
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-400 flex flex-wrap gap-2">
                <span>{student.email}</span>
                <span className="text-slate-700">•</span>
                <span>{student.group}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
            <div className="col-span-2 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Overall progress</span>
                <span className="text-slate-200 font-medium">
                  {student.progress}% of track
                </span>
              </div>
              <ProgressBar value={student.progress} height="h-2.5" />
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Program: AI-Capsule</span>
                <span>Next milestone: Portfolio checkpoint</span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/90 px-3 py-2 flex flex-col justify-between">
              <div className="text-[11px] text-slate-400 mb-1">Snapshot</div>
              <div className="text-[13px] text-slate-200 flex items-center justify-between">
                <span>Domains mastered</span>
                <span className="font-semibold">4 / 10</span>
              </div>
              <div className="mt-1 text-[11px] text-emerald-300">
                On track · Keep momentum
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] text-slate-400 uppercase tracking-[.16em]">
                Overall summary
              </div>
              <span className="rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-[2px] text-[10px]">
                Trainer view
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {student.overallSummary}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 flex flex-col gap-2">
            <div className="text-[11px] text-slate-400 uppercase tracking-[.16em]">
              Trainer feedback
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {student.trainerFeedback}
            </p>
          </div>
        </div>
      </div>

      {tab === "home" ? (
        <StudentDomainsSection domains={student.domains} />
      ) : (
        <StudentAnalysisSection domainScores={domainScores} />
      )}
    </div>
  );
}
