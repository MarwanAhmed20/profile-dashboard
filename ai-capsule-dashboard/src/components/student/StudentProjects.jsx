import React, { useState, useEffect } from 'react';
import { Plus, ExternalLink, Calendar, Award, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import { projectsAPI } from '../../services/api';

const statusConfig = {
  pending: { color: 'yellow', icon: Clock, text: 'Pending Review', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', textColor: 'text-yellow-400' },
  in_review: { color: 'blue', icon: Clock, text: 'In Review', bg: 'bg-blue-500/10', border: 'border-blue-500/30', textColor: 'text-blue-400' },
  approved: { color: 'green', icon: CheckCircle, text: 'Approved', bg: 'bg-green-500/10', border: 'border-green-500/30', textColor: 'text-green-400' },
  needs_revision: { color: 'red', icon: AlertCircle, text: 'Needs Revision', bg: 'bg-red-500/10', border: 'border-red-500/30', textColor: 'text-red-400' },
};

export default function StudentProjects({ student, isAdmin = false }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_url: '',
    technologies_used: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectsAPI.getAll();
      const projectsArray = Array.isArray(data) ? data : (data?.results || []);
      setProjects(projectsArray);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.project_url.trim()) newErrors.project_url = 'Project URL is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await projectsAPI.create(formData);
      loadProjects();
      resetForm();
      alert('Project submitted successfully!');
    } catch (error) {
      alert('Failed to submit project: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      project_url: '',
      technologies_used: '',
    });
    setErrors({});
    setShowForm(false);
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'text-green-400';
    if (grade >= 80) return 'text-blue-400';
    if (grade >= 70) return 'text-yellow-400';
    if (grade >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-50">My Projects</h2>
          <p className="text-sm text-slate-400 mt-1">Submit and track your project submissions</p>
        </div>
        {!isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Submit Project
          </button>
        )}
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-slate-700/40">
          <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-400 mb-2">No projects yet</p>
          <p className="text-sm text-slate-500">Submit your first project to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => {
            const statusInfo = statusConfig[project.status] || statusConfig.pending;
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={project.id}
                className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6 hover:bg-slate-800/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
              >
                {/* Project Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-50 mb-2">{project.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg ${statusInfo.bg} ${statusInfo.border} border text-xs font-semibold ${statusInfo.textColor}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusInfo.text}
                      </span>
                    </div>
                  </div>

                  {project.grade !== null && (
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${getGradeColor(project.grade)}`}>
                        {project.grade}
                      </div>
                      <div className="text-xs text-slate-500">/ 100</div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-slate-300 mb-4 line-clamp-3">{project.description}</p>

                {/* Technologies */}
                {project.technologies_used && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {project.technologies_used.split(',').map((tech, idx) => (
                        <span key={idx} className="px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs font-medium">
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feedback */}
                {project.feedback && (
                  <div className="mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                    <p className="text-xs text-slate-400 font-semibold mb-1">Feedback:</p>
                    <p className="text-sm text-slate-300">{project.feedback}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(project.submission_date).toLocaleDateString()}
                  </div>

                  {project.project_url && (
                    <a
                      href={project.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium transition-all"
                    >
                      View Project Link <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {project.reviewed_by && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50 text-xs text-slate-500">
                    Reviewed by {project.reviewed_by_name} on {new Date(project.reviewed_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Project Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={resetForm}>
          <div 
            className="bg-slate-900 rounded-2xl border border-slate-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              <h3 className="text-xl font-bold text-slate-50">Submit New Project</h3>
              <button onClick={resetForm} className="p-2 hover:bg-slate-800 rounded-xl transition-all">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Project Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., AI Chatbot Application"
                  className={`w-full px-4 py-3 rounded-xl bg-slate-800 border ${errors.title ? 'border-red-500' : 'border-slate-700'} text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 outline-none transition-all`}
                />
                {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your project, what it does, and what you learned..."
                  rows={5}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-800 border ${errors.description ? 'border-red-500' : 'border-slate-700'} text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 outline-none transition-all resize-none`}
                />
                {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Project URL *</label>
                <input
                  type="url"
                  value={formData.project_url}
                  onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                  placeholder="https://github.com/username/project or https://demo.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 outline-none transition-all"
                />
                {errors.project_url && <p className="text-red-400 text-sm mt-1">{errors.project_url}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Technologies Used (Optional)</label>
                <input
                  type="text"
                  value={formData.technologies_used}
                  onChange={(e) => setFormData({ ...formData, technologies_used: e.target.value })}
                  placeholder="Python, TensorFlow, Docker (comma-separated)"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white rounded-xl font-bold transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? 'Submitting...' : 'Submit Project'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-transparent border-2 border-slate-600 hover:bg-slate-800 text-slate-300 rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
