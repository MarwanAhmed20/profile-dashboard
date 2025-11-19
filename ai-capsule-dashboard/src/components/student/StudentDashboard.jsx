import React from "react";
import { ArrowLeft, Grid, BarChart2, TrendingUp, CheckCircle, BookOpen } from "lucide-react";
import ProgressBar from "../common/ProgressBar";
import { getInitials } from "../../utils/getInitials";
import StudentDomainsSection from "./StudentDomainsSection";
import StudentAnalysisSection from "./StudentAnalysisSection";
import { studentsAPI } from "../../services/api";

export default function StudentDashboard({
  student,
  tab,
  domainScores = [],
  onBack,
  showBackForAdmin,
  onTabChange,
}) {
  const [strengthsWeaknessesData, setStrengthsWeaknessesData] = React.useState(null);
  const [weeklyProgressData, setWeeklyProgressData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  // Fetch data when tab changes to analysis
  React.useEffect(() => {
    if (tab === 'analysis' && student?.id) {
      setLoading(true);
      
      Promise.all([
        studentsAPI.getStrengthsWeaknesses(student.id),
        studentsAPI.getWeeklyProgress(student.id)
      ])
        .then(([swData, progressData]) => {
          setStrengthsWeaknessesData(swData);
          setWeeklyProgressData(progressData);
        })
        .catch(err => console.error('Failed to fetch analysis data:', err))
        .finally(() => setLoading(false));
    }
  }, [tab, student?.id]);

  if (!student) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading student data...</p>
        </div>
      </div>
    );
  }

  const fullName = `${student.user?.first_name || ''} ${student.user?.last_name || ''}`.trim() || 'Unknown';
  const progress = parseFloat(student.overall_score || 0);
  const domains = student?.domain_scores || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      {showBackForAdmin && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            <span className="hover:text-slate-300 cursor-pointer">Admin Dashboard</span>
            <span className="mx-2">›</span>
            <span className="hover:text-slate-300 cursor-pointer">Students</span>
            <span className="mx-2">›</span>
            <span className="text-slate-200 font-medium">{fullName}</span>
          </div>

          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
      )}

      {/* Header Card - Enhanced */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)] gap-5">
        <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-900/40 backdrop-blur-sm px-6 py-5 shadow-xl">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center text-xl font-bold shadow-lg ring-4 ring-slate-800">
                {getInitials(fullName)}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              {/* Name and Badges */}
              <div className="space-y-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-50 mb-2">{fullName}</h2>
                  <p className="text-sm text-slate-400">{student.user?.email}</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 font-medium">
                    {student.course?.name || 'No Course'}
                  </span>
                  <span className="px-3 py-1.5 rounded-xl border border-slate-600 bg-slate-800 text-xs text-slate-300 font-mono font-medium">
                    {student.student_id}
                  </span>
                </div>
              </div>

              {/* Progress Section */}
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">Overall Progress</span>
                  <span className="text-2xl font-bold text-indigo-400">{progress.toFixed(1)}%</span>
                </div>
                
                <div className="relative">
                  <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-4 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>🎯 {student.next_milestone || 'Portfolio checkpoint'}</span>
                  <span>{student.domains_mastered || 0} / {domains.length} domains mastered</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="flex flex-col gap-4">
          {student.overall_summary ? (
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm px-5 py-4 shadow-lg flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <h4 className="text-sm font-semibold text-slate-1000">Overall Summary</h4>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{student.overall_summary}</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/30 px-5 py-8 text-center flex-1">
              <p className="text-sm text-slate-500">No summary available</p>
            </div>
          )}

          {student.trainer_feedback ? (
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm px-5 py-4 shadow-lg flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="text-sm font-semibold text-slate-1000">Trainer Feedback</h4>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{student.trainer_feedback}</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/30 px-5 py-8 text-center flex-1">
              <p className="text-sm text-slate-500">No feedback yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs - Enhanced */}
      {onTabChange && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden shadow-lg">
          <div className="flex gap-2 px-2 py-2">
            <button
              onClick={() => onTabChange("home")}
              className={`
                flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all
                ${tab === "home"
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/50"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                }
              `}
            >
              <Grid className="w-4 h-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => onTabChange("analysis")}
              className={`
                flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all
                ${tab === "analysis"
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/50"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                }
              `}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Analysis</span>
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {tab === "home" ? (
        <div className="space-y-5">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100">Domain Performance</h3>
                <p className="text-sm text-slate-500">Track your progress across all domains</p>
              </div>
            </div>
            
            <div className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm font-semibold text-slate-300">
              {domains.length} Domains
            </div>
          </div>

          <StudentDomainsSection student={student} />
        </div>
      ) : (
        loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <StudentAnalysisSection 
            student={student} 
            domainScores={domainScores}
            strengthsWeaknessesData={strengthsWeaknessesData}
            weeklyProgressData={weeklyProgressData}
          />
        )
      )}
    </div>
  );
}
