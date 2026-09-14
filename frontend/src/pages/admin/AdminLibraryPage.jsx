import React, { useState } from 'react';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import { Library, FolderTree, BookmarkCheck, Edit2, Trash2, Book, CheckCircle, Clock } from 'lucide-react';

export const AdminLibraryPage = () => {
  const [activeTab, setActiveTab] = useState('books'); // books, categories, borrowings

  // Books State (Mock / Live seed)
  const [books, setBooks] = useState([
    { id: 1, title: 'Introduction to Web Technologies & Modern JS', author: 'Dr. Heng Buntheun', isbn: '978-0134685991', category: 'Information Technology', totalCopies: 15, availableCopies: 8, shelf: 'A-12' },
    { id: 2, title: 'Electrical Circuits & Wiring Standards', author: 'Eng. Chhim Vathanak', isbn: '978-0073373843', category: 'Electricity', totalCopies: 10, availableCopies: 3, shelf: 'B-04' },
    { id: 3, title: 'Modern Civil Engineering Structures', author: 'Sok Kimleang', isbn: '978-0470549735', category: 'Civil Engineering', totalCopies: 8, availableCopies: 5, shelf: 'C-08' },
    { id: 4, title: 'English for Vocational Technical Education', author: 'Sarah Jenkins', isbn: '978-0194422795', category: 'General', totalCopies: 25, availableCopies: 19, shelf: 'D-01' },
    { id: 5, title: 'Air Conditioning & Refrigeration Principles', author: 'Khorn Sothea', isbn: '978-0132857801', category: 'HVAC', totalCopies: 12, availableCopies: 6, shelf: 'B-10' },
  ]);

  // Book Categories
  const [categories, setCategories] = useState([
    { id: 1, name: 'Information Technology', code: 'IT-LIB', booksCount: 45, shelfLocation: 'Section A' },
    { id: 2, name: 'Electricity & Electronics', code: 'EE-LIB', booksCount: 32, shelfLocation: 'Section B' },
    { id: 3, name: 'Civil Engineering', code: 'CE-LIB', booksCount: 28, shelfLocation: 'Section C' },
    { id: 4, name: 'General & Languages', code: 'GEN-LIB', booksCount: 60, shelfLocation: 'Section D' },
  ]);

  // Borrowings
  const [borrowings, setBorrowings] = useState([
    { id: 101, studentName: 'Voeun Chamroeun', studentId: 'STU-2025-089', bookTitle: 'Introduction to Web Technologies', borrowDate: '2026-03-01', dueDate: '2026-03-15', status: 'borrowed' },
    { id: 102, studentName: 'Keo Sophat', studentId: 'STU-2025-112', bookTitle: 'Electrical Circuits & Wiring Standards', borrowDate: '2026-02-20', dueDate: '2026-03-06', status: 'returned' },
    { id: 103, studentName: 'Mom Sreynich', studentId: 'STU-2025-045', bookTitle: 'Modern Civil Engineering Structures', borrowDate: '2026-02-15', dueDate: '2026-03-01', status: 'overdue' },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Information Technology',
    totalCopies: 5,
    shelf: 'A-01',
  });

  const handleAddBook = (e) => {
    e.preventDefault();
    const id = books.length + 1;
    setBooks([...books, { ...newBook, id, availableCopies: newBook.totalCopies }]);
    setModalOpen(false);
  };

  const handleReturnBorrowing = (id) => {
    setBorrowings(
      borrowings.map((b) => (b.id === id ? { ...b, status: 'returned' } : b))
    );
  };

  // Columns for Books
  const bookColumns = [
    {
      header: 'Book Title & Details',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Book size={18} />
          </div>
          <div>
            <div style={{ fontWeight: '700', color: 'var(--admin-primary)' }}>{row.title}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
              By {row.author} &bull; ISBN: <code>{row.isbn}</code>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => <span className="admin-badge admin-badge-info">{row.category}</span>,
    },
    {
      header: 'Shelf / Location',
      accessor: 'shelf',
      render: (row) => <code>{row.shelf}</code>,
    },
    {
      header: 'Availability',
      render: (row) => (
        <span className={`admin-badge ${row.availableCopies > 0 ? 'admin-badge-success' : 'admin-badge-danger'}`}>
          {row.availableCopies} / {row.totalCopies} Available
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <button
          onClick={() => setBooks(books.filter((b) => b.id !== row.id))}
          className="admin-btn admin-btn-danger admin-btn-sm"
        >
          <Trash2 size={14} />
        </button>
      ),
    },
  ];

  // Columns for Borrowings
  const borrowingColumns = [
    {
      header: 'Student Info',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '700', color: 'var(--admin-primary)' }}>{row.studentName}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>ID: {row.studentId}</div>
        </div>
      ),
    },
    {
      header: 'Borrowed Book',
      accessor: 'bookTitle',
      render: (row) => <span style={{ fontWeight: '600' }}>{row.bookTitle}</span>,
    },
    {
      header: 'Borrow Date',
      accessor: 'borrowDate',
    },
    {
      header: 'Due Date',
      accessor: 'dueDate',
    },
    {
      header: 'Loan Status',
      render: (row) => (
        <span className={`admin-badge ${row.status === 'returned' ? 'admin-badge-success' : row.status === 'overdue' ? 'admin-badge-danger' : 'admin-badge-warning'}`}>
          {row.status.toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Action',
      align: 'right',
      render: (row) =>
        row.status !== 'returned' ? (
          <button
            onClick={() => handleReturnBorrowing(row.id)}
            className="admin-btn admin-btn-primary admin-btn-sm"
          >
            <CheckCircle size={14} /> Mark Returned
          </button>
        ) : (
          <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: '600' }}>Completed</span>
        ),
    },
  ];

  return (
    <div>
      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === 'books' ? 'active' : ''}`}
          onClick={() => setActiveTab('books')}
        >
          <Library size={16} style={{ display: 'inline', marginRight: '6px' }} />
          Manage Books ({books.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <FolderTree size={16} style={{ display: 'inline', marginRight: '6px' }} />
          Book Categories ({categories.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'borrowings' ? 'active' : ''}`}
          onClick={() => setActiveTab('borrowings')}
        >
          <BookmarkCheck size={16} style={{ display: 'inline', marginRight: '6px' }} />
          Student Borrowings ({borrowings.length})
        </button>
      </div>

      {activeTab === 'books' && (
        <AdminDataTable
          title="Library Catalog"
          subtitle="Manage textbook collection, reference materials, ISBN records, and shelf placement"
          columns={bookColumns}
          data={books}
          onAdd={() => setModalOpen(true)}
          addLabel="Add New Book"
        />
      )}

      {activeTab === 'categories' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Library Department Categories</h3>
          </div>
          <div className="admin-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {categories.map((cat) => (
                <div key={cat.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                  <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--admin-primary)' }}>{cat.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', margin: '4px 0 8px' }}>
                    Code: <code>{cat.code}</code> &bull; Location: {cat.shelfLocation}
                  </div>
                  <span className="admin-badge admin-badge-info">{cat.booksCount} Volumes In Stock</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'borrowings' && (
        <AdminDataTable
          title="Active Student Borrowings"
          subtitle="Track active book loans, return due dates, and overdue student alerts"
          columns={borrowingColumns}
          data={borrowings}
          searchPlaceholder="Search by student name or book title..."
        />
      )}

      {/* Add Book Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Book to Library"
        onSubmit={handleAddBook}
      >
        <div className="admin-form-group">
          <label className="admin-form-label">Book Title *</label>
          <input
            type="text"
            className="admin-form-control"
            required
            value={newBook.title}
            onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
            placeholder="e.g. Modern Javascript & React"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">Author Name</label>
            <input
              type="text"
              className="admin-form-control"
              value={newBook.author}
              onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
              placeholder="e.g. Dr. John Doe"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">ISBN / Catalog Code</label>
            <input
              type="text"
              className="admin-form-control"
              value={newBook.isbn}
              onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
              placeholder="978-..."
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">Category</label>
            <select
              className="admin-form-control"
              value={newBook.category}
              onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
            >
              <option value="Information Technology">Information Technology</option>
              <option value="Electricity">Electricity</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="General">General</option>
            </select>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Total Copies</label>
            <input
              type="number"
              className="admin-form-control"
              value={newBook.totalCopies}
              onChange={(e) => setNewBook({ ...newBook, totalCopies: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Shelf Location</label>
            <input
              type="text"
              className="admin-form-control"
              value={newBook.shelf}
              onChange={(e) => setNewBook({ ...newBook, shelf: e.target.value })}
              placeholder="A-12"
            />
          </div>
        </div>
      </AdminModal>
    </div>
  );
};
