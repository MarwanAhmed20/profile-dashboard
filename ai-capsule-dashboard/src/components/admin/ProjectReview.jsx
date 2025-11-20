import React, { useState, useEffect } from 'react';
import { ExternalLink, Calendar, Award, CheckCircle, AlertCircle, Clock, Save, Trash2 } from 'lucide-react';
import { projectsAPI } from '../../services/api';

const statusConfig = {
  pending: { color: 'yellow', icon: Clock, text: 'Pending Review', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', textColor: 'text-yellow-400' },
  in_review: { color: 'blue', icon: Clock, text: 'In Review', bg: 'bg-blue-500/10', border: 'border-blue-500/30', textColor: 'text-blue-400' },
  approved: { color: 'green', icon: CheckCircle, text: 'Approved', bg: 'bg-green-500/10', border: 'border-green-500/30', textColor: 'text-green-400' },
  needs_revision: { color: 'red', icon: AlertCircle, text: 'Needs Revision', bg: 'bg-red-500/10', border: 'border-red-500/30', textColor: 'text-red-400' },
};

export default function ProjectReview({ studentId }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [reviewData, setReviewData] = useState({
    status: '',
    grade: '',
    feedback: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  useEffect(() => {
    if (studentId) {
      loadProjects();
    }
  }, [studentId]);

  const loadProjects = async () => {
    try {
      const data = await projectsAPI.getAll();
      const projectsArray = Array.isArray(data) ? data : (data?.results || []);
      // Filter projects for this student
      const studentProjects = projectsArray.filter(p => p.student === studentId);
      setProjects(studentProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartReview = (project) => {
    setEditingId(project.id);
    setReviewData({
      status: project.status,
      grade: project.grade || '',
      feedback: project.feedback || '',
    });
  };

  const handleCancelReview = () => {
    setEditingId(null);
    setReviewData({ status: '', grade: '', feedback: '' });
  };

  const handleSubmitReview = async (projectId) => {
    setSubmitting(true);
    try {
      await projectsAPI.review(projectId, reviewData);
      await loadProjects();
      setEditingId(null);
      setReviewData({ status: '', grade: '', feedback: '' });
      alert('Project reviewed successfully!');
    } catch (error) {
      alert('Failed to submit review: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    setDeletingId(projectToDelete.id);
    try {
      await projectsAPI.delete(projectToDelete.id);
      await loadProjects();
      alert('Project deleted successfully!');
      setShowDeleteModal(false);
      setProjectToDelete(null);
    } catch (error) {
      alert('Failed to delete project: ' + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="p-8 text-center py-16">
        <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <p className="text-lg font-semibold text-slate-400 mb-2">No projects submitted yet</p>
        <p className="text-sm text-slate-500">Student hasn't submitted any projects for review</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 mb-2">Project Submissions</h2>
        <p className="text-sm text-slate-400">Review and grade student projects</p>
      </div>

      <div className="space-y-6">
        {projects.map((project) => {
          const statusInfo = statusConfig[project.status] || statusConfig.pending;
          const StatusIcon = statusInfo.icon;
          const isEditing = editingId === project.id;

          return (
            <div
              key={project.id}
              className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6 hover:bg-slate-900/70 transition-all"
            >
              {/* Project Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-50 mb-2">{project.title}</h3>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg ${statusInfo.bg} ${statusInfo.border} border text-xs font-semibold ${statusInfo.textColor}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusInfo.text}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(project.submission_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {project.grade !== null && !isEditing && (
                    <div className="text-center">
                      <div className="text-4xl font-bold text-indigo-400">{project.grade}</div>
                      <div className="text-xs text-slate-500">/ 100</div>
                    </div>
                  )}
                  
                  {/* Delete Button */}
                  {!isEditing && (
                    <button
                      onClick={() => handleDeleteClick(project)}
                      disabled={deletingId === project.id}
                      className="p-2.5 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete project"
                    >
                      {deletingId === project.id ? (
                        <div className="w-5 h-5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">{project.description}</p>

              {/* Technologies */}
              {project.technologies_used && (
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Technologies Used:</p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies_used.split(',').map((tech, idx) => (
                      <span key={idx} className="px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs font-medium">
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Project URL */}
              {project.project_url && (
                <div className="mb-4">
                  <a
                    href={project.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-all"
                  >
                    View Project <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {/* Review Form or Display */}
              {isEditing ? (
                <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Status */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Status *</label>
                      <select
                        value={reviewData.status}
                        onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:border-indigo-500 outline-none"
                      >
                        <option value="pending">Pending Review</option>
                        <option value="in_review">In Review</option>
                        <option value="approved">Approved</option>
                        <option value="needs_revision">Needs Revision</option>
                      </select>
                    </div>

                    {/* Grade */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Grade (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={reviewData.grade}
                        onChange={(e) => setReviewData({ ...reviewData, grade: e.target.value })}
                        placeholder="85.50"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Feedback */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Feedback</label>
                    <textarea
                      value={reviewData.feedback}
                      onChange={(e) => setReviewData({ ...reviewData, feedback: e.target.value })}
                      rows={4}
                      placeholder="Provide detailed feedback to help the student improve..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 outline-none resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSubmitReview(project.id)}
                      disabled={submitting || !reviewData.status}
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white rounded-xl font-bold transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {submitting ? 'Saving...' : 'Submit Review'}
                    </button>
                    <button
                      onClick={handleCancelReview}
                      disabled={submitting}
                      className="px-6 py-3 bg-transparent border-2 border-slate-600 hover:bg-slate-800 text-slate-300 rounded-xl font-semibold transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  {/* Existing Feedback Display */}
                  {project.feedback && (
                    <div className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <p className="text-xs text-slate-400 font-semibold mb-2">Feedback:</p>
                      <p className="text-sm text-slate-300 leading-relaxed">{project.feedback}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleStartReview(project)}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all"
                    >
                      {project.grade ? 'Edit Review' : 'Review Project'}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteClick(project)}
                      disabled={deletingId === project.id}
                      className="px-5 py-2.5 rounded-xl bg-red-900 hover:bg-red-700 disabled:bg-red-800 text-white font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      {deletingId === project.id ? 'Deleting...' : 'Delete Project'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && projectToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-700/50 p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-50">Delete Project</h3>
                <p className="text-sm text-slate-400 mt-1">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <p className="text-sm text-slate-300 mb-2">
                <span className="font-semibold text-slate-100">Project:</span> {projectToDelete.title}
              </p>
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-slate-100">Student:</span> {projectToDelete.student_name}
              </p>
            </div>

            <p className="text-sm text-slate-400 mb-6">
              Are you sure you want to permanently delete this project? All associated data including reviews and feedback will be lost.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelete}
                disabled={deletingId === projectToDelete.id}
                className="flex-1 py-3 bg-red-900 hover:bg-red-700 disabled:bg-red-800 text-white rounded-xl font-bold transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deletingId === projectToDelete.id ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Delete Project
                  </>
                )}
              </button>
              <button
                onClick={handleCancelDelete}
                disabled={deletingId === projectToDelete.id}
                className="px-6 py-3 bg-transparent border-2 border-slate-600 hover:bg-slate-800 text-slate-300 rounded-xl font-semibold transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
