import React, { useState, useEffect } from "react";
import DomainScoreEditor from "./DomainScoreEditor";
import { coursesAPI } from "../../services/api";
import { Award, Grid, Target } from 'lucide-react';
import ProjectReview from './ProjectReview';

export default function StudentEditorPage({
  mode,
  student,
  defaultDomains,
  onBack,
  onSave,
}) {
  const [activeTab, setActiveTab] = useState('info');
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">
            {mode === "edit" ? "Edit Student" : "Add New Student"}
          </h1>
          <p className="text-slate-400 mt-1">
            {mode === "edit" ? "Update student information and scores" : "Create a new student profile"}
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border border-slate-600 bg-transparent text-slate-300 hover:bg-slate-800 transition-all font-medium"
        >
          ← Back
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden shadow-lg">
        <div className="flex gap-2 px-2 py-2">
          <button
            onClick={() => setActiveTab('info')}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all
              ${activeTab === 'info'
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }
            `}
          >
            <Grid className="w-4 h-4" />
            <span>Student Information</span>
          </button>
          
          <button
            onClick={() => setActiveTab('domains')}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all
              ${activeTab === 'domains'
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }
            `}
          >
            <Target className="w-4 h-4" />
            <span>Domain Scores</span>
          </button>

          {mode === 'edit' && (
            <button
              onClick={() => setActiveTab('projects')}
              className={`
                flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all
                ${activeTab === 'projects'
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/50"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                }
              `}
            >
              <Award className="w-4 h-4" />
              <span>Projects</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl">
        {activeTab === 'info' && (
          <div className="p-8">
            <h2 className="text-xl font-bold text-slate-100 mb-6">Basic Information</h2>
            {/* Student Information Form */}
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
        )}

        {activeTab === 'domains' && (
          <div className="p-8">
            <h2 className="text-xl font-bold text-slate-100 mb-6">Domain Scores & Feedback</h2>
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
        )}

        {activeTab === 'projects' && mode === 'edit' && (
          <ProjectReview studentId={student?.id} />
        )}
      </div>

      {/* Save/Cancel Buttons - Only show on info and domains tabs */}
      {activeTab !== 'projects' && (
        <div className="flex justify-end gap-3">
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-xl border border-slate-600 bg-transparent text-slate-300 hover:bg-slate-800 transition-all font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white font-bold transition-all shadow-lg disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : (mode === "edit" ? "Update Student" : "Create Student")}
          </button>
        </div>
      )}
    </div>
  );
}
