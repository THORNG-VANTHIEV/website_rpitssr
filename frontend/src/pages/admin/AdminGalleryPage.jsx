import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import { Edit2, Trash2, Upload, Image as ImageIcon } from 'lucide-react';

export const AdminGalleryPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'campus',
    imageUrl: '',
    description: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/gallery-images');
      setImages(res.data || []);
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
    setEditingImage(null);
    setFormData({
      title: '',
      category: 'campus',
      imageUrl: '/images/gallery/school.jpg',
      description: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (img) => {
    setEditingImage(img);
    setFormData({
      title: img.title || '',
      category: img.category || 'campus',
      imageUrl: img.imageUrl || '',
      description: img.description || '',
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);
    setUploading(true);
    try {
      const res = await api.post('/admin/gallery-images/upload-image', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.imageUrl) {
        setFormData((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
      }
    } catch {
      alert('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingImage) {
        await api.put(`/admin/gallery-images/${editingImage.id}`, formData);
      } else {
        await api.post('/admin/gallery-images', formData);
      }
      setModalOpen(false);
      fetchData();
    } catch {
      alert('Failed to save gallery image.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (img) => {
    if (!window.confirm('Delete this gallery photo?')) return;
    try {
      await api.delete(`/admin/gallery-images/${img.id}`);
      fetchData();
    } catch {
      alert('Failed to delete image.');
    }
  };

  const columns = [
    {
      header: 'Photo Preview',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={row.imageUrl}
            alt=""
            style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--admin-border)' }}
          />
          <div>
            <div style={{ fontWeight: '700', color: 'var(--admin-primary)' }}>{row.title || 'Untitled Photo'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{row.description || '--'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Album Category',
      accessor: 'category',
      render: (row) => <span className="admin-badge admin-badge-info">{row.category?.toUpperCase()}</span>,
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
        title="Photo Gallery"
        subtitle="Manage institute campus photographs, student workshop showcases, and event galleries"
        columns={columns}
        data={images}
        loading={loading}
        onAdd={openAddModal}
        addLabel="Upload New Photo"
        onRefresh={fetchData}
        searchPlaceholder="Search gallery by title..."
      />

      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingImage ? 'Edit Photo Details' : 'Upload Gallery Photo'}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
      >
        <div className="admin-form-group">
          <label className="admin-form-label">Photo Caption / Title *</label>
          <input
            type="text"
            className="admin-form-control"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. សិក្ខាសាលាអនុវត្តផ្ទាល់ / Workshop Practical Session"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Album Category</label>
          <select
            className="admin-form-control"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="campus">Campus & Facilities</option>
            <option value="students">Students & Life</option>
            <option value="workshop">Workshops & Labs</option>
            <option value="events">Events & Ceremonies</option>
          </select>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Image URL / File</label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="text"
              className="admin-form-control"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
            <label className="admin-btn admin-btn-outline" style={{ whiteSpace: 'nowrap', cursor: 'pointer' }}>
              <Upload size={14} />
              <span>{uploading ? 'Uploading...' : 'Upload'}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Description (Optional)</label>
          <textarea
            className="admin-form-control"
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </AdminModal>
    </div>
  );
};
