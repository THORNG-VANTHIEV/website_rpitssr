import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/client';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import { useLanguage } from '../../context/LanguageContext';
import {
  Award,
  BookOpen,
  Plus,
  RotateCw,
  Search,
  X,
  Edit2,
  Trash2,
  Eye,
  FileText,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Calendar,
  Layers,
  Printer,
  Sparkles,
  Check,
  User,
  ExternalLink,
  ShieldCheck,
  Clock,
  ArrowRight
} from 'lucide-react';

export const AdminExamResultsPage = () => {
  const { currentLanguage, language } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Transcript Lightbox Modal
  const [selectedTranscript, setSelectedTranscript] = useState(null);

  // Delete Confirmation Modal
  const [resultToDelete, setResultToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Filter State
  const [selectedMajor, setSelectedMajor] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');

  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    className: '',
    courseName: '',
    year: 'Year 1',
    semester: 'Semester 1',
    generation: 'Generation 13',
    examName: 'Midterm Examination Semester I',
    subject: '',
    totalMarks: 100,
    obtainedMarks: 85,
    percentage: 85,
    grade: 'B',
    examDate: new Date().toISOString().split('T')[0],
    isPublished: true,
    resultImageUrl: '',
    resultPdfUrl: '',
    documentType: 'image',
    remarks: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRes, courseRes] = await Promise.all([
        api.get('/admin/exam-results?limit=100'),
        api.get('/courses'),
      ]);

      const rawRes = resRes.data;
      const list = Array.isArray(rawRes) ? rawRes : (rawRes?.results || rawRes?.data || []);
      setResults(list);

      const rawCourses = courseRes.data;
      const courseList = Array.isArray(rawCourses) ? rawCourses : (rawCourses?.courses || rawCourses?.data || []);
      setCourses(courseList);
    } catch (err) {
      console.error('Error fetching exam results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateGrade = (obtained, total) => {
    if (!total || total <= 0) return 'F';
    const pct = (obtained / total) * 100;
    if (pct >= 85) return 'A';
    if (pct >= 80) return 'B+';
    if (pct >= 70) return 'B';
    if (pct >= 65) return 'C+';
    if (pct >= 50) return 'C';
    if (pct >= 45) return 'D';
    if (pct >= 40) return 'E';
    return 'F';
  };

  const handleMarksChange = (obtained, total) => {
    const ob = Number(obtained) || 0;
    const tot = Number(total) || 100;
    const pct = tot > 0 ? Math.round((ob / tot) * 100 * 10) / 10 : 0;
    const grd = calculateGrade(ob, tot);
    setFormData((prev) => ({
      ...prev,
      obtainedMarks: obtained,
      totalMarks: total,
      percentage: pct,
      grade: grd,
    }));
  };

  // KPI Calculations
  const totalResults = results.length;
  const publishedResults = results.filter((r) => r.isPublished).length;
  const honorsResults = results.filter((r) => ['A', 'B+'].includes((r.grade || '').toUpperCase())).length;
  const averagePercentage = totalResults > 0
    ? Math.round(results.reduce((sum, r) => sum + (Number(r.percentage) || 0), 0) / totalResults * 10) / 10
    : 0;

  // Extract unique major names for filter tabs
  const availableMajors = useMemo(() => {
    const set = new Set();
    results.forEach((r) => {
      if (r.courseName) set.add(r.courseName);
    });
    return Array.from(set);
  }, [results]);

  // Filtered Results
  const filteredResults = useMemo(() => {
    return results.filter((row) => {
      const matchMajor = selectedMajor === 'all' || row.courseName === selectedMajor;
      const matchGrade = selectedGrade === 'all' || (row.grade || '').toUpperCase() === selectedGrade;
      return matchMajor && matchGrade;
    });
  }, [results, selectedMajor, selectedGrade]);

  const openAddModal = () => {
    setEditingResult(null);
    const defaultCourse = courses[0]?.title || 'Information Technology';
    setFormData({
      studentId: '',
      studentName: '',
      className: '',
      courseName: defaultCourse,
      year: 'Year 1',
      semester: 'Semester 1',
      generation: 'Generation 13',
      examName: isKhmer ? 'ការប្រឡងបញ្ចប់ឆមាសទី១' : 'Final Examination Semester I',
      subject: '',
      totalMarks: 100,
      obtainedMarks: 85,
      percentage: 85,
      grade: 'B',
      examDate: new Date().toISOString().split('T')[0],
      isPublished: true,
      resultImageUrl: '',
      resultPdfUrl: '',
      documentType: 'image',
      remarks: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (r) => {
    setEditingResult(r);
    setFormData({
      studentId: r.studentId || '',
      studentName: r.studentName || '',
      className: r.className || '',
      courseName: r.courseName || '',
      year: r.year || 'Year 1',
      semester: r.semester || 'Semester 1',
      generation: r.generation || 'Generation 12',
      examName: r.examName || '',
      subject: r.subject || '',
      totalMarks: r.totalMarks ?? 100,
      obtainedMarks: r.obtainedMarks ?? 0,
      percentage: r.percentage ?? 0,
      grade: r.grade || 'A',
      examDate: r.examDate ? r.examDate.split('T')[0] : '',
      isPublished: Boolean(r.isPublished),
      resultImageUrl: r.resultImageUrl || '',
      resultPdfUrl: r.resultPdfUrl || '',
      documentType: r.documentType || 'image',
      remarks: r.remarks || '',
    });
    setModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);
    data.append('subDir', 'exam-results');
    setUploading(true);
    try {
      const res = await api.post('/admin/exam-results/upload-result', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const path = res.data.url || res.data.imageUrl || res.data.filePath;
      if (path) {
        const isPdf = file.name.toLowerCase().endsWith('.pdf');
        setFormData((prev) => ({
          ...prev,
          resultPdfUrl: isPdf ? path : prev.resultPdfUrl,
          resultImageUrl: !isPdf ? path : prev.resultImageUrl,
          documentType: isPdf ? 'pdf' : 'image',
        }));
      }
    } catch (err) {
      console.error('File upload failed:', err);
      alert(isKhmer ? 'ការបញ្ចូលឯកសារបរាជ័យ។' : 'File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.courseName) {
      alert(isKhmer ? 'សូមជ្រើសរើសជំនាញ ឬមុខវិជ្ជា។' : 'Please select or specify a Course / Major.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        courseName: formData.courseName,
        semester: formData.semester,
        generation: formData.generation,
        year: formData.year,
        examName: formData.examName,
        studentId: formData.studentId,
        studentName: formData.studentName,
        className: formData.className,
        subject: formData.subject,
        totalMarks: Number(formData.totalMarks) || 100,
        obtainedMarks: Number(formData.obtainedMarks) || 0,
        percentage: Number(formData.percentage) || 0,
        grade: formData.grade || 'A',
        examDate: formData.examDate,
        isPublished: Boolean(formData.isPublished),
        resultImageUrl: formData.resultImageUrl || null,
        resultPdfUrl: formData.resultPdfUrl || null,
        documentType: formData.documentType || 'image',
        remarks: formData.remarks || null,
      };

      if (editingResult) {
        await api.put(`/admin/exam-results/${editingResult.id}`, payload);
      } else {
        await api.post('/admin/exam-results', payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save exam result:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || (isKhmer ? 'មិនអាចរក្សាទុកលទ្ធផលប្រឡងបានទេ។' : 'Failed to save exam result.');
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (r) => {
    setResultToDelete(r);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!resultToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/exam-results/${resultToDelete.id}`);
      setDeleteModalOpen(false);
      setResultToDelete(null);
      fetchData();
    } catch (err) {
      console.error('Failed to delete result:', err);
      alert(isKhmer ? 'មិនអាចលុបលទ្ធផលប្រឡងបានទេ។' : 'Failed to delete result.');
    } finally {
      setDeleting(false);
    }
  };

  const getGradeBadge = (grade) => {
    const g = (grade || '').toUpperCase();
    let bg = '#f0fdf4';
    let color = '#166534';
    let border = '#bbf7d0';

    if (g === 'A') {
      bg = '#f0fdf4';
      color = '#15803d';
      border = '#bbf7d0';
    } else if (g === 'B+') {
      bg = '#eff6ff';
      color = '#1d4ed8';
      border = '#bfdbfe';
    } else if (g === 'B') {
      bg = '#f0f9ff';
      color = '#0369a1';
      border = '#bae6fd';
    } else if (g.startsWith('C')) {
      bg = '#fffbeb';
      color = '#b45309';
      border = '#fef3c7';
    } else if (g.startsWith('D') || g === 'E') {
      bg = '#fff7ed';
      color = '#c2410c';
      border = '#ffedd5';
    } else if (g === 'F') {
      bg = '#fef2f2';
      color = '#b91c1c';
      border = '#fecaca';
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '34px',
          padding: '2px 8px',
          borderRadius: '9999px',
          backgroundColor: bg,
          color: color,
          border: `1px solid ${border}`,
          fontWeight: '800',
          fontSize: '0.8rem',
        }}
      >
        {grade || 'N/A'}
      </span>
    );
  };

  const getInitials = (name = '') => {
    const clean = name.replace(/\(.*?\)/g, '').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase() || 'ST';
  };

  // Helper to cleanly separate Khmer and English names
  const parseStudentName = (rawName = '') => {
    if (!rawName) return { primary: isKhmer ? 'និស្សិតមិនបញ្ជាក់ឈ្មោះ' : 'Unnamed Student', secondary: '' };
    const match = rawName.match(/^(.*?)\s*\((.*?)\)$/);
    if (match) {
      return {
        primary: match[1].trim(),
        secondary: match[2].trim(),
      };
    }
    return {
      primary: rawName.trim(),
      secondary: '',
    };
  };

  const columns = [
    {
      header: isKhmer ? 'និស្សិត & អត្តលេខ' : 'Student & ID',
      width: '23%',
      render: (row) => {
        const { primary, secondary } = parseStudentName(row.studentName);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                color: '#1e73be',
                border: '1px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '0.8rem',
                flexShrink: 0,
              }}
            >
              {getInitials(row.studentName)}
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div
                style={{
                  fontWeight: '700',
                  color: '#07294D',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={row.studentName}
              >
                <span>{primary}</span>
                {secondary && (
                  <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: '500' }}>
                    ({secondary})
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px', whiteSpace: 'nowrap' }}>
                <span className="admin-student-id-pill">{row.studentId || 'NO-ID'}</span>
                {row.className && (
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '500' }}>
                    • {row.className}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: isKhmer ? 'ជំនាញ & ព័ត៌មានប្រឡង' : 'Major & Exam Details',
      width: '34%',
      render: (row) => (
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <div
            style={{
              fontWeight: '700',
              color: '#07294D',
              fontSize: '0.86rem',
              lineHeight: '1.3',
              marginBottom: '3px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={row.courseName}
          >
            {row.courseName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.73rem', minWidth: 0 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '1px 6px',
                borderRadius: '5px',
                background: '#eff6ff',
                color: '#1e73be',
                fontSize: '0.72rem',
                fontWeight: 700,
                border: '1px solid #dbeafe',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              {row.semester}
            </span>
            <span style={{ color: '#64748b', fontWeight: '500', flexShrink: 0, whiteSpace: 'nowrap' }}>
              {row.year} {row.generation && `• ${row.generation}`}
            </span>
            {row.examName && (
              <span
                style={{
                  color: '#94a3b8',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  minWidth: 0,
                }}
                title={`${row.examName || ''} ${row.subject ? '• ' + row.subject : ''}`}
              >
                • {row.examName}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: isKhmer ? 'ពិន្ទុ & និទ្ទេស' : 'Score & Grade',
      width: '14%',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
          {getGradeBadge(row.grade)}
          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#07294D', lineHeight: '1.2' }}>
              {row.obtainedMarks ?? '--'}
              <span style={{ fontSize: '0.72rem', fontWeight: '500', color: '#94a3b8' }}>
                /{row.totalMarks ?? 100}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: '600', color: '#059669', marginTop: '2px' }}>
              {row.percentage != null ? `${row.percentage}%` : ''}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: isKhmer ? 'ឯកសារភ្ជាប់' : 'Document',
      width: '9%',
      render: (row) => {
        const fileUrl = row.resultPdfUrl || row.resultImageUrl;
        if (!fileUrl) {
          return <span style={{ color: '#cbd5e1', fontSize: '0.74rem' }}>--</span>;
        }

        const isPdf = Boolean(row.resultPdfUrl || fileUrl.toLowerCase().endsWith('.pdf'));
        return (
          <div style={{ whiteSpace: 'nowrap' }}>
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: isPdf ? '#be123c' : '#1e73be',
                fontWeight: '700',
                fontSize: '0.74rem',
                textDecoration: 'none',
                padding: '2px 7px',
                borderRadius: '6px',
                background: isPdf ? '#fff1f2' : '#eff6ff',
                border: `1px solid ${isPdf ? '#fecdd3' : '#dbeafe'}`,
                whiteSpace: 'nowrap',
              }}
            >
              {isPdf ? <FileText size={12} /> : <ImageIcon size={12} />}
              <span>{isPdf ? 'PDF' : (isKhmer ? 'រូបភាព' : 'Image')}</span>
            </a>
          </div>
        );
      },
    },
    {
      header: isKhmer ? 'ស្ថានភាព' : 'Status',
      width: '9%',
      render: (row) => (
        <div style={{ whiteSpace: 'nowrap' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '0.74rem',
              fontWeight: 700,
              background: row.isPublished ? '#f0fdf4' : '#fffbeb',
              color: row.isPublished ? '#166534' : '#b45309',
              border: `1px solid ${row.isPublished ? '#bbf7d0' : '#fef3c7'}`,
              whiteSpace: 'nowrap',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: row.isPublished ? '#22c55e' : '#f59e0b',
                flexShrink: 0,
              }}
            />
            {row.isPublished
              ? (isKhmer ? 'បានផ្សាយ' : 'Published')
              : (isKhmer ? 'ព្រាង' : 'Draft')}
          </span>
        </div>
      ),
    },
    {
      header: isKhmer ? 'ប្រតិបត្តិការ' : 'Actions',
      align: 'right',
      width: '11%',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', whiteSpace: 'nowrap' }}>
          <button
            onClick={() => setSelectedTranscript(row)}
            className="admin-btn admin-btn-outline admin-btn-sm"
            title={isKhmer ? 'ពិនិត្យតារាងពិន្ទុផ្លូវការ' : 'View Official Transcript'}
            style={{ padding: '5px 8px', borderRadius: '7px', color: '#1e73be', borderColor: '#dbeafe', background: '#eff6ff' }}
          >
            <Eye size={13} />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="admin-btn admin-btn-outline admin-btn-sm"
            title={isKhmer ? 'កែសម្រួល' : 'Edit Result'}
            style={{ padding: '5px 8px', borderRadius: '7px' }}
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => openDeleteModal(row)}
            className="admin-btn admin-btn-danger admin-btn-sm"
            title={isKhmer ? 'លុប' : 'Delete Result'}
            style={{ padding: '5px 8px', borderRadius: '7px' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  // Mobile Adaptive Card View Renderer for touch devices (< 768px)
  const renderMobileCard = (row) => {
    const { primary, secondary } = parseStudentName(row.studentName);
    const fileUrl = row.resultPdfUrl || row.resultImageUrl;
    const isPdf = Boolean(row.resultPdfUrl || (fileUrl && fileUrl.toLowerCase().endsWith('.pdf')));

    return (
      <div className="admin-user-mobile-card">
        {/* 1. Top Row: Avatar, Student Name, Student ID & Grade Badge */}
        <div className="admin-user-mobile-card-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                color: '#1e73be',
                border: '1px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '0.86rem',
                flexShrink: 0,
              }}
            >
              {getInitials(row.studentName)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: '700', color: '#07294D', fontSize: '0.92rem', lineHeight: '1.2' }}>
                <span>{primary}</span>
                {secondary && (
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '500', marginLeft: '5px' }}>
                    ({secondary})
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px', flexWrap: 'wrap' }}>
                <span className="admin-student-id-pill">{row.studentId || 'NO-ID'}</span>
                {row.className && (
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '500' }}>
                    • {row.className}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Grade Badge & Marks */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {getGradeBadge(row.grade)}
              <span style={{ fontSize: '0.94rem', fontWeight: '800', color: '#07294D' }}>
                {row.obtainedMarks ?? '--'}
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '500' }}>
                  /{row.totalMarks ?? 100}
                </span>
              </span>
            </div>
            {row.percentage != null && (
              <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#059669', marginTop: '2px' }}>
                {row.percentage}%
              </span>
            )}
          </div>
        </div>

        {/* 2. Middle Block: Major, Semester & Exam Details */}
        <div className="admin-user-mobile-card-details">
          <div style={{ fontWeight: '700', color: '#07294D', marginBottom: '4px', lineHeight: '1.3' }}>
            {row.courseName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', color: '#64748b', marginBottom: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 7px',
                borderRadius: '5px',
                background: '#eff6ff',
                color: '#1e73be',
                fontSize: '0.72rem',
                fontWeight: 700,
                border: '1px solid #dbeafe',
                flexShrink: 0,
              }}
            >
              {row.semester}
            </span>
            <span style={{ fontWeight: '500', fontSize: '0.76rem' }}>
              {row.year} {row.generation && `• ${row.generation}`}
            </span>
            {row.examName && <span style={{ color: '#94a3b8', fontSize: '0.76rem' }}>• {row.examName}</span>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px dashed #e2e8f0', gap: '6px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                fontWeight: 700,
                background: row.isPublished ? '#f0fdf4' : '#fffbeb',
                color: row.isPublished ? '#166534' : '#b45309',
                border: `1px solid ${row.isPublished ? '#bbf7d0' : '#fef3c7'}`,
              }}
            >
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: row.isPublished ? '#22c55e' : '#f59e0b',
                }}
              />
              {row.isPublished ? (isKhmer ? 'បានផ្សាយ' : 'Published') : (isKhmer ? 'ព្រាង' : 'Draft')}
            </span>

            {fileUrl ? (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: isPdf ? '#be123c' : '#1e73be',
                  fontWeight: '700',
                  fontSize: '0.72rem',
                  textDecoration: 'none',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: isPdf ? '#fff1f2' : '#eff6ff',
                  border: `1px solid ${isPdf ? '#fecdd3' : '#dbeafe'}`,
                }}
              >
                {isPdf ? <FileText size={11} /> : <ImageIcon size={11} />}
                <span>{isPdf ? 'PDF ភ្ជាប់' : (isKhmer ? 'រូបភាព' : 'Image')}</span>
              </a>
            ) : (
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {isKhmer ? 'គ្មានឯកសារភ្ជាប់' : 'No Attachment'}
              </span>
            )}
          </div>
        </div>

        {/* 3. Action Buttons */}
        <div className="admin-user-mobile-card-actions">
          <button
            onClick={() => setSelectedTranscript(row)}
            className="admin-user-mobile-action-btn view"
            title={isKhmer ? 'ពិនិត្យតារាងពិន្ទុផ្លូវការ' : 'View Official Transcript'}
          >
            <Eye size={13} />
            <span>{isKhmer ? 'តារាងពិន្ទុ' : 'Transcript'}</span>
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="admin-user-mobile-action-btn edit"
            title={isKhmer ? 'កែសម្រួល' : 'Edit Result'}
          >
            <Edit2 size={13} />
            <span>{isKhmer ? 'កែសម្រួល' : 'Edit'}</span>
          </button>
          <button
            onClick={() => openDeleteModal(row)}
            className="admin-user-mobile-action-btn delete"
            title={isKhmer ? 'លុប' : 'Delete Result'}
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
      {/* 1. Header Banner with Trust Badge */}
      <div
        className="admin-exam-header"
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
            <Award size={14} />
            {isKhmer ? 'ប្រព័ន្ធគ្រប់គ្រងលទ្ធផលប្រឡង & តារាងពិន្ទុផ្លូវការ' : 'Official Examination & Grading Portal'}
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
            {isKhmer ? 'លទ្ធផលប្រឡង & តារាងពិន្ទុនិស្សិត' : 'Exam Results & Transcripts'}
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
            {isKhmer
              ? 'គ្រប់គ្រង បញ្ចូលពិន្ទុ បោះពុម្ពតារាងពិន្ទុ និងផ្សព្វផ្សាយលទ្ធផលប្រឡងឆមាស និងវគ្គបណ្តុះបណ្តាលថ្នាក់ជាតិ TVET'
              : 'Manage, record marks, print official transcripts, and publish examination results across institutional departments'}
          </p>
        </div>

        <div className="admin-exam-header-actions" style={{ display: 'flex', gap: '10px' }}>
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
            {isKhmer ? 'បញ្ចូលលទ្ធផលថ្មី' : 'Add Exam Result'}
          </button>
        </div>
      </div>

      {/* 2. 4-Card Institutional KPI Metric Strip */}
      <div className="admin-kpi-grid">
        {/* KPI 1: Published Results */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">{isKhmer ? 'លទ្ធផលបានផ្សាយ' : 'Published Results'}</span>
              <div className="admin-kpi-value">
                {publishedResults} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>/ {totalResults}</span>
              </div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#1e73be' }} />
                <span>{totalResults > 0 ? Math.round((publishedResults / totalResults) * 100) : 0}% {isKhmer ? 'នៃលទ្ធផលសរុប' : 'active availability'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#eff6ff', color: '#1e73be' }}>
                {isKhmer ? 'ផ្សព្វផ្សាយ' : 'Published'}
              </span>
              <div className="admin-kpi-icon-badge" style={{ background: '#eff6ff', color: '#1e73be', border: '1px solid #dbeafe' }}>
                <Award size={24} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'ពិនិត្យលទ្ធផលផ្សាយ' : 'Manage results'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* KPI 2: Honors / Distinction */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">{isKhmer ? 'និទ្ទេសឆ្នើម A & B+' : 'Honors (A & B+)'}</span>
              <div className="admin-kpi-value">{honorsResults}</div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#059669' }} />
                <span>{isKhmer ? 'និស្សិតឆ្នើមប្រចាំឆមាស' : 'Exemplary performance'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#f0fdf4', color: '#059669' }}>
                {isKhmer ? 'ឆ្នើម' : 'Honors'}
              </span>
              <div className="admin-kpi-icon-badge" style={{ background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' }}>
                <Sparkles size={24} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'បញ្ជីនិស្សិតឆ្នើម' : 'View honors list'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* KPI 3: Average Performance */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">{isKhmer ? 'ពិន្ទុមធ្យមសរុប' : 'Average Performance'}</span>
              <div className="admin-kpi-value">{averagePercentage}%</div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#ca8a04' }} />
                <span>{isKhmer ? 'មធ្យមភាគពិន្ទុស្ថាប័ន' : 'Institutional score average'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#fefce8', color: '#ca8a04' }}>
                {isKhmer ? 'មធ្យម' : 'Average'}
              </span>
              <div className="admin-kpi-icon-badge" style={{ background: '#fefce8', color: '#ca8a04', border: '1px solid #fef08a' }}>
                <CheckCircle2 size={24} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'វិភាគស្ថិតិពិន្ទុ' : 'Score analytics'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* KPI 4: Examined Majors */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">{isKhmer ? 'ជំនាញមានការប្រឡង' : 'Active Majors'}</span>
              <div className="admin-kpi-value">{availableMajors.length}</div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#7c3aed' }} />
                <span>{isKhmer ? 'ដេប៉ាតឺម៉ង់បានបញ្ចូលពិន្ទុ' : 'Departments with records'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#faf5ff', color: '#7c3aed' }}>
                {isKhmer ? 'ជំនាញ' : 'Majors'}
              </span>
              <div className="admin-kpi-icon-badge" style={{ background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}>
                <BookOpen size={24} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'តម្រងតាមជំនាញ' : 'Filter by major'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs Strip */}
      <div className="admin-user-filter-bar">
        <button
          type="button"
          className={`admin-user-filter-pill ${selectedMajor === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedMajor('all')}
        >
          <Award size={14} />
          <span>{isKhmer ? 'គ្រប់ជំនាញ' : 'All Majors'}</span>
          <span className="admin-user-filter-count">{totalResults}</span>
        </button>

        {availableMajors.map((major) => {
          const count = results.filter((r) => r.courseName === major).length;
          const shortName = major.split('(')[0].trim();
          return (
            <button
              key={major}
              type="button"
              className={`admin-user-filter-pill ${selectedMajor === major ? 'active' : ''}`}
              onClick={() => setSelectedMajor(major)}
            >
              <BookOpen size={14} />
              <span>{shortName}</span>
              <span className="admin-user-filter-count">{count}</span>
            </button>
          );
        })}

        {/* Grade Selector Dropdown Pill */}
        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className={`admin-user-filter-select ${selectedGrade !== 'all' ? 'active' : ''}`}
        >
          <option value="all">{isKhmer ? 'គ្រប់និទ្ទេស' : 'All Grades'}</option>
          <option value="A">{isKhmer ? 'និទ្ទេស A' : 'Grade A'}</option>
          <option value="B+">{isKhmer ? 'និទ្ទេស B+' : 'Grade B+'}</option>
          <option value="B">{isKhmer ? 'និទ្ទេស B' : 'Grade B'}</option>
          <option value="C">{isKhmer ? 'និទ្ទេស C' : 'Grade C'}</option>
          <option value="F">{isKhmer ? 'ធ្លាក់ (F)' : 'Grade F'}</option>
        </select>
      </div>

      {/* 4. DataTable */}
      <AdminDataTable
        columns={columns}
        data={filteredResults}
        loading={loading}
        fixedLayout
        renderMobileCard={renderMobileCard}
        title={isKhmer ? 'បញ្ជីលទ្ធផលប្រឡង & តារាងពិន្ទុ' : 'Examination Results Directory'}
        subtitle={
          isKhmer
            ? `បង្ហាញ ${filteredResults.length} ក្នុងចំណោមលទ្ធផលសរុប ${totalResults}`
            : `Showing ${filteredResults.length} of ${totalResults} exam records`
        }
        searchPlaceholder={isKhmer ? 'ស្វែងរកឈ្មោះនិស្សិត, អត្តលេខ, មុខវិជ្ជា...' : 'Search student, ID, subject, exam...'}
      />

      {/* 5. Create / Edit Exam Result Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingResult
            ? (isKhmer ? 'កែសម្រួលលទ្ធផលប្រឡង' : 'Edit Exam Result')
            : (isKhmer ? 'បញ្ចូលលទ្ធផលប្រឡងថ្មី' : 'Record New Exam Result')
        }
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        maxWidth="820px"
      >
        {/* Section 1: Student Information */}
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
            <User size={15} color="#1e73be" />
            {isKhmer ? 'ផ្នែកទី ១៖ ព័ត៌មាននិស្សិត & ថ្នាក់សិក្សា' : 'Section 1: Student & Class Information'}
          </div>

          <div className="admin-form-row-3">
            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'អត្តលេខនិស្សិត (Student ID) *' : 'Student ID *'}
              </label>
              <input
                type="text"
                className="admin-form-control"
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                placeholder="e.g. IT-2026-001"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'ឈ្មោះពេញនិស្សិត (Student Name) *' : 'Student Full Name *'}
              </label>
              <input
                type="text"
                className="admin-form-control"
                required
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                placeholder="e.g. សុខ វិសាល (Sok Visal)"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'ក្រុម / ថ្នាក់ (Class)' : 'Class Code'}
              </label>
              <input
                type="text"
                className="admin-form-control"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                placeholder="e.g. IT-Y2-A"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Major & Academic Term */}
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
            <GraduationCap size={15} color="#7c3aed" />
            {isKhmer ? 'ផ្នែកទី ២៖ ជំនាញ & កម្មវិធីប្រឡង' : 'Section 2: Major & Examination Scope'}
          </div>

          <div className="admin-form-row-4">
            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'ជំនាញ / វគ្គសិក្សា *' : 'Major / Course *'}
              </label>
              <select
                className="admin-form-control"
                required
                value={formData.courseName}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              >
                <option value="">{isKhmer ? '-- ជ្រើសរើសជំនាញ --' : '-- Select Major --'}</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.title}>{c.title}</option>
                ))}
                <option value="វិទ្យាសាស្ត្រកុំព្យូទ័រ (Information Technology)">Information Technology</option>
                <option value="វិស្វកម្មអគ្គិសនី (Electrical Engineering)">Electrical Engineering</option>
                <option value="វិស្វកម្មសំណង់ស៊ីវិល (Civil Engineering)">Civil Engineering</option>
                <option value="វិស្វកម្មបរិក្ខារត្រជាក់ (Air Conditioning & Refrigeration)">Air Conditioning & Refrigeration</option>
                <option value="គណនេយ្យ និងហិរញ្ញវត្ថុ (Accounting & Finance)">Accounting & Finance</option>
                <option value="គ្រប់គ្រងទេសចរណ៍ និងបដិសណ្ឋារកិច្ច (Tourism & Hospitality)">Tourism & Hospitality</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'ឆ្នាំសិក្សា (Year)' : 'Academic Year'}
              </label>
              <select
                className="admin-form-control"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              >
                <option value="Year 1">{isKhmer ? 'ឆ្នាំទី ១' : 'Year 1'}</option>
                <option value="Year 2">{isKhmer ? 'ឆ្នាំទី ២' : 'Year 2'}</option>
                <option value="Year 3">{isKhmer ? 'ឆ្នាំទី ៣' : 'Year 3'}</option>
                <option value="Year 4">{isKhmer ? 'ឆ្នាំទី ៤' : 'Year 4'}</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'ឆមាស (Semester)' : 'Semester'}
              </label>
              <select
                className="admin-form-control"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              >
                <option value="Semester 1">{isKhmer ? 'ឆមាសទី ១' : 'Semester 1'}</option>
                <option value="Semester 2">{isKhmer ? 'ឆមាសទី ២' : 'Semester 2'}</option>
                <option value="Final Exam">{isKhmer ? 'ប្រឡងបញ្ចប់វគ្គ' : 'Final Exam'}</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'ជំនាន់ (Generation)' : 'Generation'}
              </label>
              <input
                type="text"
                className="admin-form-control"
                value={formData.generation}
                onChange={(e) => setFormData({ ...formData, generation: e.target.value })}
                placeholder="e.g. Generation 12"
              />
            </div>
          </div>

          <div className="admin-form-row-3">
            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'ឈ្មោះការប្រឡង' : 'Exam Title'}
              </label>
              <input
                type="text"
                className="admin-form-control"
                value={formData.examName}
                onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                placeholder="e.g. ការប្រឡងបញ្ចប់ឆមាសទី២"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'មុខវិជ្ជាប្រឡង (Subject)' : 'Subject / Module'}
              </label>
              <input
                type="text"
                className="admin-form-control"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. Web Application Development"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'កាលបរិច្ឆេទប្រឡង' : 'Exam Date'}
              </label>
              <input
                type="date"
                className="admin-form-control"
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Scores & Automatic Grade Calculation */}
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
            <Sparkles size={15} color="#ca8a04" />
            {isKhmer ? 'ផ្នែកទី ៣៖ ពិន្ទុ & និទ្ទេស (គណនាស្វ័យប្រវត្តិ)' : 'Section 3: Scores & Grade (Live Calculation)'}
          </div>

          <div
            className="admin-form-row-4"
            style={{
              background: '#f8fafc',
              padding: '16px',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div className="admin-form-group" style={{ margin: 0 }}>
              <label className="admin-form-label">{isKhmer ? 'ពិន្ទុអតិបរមា' : 'Total Marks'}</label>
              <input
                type="number"
                className="admin-form-control"
                value={formData.totalMarks}
                onChange={(e) => handleMarksChange(formData.obtainedMarks, e.target.value)}
              />
            </div>

            <div className="admin-form-group" style={{ margin: 0 }}>
              <label className="admin-form-label">{isKhmer ? 'ពិន្ទុទទួលបាន' : 'Obtained Marks'}</label>
              <input
                type="number"
                className="admin-form-control"
                value={formData.obtainedMarks}
                onChange={(e) => handleMarksChange(e.target.value, formData.totalMarks)}
              />
            </div>

            <div className="admin-form-group" style={{ margin: 0 }}>
              <label className="admin-form-label">{isKhmer ? 'ភាគរយ (%)' : 'Percentage (%)'}</label>
              <input
                type="number"
                step="0.1"
                className="admin-form-control"
                value={formData.percentage}
                onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
              />
            </div>

            <div className="admin-form-group" style={{ margin: 0 }}>
              <label className="admin-form-label">{isKhmer ? 'និទ្ទេសផ្លូវការ' : 'Official Grade'}</label>
              <select
                className="admin-form-control"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                style={{ fontWeight: 700 }}
              >
                <option value="A">Grade A (≥ 85%)</option>
                <option value="B+">Grade B+ (80 - 84%)</option>
                <option value="B">Grade B (70 - 79%)</option>
                <option value="C+">Grade C+ (65 - 69%)</option>
                <option value="C">Grade C (50 - 64%)</option>
                <option value="D">Grade D (45 - 49%)</option>
                <option value="E">Grade E (40 - 44%)</option>
                <option value="F">Grade F (Fail &lt; 40%)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: File Upload & Publish Status */}
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
            {isKhmer ? 'ផ្នែកទី ៤៖ ឯកសារលទ្ធផល & ការផ្សព្វផ្សាយ' : 'Section 4: Attachments & Publishing'}
          </div>

          <div className="admin-form-row-2" style={{ marginBottom: '14px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'ផ្ទុកឯកសារតារាងពិន្ទុឡើង (PDF ឬរូបភាព)' : 'Upload Score Sheet (PDF or Image)'}
              </label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="admin-form-control"
                  style={{ padding: '6px 10px' }}
                />
                {uploading && <span style={{ fontSize: '0.8rem', color: '#1e73be' }}>{isKhmer ? 'កំពុងផ្ទុក...' : 'Uploading...'}</span>}
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'ប្រភេទឯកសារ' : 'Document Type'}
              </label>
              <select
                className="admin-form-control"
                value={formData.documentType}
                onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
              >
                <option value="image">{isKhmer ? 'រូបភាពតារាងពិន្ទុ (Image)' : 'Image Sheet'}</option>
                <option value="pdf">{isKhmer ? 'ឯកសារ PDF (Score Sheet PDF)' : 'Score Sheet PDF'}</option>
                <option value="both">{isKhmer ? 'ទាំងពីរ (Both Image & PDF)' : 'Both Image & PDF'}</option>
              </select>
            </div>
          </div>

          <div className="admin-form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                style={{ width: '16px', height: '16px', accentColor: '#1e73be' }}
              />
              <span style={{ fontWeight: '700', fontSize: '0.88rem', color: '#07294D' }}>
                {isKhmer
                  ? 'ផ្សព្វផ្សាយលទ្ធផលនេះជាសាធារណៈ (និស្សិតអាចផ្ទៀងផ្ទាត់លើទំព័រ Exam Result និង Student Portal បាន)'
                  : 'Publish publicly on Institutional Exam Portal and Student Portal'}
              </span>
            </label>
          </div>
        </div>
      </AdminModal>

      {/* 6. Official Student Transcript Lightbox Modal */}
      {selectedTranscript && (
        <div
          className="admin-transcript-overlay"
          onClick={() => setSelectedTranscript(null)}
        >
          <div
            className="admin-transcript-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* National Institutional Header */}
            <div className="admin-transcript-header">
              <button
                onClick={() => setSelectedTranscript(null)}
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  background: 'rgba(255, 255, 255, 0.15)',
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

              <div style={{ fontSize: '0.92rem', fontWeight: 800, letterSpacing: '1px', marginBottom: '2px' }}>
                ព្រះរាជាណាចក្រកម្ពុជា
              </div>
              <div style={{ fontSize: '0.8rem', color: '#ffaf00', fontWeight: 700, letterSpacing: '0.5px' }}>
                ជាតិ សាសនា ព្រះមហាក្សត្រ
              </div>
              <div style={{ width: '40px', height: '2px', background: '#ffaf00', margin: '6px auto 10px auto' }} />

              <div style={{ fontSize: '0.82rem', opacity: 0.9 }}>
                ក្រសួងការងារ និងបណ្តុះបណ្តាលវិជ្ជាជីវៈ
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '2px' }}>
                វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប (RPITSSR)
              </div>
              <div
                style={{
                  display: 'inline-block',
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '4px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  marginTop: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                }}
              >
                {isKhmer ? 'តារាងពិន្ទុ និងលទ្ធផលប្រឡងផ្លូវការ' : 'Official Academic Transcript'}
              </div>
            </div>

            {/* Transcript Body */}
            <div className="admin-transcript-body">
              {/* Student Identity Grid */}
              <div className="admin-transcript-identity">
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    {isKhmer ? 'ឈ្មោះនិស្សិត' : 'Student Name'}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#07294D', marginTop: '2px' }}>
                    {selectedTranscript.studentName || 'Sok Visal'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    {isKhmer ? 'អត្តលេខនិស្សិត' : 'Student ID'}
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e73be', marginTop: '2px' }}>
                    {selectedTranscript.studentId || 'N/A'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    {isKhmer ? 'ជំនាញ / ដេប៉ាតឺម៉ង់' : 'Major / Department'}
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginTop: '2px' }}>
                    {selectedTranscript.courseName}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    {isKhmer ? 'ថ្នាក់ & ជំនាន់' : 'Class & Generation'}
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginTop: '2px' }}>
                    {selectedTranscript.className} • {selectedTranscript.generation}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    {isKhmer ? 'ការប្រឡង' : 'Examination'}
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginTop: '2px' }}>
                    {selectedTranscript.examName} ({selectedTranscript.semester})
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    {isKhmer ? 'មុខវិជ្ជា' : 'Subject'}
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginTop: '2px' }}>
                    {selectedTranscript.subject || (isKhmer ? 'មុខវិជ្ជាឯកទេស' : 'Core Technical Module')}
                  </div>
                </div>
              </div>

              {/* Score Highlights 3-Card Strip */}
              <div className="admin-transcript-stats">
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '16px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(7, 41, 77, 0.04)',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    {isKhmer ? 'ពិន្ទុទទួលបាន' : 'Marks Obtained'}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#07294D', marginTop: '4px' }}>
                    {selectedTranscript.obtainedMarks || 100}
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
                      /{selectedTranscript.totalMarks || 100}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '16px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(7, 41, 77, 0.04)',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    {isKhmer ? 'ភាគរយ' : 'Percentage'}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e73be', marginTop: '4px' }}>
                    {selectedTranscript.percentage || 100}%
                  </div>
                </div>

                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '16px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(7, 41, 77, 0.04)',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    {isKhmer ? 'និទ្ទេសផ្លូវការ' : 'Official Grade'}
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    {getGradeBadge(selectedTranscript.grade)}
                  </div>
                </div>
              </div>

              {/* Signatures & Certification Block */}
              <div className="admin-transcript-signatures">
                <div>
                  <div style={{ fontWeight: 700, color: '#07294D' }}>
                    {isKhmer ? 'គណៈកម្មការប្រឡង' : 'Examination Board'}
                  </div>
                  <div style={{ height: '45px' }} />
                  <div style={{ fontSize: '0.75rem' }}>{isKhmer ? '(ហត្ថលេខា និងឈ្មោះ)' : '(Signature & Name)'}</div>
                </div>

                <div>
                  <div style={{ fontWeight: 700, color: '#07294D' }}>
                    {isKhmer ? 'ការិយាល័យកិច្ចការសិក្សា & ស្រាវជ្រាវ' : 'Office of Academic Affairs'}
                  </div>
                  <div style={{ height: '45px' }} />
                  <div style={{ fontSize: '0.75rem' }}>
                    {isKhmer ? 'បានពិនិត្យ និងបញ្ជាក់ត្រឹមត្រូវ' : 'Verified & Certified'}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="admin-transcript-footer">
              <button
                type="button"
                onClick={() => window.print()}
                className="admin-btn admin-btn-outline"
                style={{
                  borderRadius: '10px',
                  padding: '8px 16px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Printer size={15} />
                {isKhmer ? 'បោះពុម្ពតារាងពិន្ទុ' : 'Print Transcript'}
              </button>

              <div className="admin-transcript-footer-actions" style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedTranscript(null)}
                  className="admin-btn admin-btn-outline"
                  style={{ borderRadius: '10px', padding: '8px 18px', fontWeight: 600 }}
                >
                  {isKhmer ? 'បិទផ្ទាំង' : 'Close'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const t = selectedTranscript;
                    setSelectedTranscript(null);
                    openEditModal(t);
                  }}
                  className="admin-btn admin-btn-primary"
                  style={{
                    borderRadius: '10px',
                    padding: '8px 18px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Edit2 size={14} />
                  {isKhmer ? 'កែសម្រួលពិន្ទុ' : 'Edit Result'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Delete Confirmation Modal */}
      {deleteModalOpen && resultToDelete && (
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
                    {isKhmer ? 'បញ្ជាក់ការលុបលទ្ធផលប្រឡង' : 'Confirm Delete Exam Result'}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {isKhmer ? 'សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានទេ' : 'This action cannot be undone'}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: '0 0 14px 0' }}>
                {isKhmer ? (
                  <>
                    តើអ្នកពិតជាចង់លុបលទ្ធផលប្រឡងរបស់និស្សិត{' '}
                    <strong>"{resultToDelete.studentName}"</strong> (អត្តលេខ: {resultToDelete.studentId || 'N/A'}) សម្រាប់មុខវិជ្ជា{' '}
                    <strong>"{resultToDelete.subject || resultToDelete.examName}"</strong> នេះមែនទេ?
                  </>
                ) : (
                  <>
                    Are you sure you want to delete the exam record for{' '}
                    <strong>"{resultToDelete.studentName}"</strong> ({resultToDelete.studentId || 'N/A'}) in subject{' '}
                    <strong>"{resultToDelete.subject || resultToDelete.examName}"</strong>?
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
