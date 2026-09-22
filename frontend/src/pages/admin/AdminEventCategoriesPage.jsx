import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import { useLanguage } from '../../context/LanguageContext';
import {
  FolderTree,
  Calendar,
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
  GraduationCap,
  Briefcase,
  Award,
  Clock,
  MapPin,
  ArrowRight
} from 'lucide-react';

export const AdminEventCategoriesPage = () => {
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

  // Filter State
  const [eventFilter, setEventFilter] = useState('all'); // all, with_events, empty

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
      const res = await api.get('/admin/event-categories');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch event categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Icon & Theme mapping based on event category name
  const getCategoryMeta = (name = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('tvet') || lower.includes('បណ្តុះបណ្តាល')) {
      return { icon: GraduationCap, bg: '#eff6ff', color: '#1e73be', border: '#dbeafe', label: isKhmer ? 'បណ្តុះបណ្តាល TVET' : 'TVET Training' };
    }
    if (lower.includes('ict') || lower.includes('បច្ចេកវិទ្យា') || lower.includes('tech')) {
      return { icon: Laptop, bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff', label: isKhmer ? 'បច្ចេកវិទ្យា & ICT' : 'Tech & ICT' };
    }
    if (lower.includes('job') || lower.includes('ការងារ') || lower.includes('ស្នាដៃ') || lower.includes('expo')) {
      return { icon: Briefcase, bg: '#f0fdf4', color: '#059669', border: '#bbf7d0', label: isKhmer ? 'ពិព័រណ៍ & ការងារ' : 'Job Fair & Expo' };
    }
    if (lower.includes('sport') || lower.includes('កីឡា') || lower.includes('យុវជន')) {
      return { icon: Award, bg: '#fff7ed', color: '#ea580c', border: '#fed7aa', label: isKhmer ? 'កីឡា & យុវជន' : 'Sports & Youth' };
    }
    if (lower.includes('academic') || lower.includes('សិក្សាធិការ') || lower.includes('សាលា')) {
      return { icon: Calendar, bg: '#fefce8', color: '#ca8a04', border: '#fef08a', label: isKhmer ? 'កម្មវិធីសាលា' : 'Academic' };
    }
    return { icon: FolderTree, bg: '#eff6ff', color: '#1e73be', border: '#dbeafe', label: isKhmer ? 'កម្មវិធីទូទៅ' : 'General' };
  };

  // KPI Calculations
  const totalCategories = categories.length;
  const totalEvents = categories.reduce((sum, cat) => sum + (cat.events_count || cat.events?.length || 0), 0);
  const activeCategories = categories.filter((c) => (c.status || 'active') === 'active').length;
  const categoriesWithEvents = categories.filter((c) => (c.events_count || c.events?.length || 0) > 0).length;

  // Filtered Categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const count = cat.events_count || cat.events?.length || 0;
      if (eventFilter === 'with_events') return count > 0;
      if (eventFilter === 'empty') return count === 0;
      return true;
    });
  }, [categories, eventFilter]);

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
        await api.put(`/admin/event-categories/${editingCategory.id}`, formData);
      } else {
        await api.post('/admin/event-categories', formData);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save category:', err);
      alert(isKhmer ? 'មិនអាចរក្សាទុកប្រភេទព្រឹត្តិការណ៍បានទេ។' : 'Failed to save event category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    const eventCount = categoryToDelete.events_count || categoryToDelete.events?.length || 0;
    if (eventCount > 0) {
      setDeleteError(
        isKhmer
          ? `មិនអាចលុបប្រភេទនេះបានទេ ពីព្រោះមានព្រឹត្តិការណ៍ចំនួន ${eventCount} កំពុងភ្ជាប់ជាមួយ។ សូមផ្លាស់ប្តូរប្រភេទព្រឹត្តិការណ៍ជាមុនសិន។`
          : `Cannot delete this category because ${eventCount} events are associated with it. Please reassign the events first.`
      );
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/admin/event-categories/${categoryToDelete.id}`);
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

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(isKhmer ? 'km-KH' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const columns = [
    {
      header: isKhmer ? 'ប្រភេទព្រឹត្តិការណ៍ & និមិត្តសញ្ញា' : 'Category & Icon',
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
      header: isKhmer ? 'ព្រឹត្តិការណ៍ភ្ជាប់រួច' : 'Linked Events',
      render: (row) => {
        const count = row.events_count || row.events?.length || 0;
        return (
          <span className={`admin-cat-count-badge ${count > 0 ? 'has-courses' : 'empty-courses'}`}>
            <Calendar size={13} />
            {count} {isKhmer ? 'កម្មវិធី' : (count === 1 ? 'Event' : 'Events')}
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
            title={isKhmer ? 'មើលព័ត៌មានលម្អិត & ព្រឹត្តិការណ៍' : 'Quick Preview'}
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

  // Mobile Card Renderer (< 768px viewports)
  const renderMobileCard = (row) => {
    const meta = getCategoryMeta(row.name);
    const IconComponent = meta.icon;
    const isActive = (row.status || 'active') === 'active';
    const count = row.events_count || row.events?.length || 0;

    return (
      <div className="admin-user-mobile-card">
        {/* Top: Icon Box, Name, Slug, Meta Label & Status Badge */}
        <div className="admin-user-mobile-card-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
            <div
              className="admin-cat-icon-box"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: meta.bg,
                color: meta.color,
                border: `1px solid ${meta.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconComponent size={20} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontWeight: '700',
                  color: '#07294D',
                  fontSize: '0.92rem',
                  lineHeight: 1.3,
                  wordBreak: 'break-word',
                }}
              >
                {row.name}
              </div>
              <div
                style={{
                  fontSize: '0.74rem',
                  color: '#64748b',
                  marginTop: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  flexWrap: 'wrap',
                }}
              >
                <span className="admin-cat-slug-pill" style={{ padding: '1px 6px', fontSize: '0.70rem' }}>
                  #{row.slug || row.name.toLowerCase().replace(/\s+/g, '-')}
                </span>
                <span style={{ fontSize: '0.72rem' }}>• {meta.label}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div style={{ flexShrink: 0 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 8px',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                fontWeight: 700,
                background: isActive ? '#f0fdf4' : '#f8fafc',
                color: isActive ? '#166534' : '#64748b',
                border: `1px solid ${isActive ? '#bbf7d0' : '#e2e8f0'}`,
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: isActive ? '#22c55e' : '#94a3b8',
                }}
              />
              <span>{isActive ? (isKhmer ? 'សកម្ម' : 'Active') : (isKhmer ? 'ផ្អាក' : 'Inactive')}</span>
            </span>
          </div>
        </div>

        {/* Details Block: Linked Events Count & Description */}
        <div className="admin-user-mobile-card-details">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: row.description ? '6px' : '0' }}>
            <span className={`admin-cat-count-badge ${count > 0 ? 'has-courses' : 'empty-courses'}`} style={{ fontSize: '0.75rem', padding: '3px 9px' }}>
              <Calendar size={12} />
              <span>{count} {isKhmer ? 'ព្រឹត្តិការណ៍ភ្ជាប់រួច' : (count === 1 ? 'Event' : 'Events')}</span>
            </span>

            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
              {isKhmer ? 'លំដាប់បង្ហាញ៖' : 'Order:'} <strong>{row.order || 0}</strong>
            </span>
          </div>

          {row.description && (
            <div
              style={{
                fontSize: '0.76rem',
                color: '#64748b',
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
            title={isKhmer ? 'មើលព័ត៌មានលម្អិត & ព្រឹត្តិការណ៍' : 'Quick Preview'}
          >
            <Eye size={13} />
            <span>{isKhmer ? 'មើលលម្អិត' : 'Preview'}</span>
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="admin-user-mobile-action-btn edit"
            title={isKhmer ? 'កែសម្រួល' : 'Edit Category'}
          >
            <Edit2 size={13} />
            <span>{isKhmer ? 'កែប្រែ' : 'Edit'}</span>
          </button>
          <button
            onClick={() => openDeleteModal(row)}
            className="admin-user-mobile-action-btn delete"
            title={isKhmer ? 'លុប' : 'Delete Category'}
          >
            <Trash2 size={13} />
            <span>{isKhmer ? 'លុប' : 'Delete'}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* 1. Institutional Header Banner */}
      <div
        className="admin-event-cat-header"
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
            <span>{isKhmer ? 'ការគ្រប់គ្រងប្រភេទព្រឹត្តិការណ៍ & កម្មវិធី' : 'Event Categories & Activity Classifications'}</span>
          </div>
          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: '#07294D',
              margin: '0 0 6px 0',
              lineHeight: 1.2,
              letterSpacing: '-0.3px',
            }}
          >
            {isKhmer ? 'ប្រភេទព្រឹត្តិការណ៍ & កម្មវិធីស្ថាប័ន' : 'Event Categories & Classifications'}
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
            {isKhmer
              ? 'គ្រប់គ្រងចំណាត់ថ្នាក់ព្រឹត្តិការណ៍ សិក្ខាសាលា ពិធីប្រគល់សញ្ញាបត្រ ពិព័រណ៍ការងារ និងសកម្មភាពថ្នាក់ជាតិ TVET'
              : 'Manage event classifications, conferences, workshops, graduation ceremonies, and national TVET activities.'}
          </p>
        </div>

        <div className="admin-event-cat-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchData}
            disabled={loading}
            className="admin-btn admin-btn-outline"
            title={isKhmer ? 'ធ្វើបច្ចុប្បន្នភាព' : 'Refresh'}
          >
            <RotateCw size={15} className={loading ? 'fa-spin' : ''} />
            <span>{isKhmer ? 'ធ្វើបច្ចុប្បន្នភាព' : 'Refresh'}</span>
          </button>
          <button
            onClick={openAddModal}
            className="admin-btn admin-btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(7, 41, 77, 0.15)',
            }}
          >
            <Plus size={16} />
            <span>{isKhmer ? 'បន្ថែមប្រភេទថ្មី' : 'Add Category'}</span>
          </button>
        </div>
      </div>

      {/* 2. 4-Card Institutional KPI Metric Strip */}
      <div className="admin-kpi-grid admin-event-cat-kpis">
        {/* KPI 1: Total Categories */}
        <div className="admin-kpi-card" onClick={() => setEventFilter('all')}>
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">{isKhmer ? 'ប្រភេទកម្មវិធីសរុប' : 'Total Categories'}</span>
              <div className="admin-kpi-value">{totalCategories}</div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#1e73be' }} />
                <span>{isKhmer ? 'ចំណាត់ថ្នាក់សកម្មភាពស្ថាប័ន' : 'Institutional activity tracks'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#eff6ff', color: '#1e73be' }}>
                {isKhmer ? 'សរុប' : 'Total'}
              </span>
              <div className="admin-kpi-icon-badge" style={{ background: '#eff6ff', color: '#1e73be', border: '1px solid #dbeafe' }}>
                <FolderTree size={22} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'គ្រប់គ្រងប្រភេទ' : 'Manage categories'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* KPI 2: Linked Events */}
        <div className="admin-kpi-card" onClick={() => setEventFilter('with_events')}>
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">{isKhmer ? 'ព្រឹត្តិការណ៍ភ្ជាប់រួច' : 'Linked Events'}</span>
              <div className="admin-kpi-value">{totalEvents}</div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#7c3aed' }} />
                <span>{isKhmer ? 'កម្មវិធីដែលបានចាត់ថ្នាក់' : 'Classified campus events'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#faf5ff', color: '#7c3aed' }}>
                {isKhmer ? 'ព្រឹត្តិការណ៍' : 'Events'}
              </span>
              <div className="admin-kpi-icon-badge" style={{ background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}>
                <Calendar size={22} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'មើលព្រឹត្តិការណ៍' : 'View all events'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* KPI 3: Active Status */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">{isKhmer ? 'ស្ថានភាពសកម្ម' : 'Active Status'}</span>
              <div className="admin-kpi-value">
                {activeCategories} / {totalCategories}
              </div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#059669' }} />
                <span>{isKhmer ? 'ប្រភេទបើកដំណើរការ ១០០%' : '100% operational tracks'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#f0fdf4', color: '#059669' }}>
                {isKhmer ? 'សកម្ម' : 'Active'}
              </span>
              <div className="admin-kpi-icon-badge" style={{ background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' }}>
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'ស្ថានភាពប្រភេទ' : 'Category status'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* KPI 4: Active Event Tracks */}
        <div className="admin-kpi-card" onClick={() => setEventFilter('with_events')}>
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">{isKhmer ? 'ប្រភេទមានកម្មវិធី' : 'Active Event Tracks'}</span>
              <div className="admin-kpi-value">{categoriesWithEvents}</div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#ea580c' }} />
                <span>{isKhmer ? 'វិស័យមានព្រឹត្តិការណ៍ជាក់ស្តែង' : 'Tracks with active events'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#fff7ed', color: '#ea580c' }}>
                {isKhmer ? 'មានកម្មវិធី' : 'With Events'}
              </span>
              <div className="admin-kpi-icon-badge" style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa' }}>
                <Layers size={22} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'វិស័យសកម្ម' : 'Active tracks'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>
      </div>

      {/* 3. Horizontal Swipeable Filter Bar */}
      <div className="admin-user-filter-bar">
        <button
          type="button"
          className={`admin-user-filter-pill ${eventFilter === 'all' ? 'active' : ''}`}
          onClick={() => setEventFilter('all')}
        >
          <FolderTree size={14} />
          <span>{isKhmer ? 'ទាំងអស់' : 'All Categories'}</span>
          <span className="admin-user-filter-count">{totalCategories}</span>
        </button>

        <button
          type="button"
          className={`admin-user-filter-pill ${eventFilter === 'with_events' ? 'active' : ''}`}
          onClick={() => setEventFilter('with_events')}
        >
          <Calendar size={13} />
          <span>{isKhmer ? 'មានព្រឹត្តិការណ៍' : 'With Events'}</span>
          <span className="admin-user-filter-count">{categoriesWithEvents}</span>
        </button>

        <button
          type="button"
          className={`admin-user-filter-pill ${eventFilter === 'empty' ? 'active' : ''}`}
          onClick={() => setEventFilter('empty')}
        >
          <CheckCircle2 size={13} />
          <span>{isKhmer ? 'គ្មានព្រឹត្តិការណ៍' : 'Empty Categories'}</span>
          <span className="admin-user-filter-count">{totalCategories - categoriesWithEvents}</span>
        </button>
      </div>

      {/* 4. Institutional DataTable & Mobile Cards View */}
      <AdminDataTable
        columns={columns}
        data={filteredCategories}
        loading={loading}
        title={isKhmer ? 'បញ្ជីប្រភេទព្រឹត្តិការណ៍ & កម្មវិធី' : 'Event Categories Directory'}
        subtitle={
          isKhmer
            ? `បង្ហាញ ${filteredCategories.length} ក្នុងចំណោមប្រភេទសរុប ${totalCategories}`
            : `Showing ${filteredCategories.length} of ${totalCategories} categories`
        }
        onAdd={openAddModal}
        addLabel={isKhmer ? 'បន្ថែមប្រភេទថ្មី' : 'Add Category'}
        onRefresh={fetchData}
        searchPlaceholder={isKhmer ? 'ស្វែងរកឈ្មោះប្រភេទ ឬ Slug...' : 'Search categories or slug...'}
        renderMobileCard={renderMobileCard}
      />

      {/* 5. Create / Edit Category Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingCategory
            ? (isKhmer ? 'កែសម្រួលប្រភេទព្រឹត្តិការណ៍' : 'Edit Event Category')
            : (isKhmer ? 'បន្ថែមប្រភេទព្រឹត្តិការណ៍ថ្មី' : 'New Event Category')
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
                {isKhmer ? 'ឈ្មោះប្រភេទព្រឹត្តិការណ៍ *' : 'Category Name *'}
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
                placeholder="e.g. សិក្ខាសាលា & បច្ចេកវិទ្យា ICT"
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
                placeholder="e.g. ict-technology"
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
            {isKhmer ? 'ផ្នែកទី ២៖ រូបតំណាងស្វ័យប្រវត្តិ (Visual Accent)' : 'Section 2: Visual Icon Preset'}
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
            <Calendar size={15} color="#059669" />
            {isKhmer ? 'ផ្នែកទី ៣៖ សេចក្តីពិពណ៌នា' : 'Section 3: Description'}
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'សេចក្តីពិពណ៌នាសង្ខេបពីប្រភេទព្រឹត្តិការណ៍' : 'Category Description'}
            </label>
            <textarea
              className="admin-form-control"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={isKhmer ? 'ពិពណ៌នាអំពីលក្ខណៈនៃកម្មវិធី សិក្ខាសាលា ឬសកម្មភាពនានា...' : 'Overview of this event category scope...'}
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

              {/* Linked Events Section */}
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
                    {isKhmer ? 'ព្រឹត្តិការណ៍ក្នុងប្រភេទនេះ' : 'Events in this category'} (
                    {previewCategory.events?.length || previewCategory.events_count || 0})
                  </div>
                  <Link
                    to="/admin-panel/events"
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
                    {isKhmer ? 'គ្រប់គ្រងព្រឹត្តិការណ៍' : 'Manage Events'} <ExternalLink size={12} />
                  </Link>
                </div>

                {previewCategory.events && previewCategory.events.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {previewCategory.events.map((ev) => (
                      <div key={ev.id} className="admin-cat-course-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '10px',
                              overflow: 'hidden',
                              background: '#eff6ff',
                              flexShrink: 0,
                            }}
                          >
                            <img
                              src={ev.imageUrl || '/images/gallery/gallery 1.jpg'}
                              alt={ev.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.src = '/images/gallery/gallery 1.jpg';
                              }}
                            />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#07294D' }}>
                              {ev.title}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '3px', fontSize: '0.76rem', color: '#64748b' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <Calendar size={11} /> {formatDate(ev.date)}
                              </span>
                              {ev.place && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <MapPin size={11} /> {ev.place}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className="admin-fee-badge-free">
                            <Sparkles size={11} />
                            {ev.fee || (isKhmer ? 'ឥតគិតថ្លៃ' : 'Free')}
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
                    <Calendar size={30} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#475569' }}>
                      {isKhmer ? 'មិនទាន់មានព្រឹត្តិការណ៍នៅក្នុងប្រភេទនេះឡើយ' : 'No events in this category yet'}
                    </div>
                    <p style={{ margin: '4px 0 14px 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                      {isKhmer
                        ? 'លោកអ្នកអាចបង្កើតព្រឹត្តិការណ៍ថ្មី និងភ្ជាប់មកកាន់ប្រភេទនេះបាន'
                        : 'You can create a new event and associate it with this category.'}
                    </p>
                    <Link
                      to="/admin-panel/events"
                      className="admin-btn admin-btn-primary admin-btn-sm"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    >
                      <Plus size={14} /> {isKhmer ? 'បង្កើតព្រឹត្តិការណ៍' : 'Add Event'}
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
                    {isKhmer ? 'បញ្ជាក់ការលុបប្រភេទព្រឹត្តិការណ៍' : 'Delete Category Confirmation'}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {isKhmer ? 'សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានទេ' : 'This action cannot be undone'}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: '0 0 14px 0' }}>
                {isKhmer ? (
                  <>
                    តើអ្នកពិតជាចង់លុបប្រភេទ <strong>"{categoryToDelete.name}"</strong> នេះមែនទេ?
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

              {(categoryToDelete.events_count || categoryToDelete.events?.length || 0) > 0 && (
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
                    ? `ប្រភេទនេះមានព្រឹត្តិការណ៍ចំនួន ${categoryToDelete.events_count || categoryToDelete.events?.length} កំពុងភ្ជាប់ជាមួយ។ លោកអ្នកត្រូវផ្លាស់ប្តូរប្រភេទព្រឹត្តិការណ៍ទាំងនោះសិន មុននឹងលុប។`
                    : `This category has ${categoryToDelete.events_count || categoryToDelete.events?.length} associated events. You must reassign or remove them before deleting.`}
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
                disabled={deleting || (categoryToDelete.events_count || categoryToDelete.events?.length || 0) > 0}
                className="admin-btn admin-btn-danger"
                style={{
                  borderRadius: '10px',
                  padding: '8px 18px',
                  fontWeight: 600,
                  opacity: (categoryToDelete.events_count || categoryToDelete.events?.length || 0) > 0 ? 0.5 : 1,
                  cursor: (categoryToDelete.events_count || categoryToDelete.events?.length || 0) > 0 ? 'not-allowed' : 'pointer',
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
