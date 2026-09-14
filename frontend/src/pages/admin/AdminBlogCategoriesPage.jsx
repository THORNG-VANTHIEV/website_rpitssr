import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import { Edit2, Trash2 } from 'lucide-react';

export const AdminBlogCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#0c8b51',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : (raw?.categories || raw?.data || []);
      setCategories(list);
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
    setFormData({ name: '', description: '', color: '#0c8b51' });
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      description: cat.description || '',
      color: cat.color || '#0c8b51',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCategory) {
        await api.put(`/admin/blog-categories/${editingCategory.id}`, formData);
      } else {
        await api.post('/admin/blog-categories', formData);
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
      await api.delete(`/admin/blog-categories/${cat.id}`);
      fetchData();
    } catch {
      alert('Failed to delete category.');
    }
  };

  const columns = [
    {
      header: 'Category Name',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: row.color || '#0c8b51',
              display: 'inline-block',
            }}
          />
          <span style={{ fontWeight: '600', color: 'var(--admin-primary)' }}>{row.name}</span>
        </div>
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (row) => row.description || '--',
    },
    {
      header: 'Articles Count',
      render: (row) => (
        <span className="admin-badge admin-badge-info">
          {row.posts_count || row.posts?.length || 0} Articles
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
        title="Blog & News Categories"
        subtitle="Manage classifications for blog posts, news articles, and press announcements"
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
        title={editingCategory ? 'Edit Blog Category' : 'New Blog Category'}
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
            placeholder="e.g. Promotion / ព័ត៌មានថ្មីៗ"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Color Badge</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="color"
              style={{ width: '40px', height: '36px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
            <input
              type="text"
              className="admin-form-control"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
          </div>
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
