import React from "react";

export default function StudentOverview({ student }) {
  const stats = [
    {
      label: "Overall Score",
      value: `${parseFloat(student?.overall_score || 0).toFixed(1)}%`,
      icon: "📊",
      color: "text-blue-400",
    },
    {
      label: "Grade Level",
      value: student?.grade_level || "N/A",
      icon: "🎓",
      color: "text-green-400",
    },
    {
      label: "Student ID",
      value: student?.student_id || "N/A",
      icon: "🆔",
      color: "text-purple-400",
    },
    {
      label: "Total Domains",
      value: student?.domain_scores?.length || 0,
      icon: "📚",
      color: "text-orange-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">{stat.icon}</div>
            <div>
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}