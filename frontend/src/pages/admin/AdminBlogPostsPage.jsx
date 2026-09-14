import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import { Edit2, Trash2, Upload, ExternalLink, Star, Eye, Image as ImageIcon } from 'lucide-react';
import { stripHtml } from '../../utils/textUtils';

export const AdminBlogPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    categoryId: '',
    excerpt: '',
    content: '',
    imageUrl: '',
    status: 'published',
    featured: false,
    tags: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [postsRes, catRes] = await Promise.all([
        api.get('/admin/blog-posts?limit=100'),
        api.get('/admin/blog-categories'),
      ]);

      const rawPosts = postsRes.data;
      const postList = Array.isArray(rawPosts) ? rawPosts : (rawPosts?.posts || rawPosts?.data || []);
      setPosts(postList);

      const rawCats = catRes.data;
      const catList = Array.isArray(rawCats) ? rawCats : (rawCats?.categories || rawCats?.data || []);
      setCategories(catList);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      slug: '',
      categoryId: categories[0]?.id || '',
      excerpt: '',
      content: '',
      imageUrl: '/images/blog/b-1.webp',
      status: 'published',
      featured: false,
      tags: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingPost(p);
    const isPub = p.status === 'published' || p.status === undefined;
    setFormData({
      title: p.title || '',
      slug: p.slug || '',
      categoryId: p.categoryId || (p.category?.id || ''),
      excerpt: p.excerpt || '',
      content: p.content || '',
      imageUrl: p.imageUrl || '',
      status: isPub ? 'published' : 'draft',
      featured: Boolean(p.featured),
      tags: p.tags || '',
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);
    data.append('subDir', 'blog');
    setUploading(true);
    try {
      const res = await api.post('/admin/blog-posts/upload-image', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data?.imageUrl || res.data?.url;
      if (url) {
        setFormData((prev) => ({ ...prev, imageUrl: url }));
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload image. Please check file format and size (max 10MB).');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      alert('Please enter an article headline.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        slug: formData.slug?.trim() || undefined,
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        excerpt: formData.excerpt?.trim() || '',
        content: formData.content?.trim() || formData.excerpt?.trim() || formData.title.trim(),
        imageUrl: formData.imageUrl?.trim() || null,
        status: formData.status === 'published' ? 'published' : 'draft',
        featured: Boolean(formData.featured),
        tags: formData.tags?.trim() || null,
        publishedAt: formData.status === 'published' ? new Date().toISOString() : null,
      };

      if (editingPost) {
        await api.put(`/admin/blog-posts/${editingPost.id}`, payload);
      } else {
        await api.post('/admin/blog-posts', payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save post:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to save blog post.';
      alert(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Are you sure you want to delete post "${p.title}"?`)) return;
    try {
      await api.delete(`/admin/blog-posts/${p.id}`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('Failed to delete blog post.');
    }
  };

  const columns = [
    {
      header: 'Article Title & Excerpt',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', width: '56px', height: '42px', flexShrink: 0 }}>
            <img
              src={row.imageUrl || '/images/blog/b-1.webp'}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }}
              onError={(e) => { e.target.src = '/images/blog-placeholder.jpg'; }}
            />
            {row.featured && (
              <span
                title="Featured Article"
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#f59e0b',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}
              >
                <Star size={10} fill="#fff" />
              </span>
            )}
          </div>
          <div>
            <div style={{ fontWeight: '700', color: 'var(--admin-primary)', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {row.title}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {stripHtml(row.excerpt || row.content || '') || 'No excerpt available'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      render: (row) => (
        <span className="admin-badge admin-badge-info">
          {row.category?.name || 'News'}
        </span>
      ),
    },
    {
      header: 'Author & Views',
      render: (row) => (
        <div style={{ fontSize: '0.8rem' }}>
          <div style={{ fontWeight: '600', color: '#334155' }}>
            {row.author || row.author_user?.fullName || row.author_user?.username || 'Admin'}
          </div>
          <div style={{ color: 'var(--admin-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <Eye size={12} /> {row.viewCount || 0} views
          </div>
        </div>
      ),
    },
    {
      header: 'Date',
      render: (row) => (
        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
          {row.publishedAt || row.createdAt ? new Date(row.publishedAt || row.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => {
        const isPub = row.status === 'published' || (row.status !== 'draft' && row.isPublished !== false);
        return (
          <span className={`admin-badge ${isPub ? 'admin-badge-success' : 'admin-badge-warning'}`}>
            {isPub ? 'Published' : 'Draft'}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
          <a
            href={`/blog-details/${row.slug || row.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn-outline admin-btn-sm"
            title="View public post"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
          >
            <ExternalLink size={14} />
          </a>
          <button
            onClick={() => openEditModal(row)}
            className="admin-btn admin-btn-outline admin-btn-sm"
            title="Edit article"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="admin-btn admin-btn-danger admin-btn-sm"
            title="Delete article"
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
        title="News & Blog Articles"
        subtitle="Manage institute press releases, admission announcements, and academic articles"
        columns={columns}
        data={posts}
        loading={loading}
        onAdd={openAddModal}
        addLabel="Write Article"
        onRefresh={fetchData}
        searchPlaceholder="Search articles by title or keyword..."
      />

      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPost ? 'Edit Blog Article' : 'Write New Article'}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        maxWidth="740px"
      >
        <div className="admin-form-group">
          <label className="admin-form-label">Article Headline *</label>
          <input
            type="text"
            className="admin-form-control"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. ដំណើរទស្សនកិច្ចសិក្សារបស់និស្សិត ឬ សេចក្ដីជូនដំណឹង..."
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">Category</label>
            <select
              className="admin-form-control"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">URL Slug (Optional)</label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="auto-generated-if-empty"
            />
          </div>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Featured Image</label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="text"
              className="admin-form-control"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="/images/blog/b-1.webp or /uploads/blog/..."
            />
            <label className="admin-btn admin-btn-outline" style={{ whiteSpace: 'nowrap', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Upload size={14} />
              <span>{uploading ? 'Uploading...' : 'Upload'}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
          </div>
          {formData.imageUrl && (
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={formData.imageUrl}
                alt="Preview"
                style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Image preview</span>
            </div>
          )}
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Short Summary (Excerpt)</label>
          <textarea
            className="admin-form-control"
            rows={2}
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            placeholder="Brief introductory summary to display on card previews and search results..."
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Full Article Content *</label>
          <textarea
            className="admin-form-control"
            rows={6}
            required
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Write full article body text (HTML supported)..."
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">Tags (Optional)</label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="TVET, Admissions, Siem Reap"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Publication Status</label>
            <select
              className="admin-form-control"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="published">Published (Visible Publicly)</option>
              <option value="draft">Draft (Private / Hidden)</option>
            </select>
          </div>
        </div>

        <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
          <input
            type="checkbox"
            id="postFeaturedCheck"
            checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
          />
          <label htmlFor="postFeaturedCheck" style={{ margin: 0, fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Star size={14} color="#f59e0b" /> Pin as Featured Article (Highlight on Home & Blog page)
          </label>
        </div>
      </AdminModal>
    </div>
  );
};
