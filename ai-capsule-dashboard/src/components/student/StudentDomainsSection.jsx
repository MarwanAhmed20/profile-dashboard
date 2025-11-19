import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, AlertTriangle, CheckCircle, BookOpen } from 'lucide-react';


export default function StudentDomainsSection({ student }) {
  const [expandedDomain, setExpandedDomain] = useState(null);
  const domains = student?.domain_scores || [];

  const toggleDomain = (domainId) => {
    setExpandedDomain(expandedDomain === domainId ? null : domainId);
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 70) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    if (score >= 60) return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    return 'text-red-400 bg-red-500/10 border-red-500/30';
  };

  const getProgressColor = (score) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 60) return 'bg-blue-500';
    return 'bg-red-500';
  };

  if (domains.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900/30 p-12 text-center">
        <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">No domain data available yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {domains.map((domain) => {
        const isExpanded = expandedDomain === domain.id;
        const score = parseFloat(domain.score || 0);

        return (
          <div
            key={domain.id}
            className={`
              rounded-2xl border border-slate-700 bg-slate-900/40 backdrop-blur-sm 
              transition-all duration-300 hover:shadow-xl hover:-translate-y-1
              ${isExpanded ? 'lg:col-span-3 md:col-span-2' : ''}
            `}
          >
            {/* Collapsed View */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-slate-100 leading-tight">
                      {domain.domain_name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Last updated: {new Date(domain.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className={`px-3 py-1 rounded-xl border text-lg font-bold ${getScoreColor(score)}`}>
                  {score}%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Progress</span>
                  <span className="font-medium text-slate-300">{score.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${getProgressColor(score)}`}
                    style={{ width: `${Math.min(score, 100)}%` }}
                  />
                </div>
              </div>

              {/* Toggle Button */}
              <button
                onClick={() => toggleDomain(domain.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-600 bg-slate-800/50 text-sm font-medium text-slate-300 hover:bg-slate-700/50 hover:border-indigo-500/50 transition-all"
              >
                {isExpanded ? (
                  <>
                    Hide Details <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    View Details <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Expanded View */}
            {isExpanded && (
              <div className="px-5 pb-5 space-y-4 animate-fade-in">
                <div className="h-px bg-slate-700" />

                {/* Strengths Section */}
                {domain.strengths && domain.strengths.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <h4 className="text-sm font-semibold text-emerald-400">Strengths</h4>
                      <span className="text-xs text-slate-500">({domain.strengths.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {domain.strengths.map((strength, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all group"
                        >
                          <h5 className="text-sm font-semibold text-slate-200 mb-1 group-hover:text-emerald-400 transition-colors">
                            {strength.title}
                          </h5>
                          {strength.description && (
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {strength.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weaknesses Section */}
                {domain.weaknesses && domain.weaknesses.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                      <h4 className="text-sm font-semibold text-yellow-400">Areas for Improvement</h4>
                      <span className="text-xs text-slate-500">({domain.weaknesses.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {domain.weaknesses.map((weakness, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h5 className="text-sm font-semibold text-slate-200 group-hover:text-yellow-400 transition-colors">
                              {weakness.title}
                            </h5>
                            <span className="px-2 py-0.5 rounded-md bg-yellow-500/20 text-[10px] font-medium text-yellow-400 whitespace-nowrap">
                              Needs Work
                            </span>
                          </div>
                          {weakness.description && (
                            <p className="text-xs text-slate-400 leading-relaxed mb-2">
                              {weakness.description}
                            </p>
                          )}
                          {weakness.improvement_suggestion && (
                            <div className="mt-2 pt-2 border-t border-yellow-500/10">
                              <p className="text-xs text-slate-500 italic">
                                💡 {weakness.improvement_suggestion}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {(!domain.strengths || domain.strengths.length === 0) && 
                 (!domain.weaknesses || domain.weaknesses.length === 0) && (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    No detailed feedback available for this domain yet
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
