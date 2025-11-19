import React, { useState, useEffect } from 'react';
import { authAPI } from '../../services/api';

export default function AdminCodeManager({ onBack }) {
  const [adminCode, setAdminCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadAdminCode();
  }, []);

  const loadAdminCode = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/admin-code/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      setAdminCode(data.admin_code || '');
    } catch (err) {
      console.error('Failed to load admin code:', err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/admin-code/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ admin_code: newCode })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update admin code');
      }

      setAdminCode(data.admin_code);
      setNewCode('');
      setSuccess('Admin code updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Code Management</h1>
          <p className="text-slate-400 mt-2">Manage your unique admin registration code</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
        >
          Back
        </button>
      </div>

      {/* Current Admin Code Display */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Your Current Admin Code</h2>
        
        {adminCode ? (
          <div className="bg-blue-500/10 border-2 border-blue-500 rounded-xl p-6 text-center">
            <div className="text-sm text-slate-400 mb-2">Admin Code</div>
            <div className="text-4xl font-bold text-blue-400 tracking-wider font-mono">
              {adminCode}
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Share this code with students to allow them to register under your supervision
            </p>
          </div>
        ) : (
          <div className="bg-yellow-500/10 border border-yellow-500 rounded-xl p-6 text-center">
            <div className="text-yellow-400 mb-2">⚠️ No Admin Code Set</div>
            <p className="text-sm text-slate-400">
              You need to set an admin code before students can register under you
            </p>
          </div>
        )}
      </div>

      {/* Update Admin Code Form */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
        <h2 className="text-lg font-semibold mb-4">
          {adminCode ? 'Update Admin Code' : 'Create Admin Code'}
        </h2>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              New Admin Code (Minimum 6 characters, Maximum 20)
            </label>
            <input
              type="text"
              value={newCode}
              onChange={(e) => {
                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                if (value.length <= 20) {
                  setNewCode(value);
                }
              }}
              required
              minLength={6}
              maxLength={20}
              placeholder="AICAPSULE"
              disabled={loading}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xl uppercase text-center tracking-wider"
            />
            <p className="text-xs text-slate-400 mt-2">
              Choose a memorable code (6-20 characters, letters and numbers only)
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    newCode.length >= 6 ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${Math.min((newCode.length / 20) * 100, 100)}%` }}
                />
              </div>
              <span className={`text-xs font-semibold ${
                newCode.length >= 6 ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {newCode.length}/20
              </span>
            </div>
            {newCode.length > 0 && newCode.length < 6 && (
              <p className="text-xs text-yellow-400 mt-2">
                ⚠️ Need at least {6 - newCode.length} more character{6 - newCode.length > 1 ? 's' : ''}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || newCode.length < 6}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {loading ? 'Updating...' : adminCode ? 'Update Admin Code' : 'Create Admin Code'}
          </button>
        </form>
      </div>

      {/* Instructions */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
        <h3 className="text-sm font-semibold mb-3">How It Works</h3>
        <ul className="space-y-2 text-sm text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">1.</span>
            <span>Create or update your unique admin code above</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">2.</span>
            <span>Share this code with students who need to register</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">3.</span>
            <span>Students enter this code during signup to link their account to you</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">4.</span>
            <span>You'll receive a notification when a student registers with your code</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
