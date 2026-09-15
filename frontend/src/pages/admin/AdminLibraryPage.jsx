import React from 'react';
import { useLocation } from 'react-router-dom';
import { AdminBooksPage } from './AdminBooksPage';

export const AdminLibraryPage = () => {
  const location = useLocation();
  const defaultTab = location.pathname.includes('categories')
    ? 'categories'
    : location.pathname.includes('borrowings')
    ? 'borrowings'
    : 'books';

  return <AdminBooksPage key={defaultTab} defaultTab={defaultTab} />;
};

export default AdminLibraryPage;
