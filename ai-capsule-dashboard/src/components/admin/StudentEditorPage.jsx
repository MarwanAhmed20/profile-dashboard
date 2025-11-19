import React, { useState, useEffect } from "react";
import DomainScoreEditor from "./DomainScoreEditor";
import { coursesAPI } from "../../services/api";

export default function StudentEditorPage({
  mode,
  student,
  defaultDomains,
  onBack,
  onSave,
}) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    next_milestone: "Portfolio checkpoint",
    total_domains: 10,
    overall_summary: "",
    trainer_feedback: "",
    program_start_date: "",
    course_id: null,
  });

  const [courses, setCourses] = useState([]);
  const [domainScores, setDomainScores] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const loadCourses = async () => {
    setLoadingCourses(true);
    try {
      const data = await coursesAPI.getAll();
      console.log('Courses loaded:', data);
      const coursesArray = Array.isArray(data) ? data : data.results || [];
      setCourses(coursesArray.filter(c => c.is_active));
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    loadCourses();

    if (mode === "edit" && student) {
      setFormData({
        email: student.user?.email || "",
        first_name: student.user?.first_name || "",
        last_name: student.user?.last_name || "",
        password: "",
        program: student.course?.name || "AI-Capsule",
        next_milestone: student.next_milestone || "Portfolio checkpoint",
        total_domains: student.total_domains || 10,
        overall_summary: student.overall_summary || "",
        trainer_feedback: student.trainer_feedback || "",
        program_start_date: student.program_start_date || "",
        course_id: student.course?.id || null,
      });

      // Map existing domain scores with strengths and weaknesses
      if (student.domain_scores && Array.isArray(student.domain_scores)) {
        setDomainScores(
          student.domain_scores.map((ds) => ({
            domain_id: ds.domain,
            domain_name: ds.domain_name,
            score: parseFloat(ds.score || 0),
            strengths: ds.strengths || [],
            weaknesses: ds.weaknesses || [],
          }))
        );
      }
    } else if (defaultDomains && Array.isArray(defaultDomains)) {
      // Initialize with default domains for new student
      setDomainScores(
        defaultDomains.map((d) => ({
          domain_id: d.id,
          domain_name: d.name,
          score: 0,
          strengths: [],
          weaknesses: [],
        }))
      );
    }
  }, [mode, student, defaultDomains]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleDomainScoreChange = (domainId, score) => {
    setDomainScores((prev) =>
      prev.map((ds) =>
        ds.domain_id === domainId
          ? { ...ds, score: Math.min(100, Math.max(0, parseFloat(score) || 0)) }
          : ds
      )
    );
  };

  const handleStrengthsChange = (domainId, strengths) => {
    setDomainScores((prev) =>
      prev.map((ds) =>
        ds.domain_id === domainId ? { ...ds, strengths } : ds
      )
    );
  };

  const handleWeaknessesChange = (domainId, weaknesses) => {
    setDomainScores((prev) =>
      prev.map((ds) =>
        ds.domain_id === domainId ? { ...ds, weaknesses } : ds
      )
    );
  };

  const handleCourseChange = async (e) => {
    const courseId = e.target.value ? parseInt(e.target.value) : null;
    const selectedCourse = courses.find(c => c.id === courseId);
    
    if (selectedCourse) {
      setFormData(prev => ({
        ...prev,
        course_id: courseId,
        program: selectedCourse.name,
        program_start_date: selectedCourse.start_date,
        total_domains: selectedCourse.domains.length,
      }));
      
      // Update domain scores based on course domains
      if (selectedCourse.domains && selectedCourse.domains.length > 0) {
        const existingScoresMap = {};
        domainScores.forEach(ds => {
          existingScoresMap[ds.domain_id] = ds;
        });
        
        const newDomainScores = selectedCourse.domains.map(domain => {
          if (existingScoresMap[domain.id]) {
            return {
              ...existingScoresMap[domain.id],
              domain_name: domain.name // Update name in case it changed
            };
          }
          return {
            domain_id: domain.id,
            domain_name: domain.name,
            score: 0,
            strengths: [],
            weaknesses: [],
          };
        });
        
        setDomainScores(newDomainScores);
      }
    } else {
      setFormData(prev => ({ ...prev, course_id: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";
    
    if (mode === "add" && !formData.password.trim()) {
      newErrors.password = "Password is required for new students";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        program: formData.program,
        next_milestone: formData.next_milestone,
        program_start_date: formData.program_start_date || null,
        course_id: formData.course_id || null,
        total_domains: parseInt(formData.total_domains || 10),
        overall_summary: formData.overall_summary,
        trainer_feedback: formData.trainer_feedback,
        domains: domainScores.map((ds) => ({
          domain_id: ds.domain_id,
          score: parseFloat(ds.score),
          strengths: (ds.strengths || [])
            .filter(s => s.title && s.title.trim())
            .map(s => ({
              title: s.title.trim(),
              description: s.description || ''
            })),
          weaknesses: (ds.weaknesses || [])
            .filter(w => w.title && w.title.trim())
            .map(w => ({
              title: w.title.trim(),
              description: w.description || '',
              improvement_suggestion: w.improvement_suggestion || ''
            })),
        })),
      };

      // Add password for new students or if changed
      if (formData.password) {
        payload.password = formData.password;
      }

      console.log('Submitting payload:', JSON.stringify(payload, null, 2));

      if (onSave) {
        if (mode === "edit") {
          await onSave(student.id, payload);
        } else {
          await onSave(payload);
        }
      }
      
      alert(`Student ${mode === "edit" ? "updated" : "created"} successfully!`);
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save student: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {mode === "edit" ? "Edit Student" : "Add New Student"}
          </h1>
          <p className="text-slate-400 mt-2">
            {mode === "edit"
              ? "Update student information and domain scores"
              : "Create a new student profile"}
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Information */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Student Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-slate-700 border ${
                  errors.first_name ? "border-red-500" : "border-slate-600"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.first_name && (
                <p className="text-red-400 text-sm mt-1">{errors.first_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-slate-700 border ${
                  errors.last_name ? "border-red-500" : "border-slate-600"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.last_name && (
                <p className="text-red-400 text-sm mt-1">{errors.last_name}</p>
              )}
            </div>



            <div>
              <label className="block text-sm font-medium mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-slate-700 border ${
                  errors.email ? "border-red-500" : "border-slate-600"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Student ID
              </label>
              <input
                type="text"
                value={student?.student_id || 'Auto-generated'}
                disabled
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg opacity-50 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">Auto-generated on creation</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Password {mode === "add" && "*"}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={mode === "edit" ? "Leave blank to keep current" : ""}
                className={`w-full px-4 py-2 bg-slate-700 border ${
                  errors.password ? "border-red-500" : "border-slate-600"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}
            </div>
          </div>
        </div>

        {/* Program & Progress Information */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Program & Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Select Course</label>
              <select
                value={formData.course_id || ''}
                onChange={handleCourseChange}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No Course (Manual Setup)</option>
                {Array.isArray(courses) && courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name} ({course.duration_weeks} weeks, {course.domains?.length || 0} domains)
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1">
                {formData.course_id 
                  ? '✅ Course domains synced automatically'
                  : `Select a course (${courses.length} available)`}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Next Milestone</label>
              <input
                type="text"
                name="next_milestone"
                value={formData.next_milestone}
                onChange={handleChange}
                placeholder="e.g., Portfolio checkpoint"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Overall Score
              </label>
              <input
                type="text"
                value={student?.overall_score ? `${parseFloat(student.overall_score).toFixed(1)}%` : 'Auto-calculated'}
                disabled
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg opacity-50 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">Calculated automatically from domain scores</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Domains Mastered
              </label>
              <input
                type="text"
                value={student?.domains_mastered !== undefined 
                  ? `${student.domains_mastered} / ${formData.total_domains}`
                  : 'Auto-calculated'}
                disabled
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg opacity-50 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">Auto-counted (scores ≥ 80%)</p>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Summary & Feedback</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Overall Summary</label>
              <textarea
                name="overall_summary"
                value={formData.overall_summary}
                onChange={handleChange}
                placeholder="Write an overall summary of the student's progress..."
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                rows="4"
              />
              <p className="text-xs text-slate-400 mt-1">Visible to student and admin</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Trainer Feedback</label>
              <textarea
                name="trainer_feedback"
                value={formData.trainer_feedback}
                onChange={handleChange}
                placeholder="Provide specific trainer feedback..."
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                rows="4"
              />
              <p className="text-xs text-slate-400 mt-1">Trainer's perspective on progress and areas to focus</p>
            </div>
          </div>
        </div>

        {/* Domain Scores with Strengths & Weaknesses */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Domain Scores & Feedback</h2>
          <div className="space-y-6">
            {domainScores.map((ds) => (
              <DomainScoreEditor
                key={ds.domain_id}
                domainScore={ds}
                onScoreChange={handleDomainScoreChange}
                onStrengthsChange={handleStrengthsChange}
                onWeaknessesChange={handleWeaknessesChange}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium transition-colors"
          >
            {loading
              ? "Saving..."
              : mode === "edit"
              ? "Update Student"
              : "Create Student"}
          </button>
        </div>
      </form>
    </div>
  );
}
