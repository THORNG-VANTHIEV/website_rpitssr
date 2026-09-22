import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/client';
import { AdminModal } from '../../components/admin/AdminModal';
import { useLanguage } from '../../context/LanguageContext';
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Trash2,
  RotateCw,
  Search,
  X,
  Eye,
  ExternalLink,
  ShieldAlert,
  Clock,
  User,
  Mail,
  Phone,
  Calendar,
  SlidersHorizontal,
  LayoutGrid,
  List,
  AlertCircle,
  FileText,
  MessageSquareQuote,
  Sparkles,
  Check,
  Ban,
  ArrowUpRight,
} from 'lucide-react';

export const AdminCommentsPage = () => {
  const { currentLanguage, language } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'approved', 'spam'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'author', 'article'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Modals
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingComment, setDeletingComment] = useState(null);
  const [editContentModalOpen, setEditContentModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get('/admin/comments');
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : (raw?.comments || raw?.data || []);
      setComments(list);
    } catch (err) {
      console.error('Error loading comments:', err);
      showToast(isKhmer ? 'បរាជ័យក្នុងការទាញយកមតិយោបល់' : 'Failed to load comments.', 'error');
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
    const total = comments.length;
    const pending = comments.filter((c) => c.status === 'pending').length;
    const approved = comments.filter((c) => c.status === 'approved' || !c.status).length;
    const spam = comments.filter((c) => c.status === 'spam').length;

    return { total, pending, approved, spam };
  }, [comments]);

  // Filtering & Sorting
  const filteredComments = useMemo(() => {
    return comments
      .filter((c) => {
        // Status tab
        const currentStatus = c.status || 'approved';
        if (statusFilter === 'pending' && currentStatus !== 'pending') return false;
        if (statusFilter === 'approved' && currentStatus !== 'approved') return false;
        if (statusFilter === 'spam' && currentStatus !== 'spam') return false;

        // Search query
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase().trim();
          const matchAuthor = (c.author || c.authorName || '').toLowerCase().includes(q);
          const matchEmail = (c.email || '').toLowerCase().includes(q);
          const matchPhone = (c.phone || '').toLowerCase().includes(q);
          const matchContent = (c.content || '').toLowerCase().includes(q);
          const matchPost = (c.post?.title || '').toLowerCase().includes(q);
          return matchAuthor || matchEmail || matchPhone || matchContent || matchPost;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'author') {
          return (a.author || a.authorName || '').localeCompare(b.author || b.authorName || '');
        }
        if (sortBy === 'article') {
          return (a.post?.title || '').localeCompare(b.post?.title || '');
        }
        // Default newest
        const idA = Number(a.id) || 0;
        const idB = Number(b.id) || 0;
        return idB - idA;
      });
  }, [comments, statusFilter, searchTerm, sortBy]);

  // Quick Action: Update Status
  const handleUpdateStatus = async (commentId, newStatus) => {
    setActionLoadingId(commentId);
    try {
      await api.put(`/admin/comments/${commentId}`, { status: newStatus });
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, status: newStatus } : c))
      );

      if (selectedComment && selectedComment.id === commentId) {
        setSelectedComment((prev) => ({ ...prev, status: newStatus }));
      }

      const statusLabels = {
        approved: isKhmer ? 'បានអនុម័ត' : 'approved',
        pending: isKhmer ? 'រង់ចាំពិនិត្យ' : 'pending',
        spam: isKhmer ? 'សារឥតបានការ (Spam)' : 'marked as spam',
      };
      showToast(isKhmer ? `បានកំណត់ស្ថានភាព៖ ${statusLabels[newStatus]}` : `Comment ${statusLabels[newStatus]} successfully.`);
    } catch (err) {
      console.error('Failed to update comment status:', err);
      showToast(isKhmer ? 'បរាជ័យក្នុងការផ្លាស់ប្តូរស្ថានភាព' : 'Failed to update status.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete Handlers
  const confirmDelete = (comment) => {
    setDeletingComment(comment);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!deletingComment) return;
    setSubmitting(true);
    try {
      await api.delete(`/admin/comments/${deletingComment.id}`);
      setComments((prev) => prev.filter((c) => c.id !== deletingComment.id));
      if (selectedComment && selectedComment.id === deletingComment.id) {
        setDetailModalOpen(false);
        setSelectedComment(null);
      }
      setDeleteModalOpen(false);
      setDeletingComment(null);
      showToast(isKhmer ? 'បានលុបមតិយោបល់ដោយជោគជ័យ' : 'Comment deleted successfully.');
    } catch (err) {
      console.error('Failed to delete comment:', err);
      showToast(isKhmer ? 'បរាជ័យក្នុងការលុបមតិយោបល់' : 'Failed to delete comment.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Content Handlers
  const openEditModal = (comment) => {
    setSelectedComment(comment);
    setEditingContent(comment.content || '');
    setEditContentModalOpen(true);
  };

  const handleSaveContent = async (e) => {
    e.preventDefault();
    if (!selectedComment || !editingContent.trim()) return;

    setSubmitting(true);
    try {
      await api.put(`/admin/comments/${selectedComment.id}`, {
        content: editingContent.trim(),
        status: selectedComment.status || 'approved',
      });
      setComments((prev) =>
        prev.map((c) =>
          c.id === selectedComment.id ? { ...c, content: editingContent.trim() } : c
        )
      );
      if (selectedComment) {
        setSelectedComment((prev) => ({ ...prev, content: editingContent.trim() }));
      }
      setEditContentModalOpen(false);
      showToast(isKhmer ? 'បានកែសម្រួលខ្លឹមសារមតិយោបល់ជោគជ័យ' : 'Comment content updated successfully.');
    } catch (err) {
      console.error('Failed to edit comment content:', err);
      showToast(isKhmer ? 'បរាជ័យក្នុងការកែសម្រួលខ្លឹមសារ' : 'Failed to save comment content.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openDetail = (comment) => {
    setSelectedComment(comment);
    setDetailModalOpen(true);
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 9999,
            background: toast.type === 'error' ? '#ef4444' : '#059669',
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
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. Institutional Header Banner */}
      <div className="admin-page-header admin-comments-header" style={{ marginBottom: '24px' }}>
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
              <MessageSquareQuote size={15} />
              <span>
                {isKhmer ? 'ប្រព័ន្ធត្រួតពិនិត្យមតិយោបល់ & សារអ្នកអាន' : 'Reader Comments & Feedback Moderation'}
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
              {isKhmer ? 'មតិយោបល់ និងការឆ្លើយតបលើអត្ថបទ' : 'Article Comments Moderation'}
            </h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.94rem', maxWidth: '740px', lineHeight: 1.5 }}>
              {isKhmer
                ? 'ត្រួតពិនិត្យ ផ្ទៀងផ្ទាត់ អនុម័ត ឬទប់ស្កាត់មតិយោបល់ និងសំណួររបស់អ្នកអានលើអត្ថបទព័ត៌មាន និងសេចក្តីប្រកាសរបស់វិទ្យាស្ថាន RPITSSR។'
                : 'Review, approve, filter, or moderate reader questions and feedback submitted on institute blog posts and news releases.'}
            </p>
          </div>

          {/* Top Actions */}
          <div className="admin-comments-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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

            {stats.pending > 0 && (
              <button
                onClick={() => setStatusFilter('pending')}
                className="admin-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  height: '42px',
                  padding: '0 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  background: '#fff7ed',
                  color: '#ea580c',
                  border: '1px solid #fed7aa',
                  boxShadow: '0 2px 8px rgba(234, 88, 12, 0.15)',
                }}
              >
                <Clock size={16} />
                <span>
                  {isKhmer ? `ពិនិត្យមតិរង់ចាំ (${stats.pending})` : `Pending Reviews (${stats.pending})`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. 4-Card Institutional KPI Metric Strip */}
      <div className="admin-kpi-grid admin-comments-kpis">
        {/* KPI 1: Total Comments */}
        <div
          className="admin-kpi-card"
          onClick={() => setStatusFilter('all')}
          style={{
            cursor: 'pointer',
            border: statusFilter === 'all' ? '1.5px solid #1e73be' : '1px solid #e2e8f0',
          }}
          title={isKhmer ? 'ចុចដើម្បីបង្ហាញមតិទាំងអស់' : 'Click to filter all comments'}
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
            <MessageSquare size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              {isKhmer ? 'មតិយោបល់សរុប' : 'Total Comments'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#07294D', lineHeight: 1.2 }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#1e73be', fontWeight: 600, marginTop: '2px' }}>
              {isKhmer ? 'មតិយោបល់ពីអ្នកអានទាំងអស់' : 'All reader interactions'}
            </div>
          </div>
        </div>

        {/* KPI 2: Pending Moderation */}
        <div
          className="admin-kpi-card"
          onClick={() => setStatusFilter('pending')}
          style={{
            cursor: 'pointer',
            border: statusFilter === 'pending' ? '1.5px solid #ea580c' : '1px solid #e2e8f0',
          }}
          title={isKhmer ? 'ចុចដើម្បីបង្ហាញមតិរង់ចាំពិនិត្យ' : 'Click to filter pending comments'}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ea580c',
              flexShrink: 0,
            }}
          >
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              {isKhmer ? 'រង់ចាំការត្រួតពិនិត្យ' : 'Pending Moderation'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ea580c', lineHeight: 1.2 }}>
              {stats.pending}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#ea580c', fontWeight: 600, marginTop: '2px' }}>
              {isKhmer ? 'ត្រូវការអនុម័តដើម្បីបង្ហាញ' : 'Awaiting admin approval'}
            </div>
          </div>
        </div>

        {/* KPI 3: Approved Live */}
        <div
          className="admin-kpi-card"
          onClick={() => setStatusFilter('approved')}
          style={{
            cursor: 'pointer',
            border: statusFilter === 'approved' ? '1.5px solid #059669' : '1px solid #e2e8f0',
          }}
          title={isKhmer ? 'ចុចដើម្បីបង្ហាញមតិបានអនុម័ត' : 'Click to filter approved comments'}
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
              {isKhmer ? 'បានអនុម័តផ្សាយ' : 'Approved Live'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#07294D', lineHeight: 1.2 }}>
              {stats.approved}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
              {isKhmer ? 'កំពុងបង្ហាញលើគេហទំព័រ' : 'Visible on public blog'}
            </div>
          </div>
        </div>

        {/* KPI 4: Spam / Filtered */}
        <div
          className="admin-kpi-card"
          onClick={() => setStatusFilter('spam')}
          style={{
            cursor: 'pointer',
            border: statusFilter === 'spam' ? '1.5px solid #dc2626' : '1px solid #e2e8f0',
          }}
          title={isKhmer ? 'ចុចដើម្បីបង្ហាញមតិ Spam' : 'Click to filter spam comments'}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#dc2626',
              flexShrink: 0,
            }}
          >
            <ShieldAlert size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              {isKhmer ? 'សារឥតបានការ / Spam' : 'Spam & Blocked'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#dc2626', lineHeight: 1.2 }}>
              {stats.spam}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
              {isKhmer ? 'ត្រូវបានទប់ស្កាត់' : 'Blocked from public view'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Moderation Container */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Status Filter Tabs */}
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
          {/* All */}
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
            <span>{isKhmer ? 'ទាំងអស់' : 'All Comments'}</span>
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
              {comments.length}
            </span>
          </button>

          {/* Pending */}
          <button
            onClick={() => setStatusFilter('pending')}
            style={{
              padding: '14px 16px',
              border: 'none',
              background: 'transparent',
              fontSize: '0.88rem',
              fontWeight: statusFilter === 'pending' ? 700 : 600,
              color: statusFilter === 'pending' ? '#ea580c' : '#64748b',
              borderBottom: statusFilter === 'pending' ? '2.5px solid #ea580c' : '2.5px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{isKhmer ? '🟡 រង់ចាំត្រួតពិនិត្យ' : 'Pending'}</span>
            <span
              style={{
                fontSize: '0.74rem',
                padding: '2px 8px',
                borderRadius: '12px',
                background: statusFilter === 'pending' ? '#fff7ed' : '#e2e8f0',
                color: statusFilter === 'pending' ? '#ea580c' : '#64748b',
                fontWeight: 700,
              }}
            >
              {stats.pending}
            </span>
          </button>

          {/* Approved */}
          <button
            onClick={() => setStatusFilter('approved')}
            style={{
              padding: '14px 16px',
              border: 'none',
              background: 'transparent',
              fontSize: '0.88rem',
              fontWeight: statusFilter === 'approved' ? 700 : 600,
              color: statusFilter === 'approved' ? '#059669' : '#64748b',
              borderBottom: statusFilter === 'approved' ? '2.5px solid #059669' : '2.5px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{isKhmer ? '🟢 បានអនុម័ត' : 'Approved'}</span>
            <span
              style={{
                fontSize: '0.74rem',
                padding: '2px 8px',
                borderRadius: '12px',
                background: statusFilter === 'approved' ? '#dcfce7' : '#e2e8f0',
                color: statusFilter === 'approved' ? '#059669' : '#64748b',
                fontWeight: 700,
              }}
            >
              {stats.approved}
            </span>
          </button>

          {/* Spam */}
          <button
            onClick={() => setStatusFilter('spam')}
            style={{
              padding: '14px 16px',
              border: 'none',
              background: 'transparent',
              fontSize: '0.88rem',
              fontWeight: statusFilter === 'spam' ? 700 : 600,
              color: statusFilter === 'spam' ? '#dc2626' : '#64748b',
              borderBottom: statusFilter === 'spam' ? '2.5px solid #dc2626' : '2.5px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{isKhmer ? '🔴 សារឥតបានការ (Spam)' : 'Spam'}</span>
            <span
              style={{
                fontSize: '0.74rem',
                padding: '2px 8px',
                borderRadius: '12px',
                background: statusFilter === 'spam' ? '#fef2f2' : '#e2e8f0',
                color: statusFilter === 'spam' ? '#dc2626' : '#64748b',
                fontWeight: 700,
              }}
            >
              {stats.spam}
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
          {/* Search */}
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
              placeholder={isKhmer ? 'ស្វែងរកតាមឈ្មោះ, អ៊ីមែល, ខ្លឹមសារ, ឬចំណងជើងអត្ថបទ...' : 'Search by author, email, content, or post title...'}
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

          {/* Right: Sort & Mode */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
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
                <option value="newest">{isKhmer ? 'ថ្មីបំផុត' : 'Newest First'}</option>
                <option value="author">{isKhmer ? 'អ្នកបញ្ចេញមតិ (A-Z)' : 'Author (A-Z)'}</option>
                <option value="article">{isKhmer ? 'ចំណងជើងអត្ថបទ' : 'Article Title'}</option>
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
                onClick={() => setViewMode('cards')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'cards' ? '#ffffff' : 'transparent',
                  color: viewMode === 'cards' ? '#07294D' : '#64748b',
                  fontSize: '0.82rem',
                  fontWeight: viewMode === 'cards' ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: viewMode === 'cards' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
                title={isKhmer ? 'ទិដ្ឋភាពកាត' : 'Card View'}
              >
                <LayoutGrid size={14} />
                <span>{isKhmer ? 'កាត' : 'Cards'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
            <RotateCw size={28} className="animate-spin" style={{ margin: '0 auto 12px auto', color: '#1e73be' }} />
            <div>{isKhmer ? 'កំពុងទាញយកទិន្នន័យមតិយោបល់...' : 'Loading comments...'}</div>
          </div>
        ) : filteredComments.length === 0 ? (
          <div style={{ padding: '70px 20px', textAlign: 'center', color: '#94a3b8' }}>
            <MessageSquare size={44} style={{ margin: '0 auto 14px auto', opacity: 0.4 }} />
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
              {isKhmer ? 'មិនមានមតិយោបល់នៅក្នុងលក្ខខណ្ឌនេះទេ' : 'No comments found matching criteria'}
            </div>
            <p style={{ margin: 0, fontSize: '0.88rem' }}>
              {isKhmer ? 'សូមជ្រើសរើសផ្ទាំងស្ថានភាពផ្សេង ឬផ្លាស់ប្តូរពាក្យគន្លឹះស្វែងរក' : 'Try selecting another status tab or clear search keywords.'}
            </p>
          </div>
        ) : viewMode === 'table' ? (
          <>
            {/* Desktop Table View (hidden on <= 768px via admin.css) */}
            <div className="admin-table-wrapper admin-comments-desktop-table" style={{ width: '100%', overflowX: 'auto' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 700, color: '#475569', width: '220px' }}>
                      {isKhmer ? 'អ្នកបញ្ចេញមតិ & អត្ថបទ' : 'Author & Article'}
                    </th>
                    <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
                      {isKhmer ? 'ខ្លឹមសារមតិយោបល់' : 'Comment Content'}
                    </th>
                    <th style={{ padding: '12px 12px', textAlign: 'center', fontSize: '0.82rem', fontWeight: 700, color: '#475569', width: '110px' }}>
                      {isKhmer ? 'ស្ថានភាព' : 'Status'}
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.82rem', fontWeight: 700, color: '#475569', width: '135px' }}>
                      {isKhmer ? 'សកម្មភាព' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComments.map((comment) => {
                    const author = comment.author || comment.authorName || (isKhmer ? 'ភ្ញៀវទូទៅ' : 'Guest Reader');
                    const status = comment.status || 'approved';
                    const isBusy = actionLoadingId === comment.id;

                    return (
                      <tr
                        key={comment.id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {/* Author & Article */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                background: '#eff6ff',
                                border: '1px solid #dbeafe',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#1e73be',
                                fontWeight: 700,
                                fontSize: '0.88rem',
                                flexShrink: 0,
                              }}
                            >
                              {author.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontWeight: 700, color: '#07294D', fontSize: '0.9rem', marginBottom: '2px' }}>
                                {author}
                              </div>
                              {(comment.email || comment.phone) && (
                                <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                  {comment.email && <span>{comment.email}</span>}
                                  {comment.email && comment.phone && <span>•</span>}
                                  {comment.phone && <span>{comment.phone}</span>}
                                </div>
                              )}
                              {comment.post && (
                                <div style={{ marginTop: '4px' }}>
                                  <a
                                    href={`/blog-details/${comment.post.slug || comment.post.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      fontSize: '0.75rem',
                                      color: '#1e73be',
                                      textDecoration: 'none',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px',
                                      maxWidth: '180px',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                    title={comment.post.title}
                                  >
                                    <FileText size={11} style={{ flexShrink: 0 }} />
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {comment.post.title}
                                    </span>
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Content */}
                        <td style={{ padding: '14px 14px' }}>
                          <div
                            onClick={() => openDetail(comment)}
                            style={{
                              fontSize: '0.88rem',
                              color: '#334155',
                              lineHeight: 1.5,
                              cursor: 'pointer',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                            title={isKhmer ? 'ចុចដើម្បីមើលលម្អិត' : 'Click to view full comment'}
                          >
                            "{comment.content}"
                          </div>
                          {comment.time && (
                            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={11} />
                              <span>{comment.time}</span>
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              background:
                                status === 'approved'
                                  ? '#f0fdf4'
                                  : status === 'spam'
                                  ? '#fef2f2'
                                  : '#fff7ed',
                              color:
                                status === 'approved'
                                  ? '#166534'
                                  : status === 'spam'
                                  ? '#dc2626'
                                  : '#c2410c',
                              border:
                                status === 'approved'
                                  ? '1px solid #bbf7d0'
                                  : status === 'spam'
                                  ? '1px solid #fecaca'
                                  : '1px solid #fed7aa',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background:
                                  status === 'approved'
                                    ? '#16a34a'
                                    : status === 'spam'
                                    ? '#dc2626'
                                    : '#ea580c',
                              }}
                            />
                            <span>
                              {status === 'approved'
                                ? isKhmer
                                  ? 'បានអនុម័ត'
                                  : 'Approved'
                                : status === 'spam'
                                ? isKhmer
                                  ? 'Spam'
                                  : 'Spam'
                                : isKhmer
                                ? 'រង់ចាំពិនិត្យ'
                                : 'Pending'}
                            </span>
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                            {/* Approve Button */}
                            {status !== 'approved' && (
                              <button
                                onClick={() => handleUpdateStatus(comment.id, 'approved')}
                                disabled={isBusy}
                                className="admin-btn admin-btn-sm"
                                title={isKhmer ? 'អនុម័តមតិយោបល់' : 'Approve Comment'}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  padding: 0,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '6px',
                                  background: '#f0fdf4',
                                  color: '#16a34a',
                                  border: '1px solid #bbf7d0',
                                }}
                              >
                                <Check size={14} />
                              </button>
                            )}

                            {/* Spam Button */}
                            {status !== 'spam' && (
                              <button
                                onClick={() => handleUpdateStatus(comment.id, 'spam')}
                                disabled={isBusy}
                                className="admin-btn admin-btn-sm"
                                title={isKhmer ? 'កំណត់ជា Spam' : 'Mark as Spam'}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  padding: 0,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '6px',
                                  background: '#fff7ed',
                                  color: '#ea580c',
                                  border: '1px solid #fed7aa',
                                }}
                              >
                                <Ban size={13} />
                              </button>
                            )}

                            {/* View Detail Button */}
                            <button
                              onClick={() => openDetail(comment)}
                              className="admin-btn admin-btn-outline admin-btn-sm"
                              title={isKhmer ? 'មើលលម្អិត & កែសម្រួល' : 'View Details'}
                              style={{
                                width: '28px',
                                height: '28px',
                                padding: 0,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '6px',
                              }}
                            >
                              <Eye size={13} />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => confirmDelete(comment)}
                              className="admin-btn admin-btn-danger admin-btn-sm"
                              title={isKhmer ? 'លុបមតិយោបល់' : 'Delete Comment'}
                              style={{
                                width: '28px',
                                height: '28px',
                                padding: 0,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '6px',
                              }}
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
            <div className="admin-comments-mobile-cards">
              {filteredComments.map((comment) => {
                const author = comment.author || comment.authorName || (isKhmer ? 'ភ្ញៀវទូទៅ' : 'Guest Reader');
                const status = comment.status || 'approved';
                const isBusy = actionLoadingId === comment.id;

                return (
                  <div
                    key={comment.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      padding: '16px',
                      boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    {/* Header: Avatar, Author, Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: '#eff6ff',
                            border: '1px solid #dbeafe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#1e73be',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            flexShrink: 0,
                          }}
                        >
                          {author.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 700, color: '#07294D', fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {author}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{comment.time || 'N/A'}</div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '16px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          flexShrink: 0,
                          background:
                            status === 'approved' ? '#f0fdf4' : status === 'spam' ? '#fef2f2' : '#fff7ed',
                          color:
                            status === 'approved' ? '#166534' : status === 'spam' ? '#dc2626' : '#c2410c',
                          border:
                            status === 'approved'
                              ? '1px solid #bbf7d0'
                              : status === 'spam'
                              ? '1px solid #fecaca'
                              : '1px solid #fed7aa',
                        }}
                      >
                        <span
                          style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            background:
                              status === 'approved'
                                ? '#16a34a'
                                : status === 'spam'
                                ? '#dc2626'
                                : '#ea580c',
                          }}
                        />
                        <span>
                          {status === 'approved'
                            ? isKhmer ? 'បានអនុម័ត' : 'Approved'
                            : status === 'spam'
                            ? 'Spam'
                            : isKhmer ? 'រង់ចាំ' : 'Pending'}
                        </span>
                      </span>
                    </div>

                    {/* Email / Phone info if exists */}
                    {(comment.email || comment.phone) && (
                      <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {comment.email && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Mail size={11} /> {comment.email}
                          </span>
                        )}
                        {comment.phone && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Phone size={11} /> {comment.phone}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Comment Content Block */}
                    <div
                      onClick={() => openDetail(comment)}
                      style={{
                        fontSize: '0.86rem',
                        color: '#334155',
                        lineHeight: 1.5,
                        background: '#f8fafc',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #f1f5f9',
                        cursor: 'pointer',
                      }}
                      title={isKhmer ? 'ចុចដើម្បីមើលលម្អិត' : 'Click to view details'}
                    >
                      "{comment.content}"
                    </div>

                    {/* Linked Article */}
                    {comment.post && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontWeight: 600, flexShrink: 0 }}>{isKhmer ? 'អត្ថបទ៖' : 'Article:'}</span>
                        <a
                          href={`/blog-details/${comment.post.slug || comment.post.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#1e73be',
                            textDecoration: 'none',
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {comment.post.title}
                        </a>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div
                      style={{
                        paddingTop: '10px',
                        borderTop: '1px dashed #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '6px',
                        flexWrap: 'wrap',
                      }}
                    >
                      {/* Quick Moderation Toggles */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {status !== 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(comment.id, 'approved')}
                            disabled={isBusy}
                            className="admin-btn admin-btn-sm"
                            style={{
                              background: '#f0fdf4',
                              color: '#16a34a',
                              border: '1px solid #bbf7d0',
                              padding: '3px 8px',
                              fontSize: '0.72rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Check size={12} /> {isKhmer ? 'អនុម័ត' : 'Approve'}
                          </button>
                        )}
                        {status !== 'spam' && (
                          <button
                            onClick={() => handleUpdateStatus(comment.id, 'spam')}
                            disabled={isBusy}
                            className="admin-btn admin-btn-sm"
                            style={{
                              background: '#fff7ed',
                              color: '#ea580c',
                              border: '1px solid #fed7aa',
                              padding: '3px 8px',
                              fontSize: '0.72rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Ban size={12} /> Spam
                          </button>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => openDetail(comment)}
                          className="admin-btn admin-btn-outline admin-btn-sm"
                          title={isKhmer ? 'មើលលម្អិត' : 'View'}
                          style={{ width: '28px', height: '28px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => confirmDelete(comment)}
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          title={isKhmer ? 'លុប' : 'Delete'}
                          style={{ width: '28px', height: '28px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Card Feed View */
          <div
            style={{
              padding: 'clamp(14px, 3vw, 24px)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
              background: '#f8fafc',
            }}
          >
            {filteredComments.map((comment) => {
              const author = comment.author || comment.authorName || (isKhmer ? 'ភ្ញៀវទូទៅ' : 'Guest Reader');
              const status = comment.status || 'approved';

              return (
                <div
                  key={comment.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    padding: '20px',
                    boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: '#eff6ff',
                          border: '1px solid #dbeafe',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#1e73be',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                        }}
                      >
                        {author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#07294D', fontSize: '0.92rem' }}>{author}</div>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{comment.time || 'N/A'}</div>
                      </div>
                    </div>

                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '16px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background:
                          status === 'approved' ? '#f0fdf4' : status === 'spam' ? '#fef2f2' : '#fff7ed',
                        color:
                          status === 'approved' ? '#166534' : status === 'spam' ? '#dc2626' : '#c2410c',
                        border:
                          status === 'approved'
                            ? '1px solid #bbf7d0'
                            : status === 'spam'
                            ? '1px solid #fecaca'
                            : '1px solid #fed7aa',
                      }}
                    >
                      {status === 'approved'
                        ? isKhmer
                          ? '🟢 បានអនុម័ត'
                          : 'Approved'
                        : status === 'spam'
                        ? isKhmer
                          ? '🔴 Spam'
                          : 'Spam'
                        : isKhmer
                        ? '🟡 រង់ចាំ'
                        : 'Pending'}
                    </span>
                  </div>

                  {/* Comment Body */}
                  <div
                    style={{
                      fontSize: '0.88rem',
                      color: '#334155',
                      lineHeight: 1.5,
                      margin: '0 0 14px 0',
                      background: '#f8fafc',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #f1f5f9',
                      flex: 1,
                    }}
                  >
                    "{comment.content}"
                  </div>

                  {/* Attached Post */}
                  {comment.post && (
                    <div style={{ marginBottom: '14px', fontSize: '0.76rem', color: '#64748b' }}>
                      <span style={{ fontWeight: 600 }}>{isKhmer ? 'លើអត្ថបទ៖ ' : 'On Article: '}</span>
                      <a
                        href={`/blog-details/${comment.post.slug || comment.post.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#1e73be', textDecoration: 'none', fontWeight: 600 }}
                      >
                        {comment.post.title}
                      </a>
                    </div>
                  )}

                  {/* Footer Controls */}
                  <div
                    style={{
                      paddingTop: '12px',
                      borderTop: '1px dashed #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {status !== 'approved' && (
                        <button
                          onClick={() => handleUpdateStatus(comment.id, 'approved')}
                          className="admin-btn admin-btn-sm"
                          style={{
                            background: '#f0fdf4',
                            color: '#16a34a',
                            border: '1px solid #bbf7d0',
                            padding: '4px 8px',
                            fontSize: '0.75rem',
                          }}
                        >
                          <Check size={12} /> {isKhmer ? 'អនុម័ត' : 'Approve'}
                        </button>
                      )}
                      {status !== 'spam' && (
                        <button
                          onClick={() => handleUpdateStatus(comment.id, 'spam')}
                          className="admin-btn admin-btn-sm"
                          style={{
                            background: '#fff7ed',
                            color: '#ea580c',
                            border: '1px solid #fed7aa',
                            padding: '4px 8px',
                            fontSize: '0.75rem',
                          }}
                        >
                          <Ban size={12} /> Spam
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        onClick={() => openDetail(comment)}
                        className="admin-btn admin-btn-outline admin-btn-sm"
                        style={{ padding: '5px 8px' }}
                        title={isKhmer ? 'មើលលម្អិត' : 'View'}
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => confirmDelete(comment)}
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
              ? `បង្ហាញ ${filteredComments.length} ក្នុងចំណោមមតិយោបល់សរុប ${comments.length}`
              : `Showing ${filteredComments.length} of ${comments.length} total comments`}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span>
              {isKhmer ? `🟡 ${stats.pending} រង់ចាំពិនិត្យ` : `🟡 ${stats.pending} pending`}
            </span>
            <span>•</span>
            <span>
              {isKhmer ? `🟢 ${stats.approved} បានអនុម័ត` : `🟢 ${stats.approved} approved`}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Comment Detail & Moderation Modal */}
      {detailModalOpen && selectedComment && (
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
          onClick={() => setDetailModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '640px',
              width: '100%',
              padding: 'clamp(18px, 4vw, 28px)',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 24px 48px rgba(7, 41, 77, 0.25)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                  }}
                >
                  <MessageSquareQuote size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#07294D' }}>
                    {isKhmer ? 'ព័ត៌មានលម្អិតនៃមតិយោបល់' : 'Comment Details & Moderation'}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    ID: #{selectedComment.id} • {selectedComment.time || 'Recently submitted'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setDetailModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Author Profile Information */}
            <div
              style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #e2e8f0',
                marginBottom: '18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: '#1e73be',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                  }}
                >
                  {(selectedComment.author || selectedComment.authorName || 'G').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#07294D', fontSize: '1rem' }}>
                    {selectedComment.author || selectedComment.authorName || 'Guest Visitor'}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                    {selectedComment.email && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={12} /> {selectedComment.email}
                      </span>
                    )}
                    {selectedComment.phone && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={12} /> {selectedComment.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Target Post */}
              {selectedComment.post && (
                <div style={{ paddingTop: '10px', borderTop: '1px dashed #e2e8f0', fontSize: '0.84rem' }}>
                  <span style={{ color: '#64748b' }}>{isKhmer ? 'ភ្ជាប់លើអត្ថបទ៖ ' : 'On Article: '}</span>
                  <a
                    href={`/blog-details/${selectedComment.post.slug || selectedComment.post.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#1e73be', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span>{selectedComment.post.title}</span>
                    <ArrowUpRight size={13} />
                  </a>
                </div>
              )}
            </div>

            {/* Comment Message */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 700, color: '#07294D' }}>
                  {isKhmer ? 'ខ្លឹមសារមតិយោបល់ (Comment Content)' : 'Comment Content'}
                </label>
                <button
                  onClick={() => openEditModal(selectedComment)}
                  className="admin-btn admin-btn-outline admin-btn-sm"
                  style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                >
                  {isKhmer ? 'កែសម្រួលខ្លឹមសារ' : 'Edit Text'}
                </button>
              </div>
              <div
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px',
                  fontSize: '0.94rem',
                  lineHeight: 1.6,
                  color: '#1e293b',
                  whiteSpace: 'pre-wrap',
                }}
              >
                "{selectedComment.content}"
              </div>
            </div>

            {/* Moderation Controls in Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <button
                onClick={() => confirmDelete(selectedComment)}
                className="admin-btn admin-btn-danger"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 size={15} />
                <span>{isKhmer ? 'លុបមតិយោបល់' : 'Delete Comment'}</span>
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleUpdateStatus(selectedComment.id, 'spam')}
                  className="admin-btn admin-btn-outline"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderColor: '#fed7aa',
                    color: '#ea580c',
                    background: '#fff7ed',
                  }}
                >
                  <Ban size={15} />
                  <span>{isKhmer ? 'កំណត់ជា Spam' : 'Mark Spam'}</span>
                </button>

                <button
                  onClick={() => handleUpdateStatus(selectedComment.id, 'approved')}
                  className="admin-btn admin-btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#059669',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{isKhmer ? 'អនុម័តផ្សាយ' : 'Approve Live'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Edit Content Modal */}
      <AdminModal
        isOpen={editContentModalOpen}
        onClose={() => setEditContentModalOpen(false)}
        title={isKhmer ? 'កែសម្រួលខ្លឹមសារមតិយោបល់' : 'Edit Comment Text'}
        onSubmit={handleSaveContent}
        isSubmitting={submitting}
        maxWidth="540px"
        submitLabel={isKhmer ? 'រក្សាទុកខ្លឹមសារ' : 'Save Changes'}
        cancelLabel={isKhmer ? 'បោះបង់' : 'Cancel'}
      >
        <div className="admin-form-group">
          <label className="admin-form-label" style={{ fontWeight: 700, color: '#07294D', marginBottom: '8px', display: 'block' }}>
            {isKhmer ? 'ខ្លឹមសារមតិយោបល់ *' : 'Comment Content *'}
          </label>
          <textarea
            className="admin-form-control"
            rows={5}
            required
            value={editingContent}
            onChange={(e) => setEditingContent(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', lineHeight: 1.5 }}
          />
        </div>
      </AdminModal>

      {/* 6. Safe Delete Confirmation Modal */}
      {deleteModalOpen && deletingComment && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 41, 77, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1060,
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
              padding: 'clamp(16px, 4vw, 24px)',
              maxHeight: '90vh',
              overflowY: 'auto',
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
                  {isKhmer ? 'បញ្ជាក់ការលុបមតិយោបល់' : 'Confirm Delete Comment'}
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  {isKhmer ? 'សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានទេ' : 'This action cannot be undone.'}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              {isKhmer
                ? `តើអ្នកពិតជាចង់លុបមតិយោបល់របស់ "${deletingComment.author || deletingComment.authorName || 'Guest'}" នេះជារៀងរហូតមែនទេ?`
                : `Are you sure you want to permanently delete this comment by "${deletingComment.author || deletingComment.authorName || 'Guest'}"?`}
            </p>

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
                <span>{isKhmer ? 'បាទ/ចាស លុបចេញ' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
