import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { Trash2, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

export const AdminCommentsPage = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/comments');
      setComments(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/admin/comments/${id}`, { status });
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );
    } catch {
      alert('Failed to update comment status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    try {
      await api.delete(`/admin/comments/${id}`);
      fetchData();
    } catch {
      alert('Failed to delete comment.');
    }
  };

  const columns = [
    {
      header: 'Author & Message',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '700', color: 'var(--admin-primary)' }}>
            {row.authorName || 'Guest Visitor'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--admin-text)', marginTop: '2px' }}>
            "{row.content}"
          </div>
          {row.post && (
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '4px' }}>
              On Post: <em>{row.post.title}</em>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Moderation Status',
      render: (row) => (
        <span
          className={`admin-badge ${
            row.status === 'approved'
              ? 'admin-badge-success'
              : row.status === 'spam'
              ? 'admin-badge-danger'
              : 'admin-badge-warning'
          }`}
        >
          {row.status?.toUpperCase() || 'PENDING'}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          {row.status !== 'approved' && (
            <button
              onClick={() => handleUpdateStatus(row.id, 'approved')}
              className="admin-btn admin-btn-primary admin-btn-sm"
              title="Approve Comment"
            >
              <CheckCircle size={14} /> Approve
            </button>
          )}
          {row.status !== 'spam' && (
            <button
              onClick={() => handleUpdateStatus(row.id, 'spam')}
              className="admin-btn admin-btn-outline admin-btn-sm"
              title="Mark as Spam"
            >
              <XCircle size={14} /> Spam
            </button>
          )}
          <button
            onClick={() => handleDelete(row.id)}
            className="admin-btn admin-btn-danger admin-btn-sm"
            title="Delete Comment"
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
        title="Article Comments Moderation"
        subtitle="Review, approve, or filter user comments submitted on institute blog articles"
        columns={columns}
        data={comments}
        loading={loading}
        onRefresh={fetchData}
        searchPlaceholder="Search comments by author or keyword..."
      />
    </div>
  );
};
