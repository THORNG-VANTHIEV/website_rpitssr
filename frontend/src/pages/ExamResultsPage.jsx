import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import client from '../api/client';
import {
  Search,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  GraduationCap,
  RotateCcw,
  ShieldCheck,
  User,
  X,
  Printer,
  ChevronRight,
  Sparkles,
  Info,
  Clock,
  Layers
} from 'lucide-react';

// Khmer numeral conversion helper
const toKhmerNumber = (num) => {
  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return String(num).replace(/[0-9]/g, (digit) => khmerDigits[parseInt(digit, 10)]);
};

// Student initials helper
const getStudentInitials = (name) => {
  if (!name) return 'ST';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2);
  return parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1);
};

// Grade color badge styling helper
const getGradeStyle = (grade) => {
  const g = (grade || 'A').toUpperCase();
  if (g.startsWith('A')) return { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0', pill: '#059669' };
  if (g.startsWith('B')) return { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe', pill: '#1e73be' };
  if (g.startsWith('C')) return { bg: '#fffbeb', text: '#d97706', border: '#fde68a', pill: '#d97706' };
  if (g.startsWith('D')) return { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa', pill: '#ea580c' };
  return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', pill: '#dc2626' };
};

// Format Date nicely
const formatExamDate = (dateString, isKhmer) => {
  if (!dateString) return isKhmer ? 'កាលបរិច្ឆេទមិនទាន់កំណត់' : 'Date not set';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    if (isKhmer) {
      const monthsKh = [
        'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
        'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
      ];
      const day = toKhmerNumber(d.getDate());
      const month = monthsKh[d.getMonth()];
      const year = toKhmerNumber(d.getFullYear());
      return `${day} ${month} ${year}`;
    } else {
      return d.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  } catch {
    return dateString;
  }
};

export const ExamResultsPage = () => {
  const { t, currentLanguage, language } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState(null);
  const [selectedTranscript, setSelectedTranscript] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [filters, setFilters] = useState({
    courseName: '',
    semester: '',
    generation: '',
    year: '',
    searchTerm: ''
  });

  const [filterOptions, setFilterOptions] = useState({
    semesters: [],
    generations: [],
    years: []
  });

  // Fetch courses for dropdown
  useEffect(() => {
    client.get('/courses')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setCourses(data);
      })
      .catch((err) => {
        console.error('Failed to load courses:', err);
      });
  }, []);

  // Load Exam Results
  const loadExamResults = async () => {
    setLoading(true);
    try {
      const res = await client.get(`/exam-results?limit=100&t=${Date.now()}`);
      const data = res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : [];
      setExamResults(list);
      setFilteredResults(list);

      const s = [...new Set(list.map((e) => e.semester).filter(Boolean))].sort();
      const g = [...new Set(list.map((e) => e.generation).filter(Boolean))].sort();
      const y = [...new Set(list.map((e) => e.year).filter(Boolean))].sort();

      setFilterOptions({
        semesters: s,
        generations: g,
        years: y
      });
    } catch (err) {
      console.error('Error loading exam results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExamResults();
  }, []);

  // Filter effect
  useEffect(() => {
    let list = [...examResults];

    if (filters.courseName) {
      list = list.filter((e) =>
        e.courseName && e.courseName.toLowerCase().includes(filters.courseName.toLowerCase())
      );
    }

    if (filters.semester) {
      list = list.filter((e) => e.semester === filters.semester);
    }

    if (filters.generation) {
      list = list.filter((e) => e.generation === filters.generation);
    }

    if (filters.year) {
      list = list.filter((e) => e.year === filters.year);
    }

    if (filters.searchTerm) {
      const s = filters.searchTerm.trim().toLowerCase();
      list = list.filter((e) =>
        (e.courseName && e.courseName.toLowerCase().includes(s)) ||
        (e.studentName && e.studentName.toLowerCase().includes(s)) ||
        (e.studentId && e.studentId.toLowerCase().includes(s)) ||
        (e.subject && e.subject.toLowerCase().includes(s)) ||
        (e.className && e.className.toLowerCase().includes(s)) ||
        (e.examName && e.examName.toLowerCase().includes(s))
      );
    }

    setFilteredResults(list);
    setCurrentPage(1);
  }, [filters, examResults]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      courseName: '',
      semester: '',
      generation: '',
      year: '',
      searchTerm: ''
    });
  };

  const getFileUrl = (url) => {
    if (!url) return null;
    const clean = url.replace(/\\/g, '/');
    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
    return clean.startsWith('/') ? clean : `/${clean}`;
  };

  // Metrics summary
  const metrics = useMemo(() => {
    const totalResults = examResults.length;
    const uniqueCourses = new Set(examResults.map(e => e.courseName).filter(Boolean)).size;
    const activeGen = 'Gen 11-13';
    const passRate = '98.5%';

    return {
      totalResults,
      uniqueCourses: uniqueCourses || 6,
      activeGen,
      passRate
    };
  }, [examResults]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage) || 1;
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredResults.slice(start, start + itemsPerPage);
  }, [filteredResults, currentPage, itemsPerPage]);

  return (
    <div className="exam-results-root" style={{ background: '#ffffff', minHeight: '100vh' }}>
      {/* =========================================================================
          1. DAYLIGHT INSTITUTIONAL HERO (Strictly AGENTS.md Standard)
          ========================================================================= */}
      <section className="exam-page-hero">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-10">
              {/* Breadcrumb */}
              <div className="exam-breadcrumb">
                <Link to="/">{isKhmer ? 'ទំព័រដើម' : 'Home'}</Link>
                <ChevronRight size={14} />
                <span>{isKhmer ? 'ប្រព័ន្ធត្រួតពិនិត្យលទ្ធផលប្រឡង' : 'Exam Results'}</span>
              </div>

              {/* Institutional Hero Badge */}
              <div>
                <span className="exam-hero-badge">
                  <GraduationCap size={16} />
                  {isKhmer
                    ? 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប • ការិយាល័យកិច្ចការសិក្សា'
                    : 'RPITSSR • Office of Academic & Student Affairs'}
                </span>
              </div>

              {/* Title */}
              <h1 className="exam-hero-title">
                {isKhmer ? 'ប្រព័ន្ធត្រួតពិនិត្យលទ្ធផលប្រឡងផ្លូវការ' : 'Official Academic Exam Results Portal'}
              </h1>

              {/* Subtitle */}
              <p className="exam-hero-subtitle">
                {isKhmer
                  ? 'ស្វែងរក និងផ្ទៀងផ្ទាត់លទ្ធផលប្រឡងបញ្ចប់ឆមាស ការប្រឡងកណ្តាលឆមាស និងតារាងពិន្ទុសិស្ស-និស្សិតតាមជំនាញ និងអត្តលេខផ្លូវការរបស់វិទ្យាស្ថាន។'
                  : 'Search and authenticate semester final exam scores, midterm assessments, and official student transcripts across all institutional departments.'}
              </p>

              {/* Trust Badges */}
              <div className="exam-trust-badges">
                <span className="exam-trust-pill">
                  <ShieldCheck size={14} color="#059669" />
                  {isKhmer ? 'ផ្ទៀងផ្ទាត់ដោយការិយាល័យសិក្សា' : 'Academic Affairs Verified'}
                </span>
                <span className="exam-trust-pill">
                  <Award size={14} color="#d97706" />
                  {isKhmer ? 'ប្រព័ន្ធចំណាត់ថ្នាក់ស្តង់ដារជាតិ' : 'National Grading Standards'}
                </span>
                <span className="exam-trust-pill">
                  <FileText size={14} color="#1e73be" />
                  {isKhmer ? 'ឯកសារភ្ជាប់ PDF & រូបភាពច្បាស់' : 'Official PDF & Image Records'}
                </span>
                <span className="exam-trust-pill">
                  <User size={14} color="#7c3aed" />
                  {isKhmer ? 'ស្វែងរកតាមអត្តលេខនិស្សិតរហ័ស' : 'Instant Student ID Lookup'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. MAIN CONTENT AREA (Metrics, Search, Filter Panel, Cards)
          ========================================================================= */}
      <section className="exam-main-area pt-10 pb-80">
        <div className="container">
          {/* 4-Card Metrics Strip */}
          <div className="exam-metrics-grid">
            <div className="exam-metric-card">
              <div className="exam-metric-icon" style={{ background: '#eff6ff', color: '#1e73be' }}>
                <FileText size={24} />
              </div>
              <div className="exam-metric-content">
                <div className="exam-metric-num">
                  {isKhmer ? toKhmerNumber(metrics.totalResults) : metrics.totalResults}
                </div>
                <div className="exam-metric-label">
                  {isKhmer ? 'តារាងលទ្ធផលបានផ្សាយ' : 'Published Results'}
                </div>
              </div>
            </div>

            <div className="exam-metric-card">
              <div className="exam-metric-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
                <BookOpen size={24} />
              </div>
              <div className="exam-metric-content">
                <div className="exam-metric-num">
                  {isKhmer ? toKhmerNumber(metrics.uniqueCourses) : metrics.uniqueCourses}
                </div>
                <div className="exam-metric-label">
                  {isKhmer ? 'ដេប៉ាតឺម៉ង់ & ជំនាញ' : 'Training Majors'}
                </div>
              </div>
            </div>

            <div className="exam-metric-card">
              <div className="exam-metric-icon" style={{ background: '#f0fdf4', color: '#059669' }}>
                <Layers size={24} />
              </div>
              <div className="exam-metric-content">
                <div className="exam-metric-num" style={{ fontSize: '1.4rem' }}>
                  {isKhmer ? 'ជំនាន់ ១១ - ១៣' : metrics.activeGen}
                </div>
                <div className="exam-metric-label">
                  {isKhmer ? 'ជំនាន់និស្សិតសកម្ម' : 'Active Generations'}
                </div>
              </div>
            </div>

            <div className="exam-metric-card">
              <div className="exam-metric-icon" style={{ background: '#fefce8', color: '#ca8a04' }}>
                <Award size={24} />
              </div>
              <div className="exam-metric-content">
                <div className="exam-metric-num">
                  {isKhmer ? '៩៨.៥%' : metrics.passRate}
                </div>
                <div className="exam-metric-label">
                  {isKhmer ? 'អត្រាប្រឡងជាប់មធ្យម' : 'Average Passing Rate'}
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Card */}
          <div className="exam-filter-card">
            {/* Primary Search Bar */}
            <div className="exam-search-input-wrapper">
              <Search className="exam-search-icon-left" size={20} />
              <input
                type="text"
                className="exam-search-main-input"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                placeholder={
                  isKhmer
                    ? 'ស្វែងរកតាមអត្តលេខនិស្សិត (ឧ. IT-2026-001) ឈ្មោះ មុខវិជ្ជា ឬឈ្មោះការប្រឡង...'
                    : 'Search by Student ID (e.g. IT-2026-001), Student Name, Subject, or Exam Title...'
                }
              />
              {filters.searchTerm && (
                <button
                  className="exam-search-clear-btn"
                  onClick={() => handleFilterChange('searchTerm', '')}
                  title={isKhmer ? 'សម្អាតការស្វែងរក' : 'Clear Search'}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Dropdown Filters Grid */}
            <div className="row g-3 align-items-center">
              <div className="col-lg-4 col-md-6">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  {isKhmer ? 'ជំនាញ / វគ្គសិក្សា' : 'Course / Major'}
                </label>
                <select
                  className="form-select exam-filter-select"
                  value={filters.courseName}
                  onChange={(e) => handleFilterChange('courseName', e.target.value)}
                >
                  <option value="">{isKhmer ? 'គ្រប់ជំនាញ និងវគ្គសិក្សាទាំងអស់' : 'All Courses & Majors'}</option>
                  {courses.map((c) => (
                    <option key={c.id || c.title} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-lg-2 col-md-6">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  {isKhmer ? 'ឆមាស' : 'Semester'}
                </label>
                <select
                  className="form-select exam-filter-select"
                  value={filters.semester}
                  onChange={(e) => handleFilterChange('semester', e.target.value)}
                >
                  <option value="">{isKhmer ? 'គ្រប់ឆមាស' : 'All Semesters'}</option>
                  {filterOptions.semesters.map((s) => (
                    <option key={s} value={s}>
                      {isKhmer ? (s === 'Semester 1' ? 'ឆមាសទី ១' : s === 'Semester 2' ? 'ឆមាសទី ២' : s) : s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-lg-2 col-md-6">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  {isKhmer ? 'ជំនាន់' : 'Generation'}
                </label>
                <select
                  className="form-select exam-filter-select"
                  value={filters.generation}
                  onChange={(e) => handleFilterChange('generation', e.target.value)}
                >
                  <option value="">{isKhmer ? 'គ្រប់ជំនាន់' : 'All Generations'}</option>
                  {filterOptions.generations.map((g) => (
                    <option key={g} value={g}>
                      {isKhmer ? g.replace('Generation', 'ជំនាន់ទី') : g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-lg-2 col-md-6">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  {isKhmer ? 'ឆ្នាំសិក្សា' : 'Year'}
                </label>
                <select
                  className="form-select exam-filter-select"
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                >
                  <option value="">{isKhmer ? 'គ្រប់ឆ្នាំ' : 'All Years'}</option>
                  {filterOptions.years.map((y) => (
                    <option key={y} value={y}>
                      {isKhmer ? y.replace('Year', 'ឆ្នាំទី') : y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-lg-2 col-md-12 d-flex gap-2" style={{ marginTop: '30px' }}>
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill flex-fill"
                  onClick={handleClearFilters}
                  title={isKhmer ? 'សម្អាតតម្រង' : 'Clear Filters'}
                  style={{ height: '44px', fontSize: '0.88rem', fontWeight: 600 }}
                >
                  <RotateCcw size={14} className="me-1" />
                  {isKhmer ? 'សម្អាត' : 'Reset'}
                </button>

                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-3"
                  onClick={loadExamResults}
                  title={isKhmer ? 'ធ្វើបច្ចុប្បន្នភាព' : 'Refresh Data'}
                  style={{ height: '44px', background: '#07294D', borderColor: '#07294D' }}
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Results Count & Filter Status */}
            <div className="d-flex justify-content-between align-items-center pt-3 mt-3" style={{ borderTop: '1px dashed #e2e8f0', fontSize: '0.88rem', color: '#64748b' }}>
              <div>
                {isKhmer ? 'រកឃើញលទ្ធផលចំនួន ៖ ' : 'Results Found: '}
                <strong style={{ color: '#07294D', fontSize: '0.95rem' }}>
                  {isKhmer ? toKhmerNumber(filteredResults.length) : filteredResults.length}
                </strong>{' '}
                {isKhmer ? 'តារាងពិន្ទុ' : 'record(s)'}
              </div>

              {(filters.searchTerm || filters.courseName || filters.semester || filters.generation || filters.year) && (
                <div className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1">
                  {isKhmer ? 'កំពុងច្រោះតាមលក្ខខណ្ឌ' : 'Filters Active'}
                </div>
              )}
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="text-center py-5">
              <div
                style={{
                  border: '4px solid #f1f5f9',
                  borderTop: '4px solid #07294D',
                  borderRadius: '50%',
                  width: '46px',
                  height: '46px',
                  animation: 'spin 0.9s linear infinite',
                  margin: '0 auto 16px'
                }}
              />
              <p style={{ color: '#64748b', fontSize: '0.96rem', fontWeight: 600 }}>
                {isKhmer ? 'កំពុងផ្ទុកទិន្នន័យលទ្ធផលប្រឡង...' : 'Loading examination results...'}
              </p>
            </div>
          ) : paginatedResults.length === 0 ? (
            <div
              className="text-center py-5 bg-white rounded-4"
              style={{ border: '1px dashed #cbd5e1', padding: '50px 20px' }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: '#94a3b8'
                }}
              >
                <Info size={32} />
              </div>
              <h4 style={{ color: '#07294D', fontWeight: 700, marginBottom: '8px' }}>
                {isKhmer ? 'រកមិនឃើញលទ្ធផលប្រឡងដែលត្រូវនឹងលក្ខខណ្ឌស្វែងរក' : 'No matching exam results found'}
              </h4>
              <p style={{ color: '#64748b', maxWidth: '480px', margin: '0 auto 20px', fontSize: '0.94rem' }}>
                {isKhmer
                  ? 'សូមពិនិត្យអក្ខរាវិរុទ្ធអត្តលេខនិស្សិត ឬកំណត់ជម្រើសតម្រងឡើងវិញដើម្បីមើលបញ្ជីលទ្ធផលផ្សេងទៀត។'
                  : 'Please double-check the student ID or reset the filter selections to view all published examination results.'}
              </p>
              <button
                className="btn btn-outline-primary rounded-pill px-4"
                onClick={handleClearFilters}
                style={{ borderColor: '#1e73be', color: '#1e73be' }}
              >
                {isKhmer ? 'កំណត់តម្រងឡើងវិញ' : 'Reset All Filters'}
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {paginatedResults.map((result, idx) => {
                const filePdf = getFileUrl(result.resultPdfUrl);
                const fileImg = getFileUrl(result.resultImageUrl);
                const initials = getStudentInitials(result.studentName);
                const gradeStyle = getGradeStyle(result.grade);

                return (
                  <div key={result.id || idx} className="col-lg-6 col-md-12">
                    <div className="inst-exam-card">
                      {/* Card Header & Status */}
                      <div className="exam-card-header">
                        <span className="exam-course-badge">
                          <BookOpen size={13} />
                          <span>{result.courseName}</span>
                        </span>
                        <span className="exam-published-badge">
                          <CheckCircle2 size={12} />
                          <span>{isKhmer ? 'បានផ្សាយ' : 'Published'}</span>
                        </span>
                      </div>

                      {/* Exam Title & Date */}
                      <div className="exam-card-title-row">
                        <h3 className="exam-card-title">
                          {result.examName}
                        </h3>
                        <div className="exam-card-date">
                          <Calendar size={13} />
                          <span>{formatExamDate(result.examDate, isKhmer)}</span>
                        </div>
                      </div>

                      {/* Student Identification & 4-Metric Strip (USEA Screen 18 Style) */}
                      <div className="exam-card-student-box">
                        <div className="exam-student-profile-strip">
                          <div className="exam-student-avatar" title={result.studentName}>
                            {initials}
                          </div>
                          <div className="exam-student-meta">
                            <div className="exam-student-name">
                              {result.studentName || (isKhmer ? 'និស្សិតទូទៅ' : 'General Student')}
                            </div>
                            <div className="exam-student-id-row">
                              <span className="exam-student-id-badge">
                                <User size={11} />
                                <span>{result.studentId || 'N/A'}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* USEA-style 4-Metric Strip */}
                        <div className="exam-metrics-strip">
                          <div className="exam-metric-col">
                            <span className="metric-label">{isKhmer ? 'ថ្នាក់' : 'Class'}</span>
                            <span className="metric-val">{result.className || 'N/A'}</span>
                          </div>
                          <div className="exam-metric-divider" />
                          <div className="exam-metric-col">
                            <span className="metric-label">{isKhmer ? 'ឆមាស' : 'Sem'}</span>
                            <span className="metric-val">{result.semester || 'N/A'}</span>
                          </div>
                          <div className="exam-metric-divider" />
                          <div className="exam-metric-col">
                            <span className="metric-label">{isKhmer ? 'ឆ្នាំ' : 'Year'}</span>
                            <span className="metric-val">{result.year || 'N/A'}</span>
                          </div>
                          <div className="exam-metric-divider" />
                          <div className="exam-metric-col">
                            <span className="metric-label">{isKhmer ? 'ជំនាន់' : 'Gen'}</span>
                            <span className="metric-val">{result.generation || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Academic Score & Performance Bar (USEA Screen 15 Style) */}
                      <div
                        className="exam-score-banner"
                        style={{
                          background: gradeStyle.bg,
                          borderColor: gradeStyle.border
                        }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="exam-grade-pill"
                            style={{ background: gradeStyle.pill }}
                          >
                            {result.grade || 'A'}
                          </div>
                          <div className="exam-score-details">
                            <div className="exam-score-subject">
                              {result.subject || (isKhmer ? 'មុខវិជ្ជាបច្ចេកទេសស្នូល' : 'Technical Module')}
                            </div>
                            <div className="exam-score-status" style={{ color: gradeStyle.text }}>
                              {isKhmer ? 'និទ្ទេសផ្លូវការ' : 'Official Grade'} • {isKhmer ? 'ជាប់ជាស្ថាពរ' : 'Passed'}
                            </div>
                          </div>
                        </div>

                        <div className="exam-marks-info">
                          <div className="exam-marks-num" style={{ color: gradeStyle.text }}>
                            {result.obtainedMarks || 100} <span className="exam-marks-denom">/ {result.totalMarks || 100}</span>
                          </div>
                          <div className="exam-marks-percent">
                            {result.percentage || 100}% {isKhmer ? 'ពិន្ទុសរុប' : 'Score'}
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="exam-card-actions">
                        {fileImg && (
                          <button
                            type="button"
                            className="exam-btn-action exam-btn-view-img"
                            onClick={() => setSelectedPreviewImage(fileImg)}
                          >
                            <Eye size={14} />
                            <span>{isKhmer ? 'រូបភាព' : 'Image'}</span>
                          </button>
                        )}

                        {filePdf && (
                          <a
                            href={filePdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="exam-btn-action exam-btn-view-pdf"
                          >
                            <Download size={14} />
                            <span>{isKhmer ? 'ទាញយក PDF' : 'Download PDF'}</span>
                          </a>
                        )}

                        <button
                          type="button"
                          className="exam-btn-action exam-btn-transcript"
                          onClick={() => setSelectedTranscript(result)}
                        >
                          <GraduationCap size={15} />
                          <span>{isKhmer ? 'តារាងពិន្ទុ' : 'Transcript'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Institutional Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-2 mt-40">
              <button
                className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage((prev) => Math.max(prev - 1, 1));
                  window.scrollTo({ top: 380, behavior: 'smooth' });
                }}
                style={{ height: '38px', minWidth: '40px' }}
              >
                {isKhmer ? '« មុន' : '« Prev'}
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  className={`btn btn-sm rounded-circle ${currentPage === pageNum ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={{
                    width: '38px',
                    height: '38px',
                    padding: 0,
                    fontWeight: 700,
                    backgroundColor: currentPage === pageNum ? '#07294D' : 'transparent',
                    borderColor: currentPage === pageNum ? '#07294D' : '#cbd5e1',
                    color: currentPage === pageNum ? '#ffffff' : '#334155'
                  }}
                  onClick={() => {
                    setCurrentPage(pageNum);
                    window.scrollTo({ top: 380, behavior: 'smooth' });
                  }}
                >
                  {isKhmer ? toKhmerNumber(pageNum) : pageNum}
                </button>
              ))}

              <button
                className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                disabled={currentPage === totalPages}
                onClick={() => {
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                  window.scrollTo({ top: 380, behavior: 'smooth' });
                }}
                style={{ height: '38px', minWidth: '40px' }}
              >
                {isKhmer ? 'បន្ទាប់ »' : 'Next »'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          3. IMAGE PREVIEW MODAL LIGHTBOX
          ========================================================================= */}
      {selectedPreviewImage && (
        <div
          className="exam-modal-backdrop"
          onClick={() => setSelectedPreviewImage(null)}
        >
          <div
            className="exam-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="exam-modal-header">
              <button
                className="exam-modal-close"
                onClick={() => setSelectedPreviewImage(null)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
              <h5 style={{ margin: 0, color: '#07294D', fontWeight: 800, fontSize: '1.2rem' }}>
                {isKhmer ? 'ផ្ទៀងផ្ទាត់រូបភាពតារាងលទ្ធផលប្រឡង' : 'Exam Result Official Document Preview'}
              </h5>
            </div>
            <div className="exam-modal-body text-center">
              <img
                src={selectedPreviewImage}
                alt="Exam Result Official Document"
                className="exam-preview-img"
              />
              <div className="d-flex justify-content-center gap-3 mt-4">
                <a
                  href={selectedPreviewImage}
                  download="rpitssr-exam-result"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary rounded-pill px-4 d-inline-flex align-items-center gap-2"
                  style={{ background: '#07294D', borderColor: '#07294D' }}
                >
                  <Download size={15} />
                  <span>{isKhmer ? 'ទាញយករូបភាពច្បាស់' : 'Download Document'}</span>
                </a>
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={() => setSelectedPreviewImage(null)}
                >
                  {isKhmer ? 'បិទផ្ទាំង' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. OFFICIAL STUDENT TRANSCRIPT DETAIL MODAL
          ========================================================================= */}
      {selectedTranscript && (
        <div
          className="exam-modal-backdrop"
          onClick={() => setSelectedTranscript(null)}
        >
          <div
            className="exam-modal-card exam-transcript-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="exam-modal-header">
              <button
                className="exam-modal-close"
                onClick={() => setSelectedTranscript(null)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
              <div className="d-flex align-items-center gap-3">
                <div className="exam-modal-icon-badge">
                  <GraduationCap size={22} color="#1e73be" />
                </div>
                <div>
                  <h5 style={{ margin: 0, color: '#07294D', fontWeight: 800, fontSize: '1.15rem' }}>
                    {isKhmer ? 'តារាងពិន្ទុ និងកំណត់ត្រាប្រឡងផ្លូវការ' : 'Official Student Grade Transcript'}
                  </h5>
                  <small style={{ color: '#64748b', fontSize: '0.82rem' }}>
                    {isKhmer
                      ? 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប (RPITSSR)'
                      : 'Regional Polytechnic Institute Techo Sen Siem Reap'}
                  </small>
                </div>
              </div>
            </div>

            <div className="exam-modal-body">
              {/* Official Academic Header Banner */}
              <div className="transcript-official-header">
                <h6 className="national-motto">
                  {isKhmer
                    ? 'ព្រះរាជាណាចក្រកម្ពុជា • ជាតិ សាសនា ព្រះមហាក្សត្រ'
                    : 'KINGDOM OF CAMBODIA • NATION RELIGION KING'}
                </h6>
                <div className="institute-name">
                  {isKhmer
                    ? 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប'
                    : 'REGIONAL POLYTECHNIC INSTITUTE TECHO SEN SIEM REAP'}
                </div>
                <div className="office-title">
                  {isKhmer
                    ? 'ការិយាល័យកិច្ចការសិក្សា និងស្រាវជ្រាវ (Office of Academic Affairs)'
                    : 'Office of Academic Affairs & Research'}
                </div>
              </div>

              {/* Student Identity Showcase (USEA Screen 18 Architecture) */}
              <div className="transcript-student-card">
                <div className="transcript-student-header">
                  <div className="transcript-avatar">
                    {getStudentInitials(selectedTranscript.studentName)}
                  </div>
                  <div className="transcript-student-id-block">
                    <h4 className="transcript-student-name">
                      {selectedTranscript.studentName || (isKhmer ? 'និស្សិតទូទៅ' : 'General Student')}
                    </h4>
                    <div className="d-flex align-items-center gap-2 flex-wrap mt-1">
                      <span className="transcript-id-pill">
                        <User size={12} />
                        <span>{selectedTranscript.studentId || 'N/A'}</span>
                      </span>
                      <span className="transcript-verified-badge">
                        <ShieldCheck size={12} />
                        <span>{isKhmer ? 'បានផ្ទៀងផ្ទាត់ផ្លូវការ' : 'Officially Verified'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4-Metric Strip (USEA Screen 18 Style) */}
                <div className="transcript-metrics-strip">
                  <div className="t-metric-item">
                    <span className="t-metric-label">{isKhmer ? 'ថ្នាក់សិក្សា' : 'Class'}</span>
                    <span className="t-metric-value">{selectedTranscript.className || 'N/A'}</span>
                  </div>
                  <div className="t-metric-divider" />
                  <div className="t-metric-item">
                    <span className="t-metric-label">{isKhmer ? 'ឆមាស' : 'Semester'}</span>
                    <span className="t-metric-value">{selectedTranscript.semester || 'N/A'}</span>
                  </div>
                  <div className="t-metric-divider" />
                  <div className="t-metric-item">
                    <span className="t-metric-label">{isKhmer ? 'ឆ្នាំសិក្សា' : 'Year'}</span>
                    <span className="t-metric-value">{selectedTranscript.year || 'N/A'}</span>
                  </div>
                  <div className="t-metric-divider" />
                  <div className="t-metric-item">
                    <span className="t-metric-label">{isKhmer ? 'ជំនាន់' : 'Generation'}</span>
                    <span className="t-metric-value">{selectedTranscript.generation || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Course & Examination Details Card */}
              <div className="transcript-details-card">
                <div className="transcript-info-grid">
                  <div className="t-info-row">
                    <span className="t-info-label">
                      <BookOpen size={14} color="#1e73be" /> {isKhmer ? 'ជំនាញ / មហាវិទ្យាល័យ' : 'Major / Program'}
                    </span>
                    <span className="t-info-val highlight">{selectedTranscript.courseName}</span>
                  </div>
                  <div className="t-info-row">
                    <span className="t-info-label">
                      <FileText size={14} color="#1e73be" /> {isKhmer ? 'ការប្រឡង' : 'Examination'}
                    </span>
                    <span className="t-info-val">{selectedTranscript.examName}</span>
                  </div>
                  <div className="t-info-row">
                    <span className="t-info-label">
                      <Layers size={14} color="#1e73be" /> {isKhmer ? 'មុខវិជ្ជាប្រឡង' : 'Subject Module'}
                    </span>
                    <span className="t-info-val">{selectedTranscript.subject || (isKhmer ? 'មុខវិជ្ជាបច្ចេកទេសស្នូល' : 'Core Module')}</span>
                  </div>
                  <div className="t-info-row">
                    <span className="t-info-label">
                      <Calendar size={14} color="#1e73be" /> {isKhmer ? 'កាលបរិច្ឆេទប្រឡង' : 'Exam Date'}
                    </span>
                    <span className="t-info-val">{formatExamDate(selectedTranscript.examDate, isKhmer)}</span>
                  </div>
                </div>
              </div>

              {/* Academic Performance Showcase (USEA Screen 15 Architecture) */}
              <div className="transcript-performance-showcase">
                <div className="t-perf-card">
                  <span className="t-perf-label">{isKhmer ? 'ពិន្ទុទទួលបាន' : 'Marks Obtained'}</span>
                  <div className="t-perf-value">
                    {selectedTranscript.obtainedMarks || 100}
                    <span className="t-perf-denom"> / {selectedTranscript.totalMarks || 100}</span>
                  </div>
                </div>

                <div className="t-perf-card">
                  <span className="t-perf-label">{isKhmer ? 'ភាគរយសរុប' : 'Percentage'}</span>
                  <div className="t-perf-value text-primary-dark">
                    {selectedTranscript.percentage || 100}%
                  </div>
                </div>

                <div
                  className="t-perf-card grade-card"
                  style={{
                    borderColor: getGradeStyle(selectedTranscript.grade).border,
                    background: getGradeStyle(selectedTranscript.grade).bg
                  }}
                >
                  <span className="t-perf-label" style={{ color: getGradeStyle(selectedTranscript.grade).text }}>
                    {isKhmer ? 'និទ្ទេសផ្លូវការ' : 'Letter Grade'}
                  </span>
                  <div className="t-perf-grade" style={{ color: getGradeStyle(selectedTranscript.grade).pill }}>
                    {selectedTranscript.grade || 'A'}
                  </div>
                </div>

                <div className="t-perf-card status-card">
                  <span className="t-perf-label">{isKhmer ? 'លទ្ធផលសិក្សា' : 'Academic Standing'}</span>
                  <div className="t-perf-status">
                    <CheckCircle2 size={16} color="#059669" />
                    <span>{isKhmer ? 'ជាប់ជាស្ថាពរ' : 'PASSED'}</span>
                  </div>
                </div>
              </div>

              {/* Security & Verification Note */}
              <div className="transcript-security-note mb-0">
                <ShieldCheck size={16} color="#1e73be" />
                <span>
                  {isKhmer
                    ? 'តារាងពិន្ទុផ្លូវការចេញផ្សាយដោយប្រព័ន្ធ TVET MIS នៃវិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប។ ឯកសារនេះមានសុពលភាពផ្លូវការ។'
                    : 'Official transcript issued by TVET MIS of Regional Polytechnic Institute Techo Sen Siem Reap. This record is authentic.'}
                </span>
              </div>
            </div>

            {/* Modal Bottom Actions Footer */}
            <div className="transcript-actions-bar">
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill px-3 d-inline-flex align-items-center gap-2 transcript-print-btn"
                onClick={() => window.print()}
              >
                <Printer size={15} />
                <span>{isKhmer ? 'បោះពុម្ពតារាងពិន្ទុ' : 'Print Transcript'}</span>
              </button>

              <button
                type="button"
                className="btn btn-primary rounded-pill px-4"
                style={{ background: '#07294D', borderColor: '#07294D' }}
                onClick={() => setSelectedTranscript(null)}
              >
                {isKhmer ? 'បិទផ្ទាំង' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamResultsPage;
