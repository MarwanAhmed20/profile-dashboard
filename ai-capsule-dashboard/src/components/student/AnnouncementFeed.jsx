import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, Info, Megaphone, ChevronDown, ChevronUp, X } from 'lucide-react';
import { announcementsAPI } from '../../services/api';

const priorityConfig = {
  high: { 
    color: 'red', 
    bg: 'bg-red-500/15', 
    border: 'border-red-500/40', 
    text: 'text-red-300', 
    badge: 'bg-red-500/25 text-red-200 border-red-500/30' 
  },
  medium: { 
    color: 'orange', 
    bg: 'bg-orange-500/15', 
    border: 'border-orange-500/40', 
    text: 'text-orange-300', 
    badge: 'bg-orange-500/25 text-orange-200 border-orange-500/30' 
  },
  low: { 
    color: 'slate', 
    bg: 'bg-slate-500/15', 
    border: 'border-slate-500/40', 
    text: 'text-slate-300', 
    badge: 'bg-slate-500/25 text-slate-200 border-slate-500/30' 
  },
};

export default function AnnouncementFeed() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [expandedId, setExpandedId] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const data = await announcementsAPI.getAll();
      const announcementsArray = Array.isArray(data) ? data : (data?.results || []);
      setAnnouncements(announcementsArray);
      setError(null);
    } catch (error) {
      console.error('Failed to load announcements:', error);
      setError(error.message);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (announcementId) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/students/announcements/${announcementId}/mark_read/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Update local state
      setAnnouncements(prev => prev.map(a => 
        a.id === announcementId ? { ...a, is_read: true } : a
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleAnnouncementClick = (announcement) => {
    if (!announcement.is_read) {
      markAsRead(announcement.id);
    }
    setSelectedAnnouncement(announcement);
  };

  const filteredAnnouncements = announcements
    .filter(a => filter === 'all' || a.priority === filter)
    .sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 dark:bg-white/90 p-6 animate-pulse">
        <div className="h-8 bg-slate-800 dark:bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-slate-800 dark:bg-slate-200 rounded"></div>
          <div className="h-20 bg-slate-800 dark:bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-700/50 bg-red-900/20 dark:bg-red-50 p-6">
        <div className="flex items-center gap-3 mb-3">
          <AlertCircle className="w-5 h-5 text-red-400 dark:text-red-600" />
          <h3 className="text-lg font-bold text-red-400 dark:text-red-700">Failed to load announcements</h3>
        </div>
        <p className="text-sm text-red-300 dark:text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-800/70 backdrop-blur-sm p-8 shadow-2xl max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 flex items-center justify-center border border-indigo-500/30">
              <Megaphone className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-50">Announcements</h3>
              <p className="text-sm text-slate-400 mt-1">Latest updates from your instructors</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm px-4 py-2 rounded-xl bg-slate-800/90 border border-slate-600/50 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            <button
              onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
              className="text-sm px-4 py-2 rounded-xl bg-slate-800/90 border border-slate-600/50 text-slate-200 hover:bg-slate-700/90 transition-all font-medium"
            >
              {sortOrder === 'newest' ? '↓ Newest' : '↑ Oldest'}
            </button>
          </div>
        </div>

        {/* Announcements List - Scrollable */}
        <div className="overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900/50">
          {filteredAnnouncements.length === 0 ? (
            <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-slate-700/40">
              <Bell className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-300 mb-2">No announcements yet</p>
              <p className="text-sm text-slate-500">You're all caught up</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAnnouncements.map((announcement) => {
                const config = priorityConfig[announcement.priority] || priorityConfig.medium;
                const isExpanded = expandedId === announcement.id;
                const contentPreview = announcement.content.length > 150 
                  ? announcement.content.substring(0, 150) + '...' 
                  : announcement.content;

                return (
                  <div
                    key={announcement.id}
                    onClick={() => handleAnnouncementClick(announcement)}
                    className={`
                      relative rounded-2xl border p-6 cursor-pointer
                      transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl
                      ${announcement.is_read 
                        ? 'bg-slate-800/40 border-slate-700/50 shadow-lg' 
                        : 'bg-slate-800/70 border-slate-600/60 shadow-xl ring-1 ring-indigo-500/20'
                      }
                    `}
                  >
                    {/* Unread indicator */}
                    {!announcement.is_read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-l-2xl" />
                    )}

                    {/* Top Row - Header */}
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`p-3 rounded-xl ${config.bg} border ${config.border}`}>
                          <Bell className={`w-6 h-6 ${config.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-xl font-bold ${announcement.is_read ? 'text-slate-100' : 'text-white'}`}>
                            {announcement.title}
                            {!announcement.is_read && (
                              <span className="ml-3 px-3 py-1.5 text-xs font-bold uppercase rounded-full bg-indigo-500/40 text-indigo-100 border border-indigo-500/50 shadow-lg">
                                NEW
                              </span>
                            )}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        {announcement.priority && (
                          <span className={`text-sm px-4 py-2 rounded-xl ${config.badge} font-bold uppercase border shadow-sm`}>
                            {announcement.priority}
                          </span>
                        )}
                        <span className="text-sm text-slate-300 font-semibold">
                          {new Date(announcement.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row - Content */}
                    <p className={`text-lg leading-relaxed mb-5 ${announcement.is_read ? 'text-slate-300' : 'text-slate-100'} font-medium`}>
                      {isExpanded ? announcement.content : contentPreview}
                    </p>

                    {/* Bottom Row - Meta */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 font-medium">
                      </span>
                      <div className="flex items-center gap-3">
                        
                        {announcement.content.length > 150 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedId(isExpanded ? null : announcement.id);
                            }}
                            className="text-indigo-300 hover:text-indigo-200 font-semibold flex items-center gap-1 transition-colors"
                          >
                            {isExpanded ? (
                              <>Less <ChevronUp className="w-4 h-4" /></>
                            ) : (
                              <>More <ChevronDown className="w-4 h-4" /></>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal for full announcement */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedAnnouncement(null)}>
          <div className="bg-slate-900 rounded-2xl border border-slate-700/50 p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4 flex-1">
                <h2 className="text-3xl font-bold text-white">{selectedAnnouncement.title}</h2>
                {selectedAnnouncement.priority && ( 
                  <span className={`text-sm px-3 py-2 rounded-xl ${priorityConfig[selectedAnnouncement.priority].badge} font-bold uppercase border shadow-sm`}>
                    {selectedAnnouncement.priority}
                  </span>
                )}
              </div>
              
              <button onClick={() => setSelectedAnnouncement(null)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <div className="mb-4 pb-4 border-b border-slate-700/50">
              <p className="text-base text-slate-300 font-semibold">
                {new Date(selectedAnnouncement.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            
            <p className="text-lg text-slate-100 leading-relaxed whitespace-pre-wrap mb-6 font-medium">
              {selectedAnnouncement.content}
            </p>
            

          </div>
        </div>
      )}
    </>
  );
}
