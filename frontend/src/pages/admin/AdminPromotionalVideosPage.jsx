import React, { useEffect, useState, useMemo, useRef } from 'react';
import api from '../../api/client';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import { useLanguage } from '../../context/LanguageContext';
import {
  Video,
  Plus,
  RotateCw,
  Search,
  X,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Play,
  Star,
  ExternalLink,
  LayoutGrid,
  List,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Award,
  Calendar,
  Share2,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

export const AdminPromotionalVideosPage = () => {
  const { currentLanguage, language } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // View Mode: 'grid' or 'table'
  const [viewMode, setViewMode] = useState('grid');

  // Video Player Lightbox Modal
  const [activePlayerVideo, setActivePlayerVideo] = useState(null);

  // Delete Confirmation Modal
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Custom thumbnail upload state
  const fileInputRef = useRef(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [metaStatus, setMetaStatus] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    video_url: '',
    description: '',
    category: 'អាហារូបករណ៍ ១០០%',
    is_featured: false,
    is_active: true,
    order_index: 0,
    published_date: 'ថ្មីៗនេះ (ក្រោម ១ ខែ)',
    thumbnail: '',
  });

  const extractYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const isFacebookUrl = (url) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('facebook.com') || lower.includes('fb.watch') || lower.includes('fb.com');
  };

  const previewId = extractYouTubeId(formData.video_url);
  const isFbVideo = isFacebookUrl(formData.video_url);
  const previewThumbnail = formData.thumbnail
    ? formData.thumbnail
    : previewId
    ? `https://img.youtube.com/vi/${previewId}/hqdefault.jpg`
    : null;

  const handleUploadThumbnail = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert(isKhmer ? 'ទំហំរូបភាពមិនអាចលើសពី 5MB បានទេ' : 'Image size cannot exceed 5MB');
      return;
    }
    setUploadingThumb(true);
    setMetaStatus(null);
    try {
      const fd = new FormData();
      fd.append('thumbnail', file);
      const res = await api.post('/admin/promotional-videos/upload-thumbnail', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.thumbnail_url) {
        setFormData((prev) => ({ ...prev, thumbnail: res.data.thumbnail_url }));
        setMetaStatus({
          type: 'success',
          message: isKhmer ? '✓ បានបង្ហោះរូបភាពតំណាងថ្មីដោយជោគជ័យ' : '✓ Thumbnail uploaded successfully',
        });
      }
    } catch (err) {
      console.error('Upload thumbnail error:', err);
      alert(isKhmer ? 'ការបង្ហោះរូបភាពបរាជ័យ' : 'Failed to upload thumbnail');
    } finally {
      setUploadingThumb(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/promotional-videos');
      const data = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setVideos(data);
    } catch (err) {
      console.error('Failed to load promotional videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleActive = async (vid) => {
    try {
      const res = await api.post(`/admin/promotional-videos/${vid.id}/toggle`);
      const updatedStatus = res.data?.data?.is_active ?? !vid.is_active;
      setVideos((prev) =>
        prev.map((v) => (v.id === vid.id ? { ...v, is_active: updatedStatus } : v))
      );
    } catch {
      alert(isKhmer ? 'ការផ្លាស់ប្តូរស្ថានភាពមិនបានសម្រេច។' : 'Failed to toggle video status.');
    }
  };

  // Category Theme Badges
  const getCategoryMeta = (cat = '') => {
    const lower = (cat || '').toLowerCase();
    if (lower.includes('100%') || lower.includes('អាហារូបករណ៍')) {
      return {
        label: isKhmer ? 'អាហារូបករណ៍ ១០០%' : '100% Scholarship',
        bg: '#fefce8',
        color: '#ca8a04',
        border: '#fef08a',
        icon: Award,
      };
    }
    if (lower.includes('tvet') || lower.includes('1.5m')) {
      return {
        label: isKhmer ? 'កម្មវិធី TVET 1.5M' : 'TVET 1.5M Program',
        bg: '#eff6ff',
        color: '#1e73be',
        border: '#dbeafe',
        icon: Video,
      };
    }
    if (lower.includes('ict') || lower.includes('ព័ត៌មានវិទ្យា')) {
      return {
        label: isKhmer ? 'ដេប៉ាតឺម៉ង់ ICT' : 'ICT Department',
        bg: '#faf5ff',
        color: '#7c3aed',
        border: '#e9d5ff',
        icon: Sparkles,
      };
    }
    if (lower.includes('សម្ភាសន៍') || lower.includes('interview')) {
      return {
        label: isKhmer ? 'បទសម្ភាសន៍និស្សិត' : 'Student Interview',
        bg: '#f0fdf4',
        color: '#059669',
        border: '#bbf7d0',
        icon: CheckCircle2,
      };
    }
    return {
      label: cat || (isKhmer ? 'សកម្មភាពទូទៅ' : 'General Showcase'),
      bg: '#fff7ed',
      color: '#ea580c',
      border: '#fed7aa',
      icon: Layers,
    };
  };

  // Extract Unique Categories dynamically from actual video records
  const uniqueCategories = useMemo(() => {
    const cats = [];
    videos.forEach((v) => {
      const cat = (v.category || '').trim();
      if (cat && !cats.includes(cat)) {
        cats.push(cat);
      }
    });
    return cats;
  }, [videos]);

  // KPI Calculations
  const totalVideos = videos.length;
  const featuredVideos = videos.filter((v) => v.is_featured).length;
  const activeVideos = videos.filter((v) => v.is_active).length;
  const tvetScholarshipVideos = videos.filter((v) => {
    const cat = v.category || '';
    return (
      cat.includes('100%') ||
      cat.includes('១០០%') ||
      cat.includes('អាហារូបករណ៍') ||
      cat.includes('1.5M') ||
      cat.includes('១.៥') ||
      cat.includes('TVET')
    );
  }).length;

  // Filtered Videos
  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      const matchSearch =
        searchTerm === '' ||
        v.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.category?.toLowerCase().includes(searchTerm.toLowerCase());

      let matchFilter = true;
      if (selectedFilter === 'all') {
        matchFilter = true;
      } else if (selectedFilter === 'featured') {
        matchFilter = Boolean(v.is_featured);
      } else {
        matchFilter = (v.category || '').trim() === selectedFilter;
      }

      return matchSearch && matchFilter;
    });
  }, [videos, searchTerm, selectedFilter]);

  const openAddModal = () => {
    setEditingVideo(null);
    setMetaStatus(null);
    setFormData({
      title: '',
      video_url: '',
      description: '',
      category: 'អាហារូបករណ៍ ១០០%',
      is_featured: false,
      is_active: true,
      order_index: videos.length + 1,
      published_date: 'ថ្មីៗនេះ (ក្រោម ១ ខែ)',
      thumbnail: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (vid) => {
    setEditingVideo(vid);
    setMetaStatus(null);
    setFormData({
      title: vid.title || '',
      video_url: vid.video_url || '',
      description: vid.description || '',
      category: vid.category || 'អាហារូបករណ៍ ១០០%',
      is_featured: Boolean(vid.is_featured),
      is_active: Boolean(vid.is_active),
      order_index: vid.order_index ?? 0,
      published_date: vid.published_date || 'ថ្មីៗនេះ (ក្រោម ១ ខែ)',
      thumbnail: vid.thumbnail || '',
    });
    setModalOpen(true);
  };

  const openPlayer = (vid) => {
    setActivePlayerVideo(vid);
  };

  const openDeleteModal = (vid) => {
    setVideoToDelete(vid);
    setDeleteModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingVideo) {
        await api.put(`/admin/promotional-videos/${editingVideo.id}`, formData);
      } else {
        await api.post('/admin/promotional-videos', formData);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(isKhmer ? 'ការរក្សាទុកវីដេអូបរាជ័យ។' : 'Failed to save video. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!videoToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/promotional-videos/${videoToDelete.id}`);
      setDeleteModalOpen(false);
      setVideoToDelete(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(isKhmer ? 'ការលុបវីដេអូបរាជ័យ។' : 'Failed to delete video.');
    } finally {
      setDeleting(false);
    }
  };

  const presetCategories = [
    'អាហារូបករណ៍ ១០០%',
    'កម្មវិធី TVET 1.5M',
    'ដេប៉ាតឺម៉ង់ព័ត៌មានវិទ្យា (ICT)',
    'បទសម្ភាសន៍និស្សិត',
    'ទស្សនកិច្ចសិក្សា',
    'សកម្មភាពទូទៅ',
  ];

  const columns = [
    {
      header: isKhmer ? 'វីដេអូ & រូបភាពតំណាង' : 'Video & Thumbnail',
      render: (row) => {
        const thumb =
          row.thumbnail ||
          (row.youtube_id ? `https://img.youtube.com/vi/${row.youtube_id}/mqdefault.jpg` : null);
        const isFb = isFacebookUrl(row.video_url);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              className="admin-video-card-thumb-wrap"
              style={{
                width: '90px',
                height: '54px',
                borderRadius: '8px',
                flexShrink: 0,
              }}
              onClick={() => openPlayer(row)}
            >
              {thumb ? (
                <img
                  src={thumb}
                  alt={row.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = '/images/gallery/school.jpg';
                  }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  <Video size={20} />
                </div>
              )}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(7, 41, 77, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Play size={12} fill="#ef4444" style={{ marginLeft: '2px' }} />
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: '700', color: '#07294D', fontSize: '0.92rem', marginBottom: '3px' }}>
                {row.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem' }}>
                <a
                  href={row.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: isFb ? '#1877f2' : '#ef4444',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'none',
                    fontWeight: '700',
                  }}
                >
                  <ExternalLink size={11} />
                  <span>{isFb ? 'Facebook Video' : 'YouTube'}</span>
                </a>
                <span style={{ color: '#94a3b8' }}>•</span>
                <span style={{ color: '#64748b' }}>{row.published_date || (isKhmer ? 'ថ្មីៗ' : 'Recent')}</span>
              </div>
            </div>
          </div>
        );
      },
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
      header: isKhmer ? 'Featured' : 'Featured',
      render: (row) =>
        row.is_featured ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 9px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: '#fef3c7',
              color: '#d97706',
              border: '1px solid #fde68a',
            }}
          >
            <Star size={12} fill="#d97706" />
            <span>{isKhmer ? 'Featured ចម្បង' : 'Featured'}</span>
          </span>
        ) : (
          <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{isKhmer ? 'ធម្មតា' : 'Standard'}</span>
        ),
    },
    {
      header: isKhmer ? 'ស្ថានភាព' : 'Status',
      render: (row) => (
        <button
          type="button"
          onClick={() => handleToggleActive(row)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            backgroundColor: row.is_active ? '#f0fdf4' : '#fef2f2',
            color: row.is_active ? '#166534' : '#dc2626',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: row.is_active ? '#bbf7d0' : '#fecaca',
            transition: 'all 0.2s ease',
          }}
        >
          {row.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
          <span>{row.is_active ? (isKhmer ? 'បង្ហាញ' : 'Active') : (isKhmer ? 'លាក់' : 'Hidden')}</span>
        </button>
      ),
    },
    {
      header: isKhmer ? 'លំដាប់' : 'Order',
      render: (row) => (
        <span
          style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: '6px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#64748b',
          }}
        >
          #{row.order_index ?? 0}
        </span>
      ),
    },
    {
      header: isKhmer ? 'ប្រតិបត្តិការ' : 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
          <button
            onClick={() => openPlayer(row)}
            className="admin-btn admin-btn-outline admin-btn-sm"
            title={isKhmer ? 'ចាក់វីដេអូ' : 'Play Video'}
            style={{ padding: '6px 9px', borderRadius: '8px', color: '#ef4444', borderColor: '#fecaca', background: '#fef2f2' }}
          >
            <Play size={14} fill="#ef4444" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="admin-btn admin-btn-outline admin-btn-sm"
            title={isKhmer ? 'កែសម្រួល' : 'Edit Video'}
            style={{ padding: '6px 9px', borderRadius: '8px' }}
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => openDeleteModal(row)}
            className="admin-btn admin-btn-danger admin-btn-sm"
            title={isKhmer ? 'លុប' : 'Delete Video'}
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
      {/* 1. Institutional Header Banner */}
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
            <Video size={14} />
            {isKhmer ? 'ការគ្រប់គ្រងវីដេអូផ្សព្វផ្សាយ & ប្រព័ន្ធផ្សព្វផ្សាយ' : 'Institutional Video Showcase & Media Productions'}
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
            {isKhmer ? 'វីដេអូផ្សព្វផ្សាយស្ថាប័ន' : 'Promotional Videos & Media'}
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
            {isKhmer
              ? 'គ្រប់គ្រងវីដេអូផ្សព្វផ្សាយវគ្គបណ្តុះបណ្តាល អាហារូបករណ៍ ១០០% សកម្មភាពនិស្សិត និងបទសម្ភាសន៍ផ្លូវការ'
              : 'Manage promotional videos, scholarship highlights, TVET 1.5M showcases, and YouTube spotlight reels'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Dual View Toggle */}
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              padding: '3px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '9px',
                border: 'none',
                background: viewMode === 'grid' ? '#ffffff' : 'transparent',
                color: viewMode === 'grid' ? '#07294D' : '#64748b',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'grid' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <LayoutGrid size={14} />
              {isKhmer ? 'ផ្ទាំងកាត' : 'Grid'}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '9px',
                border: 'none',
                background: viewMode === 'table' ? '#ffffff' : 'transparent',
                color: viewMode === 'table' ? '#07294D' : '#64748b',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'table' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <List size={14} />
              {isKhmer ? 'តារាង' : 'Table'}
            </button>
          </div>

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
            {isKhmer ? 'បន្ថែមវីដេអូថ្មី' : 'Add Video'}
          </button>
        </div>
      </div>

      {/* 2. 4-Card Institutional KPI Metric Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* KPI 1: Total Videos */}
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
            <Video size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isKhmer ? 'វីដេអូសរុប' : 'Total Videos'}
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#07294D', marginTop: '2px' }}>
              {totalVideos} <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e73be' }}>{isKhmer ? 'វីដេអូ' : 'Videos'}</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Featured Spotlight */}
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
              background: '#fefce8',
              color: '#ca8a04',
              border: '1px solid #fef08a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Star size={22} fill="#ca8a04" />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isKhmer ? 'វីដេអូ Featured ចម្បង' : 'Featured Spotlight'}
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#07294D', marginTop: '2px' }}>
              {featuredVideos} <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ca8a04' }}>{isKhmer ? 'វីដេអូ' : 'Featured'}</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Active Status */}
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
              {isKhmer ? 'ស្ថានភាពដំណើរការ' : 'Active Broadcast'}
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#07294D', marginTop: '2px' }}>
              {activeVideos} / {totalVideos}{' '}
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#059669' }}>(100%)</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Scholarships & TVET Focus */}
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
            <Award size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isKhmer ? 'អាហារូបករណ៍ & TVET' : 'Scholarships & TVET'}
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#07294D', marginTop: '2px' }}>
              {tvetScholarshipVideos} <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ea580c' }}>{isKhmer ? 'វីដេអូ' : 'Reels'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Category Filter Tabs & Live Search Strip */}
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
        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 700,
              border: '1px solid',
              borderColor: selectedFilter === 'all' ? '#1e73be' : '#e2e8f0',
              backgroundColor: selectedFilter === 'all' ? '#eff6ff' : '#ffffff',
              color: selectedFilter === 'all' ? '#1e73be' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {isKhmer ? 'ទាំងអស់' : 'All Videos'} ({totalVideos})
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('featured')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 700,
              border: '1px solid',
              borderColor: selectedFilter === 'featured' ? '#ca8a04' : '#e2e8f0',
              backgroundColor: selectedFilter === 'featured' ? '#fefce8' : '#ffffff',
              color: selectedFilter === 'featured' ? '#ca8a04' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Star size={13} fill={selectedFilter === 'featured' ? '#ca8a04' : 'none'} />
            {isKhmer ? 'Featured ចម្បង' : 'Featured'} ({featuredVideos})
          </button>

          {uniqueCategories.map((cat) => {
            const count = videos.filter((v) => (v.category || '').trim() === cat).length;
            const isSelected = selectedFilter === cat;
            return (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: isSelected ? 700 : 600,
                  border: '1px solid',
                  borderColor: isSelected ? '#1e73be' : '#e2e8f0',
                  backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                  color: isSelected ? '#1e73be' : '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Live Search */}
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
            placeholder={isKhmer ? 'ស្វែងរកចំណងជើង ឬ Caption...' : 'Search videos or caption...'}
            style={{
              width: '100%',
              padding: '7px 32px 7px 36px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              fontSize: '0.84rem',
              outline: 'none',
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

      {/* 4. Display Content: Grid Showcase Mode vs Table Mode */}
      {viewMode === 'grid' ? (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <RotateCw size={24} className="fa-spin" style={{ marginBottom: '10px' }} />
              <div>{isKhmer ? 'កំពុងផ្ទុកវីដេអូ...' : 'Loading promotional videos...'}</div>
            </div>
          ) : filteredVideos.length > 0 ? (
            <div className="admin-video-grid">
              {filteredVideos.map((vid) => {
                const meta = getCategoryMeta(vid.category);
                const IconComp = meta.icon;
                const thumb =
                  vid.thumbnail ||
                  (vid.youtube_id ? `https://img.youtube.com/vi/${vid.youtube_id}/hqdefault.jpg` : null);
                const isFb = isFacebookUrl(vid.video_url);

                return (
                  <div key={vid.id} className="admin-video-card">
                    {/* Thumbnail & Play Overlay */}
                    <div className="admin-video-card-thumb-wrap" onClick={() => openPlayer(vid)}>
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={vid.title}
                          className="admin-video-card-thumb-img"
                          onError={(e) => {
                            e.target.src = '/images/gallery/school.jpg';
                          }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                          <Video size={36} />
                        </div>
                      )}

                      <div className="admin-video-play-overlay">
                        <div className="admin-video-play-btn">
                          <Play size={20} fill="#ef4444" style={{ marginLeft: '3px' }} />
                        </div>
                      </div>

                      {/* Featured Badge */}
                      {vid.is_featured && (
                        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              backgroundColor: '#fef3c7',
                              color: '#b45309',
                              border: '1px solid #fde68a',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            }}
                          >
                            <Star size={12} fill="#b45309" />
                            {isKhmer ? 'Featured ចម្បង' : 'Featured'}
                          </span>
                        </div>
                      )}

                      {/* Category Pill Overlay */}
                      <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 9px',
                            borderRadius: '9999px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: meta.bg,
                            color: meta.color,
                            border: `1px solid ${meta.border}`,
                            backdropFilter: 'blur(4px)',
                          }}
                        >
                          <IconComp size={11} />
                          {meta.label}
                        </span>
                      </div>

                      {/* Platform indicator badge */}
                      <div style={{ position: 'absolute', bottom: '10px', left: '12px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            background: 'rgba(0,0,0,0.7)',
                            color: '#ffffff',
                            backdropFilter: 'blur(4px)',
                          }}
                        >
                          {isFb ? 'Facebook' : 'YouTube'}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="admin-video-card-body">
                      <div>
                        <h4
                          style={{
                            margin: '0 0 8px 0',
                            fontSize: '0.98rem',
                            fontWeight: 800,
                            color: '#07294D',
                            lineHeight: 1.4,
                          }}
                        >
                          {vid.title}
                        </h4>
                        <p
                          style={{
                            margin: '0 0 10px 0',
                            fontSize: '0.8rem',
                            color: '#64748b',
                            lineHeight: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {vid.description || (isKhmer ? 'គ្មាន Caption ពិពណ៌នា' : 'No caption provided')}
                        </p>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: '12px',
                          paddingTop: '12px',
                          borderTop: '1px dashed #e2e8f0',
                        }}
                      >
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                          #{vid.order_index ?? 0} • {vid.published_date || (isKhmer ? 'ថ្មីៗ' : 'Recent')}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {/* Active Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleActive(vid)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '7px',
                              border: '1px solid',
                              borderColor: vid.is_active ? '#bbf7d0' : '#fecaca',
                              background: vid.is_active ? '#f0fdf4' : '#fef2f2',
                              color: vid.is_active ? '#166534' : '#dc2626',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                            title={vid.is_active ? (isKhmer ? 'ចុចដើម្បីលាក់' : 'Hide video') : (isKhmer ? 'ចុចដើម្បីបង្ហាញ' : 'Show video')}
                          >
                            {vid.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
                          </button>

                          <button
                            onClick={() => openEditModal(vid)}
                            className="admin-btn admin-btn-outline admin-btn-sm"
                            title={isKhmer ? 'កែសម្រួល' : 'Edit Video'}
                            style={{ padding: '5px 8px', borderRadius: '7px' }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(vid)}
                            className="admin-btn admin-btn-danger admin-btn-sm"
                            title={isKhmer ? 'លុប' : 'Delete Video'}
                            style={{ padding: '5px 8px', borderRadius: '7px' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: '#ffffff',
                borderRadius: '18px',
                border: '1px dashed #cbd5e1',
              }}
            >
              <Video size={36} style={{ color: '#94a3b8', marginBottom: '10px' }} />
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#475569' }}>
                {isKhmer ? 'មិនមានវីដេអូត្រូវគ្នានឹងការស្វែងរកឡើយ' : 'No promotional videos found'}
              </div>
            </div>
          )}
        </div>
      ) : (
        <AdminDataTable
          columns={columns}
          data={filteredVideos}
          loading={loading}
          title={isKhmer ? 'តារាងវីដេអូផ្សព្វផ្សាយ' : 'Promotional Videos Directory'}
          subtitle={
            isKhmer
              ? `បង្ហាញ ${filteredVideos.length} ក្នុងចំណោមវីដេអូសរុប ${totalVideos}`
              : `Showing ${filteredVideos.length} of ${totalVideos} videos`
          }
        />
      )}

      {/* 5. Interactive Video Player Lightbox Modal */}
      {activePlayerVideo && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1060,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(7, 41, 77, 0.8)',
            backdropFilter: 'blur(8px)',
            padding: '24px',
          }}
          onClick={() => setActivePlayerVideo(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '840px',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Embedded Player or Facebook container */}
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', background: '#000000', borderRadius: '24px 24px 0 0', overflow: 'hidden' }}>
              {activePlayerVideo.youtube_id ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activePlayerVideo.youtube_id}?autoplay=1&rel=0`}
                  title={activePlayerVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    padding: '20px',
                    textAlign: 'center',
                  }}
                >
                  <Video size={48} style={{ marginBottom: '14px', color: '#38bdf8' }} />
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#ffffff' }}>
                    {activePlayerVideo.title}
                  </h4>
                  <p style={{ maxWidth: '460px', fontSize: '0.88rem', color: '#94a3b8', marginBottom: '18px' }}>
                    {isKhmer
                      ? 'វីដេអូនេះមានប្រភពលើ Facebook សូមចុចប៊ូតុងខាងក្រោមដើម្បីទស្សនាផ្ទាល់លើ Facebook'
                      : 'This video is hosted on Facebook. Click below to view directly on Facebook.'}
                  </p>
                  <a
                    href={activePlayerVideo.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-btn admin-btn-primary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      textDecoration: 'none',
                      background: '#1877f2',
                      borderColor: '#1877f2',
                    }}
                  >
                    <ExternalLink size={16} />
                    {isKhmer ? 'បើកទស្សនាលើ Facebook' : 'Watch on Facebook'}
                  </a>
                </div>
              )}

              <button
                onClick={() => setActivePlayerVideo(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(0, 0, 0, 0.65)',
                  backdropFilter: 'blur(4px)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Video Metadata Body */}
            <div style={{ padding: '22px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    {(() => {
                      const meta = getCategoryMeta(activePlayerVideo.category);
                      const IconComp = meta.icon;
                      return (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
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
                          {meta.label}
                        </span>
                      );
                    })()}

                    {activePlayerVideo.is_featured && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          backgroundColor: '#fef3c7',
                          color: '#d97706',
                          border: '1px solid #fde68a',
                        }}
                      >
                        <Star size={11} fill="#d97706" />
                        {isKhmer ? 'Featured ចម្បង' : 'Featured'}
                      </span>
                    )}
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#07294D' }}>
                    {activePlayerVideo.title}
                  </h3>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={activePlayerVideo.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-btn admin-btn-outline admin-btn-sm"
                    style={{ borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}
                  >
                    <ExternalLink size={14} />
                    {isKhmer ? 'តំណភ្ជាប់ដើម' : 'Direct Link'}
                  </a>
                </div>
              </div>

              {activePlayerVideo.description && (
                <div
                  style={{
                    background: '#f8fafc',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.88rem',
                    color: '#334155',
                    lineHeight: 1.6,
                    margin: '0 0 16px 0',
                  }}
                >
                  {activePlayerVideo.description}
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '10px',
                  background: '#f8fafc',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.8rem',
                  color: '#64748b',
                }}
              >
                <div>
                  <strong>{isKhmer ? 'កាលបរិច្ឆេទ' : 'Published Tag'}:</strong>{' '}
                  <span>{activePlayerVideo.published_date || (isKhmer ? 'ថ្មីៗ' : 'Recent')}</span>
                </div>
                <div>
                  <strong>{isKhmer ? 'លំដាប់' : 'Order'}:</strong> #{activePlayerVideo.order_index ?? 0}
                </div>
                <div>
                  <strong>{isKhmer ? 'ស្ថានភាព' : 'Status'}:</strong>{' '}
                  <span style={{ color: activePlayerVideo.is_active ? '#059669' : '#dc2626', fontWeight: 700 }}>
                    {activePlayerVideo.is_active ? (isKhmer ? 'បង្ហាញ' : 'Active') : (isKhmer ? 'លាក់' : 'Hidden')}
                  </span>
                </div>
              </div>
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
                onClick={() => setActivePlayerVideo(null)}
                className="admin-btn admin-btn-outline"
                style={{ borderRadius: '10px', padding: '8px 18px', fontWeight: 600 }}
              >
                {isKhmer ? 'បិទផ្ទាំង' : 'Close'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const vid = activePlayerVideo;
                  setActivePlayerVideo(null);
                  openEditModal(vid);
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
                {isKhmer ? 'កែសម្រួលវីដេអូ' : 'Edit Video'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Create / Edit Video Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingVideo
            ? (isKhmer ? 'កែសម្រួលព័ត៌មានវីដេអូ' : 'Edit Promotional Video')
            : (isKhmer ? 'បន្ថែមវីដេអូថ្មីក្នុងប្រព័ន្ធ' : 'Add New Promotional Video')
        }
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        maxWidth="680px"
      >
        {/* Section 1: Video Link & Thumbnail */}
        <div style={{ marginBottom: '22px' }}>
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
            <Video size={15} color="#ef4444" />
            {isKhmer ? 'ផ្នែកទី ១៖ តំណភ្ជាប់វីដេអូ & រូបភាពតំណាង (URL & Thumbnail)' : 'Section 1: Video URL & Thumbnail'}
          </div>

          <div className="admin-form-group" style={{ marginBottom: '14px' }}>
            <label className="admin-form-label">
              {isKhmer ? 'តំណភ្ជាប់វីដេអូ (YouTube ឬ Facebook Video / Reel URL) *' : 'Video URL *'}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="url"
                className="admin-form-control"
                required
                placeholder="https://www.facebook.com/reel/... ឬ https://www.youtube.com/watch?v=..."
                value={formData.video_url}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, video_url: val });
                }}
              />
            </div>
            <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '0.78rem' }}>
              {isKhmer
                ? 'សូមបញ្ចូលចំណងជើង និងការពិពណ៌នាដោយផ្ទាល់។ សម្រាប់វីដេអូ Facebook សូមបង្ហោះរូបភាពតំណាង។ រូបភាពតំណាង YouTube នឹងបង្ហាញដោយស្វ័យប្រវត្តិ។'
                : 'Enter the title and description manually. Upload a thumbnail for Facebook videos. YouTube thumbnails appear automatically.'}
            </p>

            {/* Status / feedback message */}
            {metaStatus && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: metaStatus.type === 'success' ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${metaStatus.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                  color: metaStatus.type === 'success' ? '#15803d' : '#b91c1c',
                }}
              >
                {metaStatus.type === 'success' ? (
                  <CheckCircle2 size={14} color="#15803d" />
                ) : (
                  <AlertTriangle size={14} color="#b91c1c" />
                )}
                <span>{metaStatus.message}</span>
              </div>
            )}
          </div>

          {/* Thumbnail Preview & Upload Card */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px 14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#07294D', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ImageIcon size={15} color="#1e73be" />
                <span>{isKhmer ? 'រូបភាពតំណាងវីដេអូ (Video Thumbnail)' : 'Video Thumbnail'}</span>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingThumb}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#07294D',
                    cursor: uploadingThumb ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Upload size={12} color="#1e73be" />
                  <span>{uploadingThumb ? (isKhmer ? 'កំពុងបង្ហោះ...' : 'Uploading...') : (isKhmer ? 'បង្ហោះរូបភាពថ្មី' : 'Upload Image')}</span>
                </button>
                {formData.thumbnail && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, thumbnail: '' })}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: '#ffffff',
                      border: '1px solid #fecaca',
                      color: '#ef4444',
                      cursor: 'pointer',
                    }}
                    title={isKhmer ? 'សម្អាតរូបភាព' : 'Clear thumbnail'}
                  >
                    <X size={12} />
                    <span>{isKhmer ? 'សម្អាត' : 'Clear'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Hidden File Input for Custom Upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadThumbnail}
              accept="image/jpeg,image/png,image/webp,image/jpg"
              style={{ display: 'none' }}
            />

            {previewThumbnail ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  backgroundColor: '#ffffff',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    width: '120px',
                    height: '68px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#07294D',
                    flexShrink: 0,
                    position: 'relative',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  }}
                >
                  <img
                    src={previewThumbnail}
                    alt="Thumbnail Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = '/images/gallery/school.jpg';
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '4px',
                      left: '4px',
                      padding: '2px 5px',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor: isFbVideo ? '#1877f2' : previewId ? '#dc2626' : '#059669',
                      color: '#ffffff',
                    }}
                  >
                    {isFbVideo ? 'Facebook' : previewId ? 'YouTube' : 'Custom'}
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', color: '#07294D', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="#16a34a" />
                    <span>
                      {isFbVideo
                        ? (isKhmer ? 'រូបភាពតំណាងវីដេអូ Facebook ដែលបានបង្ហោះ' : 'Uploaded Facebook Video Thumbnail')
                        : previewId
                        ? (isKhmer ? 'រូបភាពតំណាង HD ពី YouTube' : 'HD Thumbnail from YouTube')
                        : (isKhmer ? 'រូបភាពតំណាងផ្ទាល់ខ្លួន' : 'Custom Uploaded Thumbnail')}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: '#64748b',
                      marginTop: '3px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '380px',
                    }}
                    title={previewThumbnail}
                  >
                    {previewThumbnail}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                    {isKhmer
                      ? 'រូបភាពនេះនឹងបង្ហាញនៅលើកាតវីដេអូទំព័រដើម និងផ្ទាំងគ្រប់គ្រង'
                      : 'This thumbnail will appear on public video cards and admin lists'}
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  border: '1.5px dashed #cbd5e1',
                  borderRadius: '10px',
                  padding: '16px',
                  textAlign: 'center',
                  backgroundColor: '#ffffff',
                }}
              >
                <ImageIcon size={28} color="#94a3b8" style={{ margin: '0 auto 6px' }} />
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>
                  {isKhmer ? 'មិនទាន់មានរូបភាពតំណាង (No Thumbnail)' : 'No Thumbnail Set'}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px', marginBottom: '10px' }}>
                  {isKhmer
                    ? 'ចុច "បង្ហោះរូបភាពថ្មី" ដើម្បីជ្រើសរូបភាពពីកុំព្យូទ័រ'
                    : 'Click "Upload Image" to choose a file'}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#1e73be',
                    cursor: 'pointer',
                  }}
                >
                  <Upload size={13} />
                  <span>{isKhmer ? 'ជ្រើសរើសរូបភាពពីកុំព្យូទ័រ (Upload File)' : 'Choose Image File'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Title & Category */}
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
            <Sparkles size={15} color="#1e73be" />
            {isKhmer ? 'ផ្នែកទី ២៖ ចំណងជើង & ប្រភេទ' : 'Section 2: Title & Category'}
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'ចំណងជើងវីដេអូ (Video Title) *' : 'Video Title *'}
            </label>
            <input
              type="text"
              className="admin-form-control"
              required
              placeholder={isKhmer ? 'ឧ. សេចក្តីជូនដំណឹង៖ វគ្គសិក្សាអាហារូបករណ៍ ១០០% សម្រាប់ឆ្នាំសិក្សាថ្មី' : 'e.g. TVET Scholarship 100% Announcement'}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'ប្រភេទវីដេអូ (Category)' : 'Video Category'}
            </label>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
              {presetCategories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setFormData({ ...formData, category: cat })}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '0.76rem',
                    border: '1px solid',
                    borderColor: formData.category === cat ? '#1e73be' : '#cbd5e1',
                    backgroundColor: formData.category === cat ? '#eff6ff' : '#ffffff',
                    color: formData.category === cat ? '#1e73be' : '#64748b',
                    cursor: 'pointer',
                    fontWeight: formData.category === cat ? 700 : 500,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="admin-form-control"
              placeholder={isKhmer ? 'ឬវាយបញ្ចូលប្រភេទថ្មី...' : 'Or type a custom category...'}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
        </div>

        {/* Section 3: Caption / Description */}
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
            <Layers size={15} color="#059669" />
            {isKhmer ? 'ផ្នែកទី ៣៖ Caption & សេចក្តីពិពណ៌នា' : 'Section 3: Caption & Description'}
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'Caption / ការពិពណ៌នាខ្លឹមសារវីដេអូ' : 'Caption / Description'}
            </label>
            <textarea
              className="admin-form-control"
              rows={3}
              placeholder={isKhmer ? 'សរសេរ Caption រៀបរាប់សង្ខេបពីខ្លឹមសារវីដេអូ...' : 'Brief caption describing the video content...'}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        {/* Section 4: Display Date, Order, Featured & Active */}
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
            {isKhmer ? 'ផ្នែកទី ៤៖ ការកំណត់បង្ហាញ & លំដាប់' : 'Section 4: Scheduling & Visibility'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'ស្លាកកាលបរិច្ឆេទ (Display Date Tag)' : 'Display Date Tag'}
              </label>
              <input
                type="text"
                className="admin-form-control"
                placeholder="ឧ. ថ្មីៗនេះ (ក្រោម ១ ខែ)"
                value={formData.published_date}
                onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'លំដាប់លំដោយ (Order Index)' : 'Order Index'}
              </label>
              <input
                type="number"
                className="admin-form-control"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Featured & Active Switches */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', margin: 0 }}>
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                style={{ width: '16px', height: '16px', accentColor: '#d97706' }}
              />
              <div>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#07294D' }}>
                  ⭐ {isKhmer ? 'កំណត់ជា Featured ចម្បង' : 'Set as Featured Spotlight'}
                </span>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {isKhmer ? 'វីដេអូនេះនឹងបង្ហាញជាវីដេអូធំចម្បងខាងឆ្វេងក្នុងទំព័រដើម' : 'Displays as the prominent main video player on homepage'}
                </div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', margin: 0 }}>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                style={{ width: '16px', height: '16px', accentColor: '#1e73be' }}
              />
              <div>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#07294D' }}>
                  👁️ {isKhmer ? 'បើកបង្ហាញជាសាធារណៈ (Active)' : 'Broadcast Publicly (Active)'}
                </span>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {isKhmer ? 'អនុញ្ញាតឱ្យទស្សនិកជនមើលឃើញលើ Website ភ្លាមៗ' : 'Enables public visibility on the website'}
                </div>
              </div>
            </label>
          </div>
        </div>
      </AdminModal>

      {/* 7. Delete Confirmation Modal */}
      {deleteModalOpen && videoToDelete && (
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
                    {isKhmer ? 'បញ្ជាក់ការលុបវីដេអូ' : 'Delete Video Confirmation'}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {isKhmer ? 'សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានទេ' : 'This action cannot be undone'}
                  </div>
                </div>
              </div>

              {/* Video Thumbnail Preview */}
              <div
                style={{
                  width: '100%',
                  aspectRatio: '16 / 9',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#0f172a',
                  marginBottom: '14px',
                }}
              >
                <img
                  src={
                    videoToDelete.thumbnail ||
                    (videoToDelete.youtube_id
                      ? `https://img.youtube.com/vi/${videoToDelete.youtube_id}/hqdefault.jpg`
                      : '/images/gallery/school.jpg')
                  }
                  alt={videoToDelete.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = '/images/gallery/school.jpg';
                  }}
                />
              </div>

              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                {isKhmer ? (
                  <>
                    តើអ្នកពិតជាចង់លុបវីដេអូ <strong>"{videoToDelete.title}"</strong> នេះមែនទេ?
                  </>
                ) : (
                  <>
                    Are you sure you want to delete promotional video <strong>"{videoToDelete.title}"</strong>?
                  </>
                )}
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
