import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import { Edit2, Trash2, Bell, FileText } from 'lucide-react';

export const AdminNoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    publishDate: new Date().toISOString().split('T')[0],
    fileUrl: '',
    isPinned: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/notices');
      setNotices(res.data || []);
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
    setEditingNotice(null);
    setFormData({
      title: '',
      content: '',
      publishDate: new Date().toISOString().split('T')[0],
      fileUrl: '',
      isPinned: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (n) => {
    setEditingNotice(n);
    setFormData({
      title: n.title || '',
      content: n.content || '',
      publishDate: n.publishDate ? n.publishDate.split('T')[0] : '',
      fileUrl: n.fileUrl || '',
      isPinned: Boolean(n.isPinned),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingNotice) {
        await api.put(`/admin/notices/${editingNotice.id}`, formData);
      } else {
        await api.post('/admin/notices', formData);
      }
      setModalOpen(false);
      fetchData();
    } catch {
      alert('Failed to save notice.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (n) => {
    if (!window.confirm(`Delete notice "${n.title}"?`)) return;
    try {
      await api.delete(`/admin/notices/${n.id}`);
      fetchData();
    } catch {
      alert('Failed to delete notice.');
    }
  };

  const columns = [
    {
      header: 'Notice Title',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '700', color: 'var(--admin-primary)' }}>{row.title}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {row.content}
          </div>
        </div>
      ),
    },
    {
      header: 'Published Date',
      render: (row) => (
        <span>{row.publishDate ? new Date(row.publishDate).toLocaleDateString() : 'N/A'}</span>
      ),
    },
    {
      header: 'Attachment',
      render: (row) =>
        row.fileUrl ? (
          <a href={row.fileUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--admin-accent)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <FileText size={14} /> PDF File
          </a>
        ) : (
          <span style={{ color: 'var(--admin-text-muted)' }}>None</span>
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
        title="Official Notices"
        subtitle="Manage institute announcements, circulars, and official letters"
        columns={columns}
        data={notices}
        loading={loading}
        onAdd={openAddModal}
        addLabel="Add Notice"
        onRefresh={fetchData}
        searchPlaceholder="Search notices..."
      />

      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingNotice ? 'Edit Official Notice' : 'Post Official Notice'}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
      >
        <div className="admin-form-group">
          <label className="admin-form-label">Notice Headline *</label>
          <input
            type="text"
            className="admin-form-control"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. សេចក្ដីជូនដំណឹងស្ដីពីការឈប់សម្រាក..."
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">Publish Date</label>
            <input
              type="date"
              className="admin-form-control"
              value={formData.publishDate}
              onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Attachment URL (PDF)</label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.fileUrl}
              onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
              placeholder="/uploads/notices/doc.pdf"
            />
          </div>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Notice Announcement Body</label>
          <textarea
            className="admin-form-control"
            rows={4}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Full notice content..."
          />
        </div>
      </AdminModal>
    </div>
  );
};
