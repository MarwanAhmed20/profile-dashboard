import React, { useState, useMemo } from "react";
import { 
  Search, Users, GraduationCap, TrendingUp, BookOpen, 
  Filter, Eye, Edit2, Trash2, Key, Settings, Plus,
  ChevronUp, ChevronDown
} from "lucide-react";
import ProgressBar from "../common/ProgressBar";
import StatCardModern from "../common/StatCardModern";
import Button from "../common/Button";
import { getInitials } from "../../utils/getInitials";

export default function AdminDashboard({ 
  students = [], 
  courses = [], 
  onView, 
  onEdit, 
  onAdd, 
  onDelete, 
  onManageCourses, 
  onManageDomains, 
  onManageAdminCode 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const coursesArray = Array.isArray(courses) ? courses : [];
    const totalCourses = coursesArray.length;
    const activeCourses = coursesArray.filter(c => c.is_active).length;
    
    return {
      totalStudents: students.length,
      totalCourses,
      activeCourses
    };
  }, [students, courses]);

  // Filter and search students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const fullName = `${s.user?.first_name || ""} ${s.user?.last_name || ""}`.toLowerCase();
      const email = (s.user?.email || "").toLowerCase();
      const studentId = (s.student_id || "").toLowerCase();
      const courseName = (s.course?.name || "").toLowerCase();
      
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase()) ||
        studentId.includes(searchTerm.toLowerCase()) ||
        courseName.includes(searchTerm.toLowerCase());
      
      const matchesCourse =
        filterCourse === "all" || 
        s.course?.id === parseInt(filterCourse) ||
        (!s.course && filterCourse === "none");
      
      return matchesSearch && matchesCourse;
    });
  }, [students, searchTerm, filterCourse]);

  // Calculate filtered stats based on selected course
  const filteredStats = useMemo(() => {
    const selectedCourse = courses.find(c => c.id === parseInt(filterCourse));
    const studentsInCourse = filterCourse === "all" 
      ? students 
      : filterCourse === "none"
      ? students.filter(s => !s.course)
      : students.filter(s => s.course?.id === parseInt(filterCourse));
    
    const avgProgress = studentsInCourse.length > 0
      ? (studentsInCourse.reduce((sum, s) => sum + parseFloat(s.overall_score || 0), 0) / studentsInCourse.length).toFixed(1)
      : 0;
    
    const numDomains = selectedCourse?.domains?.length || 0;
    
    return {
      totalStudents: studentsInCourse.length,
      avgProgress,
      numDomains,
      courseName: selectedCourse?.name || (filterCourse === "none" ? "No Course" : "All Courses")
    };
  }, [students, courses, filterCourse]);

  // Sort students
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === "name") {
        aValue = `${a.user?.first_name || ""} ${a.user?.last_name || ""}`.toLowerCase();
        bValue = `${b.user?.first_name || ""} ${b.user?.last_name || ""}`.toLowerCase();
        return sortOrder === "asc" 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else if (sortBy === "progress") {
        aValue = parseFloat(a.overall_score || 0);
        bValue = parseFloat(b.overall_score || 0);
      } else {
        aValue = a[sortBy] || 0;
        bValue = b[sortBy] || 0;
      }
      
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [filteredStudents, sortBy, sortOrder]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb & Header */}
      <div className="flex items-center justify-between">
        <div>
          <nav className="text-sm text-slate-400 mb-2">
            Admin Dashboard → <span className="text-slate-200">Student Management</span>
          </nav>
          <h1 className="text-3xl font-bold text-slate-100">Student Management</h1>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="md" 
            icon={Key}
            onClick={onManageAdminCode}
          >
            Admin Code
          </Button>
          <Button 
            variant="outline" 
            size="md" 
            icon={BookOpen}
            onClick={onManageDomains}
          >
            Domains
          </Button>
          <Button 
            variant="outline" 
            size="md" 
            icon={GraduationCap}
            onClick={onManageCourses}
          >
            Courses
          </Button>
          <Button 
            variant="primary" 
            size="md" 
            icon={Plus}
            onClick={onAdd}
          >
            Add Student
          </Button>
        </div>
      </div>

      {/* Overall Stats - Modern Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCardModern
          icon={Users}
          label="Total Students"
          value={overallStats.totalStudents}
          trend="Across all courses"
          color="blue"
        />
        <StatCardModern
          icon={GraduationCap}
          label="Total Courses"
          value={overallStats.totalCourses}
          trend="In the system"
          color="emerald"
        />
        <StatCardModern
          icon={TrendingUp}
          label="Active Courses"
          value={overallStats.activeCourses}
          trend={`${((overallStats.activeCourses / overallStats.totalCourses) * 100 || 0).toFixed(0)}% of total`}
          color="purple"
        />
      </div>

      {/* Course Filter Section */}
      <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-slate-100">Course Insights</h2>
          </div>
          
          <select 
            className="rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-w-[250px]"
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
          >
            <option value="all">All Courses</option>
            <option value="none">No Course Assigned</option>
            {Array.isArray(courses) && courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/30 rounded-xl p-5 border border-slate-700/50 hover:border-blue-500/50 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-sm text-slate-400 font-medium">Students Enrolled</p>
            </div>
            <p className="text-3xl font-bold text-blue-400">{filteredStats.totalStudents}</p>
            <p className="text-xs text-slate-500 mt-2">
              {((filteredStats.totalStudents / overallStats.totalStudents) * 100 || 0).toFixed(1)}% of total
            </p>
          </div>

          <div className="bg-slate-900/30 rounded-xl p-5 border border-slate-700/50 hover:border-emerald-500/50 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-sm text-slate-400 font-medium">Average Progress</p>
            </div>
            <p className="text-3xl font-bold text-emerald-400">{filteredStats.avgProgress}%</p>
            <p className="text-xs text-slate-500 mt-2">
              {filteredStats.avgProgress >= 70 ? "✅ Good performance" : "⚠️ Needs attention"}
            </p>
          </div>

          <div className="bg-slate-900/30 rounded-xl p-5 border border-slate-700/50 hover:border-purple-500/50 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <BookOpen className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-sm text-slate-400 font-medium">Domains</p>
            </div>
            <p className="text-3xl font-bold text-purple-400">{filteredStats.numDomains}</p>
            <p className="text-xs text-slate-500 mt-2">
              {filterCourse === "all" ? "Varies by course" : "In this course"}
            </p>
          </div>
        </div>
      </div>

      {/* Students Table - Modern Design */}
      <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
        {/* Table Header with Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-700/50 px-6 py-5 bg-slate-900/20">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/10 border border-indigo-500/30">
              <span className="text-lg font-bold text-indigo-400">{filteredStudents.length}</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-100">Active Students</h3>
              {searchTerm && (
                <p className="text-xs text-slate-500">Filtered from {students.length} total</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                placeholder="Search students..."
                className="w-full md:w-64 rounded-xl border border-slate-600 bg-slate-900/50 pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              className="rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Name</option>
              <option value="progress">Progress</option>
            </select>
            
            <button
              onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
              className="p-2.5 rounded-xl border border-slate-600 bg-slate-900/50 text-slate-200 hover:bg-slate-800 transition-all"
            >
              {sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/40 border-b border-slate-700/50">
              <tr>
                <th className="text-left font-semibold text-sm text-slate-300 px-6 py-4">Student</th>
                <th className="text-left font-semibold text-sm text-slate-300 px-6 py-4">Email</th>
                <th className="text-left font-semibold text-sm text-slate-300 px-6 py-4">Course</th>
                <th className="text-left font-semibold text-sm text-slate-300 px-6 py-4">Progress</th>
                <th className="text-right font-semibold text-sm text-slate-300 px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                        <Users className="w-8 h-8 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-slate-400 mb-1">No students found</p>
                        <p className="text-sm text-slate-500">
                          {searchTerm ? "Try adjusting your search filters" : "Click 'Add Student' to get started"}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedStudents.map((s, idx) => (
                  <tr
                    key={s.id}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-sm font-semibold shadow-lg group-hover:scale-110 transition-transform">
                          {getInitials(`${s.user?.first_name || ""} ${s.user?.last_name || ""}`)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-100">
                            {s.user?.first_name} {s.user?.last_name}
                          </p>
                          <p className="text-xs text-slate-500 font-mono">{s.student_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{s.user?.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-xs font-medium text-indigo-400">
                        {s.course?.name || "No course"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-32">
                        <ProgressBar value={parseFloat(s.overall_score || 0)} height="h-2" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onView(s)}
                          className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-blue-400 transition-all"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(s)}
                          className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-emerald-400 transition-all"
                          title="Edit Student"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(s.id)}
                          className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-all"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/20 border-t border-slate-700/50">
          <p className="text-sm text-slate-400">
            Showing <span className="font-semibold text-slate-200">{sortedStudents.length}</span> of{' '}
            <span className="font-semibold text-slate-200">{students.length}</span> students
          </p>
          {filterCourse !== "all" && (
            <p className="text-xs text-slate-500">
              Filtered by: <span className="text-indigo-400">{filteredStats.courseName}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
