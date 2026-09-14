import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import { Edit2, Trash2, Tag, CheckCircle, AlertCircle } from 'lucide-react';

export const AdminPromotionsPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'popup',
    message: '',
    description: '',
    button_text: 'Register Now',
    button_link: '/register',
    image_url: '',
    is_active: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/promotions');
      setPromotions(res.data || []);
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
    setEditingPromo(null);
    setFormData({
      title: 'អាហារូបករណ៍ ១០០% សិក្សាដោយឥតគិតថ្លៃ',
      type: 'popup',
      message: 'ចុះឈ្មោះថ្ងៃនេះ ដើម្បីទទួលបានឱកាសអាហារូបករណ៍ ១០០%!',
      description: '',
      button_text: 'ចុះឈ្មោះឥឡូវនេះ',
      button_link: '/register',
      image_url: '',
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingPromo(p);
    setFormData({
      title: p.title || '',
      type: p.type || 'popup',
      message: p.message || '',
      description: p.description || '',
      button_text: p.button_text || '',
      button_link: p.button_link || '',
      image_url: p.image_url || '',
      is_active: Boolean(p.is_active),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingPromo) {
        await api.put(`/admin/promotions/${editingPromo.id}`, formData);
      } else {
        await api.post('/admin/promotions', formData);
      }
      setModalOpen(false);
      fetchData();
    } catch {
      alert('Failed to save promotion.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm('Delete this promotion?')) return;
    try {
      await api.delete(`/admin/promotions/${p.id}`);
      fetchData();
    } catch {
      alert('Failed to delete promotion.');
    }
  };

  const columns = [
    {
      header: 'Campaign Title',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '700', color: 'var(--admin-primary)' }}>{row.title}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>{row.message}</div>
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (row) => <span className="admin-badge admin-badge-info">{row.type?.toUpperCase()}</span>,
    },
    {
      header: 'Button CTA',
      render: (row) => row.button_text ? <code>{row.button_text} &rarr; {row.button_link}</code> : '--',
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`admin-badge ${row.is_active ? 'admin-badge-success' : 'admin-badge-warning'}`}>
          {row.is_active ? 'Active' : 'Inactive'}
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
        title="Promotions & Popups"
        subtitle="Manage modal popups, special admission discounts, and scholarship banners"
        columns={columns}
        data={promotions}
        loading={loading}
        onAdd={openAddModal}
        addLabel="Create Promotion"
        onRefresh={fetchData}
        searchPlaceholder="Search promotions..."
      />

      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPromo ? 'Edit Promotion Campaign' : 'New Promotion Campaign'}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
      >
        <div className="admin-form-group">
          <label className="admin-form-label">Campaign Title *</label>
          <input
            type="text"
            className="admin-form-control"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. អាហារូបករណ៍ ១០០%"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">Display Type</label>
            <select
              className="admin-form-control"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="popup">Modal Dialog Popup</option>
              <option value="banner">Header/Footer Banner</option>
              <option value="notification">Notification Toast</option>
            </select>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Button Label</label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.button_text}
              onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
              placeholder="e.g. Enroll Now"
            />
          </div>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Target Link URL</label>
          <input
            type="text"
            className="admin-form-control"
            value={formData.button_link}
            onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
            placeholder="/register or /courses"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Campaign Message</label>
          <textarea
            className="admin-form-control"
            rows={3}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />
        </div>

        <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            id="promoActiveCheck"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          />
          <label htmlFor="promoActiveCheck" style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}>
            Enable campaign immediately
          </label>
        </div>
      </AdminModal>
    </div>
  );
};
