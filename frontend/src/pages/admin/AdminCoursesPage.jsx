import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import { Edit2, Trash2, BookOpen, Upload } from 'lucide-react';

export const AdminCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    overview: '',
    categoryId: '',
    fee: 'Free',
    duration: '2 Years',
    credit: '60',
    semester: '4',
    imageUrl: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, catRes] = await Promise.all([
        api.get('/admin/courses?limit=100'),
        api.get('/admin/course-categories'),
      ]);
      setCourses(coursesRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      overview: '',
      categoryId: categories[0]?.id || '',
      fee: 'Free',
      duration: '2 Years',
      credit: '60',
      semester: '4',
      imageUrl: '/images/courses/c-1.webp',
    });
    setModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title || '',
      description: course.description || '',
      overview: course.overview || '',
      categoryId: course.categoryId || '',
      fee: course.fee || 'Free',
      duration: course.duration || '',
      credit: course.credit || '',
      semester: course.semester || '',
      imageUrl: course.imageUrl || '',
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
      const res = await api.post('/admin/courses/upload-image', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.imageUrl) {
        setFormData((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
      }
    } catch (err) {
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCourse) {
        await api.put(`/admin/courses/${editingCourse.id}`, formData);
      } else {
        await api.post('/admin/courses', formData);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Failed to save course: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`Are you sure you want to delete "${course.title}"?`)) return;
    try {
      await api.delete(`/admin/courses/${course.id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete course.');
    }
  };

  const columns = [
    {
      header: 'Course',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={row.imageUrl || '/images/courses/c-1.webp'}
            alt=""
            style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '4px' }}
          />
          <div>
            <div style={{ fontWeight: '600', color: 'var(--admin-primary)' }}>{row.title}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
              {row.category?.name || 'General'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Fee',
      accessor: 'fee',
      render: (row) => <span className="admin-badge admin-badge-success">{row.fee || 'Free'}</span>,
    },
    {
      header: 'Duration',
      accessor: 'duration',
      render: (row) => row.duration || 'N/A',
    },
    {
      header: 'Credits',
      accessor: 'credit',
      render: (row) => row.credit || 'N/A',
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={() => openEditModal(row)}
            className="admin-btn admin-btn-outline admin-btn-sm"
            title="Edit Course"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="admin-btn admin-btn-danger admin-btn-sm"
            title="Delete Course"
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
        title="Courses Management"
        subtitle="Manage academic, vocational and diploma training programs"
        columns={columns}
        data={courses}
        loading={loading}
        onAdd={openAddModal}
        addLabel="Add New Course"
        onRefresh={fetchData}
        searchPlaceholder="Search courses by title or department..."
      />

      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCourse ? 'Edit Course' : 'Create New Course'}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
      >
        <div className="admin-form-group">
          <label className="admin-form-label">Course Title *</label>
          <input
            type="text"
            className="admin-form-control"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. វិស្វកម្មសំណង់ស៊ីវិល / Civil Engineering"
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
            <label className="admin-form-label">Tuition Fee</label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.fee}
              onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
              placeholder="Free / $350"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">Duration</label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="e.g. 2 Years"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Credits</label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.credit}
              onChange={(e) => setFormData({ ...formData, credit: e.target.value })}
              placeholder="60"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Semesters</label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              placeholder="4"
            />
          </div>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Course Thumbnail Image</label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="text"
              className="admin-form-control"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="/images/courses/c-1.webp"
            />
            <label className="admin-btn admin-btn-outline" style={{ whiteSpace: 'nowrap', cursor: 'pointer' }}>
              <Upload size={14} />
              <span>{uploading ? 'Uploading...' : 'Upload'}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Course Description</label>
          <textarea
            className="admin-form-control"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Short description of the program..."
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Detailed Curriculum Overview</label>
          <textarea
            className="admin-form-control"
            rows={4}
            value={formData.overview}
            onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
            placeholder="Comprehensive overview and learning outcomes..."
          />
        </div>
      </AdminModal>
    </div>
  );
};
