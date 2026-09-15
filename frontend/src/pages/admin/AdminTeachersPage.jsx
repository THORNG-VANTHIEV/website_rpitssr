import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import {
  GraduationCap,
  Award,
  Building2,
  BookOpen,
  Phone,
  Mail,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  Upload,
  X,
  Check,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Briefcase,
  FileText,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const AdminTeachersPage = () => {
  const { currentLanguage } = useLanguage();
  const isKhmer = currentLanguage === 'km';

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('all');

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Profile Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewTeacher, setPreviewTeacher] = useState(null);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    department: '',
    subject: '',
    imageUrl: '',
    educationalQualifications: '',
    experience: '',
    description: '',
    facebook: '',
    linkedin: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/teachers?limit=100');
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setTeachers(list);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      showToast(isKhmer ? 'បរាជ័យក្នុងការទាញយកបញ្ជីសាស្ត្រាចារ្យ' : 'Failed to fetch teachers list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute metric stats
  const metrics = useMemo(() => {
    const total = teachers.length;
    const leaders = teachers.filter((t) =>
      /director|head|dean|president|ប្រធាន|នាយក/i.test(t.designation || '')
    ).length;
    const depts = new Set(teachers.map((t) => t.department).filter(Boolean)).size;
    const postgrad = teachers.filter((t) =>
      /ph\.?d|master|បណ្ឌិត|អនុបណ្ឌិត|specialist/i.test(
        `${t.educationalQualifications || ''} ${t.designation || ''}`
      )
    ).length;
    return { total, leaders, depts, postgrad };
  }, [teachers]);

  // Compute unique departments for filter pills
  const departments = useMemo(() => {
    const depts = teachers.map((t) => t.department).filter(Boolean);
    return Array.from(new Set(depts));
  }, [teachers]);

  // Filtered teachers based on selected department
  const filteredTeachers = useMemo(() => {
    if (selectedDept === 'all') return teachers;
    return teachers.filter((t) => t.department === selectedDept);
  }, [teachers, selectedDept]);

  // Helper for teacher initials
  const getTeacherInitials = (name) => {
    if (!name) return 'RP';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      designation: 'Senior Lecturer',
      department: 'Information Technology',
      subject: '',
      imageUrl: '/images/teachers/teacher-1.jpg',
      educationalQualifications: 'Master of Engineering / M.Sc.',
      experience: '5+ Years in Technical Education',
      description: '',
      facebook: 'https://facebook.com',
      linkedin: 'https://linkedin.com',
    });
    setModalOpen(true);
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
      educationalQualifications: t.educationalQualifications || '',
      experience: t.experience || '',
      description: t.description || '',
      facebook: t.facebook || '',
      linkedin: t.linkedin || '',
    });
    setModalOpen(true);
  };

  const handleOpenPreview = (t) => {
    setPreviewTeacher(t);
    setPreviewModalOpen(true);
  };

  const handleOpenDelete = (t) => {
    setTeacherToDelete(t);
    setDeleteModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);
    data.append('subDir', 'teachers');
    setUploading(true);
    try {
      const res = await api.post('/admin/teachers/upload-image', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data.imageUrl || res.data.url;
      if (url) {
        setFormData((prev) => ({ ...prev, imageUrl: url }));
        showToast(isKhmer ? 'បានផ្ទុករូបថតឡើងដោយជោគជ័យ!' : 'Photo uploaded successfully!');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      showToast(isKhmer ? 'បរាជ័យក្នុងការផ្ទុករូបថត' : 'Photo upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      showToast(isKhmer ? 'សូមបញ្ចូលឈ្មោះសាស្ត្រាចារ្យ' : 'Teacher name is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingTeacher) {
        await api.put(`/admin/teachers/${editingTeacher.id}`, formData);
        showToast(isKhmer ? 'បានធ្វើបច្ចុប្បន្នភាពព័ត៌មានសាស្ត្រាចារ្យរួចរាល់!' : 'Teacher updated successfully!');
      } else {
        await api.post('/admin/teachers', formData);
        showToast(isKhmer ? 'បានបន្ថែមសាស្ត្រាចារ្យថ្មីដោយជោគជ័យ!' : 'New teacher added successfully!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Save teacher error:', err);
      const errMsg = err.response?.data?.message || err.message || (isKhmer ? 'បរាជ័យក្នុងការរក្សាទុក' : 'Failed to save teacher.');
      showToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!teacherToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/teachers/${teacherToDelete.id}`);
      showToast(
        isKhmer
          ? `បានលុបសាស្ត្រាចារ្យ "${teacherToDelete.name}" ចេញពីប្រព័ន្ធរួចរាល់!`
          : `Teacher "${teacherToDelete.name}" deleted successfully!`
      );
      setDeleteModalOpen(false);
      setTeacherToDelete(null);
      fetchData();
    } catch (err) {
      console.error('Delete teacher error:', err);
      showToast(isKhmer ? 'បរាជ័យក្នុងការលុប' : 'Failed to delete teacher.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: isKhmer ? 'ប្រវត្តិរូបសាស្ត្រាចារ្យ' : 'Faculty Member',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="admin-teacher-avatar-wrapper">
            <img
              src={row.imageUrl || '/images/teacher-all.jpg'}
              alt={row.name}
              className="admin-teacher-avatar-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/teacher-all.jpg';
              }}
            />
          </div>
          <div>
            <div style={{ fontWeight: '700', color: '#07294D', fontSize: '0.92rem' }}>
              {row.name}
            </div>
            <div
              style={{
                fontSize: '0.78rem',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '2px',
              }}
            >
              <Mail size={12} style={{ opacity: 0.7 }} />
              <span>{row.email || '—'}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: isKhmer ? 'មុខតំណែង' : 'Designation',
      render: (row) => {
        const des = row.designation || 'Lecturer';
        const isHead = /director|head|dean|president|ប្រធាន|នាយក/i.test(des);
        return (
          <span
            className={`admin-badge ${isHead ? 'admin-badge-warning' : 'admin-badge-info'}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            {isHead ? <Award size={12} /> : <GraduationCap size={12} />}
            <span>{des}</span>
          </span>
        );
      },
    },
    {
      header: isKhmer ? 'ដេប៉ាតឺម៉ង់' : 'Department',
      render: (row) => (
        <span className="admin-dept-pill">
          <Building2 size={12} style={{ color: '#1e73be' }} />
          <span>{row.department || (isKhmer ? 'ទូទៅ' : 'General')}</span>
        </span>
      ),
    },
    {
      header: isKhmer ? 'ឯកទេស / មុខវិជ្ជា' : 'Specialization',
      render: (row) => {
        if (!row.subject) return <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>—</span>;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', color: '#334155' }}>
            <BookOpen size={13} style={{ color: '#059669', flexShrink: 0 }} />
            <span style={{ fontWeight: '500' }}>{row.subject}</span>
          </div>
        );
      },
    },
    {
      header: isKhmer ? 'លេខទូរស័ព្ទ' : 'Contact Phone',
      render: (row) => {
        if (!row.phone) return <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>—</span>;
        return (
          <a
            href={`tel:${row.phone.replace(/\s+/g, '')}`}
            style={{
              fontSize: '0.82rem',
              color: '#1e73be',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: '500',
            }}
          >
            <Phone size={12} />
            <span>{row.phone}</span>
          </a>
        );
      },
    },
    {
      header: isKhmer ? 'សកម្មភាព' : 'Actions',
      align: 'right',
      render: (row) => (
        <div className="admin-action-btn-group">
          <button
            onClick={() => handleOpenPreview(row)}
            className="admin-icon-btn"
            title={isKhmer ? 'មើលប្រវត្តិរូប' : 'View Profile'}
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            className="admin-icon-btn primary"
            title={isKhmer ? 'កែសម្រួលព័ត៌មាន' : 'Edit Teacher'}
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleOpenDelete(row)}
            className="admin-icon-btn danger"
            title={isKhmer ? 'លុបសាស្ត្រាចារ្យ' : 'Delete Teacher'}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Floating Alert Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 20px',
            borderRadius: '12px',
            background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
            color: toast.type === 'error' ? '#991b1b' : '#166534',
            boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
            fontWeight: '600',
            fontSize: '0.88rem',
            animation: 'fadeIn 0.25s ease',
          }}
        >
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              padding: '2px',
              marginLeft: '8px',
              opacity: 0.7,
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              background: '#eff6ff',
              color: '#1e73be',
              fontSize: '0.78rem',
              fontWeight: '700',
              marginBottom: '8px',
              border: '1px solid #dbeafe',
            }}
          >
            <GraduationCap size={14} />
            <span>{isKhmer ? 'បុគ្គលិកអប់រំ និងសាស្ត្រាចារ្យ' : 'Academic Faculty & Leadership'}</span>
          </div>
          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: '800',
              color: '#07294D',
              margin: '0 0 6px 0',
              letterSpacing: '-0.3px',
            }}
          >
            {isKhmer ? 'សាស្ត្រាចារ្យ & បុគ្គលិកអប់រំ' : 'Faculty & Instructors Directory'}
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
            {isKhmer
              ? 'គ្រប់គ្រងព័ត៌មានលម្អិត ឯកទេសបង្រៀន ដេប៉ាតឺម៉ង់ និងប្រវត្តិរូបសាស្ត្រាចារ្យ RPITSSR'
              : 'Manage institute lecturers, heads of departments, specialized technical trainers, and academic qualifications.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchData}
            className="admin-btn admin-btn-outline"
            disabled={loading}
            title={isKhmer ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>{isKhmer ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="admin-btn admin-btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(7, 41, 77, 0.15)',
            }}
          >
            <Plus size={16} />
            <span>{isKhmer ? 'បន្ថែមសាស្ត្រាចារ្យថ្មី' : 'Add New Teacher'}</span>
          </button>
        </div>
      </div>

      {/* 4-Card Institutional KPI Metric Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Total Teachers */}
        <div className="admin-kpi-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="admin-kpi-icon-badge" style={{ background: '#eff6ff', color: '#1e73be', border: '1px solid #dbeafe' }}>
              <GraduationCap size={22} />
            </div>
            <span className="admin-kpi-tag" style={{ background: '#eff6ff', color: '#1e73be' }}>
              {isKhmer ? 'សរុប' : 'Total'}
            </span>
          </div>
          <div className="admin-kpi-value">{metrics.total}</div>
          <div className="admin-kpi-title">{isKhmer ? 'សាស្ត្រាចារ្យសរុប' : 'Total Faculty'}</div>
          <div className="admin-kpi-subtitle">
            <span>{isKhmer ? 'សាស្ត្រាចារ្យ និងគ្រូឧទ្ទេសសកម្ម' : 'Active academic educators'}</span>
          </div>
        </div>

        {/* Department Heads & Leaders */}
        <div className="admin-kpi-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="admin-kpi-icon-badge" style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa' }}>
              <Award size={22} />
            </div>
            <span className="admin-kpi-tag" style={{ background: '#fff7ed', color: '#ea580c' }}>
              {isKhmer ? 'ថ្នាក់ដឹកនាំ' : 'Leadership'}
            </span>
          </div>
          <div className="admin-kpi-value">{metrics.leaders}</div>
          <div className="admin-kpi-title">{isKhmer ? 'ប្រធានដេប៉ាតឺម៉ង់' : 'Department Heads & Execs'}</div>
          <div className="admin-kpi-subtitle">
            <span>{isKhmer ? 'ថ្នាក់ដឹកនាំ និងប្រធានផ្នែក' : 'Departmental leadership'}</span>
          </div>
        </div>

        {/* Academic Departments */}
        <div className="admin-kpi-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="admin-kpi-icon-badge" style={{ background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' }}>
              <Building2 size={22} />
            </div>
            <span className="admin-kpi-tag" style={{ background: '#f0fdf4', color: '#059669' }}>
              {isKhmer ? 'ដេប៉ាតឺម៉ង់' : 'Depts'}
            </span>
          </div>
          <div className="admin-kpi-value">{metrics.depts}</div>
          <div className="admin-kpi-title">{isKhmer ? 'ដេប៉ាតឺម៉ង់ជំនាញ' : 'Specialized Departments'}</div>
          <div className="admin-kpi-subtitle">
            <span>{isKhmer ? 'ផ្នែកបច្ចេកវិទ្យា និងវិស្វកម្ម' : 'Tech & Engineering faculties'}</span>
          </div>
        </div>

        {/* Advanced Qualifications */}
        <div className="admin-kpi-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="admin-kpi-icon-badge" style={{ background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}>
              <BookOpen size={22} />
            </div>
            <span className="admin-kpi-tag" style={{ background: '#faf5ff', color: '#7c3aed' }}>
              {isKhmer ? 'គុណវុឌ្ឍិ' : 'Degrees'}
            </span>
          </div>
          <div className="admin-kpi-value">{metrics.postgrad}</div>
          <div className="admin-kpi-title">{isKhmer ? 'កម្រិតបណ្ឌិត & អនុបណ្ឌិត' : 'Postgraduate Degrees'}</div>
          <div className="admin-kpi-subtitle">
            <span>{isKhmer ? 'បណ្ឌិត និងអនុបណ្ឌិតជំនាញ' : 'Ph.D & Master holders'}</span>
          </div>
        </div>
      </div>

      {/* Dynamic Department Filter Tabs Strip */}
      <div className="admin-user-filter-bar">
        <button
          className={`admin-user-filter-pill ${selectedDept === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedDept('all')}
        >
          <Layers size={15} />
          <span>{isKhmer ? 'ទាំងអស់' : 'All Departments'}</span>
          <span className="admin-user-filter-count">{teachers.length}</span>
        </button>

        {departments.map((dept) => {
          const count = teachers.filter((t) => t.department === dept).length;
          return (
            <button
              key={dept}
              className={`admin-user-filter-pill ${selectedDept === dept ? 'active' : ''}`}
              onClick={() => setSelectedDept(dept)}
            >
              <Building2 size={15} />
              <span>{dept}</span>
              <span className="admin-user-filter-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Main DataTable Card */}
      <AdminDataTable
        title={isKhmer ? 'បញ្ជីឈ្មោះសាស្ត្រាចារ្យ និងគ្រូឧទ្ទេស' : 'Faculty & Staff Directory'}
        subtitle={
          isKhmer
            ? `បង្ហាញសរុប ${filteredTeachers.length} រូប តាមដេប៉ាតឺម៉ង់ដែលបានជ្រើសរើស`
            : `Displaying ${filteredTeachers.length} faculty members based on active department filter`
        }
        columns={columns}
        data={filteredTeachers}
        loading={loading}
        onAdd={handleOpenAdd}
        addLabel={isKhmer ? 'បន្ថែមសាស្ត្រាចារ្យថ្មី' : 'Add New Teacher'}
        onRefresh={fetchData}
        searchPlaceholder={isKhmer ? 'ស្វែងរកតាមឈ្មោះ, អ៊ីមែល, ឬដេប៉ាតឺម៉ង់...' : 'Search teachers by name, email or department...'}
      />

      {/* =========================================================
          Create / Edit Teacher Modal
          ========================================================= */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingTeacher
            ? (isKhmer ? `កែសម្រួលព័ត៌មាន៖ ${editingTeacher.name}` : `Edit Teacher: ${editingTeacher.name}`)
            : (isKhmer ? 'បន្ថែមសាស្ត្រាចារ្យថ្មី' : 'Add New Faculty Member')
        }
        submitLabel={
          editingTeacher
            ? (isKhmer ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'Save Changes')
            : (isKhmer ? 'បន្ថែមសាស្ត្រាចារ្យ' : 'Save Teacher')
        }
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        maxWidth="760px"
      >
        {/* Section 1: Personal Info & Photo */}
        <div className="admin-modal-section-divider" style={{ marginTop: 0 }}>
          <span className="admin-modal-section-title">
            <GraduationCap size={15} style={{ color: '#1e73be' }} />
            {isKhmer ? 'ព័ត៌មានផ្ទាល់ខ្លួន & រូបថត' : 'Personal Profile & Photo'}
          </span>
        </div>

        {/* Photo Uploader Box */}
        <div className="admin-form-group">
          <label className="admin-form-label">{isKhmer ? 'រូបថតសាស្ត្រាចារ្យ' : 'Teacher Photograph'}</label>
          <div className="admin-teacher-photo-uploader">
            {formData.imageUrl ? (
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="admin-teacher-photo-preview"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/teacher-all.jpg';
                }}
              />
            ) : (
              <div className="admin-teacher-photo-empty">
                <GraduationCap size={28} />
              </div>
            )}

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <input
                  type="text"
                  className="admin-form-control"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="/images/teachers/teacher-1.jpg"
                  style={{ fontSize: '0.82rem' }}
                />
                <label className="admin-btn admin-btn-outline" style={{ whiteSpace: 'nowrap', cursor: 'pointer', padding: '7px 14px' }}>
                  <Upload size={14} />
                  <span>{uploading ? (isKhmer ? 'កំពុងផ្ទុក...' : 'Uploading...') : (isKhmer ? 'ផ្ទុករូបភាព' : 'Upload')}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </label>
              </div>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                {isKhmer
                  ? 'ទ្រង់ទ្រាយដែលគាំទ្រ៖ JPG, PNG, WebP (ទំហំសមាមាត្រ ១:១ ការ៉េ ផ្តល់លទ្ធផលល្អបំផុត)'
                  : 'Supported formats: JPG, PNG, WebP (Square 1:1 aspect ratio recommended)'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'ឈ្មោះពេញ (Full Name) *' : 'Full Name *'}
            </label>
            <input
              type="text"
              className="admin-form-control"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={isKhmer ? 'ឧ. Dr. Seng Bunthoeun ឬ សុខ ដារ៉ា' : 'e.g. Dr. Seng Bunthoeun'}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'អាសយដ្ឋានអ៊ីមែល (Email)' : 'Email Address'}
            </label>
            <input
              type="email"
              className="admin-form-control"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@rpitssr.edu.kh"
            />
          </div>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">
            {isKhmer ? 'លេខទូរស័ព្ទ (Phone Number)' : 'Contact Phone Number'}
          </label>
          <input
            type="text"
            className="admin-form-control"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+855 63 963 888"
          />
        </div>

        {/* Section 2: Designation & Department */}
        <div className="admin-modal-section-divider">
          <span className="admin-modal-section-title">
            <Building2 size={15} style={{ color: '#059669' }} />
            {isKhmer ? 'តួនាទី & ដេប៉ាតឺម៉ង់បង្រៀន' : 'Designation & Academic Department'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'មុខតំណែង (Designation)' : 'Designation / Title'}
            </label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              placeholder="e.g. Head of Information Technology / Senior Lecturer"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'ដេប៉ាតឺម៉ង់ (Department)' : 'Department'}
            </label>
            <input
              type="text"
              list="deptList"
              className="admin-form-control"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="e.g. Information Technology"
            />
            <datalist id="deptList">
              <option value="Information Technology" />
              <option value="Civil Engineering" />
              <option value="Electrical Engineering" />
              <option value="Executive Management" />
              <option value="Automotive Engineering" />
              <option value="General Subjects" />
            </datalist>
          </div>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">
            {isKhmer ? 'មុខវិជ្ជា / ឯកទេសបង្រៀន (Subject Specialization)' : 'Subject / Teaching Specialization'}
          </label>
          <input
            type="text"
            className="admin-form-control"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="e.g. Web Development, Cloud Computing & AI Systems"
          />
        </div>

        {/* Section 3: Professional Experience & Qualifications */}
        <div className="admin-modal-section-divider">
          <span className="admin-modal-section-title">
            <BookOpen size={15} style={{ color: '#ea580c' }} />
            {isKhmer ? 'កម្រិតវប្បធម៌ & បទពិសោធន៍' : 'Qualifications & Professional Background'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'កម្រិតគុណវុឌ្ឍិ (Qualifications)' : 'Educational Qualifications'}
            </label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.educationalQualifications}
              onChange={(e) => setFormData({ ...formData, educationalQualifications: e.target.value })}
              placeholder="e.g. Master of Science in Information Technology"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'បទពិសោធន៍ការងារ (Experience)' : 'Years of Experience'}
            </label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              placeholder="e.g. 10+ Years in TVET Training & Software Dev"
            />
          </div>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">
            {isKhmer ? 'ជីវប្រវត្តសង្ខេប / ព័ត៌មានបន្ថែម (Short Biography)' : 'Short Biography / Profile Summary'}
          </label>
          <textarea
            className="admin-form-control"
            rows="3"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={isKhmer ? 'រៀបរាប់សង្ខេបអំពីសមិទ្ធផល ការបណ្តុះបណ្តាល និងបេសកកម្មអប់រំ...' : 'Summarize teaching philosophy, research achievements, or industry background...'}
          />
        </div>

        {/* Section 4: Social Links */}
        <div className="admin-modal-section-divider">
          <span className="admin-modal-section-title">
            <ExternalLink size={15} style={{ color: '#7c3aed' }} />
            {isKhmer ? 'តំណភ្ជាប់បណ្តាញសង្គម' : 'Social & Professional Links'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">Facebook Profile URL</label>
            <input
              type="url"
              className="admin-form-control"
              value={formData.facebook}
              onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
              placeholder="https://facebook.com/username"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">LinkedIn Profile URL</label>
            <input
              type="url"
              className="admin-form-control"
              value={formData.linkedin}
              onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </div>
      </AdminModal>

      {/* =========================================================
          Teacher Profile Preview Modal
          ========================================================= */}
      {previewModalOpen && previewTeacher && (
        <div className="admin-modal-backdrop" onClick={() => setPreviewModalOpen(false)}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: '560px', padding: '0', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)',
                padding: '28px 24px 20px',
                color: '#ffffff',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setPreviewModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <img
                  src={previewTeacher.imageUrl || '/images/teacher-all.jpg'}
                  alt={previewTeacher.name}
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '16px',
                    objectFit: 'cover',
                    border: '3px solid #ffffff',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
                    backgroundColor: '#ffffff',
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/teacher-all.jpg';
                  }}
                />
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>
                    {previewTeacher.name}
                  </h3>
                  <div style={{ fontSize: '0.86rem', opacity: 0.9, marginBottom: '6px' }}>
                    {previewTeacher.designation}
                  </div>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'rgba(255,255,255,0.2)',
                      padding: '2px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                    }}
                  >
                    <Building2 size={12} />
                    <span>{previewTeacher.department}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Content Details */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '18px' }}>
                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '4px' }}>
                    {isKhmer ? 'អ៊ីមែលផ្លូវការ' : 'Official Email'}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#07294D', wordBreak: 'break-all' }}>
                    {previewTeacher.email || '—'}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '4px' }}>
                    {isKhmer ? 'លេខទូរស័ព្ទ' : 'Contact Phone'}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#07294D' }}>
                    {previewTeacher.phone || '—'}
                  </div>
                </div>
              </div>

              {previewTeacher.educationalQualifications && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#07294D', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <BookOpen size={14} style={{ color: '#1e73be' }} />
                    <span>{isKhmer ? 'កម្រិតវប្បធម៌ & សញ្ញាបត្រ' : 'Educational Qualifications'}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#475569', background: '#eff6ff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dbeafe' }}>
                    {previewTeacher.educationalQualifications}
                  </div>
                </div>
              )}

              {previewTeacher.experience && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#07294D', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <Briefcase size={14} style={{ color: '#ea580c' }} />
                    <span>{isKhmer ? 'បទពិសោធន៍ការងារ' : 'Professional Experience'}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#475569', background: '#fff7ed', padding: '10px 12px', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                    {previewTeacher.experience}
                  </div>
                </div>
              )}

              {previewTeacher.description && (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#07294D', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <FileText size={14} style={{ color: '#059669' }} />
                    <span>{isKhmer ? 'ជីវប្រវត្តិសង្ខេប' : 'Biography Summary'}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5 }}>
                    {previewTeacher.description}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '8px' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  onClick={() => setPreviewModalOpen(false)}
                >
                  {isKhmer ? 'បិទ' : 'Close'}
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={() => {
                    setPreviewModalOpen(false);
                    handleOpenEdit(previewTeacher);
                  }}
                >
                  <Edit2 size={14} />
                  <span>{isKhmer ? 'កែសម្រួល' : 'Edit Profile'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          Delete Confirmation Modal
          ========================================================= */}
      {deleteModalOpen && teacherToDelete && (
        <div className="admin-modal-backdrop" onClick={() => setDeleteModalOpen(false)}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: '440px', textAlign: 'center', padding: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#fef2f2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                border: '1px solid #fecaca',
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#07294D', margin: '0 0 8px' }}>
              {isKhmer ? 'តើអ្នកពិតជាចង់លុបមែនទេ?' : 'Confirm Teacher Deletion'}
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 16px' }}>
              {isKhmer
                ? `តើលោកអ្នកពិតជាចង់លុបព័ត៌មានសាស្ត្រាចារ្យ "${teacherToDelete.name}" ចេញពីបញ្ជីស្ថាប័នមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយបានឡើយ។`
                : `Are you sure you want to permanently delete "${teacherToDelete.name}" from the faculty directory? This action cannot be undone.`}
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="admin-btn admin-btn-outline"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
              >
                {isKhmer ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? (isKhmer ? 'កំពុងលុប...' : 'Deleting...') : (isKhmer ? 'លុបសាស្ត្រាចារ្យ' : 'Delete Teacher')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
