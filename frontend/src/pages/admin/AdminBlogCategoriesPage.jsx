import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/client';
import { AdminModal } from '../../components/admin/AdminModal';
import { useLanguage } from '../../context/LanguageContext';
import {
  FolderTree,
  Plus,
  RotateCw,
  Search,
  X,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  LayoutGrid,
  List,
  SlidersHorizontal,
  FileText,
  Newspaper,
  Layers,
  ArrowUpRight,
  Eye,
  Hash,
  Sparkles,
} from 'lucide-react';

export const AdminBlogCategoriesPage = () => {
  const { currentLanguage, language } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [sortBy, setSortBy] = useState('order'); // 'order', 'posts_count', 'name'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Modals & Action states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [feedbackToast, setFeedbackToast] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    order: 0,
    status: 'active',
  });

  const showToast = (message, type = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3500);
  };

  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get('/admin/blog-categories');
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : (raw?.categories || raw?.data || []);
      setCategories(list);
    } catch (err) {
      console.error('Error fetching blog categories:', err);
      showToast(isKhmer ? 'បរាជ័យក្នុងការទាញយកប្រភេទព័ត៌មាន' : 'Failed to load categories.', 'error');
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
    const total = categories.length;
    const active = categories.filter((c) => c.status === 'active' || c.status === undefined || c.status === null).length;
    const inactive = total - active;
    const totalPosts = categories.reduce((sum, c) => sum + (Number(c.posts_count) || (c.posts ? c.posts.length : 0)), 0);

    // Top category by posts count
    let topCategory = null;
    if (categories.length > 0) {
      topCategory = [...categories].sort((a, b) => (Number(b.posts_count) || 0) - (Number(a.posts_count) || 0))[0];
    }

    return { total, active, inactive, totalPosts, topCategory };
  }, [categories]);

  // Filtering & Sorting
  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        // Status filter
        const isActive = cat.status === 'active' || cat.status === undefined || cat.status === null;
        if (statusFilter === 'active' && !isActive) return false;
        if (statusFilter === 'inactive' && isActive) return false;

        // Search term
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase().trim();
          const matchName = (cat.name || '').toLowerCase().includes(q);
          const matchSlug = (cat.slug || '').toLowerCase().includes(q);
          const matchDesc = (cat.description || '').toLowerCase().includes(q);
          return matchName || matchSlug || matchDesc;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'posts_count') {
          return (Number(b.posts_count) || 0) - (Number(a.posts_count) || 0);
        }
        if (sortBy === 'name') {
          return (a.name || '').localeCompare(b.name || '');
        }
        // Default order
        return (Number(a.order) || 0) - (Number(b.order) || 0);
      });
  }, [categories, statusFilter, searchTerm, sortBy]);

  // Quick Action: Toggle Status
  const handleToggleStatus = async (cat) => {
    setActionLoadingId(cat.id);
    try {
      const res = await api.post(`/admin/blog-categories/${cat.id}/toggle`);
      const newStatus = res.data?.status || (cat.status === 'active' ? 'inactive' : 'active');
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, status: newStatus } : c))
      );
      showToast(
        isKhmer
          ? `បានផ្លាស់ប្តូរស្ថានភាពប្រភេទ "${cat.name}" ទៅជា ${newStatus === 'active' ? 'សកម្ម' : 'អសកម្ម'}`
          : `Category "${cat.name}" status updated to ${newStatus}.`
      );
    } catch (err) {
      console.error('Failed to toggle category status:', err);
      // Fallback update
      try {
        const fallbackStatus = cat.status === 'active' ? 'inactive' : 'active';
        await api.put(`/admin/blog-categories/${cat.id}`, {
          ...cat,
          status: fallbackStatus,
        });
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, status: fallbackStatus } : c))
        );
        showToast(isKhmer ? 'បានកែប្រែស្ថានភាពជោគជ័យ' : 'Category status updated.', 'success');
      } catch (fallbackErr) {
        showToast(isKhmer ? 'បរាជ័យក្នុងការផ្លាស់ប្តូរស្ថានភាព' : 'Failed to update category status.', 'error');
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // Auto-generate slug helper
  const handleNameChange = (nameVal) => {
    const isNew = !editingCategory;
    const currentSlugIsAuto = !formData.slug || (editingCategory && formData.slug === editingCategory.slug);

    let newSlug = formData.slug;
    if (isNew || currentSlugIsAuto) {
      newSlug = nameVal
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
    }

    setFormData((prev) => ({
      ...prev,
      name: nameVal,
      slug: isNew ? newSlug : prev.slug,
    }));
  };

  // Add & Edit Handlers
  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      order: categories.length + 1,
      status: 'active',
    });
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      order: cat.order !== undefined ? cat.order : 0,
      status: cat.status === 'inactive' ? 'inactive' : 'active',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert(isKhmer ? 'សូមបញ្ចូលឈ្មោះប្រភេទ' : 'Please enter a category name.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug?.trim() || undefined,
        description: formData.description?.trim() || '',
        order: Number(formData.order) || 0,
        status: formData.status === 'inactive' ? 'inactive' : 'active',
      };

      if (editingCategory) {
        await api.put(`/admin/blog-categories/${editingCategory.id}`, payload);
        showToast(isKhmer ? 'បានកែសម្រួលប្រភេទដោយជោគជ័យ' : 'Category updated successfully.');
      } else {
        await api.post('/admin/blog-categories', payload);
        showToast(isKhmer ? 'បានបង្កើតប្រភេទថ្មីដោយជោគជ័យ' : 'Category created successfully.');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save category:', err);
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (isKhmer ? 'បរាជ័យក្នុងការរក្សាទុកប្រភេទ' : 'Failed to save category.');
      alert(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (cat) => {
    setDeletingCategory(cat);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!deletingCategory) return;
    setSubmitting(true);
    try {
      await api.delete(`/admin/blog-categories/${deletingCategory.id}`);
      showToast(isKhmer ? 'បានលុបប្រភេទដោយជោគជ័យ' : 'Category deleted successfully.');
      setDeleteModalOpen(false);
      setDeletingCategory(null);
      fetchData();
    } catch (err) {
      console.error('Failed to delete category:', err);
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        (isKhmer
          ? 'មិនអាចលុបប្រភេទនេះបានទេ ពីព្រោះមានអត្ថបទព័ត៌មានកំពុងភ្ជាប់ជាមួយ។ សូមផ្លាស់ប្តូរប្រភេទអត្ថបទជាមុនសិន។'
          : 'Cannot delete category that contains articles. Please reassign articles first.');
      alert(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Toast Feedback Notification */}
      {feedbackToast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 9999,
            background: feedbackToast.type === 'error' ? '#ef4444' : '#059669',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem',
            fontWeight: 600,
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          {feedbackToast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{feedbackToast.message}</span>
        </div>
      )}

      {/* 1. Institutional Header Banner */}
      <div className="admin-page-header" style={{ marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
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
              <FolderTree size={15} />
              <span>
                {isKhmer ? 'ប្រព័ន្ធគ្រប់គ្រងប្រភេទព័ត៌មាន & ប្លុកស្ថាប័ន' : 'Institutional Press & News Categories'}
              </span>
            </div>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#07294D',
                margin: '0 0 6px 0',
                letterSpacing: '-0.01em',
              }}
            >
              {isKhmer ? 'ប្រភេទអត្ថបទព័ត៌មាន & សេចក្តីប្រកាសស្ថាប័ន' : 'News & Press Categories'}
            </h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.94rem', maxWidth: '720px', lineHeight: 1.5 }}>
              {isKhmer
                ? 'ចាត់ចែងចំណាត់ថ្នាក់អត្ថបទព័ត៌មាន សេចក្តីប្រកាសសារព័ត៌មាន អាហារូបករណ៍ និងព្រឹត្តិការណ៍បណ្តុះបណ្តាលរបស់វិទ្យាស្ថាន RPITSSR។'
                : 'Manage classifications for blog posts, news articles, press releases, and scholarship announcements.'}
            </p>
          </div>

          {/* Top Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="admin-btn admin-btn-outline"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: '42px',
                padding: '0 16px',
                background: '#fff',
              }}
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
              <span>{isKhmer ? 'បង្កើតប្រភេទថ្មី' : 'New Category'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 4-Card Institutional KPI Metric Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        {/* KPI 1: Total Categories */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
          }}
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
            <FolderTree size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              {isKhmer ? 'ប្រភេទសរុប' : 'Total Categories'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#07294D', lineHeight: 1.2 }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#1e73be', fontWeight: 600, marginTop: '2px' }}>
              {isKhmer ? 'ចំណាត់ថ្នាក់ព័ត៌មានស្ថាប័ន' : 'Institutional classifications'}
            </div>
          </div>
        </div>

        {/* KPI 2: Active Categories */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
          }}
        >
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
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              {isKhmer ? 'ប្រភេទកំពុងសកម្ម' : 'Active Live'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#07294D', lineHeight: 1.2 }}>
              {stats.active}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
              {isKhmer ? `${stats.inactive} ប្រភេទអសកម្ម` : `${stats.inactive} inactive / hidden`}
            </div>
          </div>
        </div>

        {/* KPI 3: Total Connected Articles */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
          }}
        >
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
            <Newspaper size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              {isKhmer ? 'អត្ថបទកំពុងភ្ជាប់' : 'Total Linked Articles'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#07294D', lineHeight: 1.2 }}>
              {stats.totalPosts}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#7c3aed', fontWeight: 600, marginTop: '2px' }}>
              {isKhmer ? 'បោះពុម្ពក្នុងប្រព័ន្ធ' : 'Published across categories'}
            </div>
          </div>
        </div>

        {/* KPI 4: Top Category */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
          }}
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
            <Sparkles size={24} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              {isKhmer ? 'ប្រភេទអត្ថបទច្រើនបំផុត' : 'Top Category'}
            </div>
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#07294D',
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '170px',
              }}
              title={stats.topCategory?.name || 'N/A'}
            >
              {stats.topCategory ? stats.topCategory.name : 'N/A'}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#ea580c', fontWeight: 600, marginTop: '2px' }}>
              {stats.topCategory
                ? isKhmer
                  ? `${stats.topCategory.posts_count || 0} អត្ថបទបោះពុម្ព`
                  : `${stats.topCategory.posts_count || 0} published articles`
                : '--'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Content Container */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Filter Strip: Status Tabs */}
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
            onClick={() => setStatusFilter('all')}
            style={{
              padding: '14px 16px',
              border: 'none',
              background: 'transparent',
              fontSize: '0.88rem',
              fontWeight: statusFilter === 'all' ? 700 : 600,
              color: statusFilter === 'all' ? '#1e73be' : '#64748b',
              borderBottom: statusFilter === 'all' ? '2.5px solid #1e73be' : '2.5px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{isKhmer ? 'ទាំងអស់' : 'All Categories'}</span>
            <span
              style={{
                fontSize: '0.74rem',
                padding: '2px 8px',
                borderRadius: '12px',
                background: statusFilter === 'all' ? '#eff6ff' : '#e2e8f0',
                color: statusFilter === 'all' ? '#1e73be' : '#64748b',
                fontWeight: 700,
              }}
            >
              {categories.length}
            </span>
          </button>

          {/* Tab: Active */}
          <button
            onClick={() => setStatusFilter('active')}
            style={{
              padding: '14px 16px',
              border: 'none',
              background: 'transparent',
              fontSize: '0.88rem',
              fontWeight: statusFilter === 'active' ? 700 : 600,
              color: statusFilter === 'active' ? '#059669' : '#64748b',
              borderBottom: statusFilter === 'active' ? '2.5px solid #059669' : '2.5px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{isKhmer ? '🟢 សកម្ម' : 'Active'}</span>
            <span
              style={{
                fontSize: '0.74rem',
                padding: '2px 8px',
                borderRadius: '12px',
                background: statusFilter === 'active' ? '#dcfce7' : '#e2e8f0',
                color: statusFilter === 'active' ? '#059669' : '#64748b',
                fontWeight: 700,
              }}
            >
              {stats.active}
            </span>
          </button>

          {/* Tab: Inactive */}
          <button
            onClick={() => setStatusFilter('inactive')}
            style={{
              padding: '14px 16px',
              border: 'none',
              background: 'transparent',
              fontSize: '0.88rem',
              fontWeight: statusFilter === 'inactive' ? 700 : 600,
              color: statusFilter === 'inactive' ? '#475569' : '#64748b',
              borderBottom: statusFilter === 'inactive' ? '2.5px solid #475569' : '2.5px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{isKhmer ? '⚪ អសកម្ម' : 'Inactive'}</span>
            <span
              style={{
                fontSize: '0.74rem',
                padding: '2px 8px',
                borderRadius: '12px',
                background: statusFilter === 'inactive' ? '#f1f5f9' : '#e2e8f0',
                color: statusFilter === 'inactive' ? '#334155' : '#64748b',
                fontWeight: 700,
              }}
            >
              {stats.inactive}
            </span>
          </button>
        </div>

        {/* Filter Controls & Search */}
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
          <div style={{ position: 'relative', width: '340px', maxWidth: '100%' }}>
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
              placeholder={isKhmer ? 'ស្វែងរកតាមឈ្មោះប្រភេទ, Slug, ការពិពណ៌នា...' : 'Search categories by name, slug, description...'}
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

          {/* Right Controls: Sort & View Toggle */}
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
                <option value="order">{isKhmer ? 'លំដាប់បង្ហាញ (Order)' : 'Display Order'}</option>
                <option value="posts_count">{isKhmer ? 'អត្ថបទច្រើនបំផុត' : 'Most Articles'}</option>
                <option value="name">{isKhmer ? 'ឈ្មោះប្រភេទ (A-Z)' : 'Name (A-Z)'}</option>
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

        {/* Content Area: Table vs Grid */}
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
            <RotateCw size={28} className="animate-spin" style={{ margin: '0 auto 12px auto', color: '#1e73be' }} />
            <div>{isKhmer ? 'កំពុងទាញយកទិន្នន័យប្រភេទព័ត៌មាន...' : 'Loading categories...'}</div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div style={{ padding: '70px 20px', textAlign: 'center', color: '#94a3b8' }}>
            <FolderTree size={44} style={{ margin: '0 auto 14px auto', opacity: 0.4 }} />
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
              {isKhmer ? 'មិនមានប្រភេទព័ត៌មាននៅក្នុងលក្ខខណ្ឌនេះទេ' : 'No categories found matching criteria'}
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem' }}>
              {isKhmer ? 'សូមសាកល្បងស្វែងរកពាក្យគន្លឹះផ្សេង ឬបង្កើតប្រភេទថ្មី' : 'Try searching with different keywords or create a new category.'}
            </p>
            <button
              onClick={openAddModal}
              className="admin-btn admin-btn-primary admin-btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} />
              <span>{isKhmer ? 'បង្កើតប្រភេទថ្មី' : 'Create Category'}</span>
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View - Perfectly constrained with NO horizontal scrollbar */
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
                    {isKhmer ? 'ឈ្មោះប្រភេទ & សេចក្តីពិពណ៌នា' : 'Category Name & Details'}
                  </th>
                  <th style={{ padding: '12px 14px', textAlign: 'center', fontSize: '0.82rem', fontWeight: 700, color: '#475569', width: '90px' }}>
                    {isKhmer ? 'លំដាប់' : 'Order'}
                  </th>
                  <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 700, color: '#475569', width: '140px' }}>
                    {isKhmer ? 'ចំនួនអត្ថបទ' : 'Articles'}
                  </th>
                  <th style={{ padding: '12px 12px', textAlign: 'center', fontSize: '0.82rem', fontWeight: 700, color: '#475569', width: '110px' }}>
                    {isKhmer ? 'ស្ថានភាព' : 'Status'}
                  </th>
                  <th style={{ padding: '12px 18px', textAlign: 'right', fontSize: '0.82rem', fontWeight: 700, color: '#475569', width: '120px' }}>
                    {isKhmer ? 'សកម្មភាព' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((cat) => {
                  const isActive = cat.status === 'active' || cat.status === undefined || cat.status === null;
                  const isBusy = actionLoadingId === cat.id;
                  const postCount = Number(cat.posts_count) || (cat.posts ? cat.posts.length : 0);

                  return (
                    <tr
                      key={cat.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Name & Details */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '10px',
                              background: '#eff6ff',
                              border: '1px solid #dbeafe',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#1e73be',
                              flexShrink: 0,
                            }}
                          >
                            <FolderTree size={20} />
                          </div>

                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                              <span
                                onClick={() => openEditModal(cat)}
                                style={{
                                  fontWeight: 700,
                                  color: '#07294D',
                                  fontSize: '0.94rem',
                                  cursor: 'pointer',
                                  transition: 'color 0.15s',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = '#1e73be')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = '#07294D')}
                              >
                                {cat.name}
                              </span>

                              {cat.slug && (
                                <span
                                  className="admin-blog-slug-pill"
                                  style={{ fontSize: '0.7rem', padding: '1px 6px' }}
                                >
                                  /{cat.slug}
                                </span>
                              )}
                            </div>

                            <div
                              style={{
                                fontSize: '0.8rem',
                                color: '#64748b',
                                lineHeight: 1.4,
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {cat.description || (isKhmer ? 'មិនមានសេចក្តីពិពណ៌នាបន្ថែម' : 'No description provided')}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Display Order */}
                      <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '28px',
                            height: '24px',
                            borderRadius: '6px',
                            background: '#f1f5f9',
                            color: '#475569',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          #{cat.order !== undefined ? cat.order : 0}
                        </span>
                      </td>

                      {/* Associated Articles */}
                      <td style={{ padding: '14px 14px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            background: postCount > 0 ? '#eff6ff' : '#f8fafc',
                            color: postCount > 0 ? '#1e73be' : '#94a3b8',
                            border: postCount > 0 ? '1px solid #dbeafe' : '1px solid #e2e8f0',
                          }}
                        >
                          <Newspaper size={13} />
                          <span>
                            {postCount} {isKhmer ? 'អត្ថបទ' : 'articles'}
                          </span>
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleToggleStatus(cat)}
                          disabled={isBusy}
                          style={{
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: isActive ? '#f0fdf4' : '#f8fafc',
                            color: isActive ? '#166534' : '#64748b',
                            border: isActive ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap',
                          }}
                          title={isKhmer ? 'ចុចដើម្បីផ្លាស់ប្តូរស្ថានភាព' : 'Click to toggle status'}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: isActive ? '#16a34a' : '#94a3b8',
                              flexShrink: 0,
                            }}
                          />
                          <span>{isActive ? (isKhmer ? 'សកម្ម' : 'Active') : (isKhmer ? 'អសកម្ម' : 'Inactive')}</span>
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px' }}>
                          <button
                            onClick={() => openEditModal(cat)}
                            className="admin-btn admin-btn-outline admin-btn-sm"
                            title={isKhmer ? 'កែសម្រួល' : 'Edit Category'}
                            style={{ width: '30px', height: '30px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => confirmDelete(cat)}
                            className="admin-btn admin-btn-danger admin-btn-sm"
                            title={isKhmer ? 'លុប' : 'Delete Category'}
                            style={{ width: '30px', height: '30px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
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
        ) : (
          /* Visual Card Grid View */
          <div
            style={{
              padding: '24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
              background: '#f8fafc',
            }}
          >
            {filteredCategories.map((cat) => {
              const isActive = cat.status === 'active' || cat.status === undefined || cat.status === null;
              const postCount = Number(cat.posts_count) || (cat.posts ? cat.posts.length : 0);

              return (
                <div
                  key={cat.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    padding: '20px',
                    boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(7, 41, 77, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = '0 4px 18px rgba(7, 41, 77, 0.04)';
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: '#eff6ff',
                        border: '1px solid #dbeafe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1e73be',
                      }}
                    >
                      <FolderTree size={22} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '6px',
                          background: '#f1f5f9',
                          color: '#475569',
                          border: '1px solid #e2e8f0',
                        }}
                        title={isKhmer ? 'លំដាប់បង្ហាញ' : 'Display Order'}
                      >
                        #{cat.order !== undefined ? cat.order : 0}
                      </span>
                      <button
                        onClick={() => handleToggleStatus(cat)}
                        style={{
                          border: 'none',
                          cursor: 'pointer',
                          padding: '3px 8px',
                          borderRadius: '16px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: isActive ? '#f0fdf4' : '#f8fafc',
                          color: isActive ? '#166534' : '#64748b',
                          border: isActive ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                        }}
                      >
                        {isActive ? (isKhmer ? '🟢 សកម្ម' : 'Active') : (isKhmer ? '⚪ អសកម្ម' : 'Inactive')}
                      </button>
                    </div>
                  </div>

                  {/* Title & Slug */}
                  <h3
                    onClick={() => openEditModal(cat)}
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: '#07294D',
                      margin: '0 0 6px 0',
                      cursor: 'pointer',
                    }}
                  >
                    {cat.name}
                  </h3>

                  {cat.slug && (
                    <div style={{ marginBottom: '10px' }}>
                      <span className="admin-blog-slug-pill" style={{ fontSize: '0.72rem' }}>
                        /{cat.slug}
                      </span>
                    </div>
                  )}

                  <p
                    style={{
                      fontSize: '0.84rem',
                      color: '#64748b',
                      lineHeight: 1.5,
                      margin: '0 0 16px 0',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      flex: 1,
                    }}
                  >
                    {cat.description || (isKhmer ? 'មិនមានសេចក្តីពិពណ៌នាបន្ថែម' : 'No description provided')}
                  </p>

                  {/* Card Footer */}
                  <div
                    style={{
                      paddingTop: '14px',
                      borderTop: '1px dashed #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: postCount > 0 ? '#1e73be' : '#94a3b8',
                      }}
                    >
                      <Newspaper size={13} />
                      <span>
                        {postCount} {isKhmer ? 'អត្ថបទ' : 'articles'}
                      </span>
                    </span>

                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        onClick={() => openEditModal(cat)}
                        className="admin-btn admin-btn-outline admin-btn-sm"
                        style={{ padding: '5px 8px' }}
                        title={isKhmer ? 'កែសម្រួល' : 'Edit'}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => confirmDelete(cat)}
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        style={{ padding: '5px 8px' }}
                        title={isKhmer ? 'លុប' : 'Delete'}
                      >
                        <Trash2 size={13} />
                      </button>
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
              ? `បង្ហាញ ${filteredCategories.length} ក្នុងចំណោមប្រភេទសរុប ${categories.length}`
              : `Showing ${filteredCategories.length} of ${categories.length} categories`}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span>
              {isKhmer ? `🟢 ${stats.active} សកម្ម` : `🟢 ${stats.active} active`}
            </span>
            <span>•</span>
            <span>
              {isKhmer ? `📰 ${stats.totalPosts} អត្ថបទសរុប` : `📰 ${stats.totalPosts} total articles`}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Add / Edit Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingCategory
            ? isKhmer
              ? 'កែសម្រួលប្រភេទអត្ថបទព័ត៌មាន'
              : 'Edit Blog Category'
            : isKhmer
            ? 'បង្កើតប្រភេទអត្ថបទព័ត៌មានថ្មី'
            : 'New Blog Category'
        }
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        maxWidth="580px"
        submitLabel={isKhmer ? (editingCategory ? 'រក្សាទុកការកែប្រែ' : 'បង្កើតប្រភេទថ្មី') : undefined}
        cancelLabel={isKhmer ? 'បោះបង់' : undefined}
      >
        {/* Category Name */}
        <div className="admin-form-group" style={{ marginBottom: '16px' }}>
          <label className="admin-form-label" style={{ fontWeight: 700, color: '#07294D', marginBottom: '6px', display: 'block' }}>
            {isKhmer ? 'ឈ្មោះប្រភេទព័ត៌មាន *' : 'Category Name *'}
          </label>
          <input
            type="text"
            className="admin-form-control"
            required
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder={isKhmer ? 'ឧ. ព័ត៌មានទូទៅ, អាហារូបករណ៍ TVET, ព្រឹត្តិការណ៍...' : 'e.g. Press Releases, TVET Scholarships...'}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />
        </div>

        {/* Slug & Display Order in 2 Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '14px', marginBottom: '16px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label" style={{ fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
              Slug (URL Key)
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                /
              </span>
              <input
                type="text"
                className="admin-form-control"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="general-news"
                style={{ width: '100%', padding: '10px 12px 10px 24px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label" style={{ fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
              {isKhmer ? 'លំដាប់ (Order)' : 'Display Order'}
            </label>
            <input
              type="number"
              className="admin-form-control"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: e.target.value })}
              min="0"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>

        {/* Status Selection */}
        <div className="admin-form-group" style={{ marginBottom: '16px' }}>
          <label className="admin-form-label" style={{ fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'block' }}>
            {isKhmer ? 'ស្ថានភាពបង្ហាញ' : 'Publication Status'}
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '8px',
                border: formData.status === 'active' ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                background: formData.status === 'active' ? '#f0fdf4' : '#fff',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.88rem',
                color: formData.status === 'active' ? '#166534' : '#64748b',
              }}
            >
              <input
                type="radio"
                name="category_status"
                value="active"
                checked={formData.status === 'active'}
                onChange={() => setFormData({ ...formData, status: 'active' })}
              />
              <span>{isKhmer ? '🟢 សកម្ម (Active)' : 'Active (Live)'}</span>
            </label>

            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '8px',
                border: formData.status === 'inactive' ? '1.5px solid #64748b' : '1px solid #e2e8f0',
                background: formData.status === 'inactive' ? '#f8fafc' : '#fff',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.88rem',
                color: formData.status === 'inactive' ? '#334155' : '#64748b',
              }}
            >
              <input
                type="radio"
                name="category_status"
                value="inactive"
                checked={formData.status === 'inactive'}
                onChange={() => setFormData({ ...formData, status: 'inactive' })}
              />
              <span>{isKhmer ? '⚪ អសកម្ម (Inactive)' : 'Inactive (Hidden)'}</span>
            </label>
          </div>
        </div>

        {/* Description */}
        <div className="admin-form-group" style={{ marginBottom: '10px' }}>
          <label className="admin-form-label" style={{ fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
            {isKhmer ? 'សេចក្តីពិពណ៌នាប្រភេទ' : 'Description'}
          </label>
          <textarea
            className="admin-form-control"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={isKhmer ? 'ព័ត៌មានបន្ថែមអំពីប្រភេទនេះ...' : 'Provide context or scope for this category...'}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
          />
        </div>
      </AdminModal>

      {/* 5. Safe Delete Confirmation Modal */}
      {deleteModalOpen && deletingCategory && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 41, 77, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
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
              padding: '24px',
              boxShadow: '0 20px 40px rgba(7, 41, 77, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dc2626',
                  flexShrink: 0,
                }}
              >
                <Trash2 size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#07294D' }}>
                  {isKhmer ? 'បញ្ជាក់ការលុបប្រភេទ' : 'Confirm Delete Category'}
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  {isKhmer ? 'សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានទេ' : 'This action cannot be undone.'}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              {isKhmer
                ? `តើអ្នកពិតជាចង់លុបប្រភេទ "${deletingCategory.name}" នេះមែនទេ?`
                : `Are you sure you want to delete category "${deletingCategory.name}"?`}
            </p>

            {Number(deletingCategory.posts_count) > 0 && (
              <div
                style={{
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  gap: '10px',
                  color: '#c2410c',
                  fontSize: '0.84rem',
                  marginBottom: '16px',
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  {isKhmer
                    ? `ប្រភេទនេះមាន ${deletingCategory.posts_count} អត្ថបទព័ត៌មានកំពុងភ្ជាប់។ ប្រព័ន្ធនឹងបដិសេធការលុប ដរាបណាអត្ថបទទាំងនោះមិនទាន់បានប្តូរប្រភេទ ឬលុបចេញ។`
                    : `This category has ${deletingCategory.posts_count} articles associated. Deletion will be rejected until those articles are reassigned.`}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="admin-btn admin-btn-outline"
                disabled={submitting}
              >
                {isKhmer ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="admin-btn admin-btn-danger"
                disabled={submitting}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {submitting && <RotateCw size={14} className="animate-spin" />}
                <span>{isKhmer ? 'បាទ/ចាស លុបចេញ' : 'Delete Category'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
