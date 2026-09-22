import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import {
  BookOpen,
  Award,
  Clock,
  Sparkles,
  FolderTree,
  Plus,
  ArrowRight,
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
  Layers,
  GraduationCap,
  Calendar,
  FileText
} from 'lucide-react';

export const AdminCoursesPage = () => {
  const { currentLanguage } = useLanguage();
  const isKhmer = currentLanguage === 'km';

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewCourse, setPreviewCourse] = useState(null);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
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
    title: '',
    description: '',
    overview: '',
    categoryId: '',
    fee: '0',
    duration: '២ ឆ្នាំ',
    credit: '៦០',
    semester: '៤',
    imageUrl: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, catRes] = await Promise.all([
        api.get('/admin/courses?limit=100'),
        api.get('/admin/course-categories'),
      ]);
      const courseList = Array.isArray(coursesRes.data) ? coursesRes.data : (coursesRes.data?.data || []);
      const catList = Array.isArray(catRes.data) ? catRes.data : (catRes.data?.data || []);
      setCourses(courseList);
      setCategories(catList);
    } catch (err) {
      console.error('Failed to load courses:', err);
      showToast(isKhmer ? 'បរាជ័យក្នុងការទាញយកបញ្ជីវគ្គសិក្សា' : 'Failed to fetch courses list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute metric stats
  const metrics = useMemo(() => {
    const total = courses.length;
    const free = courses.filter((c) => c.fee === '0' || /free|ឥតគិតថ្លៃ/i.test(c.fee || '')).length;
    const catCount = categories.length;
    const bachelors = courses.filter((c) => /4|៤/i.test(c.duration || '')).length;
    return { total, free, catCount, bachelors };
  }, [courses, categories]);

  // Categories that have at least one course
  const activeCategories = useMemo(() => {
    const usedCatIds = new Set(courses.map((c) => c.categoryId).filter(Boolean));
    return categories.filter((cat) => usedCatIds.has(cat.id));
  }, [courses, categories]);

  // Filtered courses based on selected category tab
  const filteredCourses = useMemo(() => {
    if (selectedCategory === 'all') return courses;
    return courses.filter((c) => String(c.categoryId) === String(selectedCategory));
  }, [courses, selectedCategory]);

  const openAddModal = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      overview: '',
      categoryId: categories[0]?.id || '',
      fee: '0',
      duration: isKhmer ? '២ ឆ្នាំ' : '2 Years',
      credit: '60',
      semester: '4',
      imageUrl: '/images/courses/course 2.jpg',
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
      fee: course.fee ?? '0',
      duration: course.duration || '',
      credit: course.credit || '',
      semester: course.semester || '',
      imageUrl: course.imageUrl || '',
    });
    setModalOpen(true);
  };

  const openPreviewModal = (course) => {
    setPreviewCourse(course);
    setPreviewModalOpen(true);
  };

  const openDeleteModal = (course) => {
    setCourseToDelete(course);
    setDeleteModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);
    data.append('subDir', 'courses');

    setUploading(true);
    try {
      const res = await api.post('/admin/courses/upload-image', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data.imageUrl || res.data.url;
      if (url) {
        setFormData((prev) => ({ ...prev, imageUrl: url }));
        showToast(isKhmer ? 'បានផ្ទុករូបភាពវគ្គសិក្សាជោគជ័យ!' : 'Course image uploaded successfully!');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      showToast(isKhmer ? 'បរាជ័យក្នុងការផ្ទុករូបភាព' : 'Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      showToast(isKhmer ? 'សូមបញ្ចូលឈ្មោះវគ្គសិក្សា' : 'Course title is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCourse) {
        await api.put(`/admin/courses/${editingCourse.id}`, formData);
        showToast(isKhmer ? 'បានកែប្រែព័ត៌មានវគ្គសិក្សាដោយជោគជ័យ!' : 'Course updated successfully!');
      } else {
        await api.post('/admin/courses', formData);
        showToast(isKhmer ? 'បានបង្កើតវគ្គបណ្តុះបណ្តាលថ្មីដោយជោគជ័យ!' : 'New course created successfully!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Save course error:', err);
      const errMsg = err.response?.data?.message || err.message || (isKhmer ? 'បរាជ័យក្នុងការរក្សាទុក' : 'Failed to save course');
      showToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/courses/${courseToDelete.id}`);
      showToast(
        isKhmer
          ? `បានលុបវគ្គសិក្សា "${courseToDelete.title}" ចេញពីប្រព័ន្ធរួចរាល់!`
          : `Course "${courseToDelete.title}" deleted successfully!`
      );
      setDeleteModalOpen(false);
      setCourseToDelete(null);
      fetchData();
    } catch (err) {
      console.error('Delete course error:', err);
      showToast(isKhmer ? 'បរាជ័យក្នុងការលុបវគ្គសិក្សា' : 'Failed to delete course', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: isKhmer ? 'វគ្គបណ្តុះបណ្តាល & ជំនាញ' : 'Course & Specialization',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="admin-course-thumb-wrapper">
            <img
              src={row.imageUrl || '/images/courses/course 2.jpg'}
              alt={row.title}
              className="admin-course-thumb-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/courses/course 2.jpg';
              }}
            />
          </div>
          <div>
            <div style={{ fontWeight: '700', color: '#07294D', fontSize: '0.92rem' }}>
              {row.title}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
              <FolderTree size={12} style={{ color: '#1e73be' }} />
              <span>{row.category?.name || (isKhmer ? 'ទូទៅ' : 'General')}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: isKhmer ? 'តម្លៃសិក្សា / អាហារូបករណ៍' : 'Tuition Fee / Scholarship',
      render: (row) => {
        const isFree = row.fee === '0' || !row.fee || /free|ឥតគិតថ្លៃ/i.test(row.fee);
        if (isFree) {
          return (
            <span className="admin-fee-badge-free">
              <Sparkles size={12} style={{ color: '#ca8a04' }} />
              <span>{isKhmer ? 'ឥតគិតថ្លៃ (១០០%)' : 'Free (100% Scholarship)'}</span>
            </span>
          );
        }
        return (
          <span className="admin-fee-badge-paid">
            <span>{row.fee}</span>
          </span>
        );
      },
    },
    {
      header: isKhmer ? 'រយៈពេលសិក្សា' : 'Duration',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.84rem', color: '#334155' }}>
          <Clock size={13} style={{ color: '#1e73be' }} />
          <span>{row.duration || '—'}</span>
          {row.semester && (
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              ({row.semester} {isKhmer ? 'ឆមាស' : 'semesters'})
            </span>
          )}
        </div>
      ),
    },
    {
      header: isKhmer ? 'ក្រេឌីត' : 'Credits',
      render: (row) => {
        if (!row.credit) return <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>—</span>;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', color: '#07294D', fontWeight: '600' }}>
            <Award size={13} style={{ color: '#ea580c' }} />
            <span>{row.credit} {isKhmer ? 'ក្រេឌីត' : 'Credits'}</span>
          </div>
        );
      },
    },
    {
      header: isKhmer ? 'សកម្មភាព' : 'Actions',
      align: 'right',
      render: (row) => (
        <div className="admin-action-btn-group">
          <button
            onClick={() => openPreviewModal(row)}
            className="admin-icon-btn"
            title={isKhmer ? 'មើលព័ត៌មានលម្អិត' : 'View Course'}
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="admin-icon-btn primary"
            title={isKhmer ? 'កែសម្រួលវគ្គសិក្សា' : 'Edit Course'}
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => openDeleteModal(row)}
            className="admin-icon-btn danger"
            title={isKhmer ? 'លុបវគ្គសិក្សា' : 'Delete Course'}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  // Mobile Card Renderer (< 768px viewports)
  const renderMobileCard = (row) => {
    const isFree = row.fee === '0' || !row.fee || /free|ឥតគិតថ្លៃ/i.test(row.fee);

    return (
      <div className="admin-user-mobile-card">
        {/* Top: Thumbnail, Title, Category & Fee Badge */}
        <div className="admin-user-mobile-card-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div className="admin-course-thumb-wrapper" style={{ width: '54px', height: '40px', flexShrink: 0 }}>
              <img
                src={row.imageUrl || '/images/courses/course 2.jpg'}
                alt={row.title}
                className="admin-course-thumb-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/courses/course 2.jpg';
                }}
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: '700',
                  color: '#07294D',
                  fontSize: '0.90rem',
                  lineHeight: 1.3,
                  wordBreak: 'break-word',
                }}
              >
                {row.title}
              </div>
              <div
                style={{
                  fontSize: '0.76rem',
                  color: '#64748b',
                  marginTop: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <FolderTree size={12} style={{ color: '#1e73be', flexShrink: 0 }} />
                <span>{row.category?.name || (isKhmer ? 'ទូទៅ' : 'General')}</span>
              </div>
            </div>
          </div>

          {/* Fee / Scholarship Badge */}
          <div style={{ flexShrink: 0 }}>
            {isFree ? (
              <span className="admin-fee-badge-free" style={{ fontSize: '0.70rem', padding: '2px 8px' }}>
                <Sparkles size={11} style={{ color: '#ca8a04' }} />
                <span>{isKhmer ? 'ឥតគិតថ្លៃ' : 'Free'}</span>
              </span>
            ) : (
              <span className="admin-fee-badge-paid" style={{ fontSize: '0.70rem', padding: '2px 8px' }}>
                <span>{row.fee}</span>
              </span>
            )}
          </div>
        </div>

        {/* Details Block: Duration, Credits, and Description Snippet */}
        <div className="admin-user-mobile-card-details">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: '#334155' }}>
              <Clock size={13} style={{ color: '#1e73be', flexShrink: 0 }} />
              <span style={{ fontWeight: '600' }}>{row.duration || '—'}</span>
              {row.semester && (
                <span style={{ color: '#64748b', fontSize: '0.74rem' }}>
                  ({row.semester} {isKhmer ? 'ឆមាស' : 'sem.'})
                </span>
              )}
            </div>

            {row.credit && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem', color: '#ea580c', fontWeight: '600' }}>
                <Award size={12} />
                <span>{row.credit} {isKhmer ? 'ក្រេឌីត' : 'Credits'}</span>
              </div>
            )}
          </div>

          {row.description && (
            <div
              style={{
                fontSize: '0.76rem',
                color: '#64748b',
                marginTop: '6px',
                paddingTop: '6px',
                borderTop: '1px dashed #e2e8f0',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {row.description}
            </div>
          )}
        </div>

        {/* Action Buttons Bar */}
        <div className="admin-user-mobile-card-actions">
          <button
            onClick={() => openPreviewModal(row)}
            className="admin-user-mobile-action-btn view"
            title={isKhmer ? 'មើលព័ត៌មានលម្អិត' : 'View Course'}
          >
            <Eye size={13} />
            <span>{isKhmer ? 'ព័ត៌មាន' : 'View'}</span>
          </button>

          <button
            onClick={() => openEditModal(row)}
            className="admin-user-mobile-action-btn edit"
            title={isKhmer ? 'កែសម្រួលវគ្គសិក្សា' : 'Edit Course'}
          >
            <Edit2 size={13} />
            <span>{isKhmer ? 'កែសម្រួល' : 'Edit'}</span>
          </button>

          <button
            onClick={() => openDeleteModal(row)}
            className="admin-user-mobile-action-btn delete"
            title={isKhmer ? 'លុបវគ្គសិក្សា' : 'Delete Course'}
          >
            <Trash2 size={13} />
            <span>{isKhmer ? 'លុប' : 'Delete'}</span>
          </button>
        </div>
      </div>
    );
  };

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
        className="admin-courses-header"
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
            <BookOpen size={14} />
            <span>{isKhmer ? 'ការគ្រប់គ្រងវគ្គសិក្សា & ជំនាញ' : 'Academic & TVET Curriculum'}</span>
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
            {isKhmer ? 'វគ្គបណ្តុះបណ្តាល & កម្មវិធីសិក្សា' : 'Courses & Training Programs'}
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
            {isKhmer
              ? 'គ្រប់គ្រងវគ្គបណ្តុះបណ្តាលវិជ្ជាជីវៈ កម្រិតសញ្ញាបត្របច្ចេកទេស និងកម្មវិធីសិក្សាអាហារូបករណ៍រដ្ឋាភិបាល TVET'
              : 'Manage technical vocational diplomas, higher education degrees, and national TVET training programs.'}
          </p>
        </div>

        <div className="admin-courses-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            onClick={openAddModal}
            className="admin-btn admin-btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(7, 41, 77, 0.15)',
            }}
          >
            <Plus size={16} />
            <span>{isKhmer ? 'បង្កើតវគ្គសិក្សាថ្មី' : 'Add New Course'}</span>
          </button>
        </div>
      </div>

      {/* 4-Card Institutional KPI Metric Strip */}
      <div className="admin-kpi-grid admin-course-kpis">
        {/* Total Courses */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">{isKhmer ? 'វគ្គសិក្សាសរុប' : 'Total Programs'}</span>
              <div className="admin-kpi-value">{metrics.total}</div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#1e73be' }} />
                <span>{isKhmer ? 'ជំនាញបណ្តុះបណ្តាលសកម្ម' : 'Active accredited programs'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#eff6ff', color: '#1e73be' }}>
                {isKhmer ? 'សរុប' : 'Total'}
              </span>
              <div className="admin-kpi-icon-badge" style={{ background: '#eff6ff', color: '#1e73be', border: '1px solid #dbeafe' }}>
                <BookOpen size={24} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'គ្រប់គ្រងវគ្គសិក្សា' : 'Manage programs'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* Free TVET Scholarships */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">{isKhmer ? 'អាហារូបករណ៍ ១០០%' : '100% Scholarships'}</span>
              <div className="admin-kpi-value">{metrics.free}</div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#059669' }} />
                <span>{isKhmer ? 'កម្មវិធីរដ្ឋាភិបាល TVET 1.5M' : 'National TVET initiative'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#f0fdf4', color: '#059669' }}>
                {isKhmer ? 'ឥតគិតថ្លៃ' : 'Free TVET'}
              </span>
              <div className="admin-kpi-icon-badge" style={{ background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' }}>
                <Sparkles size={24} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'វគ្គបណ្តុះបណ្តាលឥតគិតថ្លៃ' : 'Free vocational courses'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* Academic Categories */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">{isKhmer ? 'ប្រភេទជំនាញសិក្សា' : 'Training Categories'}</span>
              <div className="admin-kpi-value">{metrics.catCount}</div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#ea580c' }} />
                <span>{isKhmer ? 'ដេប៉ាតឺម៉ង់ និងជំនាញចម្បង' : 'Academic disciplines'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#fff7ed', color: '#ea580c' }}>
                {isKhmer ? 'ប្រភេទ' : 'Categories'}
              </span>
              <div className="admin-kpi-icon-badge" style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa' }}>
                <FolderTree size={24} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'ដេប៉ាតឺម៉ង់បណ្តុះបណ្តាល' : 'Department categories'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* Bachelor Programs */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">{isKhmer ? 'កម្មវិធី ៤ ឆ្នាំ' : '4-Year Degree Programs'}</span>
              <div className="admin-kpi-value">{metrics.bachelors}</div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#7c3aed' }} />
                <span>{isKhmer ? 'កម្រិតបរិញ្ញាបត្របច្ចេកវិទ្យា' : 'Bachelor of Technology'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#faf5ff', color: '#7c3aed' }}>
                {isKhmer ? 'បរិញ្ញាបត្រ' : 'Degree'}
              </span>
              <div className="admin-kpi-icon-badge" style={{ background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}>
                <GraduationCap size={24} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'កម្រិតសញ្ញាបត្រឧត្តម' : 'Higher degree level'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>
      </div>

      {/* Dynamic Category Filter Tabs Strip */}
      <div className="admin-user-filter-bar">
        <button
          className={`admin-user-filter-pill ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          <Layers size={15} />
          <span>{isKhmer ? 'ទាំងអស់' : 'All Programs'}</span>
          <span className="admin-user-filter-count">{courses.length}</span>
        </button>

        {activeCategories.map((cat) => {
          const count = courses.filter((c) => c.categoryId === cat.id).length;
          return (
            <button
              key={cat.id}
              className={`admin-user-filter-pill ${String(selectedCategory) === String(cat.id) ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <FolderTree size={15} />
              <span>{cat.name}</span>
              <span className="admin-user-filter-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Main DataTable Card */}
      <AdminDataTable
        title={isKhmer ? 'បញ្ជីវគ្គបណ្តុះបណ្តាល និងជំនាញ' : 'Courses & Programs Directory'}
        subtitle={
          isKhmer
            ? `បង្ហាញសរុប ${filteredCourses.length} វគ្គសិក្សា តាមការជ្រើសរើស`
            : `Displaying ${filteredCourses.length} programs based on selected category filter`
        }
        columns={columns}
        data={filteredCourses}
        loading={loading}
        onAdd={openAddModal}
        addLabel={isKhmer ? 'បង្កើតវគ្គសិក្សាថ្មី' : 'Add New Course'}
        onRefresh={fetchData}
        searchPlaceholder={isKhmer ? 'ស្វែងរកតាមចំណងជើងវគ្គសិក្សា ឬប្រភេទ...' : 'Search courses by title or category...'}
        renderMobileCard={renderMobileCard}
      />

      {/* =========================================================
          Create / Edit Course Modal
          ========================================================= */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingCourse
            ? (isKhmer ? `កែសម្រួលវគ្គសិក្សា៖ ${editingCourse.title}` : `Edit Course: ${editingCourse.title}`)
            : (isKhmer ? 'បង្កើតវគ្គបណ្តុះបណ្តាលថ្មី' : 'Create New Training Course')
        }
        submitLabel={
          editingCourse
            ? (isKhmer ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'Save Changes')
            : (isKhmer ? 'បង្កើតវគ្គសិក្សា' : 'Save Course')
        }
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        maxWidth="780px"
      >
        {/* Section 1: Basic Information */}
        <div className="admin-modal-section-divider" style={{ marginTop: 0 }}>
          <span className="admin-modal-section-title">
            <BookOpen size={15} style={{ color: '#1e73be' }} />
            {isKhmer ? 'ព័ត៌មានទូទៅនៃវគ្គសិក្សា' : 'General Course Information'}
          </span>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">
            {isKhmer ? 'ឈ្មោះវគ្គសិក្សា / ជំនាញ (Course Title) *' : 'Course Title *'}
          </label>
          <input
            type="text"
            className="admin-form-control"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder={isKhmer ? 'ឧ. វិស្វកម្មសំណង់ស៊ីវិល ឬ វិស្វកម្មព័ត៌មានវិទ្យា' : 'e.g. Civil Engineering or Information Technology'}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'ប្រភេទជំនាញ (Category)' : 'Academic Category'}
            </label>
            <select
              className="admin-form-control"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            >
              <option value="">{isKhmer ? 'ជ្រើសរើសប្រភេទ' : 'Select Category'}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'តម្លៃសិក្សា (Tuition Fee)' : 'Tuition Fee'}
            </label>
            <select
              className="admin-form-control"
              value={formData.fee}
              onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
            >
              <option value="0">{isKhmer ? 'ឥតគិតថ្លៃ (អាហារូបករណ៍ ១០០% TVET)' : 'Free (100% TVET Scholarship)'}</option>
              <option value="$250">$250 / Term</option>
              <option value="$350">$350 / Term</option>
              <option value="$450">$450 / Term</option>
            </select>
          </div>
        </div>

        {/* Section 2: Program Structure */}
        <div className="admin-modal-section-divider">
          <span className="admin-modal-section-title">
            <Clock size={15} style={{ color: '#059669' }} />
            {isKhmer ? 'រចនាសម្ព័ន្ធកម្មវិធីសិក្សា' : 'Curriculum Structure & Credits'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'រយៈពេលសិក្សា (Duration)' : 'Duration'}
            </label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder={isKhmer ? 'ឧ. ២ ឆ្នាំ ឬ ៤ ឆ្នាំ' : 'e.g. 2 Years or 4 Years'}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'ចំនួនឆមាស (Semesters)' : 'Semesters'}
            </label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              placeholder="4 or 8"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'ចំនួនក្រេឌីត (Credits)' : 'Total Credits'}
            </label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.credit}
              onChange={(e) => setFormData({ ...formData, credit: e.target.value })}
              placeholder="60 or 120"
            />
          </div>
        </div>

        {/* Section 3: Media & Thumbnail */}
        <div className="admin-modal-section-divider">
          <span className="admin-modal-section-title">
            <Layers size={15} style={{ color: '#ea580c' }} />
            {isKhmer ? 'រូបភាពតំណាងវគ្គសិក្សា' : 'Thumbnail & Visual Media'}
          </span>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">{isKhmer ? 'រូបថតតំណាងវគ្គសិក្សា' : 'Course Thumbnail Image'}</label>
          <div className="admin-teacher-photo-uploader">
            {formData.imageUrl ? (
              <img
                src={formData.imageUrl}
                alt="Thumbnail"
                className="admin-teacher-photo-preview"
                style={{ width: '84px', height: '60px', borderRadius: '8px' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/courses/course 2.jpg';
                }}
              />
            ) : (
              <div className="admin-teacher-photo-empty" style={{ width: '84px', height: '60px', borderRadius: '8px' }}>
                <BookOpen size={24} />
              </div>
            )}

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <input
                  type="text"
                  className="admin-form-control"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="/images/courses/course 2.jpg"
                  style={{ fontSize: '0.82rem' }}
                />
                <label className="admin-btn admin-btn-outline" style={{ whiteSpace: 'nowrap', cursor: 'pointer', padding: '7px 14px' }}>
                  <Upload size={14} />
                  <span>{uploading ? (isKhmer ? 'កំពុងផ្ទុក...' : 'Uploading...') : (isKhmer ? 'ផ្ទុករូបភាព' : 'Upload')}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </label>
              </div>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                {isKhmer ? 'គាំទ្រទ្រង់ទ្រាយ JPG, PNG, WebP គុណភាពខ្ពស់' : 'Supports JPG, PNG, WebP high resolution formats'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Curriculum Details & Overview */}
        <div className="admin-modal-section-divider">
          <span className="admin-modal-section-title">
            <FileText size={15} style={{ color: '#7c3aed' }} />
            {isKhmer ? 'ពិពណ៌នា & កម្មវិធីលម្អិត' : 'Description & Detailed Overview'}
          </span>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">
            {isKhmer ? 'សេចក្តីសង្ខេប (Short Description)' : 'Short Description'}
          </label>
          <textarea
            className="admin-form-control"
            rows="3"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={isKhmer ? 'សេចក្តីពិពណ៌នាសង្ខេបអំពីជំនាញ គោលបំណង និងឱកាសការងារ...' : 'Brief summary of the course outcomes and career paths...'}
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">
            {isKhmer ? 'កម្មវិធីសិក្សាលម្អិត (Curriculum Overview)' : 'Comprehensive Curriculum Overview'}
          </label>
          <textarea
            className="admin-form-control"
            rows="5"
            value={formData.overview}
            onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
            placeholder={isKhmer ? 'រៀបរាប់អំពីមុខវិជ្ជាស្នូល ម៉ូឌុលបណ្តុះបណ្តាល ការអនុវត្តជាក់ស្តែង...' : 'Detail core subjects, technical modules, laboratory work, and internship details...'}
          />
        </div>
      </AdminModal>

      {/* =========================================================
          Course Preview Lightbox Modal
          ========================================================= */}
      {previewModalOpen && previewCourse && (
        <div className="admin-modal-backdrop" onClick={() => setPreviewModalOpen(false)}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: '640px', padding: '0', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Course Hero Banner */}
            <div style={{ position: 'relative', height: '220px', background: '#07294D' }}>
              <img
                src={previewCourse.imageUrl || '/images/courses/course 2.jpg'}
                alt={previewCourse.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/courses/course 2.jpg';
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(7, 41, 77, 0.92) 0%, rgba(7, 41, 77, 0.4) 60%, rgba(0, 0, 0, 0.3) 100%)',
                }}
              />
              <button
                onClick={() => setPreviewModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(0,0,0,0.5)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)',
                  zIndex: 2,
                }}
              >
                <X size={18} />
              </button>

              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '20px',
                  right: '20px',
                  color: '#ffffff',
                  zIndex: 2,
                }}
              >
                <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      background: 'rgba(255,255,255,0.25)',
                      backdropFilter: 'blur(6px)',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: '#ffffff',
                    }}
                  >
                    {previewCourse.category?.name || 'Academic'}
                  </span>
                  {(previewCourse.fee === '0' || !previewCourse.fee) && (
                    <span
                      style={{
                        background: '#16a34a',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: '#ffffff',
                      }}
                    >
                      {isKhmer ? 'អាហារូបករណ៍ ១០០%' : '100% Scholarship'}
                    </span>
                  )}
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {previewCourse.title}
                </h3>
              </div>
            </div>

            {/* Course Details Content */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{isKhmer ? 'រយៈពេលសិក្សា' : 'Duration'}</div>
                  <div style={{ fontWeight: '700', color: '#07294D', fontSize: '0.9rem', marginTop: '3px' }}>
                    {previewCourse.duration || '—'}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{isKhmer ? 'ចំនួនឆមាស' : 'Semesters'}</div>
                  <div style={{ fontWeight: '700', color: '#07294D', fontSize: '0.9rem', marginTop: '3px' }}>
                    {previewCourse.semester ? `${previewCourse.semester} ឆមាស` : '—'}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{isKhmer ? 'ចំនួនក្រេឌីត' : 'Credits'}</div>
                  <div style={{ fontWeight: '700', color: '#07294D', fontSize: '0.9rem', marginTop: '3px' }}>
                    {previewCourse.credit ? `${previewCourse.credit} ក្រេឌីត` : '—'}
                  </div>
                </div>
              </div>

              {previewCourse.description && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#07294D', marginBottom: '5px' }}>
                    {isKhmer ? 'សេចក្តីពិពណ៌នាសង្ខេប' : 'Program Description'}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b', lineHeight: 1.55 }}>
                    {previewCourse.description}
                  </p>
                </div>
              )}

              {previewCourse.overview && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#07294D', marginBottom: '5px' }}>
                    {isKhmer ? 'កម្មវិធីសិក្សាលម្អិត (Curriculum Overview)' : 'Curriculum Overview'}
                  </div>
                  <div
                    style={{
                      maxHeight: '180px',
                      overflowY: 'auto',
                      fontSize: '0.82rem',
                      color: '#475569',
                      lineHeight: 1.6,
                      background: '#f8fafc',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {previewCourse.overview}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
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
                    openEditModal(previewCourse);
                  }}
                >
                  <Edit2 size={14} />
                  <span>{isKhmer ? 'កែសម្រួល' : 'Edit Course'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          Delete Course Confirmation Modal
          ========================================================= */}
      {deleteModalOpen && courseToDelete && (
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
              {isKhmer ? 'តើអ្នកពិតជាចង់លុបវគ្គសិក្សានេះមែនទេ?' : 'Confirm Course Deletion'}
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 16px' }}>
              {isKhmer
                ? `តើលោកអ្នកពិតជាចង់លុបវគ្គសិក្សា "${courseToDelete.title}" ចេញពីប្រព័ន្ធមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយបានឡើយ។`
                : `Are you sure you want to permanently delete "${courseToDelete.title}"? This action cannot be undone.`}
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
                {deleting ? (isKhmer ? 'កំពុងលុប...' : 'Deleting...') : (isKhmer ? 'លុបវគ្គសិក្សា' : 'Delete Course')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
