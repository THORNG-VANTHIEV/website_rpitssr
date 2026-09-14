import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import {
  FileDown,
  FileText,
  UploadCloud,
  Download,
  Star,
  CheckCircle,
  XCircle,
  Eye,
  Edit2,
  Trash2,
  Plus,
  X,
  File,
  Filter,
  BarChart3
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'admissions', labelKm: 'ចុះឈ្មោះ & អាហារូបករណ៍', labelEn: 'Admissions & Scholarships', color: '#10b981' },
  { value: 'calendars', labelKm: 'ប្រតិទិន & កាលវិភាគ', labelEn: 'Calendars & Timetables', color: '#3b82f6' },
  { value: 'handbooks', labelKm: 'បទបញ្ជា & សៀវភៅណែនាំ', labelEn: 'Handbooks & Regulations', color: '#f59e0b' },
  { value: 'adminForms', labelKm: 'បែបបទរដ្ឋបាល & សេវាសិស្ស', labelEn: 'Admin & Student Forms', color: '#8b5cf6' },
  { value: 'general', labelKm: 'ឯកសារទូទៅ', labelEn: 'General Documents', color: '#64748b' }
];

export const AdminDownloadsPage = () => {
  const { currentLanguage } = useLanguage();
  const isKhmer = currentLanguage === 'km';

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Form State
  const [formData, setFormData] = useState({
    title_km: '',
    title_en: '',
    code: '',
    category: 'admissions',
    file_type: 'pdf',
    file_size: '',
    file_path: '',
    description_km: '',
    description_en: '',
    submission_office: 'ការិយាល័យសិក្សា និងកិច្ចការនិស្សិត (អគារ A, បន្ទប់ ១០៤)',
    required_docs_km: [''],
    required_docs_en: [''],
    downloads_count: 0,
    is_popular: false,
    is_active: true,
    order: 0,
  });

  // Fetch Documents
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/documents?limit=100');
      if (res.data?.success && res.data?.data) {
        setDocuments(res.data.data);
      } else if (Array.isArray(res.data)) {
        setDocuments(res.data);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = documents.length;
    const downloads = documents.reduce((sum, d) => sum + (Number(d.downloads_count) || 0), 0);
    const active = documents.filter((d) => d.is_active).length;
    const popular = documents.filter((d) => d.is_popular).length;
    return { total, downloads, active, popular };
  }, [documents]);

  // Open Modal for Create
  const openAddModal = () => {
    setEditingDoc(null);
    setFormData({
      title_km: '',
      title_en: '',
      code: `FORM-RPITSSR-${String(documents.length + 1).padStart(2, '0')}`,
      category: 'admissions',
      file_type: 'pdf',
      file_size: '1.0 MB',
      file_path: '',
      description_km: '',
      description_en: '',
      submission_office: 'ការិយាល័យសិក្សា និងកិច្ចការនិស្សិត (អគារ A, បន្ទប់ ១០៤)',
      required_docs_km: [''],
      required_docs_en: [''],
      downloads_count: 0,
      is_popular: false,
      is_active: true,
      order: documents.length + 1,
    });
    setModalOpen(true);
  };

  // Open Modal for Edit
  const openEditModal = (doc) => {
    setEditingDoc(doc);
    setFormData({
      title_km: doc.title_km || '',
      title_en: doc.title_en || '',
      code: doc.code || '',
      category: doc.category || 'admissions',
      file_type: doc.file_type || 'pdf',
      file_size: doc.file_size || '',
      file_path: doc.file_path || '',
      description_km: doc.description_km || '',
      description_en: doc.description_en || '',
      submission_office: doc.submission_office || '',
      required_docs_km: Array.isArray(doc.required_docs_km) && doc.required_docs_km.length > 0 ? doc.required_docs_km : [''],
      required_docs_en: Array.isArray(doc.required_docs_en) && doc.required_docs_en.length > 0 ? doc.required_docs_en : [''],
      downloads_count: doc.downloads_count || 0,
      is_popular: !!doc.is_popular,
      is_active: doc.is_active !== undefined ? !!doc.is_active : true,
      order: doc.order || 0,
    });
    setModalOpen(true);
  };

  // File Upload Handler
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    setUploadingFile(true);
    try {
      const res = await api.post('/admin/documents/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        setFormData((prev) => ({
          ...prev,
          file_path: res.data.url,
          file_type: res.data.fileType || prev.file_type,
          file_size: res.data.fileSize || prev.file_size,
        }));
      }
    } catch (err) {
      console.error('File upload error:', err);
      alert('Failed to upload file. Allowed: PDF, Word, Excel, ZIP (Max 25MB).');
    } finally {
      setUploadingFile(false);
    }
  };

  // Dynamic Array Handlers for Required Documents
  const handleReqDocChange = (index, value, lang = 'km') => {
    const key = lang === 'km' ? 'required_docs_km' : 'required_docs_en';
    setFormData((prev) => {
      const list = [...prev[key]];
      list[index] = value;
      return { ...prev, [key]: list };
    });
  };

  const addReqDocField = (lang = 'km') => {
    const key = lang === 'km' ? 'required_docs_km' : 'required_docs_en';
    setFormData((prev) => ({
      ...prev,
      [key]: [...prev[key], ''],
    }));
  };

  const removeReqDocField = (index, lang = 'km') => {
    const key = lang === 'km' ? 'required_docs_km' : 'required_docs_en';
    setFormData((prev) => {
      const list = prev[key].filter((_, i) => i !== index);
      return { ...prev, [key]: list.length > 0 ? list : [''] };
    });
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title_km.trim()) {
      alert('Please enter Document Title in Khmer.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        required_docs_km: formData.required_docs_km.filter((item) => item.trim()),
        required_docs_en: formData.required_docs_en.filter((item) => item.trim()),
      };

      if (editingDoc) {
        await api.put(`/admin/documents/${editingDoc.id}`, payload);
      } else {
        await api.post('/admin/documents', payload);
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save document.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Handler
  const handleDelete = async (doc) => {
    if (!window.confirm(`Are you sure you want to delete "${doc.title_km}"?`)) return;
    try {
      await api.delete(`/admin/documents/${doc.id}`);
      fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete document.');
    }
  };

  // Toggle Popular
  const handleTogglePopular = async (doc) => {
    try {
      await api.post(`/admin/documents/${doc.id}/toggle-popular`);
      fetchData();
    } catch (err) {
      console.error('Toggle popular failed:', err);
    }
  };

  // Toggle Active
  const handleToggleActive = async (doc) => {
    try {
      await api.post(`/admin/documents/${doc.id}/toggle-active`);
      fetchData();
    } catch (err) {
      console.error('Toggle active failed:', err);
    }
  };

  // Filtered by selected category tab
  const displayedDocuments = useMemo(() => {
    if (selectedCategory === 'all') return documents;
    return documents.filter((d) => d.category === selectedCategory);
  }, [documents, selectedCategory]);

  // Data Table Columns
  const columns = [
    {
      header: isKhmer ? 'កូដ & ចំណងជើងឯកសារ' : 'Code & Document Title',
      render: (row) => (
        <div style={{ maxWidth: '380px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: '#eff6ff',
                color: '#1e73be',
                border: '1px solid #bfdbfe',
              }}
            >
              {row.code || 'FORM-DOC'}
            </span>
            {row.is_popular && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: '#fef3c7',
                  color: '#b45309',
                }}
              >
                <Star size={11} fill="#f59e0b" color="#f59e0b" /> {isKhmer ? 'ឯកសារពេញនិយម' : 'Top Form'}
              </span>
            )}
          </div>
          <div style={{ fontWeight: '700', color: 'var(--admin-primary)', fontSize: '0.92rem', lineHeight: '1.4' }}>
            {row.title_km}
          </div>
          {row.title_en && (
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
              {row.title_en}
            </div>
          )}
        </div>
      ),
    },
    {
      header: isKhmer ? 'ប្រភេទ' : 'Category',
      render: (row) => {
        const cat = CATEGORY_OPTIONS.find((c) => c.value === row.category);
        return (
          <span
            style={{
              display: 'inline-block',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '600',
              backgroundColor: cat ? `${cat.color}15` : '#f1f5f9',
              color: cat ? cat.color : '#475569',
              border: `1px solid ${cat ? `${cat.color}35` : '#cbd5e1'}`,
              whiteSpace: 'nowrap',
            }}
          >
            {cat ? (isKhmer ? cat.labelKm : cat.labelEn) : row.category}
          </span>
        );
      },
    },
    {
      header: isKhmer ? 'ឯកសារ & ទម្រង់' : 'File & Format',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              backgroundColor: row.file_type === 'pdf' ? '#fee2e2' : row.file_type === 'xlsx' ? '#dcfce7' : '#e0f2fe',
              color: row.file_type === 'pdf' ? '#ef4444' : row.file_type === 'xlsx' ? '#16a34a' : '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
            }}
          >
            {row.file_type || 'PDF'}
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '0.84rem', textTransform: 'uppercase' }}>
              {row.file_type || 'PDF'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
              {row.file_size || 'N/A'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: isKhmer ? 'ការទាញយក' : 'Downloads',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: '#0f172a' }}>
          <Download size={15} style={{ color: '#1e73be' }} />
          <span>{(Number(row.downloads_count) || 0).toLocaleString()}</span>
        </div>
      ),
    },
    {
      header: isKhmer ? 'ស្ថានភាព' : 'Status',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => handleToggleActive(row)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600',
              backgroundColor: row.is_active ? '#dcfce7' : '#f1f5f9',
              color: row.is_active ? '#15803d' : '#64748b',
            }}
            title={isKhmer ? 'ចុចដើម្បីបិទ/បើកការបង្ហាញជាសាធារណៈ' : 'Click to toggle public status'}
          >
            {row.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
            {row.is_active ? (isKhmer ? 'សកម្ម' : 'Active') : (isKhmer ? 'អសកម្ម' : 'Inactive')}
          </button>
        </div>
      ),
    },
    {
      header: isKhmer ? 'សកម្មភាព' : 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Toggle Popular */}
          <button
            onClick={() => handleTogglePopular(row)}
            className="admin-action-btn"
            style={{ color: row.is_popular ? '#f59e0b' : '#94a3b8' }}
            title={row.is_popular ? (isKhmer ? 'ដកការពេញនិយម' : 'Unmark Popular') : (isKhmer ? 'កំណត់ជាពេញនិយម' : 'Mark as Popular')}
          >
            <Star size={16} fill={row.is_popular ? '#f59e0b' : 'none'} />
          </button>

          {/* Edit */}
          <button
            onClick={() => openEditModal(row)}
            className="admin-action-btn"
            style={{ color: 'var(--admin-primary)' }}
            title={isKhmer ? 'កែសម្រួលឯកសារ' : 'Edit Document'}
          >
            <Edit2 size={16} />
          </button>

          {/* Delete */}
          <button
            onClick={() => handleDelete(row)}
            className="admin-action-btn delete"
            style={{ color: '#ef4444' }}
            title={isKhmer ? 'លុបឯកសារ' : 'Delete Document'}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--admin-primary)', margin: 0 }}>
            {isKhmer ? 'ឯកសារផ្លូវការ & មជ្ឈមណ្ឌលទាញយក' : 'Official Documents & Download Center'}
          </h2>
          <p style={{ margin: '6px 0 0', color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>
            {isKhmer
              ? 'គ្រប់គ្រងទម្រង់បែបបទផ្លូវការ ពាក្យសុំចុះឈ្មោះ សៀវភៅណែនាំនិស្សិត និងកាលវិភាគសិក្សាសម្រាប់សាធារណជនទាញយក។'
              : 'Manage official forms, applications, student handbooks, and academic schedules available for public download.'}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="admin-btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          <Plus size={18} />
          <span>{isKhmer ? 'បន្ថែមឯកសារថ្មី' : 'Add New Document'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div className="admin-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              color: '#1e73be',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', fontWeight: '600' }}>
              {isKhmer ? 'ឯកសារសរុប' : 'Total Documents'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--admin-primary)' }}>
              {metrics.total}
            </div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#ecfdf5',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Download size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', fontWeight: '600' }}>
              {isKhmer ? 'ការទាញយកសរុប' : 'Total Downloads'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981' }}>
              {metrics.downloads.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#fef3c7',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Star size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', fontWeight: '600' }}>
              {isKhmer ? 'ឯកសារពេញនិយម' : 'Popular Forms'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#b45309' }}>
              {metrics.popular}
            </div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#f5f3ff',
              color: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', fontWeight: '600' }}>
              {isKhmer ? 'ឯកសារសកម្ម' : 'Active Published'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#8b5cf6' }}>
              {metrics.active}
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <button
          onClick={() => setSelectedCategory('all')}
          style={{
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            fontWeight: '600',
            border: '1px solid',
            cursor: 'pointer',
            backgroundColor: selectedCategory === 'all' ? '#07294D' : '#ffffff',
            borderColor: selectedCategory === 'all' ? '#07294D' : '#e2e8f0',
            color: selectedCategory === 'all' ? '#ffffff' : '#475569',
            transition: 'all 0.2s ease',
          }}
        >
          {isKhmer ? 'ឯកសារទាំងអស់' : 'All Documents'} ({documents.length})
        </button>
        {CATEGORY_OPTIONS.map((cat) => {
          const count = documents.filter((d) => d.category === cat.value).length;
          const isSelected = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: '600',
                border: '1px solid',
                cursor: 'pointer',
                backgroundColor: isSelected ? cat.color : '#ffffff',
                borderColor: isSelected ? cat.color : '#e2e8f0',
                color: isSelected ? '#ffffff' : '#475569',
                transition: 'all 0.2s ease',
              }}
            >
              {isKhmer ? cat.labelKm : cat.labelEn} ({count})
            </button>
          );
        })}
      </div>

      {/* Data Table */}
      <AdminDataTable
        title={isKhmer ? 'តារាងបញ្ជីឯកសារផ្លូវការ' : 'Documents Directory'}
        subtitle={isKhmer ? `បង្ហាញ ${displayedDocuments.length} ឯកសារ` : `Showing ${displayedDocuments.length} documents`}
        columns={columns}
        data={displayedDocuments}
        loading={loading}
        onAdd={openAddModal}
        addLabel={isKhmer ? 'បន្ថែមឯកសារ' : 'Add Document'}
        onRefresh={fetchData}
        searchPlaceholder={isKhmer ? 'ស្វែងរកតាមចំណងជើង លេខកូដ ឬការពណ៌នា...' : 'Search by title, code, or description...'}
      />

      {/* Add / Edit Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDoc ? (isKhmer ? 'កែសម្រួលឯកសារផ្លូវការ' : 'Edit Official Document') : (isKhmer ? 'បន្ថែមឯកសារផ្លូវការថ្មី' : 'Add New Official Document')}
        onSubmit={handleSubmit}
        submitLabel={submitting ? (isKhmer ? 'កំពុងរក្សាទុក...' : 'Saving Document...') : editingDoc ? (isKhmer ? 'កែប្រែឯកសារ' : 'Update Document') : (isKhmer ? 'រក្សាទុកឯកសារ' : 'Save Document')}
        cancelLabel={isKhmer ? 'បោះបង់' : 'Cancel'}
        isSubmitting={submitting}
        maxWidth="750px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* File Upload Box */}
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: '2px dashed #bfdbfe',
              backgroundColor: '#f8fafc',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <UploadCloud size={32} style={{ color: '#1e73be' }} />
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a' }}>
                {isKhmer ? 'ផ្ទុកឡើងឯកសារទម្រង់ / លិខិត (PDF, DOCX, XLSX, ZIP)' : 'Upload Form / Document File (PDF, DOCX, XLSX, ZIP)'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                {isKhmer ? 'គាំទ្រឯកសារទំហំរហូតដល់ 25MB។ ទំហំ និងប្រភេទឯកសារនឹងត្រូវបានរកឃើញដោយស្វ័យប្រវត្តិ។' : 'Supports files up to 25MB. File size and format are automatically detected.'}
              </div>

              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#1e73be',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginTop: '6px',
                }}
              >
                <span>
                  {uploadingFile
                    ? (isKhmer ? 'កំពុងផ្ទុកឯកសារឡើង...' : 'Uploading File...')
                    : (isKhmer ? 'ជ្រើសរើសឯកសារដើម្បីផ្ទុកឡើង' : 'Choose File to Upload')}
                </span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
                  style={{ display: 'none' }}
                  disabled={uploadingFile}
                />
              </label>

              {formData.file_path && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    marginTop: '8px',
                  }}
                >
                  <CheckCircle size={14} />
                  <span>
                    {isKhmer ? 'បានភ្ជាប់ឯកសារ៖ ' : 'File attached: '}
                    {formData.file_path} ({formData.file_size || (isKhmer ? 'រួចរាល់' : 'Ready')})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Form Code & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="admin-form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.85rem' }}>
                {isKhmer ? 'លេខកូដទម្រង់' : 'Document Code'}
              </label>
              <input
                type="text"
                className="admin-form-input"
                placeholder={isKhmer ? 'ឧ. FORM-TVET-01' : 'e.g. FORM-TVET-01'}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>

            <div>
              <label className="admin-form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.85rem' }}>
                {isKhmer ? 'ប្រភេទឯកសារ *' : 'Category *'}
              </label>
              <select
                className="admin-form-input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {isKhmer ? cat.labelKm : cat.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title Khmer & Title English */}
          <div>
            <label className="admin-form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.85rem' }}>
              {isKhmer ? 'ចំណងជើងជាភាសាខ្មែរ *' : 'Title in Khmer *'}
            </label>
            <input
              type="text"
              className="admin-form-input"
              placeholder={isKhmer ? 'ឧ. ពាក្យសុំចុះឈ្មោះវគ្គបណ្តុះបណ្តាលជំនាញវិជ្ជាជីវៈ ១.៥ លាននាក់' : 'e.g. Title in Khmer'}
              value={formData.title_km}
              onChange={(e) => setFormData({ ...formData, title_km: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="admin-form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.85rem' }}>
              {isKhmer ? 'ចំណងជើងជាភាសាអង់គ្លេស' : 'Title in English'}
            </label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="e.g. TVET 1.5M Vocational Training Scholarship Application Form"
              value={formData.title_en}
              onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
            />
          </div>

          {/* Format, Size & Office */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '12px' }}>
            <div>
              <label className="admin-form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.85rem' }}>
                {isKhmer ? 'ទម្រង់ឯកសារ' : 'Format'}
              </label>
              <select
                className="admin-form-input"
                value={formData.file_type}
                onChange={(e) => setFormData({ ...formData, file_type: e.target.value })}
              >
                <option value="pdf">PDF</option>
                <option value="docx">DOCX (Word)</option>
                <option value="xlsx">XLSX (Excel)</option>
                <option value="pptx">PPTX</option>
                <option value="zip">ZIP</option>
              </select>
            </div>

            <div>
              <label className="admin-form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.85rem' }}>
                {isKhmer ? 'ទំហំឯកសារ' : 'File Size'}
              </label>
              <input
                type="text"
                className="admin-form-input"
                placeholder={isKhmer ? 'ឧ. 1.2 MB' : 'e.g. 1.2 MB'}
                value={formData.file_size}
                onChange={(e) => setFormData({ ...formData, file_size: e.target.value })}
              />
            </div>

            <div>
              <label className="admin-form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.85rem' }}>
                {isKhmer ? 'កន្លែងទទួលពាក្យ' : 'Submission Office'}
              </label>
              <input
                type="text"
                className="admin-form-input"
                placeholder={isKhmer ? 'ឧ. ការិយាល័យសិក្សា និងកិច្ចការនិស្សិត (អគារ A)' : 'e.g. Academic and Student Affairs Office (Building A)'}
                value={formData.submission_office}
                onChange={(e) => setFormData({ ...formData, submission_office: e.target.value })}
              />
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className="admin-form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.85rem' }}>
              {isKhmer ? 'ការពណ៌នាជាភាសាខ្មែរ' : 'Description in Khmer'}
            </label>
            <textarea
              className="admin-form-input"
              rows={3}
              placeholder={isKhmer ? 'ព័ត៌មានសង្ខេបអំពីទម្រង់ពាក្យសុំ និងគោលបំណង...' : 'Brief summary about the application form...'}
              value={formData.description_km}
              onChange={(e) => setFormData({ ...formData, description_km: e.target.value })}
            />
          </div>

          {/* Dynamic Required Documents (Khmer) */}
          <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontWeight: '700', fontSize: '0.85rem', color: '#0f172a' }}>
                {isKhmer ? 'ឯកសារភ្ជាប់ចាំបាច់ (ភាសាខ្មែរ)' : 'Required Supporting Documents (Khmer)'}
              </label>
              <button
                type="button"
                onClick={() => addReqDocField('km')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#e0f2fe',
                  color: '#0284c7',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                <Plus size={13} /> {isKhmer ? 'បន្ថែមឯកសារភ្ជាប់' : 'Add Requirement'}
              </button>
            </div>

            {formData.required_docs_km.map((doc, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', minWidth: '18px' }}>{idx + 1}.</span>
                <input
                  type="text"
                  className="admin-form-input"
                  style={{ flex: 1 }}
                  placeholder={isKhmer ? 'ឧ. រូបថត ៤x៦ ចំនួន ៣ សន្លឹក...' : 'e.g. 3 copies of 4x6 photos...'}
                  value={doc}
                  onChange={(e) => handleReqDocChange(idx, e.target.value, 'km')}
                />
                {formData.required_docs_km.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeReqDocField(idx, 'km')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Settings & Flags */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', paddingTop: '4px' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600' }}>
              <input
                type="checkbox"
                checked={formData.is_popular}
                onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                style={{ width: '16px', height: '16px' }}
              />
              <span>{isKhmer ? 'កំណត់ជាឯកសារពេញនិយម (បង្ហាញលើ Top Downloads)' : 'Mark as Popular Form (Show in Top Downloads)'}</span>
            </label>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600' }}>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                style={{ width: '16px', height: '16px' }}
              />
              <span>{isKhmer ? 'ស្ថានភាពសកម្ម (បង្ហាញជាសាធារណៈ)' : 'Published Active Status (Publicly Visible)'}</span>
            </label>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};
