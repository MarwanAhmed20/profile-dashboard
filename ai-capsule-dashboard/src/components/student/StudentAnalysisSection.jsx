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
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  Legend,
} from "recharts";

// Custom label for bar chart
const CustomBarLabel = (props) => {
  const { x, y, width, value } = props;
  return (
    <text
      x={x + width / 2}
      y={y - 5}
      fill="#fff"
      textAnchor="middle"
      fontSize={12}
      fontWeight="600"
    >
      {value}%
    </text>
  );
};

// Get color based on score
const getScoreColor = (score) => {
  if (score >= 85) return '#22c55e'; 
  if (score >= 70) return '#eab308'; 
  if (score >= 60) return '#3b82f6'; 
  return '#ef4444'; // red
};

// Custom tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const score = payload[0].value;
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl">
        <p className="text-sm font-semibold text-slate-200">{payload[0].payload.domain}</p>
        <p className="text-xs text-slate-400 mt-1">
          Score: <span className="font-bold text-blue-400">{score}%</span>
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {score >= 85 ? 'Excellent!' : score >= 70 ? 'Good' : score >= 60 ? 'Fair' : 'Needs Work'}
        </p>
      </div>
    );
  }
  return null;
};

export default function StudentAnalysisSection({ domainScores, strengthsWeaknessesData, weeklyProgressData, student }) {
  // Use data from props instead of computing locally
  const swData = strengthsWeaknessesData || {
    strengths: [],
    weaknesses: [],
    chart_data: [
      { category: 'Strengths', count: 0, color: '#22c55e' },
      { category: 'Weaknesses', count: 0, color: '#ef4444' }
    ]
  };

  // Use weekly progress data from backend
  const timelineData = weeklyProgressData?.weeks || [];

  // Prepare doughnut data (performance categories)
  const doughnutData = React.useMemo(() => {
    const excellent = domainScores.filter(d => d.score >= 85).length;
    const good = domainScores.filter(d => d.score >= 70 && d.score < 85).length;
    const fair = domainScores.filter(d => d.score >= 60 && d.score < 70).length;
    const needsWork = domainScores.filter(d => d.score < 60).length;

    return [
      { name: 'Excellent (≥85%)', value: excellent, color: '#22c55e' },
      { name: 'Good (70-84%)', value: good, color: '#eab308' },
      { name: 'Fair (60-69%)', value: fair, color: '#3f7ee5ff' },
      { name: 'Needs Work (<60%)', value: needsWork, color: '#ef4444' },
    ].filter(item => item.value > 0);
  }, [domainScores]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            Progress Analysis
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Visual overview of per-domain performance inside the AI-Capsule.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-3 w-3 rounded-full bg-green-400" />
            <span className="text-slate-400">Excellent (≥85%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-3 w-3 rounded-full bg-yellow-400" />
            <span className="text-slate-400">Good (70-84%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-3 w-3 rounded-full bg-blue-400" />
            <span className="text-slate-400">Fair (60-69%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-3 w-3 rounded-full bg-red-400" />
            <span className="text-slate-400">Needs Work</span>
          </div>
        </div>
      </div>

      {/* Bar Chart - Enhanced */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300">Per-Domain Scores</h3>
          <span className="text-xs text-slate-500">Bar Chart</span>
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={domainScores}
              margin={{ top: 30, right: 30, left: 10, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="domain"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={{ stroke: "#334155" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={{ stroke: "#334155" }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
              <Bar
                dataKey="score"
                radius={[8, 8, 0, 0]}
                label={<CustomBarLabel />}
                animationDuration={1000}
                animationBegin={0}
              >
                {domainScores.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart - Optimized */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300">Skill Radar</h3>
            <span className="text-xs text-slate-500">Radar Chart</span>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={domainScores} outerRadius="95%">
                <PolarGrid stroke="#334155" strokeWidth={1} />
                <PolarAngleAxis
                  dataKey="domain"
                  tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  angle={90}
                  domain={[0, 100]}
                  stroke="#334155"
                />
                <Tooltip content={<CustomTooltip />} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.4}
                  strokeWidth={2}
                  animationDuration={1000}
                  animationBegin={200}
                  dot={{ r: 4, fill: '#3b82f6' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300">Performance Distribution</h3>
            <span className="text-xs text-slate-500">Doughnut Chart</span>
          </div>
          <div className="h-[350px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={doughnutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={110}
                  outerRadius={160}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1000}
                  animationBegin={400}
                  label={({ name, value }) => `${value}`}
                  labelLine={{ stroke: '#64748b', strokeWidth: 1 }}
                >
                  {doughnutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl">
                          <p className="text-sm font-semibold text-slate-200">{payload[0].name}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            Domains: <span className="font-bold text-blue-400">{payload[0].value}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {doughnutData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-400">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-300">{item.value} domains</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses Chart */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300">Strengths vs Weaknesses Analysis</h3>
          <span className="text-xs text-slate-500">
            Total: {swData.strengths.length + swData.weaknesses.length} items
          </span>
        </div>
        
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={swData.chart_data}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                type="number" 
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={{ stroke: "#334155" }}
              />
              <YAxis 
                type="category" 
                dataKey="category" 
                tick={{ fontSize: 13, fill: "#94a3b8", fontWeight: 600 }}
                width={90}
                tickLine={false}
                axisLine={{ stroke: "#334155" }}
              />
              <Tooltip 

                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl">
                        <p className="text-sm font-semibold text-slate-200">{payload[0].payload.category}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Count: <span className="font-bold text-blue-400">{payload[0].value}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} 
              />
              <Bar 
                dataKey="count" 
                radius={[0, 8, 8, 0]}
                animationDuration={1000}
                label={{
                  position: 'right',
                  fill: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  formatter: (value) => value
                }}
              >
                {swData.chart_data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-400">
              {swData.strengths.length}
            </div>
            <div className="text-xs text-slate-400 mt-1">Total Strengths</div>
          </div>
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-red-400">
              {swData.weaknesses.length}
            </div>
            <div className="text-xs text-slate-400 mt-1">Total Weaknesses</div>
          </div>
        </div>
      </div>

      {/* Line Chart - Progress Timeline */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-300">Overall Progress per Week</h3>
            <p className="text-xs text-slate-500 mt-1">
              {weeklyProgressData?.has_data ? (
                <>
                  {weeklyProgressData?.course_duration ? (
                    <>
                      Course: {student?.course?.name || 'N/A'} • Duration: {weeklyProgressData.course_duration} weeks
                      {weeklyProgressData?.current_average !== undefined && (
                        <span className="ml-2 text-blue-400 font-semibold">
                          • Current: {weeklyProgressData.current_average}%
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      Weekly average score progression
                      {weeklyProgressData?.current_average !== undefined && (
                        <span className="ml-2 text-blue-400 font-semibold">
                          Current: {weeklyProgressData.current_average}%
                        </span>
                      )}
                    </>
                  )}
                  {weeklyProgressData?.program_start_date && (
                    <span className="ml-2 text-slate-500">
                      (Start: {new Date(weeklyProgressData.program_start_date).toLocaleDateString()})
                    </span>
                  )}
                  {student?.course?.end_date && (
                    <span className="ml-2 text-slate-500">
                      • End: {new Date(student.course.end_date).toLocaleDateString()}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-yellow-400">No course or start date set</span>
              )}
            </p>
          </div>
          <span className="text-xs text-slate-500">
            {timelineData.length > 0 && `${timelineData.length} weeks recorded`}
          </span>
        </div>
        
        {!weeklyProgressData?.has_data ? (
          <div className="h-[300px] flex items-center justify-center border border-slate-700 rounded-lg">
            <div className="text-center text-slate-400">
              <p className="text-sm font-medium">No Weekly Progress Data</p>
              <p className="text-xs mt-2">Assign student to a course or set a program start date to track weekly progress</p>
            </div>
          </div>
        ) : timelineData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">
            No weekly progress data available
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={timelineData}
                margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={{ stroke: "#334155" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={{ stroke: "#334155" }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl">
                          <p className="text-sm font-semibold text-slate-200">{payload[0].payload.week}</p>
                          <p className="text-xs text-slate-500 mt-1">{payload[0].payload.date}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            Avg Score: <span className="font-bold text-emerald-400">{payload[0].value}%</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  iconType="line"
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Weekly Average"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ fill: '#22c55e', r: 5 }}
                  activeDot={{ r: 7, fill: '#22c55e', stroke: '#fff', strokeWidth: 2 }}
                  animationDuration={1500}
                  animationBegin={600}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

    </section>
  );
}
