import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import {
  Sliders,
  Play,
  Pause,
  Layers,
  CheckCircle2,
  PauseCircle,
  Sparkles,
  Eye,
  Edit2,
  Trash2,
  Plus,
  RotateCw,
  Search,
  X,
  Copy,
  Check,
  AlertTriangle,
  Megaphone,
  Hash,
  Clock,
  Calendar,
  Zap,
  ExternalLink,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

const QUICK_TAGS = [
  { label: '🎓 TVET', text: '🎓 #TVET ' },
  { label: '🔥 ថ្មីៗ [New]', text: '🔥 [ថ្មីៗ] ' },
  { label: '🌟 អាហារូបករណ៍ ១០០%', text: '🌟 អាហារូបករណ៍ ១០០% ' },
  { label: '✨ រៀនឥតគិតថ្លៃ', text: '✨ សិក្សាឥតគិតថ្លៃ ' },
  { label: '☎️ ទំនាក់ទំនង', text: '☎️ ទំនាក់ទំនង៖ 096 666 0306 ' },
  { label: '📍 ទីតាំង RPITSSR', text: '📍 ទីតាំងវិទ្យាស្ថាន៖ ខាងកើតផ្សារសាមគ្គី ៧០ម៉ែត្រ ' }
];

export const AdminBannersPage = () => {
  const { currentLanguage, language } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Filter & Sort State
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [sortBy, setSortBy] = useState('order'); // 'order', 'date'

  // Live Ticker Simulator Controls
  const [tickerPaused, setTickerPaused] = useState(false);
  const [tickerSpeed, setTickerSpeed] = useState(28); // seconds

  // Preview Lightbox Modal
  const [previewBanner, setPreviewBanner] = useState(null);
  const [copied, setCopied] = useState(false);

  // Delete Confirmation Modal
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    message: '',
    order_index: 0,
    is_active: true
  });

  // Fetch Banners
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/scrolling-banners');
      let data = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      }
      setBanners(data);
    } catch (err) {
      console.error('Error fetching scrolling banners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = banners.length;
    const active = banners.filter((b) => Boolean(b.is_active)).length;
    const inactive = total - active;
    const totalChars = banners.reduce((acc, b) => acc + (b.message ? b.message.length : 0), 0);
    const avgChars = total > 0 ? Math.round(totalChars / total) : 0;
    const activeChars = banners
      .filter((b) => Boolean(b.is_active))
      .reduce((acc, b) => acc + (b.message ? b.message.length : 0), 0);
    const avgDuration = Math.max(25, Math.ceil(0.15 * (activeChars || 150)));
    return { total, active, inactive, avgChars, avgDuration };
  }, [banners]);

  // Filtered & Sorted Banners (AdminDataTable handles multi-field search)
  const filteredBanners = useMemo(() => {
    return banners
      .filter((b) => {
        const matchesStatus =
          statusFilter === 'all'
            ? true
            : statusFilter === 'active'
            ? Boolean(b.is_active)
            : !Boolean(b.is_active);
        return matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'order') {
          return (a.order_index ?? 0) - (b.order_index ?? 0);
        }
        return new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0);
      });
  }, [banners, statusFilter, sortBy]);

  // Active Banners for Ticker Simulator
  const activeBannersForTicker = useMemo(() => {
    return banners
      .filter((b) => Boolean(b.is_active))
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  }, [banners]);

  // Toggle Active Status
  const handleToggleActive = async (banner) => {
    // Optimistic UI update
    const previousState = [...banners];
    setBanners((prev) =>
      prev.map((b) => (b.id === banner.id ? { ...b, is_active: !b.is_active } : b))
    );

    if (previewBanner && previewBanner.id === banner.id) {
      setPreviewBanner((prev) => ({ ...prev, is_active: !prev.is_active }));
    }

    try {
      const res = await api.post(`/admin/scrolling-banners/${banner.id}/toggle`);
      const updatedStatus = res.data?.data?.is_active;
      if (updatedStatus !== undefined) {
        setBanners((prev) =>
          prev.map((b) => (b.id === banner.id ? { ...b, is_active: updatedStatus } : b))
        );
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
      // Revert on error
      setBanners(previousState);
      alert(isKhmer ? 'មិនអាចផ្លាស់ប្តូរស្ថានភាពបានទេ!' : 'Failed to toggle banner status.');
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    setEditingBanner(null);
    setFormData({
      message: '',
      order_index: banners.length + 1,
      is_active: true
    });
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (b) => {
    setEditingBanner(b);
    setFormData({
      message: b.message || b.text || '',
      order_index: b.order_index ?? b.order ?? 0,
      is_active: Boolean(b.is_active)
    });
    setModalOpen(true);
  };

  // Insert Quick Tag into Form
  const handleInsertTag = (tagText) => {
    setFormData((prev) => ({
      ...prev,
      message: prev.message ? `${prev.message} ${tagText}` : tagText
    }));
  };

  // Submit Add / Edit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      alert(isKhmer ? 'សូមបញ្ចូលខ្លឹមសារសារបដា!' : 'Please enter banner message text!');
      return;
    }

    setSubmitting(true);
    try {
      if (editingBanner) {
        await api.put(`/admin/scrolling-banners/${editingBanner.id}`, formData);
      } else {
        await api.post('/admin/scrolling-banners', formData);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save banner:', err);
      alert(isKhmer ? 'បរាជ័យក្នុងការរក្សាទុកសារបដា!' : 'Failed to save banner announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Delete Modal
  const openDeleteModal = (b) => {
    setBannerToDelete(b);
    setDeleteModalOpen(true);
  };

  // Confirm Delete
  const confirmDelete = async () => {
    if (!bannerToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/scrolling-banners/${bannerToDelete.id}`);
      setDeleteModalOpen(false);
      setBannerToDelete(null);
      fetchData();
    } catch (err) {
      console.error('Failed to delete banner:', err);
      alert(isKhmer ? 'មិនអាចលុបសារបដានេះបានទេ!' : 'Failed to delete banner.');
    } finally {
      setDeleting(false);
    }
  };

  // Copy banner message to clipboard
  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format Date
  const formatDate = (dateString) => {
    if (!dateString) return isKhmer ? 'មិនមានទិន្នន័យ' : 'N/A';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(isKhmer ? 'km-KH' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Columns for AdminDataTable
  const columns = [
    {
      header: isKhmer ? 'លំដាប់' : 'Order',
      width: '90px',
      render: (row) => (
        <span className="admin-banner-order-badge" title={isKhmer ? 'លំដាប់លំដោយនៃការបង្ហាញ' : 'Display Order'}>
          #{row.order_index ?? 0}
        </span>
      )
    },
    {
      header: isKhmer ? 'ខ្លឹមសារសារបដាអក្សររត់ (Ticker Announcement)' : 'Announcement Message Text',
      render: (row) => {
        const text = row.message || row.text || '';
        const lines = text.split('\n').filter(Boolean);
        return (
          <div style={{ maxWidth: '650px' }}>
            <div
              style={{
                fontWeight: '600',
                color: '#07294D',
                lineHeight: 1.6,
                fontSize: '0.94rem',
                wordBreak: 'break-word',
                marginBottom: '6px'
              }}
            >
              {lines.length > 1 ? (
                <div>
                  <span style={{ color: '#07294D' }}>{lines[0]}</span>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '3px' }}>
                    {lines.slice(1).join(' • ')}
                  </div>
                </div>
              ) : (
                text
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="admin-banner-char-tag">
                <Hash size={11} /> {text.length} {isKhmer ? 'តួអក្សរ' : 'chars'}
              </span>
              {text.includes('#TVET') && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '1px 7px',
                    borderRadius: '4px',
                    background: '#eff6ff',
                    color: '#1e73be',
                    border: '1px solid #bfdbfe'
                  }}
                >
                  #TVET
                </span>
              )}
              {text.includes('អាហារូបករណ៍') && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '1px 7px',
                    borderRadius: '4px',
                    background: '#fefce8',
                    color: '#ca8a04',
                    border: '1px solid #fef08a'
                  }}
                >
                  {isKhmer ? 'អាហារូបករណ៍' : 'Scholarship'}
                </span>
              )}
              {text.includes('ឥតគិតថ្លៃ') && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '1px 7px',
                    borderRadius: '4px',
                    background: '#f0fdf4',
                    color: '#059669',
                    border: '1px solid #bbf7d0'
                  }}
                >
                  {isKhmer ? 'ឥតគិតថ្លៃ 100%' : '100% Free'}
                </span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      header: isKhmer ? 'ស្ថានភាពផ្សាយ' : 'Live Status',
      width: '150px',
      render: (row) => {
        const isActive = Boolean(row.is_active);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label className="admin-toggle-switch" title={isActive ? 'ផ្អាកការផ្សាយ' : 'បើកការផ្សាយ'}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => handleToggleActive(row)}
              />
              <span className="admin-toggle-slider"></span>
            </label>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: isActive ? '#059669' : '#64748b'
              }}
            >
              {isActive ? (
                <>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }}></span>
                  {isKhmer ? 'កំពុងរត់' : 'Active'}
                </>
              ) : (
                <>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#94a3b8' }}></span>
                  {isKhmer ? 'ផ្អាក' : 'Paused'}
                </>
              )}
            </span>
          </div>
        );
      }
    },
    {
      header: isKhmer ? 'កាលបរិច្ឆេទ' : 'Date Created',
      width: '130px',
      render: (row) => (
        <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#07294D', fontWeight: 600 }}>
            <Calendar size={12} style={{ color: '#1e73be' }} />
            {formatDate(row.createdAt || row.created_at)}
          </div>
        </div>
      )
    },
    {
      header: isKhmer ? 'សកម្មភាព' : 'Actions',
      align: 'right',
      width: '140px',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
          <button
            onClick={() => setPreviewBanner(row)}
            className="admin-btn admin-btn-outline admin-btn-sm"
            title={isKhmer ? 'មើលសារលម្អិត' : 'Preview Banner'}
            style={{ width: '32px', height: '32px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="admin-btn admin-btn-outline admin-btn-sm"
            title={isKhmer ? 'កែសម្រួល' : 'Edit Banner'}
            style={{ width: '32px', height: '32px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => openDeleteModal(row)}
            className="admin-btn admin-btn-danger admin-btn-sm"
            title={isKhmer ? 'លុបសារ' : 'Delete Banner'}
            style={{ width: '32px', height: '32px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  // Dedicated Mobile Card Renderer (< 768px)
  const renderMobileCard = (row) => {
    const text = row.message || row.text || '';
    const isActive = Boolean(row.is_active);
    return (
      <div key={row.id} className="admin-user-mobile-card">
        {/* Card Header: Order, Date & Live Status Toggle */}
        <div className="admin-user-mobile-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="admin-banner-order-badge" title={isKhmer ? 'លំដាប់លំដោយនៃការបង្ហាញ' : 'Display Order'}>
              #{row.order_index ?? 0}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={12} style={{ color: '#1e73be' }} />
              {formatDate(row.createdAt || row.created_at)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label className="admin-toggle-switch" title={isActive ? (isKhmer ? 'ផ្អាកការផ្សាយ' : 'Pause') : (isKhmer ? 'បើកការផ្សាយ' : 'Activate')}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => handleToggleActive(row)}
              />
              <span className="admin-toggle-slider"></span>
            </label>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: isActive ? '#059669' : '#64748b'
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isActive ? '#10b981' : '#94a3b8' }}></span>
              {isActive ? (isKhmer ? 'កំពុងរត់' : 'Active') : (isKhmer ? 'ផ្អាក' : 'Paused')}
            </span>
          </div>
        </div>

        {/* Card Body: Announcement Text & Quick Tags */}
        <div style={{ margin: '10px 0 8px 0' }}>
          <div
            style={{
              fontWeight: 600,
              color: '#07294D',
              lineHeight: 1.55,
              fontSize: '0.90rem',
              wordBreak: 'break-word',
              marginBottom: '8px'
            }}
          >
            <Megaphone size={14} style={{ color: '#ffaf00', display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
            <span>{text}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span className="admin-banner-char-tag">
              <Hash size={11} /> {text.length} {isKhmer ? 'តួអក្សរ' : 'chars'}
            </span>
            {text.includes('#TVET') && (
              <span style={{ fontSize: '0.70rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: '#eff6ff', color: '#1e73be', border: '1px solid #bfdbfe' }}>#TVET</span>
            )}
            {text.includes('អាហារូបករណ៍') && (
              <span style={{ fontSize: '0.70rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: '#fefce8', color: '#ca8a04', border: '1px solid #fef08a' }}>{isKhmer ? 'អាហារូបករណ៍' : 'Scholarship'}</span>
            )}
            {text.includes('ឥតគិតថ្លៃ') && (
              <span style={{ fontSize: '0.70rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' }}>{isKhmer ? 'ឥតគិតថ្លៃ 100%' : '100% Free'}</span>
            )}
          </div>
        </div>

        {/* Card Footer: 3 Tactile Action Buttons */}
        <div className="admin-user-card-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '12px' }}>
          <button
            type="button"
            onClick={() => setPreviewBanner(row)}
            className="admin-btn admin-btn-outline admin-btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.76rem', padding: '6px 8px' }}
          >
            <Eye size={13} />
            <span>{isKhmer ? 'មើល' : 'Preview'}</span>
          </button>
          <button
            type="button"
            onClick={() => openEditModal(row)}
            className="admin-btn admin-btn-outline admin-btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.76rem', padding: '6px 8px' }}
          >
            <Edit2 size={13} />
            <span>{isKhmer ? 'កែប្រែ' : 'Edit'}</span>
          </button>
          <button
            type="button"
            onClick={() => openDeleteModal(row)}
            className="admin-btn admin-btn-danger admin-btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.76rem', padding: '6px 8px' }}
          >
            <Trash2 size={13} />
            <span>{isKhmer ? 'លុប' : 'Delete'}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* 1. Header Banner & Trust Badge */}
      <div className="admin-page-header admin-banners-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '30px',
                backgroundColor: '#eff6ff',
                color: '#1e73be',
                fontSize: '0.82rem',
                fontWeight: '700',
                marginBottom: '10px',
                border: '1px solid #dbeafe'
              }}
            >
              <Sliders size={14} />
              {isKhmer
                ? 'ផ្ទាំងគ្រប់គ្រងប្រព័ន្ធបដាអក្សររត់ និងសេចក្តីជូនដំណឹងបន្ទាន់'
                : 'Institutional Scrolling Banner & Urgent Ticker Management'}
            </div>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#07294D',
                margin: '0 0 6px 0',
                letterSpacing: '-0.02em'
              }}
            >
              {isKhmer ? 'បដាអក្សររត់ & សេចក្តីប្រកាសបន្ទាន់ (Scrolling Banners)' : 'Scrolling Banner Announcements'}
            </h1>
            <p
              style={{
                color: '#64748b',
                fontSize: '0.94rem',
                margin: 0,
                maxWidth: '780px',
                lineHeight: 1.55
              }}
            >
              {isKhmer
                ? 'គ្រប់គ្រងសារអក្សររត់ប្រកាសបន្ទាន់ដែលរត់កាត់លើកំពូលគេហទំព័រ (Header Ticker) ជូនដំណឹងអំពីការចុះឈ្មោះចូលរៀន អាហារូបករណ៍ ១០០% TVET និងសេចក្តីប្រកាសបន្ទាន់របស់វិទ្យាស្ថាន។'
                : 'Manage urgent scrolling ticker announcements displayed across the institute website header to inform students and the public about admissions, TVET scholarships, and institutional alerts.'}
            </p>
          </div>

          <div className="admin-banners-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={fetchData}
              className="admin-btn admin-btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              title={isKhmer ? 'ផ្ទុកទិន្នន័យឡើងវិញ' : 'Refresh Data'}
            >
              <RotateCw size={15} className={loading ? 'fa-spin' : ''} />
              <span>{isKhmer ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}</span>
            </button>
            <button
              onClick={openAddModal}
              className="admin-btn admin-btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)',
                borderColor: '#1e73be',
                boxShadow: '0 4px 12px rgba(30, 115, 190, 0.25)'
              }}
            >
              <Plus size={16} />
              <span>{isKhmer ? 'បន្ថែមសារបដាថ្មី' : 'New Banner Announcement'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Live Ticker Simulation Banner (Institutional Daylight Ribbon) */}
      <div className="admin-ticker-preview-card">
        <div className="admin-ticker-preview-header">
          <div className="admin-ticker-live-indicator">
            <span className={`admin-ticker-pulse-dot ${tickerPaused ? 'paused' : ''}`}></span>
            <span>
              {isKhmer ? 'ទិដ្ឋភាពរត់ផ្សាយជាក់ស្តែងលើគេហទំព័រ (Live Website Ticker Simulation)' : 'Live Website Marquee Simulation'}
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#e2e8f0'
              }}
            >
              {activeBannersForTicker.length} {isKhmer ? 'សារសកម្ម' : 'active'}
            </span>
          </div>

          <div className="admin-ticker-controls">
            <button
              type="button"
              className="admin-ticker-btn-control"
              onClick={() => setTickerPaused(!tickerPaused)}
              title={tickerPaused ? (isKhmer ? 'បន្តការរត់' : 'Resume Ticker') : (isKhmer ? 'ផ្អាកការរត់' : 'Pause Ticker')}
            >
              {tickerPaused ? <Play size={12} /> : <Pause size={12} />}
              <span>{tickerPaused ? (isKhmer ? 'បន្តរត់' : 'Resume') : (isKhmer ? 'ផ្អាកបណ្តោះអាសន្ន' : 'Pause')}</span>
            </button>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              {[
                { label: isKhmer ? 'យឺត' : 'Slow', speed: 38 },
                { label: isKhmer ? 'ធម្មតា' : 'Normal', speed: 28 },
                { label: isKhmer ? 'លឿន' : 'Fast', speed: 18 }
              ].map((sp) => (
                <button
                  key={sp.speed}
                  type="button"
                  onClick={() => setTickerSpeed(sp.speed)}
                  style={{
                    background: tickerSpeed === sp.speed ? '#ffaf00' : 'rgba(255, 255, 255, 0.1)',
                    color: tickerSpeed === sp.speed ? '#07294D' : '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="admin-ticker-track-container">
          {activeBannersForTicker.length > 0 ? (
            <div
              className={`admin-ticker-track-content ${tickerPaused ? 'paused' : ''}`}
              style={{ animationDuration: `${tickerSpeed}s` }}
            >
              {/* Double loop for seamless infinite marquee */}
              {[...activeBannersForTicker, ...activeBannersForTicker].map((b, idx) => (
                <span key={`${b.id}-${idx}`} className="admin-ticker-item">
                  <Megaphone size={14} style={{ color: '#ffaf00' }} />
                  <span>{b.message.replace(/[\r\n]+/g, ' • ').trim()}</span>
                  <span className="admin-ticker-separator">✦</span>
                </span>
              ))}
            </div>
          ) : (
            <div style={{ padding: '4px 16px', color: '#cbd5e1', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={15} style={{ color: '#f59e0b' }} />
              {isKhmer
                ? 'បច្ចុប្បន្នមិនទាន់មានសារបដាណាមួយត្រូវបានបើកដំណើរការ (Active) នៅឡើយទេ! សូមចុចបើក (ON) ក្នុងតារាងខាងក្រោមដើម្បីបង្ហាញលើគេហទំព័រ។'
                : 'No active banners found! Enable at least one banner switch below to broadcast on the live website.'}
            </div>
          )}
        </div>
      </div>

      {/* 3. 4-Card Institutional KPI Metric Strip */}
      <div className="admin-kpi-grid admin-banners-kpis">
        {/* Metric 1: Total */}
        <div
          className="admin-kpi-card"
          onClick={() => setStatusFilter('all')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">{isKhmer ? 'សារបដាសរុប' : 'Total Banners'}</span>
              <div className="admin-kpi-value">{metrics.total}</div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#1e73be' }} />
                <span>{isKhmer ? 'សារប្រកាសក្នុងប្រព័ន្ធ' : 'Registered announcements'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#eff6ff', color: '#1e73be' }}>
                {isKhmer ? 'សារ' : 'Banners'}
              </span>
              <div className="admin-kpi-icon-badge" style={{ background: '#eff6ff', color: '#1e73be', border: '1px solid #dbeafe' }}>
                <Layers size={22} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'មើលសារបដាទាំងអស់' : 'View all banners'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* Metric 2: Active */}
        <div
          className="admin-kpi-card"
          onClick={() => setStatusFilter('active')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">{isKhmer ? 'កំពុងរត់ផ្សាយ' : 'Live Active'}</span>
              <div className="admin-kpi-value" style={{ color: '#059669' }}>{metrics.active}</div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#059669' }} />
                <span>{isKhmer ? 'បង្ហាញលើគេហទំព័រភ្លាមៗ' : 'Broadcasting on header'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#f0fdf4', color: '#059669' }}>
                {isKhmer ? 'ផ្សាយ' : 'Live'}
              </span>
              <div className="admin-kpi-icon-badge" style={{ background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' }}>
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'ចម្រោះសារកំពុងផ្សាយ' : 'Filter active banners'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* Metric 3: Inactive */}
        <div
          className="admin-kpi-card"
          onClick={() => setStatusFilter('inactive')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">{isKhmer ? 'ផ្អាកបណ្តោះអាសន្ន' : 'Archived / Paused'}</span>
              <div className="admin-kpi-value" style={{ color: '#ea580c' }}>{metrics.inactive}</div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#ea580c' }} />
                <span>{isKhmer ? 'មិនទាន់បង្ហាញជាសាធារណៈ' : 'Hidden from public'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#fff7ed', color: '#ea580c' }}>
                {isKhmer ? 'ផ្អាក' : 'Paused'}
              </span>
              <div className="admin-kpi-icon-badge" style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa' }}>
                <PauseCircle size={22} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'ចម្រោះសារផ្អាក' : 'Filter paused banners'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* Metric 4: Speed & Chars */}
        <div
          className="admin-kpi-card"
          onClick={() => setStatusFilter('all')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">{isKhmer ? 'ប្រវែងមធ្យម & រយៈពេល' : 'Avg Length & Cycle'}</span>
              <div className="admin-kpi-value" style={{ color: '#7c3aed' }}>~{metrics.avgDuration}s</div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#7c3aed' }} />
                <span>{metrics.avgChars} {isKhmer ? 'តួអក្សរក្នុងមួយសារ' : 'chars/message avg'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#faf5ff', color: '#7c3aed' }}>
                {isKhmer ? 'ល្បឿន' : 'Speed'}
              </span>
              <div className="admin-kpi-icon-badge" style={{ background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}>
                <Sparkles size={22} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'ស្ថិតិប្រវែងសារ' : 'Length analytics'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>
      </div>

      {/* 4. Status Filter Bar (Sleek Horizontal Scroll Pills) */}
      <div className="admin-user-filter-bar">
        {[
          { id: 'all', labelKm: 'ទាំងអស់', labelEn: 'All Banners', count: metrics.total },
          { id: 'active', labelKm: '🟢 កំពុងផ្សាយ', labelEn: '🟢 Active Live', count: metrics.active },
          { id: 'inactive', labelKm: '⚪ ផ្អាកទុក', labelEn: '⚪ Paused', count: metrics.inactive }
        ].map((tab) => {
          const isSelected = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`admin-user-filter-pill ${isSelected ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab.id)}
            >
              <span>{isKhmer ? tab.labelKm : tab.labelEn}</span>
              <span className="admin-user-filter-count">{tab.count}</span>
            </button>
          );
        })}
      </div>

      {/* 5. Main DataTable & Mobile Cards View */}
      <AdminDataTable
        columns={columns}
        data={filteredBanners}
        loading={loading}
        title={isKhmer ? 'បញ្ជីសារបដាអក្សររត់ក្នុងប្រព័ន្ធ' : 'Scrolling Banners Directory'}
        subtitle={
          isKhmer
            ? `បង្ហាញ ${filteredBanners.length} ក្នុងចំណោមសារសរុប ${banners.length}`
            : `Showing ${filteredBanners.length} of ${banners.length} announcements`
        }
        onAdd={openAddModal}
        addLabel={isKhmer ? 'បន្ថែមសារបដាថ្មី' : 'New Banner Announcement'}
        onRefresh={fetchData}
        searchPlaceholder={isKhmer ? 'ស្វែងរកតាមខ្លឹមសារសារបដា...' : 'Search announcement text...'}
        renderMobileCard={renderMobileCard}
        customHeaderActions={
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '0.82rem',
              background: '#ffffff',
              color: '#07294D',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="order">{isKhmer ? 'តម្រៀប ៖ លំដាប់' : 'Sort: Display Order'}</option>
            <option value="date">{isKhmer ? 'តម្រៀប ៖ កាលបរិច្ឆេទ' : 'Sort: Date Created'}</option>
          </select>
        }
      />

      {/* 6. Preview Lightbox Modal */}
      {previewBanner && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1050,
            backgroundColor: 'rgba(7, 41, 77, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setPreviewBanner(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '680px',
              width: '100%',
              border: '1px solid #e2e8f0',
              boxShadow: '0 25px 50px -12px rgba(7, 41, 77, 0.25)',
              overflow: 'hidden',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              animation: 'fadeInUpModal 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                background: 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Megaphone size={18} style={{ color: '#ffaf00' }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                    {isKhmer ? 'ព័ត៌មានលម្អិតនៃសារបដាអក្សររត់' : 'Scrolling Banner Details'}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                    {isKhmer ? 'លំដាប់បង្ហាញ' : 'Order'}: #{previewBanner.order_index ?? 0} • ID: {previewBanner.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewBanner(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {/* Isolated Simulated Ticker */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>
                  {isKhmer ? 'ទិដ្ឋភាពបង្ហាញលើ Header Ticker' : 'Header Ticker Live Appearance'}
                </label>
                <div
                  style={{
                    background: '#07294D',
                    borderRadius: '10px',
                    padding: '12px 18px',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.15)'
                  }}
                >
                  <Megaphone size={15} style={{ color: '#ffaf00', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.92rem', color: '#f8fafc', fontWeight: 500 }}>
                    {previewBanner.message.replace(/[\r\n]+/g, ' • ').trim()}
                  </span>
                </div>
              </div>

              {/* Full Original Text Card */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                    {isKhmer ? 'ខ្លឹមសារដើមទាំងស្រុង' : 'Full Original Message'}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopyMessage(previewBanner.message)}
                    className="admin-btn admin-btn-outline admin-btn-sm"
                    style={{ fontSize: '0.75rem', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copied ? <Check size={12} style={{ color: '#059669' }} /> : <Copy size={12} />}
                    <span>{copied ? (isKhmer ? 'បានចម្លង!' : 'Copied!') : (isKhmer ? 'ចម្លងអត្ថបទ' : 'Copy')}</span>
                  </button>
                </div>
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.65,
                    fontSize: '0.94rem',
                    color: '#07294D',
                    fontFamily: "'Kantumruy Pro', 'Inter', sans-serif"
                  }}
                >
                  {previewBanner.message}
                </div>
              </div>

              {/* Metadata Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '12px',
                  background: '#f1f5f9',
                  borderRadius: '12px',
                  padding: '14px 16px'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                    {isKhmer ? 'ស្ថានភាពផ្សាយ' : 'Status'}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: previewBanner.is_active ? '#059669' : '#64748b', marginTop: '2px' }}>
                    {previewBanner.is_active ? (isKhmer ? '🟢 កំពុងផ្សាយ' : '🟢 Live') : (isKhmer ? '⚪ ផ្អាក' : '⚪ Paused')}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                    {isKhmer ? 'លំដាប់លំដោយ' : 'Order Index'}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#07294D', marginTop: '2px' }}>
                    #{previewBanner.order_index ?? 0}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                    {isKhmer ? 'ចំនួនតួអក្សរ' : 'Length'}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#07294D', marginTop: '2px' }}>
                    {previewBanner.message?.length || 0} {isKhmer ? 'តួ' : 'chars'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                    {isKhmer ? 'កាលបរិច្ឆេទបង្កើត' : 'Created Date'}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#07294D', marginTop: '2px' }}>
                    {formatDate(previewBanner.createdAt || previewBanner.created_at)}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0
              }}
            >
              <button
                type="button"
                onClick={() => handleToggleActive(previewBanner)}
                className="admin-btn admin-btn-outline"
                style={{ fontSize: '0.82rem' }}
              >
                {previewBanner.is_active
                  ? (isKhmer ? '⏸️ ផ្អាកការផ្សាយ' : '⏸️ Pause Banner')
                  : (isKhmer ? '▶️ បើកការផ្សាយ' : '▶️ Activate Banner')}
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const b = previewBanner;
                    setPreviewBanner(null);
                    openEditModal(b);
                  }}
                  className="admin-btn admin-btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Edit2 size={14} />
                  <span>{isKhmer ? 'កែសម្រួលសារ' : 'Edit Banner'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBanner(null)}
                  className="admin-btn admin-btn-outline"
                >
                  {isKhmer ? 'បិទ' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Add / Edit Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBanner ? (isKhmer ? 'កែសម្រួលសារបដាអក្សររត់' : 'Edit Scrolling Banner') : (isKhmer ? 'បន្ថែមសារបដាអក្សររត់ថ្មី' : 'New Scrolling Banner Announcement')}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
      >
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="admin-form-label" style={{ margin: 0 }}>
              {isKhmer ? 'ខ្លឹមសារសារប្រកាសអក្សររត់ *' : 'Banner Announcement Message *'}
            </label>
            <span
              style={{
                fontSize: '0.75rem',
                color: formData.message.length > 300 ? '#ea580c' : '#64748b',
                fontWeight: 600
              }}
            >
              {formData.message.length} {isKhmer ? 'តួអក្សរ' : 'characters'}
            </span>
          </div>
          <textarea
            className="admin-form-control"
            rows={4}
            required
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder={
              isKhmer
                ? 'ឧទាហរណ៍៖ វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប បានចាប់ផ្ដើមទទួលពាក្យចូលរៀនវគ្គថ្មី សិក្សាឥតគិតថ្លៃ ១.៥លាននាក់...'
                : 'e.g. Regional Polytechnic Institute Techo Sen Siem Reap announces new 100% free TVET scholarship admissions...'
            }
            style={{ fontSize: '0.92rem', lineHeight: 1.6 }}
          />

          {/* Quick Insert Tags */}
          <div style={{ marginTop: '8px' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>
              {isKhmer ? 'ចុចបន្ថែមស្លាករហ័ស (Quick Tags):' : 'Click to insert quick tags:'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {QUICK_TAGS.map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="admin-quick-tag-chip"
                  onClick={() => handleInsertTag(tag.text)}
                >
                  <Plus size={11} /> {tag.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Preview Inside Modal */}
        {formData.message.trim() && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#07294D', marginBottom: '6px', display: 'block' }}>
              {isKhmer ? 'ទិដ្ឋភាពផ្សាយបឋម (Live Preview on Ticker)' : 'Live Ticker Preview'}
            </label>
            <div
              style={{
                background: '#07294D',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#ffffff',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              <Megaphone size={14} style={{ color: '#ffaf00', flexShrink: 0 }} />
              <span style={{ color: '#f8fafc' }}>
                {formData.message.replace(/[\r\n]+/g, ' • ').trim()}
              </span>
            </div>
          </div>
        )}

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'លំដាប់នៃការបង្ហាញ (Order)' : 'Display Order'}
              </label>
              <input
                type="number"
                className="admin-form-control"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                min={0}
              />
              <small style={{ color: '#94a3b8', fontSize: '0.74rem' }}>
                {isKhmer ? 'លេខកាន់តែតូច នឹងរត់បង្ហាញមុនគេ' : 'Lower number displays first'}
              </small>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'ស្ថានភាពនៃការផ្សាយ' : 'Publishing Status'}
              </label>
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <label className="admin-toggle-switch" style={{ margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <span className="admin-toggle-slider"></span>
                </label>
                <span style={{ fontSize: '0.86rem', fontWeight: 600, color: formData.is_active ? '#059669' : '#64748b' }}>
                  {formData.is_active
                    ? (isKhmer ? '🟢 បើកផ្សាយភ្លាមៗ' : '🟢 Active & Live')
                    : (isKhmer ? '⚪ ផ្អាកការផ្សាយ' : '⚪ Paused (Draft)')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </AdminModal>

      {/* 8. Institutional Delete Confirmation Modal */}
      {deleteModalOpen && bannerToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            backgroundColor: 'rgba(7, 41, 77, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => !deleting && setDeleteModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              border: '1px solid #e2e8f0',
              boxShadow: '0 25px 50px -12px rgba(7, 41, 77, 0.25)',
              padding: '26px',
              textAlign: 'center',
              animation: 'fadeInUpModal 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}
            >
              <Trash2 size={26} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#07294D', margin: '0 0 8px 0' }}>
              {isKhmer ? 'តើអ្នកប្រាកដជាចង់លុបសារបដានេះ?' : 'Delete Scrolling Banner?'}
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              {isKhmer
                ? 'សារបដាអក្សររត់នេះនឹងត្រូវលុបចេញពីប្រព័ន្ធជាអចិន្ត្រៃយ៍ ហើយឈប់បង្ហាញលើគេហទំព័រ។'
                : 'This scrolling banner announcement will be permanently removed from the system and website.'}
            </p>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '12px 14px',
                textAlign: 'left',
                fontSize: '0.85rem',
                color: '#07294D',
                marginBottom: '20px',
                maxHeight: '90px',
                overflowY: 'auto'
              }}
            >
              <strong>{isKhmer ? 'ខ្លឹមសារ៖' : 'Message:'}</strong>{' '}
              {bannerToDelete.message?.slice(0, 140)}
              {(bannerToDelete.message?.length || 0) > 140 ? '...' : ''}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteModalOpen(false)}
                className="admin-btn admin-btn-outline"
                style={{ minWidth: '110px' }}
              >
                {isKhmer ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="admin-btn admin-btn-danger"
                style={{ minWidth: '130px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                {deleting ? (
                  <>
                    <RotateCw size={14} className="fa-spin" />
                    <span>{isKhmer ? 'កំពុងលុប...' : 'Deleting...'}</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>{isKhmer ? 'យល់ព្រមលុប' : 'Yes, Delete'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
