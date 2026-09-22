import React, { useEffect, useState, useMemo } from 'react';
import DOMPurify from 'dompurify';
import api from '../../api/client';
import { AdminModal } from '../../components/admin/AdminModal';
import { useLanguage } from '../../context/LanguageContext';
import {
  Newspaper,
  Star,
  Eye,
  Calendar,
  User,
  FolderTree,
  Tag,
  Plus,
  RotateCw,
  Search,
  X,
  ExternalLink,
  Edit2,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Filter,
  Sparkles,
  Clock,
  LayoutGrid,
  List,
  ArrowUpRight,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Bookmark,
  Share2,
} from 'lucide-react';
import { stripHtml } from '../../utils/textUtils';

export const AdminBlogPostsPage = () => {
  const { currentLanguage, language } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'featured', 'published', 'draft', or categoryId number
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'views', 'title'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewPost, setPreviewPost] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingPost, setDeletingPost] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

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

  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [postsRes, catRes] = await Promise.all([
        api.get('/admin/blog-posts?limit=200'),
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const total = posts.length;
    const featured = posts.filter((p) => Boolean(p.featured)).length;
    const published = posts.filter((p) => p.status === 'published' || p.isPublished !== false).length;
    const drafts = total - published;
    const totalViews = posts.reduce((sum, p) => sum + (Number(p.viewCount) || 0), 0);
    const activeCategories = categories.length;

    return { total, featured, published, drafts, totalViews, activeCategories };
  }, [posts, categories]);

  // Filtering & Sorting
  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        // Tab filtering
        if (activeTab === 'featured') {
          if (!post.featured) return false;
        } else if (activeTab === 'published') {
          const isPub = post.status === 'published' || post.isPublished !== false;
          if (!isPub) return false;
        } else if (activeTab === 'draft') {
          const isDraft = post.status === 'draft' || post.isPublished === false;
          if (!isDraft) return false;
        } else if (activeTab !== 'all') {
          // Category ID tab
          const catId = Number(activeTab);
          const postCatId = post.categoryId || post.category?.id;
          if (postCatId !== catId) return false;
        }

        // Search term
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase().trim();
          const matchTitle = (post.title || '').toLowerCase().includes(query);
          const matchExcerpt = (post.excerpt || '').toLowerCase().includes(query);
          const matchContent = (post.content || '').toLowerCase().includes(query);
          const matchCategory = (post.category?.name || '').toLowerCase().includes(query);
          const matchAuthor = (post.author || post.authorUser?.fullName || '').toLowerCase().includes(query);
          const matchTags = (post.tags || '').toLowerCase().includes(query);
          return matchTitle || matchExcerpt || matchContent || matchCategory || matchAuthor || matchTags;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'views') {
          return (Number(b.viewCount) || 0) - (Number(a.viewCount) || 0);
        }
        if (sortBy === 'title') {
          return (a.title || '').localeCompare(b.title || '');
        }
        // Default newest
        const dateA = new Date(a.publishedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.publishedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
  }, [posts, activeTab, searchTerm, sortBy]);

  // Quick Action: Toggle Status
  const handleToggleStatus = async (post) => {
    setActionLoadingId(post.id);
    try {
      const res = await api.post(`/admin/blog-posts/${post.id}/toggle-status`);
      const updatedStatus = res.data?.status || (post.status === 'published' ? 'draft' : 'published');
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, status: updatedStatus } : p))
      );
    } catch (err) {
      console.error('Failed to toggle post status:', err);
      // Fallback PUT update
      try {
        const newStatus = post.status === 'published' ? 'draft' : 'published';
        await api.put(`/admin/blog-posts/${post.id}`, {
          ...post,
          status: newStatus,
        });
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, status: newStatus } : p))
        );
      } catch (fallbackErr) {
        alert(isKhmer ? 'បរាជ័យក្នុងការផ្លាស់ប្តូរស្ថានភាព' : 'Failed to update post status.');
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // Quick Action: Toggle Featured
  const handleToggleFeatured = async (post) => {
    setActionLoadingId(post.id);
    try {
      const res = await api.post(`/admin/blog-posts/${post.id}/toggle-featured`);
      const newFeatured = res.data?.featured !== undefined ? res.data.featured : !post.featured;
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, featured: newFeatured } : p))
      );
    } catch (err) {
      console.error('Failed to toggle featured status:', err);
      try {
        await api.put(`/admin/blog-posts/${post.id}`, {
          ...post,
          featured: !post.featured,
        });
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, featured: !post.featured } : p))
        );
      } catch (fallbackErr) {
        alert(isKhmer ? 'បរាជ័យក្នុងការរំលេចអត្ថបទ' : 'Failed to toggle featured status.');
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // Add & Edit Handlers
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
      alert(isKhmer ? 'ការផ្ទុកឡើងបរាជ័យ សូមពិនិត្យទំហំរូបភាព (អតិបរមា 10MB)' : 'Failed to upload image. Please check file format and size (max 10MB).');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      alert(isKhmer ? 'សូមបញ្ចូលចំណងជើងអត្ថបទ' : 'Please enter an article headline.');
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
      const errMsg = err.response?.data?.message || err.response?.data?.error || (isKhmer ? 'បរាជ័យក្នុងការរក្សាទុកអត្ថបទ' : 'Failed to save blog post.');
      alert(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (post) => {
    setDeletingPost(post);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!deletingPost) return;
    setSubmitting(true);
    try {
      await api.delete(`/admin/blog-posts/${deletingPost.id}`);
      setDeleteModalOpen(false);
      setDeletingPost(null);
      fetchData();
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert(isKhmer ? 'បរាជ័យក្នុងការលុបអត្ថបទ' : 'Failed to delete blog post.');
    } finally {
      setSubmitting(false);
    }
  };

  const openPreview = (post) => {
    setPreviewPost(post);
    setPreviewModalOpen(true);
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* 1. Institutional Header Banner */}
      <div className="admin-page-header admin-blog-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#eff6ff',
                color: '#1e73be',
                padding: '6px 14px',
                borderRadius: '30px',
                fontSize: '0.84rem',
                fontWeight: 700,
                marginBottom: '10px',
                border: '1px solid #dbeafe',
              }}
            >
              <Newspaper size={15} />
              <span>
                {isKhmer ? 'ប្រព័ន្ធគ្រប់គ្រងអត្ថបទព័ត៌មាន & ប្លុកស្ថាប័ន' : 'Institutional Press & News System'}
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#07294D', margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>
              {isKhmer ? 'អត្ថបទព័ត៌មាន & សេចក្តីប្រកាសព័ត៌មានស្ថាប័ន' : 'Press Releases & News Articles'}
            </h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.94rem', maxWidth: '720px', lineHeight: 1.5 }}>
              {isKhmer
                ? 'គ្រប់គ្រងអត្ថបទព័ត៌មាន សេចក្តីប្រកាសសារព័ត៌មាន សកម្មភាពចុះឈ្មោះ និងការផ្សព្វផ្សាយសមិទ្ធផលស្ថាប័ន RPITSSR។'
                : 'Manage institute press releases, admission announcements, academic achievements, and official news updates.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="admin-blog-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="admin-btn admin-btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '42px', padding: '0 16px', background: '#fff' }}
              title={isKhmer ? 'ទាញយកទិន្នន័យឡើងវិញ' : 'Refresh Data'}
            >
              <RotateCw size={15} className={refreshing ? 'animate-spin' : ''} />
              <span>{isKhmer ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}</span>
            </button>

            <button
              onClick={openAddModal}
              className="admin-btn admin-btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: '42px',
                padding: '0 20px',
                borderRadius: '8px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)',
                boxShadow: '0 4px 12px rgba(30, 115, 190, 0.25)',
              }}
            >
              <Plus size={16} />
              <span>{isKhmer ? 'សរសេរអត្ថបទថ្មី' : 'Write New Article'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 4-Card Institutional KPI Metric Strip */}
      <div className="admin-kpi-grid admin-blog-kpis" style={{ marginBottom: '28px' }}>
        {/* KPI 1: Total Articles */}
        <div
          className="admin-kpi-card"
          onClick={() => setActiveTab('all')}
          style={{ cursor: 'pointer' }}
          title={isKhmer ? 'ចុចដើម្បីមើលអត្ថបទទាំងអស់' : 'Click to view all articles'}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: '#eff6ff',
              border: '1px solid #dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1e73be',
              flexShrink: 0,
            }}
          >
            <Newspaper size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              {isKhmer ? 'អត្ថបទសរុប' : 'Total Articles'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#07294D', lineHeight: 1.2 }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 600, marginTop: '2px' }}>
              {isKhmer ? `${stats.published} បានផ្សាយជាសាធារណៈ` : `${stats.published} published live`}
            </div>
          </div>
        </div>

        {/* KPI 2: Featured Articles */}
        <div
          className="admin-kpi-card"
          onClick={() => setActiveTab('featured')}
          style={{ cursor: 'pointer' }}
          title={isKhmer ? 'ចុចដើម្បីមើលអត្ថបទលេចធ្លោ' : 'Click to view featured articles'}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: '#fefce8',
              border: '1px solid #fef08a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ca8a04',
              flexShrink: 0,
            }}
          >
            <Star size={24} fill="#ca8a04" />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              {isKhmer ? 'អត្ថបទលេចធ្លោ' : 'Featured Highlights'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#07294D', lineHeight: 1.2 }}>
              {stats.featured}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#ea580c', fontWeight: 600, marginTop: '2px' }}>
              {isKhmer ? 'រំលេចលើទំព័រដើម & ប្លុក' : 'Featured on Home & Blog'}
            </div>
          </div>
        </div>

        {/* KPI 3: Total Views */}
        <div className="admin-kpi-card">
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
              flexShrink: 0,
            }}
          >
            <Eye size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              {isKhmer ? 'ចំនួនទស្សនាសរុប' : 'Total Reader Views'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#07294D', lineHeight: 1.2 }}>
              {stats.totalViews.toLocaleString()}+
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
              {isKhmer ? 'ការចូលអានជាក់ស្តែង' : 'Recorded page views'}
            </div>
          </div>
        </div>

        {/* KPI 4: Active Categories */}
        <div className="admin-kpi-card">
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: '#faf5ff',
              border: '1px solid #e9d5ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7c3aed',
              flexShrink: 0,
            }}
          >
            <FolderTree size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              {isKhmer ? 'ប្រភេទព័ត៌មាន' : 'Categories'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#07294D', lineHeight: 1.2 }}>
              {stats.activeCategories}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
              {isKhmer ? `${stats.drafts} អត្ថបទព្រាងទុក` : `${stats.drafts} unpublished drafts`}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Container with Filter Tabs & Controls */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Dynamic Category & Status Filter Tabs Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #f1f5f9',
            padding: '0 20px',
            gap: '6px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            background: '#fafafa',
          }}
        >
          {/* Tab: All */}
          <button
            onClick={() => setActiveTab('all')}
            style={{
              padding: '14px 16px',
              border: 'none',
              background: 'transparent',
              fontSize: '0.88rem',
              fontWeight: activeTab === 'all' ? 700 : 600,
              color: activeTab === 'all' ? '#1e73be' : '#64748b',
              borderBottom: activeTab === 'all' ? '2.5px solid #1e73be' : '2.5px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{isKhmer ? 'ទាំងអស់' : 'All Articles'}</span>
            <span
              style={{
                fontSize: '0.74rem',
                padding: '2px 8px',
                borderRadius: '12px',
                background: activeTab === 'all' ? '#eff6ff' : '#e2e8f0',
                color: activeTab === 'all' ? '#1e73be' : '#64748b',
                fontWeight: 700,
              }}
            >
              {posts.length}
            </span>
          </button>

          {/* Tab: Featured */}
          <button
            onClick={() => setActiveTab('featured')}
            style={{
              padding: '14px 16px',
              border: 'none',
              background: 'transparent',
              fontSize: '0.88rem',
              fontWeight: activeTab === 'featured' ? 700 : 600,
              color: activeTab === 'featured' ? '#ca8a04' : '#64748b',
              borderBottom: activeTab === 'featured' ? '2.5px solid #ca8a04' : '2.5px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <Star size={14} fill={activeTab === 'featured' ? '#ca8a04' : 'none'} color="#ca8a04" />
            <span>{isKhmer ? 'អត្ថបទលេចធ្លោ' : 'Featured'}</span>
            <span
              style={{
                fontSize: '0.74rem',
                padding: '2px 8px',
                borderRadius: '12px',
                background: activeTab === 'featured' ? '#fef9c3' : '#e2e8f0',
                color: activeTab === 'featured' ? '#ca8a04' : '#64748b',
                fontWeight: 700,
              }}
            >
              {stats.featured}
            </span>
          </button>

          {/* Tab: Published */}
          <button
            onClick={() => setActiveTab('published')}
            style={{
              padding: '14px 16px',
              border: 'none',
              background: 'transparent',
              fontSize: '0.88rem',
              fontWeight: activeTab === 'published' ? 700 : 600,
              color: activeTab === 'published' ? '#059669' : '#64748b',
              borderBottom: activeTab === 'published' ? '2.5px solid #059669' : '2.5px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{isKhmer ? '🟢 បានផ្សាយ' : 'Published'}</span>
            <span
              style={{
                fontSize: '0.74rem',
                padding: '2px 8px',
                borderRadius: '12px',
                background: activeTab === 'published' ? '#dcfce7' : '#e2e8f0',
                color: activeTab === 'published' ? '#059669' : '#64748b',
                fontWeight: 700,
              }}
            >
              {stats.published}
            </span>
          </button>

          {/* Tab: Drafts */}
          <button
            onClick={() => setActiveTab('draft')}
            style={{
              padding: '14px 16px',
              border: 'none',
              background: 'transparent',
              fontSize: '0.88rem',
              fontWeight: activeTab === 'draft' ? 700 : 600,
              color: activeTab === 'draft' ? '#475569' : '#64748b',
              borderBottom: activeTab === 'draft' ? '2.5px solid #475569' : '2.5px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{isKhmer ? '⚪ ព្រាងទុក' : 'Drafts'}</span>
            <span
              style={{
                fontSize: '0.74rem',
                padding: '2px 8px',
                borderRadius: '12px',
                background: activeTab === 'draft' ? '#f1f5f9' : '#e2e8f0',
                color: activeTab === 'draft' ? '#334155' : '#64748b',
                fontWeight: 700,
              }}
            >
              {stats.drafts}
            </span>
          </button>

          {/* Dynamic Category Tabs */}
          {categories.map((c) => {
            const count = posts.filter((p) => (p.categoryId || p.category?.id) === c.id).length;
            const isCatActive = activeTab === String(c.id);
            return (
              <button
                key={c.id}
                onClick={() => setActiveTab(String(c.id))}
                style={{
                  padding: '14px 16px',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '0.88rem',
                  fontWeight: isCatActive ? 700 : 600,
                  color: isCatActive ? '#7c3aed' : '#64748b',
                  borderBottom: isCatActive ? '2.5px solid #7c3aed' : '2.5px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{c.name}</span>
                <span
                  style={{
                    fontSize: '0.74rem',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: isCatActive ? '#faf5ff' : '#e2e8f0',
                    color: isCatActive ? '#7c3aed' : '#64748b',
                    fontWeight: 700,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Controls & Search Bar */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            borderBottom: '1px solid #f1f5f9',
            background: '#ffffff',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', width: '360px', maxWidth: '100%' }}>
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
              placeholder={isKhmer ? 'ស្វែងរកតាមចំណងជើង, ពាក្យគន្លឹះ, អ្នកនិពន្ធ...' : 'Search articles by headline, keyword, author...'}
              style={{
                width: '100%',
                padding: '9px 36px 9px 36px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                fontSize: '0.88rem',
                outline: 'none',
                background: '#f8fafc',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#1e73be')}
              onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Right Controls: Sort & View Mode */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', color: '#64748b' }}>
              <SlidersHorizontal size={14} />
              <span>{isKhmer ? 'តម្រៀប ៖' : 'Sort:'}</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.86rem',
                  outline: 'none',
                  background: '#fff',
                  color: '#334155',
                  cursor: 'pointer',
                }}
              >
                <option value="newest">{isKhmer ? 'កាលបរិច្ឆេទថ្មីបំផុត' : 'Newest Published'}</option>
                <option value="views">{isKhmer ? 'ចំនួនទស្សនាច្រើនបំផុត' : 'Most Viewed'}</option>
                <option value="title">{isKhmer ? 'ចំណងជើង (A-Z)' : 'Title (A-Z)'}</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div
              style={{
                display: 'flex',
                background: '#f1f5f9',
                borderRadius: '8px',
                padding: '3px',
                border: '1px solid #e2e8f0',
              }}
            >
              <button
                onClick={() => setViewMode('table')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'table' ? '#ffffff' : 'transparent',
                  color: viewMode === 'table' ? '#07294D' : '#64748b',
                  fontSize: '0.82rem',
                  fontWeight: viewMode === 'table' ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
                title={isKhmer ? 'ទិដ្ឋភាពតារាង' : 'Table View'}
              >
                <List size={14} />
                <span>{isKhmer ? 'តារាង' : 'Table'}</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'grid' ? '#ffffff' : 'transparent',
                  color: viewMode === 'grid' ? '#07294D' : '#64748b',
                  fontSize: '0.82rem',
                  fontWeight: viewMode === 'grid' ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
                title={isKhmer ? 'ទិដ្ឋភាពកាត' : 'Grid View'}
              >
                <LayoutGrid size={14} />
                <span>{isKhmer ? 'កាត' : 'Cards'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area: Table View vs Visual Card Grid */}
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
            <RotateCw size={28} className="animate-spin" style={{ margin: '0 auto 12px auto', color: '#1e73be' }} />
            <div>{isKhmer ? 'កំពុងទាញយកទិន្នន័យអត្ថបទព័ត៌មាន...' : 'Loading blog posts...'}</div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div style={{ padding: '70px 20px', textAlign: 'center', color: '#94a3b8' }}>
            <Newspaper size={44} style={{ margin: '0 auto 14px auto', opacity: 0.4 }} />
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
              {isKhmer ? 'មិនមានអត្ថបទព័ត៌មាននៅក្នុងលក្ខខណ្ឌនេះទេ' : 'No articles found matching criteria'}
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem' }}>
              {isKhmer ? 'សូមសាកល្បងផ្លាស់ប្តូរពាក្យគន្លឹះ ឬជ្រើសរើសប្រភេទផ្សេង' : 'Try adjusting your search keywords or switching category tabs.'}
            </p>
            <button
              onClick={openAddModal}
              className="admin-btn admin-btn-primary admin-btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} />
              <span>{isKhmer ? 'សរសេរអត្ថបទថ្មី' : 'Write First Article'}</span>
            </button>
          </div>
        ) : viewMode === 'table' ? (
          <>
            {/* Desktop Table View (hidden on <= 768px via admin.css) */}
            <div className="admin-table-wrapper admin-blog-desktop-table" style={{ width: '100%', overflowX: 'auto' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
                      {isKhmer ? 'ចំណងជើង & សេចក្តីសង្ខេប' : 'Article Title & Excerpt'}
                    </th>
                    <th style={{ padding: '12px 12px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 700, color: '#475569', width: '130px' }}>
                      {isKhmer ? 'ប្រភេទ' : 'Category'}
                    </th>
                    <th style={{ padding: '12px 12px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 700, color: '#475569', width: '145px' }}>
                      {isKhmer ? 'អ្នកនិពន្ធ & កាលបរិច្ឆេទ' : 'Author & Date'}
                    </th>
                    <th style={{ padding: '12px 10px', textAlign: 'center', fontSize: '0.82rem', fontWeight: 700, color: '#475569', width: '100px' }}>
                      {isKhmer ? 'ស្ថានភាព' : 'Status'}
                    </th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '0.82rem', fontWeight: 700, color: '#475569', width: '60px' }}>
                      {isKhmer ? 'លេចធ្លោ' : 'Featured'}
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.82rem', fontWeight: 700, color: '#475569', width: '135px' }}>
                      {isKhmer ? 'សកម្មភាព' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => {
                    const isPub = post.status === 'published' || post.isPublished !== false;
                    const isFeatured = Boolean(post.featured);
                    const isBusy = actionLoadingId === post.id;
                    const postDate = post.publishedAt || post.createdAt;
                    const authorName = post.author || post.authorUser?.fullName || post.authorUser?.username || 'RPITSSR Newsroom';

                    return (
                      <tr
                        key={post.id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {/* Title & Thumbnail */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              style={{
                                position: 'relative',
                                width: '54px',
                                height: '40px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                flexShrink: 0,
                                border: '1px solid #e2e8f0',
                                background: '#f8fafc',
                              }}
                            >
                              <img
                                src={post.imageUrl || '/images/blog/b-1.webp'}
                                alt=""
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.src = '/images/blog/b-1.webp';
                                }}
                              />
                              {isFeatured && (
                                <span
                                  title={isKhmer ? 'អត្ថបទលេចធ្លោ' : 'Featured Article'}
                                  style={{
                                    position: 'absolute',
                                    top: '2px',
                                    right: '2px',
                                    background: '#f59e0b',
                                    color: '#fff',
                                    borderRadius: '50%',
                                    width: '15px',
                                    height: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                  }}
                                >
                                  <Star size={9} fill="#fff" />
                                </span>
                              )}
                            </div>

                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div
                                onClick={() => openPreview(post)}
                                style={{
                                  fontWeight: 700,
                                  color: '#07294D',
                                  fontSize: '0.92rem',
                                  marginBottom: '3px',
                                  cursor: 'pointer',
                                  lineHeight: 1.35,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  wordBreak: 'break-word',
                                  transition: 'color 0.15s ease',
                                }}
                                title={post.title}
                                onMouseEnter={(e) => (e.currentTarget.style.color = '#1e73be')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = '#07294D')}
                              >
                                {post.title}
                              </div>
                              <div
                                style={{
                                  fontSize: '0.78rem',
                                  color: '#64748b',
                                  lineHeight: 1.35,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {stripHtml(post.excerpt || post.content || '') || (isKhmer ? 'មិនមានសេចក្តីសង្ខេប' : 'No excerpt available')}
                              </div>
                              {post.slug && (
                                <div style={{ marginTop: '3px' }}>
                                  <span className="admin-blog-slug-pill" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>
                                    /{post.slug}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td style={{ padding: '12px 12px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: '#eff6ff',
                              color: '#1e73be',
                              border: '1px solid #dbeafe',
                              maxWidth: '125px',
                            }}
                            title={post.category?.name || (isKhmer ? 'ព័ត៌មានទូទៅ' : 'General News')}
                          >
                            <FolderTree size={11} style={{ flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {post.category?.name || (isKhmer ? 'ព័ត៌មានទូទៅ' : 'General News')}
                            </span>
                          </span>
                        </td>

                        {/* Author & Date */}
                        <td style={{ padding: '12px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                            <span
                              style={{
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: '#334155',
                                maxWidth: '85px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={authorName}
                            >
                              {authorName}
                            </span>
                            <span
                              className="admin-blog-views-pill"
                              style={{ fontSize: '0.68rem', padding: '1px 5px', gap: '3px' }}
                              title={isKhmer ? `${post.viewCount || 0} ការទស្សនា` : `${post.viewCount || 0} views`}
                            >
                              <Eye size={10} /> {post.viewCount || 0}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#64748b' }}>
                            <Calendar size={11} style={{ color: '#94a3b8', flexShrink: 0 }} />
                            <span style={{ whiteSpace: 'nowrap' }}>
                              {postDate ? new Date(postDate).toLocaleDateString('en-GB') : 'N/A'}
                            </span>
                          </div>
                        </td>

                        {/* Status Toggle */}
                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleToggleStatus(post)}
                            disabled={isBusy}
                            style={{
                              border: 'none',
                              cursor: 'pointer',
                              padding: '3px 8px',
                              borderRadius: '20px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: isPub ? '#f0fdf4' : '#f8fafc',
                              color: isPub ? '#166534' : '#64748b',
                              border: isPub ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                              transition: 'all 0.2s',
                              whiteSpace: 'nowrap',
                            }}
                            title={isKhmer ? 'ចុចដើម្បីផ្លាស់ប្តូរស្ថានភាព' : 'Click to toggle status'}
                          >
                            <span
                              style={{
                                width: '5px',
                                height: '5px',
                                borderRadius: '50%',
                                background: isPub ? '#16a34a' : '#94a3b8',
                                flexShrink: 0,
                              }}
                            />
                            <span>{isPub ? (isKhmer ? 'បានផ្សាយ' : 'Published') : (isKhmer ? 'ព្រាងទុក' : 'Draft')}</span>
                          </button>
                        </td>

                        {/* Featured Star Toggle */}
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleToggleFeatured(post)}
                            disabled={isBusy}
                            style={{
                              border: isFeatured ? '1px solid #fef08a' : '1px solid #e2e8f0',
                              background: isFeatured ? '#fefce8' : '#f8fafc',
                              cursor: 'pointer',
                              padding: '5px',
                              borderRadius: '6px',
                              color: isFeatured ? '#ca8a04' : '#94a3b8',
                              transition: 'all 0.15s ease',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title={isFeatured ? (isKhmer ? 'ដករំលេច' : 'Unfeature') : (isKhmer ? 'រំលេចអត្ថបទនេះ' : 'Feature this article')}
                          >
                            <Star size={14} fill={isFeatured ? '#ca8a04' : 'none'} />
                          </button>
                        </td>

                        {/* Action Buttons */}
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                            <button
                              onClick={() => openPreview(post)}
                              className="admin-btn admin-btn-outline admin-btn-sm"
                              title={isKhmer ? 'មើលលម្អិត' : 'Preview Details'}
                              style={{ width: '28px', height: '28px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
                            >
                              <Eye size={13} />
                            </button>
                            <a
                              href={`/blog-details/${post.slug || post.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="admin-btn admin-btn-outline admin-btn-sm"
                              title={isKhmer ? 'មើលលើគេហទំព័រផ្ទាល់' : 'View Public Post'}
                              style={{ width: '28px', height: '28px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', textDecoration: 'none' }}
                            >
                              <ExternalLink size={13} />
                            </a>
                            <button
                              onClick={() => openEditModal(post)}
                              className="admin-btn admin-btn-outline admin-btn-sm"
                              title={isKhmer ? 'កែសម្រួល' : 'Edit Article'}
                              style={{ width: '28px', height: '28px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => confirmDelete(post)}
                              className="admin-btn admin-btn-danger admin-btn-sm"
                              title={isKhmer ? 'លុប' : 'Delete Article'}
                              style={{ width: '28px', height: '28px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (< 768px via admin.css) */}
            <div className="admin-blog-mobile-cards">
              {filteredPosts.map((post) => {
                const isPub = post.status === 'published' || post.isPublished !== false;
                const isFeatured = Boolean(post.featured);
                const isBusy = actionLoadingId === post.id;
                const postDate = post.publishedAt || post.createdAt;
                const authorName = post.author || post.authorUser?.fullName || post.authorUser?.username || 'RPITSSR Newsroom';

                return (
                  <div key={post.id} className="admin-blog-card">
                    {/* Card Cover Image & Badges */}
                    <div style={{ position: 'relative', height: '140px', overflow: 'hidden', background: '#e2e8f0' }}>
                      <img
                        src={post.imageUrl || '/images/blog/b-1.webp'}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = '/images/blog/b-1.webp';
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          display: 'flex',
                          gap: '6px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{
                            background: 'rgba(7, 41, 77, 0.88)',
                            backdropFilter: 'blur(4px)',
                            color: '#ffffff',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                          }}
                        >
                          {post.category?.name || (isKhmer ? 'ព័ត៌មានទូទៅ' : 'News')}
                        </span>
                        {isFeatured && (
                          <span className="admin-blog-featured-pill" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                            <Star size={10} fill="#b45309" />
                            <span>{isKhmer ? 'លេចធ្លោ' : 'Featured'}</span>
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          background: 'rgba(0, 0, 0, 0.65)',
                          backdropFilter: 'blur(4px)',
                          color: '#ffffff',
                          padding: '2px 7px',
                          borderRadius: '12px',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <Eye size={11} /> {post.viewCount || 0}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {/* Meta: Author & Date */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: '#64748b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <User size={12} style={{ color: '#94a3b8', flexShrink: 0 }} />
                          <span style={{ fontWeight: 600, color: '#334155' }}>{authorName}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                          <Calendar size={12} style={{ color: '#94a3b8' }} />
                          <span>{postDate ? new Date(postDate).toLocaleDateString('en-GB') : 'N/A'}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h4
                        onClick={() => openPreview(post)}
                        style={{
                          fontSize: '0.94rem',
                          fontWeight: 700,
                          color: '#07294D',
                          margin: 0,
                          lineHeight: 1.4,
                          cursor: 'pointer',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                        title={post.title}
                      >
                        {post.title}
                      </h4>

                      {/* Excerpt */}
                      <p
                        style={{
                          fontSize: '0.8rem',
                          color: '#64748b',
                          lineHeight: 1.45,
                          margin: 0,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {stripHtml(post.excerpt || post.content || '') || (isKhmer ? 'មិនមានសេចក្តីសង្ខេប' : 'No excerpt available')}
                      </p>

                      {/* Slug pill if available */}
                      {post.slug && (
                        <div>
                          <span className="admin-blog-slug-pill" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                            /{post.slug}
                          </span>
                        </div>
                      )}

                      {/* Card Footer Controls */}
                      <div
                        style={{
                          paddingTop: '10px',
                          borderTop: '1px dashed #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        {/* Status & Featured Quick Toggles */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => handleToggleStatus(post)}
                            disabled={isBusy}
                            style={{
                              cursor: 'pointer',
                              padding: '3px 8px',
                              borderRadius: '20px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: isPub ? '#f0fdf4' : '#f8fafc',
                              color: isPub ? '#166534' : '#64748b',
                              border: isPub ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                            }}
                          >
                            <span
                              style={{
                                width: '5px',
                                height: '5px',
                                borderRadius: '50%',
                                background: isPub ? '#16a34a' : '#94a3b8',
                              }}
                            />
                            <span>{isPub ? (isKhmer ? 'បានផ្សាយ' : 'Published') : (isKhmer ? 'ព្រាងទុក' : 'Draft')}</span>
                          </button>

                          <button
                            onClick={() => handleToggleFeatured(post)}
                            disabled={isBusy}
                            style={{
                              border: isFeatured ? '1px solid #fef08a' : '1px solid #e2e8f0',
                              background: isFeatured ? '#fefce8' : '#f8fafc',
                              cursor: 'pointer',
                              padding: '4px 6px',
                              borderRadius: '6px',
                              color: isFeatured ? '#ca8a04' : '#94a3b8',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title={isFeatured ? (isKhmer ? 'ដករំលេច' : 'Unfeature') : (isKhmer ? 'រំលេច' : 'Feature')}
                          >
                            <Star size={12} fill={isFeatured ? '#ca8a04' : 'none'} />
                          </button>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            onClick={() => openPreview(post)}
                            className="admin-btn admin-btn-outline admin-btn-sm"
                            title={isKhmer ? 'មើលលម្អិត' : 'Preview Details'}
                            style={{ width: '28px', height: '28px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
                          >
                            <Eye size={13} />
                          </button>
                          <a
                            href={`/blog-details/${post.slug || post.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-btn admin-btn-outline admin-btn-sm"
                            title={isKhmer ? 'មើលលើគេហទំព័រផ្ទាល់' : 'View Public Post'}
                            style={{ width: '28px', height: '28px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', textDecoration: 'none' }}
                          >
                            <ExternalLink size={13} />
                          </a>
                          <button
                            onClick={() => openEditModal(post)}
                            className="admin-btn admin-btn-outline admin-btn-sm"
                            title={isKhmer ? 'កែសម្រួល' : 'Edit Article'}
                            style={{ width: '28px', height: '28px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => confirmDelete(post)}
                            className="admin-btn admin-btn-danger admin-btn-sm"
                            title={isKhmer ? 'លុប' : 'Delete Article'}
                            style={{ width: '28px', height: '28px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
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
          </>
        ) : (
          /* Visual Card Grid View */
          <div
            style={{
              padding: 'clamp(14px, 3vw, 24px)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
              background: '#f8fafc',
            }}
          >
            {filteredPosts.map((post) => {
              const isPub = post.status === 'published' || post.isPublished !== false;
              const isFeatured = Boolean(post.featured);
              const postDate = post.publishedAt || post.createdAt;
              const authorName = post.author || post.authorUser?.fullName || post.authorUser?.username || 'RPITSSR Newsroom';

              return (
                <div key={post.id} className="admin-blog-card">
                  {/* Card Cover Image */}
                  <div style={{ position: 'relative', height: '170px', overflow: 'hidden', background: '#e2e8f0' }}>
                    <img
                      src={post.imageUrl || '/images/blog/b-1.webp'}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = '/images/blog/b-1.webp';
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        display: 'flex',
                        gap: '6px',
                      }}
                    >
                      <span
                        style={{
                          background: 'rgba(7, 41, 77, 0.85)',
                          backdropFilter: 'blur(4px)',
                          color: '#ffffff',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        {post.category?.name || 'News'}
                      </span>
                      {isFeatured && (
                        <span className="admin-blog-featured-pill">
                          <Star size={11} fill="#b45309" />
                          <span>{isKhmer ? 'លេចធ្លោ' : 'Featured'}</span>
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        background: 'rgba(0, 0, 0, 0.65)',
                        backdropFilter: 'blur(4px)',
                        color: '#ffffff',
                        padding: '2px 8px',
                        borderRadius: '20px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Eye size={12} /> {post.viewCount || 0}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: '#64748b', marginBottom: '8px' }}>
                      <Calendar size={12} />
                      <span>{postDate ? new Date(postDate).toLocaleDateString() : 'N/A'}</span>
                      <span>•</span>
                      <User size={12} />
                      <span>{authorName}</span>
                    </div>

                    <h3
                      onClick={() => openPreview(post)}
                      style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#07294D',
                        margin: '0 0 8px 0',
                        lineHeight: 1.4,
                        cursor: 'pointer',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                      title={post.title}
                    >
                      {post.title}
                    </h3>

                    <p
                      style={{
                        fontSize: '0.84rem',
                        color: '#64748b',
                        lineHeight: 1.5,
                        margin: '0 0 14px 0',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        flex: 1,
                      }}
                    >
                      {stripHtml(post.excerpt || post.content || '')}
                    </p>

                    {/* Card Footer Controls */}
                    <div
                      style={{
                        paddingTop: '12px',
                        borderTop: '1px dashed #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      {/* Status Toggle on card */}
                      <button
                        onClick={() => handleToggleStatus(post)}
                        style={{
                          border: 'none',
                          cursor: 'pointer',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: isPub ? '#f0fdf4' : '#f8fafc',
                          color: isPub ? '#166534' : '#64748b',
                          border: isPub ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                        }}
                      >
                        {isPub ? (isKhmer ? '🟢 បានផ្សាយ' : 'Published') : (isKhmer ? '⚪ ព្រាងទុក' : 'Draft')}
                      </button>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => openPreview(post)}
                          className="admin-btn admin-btn-outline admin-btn-sm"
                          style={{ padding: '5px 8px' }}
                          title={isKhmer ? 'មើលលម្អិត' : 'Preview'}
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => openEditModal(post)}
                          className="admin-btn admin-btn-outline admin-btn-sm"
                          style={{ padding: '5px 8px' }}
                          title={isKhmer ? 'កែសម្រួល' : 'Edit'}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => confirmDelete(post)}
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          style={{ padding: '5px 8px' }}
                          title={isKhmer ? 'លុប' : 'Delete'}
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
        )}

        {/* Footer Summary */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.84rem',
            color: '#64748b',
            background: '#fafafa',
          }}
        >
          <div>
            {isKhmer
              ? `បង្ហាញ ${filteredPosts.length} ក្នុងចំណោមអត្ថបទសរុប ${posts.length}`
              : `Showing ${filteredPosts.length} of ${posts.length} total articles`}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span>
              {isKhmer ? `⭐ ${stats.featured} លេចធ្លោ` : `⭐ ${stats.featured} featured`}
            </span>
            <span>•</span>
            <span>
              {isKhmer ? `👁️ ${stats.totalViews.toLocaleString()} ទស្សនាសរុប` : `👁️ ${stats.totalViews.toLocaleString()} total views`}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Article Detail & Reader Lightbox Modal */}
      {previewModalOpen && previewPost && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 41, 77, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: '20px',
          }}
          onClick={() => setPreviewModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '820px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 24px 48px rgba(7, 41, 77, 0.25)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Cover */}
            <div style={{ position: 'relative', height: '240px', background: '#07294D' }}>
              <img
                src={previewPost.imageUrl || '/images/blog/b-1.webp'}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                onError={(e) => {
                  e.target.src = '/images/blog/b-1.webp';
                }}
              />
              <button
                onClick={() => setPreviewModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(0,0,0,0.5)',
                  border: 'none',
                  color: '#fff',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <X size={18} />
              </button>

              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '20px',
                  right: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                }}
              >
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      background: 'rgba(7, 41, 77, 0.85)',
                      backdropFilter: 'blur(4px)',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    {previewPost.category?.name || 'News'}
                  </span>
                  {previewPost.featured && (
                    <span className="admin-blog-featured-pill">
                      <Star size={12} fill="#b45309" />
                      <span>{isKhmer ? 'អត្ថបទលេចធ្លោ' : 'Featured Highlight'}</span>
                    </span>
                  )}
                  <span
                    style={{
                      background: previewPost.status === 'published' ? '#166534' : '#475569',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    {previewPost.status === 'published' ? (isKhmer ? '🟢 បានផ្សាយ' : 'Published') : (isKhmer ? '⚪ ព្រាងទុក' : 'Draft')}
                  </span>
                </div>

                <span
                  style={{
                    background: 'rgba(0,0,0,0.65)',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Eye size={13} /> {previewPost.viewCount || 0} {isKhmer ? 'ទស្សនា' : 'views'}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 28px' }}>
              {/* Meta Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '0.84rem',
                  color: '#64748b',
                  marginBottom: '14px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={14} style={{ color: '#1e73be' }} />
                  <span>
                    {previewPost.publishedAt || previewPost.createdAt
                      ? new Date(previewPost.publishedAt || previewPost.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
                <span>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <User size={14} style={{ color: '#1e73be' }} />
                  <span>{previewPost.author || previewPost.authorUser?.fullName || 'RPITSSR Newsroom'}</span>
                </div>
                {previewPost.slug && (
                  <>
                    <span>•</span>
                    <span className="admin-blog-slug-pill">/{previewPost.slug}</span>
                  </>
                )}
              </div>

              {/* Title */}
              <h2
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  color: '#07294D',
                  lineHeight: 1.4,
                  margin: '0 0 16px 0',
                }}
              >
                {previewPost.title}
              </h2>

              {/* Excerpt Box */}
              {previewPost.excerpt && (
                <div
                  style={{
                    background: '#eff6ff',
                    borderLeft: '4px solid #1e73be',
                    borderRadius: '0 10px 10px 0',
                    padding: '14px 18px',
                    marginBottom: '20px',
                    fontSize: '0.92rem',
                    color: '#1e3a8a',
                    lineHeight: 1.6,
                    fontStyle: 'italic',
                  }}
                >
                  {stripHtml(previewPost.excerpt)}
                </div>
              )}

              {/* Article Full Content (Sanitized against XSS) */}
              <div
                className="admin-blog-reader-content"
                style={{
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '20px',
                  marginBottom: '24px',
                }}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(previewPost.content || previewPost.excerpt || '<p>No content written yet.</p>'),
                }}
              />

              {/* Tags */}
              {previewPost.tags && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
                  <Tag size={13} style={{ color: '#64748b' }} />
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{isKhmer ? 'ពាក្យគន្លឹះ ៖' : 'Tags:'}</span>
                  {previewPost.tags.split(',').map((t, i) => (
                    <span key={i} className="admin-blog-tag-chip">
                      #{t.trim()}
                    </span>
                  ))}
                </div>
              )}

              {/* Modal Actions */}
              <div
                style={{
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <a
                  href={`/blog-details/${previewPost.slug || previewPost.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-btn admin-btn-outline"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                >
                  <ExternalLink size={15} />
                  <span>{isKhmer ? 'មើលលើគេហទំព័រផ្ទាល់' : 'View on Live Website'}</span>
                </a>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      setPreviewModalOpen(false);
                      openEditModal(previewPost);
                    }}
                    className="admin-btn admin-btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Edit2 size={14} />
                    <span>{isKhmer ? 'កែសម្រួលអត្ថបទ' : 'Edit Article'}</span>
                  </button>
                  <button
                    onClick={() => setPreviewModalOpen(false)}
                    className="admin-btn admin-btn-outline"
                  >
                    {isKhmer ? 'បិទ' : 'Close'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Add / Edit Article Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingPost
            ? (isKhmer ? 'កែសម្រួលអត្ថបទព័ត៌មាន' : 'Edit News Article')
            : (isKhmer ? 'សរសេរអត្ថបទព័ត៌មានថ្មី' : 'Write New Article')
        }
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        maxWidth="780px"
      >
        {/* Headline */}
        <div className="admin-form-group">
          <label className="admin-form-label">
            {isKhmer ? 'ចំណងជើងអត្ថបទសារព័ត៌មាន *' : 'Article Headline *'}
          </label>
          <input
            type="text"
            className="admin-form-control"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder={isKhmer ? 'ឧទាហរណ៍ ៖ ដំណើរទស្សនកិច្ចសិក្សារបស់និស្សិត ឬ សេចក្ដីជូនដំណឹង...' : 'e.g. Annual Graduation Ceremony 2026 or Admission Notice...'}
          />
        </div>

        {/* Category & Slug */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'ប្រភេទព័ត៌មាន' : 'Category'}
            </label>
            <select
              className="admin-form-control"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            >
              <option value="">{isKhmer ? '-- ជ្រើសរើសប្រភេទ --' : 'Select Category'}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'URL Slug (បង្កើតស្វ័យប្រវត្តបើទុកទទេ)' : 'URL Slug (Auto-generated if empty)'}
            </label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g. graduation-ceremony-2026"
            />
          </div>
        </div>

        {/* Featured Image URL & Upload */}
        <div className="admin-form-group">
          <label className="admin-form-label">
            {isKhmer ? 'រូបភាពតំណាង (Cover Image)' : 'Featured Cover Image'}
          </label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="text"
              className="admin-form-control"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="/images/blog/b-1.webp or /uploads/blog/..."
            />
            <label
              className="admin-btn admin-btn-outline"
              style={{
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                height: '40px',
              }}
            >
              <Upload size={14} />
              <span>{uploading ? (isKhmer ? 'កំពុងបញ្ចូល...' : 'Uploading...') : (isKhmer ? 'ជ្រើសរូបភាព' : 'Upload')}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
          </div>

          {formData.imageUrl && (
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={formData.imageUrl}
                alt="Preview"
                style={{
                  width: '90px',
                  height: '56px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                {isKhmer ? 'ទិដ្ឋភាពរូបភាពតំណាងជាក់ស្តែង' : 'Cover image preview'}
              </span>
            </div>
          )}
        </div>

        {/* Short Summary (Excerpt) */}
        <div className="admin-form-group">
          <label className="admin-form-label">
            {isKhmer ? 'សម្រង់សេចក្តីសង្ខេបខ្លី (Excerpt)' : 'Short Summary (Excerpt)'}
          </label>
          <textarea
            className="admin-form-control"
            rows={2}
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            placeholder={isKhmer ? 'សេចក្តីសង្ខេបខ្លី ១ ឬ ២ បន្ទាត់សម្រាប់បង្ហាញលើកាតព័ត៌មាន...' : 'Brief 1-2 sentence overview shown on news cards and search results...'}
          />
        </div>

        {/* Full Article Content */}
        <div className="admin-form-group">
          <label className="admin-form-label">
            {isKhmer ? 'ខ្លឹមសារអត្ថបទពេញលេញ * (ទ្រទ្រង់ HTML)' : 'Full Article Body Content * (HTML supported)'}
          </label>
          <textarea
            className="admin-form-control"
            rows={7}
            required
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder={isKhmer ? 'សរសេរខ្លឹមសារអត្ថបទព័ត៌មានលម្អិតនៅទីនេះ...' : 'Write complete article text here (paragraphs, links, formatting)...'}
          />
        </div>

        {/* Tags & Status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'ពាក្យគន្លឹះ (Tags - បំបែកដោយក្បៀស)' : 'Tags (Comma-separated)'}
            </label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="TVET, Admissions, Siem Reap, RPITSSR"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'ស្ថានភាពផ្សាយ' : 'Publication Status'}
            </label>
            <select
              className="admin-form-control"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="published">{isKhmer ? 'បានផ្សាយ (បង្ហាញជាសាធារណៈ)' : 'Published (Live Publicly)'}</option>
              <option value="draft">{isKhmer ? 'ព្រាងទុក (ឯកជន / លាក់បណ្តោះអាសន្ន)' : 'Draft (Private / Hidden)'}</option>
            </select>
          </div>
        </div>

        {/* Featured Checkbox */}
        <div
          className="admin-form-group"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '8px',
            padding: '12px 16px',
            background: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: '10px',
          }}
        >
          <input
            type="checkbox"
            id="postFeaturedCheck"
            checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label
            htmlFor="postFeaturedCheck"
            style={{
              margin: 0,
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#92400e',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Star size={15} fill="#d97706" color="#d97706" />
            <span>
              {isKhmer
                ? 'រំលេចជាអត្ថបទពិសេស (បង្ហាញលើផ្ទាំងធំទំព័រដើម & ផ្នែកលើនៃប្លុក)'
                : 'Pin as Featured Article (Highlight on Homepage hero banner & top of blog)'}
            </span>
          </label>
        </div>
      </AdminModal>

      {/* 6. Institutional Delete Confirmation Modal */}
      {deleteModalOpen && deletingPost && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 41, 77, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px',
          }}
          onClick={() => setDeleteModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#fef2f2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <Trash2 size={28} />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#07294D', margin: '0 0 8px 0' }}>
              {isKhmer ? 'តើអ្នកពិតជាចង់លុបអត្ថបទនេះមែនទេ?' : 'Delete News Article?'}
            </h3>

            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              {isKhmer ? (
                <>
                  អត្ថបទ <strong>"{deletingPost.title}"</strong> នឹងត្រូវលុបចេញពីប្រព័ន្ធ។ សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។
                </>
              ) : (
                <>
                  Article <strong>"{deletingPost.title}"</strong> will be permanently deleted. This action cannot be undone.
                </>
              )}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="admin-btn admin-btn-outline"
                style={{ minWidth: '100px' }}
              >
                {isKhmer ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                onClick={executeDelete}
                disabled={submitting}
                className="admin-btn admin-btn-danger"
                style={{ minWidth: '120px' }}
              >
                {submitting ? (isKhmer ? 'កំពុងលុប...' : 'Deleting...') : (isKhmer ? 'យល់ព្រមលុប' : 'Yes, Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
