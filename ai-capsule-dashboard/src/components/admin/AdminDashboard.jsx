import React, { useState } from "react";
import { Search } from "lucide-react";
import ProgressBar from "../common/ProgressBar";
import StatCard from "../common/StatCard";
import { getInitials } from "../../utils/getInitials";

export default function AdminDashboard({ students, onView, onEdit, onAdd, onDelete }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const filteredStudents = students.filter((s) => {
    const fullName = `${s.user?.first_name || ""} ${s.user?.last_name || ""}`
      .toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      (s.student_id || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade =
      filterGrade === "all" || s.grade_level === filterGrade;
    return matchesSearch && matchesGrade;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const aValue = a[sortBy] || 0;
    const bValue = b[sortBy] || 0;
    return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-2">
            Admin Dashboard
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Manage AI-Capsule student profiles, evaluations, and cohorts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-900"
            onClick={onAdd}
          >
            + Add Student
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 px-3 py-1.5 text-[11px] text-slate-300 hover:bg-slate-900">
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          label="Total students"
          value={students.length}
          trend={"+3 this cohort"}
        />
        <StatCard label="Avg progress" value="76%" trend={"+4% vs last month"} />
        <StatCard label="Active cohorts" value={"2"} trend={"GenAI, ML"} />
      </div>

      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-800 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 border border-slate-700 text-[11px]">
              {students.length}
            </span>
            <span>Students in current view</span>
          </div>
          <div className="flex flex-1 md:flex-none items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                placeholder="Search by name, email, or track..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950/60 pl-7 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500/60 placeholder:text-slate-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="rounded-xl border border-slate-700 bg-slate-950/60 px-2 py-1.5 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500/60">
              <option>All tracks</option>
              <option>GenAI Engineer</option>
              <option>ML Engineer</option>
              <option>Data Scientist</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="text-left font-medium px-4 py-2">Student</th>
                <th className="text-left font-medium px-4 py-2">Email</th>
                <th className="text-left font-medium px-4 py-2">Group / Track</th>
                <th className="text-left font-medium px-4 py-2">Progress</th>
                <th className="text-right font-medium px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((s, idx) => (
                <tr
                  key={s.id}
                  className={
                    idx % 2 === 0
                      ? "border-b border-slate-900/60"
                      : "border-b border-slate-900/40 bg-slate-950/40"
                  }
                >
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-500/80 to-sky-500/80 flex items-center justify-center text-[11px] font-semibold">
                        {getInitials(
                          `${s.user?.first_name || ""} ${s.user?.last_name || ""}`
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-[13px]">
                          {s.user?.first_name || ""} {s.user?.last_name || ""}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          ID #{s.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-slate-300">
                    {s.email}
                  </td>
                  <td className="px-4 py-2 min-w-[180px]">
                    <div className="text-[12px] text-slate-200">{s.group}</div>
                    {s.track && (
                      <div className="mt-0.5 inline-flex items-center rounded-full border border-slate-700 bg-slate-950/60 px-2 py-[2px] text-[10px] text-slate-400 uppercase tracking-[.16em]">
                        {s.track}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 w-40">
                    <ProgressBar value={s.progress} />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        className="rounded-full border border-slate-700 bg-slate-950/70 px-2.5 py-1 text-[11px] text-slate-200 hover:bg-slate-900"
                        onClick={() => onView(s)}
                      >
                        View
                      </button>
                      <button
                        className="rounded-full border border-sky-700/80 bg-sky-600/10 px-2.5 py-1 text-[11px] text-sky-300 hover:bg-sky-600/20"
                        onClick={() => onEdit(s)}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded-full border border-red-800/80 bg-red-900/20 px-2.5 py-1 text-[11px] text-red-300 hover:bg-red-900/40"
                        onClick={() =>
                          alert("Delete will be wired to API later.")
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 text-[11px] text-slate-500 border-t border-slate-800 bg-slate-950/80">
          <span>Showing {students.length} students</span>
          <div className="inline-flex items-center gap-1">
            <button className="rounded-full border border-slate-700 px-2 py-0.5 text-[11px] hover:bg-slate-900">
              Prev
            </button>
            <button className="rounded-full border border-slate-700 px-2 py-0.5 text-[11px] hover:bg-slate-900">
              Next
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedStudents.map((student) => (
          <div
            key={student.id}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500/80 to-sky-500/80 flex items-center justify-center text-[24px] font-semibold">
                {getInitials(
                  `${student.user?.first_name || ""} ${student.user?.last_name || ""}`
                )}
              </div>
              <div className="flex-1">
                <div className="text-lg font-medium">
                  {student.user?.first_name || ""} {student.user?.last_name || ""}
                </div>
                <div className="text-sm text-slate-400">
                  ID #{student.id} - {student.email}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-4">
              <div className="text-xs font-medium text-slate-500">
                Group / Track
              </div>
              <div className="text-sm text-slate-200">{student.group}</div>
              {student.track && (
                <div className="mt-0.5 inline-flex items-center rounded-full border border-slate-700 bg-slate-950/60 px-2 py-[2px] text-[10px] text-slate-400 uppercase tracking-[.16em]">
                  {student.track}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 mb-4">
              <div className="text-xs font-medium text-slate-500">Progress</div>
              <ProgressBar value={student.progress} />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onView(student)}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                View
              </button>
              <button
                onClick={() => onEdit(student)}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(student.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                title="Delete Student"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
