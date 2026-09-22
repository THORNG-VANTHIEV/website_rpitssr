import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import {
  Megaphone,
  Sparkles,
  CheckCircle2,
  PauseCircle,
  Eye,
  Edit2,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  Sliders,
  Calendar,
  Clock,
  ArrowRight,
  ExternalLink,
  Star,
  Upload,
  X,
  AlertTriangle,
  Copy,
  Check,
  Image as ImageIcon,
  Monitor,
  Layout,
  Bell,
  Flag,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const AdminPromotionsPage = () => {
  const { language, currentLanguage } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  // State
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // Filters & Search
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'active', 'inactive', 'popup', 'banner', 'notification'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('priority_desc'); // 'priority_desc', 'newest', 'title_asc'

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewPromo, setPreviewPromo] = useState(null);
  const [deletePromo, setDeletePromo] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Simulation interactive state
  const [simSelectedId, setSimSelectedId] = useState(null);
  const [simMode, setSimMode] = useState(null); // 'popup', 'banner', 'notification'

  // Form Data
  const initialFormState = {
    title: '',
    type: 'popup',
    message: '',
    description: '',
    image_url: '',
    background_image: '',
    background_color: '#07294D',
    button_text: isKhmer ? 'ចុះឈ្មោះឥឡូវនេះ' : 'Register Now',
    button_link: '/register',
    position: 'center',
    delay: 2000,
    show_once: false,
    is_active: true,
    priority: 10,
    start_date: '',
    end_date: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  // Fetch promotions
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/promotions');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setPromotions(data);
    } catch (err) {
      console.error('Error fetching promotions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Toggle Active Status
  const handleToggleActive = async (promo, e) => {
    if (e) e.stopPropagation();
    const targetId = promo.id;
    const newStatus = !promo.is_active;

    // Optimistic UI Update
    setTogglingId(targetId);
    setPromotions((prev) =>
      prev.map((item) => (item.id === targetId ? { ...item, is_active: newStatus } : item))
    );
    if (previewPromo && previewPromo.id === targetId) {
      setPreviewPromo((prev) => ({ ...prev, is_active: newStatus }));
    }

    try {
      await api.post(`/admin/promotions/${targetId}/toggle`);
    } catch (err) {
      console.error('Failed to toggle promotion status:', err);
      // Revert optimistic update
      setPromotions((prev) =>
        prev.map((item) => (item.id === targetId ? { ...item, is_active: !newStatus } : item))
      );
      if (previewPromo && previewPromo.id === targetId) {
        setPreviewPromo((prev) => ({ ...prev, is_active: !newStatus }));
      }
    } finally {
      setTogglingId(null);
    }
  };

  // Open Create Modal
  const openAddModal = () => {
    setEditingPromo(null);
    setFormData({
      ...initialFormState,
      title: isKhmer ? 'អាហារូបករណ៍ ១០០% ជំនាញវិជ្ជាជីវៈ និងបច្ចេកទេស TVET' : '100% Scholarship TVET Technical Training',
      message: isKhmer
        ? 'ឱកាសពិសេសសម្រាប់យុវជន! សិក្សាឥតគិតថ្លៃ ១០០% និងទទួលបានប្រាក់ឧបត្ថម្ភប្រចាំខែ ២៨០,០០០ រៀល។'
        : 'Special opportunity for youth! 100% Free Tuition plus 280,000 KHR monthly allowance.',
      button_text: isKhmer ? 'ចុះឈ្មោះឥឡូវនេះ' : 'Register Now',
      button_link: '/register',
      priority: 10,
      type: 'popup',
      background_color: '#07294D'
    });
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (p) => {
    setEditingPromo(p);
    setFormData({
      title: p.title || '',
      type: p.type || 'popup',
      message: p.message || '',
      description: p.description || '',
      image_url: p.image_url || '',
      background_image: p.background_image || '',
      background_color: p.background_color || '#07294D',
      button_text: p.button_text || '',
      button_link: p.button_link || '',
      position: p.position || 'center',
      delay: p.delay !== undefined ? p.delay : 2000,
      show_once: Boolean(p.show_once),
      is_active: Boolean(p.is_active),
      priority: p.priority !== undefined ? p.priority : 0,
      start_date: p.start_date ? p.start_date.substring(0, 16) : '',
      end_date: p.end_date ? p.end_date.substring(0, 16) : ''
    });
    setModalOpen(true);
  };

  // Handle Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);
    data.append('folder', 'promotions');

    setUploadingImage(true);
    try {
      const res = await api.post('/admin/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const uploadedUrl = res.data?.url || res.data?.path || res.data?.file_url;
      if (uploadedUrl) {
        setFormData((prev) => ({ ...prev, image_url: uploadedUrl }));
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      alert(isKhmer ? 'បរាជ័យក្នុងការបញ្ចូលរូបភាព សូមព្យាយាមម្តងទៀត' : 'Image upload failed. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        delay: parseInt(formData.delay, 10) || 0,
        priority: parseInt(formData.priority, 10) || 0,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null
      };

      if (editingPromo) {
        await api.put(`/admin/promotions/${editingPromo.id}`, payload);
      } else {
        await api.post('/admin/promotions', payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error saving promotion:', err);
      alert(isKhmer ? 'បរាជ័យក្នុងការរក្សាទុកទិន្នន័យ' : 'Failed to save promotion campaign.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Promotion
  const confirmDelete = async () => {
    if (!deletePromo) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/promotions/${deletePromo.id}`);
      setDeletePromo(null);
      fetchData();
    } catch (err) {
      console.error('Failed to delete promotion:', err);
      alert(isKhmer ? 'បរាជ័យក្នុងការលុបយុទ្ធនាការ' : 'Failed to delete promotion.');
    } finally {
      setDeleting(false);
    }
  };

  // Copy to clipboard
  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // KPI Calculations
  const totalCampaigns = promotions.length;
  const activeCampaigns = promotions.filter((p) => p.is_active).length;
  const draftCampaigns = totalCampaigns - activeCampaigns;
  const highPriorityCampaigns = promotions.filter((p) => (p.priority || 0) >= 8).length;

  // Active or Selected Simulation Campaign
  const simulatedCampaign = useMemo(() => {
    if (simSelectedId) {
      const found = promotions.find((p) => p.id === simSelectedId);
      if (found) return found;
    }
    // Default to the first active campaign, or first campaign
    return promotions.find((p) => p.is_active) || promotions[0] || null;
  }, [promotions, simSelectedId]);

  const currentSimMode = simMode || simulatedCampaign?.type || 'popup';

  // Filtering & Sorting
  const filteredPromotions = useMemo(() => {
    return promotions
      .filter((promo) => {
        // Tab Filter
        if (activeTab === 'active' && !promo.is_active) return false;
        if (activeTab === 'inactive' && promo.is_active) return false;
        if (activeTab === 'popup' && promo.type !== 'popup') return false;
        if (activeTab === 'banner' && promo.type !== 'banner') return false;
        if (activeTab === 'notification' && promo.type !== 'notification') return false;

        // Search Query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchTitle = (promo.title || '').toLowerCase().includes(query);
          const matchMsg = (promo.message || '').toLowerCase().includes(query);
          const matchDesc = (promo.description || '').toLowerCase().includes(query);
          const matchBtn = (promo.button_text || '').toLowerCase().includes(query);
          if (!matchTitle && !matchMsg && !matchDesc && !matchBtn) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority_desc') {
          return (b.priority || 0) - (a.priority || 0);
        }
        if (sortBy === 'newest') {
          return (b.id || 0) - (a.id || 0);
        }
        if (sortBy === 'title_asc') {
          return (a.title || '').localeCompare(b.title || '');
        }
        return 0;
      });
  }, [promotions, activeTab, searchQuery, sortBy]);

  // Type badge helper
  const getTypeBadge = (type) => {
    switch (type) {
      case 'banner':
        return (
          <span className="admin-broadcast-type-badge admin-broadcast-type-banner">
            <Flag size={12} />
            <span>{isKhmer ? 'បដាផ្សាយ (Banner)' : 'Banner Bar'}</span>
          </span>
        );
      case 'notification':
        return (
          <span className="admin-broadcast-type-badge admin-broadcast-type-notification">
            <Bell size={12} />
            <span>{isKhmer ? 'សារបន្ទាន់ (Toast)' : 'Alert Toast'}</span>
          </span>
        );
      case 'popup':
      default:
        return (
          <span className="admin-broadcast-type-badge admin-broadcast-type-popup">
            <Layout size={12} />
            <span>{isKhmer ? 'ផ្ទាំងលោត (Modal Popup)' : 'Popup Modal'}</span>
          </span>
        );
    }
  };

  // Color preset options for form
  const colorPresets = [
    { label: 'Deep Royal Navy', value: '#07294D' },
    { label: 'Cambodia Royal Blue', value: '#1e73be' },
    { label: 'Techo Forest Green', value: '#059669' },
    { label: 'Warm Amber Gold', value: '#d97706' },
    { label: 'Imperial Crimson', value: '#991b1b' },
    { label: 'Slate Dark', value: '#1e293b' }
  ];

  // Table Columns Definition
  const columns = [
    {
      header: isKhmer ? 'យុទ្ធនាការផ្សព្វផ្សាយ' : 'Campaign & Message',
      render: (row) => (
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          {/* Thumbnail / Visual Icon */}
          <div
            style={{
              width: '64px',
              height: '52px',
              borderRadius: '10px',
              overflow: 'hidden',
              backgroundColor: row.background_color || '#07294D',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 6px rgba(7, 41, 77, 0.08)',
              position: 'relative'
            }}
          >
            {row.image_url ? (
              <img
                src={row.image_url}
                alt={row.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <Megaphone size={22} color="#ffffff" style={{ opacity: 0.9 }} />
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '0.94rem',
                  color: '#07294D',
                  lineHeight: 1.4
                }}
              >
                {row.title}
              </span>
            </div>

            {row.message && (
              <p
                style={{
                  margin: '0 0 6px',
                  fontSize: '0.82rem',
                  color: '#64748b',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {row.message}
              </p>
            )}

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="admin-broadcast-priority-pill" title={isKhmer ? 'កម្រិតអាទិភាព' : 'Priority'}>
                <Star size={11} fill="#ca8a04" />
                <span>{row.priority || 0}</span>
              </span>
              {row.show_once && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '2px 7px',
                    borderRadius: '4px',
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  {isKhmer ? 'បង្ហាញម្តង' : 'Once/session'}
                </span>
              )}
              {row.delay > 0 && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: '#94a3b8',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <Clock size={11} /> {Math.round(row.delay / 1000)}s
                </span>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      header: isKhmer ? 'ប្រភេទផ្សាយ' : 'Display Type',
      width: '160px',
      render: (row) => getTypeBadge(row.type)
    },
    {
      header: isKhmer ? 'ប៊ូតុងសកម្មភាព (CTA)' : 'Action Button',
      width: '190px',
      render: (row) =>
        row.button_text ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#07294D',
                background: '#f8fafc',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                maxWidth: '170px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              <span>{row.button_text}</span>
              <ArrowRight size={12} color="#1e73be" />
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                color: '#94a3b8',
                fontFamily: 'monospace',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '165px'
              }}
            >
              {row.button_link}
            </span>
          </div>
        ) : (
          <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>--</span>
        )
    },
    {
      header: isKhmer ? 'ស្ថានភាព' : 'Status',
      width: '140px',
      render: (row) => {
        const isToggling = togglingId === row.id;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label
              className="admin-switch"
              style={{
                position: 'relative',
                display: 'inline-block',
                width: '38px',
                height: '22px',
                margin: 0,
                cursor: isToggling ? 'wait' : 'pointer'
              }}
              title={isKhmer ? 'ចុចដើម្បីបិទ/បើកការផ្សាយ' : 'Click to toggle status'}
            >
              <input
                type="checkbox"
                checked={Boolean(row.is_active)}
                disabled={isToggling}
                onChange={(e) => handleToggleActive(row, e)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: 'absolute',
                  cursor: isToggling ? 'wait' : 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: row.is_active ? '#059669' : '#cbd5e1',
                  transition: '0.2s',
                  borderRadius: '22px'
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    content: '""',
                    height: '16px',
                    width: '16px',
                    left: row.is_active ? '19px' : '3px',
                    bottom: '3px',
                    backgroundColor: '#ffffff',
                    transition: '0.2s',
                    borderRadius: '50%',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}
                />
              </span>
            </label>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: row.is_active ? '#059669' : '#94a3b8'
              }}
            >
              {row.is_active ? (isKhmer ? 'កំពុងផ្សាយ' : 'Active') : (isKhmer ? 'ផ្អាកទុក' : 'Draft')}
            </span>
          </div>
        );
      }
    },
    {
      header: isKhmer ? 'សកម្មភាព' : 'Actions',
      width: '130px',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setPreviewPromo(row)}
            className="admin-action-btn"
            title={isKhmer ? 'មើលការបង្ហាញជាក់ស្តែង' : 'Preview Live Appearance'}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#1e73be',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Eye size={15} />
          </button>
          <button
            type="button"
            onClick={() => openEditModal(row)}
            className="admin-action-btn"
            title={isKhmer ? 'កែសម្រួលយុទ្ធនាការ' : 'Edit Campaign'}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#07294D',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            onClick={() => setDeletePromo(row)}
            className="admin-action-btn"
            title={isKhmer ? 'លុបយុទ្ធនាការ' : 'Delete Campaign'}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #fee2e2',
              background: '#ffffff',
              color: '#ef4444',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  // Mobile Card Renderer (< 768px viewports)
  const renderMobileCard = (row) => {
    const isToggling = togglingId === row.id;

    return (
      <div className="admin-user-mobile-card">
        {/* Top: Type Badge, Priority Pill & Active Status */}
        <div className="admin-user-mobile-card-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {getTypeBadge(row.type)}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                background: '#fefce8',
                color: '#ca8a04',
                border: '1px solid #fef08a'
              }}
            >
              <Star size={11} fill="#ca8a04" />
              <span>★ {row.priority || 0}</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label
              className="admin-switch"
              style={{
                position: 'relative',
                display: 'inline-block',
                width: '36px',
                height: '20px',
                margin: 0,
                cursor: isToggling ? 'wait' : 'pointer'
              }}
              title={isKhmer ? 'ចុចដើម្បីបិទ/បើកការផ្សាយ' : 'Click to toggle status'}
            >
              <input
                type="checkbox"
                checked={Boolean(row.is_active)}
                disabled={isToggling}
                onChange={(e) => handleToggleActive(row, e)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: 'absolute',
                  cursor: isToggling ? 'wait' : 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: row.is_active ? '#059669' : '#cbd5e1',
                  transition: '0.2s',
                  borderRadius: '20px'
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    content: '""',
                    height: '14px',
                    width: '14px',
                    left: row.is_active ? '19px' : '3px',
                    bottom: '3px',
                    backgroundColor: '#ffffff',
                    transition: '0.2s',
                    borderRadius: '50%',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}
                />
              </span>
            </label>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: row.is_active ? '#059669' : '#94a3b8'
              }}
            >
              {row.is_active ? (isKhmer ? 'ផ្សាយ' : 'Live') : (isKhmer ? 'ព្រាង' : 'Draft')}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '12px 14px 10px' }}>
          {/* Optional Image Thumbnail Preview */}
          {(row.image_url || row.background_image) && (
            <div
              style={{
                width: '100%',
                height: '110px',
                borderRadius: '10px',
                overflow: 'hidden',
                marginBottom: '10px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0'
              }}
            >
              <img
                src={row.image_url || row.background_image}
                alt={row.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          <div
            style={{
              fontWeight: 800,
              fontSize: '0.94rem',
              color: '#07294D',
              lineHeight: 1.35,
              marginBottom: '6px'
            }}
          >
            {row.title}
          </div>

          {(row.message || row.description) && (
            <p
              style={{
                fontSize: '0.82rem',
                color: '#64748b',
                lineHeight: 1.5,
                margin: '0 0 10px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {row.message || row.description}
            </p>
          )}

          {/* Target Link & CTA details */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              padding: '8px 10px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              fontSize: '0.78rem'
            }}
          >
            {row.button_text && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>{isKhmer ? 'ប៊ូតុងសកម្មភាព ៖' : 'CTA Button:'}</span>
                <span
                  style={{
                    fontWeight: 700,
                    color: '#07294D',
                    background: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1'
                  }}
                >
                  {row.button_text} &rarr;
                </span>
              </div>
            )}
            {row.button_link && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>{isKhmer ? 'តំណភ្ជាប់ ៖' : 'Target URL:'}</span>
                <span
                  style={{
                    color: '#1e73be',
                    fontFamily: 'monospace',
                    fontSize: '0.74rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '180px'
                  }}
                >
                  {row.button_link}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tactile Mobile Action Buttons */}
        <div className="admin-user-mobile-card-actions">
          <button
            type="button"
            onClick={() => setPreviewPromo(row)}
            className="admin-user-mobile-action-btn view"
            title={isKhmer ? 'មើលការបង្ហាញជាក់ស្តែង' : 'Preview Live'}
          >
            <Eye size={13} />
            <span>{isKhmer ? 'មើល' : 'Preview'}</span>
          </button>
          <button
            type="button"
            onClick={() => openEditModal(row)}
            className="admin-user-mobile-action-btn edit"
            title={isKhmer ? 'កែសម្រួល' : 'Edit Campaign'}
          >
            <Edit2 size={13} />
            <span>{isKhmer ? 'កែប្រែ' : 'Edit'}</span>
          </button>
          <button
            type="button"
            onClick={() => setDeletePromo(row)}
            className="admin-user-mobile-action-btn delete"
            title={isKhmer ? 'លុបយុទ្ធនាការ' : 'Delete'}
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
      {/* 1. Institutional Header Banner */}
      <div
        className="admin-page-header admin-promotions-header"
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '24px 28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#eff6ff',
              color: '#1e73be',
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: '9999px',
              border: '1px solid #dbeafe',
              marginBottom: '10px'
            }}
          >
            <Megaphone size={14} />
            <span>
              {isKhmer
                ? 'ផ្ទាំងគ្រប់គ្រងការផ្សព្វផ្សាយពិសេស & បដាប្រកាសបន្ទាន់'
                : 'Special Broadcasts & Admission Promotions'}
            </span>
          </span>

          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: '#07294D',
              margin: '0 0 6px',
              lineHeight: 1.3
            }}
          >
            {isKhmer
              ? 'ការផ្សព្វផ្សាយពិសេស & បដាជូនដំណឹង (Special Broadcasts)'
              : 'Special Broadcasts & Promotion Campaigns'}
          </h1>

          <p
            style={{
              color: '#64748b',
              fontSize: '0.92rem',
              margin: 0,
              maxWidth: '750px',
              lineHeight: 1.6
            }}
          >
            {isKhmer
              ? 'គ្រប់គ្រងយុទ្ធនាការផ្សព្វផ្សាយអាហារូបករណ៍ ១០០% TVET, ផ្ទាំង Modal Popup ប្រកាសបន្ទាន់លើគេហទំព័រ, បដាផ្សព្វផ្សាយ (Banners) និងសារជូនដំណឹងពិសេស (Floating Broadcasts)។'
              : 'Manage 100% scholarship popups, emergency homepage announcement modals, interactive broadcast banners, and notification toasts.'}
          </p>
        </div>

        <div className="admin-promotions-header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleRefresh}
            className="admin-btn admin-btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            disabled={loading || refreshing}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span>{isKhmer ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="admin-btn admin-btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#07294D'
            }}
          >
            <Plus size={16} />
            <span>{isKhmer ? 'បង្កើតយុទ្ធនាការថ្មី' : 'New Campaign'}</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Live Broadcast Simulation Showcase */}
      {simulatedCampaign && (
        <div className="admin-broadcast-sim-container">
          <div className="admin-broadcast-sim-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#07294D',
                  color: '#ffffff',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 700
                }}
              >
                <Monitor size={14} />
                <span>{isKhmer ? 'ទិដ្ឋភាពផ្សាយបន្តផ្ទាល់លើគេហទំព័រ (Live Visitor Preview)' : 'Live Visitor Preview'}</span>
              </div>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                {isKhmer ? 'កំពុងបង្ហាញ ៖ ' : 'Previewing: '}
                <strong style={{ color: '#07294D' }}>{simulatedCampaign.title}</strong>
              </span>
            </div>

            {/* Switch Mode Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                {isKhmer ? 'ទម្រង់បង្ហាញ ៖' : 'Mode:'}
              </span>
              <div style={{ display: 'inline-flex', background: '#e2e8f0', padding: '3px', borderRadius: '8px' }}>
                <button
                  type="button"
                  onClick={() => setSimMode('popup')}
                  style={{
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: currentSimMode === 'popup' ? '#ffffff' : 'transparent',
                    color: currentSimMode === 'popup' ? '#07294D' : '#64748b',
                    boxShadow: currentSimMode === 'popup' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <Layout size={12} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                  {isKhmer ? 'ផ្ទាំងលោត' : 'Popup'}
                </button>
                <button
                  type="button"
                  onClick={() => setSimMode('banner')}
                  style={{
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: currentSimMode === 'banner' ? '#ffffff' : 'transparent',
                    color: currentSimMode === 'banner' ? '#07294D' : '#64748b',
                    boxShadow: currentSimMode === 'banner' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <Flag size={12} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                  {isKhmer ? 'បដាផ្សាយ' : 'Banner'}
                </button>
                <button
                  type="button"
                  onClick={() => setSimMode('notification')}
                  style={{
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: currentSimMode === 'notification' ? '#ffffff' : 'transparent',
                    color: currentSimMode === 'notification' ? '#07294D' : '#64748b',
                    boxShadow: currentSimMode === 'notification' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <Bell size={12} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                  {isKhmer ? 'សារបន្ទាន់' : 'Toast'}
                </button>
              </div>
            </div>
          </div>

          <div className="admin-broadcast-sim-body">
            {/* Mode 1: Popup Modal Preview */}
            {currentSimMode === 'popup' && (
              <div className="admin-broadcast-popup-mockup">
                {simulatedCampaign.image_url ? (
                  <div style={{ width: '100%', height: '160px', overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={simulatedCampaign.image_url}
                      alt={simulatedCampaign.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.4)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <X size={16} />
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '16px 20px',
                      background: simulatedCampaign.background_color || '#07294D',
                      color: '#ffffff',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={18} color="#ffaf00" />
                      <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                        {isKhmer ? 'សេចក្តីប្រកាសពិសេស RPITSSR' : 'RPITSSR Special Announcement'}
                      </span>
                    </div>
                    <X size={18} style={{ opacity: 0.8 }} />
                  </div>
                )}

                <div style={{ padding: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <span className="admin-broadcast-priority-pill">
                      <Star size={11} fill="#ca8a04" /> ★ {simulatedCampaign.priority || 0}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#059669',
                        background: '#f0fdf4',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        border: '1px solid #bbf7d0'
                      }}
                    >
                      {simulatedCampaign.is_active
                        ? (isKhmer ? '🟢 កំពុងផ្សាយផ្ទាល់' : '🟢 Live')
                        : (isKhmer ? '⚪ សេចក្តីព្រាង' : '⚪ Draft')}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: '#07294D',
                      margin: '0 0 10px',
                      lineHeight: 1.4
                    }}
                  >
                    {simulatedCampaign.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.86rem',
                      color: '#64748b',
                      lineHeight: 1.6,
                      margin: '0 0 18px'
                    }}
                  >
                    {simulatedCampaign.message || simulatedCampaign.description}
                  </p>

                  {simulatedCampaign.button_text && (
                    <a
                      href={simulatedCampaign.button_link || '#'}
                      onClick={(e) => e.preventDefault()}
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        padding: '12px 20px',
                        background: 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        boxShadow: '0 4px 14px rgba(7, 41, 77, 0.2)'
                      }}
                    >
                      {simulatedCampaign.button_text} &rarr;
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Mode 2: Banner Preview */}
            {currentSimMode === 'banner' && (
              <div
                className="admin-broadcast-banner-mockup"
                style={{ backgroundColor: simulatedCampaign.background_color || '#07294D' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Megaphone size={20} color="#ffaf00" />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '0.98rem', fontWeight: 800, color: '#ffffff' }}>
                      {simulatedCampaign.title}
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.82rem',
                        color: 'rgba(255,255,255,0.85)',
                        lineHeight: 1.4,
                        maxWidth: '560px'
                      }}
                    >
                      {simulatedCampaign.message}
                    </p>
                  </div>
                </div>

                {simulatedCampaign.button_text && (
                  <button
                    type="button"
                    style={{
                      padding: '8px 18px',
                      background: '#ffaf00',
                      color: '#07294D',
                      fontWeight: 800,
                      fontSize: '0.84rem',
                      borderRadius: '9999px',
                      border: 'none',
                      cursor: 'pointer',
                      flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(255, 175, 0, 0.3)'
                    }}
                  >
                    {simulatedCampaign.button_text} &rarr;
                  </button>
                )}
              </div>
            )}

            {/* Mode 3: Toast Notification Preview */}
            {currentSimMode === 'notification' && (
              <div className="admin-broadcast-toast-mockup">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: '#f0fdf4',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Bell size={15} />
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                      {isKhmer ? 'ដំណឹងបន្ទាន់' : 'Instant Notice'}
                    </span>
                  </div>
                  <X size={14} style={{ color: '#94a3b8', cursor: 'pointer' }} />
                </div>

                <h5 style={{ margin: '0 0 6px', fontSize: '0.92rem', fontWeight: 800, color: '#07294D' }}>
                  {simulatedCampaign.title}
                </h5>
                <p style={{ margin: '0 0 12px', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
                  {simulatedCampaign.message}
                </p>

                {simulatedCampaign.button_text && (
                  <button
                    type="button"
                    style={{
                      padding: '6px 14px',
                      background: '#07294D',
                      color: '#ffffff',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span>{simulatedCampaign.button_text}</span>
                    <ArrowRight size={12} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. 4-Card Institutional KPI Metric Strip */}
      <div className="admin-kpi-grid admin-promotions-kpis">
        {/* KPI 1: Total Campaigns */}
        <div
          className="admin-kpi-card"
          onClick={() => setActiveTab('all')}
          style={{ cursor: 'pointer' }}
        >
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">
                {isKhmer ? 'យុទ្ធនាការសរុប' : 'Total Campaigns'}
              </span>
              <div className="admin-kpi-value">{totalCampaigns}</div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#1e73be' }} />
                <span>{isKhmer ? 'យុទ្ធនាការផ្សព្វផ្សាយ' : 'Broadcast campaigns'}</span>
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
                <Megaphone size={22} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'មើលយុទ្ធនាការទាំងអស់' : 'View all campaigns'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* KPI 2: Live Active */}
        <div
          className="admin-kpi-card"
          onClick={() => setActiveTab('active')}
          style={{ cursor: 'pointer' }}
        >
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">
                {isKhmer ? 'កំពុងផ្សាយផ្ទាល់' : 'Active Live'}
              </span>
              <div className="admin-kpi-value" style={{ color: '#059669' }}>
                {activeCampaigns}
              </div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#059669' }} />
                <span>{isKhmer ? 'ផ្សាយលើគេហទំព័រ' : 'Live on website'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#f0fdf4', color: '#059669' }}>
                {isKhmer ? 'សកម្ម' : 'Active'}
              </span>
              <div
                className="admin-kpi-icon-badge"
                style={{ background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' }}
              >
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'ត្រងយកការផ្សាយសកម្ម' : 'Filter active live'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* KPI 3: Drafts / Paused */}
        <div
          className="admin-kpi-card"
          onClick={() => setActiveTab('inactive')}
          style={{ cursor: 'pointer' }}
        >
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">
                {isKhmer ? 'សេចក្តីព្រាង & ផ្អាក' : 'Drafts / Paused'}
              </span>
              <div className="admin-kpi-value" style={{ color: '#ea580c' }}>
                {draftCampaigns}
              </div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#ea580c' }} />
                <span>{isKhmer ? 'មិនទាន់ផ្សាយជាសាធារណៈ' : 'Unpublished drafts'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#fff7ed', color: '#ea580c' }}>
                {isKhmer ? 'ព្រាង' : 'Draft'}
              </span>
              <div
                className="admin-kpi-icon-badge"
                style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa' }}
              >
                <PauseCircle size={22} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'ត្រងយកសេចក្តីព្រាង' : 'Filter paused drafts'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* KPI 4: High Priority Targets */}
        <div
          className="admin-kpi-card"
          onClick={() => {
            setActiveTab('all');
            setSortBy('priority_desc');
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">
                {isKhmer ? 'អាទិភាពបន្ទាន់ (≥ 8)' : 'High Priority (≥ 8)'}
              </span>
              <div className="admin-kpi-value" style={{ color: '#7c3aed' }}>
                {highPriorityCampaigns}
              </div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#7c3aed' }} />
                <span>{isKhmer ? 'អាទិភាពបង្ហាញមុនគេ' : 'Priority top display'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#faf5ff', color: '#7c3aed' }}>
                {isKhmer ? 'អាទិភាព' : 'Priority'}
              </span>
              <div
                className="admin-kpi-icon-badge"
                style={{ background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}
              >
                <Zap size={22} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'តម្រៀបអាទិភាពខ្ពស់' : 'Sort highest priority'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>
      </div>

      {/* 4. Category Filter Bar (Sleek Horizontal Scroll Pills) */}
      <div className="admin-user-filter-bar">
        {[
          { id: 'all', label: isKhmer ? 'ទាំងអស់' : 'All', count: totalCampaigns },
          { id: 'active', label: isKhmer ? '🟢 កំពុងផ្សាយ' : '🟢 Active', count: activeCampaigns },
          { id: 'inactive', label: isKhmer ? '⚪ ផ្អាកទុក' : '⚪ Drafts', count: draftCampaigns },
          { id: 'popup', label: isKhmer ? '🪟 ផ្ទាំងលោត' : '🪟 Popups', count: promotions.filter((p) => p.type === 'popup').length },
          { id: 'banner', label: isKhmer ? '🚩 បដា' : '🚩 Banners', count: promotions.filter((p) => p.type === 'banner').length },
          { id: 'notification', label: isKhmer ? '🔔 សារបន្ទាន់' : '🔔 Alerts', count: promotions.filter((p) => p.type === 'notification').length }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`admin-user-filter-pill ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.label}</span>
            <span className="admin-user-filter-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* 5. Institutional DataTable & Mobile Cards View */}
      <AdminDataTable
        title={isKhmer ? 'បញ្ជីយុទ្ធនាការផ្សព្វផ្សាយពិសេស' : 'Broadcast Campaigns Directory'}
        subtitle={
          isKhmer
            ? `បង្ហាញ ${filteredPromotions.length} ក្នុងចំណោមយុទ្ធនាការសរុប ${totalCampaigns}`
            : `Showing ${filteredPromotions.length} of ${totalCampaigns} total campaigns`
        }
        columns={columns}
        data={filteredPromotions}
        loading={loading}
        onAdd={openAddModal}
        addLabel={isKhmer ? 'បង្កើតយុទ្ធនាការថ្មី' : 'New Campaign'}
        onRefresh={handleRefresh}
        searchPlaceholder={isKhmer ? 'ស្វែងរកយុទ្ធនាការ ឬខ្លឹមសារ...' : 'Search campaigns or content...'}
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
            <option value="priority_desc">{isKhmer ? 'តម្រៀប ៖ អាទិភាពខ្ពស់មុន' : 'Sort: Highest Priority'}</option>
            <option value="newest">{isKhmer ? 'តម្រៀប ៖ បង្កើតថ្មីបំផុត' : 'Sort: Newest Created'}</option>
            <option value="title_asc">{isKhmer ? 'តម្រៀប ៖ ចំណងជើង (A-Z)' : 'Sort: Title A-Z'}</option>
          </select>
        }
      />

      {/* 6. Campaign Preview Lightbox Modal */}
      {previewPromo && (
        <div
          className="admin-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(7, 41, 77, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setPreviewPromo(null)}
        >
          <div
            className="admin-modal-dialog"
            style={{
              width: '100%',
              maxWidth: '650px',
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(7, 41, 77, 0.35)',
              border: '1px solid #e2e8f0',
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
                background: previewPromo.background_color || 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)',
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
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Megaphone size={18} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                    {isKhmer ? 'ព័ត៌មានលម្អិតយុទ្ធនាការផ្សព្វផ្សាយ' : 'Campaign Preview & Details'}
                  </h3>
                  <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                    {isKhmer ? `ប្រភេទ ៖ ${previewPromo.type?.toUpperCase()} • ID: ${previewPromo.id}` : `Type: ${previewPromo.type} • ID: ${previewPromo.id}`}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewPromo(null)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
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
              {/* Image Preview if available */}
              {previewPromo.image_url && (
                <div
                  style={{
                    width: '100%',
                    height: '220px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    marginBottom: '20px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(7, 41, 77, 0.08)'
                  }}
                >
                  <img
                    src={previewPromo.image_url}
                    alt={previewPromo.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      if (e.currentTarget.parentElement) {
                        e.currentTarget.parentElement.style.display = 'none';
                      }
                    }}
                  />
                </div>
              )}

              {/* Badges & Meta */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '14px' }}>
                {getTypeBadge(previewPromo.type)}
                <span className="admin-broadcast-priority-pill">
                  <Star size={12} fill="#ca8a04" /> ★ អាទិភាព {previewPromo.priority || 0}
                </span>
                <span
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    background: previewPromo.is_active ? '#f0fdf4' : '#fff7ed',
                    color: previewPromo.is_active ? '#059669' : '#ea580c',
                    border: `1px solid ${previewPromo.is_active ? '#bbf7d0' : '#fed7aa'}`
                  }}
                >
                  {previewPromo.is_active ? (isKhmer ? '🟢 កំពុងផ្សាយផ្ទាល់' : '🟢 Live Active') : (isKhmer ? '⚪ ផ្អាកផ្សាយ' : '⚪ Paused')}
                </span>
              </div>

              {/* Title & Message */}
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#07294D',
                  margin: '0 0 12px',
                  lineHeight: 1.4
                }}
              >
                {previewPromo.title}
              </h2>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    {isKhmer ? 'ខ្លឹមសារសារប្រកាស' : 'Campaign Message'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(previewPromo.message, 'preview_msg')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: copiedId === 'preview_msg' ? '#059669' : '#1e73be',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {copiedId === 'preview_msg' ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedId === 'preview_msg' ? (isKhmer ? 'បានចម្លង!' : 'Copied!') : (isKhmer ? 'ចម្លង' : 'Copy')}</span>
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: '0.92rem', color: '#07294D', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {previewPromo.message || (isKhmer ? '(គ្មានខ្លឹមសារបន្ថែម)' : '(No message content)')}
                </p>
              </div>

              {/* CTA Button Info */}
              {previewPromo.button_text && (
                <div
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #dbeafe',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowRight size={16} color="#1e73be" />
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#07294D' }}>
                        {previewPromo.button_text}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                        {previewPromo.button_link}
                      </div>
                    </div>
                  </div>
                  <a
                    href={previewPromo.button_link}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-btn admin-btn-outline"
                    style={{ fontSize: '0.78rem', padding: '4px 10px', textDecoration: 'none' }}
                  >
                    <ExternalLink size={13} />
                    <span>{isKhmer ? 'សាកល្បងតំណភ្ជាប់' : 'Test Link'}</span>
                  </a>
                </div>
              )}

              {/* Metadata Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '12px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '14px'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{isKhmer ? 'ពន្យារពេល (Delay)' : 'Delay'}</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#07294D' }}>
                    {Math.round((previewPromo.delay || 0) / 1000)}s
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{isKhmer ? 'បង្ហាញតែម្តង' : 'Show Once'}</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#07294D' }}>
                    {previewPromo.show_once ? (isKhmer ? 'បាទ/ចាស (Yes)' : 'Yes') : (isKhmer ? 'ទេ (No)' : 'No')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{isKhmer ? 'កាលបរិច្ឆេទបង្កើត' : 'Created'}</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#07294D' }}>
                    {previewPromo.created_at ? new Date(previewPromo.created_at).toLocaleDateString() : '--'}
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
                onClick={() => handleToggleActive(previewPromo)}
                className="admin-btn admin-btn-outline"
                style={{ fontSize: '0.82rem' }}
              >
                {previewPromo.is_active
                  ? (isKhmer ? '⏸️ ផ្អាកការផ្សាយ' : '⏸️ Pause Campaign')
                  : (isKhmer ? '▶️ បើកការផ្សាយផ្ទាល់' : '▶️ Activate Campaign')}
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const p = previewPromo;
                    setPreviewPromo(null);
                    openEditModal(p);
                  }}
                  className="admin-btn admin-btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Edit2 size={14} />
                  <span>{isKhmer ? 'កែសម្រួល' : 'Edit'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewPromo(null)}
                  className="admin-btn admin-btn-outline"
                >
                  {isKhmer ? 'បិទ' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Create / Edit Campaign Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingPromo
            ? (isKhmer ? 'កែសម្រួលយុទ្ធនាការផ្សព្វផ្សាយ' : 'Edit Broadcast Campaign')
            : (isKhmer ? 'បង្កើតយុទ្ធនាការផ្សព្វផ្សាយថ្មី' : 'Create New Broadcast Campaign')
        }
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        maxWidth="750px"
      >
        {/* Real-time miniature preview box inside form */}
        <div
          style={{
            background: formData.background_color || '#07294D',
            color: '#ffffff',
            borderRadius: '12px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={18} color="#ffaf00" />
            <div>
              <div style={{ fontSize: '0.74rem', opacity: 0.8, textTransform: 'uppercase' }}>
                {isKhmer ? 'ទិដ្ឋភាពជាក់ស្តែង' : 'Realtime Preview'}: {formData.type?.toUpperCase()}
              </div>
              <div style={{ fontSize: '0.94rem', fontWeight: 800 }}>
                {formData.title || (isKhmer ? 'ចំណងជើងយុទ្ធនាការ...' : 'Campaign title...')}
              </div>
            </div>
          </div>
          {formData.button_text && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                background: '#ffaf00',
                color: '#07294D',
                padding: '4px 10px',
                borderRadius: '9999px'
              }}
            >
              {formData.button_text}
            </span>
          )}
        </div>

        {/* Section 1: Basic Info */}
        <div style={{ marginBottom: '20px' }}>
          <label className="admin-form-label">
            {isKhmer ? 'ចំណងជើងយុទ្ធនាការ *' : 'Campaign Title *'}
          </label>
          <input
            type="text"
            className="admin-form-control"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. អាហារូបករណ៍ ១០០% ជំនាញវិជ្ជាជីវៈ និងបច្ចេកទេស TVET"
          />
        </div>

        {/* Type & Priority */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label className="admin-form-label">
              {isKhmer ? 'ប្រភេទផ្សាយ (Display Type) *' : 'Display Type *'}
            </label>
            <select
              className="admin-form-control"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="popup">{isKhmer ? '🪟 ផ្ទាំងលោតកណ្តាល (Modal Dialog Popup)' : 'Popup Modal Dialog'}</option>
              <option value="banner">{isKhmer ? '🚩 បដាផ្សាយខាងលើ/ក្រោម (Announcement Banner)' : 'Header/Footer Banner'}</option>
              <option value="notification">{isKhmer ? '🔔 សារលោតជូនដំណឹង (Toast Notification)' : 'Toast Alert Notification'}</option>
            </select>
          </div>

          <div>
            <label className="admin-form-label">
              {isKhmer ? 'កម្រិតអាទិភាព (Priority: 1 - 10)' : 'Priority Level (1 - 10)'}
            </label>
            <input
              type="number"
              min="0"
              max="100"
              className="admin-form-control"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            />
          </div>
        </div>

        {/* Campaign Message */}
        <div style={{ marginBottom: '20px' }}>
          <label className="admin-form-label">
            {isKhmer ? 'ខ្លឹមសារសារប្រកាស (Campaign Message) *' : 'Campaign Message *'}
          </label>
          <textarea
            className="admin-form-control"
            rows={3}
            required
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder={isKhmer ? 'រៀបរាប់អំពីខ្លឹមសារអាហារូបករណ៍ ឬការចុះឈ្មោះ...' : 'Describe the promotion details...'}
          />
        </div>

        {/* Section 2: Visuals & Banner */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px'
          }}
        >
          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#07294D', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ImageIcon size={15} color="#1e73be" />
            <span>{isKhmer ? 'រូបភាព & ការរចនាពណ៌ (Visuals & Theming)' : 'Visuals & Theming'}</span>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label className="admin-form-label">{isKhmer ? 'តំណភ្ជាប់រូបភាព (Image URL)' : 'Image URL'}</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="admin-form-control"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="/images/hero-carousel/slide-1.jpg or https://..."
              />
              <label
                className="admin-btn admin-btn-outline"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: uploadingImage ? 'wait' : 'pointer',
                  flexShrink: 0
                }}
              >
                <Upload size={14} />
                <span>{uploadingImage ? (isKhmer ? 'កំពុងបញ្ចូល...' : 'Uploading...') : (isKhmer ? 'បញ្ចូលរូប' : 'Upload')}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {/* Color Presets */}
          <div>
            <label className="admin-form-label">{isKhmer ? 'ពណ៌ផ្ទៃខាងក្រោយ (Background Color)' : 'Background Color'}</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {colorPresets.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, background_color: c.value })}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: formData.background_color === c.value ? '2px solid #07294D' : '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '0.76rem',
                    cursor: 'pointer'
                  }}
                >
                  <span
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: c.value,
                      display: 'inline-block'
                    }}
                  />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Call to Action */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label className="admin-form-label">
              {isKhmer ? 'អក្សរលើប៊ូតុង (Button Label)' : 'Button Label'}
            </label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.button_text}
              onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
              placeholder="e.g. ចុះឈ្មោះឥឡូវនេះ"
            />
          </div>

          <div>
            <label className="admin-form-label">
              {isKhmer ? 'តំណភ្ជាប់ប៊ូតុង (Button URL)' : 'Button URL'}
            </label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.button_link}
              onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
              placeholder="e.g. /register or /courses"
            />
          </div>
        </div>

        {/* Section 4: Delay, Show once, and Active Status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label className="admin-form-label">
              {isKhmer ? 'ពន្យារពេលបង្ហាញ (Delay in ms)' : 'Display Delay (ms)'}
            </label>
            <input
              type="number"
              step="500"
              className="admin-form-control"
              value={formData.delay}
              onChange={(e) => setFormData({ ...formData, delay: e.target.value })}
              placeholder="e.g. 2000 (2 seconds)"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#07294D',
                cursor: 'pointer'
              }}
            >
              <input
                type="checkbox"
                checked={formData.show_once}
                onChange={(e) => setFormData({ ...formData, show_once: e.target.checked })}
              />
              <span>{isKhmer ? 'បង្ហាញតែម្តងគត់ក្នុងមួយ Session' : 'Show once per session'}</span>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                color: '#059669',
                cursor: 'pointer'
              }}
            >
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <span>{isKhmer ? 'បើកដំណើរការផ្សាយភ្លាមៗ (Active Live)' : 'Enable campaign immediately'}</span>
            </label>
          </div>
        </div>
      </AdminModal>

      {/* 8. Institutional Delete Confirmation Modal */}
      {deletePromo && (
        <div
          className="admin-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(7, 41, 77, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px'
          }}
          onClick={() => !deleting && setDeletePromo(null)}
        >
          <div
            className="admin-modal-dialog"
            style={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(7, 41, 77, 0.35)',
              border: '1px solid #e2e8f0',
              padding: '28px 24px',
              textAlign: 'center',
              animation: 'fadeInUpModal 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <Trash2 size={26} />
            </div>

            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                color: '#07294D',
                margin: '0 0 8px'
              }}
            >
              {isKhmer ? 'តើអ្នកប្រាកដជាចង់លុបយុទ្ធនាការនេះ?' : 'Confirm Campaign Deletion'}
            </h3>

            <p
              style={{
                fontSize: '0.88rem',
                color: '#64748b',
                lineHeight: 1.6,
                margin: '0 0 16px'
              }}
            >
              {isKhmer
                ? 'យុទ្ធនាការផ្សព្វផ្សាយនេះនឹងត្រូវលុបចេញពីប្រព័ន្ធជាអចិន្ត្រៃយ៍ ហើយឈប់បង្ហាញលើគេហទំព័រ។'
                : 'This promotion campaign will be permanently deleted and will immediately cease displaying to visitors.'}
            </p>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '22px',
                textAlign: 'left',
                fontSize: '0.84rem'
              }}
            >
              <div style={{ fontWeight: 700, color: '#07294D', marginBottom: '3px' }}>
                {deletePromo.title}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
                {isKhmer ? 'ប្រភេទ ៖ ' : 'Type: '}{deletePromo.type?.toUpperCase()}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setDeletePromo(null)}
                disabled={deleting}
                className="admin-btn admin-btn-outline"
                style={{ flex: 1 }}
              >
                {isKhmer ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="admin-btn admin-btn-danger"
                style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                {deleting && <RefreshCw size={14} className="animate-spin" />}
                <span>{isKhmer ? 'យល់ព្រមលុប' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
