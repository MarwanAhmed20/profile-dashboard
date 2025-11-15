import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

export default function StudentAnalysisSection({ domainScores }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold tracking-tight flex items-center gap-2">
            Progress analysis
          </h2>
          <p className="text-[11px] text-slate-400 mt-1">
            Visual overview of per-domain performance inside the AI-Capsule.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          Score / 100
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 flex flex-col gap-3 min-h-[260px]">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Per-domain scores</span>
            <span className="text-[11px] text-slate-500">Bar chart</span>
          </div>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={domainScores}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="domain"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={{ stroke: "#1e293b" }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={{ stroke: "#1e293b" }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    borderRadius: 12,
                    border: "1px solid #1f2937",
                    fontSize: 11,
                    padding: 8,
                  }}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 flex flex-col gap-3 min-h-[260px]">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Skill radar</span>
            <span className="text-[11px] text-slate-500">Radar chart</span>
          </div>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={domainScores} outerRadius="70%">
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis
                  dataKey="domain"
                  tick={{ fontSize: 9, fill: "#94a3b8" }}
                />
                <PolarRadiusAxis
                  tick={{ fontSize: 9, fill: "#64748b" }}
                  angle={90}
                  domain={[0, 100]}
                  stroke="#1e293b"
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
