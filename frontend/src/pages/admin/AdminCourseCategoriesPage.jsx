import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import { useLanguage } from '../../context/LanguageContext';
import {
  FolderTree,
  BookOpen,
  Plus,
  RotateCw,
  Search,
  X,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ExternalLink,
  Laptop,
  Zap,
  Building2,
  Wind,
  Sprout,
  Compass,
  Languages,
  TrendingUp,
  Landmark,
  Briefcase,
  Shield,
  Clock,
  GraduationCap
} from 'lucide-react';

export const AdminCourseCategoriesPage = () => {
  const { currentLanguage, language } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Preview Lightbox Modal
  const [previewCategory, setPreviewCategory] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Delete Confirmation Modal
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all'); // all, with_courses, empty

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    status: 'active',
    order: 0,
    imageUrl: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/course-categories');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch course categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Preset Icon and Color mapping based on category name
  const getCategoryMeta = (name = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('ict') || lower.includes('computer') || lower.includes('កុំព្យូទ័រ')) {
      return { icon: Laptop, bg: '#eff6ff', color: '#1e73be', border: '#dbeafe', label: isKhmer ? 'ព័ត៌មានវិទ្យា' : 'ICT & Tech' };
    }
    if (lower.includes('elect') || lower.includes('អគ្គិសនី')) {
      return { icon: Zap, bg: '#fefce8', color: '#ca8a04', border: '#fef08a', label: isKhmer ? 'អគ្គិសនី' : 'Electrical' };
    }
    if (lower.includes('arch') || lower.includes('civil') || lower.includes('សំណង់')) {
      return { icon: Building2, bg: '#eef2ff', color: '#4f46e5', border: '#e0e7ff', label: isKhmer ? 'សំណង់ស៊ីវិល' : 'Architecture' };
    }
    if (lower.includes('air') || lower.includes('hvac') || lower.includes('ត្រជាក់')) {
      return { icon: Wind, bg: '#f0f9ff', color: '#0284c7', border: '#bae6fd', label: isKhmer ? 'បរិក្ខារត្រជាក់' : 'HVAC / AirCon' };
    }
    if (lower.includes('agri') || lower.includes('ក្សេត្រ')) {
      return { icon: Sprout, bg: '#f0fdf4', color: '#059669', border: '#bbf7d0', label: isKhmer ? 'កសិកម្ម' : 'Agriculture' };
    }
    if (lower.includes('tour') || lower.includes('ទេសចរណ៍') || lower.includes('បដិសណ្ឋារកិច្ច')) {
      return { icon: Compass, bg: '#f0fdfa', color: '#0d9488', border: '#99f6e4', label: isKhmer ? 'ទេសចរណ៍' : 'Tourism' };
    }
    if (lower.includes('eng') || lower.includes('ភាសា') || lower.includes('language')) {
      return { icon: Languages, bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff', label: isKhmer ? 'ភាសាបរទេស' : 'Languages' };
    }
    if (lower.includes('market') || lower.includes('ម៉ាឃីធីង')) {
      return { icon: TrendingUp, bg: '#fff1f2', color: '#e11d48', border: '#fecdd3', label: isKhmer ? 'ទីផ្សារ' : 'Marketing' };
    }
    if (lower.includes('bank') || lower.includes('finance') || lower.includes('ហិរញ្ញវត្ថុ') || lower.includes('គណនេយ្យ')) {
      return { icon: Landmark, bg: '#ecfdf5', color: '#047857', border: '#a7f3d0', label: isKhmer ? 'ធនាគារ & ហិរញ្ញវត្ថុ' : 'Banking & Finance' };
    }
    if (lower.includes('buss') || lower.includes('busin') || lower.includes('អាជីវកម្ម')) {
      return { icon: Briefcase, bg: '#fff7ed', color: '#c2410c', border: '#fed7aa', label: isKhmer ? 'ពាណិជ្ជកម្ម' : 'Business' };
    }
    if (lower.includes('prod') || lower.includes('ផលិតកម្ម')) {
      return { icon: Layers, bg: '#f8fafc', color: '#475569', border: '#e2e8f0', label: isKhmer ? 'ផលិតកម្ម' : 'Production' };
    }
    return { icon: FolderTree, bg: '#eff6ff', color: '#1e73be', border: '#dbeafe', label: isKhmer ? 'ជំនាញបច្ចេកទេស' : 'Vocational' };
  };

  // KPI Metrics Calculation
  const totalCategories = categories.length;
  const totalCourses = categories.reduce((sum, cat) => sum + (cat.courses_count || cat.courses?.length || 0), 0);
  const activeCategories = categories.filter((c) => (c.status || 'active') === 'active').length;
  const categoriesWithCourses = categories.filter((c) => (c.courses_count || c.courses?.length || 0) > 0).length;

  // Filtered Data
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchSearch =
        searchTerm === '' ||
        cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.slug?.toLowerCase().includes(searchTerm.toLowerCase());

      const courseCount = cat.courses_count || cat.courses?.length || 0;
      let matchCourse = true;
      if (courseFilter === 'with_courses') matchCourse = courseCount > 0;
      if (courseFilter === 'empty') matchCourse = courseCount === 0;

      return matchSearch && matchCourse;
    });
  }, [categories, searchTerm, courseFilter]);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      status: 'active',
      order: 0,
      imageUrl: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      status: cat.status || 'active',
      order: cat.order || 0,
      imageUrl: cat.imageUrl || '',
    });
    setModalOpen(true);
  };

  const openPreviewModal = (cat) => {
    setPreviewCategory(cat);
    setPreviewModalOpen(true);
  };

  const openDeleteModal = (cat) => {
    setCategoryToDelete(cat);
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCategory) {
        await api.put(`/admin/course-categories/${editingCategory.id}`, formData);
      } else {
        await api.post('/admin/course-categories', formData);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save category:', err);
      alert(isKhmer ? 'មិនអាចរក្សាទុកព័ត៌មានបានទេ។ សូមព្យាយាមម្តងទៀត។' : 'Failed to save category. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    const courseCount = categoryToDelete.courses_count || categoryToDelete.courses?.length || 0;
    if (courseCount > 0) {
      setDeleteError(
        isKhmer
          ? `មិនអាចលុបប្រភេទនេះបានទេ ពីព្រោះមានវគ្គសិក្សាចំនួន ${courseCount} កំពុងភ្ជាប់ជាមួយ។ សូមផ្លាស់ប្តូរប្រភេទវគ្គសិក្សាជាមុនសិន។`
          : `Cannot delete this category because ${courseCount} courses are associated with it. Please reassign the courses first.`
      );
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/admin/course-categories/${categoryToDelete.id}`);
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      fetchData();
    } catch (err) {
      console.error('Failed to delete category:', err);
      setDeleteError(err.response?.data?.message || (isKhmer ? 'មិនអាចលុបប្រភេទនេះបានទេ។' : 'Failed to delete category.'));
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: isKhmer ? 'ប្រភេទជំនាញ & និមិត្តសញ្ញា' : 'Category & Icon',
      render: (row) => {
        const meta = getCategoryMeta(row.name);
        const IconComponent = meta.icon;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              className="admin-cat-icon-box"
              style={{
                backgroundColor: meta.bg,
                color: meta.color,
                border: `1px solid ${meta.border}`,
              }}
            >
              <IconComponent size={20} />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.94rem', color: '#07294D' }}>
                {row.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                <span className="admin-cat-slug-pill">#{row.slug || row.name.toLowerCase().replace(/\s+/g, '-')}</span>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>• {meta.label}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: isKhmer ? 'សេចក្តីពិពណ៌នា' : 'Description',
      render: (row) => (
        <div style={{ maxWidth: '320px', fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
          {row.description ? (
            row.description.length > 80 ? `${row.description.slice(0, 80)}...` : row.description
          ) : (
            <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
              {isKhmer ? 'គ្មានការពិពណ៌នា' : 'No description provided'}
            </span>
          )}
        </div>
      ),
    },
    {
      header: isKhmer ? 'ស្ថានភាព' : 'Status',
      render: (row) => {
        const isActive = (row.status || 'active') === 'active';
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '9999px',
              fontSize: '0.76rem',
              fontWeight: 700,
              background: isActive ? '#f0fdf4' : '#f8fafc',
              color: isActive ? '#166534' : '#64748b',
              border: `1px solid ${isActive ? '#bbf7d0' : '#e2e8f0'}`,
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: isActive ? '#22c55e' : '#94a3b8',
              }}
            />
            {isActive ? (isKhmer ? 'សកម្ម' : 'Active') : (isKhmer ? 'ផ្អាក' : 'Inactive')}
          </span>
        );
      },
    },
    {
      header: isKhmer ? 'វគ្គសិក្សាភ្ជាប់រួច' : 'Linked Courses',
      render: (row) => {
        const count = row.courses_count || row.courses?.length || 0;
        return (
          <span className={`admin-cat-count-badge ${count > 0 ? 'has-courses' : 'empty-courses'}`}>
            <BookOpen size={13} />
            {count} {isKhmer ? 'វគ្គសិក្សា' : (count === 1 ? 'Course' : 'Courses')}
          </span>
        );
      },
    },
    {
      header: isKhmer ? 'ប្រតិបត្តិការ' : 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
          <button
            onClick={() => openPreviewModal(row)}
            className="admin-btn admin-btn-outline admin-btn-sm"
            title={isKhmer ? 'មើលព័ត៌មានលម្អិត & វគ្គសិក្សា' : 'Quick Preview'}
            style={{ padding: '6px 9px', borderRadius: '8px', color: '#1e73be', borderColor: '#dbeafe', background: '#eff6ff' }}
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="admin-btn admin-btn-outline admin-btn-sm"
            title={isKhmer ? 'កែសម្រួល' : 'Edit Category'}
            style={{ padding: '6px 9px', borderRadius: '8px' }}
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => openDeleteModal(row)}
            className="admin-btn admin-btn-danger admin-btn-sm"
            title={isKhmer ? 'លុប' : 'Delete Category'}
            style={{ padding: '6px 9px', borderRadius: '8px' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* 1. Header Banner with Trust Badge */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '24px 28px',
          marginBottom: '24px',
          boxShadow: '0 4px 18px rgba(7, 41, 77, 0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
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
              fontWeight: 700,
              marginBottom: '8px',
              border: '1px solid #dbeafe',
            }}
          >
            <FolderTree size={14} />
            {isKhmer ? 'ការគ្រប់គ្រងប្រភេទជំនាញ & ដេប៉ាតឺម៉ង់' : 'Course Categories & Academic Divisions'}
          </div>
          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: '#07294D',
              margin: '0 0 6px 0',
              lineHeight: 1.2,
            }}
          >
            {isKhmer ? 'ប្រភេទវគ្គសិក្សា & ជំនាញបណ្តុះបណ្តាល' : 'Course Categories & Divisions'}
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
            {isKhmer
              ? 'គ្រប់គ្រងប្រភេទជំនាញបច្ចេកទេស និងវិជ្ជាជីវៈ ដេប៉ាតឺម៉ង់ និងកម្មវិធីបណ្តុះបណ្តាលថ្នាក់ជាតិ TVET 1.5M'
              : 'Manage technical vocational divisions, faculties, and national TVET training sectors'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchData}
            disabled={loading}
            className="admin-btn admin-btn-outline"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '12px',
              padding: '9px 16px',
              fontWeight: 600,
            }}
          >
            <RotateCw size={15} className={loading ? 'fa-spin' : ''} />
            {isKhmer ? 'ធ្វើបច្ចុប្បន្នភាព' : 'Refresh'}
          </button>
          <button
            onClick={openAddModal}
            className="admin-btn admin-btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '12px',
              padding: '9px 18px',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(7, 41, 77, 0.15)',
            }}
          >
            <Plus size={16} />
            {isKhmer ? 'បន្ថែមប្រភេទថ្មី' : 'Add Category'}
          </button>
        </div>
      </div>

      {/* 2. 4-Card Institutional KPI Metrics Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* KPI 1: Total Categories */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '18px 20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(7, 41, 77, 0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: '#eff6ff',
              color: '#1e73be',
              border: '1px solid #dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FolderTree size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isKhmer ? 'ប្រភេទជំនាញសរុប' : 'Total Categories'}
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#07294D', marginTop: '2px' }}>
              {totalCategories} <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e73be' }}>{isKhmer ? 'ផ្នែក' : 'Divisions'}</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Linked Courses */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '18px 20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(7, 41, 77, 0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: '#faf5ff',
              color: '#7c3aed',
              border: '1px solid #e9d5ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <BookOpen size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isKhmer ? 'វគ្គសិក្សាភ្ជាប់រួច' : 'Linked Courses'}
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#07294D', marginTop: '2px' }}>
              {totalCourses} <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#7c3aed' }}>{isKhmer ? 'វគ្គសិក្សា' : 'Courses'}</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Active Sectors */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '18px 20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(7, 41, 77, 0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: '#f0fdf4',
              color: '#059669',
              border: '1px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isKhmer ? 'ស្ថានភាពសកម្ម' : 'Active Status'}
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#07294D', marginTop: '2px' }}>
              {activeCategories} / {totalCategories} <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#059669' }}>(100%)</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Categories with Courses */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '18px 20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(7, 41, 77, 0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: '#fff7ed',
              color: '#ea580c',
              border: '1px solid #fed7aa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isKhmer ? 'ជំនាញមានកម្មវិធីសិក្សា' : 'Active Curriculums'}
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#07294D', marginTop: '2px' }}>
              {categoriesWithCourses} <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ea580c' }}>{isKhmer ? 'ជំនាញសកម្ម' : 'Sectors'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs & Search Strip */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Course Association Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setCourseFilter('all')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 700,
              border: '1px solid',
              borderColor: courseFilter === 'all' ? '#1e73be' : '#e2e8f0',
              backgroundColor: courseFilter === 'all' ? '#eff6ff' : '#ffffff',
              color: courseFilter === 'all' ? '#1e73be' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {isKhmer ? 'ទាំងអស់' : 'All Categories'} ({totalCategories})
          </button>

          <button
            type="button"
            onClick={() => setCourseFilter('with_courses')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 700,
              border: '1px solid',
              borderColor: courseFilter === 'with_courses' ? '#1e73be' : '#e2e8f0',
              backgroundColor: courseFilter === 'with_courses' ? '#eff6ff' : '#ffffff',
              color: courseFilter === 'with_courses' ? '#1e73be' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <CheckCircle2 size={13} />
            {isKhmer ? 'មានវគ្គសិក្សា' : 'With Courses'} ({categoriesWithCourses})
          </button>

          <button
            type="button"
            onClick={() => setCourseFilter('empty')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 700,
              border: '1px solid',
              borderColor: courseFilter === 'empty' ? '#1e73be' : '#e2e8f0',
              backgroundColor: courseFilter === 'empty' ? '#eff6ff' : '#ffffff',
              color: courseFilter === 'empty' ? '#1e73be' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {isKhmer ? 'គ្មានវគ្គសិក្សា' : 'Empty Categories'} ({totalCategories - categoriesWithCourses})
          </button>
        </div>

        {/* Live Search Input */}
        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isKhmer ? 'ស្វែងរកឈ្មោះប្រភេទ ឬ Slug...' : 'Search categories or slug...'}
            style={{
              width: '100%',
              padding: '7px 32px 7px 36px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              fontSize: '0.84rem',
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '2px',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 4. DataTable */}
      <AdminDataTable
        columns={columns}
        data={filteredCategories}
        loading={loading}
        title={isKhmer ? 'បញ្ជីប្រភេទជំនាញ & កម្មវិធីបណ្តុះបណ្តាល' : 'Categories Directory'}
        subtitle={
          isKhmer
            ? `បង្ហាញ ${filteredCategories.length} ក្នុងចំណោមប្រភេទសរុប ${totalCategories}`
            : `Showing ${filteredCategories.length} of ${totalCategories} categories`
        }
      />

      {/* 5. Create / Edit Category Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingCategory
            ? (isKhmer ? 'កែសម្រួលប្រភេទវគ្គសិក្សា' : 'Edit Course Category')
            : (isKhmer ? 'បន្ថែមប្រភេទវគ្គសិក្សាថ្មី' : 'New Course Category')
        }
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        maxWidth="680px"
      >
        {/* Section 1: Basic Info */}
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.84rem',
              fontWeight: 700,
              color: '#07294D',
              borderBottom: '1px dashed #e2e8f0',
              paddingBottom: '6px',
              marginBottom: '14px',
            }}
          >
            <FolderTree size={15} color="#1e73be" />
            {isKhmer ? 'ផ្នែកទី ១៖ ព័ត៌មានទូទៅនៃប្រភេទ' : 'Section 1: General Category Info'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'ឈ្មោះប្រភេទជំនាញ *' : 'Category Name *'}
              </label>
              <input
                type="text"
                className="admin-form-control"
                required
                value={formData.name}
                onChange={(e) => {
                  const nameVal = e.target.value;
                  const autoSlug = nameVal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                  setFormData({
                    ...formData,
                    name: nameVal,
                    slug: editingCategory ? formData.slug : autoSlug,
                  });
                }}
                placeholder="e.g. Information Technology / ICT"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'Slug សម្គាល់ (URL)' : 'Slug / Key'}
              </label>
              <input
                type="text"
                className="admin-form-control"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. ict"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'ស្ថានភាពដំណើរការ' : 'Status'}
              </label>
              <select
                className="admin-form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">{isKhmer ? 'សកម្ម (Active)' : 'Active'}</option>
                <option value="inactive">{isKhmer ? 'ផ្អាកដំណើរការ (Inactive)' : 'Inactive'}</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'លំដាប់លំដោយ (Order)' : 'Display Order'}
              </label>
              <input
                type="number"
                className="admin-form-control"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Preset Icon Preview */}
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.84rem',
              fontWeight: 700,
              color: '#07294D',
              borderBottom: '1px dashed #e2e8f0',
              paddingBottom: '6px',
              marginBottom: '14px',
            }}
          >
            <Sparkles size={15} color="#ffaf00" />
            {isKhmer ? 'ផ្នែកទី ២៖ រូបតំណាងប្រព័ន្ធស្វ័យប្រវត្តិ (Visual Accent)' : 'Section 2: Visual Icon Preset'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            {(() => {
              const meta = getCategoryMeta(formData.name);
              const IconComp = meta.icon;
              return (
                <>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: meta.bg,
                      color: meta.color,
                      border: `1px solid ${meta.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <IconComp size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#07294D' }}>
                      {formData.name || (isKhmer ? 'ឈ្មោះប្រភេទ' : 'Category Name')}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                      {isKhmer
                        ? `ប្រព័ន្ធនឹងជ្រើសរើសរូបតំណាង "${meta.label}" ដោយស្វ័យប្រវត្តិតាមឈ្មោះដែលបានបញ្ចូល។`
                        : `System automatically applies the "${meta.label}" icon based on category title.`}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Section 3: Description */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.84rem',
              fontWeight: 700,
              color: '#07294D',
              borderBottom: '1px dashed #e2e8f0',
              paddingBottom: '6px',
              marginBottom: '14px',
            }}
          >
            <BookOpen size={15} color="#059669" />
            {isKhmer ? 'ផ្នែកទី ៣៖ សេចក្តីពិពណ៌នា' : 'Section 3: Description & Scope'}
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'សេចក្តីពិពណ៌នាសង្ខេបពីជំនាញ' : 'Category Description'}
            </label>
            <textarea
              className="admin-form-control"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={isKhmer ? 'ពិពណ៌នាអំពីមុខជំនាញ គោលបំណង និងកាលានុវត្តភាពការងារ...' : 'Overview of this technical division and scope...'}
            />
          </div>
        </div>
      </AdminModal>

      {/* 6. Category Preview Lightbox Modal */}
      {previewModalOpen && previewCategory && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(7, 41, 77, 0.45)',
            backdropFilter: 'blur(5px)',
            padding: '20px',
          }}
          onClick={() => setPreviewModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(7, 41, 77, 0.2)',
              border: '1px solid #e2e8f0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            {(() => {
              const meta = getCategoryMeta(previewCategory.name);
              const IconComp = meta.icon;
              return (
                <div
                  style={{
                    background: 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)',
                    padding: '28px 30px',
                    borderRadius: '24px 24px 0 0',
                    color: '#ffffff',
                    position: 'relative',
                  }}
                >
                  <button
                    onClick={() => setPreviewModalOpen(false)}
                    style={{
                      position: 'absolute',
                      top: '18px',
                      right: '18px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: 'none',
                      color: '#ffffff',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={18} />
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: '#ffffff',
                        color: meta.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
                        flexShrink: 0,
                      }}
                    >
                      <IconComp size={28} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span
                          style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            color: '#ffffff',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}
                        >
                          #{previewCategory.slug || previewCategory.name.toLowerCase()}
                        </span>
                        <span
                          style={{
                            background: 'rgba(16, 185, 129, 0.25)',
                            color: '#a7f3d0',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}
                        >
                          {previewCategory.status || 'active'}
                        </span>
                      </div>
                      <h3 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
                        {previewCategory.name}
                      </h3>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Modal Body */}
            <div style={{ padding: '24px 28px' }}>
              {/* Description */}
              <div style={{ marginBottom: '22px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                  {isKhmer ? 'សេចក្តីពិពណ៌នាអំពីប្រភេទ' : 'Description'}
                </div>
                <div
                  style={{
                    background: '#f8fafc',
                    padding: '14px 18px',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.9rem',
                    color: '#334155',
                    lineHeight: 1.6,
                  }}
                >
                  {previewCategory.description || (
                    <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                      {isKhmer ? 'មិនមានសេចក្តីពិពណ៌នាលម្អិតនៅឡើយទេ។' : 'No description provided.'}
                    </span>
                  )}
                </div>
              </div>

              {/* Linked Courses Section */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    {isKhmer ? 'វគ្គសិក្សាដែលមានក្នុងប្រភេទនេះ' : 'Courses in this category'} (
                    {previewCategory.courses?.length || previewCategory.courses_count || 0})
                  </div>
                  <Link
                    to="/admin-panel/courses"
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#1e73be',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {isKhmer ? 'គ្រប់គ្រងវគ្គសិក្សា' : 'Manage Courses'} <ExternalLink size={12} />
                  </Link>
                </div>

                {previewCategory.courses && previewCategory.courses.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {previewCategory.courses.map((c) => (
                      <div key={c.id} className="admin-cat-course-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '10px',
                              overflow: 'hidden',
                              background: '#eff6ff',
                              flexShrink: 0,
                            }}
                          >
                            <img
                              src={c.imageUrl || '/images/course/cu-1.jpg'}
                              alt={c.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.src = '/images/course/cu-1.jpg';
                              }}
                            />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#07294D' }}>
                              {c.title}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '3px', fontSize: '0.76rem', color: '#64748b' }}>
                              {c.duration && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <Clock size={11} /> {c.duration}
                                </span>
                              )}
                              {c.credit && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <GraduationCap size={11} /> {c.credit} {isKhmer ? 'ក្រេឌីត' : 'Credits'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className="admin-fee-badge-free">
                            <Sparkles size={11} />
                            {isKhmer ? 'ឥតគិតថ្លៃ (១០០%)' : 'Free (100%)'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '30px 20px',
                      background: '#f8fafc',
                      borderRadius: '14px',
                      border: '1px dashed #cbd5e1',
                    }}
                  >
                    <BookOpen size={30} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#475569' }}>
                      {isKhmer ? 'មិនទាន់មានវគ្គសិក្សានៅក្នុងប្រភេទនេះឡើយ' : 'No courses in this category yet'}
                    </div>
                    <p style={{ margin: '4px 0 14px 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                      {isKhmer
                        ? 'លោកអ្នកអាចបន្ថែមវគ្គសិក្សាថ្មី និងភ្ជាប់មកកាន់ប្រភេទនេះបាន'
                        : 'You can create a new course and associate it with this category.'}
                    </p>
                    <Link
                      to="/admin-panel/courses"
                      className="admin-btn admin-btn-primary admin-btn-sm"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    >
                      <Plus size={14} /> {isKhmer ? 'បន្ថែមវគ្គសិក្សា' : 'Add Course'}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 28px',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                borderRadius: '0 0 24px 24px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="admin-btn admin-btn-outline"
                style={{ borderRadius: '10px', padding: '8px 18px', fontWeight: 600 }}
              >
                {isKhmer ? 'បិទផ្ទាំង' : 'Close'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewModalOpen(false);
                  openEditModal(previewCategory);
                }}
                className="admin-btn admin-btn-primary"
                style={{
                  borderRadius: '10px',
                  padding: '8px 20px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Edit2 size={14} /> {isKhmer ? 'កែសម្រួល' : 'Edit Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Delete Confirmation Modal */}
      {deleteModalOpen && categoryToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(7, 41, 77, 0.45)',
            backdropFilter: 'blur(5px)',
            padding: '20px',
          }}
          onClick={() => setDeleteModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 20px 60px rgba(7, 41, 77, 0.2)',
              border: '1px solid #fecdd3',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '24px 26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#fee2e2',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#07294D' }}>
                    {isKhmer ? 'បញ្ជាក់ការលុបប្រភេទ' : 'Delete Category Confirmation'}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {isKhmer ? 'សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានទេ' : 'This action cannot be undone'}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: '0 0 14px 0' }}>
                {isKhmer ? (
                  <>
                    តើអ្នកពិតជាចង់លុបប្រភេទជំនាញ <strong>"{categoryToDelete.name}"</strong> នេះមែនទេ?
                  </>
                ) : (
                  <>
                    Are you sure you want to delete category <strong>"{categoryToDelete.name}"</strong>?
                  </>
                )}
              </p>

              {deleteError && (
                <div
                  style={{
                    background: '#fff1f2',
                    color: '#be123c',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    border: '1px solid #fecdd3',
                    marginBottom: '14px',
                    lineHeight: 1.5,
                  }}
                >
                  <AlertTriangle size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  {deleteError}
                </div>
              )}

              {(categoryToDelete.courses_count || categoryToDelete.courses?.length || 0) > 0 && (
                <div
                  style={{
                    background: '#fffbeb',
                    color: '#b45309',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    border: '1px solid #fef3c7',
                    marginBottom: '14px',
                    lineHeight: 1.5,
                  }}
                >
                  ⚠️{' '}
                  {isKhmer
                    ? `ប្រភេទនេះមានវគ្គសិក្សាចំនួន ${categoryToDelete.courses_count || categoryToDelete.courses?.length} កំពុងភ្ជាប់ជាមួយ។ លោកអ្នកត្រូវផ្លាស់ប្តូរប្រភេទវគ្គសិក្សាទាំងនោះសិន មុននឹងលុប។`
                    : `This category has ${categoryToDelete.courses_count || categoryToDelete.courses?.length} associated courses. You must reassign or remove them before deleting.`}
                </div>
              )}
            </div>

            <div
              style={{
                padding: '14px 26px',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="admin-btn admin-btn-outline"
                style={{ borderRadius: '10px', padding: '8px 16px', fontWeight: 600 }}
              >
                {isKhmer ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting || (categoryToDelete.courses_count || categoryToDelete.courses?.length || 0) > 0}
                className="admin-btn admin-btn-danger"
                style={{
                  borderRadius: '10px',
                  padding: '8px 18px',
                  fontWeight: 600,
                  opacity: (categoryToDelete.courses_count || categoryToDelete.courses?.length || 0) > 0 ? 0.5 : 1,
                  cursor: (categoryToDelete.courses_count || categoryToDelete.courses?.length || 0) > 0 ? 'not-allowed' : 'pointer',
                }}
              >
                {deleting ? (isKhmer ? 'កំពុងលុប...' : 'Deleting...') : (isKhmer ? 'យល់ព្រមលុប' : 'Yes, Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
