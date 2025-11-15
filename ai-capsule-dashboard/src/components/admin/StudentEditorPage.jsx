import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

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
    student_id: "",
    grade_level: "",
    overall_score: 0,
    password: "",
  });

  const [domainScores, setDomainScores] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && student) {
      setFormData({
        username: student.user?.username || "",
        email: student.user?.email || "",
        first_name: student.user?.first_name || "",
        last_name: student.user?.last_name || "",
        student_id: student.student_id || "",
        grade_level: student.grade_level || "",
        overall_score: parseFloat(student.overall_score || 0),
        password: "",
      });

      // Map existing domain scores
      if (student.domain_scores && Array.isArray(student.domain_scores)) {
        setDomainScores(
          student.domain_scores.map((ds) => ({
            domain_id: ds.domain,
            domain_name: ds.domain_name,
            score: parseFloat(ds.score || 0),
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

  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!formData.student_id.trim()) newErrors.student_id = "Student ID is required";
    if (!formData.grade_level.trim()) newErrors.grade_level = "Grade level is required";
    
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
        student_id: formData.student_id,
        grade_level: formData.grade_level,
        overall_score: parseFloat(formData.overall_score || 0),
        domains: domainScores.map((ds) => ({
          domain_id: ds.domain_id,
          score: parseFloat(ds.score),
        })),
      };

      // Add password for new students or if changed
      if (formData.password) {
        payload.password = formData.password;
      }

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

  const gradeLevels = [
    "9th Grade",
    "10th Grade",
    "11th Grade",
    "12th Grade",
  ];

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
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={mode === "edit"}
                className={`w-full px-4 py-2 bg-slate-700 border ${
                  errors.username ? "border-red-500" : "border-slate-600"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
              />
              {errors.username && (
                <p className="text-red-400 text-sm mt-1">{errors.username}</p>
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
                Student ID *
              </label>
              <input
                type="text"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-slate-700 border ${
                  errors.student_id ? "border-red-500" : "border-slate-600"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.student_id && (
                <p className="text-red-400 text-sm mt-1">{errors.student_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Grade Level *
              </label>
              <select
                name="grade_level"
                value={formData.grade_level}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-slate-700 border ${
                  errors.grade_level ? "border-red-500" : "border-slate-600"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select grade level</option>
                {gradeLevels.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
              {errors.grade_level && (
                <p className="text-red-400 text-sm mt-1">{errors.grade_level}</p>
              )}
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

        {/* Domain Scores */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Domain Scores</h2>
          <div className="space-y-4">
            {domainScores.map((ds) => (
              <div key={ds.domain_id} className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">
                    {ds.domain_name || "Unknown Domain"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={ds.score}
                    onChange={(e) =>
                      handleDomainScoreChange(ds.domain_id, e.target.value)
                    }
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="text-2xl font-bold text-blue-400 min-w-[80px] text-right">
                  {ds.score.toFixed(1)}%
                </div>
              </div>
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
