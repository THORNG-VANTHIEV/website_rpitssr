import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/client';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import { useLanguage } from '../../context/LanguageContext';
import {
  Image as ImageIcon,
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
  Upload,
  LayoutGrid,
  List,
  Copy,
  Check,
  Calendar,
  Building,
  GraduationCap
} from 'lucide-react';

export const AdminGalleryPage = () => {
  const { currentLanguage, language } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // View Mode: 'grid' or 'table'
  const [viewMode, setViewMode] = useState('grid');

  // Preview Lightbox Modal
  const [lightboxImage, setLightboxImage] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Delete Confirmation Modal
  const [imageToDelete, setImageToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    category: 'academic',
    imageUrl: '/images/gallery/gallery 1.jpg',
    description: '',
    isActive: true,
    order: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/gallery-images?limit=100');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setImages(data);
    } catch (err) {
      console.error('Failed to fetch gallery images:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Category Theme Badges
  const getCategoryMeta = (cat = '') => {
    const lower = (cat || '').toLowerCase();
    if (lower === 'academic' || lower.includes('សិក្សា') || lower.includes('រោងជាង')) {
      return {
        label: isKhmer ? 'សកម្មភាពសិក្សា & រោងជាង' : 'Academic & Labs',
        bg: '#eff6ff',
        color: '#1e73be',
        border: '#dbeafe',
        icon: GraduationCap,
      };
    }
    if (lower === 'campus' || lower.includes('បរិវេណ') || lower.includes('ទិដ្ឋភាព')) {
      return {
        label: isKhmer ? 'បរិវេណវិទ្យាស្ថាន' : 'Campus Life',
        bg: '#f0fdf4',
        color: '#059669',
        border: '#bbf7d0',
        icon: Building,
      };
    }
    if (lower === 'events' || lower.includes('ព្រឹត្តិការណ៍')) {
      return {
        label: isKhmer ? 'ព្រឹត្តិការណ៍ & កម្មវិធី' : 'Events & Ceremonies',
        bg: '#fff7ed',
        color: '#ea580c',
        border: '#fed7aa',
        icon: Calendar,
      };
    }
    return {
      label: isKhmer ? 'ទូទៅ' : 'General',
      bg: '#faf5ff',
      color: '#7c3aed',
      border: '#e9d5ff',
      icon: ImageIcon,
    };
  };

  // KPI Calculations
  const totalPhotos = images.length;
  const activePhotos = images.filter((i) => i.isActive !== false).length;
  const academicPhotos = images.filter((i) => (i.category || '').toLowerCase() === 'academic').length;
  const campusEventPhotos = images.filter((i) => ['campus', 'events'].includes((i.category || '').toLowerCase())).length;

  // Filtered Images
  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      const matchSearch =
        searchTerm === '' ||
        img.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.category?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCat =
        selectedCategory === 'all' ||
        (img.category || '').toLowerCase() === selectedCategory.toLowerCase();

      return matchSearch && matchCat;
    });
  }, [images, searchTerm, selectedCategory]);

  const openAddModal = () => {
    setEditingImage(null);
    setFormData({
      title: '',
      category: 'academic',
      imageUrl: '/images/gallery/gallery 1.jpg',
      description: '',
      isActive: true,
      order: images.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (img) => {
    setEditingImage(img);
    setFormData({
      title: img.title || '',
      category: img.category || 'academic',
      imageUrl: img.imageUrl || '',
      description: img.description || '',
      isActive: img.isActive !== false,
      order: img.order || 0,
    });
    setModalOpen(true);
  };

  const openLightbox = (img) => {
    setLightboxImage(img);
    setCopiedUrl(false);
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const openDeleteModal = (img) => {
    setImageToDelete(img);
    setDeleteModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);
    data.append('subDir', 'gallery');
    setUploading(true);
    try {
      const res = await api.post('/admin/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const path = res.data.url || res.data.imageUrl || res.data.filePath;
      if (path) {
        setFormData((prev) => ({ ...prev, imageUrl: path }));
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
      alert(isKhmer ? 'ការបញ្ចូលរូបភាពបរាជ័យ។' : 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      alert(isKhmer ? 'សូមបញ្ចូលតំណភ្ជាប់រូបភាព ឬផ្ទុករូបភាពឡើង។' : 'Please provide or upload an image.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        imageUrl: formData.imageUrl,
        description: formData.description,
        isActive: Boolean(formData.isActive),
        order: Number(formData.order) || 0,
      };

      if (editingImage) {
        await api.put(`/admin/gallery-images/${editingImage.id}`, payload);
      } else {
        await api.post('/admin/gallery-images', payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save gallery image:', err);
      alert(isKhmer ? 'មិនអាចរក្សាទុករូបភាពបានទេ។' : 'Failed to save gallery image.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!imageToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/gallery-images/${imageToDelete.id}`);
      setDeleteModalOpen(false);
      setImageToDelete(null);
      fetchData();
    } catch (err) {
      console.error('Failed to delete image:', err);
      alert(isKhmer ? 'មិនអាចលុបរូបភាពបានទេ។' : 'Failed to delete image.');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: isKhmer ? 'រូបភាព & ចំណងជើង' : 'Photo & Title',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            className="admin-gallery-thumb-wrapper"
            style={{ cursor: 'pointer' }}
            onClick={() => openLightbox(row)}
            title={isKhmer ? 'ចុចដើម្បីមើលរូបភាពធំ' : 'Click to view full size'}
          >
            <img
              src={row.imageUrl}
              alt={row.title || ''}
              className="admin-gallery-thumb-img"
              onError={(e) => {
                e.target.src = '/images/gallery/school.jpg';
              }}
            />
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.92rem', color: '#07294D' }}>
              {row.title || (isKhmer ? 'រូបភាពគ្មានចំណងជើង' : 'Untitled Photo')}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '3px', maxWidth: '300px' }}>
              {row.description || (isKhmer ? 'គ្មានការពិពណ៌នា' : 'No description provided')}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: isKhmer ? 'អាល់ប៊ុម / ប្រភេទ' : 'Album Category',
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
      header: isKhmer ? 'ស្ថានភាព' : 'Status',
      render: (row) => {
        const isActive = row.isActive !== false;
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
            {isActive ? (isKhmer ? 'បង្ហាញ' : 'Active') : (isKhmer ? 'លាក់' : 'Hidden')}
          </span>
        );
      },
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
          #{row.order ?? 0}
        </span>
      ),
    },
    {
      header: isKhmer ? 'ប្រតិបត្តិការ' : 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
          <button
            onClick={() => openLightbox(row)}
            className="admin-btn admin-btn-outline admin-btn-sm"
            title={isKhmer ? 'មើលរូបភាពធំ' : 'View Full Image'}
            style={{ padding: '6px 9px', borderRadius: '8px', color: '#1e73be', borderColor: '#dbeafe', background: '#eff6ff' }}
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="admin-btn admin-btn-outline admin-btn-sm"
            title={isKhmer ? 'កែសម្រួល' : 'Edit Photo'}
            style={{ padding: '6px 9px', borderRadius: '8px' }}
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => openDeleteModal(row)}
            className="admin-btn admin-btn-danger admin-btn-sm"
            title={isKhmer ? 'លុប' : 'Delete Photo'}
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
            <ImageIcon size={14} />
            {isKhmer ? 'ការគ្រប់គ្រងវិចិត្រសាលរូបភាពស្ថាប័ន' : 'Institutional Photo Gallery & Media Vault'}
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
            {isKhmer ? 'វិចិត្រសាលរូបភាពស្ថាប័ន' : 'Campus Photo Gallery'}
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
            {isKhmer
              ? 'គ្រប់គ្រងរូបភាពសកម្មភាពសិក្សា សិក្ខាសាលា រោងជាងបច្ចេកវិទ្យា ពិធីប្រគល់សញ្ញាបត្រ និងទិដ្ឋភាពបរិវេណវិទ្យាស្ថាន'
              : 'Manage high-resolution institutional photos, laboratory workshops, campus life, and event showcases'}
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
            {isKhmer ? 'បង្ហោះរូបភាពថ្មី' : 'Add Photo'}
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
        {/* KPI 1: Total Photos */}
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
            <ImageIcon size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isKhmer ? 'រូបភាពសរុប' : 'Total Photos'}
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#07294D', marginTop: '2px' }}>
              {totalPhotos} <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e73be' }}>{isKhmer ? 'សន្លឹក' : 'Images'}</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Active Showcase */}
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
              {isKhmer ? 'ស្ថានភាពបង្ហាញ' : 'Active Showcase'}
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#07294D', marginTop: '2px' }}>
              {activePhotos} / {totalPhotos}{' '}
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#059669' }}>(100%)</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Academic & Labs */}
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
            <GraduationCap size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isKhmer ? 'អាល់ប៊ុមសិក្សា & រោងជាង' : 'Academic & Labs'}
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#07294D', marginTop: '2px' }}>
              {academicPhotos} <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#7c3aed' }}>{isKhmer ? 'សន្លឹក' : 'Photos'}</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Campus Life & Events */}
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
            <Building size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isKhmer ? 'ទិដ្ឋភាព & ព្រឹត្តិការណ៍' : 'Campus & Events'}
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#07294D', marginTop: '2px' }}>
              {campusEventPhotos} <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ea580c' }}>{isKhmer ? 'សន្លឹក' : 'Photos'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Category Filter Tabs & Live Search */}
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
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 700,
              border: '1px solid',
              borderColor: selectedCategory === 'all' ? '#1e73be' : '#e2e8f0',
              backgroundColor: selectedCategory === 'all' ? '#eff6ff' : '#ffffff',
              color: selectedCategory === 'all' ? '#1e73be' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {isKhmer ? 'ទាំងអស់' : 'All Photos'} ({totalPhotos})
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('academic')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 600,
              border: '1px solid',
              borderColor: selectedCategory === 'academic' ? '#1e73be' : '#e2e8f0',
              backgroundColor: selectedCategory === 'academic' ? '#eff6ff' : '#ffffff',
              color: selectedCategory === 'academic' ? '#1e73be' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {isKhmer ? 'សកម្មភាពសិក្សា & រោងជាង' : 'Academic & Labs'} ({academicPhotos})
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('campus')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 600,
              border: '1px solid',
              borderColor: selectedCategory === 'campus' ? '#1e73be' : '#e2e8f0',
              backgroundColor: selectedCategory === 'campus' ? '#eff6ff' : '#ffffff',
              color: selectedCategory === 'campus' ? '#1e73be' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {isKhmer ? 'បរិវេណវិទ្យាស្ថាន' : 'Campus Life'} ({images.filter((i) => i.category === 'campus').length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('events')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 600,
              border: '1px solid',
              borderColor: selectedCategory === 'events' ? '#1e73be' : '#e2e8f0',
              backgroundColor: selectedCategory === 'events' ? '#eff6ff' : '#ffffff',
              color: selectedCategory === 'events' ? '#1e73be' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {isKhmer ? 'ព្រឹត្តិការណ៍ & កម្មវិធី' : 'Events'} ({images.filter((i) => i.category === 'events').length})
          </button>
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
            placeholder={isKhmer ? 'ស្វែងរកចំណងជើង ឬការពិពណ៌នា...' : 'Search photos or album...'}
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

      {/* 4. Display Content: Grid Mode vs Table Mode */}
      {viewMode === 'grid' ? (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <RotateCw size={24} className="fa-spin" style={{ marginBottom: '10px' }} />
              <div>{isKhmer ? 'កំពុងផ្ទុករូបភាព...' : 'Loading gallery photos...'}</div>
            </div>
          ) : filteredImages.length > 0 ? (
            <div className="admin-gallery-grid">
              {filteredImages.map((img) => {
                const meta = getCategoryMeta(img.category);
                const IconComp = meta.icon;
                return (
                  <div key={img.id} className="admin-gallery-card">
                    <div className="admin-gallery-card-img-wrap">
                      <img
                        src={img.imageUrl}
                        alt={img.title || ''}
                        className="admin-gallery-card-img"
                        onError={(e) => {
                          e.target.src = '/images/gallery/school.jpg';
                        }}
                      />

                      {/* Category Badge Overlay */}
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

                      {/* Quick Preview Hover Overlay */}
                      <button
                        onClick={() => openLightbox(img)}
                        style={{
                          position: 'absolute',
                          bottom: '10px',
                          right: '10px',
                          background: 'rgba(7, 41, 77, 0.75)',
                          backdropFilter: 'blur(4px)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                        title={isKhmer ? 'មើលរូបភាពពេញលេញ' : 'View Full Image'}
                      >
                        <Eye size={15} />
                      </button>
                    </div>

                    <div className="admin-gallery-card-body">
                      <div>
                        <h4
                          style={{
                            margin: '0 0 6px 0',
                            fontSize: '0.96rem',
                            fontWeight: 800,
                            color: '#07294D',
                            lineHeight: 1.4,
                          }}
                        >
                          {img.title || (isKhmer ? 'រូបភាពគ្មានចំណងជើង' : 'Untitled Photo')}
                        </h4>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.8rem',
                            color: '#64748b',
                            lineHeight: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {img.description || (isKhmer ? 'គ្មានការពិពណ៌នា' : 'No description provided')}
                        </p>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: '14px',
                          paddingTop: '12px',
                          borderTop: '1px dashed #e2e8f0',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            color: '#94a3b8',
                          }}
                        >
                          #{img.order ?? 0} • {img.isActive !== false ? (isKhmer ? 'សកម្ម' : 'Active') : (isKhmer ? 'លាក់' : 'Hidden')}
                        </span>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => openEditModal(img)}
                            className="admin-btn admin-btn-outline admin-btn-sm"
                            title={isKhmer ? 'កែសម្រួល' : 'Edit Photo'}
                            style={{ padding: '5px 8px', borderRadius: '7px' }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(img)}
                            className="admin-btn admin-btn-danger admin-btn-sm"
                            title={isKhmer ? 'លុប' : 'Delete Photo'}
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
              <ImageIcon size={36} style={{ color: '#94a3b8', marginBottom: '10px' }} />
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#475569' }}>
                {isKhmer ? 'មិនមានរូបភាពត្រូវគ្នានឹងការស្វែងរកឡើយ' : 'No gallery photos found'}
              </div>
            </div>
          )}
        </div>
      ) : (
        <AdminDataTable
          columns={columns}
          data={filteredImages}
          loading={loading}
          title={isKhmer ? 'បញ្ជីរូបភាពវិចិត្រសាល' : 'Photo Gallery Directory'}
          subtitle={
            isKhmer
              ? `បង្ហាញ ${filteredImages.length} ក្នុងចំណោមរូបភាពសរុប ${totalPhotos}`
              : `Showing ${filteredImages.length} of ${totalPhotos} photos`
          }
        />
      )}

      {/* 5. Create / Edit Image Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingImage
            ? (isKhmer ? 'កែសម្រួលព័ត៌មានរូបភាព' : 'Edit Gallery Photo')
            : (isKhmer ? 'បង្ហោះរូបភាពថ្មីក្នុងវិចិត្រសាល' : 'Add New Gallery Photo')
        }
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        maxWidth="680px"
      >
        {/* Section 1: Image URL & Upload */}
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
            <Upload size={15} color="#1e73be" />
            {isKhmer ? 'ផ្នែកទី ១៖ រូបភាព & ឯកសារ' : 'Section 1: Image Source & Upload'}
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'តំណភ្ជាប់រូបភាព (Image URL) *' : 'Image URL *'}
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                className="admin-form-control"
                required
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="/images/gallery/gallery 1.jpg"
              />
              <label className="admin-btn admin-btn-outline" style={{ whiteSpace: 'nowrap', cursor: 'pointer' }}>
                <Upload size={14} />
                <span>{uploading ? (isKhmer ? 'កំពុងផ្ទុក...' : 'Uploading...') : (isKhmer ? 'ផ្ទុករូប' : 'Upload')}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          {/* Image Live Preview */}
          {formData.imageUrl && (
            <div
              style={{
                width: '100%',
                height: '180px',
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                marginTop: '10px',
              }}
            >
              <img
                src={formData.imageUrl}
                alt="Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = '/images/gallery/school.jpg';
                }}
              />
            </div>
          )}
        </div>

        {/* Section 2: Details & Album */}
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
            <Layers size={15} color="#7c3aed" />
            {isKhmer ? 'ផ្នែកទី ២៖ ព័ត៌មានលម្អិត & អាល់ប៊ុម' : 'Section 2: Details & Album Classification'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '14px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'ចំណងជើងរូបភាព' : 'Photo Title'}
              </label>
              <input
                type="text"
                className="admin-form-control"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Computer Science & Software Development Lab"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'អាល់ប៊ុម / ប្រភេទ' : 'Album Category'}
              </label>
              <select
                className="admin-form-control"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="academic">{isKhmer ? 'សកម្មភាពសិក្សា & រោងជាង (Academic)' : 'Academic & Labs'}</option>
                <option value="campus">{isKhmer ? 'បរិវេណវិទ្យាស្ថាន (Campus)' : 'Campus Life'}</option>
                <option value="events">{isKhmer ? 'ព្រឹត្តិការណ៍ & កម្មវិធី (Events)' : 'Events & Ceremonies'}</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'លំដាប់បង្ហាញ (Display Order)' : 'Display Order'}
              </label>
              <input
                type="number"
                className="admin-form-control"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '26px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#1e73be' }}
                />
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#07294D' }}>
                  {isKhmer ? 'បង្ហាញជាសាធារណៈ (Active)' : 'Display Publicly (Active)'}
                </span>
              </label>
            </div>
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
            <Sparkles size={15} color="#059669" />
            {isKhmer ? 'ផ្នែកទី ៣៖ សេចក្តីពិពណ៌នា / ចំណងជើងរង' : 'Section 3: Description & Caption'}
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'សេចក្តីពិពណ៌នា' : 'Description'}
            </label>
            <textarea
              className="admin-form-control"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={isKhmer ? 'ពិពណ៌នាអំពីសកម្មភាពក្នុងរូបភាព...' : 'Describe what this photo depicts...'}
            />
          </div>
        </div>
      </AdminModal>

      {/* 6. High-Definition Lightbox Modal */}
      {lightboxImage && (
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
          onClick={() => setLightboxImage(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '820px',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image Display */}
            <div style={{ position: 'relative', height: '420px', overflow: 'hidden', borderRadius: '24px 24px 0 0', background: '#0f172a' }}>
              <img
                src={lightboxImage.imageUrl}
                alt={lightboxImage.title || ''}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.src = '/images/gallery/school.jpg';
                }}
              />

              <button
                onClick={() => setLightboxImage(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(0, 0, 0, 0.5)',
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
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Metadata Body */}
            <div style={{ padding: '22px 26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <div>
                  {(() => {
                    const meta = getCategoryMeta(lightboxImage.category);
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
                          marginBottom: '6px',
                        }}
                      >
                        <IconComp size={12} />
                        {meta.label}
                      </span>
                    );
                  })()}
                  <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#07294D' }}>
                    {lightboxImage.title || (isKhmer ? 'រូបភាពគ្មានចំណងជើង' : 'Untitled Photo')}
                  </h3>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(lightboxImage.imageUrl)}
                    className="admin-btn admin-btn-outline admin-btn-sm"
                    style={{ borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                  >
                    {copiedUrl ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                    {copiedUrl ? (isKhmer ? 'បានចម្លង!' : 'Copied!') : (isKhmer ? 'ចម្លង URL' : 'Copy URL')}
                  </button>

                  <a
                    href={lightboxImage.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-btn admin-btn-outline admin-btn-sm"
                    style={{ borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}
                  >
                    <ExternalLink size={14} />
                    {isKhmer ? 'បើកមើលផ្ទាល់' : 'Open Direct'}
                  </a>
                </div>
              </div>

              {lightboxImage.description && (
                <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
                  {lightboxImage.description}
                </p>
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
                  <strong>{isKhmer ? 'ទីតាំងផ្ទុក' : 'File Path'}:</strong>{' '}
                  <span style={{ fontFamily: 'monospace' }}>{lightboxImage.imageUrl}</span>
                </div>
                <div>
                  <strong>{isKhmer ? 'លំដាប់' : 'Order'}:</strong> #{lightboxImage.order ?? 0}
                </div>
                <div>
                  <strong>{isKhmer ? 'ស្ថានភាព' : 'Status'}:</strong>{' '}
                  <span style={{ color: lightboxImage.isActive !== false ? '#059669' : '#94a3b8', fontWeight: 700 }}>
                    {lightboxImage.isActive !== false ? (isKhmer ? 'បង្ហាញ' : 'Active') : (isKhmer ? 'លាក់' : 'Hidden')}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div
              style={{
                padding: '14px 26px',
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
                onClick={() => setLightboxImage(null)}
                className="admin-btn admin-btn-outline"
                style={{ borderRadius: '10px', padding: '8px 18px', fontWeight: 600 }}
              >
                {isKhmer ? 'បិទផ្ទាំង' : 'Close'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const img = lightboxImage;
                  setLightboxImage(null);
                  openEditModal(img);
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
                {isKhmer ? 'កែសម្រួល' : 'Edit Photo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Delete Confirmation Modal */}
      {deleteModalOpen && imageToDelete && (
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
                    {isKhmer ? 'បញ្ជាក់ការលុបរូបភាព' : 'Delete Photo Confirmation'}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {isKhmer ? 'សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានទេ' : 'This action cannot be undone'}
                  </div>
                </div>
              </div>

              {/* Photo Thumbnail */}
              <div
                style={{
                  width: '100%',
                  height: '140px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  marginBottom: '14px',
                }}
              >
                <img
                  src={imageToDelete.imageUrl}
                  alt={imageToDelete.title || ''}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = '/images/gallery/school.jpg';
                  }}
                />
              </div>

              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                {isKhmer ? (
                  <>
                    តើអ្នកពិតជាចង់លុបរូបភាព <strong>"{imageToDelete.title || 'Untitled'}"</strong> នេះចេញពីវិចិត្រសាលមែនទេ?
                  </>
                ) : (
                  <>
                    Are you sure you want to delete photo <strong>"{imageToDelete.title || 'Untitled'}"</strong> from the gallery?
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
