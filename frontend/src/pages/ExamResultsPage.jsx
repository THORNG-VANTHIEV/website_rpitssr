import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import client from '../api/client';

export const ExamResultsPage = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [filters, setFilters] = useState({
    courseName: '',
    semester: '',
    generation: '',
    year: '',
    examName: '',
    searchTerm: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    semesters: [],
    generations: [],
    years: [],
    examNames: []
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await client.get('/courses');
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setCourses(data);
      } catch (err) {
        console.error('Failed to load courses:', err);
      }
    })();
  }, []);

  const loadExamResults = async () => {
    setLoading(true);
    try {
      const res = await client.get(`/exam-results?t=${Date.now()}`);
      const data = res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : [];
      setExamResults(list);
      setFilteredResults(list);

      const s = [...new Set(list.map((e) => e.semester).filter(Boolean))].sort();
      const g = [...new Set(list.map((e) => e.generation).filter(Boolean))].sort();
      const y = [...new Set(list.map((e) => e.year).filter(Boolean))].sort();
      const n = [...new Set(list.map((e) => e.examName).filter(Boolean))].sort();

      setFilterOptions({
        semesters: s,
        generations: g,
        years: y,
        examNames: n
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

  useEffect(() => {
    let list = [...examResults];
    if (filters.courseName) {
      list = list.filter(
        (e) =>
          e.courseName &&
          e.courseName.toLowerCase().includes(filters.courseName.toLowerCase())
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
    if (filters.examName) {
      list = list.filter(
        (e) =>
          e.examName &&
          e.examName.toLowerCase().includes(filters.examName.toLowerCase())
      );
    }
    if (filters.searchTerm) {
      const s = filters.searchTerm.toLowerCase();
      list = list.filter(
        (e) =>
          (e.courseName && e.courseName.toLowerCase().includes(s)) ||
          (e.examName && e.examName.toLowerCase().includes(s)) ||
          (e.semester && e.semester.toLowerCase().includes(s)) ||
          (e.generation && e.generation.toLowerCase().includes(s)) ||
          (e.year && e.year.toLowerCase().includes(s)) ||
          (e.studentName && e.studentName.toLowerCase().includes(s)) ||
          (e.studentId && e.studentId.toLowerCase().includes(s))
      );
    }
    setFilteredResults(list);
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
      examName: '',
      searchTerm: ''
    });
  };

  const getFileUrl = (url) => {
    if (!url) return null;
    const clean = url.replace(/\\/g, '/');
    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
    return clean.startsWith('/') ? clean : `/${clean}`;
  };

  return (
    <div className="exam-results-front">
      {/* Page Banner with Purple/Blue Gradient */}
      <section className="page-banner">
        <div
          className="page-banner-bg bg_cover"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            height: '300px',
            minHeight: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          <div className="container">
            <div className="banner-content text-center">
              <h2 className="title text-white display-4 fw-bold">
                {t('examResult.title')}
              </h2>
              <p className="text-white mt-3 fs-5">
                {t('examResult.searchResults')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Content Area */}
      <section className="exam-results-area py-5" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container">
          {/* Search Card */}
          <div className="row mb-4">
            <div className="col-lg-12">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <h5 className="card-title mb-4 text-primary">
                    <i className="fas fa-search me-2"></i>
                    {t('examResult.searchExamResults')}
                  </h5>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        {t('common.search')}
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        placeholder={t('examResult.searchPlaceholderLong')}
                        value={filters.searchTerm}
                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        {t('examResult.course')}
                      </label>
                      <select
                        className="form-select form-select-lg"
                        value={filters.courseName}
                        onChange={(e) => handleFilterChange('courseName', e.target.value)}
                      >
                        <option value="">{t('examResult.allCourses')}</option>
                        {courses.map((c) => (
                          <option key={c.id || c.title} value={c.title}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mt-2">
                    <div className="col-md-3">
                      <label className="form-label fw-semibold">
                        {t('examResult.semester')}
                      </label>
                      <select
                        className="form-select"
                        value={filters.semester}
                        onChange={(e) => handleFilterChange('semester', e.target.value)}
                      >
                        <option value="">{t('examResult.allSemesters')}</option>
                        {filterOptions.semesters.map((s) => (
                          <option key={s} value={s}>
                            {t('examResult.semester')} {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label fw-semibold">
                        {t('examResult.generation')}
                      </label>
                      <select
                        className="form-select"
                        value={filters.generation}
                        onChange={(e) => handleFilterChange('generation', e.target.value)}
                      >
                        <option value="">{t('examResult.allGenerations')}</option>
                        {filterOptions.generations.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label fw-semibold">
                        {t('examResult.year')}
                      </label>
                      <select
                        className="form-select"
                        value={filters.year}
                        onChange={(e) => handleFilterChange('year', e.target.value)}
                      >
                        <option value="">{t('examResult.allYears')}</option>
                        {filterOptions.years.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label fw-semibold">
                        {t('examResult.action')}
                      </label>
                      <button
                        type="button"
                        className="btn btn-outline-secondary w-100"
                        onClick={handleClearFilters}
                      >
                        <i className="fas fa-times me-2"></i>
                        {t('examResult.clearFilters')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary Bar */}
          {!loading && (
            <div className="row mb-4">
              <div className="col-lg-12">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="text-muted mb-0">
                    {t('examResult.showingResults', {
                      filtered: filteredResults.length,
                      total: examResults.length
                    })}
                  </h6>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={loadExamResults}
                  >
                    <i className="fas fa-sync-alt me-1"></i>
                    {t('examResult.refresh')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Grid / Empty / Loading */}
          <div className="row">
            <div className="col-lg-12">
              {loading ? (
                <div className="row g-4">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="col-lg-6 col-md-12">
                      <div
                        style={{
                          border: '1px solid #f0f0f0',
                          borderRadius: '8px',
                          padding: '20px',
                          marginBottom: '20px',
                          backgroundColor: '#fff'
                        }}
                      >
                        <div
                          className="skeleton-box"
                          style={{ height: '200px', marginBottom: '15px' }}
                        />
                        <div
                          className="skeleton-box"
                          style={{ height: '24px', width: '80%', marginBottom: '10px' }}
                        />
                        <div
                          className="skeleton-box"
                          style={{ height: '16px', width: '100%', marginBottom: '8px' }}
                        />
                        <div
                          className="skeleton-box"
                          style={{ height: '16px', width: '90%', marginBottom: '8px' }}
                        />
                        <div
                          className="skeleton-box"
                          style={{ height: '40px', width: '120px', marginTop: '15px' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-4">
                    <i className="fas fa-search fa-4x text-muted opacity-50"></i>
                  </div>
                  <h4 className="text-muted mb-3">{t('examResult.noResults')}</h4>
                  <p className="text-muted mb-4">{t('examResult.noResultsMessage')}</p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleClearFilters}
                  >
                    <i className="fas fa-times me-2"></i>
                    {t('examResult.clearAllFilters')}
                  </button>
                </div>
              ) : (
                <div className="row g-4">
                  {filteredResults.map((result, idx) => (
                    <div key={result.id || idx} className="col-lg-6 col-md-12">
                      <div className="card exam-result-card h-100 border-0 shadow-sm">
                        <div className="card-body p-4">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <h5 className="card-title text-primary mb-0 fw-bold">
                              {result.courseName}
                            </h5>
                            <span className="badge bg-success rounded-pill">
                              <i className="fas fa-eye me-1"></i>
                              {t('examResult.published')}
                            </span>
                          </div>

                          <div className="exam-details mb-4 p-3 bg-light rounded">
                            <div className="row g-3">
                              <div className="col-6">
                                <small className="text-muted d-block">
                                  {t('examResult.examName')}
                                </small>
                                <div className="fw-semibold">{result.examName}</div>
                              </div>
                              <div className="col-6">
                                <small className="text-muted d-block">
                                  {t('examResult.semester')}
                                </small>
                                <div className="fw-semibold">
                                  {result.semester || 'N/A'}
                                </div>
                              </div>
                              <div className="col-6">
                                <small className="text-muted d-block">
                                  {t('examResult.generation')}
                                </small>
                                <div className="fw-semibold">
                                  {result.generation || 'N/A'}
                                </div>
                              </div>
                              <div className="col-6">
                                <small className="text-muted d-block">
                                  {t('examResult.year')}
                                </small>
                                <div className="fw-semibold">
                                  {result.year || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="exam-files">
                            <div className="d-flex gap-2 flex-wrap">
                              {result.resultImageUrl && (
                                <a
                                  href={getFileUrl(result.resultImageUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-info btn-sm flex-fill text-white"
                                >
                                  <i className="fas fa-image me-1"></i>
                                  {t('examResult.viewImage')}
                                </a>
                              )}
                              {result.resultPdfUrl && (
                                <a
                                  href={getFileUrl(result.resultPdfUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-danger btn-sm flex-fill text-white"
                                >
                                  <i className="fas fa-file-pdf me-1"></i>
                                  {t('examResult.viewPDF')}
                                </a>
                              )}
                              {!result.resultImageUrl && !result.resultPdfUrl && (
                                <span className="badge bg-secondary p-2 w-100 text-center">
                                  <i className="fas fa-info-circle me-1"></i>
                                  {t('examResult.noFilesAvailable')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Component Styles Matching Chunk 649 */}
      <style>{`
        .exam-result-card {
          transition: all 0.3s ease;
          border-radius: 15px !important;
        }

        .exam-result-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1) !important;
        }

        .page-banner-bg::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
        }

        .page-banner .container {
          position: relative;
          z-index: 2;
        }

        .form-control:focus, .form-select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }

        .btn-info {
          background: linear-gradient(135deg, #17a2b8, #138496);
          border: none;
          color: white;
        }

        .btn-info:hover {
          background: linear-gradient(135deg, #138496, #0f6674);
          transform: translateY(-1px);
          color: white;
        }

        .btn-danger {
          background: linear-gradient(135deg, #dc3545, #c82333);
          border: none;
          color: white;
        }

        .btn-danger:hover {
          background: linear-gradient(135deg, #c82333, #a71e2a);
          transform: translateY(-1px);
          color: white;
        }

        .skeleton-box {
          background-color: #e0e0e0;
          border-radius: 4px;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        @keyframes skeleton-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @media (max-width: 768px) {
          .exam-result-card {
            margin-bottom: 20px;
          }

          .btn-sm {
            padding: 6px 12px;
            font-size: 0.875rem;
          }

          .display-4 {
            font-size: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ExamResultsPage;
