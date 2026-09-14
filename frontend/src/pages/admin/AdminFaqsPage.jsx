import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import { Edit2, Trash2, HelpCircle } from 'lucide-react';

export const AdminFaqsPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    order: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/faqs');
      setFaqs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      category: 'Admission',
      order: faqs.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (f) => {
    setEditingFaq(f);
    setFormData({
      question: f.question || '',
      answer: f.answer || '',
      category: f.category || 'General',
      order: f.order || 0,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingFaq) {
        await api.put(`/admin/faqs/${editingFaq.id}`, formData);
      } else {
        await api.post('/admin/faqs', formData);
      }
      setModalOpen(false);
      fetchData();
    } catch {
      alert('Failed to save FAQ.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (f) => {
    if (!window.confirm('Delete this FAQ question?')) return;
    try {
      await api.delete(`/admin/faqs/${f.id}`);
      fetchData();
    } catch {
      alert('Failed to delete FAQ.');
    }
  };

  const columns = [
    {
      header: 'Frequently Asked Question & Answer',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '700', color: 'var(--admin-primary)' }}>
            {row.question}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', marginTop: '4px', maxWidth: '500px' }}>
            {row.answer}
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => <span className="admin-badge admin-badge-info">{row.category || 'General'}</span>,
    },
    {
      header: 'Order',
      accessor: 'order',
      render: (row) => <strong>#{row.order || 0}</strong>,
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={() => openEditModal(row)}
            className="admin-btn admin-btn-outline admin-btn-sm"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="admin-btn admin-btn-danger admin-btn-sm"
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
        title="Frequently Asked Questions (FAQ)"
        subtitle="Manage student inquiries regarding admission requirements, fees, scholarships, and diplomas"
        columns={columns}
        data={faqs}
        loading={loading}
        onAdd={openAddModal}
        addLabel="Add Question"
        onRefresh={fetchData}
        searchPlaceholder="Search FAQ questions..."
      />

      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingFaq ? 'Edit FAQ Item' : 'New FAQ Question'}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
      >
        <div className="admin-form-group">
          <label className="admin-form-label">Question Text *</label>
          <input
            type="text"
            className="admin-form-control"
            required
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            placeholder="e.g. តើខ្ញុំត្រូវមានឯកសារអ្វីខ្លះដើម្បីចុះឈ្មោះចូលរៀន?"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">Category</label>
            <input
              type="text"
              className="admin-form-control"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Admission / Scholarship / Courses"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Display Order</label>
            <input
              type="number"
              className="admin-form-control"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Detailed Answer *</label>
          <textarea
            className="admin-form-control"
            rows={4}
            required
            value={formData.answer}
            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
            placeholder="Write clear and helpful answer..."
          />
        </div>
      </AdminModal>
    </div>
  );
};
