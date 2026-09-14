import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { Edit2, Trash2, Plus, Upload, X, Check } from 'lucide-react';

export const AdminTeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    department: '',
    subject: '',
    imageUrl: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/teachers');
      setTeachers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      designation: 'Senior Instructor',
      department: 'Information Technology',
      subject: '',
      imageUrl: '/images/teachers/t-1.webp',
    });
    setShowForm(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTeacher(t);
    setFormData({
      name: t.name || '',
      email: t.email || '',
      phone: t.phone || '',
      designation: t.designation || '',
      department: t.department || '',
      subject: t.subject || '',
      imageUrl: t.imageUrl || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);
    setUploading(true);
    try {
      const res = await api.post('/admin/teachers/upload-image', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.imageUrl) {
        setFormData((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
      }
    } catch {
      alert('Photo upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingTeacher) {
        await api.put(`/admin/teachers/${editingTeacher.id}`, formData);
      } else {
        await api.post('/admin/teachers', formData);
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert('Failed to save teacher: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`Delete teacher "${t.name}"?`)) return;
    try {
      await api.delete(`/admin/teachers/${t.id}`);
      fetchData();
    } catch {
      alert('Failed to delete teacher.');
    }
  };

  const columns = [
    {
      header: 'Teacher Profile',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={row.imageUrl || '/images/teachers/t-1.webp'}
            alt=""
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontWeight: '700', color: 'var(--admin-primary)' }}>{row.name}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>{row.email || '--'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Designation',
      accessor: 'designation',
      render: (row) => <span className="admin-badge admin-badge-info">{row.designation || 'Lecturer'}</span>,
    },
    {
      header: 'Department',
      accessor: 'department',
      render: (row) => row.department || 'General',
    },
    {
      header: 'Subject',
      accessor: 'subject',
      render: (row) => row.subject || '--',
    },
    {
      header: 'Phone',
      accessor: 'phone',
      render: (row) => row.phone || '--',
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={() => handleOpenEdit(row)}
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
      {/* Inline Form (Matches live site + Add New Teacher form toggle) */}
      {showForm && (
        <div className="admin-card" style={{ border: '2px solid var(--admin-accent)', marginBottom: '24px' }}>
          <div className="admin-card-header" style={{ backgroundColor: '#f0fdf4' }}>
            <h3 className="admin-card-title">
              {editingTeacher ? `Edit Teacher: ${editingTeacher.name}` : 'Add New Teacher'}
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="admin-btn admin-btn-outline admin-btn-sm"
            >
              <X size={16} /> Close Form
            </button>
          </div>

          <form onSubmit={handleSubmit} className="admin-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Full Name *</label>
                <input
                  type="text"
                  className="admin-form-control"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sok Dara / សុខ ដារ៉ា"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Email Address</label>
                <input
                  type="email"
                  className="admin-form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="dara@rpitssr.edu.kh"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Phone Number</label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="012 345 678"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Designation</label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="Senior Lecturer / Head of Dept"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Department</label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Information Technology"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Specialized Subject</label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Web Development / AI"
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Teacher Photo</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  className="admin-form-control"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="/images/teachers/t-1.webp"
                />
                <label className="admin-btn admin-btn-outline" style={{ whiteSpace: 'nowrap', cursor: 'pointer' }}>
                  <Upload size={14} />
                  <span>{uploading ? 'Uploading...' : 'Upload Photo'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button
                type="button"
                className="admin-btn admin-btn-outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={submitting}
              >
                <Check size={16} />
                <span>{submitting ? 'Saving...' : editingTeacher ? 'Update Teacher' : 'Save Teacher'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teachers Data Table */}
      <AdminDataTable
        title="Teachers & Faculty"
        subtitle="Manage institute lecturers, heads of departments, and instructional staff"
        columns={columns}
        data={teachers}
        loading={loading}
        onAdd={handleOpenAdd}
        addLabel="Add New Teacher"
        onRefresh={fetchData}
        searchPlaceholder="Search teachers by name, email or department..."
      />
    </div>
  );
};
