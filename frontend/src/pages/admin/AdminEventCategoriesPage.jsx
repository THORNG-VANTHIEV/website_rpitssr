import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import { Edit2, Trash2 } from 'lucide-react';

export const AdminEventCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/event-categories');
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      description: cat.description || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCategory) {
        await api.put(`/admin/event-categories/${editingCategory.id}`, formData);
      } else {
        await api.post('/admin/event-categories', formData);
      }
      setModalOpen(false);
      fetchData();
    } catch {
      alert('Failed to save category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await api.delete(`/admin/event-categories/${cat.id}`);
      fetchData();
    } catch {
      alert('Failed to delete category.');
    }
  };

  const columns = [
    {
      header: 'Category Name',
      render: (row) => <span style={{ fontWeight: '600', color: 'var(--admin-primary)' }}>{row.name}</span>,
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (row) => row.description || '--',
    },
    {
      header: 'Events Count',
      render: (row) => (
        <span className="admin-badge admin-badge-info">
          {row.events_count || row.events?.length || 0} Events
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={() => openEditModal(row)}
            className="admin-btn admin-btn-outline admin-btn-sm"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="admin-btn admin-btn-danger admin-btn-sm"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminDataTable
        title="Event Categories"
        subtitle="Manage classifications for institute events, seminars, and workshops"
        columns={columns}
        data={categories}
        loading={loading}
        onAdd={openAddModal}
        addLabel="Add Category"
        onRefresh={fetchData}
      />

      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Event Category' : 'New Event Category'}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
      >
        <div className="admin-form-group">
          <label className="admin-form-label">Category Name *</label>
          <input
            type="text"
            className="admin-form-control"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Workshop / សិក្ខាសាលា"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Description</label>
          <textarea
            className="admin-form-control"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </AdminModal>
    </div>
  );
};
