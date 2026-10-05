import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Filter,
  Download,
  ExternalLink,
  Info,
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  User,
  Hash,
  Bookmark,
  ChevronRight,
  BookMarked,
  Layers,
  Sparkles,
  ArrowRight,
  X,
  FileText,
  ShieldCheck,
  GraduationCap,
  Building,
  Globe
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import client from '../api/client';

export const LibraryPage = () => {
  const { t, currentLanguage } = useLanguage();
  const isKhmer = currentLanguage === 'km';

  // State Management
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // all, available, ebook
  const [sortBy, setSortBy] = useState('newest');

  // Selected Book for Modal Details
  const [selectedBook, setSelectedBook] = useState(null);

  // Load Book Categories
  useEffect(() => {
    let isMounted = true;
    setCategoriesLoading(true);

    client.get('/book-categories')
      .then(res => {
        if (!isMounted) return;
        const data = res.data?.data || res.data || [];
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Failed to load book categories:', err);
      })
      .finally(() => {
        if (isMounted) setCategoriesLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Load Books Catalog
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const params = {
      limit: 100,
      sort_by: sortBy,
    };

    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }
    if (selectedCategory && selectedCategory !== 'all') {
      params.category_id = selectedCategory;
    }
    if (availabilityFilter && availabilityFilter !== 'all') {
      params.availability = availabilityFilter;
    }

    client.get('/books', { params })
      .then(res => {
        if (!isMounted) return;
        const data = res.data?.data || res.data || [];
        setBooks(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Failed to load library books:', err);
        setError(isKhmer ? 'មិនអាចទាញយកទិន្នន័យសៀវភៅបណ្ណាល័យបានទេ' : 'Failed to load books catalog.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [searchQuery, selectedCategory, availabilityFilter, sortBy, isKhmer]);

  // Compute Total Metrics
  const stats = useMemo(() => {
    const totalCount = books.length;
    const ebookCount = books.filter(b => b.is_ebook || b.file_url).length;
    const availableCount = books.filter(b => (b.available_copies || 0) > 0).length;
    return { totalCount, ebookCount, availableCount };
  }, [books]);

  // Format Helper
  const getBookTitle = (book) => {
    if (!book) return '';
    if (isKhmer) {
      return book.title_km || book.title_en || 'សៀវភៅបច្ចេកទេស';
    }
    return book.title_en || book.title_km || 'Technical Book';
  };

  const getCategoryName = (category) => {
    if (!category) return isKhmer ? 'ទូទៅ' : 'General';
    return isKhmer ? (category.name_km || category.name_en) : (category.name_en || category.name_km);
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* 1. INSTITUTIONAL DAYLIGHT HERO (AGENTS.md Compliant) */}
      <section className="gallery-page-hero" style={{ padding: '52px 0 42px' }}>
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-10">
              {/* Breadcrumb & Official Badge */}
              <div className="gallery-hero-meta-row">
                <div className="gallery-breadcrumb">
                  <Link to="/">
                    <i className="fas fa-home me-1"></i>
                    {isKhmer ? 'ទំព័រដើម' : 'Home'}
                  </Link>
                  <i className="fas fa-chevron-right text-muted" style={{ fontSize: '0.72rem' }}></i>
                  <span>{isKhmer ? 'បណ្ណាល័យអេឡិចត្រូនិក' : 'E-Library'}</span>
                </div>
                <div className="gallery-hero-badge">
                  <i className="fas fa-book-reader text-primary"></i>
                  <span>{isKhmer ? 'មជ្ឈមណ្ឌលធនធានបណ្ណាល័យឌីជីថល' : 'Digital Library Resource Center'}</span>
                </div>
              </div>

              {/* Main Institutional Title */}
              <h1 className="gallery-hero-title" style={{ fontSize: 'clamp(1.85rem, 3.4vw, 2.5rem)', marginBottom: '16px' }}>
                {isKhmer ? 'បណ្ណាល័យ និងកាតាឡុកសៀវភៅឌីជីថល RPITSSR' : 'RPITSSR Digital Library & Book Catalog'}
              </h1>

              {/* Subtitle */}
              <p className="gallery-hero-subtitle" style={{ marginBottom: '24px' }}>
                {isKhmer
                  ? 'ស្វែងរកកាតាឡុកសៀវភៅបច្ចេកទេស កម្រងឯកសារស្រាវជ្រាវ TVET សៀវភៅណែនាំមន្ទីរពិសោធន៍ និងទាញយកសៀវភៅអេឡិចត្រូនិក (E-Books) ដោយឥតគិតថ្លៃសម្រាប់សិស្ស-និស្សិត និងសាធារណជន'
                  : 'Search physical technical books, explore accredited TVET research curricula, access workshop manuals, and read or download official open-access E-Books.'}
              </p>

              {/* Institutional Trust Badges */}
              <div className="gallery-trust-pills">
                <div className="gallery-trust-pill">
                  <i className="fas fa-shield-alt text-primary"></i>
                  <span>{isKhmer ? 'សៀវភៅស្តង់ដារគុណភាព TVET' : 'Accredited TVET Curricula'}</span>
                </div>
                <div className="gallery-trust-pill">
                  <i className="fas fa-file-pdf text-danger"></i>
                  <span>{isKhmer ? 'សៀវភៅអេឡិចត្រូនិក (E-Books/PDF)' : 'Free Digital E-Books'}</span>
                </div>
                <div className="gallery-trust-pill">
                  <i className="fas fa-graduation-cap text-success"></i>
                  <span>{isKhmer ? 'សេវាកម្មខ្ចី-អានសម្រាប់និស្សិត' : 'Student Circulation Access'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DEDICATED METRICS COUNTER STRIP */}
      <section className="py-4" style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
        <div className="container" style={{ maxWidth: '1240px' }}>
          <div className="row g-3 text-center">
            <div className="col-6 col-md-3">
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  boxShadow: '0 2px 8px rgba(7, 41, 77, 0.03)'
                }}
              >
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#07294D' }}>
                  {books.length}+
                </div>
                <div style={{ fontSize: '0.86rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
                  {isKhmer ? 'ចំណងជើងសៀវភៅសរុប' : 'Total Book Titles'}
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  boxShadow: '0 2px 8px rgba(7, 41, 77, 0.03)'
                }}
              >
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e73be' }}>
                  {categories.length || 6}
                </div>
                <div style={{ fontSize: '0.86rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
                  {isKhmer ? 'ផ្នែកជំនាញបច្ចេកទេស' : 'Technical Fields'}
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  boxShadow: '0 2px 8px rgba(7, 41, 77, 0.03)'
                }}
              >
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669' }}>
                  {stats.availableCount}+
                </div>
                <div style={{ fontSize: '0.86rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
                  {isKhmer ? 'សៀវភៅអាចខ្ចីបាន' : 'Available for Loan'}
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  boxShadow: '0 2px 8px rgba(7, 41, 77, 0.03)'
                }}
              >
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706' }}>
                  {stats.ebookCount > 0 ? stats.ebookCount : '100%'}
                </div>
                <div style={{ fontSize: '0.86rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
                  {isKhmer ? 'សៀវភៅ E-Book ឥតគិតថ្លៃ' : 'Free Digital E-Books'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN CATALOG INTERACTIVE SECTION */}
      <section className="library-catalog-area py-5" style={{ backgroundColor: '#f8fafc', minHeight: '600px' }}>
        <div className="container" style={{ maxWidth: '1240px' }}>
          
          {/* Search & Filter Toolbar */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '24px 28px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
              marginBottom: '32px'
            }}
          >
            <div className="row g-3 align-items-center">
              {/* Search Input */}
              <div className="col-lg-5 col-md-6">
                <div style={{ position: 'relative' }}>
                  <Search
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8'
                    }}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      isKhmer
                        ? 'ស្វែងរកចំណងជើងសៀវភៅ អ្នកនិពន្ធ លេខកូដ ISBN ឬទីតាំងធ្នើ...'
                        : 'Search by book title, author, ISBN, or shelf location...'
                    }
                    style={{
                      width: '100%',
                      padding: '11px 40px 11px 44px',
                      borderRadius: '50px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.92rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                      backgroundColor: '#f8fafc'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1e73be';
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 3px rgba(30, 115, 190, 0.12)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#cbd5e1';
                      e.target.style.backgroundColor = '#f8fafc';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: 0
                      }}
                      title="Clear search"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Availability Filter Tabs */}
              <div className="col-lg-4 col-md-6">
                <div
                  style={{
                    display: 'flex',
                    background: '#f1f5f9',
                    borderRadius: '50px',
                    padding: '4px',
                    gap: '4px'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setAvailabilityFilter('all')}
                    style={{
                      flex: 1,
                      border: 'none',
                      background: availabilityFilter === 'all' ? '#ffffff' : 'transparent',
                      color: availabilityFilter === 'all' ? '#07294D' : '#64748b',
                      fontWeight: availabilityFilter === 'all' ? 700 : 500,
                      borderRadius: '50px',
                      padding: '8px 12px',
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      boxShadow: availabilityFilter === 'all' ? '0 2px 6px rgba(7,41,77,0.06)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isKhmer ? 'សៀវភៅទាំងអស់' : 'All Books'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvailabilityFilter('ebook')}
                    style={{
                      flex: 1,
                      border: 'none',
                      background: availabilityFilter === 'ebook' ? '#ffffff' : 'transparent',
                      color: availabilityFilter === 'ebook' ? '#1e73be' : '#64748b',
                      fontWeight: availabilityFilter === 'ebook' ? 700 : 500,
                      borderRadius: '50px',
                      padding: '8px 12px',
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      boxShadow: availabilityFilter === 'ebook' ? '0 2px 6px rgba(7,41,77,0.06)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <BookOpen size={14} />
                    <span>{isKhmer ? 'E-Books' : 'E-Books'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvailabilityFilter('available')}
                    style={{
                      flex: 1,
                      border: 'none',
                      background: availabilityFilter === 'available' ? '#ffffff' : 'transparent',
                      color: availabilityFilter === 'available' ? '#059669' : '#64748b',
                      fontWeight: availabilityFilter === 'available' ? 700 : 500,
                      borderRadius: '50px',
                      padding: '8px 12px',
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      boxShadow: availabilityFilter === 'available' ? '0 2px 6px rgba(7,41,77,0.06)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <CheckCircle size={14} />
                    <span>{isKhmer ? 'អាចខ្ចីបាន' : 'In Stock'}</span>
                  </button>
                </div>
              </div>

              {/* Sort By Dropdown */}
              <div className="col-lg-3 col-md-12 text-lg-end">
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.84rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {isKhmer ? 'តម្រៀបតាម:' : 'Sort By:'}
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '50px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#07294D',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="newest">{isKhmer ? 'ចុងក្រោយបង្អស់' : 'Newest'}</option>
                    <option value="title_asc">{isKhmer ? 'តាមចំណងជើង (A-Z)' : 'Title (A-Z)'}</option>
                    <option value="available_desc">{isKhmer ? 'សៀវភៅនៅសល់ច្រើន' : 'Most Copies Available'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px dashed #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600, marginRight: '4px' }}>
                  {isKhmer ? 'ផ្នែក / ជំនាញ:' : 'Departments:'}
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  style={{
                    border: selectedCategory === 'all' ? '1px solid #1e73be' : '1px solid #e2e8f0',
                    background: selectedCategory === 'all' ? '#eff6ff' : '#ffffff',
                    color: selectedCategory === 'all' ? '#1e73be' : '#475569',
                    fontWeight: selectedCategory === 'all' ? 700 : 500,
                    borderRadius: '50px',
                    padding: '6px 16px',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isKhmer ? 'ទាំងអស់' : 'All Fields'} ({books.length})
                </button>

                {categories.map((cat) => {
                  const isSelected = String(selectedCategory) === String(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(String(cat.id))}
                      style={{
                        border: isSelected ? '1px solid #1e73be' : '1px solid #e2e8f0',
                        background: isSelected ? '#eff6ff' : '#ffffff',
                        color: isSelected ? '#1e73be' : '#475569',
                        fontWeight: isSelected ? 700 : 500,
                        borderRadius: '50px',
                        padding: '6px 16px',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>{getCategoryName(cat)}</span>
                      {cat.books_count !== undefined && (
                        <span
                          style={{
                            background: isSelected ? '#1e73be' : '#f1f5f9',
                            color: isSelected ? '#ffffff' : '#64748b',
                            borderRadius: '50px',
                            padding: '1px 7px',
                            fontSize: '0.72rem',
                            fontWeight: 700
                          }}
                        >
                          {cat.books_count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Books Grid Area */}
          {loading ? (
            <div className="text-center py-5">
              <div
                style={{
                  border: '4px solid #f3f4f6',
                  borderTop: '4px solid #07294D',
                  borderRadius: '50%',
                  width: '45px',
                  height: '45px',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px'
                }}
              />
              <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                {isKhmer ? 'កំពុងទាញយកទិន្នន័យកាតាឡុកសៀវភៅ...' : 'Loading library catalog...'}
              </p>
            </div>
          ) : error ? (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '16px',
                padding: '30px',
                textAlign: 'center',
                color: '#991b1b'
              }}
            >
              <Info size={32} style={{ marginBottom: '10px' }} />
              <p style={{ margin: 0, fontWeight: 600 }}>{error}</p>
            </div>
          ) : books.length === 0 ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '60px 20px',
                textAlign: 'center',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  color: '#94a3b8',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}
              >
                <BookOpen size={30} />
              </div>
              <h3 style={{ color: '#07294D', fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>
                {isKhmer ? 'មិនមានសៀវភៅត្រូវនឹងលក្ខខណ្ឌស្វែងរកឡើយ' : 'No books found'}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.92rem', maxWidth: '480px', margin: '0 auto 20px' }}>
                {isKhmer
                  ? 'សូមព្យាយាមផ្លាស់ប្តូរពាក្យគន្លឹះ ឬជ្រើសរើសផ្នែកជំនាញផ្សេងទៀតដើម្បីស្វែងរក។'
                  : 'Try adjusting your search criteria or clear your filters to view more books.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setAvailabilityFilter('all');
                }}
                style={{
                  background: '#07294D',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '50px',
                  padding: '9px 22px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {isKhmer ? 'សម្អាតតម្រងទាំងអស់' : 'Clear All Filters'}
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {books.map((book) => {
                const isAvailable = (book.available_copies || 0) > 0;
                const hasEbook = book.is_ebook || !!book.file_url;

                return (
                  <div key={book.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '20px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
                        overflow: 'hidden',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.boxShadow = '0 16px 36px rgba(7, 41, 77, 0.09)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.boxShadow = '0 4px 18px rgba(7, 41, 77, 0.04)';
                      }}
                    >
                      {/* Top Accent Tricolor Line */}
                      <div
                        style={{
                          height: '4px',
                          background: 'linear-gradient(90deg, #07294D, #1e73be, #ffaf00)'
                        }}
                      />

                      {/* Cover & Badges */}
                      <div
                        style={{
                          position: 'relative',
                          height: '220px',
                          backgroundColor: '#f1f5f9',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {book.cover_image ? (
                          <img
                            src={book.cover_image}
                            alt={getBookTitle(book)}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : null}

                        {/* Fallback Graphic Cover if no image or error */}
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)',
                            color: '#ffffff',
                            padding: '20px',
                            textAlign: 'center',
                            zIndex: book.cover_image ? 0 : 1
                          }}
                        >
                          <BookOpen size={42} style={{ opacity: 0.85, marginBottom: '10px' }} />
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.3 }}>
                            {getBookTitle(book)}
                          </div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '6px' }}>
                            {book.author || 'RPITSSR TVET'}
                          </div>
                        </div>

                        {/* Badges Over Cover */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            zIndex: 2
                          }}
                        >
                          {hasEbook && (
                            <span
                              style={{
                                background: 'rgba(239, 68, 68, 0.95)',
                                color: '#ffffff',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                borderRadius: '50px',
                                padding: '3px 10px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                backdropFilter: 'blur(4px)',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                              }}
                            >
                              <FileText size={12} />
                              E-Book
                            </span>
                          )}

                          {book.category && (
                            <span
                              style={{
                                background: 'rgba(7, 41, 77, 0.88)',
                                color: '#ffffff',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                borderRadius: '50px',
                                padding: '3px 10px',
                                backdropFilter: 'blur(4px)'
                              }}
                            >
                              {getCategoryName(book.category)}
                            </span>
                          )}
                        </div>

                        {/* Shelf Tag */}
                        {book.shelf_location && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '12px',
                              right: '12px',
                              background: 'rgba(255, 255, 255, 0.94)',
                              color: '#07294D',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              borderRadius: '6px',
                              padding: '3px 8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                              zIndex: 2
                            }}
                          >
                            <MapPin size={11} color="#1e73be" />
                            <span>{book.shelf_location}</span>
                          </div>
                        )}
                      </div>

                      {/* Content Area */}
                      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Title */}
                        <h4
                          style={{
                            color: '#07294D',
                            fontSize: '1.05rem',
                            fontWeight: 700,
                            lineHeight: 1.45,
                            marginBottom: '8px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            height: '46px',
                            cursor: 'pointer'
                          }}
                          onClick={() => setSelectedBook(book)}
                          title={getBookTitle(book)}
                        >
                          {getBookTitle(book)}
                        </h4>

                        {/* Author */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: '#64748b',
                            fontSize: '0.84rem',
                            marginBottom: '14px'
                          }}
                        >
                          <User size={14} color="#94a3b8" />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {book.author || (isKhmer ? 'សាស្រ្តាចារ្យ TVET' : 'TVET Faculty')}
                          </span>
                        </div>

                        {/* Metadata Strip */}
                        <div
                          style={{
                            background: '#f8fafc',
                            borderRadius: '10px',
                            padding: '10px 12px',
                            border: '1px solid #f1f5f9',
                            fontSize: '0.78rem',
                            color: '#475569',
                            marginBottom: '16px',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '6px'
                          }}
                        >
                          <div>
                            <span style={{ color: '#94a3b8' }}>{isKhmer ? 'ឆ្នាំ:' : 'Year:'} </span>
                            <strong>{book.publish_year || 'N/A'}</strong>
                          </div>
                          <div>
                            <span style={{ color: '#94a3b8' }}>{isKhmer ? 'ភាសា:' : 'Lang:'} </span>
                            <strong>{book.language === 'km' ? 'ខ្មែរ (KM)' : 'English (EN)'}</strong>
                          </div>
                          <div style={{ gridColumn: 'span 2' }}>
                            <span style={{ color: '#94a3b8' }}>{isKhmer ? 'ស្ថានភាព:' : 'Status:'} </span>
                            {isAvailable ? (
                              <span style={{ color: '#059669', fontWeight: 700 }}>
                                {isKhmer
                                  ? `មាន ${book.available_copies}/${book.total_copies || book.available_copies} ក្បាល`
                                  : `${book.available_copies}/${book.total_copies || book.available_copies} Available`}
                              </span>
                            ) : (
                              <span style={{ color: '#dc2626', fontWeight: 600 }}>
                                {isKhmer ? 'បានខ្ចីអស់' : 'Borrowed Out'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedBook(book)}
                            style={{
                              flex: 1,
                              background: '#eff6ff',
                              color: '#1e73be',
                              border: '1px solid #dbeafe',
                              borderRadius: '50px',
                              padding: '8px 12px',
                              fontSize: '0.84rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#1e73be';
                              e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#eff6ff';
                              e.currentTarget.style.color = '#1e73be';
                            }}
                          >
                            <Info size={14} />
                            <span>{isKhmer ? 'ព័ត៌មានលម្អិត' : 'Details'}</span>
                          </button>

                          {hasEbook && book.file_url ? (
                            <a
                              href={book.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                background: '#fef2f2',
                                color: '#dc2626',
                                border: '1px solid #fee2e2',
                                borderRadius: '50px',
                                padding: '8px 14px',
                                fontSize: '0.84rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.2s ease'
                              }}
                              title={isKhmer ? 'អាន ឬទាញយកសៀវភៅអេឡិចត្រូនិក' : 'Read/Download E-Book'}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#dc2626';
                                e.currentTarget.style.color = '#ffffff';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#fef2f2';
                                e.currentTarget.style.color = '#dc2626';
                              }}
                            >
                              <BookOpen size={14} />
                              <span>{isKhmer ? 'E-Book' : 'PDF'}</span>
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 4. STUDENT BORROWING ADVISORY BANNER */}
          <div
            style={{
              marginTop: '50px',
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
              padding: '32px 36px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div className="row align-items-center">
              <div className="col-lg-8 col-md-7">
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#1e73be', fontWeight: 700, fontSize: '0.88rem', marginBottom: '8px' }}>
                  <GraduationCap size={18} />
                  <span>{isKhmer ? 'សេវាកម្មខ្ចីសៀវភៅសម្រាប់និស្សិត RPITSSR' : 'Student Library Circulation Services'}</span>
                </div>
                <h3 style={{ color: '#07294D', fontSize: '1.45rem', fontWeight: 800, marginBottom: '10px' }}>
                  {isKhmer
                    ? 'តើលោកអ្នកជានិស្សិតកំពុងសិក្សានៅ RPITSSR មែនទេ?'
                    : 'Are you an active student at RPITSSR?'}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.94rem', lineHeight: 1.6, margin: 0 }}>
                  {isKhmer
                    ? 'និស្សិតអាចខ្ចីសៀវភៅសិក្សាបានរហូតដល់ ២-៣ ក្បាលក្នុងមួយលើក តាមរយៈការបង្ហាញកាតនិស្សិតនៅបណ្ណាល័យ ឬពិនិត្យកាលបរិច្ឆេទសង និងស្នើសុំពន្យារពេលដោយស្វ័យប្រវត្តិតាមរយៈ Student Dashboard។'
                    : 'Registered students may borrow up to 3 technical volumes concurrently by presenting their student ID card, and manage renewals directly inside the Student Dashboard.'}
                </p>
              </div>
              <div className="col-lg-4 col-md-5 text-md-end text-start mt-3 mt-md-0">
                <Link
                  to="/student-dashboard"
                  style={{
                    background: 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)',
                    color: '#ffffff',
                    fontWeight: 700,
                    borderRadius: '50px',
                    padding: '12px 26px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    fontSize: '0.92rem',
                    boxShadow: '0 4px 14px rgba(7, 41, 77, 0.2)'
                  }}
                >
                  <span>{isKhmer ? 'ចូលទៅកាន់ផ្ទាំងនិស្សិត' : 'Go to Student Portal'}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. BOOK DETAIL INSTITUTIONAL MODAL (Crisp Daylight Architecture) */}
      {selectedBook && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(7, 41, 77, 0.68)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: '20px'
          }}
          onClick={() => setSelectedBook(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              maxWidth: '840px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(7, 41, 77, 0.3)',
              position: 'relative',
              border: '1px solid #e2e8f0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Institutional Tricolor Accent Line */}
            <div
              style={{
                height: '4px',
                background: 'linear-gradient(90deg, #07294D 0%, #1e73be 50%, #ffaf00 100%)',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px'
              }}
            />

            {/* Modal Header */}
            <div
              style={{
                padding: '18px 26px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                background: '#ffffff',
                zIndex: 10
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: '#eff6ff',
                    color: '#1e73be',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #dbeafe',
                    flexShrink: 0
                  }}
                >
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4 style={{ color: '#07294D', fontWeight: 800, fontSize: '1.1rem', margin: 0, lineHeight: 1.3 }}>
                    {isKhmer ? 'ព័ត៌មានលម្អិតសៀវភៅបណ្ណាល័យ' : 'Book Details & Circulation Information'}
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {isKhmer ? 'កាតាឡុកសៀវភៅផ្លូវការ RPITSSR • ធនធានសិក្សា TVET' : 'RPITSSR Official Catalog • TVET Academic Resource'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBook(null)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fee2e2';
                  e.currentTarget.style.color = '#dc2626';
                  e.currentTarget.style.borderColor = '#fca5a5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.color = '#64748b';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 26px 22px' }}>
              <div className="row g-4">
                {/* Left Column: Book Silhouette & Circulation Stock Card */}
                <div className="col-md-4 text-center">
                  <div
                    style={{
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 8px 22px rgba(7, 41, 77, 0.09)',
                      backgroundColor: '#f8fafc',
                      height: '235px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}
                  >
                    {selectedBook.cover_image ? (
                      <img
                        src={selectedBook.cover_image}
                        alt={getBookTitle(selectedBook)}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          background: 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)',
                          color: '#ffffff',
                          padding: '20px 16px',
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <BookOpen size={42} style={{ opacity: 0.85, marginBottom: '10px' }} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, lineHeight: 1.4 }}>
                          {getBookTitle(selectedBook)}
                        </span>
                        <span style={{ fontSize: '0.72rem', opacity: 0.8, marginTop: '6px' }}>RPITSSR Library</span>
                      </div>
                    )}

                    {/* Book Left Spine Shadow Highlight */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        width: '14px',
                        background: 'linear-gradient(to right, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.03) 70%, transparent 100%)',
                        pointerEvents: 'none'
                      }}
                    />
                  </div>

                  {/* Stock Availability Card */}
                  <div style={{ marginTop: '12px' }}>
                    {(selectedBook.available_copies || 0) > 0 ? (
                      <div
                        style={{
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          borderRadius: '12px',
                          padding: '10px 12px',
                          textAlign: 'center'
                        }}
                      >
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: '#15803d',
                            fontWeight: 700,
                            fontSize: '0.86rem'
                          }}
                        >
                          <CheckCircle size={15} />
                          <span>
                            {isKhmer
                              ? `នៅសល់ ${selectedBook.available_copies} / ${selectedBook.total_copies || selectedBook.available_copies} ក្បាល`
                              : `${selectedBook.available_copies} of ${selectedBook.total_copies || selectedBook.available_copies} Available`}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#166534', marginTop: '2px', fontWeight: 500 }}>
                          {isKhmer ? 'អាចខ្ចី-អានបាននៅបណ្ណាល័យ' : 'Ready for Circulation Loan'}
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderRadius: '12px',
                          padding: '10px 12px',
                          textAlign: 'center'
                        }}
                      >
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: '#b91c1c',
                            fontWeight: 700,
                            fontSize: '0.86rem'
                          }}
                        >
                          <XCircle size={15} />
                          <span>{isKhmer ? 'សៀវភៅត្រូវបានខ្ចីអស់' : 'Currently Borrowed Out'}</span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#991b1b', marginTop: '2px', fontWeight: 500 }}>
                          {isKhmer ? 'សូមរង់ចាំការប្រគល់សងវិញ' : 'Please check back upon return'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Shelf Location Tile */}
                  {selectedBook.shelf_location && (
                    <div
                      style={{
                        marginTop: '10px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '9px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        textAlign: 'left'
                      }}
                    >
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '8px',
                          background: '#eff6ff',
                          color: '#1e73be',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <MapPin size={15} />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                          {isKhmer ? 'ទីតាំងធ្នើសៀវភៅ' : 'Shelf Location'}
                        </div>
                        <div
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: '#1e73be',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {selectedBook.shelf_location}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Title, Structured Spec Tiles & Actions */}
                <div className="col-md-8">
                  {/* Category & Format Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    {selectedBook.category && (
                      <span
                        style={{
                          background: '#eff6ff',
                          color: '#1e73be',
                          border: '1px solid #dbeafe',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          borderRadius: '50px',
                          padding: '3px 11px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <Bookmark size={11} />
                        {getCategoryName(selectedBook.category)}
                      </span>
                    )}

                    {selectedBook.is_ebook && (
                      <span
                        style={{
                          background: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fee2e2',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          borderRadius: '50px',
                          padding: '3px 11px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <FileText size={11} />
                        E-Book (PDF)
                      </span>
                    )}
                  </div>

                  {/* Main Title */}
                  <h3
                    style={{
                      color: '#07294D',
                      fontWeight: 800,
                      fontSize: '1.32rem',
                      lineHeight: 1.4,
                      marginBottom: '4px'
                    }}
                  >
                    {getBookTitle(selectedBook)}
                  </h3>

                  {/* Subtitle / English Title */}
                  {selectedBook.title_en && isKhmer && (
                    <div
                      style={{
                        color: '#64748b',
                        fontSize: '0.88rem',
                        marginBottom: '14px',
                        fontStyle: 'italic',
                        fontWeight: 500
                      }}
                    >
                      {selectedBook.title_en}
                    </div>
                  )}

                  {/* Structured Specifications Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                      gap: '8px',
                      marginBottom: '16px'
                    }}
                  >
                    {/* 1. Author */}
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '8px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: '#64748b',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontWeight: 600
                        }}
                      >
                        <User size={12} color="#94a3b8" />
                        {isKhmer ? 'អ្នកនិពន្ធ' : 'Author'}
                      </span>
                      <strong style={{ color: '#07294D', fontSize: '0.84rem', fontWeight: 700, lineHeight: 1.35 }}>
                        {selectedBook.author || 'N/A'}
                      </strong>
                    </div>

                    {/* 2. Department / Category */}
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '8px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: '#64748b',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontWeight: 600
                        }}
                      >
                        <Layers size={12} color="#94a3b8" />
                        {isKhmer ? 'ផ្នែកជំនាញ' : 'Category'}
                      </span>
                      <strong style={{ color: '#07294D', fontSize: '0.84rem', fontWeight: 700, lineHeight: 1.35 }}>
                        {getCategoryName(selectedBook.category)}
                      </strong>
                    </div>

                    {/* 3. ISBN */}
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '8px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: '#64748b',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontWeight: 600
                        }}
                      >
                        <Hash size={12} color="#94a3b8" />
                        {isKhmer ? 'លេខកូដ ISBN' : 'ISBN Code'}
                      </span>
                      <strong style={{ color: '#07294D', fontSize: '0.84rem', fontWeight: 700, fontFamily: 'monospace' }}>
                        {selectedBook.isbn || 'N/A'}
                      </strong>
                    </div>

                    {/* 4. Call Number */}
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '8px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: '#64748b',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontWeight: 600
                        }}
                      >
                        <BookMarked size={12} color="#94a3b8" />
                        {isKhmer ? 'លេខហៅសៀវភៅ (Call No.)' : 'Call Number'}
                      </span>
                      <strong style={{ color: '#1e73be', fontSize: '0.84rem', fontWeight: 700, fontFamily: 'monospace' }}>
                        {selectedBook.call_number || 'N/A'}
                      </strong>
                    </div>

                    {/* 5. Publish Year */}
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '8px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: '#64748b',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontWeight: 600
                        }}
                      >
                        <Calendar size={12} color="#94a3b8" />
                        {isKhmer ? 'ឆ្នាំបោះពុម្ព' : 'Publish Year'}
                      </span>
                      <strong style={{ color: '#07294D', fontSize: '0.84rem', fontWeight: 700 }}>
                        {selectedBook.publish_year || 'N/A'}
                      </strong>
                    </div>

                    {/* 6. Publisher */}
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '8px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: '#64748b',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontWeight: 600
                        }}
                      >
                        <Building size={12} color="#94a3b8" />
                        {isKhmer ? 'គ្រឹះស្ថាន / រោងពុម្ព' : 'Publisher'}
                      </span>
                      <strong style={{ color: '#07294D', fontSize: '0.84rem', fontWeight: 700 }}>
                        {selectedBook.publisher || 'RPITSSR Press'}
                      </strong>
                    </div>

                    {/* 7. Edition */}
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '8px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: '#64748b',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontWeight: 600
                        }}
                      >
                        <Bookmark size={12} color="#94a3b8" />
                        {isKhmer ? 'ការបោះពុម្ពលើកទី' : 'Edition'}
                      </span>
                      <strong style={{ color: '#07294D', fontSize: '0.84rem', fontWeight: 700 }}>
                        {selectedBook.edition || (isKhmer ? 'បោះពុម្ពលើកទី ១' : '1st Edition')}
                      </strong>
                    </div>

                    {/* 8. Language */}
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '8px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: '#64748b',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontWeight: 600
                        }}
                      >
                        <Globe size={12} color="#94a3b8" />
                        {isKhmer ? 'ភាសាសៀវភៅ' : 'Language'}
                      </span>
                      <strong style={{ color: '#07294D', fontSize: '0.84rem', fontWeight: 700 }}>
                        {selectedBook.language === 'km'
                          ? 'ភាសាខ្មែរ (Khmer)'
                          : selectedBook.language === 'en'
                          ? 'ភាសាអង់គ្លេស (English)'
                          : selectedBook.language || 'ភាសាខ្មែរ (Khmer)'}
                      </strong>
                    </div>
                  </div>

                  {/* Synopsis / Description Card */}
                  {selectedBook.description && (
                    <div
                      style={{
                        marginBottom: '18px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderLeft: '4px solid #1e73be',
                        borderRadius: '0 12px 12px 0',
                        padding: '12px 16px'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#07294D',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          marginBottom: '6px'
                        }}
                      >
                        <BookOpen size={15} color="#1e73be" />
                        <span>{isKhmer ? 'សេចក្តីសង្ខេបនៃខ្លឹមសារ:' : 'Synopsis & Description:'}</span>
                      </div>
                      <p
                        style={{
                          color: '#475569',
                          fontSize: '0.86rem',
                          lineHeight: 1.65,
                          margin: 0,
                          whiteSpace: 'pre-line'
                        }}
                      >
                        {selectedBook.description}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons Toolbar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '10px',
                      paddingTop: '12px',
                      borderTop: '1px dashed #e2e8f0'
                    }}
                  >
                    {selectedBook.file_url ? (
                      <a
                        href={selectedBook.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '50px',
                          padding: '10px 24px',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '7px',
                          textDecoration: 'none',
                          boxShadow: '0 4px 14px rgba(220, 38, 38, 0.25)',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(220, 38, 38, 0.35)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 14px rgba(220, 38, 38, 0.25)';
                        }}
                      >
                        <Download size={15} />
                        <span>{isKhmer ? 'អាន ឬទាញយកសៀវភៅ E-Book (PDF)' : 'Read or Download E-Book (PDF)'}</span>
                      </a>
                    ) : (
                      <div
                        style={{
                          background: '#eff6ff',
                          border: '1px solid #dbeafe',
                          borderRadius: '50px',
                          padding: '9px 18px',
                          color: '#1e40af',
                          fontSize: '0.82rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '7px',
                          fontWeight: 600
                        }}
                      >
                        <Info size={15} color="#1e73be" />
                        <span>{isKhmer ? 'សៀវភៅច្បាប់ដើមក្នុងបណ្ណាល័យស្ថាប័ន' : 'Physical Copy in Campus Library'}</span>
                      </div>
                    )}

                    <Link
                      to="/student-dashboard"
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#07294D',
                        borderRadius: '50px',
                        padding: '9px 18px',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#1e73be';
                        e.currentTarget.style.color = '#1e73be';
                        e.currentTarget.style.background = '#eff6ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.color = '#07294D';
                        e.currentTarget.style.background = '#ffffff';
                      }}
                    >
                      <GraduationCap size={15} />
                      <span>{isKhmer ? 'ខ្ចីក្នុងប្រព័ន្ធនិស្សិត' : 'Student Portal'}</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setSelectedBook(null)}
                      style={{
                        marginLeft: 'auto',
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        color: '#64748b',
                        borderRadius: '50px',
                        padding: '9px 20px',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#e2e8f0';
                        e.currentTarget.style.color = '#07294D';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f1f5f9';
                        e.currentTarget.style.color = '#64748b';
                      }}
                    >
                      {isKhmer ? 'បិទ' : 'Close'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
