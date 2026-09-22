import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/client';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import { useLanguage } from '../../context/LanguageContext';
import {
  Bell,
  Plus,
  RotateCw,
  Search,
  X,
  Edit2,
  Trash2,
  Eye,
  FileText,
  Pin,
  Calendar,
  Award,
  Briefcase,
  GraduationCap,
  Layers,
  Upload,
  Download,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const AdminNoticesPage = () => {
  const { currentLanguage, language } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Preview Lightbox Modal
  const [previewNotice, setPreviewNotice] = useState(null);

  // Delete Confirmation Modal
  const [noticeToDelete, setNoticeToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Filter State
  const [selectedFilter, setSelectedFilter] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    date: new Date().toISOString().split('T')[0],
    fileUrl: '',
    isPinned: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/notices?limit=100');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setNotices(data);
    } catch (err) {
      console.error('Failed to load notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Category Metadata Helper
  const getCategoryMeta = (cat = '') => {
    const lower = (cat || '').toLowerCase();
    if (lower === 'scholarship' || lower.includes('អាហារូបករណ៍')) {
      return {
        label: isKhmer ? 'អាហារូបករណ៍' : 'Scholarship',
        bg: '#fefce8',
        color: '#ca8a04',
        border: '#fef08a',
        icon: Award,
      };
    }
    if (lower === 'internship' || lower.includes('កម្មសិក្សា') || lower.includes('សហគ្រាស')) {
      return {
        label: isKhmer ? 'កម្មសិក្សា & ការងារ' : 'Internship & Jobs',
        bg: '#f0fdf4',
        color: '#059669',
        border: '#bbf7d0',
        icon: Briefcase,
      };
    }
    if (lower === 'academic' || lower.includes('សិក្សាធិការ') || lower.includes('ប្រឡង')) {
      return {
        label: isKhmer ? 'សិក្សាធិការ & ប្រឡង' : 'Academic & Exams',
        bg: '#eff6ff',
        color: '#1e73be',
        border: '#dbeafe',
        icon: GraduationCap,
      };
    }
    return {
      label: isKhmer ? 'ទូទៅ / រដ្ឋបាល' : 'General Notice',
      bg: '#faf5ff',
      color: '#7c3aed',
      border: '#e9d5ff',
      icon: Bell,
    };
  };

  // Extract Unique Categories dynamically
  const uniqueCategories = useMemo(() => {
    const cats = [];
    notices.forEach((n) => {
      const c = (n.category || '').trim();
      if (c && !cats.includes(c)) {
        cats.push(c);
      }
    });
    return cats;
  }, [notices]);

  // KPI Calculations
  const totalNotices = notices.length;
  const pinnedNotices = notices.filter((n) => Boolean(n.isPinned)).length;
  const scholarshipNotices = notices.filter(
    (n) => (n.category || '').toLowerCase() === 'scholarship' || (n.category || '').includes('អាហារូបករណ៍')
  ).length;
  const internshipNotices = notices.filter(
    (n) => (n.category || '').toLowerCase() === 'internship' || (n.category || '').includes('កម្មសិក្សា')
  ).length;

  // Filtered Notices (Searching is handled by AdminDataTable)
  const filteredNotices = useMemo(() => {
    return notices.filter((n) => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'pinned') return Boolean(n.isPinned);
      return (n.category || '').trim().toLowerCase() === selectedFilter.toLowerCase();
    });
  }, [notices, selectedFilter]);

  const handleTogglePin = async (notice) => {
    try {
      const updatedPin = !notice.isPinned;
      await api.put(`/admin/notices/${notice.id}`, {
        isPinned: updatedPin,
      });
      setNotices((prev) =>
        prev.map((n) => (n.id === notice.id ? { ...n, isPinned: updatedPin } : n))
      );
    } catch (err) {
      console.error(err);
      alert(isKhmer ? 'មិនអាចផ្លាស់ប្តូរស្ថានភាពខ្ទាស់បានទេ។' : 'Failed to toggle pin status.');
    }
  };

  const openAddModal = () => {
    setEditingNotice(null);
    setFormData({
      title: '',
      content: '',
      category: 'general',
      date: new Date().toISOString().split('T')[0],
      fileUrl: '',
      isPinned: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (n) => {
    setEditingNotice(n);
    const noticeDate = n.date
      ? n.date.split('T')[0]
      : n.publishDate
      ? n.publishDate.split('T')[0]
      : new Date().toISOString().split('T')[0];

    setFormData({
      title: n.title || '',
      content: n.content || '',
      category: n.category || 'general',
      date: noticeDate,
      fileUrl: n.fileUrl || '',
      isPinned: Boolean(n.isPinned),
    });
    setModalOpen(true);
  };

  const openPreview = (n) => {
    setPreviewNotice(n);
  };

  const openDeleteModal = (n) => {
    setNoticeToDelete(n);
    setDeleteModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);
    data.append('subDir', 'general');
    setUploading(true);
    try {
      const res = await api.post('/admin/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const path = res.data.url || res.data.filePath;
      if (path) {
        setFormData((prev) => ({ ...prev, fileUrl: path }));
      }
    } catch (err) {
      console.error('Failed to upload attachment:', err);
      alert(isKhmer ? 'ការបញ្ចូលឯកសារបរាជ័យ។' : 'Failed to upload attachment.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        date: formData.date,
        fileUrl: formData.fileUrl || null,
        isPinned: Boolean(formData.isPinned),
      };

      if (editingNotice) {
        await api.put(`/admin/notices/${editingNotice.id}`, payload);
      } else {
        await api.post('/admin/notices', payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save notice:', err);
      alert(isKhmer ? 'មិនអាចរក្សាទុកសេចក្តីជូនដំណឹងបានទេ។' : 'Failed to save notice.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!noticeToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/notices/${noticeToDelete.id}`);
      setDeleteModalOpen(false);
      setNoticeToDelete(null);
      fetchData();
    } catch (err) {
      console.error('Failed to delete notice:', err);
      alert(isKhmer ? 'មិនអាចលុបសេចក្តីជូនដំណឹងបានទេ។' : 'Failed to delete notice.');
    } finally {
      setDeleting(false);
    }
  };

  const presetCategories = [
    { key: 'general', label: isKhmer ? 'ទូទៅ / រដ្ឋបាល' : 'General Notice' },
    { key: 'scholarship', label: isKhmer ? 'អាហារូបករណ៍' : 'Scholarship' },
    { key: 'internship', label: isKhmer ? 'កម្មសិក្សា & ការងារ' : 'Internship & Jobs' },
    { key: 'academic', label: isKhmer ? 'សិក្សាធិការ & ប្រឡង' : 'Academic & Exams' },
  ];

  const columns = [
    {
      header: isKhmer ? 'ចំណងជើងសេចក្តីជូនដំណឹង & ខ្លឹមសារសង្ខេប' : 'Notice Title & Summary',
      render: (row) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            {row.isPinned ? (
              <span className="admin-notice-pinned-badge">
                <Pin size={11} fill="#b45309" />
                {isKhmer ? 'បានខ្ទាស់' : 'Pinned'}
              </span>
            ) : null}
            <div
              style={{
                fontWeight: '700',
                fontSize: '0.94rem',
                color: '#07294D',
                cursor: 'pointer',
              }}
              onClick={() => openPreview(row)}
            >
              {row.title}
            </div>
          </div>
          <div
            style={{
              fontSize: '0.8rem',
              color: '#64748b',
              maxWidth: '520px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.5,
            }}
          >
            {row.content}
          </div>
        </div>
      ),
    },
    {
      header: isKhmer ? 'ប្រភេទ' : 'Category',
      render: (row) => {
        const meta = getCategoryMeta(row.category);
        const IconComp = meta.icon;
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 10px',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: meta.bg,
              color: meta.color,
              border: `1px solid ${meta.border}`,
            }}
          >
            <IconComp size={12} />
            {meta.label}
          </span>
        );
      },
    },
    {
      header: isKhmer ? 'កាលបរិច្ឆេទ' : 'Date',
      render: (row) => {
        const d = row.date || row.publishDate;
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.8rem',
              color: '#475569',
              fontWeight: 600,
            }}
          >
            <Calendar size={13} color="#64748b" />
            {d ? new Date(d).toLocaleDateString('km-KH') : (isKhmer ? 'មិនកំណត់' : 'N/A')}
          </span>
        );
      },
    },
    {
      header: isKhmer ? 'ឯកសារភ្ជាប់' : 'Attachment',
      render: (row) =>
        row.fileUrl ? (
          <a
            href={row.fileUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 9px',
              borderRadius: '6px',
              fontSize: '0.76rem',
              fontWeight: 700,
              background: '#eff6ff',
              color: '#1e73be',
              border: '1px solid #dbeafe',
              textDecoration: 'none',
            }}
          >
            <FileText size={13} />
            <span>PDF</span>
          </a>
        ) : (
          <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{isKhmer ? 'គ្មាន' : 'None'}</span>
        ),
    },
    {
      header: isKhmer ? 'ខ្ទាស់' : 'Pin',
      render: (row) => (
        <button
          type="button"
          onClick={() => handleTogglePin(row)}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '6px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: row.isPinned ? '#d97706' : '#94a3b8',
            fontSize: '0.78rem',
            fontWeight: 700,
          }}
          title={row.isPinned ? (isKhmer ? 'ដោះការខ្ទាស់' : 'Unpin notice') : (isKhmer ? 'ខ្ទាស់សេចក្តីជូនដំណឹងនេះ' : 'Pin notice')}
        >
          <Pin size={14} fill={row.isPinned ? '#d97706' : 'none'} />
          <span>{row.isPinned ? (isKhmer ? 'បានខ្ទាស់' : 'Pinned') : (isKhmer ? 'ធម្មតា' : 'Normal')}</span>
        </button>
      ),
    },
    {
      header: isKhmer ? 'ប្រតិបត្តិការ' : 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
          <button
            onClick={() => openPreview(row)}
            className="admin-btn admin-btn-outline admin-btn-sm"
            title={isKhmer ? 'អានសេចក្តីជូនដំណឹង' : 'Read Notice'}
            style={{ padding: '6px 9px', borderRadius: '8px', color: '#1e73be', borderColor: '#dbeafe', background: '#eff6ff' }}
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="admin-btn admin-btn-outline admin-btn-sm"
            title={isKhmer ? 'កែសម្រួល' : 'Edit Notice'}
            style={{ padding: '6px 9px', borderRadius: '8px' }}
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => openDeleteModal(row)}
            className="admin-btn admin-btn-danger admin-btn-sm"
            title={isKhmer ? 'លុប' : 'Delete Notice'}
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
    const meta = getCategoryMeta(row.category);
    const IconComp = meta.icon;
    const d = row.date || row.publishDate;

    return (
      <div className="admin-user-mobile-card">
        {/* Top Header: Category Tag & Pinned Badge */}
        <div className="admin-user-mobile-card-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '9999px',
                fontSize: '0.74rem',
                fontWeight: 700,
                background: meta.bg,
                color: meta.color,
                border: `1px solid ${meta.border}`,
              }}
            >
              <IconComp size={12} />
              <span>{meta.label}</span>
            </span>

            {row.isPinned ? (
              <span className="admin-notice-pinned-badge" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>
                <Pin size={11} fill="#b45309" />
                <span>{isKhmer ? 'បានខ្ទាស់' : 'Pinned'}</span>
              </span>
            ) : null}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#64748b' }}>
            <Calendar size={13} />
            <span>{d ? new Date(d).toLocaleDateString('km-KH') : (isKhmer ? 'មិនកំណត់' : 'N/A')}</span>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '12px 14px 10px' }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: '0.94rem',
              color: '#07294D',
              lineHeight: 1.35,
              marginBottom: '6px',
              cursor: 'pointer',
            }}
            onClick={() => openPreview(row)}
          >
            {row.title}
          </div>

          {row.content && (
            <p
              style={{
                fontSize: '0.82rem',
                color: '#64748b',
                lineHeight: 1.5,
                margin: '0 0 10px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {row.content}
            </p>
          )}

          {/* Attachment link if available */}
          {row.fileUrl && (
            <div style={{ marginTop: '6px' }}>
              <a
                href={row.fileUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  background: '#eff6ff',
                  color: '#1e73be',
                  border: '1px solid #dbeafe',
                  textDecoration: 'none',
                }}
              >
                <FileText size={13} />
                <span>{isKhmer ? 'ទាញយកឯកសារភ្ជាប់ (PDF)' : 'Download PDF Attachment'}</span>
                <ExternalLink size={11} />
              </a>
            </div>
          )}
        </div>

        {/* Tactile Touch Action Buttons */}
        <div className="admin-user-mobile-card-actions">
          <button
            type="button"
            onClick={() => openPreview(row)}
            className="admin-user-mobile-action-btn view"
            title={isKhmer ? 'អានសេចក្តីជូនដំណឹង' : 'Read Notice'}
          >
            <Eye size={13} />
            <span>{isKhmer ? 'អាន' : 'Read'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleTogglePin(row)}
            className="admin-user-mobile-action-btn"
            style={{
              background: row.isPinned ? '#fefce8' : '#ffffff',
              color: row.isPinned ? '#ca8a04' : '#64748b',
              borderColor: row.isPinned ? '#fef08a' : '#e2e8f0',
            }}
            title={row.isPinned ? (isKhmer ? 'ដោះការខ្ទាស់' : 'Unpin') : (isKhmer ? 'ខ្ទាស់' : 'Pin')}
          >
            <Pin size={13} fill={row.isPinned ? '#ca8a04' : 'none'} />
            <span>{row.isPinned ? (isKhmer ? 'ដោះខ្ទាស់' : 'Unpin') : (isKhmer ? 'ខ្ទាស់' : 'Pin')}</span>
          </button>
          <button
            type="button"
            onClick={() => openEditModal(row)}
            className="admin-user-mobile-action-btn edit"
            title={isKhmer ? 'កែសម្រួល' : 'Edit Notice'}
          >
            <Edit2 size={13} />
            <span>{isKhmer ? 'កែប្រែ' : 'Edit'}</span>
          </button>
          <button
            type="button"
            onClick={() => openDeleteModal(row)}
            className="admin-user-mobile-action-btn delete"
            title={isKhmer ? 'លុប' : 'Delete Notice'}
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
        className="admin-page-header admin-notices-header"
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
            <Bell size={14} />
            {isKhmer ? 'ការគ្រប់គ្រងសេចក្តីជូនដំណឹង & សារាចរណែនាំ' : 'Institutional Notices & Official Circulars'}
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
            {isKhmer ? 'សេចក្តីជូនដំណឹងស្ថាប័ន' : 'Institutional Notices'}
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
            {isKhmer
              ? 'គ្រប់គ្រងសេចក្តីជូនដំណឹងផ្លូវការ សេចក្តីប្រកាសអាហារូបករណ៍ កាលវិភាគប្រឡង និងសារាចរណែនាំរបស់វិទ្យាស្ថាន'
              : 'Manage official institutional announcements, scholarship releases, academic circulars, and student notices'}
          </p>
        </div>

        <div className="admin-notices-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            {isKhmer ? 'បន្ថែមសេចក្តីជូនដំណឹងថ្មី' : 'Add Notice'}
          </button>
        </div>
      </div>

      {/* 2. 4-Card Institutional KPI Metric Strip */}
      <div className="admin-kpi-grid admin-notices-kpis">
        {/* KPI 1: Total Notices */}
        <div
          className="admin-kpi-card"
          onClick={() => setSelectedFilter('all')}
          style={{ cursor: 'pointer' }}
        >
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">
                {isKhmer ? 'សេចក្តីជូនដំណឹងសរុប' : 'Total Notices'}
              </span>
              <div className="admin-kpi-value">{totalNotices}</div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#1e73be' }} />
                <span>{isKhmer ? 'សេចក្តីប្រកាស & សារាចរ' : 'Announcements & circulars'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#eff6ff', color: '#1e73be' }}>
                {isKhmer ? 'សរុប' : 'Total'}
              </span>
              <div
                className="admin-kpi-icon-badge"
                style={{ background: '#eff6ff', color: '#1e73be', border: '1px solid #dbeafe' }}
              >
                <Bell size={22} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'មើលដំណឹងទាំងអស់' : 'View all notices'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* KPI 2: Pinned Announcements */}
        <div
          className="admin-kpi-card"
          onClick={() => setSelectedFilter('pinned')}
          style={{ cursor: 'pointer' }}
        >
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">
                {isKhmer ? 'បានខ្ទាស់សំខាន់' : 'Pinned Notices'}
              </span>
              <div className="admin-kpi-value" style={{ color: '#ca8a04' }}>
                {pinnedNotices}
              </div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#ca8a04' }} />
                <span>{isKhmer ? 'បង្ហាញលើគេបង្អស់' : 'Top priority notices'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#fefce8', color: '#ca8a04' }}>
                {isKhmer ? 'បានខ្ទាស់' : 'Pinned'}
              </span>
              <div
                className="admin-kpi-icon-badge"
                style={{ background: '#fefce8', color: '#ca8a04', border: '1px solid #fef08a' }}
              >
                <Pin size={22} fill="#ca8a04" />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'ត្រងយកដំណឹងខ្ទាស់' : 'Filter pinned notices'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* KPI 3: Scholarships & Subsidies */}
        <div
          className="admin-kpi-card"
          onClick={() => setSelectedFilter('scholarship')}
          style={{ cursor: 'pointer' }}
        >
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">
                {isKhmer ? 'អាហារូបករណ៍ & ឧបត្ថម្ភ' : 'Scholarships & Grants'}
              </span>
              <div className="admin-kpi-value" style={{ color: '#7c3aed' }}>
                {scholarshipNotices}
              </div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#7c3aed' }} />
                <span>{isKhmer ? 'អាហារូបករណ៍ ១០០% TVET' : '100% TVET Scholarships'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#faf5ff', color: '#7c3aed' }}>
                {isKhmer ? 'អាហារូបករណ៍' : 'Scholarship'}
              </span>
              <div
                className="admin-kpi-icon-badge"
                style={{ background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}
              >
                <Award size={22} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'ត្រងយកអាហារូបករណ៍' : 'Filter scholarships'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* KPI 4: Internships & Industry */}
        <div
          className="admin-kpi-card"
          onClick={() => setSelectedFilter('internship')}
          style={{ cursor: 'pointer' }}
        >
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">
                {isKhmer ? 'កម្មសិក្សា & សហគ្រាស' : 'Internships & Careers'}
              </span>
              <div className="admin-kpi-value" style={{ color: '#059669' }}>
                {internshipNotices}
              </div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#059669' }} />
                <span>{isKhmer ? 'ឱកាសការងារ និងចុះកម្មសិក្សា' : 'Career & internship drives'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#f0fdf4', color: '#059669' }}>
                {isKhmer ? 'កម្មសិក្សា' : 'Internship'}
              </span>
              <div
                className="admin-kpi-icon-badge"
                style={{ background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' }}
              >
                <Briefcase size={22} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'ត្រងយកកម្មសិក្សា' : 'Filter internships'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>
      </div>

      {/* 3. Category Filter Bar (Sleek Horizontal Scroll Pills) */}
      <div className="admin-user-filter-bar">
        <button
          type="button"
          className={`admin-user-filter-pill ${selectedFilter === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('all')}
        >
          <span>{isKhmer ? 'ទាំងអស់' : 'All Notices'}</span>
          <span className="admin-user-filter-count">{totalNotices}</span>
        </button>

        <button
          type="button"
          className={`admin-user-filter-pill ${selectedFilter === 'pinned' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('pinned')}
        >
          <Pin size={12} fill={selectedFilter === 'pinned' ? '#ffffff' : 'none'} />
          <span>{isKhmer ? 'បានខ្ទាស់' : 'Pinned'}</span>
          <span className="admin-user-filter-count">{pinnedNotices}</span>
        </button>

        {uniqueCategories.map((cat) => {
          const count = notices.filter(
            (n) => (n.category || '').trim().toLowerCase() === cat.toLowerCase()
          ).length;
          const meta = getCategoryMeta(cat);
          const isSelected = selectedFilter === cat;
          return (
            <button
              type="button"
              key={cat}
              className={`admin-user-filter-pill ${isSelected ? 'active' : ''}`}
              onClick={() => setSelectedFilter(cat)}
            >
              <span>{meta.label}</span>
              <span className="admin-user-filter-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Rich Institutional DataTable & Mobile Cards */}
      <AdminDataTable
        columns={columns}
        data={filteredNotices}
        loading={loading}
        title={isKhmer ? 'បញ្ជីសេចក្តីជូនដំណឹងស្ថាប័ន' : 'Institutional Notices Directory'}
        subtitle={
          isKhmer
            ? `បង្ហាញ ${filteredNotices.length} ក្នុងចំណោមសេចក្តីជូនដំណឹងសរុប ${totalNotices}`
            : `Showing ${filteredNotices.length} of ${totalNotices} notices`
        }
        onAdd={openAddModal}
        addLabel={isKhmer ? 'បន្ថែមសេចក្តីជូនដំណឹងថ្មី' : 'Add Notice'}
        onRefresh={fetchData}
        searchPlaceholder={isKhmer ? 'ស្វែងរកសេចក្តីជូនដំណឹង ឬខ្លឹមសារ...' : 'Search notices or content...'}
        renderMobileCard={renderMobileCard}
      />

      {/* 5. Interactive Notice Reader Lightbox Modal */}
      {previewNotice && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1060,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(7, 41, 77, 0.75)',
            backdropFilter: 'blur(8px)',
            padding: '24px',
          }}
          onClick={() => setPreviewNotice(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '740px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '24px 28px',
                background: 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)',
                color: '#ffffff',
                borderRadius: '24px 24px 0 0',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                {(() => {
                  const meta = getCategoryMeta(previewNotice.category);
                  const IconComp = meta.icon;
                  return (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      <IconComp size={12} />
                      {meta.label}
                    </span>
                  );
                })()}

                {previewNotice.isPinned && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 9px',
                      borderRadius: '9999px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      backgroundColor: '#fef3c7',
                      color: '#b45309',
                    }}
                  >
                    <Pin size={11} fill="#b45309" />
                    {isKhmer ? 'បានខ្ទាស់សំខាន់' : 'Pinned'}
                  </span>
                )}
              </div>

              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.4 }}>
                {previewNotice.title}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', opacity: 0.85 }}>
                <Calendar size={13} />
                <span>
                  {previewNotice.date || previewNotice.publishDate
                    ? new Date(previewNotice.date || previewNotice.publishDate).toLocaleDateString('km-KH')
                    : ''}
                </span>
              </div>

              <button
                onClick={() => setPreviewNotice(null)}
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  background: 'rgba(0, 0, 0, 0.25)',
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
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 28px' }}>
              <div className="admin-notice-reader-box">
                {previewNotice.content}
              </div>

              {/* Attachment Download Box */}
              {previewNotice.fileUrl && (
                <div
                  style={{
                    marginTop: '20px',
                    padding: '16px 20px',
                    background: '#eff6ff',
                    borderRadius: '14px',
                    border: '1px solid #bfdbfe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: '#1e73be',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FileText size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#07294D' }}>
                        {isKhmer ? 'ឯកសារភ្ជាប់ផ្លូវការ (PDF Document)' : 'Official PDF Document'}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                        {previewNotice.fileUrl}
                      </div>
                    </div>
                  </div>

                  <a
                    href={previewNotice.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-btn admin-btn-primary admin-btn-sm"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      padding: '7px 14px',
                      fontWeight: 600,
                    }}
                  >
                    <Download size={14} />
                    {isKhmer ? 'ទាញយក / បើកមើល' : 'Download / View'}
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '14px 28px',
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
                onClick={() => setPreviewNotice(null)}
                className="admin-btn admin-btn-outline"
                style={{ borderRadius: '10px', padding: '8px 18px', fontWeight: 600 }}
              >
                {isKhmer ? 'បិទផ្ទាំង' : 'Close'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const n = previewNotice;
                  setPreviewNotice(null);
                  openEditModal(n);
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
                <Edit2 size={14} />
                {isKhmer ? 'កែសម្រួល' : 'Edit Notice'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Create / Edit Notice Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingNotice
            ? (isKhmer ? 'កែសម្រួលសេចក្តីជូនដំណឹង' : 'Edit Institutional Notice')
            : (isKhmer ? 'បន្ថែមសេចក្តីជូនដំណឹងថ្មី' : 'Add New Institutional Notice')
        }
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        maxWidth="680px"
      >
        {/* Section 1: Title & Category */}
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
            <Bell size={15} color="#1e73be" />
            {isKhmer ? 'ផ្នែកទី ១៖ ចំណងជើង & ប្រភេទដំណឹង' : 'Section 1: Notice Title & Category'}
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'ចំណងជើងសេចក្តីជូនដំណឹង *' : 'Notice Title *'}
            </label>
            <input
              type="text"
              className="admin-form-control"
              required
              placeholder={isKhmer ? 'ឧ. សេចក្តីជូនដំណឹងស្តីពីការឈប់សម្រាកបុណ្យភ្ជុំបិណ្ឌ...' : 'e.g. Official Public Holiday Announcement...'}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'ប្រភេទសេចក្តីជូនដំណឹង' : 'Notice Category'}
            </label>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
              {presetCategories.map((cat) => (
                <button
                  type="button"
                  key={cat.key}
                  onClick={() => setFormData({ ...formData, category: cat.key })}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '0.76rem',
                    border: '1px solid',
                    borderColor: formData.category === cat.key ? '#1e73be' : '#cbd5e1',
                    backgroundColor: formData.category === cat.key ? '#eff6ff' : '#ffffff',
                    color: formData.category === cat.key ? '#1e73be' : '#64748b',
                    cursor: 'pointer',
                    fontWeight: formData.category === cat.key ? 700 : 500,
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="admin-form-control"
              placeholder={isKhmer ? 'ឬវាយបញ្ចូលប្រភេទថ្មី...' : 'Or enter custom category key...'}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
        </div>

        {/* Section 2: Announcement Text / Content */}
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
            <FileText size={15} color="#059669" />
            {isKhmer ? 'ផ្នែកទី ២៖ ខ្លឹមសារសេចក្តីជូនដំណឹងពេញលេញ' : 'Section 2: Notice Announcement Body'}
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'ខ្លឹមសារសេចក្តីជូនដំណឹង *' : 'Notice Content *'}
            </label>
            <textarea
              className="admin-form-control"
              rows={6}
              required
              placeholder={isKhmer ? 'សរសេរខ្លឹមសារលម្អិតនៃសេចក្តីជូនដំណឹង...' : 'Write detailed announcement message...'}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>
        </div>

        {/* Section 3: Attachment & Document */}
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
            <Upload size={15} color="#7c3aed" />
            {isKhmer ? 'ផ្នែកទី ៣៖ ឯកសារភ្ជាប់ផ្លូវការ (PDF / File)' : 'Section 3: Official Attachment (PDF / File)'}
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'តំណភ្ជាប់ឯកសារ (File URL)' : 'Attachment File URL'}
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                className="admin-form-control"
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                placeholder="/uploads/notices/notice_doc.pdf"
              />
              <label className="admin-btn admin-btn-outline" style={{ whiteSpace: 'nowrap', cursor: 'pointer' }}>
                <Upload size={14} />
                <span>{uploading ? (isKhmer ? 'កំពុងផ្ទុក...' : 'Uploading...') : (isKhmer ? 'ផ្ទុកឯកសារ' : 'Upload')}</span>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        </div>

        {/* Section 4: Date & Pinning */}
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
            <Calendar size={15} color="#ea580c" />
            {isKhmer ? 'ផ្នែកទី ៤៖ កាលបរិច្ឆេទ & ការខ្ទាស់' : 'Section 4: Date & Pinning'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', alignItems: 'center' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'កាលបរិច្ឆេទប្រកាស *' : 'Published Date *'}
              </label>
              <input
                type="date"
                className="admin-form-control"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="admin-form-group" style={{ marginTop: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                <input
                  type="checkbox"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#d97706' }}
                />
                <div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#07294D' }}>
                    📌 {isKhmer ? 'ខ្ទាស់នៅខាងលើគេ' : 'Pin to Top'}
                  </span>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    {isKhmer ? 'បង្ហាញជាដំណឹងអាទិភាពខ្ពស់' : 'High priority announcement'}
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </AdminModal>

      {/* 7. Delete Confirmation Modal */}
      {deleteModalOpen && noticeToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1060,
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
                    {isKhmer ? 'បញ្ជាក់ការលុបសេចក្តីជូនដំណឹង' : 'Delete Notice Confirmation'}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {isKhmer ? 'សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានទេ' : 'This action cannot be undone'}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '12px 16px',
                  marginBottom: '14px',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#07294D' }}>
                  {noticeToDelete.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                  {isKhmer ? 'កាលបរិច្ឆេទ' : 'Date'}: {noticeToDelete.date || noticeToDelete.publishDate || 'N/A'}
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                {isKhmer
                  ? 'តើអ្នកពិតជាចង់លុបសេចក្តីជូនដំណឹងនេះចេញពីប្រព័ន្ធមែនទេ?'
                  : 'Are you sure you want to permanently delete this notice?'}
              </p>
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
                disabled={deleting}
                className="admin-btn admin-btn-danger"
                style={{ borderRadius: '10px', padding: '8px 18px', fontWeight: 600 }}
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
