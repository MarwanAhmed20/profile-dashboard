import React, { useState, useEffect } from 'react';
import { domainsAPI } from '../../services/api';

export default function DomainsManagementPage({ onBack }) {
  const [domains, setDomains] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDomain, setEditingDomain] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: 0,
  });

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      const data = await domainsAPI.getAll();
      setDomains(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Failed to load domains:', error);
      setDomains([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingDomain) {
        await domainsAPI.update(editingDomain.id, formData);
      } else {
        await domainsAPI.create(formData);
      }
      await loadDomains();
      resetForm();
      alert(`Domain ${editingDomain ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      alert('Failed to save domain: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (domain) => {
    setEditingDomain(domain);
    setFormData({
      name: domain.name,
      description: domain.description,
      order: domain.order,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this domain? This will affect all students with this domain.')) return;

    try {
      await domainsAPI.delete(id);
      await loadDomains();
      alert('Domain deleted successfully!');
    } catch (error) {
      alert('Failed to delete domain: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', order: 0 });
    setEditingDomain(null);
    setShowForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Domain Management</h1>
          <p className="text-slate-400 mt-2">Manage learning domains and their order</p>
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
            + Add Domain
          </button>
        </div>
      </div>

      {/* Domain Form */}
      {showForm && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">
            {editingDomain ? 'Edit Domain' : 'Add New Domain'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Domain Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Machine Learning"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Domain description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Order (for sorting)</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">Lower numbers appear first</p>
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
                {loading ? 'Saving...' : editingDomain ? 'Update' : 'Create'} Domain
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Domains List */}
      <div className="space-y-3">
        {Array.isArray(domains) && domains.map((domain, index) => (
          <div
            key={domain.id}
            className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-slate-600">
                #{domain.order}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{domain.name}</h3>
                {domain.description && (
                  <p className="text-sm text-slate-400 mt-1">{domain.description}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(domain)}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(domain.id)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {(!Array.isArray(domains) || domains.length === 0) && !showForm && (
        <div className="text-center py-12 text-slate-400">
          <p>No domains yet. Click "Add Domain" to create one.</p>
        </div>
      )}
    </div>
  );
}
