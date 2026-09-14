import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import { Edit2, Trash2 } from 'lucide-react';

export const AdminBannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    message: '',
    order_index: 0,
    is_active: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/scrolling-banners');
      setBanners(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleActive = async (banner) => {
    try {
      const res = await api.post(`/admin/scrolling-banners/${banner.id}/toggle`);
      const updatedStatus = res.data?.data?.is_active ?? !banner.is_active;
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, is_active: updatedStatus } : b))
      );
    } catch {
      alert('Failed to toggle banner status.');
    }
  };

  const openAddModal = () => {
    setEditingBanner(null);
    setFormData({ message: '', order_index: banners.length + 1, is_active: true });
    setModalOpen(true);
  };

  const openEditModal = (b) => {
    setEditingBanner(b);
    setFormData({
      message: b.message || b.text || '',
      order_index: b.order_index ?? b.order ?? 0,
      is_active: Boolean(b.is_active),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingBanner) {
        await api.put(`/admin/scrolling-banners/${editingBanner.id}`, formData);
      } else {
        await api.post('/admin/scrolling-banners', formData);
      }
      setModalOpen(false);
      fetchData();
    } catch {
      alert('Failed to save banner.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (b) => {
    if (!window.confirm('Delete this banner text?')) return;
    try {
      await api.delete(`/admin/scrolling-banners/${b.id}`);
      fetchData();
    } catch {
      alert('Failed to delete banner.');
    }
  };

  const columns = [
    {
      header: 'Announcement Message',
      render: (row) => (
        <div style={{ fontWeight: '600', color: 'var(--admin-primary)', lineHeight: 1.5 }}>
          {row.message || row.text}
        </div>
      ),
    },
    {
      header: 'Display Order',
      render: (row) => <strong>#{row.order_index ?? row.order ?? 0}</strong>,
    },
    {
      header: 'Status (ON / OFF)',
      render: (row) => (
        <label className="admin-toggle-switch" title="Toggle Active">
          <input
            type="checkbox"
            checked={Boolean(row.is_active)}
            onChange={() => handleToggleActive(row)}
          />
          <span className="admin-toggle-slider"></span>
        </label>
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
        title="Scrolling Banners (Ticker)"
        subtitle="Manage the moving headline announcements appearing under the main navbar"
        columns={columns}
        data={banners}
        loading={loading}
        onAdd={openAddModal}
        addLabel="Add Banner Text"
        onRefresh={fetchData}
        searchPlaceholder="Search announcement text..."
      />

      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBanner ? 'Edit Banner Announcement' : 'New Banner Announcement'}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
      >
        <div className="admin-form-group">
          <label className="admin-form-label">Banner Message Text *</label>
          <textarea
            className="admin-form-control"
            rows={3}
            required
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="e.g. វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប បានចាប់ផ្ដើមទទួលពាក្យចូលរៀនវគ្គថ្មី..."
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Display Order</label>
          <input
            type="number"
            className="admin-form-control"
            value={formData.order_index}
            onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            id="bannerActiveCheck"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          />
          <label htmlFor="bannerActiveCheck" style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}>
            Banner is active and will display on ticker immediately
          </label>
        </div>
      </AdminModal>
    </div>
  );
};
