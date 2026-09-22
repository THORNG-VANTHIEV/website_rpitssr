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
  ChevronRight,
  Table as TableIcon,
  LayoutGrid,
  List,
  Laptop,
  Zap,
  Wrench,
  Coffee,
  Languages,
  Printer,
} from 'lucide-react';

const toKhmerNumber = (num) => {
  if (num === null || num === undefined) return '';
  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return num.toString().replace(/[0-9]/g, (digit) => khmerDigits[parseInt(digit, 10)]);
};

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
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [categoryViewMode, setCategoryViewMode] = useState('grid'); // 'grid' | 'list'
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [borrowingSearchQuery, setBorrowingSearchQuery] = useState('');
  const [borrowingStatusFilter, setBorrowingStatusFilter] = useState('all'); // all, borrowed, overdue, returned

  // Modals
  const [detailModalBook, setDetailModalBook] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deleteModalBook, setDeleteModalBook] = useState(null);
  const [borrowModalBook, setBorrowModalBook] = useState(null);
  const [detailModalBorrowing, setDetailModalBorrowing] = useState(null);
  const [deleteModalBorrowing, setDeleteModalBorrowing] = useState(null);
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

  // Filter Categories by search query
  const filteredCategories = useMemo(() => {
    if (!categorySearchQuery.trim()) return categories;
    const q = categorySearchQuery.toLowerCase().trim();
    return categories.filter((cat) => {
      return (
        (cat.name_km && cat.name_km.toLowerCase().includes(q)) ||
        (cat.name_en && cat.name_en.toLowerCase().includes(q)) ||
        (cat.code && cat.code.toLowerCase().includes(q)) ||
        (cat.shelf_location && cat.shelf_location.toLowerCase().includes(q)) ||
        (cat.description && cat.description.toLowerCase().includes(q))
      );
    });
  }, [categories, categorySearchQuery]);

  // Filter Borrowings by search query and status filter
  const filteredBorrowings = useMemo(() => {
    return borrowings.filter((b) => {
      const isOverdue = b.status === 'overdue' || (b.status === 'borrowed' && new Date(b.due_date) < new Date());
      const isReturned = b.status === 'returned';

      // Status filter
      if (borrowingStatusFilter === 'borrowed' && (isReturned || isOverdue)) return false;
      if (borrowingStatusFilter === 'overdue' && (!isOverdue || isReturned)) return false;
      if (borrowingStatusFilter === 'returned' && !isReturned) return false;

      // Search query
      if (borrowingSearchQuery.trim()) {
        const q = borrowingSearchQuery.toLowerCase().trim();
        const studentMatch =
          (b.student_name || '').toLowerCase().includes(q) ||
          (b.student_id || '').toLowerCase().includes(q);
        const bookTitle = b.book
          ? `${b.book.title_km || ''} ${b.book.title_en || ''}`
          : b.book_title || '';
        const bookMatch = bookTitle.toLowerCase().includes(q);
        const shelfMatch = (b.book?.shelf_location || '').toLowerCase().includes(q);
        return studentMatch || bookMatch || shelfMatch;
      }
      return true;
    });
  }, [borrowings, borrowingStatusFilter, borrowingSearchQuery]);

  // Borrowings Count Summaries
  const borrowingCounts = useMemo(() => {
    let borrowed = 0;
    let overdue = 0;
    let returned = 0;
    borrowings.forEach((b) => {
      const isOverdue = b.status === 'overdue' || (b.status === 'borrowed' && new Date(b.due_date) < new Date());
      const isReturned = b.status === 'returned';
      if (isReturned) returned++;
      else if (isOverdue) overdue++;
      else borrowed++;
    });
    return {
      all: borrowings.length,
      borrowed,
      overdue,
      returned,
    };
  }, [borrowings]);

  // Helper for Category Department Styling & Pastel Icon Avatar
  const getCategoryIconInfo = (cat) => {
    const code = (cat.code || '').toUpperCase();
    const name = ((cat.name_km || '') + ' ' + (cat.name_en || '')).toLowerCase();

    if (code.includes('CS') || code.includes('IT') || name.includes('ict') || name.includes('កុំព្យូទ័រ')) {
      return {
        bg: '#eff6ff',
        color: '#1e73be',
        border: '#dbeafe',
        icon: <Laptop size={20} />,
      };
    }
    if (code.includes('EE') || name.includes('អគ្គិសនី') || name.includes('electrical')) {
      return {
        bg: '#fffbeb',
        color: '#d97706',
        border: '#fde68a',
        icon: <Zap size={20} />,
      };
    }
    if (code.includes('CE') || name.includes('សំណង់') || name.includes('civil')) {
      return {
        bg: '#fff7ed',
        color: '#ea580c',
        border: '#fed7aa',
        icon: <Building2 size={20} />,
      };
    }
    if (code.includes('MECH') || code.includes('AUTO') || name.includes('រថយន្ត') || name.includes('automotive')) {
      return {
        bg: '#f5f3ff',
        color: '#7c3aed',
        border: '#ddd6fe',
        icon: <Wrench size={20} />,
      };
    }
    if (code.includes('TH') || code.includes('MGMT') || name.includes('ទេសចរណ៍') || name.includes('hospitality')) {
      return {
        bg: '#fdf2f8',
        color: '#db2777',
        border: '#fbcfe8',
        icon: <Coffee size={20} />,
      };
    }
    if (code.includes('LANG') || name.includes('ភាសា') || name.includes('language')) {
      return {
        bg: '#f0fdfa',
        color: '#0d9488',
        border: '#99f6e4',
        icon: <Languages size={20} />,
      };
    }
    return {
      bg: '#f8fafc',
      color: '#1e73be',
      border: '#e2e8f0',
      icon: <FolderTree size={20} />,
    };
  };

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

  // Delete Borrowing
  const handleDeleteBorrowing = async () => {
    if (!deleteModalBorrowing) return;
    try {
      const res = await fetch(`/api/admin/borrowings/${deleteModalBorrowing.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Accept': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to delete borrowing record');

      // If borrowing was active, restock the book
      if (deleteModalBorrowing.status !== 'returned' && deleteModalBorrowing.book_id) {
        setBooks((prev) =>
          prev.map((b) =>
            b.id === deleteModalBorrowing.book_id
              ? { ...b, available_copies: Math.min(b.total_copies, (b.available_copies || 0) + 1) }
              : b
          )
        );
      }

      setBorrowings((prev) => prev.filter((b) => b.id !== deleteModalBorrowing.id));
      showToast(isKhmer ? 'បានលុបកំណត់ត្រាខ្ចីសៀវភៅជោគជ័យ' : 'Borrowing record deleted');
      setDeleteModalBorrowing(null);
    } catch (err) {
      console.error('Delete borrowing error:', err);
      alert(err.message || 'Failed to delete borrowing record');
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
      <div
        className="admin-page-header admin-books-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
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
              backgroundColor: '#eff6ff',
              color: '#1e73be',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '8px',
              border: '1px solid #dbeafe',
            }}
          >
            <BookOpen size={14} />
            <span>{isKhmer ? 'ប្រព័ន្ធបណ្ណាល័យស្ថាប័ន & កាតាឡុកសៀវភៅ TVET' : 'Institutional Library & TVET Books Catalog'}</span>
          </div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#07294D',
              margin: '0 0 6px 0',
              lineHeight: 1.2,
            }}
          >
            {isKhmer ? 'កាតាឡុកសៀវភៅ និងឯកសារស្រាវជ្រាវបច្ចេកទេស' : 'Library Catalog & Technical Books Management'}
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.92rem', lineHeight: 1.5 }}>
            {isKhmer
              ? 'គ្រប់គ្រងសៀវភៅសិក្សា ឯកសារយោងបច្ចេកទេស TVET លេខកូដ ISBN/Barcode ទីតាំងធ្នើ កិច្ចការខ្ចី-សង និងសៀវភៅអេឡិចត្រូនិច E-Books។'
              : 'Comprehensive catalog of textbooks, TVET technical reference manuals, ISBN barcode placements, student borrowing loans, and digital e-books.'}
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="admin-books-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={fetchData}
            disabled={refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ffffff',
              color: '#07294D',
              border: '1px solid #e2e8f0',
              padding: '9px 14px',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <RefreshCw size={15} className={refreshing ? 'spin-icon' : ''} />
            <span>{isKhmer ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ffaf00',
              color: '#07294D',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '24px',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(255, 175, 0, 0.35)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f59e0b';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#ffaf00';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Plus size={17} strokeWidth={2.5} />
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
          <BookOpen size={16} />
          <span>{isKhmer ? 'កាតាឡុកសៀវភៅ' : 'Book Catalog'}</span>
          <span className="admin-tab-count">
            {loading ? '...' : isKhmer ? toKhmerNumber(books.length) : books.length}
          </span>
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <FolderTree size={16} />
          <span>{isKhmer ? 'ប្រភេទសៀវភៅ' : 'Categories'}</span>
          <span className="admin-tab-count">
            {loading ? '...' : isKhmer ? toKhmerNumber(categories.length) : categories.length}
          </span>
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'borrowings' ? 'active' : ''}`}
          onClick={() => setActiveTab('borrowings')}
        >
          <BookmarkCheck size={16} />
          <span>{isKhmer ? 'កិច្ចការខ្ចី-សង' : 'Borrowings & Loans'}</span>
          <span className="admin-tab-count">
            {loading ? '...' : isKhmer ? toKhmerNumber(borrowings.length) : borrowings.length}
          </span>
        </button>
      </div>

      {/* =========================================================================
          3. 4-Card Institutional KPI Metric Strip
          ========================================================================= */}
      <div className="admin-kpi-grid" style={{ marginBottom: '24px' }}>
        {/* Metric 1: Total Book Titles */}
        <div
          className="admin-kpi-card"
          onClick={() => {
            setActiveTab('books');
            setAvailabilityFilter('all');
          }}
          style={{ cursor: 'pointer' }}
          title={isKhmer ? 'ចុចដើម្បីមើលសៀវភៅទាំងអស់' : 'Click to view all books'}
        >
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">
                {isKhmer ? 'ចំណងជើងសៀវភៅសរុប' : 'Total Book Titles'}
              </span>
              <div className="admin-kpi-value">
                {loading ? '...' : isKhmer ? toKhmerNumber(metrics.totalTitles) : metrics.totalTitles}
              </div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#1e73be' }} />
                <span>{isKhmer ? 'កាតាឡុកសៀវភៅសិក្សា' : 'Institution Catalog'}</span>
              </div>
            </div>

            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#eff6ff', color: '#1e73be' }}>
                {isKhmer ? 'កាតាឡុក' : 'Titles'}
              </span>
              <div
                className="admin-kpi-icon-badge"
                style={{
                  background: '#eff6ff',
                  color: '#1e73be',
                  border: '1px solid #dbeafe',
                }}
              >
                <BookOpen size={24} />
              </div>
            </div>
          </div>

          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'មើលកាតាឡុកសៀវភៅ' : 'View book catalog'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* Metric 2: Total Volumes / Physical Copies */}
        <div
          className="admin-kpi-card"
          onClick={() => {
            setActiveTab('books');
          }}
          style={{ cursor: 'pointer' }}
          title={isKhmer ? 'ចុចដើម្បីគ្រប់គ្រងក្បាលសៀវភៅ' : 'Click to manage book copies'}
        >
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">
                {isKhmer ? 'ចំនួនក្បាលសៀវភៅសរុប' : 'Total Physical Copies'}
              </span>
              <div className="admin-kpi-value">
                {loading ? '...' : isKhmer ? toKhmerNumber(metrics.totalCopies) : metrics.totalCopies}
              </div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#059669' }} />
                <span>
                  {isKhmer
                    ? `មាន ${toKhmerNumber(metrics.totalEbooks)} ជា E-Book`
                    : `${metrics.totalEbooks} E-Book PDFs`}
                </span>
              </div>
            </div>

            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#f0fdf4', color: '#059669' }}>
                {isKhmer ? 'ក្បាលសៀវភៅ' : 'Copies'}
              </span>
              <div
                className="admin-kpi-icon-badge"
                style={{
                  background: '#f0fdf4',
                  color: '#059669',
                  border: '1px solid #bbf7d0',
                }}
              >
                <Layers size={24} />
              </div>
            </div>
          </div>

          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'ក្បាលសៀវភៅក្នុងប្រព័ន្ធ' : 'Physical & Digital copies'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* Metric 3: Available Copies */}
        <div
          className="admin-kpi-card"
          onClick={() => {
            setActiveTab('books');
            setAvailabilityFilter('available');
          }}
          style={{ cursor: 'pointer' }}
          title={isKhmer ? 'ចុចដើម្បីបង្ហាញសៀវភៅមានក្នុងស្តុក' : 'Click to filter available books'}
        >
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">
                {isKhmer ? 'ច្បាប់មានក្នុងស្តុក' : 'Available Copies'}
              </span>
              <div className="admin-kpi-value">
                {loading ? '...' : isKhmer ? toKhmerNumber(metrics.availableCopies) : metrics.availableCopies}
              </div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#ca8a04' }} />
                <span>{isKhmer ? 'ត្រៀមសម្រាប់ខ្ចីអាន' : 'Ready for loans'}</span>
              </div>
            </div>

            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#fefce8', color: '#ca8a04' }}>
                {isKhmer ? 'ក្នុងស្តុក' : 'In Stock'}
              </span>
              <div
                className="admin-kpi-icon-badge"
                style={{
                  background: '#fefce8',
                  color: '#ca8a04',
                  border: '1px solid #fef08a',
                }}
              >
                <CheckCircle2 size={24} />
              </div>
            </div>
          </div>

          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'ចម្រាញ់សៀវភៅក្នុងស្តុក' : 'Filter available in stock'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* Metric 4: Active Borrowings */}
        <div
          className="admin-kpi-card"
          onClick={() => {
            setActiveTab('borrowings');
          }}
          style={{ cursor: 'pointer' }}
          title={isKhmer ? 'ចុចដើម្បីពិនិត្យកំណត់ត្រាខ្ចី' : 'Click to view active student loans'}
        >
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">
                {isKhmer ? 'សៀវភៅកំពុងខ្ចី' : 'Active Student Loans'}
              </span>
              <div className="admin-kpi-value">
                {loading ? '...' : isKhmer ? toKhmerNumber(metrics.activeLoans) : metrics.activeLoans}
              </div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#ea580c' }} />
                <span>{isKhmer ? 'សិស្សកំពុងខ្ចីស្រាវជ្រាវ' : 'In circulation'}</span>
              </div>
            </div>

            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#fff7ed', color: '#ea580c' }}>
                {isKhmer ? 'កំពុងខ្ចី' : 'Loans'}
              </span>
              <div
                className="admin-kpi-icon-badge"
                style={{
                  background: '#fff7ed',
                  color: '#ea580c',
                  border: '1px solid #fed7aa',
                }}
              >
                <BookmarkCheck size={24} />
              </div>
            </div>
          </div>

          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'ពិនិត្យកិច្ចការខ្ចី-សង' : 'Manage student loans'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
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
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '18px 20px',
              marginBottom: '22px',
              boxShadow: '0 2px 10px rgba(7, 41, 77, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {/* Top row: Search input & Category dropdown & Sort dropdown */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Search Box */}
              <div style={{ flex: '1 1 300px', position: 'relative' }}>
                <Search
                  size={16}
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
                  style={{
                    width: '100%',
                    padding: '9px 38px 9px 38px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.86rem',
                    color: '#07294D',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1e73be';
                    e.target.style.boxShadow = '0 0 0 3px rgba(30, 115, 190, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
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
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2px',
                    }}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Category Select */}
              <div style={{ flex: '0 0 240px' }}>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 14px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.86rem',
                    color: '#07294D',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1e73be';
                    e.target.style.boxShadow = '0 0 0 3px rgba(30, 115, 190, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
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
              <div style={{ flex: '0 0 210px' }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 14px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.86rem',
                    color: '#07294D',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1e73be';
                    e.target.style.boxShadow = '0 0 0 3px rgba(30, 115, 190, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="newest">{isKhmer ? 'ថ្មីបំផុត (Newest)' : 'Newest First'}</option>
                  <option value="title_asc">{isKhmer ? 'ចំណងជើង (A-Z / ក-អ)' : 'Title (A-Z)'}</option>
                  <option value="copies_desc">{isKhmer ? 'ចំនួនក្បាលច្រើនបំផុត' : 'Most Total Copies'}</option>
                  <option value="available_desc">{isKhmer ? 'មានក្នុងស្តុកច្រើនបំផុត' : 'Most Available'}</option>
                </select>
              </div>
            </div>

            {/* Bottom row: Availability quick pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '5px', marginRight: '4px' }}>
                <SlidersHorizontal size={14} />
                <span>{isKhmer ? 'ស្ថានភាពស្តុក ៖' : 'Stock Status:'}</span>
              </span>
              {[
                {
                  key: 'all',
                  label: isKhmer ? 'ទាំងអស់' : 'All Books',
                  count: books.length,
                  icon: <Layers size={13} />,
                },
                {
                  key: 'available',
                  label: isKhmer ? 'មានក្នុងស្តុក' : 'Available',
                  count: books.filter((b) => (b.available_copies || 0) > 0).length,
                  icon: <CheckCircle2 size={13} color="#059669" />,
                },
                {
                  key: 'unavailable',
                  label: isKhmer ? 'អស់ពីស្តុក / ខ្ចីអស់' : 'Out of Stock',
                  count: books.filter((b) => (b.available_copies || 0) <= 0).length,
                  icon: <AlertCircle size={13} color="#dc2626" />,
                },
                {
                  key: 'ebook',
                  label: isKhmer ? 'សៀវភៅ E-Book' : 'E-Books (PDF)',
                  count: books.filter((b) => b.is_ebook).length,
                  icon: <FileText size={13} color="#7c3aed" />,
                },
              ].map((item) => {
                const isActive = availabilityFilter === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setAvailabilityFilter(item.key)}
                    style={{
                      padding: '6px 13px',
                      borderRadius: '20px',
                      fontSize: '0.82rem',
                      fontWeight: isActive ? '700' : '600',
                      border: '1px solid',
                      borderColor: isActive ? '#1e73be' : '#e2e8f0',
                      background: isActive ? '#eff6ff' : '#ffffff',
                      color: isActive ? '#1e73be' : '#475569',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? '0 1px 3px rgba(30, 115, 190, 0.15)' : 'none',
                    }}
                    onMouseOver={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    <span
                      style={{
                        background: isActive ? '#1e73be' : '#f1f5f9',
                        color: isActive ? '#ffffff' : '#64748b',
                        borderRadius: '10px',
                        padding: '1px 7px',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                      }}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DataTable & Card Grid */}
          <div className="admin-card" style={{ overflow: 'hidden' }}>
            <div
              className="admin-card-header"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '18px 20px',
                borderBottom: '1px solid #f1f5f9',
                backgroundColor: '#ffffff',
              }}
            >
              <div>
                <h3 className="admin-card-title" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#07294D', margin: '0 0 2px 0' }}>
                  {isKhmer ? 'កាតាឡុកសៀវភៅបណ្ណាល័យវិទ្យាស្ថាន' : 'RPITSSR Library Book Catalog'}
                </h3>
                <p className="admin-card-subtitle" style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
                  {isKhmer
                    ? `បង្ហាញសៀវភៅចំនួន ${filteredBooks.length} ក្នុងចំណោម ${books.length} សៀវភៅសរុប`
                    : `Showing ${filteredBooks.length} of ${books.length} total books`}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* View Mode Toggle */}
                <div
                  style={{
                    display: 'flex',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '8px',
                    padding: '2px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <button
                    onClick={() => setViewMode('table')}
                    title={isKhmer ? 'ទិដ្ឋភាពតារាង' : 'Table View'}
                    style={{
                      border: 'none',
                      background: viewMode === 'table' ? '#ffffff' : 'transparent',
                      color: viewMode === 'table' ? '#07294D' : '#64748b',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.8rem',
                      fontWeight: viewMode === 'table' ? 700 : 500,
                      boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <TableIcon size={15} />
                    <span>{isKhmer ? 'តារាង' : 'Table'}</span>
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    title={isKhmer ? 'ទិដ្ឋភាពកាត' : 'Grid View'}
                    style={{
                      border: 'none',
                      background: viewMode === 'grid' ? '#ffffff' : 'transparent',
                      color: viewMode === 'grid' ? '#07294D' : '#64748b',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.8rem',
                      fontWeight: viewMode === 'grid' ? 700 : 500,
                      boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <LayoutGrid size={15} />
                    <span>{isKhmer ? 'កាត' : 'Grid'}</span>
                  </button>
                </div>

                {/* Add Book Button */}
                <button
                  onClick={handleOpenCreateModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#ffaf00',
                    color: '#07294D',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(255, 175, 0, 0.25)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f59e0b')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffaf00')}
                >
                  <Plus size={15} />
                  <span>{isKhmer ? 'បន្ថែមសៀវភៅ' : 'Add Book'}</span>
                </button>
              </div>
            </div>

            {/* Empty State */}
            {filteredBooks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#ffffff' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1e73be',
                    margin: '0 auto 16px',
                  }}
                >
                  <BookOpen size={32} />
                </div>
                <h4 style={{ color: '#07294D', fontWeight: 800, fontSize: '1.1rem', marginBottom: '6px' }}>
                  {isKhmer ? 'រកមិនឃើញសៀវភៅដែលត្រូវនឹងលក្ខខណ្ឌស្វែងរក' : 'No books matched your criteria'}
                </h4>
                <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 20px' }}>
                  {isKhmer
                    ? 'សូមសាកល្បងផ្លាស់ប្តូរពាក្យស្វែងរក ជ្រើសរើសផ្នែកជំនាញផ្សេង ឬកំណត់ជម្រើសចម្រាញ់ឡើងវិញ'
                    : 'Try adjusting your search query, selecting another category, or clearing filters'}
                </p>
                <button
                  onClick={handleOpenCreateModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#07294D',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} />
                  <span>{isKhmer ? 'បន្ថែមសៀវភៅថ្មី' : 'Add New Book'}</span>
                </button>
              </div>
            ) : viewMode === 'table' ? (
              /* TABLE VIEW: Crisp daylight white table */
              <>
                <div className="admin-table-wrapper admin-books-desktop-table" style={{ overflowX: 'auto' }}>
                  <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr
                        style={{
                          backgroundColor: '#f8fafc',
                          borderBottom: '1px solid #e2e8f0',
                          color: '#475569',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        <th style={{ padding: '14px 20px', width: '42%' }}>
                          {isKhmer ? 'ព័ត៌មានសៀវភៅ & អ្នកនិពន្ធ' : 'Book Details & Author'}
                        </th>
                        <th style={{ padding: '14px 16px', width: '18%' }}>
                          {isKhmer ? 'ផ្នែក / ជំនាញ' : 'Category'}
                        </th>
                        <th style={{ padding: '14px 16px', width: '16%' }}>
                          {isKhmer ? 'កូដ ISBN & ធ្នើ' : 'ISBN & Shelf'}
                        </th>
                        <th style={{ padding: '14px 16px', width: '13%' }}>
                          {isKhmer ? 'ស្ថានភាពស្តុក' : 'Availability'}
                        </th>
                        <th style={{ padding: '14px 20px', width: '11%', textAlign: 'right' }}>
                          {isKhmer ? 'សកម្មភាព' : 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBooks.map((book) => {
                        const avail = book.available_copies ?? book.total_copies ?? 0;
                        const total = book.total_copies || 1;
                        const isLow = avail > 0 && avail <= 2;
                        const isOut = avail <= 0;
                        const percentage = Math.min(100, Math.round((avail / total) * 100));

                        return (
                          <tr
                            key={book.id}
                            style={{
                              borderBottom: '1px solid #f1f5f9',
                              transition: 'background-color 0.15s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                          >
                            {/* Column 1: Cover + Book Info */}
                            <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                {/* Cover */}
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                  {book.cover_image ? (
                                    <img
                                      src={book.cover_image}
                                      alt={book.title_km}
                                      className="admin-book-cover-thumb"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div
                                    className="admin-book-cover-placeholder"
                                    style={{ display: book.cover_image ? 'none' : 'flex' }}
                                  >
                                    <BookOpen size={18} color="#ffaf00" style={{ marginBottom: '4px' }} />
                                    <span style={{ fontSize: '0.62rem', fontWeight: 800 }}>RPITSSR</span>
                                  </div>
                                </div>

                                {/* Title & Metadata */}
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                                    <span
                                      style={{
                                        fontWeight: 700,
                                        color: '#07294D',
                                        fontSize: '0.96rem',
                                        cursor: 'pointer',
                                        lineHeight: 1.35,
                                        transition: 'color 0.15s ease',
                                      }}
                                      onClick={() => setDetailModalBook(book)}
                                      title={isKhmer ? 'ចុចដើម្បីមើលព័ត៌មានលម្អិត' : 'Click to view full details'}
                                      onMouseEnter={(e) => (e.currentTarget.style.color = '#1e73be')}
                                      onMouseLeave={(e) => (e.currentTarget.style.color = '#07294D')}
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
                                          padding: '2px 7px',
                                          borderRadius: '6px',
                                          background: '#fefce8',
                                          color: '#b45309',
                                          fontSize: '0.72rem',
                                          fontWeight: 700,
                                          border: '1px solid #fef08a',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '3px',
                                        }}
                                      >
                                        ★ {isKhmer ? 'ណែនាំ' : 'Featured'}
                                      </span>
                                    )}
                                  </div>

                                  {book.title_en && (
                                    <div style={{ fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic', marginBottom: '4px', lineHeight: 1.3 }}>
                                      {book.title_en}
                                    </div>
                                  )}

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.78rem', color: '#64748b', flexWrap: 'wrap' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#334155', fontWeight: 600 }}>
                                      <User size={12} color="#64748b" /> {book.author || 'RPITSSR Faculty'}
                                    </span>
                                    {book.publisher && (
                                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#94a3b8' }}>
                                        &bull; {book.publisher} {book.publish_year ? `(${book.publish_year})` : ''}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Column 2: Category */}
                            <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '4px 10px',
                                  background: '#eff6ff',
                                  color: '#1e73be',
                                  border: '1px solid #dbeafe',
                                  borderRadius: '8px',
                                  fontSize: '0.82rem',
                                  fontWeight: 600,
                                }}
                              >
                                <FolderTree size={12} />
                                {book.category
                                  ? isKhmer
                                    ? book.category.name_km
                                    : book.category.name_en || book.category.name_km
                                  : 'ទូទៅ'}
                              </span>
                            </td>

                            {/* Column 3: ISBN & Shelf Location */}
                            <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <span className="admin-book-isbn-badge">
                                  <Hash size={11} color="#64748b" />
                                  {book.isbn || 'គ្មាន ISBN'}
                                </span>
                                <span className="admin-book-shelf-badge">
                                  <MapPin size={11} color="#1e73be" />
                                  {book.shelf_location || 'ធ្នើទូទៅ'}
                                </span>
                              </div>
                            </td>

                            {/* Column 4: Stock Status & Progress Bar */}
                            <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxWidth: '120px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      fontSize: '0.8rem',
                                      fontWeight: 700,
                                      color: isOut ? '#dc2626' : isLow ? '#d97706' : '#059669',
                                    }}
                                  >
                                    {isOut ? (
                                      <AlertCircle size={13} color="#dc2626" />
                                    ) : isLow ? (
                                      <Clock size={13} color="#d97706" />
                                    ) : (
                                      <CheckCircle2 size={13} color="#059669" />
                                    )}
                                    <span>{avail} / {total}</span>
                                  </span>
                                  <span
                                    style={{
                                      fontSize: '0.72rem',
                                      fontWeight: 600,
                                      color: isOut ? '#ef4444' : isLow ? '#f59e0b' : '#10b981',
                                    }}
                                  >
                                    {percentage}%
                                  </span>
                                </div>

                                {/* Progress Track */}
                                <div
                                  style={{
                                    width: '100%',
                                    height: '5px',
                                    borderRadius: '3px',
                                    background: '#e2e8f0',
                                    overflow: 'hidden',
                                  }}
                                >
                                  <div
                                    style={{
                                      width: `${percentage}%`,
                                      height: '100%',
                                      borderRadius: '3px',
                                      backgroundColor: isOut ? '#dc2626' : isLow ? '#d97706' : '#059669',
                                    }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Column 5: Action Buttons */}
                            <td style={{ padding: '16px 20px', verticalAlign: 'middle', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                {/* Quick Loan */}
                                <button
                                  onClick={() => handleOpenBorrowModal(book)}
                                  disabled={isOut}
                                  title={isOut ? (isKhmer ? 'អស់ពីស្តុក' : 'Out of Stock') : (isKhmer ? 'កត់ត្រាការខ្ចីសៀវភៅនេះ' : 'Record Loan for Student')}
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    border: '1px solid',
                                    borderColor: isOut ? '#e2e8f0' : '#bfdbfe',
                                    background: isOut ? '#f8fafc' : '#eff6ff',
                                    color: isOut ? '#cbd5e1' : '#1e73be',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: isOut ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.15s ease',
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isOut) {
                                      e.currentTarget.style.background = '#dbeafe';
                                      e.currentTarget.style.borderColor = '#93c5fd';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isOut) {
                                      e.currentTarget.style.background = '#eff6ff';
                                      e.currentTarget.style.borderColor = '#bfdbfe';
                                    }
                                  }}
                                >
                                  <BookmarkCheck size={15} />
                                </button>

                                {/* View Details */}
                                <button
                                  onClick={() => setDetailModalBook(book)}
                                  title={isKhmer ? 'ពិនិត្យមើលព័ត៌មានលម្អិត' : 'View Full Details'}
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    background: '#ffffff',
                                    color: '#475569',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f1f5f9';
                                    e.currentTarget.style.borderColor = '#cbd5e1';
                                    e.currentTarget.style.color = '#07294D';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#ffffff';
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                    e.currentTarget.style.color = '#475569';
                                  }}
                                >
                                  <Eye size={15} />
                                </button>

                                {/* Edit Book */}
                                <button
                                  onClick={() => handleOpenEditModal(book)}
                                  title={isKhmer ? 'កែសម្រួលព័ត៌មាន' : 'Edit Book'}
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    background: '#ffffff',
                                    color: '#059669',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f0fdf4';
                                    e.currentTarget.style.borderColor = '#86efac';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#ffffff';
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                  }}
                                >
                                  <Edit2 size={15} />
                                </button>

                                {/* Delete Book */}
                                <button
                                  onClick={() => setDeleteModalBook(book)}
                                  title={isKhmer ? 'លុបសៀវភៅ' : 'Delete Book'}
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    border: '1px solid #fecaca',
                                    background: '#ffffff',
                                    color: '#dc2626',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#fef2f2';
                                    e.currentTarget.style.borderColor = '#fca5a5';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#ffffff';
                                    e.currentTarget.style.borderColor = '#fecaca';
                                  }}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards for Books Catalog (< 768px) */}
                <div className="admin-books-mobile-cards">
                  {filteredBooks.map((book) => {
                    const avail = book.available_copies ?? book.total_copies ?? 0;
                    const total = book.total_copies || 1;
                    const isLow = avail > 0 && avail <= 2;
                    const isOut = avail <= 0;
                    const percentage = Math.min(100, Math.round((avail / total) * 100));

                    return (
                      <div
                        key={book.id}
                        className="admin-user-mobile-card"
                        style={{
                          background: '#ffffff',
                          borderRadius: '16px',
                          border: '1px solid #e2e8f0',
                          padding: '16px',
                          boxShadow: '0 2px 10px rgba(7, 41, 77, 0.04)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                        }}
                      >
                        {/* Top: Cover + Titles + Badges */}
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          {/* Cover thumbnail */}
                          <div style={{ flexShrink: 0 }}>
                            {book.cover_image ? (
                              <img
                                src={book.cover_image}
                                alt={book.title_km}
                                style={{
                                  width: '52px',
                                  height: '74px',
                                  objectFit: 'cover',
                                  borderRadius: '8px',
                                  boxShadow: '0 3px 10px rgba(7, 41, 77, 0.12)',
                                  border: '1px solid #e2e8f0',
                                  backgroundColor: '#f1f5f9',
                                  display: 'block',
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div
                              className="admin-book-cover-placeholder"
                              style={{
                                display: book.cover_image ? 'none' : 'flex',
                                width: '52px',
                                height: '74px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #07294D, #1e73be)',
                                color: '#ffffff',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <BookOpen size={20} color="#ffaf00" style={{ marginBottom: '4px' }} />
                              <span style={{ fontSize: '0.62rem', fontWeight: 800 }}>RPITSSR</span>
                            </div>
                          </div>

                          {/* Info */}
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap', marginBottom: '4px' }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '2px 7px',
                                  background: '#eff6ff',
                                  color: '#1e73be',
                                  border: '1px solid #dbeafe',
                                  borderRadius: '6px',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                }}
                              >
                                <FolderTree size={11} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                                  {book.category
                                    ? isKhmer
                                      ? book.category.name_km
                                      : book.category.name_en || book.category.name_km
                                    : 'ទូទៅ'}
                                </span>
                              </span>
                              {book.is_ebook && (
                                <span style={{ padding: '2px 6px', background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '4px', color: '#7c3aed', fontSize: '0.68rem', fontWeight: 700 }}>
                                  E-Book
                                </span>
                              )}
                              {book.is_featured && (
                                <span style={{ padding: '2px 6px', background: '#fefce8', border: '1px solid #fef08a', borderRadius: '4px', color: '#b45309', fontSize: '0.68rem', fontWeight: 700 }}>
                                  ★
                                </span>
                              )}
                            </div>

                            <h4
                              style={{
                                fontSize: '0.94rem',
                                fontWeight: 700,
                                color: '#07294D',
                                lineHeight: 1.35,
                                margin: '0 0 3px 0',
                                cursor: 'pointer',
                              }}
                              onClick={() => setDetailModalBook(book)}
                            >
                              {book.title_km}
                            </h4>
                            {book.title_en && (
                              <div style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {book.title_en}
                              </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.74rem', color: '#64748b' }}>
                              <span>{book.author || (isKhmer ? 'មិនបញ្ជាក់អ្នកនិពន្ធ' : 'Unknown Author')}</span>
                              {book.published_year && <span>• {book.published_year}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Shelf & ISBN row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '7px 10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9', fontSize: '0.76rem' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontWeight: 600 }}>
                            <MapPin size={12} />
                            <span>{book.shelf_location || 'ធ្នើទូទៅ'}</span>
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748b', fontFamily: 'monospace' }}>
                            <Hash size={11} />
                            <span>{book.isbn || 'គ្មាន ISBN'}</span>
                          </span>
                        </div>

                        {/* Stock status progress bar */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                            <span style={{ fontWeight: 700, color: isOut ? '#dc2626' : isLow ? '#d97706' : '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              {isOut ? <AlertCircle size={13} color="#dc2626" /> : isLow ? <Clock size={13} color="#d97706" /> : <CheckCircle2 size={13} color="#059669" />}
                              <span>{isKhmer ? 'ស្តុក ៖ ' : 'Stock: '} {avail} / {total} {isKhmer ? 'ក្បាល' : 'copies'}</span>
                            </span>
                            <span style={{ fontWeight: 700, color: isOut ? '#ef4444' : isLow ? '#f59e0b' : '#10b981' }}>{percentage}%</span>
                          </div>
                          <div style={{ width: '100%', height: '5px', borderRadius: '3px', background: '#e2e8f0', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${percentage}%`,
                                height: '100%',
                                borderRadius: '3px',
                                backgroundColor: isOut ? '#dc2626' : isLow ? '#d97706' : '#059669',
                              }}
                            />
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                          {/* Loan */}
                          <button
                            onClick={() => handleOpenBorrowModal(book)}
                            disabled={isOut}
                            style={{
                              flex: 1,
                              height: '34px',
                              borderRadius: '8px',
                              border: isOut ? '1px solid #e2e8f0' : '1px solid #bfdbfe',
                              background: isOut ? '#f8fafc' : '#eff6ff',
                              color: isOut ? '#94a3b8' : '#1e73be',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: isOut ? 'not-allowed' : 'pointer',
                            }}
                          >
                            <BookmarkCheck size={13} />
                            <span>{isKhmer ? 'ខ្ចី' : 'Loan'}</span>
                          </button>

                          {/* View */}
                          <button
                            onClick={() => setDetailModalBook(book)}
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              background: '#ffffff',
                              color: '#07294D',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                            title={isKhmer ? 'មើលព័ត៌មានលម្អិត' : 'View Details'}
                          >
                            <Eye size={14} />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEditModal(book)}
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              background: '#ffffff',
                              color: '#059669',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                            title={isKhmer ? 'កែសម្រួល' : 'Edit Book'}
                          >
                            <Edit2 size={14} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteModalBook(book)}
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '8px',
                              border: '1px solid #fecaca',
                              background: '#ffffff',
                              color: '#dc2626',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                            title={isKhmer ? 'លុបសៀវភៅ' : 'Delete Book'}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              /* GRID / CARDS VIEW: Daylight university library publication cards */
              <div className="admin-book-grid">
                {filteredBooks.map((book) => {
                  const avail = book.available_copies ?? book.total_copies ?? 0;
                  const total = book.total_copies || 1;
                  const isLow = avail > 0 && avail <= 2;
                  const isOut = avail <= 0;
                  const percentage = Math.min(100, Math.round((avail / total) * 100));

                  return (
                    <div key={book.id} className="admin-book-card">
                      {/* Card Header with Cover and Metadata */}
                      <div className="admin-book-card-header">
                        {/* Cover thumbnail */}
                        <div style={{ flexShrink: 0 }}>
                          {book.cover_image ? (
                            <img
                              src={book.cover_image}
                              alt={book.title_km}
                              style={{
                                width: '54px',
                                height: '76px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(7, 41, 77, 0.12)',
                                border: '1px solid #e2e8f0',
                                backgroundColor: '#f1f5f9',
                                display: 'block',
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className="admin-book-cover-placeholder"
                            style={{
                              display: book.cover_image ? 'none' : 'flex',
                              width: '54px',
                              height: '76px',
                            }}
                          >
                            <BookOpen size={20} color="#ffaf00" style={{ marginBottom: '4px' }} />
                            <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>RPITSSR</span>
                          </div>
                        </div>

                        {/* Quick meta beside cover */}
                        <div style={{ minWidth: 0, flex: 1 }}>
                          {/* Category tag */}
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              background: '#eff6ff',
                              color: '#1e73be',
                              border: '1px solid #dbeafe',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              marginBottom: '6px',
                              maxWidth: '100%',
                            }}
                          >
                            <FolderTree size={11} style={{ flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {book.category
                                ? isKhmer
                                  ? book.category.name_km
                                  : book.category.name_en || book.category.name_km
                                : 'ទូទៅ'}
                            </span>
                          </span>

                          {/* Shelf & ISBN */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={11} color="#1e73be" style={{ flexShrink: 0 }} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {book.shelf_location || 'ធ្នើទូទៅ'}
                              </span>
                            </span>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                color: '#475569',
                                fontFamily: 'monospace',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Hash size={11} color="#64748b" style={{ flexShrink: 0 }} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {book.isbn || 'គ្មាន ISBN'}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="admin-book-card-body">
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                          <h4
                            style={{
                              fontSize: '0.94rem',
                              fontWeight: 700,
                              color: '#07294D',
                              lineHeight: 1.35,
                              margin: 0,
                              flex: 1,
                              cursor: 'pointer',
                            }}
                            onClick={() => setDetailModalBook(book)}
                            title={isKhmer ? 'ចុចដើម្បីមើលព័ត៌មានលម្អិត' : 'Click to view full details'}
                          >
                            {book.title_km}
                          </h4>
                          {book.is_ebook && (
                            <span
                              style={{
                                padding: '2px 6px',
                                background: '#faf5ff',
                                border: '1px solid #e9d5ff',
                                borderRadius: '4px',
                                color: '#7c3aed',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              E-Book
                            </span>
                          )}
                          {book.is_featured && (
                            <span
                              style={{
                                padding: '2px 6px',
                                background: '#fefce8',
                                border: '1px solid #fef08a',
                                borderRadius: '4px',
                                color: '#b45309',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              ★
                            </span>
                          )}
                        </div>

                        {book.title_en && (
                          <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', marginBottom: '8px', lineHeight: 1.3 }}>
                            {book.title_en}
                          </div>
                        )}

                        <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '14px', flexWrap: 'wrap' }}>
                          <User size={12} color="#64748b" />
                          <span style={{ fontWeight: 600 }}>{book.author || 'RPITSSR Faculty'}</span>
                          {book.publish_year && <span style={{ color: '#94a3b8' }}>({book.publish_year})</span>}
                        </div>

                        {/* Stock Meter */}
                        <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px dashed #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span
                              style={{
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                color: isOut ? '#dc2626' : isLow ? '#d97706' : '#059669',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              {isOut ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
                              <span>{avail} / {total} {isKhmer ? 'ក្បាល' : 'copies'}</span>
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                              {isOut ? (isKhmer ? 'អស់ពីស្តុក' : 'Out of Stock') : (isKhmer ? 'មានក្នុងស្តុក' : 'Available')}
                            </span>
                          </div>
                          <div style={{ height: '4px', borderRadius: '2px', background: '#e2e8f0', overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${percentage}%`,
                                background: isOut ? '#ef4444' : isLow ? '#f59e0b' : '#10b981',
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="admin-book-card-footer">
                        <button
                          onClick={() => handleOpenBorrowModal(book)}
                          disabled={isOut}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid',
                            borderColor: isOut ? '#e2e8f0' : '#bfdbfe',
                            background: isOut ? '#ffffff' : '#eff6ff',
                            color: isOut ? '#cbd5e1' : '#1e73be',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: isOut ? 'not-allowed' : 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <BookmarkCheck size={13} />
                          <span>{isKhmer ? 'កត់ត្រាខ្ចី' : 'Loan'}</span>
                        </button>

                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => setDetailModalBook(book)}
                            title={isKhmer ? 'ពិនិត្យលម្អិត' : 'View Details'}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0',
                              background: '#ffffff',
                              color: '#475569',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(book)}
                            title={isKhmer ? 'កែសម្រួល' : 'Edit Book'}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0',
                              background: '#ffffff',
                              color: '#059669',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteModalBook(book)}
                            title={isKhmer ? 'លុបសៀវភៅ' : 'Delete Book'}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '6px',
                              border: '1px solid #fecaca',
                              background: '#ffffff',
                              color: '#dc2626',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* =========================================================================
          TAB 2: BOOK CATEGORIES
          ========================================================================= */}
      {activeTab === 'categories' && (
        <div className="admin-card" style={{ overflow: 'hidden' }}>
          <div
            className="admin-card-header"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              padding: '18px 20px',
              borderBottom: '1px solid #f1f5f9',
              backgroundColor: '#ffffff',
            }}
          >
            <div>
              <h3 className="admin-card-title" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#07294D', margin: '0 0 2px 0' }}>
                {isKhmer ? 'ផ្នែក / ប្រភេទសៀវភៅបណ្ណាល័យ' : 'Library Department Categories'}
              </h3>
              <p className="admin-card-subtitle" style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
                {isKhmer
                  ? `គ្រប់គ្រងផ្នែកជំនាញ កូដសម្គាល់ និងទីតាំងប្លុកធ្នើសៀវភៅតាមជាន់ (បង្ហាញចំនួន ${filteredCategories.length} ក្នុងចំណោម ${categories.length} ប្រភេទសរុប)`
                  : `Manage disciplinary sections, classification codes, and physical shelf blocks (${filteredCategories.length} of ${categories.length} total)`}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Category Search Input */}
              <div style={{ position: 'relative', width: '220px' }}>
                <Search
                  size={14}
                  style={{
                    position: 'absolute',
                    left: '11px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                  }}
                />
                <input
                  type="text"
                  placeholder={isKhmer ? 'ស្វែងរកផ្នែក ឬកូដ...' : 'Search category...'}
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 28px 7px 32px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.82rem',
                    color: '#07294D',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.15s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#1e73be')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
                {categorySearchQuery && (
                  <button
                    onClick={() => setCategorySearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                    }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* View Mode Toggle: Grid vs List */}
              <div
                style={{
                  display: 'flex',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '8px',
                  padding: '2px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <button
                  onClick={() => setCategoryViewMode('grid')}
                  title={isKhmer ? 'ទិដ្ឋភាពកាត (Grid)' : 'Grid View'}
                  style={{
                    border: 'none',
                    background: categoryViewMode === 'grid' ? '#ffffff' : 'transparent',
                    color: categoryViewMode === 'grid' ? '#07294D' : '#64748b',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.8rem',
                    fontWeight: categoryViewMode === 'grid' ? 700 : 500,
                    boxShadow: categoryViewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <LayoutGrid size={15} />
                  <span>{isKhmer ? 'កាត' : 'Grid'}</span>
                </button>
                <button
                  onClick={() => setCategoryViewMode('list')}
                  title={isKhmer ? 'ទិដ្ឋភាពបញ្ជី (List)' : 'List View'}
                  style={{
                    border: 'none',
                    background: categoryViewMode === 'list' ? '#ffffff' : 'transparent',
                    color: categoryViewMode === 'list' ? '#07294D' : '#64748b',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.8rem',
                    fontWeight: categoryViewMode === 'list' ? 700 : 500,
                    boxShadow: categoryViewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <List size={15} />
                  <span>{isKhmer ? 'បញ្ជី' : 'List'}</span>
                </button>
              </div>

              {/* Add Category Button */}
              <button
                onClick={handleOpenCreateCategory}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#07294D',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(7, 41, 77, 0.15)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1e73be')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#07294D')}
              >
                <Plus size={15} />
                <span>{isKhmer ? 'បន្ថែមប្រភេទថ្មី' : 'Add Category'}</span>
              </button>
            </div>
          </div>

          {/* Empty State */}
          {filteredCategories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#ffffff' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1e73be',
                  margin: '0 auto 16px',
                }}
              >
                <FolderTree size={32} />
              </div>
              <h4 style={{ color: '#07294D', fontWeight: 800, fontSize: '1.1rem', marginBottom: '6px' }}>
                {isKhmer ? 'រកមិនឃើញផ្នែក/ប្រភេទសៀវភៅទេ' : 'No categories matched your search'}
              </h4>
              <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 20px' }}>
                {isKhmer
                  ? 'សូមសាកល្បងផ្លាស់ប្តូរពាក្យគន្លឹះស្វែងរក ឬចុចប៊ូតុងខាងក្រោមដើម្បីបង្កើតប្រភេទថ្មី'
                  : 'Try adjusting your search keywords or click the button below to add a new category'}
              </p>
              <button
                onClick={handleOpenCreateCategory}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#07294D',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} />
                <span>{isKhmer ? 'បន្ថែមប្រភេទថ្មី' : 'Add New Category'}</span>
              </button>
            </div>
          ) : categoryViewMode === 'list' ? (
            /* LIST / TABLE VIEW */
            <>
              <div className="admin-table-wrapper admin-categories-desktop-table" style={{ overflowX: 'auto' }}>
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
                        color: '#475569',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      <th style={{ padding: '14px 20px', width: '36%' }}>
                        {isKhmer ? 'ផ្នែកជំនាញ & កូដសម្គាល់' : 'Department & Code'}
                      </th>
                      <th style={{ padding: '14px 16px', width: '22%' }}>
                        {isKhmer ? 'ទីតាំងធ្នើ / ជាន់' : 'Shelf & Floor'}
                      </th>
                      <th style={{ padding: '14px 16px', width: '24%' }}>
                        {isKhmer ? 'ការពិពណ៌នា' : 'Description'}
                      </th>
                      <th style={{ padding: '14px 16px', width: '10%', whiteSpace: 'nowrap' }}>
                        {isKhmer ? 'ចំនួនសៀវភៅ' : 'Total Books'}
                      </th>
                      <th style={{ padding: '14px 20px', width: '8%', textAlign: 'right' }}>
                        {isKhmer ? 'សកម្មភាព' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((cat) => {
                      const iconInfo = getCategoryIconInfo(cat);

                      return (
                        <tr
                          key={cat.id}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                        >
                          {/* Column 1: Department Avatar + Code + Names */}
                          <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              {/* Pastel Department Avatar */}
                              <div
                                style={{
                                  width: '44px',
                                  height: '44px',
                                  borderRadius: '12px',
                                  backgroundColor: iconInfo.bg,
                                  border: `1px solid ${iconInfo.border}`,
                                  color: iconInfo.color,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  boxShadow: '0 2px 8px rgba(7, 41, 77, 0.04)',
                                }}
                              >
                                {iconInfo.icon}
                              </div>

                              {/* Name & Code */}
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                                  <span
                                    style={{
                                      fontWeight: 800,
                                      color: '#07294D',
                                      fontSize: '0.96rem',
                                      lineHeight: 1.35,
                                    }}
                                  >
                                    {cat.name_km}
                                  </span>
                                  <span
                                    style={{
                                      padding: '2px 7px',
                                      borderRadius: '6px',
                                      background: '#f1f5f9',
                                      color: '#334155',
                                      fontFamily: "'SFMono-Regular', Menlo, Monaco, Consolas, monospace",
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      border: '1px solid #e2e8f0',
                                    }}
                                  >
                                    {cat.code || `CAT-${cat.id}`}
                                  </span>
                                </div>
                                {cat.name_en && (
                                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', lineHeight: 1.25 }}>
                                    {cat.name_en}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Column 2: Shelf Location with Soft Location Pill */}
                          <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                            {cat.shelf_location ? (
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '6px 12px',
                                  background: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '10px',
                                }}
                              >
                                <div
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '6px',
                                    background: '#f0fdf4',
                                    border: '1px solid #bbf7d0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#16a34a',
                                    flexShrink: 0,
                                  }}
                                >
                                  <MapPin size={12} />
                                </div>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>
                                  {cat.shelf_location}
                                </span>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                                - {isKhmer ? 'មិនទាន់កំណត់' : 'Not assigned'} -
                              </span>
                            )}
                          </td>

                          {/* Column 3: Description */}
                          <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                            <p
                              style={{
                                margin: 0,
                                fontSize: '0.84rem',
                                color: '#475569',
                                lineHeight: 1.55,
                                maxWidth: '380px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                              title={cat.description}
                            >
                              {cat.description || (isKhmer ? 'គ្មានការពិពណ៌នា' : 'No description provided')}
                            </p>
                          </td>

                          {/* Column 4: Total Books (Strict No-Wrap!) */}
                          <td style={{ padding: '16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '5px 12px',
                                borderRadius: '20px',
                                background: '#eff6ff',
                                color: '#1e73be',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                border: '1px solid #dbeafe',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <BookOpen size={13} />
                              <span>{cat.books_count || 0} {isKhmer ? 'សៀវភៅ' : 'books'}</span>
                            </span>
                          </td>

                          {/* Column 5: Actions */}
                          <td style={{ padding: '16px 20px', verticalAlign: 'middle', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                onClick={() => handleOpenEditCategory(cat)}
                                title={isKhmer ? 'កែសម្រួល' : 'Edit Category'}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  border: '1px solid #e2e8f0',
                                  background: '#ffffff',
                                  color: '#059669',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#f0fdf4';
                                  e.currentTarget.style.borderColor = '#bbf7d0';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#ffffff';
                                  e.currentTarget.style.borderColor = '#e2e8f0';
                                }}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteModalCategory(cat)}
                                title={isKhmer ? 'លុប' : 'Delete Category'}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  border: '1px solid #fecaca',
                                  background: '#ffffff',
                                  color: '#dc2626',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#fef2f2';
                                  e.currentTarget.style.borderColor = '#fca5a5';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#ffffff';
                                  e.currentTarget.style.borderColor = '#fecaca';
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards for Categories (< 768px) */}
              <div className="admin-categories-mobile-cards">
                {filteredCategories.map((cat) => {
                  const iconInfo = getCategoryIconInfo(cat);
                  return (
                    <div
                      key={cat.id}
                      className="admin-user-mobile-card"
                      style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        padding: '16px',
                        boxShadow: '0 2px 10px rgba(7, 41, 77, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      {/* Top: Icon + Name + Code */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            backgroundColor: iconInfo.bg,
                            border: `1px solid ${iconInfo.border}`,
                            color: iconInfo.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {iconInfo.icon}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#07294D', lineHeight: 1.3 }}>
                              {cat.name_km}
                            </h4>
                            <span style={{ padding: '2px 7px', borderRadius: '6px', background: '#f1f5f9', color: '#334155', fontFamily: "'SFMono-Regular', Menlo, monospace", fontSize: '0.72rem', fontWeight: 700, border: '1px solid #e2e8f0', flexShrink: 0 }}>
                              {cat.code || `CAT-${cat.id}`}
                            </span>
                          </div>
                          {cat.name_en && (
                            <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', marginTop: '2px' }}>
                              {cat.name_en}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Shelf location + Total books count */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '8px 12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                          <MapPin size={13} color="#16a34a" />
                          <span style={{ fontWeight: 600 }}>{cat.shelf_location || (isKhmer ? 'មិនទាន់កំណត់' : 'Not assigned')}</span>
                        </div>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '12px', background: '#eff6ff', color: '#1e73be', fontWeight: 700, fontSize: '0.78rem', border: '1px solid #dbeafe' }}>
                          <BookOpen size={12} />
                          {cat.books_count || 0} {isKhmer ? 'សៀវភៅ' : 'books'}
                        </span>
                      </div>

                      {/* Description if any */}
                      {cat.description && (
                        <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {cat.description}
                        </p>
                      )}

                      {/* Actions: Edit & Delete buttons */}
                      <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                        <button
                          onClick={() => handleOpenEditCategory(cat)}
                          style={{ flex: 1, height: '36px', borderRadius: '8px', border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#059669', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          <Edit2 size={14} />
                          <span>{isKhmer ? 'កែសម្រួល' : 'Edit'}</span>
                        </button>
                        <button
                          onClick={() => setDeleteModalCategory(cat)}
                          style={{ flex: 1, height: '36px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                          <span>{isKhmer ? 'លុប' : 'Delete'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* GRID VIEW */
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {filteredCategories.map((cat) => {
                  const iconInfo = getCategoryIconInfo(cat);

                  return (
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
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 14px 30px rgba(7, 41, 77, 0.09)';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(7, 41, 77, 0.04)';
                        e.currentTarget.style.borderColor = '#e2e8f0';
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
                        {/* Header with Avatar, Code, and Books Count */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                backgroundColor: iconInfo.bg,
                                border: `1px solid ${iconInfo.border}`,
                                color: iconInfo.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {iconInfo.icon}
                            </div>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: '#eff6ff',
                                color: '#1e73be',
                                fontFamily: "'SFMono-Regular', Menlo, Monaco, Consolas, monospace",
                                fontSize: '0.78rem',
                                fontWeight: '700',
                                border: '1px solid #bfdbfe',
                              }}
                            >
                              {cat.code || `CAT-${cat.id}`}
                            </span>
                          </div>

                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              background: '#f8fafc',
                              color: '#475569',
                              fontSize: '0.78rem',
                              fontWeight: '700',
                              border: '1px solid #e2e8f0',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <BookOpen size={12} color="#1e73be" />
                            <span>{cat.books_count || 0} {isKhmer ? 'សៀវភៅ' : 'Books'}</span>
                          </span>
                        </div>

                        <h4 style={{ color: '#07294D', fontSize: '1.05rem', fontWeight: '800', marginBottom: '4px', lineHeight: 1.35 }}>
                          {cat.name_km}
                        </h4>
                        {cat.name_en && (
                          <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', marginBottom: '10px' }}>
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
                              color: '#15803d',
                              background: '#f0fdf4',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              border: '1px solid #dcfce7',
                              marginBottom: '10px',
                              fontWeight: 600,
                            }}
                          >
                            <MapPin size={12} color="#16a34a" />
                            <span>{cat.shelf_location}</span>
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
                          <Edit2 size={13} />
                          <span>{isKhmer ? 'កែសម្រួល' : 'Edit'}</span>
                        </button>
                        <button
                          onClick={() => setDeleteModalCategory(cat)}
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Trash2 size={13} />
                          <span>{isKhmer ? 'លុប' : 'Delete'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: BORROWINGS & LOANS
          ========================================================================= */}
      {activeTab === 'borrowings' && (
        <div className="admin-card" style={{ overflow: 'hidden' }}>
          {/* Card Header with Institutional Search & Status Filter Tabs */}
          <div
            className="admin-card-header"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
              padding: '18px 20px',
              borderBottom: '1px solid #f1f5f9',
              backgroundColor: '#ffffff',
            }}
          >
            <div>
              <h3 className="admin-card-title" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#07294D', margin: '0 0 2px 0' }}>
                {isKhmer ? 'កំណត់ត្រាកិច្ចការខ្ចី-សងសៀវភៅបណ្ណាល័យ' : 'Student Borrowings & Circulation Records'}
              </h3>
              <p className="admin-card-subtitle" style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
                {isKhmer
                  ? `តាមដានស្ថានភាពសៀវភៅដែលសិស្សកំពុងខ្ចី កាលបរិច្ឆេទសង និងបញ្ជាក់ការទទួលសៀវភៅត្រឡប់មកវិញ (បង្ហាញចំនួន ${filteredBorrowings.length} ក្នុងចំណោម ${borrowings.length} កំណត់ត្រាសរុប)`
                  : `Track ongoing student book loans, scheduled return dates, overdue alerts, and mark returns (${filteredBorrowings.length} of ${borrowings.length} total)`}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Search Borrowings */}
              <div style={{ position: 'relative', width: '230px' }}>
                <Search
                  size={14}
                  style={{
                    position: 'absolute',
                    left: '11px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                  }}
                />
                <input
                  type="text"
                  placeholder={isKhmer ? 'ស្វែងរកសិស្ស ឬសៀវភៅ...' : 'Search student or book...'}
                  value={borrowingSearchQuery}
                  onChange={(e) => setBorrowingSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 28px 7px 32px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.82rem',
                    color: '#07294D',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.15s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#1e73be')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
                {borrowingSearchQuery && (
                  <button
                    onClick={() => setBorrowingSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                    }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Status Filter Tabs */}
              <div
                style={{
                  display: 'flex',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '10px',
                  padding: '3px',
                  border: '1px solid #e2e8f0',
                  gap: '2px',
                }}
              >
                <button
                  onClick={() => setBorrowingStatusFilter('all')}
                  style={{
                    border: 'none',
                    background: borrowingStatusFilter === 'all' ? '#ffffff' : 'transparent',
                    color: borrowingStatusFilter === 'all' ? '#07294D' : '#64748b',
                    padding: '5px 10px',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: borrowingStatusFilter === 'all' ? 700 : 500,
                    boxShadow: borrowingStatusFilter === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{isKhmer ? 'ទាំងអស់' : 'All'}</span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '1px 5px',
                      borderRadius: '10px',
                      background: borrowingStatusFilter === 'all' ? '#eff6ff' : '#e2e8f0',
                      color: borrowingStatusFilter === 'all' ? '#1e73be' : '#64748b',
                    }}
                  >
                    {borrowingCounts.all}
                  </span>
                </button>
                <button
                  onClick={() => setBorrowingStatusFilter('borrowed')}
                  style={{
                    border: 'none',
                    background: borrowingStatusFilter === 'borrowed' ? '#ffffff' : 'transparent',
                    color: borrowingStatusFilter === 'borrowed' ? '#1e73be' : '#64748b',
                    padding: '5px 10px',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: borrowingStatusFilter === 'borrowed' ? 700 : 500,
                    boxShadow: borrowingStatusFilter === 'borrowed' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{isKhmer ? 'កំពុងខ្ចី' : 'Active'}</span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '1px 5px',
                      borderRadius: '10px',
                      background: borrowingStatusFilter === 'borrowed' ? '#eff6ff' : '#e2e8f0',
                      color: borrowingStatusFilter === 'borrowed' ? '#1e73be' : '#64748b',
                    }}
                  >
                    {borrowingCounts.borrowed}
                  </span>
                </button>
                <button
                  onClick={() => setBorrowingStatusFilter('overdue')}
                  style={{
                    border: 'none',
                    background: borrowingStatusFilter === 'overdue' ? '#ffffff' : 'transparent',
                    color: borrowingStatusFilter === 'overdue' ? '#dc2626' : '#64748b',
                    padding: '5px 10px',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: borrowingStatusFilter === 'overdue' ? 700 : 500,
                    boxShadow: borrowingStatusFilter === 'overdue' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{isKhmer ? 'ហួសកំណត់' : 'Overdue'}</span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '1px 5px',
                      borderRadius: '10px',
                      background: borrowingStatusFilter === 'overdue' ? '#fef2f2' : '#e2e8f0',
                      color: borrowingStatusFilter === 'overdue' ? '#dc2626' : '#64748b',
                    }}
                  >
                    {borrowingCounts.overdue}
                  </span>
                </button>
                <button
                  onClick={() => setBorrowingStatusFilter('returned')}
                  style={{
                    border: 'none',
                    background: borrowingStatusFilter === 'returned' ? '#ffffff' : 'transparent',
                    color: borrowingStatusFilter === 'returned' ? '#059669' : '#64748b',
                    padding: '5px 10px',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: borrowingStatusFilter === 'returned' ? 700 : 500,
                    boxShadow: borrowingStatusFilter === 'returned' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{isKhmer ? 'បានសង' : 'Returned'}</span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '1px 5px',
                      borderRadius: '10px',
                      background: borrowingStatusFilter === 'returned' ? '#f0fdf4' : '#e2e8f0',
                      color: borrowingStatusFilter === 'returned' ? '#059669' : '#64748b',
                    }}
                  >
                    {borrowingCounts.returned}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="admin-table-wrapper admin-borrowings-desktop-table" style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    color: '#475569',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  <th style={{ padding: '14px 20px', width: '25%' }}>{isKhmer ? 'ព័ត៌មានសិស្ស-និស្សិត' : 'Student Info'}</th>
                  <th style={{ padding: '14px 16px', width: '29%' }}>{isKhmer ? 'សៀវភៅដែលបានខ្ចី' : 'Borrowed Book Title'}</th>
                  <th style={{ padding: '14px 16px', width: '11%' }}>{isKhmer ? 'ថ្ងៃខ្ចី' : 'Borrow Date'}</th>
                  <th style={{ padding: '14px 16px', width: '12%' }}>{isKhmer ? 'ថ្ងៃត្រូវសង' : 'Due Date'}</th>
                  <th style={{ padding: '14px 16px', width: '11%' }}>{isKhmer ? 'ស្ថានភាពកម្ចី' : 'Loan Status'}</th>
                  <th style={{ padding: '14px 20px', width: '12%', textAlign: 'right' }}>{isKhmer ? 'សកម្មភាព' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredBorrowings.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '60px 16px', backgroundColor: '#ffffff' }}>
                      <BookmarkCheck size={44} strokeWidth={1.2} style={{ color: '#94a3b8', margin: '0 auto 10px', display: 'block' }} />
                      <h4 style={{ color: '#07294D', fontWeight: 800, fontSize: '1.05rem', margin: '0 0 6px 0' }}>
                        {isKhmer ? 'មិនមានកំណត់ត្រាកម្ចីត្រូវនឹងលក្ខខណ្ឌស្វែងរកទេ' : 'No circulation borrowing records match your filters'}
                      </h4>
                      <p style={{ color: '#64748b', fontSize: '0.86rem', margin: 0 }}>
                        {isKhmer ? 'សូមសាកល្បងសម្អាតពាក្យគន្លឹះ ឬផ្លាស់ប្តូរផ្ទាំងតម្រងស្ថានភាពខាងលើ' : 'Try clearing your search query or switching status filters above'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredBorrowings.map((b) => {
                    const isOverdue = b.status === 'overdue' || (b.status === 'borrowed' && new Date(b.due_date) < new Date());
                    const isReturned = b.status === 'returned';

                    return (
                      <tr
                        key={b.id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                      >
                        {/* Student Info with Avatar */}
                        <td style={{ padding: '14px 20px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                backgroundColor: '#eff6ff',
                                border: '1px solid #dbeafe',
                                color: '#1e73be',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                fontWeight: 800,
                                fontSize: '0.84rem',
                              }}
                            >
                              <User size={18} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, color: '#07294D', fontSize: '0.92rem', lineHeight: 1.3 }}>
                                {b.student_name}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                <span
                                  style={{
                                    fontSize: '0.72rem',
                                    color: '#64748b',
                                    fontFamily: "'SFMono-Regular', Menlo, Monaco, Consolas, monospace",
                                    padding: '1px 6px',
                                    borderRadius: '5px',
                                    backgroundColor: '#f1f5f9',
                                    border: '1px solid #e2e8f0',
                                    fontWeight: 600,
                                  }}
                                >
                                  ID: {b.student_id}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Book Title with Shelf Placement */}
                        <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                          <div
                            style={{
                              fontWeight: 700,
                              color: '#1e73be',
                              fontSize: '0.9rem',
                              lineHeight: 1.35,
                              marginBottom: '3px',
                            }}
                          >
                            {b.book ? b.book.title_km : b.book_title || 'N/A'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            {(b.book?.shelf_location || b.shelf_location) && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.74rem',
                                  fontWeight: 600,
                                  color: '#16a34a',
                                  backgroundColor: '#f0fdf4',
                                  border: '1px solid #bbf7d0',
                                  padding: '1px 7px',
                                  borderRadius: '6px',
                                }}
                              >
                                <MapPin size={10} />
                                {b.book ? b.book.shelf_location : b.shelf_location}
                              </span>
                            )}
                            {b.book?.isbn && (
                              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                                ISBN: {b.book.isbn}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Borrow Date */}
                        <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.84rem', color: '#475569' }}>
                            <Calendar size={13} color="#94a3b8" />
                            <span>{b.borrow_date}</span>
                          </div>
                        </td>

                        {/* Due Date */}
                        <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '0.84rem',
                              fontWeight: isOverdue && !isReturned ? 700 : 500,
                              color: isOverdue && !isReturned ? '#dc2626' : '#475569',
                            }}
                          >
                            {isOverdue && !isReturned ? <AlertCircle size={13} color="#dc2626" /> : <Clock size={13} color="#94a3b8" />}
                            <span>{b.due_date}</span>
                          </div>
                        </td>

                        {/* Loan Status */}
                        <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                          {isReturned ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                background: '#f0fdf4',
                                color: '#059669',
                                border: '1px solid #bbf7d0',
                                fontWeight: 700,
                                fontSize: '0.76rem',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <Check size={12} strokeWidth={2.5} />
                              <span>{isKhmer ? 'បានសងរួចរាល់' : 'RETURNED'}</span>
                            </span>
                          ) : isOverdue ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                background: '#fef2f2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                fontWeight: 700,
                                fontSize: '0.76rem',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <AlertCircle size={12} />
                              <span>{isKhmer ? 'ហួសកាលកំណត់' : 'OVERDUE'}</span>
                            </span>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                background: '#eff6ff',
                                color: '#1e73be',
                                border: '1px solid #bfdbfe',
                                fontWeight: 700,
                                fontSize: '0.76rem',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <Clock size={12} />
                              <span>{isKhmer ? 'កំពុងខ្ចី' : 'BORROWED'}</span>
                            </span>
                          )}
                        </td>

                        {/* Actions: Refined Institutional Button Group */}
                        <td style={{ padding: '14px 20px', verticalAlign: 'middle', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                            {/* Primary Return Button if active */}
                            {!isReturned ? (
                              <button
                                onClick={() => handleReturnBorrowing(b.id)}
                                title={isKhmer ? 'កត់ត្រាទទួលសៀវភៅសង' : 'Mark Book Returned'}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '6px 12px',
                                  borderRadius: '8px',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  border: '1px solid #059669',
                                  background: '#059669',
                                  color: '#ffffff',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 5px rgba(5, 150, 105, 0.2)',
                                  transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#047857';
                                  e.currentTarget.style.borderColor = '#047857';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#059669';
                                  e.currentTarget.style.borderColor = '#059669';
                                }}
                              >
                                <CheckCircle2 size={13} />
                                <span>{isKhmer ? 'ទទួលសង' : 'Return'}</span>
                              </button>
                            ) : (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '5px 10px',
                                  borderRadius: '8px',
                                  backgroundColor: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  color: '#059669',
                                  fontSize: '0.76rem',
                                  fontWeight: 700,
                                }}
                              >
                                <Check size={12} strokeWidth={2.5} />
                                <span>{isKhmer ? 'បានប្រគល់' : 'Returned'}</span>
                              </span>
                            )}

                            {/* View Receipt / Detail Slip Button */}
                            <button
                              onClick={() => setDetailModalBorrowing(b)}
                              title={isKhmer ? 'មើលបង្កាន់ដៃ / ព័ត៌មានលម្អិត' : 'View Borrowing Slip & Details'}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                background: '#ffffff',
                                color: '#1e73be',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#eff6ff';
                                e.currentTarget.style.borderColor = '#bfdbfe';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#ffffff';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                              }}
                            >
                              <FileText size={14} />
                            </button>

                            {/* Delete Borrowing Record */}
                            <button
                              onClick={() => setDeleteModalBorrowing(b)}
                              title={isKhmer ? 'លុបកំណត់ត្រានេះ' : 'Delete Record'}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                border: '1px solid #fecaca',
                                background: '#ffffff',
                                color: '#dc2626',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#fef2f2';
                                e.currentTarget.style.borderColor = '#fca5a5';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#ffffff';
                                e.currentTarget.style.borderColor = '#fecaca';
                              }}
                            >
                              <Trash2 size={14} />
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

          {/* Mobile Cards for Borrowings (< 768px) */}
          <div className="admin-borrowings-mobile-cards">
            {filteredBorrowings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <BookmarkCheck size={36} strokeWidth={1.2} style={{ color: '#94a3b8', margin: '0 auto 8px', display: 'block' }} />
                <h4 style={{ color: '#07294D', fontWeight: 800, fontSize: '0.98rem', margin: '0 0 4px 0' }}>
                  {isKhmer ? 'មិនមានកំណត់ត្រាកម្ចីត្រូវនឹងលក្ខខណ្ឌស្វែងរកទេ' : 'No circulation borrowing records match your filters'}
                </h4>
                <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>
                  {isKhmer ? 'សូមសាកល្បងសម្អាតពាក្យគន្លឹះ ឬផ្លាស់ប្តូរផ្ទាំងតម្រងស្ថានភាព' : 'Try clearing search or switching status filters'}
                </p>
              </div>
            ) : (
              filteredBorrowings.map((b) => {
                const isOverdue = b.status === 'overdue' || (b.status === 'borrowed' && new Date(b.due_date) < new Date());
                const isReturned = b.status === 'returned';

                return (
                  <div
                    key={b.id}
                    className="admin-user-mobile-card"
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      padding: '16px',
                      boxShadow: '0 2px 10px rgba(7, 41, 77, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    {/* Top row: Student info + Status badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            backgroundColor: '#eff6ff',
                            border: '1px solid #dbeafe',
                            color: '#1e73be',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <User size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#07294D', fontSize: '0.92rem', lineHeight: 1.25 }}>
                            {b.student_name}
                          </div>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              color: '#64748b',
                              fontFamily: 'monospace',
                              padding: '1px 6px',
                              borderRadius: '5px',
                              backgroundColor: '#f1f5f9',
                              border: '1px solid #e2e8f0',
                              fontWeight: 600,
                            }}
                          >
                            ID: {b.student_id}
                          </span>
                        </div>
                      </div>

                      {/* Status badge */}
                      {isReturned ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '20px', background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0', fontWeight: 700, fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                          <Check size={11} strokeWidth={2.5} />
                          <span>{isKhmer ? 'បានសង' : 'RETURNED'}</span>
                        </span>
                      ) : isOverdue ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '20px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontWeight: 700, fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                          <AlertCircle size={11} />
                          <span>{isKhmer ? 'ហួសកំណត់' : 'OVERDUE'}</span>
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '20px', background: '#eff6ff', color: '#1e73be', border: '1px solid #bfdbfe', fontWeight: 700, fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                          <Clock size={11} />
                          <span>{isKhmer ? 'កំពុងខ្ចី' : 'BORROWED'}</span>
                        </span>
                      )}
                    </div>

                    {/* Book title & details */}
                    <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontWeight: 700, color: '#1e73be', fontSize: '0.88rem', lineHeight: 1.35, marginBottom: '4px' }}>
                        {b.book ? b.book.title_km : b.book_title || 'N/A'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.74rem' }}>
                        {(b.book?.shelf_location || b.shelf_location) && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#16a34a', fontWeight: 600 }}>
                            <MapPin size={11} />
                            {b.book ? b.book.shelf_location : b.shelf_location}
                          </span>
                        )}
                        {b.book?.isbn && (
                          <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                            ISBN: {b.book.isbn}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Dates: Borrow & Due */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', fontSize: '0.78rem' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                        <Calendar size={12} color="#94a3b8" />
                        <span>{isKhmer ? 'ថ្ងៃខ្ចី ៖ ' : 'Borrowed: '}{b.borrow_date}</span>
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: isOverdue && !isReturned ? 700 : 500, color: isOverdue && !isReturned ? '#dc2626' : '#475569' }}>
                        {isOverdue && !isReturned ? <AlertCircle size={12} color="#dc2626" /> : <Clock size={12} color="#94a3b8" />}
                        <span>{isKhmer ? 'ត្រូវសង ៖ ' : 'Due: '}{b.due_date}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                      {!isReturned ? (
                        <button
                          onClick={() => handleReturnBorrowing(b.id)}
                          style={{
                            flex: 1,
                            height: '36px',
                            borderRadius: '8px',
                            border: '1px solid #059669',
                            background: '#059669',
                            color: '#ffffff',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          <CheckCircle2 size={14} />
                          <span>{isKhmer ? 'ទទួលសៀវភៅសង' : 'Mark Returned'}</span>
                        </button>
                      ) : (
                        <div
                          style={{
                            flex: 1,
                            height: '36px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            background: '#f8fafc',
                            color: '#059669',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                          }}
                        >
                          <Check size={14} strokeWidth={2.5} />
                          <span>{isKhmer ? 'បានសងរួចរាល់' : 'Returned'}</span>
                        </div>
                      )}

                      {/* Detail slip */}
                      <button
                        onClick={() => setDetailModalBorrowing(b)}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          background: '#ffffff',
                          color: '#1e73be',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                        title={isKhmer ? 'មើលបង្កាន់ដៃ / ព័ត៌មានលម្អិត' : 'View Slip'}
                      >
                        <FileText size={15} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteModalBorrowing(b)}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: '1px solid #fecaca',
                          background: '#ffffff',
                          color: '#dc2626',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                        title={isKhmer ? 'លុបកំណត់ត្រានេះ' : 'Delete Record'}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
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

      {/* =========================================================================
          MODAL 7: BORROWING RECEIPT & CIRCULATION SLIP MODAL
          ========================================================================= */}
      {detailModalBorrowing && (() => {
        const isOverdue = detailModalBorrowing.status === 'overdue' || (detailModalBorrowing.status === 'borrowed' && new Date(detailModalBorrowing.due_date) < new Date());
        const isReturned = detailModalBorrowing.status === 'returned';

        return (
          <div
            className="admin-modal-backdrop"
            onClick={() => setDetailModalBorrowing(null)}
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
                maxWidth: '600px',
                width: '100%',
                background: '#ffffff',
                borderRadius: '20px',
                boxShadow: '0 25px 60px rgba(7, 41, 77, 0.25)',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: '#eff6ff',
                      color: '#1e73be',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FileText size={16} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#07294D' }}>
                      {isKhmer ? 'បង្កាន់ដៃខ្ចី-សងសៀវភៅបណ្ណាល័យ' : 'Library Circulation Receipt'}
                    </h3>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      {isKhmer ? 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប' : 'Regional Polytechnic Institute Techo Sen Siem Reap'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setDetailModalBorrowing(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body / Receipt Content */}
              <div style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
                {/* Institutional Slip Header Banner */}
                <div
                  style={{
                    backgroundColor: '#07294D',
                    color: '#ffffff',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {isKhmer ? 'លេខបង្កាន់ដៃកម្ចី' : 'LOAN RECEIPT ID'}
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                      BRW-{detailModalBorrowing.id.toString().padStart(6, '0')}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isReturned ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          backgroundColor: '#10b981',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                        }}
                      >
                        <CheckCircle2 size={14} />
                        <span>{isKhmer ? 'បានសងរួចរាល់' : 'RETURNED'}</span>
                      </span>
                    ) : isOverdue ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                        }}
                      >
                        <AlertCircle size={14} />
                        <span>{isKhmer ? 'ហួសកាលកំណត់' : 'OVERDUE'}</span>
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          backgroundColor: '#1e73be',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                        }}
                      >
                        <Clock size={14} />
                        <span>{isKhmer ? 'កំពុងខ្ចី' : 'ACTIVE LOAN'}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  {/* Student Card */}
                  <div
                    style={{
                      background: '#f8fafc',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                      {isKhmer ? 'ព័ត៌មានសិស្ស / អ្នកខ្ចី' : 'Borrower Student'}
                    </div>
                    <div style={{ fontWeight: 800, color: '#07294D', fontSize: '0.98rem', marginBottom: '4px' }}>
                      {detailModalBorrowing.student_name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>អត្តលេខ (ID):</span>
                      <strong style={{ fontFamily: 'monospace', color: '#1e73be' }}>{detailModalBorrowing.student_id}</strong>
                    </div>
                  </div>

                  {/* Book Card */}
                  <div
                    style={{
                      background: '#f8fafc',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                      {isKhmer ? 'ព័ត៌មានសៀវភៅ' : 'Borrowed Book'}
                    </div>
                    <div style={{ fontWeight: 800, color: '#07294D', fontSize: '0.92rem', marginBottom: '4px', lineHeight: 1.3 }}>
                      {detailModalBorrowing.book ? detailModalBorrowing.book.title_km : detailModalBorrowing.book_title || 'N/A'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={11} />
                      <span>{detailModalBorrowing.book?.shelf_location || detailModalBorrowing.shelf_location || 'ធ្នើទូទៅ'}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline Box */}
                <div
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    backgroundColor: '#ffffff',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700, marginBottom: '12px' }}>
                    {isKhmer ? 'កាលបរិច្ឆេទនៃកិច្ចសន្យាខ្ចី-សង' : 'Circulation Schedule & Timeline'}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
                    <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '4px' }}>{isKhmer ? 'ថ្ងៃខ្ចី' : 'Borrow Date'}</div>
                      <div style={{ fontWeight: 700, color: '#07294D', fontSize: '0.88rem' }}>{detailModalBorrowing.borrow_date}</div>
                    </div>

                    <div style={{ padding: '10px', background: isOverdue && !isReturned ? '#fef2f2' : '#f8fafc', borderRadius: '8px', border: isOverdue && !isReturned ? '1px solid #fecaca' : '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '0.72rem', color: isOverdue && !isReturned ? '#dc2626' : '#64748b', marginBottom: '4px' }}>{isKhmer ? 'ថ្ងៃត្រូវសង' : 'Due Date'}</div>
                      <div style={{ fontWeight: 700, color: isOverdue && !isReturned ? '#dc2626' : '#07294D', fontSize: '0.88rem' }}>{detailModalBorrowing.due_date}</div>
                    </div>

                    <div style={{ padding: '10px', background: isReturned ? '#f0fdf4' : '#f8fafc', borderRadius: '8px', border: isReturned ? '1px solid #bbf7d0' : '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '0.72rem', color: isReturned ? '#16a34a' : '#64748b', marginBottom: '4px' }}>{isKhmer ? 'ថ្ងៃសងជាក់ស្តែង' : 'Return Date'}</div>
                      <div style={{ fontWeight: 700, color: isReturned ? '#16a34a' : '#94a3b8', fontSize: '0.88rem' }}>
                        {detailModalBorrowing.return_date || (isReturned ? 'បានសងរួចរាល់' : '- នៅខ្ចី -')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {detailModalBorrowing.notes && (
                  <div
                    style={{
                      padding: '12px 14px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px dashed #cbd5e1',
                      fontSize: '0.84rem',
                      color: '#475569',
                      lineHeight: 1.5,
                    }}
                  >
                    <strong style={{ color: '#07294D' }}>{isKhmer ? 'កំណត់សម្គាល់៖ ' : 'Notes: '}</strong>
                    {detailModalBorrowing.notes}
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
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <button
                  onClick={() => window.print()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#07294D',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Printer size={15} />
                  <span>{isKhmer ? 'បោះពុម្ពបង្កាន់ដៃ' : 'Print Slip'}</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {!isReturned && (
                    <button
                      onClick={async () => {
                        await handleReturnBorrowing(detailModalBorrowing.id);
                        setDetailModalBorrowing(null);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#059669',
                        color: '#ffffff',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                      }}
                    >
                      <CheckCircle2 size={15} />
                      <span>{isKhmer ? 'កត់ត្រាទទួលសងឥឡូវនេះ' : 'Mark Returned Now'}</span>
                    </button>
                  )}
                  <button
                    onClick={() => setDetailModalBorrowing(null)}
                    className="admin-btn admin-btn-secondary"
                    style={{ minWidth: '90px' }}
                  >
                    {isKhmer ? 'បិទ' : 'Close'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          MODAL 8: DELETE BORROWING CONFIRMATION MODAL
          ========================================================================= */}
      {deleteModalBorrowing && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setDeleteModalBorrowing(null)}
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
              maxWidth: '480px',
              width: '100%',
              background: '#ffffff',
              borderRadius: '20px',
              padding: '26px',
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
              {isKhmer ? 'បញ្ជាក់ការលុបកំណត់ត្រាខ្ចីសៀវភៅ?' : 'Delete This Borrowing Record?'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '22px' }}>
              {isKhmer
                ? `តើអ្នកប្រាកដជាចង់លុបកំណត់ត្រាខ្ចីរបស់សិស្ស «${deleteModalBorrowing.student_name}» (ID: ${deleteModalBorrowing.student_id}) មែនទេ? ប្រសិនបើសៀវភៅមិនទាន់បានសង ចំនួនសៀវភៅក្នុងស្តុកនឹងត្រូវបញ្ចូលឡើងវិញដោយស្វ័យប្រវត្តិ។`
                : `Are you sure you want to delete the borrowing record for "${deleteModalBorrowing.student_name}"? If unreturned, book stock will be replenished.`}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setDeleteModalBorrowing(null)}
                className="admin-btn admin-btn-secondary"
                style={{ minWidth: '110px' }}
              >
                {isKhmer ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteBorrowing}
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
