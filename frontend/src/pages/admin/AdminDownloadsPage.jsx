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
  CheckCircle2,
  XCircle,
  Eye,
  Edit2,
  Trash2,
  Plus,
  X,
  RotateCw,
  Search,
  Building2,
  CheckSquare,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Layers,
  FileSpreadsheet,
  FileCode,
  Archive,
  HardDrive,
  ArrowRight
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'admissions', labelKm: 'ចុះឈ្មោះ & អាហារូបករណ៍', labelEn: 'Admissions & Scholarships', bg: '#fefce8', color: '#ca8a04', border: '#fef08a' },
  { value: 'calendars', labelKm: 'ប្រតិទិន & កាលវិភាគ', labelEn: 'Calendars & Timetables', bg: '#eff6ff', color: '#1e73be', border: '#dbeafe' },
  { value: 'handbooks', labelKm: 'បទបញ្ជា & សៀវភៅណែនាំ', labelEn: 'Handbooks & Regulations', bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
  { value: 'adminForms', labelKm: 'បែបបទរដ្ឋបាល & សេវាសិស្ស', labelEn: 'Admin & Student Forms', bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff' },
  { value: 'general', labelKm: 'ឯកសារទូទៅ', labelEn: 'General Documents', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' }
];

export const AdminDownloadsPage = () => {
  const { currentLanguage, language } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Preview Lightbox Modal
  const [previewDoc, setPreviewDoc] = useState(null);

  // Delete Confirmation Modal
  const [docToDelete, setDocToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      } else if (res.data?.data) {
        setDocuments(res.data.data);
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

  // Filtered Documents (Searching is handled by AdminDataTable)
  const filteredDocuments = useMemo(() => {
    return documents.filter((d) => {
      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'popular') return Boolean(d.is_popular);
      return d.category === selectedCategory;
    });
  }, [documents, selectedCategory]);

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

  const openPreview = (doc) => {
    setPreviewDoc(doc);
  };

  const openDeleteModal = (doc) => {
    setDocToDelete(doc);
    setDeleteModalOpen(true);
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
      alert(isKhmer ? 'ការផ្ទុកឯកសារបរាជ័យ។ (គាំទ្រ PDF, Word, Excel, ZIP)' : 'Failed to upload file. Allowed: PDF, Word, Excel, ZIP (Max 25MB).');
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
      alert(isKhmer ? 'សូមបញ្ចូលចំណងជើងជាភាសាខ្មែរ។' : 'Please enter Document Title in Khmer.');
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
      alert(isKhmer ? 'ការរក្សាទុកឯកសារបរាជ័យ។' : 'Failed to save document.');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/documents/${docToDelete.id}`);
      setDeleteModalOpen(false);
      setDocToDelete(null);
      fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
      alert(isKhmer ? 'ការលុបឯកសារបរាជ័យ។' : 'Failed to delete document.');
    } finally {
      setDeleting(false);
    }
  };

  // Toggle Popular
  const handleTogglePopular = async (doc) => {
    try {
      await api.post(`/admin/documents/${doc.id}/toggle-popular`);
      setDocuments((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, is_popular: !d.is_popular } : d))
      );
    } catch (err) {
      console.error('Toggle popular failed:', err);
    }
  };

  // Toggle Active
  const handleToggleActive = async (doc) => {
    try {
      await api.post(`/admin/documents/${doc.id}/toggle-active`);
      setDocuments((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, is_active: !d.is_active } : d))
      );
    } catch (err) {
      console.error('Toggle active failed:', err);
    }
  };

  // Helper for Format Metadata (Pastel badge, icon, extension, label)
  const getFormatMeta = (fileType = 'pdf') => {
    const ft = (fileType || '').toLowerCase().trim();
    if (ft === 'pdf') {
      return {
        label: isKhmer ? 'ឯកសារ PDF' : 'PDF Document',
        ext: 'PDF',
        bg: '#fef2f2',
        color: '#dc2626',
        border: '#fecaca',
        icon: FileText
      };
    }
    if (ft === 'xlsx' || ft === 'xls' || ft === 'csv') {
      return {
        label: isKhmer ? 'តារាង Excel' : 'Excel Sheet',
        ext: ft.toUpperCase() || 'XLSX',
        bg: '#f0fdf4',
        color: '#16a34a',
        border: '#bbf7d0',
        icon: FileSpreadsheet
      };
    }
    if (ft === 'docx' || ft === 'doc') {
      return {
        label: isKhmer ? 'ឯកសារ Word' : 'Word Document',
        ext: ft.toUpperCase() || 'DOCX',
        bg: '#eff6ff',
        color: '#0284c7',
        border: '#bfdbfe',
        icon: FileText
      };
    }
    if (ft === 'zip' || ft === 'rar' || ft === '7z' || ft === 'tar') {
      return {
        label: isKhmer ? 'កញ្ចប់ ZIP' : 'ZIP Archive',
        ext: ft.toUpperCase() || 'ZIP',
        bg: '#fefce8',
        color: '#d97706',
        border: '#fde68a',
        icon: Archive
      };
    }
    return {
      label: ft ? `${ft.toUpperCase()} ${isKhmer ? 'ឯកសារ' : 'File'}` : (isKhmer ? 'ឯកសារ' : 'Document'),
      ext: ft ? ft.toUpperCase() : 'DOC',
      bg: '#f8fafc',
      color: '#475569',
      border: '#e2e8f0',
      icon: FileText
    };
  };

  // Helper for Format Badge Class
  const getFormatBadgeClass = (fileType = 'pdf') => {
    const ft = (fileType || '').toLowerCase();
    if (ft === 'pdf') return 'admin-doc-format-pdf';
    if (ft === 'xlsx' || ft === 'xls') return 'admin-doc-format-xlsx';
    if (ft === 'docx' || ft === 'doc') return 'admin-doc-format-docx';
    if (ft === 'zip' || ft === 'rar') return 'admin-doc-format-zip';
    return 'admin-doc-format-docx';
  };

  // Helper for Category Metadata
  const getCategoryMeta = (catVal) => {
    return CATEGORY_OPTIONS.find((c) => c.value === catVal) || {
      value: catVal,
      labelKm: catVal,
      labelEn: catVal,
      bg: '#f1f5f9',
      color: '#475569',
      border: '#cbd5e1',
    };
  };

  // Columns for AdminDataTable
  const columns = [
    {
      header: isKhmer ? 'កូដ & ចំណងជើងឯកសារ' : 'Code & Document Title',
      render: (row) => (
        <div style={{ maxWidth: '380px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="admin-doc-code-badge">
              {row.code || 'FORM-DOC'}
            </span>
            {row.is_popular && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: '#fefce8',
                  color: '#b45309',
                  border: '1px solid #fde68a',
                }}
              >
                <Star size={11} fill="#b45309" color="#b45309" />
                {isKhmer ? 'ពេញនិយម' : 'Top Form'}
              </span>
            )}
          </div>
          <div
            style={{
              fontWeight: 800,
              color: '#07294D',
              fontSize: '0.94rem',
              lineHeight: 1.4,
              cursor: 'pointer',
            }}
            onClick={() => openPreview(row)}
          >
            {row.title_km}
          </div>
          {row.title_en && (
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
              {row.title_en}
            </div>
          )}
        </div>
      ),
    },
    {
      header: isKhmer ? 'ប្រភេទ' : 'Category',
      render: (row) => {
        const cat = getCategoryMeta(row.category);
        return (
          <span
            style={{
              display: 'inline-block',
              padding: '3px 10px',
              borderRadius: '9999px',
              fontSize: '0.76rem',
              fontWeight: 700,
              background: cat.bg,
              color: cat.color,
              border: `1px solid ${cat.border}`,
              whiteSpace: 'nowrap',
            }}
          >
            {isKhmer ? cat.labelKm : cat.labelEn}
          </span>
        );
      },
    },
    {
      header: isKhmer ? 'ឯកសារ & ទម្រង់' : 'File & Format',
      render: (row) => {
        const meta = getFormatMeta(row.file_type);
        const FormatIcon = meta.icon;
        return (
          <div className="admin-doc-format-cell">
            <div
              className="admin-doc-icon-badge"
              style={{
                backgroundColor: meta.bg,
                color: meta.color,
                borderColor: meta.border,
              }}
            >
              <FormatIcon size={18} />
            </div>
            <div className="admin-doc-meta-col">
              <div className="admin-doc-type-pill-wrap">
                <span
                  className="admin-doc-ext-pill"
                  style={{
                    backgroundColor: meta.bg,
                    color: meta.color,
                    borderColor: meta.border,
                  }}
                >
                  {meta.ext}
                </span>
                <span className="admin-doc-format-label">{meta.label}</span>
              </div>
              <div className="admin-doc-size-badge">
                <HardDrive size={11} className="admin-doc-size-icon" />
                <span>{row.file_size || (isKhmer ? 'ទំហំមិនស្គាល់' : 'Unknown')}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: isKhmer ? 'ការទាញយក' : 'Downloads',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#07294D' }}>
          <Download size={14} style={{ color: '#1e73be' }} />
          <span>{(Number(row.downloads_count) || 0).toLocaleString()}</span>
        </div>
      ),
    },
    {
      header: isKhmer ? 'ស្ថានភាព' : 'Status',
      render: (row) => (
        <button
          type="button"
          onClick={() => handleToggleActive(row)}
          style={{
            border: 'none',
            background: row.is_active ? '#f0fdf4' : '#fef2f2',
            color: row.is_active ? '#166534' : '#dc2626',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '0.76rem',
            fontWeight: 700,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: row.is_active ? '#bbf7d0' : '#fecaca',
            transition: 'all 0.2s ease',
          }}
          title={isKhmer ? 'ចុចដើម្បីផ្លាស់ប្តូរស្ថានភាព' : 'Toggle active status'}
        >
          {row.is_active ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
          <span>{row.is_active ? (isKhmer ? 'សកម្ម' : 'Active') : (isKhmer ? 'អសកម្ម' : 'Inactive')}</span>
        </button>
      ),
    },
    {
      header: isKhmer ? 'ប្រតិបត្តិការ' : 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
          {/* Toggle Popular */}
          <button
            type="button"
            onClick={() => handleTogglePopular(row)}
            className="admin-btn admin-btn-outline admin-btn-sm"
            style={{
              padding: '6px 9px',
              borderRadius: '8px',
              color: row.is_popular ? '#d97706' : '#94a3b8',
              backgroundColor: row.is_popular ? '#fefce8' : '#ffffff',
              borderColor: row.is_popular ? '#fef08a' : '#e2e8f0',
            }}
            title={row.is_popular ? (isKhmer ? 'ដកការពេញនិយម' : 'Unmark Popular') : (isKhmer ? 'កំណត់ជាពេញនិយម' : 'Mark as Popular')}
          >
            <Star size={14} fill={row.is_popular ? '#d97706' : 'none'} />
          </button>

          {/* Quick Preview */}
          <button
            type="button"
            onClick={() => openPreview(row)}
            className="admin-btn admin-btn-outline admin-btn-sm"
            style={{ padding: '6px 9px', borderRadius: '8px', color: '#1e73be', borderColor: '#dbeafe', background: '#eff6ff' }}
            title={isKhmer ? 'មើលព័ត៌មានលម្អិត' : 'Preview Document'}
          >
            <Eye size={14} />
          </button>

          {/* Edit */}
          <button
            type="button"
            onClick={() => openEditModal(row)}
            className="admin-btn admin-btn-outline admin-btn-sm"
            style={{ padding: '6px 9px', borderRadius: '8px' }}
            title={isKhmer ? 'កែសម្រួលឯកសារ' : 'Edit Document'}
          >
            <Edit2 size={14} />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => openDeleteModal(row)}
            className="admin-btn admin-btn-danger admin-btn-sm"
            style={{ padding: '6px 9px', borderRadius: '8px' }}
            title={isKhmer ? 'លុបឯកសារ' : 'Delete Document'}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  // Mobile Card Renderer (< 768px viewports)
  const renderMobileCard = (row) => {
    const cat = CATEGORY_OPTIONS.find((c) => c.value === row.category) || CATEGORY_OPTIONS[4];
    const meta = getFormatMeta(row.file_type);
    const FormatIcon = meta.icon;

    return (
      <div className="admin-user-mobile-card">
        {/* Top Header: Category Badge, Format Pill, and Status */}
        <div className="admin-user-mobile-card-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '3px 9px',
                borderRadius: '9999px',
                fontSize: '0.74rem',
                fontWeight: 700,
                background: cat.bg,
                color: cat.color,
                border: `1px solid ${cat.border}`,
              }}
            >
              {isKhmer ? cat.labelKm : cat.labelEn}
            </span>

            <span
              className="admin-doc-ext-pill"
              style={{
                backgroundColor: meta.bg,
                color: meta.color,
                borderColor: meta.border,
                fontSize: '0.70rem',
                padding: '2px 6px',
              }}
            >
              {meta.ext}
            </span>

            {row.is_popular && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  padding: '2px 7px',
                  borderRadius: '6px',
                  fontSize: '0.70rem',
                  fontWeight: 700,
                  background: '#fefce8',
                  color: '#ca8a04',
                  border: '1px solid #fef08a',
                }}
              >
                <Star size={11} fill="#ca8a04" />
                <span>{isKhmer ? 'ពេញនិយម' : 'Popular'}</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleToggleActive(row)}
            style={{
              border: 'none',
              background: row.is_active ? '#f0fdf4' : '#fef2f2',
              color: row.is_active ? '#166534' : '#dc2626',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '20px',
              fontSize: '0.72rem',
              fontWeight: 700,
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: row.is_active ? '#bbf7d0' : '#fecaca',
            }}
          >
            {row.is_active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
            <span>{row.is_active ? (isKhmer ? 'សកម្ម' : 'Active') : (isKhmer ? 'អសកម្ម' : 'Inactive')}</span>
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '12px 14px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div
              className="admin-doc-icon-badge"
              style={{
                backgroundColor: meta.bg,
                color: meta.color,
                borderColor: meta.border,
                width: '38px',
                height: '38px',
                flexShrink: 0,
              }}
            >
              <FormatIcon size={20} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '0.94rem',
                  color: '#07294D',
                  lineHeight: 1.35,
                  marginBottom: '4px',
                  cursor: 'pointer',
                }}
                onClick={() => openPreview(row)}
              >
                {row.title_km || row.title_en}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                {row.code && (
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#07294D',
                      background: '#f1f5f9',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                    }}
                  >
                    #{row.code}
                  </span>
                )}
                <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <HardDrive size={11} />
                  <span>{row.file_size || (isKhmer ? 'ទំហំមិនស្គាល់' : 'Unknown')}</span>
                </span>
                <span style={{ fontSize: '0.74rem', color: '#1e73be', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <Download size={11} />
                  <span>{(Number(row.downloads_count) || 0).toLocaleString()} {isKhmer ? 'ដង' : 'downloads'}</span>
                </span>
              </div>

              {(row.description_km || row.description_en) && (
                <p
                  style={{
                    fontSize: '0.80rem',
                    color: '#64748b',
                    lineHeight: 1.45,
                    margin: 0,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {row.description_km || row.description_en}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tactile Touch Action Buttons */}
        <div className="admin-user-mobile-card-actions">
          <button
            type="button"
            onClick={() => openPreview(row)}
            className="admin-user-mobile-action-btn view"
            title={isKhmer ? 'មើលព័ត៌មានលម្អិត' : 'Preview Document'}
          >
            <Eye size={13} />
            <span>{isKhmer ? 'មើល' : 'Preview'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleTogglePopular(row)}
            className="admin-user-mobile-action-btn"
            style={{
              background: row.is_popular ? '#fefce8' : '#ffffff',
              color: row.is_popular ? '#ca8a04' : '#64748b',
              borderColor: row.is_popular ? '#fef08a' : '#e2e8f0',
            }}
            title={row.is_popular ? (isKhmer ? 'ដកការពេញនិយម' : 'Unmark Popular') : (isKhmer ? 'កំណត់ជាពេញនិយម' : 'Mark as Popular')}
          >
            <Star size={13} fill={row.is_popular ? '#ca8a04' : 'none'} />
            <span>{row.is_popular ? (isKhmer ? 'ពេញនិយម' : 'Starred') : (isKhmer ? 'ផ្កាយ' : 'Star')}</span>
          </button>
          <button
            type="button"
            onClick={() => openEditModal(row)}
            className="admin-user-mobile-action-btn edit"
            title={isKhmer ? 'កែសម្រួល' : 'Edit Document'}
          >
            <Edit2 size={13} />
            <span>{isKhmer ? 'កែប្រែ' : 'Edit'}</span>
          </button>
          <button
            type="button"
            onClick={() => openDeleteModal(row)}
            className="admin-user-mobile-action-btn delete"
            title={isKhmer ? 'លុបឯកសារ' : 'Delete Document'}
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
        className="admin-page-header admin-downloads-header"
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
              fontWeight: 700,
              marginBottom: '8px',
              border: '1px solid #dbeafe',
            }}
          >
            <FileDown size={14} />
            {isKhmer ? 'ការគ្រប់គ្រងឯកសារទាញយក & ទម្រង់បែបបទ' : 'Institutional Downloads & Official Forms'}
          </div>
          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: '#07294D',
              margin: '0 0 6px 0',
              lineHeight: 1.2,
            }}
          >
            {isKhmer ? 'មជ្ឈមណ្ឌលឯកសារ & ទម្រង់បែបបទ' : 'Documents & Download Center'}
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
            {isKhmer
              ? 'គ្រប់គ្រងទម្រង់បែបបទចុះឈ្មោះ អាហារូបករណ៍ សៀវភៅណែនាំនិស្សិត និងកាលវិភាគសិក្សាផ្លូវការ'
              : 'Manage official forms, applications, student handbooks, and academic schedules available for public download'}
          </p>
        </div>

        <div className="admin-downloads-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchData}
            disabled={loading}
            className="admin-btn admin-btn-outline"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '12px',
              padding: '9px 16px',
              fontWeight: 600,
            }}
          >
            <RotateCw size={15} className={loading ? 'fa-spin' : ''} />
            {isKhmer ? 'ធ្វើបច្ចុប្បន្នភាព' : 'Refresh'}
          </button>
          <button
            onClick={openAddModal}
            className="admin-btn admin-btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '12px',
              padding: '9px 18px',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(7, 41, 77, 0.15)',
            }}
          >
            <Plus size={16} />
            {isKhmer ? 'បន្ថែមឯកសារថ្មី' : 'Add Document'}
          </button>
        </div>
      </div>

      {/* 2. 4-Card Institutional KPI Metric Strip */}
      <div className="admin-kpi-grid admin-downloads-kpis">
        {/* KPI 1: Total Documents */}
        <div
          className="admin-kpi-card"
          onClick={() => setSelectedCategory('all')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">{isKhmer ? 'ឯកសារ & ទម្រង់សរុប' : 'Total Documents'}</span>
              <div className="admin-kpi-value">{metrics.total}</div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#1e73be' }} />
                <span>{isKhmer ? 'ឯកសាររដ្ឋបាល & សេវាសិស្ស' : 'Forms across all categories'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#eff6ff', color: '#1e73be' }}>
                {isKhmer ? 'ឯកសារ' : 'Files'}
              </span>
              <div className="admin-kpi-icon-badge" style={{ background: '#eff6ff', color: '#1e73be', border: '1px solid #dbeafe' }}>
                <FileText size={24} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'គ្រប់គ្រងឯកសារទាញយក' : 'Manage documents'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* KPI 2: Total Downloads */}
        <div
          className="admin-kpi-card"
          onClick={() => setSelectedCategory('all')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">{isKhmer ? 'ការទាញយកសរុប' : 'Total Downloads'}</span>
              <div className="admin-kpi-value">{metrics.downloads.toLocaleString()}</div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#059669' }} />
                <span>{isKhmer ? 'ស្ថិតិទាញយកពីសាធារណៈ' : 'Public downloads counter'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#f0fdf4', color: '#059669' }}>
                {isKhmer ? 'ទាញយក' : 'Downloads'}
              </span>
              <div className="admin-kpi-icon-badge" style={{ background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' }}>
                <Download size={24} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'ស្ថិតិនៃការប្រើប្រាស់' : 'Usage analytics'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* KPI 3: Popular Forms */}
        <div
          className="admin-kpi-card"
          onClick={() => setSelectedCategory('popular')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">{isKhmer ? 'ឯកសារពេញនិយម' : 'Top Starred Forms'}</span>
              <div className="admin-kpi-value">{metrics.popular}</div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#ca8a04' }} />
                <span>{isKhmer ? 'ឯកសារមានការទាញយកខ្ពស់' : 'High engagement files'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#fefce8', color: '#ca8a04' }}>
                {isKhmer ? 'ពេញនិយម' : 'Popular'}
              </span>
              <div className="admin-kpi-icon-badge" style={{ background: '#fefce8', color: '#ca8a04', border: '1px solid #fef08a' }}>
                <Star size={24} fill="#ca8a04" />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'ឯកសារមានចំណាប់អារម្មណ៍' : 'High demand forms'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* KPI 4: Active Published */}
        <div
          className="admin-kpi-card"
          onClick={() => setSelectedCategory('all')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">{isKhmer ? 'ស្ថានភាពសកម្ម' : 'Active Published'}</span>
              <div className="admin-kpi-value">
                {metrics.active} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>/ {metrics.total}</span>
              </div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#7c3aed' }} />
                <span>{metrics.total > 0 ? Math.round((metrics.active / metrics.total) * 100) : 100}% {isKhmer ? 'នៃឯកសារសរុប' : 'active availability'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#faf5ff', color: '#7c3aed' }}>
                {isKhmer ? 'ផ្សព្វផ្សាយ' : 'Published'}
              </span>
              <div className="admin-kpi-icon-badge" style={{ background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}>
                <CheckCircle2 size={24} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'ពិនិត្យមើលឯកសារសកម្ម' : 'Check active status'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>
      </div>

      {/* 3. Category Filter Bar (Sleek Horizontal Scroll Pills) */}
      <div className="admin-user-filter-bar">
        <button
          type="button"
          className={`admin-user-filter-pill ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          <span>{isKhmer ? 'ឯកសារទាំងអស់' : 'All Documents'}</span>
          <span className="admin-user-filter-count">{documents.length}</span>
        </button>

        <button
          type="button"
          className={`admin-user-filter-pill ${selectedCategory === 'popular' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('popular')}
        >
          <Star size={12} fill={selectedCategory === 'popular' ? '#ffffff' : 'none'} />
          <span>{isKhmer ? 'ពេញនិយម' : 'Popular'}</span>
          <span className="admin-user-filter-count">{metrics.popular}</span>
        </button>

        {CATEGORY_OPTIONS.map((cat) => {
          const count = documents.filter((d) => d.category === cat.value).length;
          const isSelected = selectedCategory === cat.value;
          return (
            <button
              type="button"
              key={cat.value}
              className={`admin-user-filter-pill ${isSelected ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.value)}
            >
              <span>{isKhmer ? cat.labelKm : cat.labelEn}</span>
              <span className="admin-user-filter-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Rich Institutional DataTable & Mobile Cards */}
      <AdminDataTable
        columns={columns}
        data={filteredDocuments}
        loading={loading}
        title={isKhmer ? 'បញ្ជីឯកសារ និងទម្រង់បែបបទផ្លូវការ' : 'Official Documents Directory'}
        subtitle={
          isKhmer
            ? `បង្ហាញ ${filteredDocuments.length} ក្នុងចំណោមឯកសារសរុប ${documents.length}`
            : `Showing ${filteredDocuments.length} of ${documents.length} forms`
        }
        onAdd={openAddModal}
        addLabel={isKhmer ? 'បន្ថែមឯកសារថ្មី' : 'Add Document'}
        onRefresh={fetchData}
        searchPlaceholder={isKhmer ? 'ស្វែងរកតាមចំណងជើង ឬកូដ...' : 'Search by title or code...'}
        renderMobileCard={renderMobileCard}
      />

      {/* 5. Interactive Document Preview Lightbox Modal */}
      {previewDoc && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1060,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(7, 41, 77, 0.75)',
            backdropFilter: 'blur(8px)',
            padding: '24px',
          }}
          onClick={() => setPreviewDoc(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '720px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '24px 28px',
                background: 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)',
                color: '#ffffff',
                borderRadius: '24px 24px 0 0',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  {previewDoc.code || 'FORM-DOC'}
                </span>

                {previewDoc.is_popular && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 9px',
                      borderRadius: '9999px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      backgroundColor: '#fefce8',
                      color: '#b45309',
                    }}
                  >
                    <Star size={11} fill="#b45309" />
                    {isKhmer ? 'ឯកសារពេញនិយម' : 'Top Form'}
                  </span>
                )}

                {(() => {
                  const cat = getCategoryMeta(previewDoc.category);
                  return (
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        background: 'rgba(255, 255, 255, 0.15)',
                        color: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                      }}
                    >
                      {isKhmer ? cat.labelKm : cat.labelEn}
                    </span>
                  );
                })()}
              </div>

              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.4 }}>
                {previewDoc.title_km}
              </h3>
              {previewDoc.title_en && (
                <div style={{ fontSize: '0.84rem', opacity: 0.85 }}>
                  {previewDoc.title_en}
                </div>
              )}

              <button
                onClick={() => setPreviewDoc(null)}
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  background: 'rgba(0, 0, 0, 0.25)',
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
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 28px' }}>
              {/* Description */}
              {previewDoc.description_km && (
                <div
                  style={{
                    background: '#f8fafc',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.9rem',
                    color: '#334155',
                    lineHeight: 1.6,
                    marginBottom: '18px',
                  }}
                >
                  {previewDoc.description_km}
                </div>
              )}

              {/* Submission Office */}
              {previewDoc.submission_office && (
                <div
                  style={{
                    background: '#eff6ff',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: '1px solid #bfdbfe',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <Building2 size={20} color="#1e73be" />
                  <div>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#1e73be', textTransform: 'uppercase' }}>
                      {isKhmer ? 'ទីតាំងទទួលពាក្យផ្លូវការ' : 'Official Submission Office'}
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#07294D', marginTop: '2px' }}>
                      {previewDoc.submission_office}
                    </div>
                  </div>
                </div>
              )}

              {/* Required Documents Checklist */}
              {Array.isArray(previewDoc.required_docs_km) && previewDoc.required_docs_km.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', fontWeight: 800, color: '#07294D' }}>
                    {isKhmer ? 'ឯកសារភ្ជាប់ចាំបាច់សម្រាប់ដាក់ពាក្យ ៖' : 'Required Supporting Documents:'}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {previewDoc.required_docs_km.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          background: '#f8fafc',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          fontSize: '0.84rem',
                          color: '#334155',
                        }}
                      >
                        <CheckSquare size={16} color="#059669" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File Info & Download Box */}
              <div
                style={{
                  padding: '16px 20px',
                  background: '#f8fafc',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                  flexWrap: 'wrap',
                }}
              >
                {(() => {
                  const meta = getFormatMeta(previewDoc.file_type);
                  const FormatIcon = meta.icon;
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                      <div
                        className="admin-doc-icon-badge"
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '13px',
                          backgroundColor: meta.bg,
                          color: meta.color,
                          borderColor: meta.border,
                        }}
                      >
                        <FormatIcon size={24} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span
                            className="admin-doc-ext-pill"
                            style={{
                              backgroundColor: meta.bg,
                              color: meta.color,
                              borderColor: meta.border,
                            }}
                          >
                            {meta.ext}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#07294D' }}>
                            {previewDoc.file_path ? previewDoc.file_path.split('/').pop() : (isKhmer ? 'ឯកសារគំរូទម្រង់' : 'Template Form')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.76rem', color: '#64748b' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <HardDrive size={12} style={{ color: '#94a3b8' }} />
                            {previewDoc.file_size || 'N/A'}
                          </span>
                          <span>•</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Download size={12} style={{ color: '#1e73be' }} />
                            {(Number(previewDoc.downloads_count) || 0).toLocaleString()} {isKhmer ? 'ដងទាញយក' : 'downloads'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {previewDoc.file_path && (
                  <a
                    href={previewDoc.file_path}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-btn admin-btn-primary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      padding: '8px 16px',
                      fontWeight: 600,
                    }}
                  >
                    <Download size={15} />
                    {isKhmer ? 'ទាញយកឯកសារ' : 'Download File'}
                  </a>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '14px 28px',
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
                onClick={() => setPreviewDoc(null)}
                className="admin-btn admin-btn-outline"
                style={{ borderRadius: '10px', padding: '8px 18px', fontWeight: 600 }}
              >
                {isKhmer ? 'បិទផ្ទាំង' : 'Close'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = previewDoc;
                  setPreviewDoc(null);
                  openEditModal(d);
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
                {isKhmer ? 'កែសម្រួល' : 'Edit Document'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Create / Edit Document Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDoc ? (isKhmer ? 'កែសម្រួលឯកសារផ្លូវការ' : 'Edit Official Document') : (isKhmer ? 'បន្ថែមឯកសារផ្លូវការថ្មី' : 'Add New Official Document')}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        maxWidth="750px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Section 1: File Upload */}
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
                marginBottom: '12px',
              }}
            >
              <UploadCloud size={15} color="#1e73be" />
              {isKhmer ? 'ផ្នែកទី ១៖ ឯកសារសម្រាប់ទាញយក (PDF, Word, Excel, ZIP)' : 'Section 1: Upload Document File'}
            </div>

            <div
              style={{
                padding: '18px',
                borderRadius: '12px',
                border: '2px dashed #bfdbfe',
                backgroundColor: '#f8fafc',
                textAlign: 'center',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <UploadCloud size={30} style={{ color: '#1e73be' }} />
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#07294D' }}>
                  {isKhmer ? 'ផ្ទុកឡើងឯកសារទម្រង់ / លិខិតផ្លូវការ' : 'Upload Official Document Form'}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                  {isKhmer ? 'គាំទ្រ PDF, Word, Excel, ZIP ទំហំរហូតដល់ 25MB' : 'Supports PDF, Word, Excel, ZIP up to 25MB'}
                </div>

                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#1e73be',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '6px',
                  }}
                >
                  <UploadCloud size={14} />
                  <span>
                    {uploadingFile
                      ? (isKhmer ? 'កំពុងផ្ទុកឡើង...' : 'Uploading...')
                      : (isKhmer ? 'ជ្រើសរើសឯកសារ' : 'Choose File')}
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
                      padding: '6px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#dcfce7',
                      color: '#15803d',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      marginTop: '8px',
                    }}
                  >
                    <CheckCircle2 size={14} />
                    <span>
                      {formData.file_path} ({formData.file_size || (isKhmer ? 'រួចរាល់' : 'Ready')})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Codes, Category & Titles */}
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
                marginBottom: '12px',
              }}
            >
              <Layers size={15} color="#ca8a04" />
              {isKhmer ? 'ផ្នែកទី ២៖ កូដ ប្រភេទ & ចំណងជើង' : 'Section 2: Code, Category & Titles'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">
                  {isKhmer ? 'លេខកូដទម្រង់ (Document Code)' : 'Document Code'}
                </label>
                <input
                  type="text"
                  className="admin-form-control"
                  placeholder="e.g. FORM-RPITSSR-01"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">
                  {isKhmer ? 'ប្រភេទឯកសារ *' : 'Category *'}
                </label>
                <select
                  className="admin-form-control"
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

            <div className="admin-form-group" style={{ marginBottom: '12px' }}>
              <label className="admin-form-label">
                {isKhmer ? 'ចំណងជើងជាភាសាខ្មែរ *' : 'Title in Khmer *'}
              </label>
              <input
                type="text"
                className="admin-form-control"
                placeholder={isKhmer ? 'ឧ. ពាក្យសុំចុះឈ្មោះវគ្គបណ្តុះបណ្តាលជំនាញវិជ្ជាជីវៈ ១.៥ លាននាក់' : 'e.g. Title in Khmer'}
                value={formData.title_km}
                onChange={(e) => setFormData({ ...formData, title_km: e.target.value })}
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'ចំណងជើងជាភាសាអង់គ្លេស' : 'Title in English'}
              </label>
              <input
                type="text"
                className="admin-form-control"
                placeholder="e.g. TVET 1.5M Vocational Training Scholarship Application Form"
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              />
            </div>
          </div>

          {/* Section 3: Format, Size & Submission Office */}
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
                marginBottom: '12px',
              }}
            >
              <Building2 size={15} color="#059669" />
              {isKhmer ? 'ផ្នែកទី ៣៖ ទម្រង់ ទំហំ & ទីតាំងទទួលពាក្យ' : 'Section 3: Format, Size & Submission Office'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '12px' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">
                  {isKhmer ? 'ទម្រង់ឯកសារ' : 'Format'}
                </label>
                <select
                  className="admin-form-control"
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

              <div className="admin-form-group">
                <label className="admin-form-label">
                  {isKhmer ? 'ទំហំឯកសារ' : 'File Size'}
                </label>
                <input
                  type="text"
                  className="admin-form-control"
                  placeholder="e.g. 1.2 MB"
                  value={formData.file_size}
                  onChange={(e) => setFormData({ ...formData, file_size: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">
                  {isKhmer ? 'កន្លែងទទួលពាក្យ' : 'Submission Office'}
                </label>
                <input
                  type="text"
                  className="admin-form-control"
                  placeholder={isKhmer ? 'ឧ. ការិយាល័យសិក្សា និងកិច្ចការនិស្សិត (អគារ A)' : 'e.g. Academic and Student Affairs Office'}
                  value={formData.submission_office}
                  onChange={(e) => setFormData({ ...formData, submission_office: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Description */}
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
                marginBottom: '12px',
              }}
            >
              <FileText size={15} color="#7c3aed" />
              {isKhmer ? 'ផ្នែកទី ៤៖ ការពិពណ៌នាខ្លឹមសារ' : 'Section 4: Description'}
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'ការពិពណ៌នាជាភាសាខ្មែរ' : 'Description in Khmer'}
              </label>
              <textarea
                className="admin-form-control"
                rows={3}
                placeholder={isKhmer ? 'ព័ត៌មានសង្ខេបអំពីទម្រង់ពាក្យសុំ និងគោលបំណង...' : 'Brief summary about the application form...'}
                value={formData.description_km}
                onChange={(e) => setFormData({ ...formData, description_km: e.target.value })}
              />
            </div>
          </div>

          {/* Section 5: Dynamic Required Documents */}
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontWeight: 800, fontSize: '0.85rem', color: '#07294D' }}>
                {isKhmer ? 'ឯកសារភ្ជាប់ចាំបាច់សម្រាប់ដាក់ពាក្យ' : 'Required Supporting Documents'}
              </label>
              <button
                type="button"
                onClick={() => addReqDocField('km')}
                className="admin-btn admin-btn-outline admin-btn-sm"
                style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.76rem', color: '#1e73be', borderColor: '#bfdbfe' }}
              >
                <Plus size={13} /> {isKhmer ? 'បន្ថែមឯកសារភ្ជាប់' : 'Add Requirement'}
              </button>
            </div>

            {formData.required_docs_km.map((doc, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', minWidth: '18px' }}>{idx + 1}.</span>
                <input
                  type="text"
                  className="admin-form-control"
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

          {/* Section 6: Settings */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', margin: 0 }}>
              <input
                type="checkbox"
                checked={formData.is_popular}
                onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                style={{ width: '16px', height: '16px', accentColor: '#d97706' }}
              />
              <div>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#07294D' }}>
                  ⭐ {isKhmer ? 'កំណត់ជាឯកសារពេញនិយម (Top Downloads)' : 'Mark as Popular Form'}
                </span>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  {isKhmer ? 'បង្ហាញក្នុងបញ្ជីឯកសារទាញយកច្រើនបំផុត' : 'Shows in Top Downloads highlight'}
                </div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', margin: 0 }}>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                style={{ width: '16px', height: '16px', accentColor: '#1e73be' }}
              />
              <div>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#07294D' }}>
                  👁️ {isKhmer ? 'បង្ហាញជាសាធារណៈ (Active)' : 'Publicly Visible (Active)'}
                </span>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  {isKhmer ? 'អនុញ្ញាតឱ្យទាញយកលើគេហទំព័រ' : 'Enables public downloading on website'}
                </div>
              </div>
            </label>
          </div>
        </div>
      </AdminModal>

      {/* 7. Delete Confirmation Modal */}
      {deleteModalOpen && docToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1060,
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
                    {isKhmer ? 'បញ្ជាក់ការលុបឯកសារ' : 'Delete Document Confirmation'}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {isKhmer ? 'សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានទេ' : 'This action cannot be undone'}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '12px 16px',
                  marginBottom: '14px',
                }}
              >
                <span className="admin-doc-code-badge" style={{ marginBottom: '6px', display: 'inline-block' }}>
                  {docToDelete.code || 'FORM-DOC'}
                </span>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#07294D' }}>
                  {docToDelete.title_km}
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                {isKhmer
                  ? 'តើអ្នកពិតជាចង់លុបឯកសារផ្លូវការនេះចេញពីប្រព័ន្ធមែនទេ?'
                  : 'Are you sure you want to permanently delete this official document?'}
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
