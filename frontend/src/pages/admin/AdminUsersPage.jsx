import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminModal } from '../../components/admin/AdminModal';
import {
  Users,
  UserCheck,
  GraduationCap,
  Shield,
  ShieldAlert,
  User,
  Plus,
  ArrowRight,
  RefreshCw,
  Edit2,
  Trash2,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Lock,
  Mail,
  Hash,
  BookOpen,
  Award,
  Layers,
  Check,
  X,
  AlertTriangle,
  Clock
} from 'lucide-react';

export const AdminUsersPage = () => {
  const { currentLanguage } = useLanguage();
  const { user: currentUser, clearSession } = useAuth();
  const canManageUsers = currentUser?.role === 'admin';
  const isKhmer = currentLanguage === 'km';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('all');

  // Create / Edit User Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Quick Reset Password Modal
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetUser, setResetUser] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Delete Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    role: 'student',
    studentId: '',
    className: '',
    academicYear: '',
    semester: '',
    isActive: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users?limit=100');
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : (raw?.users || raw?.data || []);
      setUsers(list);
    } catch (err) {
      console.error('Error fetching users:', err);
      showToast(isKhmer ? 'បរាជ័យក្នុងការទាញយកបញ្ជីអ្នកប្រើប្រាស់' : 'Failed to fetch users list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute metric stats
  const metrics = useMemo(() => {
    const total = users.length;
    const students = users.filter((u) => u.role === 'student').length;
    const teachers = users.filter((u) => u.role === 'teacher').length;
    const admins = users.filter((u) => u.role === 'admin' || u.role === 'sub_admin').length;
    const pending = users.filter((u) => u.status === 'pending').length;
    return { total, students, teachers, admins, pending };
  }, [users]);

  // Compute filtered users by selected role tab
  const filteredUsers = useMemo(() => {
    if (selectedRole === 'all') return users;
    if (selectedRole === 'pending') {
      return users.filter((u) => u.status === 'pending');
    }
    if (selectedRole === 'admin') {
      return users.filter((u) => u.role === 'admin' || u.role === 'sub_admin');
    }
    return users.filter((u) => u.role === selectedRole);
  }, [users, selectedRole]);

  // Helper to extract initials
  const getUserInitials = (user) => {
    const name = (user.fullName || user.username || 'U').trim();
    const parts = name.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(isKhmer ? 'km-KH' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setShowPassword(false);
    setFormData({
      username: '',
      email: '',
      fullName: '',
      password: '',
      role: 'student',
      status: 'active',
      studentId: '',
      className: '',
      academicYear: '2025-2026',
      semester: '1',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setShowPassword(false);
    setFormData({
      username: u.username || '',
      email: u.email || '',
      fullName: u.fullName || '',
      password: '',
      role: u.role || 'student',
      status: u.status || 'active',
      studentId: u.studentId || '',
      className: u.className || '',
      academicYear: u.academicYear || '2025-2026',
      semester: u.semester || '1',
      isActive: u.isActive !== false,
    });
    setModalOpen(true);
  };

  const openResetPasswordModal = (u) => {
    setResetUser(u);
    setResetPassword('');
    setResetConfirmPassword('');
    setShowResetPassword(false);
    setResetModalOpen(true);
  };

  const openDeleteModal = (u) => {
    setUserToDelete(u);
    setDeleteModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username?.trim()) {
      showToast(isKhmer ? 'សូមបញ្ចូលឈ្មោះគណនី (Username)' : 'Username is required', 'error');
      return;
    }
    if (!formData.email?.trim()) {
      showToast(isKhmer ? 'សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែល (Email)' : 'Email address is required', 'error');
      return;
    }

    const payload = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      fullName: formData.fullName?.trim() || null,
      role: formData.role || 'student',
      status: formData.status || 'active',
      studentId: formData.studentId?.trim() || null,
      className: formData.className?.trim() || null,
      academicYear: formData.academicYear?.trim() || null,
      semester: formData.semester?.trim() || null,
    };

    const pwd = formData.password?.trim();
    if (pwd) {
      if (pwd.length < 8) {
        showToast(isKhmer ? 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៨ តួអក្សរ' : 'Password must be at least 8 characters long', 'error');
        return;
      }
      payload.password = pwd;
    } else if (!editingUser) {
      showToast(isKhmer ? 'សូមបញ្ចូលពាក្យសម្ងាត់យ៉ាងតិច ៨ តួអក្សរ' : 'Password is required when creating a new user', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingUser) {
        await api.put(`/admin/users/${editingUser.id}`, payload);
        if (editingUser.id === currentUser?.id && (payload.password || payload.role !== currentUser.role)) {
          clearSession();
          return;
        }
        showToast(isKhmer ? 'បានធ្វើបច្ចុប្បន្នភាពគណនីដោយជោគជ័យ!' : 'User account updated successfully!');
      } else {
        await api.post('/admin/users', payload);
        showToast(isKhmer ? 'បានបង្កើតគណនីអ្នកប្រើប្រាស់ថ្មីដោយជោគជ័យ!' : 'New user account created successfully!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Save user failed:', err);
      const errData = err.response?.data;
      let errMsg = errData?.message || errData?.error || (isKhmer ? 'បរាជ័យក្នុងការរក្សាទុកគណនី' : 'Failed to save user.');
      if (errData?.errors) {
        const details = Object.entries(errData.errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(' | ');
        if (details) errMsg = `${errMsg} (${details})`;
      }
      showToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetPassword || resetPassword.length < 8) {
      showToast(isKhmer ? 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៨ តួអក្សរ' : 'Password must be at least 8 characters long', 'error');
      return;
    }
    if (resetPassword !== resetConfirmPassword) {
      showToast(isKhmer ? 'ពាក្យសម្ងាត់ផ្ទៀងផ្ទាត់មិនត្រូវគ្នាឡើយ' : 'Passwords do not match', 'error');
      return;
    }

    setResetting(true);
    try {
      await api.put(`/admin/users/${resetUser.id}`, {
        password: resetPassword,
      });
      if (resetUser.id === currentUser?.id) {
        clearSession();
        return;
      }
      showToast(
        isKhmer
          ? `បានកំណត់ពាក្យសម្ងាត់ថ្មីសម្រាប់ ${resetUser.fullName || resetUser.username} ដោយជោគជ័យ!`
          : `Password reset successfully for ${resetUser.fullName || resetUser.username}!`
      );
      setResetModalOpen(false);
    } catch (err) {
      console.error('Reset password error:', err);
      showToast(isKhmer ? 'បរាជ័យក្នុងការកំណត់ពាក្យសម្ងាត់ថ្មី' : 'Failed to reset password', 'error');
    } finally {
      setResetting(false);
    }
  };

  const handleApproveUser = async (u) => {
    try {
      await api.put(`/admin/users/${u.id}/approve`);
      showToast(
        isKhmer
          ? `បានអនុម័តគណនីនិស្សិត "${u.fullName || u.username}" ជោគជ័យ!`
          : `Student account "${u.fullName || u.username}" approved successfully!`
      );
      fetchData();
    } catch (err) {
      console.error('Approve user error:', err);
      showToast(isKhmer ? 'បរាជ័យក្នុងការអនុម័តគណនី' : 'Failed to approve user', 'error');
    }
  };

  const handleRejectUser = async (u) => {
    try {
      await api.put(`/admin/users/${u.id}/reject`);
      showToast(
        isKhmer
          ? `បានបដិសេធគណនី "${u.fullName || u.username}"!`
          : `User account "${u.fullName || u.username}" rejected!`,
        'error'
      );
      fetchData();
    } catch (err) {
      console.error('Reject user error:', err);
      showToast(isKhmer ? 'បរាជ័យក្នុងការបដិសេធគណនី' : 'Failed to reject user', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/users/${userToDelete.id}`);
      showToast(
        isKhmer
          ? `បានលុបគណនី "${userToDelete.username}" ចេញពីប្រព័ន្ធរួចរាល់!`
          : `User "${userToDelete.username}" deleted successfully!`
      );
      setDeleteModalOpen(false);
      setUserToDelete(null);
      fetchData();
    } catch (err) {
      console.error('Failed to delete user:', err);
      showToast(isKhmer ? 'បរាជ័យក្នុងការលុបគណនី' : 'Failed to delete user account', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: isKhmer ? 'គណនីអ្នកប្រើប្រាស់' : 'User Account',
      render: (row) => {
        const role = row.role || 'student';
        const roleClass =
          role === 'admin'
            ? 'role-admin'
            : role === 'sub_admin'
            ? 'role-sub_admin'
            : role === 'teacher'
            ? 'role-teacher'
            : 'role-student';

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className={`admin-user-avatar ${roleClass}`}>
              {getUserInitials(row)}
              <span
                className="admin-user-avatar-role-dot"
                style={{
                  background:
                    role === 'admin'
                      ? '#dc2626'
                      : role === 'sub_admin'
                      ? '#4338ca'
                      : role === 'teacher'
                      ? '#d97706'
                      : '#1e73be',
                }}
              />
            </div>
            <div>
              <div style={{ fontWeight: '700', color: '#07294D', fontSize: '0.92rem' }}>
                {row.fullName || row.username}
              </div>
              <div
                style={{
                  fontSize: '0.78rem',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '2px',
                }}
              >
                <Mail size={12} style={{ opacity: 0.7 }} />
                <span>{row.email}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: isKhmer ? 'ឈ្មោះគណនី' : 'Username',
      render: (row) => (
        <span className="admin-username-code">
          <Hash size={12} style={{ color: '#94a3b8' }} />
          {row.username}
        </span>
      ),
    },
    {
      header: isKhmer ? 'តួនាទី / សិទ្ធិ' : 'Role & Access',
      render: (row) => {
        const role = row.role || 'student';
        if (role === 'admin') {
          return (
            <span className="admin-badge admin-badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <ShieldAlert size={12} />
              {isKhmer ? 'អ្នកគ្រប់គ្រងកំពូល' : 'Super Admin'}
            </span>
          );
        }
        if (role === 'sub_admin') {
          return (
            <span className="admin-badge admin-badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Shield size={12} />
              {isKhmer ? 'អនុអ្នកគ្រប់គ្រង' : 'Sub Admin'}
            </span>
          );
        }
        if (role === 'teacher') {
          return (
            <span className="admin-badge admin-badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <GraduationCap size={12} />
              {isKhmer ? 'សាស្ត្រាចារ្យ' : 'Teacher / Faculty'}
            </span>
          );
        }
        return (
          <span className="admin-badge admin-badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <User size={12} />
            {isKhmer ? 'និស្សិត' : 'Student'}
          </span>
        );
      },
    },
    {
      header: isKhmer ? 'អត្តលេខ & ថ្នាក់' : 'Student ID & Class',
      render: (row) => {
        if (!row.studentId && !row.className) {
          return <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>—</span>;
        }
        return (
          <div>
            <div style={{ fontWeight: '600', color: '#07294D', fontSize: '0.84rem' }}>
              {row.studentId || '—'}
            </div>
            {row.className && (
              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                {row.className} {row.semester ? `(ឆមាស ${row.semester})` : ''}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: isKhmer ? 'កាលបរិច្ឆេទបង្កើត' : 'Registered Date',
      render: (row) => (
        <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <Calendar size={13} style={{ opacity: 0.6 }} />
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      header: isKhmer ? 'ស្ថានភាព' : 'Status',
      render: (row) => {
        if (row.status === 'pending') {
          return (
            <span
              className="admin-badge"
              style={{
                background: '#fef3c7',
                color: '#b45309',
                border: '1px solid #fde68a',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: '8px',
              }}
            >
              <Clock size={12} />
              {isKhmer ? 'រង់ចាំអនុម័ត' : 'Pending'}
            </span>
          );
        }
        if (row.status === 'rejected') {
          return (
            <span
              className="admin-badge"
              style={{
                background: '#fef2f2',
                color: '#b91c1c',
                border: '1px solid #fecaca',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: '8px',
              }}
            >
              <X size={12} />
              {isKhmer ? 'បដិសេធ' : 'Rejected'}
            </span>
          );
        }
        const isActive = row.isActive !== false;
        return (
          <span
            className="admin-health-status-badge healthy"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#16a34a',
                boxShadow: '0 0 6px #16a34a',
              }}
            />
            {isKhmer ? (isActive ? 'សកម្ម' : 'អសកម្ម') : (isActive ? 'Active' : 'Disabled')}
          </span>
        );
      },
    },
    {
      header: isKhmer ? 'សកម្មភាព' : 'Actions',
      align: 'right',
      render: (row) => canManageUsers ? (
        <div className="admin-action-btn-group">
          {row.status === 'pending' && (
            <>
              <button
                onClick={() => handleApproveUser(row)}
                className="admin-icon-btn success"
                style={{
                  background: '#f0fdf4',
                  color: '#16a34a',
                  border: '1px solid #bbf7d0',
                }}
                title={isKhmer ? 'អនុម័តគណនី (Approve)' : 'Approve Account'}
              >
                <Check size={14} style={{ strokeWidth: 2.5 }} />
              </button>
              <button
                onClick={() => handleRejectUser(row)}
                className="admin-icon-btn danger"
                style={{
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                }}
                title={isKhmer ? 'បដិសេធគណនី (Reject)' : 'Reject Account'}
              >
                <X size={14} style={{ strokeWidth: 2.5 }} />
              </button>
            </>
          )}
          <button
            onClick={() => openEditModal(row)}
            className="admin-icon-btn primary"
            title={isKhmer ? 'កែសម្រួលព័ត៌មាន' : 'Edit User'}
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => openResetPasswordModal(row)}
            className="admin-icon-btn warning"
            title={isKhmer ? 'កំណត់ពាក្យសម្ងាត់ឡើងវិញ' : 'Reset Password'}
          >
            <KeyRound size={14} />
          </button>
          <button
            onClick={() => openDeleteModal(row)}
            className="admin-icon-btn danger"
            title={isKhmer ? 'លុបគណនី' : 'Delete User'}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ) : <span style={{ color: '#64748b' }}>{isKhmer ? 'មើលបានតែប៉ុណ្ណោះ' : 'Read only'}</span>,
    },
  ];

  // Mobile Card Renderer for Screens < 768px
  const renderMobileCard = (row) => {
    const role = row.role || 'student';
    const roleClass =
      role === 'admin'
        ? 'role-admin'
        : role === 'sub_admin'
        ? 'role-sub_admin'
        : role === 'teacher'
        ? 'role-teacher'
        : 'role-student';

    const isActive = row.isActive !== false;

    return (
      <div className="admin-user-mobile-card">
        {/* Top Row: User Avatar, Name, Username & Role Badge */}
        <div className="admin-user-mobile-card-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div className={`admin-user-avatar ${roleClass}`}>
              {getUserInitials(row)}
              <span
                className="admin-user-avatar-role-dot"
                style={{
                  background:
                    role === 'admin'
                      ? '#dc2626'
                      : role === 'sub_admin'
                      ? '#4338ca'
                      : role === 'teacher'
                      ? '#d97706'
                      : '#1e73be',
                }}
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: '700', color: '#07294D', fontSize: '0.92rem', lineHeight: 1.25 }}>
                {row.fullName || row.username}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', color: '#64748b', fontSize: '0.78rem' }}>
                <span className="admin-username-code" style={{ padding: '1px 6px', fontSize: '0.74rem' }}>
                  @{row.username}
                </span>
                {row.studentId && (
                  <span style={{ fontSize: '0.75rem', color: '#1e73be', fontWeight: '600' }}>
                    • {row.studentId}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Role Badge */}
          <div style={{ flexShrink: 0 }}>
            {role === 'admin' && (
              <span className="admin-badge admin-badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', padding: '3px 8px' }}>
                <ShieldAlert size={12} />
                <span>{isKhmer ? 'Admin' : 'Admin'}</span>
              </span>
            )}
            {role === 'sub_admin' && (
              <span className="admin-badge admin-badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', padding: '3px 8px' }}>
                <Shield size={12} />
                <span>Sub Admin</span>
              </span>
            )}
            {role === 'teacher' && (
              <span className="admin-badge admin-badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', padding: '3px 8px' }}>
                <GraduationCap size={12} />
                <span>{isKhmer ? 'សាស្ត្រាចារ្យ' : 'Teacher'}</span>
              </span>
            )}
            {role === 'student' && (
              <span className="admin-badge admin-badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', padding: '3px 8px' }}>
                <User size={12} />
                <span>{isKhmer ? 'និស្សិត' : 'Student'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Details Block: Email, Class & Created Date */}
        <div className="admin-user-mobile-card-details">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.80rem', color: '#475569' }}>
            <Mail size={13} style={{ color: '#1e73be', flexShrink: 0 }} />
            <span style={{ wordBreak: 'break-all' }}>{row.email}</span>
          </div>

          {row.className && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
              <BookOpen size={13} style={{ color: '#059669', flexShrink: 0 }} />
              <span>{row.className} {row.semester ? `(ឆមាស ${row.semester})` : ''} {row.academicYear ? `• ${row.academicYear}` : ''}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed #e2e8f0', fontSize: '0.75rem' }}>
            <span style={{ color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={12} />
              {formatDate(row.createdAt)}
            </span>
            <span className="admin-health-status-badge healthy" style={{ padding: '2px 8px', fontSize: '0.70rem' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#16a34a' }} />
              {isKhmer ? (isActive ? 'សកម្ម' : 'អសកម្ម') : (isActive ? 'Active' : 'Disabled')}
            </span>
          </div>
        </div>

        {/* Action Buttons Bar */}
        {canManageUsers && (
          <div className="admin-user-mobile-card-actions">
            {row.status === 'pending' && (
              <>
                <button
                  onClick={() => handleApproveUser(row)}
                  className="admin-user-mobile-action-btn"
                  style={{
                    background: '#f0fdf4',
                    color: '#16a34a',
                    border: '1px solid #bbf7d0',
                    fontWeight: '700',
                  }}
                  title={isKhmer ? 'អនុម័ត' : 'Approve'}
                >
                  <Check size={13} style={{ strokeWidth: 2.5 }} />
                  <span>{isKhmer ? 'អនុម័ត' : 'Approve'}</span>
                </button>

                <button
                  onClick={() => handleRejectUser(row)}
                  className="admin-user-mobile-action-btn"
                  style={{
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    fontWeight: '700',
                  }}
                  title={isKhmer ? 'បដិសេធ' : 'Reject'}
                >
                  <X size={13} style={{ strokeWidth: 2.5 }} />
                  <span>{isKhmer ? 'បដិសេធ' : 'Reject'}</span>
                </button>
              </>
            )}

            <button
              onClick={() => openEditModal(row)}
              className="admin-user-mobile-action-btn edit"
              title={isKhmer ? 'កែសម្រួល' : 'Edit'}
            >
              <Edit2 size={13} />
              <span>{isKhmer ? 'កែសម្រួល' : 'Edit'}</span>
            </button>

            <button
              onClick={() => openResetPasswordModal(row)}
              className="admin-user-mobile-action-btn reset"
              title={isKhmer ? 'ប្តូរពាក្យសម្ងាត់' : 'Reset Password'}
            >
              <KeyRound size={13} />
              <span>{isKhmer ? 'ពាក្យសម្ងាត់' : 'Password'}</span>
            </button>

            <button
              onClick={() => openDeleteModal(row)}
              className="admin-user-mobile-action-btn delete"
              title={isKhmer ? 'លុប' : 'Delete'}
            >
              <Trash2 size={13} />
              <span>{isKhmer ? 'លុប' : 'Delete'}</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Sleek Floating Alert Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 20px',
            borderRadius: '12px',
            background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
            color: toast.type === 'error' ? '#991b1b' : '#166534',
            boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
            fontWeight: '600',
            fontSize: '0.88rem',
            animation: 'fadeIn 0.25s ease',
          }}
        >
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              padding: '2px',
              marginLeft: '8px',
              opacity: 0.7,
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="admin-users-header">
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              background: '#eff6ff',
              color: '#1e73be',
              fontSize: '0.78rem',
              fontWeight: '700',
              marginBottom: '8px',
              border: '1px solid #dbeafe',
            }}
          >
            <Users size={14} />
            <span>{isKhmer ? 'ការគ្រប់គ្រងគណនី និងសិទ្ធិប្រព័ន្ធ' : 'Identity & Access Directory'}</span>
          </div>
          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: '800',
              color: '#07294D',
              margin: '0 0 6px 0',
              letterSpacing: '-0.3px',
            }}
          >
            {isKhmer ? 'អ្នកប្រើប្រាស់ & តួនាទី' : 'User Accounts & Roles'}
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
            {isKhmer
              ? 'គ្រប់គ្រង ត្រួតពិនិត្យ និងចាត់ចែងសិទ្ធិគណនីអ្នកគ្រប់គ្រង សាស្ត្រាចារ្យ និងនិស្សិត RPITSSR'
              : 'Centrally manage administrative officers, teaching faculty, and student portals.'}
          </p>
        </div>

        <div className="admin-users-header-actions">
          <button
            onClick={fetchData}
            className="admin-btn admin-btn-outline"
            disabled={loading}
            title={isKhmer ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>{isKhmer ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}</span>
          </button>

          {canManageUsers && <button
            onClick={openAddModal}
            className="admin-btn admin-btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(7, 41, 77, 0.15)',
            }}
          >
            <Plus size={16} />
            <span>{isKhmer ? 'បង្កើតគណនីថ្មី' : 'Add New User'}</span>
          </button>}
        </div>
      </div>

      {/* 4-Card Institutional KPI Metric Strip */}
      <div className="admin-kpi-grid admin-user-kpis">
        {/* Total Users */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">{isKhmer ? 'គណនីសរុប' : 'Total Accounts'}</span>
              <div className="admin-kpi-value">{metrics.total}</div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#1e73be' }} />
                <span>{isKhmer ? 'គណនីទាំងអស់ក្នុងប្រព័ន្ធ' : 'All registered system accounts'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#eff6ff', color: '#1e73be' }}>
                {isKhmer ? 'សរុប' : 'Total'}
              </span>
              <div className="admin-kpi-icon-badge" style={{ background: '#eff6ff', color: '#1e73be', border: '1px solid #dbeafe' }}>
                <Users size={24} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'គ្រប់គ្រងអ្នកប្រើប្រាស់' : 'Manage accounts'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* Student Accounts */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">{isKhmer ? 'គណនីនិស្សិត' : 'Student Accounts'}</span>
              <div className="admin-kpi-value">{metrics.students}</div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#059669' }} />
                <span>{isKhmer ? 'និស្សិតកំពុងសិក្សា' : 'Enrolled student portals'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#f0fdf4', color: '#059669' }}>
                {isKhmer ? 'និស្សិត' : 'Students'}
              </span>
              <div className="admin-kpi-icon-badge" style={{ background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' }}>
                <GraduationCap size={24} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'គណនីនិស្សិតសកម្ម' : 'Active student profiles'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* Teachers / Faculty */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">{isKhmer ? 'សាស្ត្រាចារ្យ & គ្រូ' : 'Faculty & Teachers'}</span>
              <div className="admin-kpi-value">{metrics.teachers}</div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#ea580c' }} />
                <span>{isKhmer ? 'បុគ្គលិកបង្រៀន' : 'Teaching staff instructors'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#fff7ed', color: '#ea580c' }}>
                {isKhmer ? 'គ្រូ' : 'Faculty'}
              </span>
              <div className="admin-kpi-icon-badge" style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa' }}>
                <UserCheck size={24} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'គ្រូបង្រៀន & ជំនាញ' : 'Instructors & faculty'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>

        {/* Administrators */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-main-row">
            <div className="admin-kpi-left-stack">
              <span className="admin-kpi-category-label">{isKhmer ? 'អ្នកគ្រប់គ្រងប្រព័ន្ធ' : 'System Administrators'}</span>
              <div className="admin-kpi-value">{metrics.admins}</div>
              <div className="admin-kpi-context-pill">
                <span className="admin-kpi-dot" style={{ backgroundColor: '#7c3aed' }} />
                <span>{isKhmer ? 'សិទ្ធិកម្រិតខ្ពស់' : 'Elevated admin privileges'}</span>
              </div>
            </div>
            <div className="admin-kpi-right-stack">
              <span className="admin-kpi-tag" style={{ background: '#faf5ff', color: '#7c3aed' }}>
                {isKhmer ? 'រដ្ឋបាល' : 'Admin'}
              </span>
              <div className="admin-kpi-icon-badge" style={{ background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}>
                <Shield size={24} />
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer-action">
            <span>{isKhmer ? 'សិទ្ធិអភិបាលប្រព័ន្ធ' : 'Privilege management'}</span>
            <ArrowRight size={14} className="admin-kpi-action-arrow" />
          </div>
        </div>
      </div>

      {/* Role Filter Tabs Strip */}
      <div className="admin-user-filter-bar">
        <button
          className={`admin-user-filter-pill ${selectedRole === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedRole('all')}
        >
          <Users size={15} />
          <span>{isKhmer ? 'ទាំងអស់' : 'All Users'}</span>
          <span className="admin-user-filter-count">{metrics.total}</span>
        </button>

        <button
          className={`admin-user-filter-pill ${selectedRole === 'pending' ? 'active' : ''}`}
          onClick={() => setSelectedRole('pending')}
          style={
            metrics.pending > 0
              ? {
                  border: '1px solid #fde68a',
                  background: selectedRole === 'pending' ? undefined : '#fffbeb',
                }
              : {}
          }
        >
          <Clock size={15} style={{ color: '#d97706' }} />
          <span>{isKhmer ? 'រង់ចាំការអនុម័ត' : 'Pending Approvals'}</span>
          <span
            className="admin-user-filter-count"
            style={
              metrics.pending > 0
                ? { background: '#f59e0b', color: '#ffffff', fontWeight: '800' }
                : {}
            }
          >
            {metrics.pending}
          </span>
        </button>

        <button
          className={`admin-user-filter-pill ${selectedRole === 'student' ? 'active' : ''}`}
          onClick={() => setSelectedRole('student')}
        >
          <GraduationCap size={15} />
          <span>{isKhmer ? 'និស្សិត' : 'Students'}</span>
          <span className="admin-user-filter-count">{metrics.students}</span>
        </button>

        <button
          className={`admin-user-filter-pill ${selectedRole === 'teacher' ? 'active' : ''}`}
          onClick={() => setSelectedRole('teacher')}
        >
          <UserCheck size={15} />
          <span>{isKhmer ? 'សាស្ត្រាចារ្យ' : 'Teachers'}</span>
          <span className="admin-user-filter-count">{metrics.teachers}</span>
        </button>

        <button
          className={`admin-user-filter-pill ${selectedRole === 'admin' ? 'active' : ''}`}
          onClick={() => setSelectedRole('admin')}
        >
          <Shield size={15} />
          <span>{isKhmer ? 'អ្នកគ្រប់គ្រងប្រព័ន្ធ' : 'Administrators'}</span>
          <span className="admin-user-filter-count">{metrics.admins}</span>
        </button>
      </div>

      {/* Main DataTable Card */}
      <AdminDataTable
        title={isKhmer ? 'បញ្ជីគណនីអ្នកប្រើប្រាស់' : 'User Accounts Directory'}
        subtitle={
          isKhmer
            ? `បង្ហាញទិន្នន័យគណនីសរុប ${filteredUsers.length} នាក់ តាមការជ្រើសរើស`
            : `Displaying ${filteredUsers.length} total user accounts based on active filters`
        }
        columns={columns}
        data={filteredUsers}
        loading={loading}
        onAdd={openAddModal}
        addLabel={isKhmer ? 'បង្កើតគណនីថ្មី' : 'Add New User'}
        onRefresh={fetchData}
        searchPlaceholder={isKhmer ? 'ស្វែងរកតាមឈ្មោះ, ឈ្មោះគណនី, ឬអ៊ីមែល...' : 'Search users by name, username, or email...'}
        renderMobileCard={renderMobileCard}
      />

      {/* =========================================================
          Create / Edit User Account Modal
          ========================================================= */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingUser
            ? (isKhmer ? 'កែសម្រួលគណនីអ្នកប្រើប្រាស់' : 'Edit User Account')
            : (isKhmer ? 'បង្កើតគណនីអ្នកប្រើប្រាស់ថ្មី' : 'Create New User Account')
        }
        submitLabel={
          editingUser
            ? (isKhmer ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'Save Changes')
            : (isKhmer ? 'បង្កើតគណនី' : 'Create Account')
        }
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        maxWidth="720px"
      >
        {/* Section 1: Basic Information */}
        <div className="admin-modal-section-divider" style={{ marginTop: 0 }}>
          <span className="admin-modal-section-title">
            <User size={15} style={{ color: '#1e73be' }} />
            {isKhmer ? 'ព័ត៌មានមូលដ្ឋាន' : 'Basic Account Information'}
          </span>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">
            {isKhmer ? 'ឈ្មោះពេញ (Full Name)' : 'Full Name'}
          </label>
          <input
            type="text"
            className="admin-form-control"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder={isKhmer ? 'ឧ. ថង វ៉ាន់ធៀវ ឬ Sok San' : 'e.g. Sok San or John Doe'}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'ឈ្មោះគណនី (Username) *' : 'Username *'}
            </label>
            <div className="admin-input-with-action">
              <input
                type="text"
                className="admin-form-control"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="e.g. soksan"
              />
            </div>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
              {isKhmer ? 'ប្រើសម្រាប់ចូលប្រើប្រព័ន្ធ' : 'Used as login identifier'}
            </span>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              {isKhmer ? 'អាសយដ្ឋានអ៊ីមែល (Email) *' : 'Email Address *'}
            </label>
            <input
              type="email"
              className="admin-form-control"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@rpitssr.edu.kh"
            />
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
              {isKhmer ? 'អ៊ីមែលត្រូវតែមានលក្ខណៈតែមួយក្នុងប្រព័ន្ធ' : 'Unique institutional or personal email'}
            </span>
          </div>
        </div>

        {/* Section 2: Role & Privileges */}
        <div className="admin-modal-section-divider">
          <span className="admin-modal-section-title">
            <Shield size={15} style={{ color: '#ea580c' }} />
            {isKhmer ? 'តួនាទី & សិទ្ធិអនុញ្ញាត' : 'System Role & Privileges'}
          </span>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">
            {isKhmer ? 'កំណត់តួនាទី (System Role)' : 'System Role'}
          </label>
          <select
            className="admin-form-control"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="student">{isKhmer ? 'និស្សិត (Student)' : 'Student'}</option>
            <option value="teacher">{isKhmer ? 'សាស្ត្រាចារ្យ / គ្រូបង្រៀន (Teacher / Instructor)' : 'Teacher / Faculty'}</option>
            <option value="sub_admin">{isKhmer ? 'អនុអ្នកគ្រប់គ្រង (Sub Administrator)' : 'Sub Administrator'}</option>
            <option value="admin">{isKhmer ? 'អ្នកគ្រប់គ្រងជាន់ខ្ពស់ (Super Administrator)' : 'Super Administrator'}</option>
          </select>
          <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '5px', display: 'block' }}>
            {formData.role === 'admin' && (isKhmer ? '⚡ មានសិទ្ធិគ្រប់គ្រងទិន្នន័យទាំងអស់ និងការកំណត់ប្រព័ន្ធ' : '⚡ Full access to manage all system records and settings')}
            {formData.role === 'sub_admin' && (isKhmer ? '🛡️ មានសិទ្ធិគ្រប់គ្រងមាតិកា និងសិស្ស លើកលែងតែការកំណត់ប្រព័ន្ធ' : '🛡️ Access to manage content and student results')}
            {formData.role === 'teacher' && (isKhmer ? '🎓 សាស្ត្រាចារ្យអាចគ្រប់គ្រងវគ្គសិក្សា និងលទ្ធផលប្រឡង' : '🎓 Can oversee assigned courses and grades')}
            {formData.role === 'student' && (isKhmer ? '📖 និស្សិតអាចមើលពិន្ទុ លទ្ធផលប្រឡង និងទាញយកឯកសារសិក្សា' : '📖 Can access student portal, exam results, and library')}
          </span>
        </div>

        {/* Account Status */}
        <div className="admin-form-group">
          <label className="admin-form-label">
            {isKhmer ? 'ស្ថានភាពគណនី (Account Status)' : 'Account Status'}
          </label>
          <select
            className="admin-form-control"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="active">{isKhmer ? '✓ សកម្ម (Active - អាចចូលប្រើប្រាស់បាន)' : '✓ Active (Permitted to sign in)'}</option>
            <option value="pending">{isKhmer ? '⏳ រង់ចាំការអនុម័ត (Pending Admin Approval)' : '⏳ Pending Admin Approval'}</option>
            <option value="rejected">{isKhmer ? '✕ បដិសេធ (Rejected - មិនអនុញ្ញាត)' : '✕ Rejected (Blocked)'}</option>
          </select>
        </div>

        {/* Section 3: Academic Information (for student) */}
        {formData.role === 'student' && (
          <>
            <div className="admin-modal-section-divider">
              <span className="admin-modal-section-title">
                <BookOpen size={15} style={{ color: '#059669' }} />
                {isKhmer ? 'ព័ត៌មានសិក្សា (សម្រាប់និស្សិត)' : 'Academic Details (Student Portal)'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">
                  {isKhmer ? 'អត្តលេខនិស្សិត (Student ID)' : 'Student ID'}
                </label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  placeholder="e.g. STU-2026-001"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">
                  {isKhmer ? 'ក្រុម / ថ្នាក់ (Class Name)' : 'Class / Group Name'}
                </label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  placeholder="e.g. IT-G13-A"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">
                  {isKhmer ? 'ឆ្នាំសិក្សា (Academic Year)' : 'Academic Year'}
                </label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  placeholder="e.g. 2025-2026"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">
                  {isKhmer ? 'ឆមាស (Semester)' : 'Semester'}
                </label>
                <select
                  className="admin-form-control"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                >
                  <option value="1">{isKhmer ? 'ឆមាសទី ១ (Semester 1)' : 'Semester 1'}</option>
                  <option value="2">{isKhmer ? 'ឆមាសទី ២ (Semester 2)' : 'Semester 2'}</option>
                  <option value="3">{isKhmer ? 'ឆមាសទី ៣ (Semester 3)' : 'Semester 3'}</option>
                  <option value="4">{isKhmer ? 'ឆមាសទី ៤ (Semester 4)' : 'Semester 4'}</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* Section 4: Security & Password */}
        <div className="admin-modal-section-divider">
          <span className="admin-modal-section-title">
            <Lock size={15} style={{ color: '#7c3aed' }} />
            {isKhmer ? 'សុវត្ថិភាព & ពាក្យសម្ងាត់' : 'Security & Password'}
          </span>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">
            {editingUser
              ? (isKhmer ? 'ពាក្យសម្ងាត់ថ្មី (ទុកនៅទំនេរបើមិនចង់ផ្លាស់ប្តូរ)' : 'New Password (leave blank to keep unchanged)')
              : (isKhmer ? 'ពាក្យសម្ងាត់ *' : 'Password *')}
          </label>
          <div className="admin-input-with-action">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className="admin-form-control"
              required={!editingUser}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingUser ? (isKhmer ? 'ទុកនៅទំនេរបើមិនផ្លាស់ប្តូរ' : 'Leave blank to keep current password') : (isKhmer ? 'យ៉ាងហោចណាស់ ៨ តួអក្សរ' : 'At least 8 characters')}
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              className="admin-input-action-btn"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? (isKhmer ? 'លាក់ពាក្យសម្ងាត់' : 'Hide password') : (isKhmer ? 'បង្ហាញពាក្យសម្ងាត់' : 'Show password')}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
            {editingUser
              ? (isKhmer ? 'បំពេញតែពេលដែលលោកអ្នកចង់ផ្លាស់ប្តូរពាក្យសម្ងាត់ឱ្យគណនីនេះ (យ៉ាងតិច ៨ តួអក្សរ)' : 'Only fill if resetting password (min 8 characters)')
              : (isKhmer ? 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៨ តួអក្សរ' : 'Minimum 8 characters required')}
          </span>
        </div>

        {/* Section 5: Account Status Checkbox */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '16px',
            padding: '12px 16px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
          }}
        >
          <input
            type="checkbox"
            id="userActiveCheck"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="userActiveCheck" style={{ margin: 0, fontSize: '0.88rem', fontWeight: '600', color: '#07294D', cursor: 'pointer' }}>
            {isKhmer ? 'គណនីសកម្ម និងត្រូវបានអនុញ្ញាតឱ្យចូលប្រើប្រព័ន្ធ' : 'Account is active and permitted to sign in'}
          </label>
        </div>
      </AdminModal>

      {/* =========================================================
          Quick Reset Password Dedicated Modal
          ========================================================= */}
      <AdminModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title={isKhmer ? 'កំណត់ពាក្យសម្ងាត់ឡើងវិញ' : 'Reset User Password'}
        submitLabel={isKhmer ? 'ប្តូរពាក្យសម្ងាត់ថ្មី' : 'Update Password'}
        onSubmit={handleResetPasswordSubmit}
        isSubmitting={resetting}
        maxWidth="480px"
      >
        {resetUser && (
          <div>
            {/* Target User Info Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '10px',
                marginBottom: '18px',
              }}
            >
              <div
                className={`admin-user-avatar role-${resetUser.role || 'student'}`}
                style={{ width: '38px', height: '38px', fontSize: '0.8rem' }}
              >
                {getUserInitials(resetUser)}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: '700', color: '#07294D', fontSize: '0.9rem' }}>
                  {resetUser.fullName || resetUser.username}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#1e73be' }}>
                  {resetUser.email}
                </div>
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'ពាក្យសម្ងាត់ថ្មី *' : 'New Password *'}
              </label>
              <div className="admin-input-with-action">
                <input
                  type={showResetPassword ? 'text' : 'password'}
                  className="admin-form-control"
                  required
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder={isKhmer ? 'យ៉ាងហោចណាស់ ៨ តួអក្សរ' : 'At least 8 characters'}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  className="admin-input-action-btn"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                >
                  {showResetPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                {isKhmer ? 'ផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់ថ្មី *' : 'Confirm New Password *'}
              </label>
              <input
                type={showResetPassword ? 'text' : 'password'}
                className="admin-form-control"
                required
                value={resetConfirmPassword}
                onChange={(e) => setResetConfirmPassword(e.target.value)}
                placeholder={isKhmer ? 'បញ្ចូលពាក្យសម្ងាត់ថ្មីម្តងទៀត' : 'Re-enter new password'}
              />
              {resetPassword && resetConfirmPassword && (
                <span
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: '600',
                    marginTop: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: resetPassword === resetConfirmPassword ? '#16a34a' : '#dc2626',
                  }}
                >
                  {resetPassword === resetConfirmPassword ? (
                    <>
                      <CheckCircle2 size={13} /> {isKhmer ? 'ពាក្យសម្ងាត់ត្រូវគ្នា' : 'Passwords match'}
                    </>
                  ) : (
                    <>
                      <AlertCircle size={13} /> {isKhmer ? 'ពាក្យសម្ងាត់មិនត្រូវគ្នាឡើយ' : 'Passwords do not match'}
                    </>
                  )}
                </span>
              )}
            </div>
          </div>
        )}
      </AdminModal>

      {/* =========================================================
          Delete User Confirmation Modal
          ========================================================= */}
      {deleteModalOpen && userToDelete && (
        <div className="admin-modal-backdrop" onClick={() => setDeleteModalOpen(false)}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: '440px', textAlign: 'center', padding: '24px' }}
            onClick={(e) => e.stopPropagation()}
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
                border: '1px solid #fecaca',
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#07294D', margin: '0 0 8px' }}>
              {isKhmer ? 'តើអ្នកពិតជាចង់លុបគណនីនេះមែនទេ?' : 'Confirm User Deletion'}
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 16px' }}>
              {isKhmer
                ? `តើលោកអ្នកពិតជាចង់លុបគណនី "${userToDelete.fullName || userToDelete.username}" (@${userToDelete.username}) មែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយបានឡើយ។`
                : `Are you sure you want to permanently delete account "${userToDelete.fullName || userToDelete.username}" (@${userToDelete.username})? This action cannot be undone.`}
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="admin-btn admin-btn-outline"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
              >
                {isKhmer ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? (isKhmer ? 'កំពុងលុប...' : 'Deleting...') : (isKhmer ? 'លុបគណនីចេញ' : 'Delete User')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
