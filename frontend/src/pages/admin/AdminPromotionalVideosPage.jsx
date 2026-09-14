import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import { Edit2, Trash2, Video, ExternalLink, Star, Eye, EyeOff, Play } from 'lucide-react';

export const AdminPromotionalVideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    video_url: '',
    description: '',
    category: 'អាហារូបករណ៍ ១០០%',
    is_featured: false,
    is_active: true,
    order_index: 0,
    published_date: 'ថ្មីៗនេះ (ក្រោម ១ ខែ)',
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
  const previewThumbnail = previewId 
    ? `https://img.youtube.com/vi/${previewId}/hqdefault.jpg` 
    : (formData.thumbnail || (isFbVideo ? '/images/videos/fb_reel_1639279004473101.jpg' : null));

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/promotional-videos');
      setVideos(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load videos:', err);
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
      alert('Failed to toggle video status.');
    }
  };

  const openAddModal = () => {
    setEditingVideo(null);
    setFormData({
      title: '',
      video_url: '',
      description: '',
      category: 'អាហារូបករណ៍ ១០០%',
      is_featured: false,
      is_active: true,
      order_index: videos.length + 1,
      published_date: 'ថ្មីៗនេះ (ក្រោម ១ ខែ)',
    });
    setModalOpen(true);
  };

  const openEditModal = (vid) => {
    setEditingVideo(vid);
    setFormData({
      title: vid.title || '',
      video_url: vid.video_url || '',
      description: vid.description || '',
      category: vid.category || 'សកម្មភាពទូទៅ',
      is_featured: Boolean(vid.is_featured),
      is_active: Boolean(vid.is_active),
      order_index: vid.order_index ?? 0,
      published_date: vid.published_date || 'ថ្មីៗនេះ (ក្រោម ១ ខែ)',
    });
    setModalOpen(true);
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
      alert('Failed to save video. Please check your inputs.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (vid) => {
    if (!window.confirm(`តើអ្នកពិតជាចង់លុបវីដេអូ "${vid.title}" នេះមែនទេ?`)) return;
    try {
      await api.delete(`/admin/promotional-videos/${vid.id}`);
      fetchData();
    } catch {
      alert('Failed to delete video.');
    }
  };

  const columns = [
    {
      header: 'វីដេអូ & រូបភាពតំណាង',
      render: (row) => {
        const thumb = row.thumbnail || (row.youtube_id ? `https://img.youtube.com/vi/${row.youtube_id}/mqdefault.jpg` : null);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                position: 'relative',
                width: '100px',
                height: '60px',
                borderRadius: '6px',
                overflow: 'hidden',
                backgroundColor: '#1a1f2c',
                flexShrink: 0,
              }}
            >
              {thumb ? (
                <img
                  src={thumb}
                  alt={row.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                  <Video size={24} />
                </div>
              )}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Play size={16} color="#fff" fill="#fff" />
              </div>
            </div>

            <div>
              <div style={{ fontWeight: '600', color: 'var(--admin-primary, #1e293b)', fontSize: '0.95rem', marginBottom: '4px' }}>
                {row.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                {row.video_url?.includes('facebook.com') || row.video_url?.includes('fb.watch') || row.video_url?.includes('fb.com') ? (
                  <a
                    href={row.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#1877f2', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: '600' }}
                  >
                    <ExternalLink size={12} />
                    <span>បើកមើលលើ Facebook</span>
                  </a>
                ) : (
                  <a
                    href={row.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: '500' }}
                  >
                    <ExternalLink size={12} />
                    <span>បើកមើលលើ YouTube</span>
                  </a>
                )}
                <span style={{ color: '#94a3b8' }}>•</span>
                <span style={{ color: '#64748b' }}>{row.published_date || 'ថ្មីៗ'}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'ប្រភេទ (Category)',
      render: (row) => (
        <span
          style={{
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '600',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            color: '#2563eb',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          }}
        >
          {row.category || 'សកម្មភាពទូទៅ'}
        </span>
      ),
    },
    {
      header: 'Caption / ការពិពណ៌នា',
      render: (row) => (
        <div
          style={{
            fontSize: '0.85rem',
            color: '#475569',
            maxWidth: '320px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.5,
          }}
          title={row.description}
        >
          {row.description || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>មិនមាន caption</span>}
        </div>
      ),
    },
    {
      header: 'Featured',
      render: (row) => (
        row.is_featured ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              backgroundColor: '#fef3c7',
              color: '#d97706',
            }}
          >
            <Star size={12} fill="#d97706" />
            <span>Featured ធំ</span>
          </span>
        ) : (
          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>ធម្មតា</span>
        )
      ),
    },
    {
      header: 'ស្ថានភាព',
      render: (row) => (
        <button
          onClick={() => handleToggleActive(row)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '600',
            cursor: 'pointer',
            border: 'none',
            backgroundColor: row.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: row.is_active ? '#059669' : '#dc2626',
            transition: 'all 0.2s ease',
          }}
        >
          {row.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
          <span>{row.is_active ? 'បង្ហាញ' : 'លាក់'}</span>
        </button>
      ),
    },
    {
      header: 'សកម្មភាព',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => openEditModal(row)}
            className="admin-btn admin-btn-secondary admin-btn-sm"
            title="Edit Video Details"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="admin-btn admin-btn-danger admin-btn-sm"
            title="Delete Video"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminDataTable
        title="វីដេអូផ្សព្វផ្សាយ (Promotional Videos)"
        subtitle="ដាក់តំណភ្ជាប់វីដេអូ YouTube និងសរសេរ Caption បង្ហាញលើទំព័រដើម Website"
        columns={columns}
        data={videos}
        loading={loading}
        onAdd={openAddModal}
        addLabel="បន្ថែមវីដេអូថ្មី"
        onRefresh={fetchData}
        searchPlaceholder="ស្វែងរកចំណងជើង ឬ Caption វីដេអូ..."
      />

      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingVideo ? 'កែសម្រួលព័ត៌មានវីដេអូ' : 'បន្ថែមវីដេអូថ្មី (Add Video)'}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        submitLabel={editingVideo ? 'រក្សាទុកការកែប្រែ' : 'បន្ថែមវីដេអូ'}
        cancelLabel="បោះបង់"
        maxWidth="680px"
      >
        {/* Video Link */}
        <div className="admin-form-group">
          <label className="admin-form-label">
            តំណភ្ជាប់វីដេអូ (YouTube ឬ Facebook Video URL) *
          </label>
          <input
            type="url"
            className="admin-form-control"
            required
            placeholder="ឧទាហរណ៍៖ https://www.youtube.com/watch?v=... ឬ https://web.facebook.com/share/v/..."
            value={formData.video_url}
            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
          />
          {previewId ? (
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <img
                src={previewThumbnail}
                alt="Thumbnail Preview"
                style={{ width: '80px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
              />
              <div>
                <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 'bold' }}>✓ បានសម្គាល់ YouTube ID: {previewId}</span>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>រូបតំណាង Thumbnail នឹងត្រូវទាញយកដោយស្វ័យប្រវត្តិ</p>
              </div>
            </div>
          ) : isFbVideo ? (
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <img
                src={previewThumbnail || '/images/videos/fb_reel_1639279004473101.jpg'}
                alt="Facebook Video Preview"
                style={{ width: '80px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
              />
              <div>
                <span style={{ fontSize: '0.8rem', color: '#1d4ed8', fontWeight: 'bold' }}>✓ បានសម្គាល់ Facebook Video / Reel</span>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#3b82f6' }}>ភ្ជាប់ទៅកាន់ Facebook Video ផ្លូវការ</p>
              </div>
            </div>
          ) : formData.video_url ? (
            <span style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '4px', display: 'block' }}>
              សូមបញ្ចូលតំណភ្ជាប់ YouTube ឬ Facebook ឱ្យបានត្រឹមត្រូវ
            </span>
          ) : null}
        </div>

        {/* Video Title */}
        <div className="admin-form-group">
          <label className="admin-form-label">ចំណងជើងវីដេអូ (Video Title) *</label>
          <input
            type="text"
            className="admin-form-control"
            required
            placeholder="ឧទាហរណ៍៖ សេចក្តីជូនដំណឹង៖ វគ្គសិក្សាអាហារូបករណ៍ ១០០% សម្រាប់ឆ្នាំសិក្សាថ្មី"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        {/* Category */}
        <div className="admin-form-group">
          <label className="admin-form-label">ប្រភេទវីដេអូ (Category)</label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            {['អាហារូបករណ៍ ១០០%', 'កម្មវិធី TVET 1.5M', 'ដេប៉ាតឺម៉ង់ព័ត៌មានវិទ្យា (ICT)', 'បទសម្ភាសន៍និស្សិត', 'ទស្សនកិច្ចសិក្សា', 'សកម្មភាពទូទៅ'].map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setFormData({ ...formData, category: cat })}
                style={{
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '0.78rem',
                  border: formData.category === cat ? '1px solid #2563eb' : '1px solid #cbd5e1',
                  backgroundColor: formData.category === cat ? '#eff6ff' : '#fff',
                  color: formData.category === cat ? '#1d4ed8' : '#64748b',
                  cursor: 'pointer',
                  fontWeight: formData.category === cat ? '600' : 'normal',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <input
            type="text"
            className="admin-form-control"
            placeholder="ឬវាយបញ្ចូលប្រភេទថ្មីដោយខ្លួនឯង..."
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
        </div>

        {/* Caption / Description */}
        <div className="admin-form-group">
          <label className="admin-form-label">
            Caption / ការពិពណ៌នាវីដេអូ (នឹងបង្ហាញលើ Website)
          </label>
          <textarea
            className="admin-form-control"
            rows={3}
            placeholder="សរសេរ Caption រៀបរាប់សង្ខេបពីខ្លឹមសារវីដេអូ ដើម្បីឱ្យអ្នកទស្សនាងាយយល់..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
            Caption នេះនឹងត្រូវបង្ហាញនៅលើ Card វីដេអូក្នុងទំព័រដើម Website
          </span>
        </div>

        {/* 2-column: Display Date & Order Index */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">ស្លាកកាលបរិច្ឆេទ (Display Date Tag)</label>
            <input
              type="text"
              className="admin-form-control"
              placeholder="ឧទាហរណ៍៖ ថ្មីៗនេះ (ក្រោម ១ ខែ)"
              value={formData.published_date}
              onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">លំដាប់លំដោយ (Order Index)</label>
            <input
              type="number"
              className="admin-form-control"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        {/* Settings Box: Featured & Active */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '8px'
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', margin: 0, fontSize: '0.88rem', fontWeight: '600', color: '#1e293b' }}>
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <span>⭐ កំណត់ជា Featured (បង្ហាញជាវីដេអូធំចម្បងខាងឆ្វេង)</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', margin: 0, fontSize: '0.88rem', fontWeight: '600', color: '#1e293b' }}>
            <input
              type="checkbox"
              id="videoActiveCheck"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <span>👁️ បើកបង្ហាញវីដេអូនេះលើ Website ភ្លាមៗ (Active)</span>
          </label>
        </div>
      </AdminModal>
    </div>
  );
};
