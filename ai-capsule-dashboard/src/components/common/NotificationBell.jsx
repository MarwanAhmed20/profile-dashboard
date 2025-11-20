import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, Clock, Award } from 'lucide-react';
import { notificationsAPI } from '../../services/api';

const notificationIcons = {
  project_submitted: Award,
  project_reviewed: Check,
  announcement_posted: Bell,
};

export default function NotificationBell({ onNavigate }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const data = await notificationsAPI.getUnreadCount();
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error('Failed to load notification count:', error);
    }
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationsAPI.getAll();
      const notificationsArray = Array.isArray(data) ? data : (data?.results || []);
      setNotifications(notificationsArray.slice(0, 10)); // Show last 10
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.is_read) {
        await notificationsAPI.markRead(notification.id);
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        ));
        loadUnreadCount();
      }

      // Close dropdown
      setIsOpen(false);

      // Handle navigation based on route_url
      if (notification.route_url && onNavigate) {
        // For admin routes like /admin/students/5/projects
        if (notification.route_url.includes('/admin/students/')) {
          const match = notification.route_url.match(/\/admin\/students\/(\d+)\/projects/);
          if (match) {
            const studentId = parseInt(match[1]);
            // Call the navigation handler with student ID and tab
            onNavigate({ studentId, tab: 'projects' });
          }
        } else if (notification.route_url === '/projects') {
          // Student projects tab
          onNavigate({ tab: 'projects' });
        }
      }
    } catch (error) {
      console.error('Failed to handle notification click:', error);
    }
  };

  const handleMarkRead = async (e, id) => {
    e.stopPropagation(); // Prevent triggering the notification click
    try {
      await notificationsAPI.markRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
      ));
      loadUnreadCount();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl border border-slate-700 bg-slate-900/50 text-slate-200 hover:bg-slate-800 transition-all"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h3 className="font-bold text-slate-100">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {notifications.map((notification) => {
                  const Icon = notificationIcons[notification.notification_type] || Bell;
                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 hover:bg-slate-800/50 transition-colors cursor-pointer ${
                        !notification.is_read ? 'bg-indigo-500/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${
                          !notification.is_read ? 'bg-indigo-500/20' : 'bg-slate-800'
                        }`}>
                          <Icon className="w-5 h-5 text-indigo-400" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-slate-100 text-sm">
                              {notification.title}
                            </h4>
                            {!notification.is_read && (
                              <button
                                onClick={(e) => handleMarkRead(e, notification.id)}
                                className="p-1 hover:bg-slate-700 rounded transition-colors flex-shrink-0"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4 text-slate-400" />
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            {new Date(notification.created_at).toLocaleString()}
                          </div>
                          {notification.is_read && notification.read_at && (
                            <div className="text-xs text-slate-600 mt-1">
                              Read {new Date(notification.read_at).toLocaleDateString()}
                            </div>
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
      )}
    </div>
  );
}
