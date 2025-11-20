import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Megaphone, X, Search, Calendar, Tag, AlertCircle, Clock } from 'lucide-react';
import { announcementsAPI, coursesAPI } from '../../services/api';
import Button from '../common/Button';

const priorityConfig = {
  high: { color: 'red', bg: 'bg-red-500/15', border: 'border-red-500/40', text: 'text-red-300', badge: 'bg-red-500/25 text-red-200 border-red-500/30' },
  medium: { color: 'yellow', bg: 'bg-yellow-500/15', border: 'border-yellow-500/40', text: 'text-yellow-300', badge: 'bg-yellow-500/25 text-yellow-200 border-yellow-500/30' },
  low: { color: 'slate', bg: 'bg-slate-500/15', border: 'border-slate-500/40', text: 'text-slate-300', badge: 'bg-slate-500/25 text-slate-200 border-slate-500/30' },
};

export default function AnnouncementManager({ onBack }) {
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    courses: [],
    priority: 'low',
    is_active: false,
    scheduled_start: '',
    scheduled_end: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [announcementsData, coursesData] = await Promise.all([
        announcementsAPI.getAll(),
        coursesAPI.getAll()
      ]);
      
      const announcementsArray = Array.isArray(announcementsData) 
        ? announcementsData 
        : (announcementsData?.results || []);
      
      const coursesArray = Array.isArray(coursesData) 
        ? coursesData 
        : (coursesData?.results || []);
      
      setAnnouncements(announcementsArray);
      setCourses(coursesArray);
    } catch (error) {
      console.error('Failed to load data:', error);
      setAnnouncements([]);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (formData.courses.length === 0) newErrors.courses = 'Select at least one course';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Format datetime values to ISO 8601 format with timezone
      const submitData = {
        ...formData,
        scheduled_start: formData.scheduled_start ? new Date(formData.scheduled_start).toISOString() : null,
        scheduled_end: formData.scheduled_end ? new Date(formData.scheduled_end).toISOString() : null,
      };

      if (editingId) {
        await announcementsAPI.update(editingId, submitData);
      } else {
        await announcementsAPI.create(submitData);
      }
      loadData();
      resetForm();
    } catch (error) {
      alert('Failed to save announcement: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await announcementsAPI.delete(id);
      loadData();
    } catch (error) {
      alert('Failed to delete announcement: ' + error.message);
    }
  };

  const handleEdit = (announcement) => {
    setEditingId(announcement.id);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      courses: announcement.courses,
      priority: announcement.priority || 'low',
      is_active: announcement.is_active,
      scheduled_start: announcement.scheduled_start ? announcement.scheduled_start.slice(0, 16) : '',
      scheduled_end: announcement.scheduled_end ? announcement.scheduled_end.slice(0, 16) : '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      courses: [],
      priority: 'low',
      is_active: false,
      scheduled_start: '',
      scheduled_end: '',
    });
    setErrors({});
    setEditingId(null);
    setShowForm(false);
  };

  const filteredAnnouncements = announcements
    .filter(a => {
      const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           a.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'all' || a.priority === filterPriority;
      return matchesSearch && matchesPriority;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 flex items-center justify-center border border-indigo-500/30">
            <Megaphone className="w-7 h-7 text-indigo-300" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-50">Announcement Management</h1>
            <p className="text-slate-400 mt-1 text-sm">Create and manage course announcements</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-slate-600 bg-transparent text-slate-300 hover:bg-slate-800 transition-all font-medium"
          >
            ← Back
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/50"
          >
            <Plus className="w-5 h-5" />
            New Announcement
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
            />
          </div>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-medium"
          >
            <option value="all">All Priority</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <button
            onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
            className="px-5 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 hover:bg-slate-800/50 transition-all font-medium"
          >
            {sortOrder === 'newest' ? '↓ Newest First' : '↑ Oldest First'}
          </button>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-700">
            <Megaphone className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-400">No announcements found</p>
            <p className="text-sm text-slate-500 mt-2">
              {searchTerm || filterPriority !== 'all' ? 'Try adjusting your filters' : 'Create your first announcement'}
            </p>
          </div>
        ) : (
          filteredAnnouncements.map((announcement) => {
            const config = priorityConfig[announcement.priority] || priorityConfig.medium;
            const contentPreview = announcement.content.length > 120 
              ? announcement.content.substring(0, 120) + '...' 
              : announcement.content;

            return (
              <div
                key={announcement.id}
                className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6 hover:bg-slate-800/60 hover:border-slate-600 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-slate-50 truncate">{announcement.title}</h3>
                      {announcement.priority && (
                        <span className={`text-xs px-3 py-1 rounded-lg ${config.badge} font-bold uppercase border`}>
                          {announcement.priority}
                        </span>
                      )}
                      {!announcement.is_active && (
                        <span className="text-xs px-3 py-1 rounded-lg bg-red-700 text-white border border-red-600 font-semibold">
                          Draft
                        </span>
                      )}
                      {announcement.is_active && (
                        <span className="text-xs px-3 py-1 rounded-lg bg-green-700 text-white border border-green-600 font-semibold">
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="p-2.5 rounded-lg hover:bg-slate-700 text-blue-400 hover:text-blue-300 transition-all"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="p-2.5 rounded-lg hover:bg-slate-700 text-red-400 hover:text-red-300 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Content Preview */}
                <p className="text-slate-300 mb-4 leading-relaxed">{contentPreview}</p>

                {/* Footer Row */}
                <div className="flex items-center justify-between text-sm pt-4 border-t border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(announcement.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {announcement.course_names && announcement.course_names.length > 0 && (
                    <div className="flex gap-2 items-center">
                      <Tag className="w-4 h-4 text-slate-500" />
                      <div className="flex gap-2">
                        {announcement.course_names.map((course, idx) => (
                          <span key={idx} className="px-3 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                            {course}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New/Edit Announcement Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={resetForm}>
          <div 
            className="bg-slate-900 rounded-2xl border border-slate-700/50 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-8 border-b border-slate-700/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <Megaphone className="w-6 h-6 text-indigo-300" />
                </div>
                <h2 className="text-2xl font-bold text-slate-50">
                  {editingId ? 'Edit Announcement' : 'Create New Announcement'}
                </h2>
              </div>
              <button 
                onClick={resetForm} 
                className="p-2 hover:bg-slate-800 rounded-xl transition-all hover:rotate-90"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., New Assignment Released - Week 5"
                  className={`w-full px-4 py-3 rounded-xl bg-slate-800 border ${errors.title ? 'border-red-500' : 'border-slate-700'} text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all`}
                />
                {errors.title && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.title}
                  </p>
                )}
              </div>

              {/* Content Textarea */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your announcement message here..."
                  rows={6}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-800 border ${errors.content ? 'border-red-500' : 'border-slate-700'} text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none`}
                />
              </div>

              {/* Priority Selector */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['high', 'medium', 'low'].map((priority) => {
                    const config = priorityConfig[priority];
                    const isSelected = formData.priority === priority;
                    return (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority })}
                        className={`
                          px-4 py-3 rounded-xl border-2 font-semibold uppercase text-sm transition-all
                          ${isSelected 
                            ? `${config.badge} ring-2 ring-offset-2 ring-offset-slate-900` 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                          }
                        `}
                      >
                        {priority}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Select Courses *
                </label>
                <div className={`border ${errors.courses ? 'border-red-500' : 'border-slate-700'} rounded-xl p-4 bg-slate-800 max-h-60 overflow-y-auto space-y-2`}>
                  {courses.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No courses available</p>
                  ) : (
                    courses.map(course => (
                      <label
                        key={course.id}
                        className={`
                          flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all
                          ${formData.courses.includes(course.id)
                            ? 'bg-indigo-500/20 border-2 border-indigo-500/50'
                            : 'bg-slate-900/50 border-2 border-transparent hover:bg-slate-800/50'
                          }
                        `}
                      >
                        <input
                          type="checkbox"
                          checked={formData.courses.includes(course.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ 
                                ...formData, 
                                courses: [...formData.courses, course.id]
                              });
                            } else {
                              setFormData({ 
                                ...formData, 
                                courses: formData.courses.filter(id => id !== course.id)
                              });
                            }
                          }}
                          className="w-5 h-5 rounded border-slate-600 text-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                        />
                        <div className="flex-1">
                          <span className="font-semibold text-slate-200">{course.name}</span>
                          <span className="text-xs text-slate-500 ml-2">
                            ({course.duration_weeks} weeks)
                          </span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                {errors.courses && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.courses}
                  </p>
                )}
              </div>

              {/* Schedule Section */}
              <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-400" />
                    <label className="text-sm font-semibold text-slate-300">
                      Schedule (Optional)
                    </label>
                  </div>
                  
                  {(formData.scheduled_start || formData.scheduled_end) && (
                    <button
                      type="button"
                      onClick={() => setFormData({ 
                        ...formData, 
                        scheduled_start: '', 
                        scheduled_end: '' 
                      })}
                      className="px-3 py-1.5 text-xs rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-all font-semibold"
                    >
                      Clear Schedule
                    </button>
                  )}
                </div>
                
                <p className="text-xs text-slate-500 mb-4">
                  Set when this announcement should be visible to students
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Start Date/Time */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">
                      Start Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduled_start}
                      onChange={(e) => setFormData({ ...formData, scheduled_start: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-sm"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Leave empty to show immediately
                    </p>
                  </div>

                  {/* End Date/Time */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">
                      End Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduled_end}
                      onChange={(e) => setFormData({ ...formData, scheduled_end: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-sm"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Leave empty for no expiration
                    </p>
                  </div>
                </div>

                {/* Schedule Summary */}
                {(formData.scheduled_start || formData.scheduled_end) && (
                  <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                    <p className="text-sm text-indigo-200 font-medium">
                      📅 Scheduled:{' '}
                      {formData.scheduled_start && (
                        <span>From {new Date(formData.scheduled_start).toLocaleString()}</span>
                      )}
                      {formData.scheduled_start && formData.scheduled_end && <span> </span>}
                      {formData.scheduled_end && (
                        <span>until {new Date(formData.scheduled_end).toLocaleString()}</span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                      Publish Status
                    </label>
                    <p className="text-xs text-slate-500 mt-1">
                      Students will only see this announcement if it's active
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                    className={`
                      relative w-16 h-8 rounded-full transition-all
                      ${formData.is_active ? 'bg-green-500' : 'bg-slate-700'}
                    `}
                  >
                    <span
                      className={`
                        absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all
                        ${formData.is_active ? 'translate-x-8' : 'translate-x-0'}
                      `}
                    />
                  </button>
                </div>
                <div className="mt-3 text-sm font-semibold">
                  {formData.is_active ? (
                    <span className="text-green-400">✓ Active - Visible to students</span>
                  ) : (
                    <span className="text-red-400">○ Draft - Hidden from students</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-indigo-500/50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Megaphone className="w-5 h-5" />
                      {editingId ? 'Update Announcement' : 'Create Announcement'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={submitting}
                  className="px-8 py-4 bg-transparent border-2 border-slate-600 hover:bg-slate-800 text-slate-300 rounded-xl font-semibold transition-all disabled:opacity-50"
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
