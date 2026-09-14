import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import { Edit2, Trash2, FileText, Image as ImageIcon, Upload, Award } from 'lucide-react';

export const AdminExamResultsPage = () => {
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

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
      alert('File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.courseName) {
      alert('Please select or specify a Course / Major.');
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
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to save exam result.';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (r) => {
    const label = r.studentName || r.examName || `Result #${r.id}`;
    if (!window.confirm(`Delete exam result for "${label}"?`)) return;
    try {
      await api.delete(`/admin/exam-results/${r.id}`);
      fetchData();
    } catch {
      alert('Failed to delete result.');
    }
  };

  const getGradeBadge = (grade) => {
    const g = (grade || '').toUpperCase();
    let bg = '#10b981';
    if (g.startsWith('B')) bg = '#3b82f6';
    if (g.startsWith('C')) bg = '#f59e0b';
    if (g.startsWith('D') || g === 'E') bg = '#ea580c';
    if (g === 'F') bg = '#ef4444';

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '32px',
          height: '24px',
          padding: '0 8px',
          borderRadius: '12px',
          backgroundColor: bg,
          color: '#fff',
          fontWeight: '700',
          fontSize: '0.8rem',
        }}
      >
        {grade || 'N/A'}
      </span>
    );
  };

  const columns = [
    {
      header: 'Student & Class',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '700', color: 'var(--admin-primary)', fontSize: '0.92rem' }}>
            {row.studentName || 'Student Name'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
            <span style={{ fontWeight: '600' }}>{row.studentId || 'No ID'}</span>
            {row.className && ` • ${row.className}`}
          </div>
        </div>
      ),
    },
    {
      header: 'Major & Exam',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '600', color: '#334155' }}>{row.courseName}</div>
          <div style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
            {row.examName} {row.subject && `• ${row.subject}`}
          </div>
        </div>
      ),
    },
    {
      header: 'Academic Term',
      render: (row) => (
        <div>
          <span className="admin-badge admin-badge-info">{row.semester}</span>
          <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '3px' }}>
            {row.year} {row.generation && `• ${row.generation}`}
          </div>
        </div>
      ),
    },
    {
      header: 'Score & Grade',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {getGradeBadge(row.grade)}
          <div style={{ fontSize: '0.82rem' }}>
            <span style={{ fontWeight: '700' }}>{row.obtainedMarks ?? '--'}</span>
            <span style={{ color: 'var(--admin-text-muted)' }}>/{row.totalMarks ?? 100}</span>
            <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
              {row.percentage != null ? `${row.percentage}%` : ''}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Document',
      render: (row) => {
        const fileUrl = row.resultPdfUrl || row.resultImageUrl;
        if (!fileUrl) {
          return <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem' }}>No File</span>;
        }

        const isPdf = Boolean(row.resultPdfUrl || fileUrl.toLowerCase().endsWith('.pdf'));
        return (
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--admin-accent)',
              fontWeight: '600',
              fontSize: '0.82rem',
              textDecoration: 'none',
              padding: '4px 8px',
              borderRadius: '6px',
              background: 'rgba(12, 139, 81, 0.08)',
            }}
          >
            {isPdf ? <FileText size={14} /> : <ImageIcon size={14} />}
            <span>{isPdf ? 'Score PDF' : 'Score Sheet'}</span>
          </a>
        );
      },
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`admin-badge ${row.isPublished ? 'admin-badge-success' : 'admin-badge-warning'}`}>
          {row.isPublished ? 'Published' : 'Draft'}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={() => openEditModal(row)}
            className="admin-btn admin-btn-outline admin-btn-sm"
            title="Edit Exam Result"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="admin-btn admin-btn-danger admin-btn-sm"
            title="Delete Exam Result"
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
        title="Student Exam Results"
        subtitle="Manage, upload score sheets, and publish semester examination results"
        columns={columns}
        data={results}
        loading={loading}
        onAdd={openAddModal}
        addLabel="Add Exam Result"
        onRefresh={fetchData}
        searchPlaceholder="Search student name, ID, major, or exam..."
      />

      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingResult ? 'Edit Exam Result' : 'Publish New Exam Result'}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
      >
        {/* Student Info Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '14px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">Student ID *</label>
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
            <label className="admin-form-label">Student Name *</label>
            <input
              type="text"
              className="admin-form-control"
              required
              value={formData.studentName}
              onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              placeholder="e.g. Sok Visal"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Class Name</label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.className}
              onChange={(e) => setFormData({ ...formData, className: e.target.value })}
              placeholder="e.g. IT-Year2-A"
            />
          </div>
        </div>

        {/* Academic & Major Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '14px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">Major / Course *</label>
            <select
              className="admin-form-control"
              required
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
            >
              <option value="">Select Major</option>
              {courses.map((c) => (
                <option key={c.id} value={c.title}>{c.title}</option>
              ))}
              {/* Fallback majors in case courses list is empty */}
              <option value="Information Technology">Information Technology</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Accounting & Finance">Accounting & Finance</option>
              <option value="Tourism & Hospitality">Tourism & Hospitality</option>
            </select>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Year</label>
            <select
              className="admin-form-control"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            >
              <option value="Year 1">Year 1</option>
              <option value="Year 2">Year 2</option>
              <option value="Year 3">Year 3</option>
              <option value="Year 4">Year 4</option>
            </select>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Semester</label>
            <select
              className="admin-form-control"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
            >
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
              <option value="Final Exam">Final Exam</option>
            </select>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Generation</label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.generation}
              onChange={(e) => setFormData({ ...formData, generation: e.target.value })}
              placeholder="e.g. Generation 12"
            />
          </div>
        </div>

        {/* Exam & Subject */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: '14px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">Exam Name *</label>
            <input
              type="text"
              className="admin-form-control"
              required
              value={formData.examName}
              onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
              placeholder="e.g. Final Examination Semester II"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Subject / Course Module</label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g. Web Application Development"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Exam Date</label>
            <input
              type="date"
              className="admin-form-control"
              value={formData.examDate}
              onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
            />
          </div>
        </div>

        {/* Scores & Grading */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">Total Marks</label>
            <input
              type="number"
              className="admin-form-control"
              value={formData.totalMarks}
              onChange={(e) => handleMarksChange(formData.obtainedMarks, e.target.value)}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Obtained Marks</label>
            <input
              type="number"
              className="admin-form-control"
              value={formData.obtainedMarks}
              onChange={(e) => handleMarksChange(e.target.value, formData.totalMarks)}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Percentage (%)</label>
            <input
              type="number"
              step="0.1"
              className="admin-form-control"
              value={formData.percentage}
              onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Grade</label>
            <select
              className="admin-form-control"
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
            >
              <option value="A">A (85-100%)</option>
              <option value="B+">B+ (80-84%)</option>
              <option value="B">B (70-79%)</option>
              <option value="C+">C+ (65-69%)</option>
              <option value="C">C (50-64%)</option>
              <option value="D">D (45-49%)</option>
              <option value="E">E (40-44%)</option>
              <option value="F">F (&lt;40%)</option>
            </select>
          </div>
        </div>

        {/* Document Attachment */}
        <div className="admin-form-group">
          <label className="admin-form-label">Score Sheet / Certificate Document (PDF or Image)</label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="text"
              className="admin-form-control"
              value={formData.resultPdfUrl || formData.resultImageUrl}
              onChange={(e) => {
                const val = e.target.value;
                const isPdf = val.toLowerCase().endsWith('.pdf');
                setFormData({
                  ...formData,
                  resultPdfUrl: isPdf ? val : '',
                  resultImageUrl: !isPdf ? val : '',
                  documentType: isPdf ? 'pdf' : 'image',
                });
              }}
              placeholder="/storage/uploads/exam-results/scoresheet.pdf or image URL"
            />
            <label className="admin-btn admin-btn-outline" style={{ whiteSpace: 'nowrap', cursor: 'pointer' }}>
              <Upload size={14} />
              <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        {/* Publish Checkbox */}
        <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
          <input
            type="checkbox"
            id="publishCheck"
            checked={formData.isPublished}
            onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
          />
          <label htmlFor="publishCheck" style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}>
            Publish publicly on student portal immediately
          </label>
        </div>
      </AdminModal>
    </div>
  );
};
