import React, { useState, useEffect } from 'react';
import { coursesAPI, domainsAPI } from '../../services/api';

export default function CoursesPage({ onBack }) {
  const [courses, setCourses] = useState([]);
  const [domains, setDomains] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    duration_weeks: '',
    domain_ids: [],
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coursesData, domainsData] = await Promise.all([
        coursesAPI.getAll(),
        domainsAPI.getAll(),
      ]);
      // Ensure courses is always an array
      setCourses(Array.isArray(coursesData) ? coursesData : coursesData.results || []);
      setDomains(Array.isArray(domainsData) ? domainsData : domainsData.results || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setCourses([]);
      setDomains([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCourse) {
        await coursesAPI.update(editingCourse.id, formData);
      } else {
        await coursesAPI.create(formData);
      }
      await loadData();
      resetForm();
      alert(`Course ${editingCourse ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      alert('Failed to save course: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      description: course.description,
      start_date: course.start_date,
      end_date: course.end_date,
      duration_weeks: course.duration_weeks,
      domain_ids: course.domains.map(d => d.id),
      is_active: course.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      await coursesAPI.delete(id);
      await loadData();
      alert('Course deleted successfully!');
    } catch (error) {
      alert('Failed to delete course: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      duration_weeks: '',
      domain_ids: [],
      is_active: true,
    });
    setEditingCourse(null);
    setShowForm(false);
  };

  const toggleDomain = (domainId) => {
    setFormData(prev => ({
      ...prev,
      domain_ids: prev.domain_ids.includes(domainId)
        ? prev.domain_ids.filter(id => id !== domainId)
        : [...prev.domain_ids, domainId]
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Management</h1>
          <p className="text-slate-400 mt-2">Manage courses, dates, and domain assignments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            + Add Course
          </button>
        </div>
      </div>

      {/* Course Form */}
      {showForm && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">
            {editingCourse ? 'Edit Course' : 'Add New Course'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Course Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., AI-Capsule Bootcamp"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Course description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Start Date *</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">End Date *</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Duration (Weeks) *</label>
                <input
                  type="number"
                  value={formData.duration_weeks}
                  onChange={(e) => setFormData({ ...formData, duration_weeks: e.target.value })}
                  required
                  min="1"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  Active Course
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Select Domains *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {domains.map(domain => (
                    <label
                      key={domain.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                        formData.domain_ids.includes(domain.id)
                          ? 'bg-blue-500/20 border-blue-500'
                          : 'bg-slate-700 border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.domain_ids.includes(domain.id)}
                        onChange={() => toggleDomain(domain.id)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm">{domain.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
              >
                {loading ? 'Saving...' : editingCourse ? 'Update' : 'Create'} Course
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.isArray(courses) && courses.map(course => (
          <div
            key={course.id}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold">{course.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{course.description}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                course.is_active
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-slate-700 text-slate-400'
              }`}>
                {course.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>📅 Duration:</span>
                <span className="text-slate-200">{course.duration_weeks} weeks</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>🗓️ Start Date:</span>
                <span className="text-slate-200">{new Date(course.start_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>🏁 End Date:</span>
                <span className="text-slate-200">{new Date(course.end_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>👥 Students:</span>
                <span className="text-slate-200">{course.student_count || 0}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>📚 Domains:</span>
                <span className="text-slate-200">{course.domains?.length || 0}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleEdit(course)}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(course.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {(!Array.isArray(courses) || courses.length === 0) && !showForm && (
        <div className="text-center py-12 text-slate-400">
          <p>No courses yet. Click "Add Course" to create one.</p>
        </div>
      )}
    </div>
  );
}
