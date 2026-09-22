import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/client';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import { useLanguage } from '../../context/LanguageContext';
import {
  Calendar,
  MapPin,
  Clock,
  Plus,
  RotateCw,
  Search,
  X,
  Edit2,
  Trash2,
  Eye,
  Sparkles,
  Upload,
  Layers,
  CheckCircle2,
  AlertTriangle,
  User,
  ExternalLink,
  Users,
  FileText,
  ArrowRight,
  Tag
} from 'lucide-react';

export const AdminEventsPage = () => {
  const { currentLanguage, language } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Preview Lightbox Modal
  const [previewEvent, setPreviewEvent] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Delete Confirmation Modal
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Category Filter State
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    date: new Date().toISOString().split('T')[0],
    time: '08:00 ព្រឹក - 05:00 ល្ងាច',
    place: 'បរិវេណវិទ្យាស្ថាន RPITSSR សៀមរាប',
    fee: 'ឥតគិតថ្លៃ (Free)',
    imageUrl: '/images/gallery/gallery 1.jpg',
    speakers: '',
    schedule: '',
    description: '',
    overview: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, catRes] = await Promise.all([
        api.get('/admin/events?limit=100'),
        api.get('/admin/event-categories'),
      ]);
      const evList = Array.isArray(eventsRes.data) ? eventsRes.data : (eventsRes.data?.data || []);
      const catList = Array.isArray(catRes.data) ? catRes.data : (catRes.data?.data || []);
      setEvents(evList);
      setCategories(catList);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Category Theme Badges
  const getCategoryTheme = (catName = '') => {
    const lower = catName.toLowerCase();
    if (lower.includes('tvet') || lower.includes('បណ្តុះបណ្តាល')) {
      return { bg: '#eff6ff', color: '#1e73be', border: '#dbeafe' };
    }
    if (lower.includes('ict') || lower.includes('បច្ចេកវិទ្យា') || lower.includes('tech')) {
      return { bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff' };
    }
    if (lower.includes('job') || lower.includes('ការងារ') || lower.includes('ស្នាដៃ')) {
      return { bg: '#f0fdf4', color: '#059669', border: '#bbf7d0' };
    }
    if (lower.includes('sport') || lower.includes('កីឡា') || lower.includes('យុវជន')) {
      return { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' };
    }
    return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
  };

  // KPI Calculations
  const totalEvents = events.length;
  const freeEvents = events.filter((e) => !e.fee || e.fee.toLowerCase().includes('free') || e.fee.includes('ឥតគិតថ្លៃ')).length;
  const totalCategories = categories.length;
  const distinctVenues = new Set(events.map((e) => e.place).filter(Boolean)).size;

  // Category-Filtered Events
  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'all') return events;
    return events.filter((ev) =>
      String(ev.category_id) === String(selectedCategory) ||
      String(ev.category?.id) === String(selectedCategory) ||
      ev.category?.name === selectedCategory
    );
  }, [events, selectedCategory]);

  const openAddModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      category_id: categories[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      time: '08:00 ព្រឹក - 05:00 ល្ងាច',
      place: isKhmer ? 'បរិវេណវិទ្យាស្ថាន RPITSSR សៀមរាប' : 'RPITSSR Main Campus, Siem Reap',
      fee: isKhmer ? 'ឥតគិតថ្លៃ (Free)' : 'Free Admission',
      imageUrl: '/images/gallery/gallery 1.jpg',
      speakers: isKhmer ? 'ថ្នាក់ដឹកនាំក្រសួង, គណៈគ្រប់គ្រងវិទ្យាស្ថាន, អ្នកជំនាញ' : 'Ministry Leaders, Faculty Board, Industry Experts',
      schedule: isKhmer ? '08:00 ព្រឹក: ពិធីបើក | 09:30 ព្រឹក: បទបង្ហាញ | 02:00 រសៀល: កិច្ចពិភាក្សា' : '08:00 AM: Opening | 09:30 AM: Keynote | 02:00 PM: Workshop',
      description: '',
      overview: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (e) => {
    setEditingEvent(e);
    setFormData({
      title: e.title || '',
      category_id: e.category_id || e.category?.id || '',
      date: e.date ? e.date.split('T')[0] : (e.eventDate ? e.eventDate.split('T')[0] : ''),
      time: e.time || '08:00 ព្រឹក - 05:00 ល្ងាច',
      place: e.place || e.location || 'RPITSSR Main Campus',
      fee: e.fee || 'ឥតគិតថ្លៃ (Free)',
      imageUrl: e.imageUrl || '/images/gallery/gallery 1.jpg',
      speakers: e.speakers || '',
      schedule: e.schedule || '',
      description: e.description || '',
      overview: e.overview || '',
    });
    setModalOpen(true);
  };

  const openPreviewModal = (e) => {
    setPreviewEvent(e);
    setPreviewModalOpen(true);
  };

  const openDeleteModal = (e) => {
    setEventToDelete(e);
    setDeleteModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);
    data.append('subDir', 'events');
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
      console.error('Image upload failed:', err);
      alert(isKhmer ? 'ការបញ្ចូលរូបភាពបរាជ័យ។' : 'Image upload failed.');
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
        category_id: formData.category_id ? Number(formData.category_id) : null,
        date: formData.date,
        time: formData.time,
        place: formData.place,
        fee: formData.fee,
        imageUrl: formData.imageUrl,
        speakers: formData.speakers,
        schedule: formData.schedule,
        description: formData.description,
        overview: formData.overview,
      };

      if (editingEvent) {
        await api.put(`/admin/events/${editingEvent.id}`, payload);
      } else {
        await api.post('/admin/events', payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save event:', err);
      alert(isKhmer ? 'មិនអាចរក្សាទុកព្រឹត្តិការណ៍បានទេ។' : 'Failed to save event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/events/${eventToDelete.id}`);
      setDeleteModalOpen(false);
      setEventToDelete(null);
      fetchData();
    } catch (err) {
      console.error('Failed to delete event:', err);
      alert(isKhmer ? 'មិនអាចលុបព្រឹត្តិការណ៍បានទេ។' : 'Failed to delete event.');
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
      header: isKhmer ? 'ព្រឹត្តិការណ៍ & រូបភាព' : 'Event Title & Category',
      render: (row) => {
        const catName = row.category?.name || (isKhmer ? 'កម្មវិធីទូទៅ' : 'General Event');
        const theme = getCategoryTheme(catName);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="admin-event-thumb-wrapper">
              <img
                src={row.imageUrl || '/images/gallery/gallery 1.jpg'}
                alt={row.title}
                className="admin-event-thumb-img"
                onError={(e) => {
                  e.target.src = '/images/gallery/gallery 1.jpg';
                }}
              />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.94rem', color: '#07294D', lineHeight: 1.4 }}>
                {row.title}
              </div>
              <div style={{ marginTop: '4px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    background: theme.bg,
                    color: theme.color,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  {catName}
                </span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: isKhmer ? 'កាលបរិច្ឆេទ & ម៉ោង' : 'Date & Time',
      render: (row) => (
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.84rem', fontWeight: 700, color: '#07294D' }}>
            <Calendar size={13} color="#1e73be" />
            <span>{formatDate(row.date || row.eventDate)}</span>
          </div>
          {row.time && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem', color: '#64748b', marginTop: '3px' }}>
              <Clock size={12} />
              <span>{row.time}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: isKhmer ? 'ទីកន្លែងរៀបចំ' : 'Venue / Location',
      render: (row) => (
        <div style={{ display: 'inline-flex', alignItems: 'flex-start', gap: '5px', maxWidth: '240px' }}>
          <MapPin size={13} color="#ea580c" style={{ flexShrink: 0, marginTop: '3px' }} />
          <span style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.4 }}>
            {row.place || row.location || (isKhmer ? 'វិទ្យាស្ថាន RPITSSR' : 'RPITSSR Campus')}
          </span>
        </div>
      ),
    },
    {
      header: isKhmer ? 'តម្លៃចូលរួម' : 'Admission',
      render: (row) => (
        <span className="admin-fee-badge-free">
          <Sparkles size={11} />
          {row.fee || (isKhmer ? 'ឥតគិតថ្លៃ (Free)' : 'Free')}
        </span>
      ),
    },
    {
      header: isKhmer ? 'ប្រតិបត្តិការ' : 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
          <button
            onClick={() => openPreviewModal(row)}
            className="admin-btn admin-btn-outline admin-btn-sm"
            title={isKhmer ? 'មើលព័ត៌មានលម្អិត' : 'Quick Preview'}
            style={{ padding: '6px 9px', borderRadius: '8px', color: '#1e73be', borderColor: '#dbeafe', background: '#eff6ff' }}
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="admin-btn admin-btn-outline admin-btn-sm"
            title={isKhmer ? 'កែសម្រួល' : 'Edit Event'}
            style={{ padding: '6px 9px', borderRadius: '8px' }}
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => openDeleteModal(row)}
            className="admin-btn admin-btn-danger admin-btn-sm"
            title={isKhmer ? 'លុប' : 'Delete Event'}
            style={{ padding: '6px 9px', borderRadius: '8px' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const renderMobileCard = (row) => {
    const catName = row.category?.name || (isKhmer ? 'កម្មវិធីទូទៅ' : 'General Event');
    const theme = getCategoryTheme(catName);
    const isFree = !row.fee || row.fee.toLowerCase().includes('free') || row.fee.includes('ឥតគិតថ្លៃ');

    return (
      <div className="admin-user-mobile-card">
        {/* Top: Thumbnail, Title, Category Badge, and Admission Badge */}
        <div className="admin-user-mobile-card-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
            <div className="admin-event-thumb-wrapper" style={{ width: '54px', height: '42px', flexShrink: 0 }}>
              <img
                src={row.imageUrl || '/images/gallery/gallery 1.jpg'}
                alt={row.title}
                className="admin-event-thumb-img"
                onError={(e) => {
                  e.target.src = '/images/gallery/gallery 1.jpg';
                }}
              />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  color: '#07294D',
                  lineHeight: 1.35,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {row.title}
              </div>
              <div style={{ marginTop: '4px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.70rem',
                    fontWeight: 700,
                    background: theme.bg,
                    color: theme.color,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  {catName}
                </span>
              </div>
            </div>
          </div>

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

        {/* Details: Date/Time & Place */}
        <div className="admin-user-mobile-card-details">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: '#07294D', fontWeight: '700' }}>
              <Calendar size={13} color="#1e73be" style={{ flexShrink: 0 }} />
              <span>{formatDate(row.date || row.eventDate)}</span>
              {row.time && (
                <span style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: '500' }}>
                  • {row.time}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', fontSize: '0.76rem', color: '#334155', marginTop: '6px' }}>
            <MapPin size={12} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ lineHeight: 1.35 }}>
              {row.place || row.location || (isKhmer ? 'វិទ្យាស្ថាន RPITSSR' : 'RPITSSR Campus')}
            </span>
          </div>

          {row.description && (
            <div
              style={{
                fontSize: '0.74rem',
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

        {/* Action Buttons */}
        <div className="admin-user-mobile-card-actions">
          <button
            onClick={() => openPreviewModal(row)}
            className="admin-user-mobile-action-btn view"
            title={isKhmer ? 'មើលព័ត៌មានលម្អិត' : 'Preview Event'}
          >
            <Eye size={13} />
            <span>{isKhmer ? 'មើលលម្អិត' : 'Preview'}</span>
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="admin-user-mobile-action-btn edit"
            title={isKhmer ? 'កែសម្រួល' : 'Edit Event'}
          >
            <Edit2 size={13} />
            <span>{isKhmer ? 'កែប្រែ' : 'Edit'}</span>
          </button>
          <button
            onClick={() => openDeleteModal(row)}
            className="admin-user-mobile-action-btn delete"
            title={isKhmer ? 'លុប' : 'Delete Event'}
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
        className="admin-events-header"
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
              fontWeight: '700',
              marginBottom: '8px',
              border: '1px solid #dbeafe',
            }}
          >
            <Calendar size={14} />
            <span>{isKhmer ? 'ការគ្រប់គ្រងព្រឹត្តិការណ៍ & កម្មវិធីស្ថាប័ន' : 'Institutional Events & Activities Portal'}</span>
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
            {isKhmer ? 'ព្រឹត្តិការណ៍ & កម្មវិធីស្ថាប័ន' : 'Campus Events & Programs'}
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
            {isKhmer
              ? 'គ្រប់គ្រង សិក្ខាសាលា ពិធីប្រគល់សញ្ញាបត្រ ពិព័រណ៍ការងារ និងសកម្មភាពថ្នាក់ជាតិ TVET 1.5M'
              : 'Manage conferences, graduation ceremonies, job fairs, and national TVET training events.'}
          </p>
        </div>

        <div className="admin-events-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            <span>{isKhmer ? 'បង្កើតព្រឹត្តិការណ៍ថ្មី' : 'Add New Event'}</span>
          </button>
        </div>
      </div>

      {/* 2. 4-Card Institutional KPI Metric Strip */}
      <div className="admin-kpi-grid admin-event-kpis">
        {/* KPI 1: Total Events */}
        <div className="admin-kpi-card" onClick={() => setSelectedCategory('all')}>
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">{isKhmer ? 'ព្រឹត្តិការណ៍សរុប' : 'Total Events'}</span>
              <div className="admin-kpi-value">{totalEvents}</div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#1e73be' }} />
                <span>{isKhmer ? 'កម្មវិធី និងសកម្មភាពស្ថាប័ន' : 'Institutional campus activities'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#eff6ff', color: '#1e73be' }}>
                {isKhmer ? 'សរុប' : 'Total'}
              </span>
              <div className="admin-kpi-icon-badge" style={{ background: '#eff6ff', color: '#1e73be', border: '1px solid #dbeafe' }}>
                <Calendar size={22} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'គ្រប់គ្រងព្រឹត្តិការណ៍' : 'Manage events'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* KPI 2: Free Admission */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">{isKhmer ? 'ចូលរួមឥតគិតថ្លៃ' : 'Free Admission'}</span>
              <div className="admin-kpi-value">{freeEvents}</div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#059669' }} />
                <span>{isKhmer ? 'កម្មវិធីបើកទូលាយឥតបង់ប្រាក់' : 'Open free public access'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#f0fdf4', color: '#059669' }}>
                {isKhmer ? 'ឥតគិតថ្លៃ' : 'Free 100%'}
              </span>
              <div className="admin-kpi-icon-badge" style={{ background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' }}>
                <Sparkles size={22} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'កម្មវិធីឥតគិតថ្លៃ' : 'Free access events'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* KPI 3: Event Categories */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">{isKhmer ? 'ប្រភេទកម្មវិធី' : 'Categories'}</span>
              <div className="admin-kpi-value">{totalCategories}</div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#7c3aed' }} />
                <span>{isKhmer ? 'បែងចែកតាមផ្នែក និងជំនាញ' : 'Classified program types'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#faf5ff', color: '#7c3aed' }}>
                {isKhmer ? 'ប្រភេទ' : 'Categories'}
              </span>
              <div className="admin-kpi-icon-badge" style={{ background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}>
                <Layers size={22} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'ប្រភេទព្រឹត្តិការណ៍' : 'Event categories'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* KPI 4: Campus Venues */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">{isKhmer ? 'ទីតាំងរៀបចំសកម្ម' : 'Active Venues'}</span>
              <div className="admin-kpi-value">{distinctVenues}</div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#ea580c' }} />
                <span>{isKhmer ? 'ក្នុង និងក្រៅបរិវេណវិទ្យាស្ថាន' : 'Campus halls & auditoriums'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#fff7ed', color: '#ea580c' }}>
                {isKhmer ? 'ទីតាំង' : 'Venues'}
              </span>
              <div className="admin-kpi-icon-badge" style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa' }}>
                <MapPin size={22} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'ទីតាំងទាំងអស់' : 'All event venues'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>
      </div>

      {/* 3. Horizontal Swipeable Category Filter Pill Bar */}
      <div className="admin-user-filter-bar">
        <button
          type="button"
          className={`admin-user-filter-pill ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          <Layers size={14} />
          <span>{isKhmer ? 'ទាំងអស់' : 'All Events'}</span>
          <span className="admin-user-filter-count">{totalEvents}</span>
        </button>

        {categories.map((cat) => {
          const count = events.filter((e) => e.category_id === cat.id || e.category?.id === cat.id).length;
          const isSelected = String(selectedCategory) === String(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              className={`admin-user-filter-pill ${isSelected ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <Tag size={13} />
              <span>{cat.name}</span>
              <span className="admin-user-filter-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Institutional DataTable & Mobile Cards View */}
      <AdminDataTable
        columns={columns}
        data={filteredEvents}
        loading={loading}
        title={isKhmer ? 'បញ្ជីព្រឹត្តិការណ៍ & កម្មវិធីស្ថាប័ន' : 'Campus Events Directory'}
        subtitle={
          isKhmer
            ? `បង្ហាញ ${filteredEvents.length} ក្នុងចំណោមព្រឹត្តិការណ៍សរុប ${totalEvents}`
            : `Showing ${filteredEvents.length} of ${totalEvents} events`
        }
        onAdd={openAddModal}
        addLabel={isKhmer ? 'បង្កើតព្រឹត្តិការណ៍ថ្មី' : 'Add New Event'}
        onRefresh={fetchData}
        searchPlaceholder={isKhmer ? 'ស្វែងរកព្រឹត្តិការណ៍, ទីកន្លែង, វាគ្មិន...' : 'Search events, venue, speakers...'}
        renderMobileCard={renderMobileCard}
      />

      {/* 5. Create / Edit Event Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingEvent
            ? (isKhmer ? 'កែសម្រួលព្រឹត្តិការណ៍' : 'Edit Event')
            : (isKhmer ? 'បង្កើតព្រឹត្តិការណ៍ថ្មី' : 'Create New Event')
        }
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        maxWidth="800px"
      >
        {/* Section 1: General Info & Image */}
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
            <Calendar size={15} color="#1e73be" />
            {isKhmer ? 'ផ្នែកទី ១៖ ព័ត៌មានទូទៅ & រូបភាពបដា' : 'Section 1: General Info & Visual Banner'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'ចំណងជើងព្រឹត្តិការណ៍ *' : 'Event Title *'}
              </label>
              <input
                type="text"
                className="admin-form-control"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. ពិធីប្រគល់សញ្ញាបត្រ និងទិវាជាតិ TVET 2026"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'ប្រភេទព្រឹត្តិការណ៍' : 'Category'}
              </label>
              <select
                className="admin-form-control"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              >
                <option value="">{isKhmer ? '-- ជ្រើសរើសប្រភេទ --' : '-- Select Category --'}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'រូបភាពតំណាងព្រឹត្តិការណ៍ (Featured Image URL)' : 'Event Banner Image URL'}
            </label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="text"
                className="admin-form-control"
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
        </div>

        {/* Section 2: Date, Time, Venue & Fee */}
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
            <Clock size={15} color="#ea580c" />
            {isKhmer ? 'ផ្នែកទី ២៖ កាលបរិច្ឆេទ ទីកន្លែង & តម្លៃ' : 'Section 2: Date, Time, Venue & Admission'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'កាលបរិច្ឆេទរៀបចំ *' : 'Event Date *'}
              </label>
              <input
                type="date"
                className="admin-form-control"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'ពេលវេលា / ម៉ោង' : 'Time Interval'}
              </label>
              <input
                type="text"
                className="admin-form-control"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                placeholder="e.g. 08:00 ព្រឹក - 05:00 ល្ងាច"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'ទីកន្លែងរៀបចំ (Venue / Location)' : 'Venue / Location'}
              </label>
              <input
                type="text"
                className="admin-form-control"
                value={formData.place}
                onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                placeholder="e.g. បរិវេណទីធ្លាធំវិទ្យាស្ថាន RPITSSR"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'តម្លៃចូលរួម (Fee)' : 'Admission Fee'}
              </label>
              <input
                type="text"
                className="admin-form-control"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                placeholder="ឥតគិតថ្លៃ (Free)"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Speakers & Agenda */}
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
            <Users size={15} color="#7c3aed" />
            {isKhmer ? 'ផ្នែកទី ៣៖ វាគ្មិនកិត្តិយស & កាលវិភាគលម្អិត' : 'Section 3: Speakers & Schedule Agenda'}
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'វាគ្មិនកិត្តិយស / គណៈអធិបតី (Speakers)' : 'Honorable Speakers & Guests'}
            </label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.speakers}
              onChange={(e) => setFormData({ ...formData, speakers: e.target.value })}
              placeholder="e.g. ថ្នាក់ដឹកនាំក្រសួង, នាយកវិទ្យាស្ថាន, តំណាងសហគ្រាស"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'កាលវិភាគកម្មវិធីលម្អិត (Agenda / Timeline)' : 'Detailed Program Agenda'}
            </label>
            <textarea
              className="admin-form-control"
              rows={2}
              value={formData.schedule}
              onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              placeholder="e.g. 08:00 AM: ចុះឈ្មោះ | 08:30 AM: ពិធីបើក | 02:00 PM: សិក្ខាសាលា..."
            />
          </div>
        </div>

        {/* Section 4: Descriptions */}
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
            <FileText size={15} color="#059669" />
            {isKhmer ? 'ផ្នែកទី ៤៖ សេចក្តីពិពណ៌នា & សេចក្តីសង្ខេប' : 'Section 4: Description & Overview'}
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'សេចក្តីពិពណ៌នាសង្ខេប (Short Description)' : 'Short Description'}
            </label>
            <textarea
              className="admin-form-control"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={isKhmer ? 'រៀបរាប់ខ្លីៗពីគោលបំណងកម្មវិធី...' : 'Short summary of the event...'}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'សេចក្តីសង្ខេបពេញលេញ (Full Overview)' : 'Comprehensive Overview'}
            </label>
            <textarea
              className="admin-form-control"
              rows={3}
              value={formData.overview}
              onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
              placeholder={isKhmer ? 'ព័ត៌មានលម្អិតបន្ថែមពីកម្មវិធី និងកាលានុវត្តភាព...' : 'Detailed overview of the event...'}
            />
          </div>
        </div>
      </AdminModal>

      {/* 6. Event Detail Lightbox Modal */}
      {previewModalOpen && previewEvent && (
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
              maxWidth: '720px',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(7, 41, 77, 0.2)',
              border: '1px solid #e2e8f0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Hero Banner */}
            <div style={{ position: 'relative', height: '220px', overflow: 'hidden', borderRadius: '24px 24px 0 0' }}>
              <img
                src={previewEvent.imageUrl || '/images/gallery/gallery 1.jpg'}
                alt={previewEvent.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = '/images/gallery/gallery 1.jpg';
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(7, 41, 77, 0.2) 0%, rgba(7, 41, 77, 0.85) 100%)',
                }}
              />
              <button
                onClick={() => setPreviewModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(4px)',
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

              <div style={{ position: 'absolute', bottom: '20px', left: '26px', right: '26px', color: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      background: '#1e73be',
                      color: '#ffffff',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                    }}
                  >
                    {previewEvent.category?.name || 'Academic Event'}
                  </span>
                  <span className="admin-fee-badge-free">
                    <Sparkles size={11} /> {previewEvent.fee || 'Free'}
                  </span>
                </div>
                <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, lineHeight: 1.3 }}>
                  {previewEvent.title}
                </h2>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 28px' }}>
              {/* Event Metadata Strip */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  background: '#f8fafc',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={16} color="#1e73be" />
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>
                      {isKhmer ? 'កាលបរិច្ឆេទ' : 'Event Date'}
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#07294D' }}>
                      {formatDate(previewEvent.date || previewEvent.eventDate)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} color="#059669" />
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>
                      {isKhmer ? 'ពេលវេលា' : 'Time'}
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#07294D' }}>
                      {previewEvent.time || '08:00 AM - 05:00 PM'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', gridColumn: 'span 2' }}>
                  <MapPin size={16} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>
                      {isKhmer ? 'ទីកន្លែងរៀបចំ' : 'Venue / Location'}
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#07294D' }}>
                      {previewEvent.place || previewEvent.location || 'RPITSSR Campus'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Speakers */}
              {previewEvent.speakers && (
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                    {isKhmer ? 'វាគ្មិនកិត្តិយស & គណៈអធិបតី' : 'Honorable Speakers & Guests'}
                  </div>
                  <div
                    style={{
                      background: '#f8fafc',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.88rem',
                      color: '#07294D',
                      fontWeight: 600,
                    }}
                  >
                    {previewEvent.speakers}
                  </div>
                </div>
              )}

              {/* Schedule Timeline */}
              {previewEvent.schedule && (
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                    {isKhmer ? 'កាលវិភាគកម្មវិធីលម្អិត' : 'Program Agenda'}
                  </div>
                  <div className="admin-event-schedule-timeline">
                    {previewEvent.schedule.split('|').map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#1e73be', fontWeight: 700 }}>•</span>
                        <span>{item.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                  {isKhmer ? 'សេចក្តីពិពណ៌នា' : 'Description'}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
                  {previewEvent.description || previewEvent.overview || (
                    <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                      {isKhmer ? 'មិនមានសេចក្តីពិពណ៌នាលម្អិតឡើយ។' : 'No description provided.'}
                    </span>
                  )}
                </div>
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
                  const ev = previewEvent;
                  setPreviewModalOpen(false);
                  openEditModal(ev);
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
                {isKhmer ? 'កែសម្រួល' : 'Edit Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Delete Confirmation Modal */}
      {deleteModalOpen && eventToDelete && (
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
                    {isKhmer ? 'បញ្ជាក់ការលុបព្រឹត្តិការណ៍' : 'Delete Event Confirmation'}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {isKhmer ? 'សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានទេ' : 'This action cannot be undone'}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: '0 0 14px 0' }}>
                {isKhmer ? (
                  <>
                    តើអ្នកពិតជាចង់លុបព្រឹត្តិការណ៍ <strong>"{eventToDelete.title}"</strong> (កាលបរិច្ឆេទ:{' '}
                    {formatDate(eventToDelete.date || eventToDelete.eventDate)}) នេះមែនទេ?
                  </>
                ) : (
                  <>
                    Are you sure you want to delete event <strong>"{eventToDelete.title}"</strong> (Date:{' '}
                    {formatDate(eventToDelete.date || eventToDelete.eventDate)})?
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
