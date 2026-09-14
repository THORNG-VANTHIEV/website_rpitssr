import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import { Edit2, Trash2, Shield, User, GraduationCap } from 'lucide-react';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    role: 'student',
    studentId: '',
    className: '',
    isActive: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : (raw?.users || raw?.data || []);
      setUsers(list);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      fullName: '',
      password: '',
      role: 'student',
      studentId: '',
      className: '',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormData({
      username: u.username || '',
      email: u.email || '',
      fullName: u.fullName || '',
      password: '',
      role: u.role || 'student',
      studentId: u.studentId || '',
      className: u.className || '',
      isActive: u.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username?.trim()) {
      alert('Username is required.');
      return;
    }
    if (!formData.email?.trim()) {
      alert('Email address is required.');
      return;
    }

    // Build clean payload
    const payload = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      fullName: formData.fullName?.trim() || null,
      role: formData.role || 'student',
      studentId: formData.studentId?.trim() || null,
      className: formData.className?.trim() || null,
    };

    // Handle password field properly
    const pwd = formData.password?.trim();
    if (pwd) {
      if (pwd.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
      }
      payload.password = pwd;
    } else if (!editingUser) {
      alert('Password is required when creating a new user (at least 6 characters).');
      return;
    }

    setSubmitting(true);
    try {
      if (editingUser) {
        await api.put(`/admin/users/${editingUser.id}`, payload);
      } else {
        await api.post('/admin/users', payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Save user failed:', err);
      const errData = err.response?.data;
      let errMsg = errData?.message || errData?.error || 'Failed to save user.';
      if (errData?.errors) {
        const details = Object.entries(errData.errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('\n');
        if (details) errMsg = `${errMsg}\n\n${details}`;
      }
      alert(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Are you sure you want to delete user "${u.username}"?`)) return;
    try {
      await api.delete(`/admin/users/${u.id}`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert('Failed to delete user.');
    }
  };

  const columns = [
    {
      header: 'User Account',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor:
                row.role === 'admin' ? '#fee2e2' : row.role === 'teacher' ? '#fef3c7' : '#e0f2fe',
              color:
                row.role === 'admin' ? '#b91c1c' : row.role === 'teacher' ? '#b45309' : '#0369a1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              flexShrink: 0,
            }}
          >
            {row.role === 'admin' ? (
              <Shield size={16} />
            ) : row.role === 'teacher' ? (
              <GraduationCap size={16} />
            ) : (
              <User size={16} />
            )}
          </div>
          <div>
            <div style={{ fontWeight: '700', color: 'var(--admin-primary)' }}>
              {row.fullName || row.username}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
              {row.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Username',
      accessor: 'username',
      render: (row) => <code>{row.username}</code>,
    },
    {
      header: 'Role',
      render: (row) => {
        const role = row.role || 'student';
        const badgeClass =
          role === 'admin'
            ? 'admin-badge-danger'
            : role === 'teacher'
            ? 'admin-badge-warning'
            : role === 'sub_admin'
            ? 'admin-badge-info'
            : 'admin-badge-success';
        return (
          <span className={`admin-badge ${badgeClass}`}>
            {role.toUpperCase()}
          </span>
        );
      },
    },
    {
      header: 'Student / Class ID',
      render: (row) => (
        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
          {row.studentId ? `${row.studentId} (${row.className || 'N/A'})` : '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => {
        const isActive = row.isActive !== false;
        return (
          <span className={`admin-badge ${isActive ? 'admin-badge-success' : 'admin-badge-warning'}`}>
            {isActive ? 'Active' : 'Disabled'}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={() => openEditModal(row)}
            className="admin-btn admin-btn-outline admin-btn-sm"
            title="Edit User"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="admin-btn admin-btn-danger admin-btn-sm"
            title="Delete User"
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
        title="Users & Roles"
        subtitle="Manage administrator, teacher, and student accounts and permissions"
        columns={columns}
        data={users}
        loading={loading}
        onAdd={openAddModal}
        addLabel="Add New User"
        onRefresh={fetchData}
        searchPlaceholder="Search users by name, username, or email..."
      />

      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? 'Edit User Account' : 'Create User Account'}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        maxWidth="680px"
      >
        <div className="admin-form-group">
          <label className="admin-form-label">Full Name</label>
          <input
            type="text"
            className="admin-form-control"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="e.g. Sok San or ថង វ៉ាន់ធៀវ"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">Username *</label>
            <input
              type="text"
              className="admin-form-control"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="e.g. sok_san or username"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Email *</label>
            <input
              type="email"
              className="admin-form-control"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@rpitssr.edu.kh"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">
              {editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}
            </label>
            <input
              type="password"
              autoComplete="new-password"
              className="admin-form-control"
              required={!editingUser}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingUser ? 'Leave blank to keep current password' : 'At least 6 characters'}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
              {editingUser
                ? 'Only fill this if you wish to reset or change this user’s password (min 6 chars).'
                : 'Minimum 6 characters.'}
            </span>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">System Role</label>
            <select
              className="admin-form-control"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher / Instructor</option>
              <option value="sub_admin">Sub Admin</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        </div>

        {formData.role === 'student' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Student ID (Optional)</label>
              <input
                type="text"
                className="admin-form-control"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                placeholder="e.g. STU-2026-001"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Class Name (Optional)</label>
              <input
                type="text"
                className="admin-form-control"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                placeholder="e.g. IT-G13-A"
              />
            </div>
          </div>
        )}

        <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
          <input
            type="checkbox"
            id="userActiveCheck"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          />
          <label htmlFor="userActiveCheck" style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}>
            Account is active and permitted to log in
          </label>
        </div>
      </AdminModal>
    </div>
  );
};
