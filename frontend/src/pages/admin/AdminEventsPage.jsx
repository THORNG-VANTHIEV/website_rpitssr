import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import { Edit2, Trash2, Calendar, MapPin, Upload } from 'lucide-react';

export const AdminEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: new Date().toISOString().split('T')[0],
    location: 'RPITSSR Main Campus',
    categoryId: '',
    imageUrl: '/images/events/e-1.webp',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, catRes] = await Promise.all([
        api.get('/admin/events'),
        api.get('/admin/event-categories'),
      ]);
      setEvents(eventsRes.data || []);
      setCategories(catRes.data || []);
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
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      eventDate: new Date().toISOString().split('T')[0],
      location: 'RPITSSR Main Campus, Siem Reap',
      categoryId: categories[0]?.id || '',
      imageUrl: '/images/events/e-1.webp',
    });
    setModalOpen(true);
  };

  const openEditModal = (e) => {
    setEditingEvent(e);
    setFormData({
      title: e.title || '',
      description: e.description || '',
      eventDate: e.eventDate ? e.eventDate.split('T')[0] : '',
      location: e.location || '',
      categoryId: e.categoryId || '',
      imageUrl: e.imageUrl || '',
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
      const res = await api.post('/admin/events/upload-image', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.imageUrl) {
        setFormData((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
      }
    } catch {
      alert('Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingEvent) {
        await api.put(`/admin/events/${editingEvent.id}`, formData);
      } else {
        await api.post('/admin/events', formData);
      }
      setModalOpen(false);
      fetchData();
    } catch {
      alert('Failed to save event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (e) => {
    if (!window.confirm(`Delete event "${e.title}"?`)) return;
    try {
      await api.delete(`/admin/events/${e.id}`);
      fetchData();
    } catch {
      alert('Failed to delete event.');
    }
  };

  const columns = [
    {
      header: 'Event',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={row.imageUrl || '/images/events/e-1.webp'}
            alt=""
            style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '4px' }}
          />
          <div>
            <div style={{ fontWeight: '700', color: 'var(--admin-primary)' }}>{row.title}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
              {row.category?.name || 'Academic'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Date',
      render: (row) => (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} color="var(--admin-accent)" />
          <span>{row.eventDate ? new Date(row.eventDate).toLocaleDateString() : 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Location',
      render: (row) => (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={14} color="var(--admin-text-muted)" />
          <span>{row.location || 'Siem Reap'}</span>
        </div>
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
        title="Campus Events"
        subtitle="Manage conferences, workshops, graduation ceremonies, and cultural events"
        columns={columns}
        data={events}
        loading={loading}
        onAdd={openAddModal}
        addLabel="Add New Event"
        onRefresh={fetchData}
        searchPlaceholder="Search events..."
      />

      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEvent ? 'Edit Event' : 'Create Event'}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
      >
        <div className="admin-form-group">
          <label className="admin-form-label">Event Title *</label>
          <input
            type="text"
            className="admin-form-control"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. ពិធីប្រគល់សញ្ញាបត្រ / Graduation Ceremony"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">Category</label>
            <select
              className="admin-form-control"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Event Date</label>
            <input
              type="date"
              className="admin-form-control"
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
            />
          </div>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Location / Venue</label>
          <input
            type="text"
            className="admin-form-control"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="RPITSSR Main Hall, Siem Reap"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Featured Image</label>
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
          <label className="admin-form-label">Description</label>
          <textarea
            className="admin-form-control"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Event details..."
          />
        </div>
      </AdminModal>
    </div>
  );
};
