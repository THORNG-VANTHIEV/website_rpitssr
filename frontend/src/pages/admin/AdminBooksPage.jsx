import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  BookOpen,
  Library,
  FolderTree,
  BookmarkCheck,
  Search,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Layers,
  Sparkles,
  Download,
  ExternalLink,
  BookMarked,
  User,
  Hash,
  MapPin,
  FileText,
  UploadCloud,
  Check,
  X,
  Building2,
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

export const AdminBooksPage = ({ defaultTab = 'books' }) => {
  const { currentLanguage, language } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  // Active Main Tab: 'books' | 'categories' | 'borrowings'
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Data States
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // all, available, unavailable, ebook
  const [sortBy, setSortBy] = useState('newest'); // newest, title_asc, copies_desc, available_desc

  // Modals
  const [detailModalBook, setDetailModalBook] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deleteModalBook, setDeleteModalBook] = useState(null);
  const [borrowModalBook, setBorrowModalBook] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteModalCategory, setDeleteModalCategory] = useState(null);

  // Form State for Book
  const [formData, setFormData] = useState({
    title_km: '',
    title_en: '',
    author: '',
    isbn: '',
    call_number: '',
    category_id: '',
    publisher: '',
    publish_year: new Date().getFullYear(),
    edition: 'បោះពុម្ពលើកទី ១ (1st Edition)',
    language: 'km',
    total_copies: 5,
    available_copies: 5,
    shelf_location: 'ធ្នើ A-01',
    cover_image: '',
    file_url: '',
    is_ebook: false,
    is_featured: false,
    status: 'available',
    description: '',
  });

  // Form State for Borrowing
  const [borrowFormData, setBorrowFormData] = useState({
    book_id: '',
    student_name: '',
    student_id: '',
    borrow_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
  });

  // Form State for Category
  const [categoryFormData, setCategoryFormData] = useState({
    name_km: '',
    name_en: '',
    code: '',
    shelf_location: '',
    description: '',
    is_active: true,
  });

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Show Toast
  const showToast = (message) => {
    setSuccessToast(message);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  // Fetch All Data
  const fetchData = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const [booksRes, catsRes, borrowsRes] = await Promise.all([
        fetch('/api/books'),
        fetch('/api/book-categories'),
        fetch('/api/admin/borrowings', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            'Accept': 'application/json',
          },
        }).catch(() => ({ ok: false })),
      ]);

      if (booksRes.ok) {
        const booksData = await booksRes.json();
        setBooks(Array.isArray(booksData) ? booksData : []);
      }

      if (catsRes.ok) {
        const catsData = await catsRes.json();
        setCategories(Array.isArray(catsData) ? catsData : []);
      }

      if (borrowsRes.ok) {
        const borrowsData = await borrowsRes.json();
        setBorrowings(Array.isArray(borrowsData) ? borrowsData : []);
      }
    } catch (err) {
      console.error('Error fetching library data:', err);
      setError(isKhmer ? 'មិនអាចទាញយកទិន្នន័យបណ្ណាល័យបានទេ' : 'Failed to fetch library catalog data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute KPI Metrics
  const metrics = useMemo(() => {
    const totalTitles = books.length;
    const totalCopies = books.reduce((acc, b) => acc + (parseInt(b.total_copies, 10) || 0), 0);
    const availableCopies = books.reduce((acc, b) => acc + (parseInt(b.available_copies, 10) || 0), 0);
    const activeLoans = borrowings.filter((br) => br.status === 'borrowed').length;
    const totalEbooks = books.filter((b) => b.is_ebook).length;

    return {
      totalTitles,
      totalCopies,
      availableCopies,
      activeLoans,
      totalEbooks,
    };
  }, [books, borrowings]);

  // Filtered & Sorted Books
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitleKm = book.title_km?.toLowerCase().includes(q);
          const matchTitleEn = book.title_en?.toLowerCase().includes(q);
          const matchAuthor = book.author?.toLowerCase().includes(q);
          const matchIsbn = book.isbn?.toLowerCase().includes(q);
          const matchCall = book.call_number?.toLowerCase().includes(q);
          const matchShelf = book.shelf_location?.toLowerCase().includes(q);
          if (!matchTitleKm && !matchTitleEn && !matchAuthor && !matchIsbn && !matchCall && !matchShelf) {
            return false;
          }
        }

        // Category
        if (selectedCategory !== 'all') {
          if (String(book.category_id) !== String(selectedCategory)) {
            return false;
          }
        }

        // Availability
        if (availabilityFilter === 'available') {
          return (book.available_copies || 0) > 0;
        }
        if (availabilityFilter === 'unavailable') {
          return (book.available_copies || 0) <= 0;
        }
        if (availabilityFilter === 'ebook') {
          return Boolean(book.is_ebook);
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title_asc') {
          return (a.title_km || '').localeCompare(b.title_km || '');
        }
        if (sortBy === 'copies_desc') {
          return (b.total_copies || 0) - (a.total_copies || 0);
        }
        if (sortBy === 'available_desc') {
          return (b.available_copies || 0) - (a.available_copies || 0);
        }
        return b.id - a.id;
      });
  }, [books, searchQuery, selectedCategory, availabilityFilter, sortBy]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingBook(null);
    setFormData({
      title_km: '',
      title_en: '',
      author: '',
      isbn: '',
      call_number: '',
      category_id: categories.length > 0 ? categories[0].id : '',
      publisher: 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប',
      publish_year: new Date().getFullYear(),
      edition: 'បោះពុម្ពលើកទី ១',
      language: 'km',
      total_copies: 5,
      available_copies: 5,
      shelf_location: 'ធ្នើ A-01',
      cover_image: '',
      file_url: '',
      is_ebook: false,
      is_featured: false,
      status: 'available',
      description: '',
    });
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (book) => {
    setEditingBook(book);
    setFormData({
      title_km: book.title_km || '',
      title_en: book.title_en || '',
      author: book.author || '',
      isbn: book.isbn || '',
      call_number: book.call_number || '',
      category_id: book.category_id || '',
      publisher: book.publisher || '',
      publish_year: book.publish_year || new Date().getFullYear(),
      edition: book.edition || '',
      language: book.language || 'km',
      total_copies: book.total_copies || 1,
      available_copies: book.available_copies !== undefined ? book.available_copies : book.total_copies,
      shelf_location: book.shelf_location || '',
      cover_image: book.cover_image || '',
      file_url: book.file_url || '',
      is_ebook: Boolean(book.is_ebook),
      is_featured: Boolean(book.is_featured),
      status: book.status || 'available',
      description: book.description || '',
    });
    setIsFormModalOpen(true);
  };

  // Handle Book Form Submit
  const handleSaveBook = async (e) => {
    e.preventDefault();
    try {
      const url = editingBook ? `/api/admin/books/${editingBook.id}` : '/api/admin/books';
      const method = editingBook ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error saving book');
      }

      const savedBook = await res.json();

      if (editingBook) {
        setBooks((prev) => prev.map((b) => (b.id === savedBook.id ? savedBook : b)));
        showToast(isKhmer ? 'កែសម្រួលព័ត៌មានសៀវភៅជោគជ័យ!' : 'Book updated successfully!');
      } else {
        setBooks((prev) => [savedBook, ...prev]);
        showToast(isKhmer ? 'បានបន្ថែមសៀវភៅថ្មីចូលកាតាឡុកជោគជ័យ!' : 'New book added to library catalog!');
      }

      setIsFormModalOpen(false);
    } catch (err) {
      console.error('Error saving book:', err);
      alert(err.message || 'Failed to save book');
    }
  };

  // Handle Book Delete
  const handleDeleteBook = async () => {
    if (!deleteModalBook) return;
    try {
      const res = await fetch(`/api/admin/books/${deleteModalBook.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Accept': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to delete book');

      setBooks((prev) => prev.filter((b) => b.id !== deleteModalBook.id));
      showToast(isKhmer ? 'បានលុបសៀវភៅចេញពីប្រព័ន្ធរួចរាល់' : 'Book removed from library system');
      setDeleteModalBook(null);
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.message || 'Failed to delete book');
    }
  };

  // Handle Cover / File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    setIsUploading(true);
    try {
      const res = await fetch('/api/admin/books/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: uploadFormData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      if (data.file_type === 'pdf') {
        setFormData((prev) => ({ ...prev, file_url: data.url, is_ebook: true }));
        showToast(isKhmer ? 'បានផ្ទុកឡើងឯកសារ PDF សៀវភៅ E-Book ជោគជ័យ' : 'PDF E-Book file uploaded successfully');
      } else {
        setFormData((prev) => ({ ...prev, cover_image: data.url }));
        showToast(isKhmer ? 'បានផ្ទុកឡើងរូបភាពក្របសៀវភៅជោគជ័យ' : 'Book cover image uploaded successfully');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Open Quick Loan Modal
  const handleOpenBorrowModal = (book) => {
    setBorrowModalBook(book);
    setBorrowFormData({
      book_id: book.id,
      student_name: '',
      student_id: '',
      borrow_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
    });
  };

  // Handle Record Borrowing
  const handleSaveBorrowing = async (e) => {
    e.preventDefault();
    if (!borrowModalBook) return;

    try {
      const res = await fetch('/api/admin/borrowings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(borrowFormData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error recording loan');
      }

      const newBorrowing = await res.json();

      // Decrement available copies in frontend state
      setBooks((prev) =>
        prev.map((b) =>
          b.id === borrowModalBook.id ? { ...b, available_copies: Math.max(0, (b.available_copies || 0) - 1) } : b
        )
      );

      setBorrowings((prev) => [newBorrowing, ...prev]);
      showToast(isKhmer ? `បានកត់ត្រាកិច្ចសន្យាខ្ចីសៀវភៅជូន ${borrowFormData.student_name} ជោគជ័យ!` : 'Book loan registered successfully!');
      setBorrowModalBook(null);
    } catch (err) {
      console.error('Error borrowing book:', err);
      alert(err.message || 'Failed to record loan');
    }
  };

  // Handle Return Borrowing
  const handleReturnBorrowing = async (id) => {
    try {
      const res = await fetch(`/api/admin/borrowings/${id}/return`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Accept': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to mark return');
      const data = await res.json();

      setBorrowings((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'returned', return_date: new Date().toISOString().split('T')[0] } : item))
      );

      // Increment available copies of associated book
      if (data.borrowing?.book_id) {
        setBooks((prev) =>
          prev.map((b) =>
            b.id === data.borrowing.book_id
              ? { ...b, available_copies: Math.min(b.total_copies, (b.available_copies || 0) + 1) }
              : b
          )
        );
      }

      showToast(isKhmer ? 'បានកត់ត្រាសងសៀវភៅរួចរាល់ និងបញ្ចូលស្តុកឡើងវិញ' : 'Book marked returned and returned to stock');
    } catch (err) {
      console.error('Error marking returned:', err);
      alert(err.message || 'Failed to mark return');
    }
  };

  // Open Category Create Modal
  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name_km: '',
      name_en: '',
      code: '',
      shelf_location: '',
      description: '',
      is_active: true,
    });
    setIsCategoryModalOpen(true);
  };

  // Open Category Edit Modal
  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryFormData({
      name_km: cat.name_km || '',
      name_en: cat.name_en || '',
      code: cat.code || '',
      shelf_location: cat.shelf_location || '',
      description: cat.description || '',
      is_active: cat.is_active !== undefined ? Boolean(cat.is_active) : true,
    });
    setIsCategoryModalOpen(true);
  };

  // Save Category
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      const url = editingCategory ? `/api/admin/book-categories/${editingCategory.id}` : '/api/admin/book-categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(categoryFormData),
      });

      if (!res.ok) throw new Error('Failed to save category');
      const savedCat = await res.json();

      if (editingCategory) {
        setCategories((prev) => prev.map((c) => (c.id === savedCat.id ? savedCat : c)));
        showToast(isKhmer ? 'កែសម្រួលប្រភេទសៀវភៅជោគជ័យ' : 'Category updated successfully');
      } else {
        setCategories((prev) => [...prev, savedCat]);
        showToast(isKhmer ? 'បានបន្ថែមប្រភេទសៀវភៅថ្មីជោគជ័យ' : 'New category created successfully');
      }

      setIsCategoryModalOpen(false);
    } catch (err) {
      console.error('Error saving category:', err);
      alert(err.message || 'Failed to save category');
    }
  };

  // Delete Category
  const handleDeleteCategory = async () => {
    if (!deleteModalCategory) return;
    try {
      const res = await fetch(`/api/admin/book-categories/${deleteModalCategory.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete category');

      setCategories((prev) => prev.filter((c) => c.id !== deleteModalCategory.id));
      showToast(isKhmer ? 'បានលុបប្រភេទសៀវភៅជោគជ័យ' : 'Category deleted');
      setDeleteModalCategory(null);
    } catch (err) {
      console.error('Delete category error:', err);
      alert(err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="admin-page-container" style={{ paddingBottom: '80px' }}>
      {/* Toast Notification */}
      {successToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#07294D',
            color: '#ffffff',
            padding: '14px 22px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(7, 41, 77, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid #1e73be',
            animation: 'fadeInUp 0.3s ease',
          }}
        >
          <div style={{ backgroundColor: '#10b981', borderRadius: '50%', padding: '4px' }}>
            <Check size={16} color="#ffffff" />
          </div>
          <div style={{ fontWeight: '600', fontSize: '0.92rem' }}>{successToast}</div>
        </div>
      )}

      {/* =========================================================================
          1. Institutional Header Banner
          ========================================================================= */}
      <div className="admin-header-banner" style={{ marginBottom: '24px' }}>
        <div className="admin-header-banner-content">
          <div className="admin-header-badge">
            <BookOpen size={14} />
            <span>{isKhmer ? 'ប្រព័ន្ធបណ្ណាល័យស្ថាប័ន & កាតាឡុកសៀវភៅ TVET' : 'Institutional Library & TVET Books Catalog'}</span>
          </div>
          <h1 className="admin-header-title">
            {isKhmer ? 'កាតាឡុកសៀវភៅ និងឯកសារស្រាវជ្រាវបច្ចេកទេស' : 'Library Catalog & Technical Books Management'}
          </h1>
          <p className="admin-header-subtitle">
            {isKhmer
              ? 'គ្រប់គ្រងសៀវភៅសិក្សា ឯកសារយោងបច្ចេកទេស TVET លេខកូដ ISBN/Barcode ទីតាំងធ្នើ កិច្ចការខ្ចី-សង និងសៀវភៅអេឡិចត្រូនិច E-Books។'
              : 'Comprehensive catalog of textbooks, TVET technical reference manuals, ISBN barcode placements, student borrowing loans, and digital e-books.'}
          </p>
        </div>
        <div className="admin-header-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="admin-btn admin-btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={16} className={refreshing ? 'admin-spin' : ''} />
            <span>{isKhmer ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}</span>
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="admin-btn admin-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} />
            <span>{isKhmer ? 'បន្ថែមសៀវភៅថ្មី' : 'Add New Book'}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. Navigation Tabs (Books, Categories, Borrowings)
          ========================================================================= */}
      <div className="admin-tabs" style={{ marginBottom: '24px' }}>
        <button
          className={`admin-tab-btn ${activeTab === 'books' ? 'active' : ''}`}
          onClick={() => setActiveTab('books')}
        >
          <BookOpen size={16} style={{ display: 'inline', marginRight: '6px' }} />
          <span>{isKhmer ? 'កាតាឡុកសៀវភៅ' : 'Book Catalog'}</span>
          <span className="admin-tab-count">{books.length}</span>
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <FolderTree size={16} style={{ display: 'inline', marginRight: '6px' }} />
          <span>{isKhmer ? 'ប្រភេទសៀវភៅ' : 'Categories'}</span>
          <span className="admin-tab-count">{categories.length}</span>
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'borrowings' ? 'active' : ''}`}
          onClick={() => setActiveTab('borrowings')}
        >
          <BookmarkCheck size={16} style={{ display: 'inline', marginRight: '6px' }} />
          <span>{isKhmer ? 'កិច្ចការខ្ចី-សង' : 'Borrowings & Loans'}</span>
          <span className="admin-tab-count">{borrowings.length}</span>
        </button>
      </div>

      {/* =========================================================================
          3. 4-Card Institutional KPI Metric Strip
          ========================================================================= */}
      <div className="admin-stats-grid" style={{ marginBottom: '24px' }}>
        {/* Metric 1: Total Book Titles */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">{isKhmer ? 'ចំណងជើងសៀវភៅសរុប' : 'Total Book Titles'}</span>
            <div className="admin-stat-icon-wrap" style={{ background: '#eff6ff', color: '#1e73be', borderColor: '#dbeafe' }}>
              <BookOpen size={20} />
            </div>
          </div>
          <div className="admin-stat-value">{metrics.totalTitles}</div>
          <div className="admin-stat-desc" style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '6px' }}>
            {isKhmer ? 'កាតាឡុកសៀវភៅសិក្សា និងឯកសារយោង' : 'Distinct titles in institution catalog'}
          </div>
        </div>

        {/* Metric 2: Total Volumes / Copies */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">{isKhmer ? 'ចំនួនក្បាលសៀវភៅសរុប' : 'Total Physical Copies'}</span>
            <div className="admin-stat-icon-wrap" style={{ background: '#f0fdf4', color: '#059669', borderColor: '#bbf7d0' }}>
              <Layers size={20} />
            </div>
          </div>
          <div className="admin-stat-value">{metrics.totalCopies}</div>
          <div className="admin-stat-desc" style={{ color: '#059669', fontSize: '0.82rem', marginTop: '6px' }}>
            {isKhmer ? `មាន ${metrics.totalEbooks} ចំណងជើងជា E-Book` : `${metrics.totalEbooks} titles with digital E-Book PDF`}
          </div>
        </div>

        {/* Metric 3: Available Copies */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">{isKhmer ? 'ច្បាប់មានក្នុងស្តុក' : 'Available Copies'}</span>
            <div className="admin-stat-icon-wrap" style={{ background: '#fefce8', color: '#ca8a04', borderColor: '#fef08a' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="admin-stat-value">{metrics.availableCopies}</div>
          <div className="admin-stat-desc" style={{ color: '#ca8a04', fontSize: '0.82rem', marginTop: '6px' }}>
            {isKhmer ? 'ត្រៀមជាស្រេចសម្រាប់សិស្ស-និស្សិតខ្ចីអាន' : 'Ready for on-shelf borrowing & reading'}
          </div>
        </div>

        {/* Metric 4: Active Borrowings */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">{isKhmer ? 'សៀវភៅកំពុងខ្ចី' : 'Active Student Loans'}</span>
            <div className="admin-stat-icon-wrap" style={{ background: '#fff7ed', color: '#ea580c', borderColor: '#fed7aa' }}>
              <BookmarkCheck size={20} />
            </div>
          </div>
          <div className="admin-stat-value">{metrics.activeLoans}</div>
          <div className="admin-stat-desc" style={{ color: '#ea580c', fontSize: '0.82rem', marginTop: '6px' }}>
            {isKhmer ? 'សិស្ស-និស្សិតកំពុងខ្ចីស្រាវជ្រាវ' : 'Books currently in students possession'}
          </div>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: BOOKS CATALOG
          ========================================================================= */}
      {activeTab === 'books' && (
        <>
          {/* Filters & Search Strip */}
          <div
            className="admin-card"
            style={{
              padding: '18px 20px',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Top row: Search input & Category dropdown & Sort dropdown */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: '1 1 280px', position: 'relative' }}>
                <Search
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                  }}
                />
                <input
                  type="text"
                  placeholder={isKhmer ? 'ស្វែងរកចំណងជើង, អ្នកនិពន្ធ, ISBN, ឬធ្នើ...' : 'Search title, author, ISBN, call number, or shelf...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="admin-input"
                  style={{ paddingLeft: '40px', width: '100%' }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94a3b8',
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Category Select */}
              <div style={{ flex: '0 0 220px' }}>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="admin-select"
                  style={{ width: '100%' }}
                >
                  <option value="all">{isKhmer ? 'គ្រប់ផ្នែកទាំងអស់ (All Categories)' : 'All Categories'}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {isKhmer ? cat.name_km : cat.name_en || cat.name_km}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div style={{ flex: '0 0 200px' }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="admin-select"
                  style={{ width: '100%' }}
                >
                  <option value="newest">{isKhmer ? 'ថ្មីបំផុត (Newest)' : 'Newest'}</option>
                  <option value="title_asc">{isKhmer ? 'ចំណងជើង (A-Z / ក-អ)' : 'Title (A-Z)'}</option>
                  <option value="copies_desc">{isKhmer ? 'ចំនួនក្បាលច្រើនបំផុត' : 'Most Total Copies'}</option>
                  <option value="available_desc">{isKhmer ? 'មានក្នុងស្តុកច្រើនបំផុត' : 'Most Available'}</option>
                </select>
              </div>
            </div>

            {/* Bottom row: Availability quick pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b', marginRight: '6px' }}>
                {isKhmer ? 'ស្ថានភាពស្តុក ៖' : 'Stock Filter:'}
              </span>
              {[
                { key: 'all', label: isKhmer ? 'ទាំងអស់' : 'All Books', count: books.length },
                { key: 'available', label: isKhmer ? '📗 មានក្នុងស្តុក' : 'Available', count: books.filter((b) => (b.available_copies || 0) > 0).length },
                { key: 'unavailable', label: isKhmer ? '📕 អស់ពីស្តុក/ខ្ចីអស់' : 'Out of Stock', count: books.filter((b) => (b.available_copies || 0) <= 0).length },
                { key: 'ebook', label: isKhmer ? '📱 សៀវភៅ E-Book' : 'E-Books (PDF)', count: books.filter((b) => b.is_ebook).length },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setAvailabilityFilter(item.key)}
                  className={`admin-filter-pill ${availabilityFilter === item.key ? 'active' : ''}`}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    border: '1px solid',
                    borderColor: availabilityFilter === item.key ? '#1e73be' : '#e2e8f0',
                    background: availabilityFilter === item.key ? '#eff6ff' : '#ffffff',
                    color: availabilityFilter === item.key ? '#1e73be' : '#64748b',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>{item.label}</span>
                  <span
                    style={{
                      background: availabilityFilter === item.key ? '#1e73be' : '#f1f5f9',
                      color: availabilityFilter === item.key ? '#ffffff' : '#64748b',
                      borderRadius: '9999px',
                      padding: '1px 7px',
                      fontSize: '0.74rem',
                      fontWeight: '700',
                    }}
                  >
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* DataTable */}
          <div className="admin-card" style={{ overflow: 'hidden' }}>
            <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="admin-card-title">
                  {isKhmer ? 'បញ្ជីសៀវភៅសិក្សា និងកាតាឡុកបណ្ណាល័យ' : 'Library Book Catalog Table'}
                </h3>
                <p className="admin-card-subtitle">
                  {isKhmer
                    ? `បង្ហាញសៀវភៅចំនួន ${filteredBooks.length} ក្នុងចំណោម ${books.length} សៀវភៅសរុប`
                    : `Showing ${filteredBooks.length} of ${books.length} total books`}
                </p>
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="admin-btn admin-btn-primary admin-btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} />
                <span>{isKhmer ? 'បន្ថែមសៀវភៅ' : 'Add Book'}</span>
              </button>
            </div>

            <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>{isKhmer ? 'ក្រប' : 'Cover'}</th>
                    <th>{isKhmer ? 'ចំណងជើងសៀវភៅ & អ្នកនិពន្ធ' : 'Title & Author'}</th>
                    <th>{isKhmer ? 'ផ្នែក / ជំនាញ' : 'Category'}</th>
                    <th>{isKhmer ? 'កូដ ISBN & ធ្នើ' : 'ISBN & Shelf'}</th>
                    <th>{isKhmer ? 'ចំនួនក្នុងស្តុក' : 'Availability'}</th>
                    <th style={{ textAlign: 'right' }}>{isKhmer ? 'សកម្មភាព' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '48px 16px' }}>
                        <div style={{ color: '#94a3b8', marginBottom: '12px' }}>
                          <BookOpen size={48} strokeWidth={1.2} style={{ margin: '0 auto' }} />
                        </div>
                        <h4 style={{ color: '#07294D', fontWeight: '700', marginBottom: '4px' }}>
                          {isKhmer ? 'រកមិនឃើញសៀវភៅក្នុងលក្ខខណ្ឌនេះទេ' : 'No books matched your criteria'}
                        </h4>
                        <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
                          {isKhmer ? 'សូមសាកល្បងផ្លាស់ប្តូរពាក្យស្វែងរក ឬជម្រើសចម្រាញ់' : 'Try adjusting your search terms or filter'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredBooks.map((book) => {
                      const avail = book.available_copies ?? book.total_copies ?? 0;
                      const total = book.total_copies || 1;
                      const isLow = avail > 0 && avail <= 2;
                      const isOut = avail <= 0;

                      return (
                        <tr key={book.id} className="admin-table-row">
                          {/* Cover Thumbnail */}
                          <td>
                            {book.cover_image ? (
                              <img
                                src={book.cover_image}
                                alt={book.title_km}
                                className="admin-book-cover-thumb"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div
                              className="admin-book-cover-placeholder"
                              style={{ display: book.cover_image ? 'none' : 'flex' }}
                            >
                              <BookOpen size={16} style={{ marginBottom: '2px' }} />
                              <span>RPITSSR</span>
                            </div>
                          </td>

                          {/* Title & Author */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span
                                style={{
                                  fontWeight: '700',
                                  color: '#07294D',
                                  fontSize: '0.96rem',
                                  cursor: 'pointer',
                                }}
                                onClick={() => setDetailModalBook(book)}
                              >
                                {book.title_km}
                              </span>
                              {book.is_ebook && (
                                <span className="admin-book-ebook-pill">
                                  <Sparkles size={11} /> E-Book
                                </span>
                              )}
                              {book.is_featured && (
                                <span
                                  style={{
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    background: '#fefce8',
                                    color: '#ca8a04',
                                    fontSize: '0.72rem',
                                    fontWeight: '700',
                                    border: '1px solid #fef08a',
                                  }}
                                >
                                  ★ {isKhmer ? 'ណែនាំ' : 'Featured'}
                                </span>
                              )}
                            </div>
                            {book.title_en && (
                              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px', fontStyle: 'italic' }}>
                                {book.title_en}
                              </div>
                            )}
                            <div
                              style={{
                                fontSize: '0.8rem',
                                color: '#475569',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginTop: '4px',
                              }}
                            >
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <User size={13} color="#64748b" /> {book.author}
                              </span>
                              {book.publisher && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#94a3b8' }}>
                                  &bull; {book.publisher} ({book.publish_year || 'N/A'})
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Category */}
                          <td>
                            <span
                              className="admin-badge"
                              style={{
                                background: '#eff6ff',
                                color: '#1e73be',
                                border: '1px solid #bfdbfe',
                                fontWeight: '600',
                              }}
                            >
                              {book.category
                                ? isKhmer
                                  ? book.category.name_km
                                  : book.category.name_en || book.category.name_km
                                : isKhmer
                                ? 'ទូទៅ'
                                : 'General'}
                            </span>
                          </td>

                          {/* ISBN & Shelf */}
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {book.isbn ? (
                                <span className="admin-book-isbn-badge">
                                  <Hash size={11} color="#64748b" /> {book.isbn}
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>- គ្មាន ISBN -</span>
                              )}
                              {book.shelf_location && (
                                <span className="admin-book-shelf-badge">
                                  <MapPin size={11} /> {book.shelf_location}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Stock Availability */}
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span
                                className={`admin-book-stock-badge ${
                                  isOut ? 'out-of-stock' : isLow ? 'low-stock' : 'in-stock'
                                }`}
                              >
                                {isOut ? (
                                  <>
                                    <AlertCircle size={12} /> {isKhmer ? 'អស់ពីស្តុក (0/' : 'Out of Stock (0/'}
                                    {total})
                                  </>
                                ) : isLow ? (
                                  <>
                                    <Clock size={12} /> {avail} / {total} {isKhmer ? 'នៅសល់តិច' : 'Low Stock'}
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 size={12} /> {avail} / {total} {isKhmer ? 'មានក្នុងស្តុក' : 'Available'}
                                  </>
                                )}
                              </span>
                              {/* Stock Bar */}
                              <div
                                style={{
                                  width: '90px',
                                  height: '4px',
                                  borderRadius: '2px',
                                  background: '#e2e8f0',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${Math.min(100, Math.round((avail / total) * 100))}%`,
                                    background: isOut ? '#ef4444' : isLow ? '#f59e0b' : '#10b981',
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td style={{ textAlign: 'right' }}>
                            <div className="admin-action-btn-group">
                              {/* Quick Borrow Action */}
                              <button
                                onClick={() => handleOpenBorrowModal(book)}
                                disabled={isOut}
                                title={isKhmer ? 'កត់ត្រាខ្ចីសៀវភៅនេះ' : 'Record Student Loan'}
                                className="admin-btn admin-btn-sm"
                                style={{
                                  background: isOut ? '#f1f5f9' : '#eff6ff',
                                  color: isOut ? '#94a3b8' : '#1e73be',
                                  border: '1px solid',
                                  borderColor: isOut ? '#e2e8f0' : '#bfdbfe',
                                  padding: '5px 9px',
                                  fontSize: '0.78rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  cursor: isOut ? 'not-allowed' : 'pointer',
                                }}
                              >
                                <BookmarkCheck size={13} />
                                <span>{isKhmer ? 'ខ្ចី' : 'Loan'}</span>
                              </button>

                              {/* View Details */}
                              <button
                                onClick={() => setDetailModalBook(book)}
                                title={isKhmer ? 'ពិនិត្យលម្អិត' : 'View Details'}
                                className="admin-icon-btn"
                              >
                                <Eye size={15} />
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => handleOpenEditModal(book)}
                                title={isKhmer ? 'កែសម្រួល' : 'Edit Book'}
                                className="admin-icon-btn"
                              >
                                <Edit2 size={15} />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => setDeleteModalBook(book)}
                                title={isKhmer ? 'លុបសៀវភៅ' : 'Delete Book'}
                                className="admin-icon-btn admin-icon-btn-danger"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* =========================================================================
          TAB 2: BOOK CATEGORIES
          ========================================================================= */}
      {activeTab === 'categories' && (
        <div className="admin-card">
          <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="admin-card-title">
                {isKhmer ? 'ផ្នែក / ប្រភេទសៀវភៅបណ្ណាល័យ' : 'Library Department Categories'}
              </h3>
              <p className="admin-card-subtitle">
                {isKhmer
                  ? 'គ្រប់គ្រងផ្នែកជំនាញ កូដសម្គាល់ និងទីតាំងប្លុកធ្នើសៀវភៅតាមជាន់'
                  : 'Manage disciplinary sections, category classification codes, and physical shelf blocks'}
              </p>
            </div>
            <button
              onClick={handleOpenCreateCategory}
              className="admin-btn admin-btn-primary admin-btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} />
              <span>{isKhmer ? 'បន្ថែមប្រភេទថ្មី' : 'Add Category'}</span>
            </button>
          </div>

          <div style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 4px 14px rgba(7, 41, 77, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #07294D, #1e73be, #ffaf00)',
                    }}
                  />
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: '#eff6ff',
                          color: '#1e73be',
                          fontFamily: 'monospace',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          border: '1px solid #bfdbfe',
                        }}
                      >
                        {cat.code || `CAT-${cat.id}`}
                      </span>
                      <span
                        style={{
                          padding: '3px 9px',
                          borderRadius: '9999px',
                          background: '#f8fafc',
                          color: '#475569',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        {cat.books_count || 0} {isKhmer ? 'សៀវភៅ' : 'Books'}
                      </span>
                    </div>

                    <h4 style={{ color: '#07294D', fontSize: '1.05rem', fontWeight: '800', marginBottom: '4px' }}>
                      {cat.name_km}
                    </h4>
                    {cat.name_en && (
                      <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', marginBottom: '8px' }}>
                        {cat.name_en}
                      </div>
                    )}

                    {cat.shelf_location && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.8rem',
                          color: '#059669',
                          background: '#f0fdf4',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid #bbf7d0',
                          marginBottom: '10px',
                        }}
                      >
                        <MapPin size={12} /> {cat.shelf_location}
                      </div>
                    )}

                    {cat.description && (
                      <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6, marginTop: '4px' }}>
                        {cat.description}
                      </p>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '8px',
                      marginTop: '16px',
                      paddingTop: '12px',
                      borderTop: '1px dashed #e2e8f0',
                    }}
                  >
                    <button
                      onClick={() => handleOpenEditCategory(cat)}
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Edit2 size={13} /> {isKhmer ? 'កែសម្រួល' : 'Edit'}
                    </button>
                    <button
                      onClick={() => setDeleteModalCategory(cat)}
                      className="admin-btn admin-btn-danger admin-btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Trash2 size={13} /> {isKhmer ? 'លុប' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: BORROWINGS & LOANS
          ========================================================================= */}
      {activeTab === 'borrowings' && (
        <div className="admin-card" style={{ overflow: 'hidden' }}>
          <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="admin-card-title">
                {isKhmer ? 'កំណត់ត្រាកិច្ចការខ្ចី-សងសៀវភៅបណ្ណាល័យ' : 'Student Borrowings & Circulation Records'}
              </h3>
              <p className="admin-card-subtitle">
                {isKhmer
                  ? 'តាមដានស្ថានភាពសៀវភៅដែលសិស្សកំពុងខ្ចី កាលបរិច្ឆេទសង និងបញ្ជាក់ការទទួលសៀវភៅត្រឡប់មកវិញ'
                  : 'Track ongoing student book loans, scheduled return dates, overdue alerts, and mark returns'}
              </p>
            </div>
          </div>

          <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{isKhmer ? 'ព័ត៌មានសិស្ស-និស្សិត' : 'Student Info'}</th>
                  <th>{isKhmer ? 'សៀវភៅដែលបានខ្ចី' : 'Borrowed Book Title'}</th>
                  <th>{isKhmer ? 'ថ្ងៃខ្ចី' : 'Borrow Date'}</th>
                  <th>{isKhmer ? 'ថ្ងៃត្រូវសង' : 'Due Date'}</th>
                  <th>{isKhmer ? 'ស្ថានភាពកម្ចី' : 'Loan Status'}</th>
                  <th style={{ textAlign: 'right' }}>{isKhmer ? 'សកម្មភាព' : 'Action'}</th>
                </tr>
              </thead>
              <tbody>
                {borrowings.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '48px 16px' }}>
                      <BookmarkCheck size={44} strokeWidth={1.2} style={{ color: '#94a3b8', margin: '0 auto 8px' }} />
                      <h4 style={{ color: '#07294D', fontWeight: '700' }}>
                        {isKhmer ? 'មិនទាន់មានកំណត់ត្រាខ្ចីសៀវភៅទេ' : 'No circulation borrowing records found'}
                      </h4>
                    </td>
                  </tr>
                ) : (
                  borrowings.map((b) => {
                    const isOverdue = b.status === 'overdue' || (b.status === 'borrowed' && new Date(b.due_date) < new Date());
                    const isReturned = b.status === 'returned';

                    return (
                      <tr key={b.id} className="admin-table-row">
                        {/* Student */}
                        <td>
                          <div style={{ fontWeight: '700', color: '#07294D' }}>{b.student_name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <User size={12} /> ID: <code>{b.student_id}</code>
                          </div>
                        </td>

                        {/* Book Title */}
                        <td>
                          <div style={{ fontWeight: '600', color: '#1e73be' }}>
                            {b.book ? b.book.title_km : b.book_title || 'N/A'}
                          </div>
                          {b.book?.shelf_location && (
                            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                              📍 {b.book.shelf_location}
                            </div>
                          )}
                        </td>

                        {/* Borrow Date */}
                        <td>
                          <div style={{ fontSize: '0.85rem', color: '#475569' }}>{b.borrow_date}</div>
                        </td>

                        {/* Due Date */}
                        <td>
                          <div
                            style={{
                              fontSize: '0.85rem',
                              fontWeight: isOverdue ? '700' : '500',
                              color: isOverdue ? '#dc2626' : '#475569',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {b.due_date}
                            {isOverdue && !isReturned && <AlertCircle size={13} color="#dc2626" />}
                          </div>
                        </td>

                        {/* Status */}
                        <td>
                          {isReturned ? (
                            <span
                              className="admin-badge"
                              style={{
                                background: '#f0fdf4',
                                color: '#059669',
                                border: '1px solid #bbf7d0',
                                fontWeight: '700',
                              }}
                            >
                              ✓ {isKhmer ? 'បានសងរួចរាល់' : 'RETURNED'}
                            </span>
                          ) : isOverdue ? (
                            <span
                              className="admin-badge"
                              style={{
                                background: '#fef2f2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                fontWeight: '700',
                              }}
                            >
                              ⚠ {isKhmer ? 'ហួសកាលកំណត់' : 'OVERDUE'}
                            </span>
                          ) : (
                            <span
                              className="admin-badge"
                              style={{
                                background: '#eff6ff',
                                color: '#1e73be',
                                border: '1px solid #bfdbfe',
                                fontWeight: '700',
                              }}
                            >
                              ⏳ {isKhmer ? 'កំពុងខ្ចី' : 'BORROWED'}
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td style={{ textAlign: 'right' }}>
                          {!isReturned ? (
                            <button
                              onClick={() => handleReturnBorrowing(b.id)}
                              className="admin-btn admin-btn-primary admin-btn-sm"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: '#059669',
                                borderColor: '#059669',
                              }}
                            >
                              <CheckCircle2 size={14} />
                              <span>{isKhmer ? 'កត់ត្រាទទួលសង' : 'Mark Returned'}</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '600' }}>
                              {isKhmer ? 'បានបញ្ចប់' : 'Completed'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: BOOK DETAIL LIGHTBOX MODAL
          ========================================================================= */}
      {detailModalBook && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setDetailModalBook(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(7, 41, 77, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            className="admin-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '820px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#ffffff',
              borderRadius: '20px',
              boxShadow: '0 25px 60px rgba(7, 41, 77, 0.25)',
              border: '1px solid #e2e8f0',
              padding: '0',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#eff6ff',
                    color: '#1e73be',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#07294D' }}>
                    {isKhmer ? 'ព័ត៌មានលម្អិតនៃសៀវភៅ' : 'Book Specification Details'}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    ID: #{detailModalBook.id} &bull; {detailModalBook.isbn || 'No ISBN'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setDetailModalBook(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '24px' }}>
                {/* Large Cover */}
                <div style={{ flex: '0 0 160px', textAlign: 'center' }}>
                  {detailModalBook.cover_image ? (
                    <img
                      src={detailModalBook.cover_image}
                      alt={detailModalBook.title_km}
                      style={{
                        width: '160px',
                        height: '220px',
                        objectFit: 'cover',
                        borderRadius: '10px',
                        boxShadow: '0 10px 25px rgba(7, 41, 77, 0.15)',
                        border: '1px solid #cbd5e1',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '160px',
                        height: '220px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #07294D, #1e73be)',
                        color: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                        boxShadow: '0 10px 25px rgba(7, 41, 77, 0.15)',
                      }}
                    >
                      <BookOpen size={42} style={{ marginBottom: '8px' }} />
                      <div style={{ fontSize: '0.8rem', fontWeight: '800' }}>RPITSSR</div>
                      <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>Technical Library</div>
                    </div>
                  )}

                  {detailModalBook.is_ebook && detailModalBook.file_url && (
                    <a
                      href={detailModalBook.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-btn admin-btn-primary admin-btn-sm"
                      style={{
                        marginTop: '12px',
                        width: '100%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        textDecoration: 'none',
                      }}
                    >
                      <Download size={13} /> {isKhmer ? 'អាន / ទាញយក PDF' : 'Read E-Book'}
                    </a>
                  )}
                </div>

                {/* Right Details */}
                <div style={{ flex: '1 1 360px' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span className="admin-badge admin-badge-info">
                      {detailModalBook.category ? detailModalBook.category.name_km : 'ទូទៅ'}
                    </span>
                    {detailModalBook.is_ebook && (
                      <span className="admin-book-ebook-pill">
                        <Sparkles size={12} /> Digital E-Book
                      </span>
                    )}
                    {detailModalBook.is_featured && (
                      <span className="admin-badge admin-badge-warning">★ Featured</span>
                    )}
                  </div>

                  <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#07294D', marginBottom: '4px', lineHeight: 1.4 }}>
                    {detailModalBook.title_km}
                  </h2>
                  {detailModalBook.title_en && (
                    <div style={{ fontSize: '0.95rem', color: '#64748b', fontStyle: 'italic', marginBottom: '14px' }}>
                      {detailModalBook.title_en}
                    </div>
                  )}

                  {/* Metadata Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                      gap: '12px',
                      background: '#f8fafc',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      marginBottom: '16px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>{isKhmer ? 'អ្នកនិពន្ធ' : 'Author'}</div>
                      <div style={{ fontWeight: '700', color: '#07294D' }}>{detailModalBook.author}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>{isKhmer ? 'រោងពុម្ព & ឆ្នាំ' : 'Publisher & Year'}</div>
                      <div style={{ fontWeight: '700', color: '#07294D' }}>
                        {detailModalBook.publisher || 'N/A'} ({detailModalBook.publish_year || 'N/A'})
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>ISBN</div>
                      <div style={{ fontFamily: 'monospace', fontWeight: '700', color: '#1e73be' }}>
                        {detailModalBook.isbn || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>{isKhmer ? 'ទីតាំងធ្នើ' : 'Shelf Placement'}</div>
                      <div style={{ fontWeight: '700', color: '#059669' }}>
                        📍 {detailModalBook.shelf_location || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>{isKhmer ? 'ចំនួនក្បាលសរុប' : 'Total Volumes'}</div>
                      <div style={{ fontWeight: '700', color: '#07294D' }}>
                        {detailModalBook.total_copies} {isKhmer ? 'ក្បាល' : 'copies'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>{isKhmer ? 'មានក្នុងស្តុក' : 'Available on Shelf'}</div>
                      <div style={{ fontWeight: '700', color: (detailModalBook.available_copies || 0) > 0 ? '#059669' : '#dc2626' }}>
                        {detailModalBook.available_copies} {isKhmer ? 'ក្បាល' : 'copies'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {detailModalBook.description && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#07294D', fontSize: '0.96rem', fontWeight: '800', marginBottom: '8px' }}>
                    {isKhmer ? 'សេចក្តីសង្ខេប និងខ្លឹមសារសៀវភៅ' : 'Book Overview & Syllabus Description'}
                  </h4>
                  <div className="admin-book-reader-box">{detailModalBook.description}</div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottomLeftRadius: '20px',
                borderBottomRightRadius: '20px',
              }}
            >
              <button
                onClick={() => {
                  const bookToEdit = detailModalBook;
                  setDetailModalBook(null);
                  handleOpenEditModal(bookToEdit);
                }}
                className="admin-btn admin-btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Edit2 size={14} /> {isKhmer ? 'កែសម្រួលសៀវភៅ' : 'Edit Book'}
              </button>
              <button
                onClick={() => setDetailModalBook(null)}
                className="admin-btn admin-btn-primary"
              >
                {isKhmer ? 'បិទផ្ទាំង' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ADD / EDIT BOOK MODAL
          ========================================================================= */}
      {isFormModalOpen && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setIsFormModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(7, 41, 77, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            className="admin-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '850px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              background: '#ffffff',
              borderRadius: '20px',
              boxShadow: '0 25px 60px rgba(7, 41, 77, 0.25)',
              border: '1px solid #e2e8f0',
              padding: '0',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#eff6ff',
                    color: '#1e73be',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BookOpen size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#07294D' }}>
                  {editingBook
                    ? isKhmer
                      ? 'កែសម្រួលព័ត៌មានសៀវភៅ'
                      : 'Edit Book Specification'
                    : isKhmer
                    ? 'បន្ថែមសៀវភៅថ្មីចូលកាតាឡុក'
                    : 'Add New Book to Catalog'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveBook} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                {/* Khmer Title */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="admin-label">
                    {isKhmer ? 'ចំណងជើងសៀវភៅ (ភាសាខ្មែរ)' : 'Book Title (Khmer)'}{' '}
                    <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title_km}
                    onChange={(e) => setFormData({ ...formData, title_km: e.target.value })}
                    className="admin-input"
                    placeholder={isKhmer ? 'ឧ. មូលដ្ឋានគ្រឹះបច្ចេកវិទ្យាគេហទំព័រ & JavaScript' : 'e.g. Web Technologies Fundamentals'}
                  />
                </div>

                {/* English Title */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="admin-label">
                    {isKhmer ? 'ចំណងជើងសៀវភៅ (អង់គ្លេស)' : 'Book Title (English)'}
                  </label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    className="admin-input"
                    placeholder="e.g. Introduction to Modern Web Development & React"
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="admin-label">
                    {isKhmer ? 'អ្នកនិពន្ធ / រៀបរៀង' : 'Author(s)'} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="admin-input"
                    placeholder={isKhmer ? 'ឧ. បណ្ឌិត ហេង ប៊ុនធឿន' : 'e.g. Dr. Heng Buntheun'}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="admin-label">
                    {isKhmer ? 'ផ្នែក / ប្រភេទសៀវភៅ' : 'Book Category'}
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="admin-select"
                  >
                    <option value="">{isKhmer ? '-- ជ្រើសរើសផ្នែក --' : '-- Select Category --'}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {isKhmer ? c.name_km : c.name_en || c.name_km}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ISBN */}
                <div>
                  <label className="admin-label">ISBN Code</label>
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    className="admin-input"
                    placeholder="e.g. 978-0134685991"
                  />
                </div>

                {/* Shelf Placement */}
                <div>
                  <label className="admin-label">
                    {isKhmer ? 'ទីតាំងធ្នើសៀវភៅ' : 'Shelf / Rack Location'}
                  </label>
                  <input
                    type="text"
                    value={formData.shelf_location}
                    onChange={(e) => setFormData({ ...formData, shelf_location: e.target.value })}
                    className="admin-input"
                    placeholder="e.g. ធ្នើ A-12 ឬ Section B-04"
                  />
                </div>

                {/* Publisher */}
                <div>
                  <label className="admin-label">{isKhmer ? 'រោងពុម្ព / ស្ថាប័នបោះពុម្ព' : 'Publisher'}</label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    className="admin-input"
                    placeholder="e.g. RPITSSR Academic Press"
                  />
                </div>

                {/* Publish Year */}
                <div>
                  <label className="admin-label">{isKhmer ? 'ឆ្នាំបោះពុម្ព' : 'Publish Year'}</label>
                  <input
                    type="number"
                    value={formData.publish_year}
                    onChange={(e) => setFormData({ ...formData, publish_year: e.target.value })}
                    className="admin-input"
                    placeholder="2024"
                  />
                </div>

                {/* Total Copies */}
                <div>
                  <label className="admin-label">
                    {isKhmer ? 'ចំនួនក្បាលសរុប (Total Copies)' : 'Total Copies'}{' '}
                    <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.total_copies}
                    onChange={(e) => {
                      const total = parseInt(e.target.value, 10) || 1;
                      setFormData({
                        ...formData,
                        total_copies: total,
                        available_copies: Math.min(formData.available_copies || total, total),
                      });
                    }}
                    className="admin-input"
                  />
                </div>

                {/* Available Copies */}
                <div>
                  <label className="admin-label">
                    {isKhmer ? 'ច្បាប់មានជាក់ស្តែង (Available Copies)' : 'Available Copies'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formData.total_copies}
                    value={formData.available_copies}
                    onChange={(e) => setFormData({ ...formData, available_copies: parseInt(e.target.value, 10) || 0 })}
                    className="admin-input"
                  />
                </div>

                {/* Cover Image Upload / URL */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="admin-label">{isKhmer ? 'រូបភាពក្របសៀវភៅ (Cover Image)' : 'Cover Image URL'}</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      value={formData.cover_image}
                      onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                      className="admin-input"
                      style={{ flex: 1 }}
                      placeholder="https://... ឬចុចផ្ទុកឡើង"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="admin-btn admin-btn-secondary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <UploadCloud size={16} />
                      <span>{isUploading ? (isKhmer ? 'កំពុងផ្ទុក...' : 'Uploading...') : isKhmer ? 'ផ្ទុកឡើងឯកសារ' : 'Upload'}</span>
                    </button>
                  </div>
                </div>

                {/* E-Book PDF URL */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="admin-label">
                    {isKhmer ? 'តំណភ្ជាប់សៀវភៅ E-Book PDF (ជាជម្រើស)' : 'Digital E-Book PDF URL (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={formData.file_url}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        file_url: e.target.value,
                        is_ebook: Boolean(e.target.value),
                      })
                    }
                    className="admin-input"
                    placeholder="/uploads/books/web-tech.pdf ឬ https://..."
                  />
                </div>

                {/* Checkboxes: E-Book & Featured */}
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_ebook}
                      onChange={(e) => setFormData({ ...formData, is_ebook: e.target.checked })}
                    />
                    <span style={{ fontWeight: '600', color: '#07294D', fontSize: '0.9rem' }}>
                      {isKhmer ? 'ជាសៀវភៅអេឡិចត្រូនិច (Digital E-Book)' : 'Is Digital E-Book'}
                    </span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    />
                    <span style={{ fontWeight: '600', color: '#07294D', fontSize: '0.9rem' }}>
                      {isKhmer ? 'សៀវភៅណែនាំពិសេស (Featured Book)' : 'Featured Recommendation'}
                    </span>
                  </label>
                </div>

                {/* Description */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="admin-label">{isKhmer ? 'សេចក្តីសង្ខេប / ខ្លឹមសារមេរៀន' : 'Book Description & Syllabus'}</label>
                  <textarea
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="admin-textarea"
                    placeholder={isKhmer ? 'ពិពណ៌នាអំពីខ្លឹមសារសៀវភៅ គោលបំណង និងជំនាញដែលទទួលបាន...' : 'Describe textbook contents, modules, and target students...'}
                  />
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  marginTop: '24px',
                  paddingTop: '16px',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="admin-btn admin-btn-secondary"
                >
                  {isKhmer ? 'បោះបង់' : 'Cancel'}
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {editingBook
                    ? isKhmer
                      ? 'រក្សាទុកការកែប្រែ'
                      : 'Save Changes'
                    : isKhmer
                    ? 'បន្ថែមសៀវភៅ'
                    : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: QUICK LOAN / BORROWING MODAL
          ========================================================================= */}
      {borrowModalBook && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setBorrowModalBook(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(7, 41, 77, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            className="admin-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '560px',
              width: '100%',
              background: '#ffffff',
              borderRadius: '20px',
              boxShadow: '0 25px 60px rgba(7, 41, 77, 0.25)',
              border: '1px solid #e2e8f0',
              padding: '0',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #e2e8f0',
                background: '#f8fafc',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#eff6ff',
                    color: '#1e73be',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BookmarkCheck size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#07294D' }}>
                    {isKhmer ? 'កត់ត្រាកិច្ចសន្យាខ្ចីសៀវភៅ' : 'Record Student Book Loan'}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {borrowModalBook.title_km}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setBorrowModalBook(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveBorrowing} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Book summary banner */}
                <div
                  style={{
                    padding: '12px 16px',
                    background: '#eff6ff',
                    borderRadius: '10px',
                    border: '1px solid #bfdbfe',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '700', color: '#07294D', fontSize: '0.9rem' }}>
                      {borrowModalBook.title_km}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#1e73be' }}>
                      📍 {borrowModalBook.shelf_location || 'No Shelf'} &bull; ISBN: {borrowModalBook.isbn || 'N/A'}
                    </div>
                  </div>
                  <span className="admin-book-stock-badge in-stock">
                    {borrowModalBook.available_copies} {isKhmer ? 'នៅសល់' : 'left'}
                  </span>
                </div>

                {/* Student Name */}
                <div>
                  <label className="admin-label">
                    {isKhmer ? 'ឈ្មោះសិស្ស-និស្សិត' : 'Student Full Name'}{' '}
                    <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={borrowFormData.student_name}
                    onChange={(e) => setBorrowFormData({ ...borrowFormData, student_name: e.target.value })}
                    className="admin-input"
                    placeholder={isKhmer ? 'ឧ. វឿន ចំរើន' : 'e.g. Voeun Chamroeun'}
                  />
                </div>

                {/* Student ID */}
                <div>
                  <label className="admin-label">
                    {isKhmer ? 'អត្តលេខសិស្ស / Student ID' : 'Student ID Code'}{' '}
                    <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={borrowFormData.student_id}
                    onChange={(e) => setBorrowFormData({ ...borrowFormData, student_id: e.target.value })}
                    className="admin-input"
                    placeholder="STU-2025-089"
                  />
                </div>

                {/* Dates Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label className="admin-label">{isKhmer ? 'កាលបរិច្ឆេទខ្ចី' : 'Borrow Date'}</label>
                    <input
                      type="date"
                      required
                      value={borrowFormData.borrow_date}
                      onChange={(e) => setBorrowFormData({ ...borrowFormData, borrow_date: e.target.value })}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="admin-label">{isKhmer ? 'កាលបរិច្ឆេទត្រូវសង' : 'Due Date'}</label>
                    <input
                      type="date"
                      required
                      value={borrowFormData.due_date}
                      onChange={(e) => setBorrowFormData({ ...borrowFormData, due_date: e.target.value })}
                      className="admin-input"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="admin-label">{isKhmer ? 'កំណត់សម្គាល់បន្ថែម' : 'Notes / Purpose'}</label>
                  <input
                    type="text"
                    value={borrowFormData.notes}
                    onChange={(e) => setBorrowFormData({ ...borrowFormData, notes: e.target.value })}
                    className="admin-input"
                    placeholder={isKhmer ? 'ឧ. ខ្ចីស្រាវជ្រាវធ្វើសារណា' : 'e.g. Research for final thesis'}
                  />
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  marginTop: '20px',
                  paddingTop: '16px',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setBorrowModalBook(null)}
                  className="admin-btn admin-btn-secondary"
                >
                  {isKhmer ? 'បោះបង់' : 'Cancel'}
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {isKhmer ? 'បញ្ជាក់ការខ្ចី' : 'Confirm Book Loan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: ADD / EDIT CATEGORY MODAL
          ========================================================================= */}
      {isCategoryModalOpen && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setIsCategoryModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(7, 41, 77, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            className="admin-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '540px',
              width: '100%',
              background: '#ffffff',
              borderRadius: '20px',
              boxShadow: '0 25px 60px rgba(7, 41, 77, 0.25)',
              border: '1px solid #e2e8f0',
              padding: '0',
            }}
          >
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #e2e8f0',
                background: '#f8fafc',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#07294D' }}>
                {editingCategory
                  ? isKhmer
                    ? 'កែសម្រួលប្រភេទសៀវភៅ'
                    : 'Edit Category'
                  : isKhmer
                  ? 'បន្ថែមប្រភេទសៀវភៅថ្មី'
                  : 'Add New Category'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="admin-label">
                    {isKhmer ? 'ឈ្មោះប្រភេទ (ភាសាខ្មែរ)' : 'Category Name (Khmer)'}{' '}
                    <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryFormData.name_km}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name_km: e.target.value })}
                    className="admin-input"
                    placeholder="ឧ. វិទ្យាសាស្ត្រកុំព្យូទ័រ (ICT)"
                  />
                </div>

                <div>
                  <label className="admin-label">
                    {isKhmer ? 'ឈ្មោះប្រភេទ (ភាសាអង់គ្លេស)' : 'Category Name (English)'}
                  </label>
                  <input
                    type="text"
                    value={categoryFormData.name_en}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name_en: e.target.value })}
                    className="admin-input"
                    placeholder="e.g. Computer Science & ICT"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label className="admin-label">{isKhmer ? 'កូដសម្គាល់' : 'Code'}</label>
                    <input
                      type="text"
                      value={categoryFormData.code}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, code: e.target.value })}
                      className="admin-input"
                      placeholder="CS-IT"
                    />
                  </div>
                  <div>
                    <label className="admin-label">{isKhmer ? 'ទីតាំងធ្នើ' : 'Shelf Location'}</label>
                    <input
                      type="text"
                      value={categoryFormData.shelf_location}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, shelf_location: e.target.value })}
                      className="admin-input"
                      placeholder="ជាន់ទី ២ - ប្លុក A"
                    />
                  </div>
                </div>

                <div>
                  <label className="admin-label">{isKhmer ? 'ការពិពណ៌នា' : 'Description'}</label>
                  <textarea
                    rows="3"
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                    className="admin-textarea"
                    placeholder="ពិពណ៌នាអំពីផ្នែកជំនាញ..."
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: '20px',
                  paddingTop: '16px',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="admin-btn admin-btn-secondary"
                >
                  {isKhmer ? 'បោះបង់' : 'Cancel'}
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {editingCategory
                    ? isKhmer
                      ? 'រក្សាទុក'
                      : 'Save'
                    : isKhmer
                    ? 'បង្កើតប្រភេទ'
                    : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: DELETE BOOK CONFIRMATION MODAL
          ========================================================================= */}
      {deleteModalBook && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setDeleteModalBook(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(7, 41, 77, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            className="admin-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '460px',
              width: '100%',
              background: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 25px 60px rgba(7, 41, 77, 0.25)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#fef2f2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Trash2 size={26} />
            </div>
            <h3 style={{ color: '#07294D', fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px' }}>
              {isKhmer ? 'បញ្ជាក់ការលុបសៀវភៅ?' : 'Delete This Book?'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
              {isKhmer
                ? `តើអ្នកប្រាកដជាចង់លុបសៀវភៅ «${deleteModalBook.title_km}» ចេញពីប្រព័ន្ធបណ្ណាល័យឬទេ? សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានឡើយ។`
                : `Are you sure you want to delete "${deleteModalBook.title_km}" from the library system? This action cannot be undone.`}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setDeleteModalBook(null)}
                className="admin-btn admin-btn-secondary"
                style={{ minWidth: '110px' }}
              >
                {isKhmer ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteBook}
                className="admin-btn admin-btn-danger"
                style={{ minWidth: '110px' }}
              >
                {isKhmer ? 'យល់ព្រមលុប' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: DELETE CATEGORY CONFIRMATION MODAL
          ========================================================================= */}
      {deleteModalCategory && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setDeleteModalCategory(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(7, 41, 77, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            className="admin-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '460px',
              width: '100%',
              background: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 25px 60px rgba(7, 41, 77, 0.25)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#fef2f2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Trash2 size={26} />
            </div>
            <h3 style={{ color: '#07294D', fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px' }}>
              {isKhmer ? 'បញ្ជាក់ការលុបប្រភេទសៀវភៅ?' : 'Delete This Category?'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
              {isKhmer
                ? `តើអ្នកប្រាកដជាចង់លុបប្រភេទ «${deleteModalCategory.name_km}» ឬទេ? សៀវភៅដែលស្ថិតក្នុងផ្នែកនេះនឹងត្រូវដកផ្នែកចេញ (Disassociated)។`
                : `Are you sure you want to delete "${deleteModalCategory.name_km}"? Books in this category will be disassociated.`}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setDeleteModalCategory(null)}
                className="admin-btn admin-btn-secondary"
                style={{ minWidth: '110px' }}
              >
                {isKhmer ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteCategory}
                className="admin-btn admin-btn-danger"
                style={{ minWidth: '110px' }}
              >
                {isKhmer ? 'យល់ព្រមលុប' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBooksPage;
