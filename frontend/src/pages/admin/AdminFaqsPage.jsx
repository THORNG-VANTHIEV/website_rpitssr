import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/client';
import { AdminModal } from '../../components/admin/AdminModal';
import { useLanguage } from '../../context/LanguageContext';
import {
  HelpCircle,
  Plus,
  RotateCw,
  Search,
  X,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Eye,
  BookOpen,
  GraduationCap,
  Building2,
  DollarSign,
  Tag,
  Hash,
  Sparkles,
  ArrowRight,
  Layers,
  FileQuestion,
} from 'lucide-react';

export const AdminFaqsPage = () => {
  const { currentLanguage, language } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');
  const [sortBy, setSortBy] = useState('order'); // 'order', 'question', 'category'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [expandedFaqIds, setExpandedFaqIds] = useState(new Set());

  // Modals & Action States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingFaq, setDeletingFaq] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'admission',
    order: 0,
  });

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
      const res = await api.get('/admin/faqs?limit=100');
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : (raw?.faqs || raw?.data || []);
      setFaqs(list);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      showToast(isKhmer ? 'បរាជ័យក្នុងការទាញយកសំណួរ-ចម្លើយ' : 'Failed to load FAQs.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Category translation helper
  const getCategoryLabel = (catKey) => {
    const key = (catKey || '').toLowerCase();
    switch (key) {
      case 'admission':
        return isKhmer ? 'ការចុះឈ្មោះចូលរៀន' : 'Admissions';
      case 'courses':
        return isKhmer ? 'ជំនាញ និងវគ្គសិក្សា' : 'Courses & Majors';
      case 'fees':
      case 'scholarship':
      case 'scholarships':
        return isKhmer ? 'តម្លៃសិក្សា & អាហារូបករណ៍' : 'Fees & Scholarships';
      case 'facilities':
        return isKhmer ? 'អគារសិក្សា & អន្តេវាសិកដ្ឋាន' : 'Campus Facilities';
      case 'general':
        return isKhmer ? 'ព័ត៌មានទូទៅ' : 'General Info';
      default:
        return catKey || (isKhmer ? 'ទូទៅ' : 'General');
    }
  };

  const getCategoryBadgeStyle = (catKey) => {
    const key = (catKey || '').toLowerCase();
    switch (key) {
      case 'admission':
        return { bg: '#eff6ff', border: '#dbeafe', color: '#1e73be' };
      case 'courses':
        return { bg: '#faf5ff', border: '#e9d5ff', color: '#7c3aed' };
      case 'fees':
      case 'scholarship':
      case 'scholarships':
        return { bg: '#fefce8', border: '#fef08a', color: '#ca8a04' };
      case 'facilities':
        return { bg: '#f0fdf4', border: '#bbf7d0', color: '#059669' };
      default:
        return { bg: '#f8fafc', border: '#e2e8f0', color: '#475569' };
    }
  };

  // Distinct categories list
  const categoryList = useMemo(() => {
    const set = new Set();
    faqs.forEach((f) => {
      if (f.category) set.add(f.category.toLowerCase());
    });
    return Array.from(set);
  }, [faqs]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = faqs.length;
    const categoriesCount = categoryList.length;
    const admissionCount = faqs.filter(
      (f) =>
        (f.category || '').toLowerCase() === 'admission' ||
        (f.category || '').toLowerCase() === 'fees'
    ).length;
    const academicCount = faqs.filter(
      (f) => (f.category || '').toLowerCase() === 'courses'
    ).length;

    return { total, categoriesCount, admissionCount, academicCount };
  }, [faqs, categoryList]);

  // Filtering & Sorting
  const filteredFaqs = useMemo(() => {
    return faqs
      .filter((faq) => {
        // Tab filter
        if (activeCategoryTab !== 'all') {
          const currentCat = (faq.category || '').toLowerCase();
          if (currentCat !== activeCategoryTab) return false;
        }

        // Search term
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase().trim();
          const matchQ = (faq.question || '').toLowerCase().includes(q);
          const matchA = (faq.answer || '').toLowerCase().includes(q);
          const matchC = (faq.category || '').toLowerCase().includes(q);
          return matchQ || matchA || matchC;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'question') {
          return (a.question || '').localeCompare(b.question || '');
        }
        if (sortBy === 'category') {
          return (a.category || '').localeCompare(b.category || '');
        }
        // Default order
        return (Number(a.order) || 0) - (Number(b.order) || 0);
      });
  }, [faqs, activeCategoryTab, searchTerm, sortBy]);

  // Accordion toggle
  const toggleExpand = (id) => {
    setExpandedFaqIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Add & Edit Handlers
  const openAddModal = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      category: categoryList[0] || 'admission',
      order: faqs.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (f) => {
    setEditingFaq(f);
    setFormData({
      question: f.question || '',
      answer: f.answer || '',
      category: f.category || 'admission',
      order: f.order !== undefined ? f.order : 0,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      alert(isKhmer ? 'សូមបញ្ចូលទាំងសំណួរ និងចម្លើយ' : 'Please provide both question and answer.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        category: formData.category?.trim() || 'general',
        order: Number(formData.order) || 0,
      };

      if (editingFaq) {
        await api.put(`/admin/faqs/${editingFaq.id}`, payload);
        showToast(isKhmer ? 'បានកែសម្រួលសំណួរ-ចម្លើយជោគជ័យ' : 'FAQ updated successfully.');
      } else {
        await api.post('/admin/faqs', payload);
        showToast(isKhmer ? 'បានបន្ថែមសំណួរថ្មីដោយជោគជ័យ' : 'New FAQ added successfully.');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save FAQ:', err);
      showToast(isKhmer ? 'បរាជ័យក្នុងការរក្សាទុកសំណួរ' : 'Failed to save FAQ.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (f) => {
    setDeletingFaq(f);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!deletingFaq) return;
    setSubmitting(true);
    try {
      await api.delete(`/admin/faqs/${deletingFaq.id}`);
      setFaqs((prev) => prev.filter((item) => item.id !== deletingFaq.id));
      if (selectedFaq && selectedFaq.id === deletingFaq.id) {
        setDetailModalOpen(false);
        setSelectedFaq(null);
      }
      setDeleteModalOpen(false);
      setDeletingFaq(null);
      showToast(isKhmer ? 'បានលុបសំណួរចេញដោយជោគជ័យ' : 'FAQ deleted successfully.');
    } catch (err) {
      console.error('Failed to delete FAQ:', err);
      showToast(isKhmer ? 'បរាជ័យក្នុងការលុបសំណួរ' : 'Failed to delete FAQ.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openDetail = (f) => {
    setSelectedFaq(f);
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
      <div className="admin-page-header admin-faqs-header" style={{ marginBottom: '24px' }}>
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
              <HelpCircle size={15} />
              <span>
                {isKhmer ? 'ប្រព័ន្ធគ្រប់គ្រងសំណួរ-ចម្លើយញឹកញាប់ (FAQs)' : 'Institutional FAQs Knowledge Base'}
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
              {isKhmer ? 'សំណួរ-ចម្លើយញឹកញាប់របស់វិទ្យាស្ថាន' : 'Frequently Asked Questions (FAQs)'}
            </h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.94rem', maxWidth: '740px', lineHeight: 1.5 }}>
              {isKhmer
                ? 'គ្រប់គ្រងសំណួរ និងចម្លើយបំភ្លឺជូនសិស្ស-និស្សិត អំពីលក្ខខណ្ឌចូលរៀន អាហារូបករណ៍ ជំនាញបណ្តុះបណ្តាល និងបរិក្ខារសិក្សារបស់វិទ្យាស្ថាន RPITSSR។'
                : 'Manage student inquiries regarding admission requirements, TVET scholarships, diploma courses, and campus facilities.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="admin-faqs-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
              <span>{isKhmer ? 'បង្កើតសំណួរថ្មី' : 'Add Question'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 4-Card Institutional KPI Metric Strip */}
      <div className="admin-kpi-grid admin-faqs-kpis">
        {/* KPI 1: Total FAQs */}
        <div
          className="admin-kpi-card"
          onClick={() => setActiveCategoryTab('all')}
          style={{
            cursor: 'pointer',
            border: activeCategoryTab === 'all' ? '1.5px solid #1e73be' : '1px solid #e2e8f0',
          }}
          title={isKhmer ? 'ចុចដើម្បីបង្ហាញសំណួរទាំងអស់' : 'Click to filter all FAQs'}
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
            <HelpCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              {isKhmer ? 'សំណួរ-ចម្លើយសរុប' : 'Total FAQs'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#07294D', lineHeight: 1.2 }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#1e73be', fontWeight: 600, marginTop: '2px' }}>
              {isKhmer ? 'សំណួរត្រូវបានឆ្លើយបំភ្លឺ' : 'Published questions'}
            </div>
          </div>
        </div>

        {/* KPI 2: Categories Count */}
        <div
          className="admin-kpi-card"
          onClick={() => setActiveCategoryTab('all')}
          style={{
            cursor: 'pointer',
            border: '1px solid #e2e8f0',
          }}
          title={isKhmer ? 'បង្ហាញតាមចំណាត់ថ្នាក់' : 'View by category'}
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
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              {isKhmer ? 'ចំណាត់ថ្នាក់ប្រភេទ' : 'Categories'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#07294D', lineHeight: 1.2 }}>
              {stats.categoriesCount}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#7c3aed', fontWeight: 600, marginTop: '2px' }}>
              {isKhmer ? 'ការចុះឈ្មោះ, ជំនាញ, អាហារូបករណ៍...' : 'Admissions, Majors, Fees'}
            </div>
          </div>
        </div>

        {/* KPI 3: Admissions & Scholarships */}
        <div
          className="admin-kpi-card"
          onClick={() => setActiveCategoryTab('admission')}
          style={{
            cursor: 'pointer',
            border: activeCategoryTab === 'admission' ? '1.5px solid #ca8a04' : '1px solid #e2e8f0',
          }}
          title={isKhmer ? 'ចុចដើម្បីបង្ហាញសំណួរចុះឈ្មោះ' : 'Click to filter admission FAQs'}
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
          <div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              {isKhmer ? 'ចុះឈ្មោះ & អាហារូបករណ៍' : 'Admission & Grants'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#07294D', lineHeight: 1.2 }}>
              {stats.admissionCount}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#ea580c', fontWeight: 600, marginTop: '2px' }}>
              {isKhmer ? 'សំណួរពេញនិយមពីសិស្ស' : 'Most inquired topics'}
            </div>
          </div>
        </div>

        {/* KPI 4: Courses & Majors */}
        <div
          className="admin-kpi-card"
          onClick={() => setActiveCategoryTab('courses')}
          style={{
            cursor: 'pointer',
            border: activeCategoryTab === 'courses' ? '1.5px solid #059669' : '1px solid #e2e8f0',
          }}
          title={isKhmer ? 'ចុចដើម្បីបង្ហាញសំណួរវគ្គសិក្សា' : 'Click to filter courses FAQs'}
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
            <GraduationCap size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              {isKhmer ? 'ជំនាញ & កម្មវិធីសិក្សា' : 'Courses & Majors'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#07294D', lineHeight: 1.2 }}>
              {stats.academicCount}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
              {isKhmer ? 'កម្មវិធីបណ្តុះបណ្តាល TVET' : 'Technical curricula'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Container */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Category Tabs Filter */}
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
            onClick={() => setActiveCategoryTab('all')}
            style={{
              padding: '14px 16px',
              border: 'none',
              background: 'transparent',
              fontSize: '0.88rem',
              fontWeight: activeCategoryTab === 'all' ? 700 : 600,
              color: activeCategoryTab === 'all' ? '#1e73be' : '#64748b',
              borderBottom: activeCategoryTab === 'all' ? '2.5px solid #1e73be' : '2.5px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{isKhmer ? 'ទាំងអស់' : 'All FAQs'}</span>
            <span
              style={{
                fontSize: '0.74rem',
                padding: '2px 8px',
                borderRadius: '12px',
                background: activeCategoryTab === 'all' ? '#eff6ff' : '#e2e8f0',
                color: activeCategoryTab === 'all' ? '#1e73be' : '#64748b',
                fontWeight: 700,
              }}
            >
              {faqs.length}
            </span>
          </button>

          {/* Dynamic Category Tabs */}
          {categoryList.map((catKey) => {
            const count = faqs.filter((f) => (f.category || '').toLowerCase() === catKey).length;
            const isTabActive = activeCategoryTab === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setActiveCategoryTab(catKey)}
                style={{
                  padding: '14px 16px',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '0.88rem',
                  fontWeight: isTabActive ? 700 : 600,
                  color: isTabActive ? '#7c3aed' : '#64748b',
                  borderBottom: isTabActive ? '2.5px solid #7c3aed' : '2.5px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{getCategoryLabel(catKey)}</span>
                <span
                  style={{
                    fontSize: '0.74rem',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: isTabActive ? '#faf5ff' : '#e2e8f0',
                    color: isTabActive ? '#7c3aed' : '#64748b',
                    fontWeight: 700,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
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
              placeholder={isKhmer ? 'ស្វែងរកតាមសំណួរ, ចម្លើយ, ឬប្រភេទ...' : 'Search questions or answers...'}
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

          {/* Sort & View Mode Switcher */}
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
                <option value="order">{isKhmer ? 'លំដាប់បង្ហាញ (Order)' : 'Display Order'}</option>
                <option value="question">{isKhmer ? 'សំណួរ (A-Z)' : 'Question (A-Z)'}</option>
                <option value="category">{isKhmer ? 'ចំណាត់ថ្នាក់ប្រភេទ' : 'Category'}</option>
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
            <div>{isKhmer ? 'កំពុងទាញយកទិន្នន័យសំណួរ-ចម្លើយ...' : 'Loading FAQs...'}</div>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div style={{ padding: '70px 20px', textAlign: 'center', color: '#94a3b8' }}>
            <FileQuestion size={44} style={{ margin: '0 auto 14px auto', opacity: 0.4 }} />
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
              {isKhmer ? 'មិនមានសំណួរ-ចម្លើយនៅក្នុងលក្ខខណ្ឌនេះទេ' : 'No FAQs found matching criteria'}
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem' }}>
              {isKhmer ? 'សូមសាកល្បងស្វែងរកពាក្យគន្លឹះផ្សេង ឬបង្កើតសំណួរថ្មី' : 'Try adjusting keywords or add a new question.'}
            </p>
            <button
              onClick={openAddModal}
              className="admin-btn admin-btn-primary admin-btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} />
              <span>{isKhmer ? 'បង្កើតសំណួរថ្មី' : 'Add FAQ'}</span>
            </button>
          </div>
        ) : viewMode === 'table' ? (
          <>
            {/* Desktop Table View (hidden on <= 768px via admin.css) */}
            <div className="admin-table-wrapper admin-faqs-desktop-table" style={{ width: '100%', overflowX: 'auto' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
                      {isKhmer ? 'សំណួរ & ចម្លើយសង្ខេប' : 'Question & Answer Summary'}
                    </th>
                    <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 700, color: '#475569', width: '140px' }}>
                      {isKhmer ? 'ប្រភេទ' : 'Category'}
                    </th>
                    <th style={{ padding: '12px 10px', textAlign: 'center', fontSize: '0.82rem', fontWeight: 700, color: '#475569', width: '80px' }}>
                      {isKhmer ? 'លំដាប់' : 'Order'}
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.82rem', fontWeight: 700, color: '#475569', width: '110px' }}>
                      {isKhmer ? 'សកម្មភាព' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFaqs.map((faq) => {
                    const badgeStyle = getCategoryBadgeStyle(faq.category);

                    return (
                      <tr
                        key={faq.id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {/* Question & Answer Preview */}
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: '#eff6ff',
                                border: '1px solid #dbeafe',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#1e73be',
                                fontWeight: 700,
                                fontSize: '0.88rem',
                                flexShrink: 0,
                                marginTop: '2px',
                              }}
                            >
                              Q
                            </div>

                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div
                                onClick={() => openDetail(faq)}
                                style={{
                                  fontWeight: 700,
                                  color: '#07294D',
                                  fontSize: '0.92rem',
                                  marginBottom: '4px',
                                  cursor: 'pointer',
                                  lineHeight: 1.4,
                                  transition: 'color 0.15s',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = '#1e73be')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = '#07294D')}
                                title={faq.question}
                              >
                                {faq.question}
                              </div>
                              <div
                                style={{
                                  fontSize: '0.8rem',
                                  color: '#64748b',
                                  lineHeight: 1.4,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {faq.answer}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category Badge */}
                        <td style={{ padding: '14px 14px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '3px 9px',
                              borderRadius: '6px',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              background: badgeStyle.bg,
                              color: badgeStyle.color,
                              border: `1px solid ${badgeStyle.border}`,
                              maxWidth: '130px',
                            }}
                            title={faq.category}
                          >
                            <Tag size={11} style={{ flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {getCategoryLabel(faq.category)}
                            </span>
                          </span>
                        </td>

                        {/* Display Order */}
                        <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: '26px',
                              height: '22px',
                              borderRadius: '6px',
                              background: '#f1f5f9',
                              color: '#475569',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            #{faq.order !== undefined ? faq.order : 0}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px' }}>
                            <button
                              onClick={() => openDetail(faq)}
                              className="admin-btn admin-btn-outline admin-btn-sm"
                              title={isKhmer ? 'មើលលម្អិត' : 'View FAQ'}
                              style={{ width: '28px', height: '28px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              onClick={() => openEditModal(faq)}
                              className="admin-btn admin-btn-outline admin-btn-sm"
                              title={isKhmer ? 'កែសម្រួល' : 'Edit FAQ'}
                              style={{ width: '28px', height: '28px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => confirmDelete(faq)}
                              className="admin-btn admin-btn-danger admin-btn-sm"
                              title={isKhmer ? 'លុប' : 'Delete FAQ'}
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
            <div className="admin-faqs-mobile-cards">
              {filteredFaqs.map((faq) => {
                const badgeStyle = getCategoryBadgeStyle(faq.category);
                const isExpanded = expandedFaqIds.has(faq.id);

                return (
                  <div
                    key={faq.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      padding: '16px',
                      boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    {/* Header: Category Badge & Order */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          background: badgeStyle.bg,
                          color: badgeStyle.color,
                          border: `1px solid ${badgeStyle.border}`,
                        }}
                      >
                        <Tag size={11} />
                        <span>{getCategoryLabel(faq.category)}</span>
                      </span>

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
                      >
                        #{faq.order !== undefined ? faq.order : 0}
                      </span>
                    </div>

                    {/* Question Headline */}
                    <h4
                      onClick={() => toggleExpand(faq.id)}
                      style={{
                        fontSize: '0.96rem',
                        fontWeight: 700,
                        color: '#07294D',
                        margin: 0,
                        cursor: 'pointer',
                        lineHeight: 1.4,
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '8px',
                      }}
                    >
                      <span>{faq.question}</span>
                      <span style={{ color: '#94a3b8', flexShrink: 0, marginTop: '2px' }}>
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </span>
                    </h4>

                    {/* Answer Preview */}
                    <div
                      style={{
                        fontSize: '0.84rem',
                        color: '#475569',
                        lineHeight: 1.55,
                        background: '#f8fafc',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #f1f5f9',
                        display: isExpanded ? 'block' : '-webkit-box',
                        WebkitLineClamp: isExpanded ? 'unset' : 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {faq.answer}
                    </div>

                    {/* Footer: Expand toggle & Action buttons */}
                    <div
                      style={{
                        paddingTop: '10px',
                        borderTop: '1px dashed #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <button
                        onClick={() => toggleExpand(faq.id)}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: '#1e73be',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        {isExpanded ? (isKhmer ? 'បង្រួមចម្លើយ ▲' : 'Collapse ▲') : (isKhmer ? 'មើលចម្លើយពេញ ▼' : 'Expand ▼')}
                      </button>

                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          onClick={() => openDetail(faq)}
                          className="admin-btn admin-btn-outline admin-btn-sm"
                          title={isKhmer ? 'មើលលម្អិត' : 'View FAQ'}
                          style={{ width: '28px', height: '28px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => openEditModal(faq)}
                          className="admin-btn admin-btn-outline admin-btn-sm"
                          title={isKhmer ? 'កែសម្រួល' : 'Edit FAQ'}
                          style={{ width: '28px', height: '28px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => confirmDelete(faq)}
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          title={isKhmer ? 'លុប' : 'Delete FAQ'}
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
          /* Cards / Accordion View */
          <div
            style={{
              padding: 'clamp(14px, 3vw, 24px)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
              background: '#f8fafc',
            }}
          >
            {filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqIds.has(faq.id);
              const badgeStyle = getCategoryBadgeStyle(faq.category);

              return (
                <div
                  key={faq.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    padding: '18px',
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        background: badgeStyle.bg,
                        color: badgeStyle.color,
                        border: `1px solid ${badgeStyle.border}`,
                      }}
                    >
                      <Tag size={11} />
                      <span>{getCategoryLabel(faq.category)}</span>
                    </span>

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
                    >
                      #{faq.order !== undefined ? faq.order : 0}
                    </span>
                  </div>

                  {/* Question */}
                  <h3
                    onClick={() => toggleExpand(faq.id)}
                    style={{
                      fontSize: '0.98rem',
                      fontWeight: 700,
                      color: '#07294D',
                      margin: '0 0 10px 0',
                      cursor: 'pointer',
                      lineHeight: 1.45,
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    <span>{faq.question}</span>
                    <span style={{ color: '#94a3b8', flexShrink: 0, marginTop: '2px' }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </h3>

                  {/* Answer */}
                  <p
                    style={{
                      fontSize: '0.84rem',
                      color: '#475569',
                      lineHeight: 1.6,
                      margin: '0 0 16px 0',
                      background: '#f8fafc',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #f1f5f9',
                      display: isExpanded ? 'block' : '-webkit-box',
                      WebkitLineClamp: isExpanded ? 'unset' : 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      flex: 1,
                    }}
                  >
                    {faq.answer}
                  </p>

                  {/* Card Footer */}
                  <div
                    style={{
                      paddingTop: '12px',
                      borderTop: '1px dashed #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <button
                      onClick={() => toggleExpand(faq.id)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#1e73be',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {isExpanded
                        ? isKhmer
                          ? 'បង្រួមចម្លើយ ▲'
                          : 'Collapse ▲'
                        : isKhmer
                        ? 'មើលចម្លើយពេញ ▼'
                        : 'Expand ▼'}
                    </button>

                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        onClick={() => openEditModal(faq)}
                        className="admin-btn admin-btn-outline admin-btn-sm"
                        style={{ padding: '5px 8px' }}
                        title={isKhmer ? 'កែសម្រួល' : 'Edit'}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => confirmDelete(faq)}
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
              ? `បង្ហាញ ${filteredFaqs.length} ក្នុងចំណោមសំណួរ-ចម្លើយសរុប ${faqs.length}`
              : `Showing ${filteredFaqs.length} of ${faqs.length} total FAQs`}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span>
              {isKhmer ? `📂 ${categoryList.length} ចំណាត់ថ្នាក់` : `📂 ${categoryList.length} categories`}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Add / Edit Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingFaq
            ? isKhmer
              ? 'កែសម្រួលសំណួរ-ចម្លើយ FAQ'
              : 'Edit FAQ Item'
            : isKhmer
            ? 'បង្កើតសំណួរ-ចម្លើយ FAQ ថ្មី'
            : 'Add New FAQ Question'
        }
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        maxWidth="620px"
        submitLabel={isKhmer ? (editingFaq ? 'រក្សាទុកការកែប្រែ' : 'បង្កើតសំណួរថ្មី') : undefined}
        cancelLabel={isKhmer ? 'បោះបង់' : undefined}
      >
        {/* Question Input */}
        <div className="admin-form-group" style={{ marginBottom: '16px' }}>
          <label className="admin-form-label" style={{ fontWeight: 700, color: '#07294D', marginBottom: '6px', display: 'block' }}>
            {isKhmer ? 'ខ្លឹមសារសំណួរ (Question) *' : 'Question Text *'}
          </label>
          <input
            type="text"
            className="admin-form-control"
            required
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            placeholder={isKhmer ? 'ឧ. តើខ្ញុំត្រូវមានឯកសារអ្វីខ្លះដើម្បីចុះឈ្មោះចូលរៀន?' : 'e.g. What documents are required for admission?'}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />
        </div>

        {/* Category & Order */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', marginBottom: '16px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label" style={{ fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
              {isKhmer ? 'ចំណាត់ថ្នាក់ប្រភេទ' : 'Category'}
            </label>
            <select
              className="admin-form-control"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
            >
              <option value="admission">{isKhmer ? 'ការចុះឈ្មោះចូលរៀន (Admission)' : 'Admission'}</option>
              <option value="courses">{isKhmer ? 'ជំនាញ & វគ្គសិក្សា (Courses)' : 'Courses & Majors'}</option>
              <option value="fees">{isKhmer ? 'តម្លៃសិក្សា & អាហារូបករណ៍ (Fees & Scholarships)' : 'Fees & Scholarships'}</option>
              <option value="facilities">{isKhmer ? 'អគារសិក្សា & អន្តេវាសិកដ្ឋាន (Facilities)' : 'Facilities'}</option>
              <option value="general">{isKhmer ? 'ព័ត៌មានទូទៅ (General)' : 'General'}</option>
            </select>
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

        {/* Answer Textarea */}
        <div className="admin-form-group" style={{ marginBottom: '10px' }}>
          <label className="admin-form-label" style={{ fontWeight: 700, color: '#07294D', marginBottom: '6px', display: 'block' }}>
            {isKhmer ? 'ចម្លើយបំភ្លឺលម្អិត (Detailed Answer) *' : 'Detailed Answer *'}
          </label>
          <textarea
            className="admin-form-control"
            rows={5}
            required
            value={formData.answer}
            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
            placeholder={isKhmer ? 'សរសេរចម្លើយដែលច្បាស់លាស់ ងាយយល់ និងមានប្រយោជន៍ដល់សិស្ស...' : 'Write clear and helpful answer for students...'}
            style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', lineHeight: 1.5, resize: 'vertical' }}
          />
        </div>
      </AdminModal>

      {/* 5. Detail Lightbox Modal */}
      {detailModalOpen && selectedFaq && (
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
              maxWidth: '620px',
              width: '100%',
              padding: 'clamp(18px, 4vw, 28px)',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 24px 48px rgba(7, 41, 77, 0.25)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  ...getCategoryBadgeStyle(selectedFaq.category),
                }}
              >
                <Tag size={12} />
                <span>{getCategoryLabel(selectedFaq.category)}</span>
              </span>

              <button
                onClick={() => setDetailModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Question */}
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#07294D', margin: '0 0 16px 0', lineHeight: 1.4 }}>
              {selectedFaq.question}
            </h3>

            {/* Answer */}
            <div
              style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '18px',
                border: '1px solid #e2e8f0',
                color: '#334155',
                fontSize: '0.94rem',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                marginBottom: '22px',
              }}
            >
              {selectedFaq.answer}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {isKhmer ? `លំដាប់បង្ហាញ៖ #${selectedFaq.order || 0}` : `Display Order: #${selectedFaq.order || 0}`}
              </span>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    setDetailModalOpen(false);
                    openEditModal(selectedFaq);
                  }}
                  className="admin-btn admin-btn-primary admin-btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Edit2 size={14} />
                  <span>{isKhmer ? 'កែសម្រួល' : 'Edit'}</span>
                </button>
                <button
                  onClick={() => setDetailModalOpen(false)}
                  className="admin-btn admin-btn-outline admin-btn-sm"
                >
                  {isKhmer ? 'បិទ' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Safe Delete Confirmation Modal */}
      {deleteModalOpen && deletingFaq && (
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
                  {isKhmer ? 'បញ្ជាក់ការលុបសំណួរ' : 'Confirm Delete FAQ'}
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  {isKhmer ? 'សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានទេ' : 'This action cannot be undone.'}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              {isKhmer
                ? `តើអ្នកពិតជាចង់លុបសំណួរ "${deletingFaq.question}" នេះចេញពីគេហទំព័រមែនទេ?`
                : `Are you sure you want to delete this FAQ: "${deletingFaq.question}"?`}
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
                <span>{isKhmer ? 'បាទ/ចាស លុបចេញ' : 'Delete FAQ'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
