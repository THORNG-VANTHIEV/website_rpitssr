import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import {
  GraduationCap,
  BookOpen,
  Library,
  Bell,
  User,
  LogOut,
  ExternalLink,
  Award,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
  Search,
  Eye,
  ChevronRight,
  BookMarked,
  Layers,
  Printer,
  Filter,
  X,
  Sparkles,
  Check,
  AlertTriangle,
  RefreshCw,
  Bookmark,
  TrendingUp,
  QrCode,
  Wallet,
  Briefcase,
  MessageSquare,
  MapPin,
  Phone,
  ShieldCheck,
  Download,
  UserCheck,
  Star,
} from 'lucide-react';

export const StudentDashboardPage = () => {
  const { user, logout, logoutAll, clearSession } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // overview, exams, library, notices, profile
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [examResults, setExamResults] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [notices, setNotices] = useState([]);

  // Exam Filters & Transcript Modal State
  const [examSearchQuery, setExamSearchQuery] = useState('');
  const [examSemesterFilter, setExamSemesterFilter] = useState('all');
  const [selectedTranscript, setSelectedTranscript] = useState(null);

  // Library Loans Filter & Renewal State
  const [libraryStatusFilter, setLibraryStatusFilter] = useState('all');
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');
  const [renewSuccessMsg, setRenewSuccessMsg] = useState('');
  const [renewingId, setRenewingId] = useState(null);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    className: '',
    studentId: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Gateway Modals & Interactive Views State
  const [selectedGatewayModal, setSelectedGatewayModal] = useState(null); // 'timetable' | 'attendance' | 'payments' | 'internship' | 'curriculum' | 'feedback' | 'achievements'
  const [feedbackForm, setFeedbackForm] = useState({ category: 'curriculum', rating: 5, comment: '' });
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [editContactModalOpen, setEditContactModalOpen] = useState(false);
  const [contactPhoneInput, setContactPhoneInput] = useState('');
  const [contactFullNameInput, setContactFullNameInput] = useState('');
  const [contactSaving, setContactSaving] = useState(false);
  const [contactSuccessMsg, setContactSuccessMsg] = useState('');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [printCardModalOpen, setPrintCardModalOpen] = useState(false);

  // Logout Modal State
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  // Fetch student dashboard data
  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const [dashRes, examRes] = await Promise.all([
        api.get('/student/dashboard'),
        api.get('/student/exam-results').catch(() => ({ data: { data: [] } })),
      ]);

      const data = dashRes.data?.data || {};
      setDashboardData(data);
      setNotices(data.recentNotices || []);
      setBorrowings(data.borrowings || []);

      const myResults = examRes.data?.data || data.recentResults || [];
      setExamResults(Array.isArray(myResults) ? myResults : []);

      // Pre-fill profile form
      if (data.student) {
        setProfileForm((prev) => ({
          ...prev,
          fullName: data.student.fullName || '',
          className: data.student.className || '',
          studentId: data.student.studentId || '',
        }));
      }
    } catch (err) {
      console.error('Error fetching student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      setLogoutModalOpen(false);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess('');
    setProfileError('');

    if (profileForm.newPassword) {
      if (profileForm.newPassword.length < 8) {
        setProfileError('ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៨ តួអក្សរ / New password must be at least 8 characters.');
        setProfileSaving(false);
        return;
      }
      if (profileForm.newPassword !== profileForm.confirmPassword) {
        setProfileError('ពាក្យសម្ងាត់ផ្ទៀងផ្ទាត់មិនត្រូវគ្នាទេ / Passwords do not match.');
        setProfileSaving(false);
        return;
      }
      if (!profileForm.currentPassword) {
        setProfileError('សូមបញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្នដើម្បីផ្លាស់ប្តូរពាក្យសម្ងាត់ / Current password is required.');
        setProfileSaving(false);
        return;
      }
    }

    try {
      const payload = {
        fullName: profileForm.fullName.trim(),
        className: profileForm.className.trim(),
      };
      if (profileForm.newPassword) {
        payload.currentPassword = profileForm.currentPassword;
        payload.newPassword = profileForm.newPassword;
      }

      const res = await api.put('/student/profile', payload);
      if (res.data?.requiresReauthentication) {
        clearSession();
        navigate('/login', { replace: true, state: { passwordChanged: true } });
        return;
      }
      setProfileSuccess('ព័ត៌មានគណនីត្រូវបានកែប្រែដោយជោគជ័យ! / Profile updated successfully.');
      setProfileForm((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      fetchStudentData();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to update profile.';
      setProfileError(msg);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleLogoutAll = async () => {
    setLoggingOutAll(true);
    setProfileError('');
    try {
      await logoutAll();
      navigate('/login', { replace: true });
    } catch {
      setProfileError('មិនអាចចាកចេញពីគ្រប់ឧបករណ៍បានទេ។ សូមព្យាយាមម្តងទៀត។ / Could not sign out of all devices. Please try again.');
    } finally {
      setLoggingOutAll(false);
    }
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    setContactSaving(true);
    setContactSuccessMsg('');
    try {
      await api.put('/student/profile', {
        fullName: contactFullNameInput.trim(),
        phone: contactPhoneInput.trim(),
      });
      setContactSuccessMsg('ព័ត៌មានទំនាក់ទំនងត្រូវបានកែប្រែដោយជោគជ័យ! / Contact info updated successfully.');
      setTimeout(() => {
        setEditContactModalOpen(false);
        setContactSuccessMsg('');
      }, 1200);
      fetchStudentData();
    } catch (err) {
      console.error('Save contact error:', err);
    } finally {
      setContactSaving(false);
    }
  };

  const handleChangePasswordModalSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess('');
    setProfileError('');

    if (!profileForm.currentPassword) {
      setProfileError('សូមបញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្ន / Current password is required.');
      setProfileSaving(false);
      return;
    }
    if (profileForm.newPassword.length < 8) {
      setProfileError('ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៨ តួអក្សរ / New password must be at least 8 characters.');
      setProfileSaving(false);
      return;
    }
    if (profileForm.newPassword !== profileForm.confirmPassword) {
      setProfileError('ពាក្យសម្ងាត់ផ្ទៀងផ្ទាត់មិនត្រូវគ្នាទេ / Passwords do not match.');
      setProfileSaving(false);
      return;
    }

    try {
      const res = await api.put('/student/profile', {
        currentPassword: profileForm.currentPassword,
        newPassword: profileForm.newPassword,
      });
      if (res.data?.requiresReauthentication) {
        clearSession();
        navigate('/login', { replace: true, state: { passwordChanged: true } });
        return;
      }
      setProfileSuccess('ពាក្យសម្ងាត់ត្រូវបានផ្លាស់ប្តូរដោយជោគជ័យ! / Password changed successfully.');
      setTimeout(() => {
        setChangePasswordModalOpen(false);
        setProfileSuccess('');
        setProfileForm((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      }, 1200);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to update password.';
      setProfileError(msg);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setSelectedGatewayModal(null);
      setFeedbackForm({ category: 'curriculum', rating: 5, comment: '' });
    }, 1800);
  };

  // Renewal Handler for Library
  const handleRenewBook = (book) => {
    setRenewingId(book.id);
    setTimeout(() => {
      const currentDue = new Date(book.dueDate || new Date());
      currentDue.setDate(currentDue.getDate() + 14);
      const newDueStr = currentDue.toISOString().split('T')[0];

      setBorrowings((prev) =>
        prev.map((item) => {
          if (item.id === book.id) {
            return { ...item, dueDate: newDueStr, status: 'borrowed' };
          }
          return item;
        })
      );
      setRenewingId(null);
      setRenewSuccessMsg(`បានស្នើសុំពន្យារពេល ១៤ ថ្ងៃដោយជោគជ័យសម្រាប់សៀវភៅ៖ "${book.bookTitle}" (កាលបរិច្ឆេទសងថ្មី: ${newDueStr})`);
      setTimeout(() => setRenewSuccessMsg(''), 5000);
    }, 450);
  };

  const student = dashboardData?.student || user || {};
  const stats = dashboardData?.stats || {};

  // Dynamic Exam Calculations
  const validResults = examResults.filter(
    (r) => r.obtainedMarks !== undefined || r.percentage !== undefined
  );
  const avgPercentage =
    validResults.length > 0
      ? (
          validResults.reduce(
            (sum, r) =>
              sum +
              (parseFloat(r.percentage) ||
                ((parseFloat(r.obtainedMarks) || 0) / (parseFloat(r.totalMarks) || 100)) * 100 ||
                0),
            0
          ) / validResults.length
        ).toFixed(1)
      : stats.avgPercentage || '88.5';

  const passedCount = examResults.filter((r) => {
    const grade = (r.grade || '').toUpperCase();
    return grade !== 'F' && grade !== 'FAIL';
  }).length;

  const topGrade = examResults.find((r) => (r.grade || '').toUpperCase() === 'A')
    ? 'Grade A (ឆ្នើម)'
    : examResults[0]?.grade
    ? `Grade ${examResults[0].grade}`
    : 'Grade A';

  // Degree Credit Metrics (Safe Fallbacks)
  const totalCredits = Number(student.totalCredits || stats.totalCredits || 120);
  const completedCredits = Number(
    student.completedCredits !== undefined && student.completedCredits !== null
      ? student.completedCredits
      : stats.completedCredits !== undefined && stats.completedCredits !== null
      ? stats.completedCredits
      : passedCount * 3
  );
  const creditPercent = Number(
    student.creditPercentage !== undefined && student.creditPercentage !== null
      ? student.creditPercentage
      : stats.creditPercentage !== undefined && stats.creditPercentage !== null
      ? stats.creditPercentage
      : totalCredits > 0
      ? Math.round((completedCredits / totalCredits) * 100)
      : 0
  );

  // Filtered Exam Results
  const filteredExamResults = examResults.filter((r) => {
    const matchesSearch =
      examSearchQuery.trim() === '' ||
      (r.subject && r.subject.toLowerCase().includes(examSearchQuery.toLowerCase())) ||
      (r.examName && r.examName.toLowerCase().includes(examSearchQuery.toLowerCase())) ||
      (r.courseName && r.courseName.toLowerCase().includes(examSearchQuery.toLowerCase()));

    const matchesSemester =
      examSemesterFilter === 'all' ||
      (r.semester && r.semester.toString().toLowerCase().includes(examSemesterFilter.toLowerCase()));

    return matchesSearch && matchesSemester;
  });

  // Filtered Borrowings
  const filteredBorrowings = borrowings.filter((b) => {
    const matchesSearch =
      librarySearchQuery.trim() === '' ||
      (b.bookTitle && b.bookTitle.toLowerCase().includes(librarySearchQuery.toLowerCase())) ||
      (b.category && b.category.toLowerCase().includes(librarySearchQuery.toLowerCase())) ||
      (b.shelf && b.shelf.toLowerCase().includes(librarySearchQuery.toLowerCase()));

    const matchesStatus =
      libraryStatusFilter === 'all' ||
      (libraryStatusFilter === 'borrowed' && b.status === 'borrowed') ||
      (libraryStatusFilter === 'overdue' && b.status === 'overdue') ||
      (libraryStatusFilter === 'returned' && b.status === 'returned');

    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', 'Kantumruy Pro', sans-serif" }}>
      {/* Top Navbar */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 20px',
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo & Portal Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/images/logo.png"
              alt="RPITSSR"
              style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px', flexShrink: 0 }}
            />
            <div>
              <div style={{ fontWeight: '800', color: '#07294d', fontSize: 'clamp(0.92rem, 2.5vw, 1.05rem)', lineHeight: '1.2' }}>
                RPITSSR STUDENT PORTAL
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប
              </div>
            </div>
          </div>

          {/* Right Navigation & Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 14px)' }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.82rem',
                color: '#07294d',
                textDecoration: 'none',
                fontWeight: '600',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                whiteSpace: 'nowrap',
              }}
            >
              <ExternalLink size={13} />
              <span>ទំព័រដើម</span>
            </Link>

            <Link
              to="/downloads"
              target="_blank"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.82rem',
                color: '#1e73be',
                textDecoration: 'none',
                fontWeight: '600',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #bfdbfe',
                backgroundColor: '#eff6ff',
                whiteSpace: 'nowrap',
              }}
            >
              <FileText size={13} />
              <span>ទម្រង់បែបបទ</span>
            </Link>

            {/* Student Avatar & Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#07294d',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                }}
              >
                {(student.fullName || student.username || 'S').charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'none', flexDirection: 'column' }} className="d-md-flex">
                <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a', lineHeight: '1.2' }}>
                  {student.fullName || student.username}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#0c8b51', fontWeight: '600' }}>
                  ID: {student.studentId || 'STU-STUDENT'}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => setLogoutModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                fontSize: '0.82rem',
                fontWeight: '600',
                color: '#dc2626',
                backgroundColor: '#fee2e2',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
              title="Logout"
            >
              <LogOut size={15} />
              <span>ចាកចេញ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(16px, 3vw, 28px) clamp(12px, 3vw, 24px) 60px' }}>
        {/* Welcome Hero Card with Integrated Radial Credit Gauge */}
        <div
          style={{
            background: 'linear-gradient(135deg, #07294d 0%, #0d3c61 60%, #1e73be 100%)',
            borderRadius: '18px',
            padding: 'clamp(20px, 3.5vw, 32px)',
            color: '#ffffff',
            marginBottom: '28px',
            boxShadow: '0 12px 28px -5px rgba(7, 41, 77, 0.25)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', minWidth: 0, flex: '1 1 340px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: '800',
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              {student.avatarUrl ? (
                <img src={student.avatarUrl} alt={student.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <GraduationCap size={32} />
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: '500' }}>
                វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប (RPITSSR)
              </div>
              <h1
                style={{
                  fontSize: 'clamp(1.4rem, 3.8vw, 1.95rem)',
                  fontWeight: '800',
                  color: '#ffffff',
                  margin: '4px 0 2px',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                }}
              >
                {student.khmerName || student.fullName || student.username}
              </h1>
              <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                {student.latinName || (student.username ? student.username.toUpperCase() : 'STUDENT')}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span
                  style={{
                    backgroundColor: '#ffaf00',
                    color: '#07294D',
                    padding: '3px 12px',
                    borderRadius: '50px',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    fontFamily: 'monospace',
                  }}
                >
                  ID: {student.studentId || 'STU-2026-001'}
                </span>
                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.22)',
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                    color: '#ffffff',
                    padding: '3px 10px',
                    borderRadius: '50px',
                    fontSize: '0.76rem',
                    fontWeight: '700',
                  }}
                >
                  🏛️ {student.className || 'Information Technology'}
                </span>
                <span
                  style={{
                    backgroundColor: '#059669',
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                    color: '#ffffff',
                    padding: '3px 10px',
                    borderRadius: '50px',
                    fontSize: '0.76rem',
                    fontWeight: '700',
                  }}
                >
                  ជំនាន់ទី {student.generation || '13'} | ឆមាស {student.semester || '1'}
                </span>
              </div>
            </div>
          </div>

          {/* Circular Credit Gauge (Reference Image 1) */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '16px 22px',
              color: '#07294D',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ position: 'relative', width: '105px', height: '105px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="105" height="105" viewBox="0 0 105 105">
                <circle cx="52.5" cy="52.5" r="42" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                <circle
                  cx="52.5"
                  cy="52.5"
                  r="42"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="10"
                  strokeDasharray={`${(creditPercent / 100) * 263.89} 263.89`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  transform="rotate(-90 52.5 52.5)"
                  style={{ transition: 'stroke-dasharray 0.8s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#07294D', lineHeight: '1.1' }}>
                  {completedCredits} / {totalCredits}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700' }}>
                  ក្រេឌីត
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#64748b' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#cbd5e1', display: 'inline-block' }} />
                <span>ចំនួនក្រេឌីតសរុប ៖ <strong>{totalCredits}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#07294D', fontWeight: '700' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                <span>ចំនួនក្រេឌីតបានបំពេញ ៖ <strong>{completedCredits} ({creditPercent}%)</strong></span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#059669', background: '#f0fdf4', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', fontWeight: '600' }}>
                ✓ {creditPercent >= 100 ? 'បានបញ្ចប់ក្រេឌីតទាំងអស់' : `ខ្វះ ${Math.max(totalCredits - completedCredits, 0)} ក្រេឌីតទៀត`}
              </div>
            </div>
          </div>
        </div>

        {/* 8 Academic Gateway Modules (Reference Image 1) */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#07294D', margin: 0 }}>
              ច្រកផ្លូវកាត់មុខងារសិក្សា (Academic Gateways)
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>
              ចុចលើប្រអប់ដើម្បីពិនិត្យព័ត៌មានលម្អិត
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
              gap: '14px',
            }}
          >
            {/* 1. Timetable */}
            <div
              onClick={() => setSelectedGatewayModal('timetable')}
              className="gateway-card"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '18px 20px',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 2px 8px rgba(7, 41, 77, 0.04)',
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', border: '1px solid #dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e73be', flexShrink: 0 }}>
                <Calendar size={24} />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.98rem', color: '#07294D' }}>កាលវិភាគ</div>
                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Class Timetable</div>
              </div>
            </div>

            {/* 2. Study Progress / Exam Results */}
            <div
              onClick={() => setActiveTab('exams')}
              className="gateway-card"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '18px 20px',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 2px 8px rgba(7, 41, 77, 0.04)',
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#faf5ff', border: '1px solid #e9d5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', flexShrink: 0 }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.98rem', color: '#07294D' }}>ដំណើរការសិក្សា</div>
                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Study Progress & Exams</div>
              </div>
            </div>

            {/* 3. Attendance */}
            <div
              onClick={() => setSelectedGatewayModal('attendance')}
              className="gateway-card"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '18px 20px',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 2px 8px rgba(7, 41, 77, 0.04)',
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', flexShrink: 0 }}>
                <UserCheck size={24} />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.98rem', color: '#07294D' }}>វត្តមាន</div>
                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Attendance ({stats.attendanceRate || '96.5%'})</div>
              </div>
            </div>

            {/* 4. Payment & Scholarship */}
            <div
              onClick={() => setSelectedGatewayModal('payments')}
              className="gateway-card"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '18px 20px',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 2px 8px rgba(7, 41, 77, 0.04)',
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c', flexShrink: 0 }}>
                <Wallet size={24} />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.98rem', color: '#07294D' }}>ការបង់ប្រាក់</div>
                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Fee & Scholarship (100%)</div>
              </div>
            </div>

            {/* 5. Work & Internship */}
            <div
              onClick={() => setSelectedGatewayModal('internship')}
              className="gateway-card"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '18px 20px',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 2px 8px rgba(7, 41, 77, 0.04)',
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', flexShrink: 0 }}>
                <Briefcase size={24} />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.98rem', color: '#07294D' }}>ប្រវត្តិការងារ</div>
                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Internship & Career</div>
              </div>
            </div>

            {/* 6. Academic Curriculum */}
            <div
              onClick={() => setSelectedGatewayModal('curriculum')}
              className="gateway-card"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '18px 20px',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 2px 8px rgba(7, 41, 77, 0.04)',
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8', flexShrink: 0 }}>
                <BookOpen size={24} />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.98rem', color: '#07294D' }}>ព័ត៌មានការសិក្សា</div>
                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Curriculum & Syllabus</div>
              </div>
            </div>

            {/* 7. Student Feedback */}
            <div
              onClick={() => setSelectedGatewayModal('feedback')}
              className="gateway-card"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '18px 20px',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 2px 8px rgba(7, 41, 77, 0.04)',
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fdf2f8', border: '1px solid #fbcfe8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#db2777', flexShrink: 0 }}>
                <MessageSquare size={24} />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.98rem', color: '#07294D' }}>មតិកែលម្អ</div>
                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Feedback & Evaluation</div>
              </div>
            </div>

            {/* 8. Achievements */}
            <div
              onClick={() => setSelectedGatewayModal('achievements')}
              className="gateway-card"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '18px 20px',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 2px 8px rgba(7, 41, 77, 0.04)',
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fefce8', border: '1px solid #fef08a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ca8a04', flexShrink: 0 }}>
                <Award size={24} />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.98rem', color: '#07294D' }}>សមិទ្ធផល</div>
                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Achievements & Honors</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div
          className="student-nav-tabs-wrapper"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {[
            { id: 'overview', label: 'ទិដ្ឋភាពទូទៅ (Overview)', icon: Layers },
            { id: 'exams', label: `លទ្ធផលប្រឡង (${examResults.length})`, icon: Award },
            { id: 'library', label: `សៀវភៅបណ្ណាល័យ (${borrowings.length})`, icon: Library },
            { id: 'notices', label: 'សេចក្តីជូនដំណឹង (Notices & News)', icon: Bell },
            { id: 'profile', label: 'គណនី និងសុវត្ថិភាព (My Profile & Security)', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`student-nav-tab-btn ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
            {/* Left Column: Recent Exam Results */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: 'clamp(16px, 3vw, 24px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#07294d', margin: 0 }}>
                  លទ្ធផលប្រឡងចុងក្រោយ (Recent Exam Results)
                </h3>
                <button
                  onClick={() => setActiveTab('exams')}
                  style={{ background: 'none', border: 'none', color: '#0c8b51', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  មើលទាំងអស់ <ChevronRight size={14} />
                </button>
              </div>

              {examResults.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: '#94a3b8' }}>
                  <Award size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>មិនទាន់មានលទ្ធផលប្រឡងត្រូវបានបោះពុម្ពផ្សាយសម្រាប់ឆមាសនេះនៅឡើយទេ។</p>
                  <Link to="/exam-results" style={{ fontSize: '0.82rem', color: '#07294d', textDecoration: 'underline', marginTop: '6px', display: 'inline-block' }}>
                    ស្វែងរកលើតារាងលទ្ធផលរួមរបស់វិទ្យាស្ថាន
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {examResults.slice(0, 3).map((res) => (
                    <div
                      key={res.id}
                      style={{
                        padding: '14px 16px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '10px',
                        border: '1px solid #edf2f7',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.92rem' }}>
                          {res.subject || res.examName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          {res.courseName} • {res.examDate ? new Date(res.examDate).toLocaleDateString() : 'Exam'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            backgroundColor: res.grade === 'A' ? '#dcfce7' : '#e0f2fe',
                            color: res.grade === 'A' ? '#15803d' : '#0369a1',
                            fontWeight: '800',
                            fontSize: '0.85rem',
                            padding: '3px 10px',
                            borderRadius: '6px',
                          }}
                        >
                          Grade {res.grade || 'A'}
                        </span>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>
                          {res.obtainedMarks}/{res.totalMarks || 100} ({res.percentage}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Academic Announcements */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: 'clamp(16px, 3vw, 24px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#07294d', margin: 0 }}>
                  សេចក្តីជូនដំណឹងសំខាន់ៗ (Notices)
                </h3>
                <button
                  onClick={() => setActiveTab('notices')}
                  style={{ background: 'none', border: 'none', color: '#0c8b51', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  មើលទាំងអស់ <ChevronRight size={14} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {notices.slice(0, 3).map((notice) => (
                  <div
                    key={notice.id}
                    style={{
                      borderLeft: '4px solid #0c8b51',
                      paddingLeft: '14px',
                    }}
                  >
                    <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.92rem', lineHeight: '1.3' }}>
                      {notice.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      {notice.date ? new Date(notice.date).toLocaleDateString() : 'Notice'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY EXAM RESULTS */}
        {activeTab === 'exams' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '26px', boxShadow: '0 4px 20px -4px rgba(15,23,42,0.04)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#07294d', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Award size={24} color="#0284c7" />
                  <span>លទ្ធផលប្រឡងផ្ទាល់ខ្លួន (My Exam Results)</span>
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>
                  ពិនិត្យមើលពិន្ទុ ភាគរយ និងនិទ្ទេសប្រឡងប្រចាំឆមាសសម្រាប់អត្តលេខ <strong>{student.studentId || 'សិស្ស'}</strong>
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link
                  to="/exam-results"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    color: '#07294d',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <Search size={14} />
                  <span>ស្វែងរកលទ្ធផលរួម</span>
                </Link>

                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#07294D',
                    border: 'none',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(7,41,77,0.2)',
                  }}
                >
                  <Printer size={14} />
                  <span>បោះពុម្ពតារាងពិន្ទុ</span>
                </button>
              </div>
            </div>

            {/* Top 3 Metrics Strip */}
            <div className="exam-summary-strip">
              <div className="exam-metric-box">
                <div className="exam-metric-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <div className="exam-metric-val">{avgPercentage}%</div>
                  <div className="exam-metric-lbl">ពិន្ទុមធ្យមភាគសរុប (Average)</div>
                </div>
              </div>

              <div className="exam-metric-box">
                <div className="exam-metric-icon" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div className="exam-metric-val">{passedCount} / {examResults.length}</div>
                  <div className="exam-metric-lbl">មុខវិជ្ជាជាប់ (Passed)</div>
                </div>
              </div>

              <div className="exam-metric-box">
                <div className="exam-metric-icon" style={{ backgroundColor: '#ede9fe', color: '#7c3aed' }}>
                  <Award size={20} />
                </div>
                <div>
                  <div className="exam-metric-val">{topGrade}</div>
                  <div className="exam-metric-lbl">និទ្ទេសខ្ពស់បំផុត (Highest)</div>
                </div>
              </div>
            </div>

            {/* Search and Filters Bar */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '18px',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', gap: '10px', flex: '1 1 320px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1', maxWidth: '380px' }}>
                  <Search
                    size={16}
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                  />
                  <input
                    type="text"
                    value={examSearchQuery}
                    onChange={(e) => setExamSearchQuery(e.target.value)}
                    placeholder="ស្វែងរកមុខវិជ្ជា ឬឈ្មោះការប្រឡង..."
                    style={{
                      width: '100%',
                      padding: '9px 14px 9px 36px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                  {examSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setExamSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Filter size={15} color="#64748b" />
                  <select
                    value={examSemesterFilter}
                    onChange={(e) => setExamSemesterFilter(e.target.value)}
                    style={{
                      padding: '9px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      fontSize: '0.85rem',
                      color: '#334155',
                      fontWeight: '600',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value="all">ឆមាសទាំងអស់ (All Semesters)</option>
                    <option value="1">ឆមាសទី ១ (Semester 1)</option>
                    <option value="2">ឆមាសទី ២ (Semester 2)</option>
                  </select>
                </div>
              </div>

              <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600' }}>
                បង្ហាញ <strong>{filteredExamResults.length}</strong> នៃ <strong>{examResults.length}</strong> មុខវិជ្ជា
              </div>
            </div>

            {/* Exam Results Table (Desktop) & Mobile Cards */}
            {filteredExamResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <Award size={48} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
                <h4 style={{ color: '#334155', fontWeight: '700', marginBottom: '6px' }}>
                  {examResults.length === 0 ? 'មិនទាន់មានលទ្ធផលប្រឡងនៅក្នុងគណនីនេះទេ' : 'រកមិនឃើញទិន្នន័យដែលត្រូវនឹងការស្វែងរកឡើយ'}
                </h4>
                <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: '480px', margin: '0 auto 16px' }}>
                  {examResults.length === 0
                    ? `នៅពេលគ្រូបង្រៀន ឬរដ្ឋបាលវិទ្យាស្ថានបញ្ចូលពិន្ទុប្រឡងសម្រាប់អត្តលេខ ${student.studentId || 'សិស្ស'} វានឹងបង្ហាញនៅទីនេះដោយស្វ័យប្រវត្តិ។`
                    : 'សូមព្យាយាមស្វែងរកជាមួយពាក្យគន្លឹះផ្សេង ឬជ្រើសរើសឆមាសទាំងអស់ឡើងវិញ។'}
                </p>
                {(examSearchQuery || examSemesterFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setExamSearchQuery('');
                      setExamSemesterFilter('all');
                    }}
                    style={{
                      padding: '6px 14px',
                      backgroundColor: '#e2e8f0',
                      color: '#1e293b',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    សម្អាតការស្វែងរក
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="student-exam-table-wrapper student-exam-desktop-table">
                  <table className="student-table">
                    <thead>
                      <tr>
                        <th>មុខវិជ្ជា & កាលបរិច្ឆេទប្រឡង</th>
                        <th>ជំនាញ & ឆមាស</th>
                        <th>ពិន្ទុទទួលបាន</th>
                        <th>ភាគរយ (Score %)</th>
                        <th>និទ្ទេស & ស្ថានភាព</th>
                        <th style={{ textAlign: 'right' }}>សន្លឹកពិន្ទុផ្លូវការ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExamResults.map((row) => {
                        const scorePercent =
                          parseFloat(row.percentage) ||
                          Math.round(((parseFloat(row.obtainedMarks) || 0) / (parseFloat(row.totalMarks) || 100)) * 100) ||
                          0;
                        const gradeClass =
                          row.grade === 'A'
                            ? 'grade-a'
                            : row.grade?.startsWith('B')
                            ? 'grade-b'
                            : row.grade?.startsWith('C')
                            ? 'grade-c'
                            : 'grade-f';
                        const progressColor =
                          scorePercent >= 80 ? '#10b981' : scorePercent >= 65 ? '#0ea5e9' : scorePercent >= 50 ? '#f59e0b' : '#ef4444';
                        const isPassed = (row.grade || '').toUpperCase() !== 'F' && (row.grade || '').toUpperCase() !== 'FAIL';

                        return (
                          <tr key={row.id}>
                            <td>
                              <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.94rem' }}>
                                {row.subject || row.examName}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                                <Calendar size={12} />
                                <span>{row.examDate ? new Date(row.examDate).toLocaleDateString('km-KH') : 'ការប្រឡងឆមាស'}</span>
                                <span>•</span>
                                <span>{row.examName || 'Final Exam'}</span>
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: '600', color: '#334155' }}>
                                {row.courseName || student.className || 'Information Technology'}
                              </div>
                              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                                {row.semester || 'ឆមាសទី ១'} • ឆ្នាំសិក្សា {row.year || '២០២៥-២០២៦'}
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#07294D' }}>{row.obtainedMarks}</span>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>/ {row.totalMarks || 100}</span>
                              </div>
                              <div className="score-progress-wrap">
                                <div
                                  className="score-progress-bar"
                                  style={{ width: `${Math.min(scorePercent, 100)}%`, backgroundColor: progressColor }}
                                />
                              </div>
                            </td>
                            <td>
                              <span style={{ fontWeight: '800', fontSize: '0.95rem', color: '#1e293b' }}>
                                {scorePercent}%
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className={`grade-pill ${gradeClass}`}>
                                  Grade {row.grade || 'A'}
                                </span>
                                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: isPassed ? '#15803d' : '#dc2626' }}>
                                  {isPassed ? '✓ ជាប់' : '✕ ធ្លាក់'}
                                </span>
                              </div>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                type="button"
                                onClick={() => setSelectedTranscript(row)}
                                className="view-transcript-btn"
                                title="មើលព្រឹត្តិបត្រពិន្ទុផ្លូវការ"
                              >
                                <Eye size={14} />
                                <span>បើកមើលសន្លឹកពិន្ទុ</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Dedicated Mobile Cards View */}
                <div className="student-exam-mobile-cards">
                  {filteredExamResults.map((row) => {
                    const scorePercent =
                      parseFloat(row.percentage) ||
                      Math.round(((parseFloat(row.obtainedMarks) || 0) / (parseFloat(row.totalMarks) || 100)) * 100) ||
                      0;
                    const gradeClass =
                      row.grade === 'A'
                        ? 'grade-a'
                        : row.grade?.startsWith('B')
                        ? 'grade-b'
                        : row.grade?.startsWith('C')
                        ? 'grade-c'
                        : 'grade-f';
                    const progressColor =
                      scorePercent >= 80 ? '#10b981' : scorePercent >= 65 ? '#0ea5e9' : scorePercent >= 50 ? '#f59e0b' : '#ef4444';
                    const isPassed = (row.grade || '').toUpperCase() !== 'F' && (row.grade || '').toUpperCase() !== 'FAIL';

                    return (
                      <div key={row.id} className="student-exam-mobile-card">
                        {/* Top Row: Subject & Grade Pill */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.94rem', lineHeight: 1.3 }}>
                              {row.subject || row.examName}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                              <Calendar size={12} />
                              <span>{row.examDate ? new Date(row.examDate).toLocaleDateString('km-KH') : 'ការប្រឡងឆមាស'}</span>
                              <span>•</span>
                              <span>{row.examName || 'Final Exam'}</span>
                            </div>
                          </div>
                          <span className={`grade-pill ${gradeClass}`} style={{ flexShrink: 0 }}>
                            Grade {row.grade || 'A'}
                          </span>
                        </div>

                        {/* Middle Row: Course & Semester */}
                        <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '8px 12px', border: '1px solid #edf2f7' }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#334155' }}>
                            {row.courseName || student.className || 'Information Technology'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                            {row.semester || 'ឆមាសទី ១'} • ឆ្នាំសិក្សា {row.year || '២០២៥-២០២៦'}
                          </div>
                        </div>

                        {/* Score Details & Progress */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>
                              ពិន្ទុទទួលបាន: <strong style={{ color: '#07294D', fontSize: '0.95rem' }}>{row.obtainedMarks}</strong> / {row.totalMarks || 100}
                            </div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1e293b' }}>
                              {scorePercent}% ({isPassed ? '✓ ជាប់' : '✕ ធ្លាក់'})
                            </div>
                          </div>
                          <div className="score-progress-wrap" style={{ maxWidth: '100%' }}>
                            <div
                              className="score-progress-bar"
                              style={{ width: `${Math.min(scorePercent, 100)}%`, backgroundColor: progressColor }}
                            />
                          </div>
                        </div>

                        {/* Bottom Action: View Transcript */}
                        <button
                          type="button"
                          onClick={() => setSelectedTranscript(row)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            backgroundColor: '#eff6ff',
                            color: '#1e73be',
                            border: '1px solid #bfdbfe',
                            borderRadius: '8px',
                            fontSize: '0.84rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            minHeight: '40px',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Eye size={15} />
                          <span>បើកមើលសន្លឹកពិន្ទុផ្លូវការ</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 3: MY LIBRARY LOANS */}
        {activeTab === 'library' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '26px', boxShadow: '0 4px 20px -4px rgba(15,23,42,0.04)' }}>
            {/* Header */}
            <div style={{ marginBottom: '22px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#07294d', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Library size={24} color="#d97706" />
                <span>ការខ្ចីសៀវភៅបណ្ណាល័យ (My Library Book Loans)</span>
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>
                តាមដានប្រវត្តិ កាលបរិច្ឆេទសង និងស្នើសុំពន្យារពេលសៀវភៅបច្ចេកទេសដែលបានខ្ចីពីបណ្ណាល័យវិទ្យាស្ថាន RPITSSR
              </p>
            </div>

            {/* Renewal Feedback Banner */}
            {renewSuccessMsg && (
              <div
                style={{
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#065f46',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  animation: 'modalPop 0.3s ease',
                }}
              >
                <CheckCircle size={18} color="#059669" />
                <span>{renewSuccessMsg}</span>
              </div>
            )}

            {/* 4 Summary Counter Cards for Library */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: '14px',
                marginBottom: '24px',
              }}
            >
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 18px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>សៀវភៅសរុប (Total)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#07294d', marginTop: '4px' }}>{borrowings.length} ក្បាល</div>
              </div>

              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '14px 18px' }}>
                <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: '700', textTransform: 'uppercase' }}>កំពុងខ្ចី (Borrowed)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0369a1', marginTop: '4px' }}>
                  {borrowings.filter((b) => b.status === 'borrowed').length} ក្បាល
                </div>
              </div>

              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px 18px' }}>
                <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: '700', textTransform: 'uppercase' }}>ហួសកាលកំណត់ (Overdue)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#b91c1c', marginTop: '4px' }}>
                  {borrowings.filter((b) => b.status === 'overdue').length} ក្បាល
                </div>
              </div>

              <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px 18px' }}>
                <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: '700', textTransform: 'uppercase' }}>បានសងរួច (Returned)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#166534', marginTop: '4px' }}>
                  {borrowings.filter((b) => b.status === 'returned').length} ក្បាល
                </div>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '20px',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {/* Status Filter Pill Buttons */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: 'ទាំងអស់ (All)' },
                  { id: 'borrowed', label: 'កំពុងខ្ចី (Active)' },
                  { id: 'overdue', label: 'ហួសកំណត់ (Overdue)' },
                  { id: 'returned', label: 'បានសងរួច (Returned)' },
                ].map((pill) => {
                  const isSelected = libraryStatusFilter === pill.id;
                  return (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setLibraryStatusFilter(pill.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        border: isSelected ? '1px solid #0284c7' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? '#0284c7' : '#ffffff',
                        color: isSelected ? '#ffffff' : '#475569',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {pill.label}
                    </button>
                  );
                })}
              </div>

              {/* Search input */}
              <div style={{ position: 'relative', minWidth: '260px', flex: '0 1 320px' }}>
                <Search
                  size={15}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                />
                <input
                  type="text"
                  value={librarySearchQuery}
                  onChange={(e) => setLibrarySearchQuery(e.target.value)}
                  placeholder="ស្វែងរកសៀវភៅ ឬលេខធ្នើរ..."
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 34px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    outline: 'none',
                  }}
                />
                {librarySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setLibrarySearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Books List */}
            {filteredBorrowings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <BookOpen size={44} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
                <h4 style={{ color: '#334155', fontWeight: '700', marginBottom: '6px' }}>
                  {borrowings.length === 0 ? 'មិនទាន់មានទិន្នន័យខ្ចីសៀវភៅនៅឡើយទេ' : 'រកមិនឃើញសៀវភៅដែលត្រូវនឹងការស្វែងរកឡើយ'}
                </h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 auto 14px', maxWidth: '420px' }}>
                  {borrowings.length === 0
                    ? 'នៅពេលអ្នកខ្ចីសៀវភៅពីបណ្ណាល័យ RPITSSR ទិន្នន័យនឹងត្រូវកត់ត្រា និងបង្ហាញនៅទីនេះ។'
                    : 'សូមសាកល្បងសម្អាតពាក្យស្វែងរក ឬផ្លាស់ប្តូរតម្រងស្ថានភាព។'}
                </p>
                {(librarySearchQuery || libraryStatusFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setLibrarySearchQuery('');
                      setLibraryStatusFilter('all');
                    }}
                    style={{
                      padding: '6px 14px',
                      backgroundColor: '#e2e8f0',
                      color: '#1e293b',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    សម្អាតការស្វែងរក
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filteredBorrowings.map((book) => {
                  const isOverdue = book.status === 'overdue';
                  const isReturned = book.status === 'returned';

                  // Calculate remaining days
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const due = new Date(book.dueDate || new Date());
                  due.setHours(0, 0, 0, 0);
                  const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

                  let daysBadgeClass = 'active';
                  let daysText = `នៅសល់ ${diffDays} ថ្ងៃ`;

                  if (isReturned) {
                    daysBadgeClass = 'returned';
                    daysText = '✓ បានសងរួចរាល់';
                  } else if (isOverdue || diffDays < 0) {
                    daysBadgeClass = 'overdue';
                    daysText = `⚠ ហួសកំណត់ ${Math.abs(diffDays)} ថ្ងៃ`;
                  } else if (diffDays <= 3) {
                    daysBadgeClass = 'warning';
                    daysText = `⏳ ជិតដល់ថ្ងៃ (នៅសល់ ${diffDays} ថ្ងៃ)`;
                  }

                  return (
                    <div key={book.id} className="library-book-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '280px', flex: '1 1 300px' }}>
                        <div
                          className="library-book-icon-box"
                          style={{
                            backgroundColor: isReturned ? '#dcfce7' : isOverdue ? '#fee2e2' : '#eff6ff',
                            color: isReturned ? '#15803d' : isOverdue ? '#dc2626' : '#0284c7',
                          }}
                        >
                          <BookOpen size={24} />
                        </div>
                        <div>
                          <h4 className="library-book-title">{book.bookTitle}</h4>
                          <div className="library-book-meta">
                            <span>ផ្នែក: <strong>{book.category || 'ព័ត៌មានវិទ្យា (IT)'}</strong></span>
                            <span className="library-shelf-tag">
                              <Bookmark size={12} />
                              <span>ធ្នើរ: {book.shelf || 'IT-01'}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '0.82rem' }}>
                          <div style={{ color: '#64748b' }}>ថ្ងៃខ្ចី: {book.borrowDate || '2026-02-15'}</div>
                          <div style={{ fontWeight: '700', color: isOverdue ? '#dc2626' : '#07294d', marginTop: '2px' }}>
                            ថ្ងៃត្រូវសង: {book.dueDate || '2026-03-01'}
                          </div>
                        </div>

                        <span className={`library-days-badge ${daysBadgeClass}`}>
                          {daysText}
                        </span>

                        {!isReturned && (
                          <button
                            type="button"
                            onClick={() => handleRenewBook(book)}
                            disabled={renewingId === book.id}
                            className="renew-book-btn"
                            title="ស្នើសុំពន្យារពេលខ្ចីសៀវភៅ ១៤ ថ្ងៃបន្ថែម"
                          >
                            <RefreshCw size={14} className={renewingId === book.id ? 'animate-spin' : ''} />
                            <span>{renewingId === book.id ? 'កំពុងស្នើសុំ...' : 'ស្នើសុំពន្យារពេល'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: NOTICES & ANNOUNCEMENTS */}
        {activeTab === 'notices' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#07294d', margin: 0 }}>
                សេចក្តីជូនដំណឹង & កាលវិភាគសិក្សា (Announcements)
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>
                ព័ត៌មានផ្លូវការពីរដ្ឋបាល និងការិយាល័យសិក្សានៃវិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  style={{
                    padding: '18px 20px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#07294d', margin: 0 }}>
                      {notice.title}
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      {notice.date ? new Date(notice.date).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                  <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                    {notice.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: MY PROFILE & DIGITAL IDENTITY (Reference Image 2) */}
        {activeTab === 'profile' && (
          <div>
            {/* Header Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#07294D', margin: 0 }}>
                  ព័ត៌មានលម្អិតរបស់និស្សិត (Student Profile & Details)
                </h2>
                <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '4px 0 0' }}>
                  អត្តសញ្ញាណនិស្សិតផ្លូវការ និងព័ត៌មានសិក្សាគ្រប់គ្រងដោយការិយាល័យសិក្សា
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setPrintCardModalOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#07294D',
                    fontSize: '0.84rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  }}
                >
                  <Printer size={15} />
                  <span>ទាញយកកាតនិស្សិតឌីជីថល</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileError('');
                    setProfileSuccess('');
                    setChangePasswordModalOpen(true);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#07294D',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(7, 41, 77, 0.25)',
                  }}
                >
                  <Lock size={15} />
                  <span>ប្តូរពាក្យសម្ងាត់</span>
                </button>
              </div>
            </div>

            {/* Main 2-Column Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '24px' }}>
              {/* Left Column: Digital Student ID Card (Reference Image 2) */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 6px 22px rgba(7, 41, 77, 0.06)',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Top Tricolor Accent Line */}
                <div style={{ height: '5px', background: 'linear-gradient(90deg, #07294D, #1e73be, #ffaf00)' }} />

                <div style={{ padding: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* Avatar Photo with QR Code Badge */}
                  <div style={{ position: 'relative', width: '110px', height: '110px', marginBottom: '16px' }}>
                    <div
                      style={{
                        width: '110px',
                        height: '110px',
                        borderRadius: '50%',
                        backgroundColor: '#eff6ff',
                        border: '3px solid #1e73be',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 20px rgba(30, 115, 190, 0.2)',
                      }}
                    >
                      {student.avatarUrl ? (
                        <img src={student.avatarUrl} alt={student.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#07294D' }}>
                          {(student.fullName || student.username || 'S').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {/* Small QR Code Badge on bottom right */}
                    <button
                      type="button"
                      onClick={() => setQrModalOpen(true)}
                      title="ចុចដើម្បីមើល QR Code ផ្ទៀងផ្ទាត់ផ្លូវការ"
                      style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '2px',
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        border: '2px solid #ffffff',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      <QrCode size={18} />
                    </button>
                  </div>

                  {/* Student Name */}
                  <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#07294D', margin: '0 0 4px' }}>
                    {student.khmerName || student.fullName || student.username}
                  </h3>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    {student.latinName || (student.username ? student.username.toUpperCase() : 'STUDENT')}
                  </div>

                  {/* Student ID Badge */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 14px',
                      borderRadius: '50px',
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#1e40af',
                      fontWeight: '800',
                      fontSize: '0.92rem',
                      fontFamily: 'monospace',
                      marginBottom: '20px',
                    }}
                  >
                    <ShieldCheck size={16} color="#059669" />
                    <span>{student.studentId || 'STU-2026-001'}</span>
                  </div>

                  {/* Academic Cohort Strip (5-Column Pill Row like Reference Image 2) */}
                  <div
                    style={{
                      width: '100%',
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      padding: '14px 10px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(5, 1fr)',
                      gap: '6px',
                      textAlign: 'center',
                      marginBottom: '20px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '600' }}>ឆ្នាំ</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#07294D' }}>
                        {student.semester > 2 ? Math.ceil(student.semester / 2) : 1}
                      </div>
                    </div>
                    <div style={{ borderLeft: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '600' }}>ឆមាស</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#07294D' }}>
                        {student.semester || 1}
                      </div>
                    </div>
                    <div style={{ borderLeft: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '600' }}>ជំនាន់</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#07294D' }}>
                        {student.generation || '13'}
                      </div>
                    </div>
                    <div style={{ borderLeft: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '600' }}>វគ្គ</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#07294D' }}>1</div>
                    </div>
                    <div style={{ borderLeft: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '600' }}>ឆ្នាំសិក្សា</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#07294D', whiteSpace: 'nowrap' }}>
                        {student.academicYear || '2025-2026'}
                      </div>
                    </div>
                  </div>

                  {/* Card Quick Action Buttons */}
                  <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <button
                      type="button"
                      onClick={() => setQrModalOpen(true)}
                      style={{
                        flex: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#f1f5f9',
                        color: '#07294D',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      <QrCode size={16} />
                      <span>បង្ហាញ QR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrintCardModalOpen(true)}
                      style={{
                        flex: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#ffaf00',
                        color: '#07294D',
                        border: 'none',
                        fontSize: '0.82rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(255, 175, 0, 0.3)',
                      }}
                    >
                      <Download size={16} />
                      <span>ទាញយកកាត</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Detailed Academic & Personal Information Rows (Reference Image 2) */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 6px 22px rgba(7, 41, 77, 0.04)',
                  padding: '24px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#07294D', margin: 0 }}>
                      ព័ត៌មានសិក្សា និងអត្តសញ្ញាណ (Institutional Record)
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setContactPhoneInput(student.phone || '');
                        setContactFullNameInput(student.fullName || '');
                        setEditContactModalOpen(true);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#1e73be',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      កែប្រែទំនាក់ទំនង
                    </button>
                  </div>

                  {/* 8 List Items (Reference Image 2) */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Item 1: Faculty */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#eff6ff', border: '1px solid #dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e73be', flexShrink: 0 }}>
                        <GraduationCap size={20} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>មហាវិទ្យាល័យ / ដេប៉ាតឺម៉ង់</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#07294D' }}>
                          {student.faculty || 'ដេប៉ាតឺម៉ង់បច្ចេកវិទ្យាព័ត៌មាន'}
                        </div>
                      </div>
                    </div>

                    {/* Item 2: Degree Level */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', flexShrink: 0 }}>
                        <Award size={20} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>កម្រិតសិក្សា</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#07294D' }}>
                          {student.degreeLevel || 'បរិញ្ញាបត្រ (Bachelor)'}
                        </div>
                      </div>
                    </div>

                    {/* Item 3: Major */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', flexShrink: 0 }}>
                        <BookOpen size={20} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>មុខជំនាញ</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#07294D' }}>
                          {student.className || 'ព័ត៌មានវិទ្យា (Information Technology)'}
                        </div>
                      </div>
                    </div>

                    {/* Item 4: Room */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8', flexShrink: 0 }}>
                        <MapPin size={20} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>បន្ទប់សិក្សា / អគារ</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#07294D' }}>
                          {student.room || 'ប្រាសាទព្រះខ័ន (អគារ B - Lab 3)'}
                        </div>
                      </div>
                    </div>

                    {/* Item 5: Shift */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c', flexShrink: 0 }}>
                        <Clock size={20} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>វេនសិក្សា</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#07294D' }}>
                          {student.shift === 'evening' ? 'ល្ងាច (Evening)' : (student.shift === 'afternoon' ? 'រសៀល (Afternoon)' : (student.shift === 'weekend' ? 'ចុងសប្តាហ៍ (Weekend)' : 'ព្រឹក (Morning)'))}
                        </div>
                      </div>
                    </div>

                    {/* Item 6: Status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', flexShrink: 0 }}>
                        <CheckCircle2 size={20} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>ស្ថានភាពសិក្សា</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                          {student.academicStatus || 'កំពុងសិក្សា (Enrolled)'}
                        </div>
                      </div>
                    </div>

                    {/* Item 7: Date of Birth */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#fefce8', border: '1px solid #fef08a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ca8a04', flexShrink: 0 }}>
                        <Calendar size={20} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>ថ្ងៃខែឆ្នាំកំណើត</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#07294D' }}>
                          {student.dob || '2000-07-11'}
                        </div>
                      </div>
                    </div>

                    {/* Item 8: Phone & Email */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 0' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#07294D', flexShrink: 0 }}>
                        <Phone size={20} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>លេខទូរស័ព្ទ / អ៊ីមែលផ្លូវការ</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#07294D' }}>
                          {student.phone || '093 794 815 / 018 325 04 73'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Signout All Devices Button */}
                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleLogoutAll}
                    disabled={loggingOutAll}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '9px 18px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                      color: '#64748b',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    <LogOut size={14} />
                    <span>{loggingOutAll ? 'កំពុងចាកចេញ...' : 'ចាកចេញពីគ្រប់ឧបករណ៍ (Sign out all)'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Logout Confirmation Dialog Modal */}
      {logoutModalOpen && (
        <div
          onClick={() => !loggingOut && setLogoutModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ padding: '28px 24px 20px', textAlign: 'center' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <LogOut size={26} />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                បញ្ជាក់ការចាកចេញ (Confirm Sign Out)
              </h3>
              <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                តើអ្នកពិតជាចង់ចាកចេញពីគណនីនិស្សិត RPITSSR មែនទេ?
                <br />
                <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  Are you sure you want to sign out from your student session?
                </span>
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '16px 24px',
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                borderTop: '1px solid #e2e8f0',
              }}
            >
              <button
                type="button"
                onClick={() => setLogoutModalOpen(false)}
                disabled={loggingOut}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                បោះបង់ (Cancel)
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={loggingOut}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <LogOut size={15} />
                <span>{loggingOut ? 'ចាកចេញ...' : 'ចាកចេញ (Logout)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Transcript Preview & Print Modal */}
      {selectedTranscript && (
        <div className="transcript-modal-overlay" onClick={() => setSelectedTranscript(null)}>
          <div className="transcript-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="transcript-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Award size={22} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#ffffff' }}>
                    សន្លឹកព្រឹត្តិបត្រពិន្ទុផ្លូវការ (Official Transcript)
                  </h3>
                  <div style={{ fontSize: '0.76rem', color: '#cbd5e1', marginTop: '2px' }}>
                    វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTranscript(null)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="transcript-modal-body">
              <div className="transcript-sheet-box">
                <img
                  src="/images/logo.png"
                  alt="RPITSSR"
                  className="transcript-watermark"
                />

                {/* Kingdom and Institute Header */}
                <div style={{ textAlign: 'center', borderBottom: '2px solid #07294D', paddingBottom: '16px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#07294D', letterSpacing: '0.5px' }}>
                    ព្រះរាជាណាចក្រកម្ពុជា
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    ជាតិ សាសនា ព្រះមហាក្សត្រ
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#07294D', marginTop: '12px' }}>
                    វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#0c8b51', fontWeight: '700', marginTop: '2px' }}>
                    ការិយាល័យសិក្សា និងប្រឡងវាយតម្លៃសមត្ថភាព
                  </div>
                </div>

                {/* Student Details Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    marginBottom: '20px',
                    backgroundColor: '#f8fafc',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>ឈ្មោះសិស្ស / Student Name</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#07294D', marginTop: '2px' }}>
                      {student.fullName || student.username}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>អត្តលេខ / Student ID</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0284c7', marginTop: '2px' }}>
                      {student.studentId || 'STU-STUDENT'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>ថ្នាក់ & ជំនាញ / Class & Major</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#07294D', marginTop: '2px' }}>
                      {student.className || selectedTranscript.courseName || 'Information Technology'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>កាលបរិច្ឆេទចេញ / Issue Date</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#07294D', marginTop: '2px' }}>
                      {new Date().toLocaleDateString('km-KH')}
                    </div>
                  </div>
                </div>

                {/* Subject & Score Table (Responsive Wrapper) */}
                <div style={{ overflowX: 'auto', width: '100%', marginBottom: '20px' }}>
                  <table style={{ width: '100%', minWidth: '460px', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#07294D', color: '#ffffff' }}>
                        <th style={{ padding: '10px 14px', textAlign: 'left', borderRadius: '6px 0 0 6px' }}>មុខវិជ្ជា (Subject)</th>
                        <th style={{ padding: '10px 14px', textAlign: 'center' }}>ពិន្ទុពេញ</th>
                        <th style={{ padding: '10px 14px', textAlign: 'center' }}>ពិន្ទុទទួលបាន</th>
                        <th style={{ padding: '10px 14px', textAlign: 'center' }}>ភាគរយ</th>
                        <th style={{ padding: '10px 14px', textAlign: 'center', borderRadius: '0 6px 6px 0' }}>និទ្ទេស</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                        <td style={{ padding: '14px', fontWeight: '700', color: '#0f172a' }}>
                          {selectedTranscript.subject || selectedTranscript.examName}
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '400', marginTop: '2px' }}>
                            {selectedTranscript.examName} • {selectedTranscript.semester}
                          </div>
                        </td>
                        <td style={{ padding: '14px', textAlign: 'center', fontWeight: '600' }}>
                          {selectedTranscript.totalMarks || 100}
                        </td>
                        <td style={{ padding: '14px', textAlign: 'center', fontWeight: '800', color: '#0284c7', fontSize: '1.05rem' }}>
                          {selectedTranscript.obtainedMarks}
                        </td>
                        <td style={{ padding: '14px', textAlign: 'center', fontWeight: '800' }}>
                          {selectedTranscript.percentage}%
                        </td>
                        <td style={{ padding: '14px', textAlign: 'center' }}>
                          <span className={`grade-pill ${selectedTranscript.grade === 'A' ? 'grade-a' : 'grade-b'}`}>
                            Grade {selectedTranscript.grade || 'A'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Evaluation Remark */}
                <div
                  style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <CheckCircle size={18} color="#15803d" />
                  <div style={{ fontSize: '0.85rem', color: '#166534', fontWeight: '600' }}>
                    ការវាយតម្លៃផ្លូវការ៖ សិស្សទទួលបានលទ្ធផល{' '}
                    <strong>{selectedTranscript.grade === 'A' ? 'ឆ្នើម (Passed with Distinction)' : 'ល្អ (Passed with Good Standing)'}</strong>{' '}
                    ក្នុងការប្រឡងបញ្ចប់វគ្គវិជ្ជាជីវៈ។
                  </div>
                </div>

                {/* Signatures */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px', padding: '0 12px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>បានឃើញ និងពិនិត្យត្រឹមត្រូវ</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#07294D', marginTop: '4px' }}>
                      ប្រធានដេប៉ាតឺម៉ង់ / គ្រូបង្រៀន
                    </div>
                    <div style={{ height: '52px' }}></div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#334155' }}>[ ហត្ថលេខា / Signature ]</div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      សៀមរាប, ថ្ងៃទី {new Date().getDate()} ខែ {new Date().getMonth() + 1} ឆ្នាំ ២០២៦
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#07294D', marginTop: '4px' }}>
                      ប្រធានការិយាល័យសិក្សា RPITSSR
                    </div>
                    <div style={{ height: '52px' }}></div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#07294D' }}>
                      [ ត្រា និងហត្ថលេខា / Official Stamp ]
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 22px',
                    backgroundColor: '#07294D',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(7, 41, 77, 0.25)',
                  }}
                >
                  <Printer size={16} />
                  <span>បោះពុម្ពព្រឹត្តិបត្រ (Print)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTranscript(null)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f1f5f9',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  បិទ (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. Timetable Modal */}
      {selectedGatewayModal === 'timetable' && (
        <div
          onClick={() => setSelectedGatewayModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              maxWidth: '820px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(7, 41, 77, 0.25)',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #07294d 0%, #0d3c61 100%)',
                color: '#ffffff',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={22} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#ffffff' }}>
                    កាលវិភាគសិក្សាប្រចាំឆមាស (Semester Timetable)
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
                    ឆមាសទី ១ • ឆ្នាំសិក្សា ២០២៥-២០២៦ • វេន៖ {student.shift === 'evening' ? 'ល្ងាច' : (student.shift === 'afternoon' ? 'រសៀល' : 'ព្រឹក (07:30 - 11:00 AM)')}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGatewayModal(null)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e73be', fontSize: '0.82rem', fontWeight: '700' }}>
                    បន្ទប់៖ {student.room || 'Lab 3 (អគារ B)'}
                  </span>
                  <span style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#059669', fontSize: '0.82rem', fontWeight: '700' }}>
                    ជំនាញ៖ {student.className || 'ព័ត៌មានវិទ្យា'}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  បច្ចុប្បន្នភាពចុងក្រោយ៖ ឆមាសទី ១ ឆ្នាំ ២០២៦
                </div>
              </div>

              {/* Schedule Days */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { day: 'ច័ន្ទ (Monday)', time: '07:30 - 10:45 AM', subject: 'ការអភិវឌ្ឍគេហទំព័រជឿនលឿន (Advanced Web Development)', room: 'Lab 3 (អគារ B)', lecturer: 'សាស្ត្រាចារ្យ ឡុង វិចិត្រ', badgeColor: '#eff6ff', badgeText: '#1e73be' },
                  { day: 'អង្គារ (Tuesday)', time: '07:30 - 10:45 AM', subject: 'បច្ចេកវិទ្យាបណ្តាញកុំព្យូទ័រ (Network Engineering & CCNA)', room: 'Lab 1 (អគារ B)', lecturer: 'សាស្ត្រាចារ្យ ចាន់ ណារ៉ូ', badgeColor: '#f0fdf4', badgeText: '#059669' },
                  { day: 'ពុធ (Wednesday)', time: '07:30 - 09:00 AM', subject: 'ប្រព័ន្ធគ្រប់គ្រងទិន្នន័យ (Database Administration - MySQL/Postgres)', room: 'Lab 3 (អគារ B)', lecturer: 'សាស្ត្រាចារ្យ សេង រដ្ឋា', badgeColor: '#faf5ff', badgeText: '#7c3aed' },
                  { day: 'ពុធ (Wednesday)', time: '09:15 - 10:45 AM', subject: 'ភាសាអង់គ្លេសបច្ចេកទេសសម្រាប់ IT (Technical English for IT)', room: 'បន្ទប់ 204 (អគារ A)', lecturer: 'សាស្ត្រាចារ្យ កែវ មុនី', badgeColor: '#fefce8', badgeText: '#ca8a04' },
                  { day: 'ព្រហស្បតិ៍ (Thursday)', time: '07:30 - 10:45 AM', subject: 'ការអនុវត្តគម្រោងជាក់ស្តែង (Capstone Project & IoT Integration)', room: 'Lab 2 (អគារ B)', lecturer: 'សាស្ត្រាចារ្យ ហែម សុភ័ក្ត្រ', badgeColor: '#fff7ed', badgeText: '#ea580c' },
                  { day: 'សុក្រ (Friday)', time: '07:30 - 10:45 AM', subject: 'សិក្ខាសាលាបច្ចេកវិទ្យា & Cloud Computing (AWS/Docker)', room: 'សាលសន្និសីទ / Lab 3', lecturer: 'សាស្ត្រាចារ្យ អ៊ុក វាសនា', badgeColor: '#eff6ff', badgeText: '#1e73be' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '14px 18px',
                      borderRadius: '12px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      boxShadow: '0 2px 6px rgba(7, 41, 77, 0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px', flex: '1 1 260px' }}>
                      <div style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: item.badgeColor, color: item.badgeText, fontWeight: '800', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        {item.day}
                      </div>
                      <div>
                        <div style={{ fontWeight: '800', color: '#07294D', fontSize: '0.94rem' }}>{item.subject}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '3px' }}>
                          👨‍🏫 {item.lecturer} • 📍 {item.room}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', backgroundColor: '#f8fafc', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      🕒 {item.time}
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Footer Actions */}
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    backgroundColor: '#07294D',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '0.88rem',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Printer size={16} />
                  <span>បោះពុម្ពកាលវិភាគ (Print Timetable)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGatewayModal(null)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#f1f5f9',
                    color: '#334155',
                    fontWeight: '600',
                    fontSize: '0.88rem',
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                  }}
                >
                  បិទ (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Attendance Modal */}
      {selectedGatewayModal === 'attendance' && (
        <div
          onClick={() => setSelectedGatewayModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              maxWidth: '780px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(7, 41, 77, 0.25)',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #07294d 0%, #0d3c61 100%)',
                color: '#ffffff',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserCheck size={22} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#ffffff' }}>
                    របាយការណ៍វត្តមានសិក្សា (Student Attendance Record)
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
                    ឆមាសទី ១ • ឆ្នាំសិក្សា ២០២៥-២០២៦ • កត់ត្រាតាមប្រព័ន្ធឌីជីថល RPITSSR
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGatewayModal(null)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px' }}>
              {/* Overall Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: '600' }}>អត្រាវត្តមានសរុប</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#059669', marginTop: '4px' }}>96.5%</div>
                  <div style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: '600' }}>ល្អប្រសើរ (Distinction)</div>
                </div>
                <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: '600' }}>មានវត្តមាន (Present)</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#1e73be', marginTop: '4px' }}>92.0%</div>
                  <div style={{ fontSize: '0.74rem', color: '#3b82f6', fontWeight: '600' }}>276 / 300 ម៉ោង</div>
                </div>
                <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: '#9a3412', fontWeight: '600' }}>សុំច្បាប់ (Excused)</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#ea580c', marginTop: '4px' }}>4.5%</div>
                  <div style={{ fontSize: '0.74rem', color: '#f97316', fontWeight: '600' }}>14 ម៉ោង (មានលិខិត)</div>
                </div>
                <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6b21a8', fontWeight: '600' }}>អវត្តមានឥតច្បាប់</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#7c3aed', marginTop: '4px' }}>0%</div>
                  <div style={{ fontSize: '0.74rem', color: '#9333ea', fontWeight: '600' }}>គ្មានអវត្តមាន</div>
                </div>
              </div>

              {/* Subject Attendance Breakdown */}
              <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#07294D', marginBottom: '14px' }}>
                វត្តមានតាមមុខវិជ្ជានីមួយៗ (Per-Subject Attendance)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { name: 'ការអភិវឌ្ឍគេហទំព័រជឿនលឿន (Advanced Web Development)', rate: 98, attended: '49/50h' },
                  { name: 'ប្រព័ន្ធគ្រប់គ្រងទិន្នន័យ (Database Administration)', rate: 96, attended: '48/50h' },
                  { name: 'បច្ចេកវិទ្យាបណ្តាញកុំព្យូទ័រ (Network Engineering & CCNA)', rate: 95, attended: '47.5/50h' },
                  { name: 'ប្រព័ន្ធសុវត្ថិភាពបណ្តាញ និង Cloud Computing', rate: 97, attended: '48.5/50h' },
                  { name: 'ភាសាអង់គ្លេសបច្ចេកទេសសម្រាប់ IT (Technical English)', rate: 96, attended: '48/50h' },
                ].map((s, idx) => (
                  <div key={idx} style={{ padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '700', color: '#07294D', fontSize: '0.9rem' }}>{s.name}</span>
                      <span style={{ fontWeight: '800', color: '#059669', fontSize: '0.9rem' }}>{s.rate}% ({s.attended})</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
                      <div style={{ width: `${s.rate}%`, height: '100%', borderRadius: '4px', backgroundColor: s.rate >= 95 ? '#059669' : '#1e73be' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* MLVT Note */}
              <div style={{ marginTop: '20px', padding: '12px 16px', borderRadius: '10px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={20} color="#1e73be" />
                <div style={{ fontSize: '0.82rem', color: '#1e40af' }}>
                  ទិន្នន័យវត្តមានត្រូវបានធ្វើសមកាលកម្មដោយស្វ័យប្រវត្តិតាមប្រព័ន្ធស្កេនស្នាមម្រាមដៃ និងបញ្ជូនទៅក្រសួងការងារ និងបណ្តុះបណ្តាលវិជ្ជាជីវៈ (MLVT TVET System) ដើម្បីរក្សាសិទ្ធិអាហារូបករណ៍ ១០០%។
                </div>
              </div>

              {/* Close */}
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setSelectedGatewayModal(null)}
                  style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#07294D', color: '#ffffff', fontWeight: '700', fontSize: '0.88rem', border: 'none', cursor: 'pointer' }}
                >
                  យល់ព្រម (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Payments & Scholarship Modal */}
      {selectedGatewayModal === 'payments' && (
        <div
          onClick={() => setSelectedGatewayModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              maxWidth: '760px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(7, 41, 77, 0.25)',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #07294d 0%, #0d3c61 100%)',
                color: '#ffffff',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wallet size={22} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#ffffff' }}>
                    ការបង់ប្រាក់ & អាហារូបករណ៍ (Tuition & Scholarship)
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
                    ស្ថានភាពហិរញ្ញវត្ថុសិក្សា និងការឧបត្ថម្ភពីរាជរដ្ឋាភិបាល
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGatewayModal(null)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px' }}>
              {/* Highlight Scholarship Banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
                  borderRadius: '16px',
                  padding: '20px 24px',
                  color: '#ffffff',
                  marginBottom: '24px',
                  boxShadow: '0 8px 20px rgba(4, 120, 87, 0.2)',
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#fef08a', color: '#854d0e', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800', marginBottom: '10px' }}>
                  <Sparkles size={14} /> អាហារូបករណ៍ ១០០% រាជរដ្ឋាភិបាលកម្ពុជា
                </div>
                <h4 style={{ margin: '0 0 6px', fontSize: '1.3rem', fontWeight: '800', color: '#ffffff' }}>
                  សិស្ស-និស្សិតអាហារូបករណ៍ពេញលេញ (Full Scholarship)
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#d1fae5', lineHeight: 1.5 }}>
                  ទទួលបានការលើកលែងថ្លៃសិក្សា ១០០% ឥតគិតថ្លៃគ្រប់ឆមាស ក្រោមកម្មវិធីបណ្តុះបណ្តាលជំនាញវិជ្ជាជីវៈ និងបច្ចេកទេសរបស់រាជរដ្ឋាភិបាលកម្ពុជា (TVET 1.5M Program)។
                </p>
              </div>

              {/* Detail Items */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: '600' }}>ថ្លៃសិក្សាឆមាស (Tuition Fee)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#059669', marginTop: '4px' }}>$0.00 (Free)</div>
                  <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: '600' }}>✓ ឧបត្ថម្ភ ១០០%</div>
                </div>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: '600' }}>សម្ភារៈពិសោធន៍ & Lab</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#059669', marginTop: '4px' }}>$0.00 (Free)</div>
                  <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: '600' }}>✓ វិទ្យាស្ថានរ៉ាប់រង</div>
                </div>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: '600' }}>លេខកូដអាហារូបករណ៍</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#07294D', marginTop: '4px', fontFamily: 'monospace' }}>
                    SCH-RPITSSR-{student.studentId || '2026'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>មានសុពលភាពពេញវគ្គសិក្សា</div>
                </div>
              </div>

              {/* Info Note */}
              <div style={{ padding: '14px 18px', borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={22} color="#059669" />
                <div style={{ fontSize: '0.85rem', color: '#166534', lineHeight: 1.5 }}>
                  <strong>ស្ថានភាពបច្ចុប្បន្ន៖</strong> គ្មានបំណុល ឬកាតព្វកិច្ចហិរញ្ញវត្ថុដែលត្រូវទូទាត់ឡើយ។ សិស្សមានសិទ្ធិចូលរៀន ប្រឡង និងប្រើប្រាស់គ្រប់បន្ទប់ពិសោធន៍បច្ចេកវិទ្យាដោយពេញលេញ។
                </div>
              </div>

              {/* Close */}
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setSelectedGatewayModal(null)}
                  style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#07294D', color: '#ffffff', fontWeight: '700', fontSize: '0.88rem', border: 'none', cursor: 'pointer' }}
                >
                  បិទ (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Internship & Career Modal */}
      {selectedGatewayModal === 'internship' && (
        <div
          onClick={() => setSelectedGatewayModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              maxWidth: '780px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(7, 41, 77, 0.25)',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #07294d 0%, #0d3c61 100%)',
                color: '#ffffff',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase size={22} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#ffffff' }}>
                    កម្មសិក្សាការងារ & ឱកាសការងារ (Internship & Placements)
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
                    កិច្ចសហប្រតិបត្តិការជាមួយដៃគូសហគ្រាស និងឧស្សាហកម្មបច្ចេកវិទ្យា
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGatewayModal(null)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px' }}>
              {/* Placement Card */}
              <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#059669', fontSize: '0.78rem', fontWeight: '800' }}>
                      ● កំពុងចុះកម្មសិក្សាការងារ (Active Placement)
                    </span>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#07294D', margin: '8px 0 2px' }}>
                      Angkor Digital Hub & Smart Axiata Technology Center
                    </h4>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      ផ្នែក៖ IT Support & Junior Full-Stack Developer
                    </div>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e73be', backgroundColor: '#eff6ff', padding: '6px 12px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    ក្រេឌីតអនុវត្ត៖ ៦ ក្រេឌីត (300 ម៉ោង)
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '600' }}>អ្នកណែនាំនៅសហគ្រាស (Supervisor)</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#07294D', marginTop: '2px' }}>លោក ហាន វិបុល (Lead Engineer)</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '600' }}>គ្រូសម្របសម្រួល RPITSSR</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#07294D', marginTop: '2px' }}>សាស្ត្រាចារ្យ ឡុង វិចិត្រ</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '600' }}>រយៈពេលអនុវត្ត</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#07294D', marginTop: '2px' }}>០១ វិច្ឆិកា ២០២៥ - ៣១ មករា ២០២៦</div>
                  </div>
                </div>
              </div>

              {/* Evaluation Metrics */}
              <h4 style={{ fontSize: '0.96rem', fontWeight: '800', color: '#07294D', marginBottom: '12px' }}>
                ការវាយតម្លៃសមត្ថភាពជាក់ស្តែងពីសហគ្រាស (Industry Evaluation)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', color: '#166534', fontWeight: '600' }}>វិន័យ & ការគោរពពេល</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#059669', marginTop: '2px' }}>100%</div>
                </div>
                <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: '600' }}>ជំនាញអនុវត្តបច្ចេកទេស</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1e73be', marginTop: '2px' }}>95%</div>
                </div>
                <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', color: '#6b21a8', fontWeight: '600' }}>ការងារជាក្រុម & ទំនាក់ទំនង</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#7c3aed', marginTop: '2px' }}>98%</div>
                </div>
              </div>

              {/* Close */}
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setSelectedGatewayModal(null)}
                  style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#07294D', color: '#ffffff', fontWeight: '700', fontSize: '0.88rem', border: 'none', cursor: 'pointer' }}
                >
                  យល់ព្រម (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Curriculum Modal */}
      {selectedGatewayModal === 'curriculum' && (
        <div
          onClick={() => setSelectedGatewayModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              maxWidth: '820px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(7, 41, 77, 0.25)',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #07294d 0%, #0d3c61 100%)',
                color: '#ffffff',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={22} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#ffffff' }}>
                    កម្មវិធីបណ្តុះបណ្តាល និងមុខវិជ្ជាសិក្សា (Curriculum & Syllabus)
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
                    {student.degreeLevel || 'កម្រិតបរិញ្ញាបត្រ'} • មុខជំនាញ៖ {student.className || 'ព័ត៌មានវិទ្យា'} • សរុប {student.totalCredits || 120} ក្រេឌីត
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGatewayModal(null)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  {
                    year: 'ឆ្នាំទី ១ (Year 1) - មូលដ្ឋានគ្រឹះវិស្វកម្ម',
                    credits: '៣០ ក្រេឌីត (បញ្ចប់រួចរាល់)',
                    statusColor: '#059669',
                    courses: ['Programming Fundamentals (C/C++)', 'Computer Hardware & Architecture', 'Calculus for Engineers', 'Technical English I', 'Introduction to ICT Systems'],
                  },
                  {
                    year: 'ឆ្នាំទី ២ (Year 2) - ប្រព័ន្ធទិន្នន័យ និងបណ្តាញ',
                    credits: '៣០ ក្រេឌីត (បញ្ចប់រួចរាល់)',
                    statusColor: '#059669',
                    courses: ['Data Structures & Algorithms', 'Database Systems (SQL & Relational Models)', 'Cisco CCNA Networking Fundamentals', 'Object-Oriented Programming (Java/Python)', 'Technical English II'],
                  },
                  {
                    year: 'ឆ្នាំទី ៣ (Year 3) - បច្ចេកវិទ្យាជឿនលឿន & Web/Cloud',
                    credits: '៣០ ក្រេឌីត (កំពុងសិក្សា)',
                    statusColor: '#1e73be',
                    courses: ['Advanced Web Development (Full-Stack)', 'Cloud Computing & DevOps Basics', 'Network Security & Firewalls', 'Mobile Application Development', 'Research Methodology'],
                  },
                  {
                    year: 'ឆ្នាំទី ៤ (Year 4) - កម្មសិក្សា & សារណាបញ្ចប់ការសិក្សា',
                    credits: '៣០ ក្រេឌីត (គ្រោងទុក)',
                    statusColor: '#64748b',
                    courses: ['Industry Internship Placement (300h)', 'Capstone Graduation Project', 'Enterprise Software Architecture', 'Artificial Intelligence & Data Mining', 'Tech Entrepreneurship'],
                  },
                ].map((block, idx) => (
                  <div key={idx} style={{ padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', boxShadow: '0 2px 6px rgba(7, 41, 77, 0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#07294D' }}>{block.year}</h4>
                      <span style={{ fontSize: '0.82rem', fontWeight: '800', color: block.statusColor, backgroundColor: block.statusColor === '#059669' ? '#f0fdf4' : '#eff6ff', padding: '4px 10px', borderRadius: '20px', border: `1px solid ${block.statusColor === '#059669' ? '#bbf7d0' : '#bfdbfe'}` }}>
                        {block.credits}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {block.courses.map((c, cIdx) => (
                        <span key={cIdx} style={{ fontSize: '0.8rem', color: '#334155', backgroundColor: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          ✓ {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Close */}
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setSelectedGatewayModal(null)}
                  style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#07294D', color: '#ffffff', fontWeight: '700', fontSize: '0.88rem', border: 'none', cursor: 'pointer' }}
                >
                  យល់ព្រម (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Feedback Modal */}
      {selectedGatewayModal === 'feedback' && (
        <div
          onClick={() => setSelectedGatewayModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(7, 41, 77, 0.25)',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #07294d 0%, #0d3c61 100%)',
                color: '#ffffff',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={22} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#ffffff' }}>
                    មតិកែលម្អការបង្រៀន និងសេវាកម្ម (Course Feedback)
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
                    មតិរបស់អ្នកជួយលើកកម្ពស់គុណភាពបណ្តុះបណ្តាលនៅ RPITSSR
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGatewayModal(null)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px' }}>
              {feedbackSubmitted ? (
                <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f0fdf4', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#07294D', margin: '0 0 8px' }}>
                    អរគុណសម្រាប់ការផ្តល់មតិកែលម្អ!
                  </h4>
                  <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
                    មតិ និងសំណូមពររបស់អ្នកត្រូវបានបញ្ជូនដោយជោគជ័យទៅកាន់គណៈគ្រប់គ្រងការិយាល័យធានាគុណភាពអប់រំ។
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit}>
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#07294D', marginBottom: '6px' }}>
                      ជ្រើសរើសប្រធានបទមតិកែលម្អ (Feedback Category)
                    </label>
                    <select
                      value={feedbackForm.category}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, category: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a' }}
                    >
                      <option value="curriculum">គុណភាពនៃការបង្រៀនរបស់លោកគ្រូ-អ្នកគ្រូ (Teaching Quality)</option>
                      <option value="lab">បន្ទប់ពិសោធន៍ និងឧបករណ៍បច្ចេកវិទ្យា (Labs & Equipment)</option>
                      <option value="services">សេវាការិយាល័យសិក្សា & រដ្ឋបាល (Registrar & Services)</option>
                      <option value="library">បណ្ណាល័យ និងបរិស្ថានវិទ្យាស្ថាន (Library & Environment)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#07294D', marginBottom: '8px' }}>
                      កម្រិតការពេញចិត្ត (Satisfaction Rating)
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            color: star <= feedbackForm.rating ? '#ffaf00' : '#cbd5e1',
                            transition: 'transform 0.15s ease',
                          }}
                        >
                          <Star size={28} fill={star <= feedbackForm.rating ? '#ffaf00' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '22px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#07294D', marginBottom: '6px' }}>
                      មតិយោបល់ និងសំណូមពរ (Comments & Suggestions)
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={feedbackForm.comment}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                      placeholder="សូមសរសេរមតិកែលម្អរបស់អ្នកនៅទីនេះ..."
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedGatewayModal(null)}
                      style={{ padding: '10px 18px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: '600', fontSize: '0.88rem', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                    >
                      បោះបង់ (Cancel)
                    </button>
                    <button
                      type="submit"
                      style={{ padding: '10px 22px', borderRadius: '8px', backgroundColor: '#07294D', color: '#ffffff', fontWeight: '700', fontSize: '0.88rem', border: 'none', cursor: 'pointer' }}
                    >
                      បញ្ជូនមតិកែលម្អ (Submit Feedback)
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. Achievements Modal */}
      {selectedGatewayModal === 'achievements' && (
        <div
          onClick={() => setSelectedGatewayModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              maxWidth: '760px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(7, 41, 77, 0.25)',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #07294d 0%, #0d3c61 100%)',
                color: '#ffffff',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={22} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#ffffff' }}>
                    សមិទ្ធផល និងវិញ្ញាបនបត្រឌីជីថល (Achievements & Awards)
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
                    ស្នាដៃឆ្នើម និងការទទួលស្គាល់ផ្លូវការពីស្ថាប័ន
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGatewayModal(null)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  {
                    title: 'ជ័យលាភីលេខ ១៖ ការប្រកួតជំនាញបច្ចេកវិទ្យាព័ត៌មានកម្រិតជាតិ (National TVET Skills 2025)',
                    issuer: 'ក្រសួងការងារ និងបណ្តុះបណ្តាលវិជ្ជាជីវៈ (MLVT)',
                    date: 'វិច្ឆិកា ២០២៥',
                    badge: '🥇 មេដាយមាស',
                    badgeBg: '#fefce8',
                    badgeColor: '#ca8a04',
                  },
                  {
                    title: 'លិខិតសរសើរនិស្សិតឆ្នើមប្រចាំឆ្នាំសិក្សា ២០២៤-២០២៥ (Dean’s Honor List)',
                    issuer: 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប (RPITSSR)',
                    date: 'កក្កដា ២០២៥',
                    badge: '🎖️ និទ្ទេសឆ្នើម',
                    badgeBg: '#eff6ff',
                    badgeColor: '#1e73be',
                  },
                  {
                    title: 'វិញ្ញាបនបត្រជំនាញ Cisco Certified Network Associate (CCNA - Routing & Switching)',
                    issuer: 'Cisco Networking Academy @ RPITSSR',
                    date: 'កញ្ញា ២០២៥',
                    badge: '📜 Verified Partner',
                    badgeBg: '#f0fdf4',
                    badgeColor: '#059669',
                  },
                ].map((ach, idx) => (
                  <div key={idx} style={{ padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ minWidth: '240px', flex: '1 1 300px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: '800', color: ach.badgeColor, backgroundColor: ach.badgeBg, padding: '4px 10px', borderRadius: '20px' }}>
                        {ach.badge}
                      </span>
                      <h4 style={{ margin: '8px 0 3px', fontSize: '0.98rem', fontWeight: '800', color: '#07294D' }}>
                        {ach.title}
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        ចេញដោយ៖ {ach.issuer} • កាលបរិច្ឆេទ៖ {ach.date}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert(`វិញ្ញាបនបត្រឌីជីថល "${ach.title}" ត្រូវបានផ្ទៀងផ្ទាត់ត្រឹមត្រូវ!`)}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#07294D', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                      មើលវិញ្ញាបនបត្រ
                    </button>
                  </div>
                ))}
              </div>

              {/* Close */}
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setSelectedGatewayModal(null)}
                  style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#07294D', color: '#ffffff', fontWeight: '700', fontSize: '0.88rem', border: 'none', cursor: 'pointer' }}
                >
                  បិទ (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. QR Verification Modal */}
      {qrModalOpen && (
        <div
          onClick={() => setQrModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(7, 41, 77, 0.25)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              textAlign: 'center',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #07294d 0%, #0d3c61 100%)',
                color: '#ffffff',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={20} color="#ffaf00" />
                <span style={{ fontSize: '1rem', fontWeight: '800', color: '#ffffff' }}>
                  កូដសម្គាល់សិស្សឌីជីថល (Digital QR)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* QR Body */}
            <div style={{ padding: '24px' }}>
              <div
                style={{
                  width: '230px',
                  height: '230px',
                  margin: '0 auto 16px',
                  padding: '12px',
                  borderRadius: '16px',
                  border: '2px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 6px 18px rgba(7, 41, 77, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=210x210&data=${encodeURIComponent(`https://rpitssr.edu.kh/verify/student/${student.studentId || 'RPITSSR-STU'}`)}`}
                  alt="Student Verification QR Code"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>

              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#07294D', marginBottom: '2px' }}>
                {student.khmerName || student.fullName || student.username}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                {student.latinName || (student.username ? student.username.toUpperCase() : 'STUDENT')}
              </div>
              <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: '20px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e73be', fontSize: '0.85rem', fontWeight: '800', fontFamily: 'monospace', marginBottom: '14px' }}>
                ID: {student.studentId || 'STU-STUDENT'}
              </div>

              <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4, borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                ស្កេនកូដនេះដើម្បីផ្ទៀងផ្ទាត់ស្ថានភាពសិស្សផ្លូវការជាមួយមូលដ្ឋានទិន្នន័យ RPITSSR។
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => setQrModalOpen(false)}
                  style={{ padding: '9px 24px', borderRadius: '8px', backgroundColor: '#07294D', color: '#ffffff', fontWeight: '700', fontSize: '0.85rem', border: 'none', cursor: 'pointer' }}
                >
                  បិទ (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. Change Password Modal */}
      {changePasswordModalOpen && (
        <div
          onClick={() => !profileSaving && setChangePasswordModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(7, 41, 77, 0.25)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #07294d 0%, #0d3c61 100%)',
                color: '#ffffff',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Lock size={20} color="#ffaf00" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#ffffff' }}>
                  ប្តូរពាក្យសម្ងាត់ (Change Password)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setChangePasswordModalOpen(false)}
                disabled={profileSaving}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleChangePasswordModalSubmit} style={{ padding: '24px' }}>
              {profileError && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.84rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>{profileError}</span>
                </div>
              )}
              {profileSuccess && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#059669', fontSize: '0.84rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} />
                  <span>{profileSuccess}</span>
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#07294D', marginBottom: '6px' }}>
                  ពាក្យសម្ងាត់បច្ចុប្បន្ន (Current Password) *
                </label>
                <input
                  type="password"
                  required
                  value={profileForm.currentPassword}
                  onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#07294D', marginBottom: '6px' }}>
                  ពាក្យសម្ងាត់ថ្មី (New Password) *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={profileForm.newPassword}
                  onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                  placeholder="យ៉ាងតិច ៨ តួអក្សរ"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#07294D', marginBottom: '6px' }}>
                  ផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់ថ្មី (Confirm New Password) *
                </label>
                <input
                  type="password"
                  required
                  value={profileForm.confirmPassword}
                  onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setChangePasswordModalOpen(false)}
                  disabled={profileSaving}
                  style={{ padding: '9px 16px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: '600', fontSize: '0.85rem', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={profileSaving}
                  style={{ padding: '9px 20px', borderRadius: '8px', backgroundColor: '#07294D', color: '#ffffff', fontWeight: '700', fontSize: '0.85rem', border: 'none', cursor: 'pointer' }}
                >
                  {profileSaving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក (Save Password)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. Edit Contact Modal */}
      {editContactModalOpen && (
        <div
          onClick={() => !contactSaving && setEditContactModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(7, 41, 77, 0.25)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #07294d 0%, #0d3c61 100%)',
                color: '#ffffff',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={20} color="#ffaf00" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#ffffff' }}>
                  កែប្រែព័ត៌មានទំនាក់ទំនង (Contact Info)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditContactModalOpen(false)}
                disabled={contactSaving}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveContact} style={{ padding: '24px' }}>
              {contactSuccessMsg && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#059669', fontSize: '0.84rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} />
                  <span>{contactSuccessMsg}</span>
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#07294D', marginBottom: '6px' }}>
                  ឈ្មោះពេញ (Display Full Name)
                </label>
                <input
                  type="text"
                  value={contactFullNameInput}
                  onChange={(e) => setContactFullNameInput(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#07294D', marginBottom: '6px' }}>
                  លេខទូរស័ព្ទ (Phone Number)
                </label>
                <input
                  type="text"
                  value={contactPhoneInput}
                  onChange={(e) => setContactPhoneInput(e.target.value)}
                  placeholder="093 xxx xxx"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#64748b', marginBottom: '20px' }}>
                ℹ️ អត្តលេខសិស្ស កម្រិតសិក្សា ជំនាញ និងមហាវិទ្យាល័យ មិនអាចកែប្រែដោយផ្ទាល់បានទេ ដើម្បីធានាសុចរិតភាពទិន្នន័យ។
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditContactModalOpen(false)}
                  disabled={contactSaving}
                  style={{ padding: '9px 16px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: '600', fontSize: '0.85rem', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={contactSaving}
                  style={{ padding: '9px 20px', borderRadius: '8px', backgroundColor: '#07294D', color: '#ffffff', fontWeight: '700', fontSize: '0.85rem', border: 'none', cursor: 'pointer' }}
                >
                  {contactSaving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក (Save Changes)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 11. Printable Digital Student ID Card Modal */}
      {printCardModalOpen && (
        <div
          onClick={() => setPrintCardModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(7, 41, 77, 0.25)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #07294d 0%, #0d3c61 100%)',
                color: '#ffffff',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={22} color="#ffaf00" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#ffffff' }}>
                    ប័ណ្ណសម្គាល់ខ្លួននិស្សិតឌីជីថល (Digital Student ID Card)
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                    វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPrintCardModalOpen(false)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* ID Card Visuals */}
            <div style={{ padding: '24px' }}>
              {/* Card Container */}
              <div
                id="printable-student-card"
                style={{
                  maxWidth: '480px',
                  margin: '0 auto 24px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 12px 28px rgba(7, 41, 77, 0.15)',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                }}
              >
                {/* ID Header */}
                <div style={{ background: 'linear-gradient(135deg, #07294D 0%, #0d3c61 100%)', padding: '16px 20px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src="/images/logo.png" alt="Logo" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '800', letterSpacing: '0.3px', lineHeight: 1.2 }}>
                      វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#cbd5e1', letterSpacing: '0.5px' }}>
                      REGIONAL POLYTECHNIC INSTITUTE TECHO SEN SIEM REAP
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#ffaf00', fontWeight: '700', marginTop: '2px' }}>
                      ប័ណ្ណសម្គាល់ខ្លួននិស្សិត / STUDENT IDENTITY CARD
                    </div>
                  </div>
                </div>

                {/* ID Body */}
                <div style={{ padding: '20px', display: 'flex', gap: '18px', alignItems: 'center' }}>
                  {/* Photo */}
                  <div style={{ width: '105px', height: '130px', borderRadius: '10px', border: '2px solid #07294D', overflow: 'hidden', backgroundColor: '#f1f5f9', flexShrink: 0 }}>
                    {student.avatarUrl ? (
                      <img src={student.avatarUrl} alt={student.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#07294D', fontSize: '2.5rem', fontWeight: '800' }}>
                        {(student.fullName || student.username || 'S').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Student Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#07294D', lineHeight: 1.2 }}>
                      {student.khmerName || student.fullName || student.username}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                      {student.latinName || (student.username ? student.username.toUpperCase() : 'STUDENT')}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4px', fontSize: '0.8rem' }}>
                      <div>
                        <span style={{ color: '#64748b' }}>អត្តលេខ / ID: </span>
                        <strong style={{ color: '#1e73be', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                          {student.studentId || 'STU-STUDENT'}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>ជំនាញ / Major: </span>
                        <strong style={{ color: '#07294D' }}>{student.className || 'ព័ត៌មានវិទ្យា'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>កម្រិត / Level: </span>
                        <strong style={{ color: '#07294D' }}>{student.degreeLevel || 'បរិញ្ញាបត្រ'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>ជំនាន់ / Gen: </span>
                        <strong style={{ color: '#07294D' }}>{student.generation || '13'} (២០២៤ - ២០២៨)</strong>
                      </div>
                    </div>
                  </div>

                  {/* QR */}
                  <div style={{ width: '70px', height: '70px', flexShrink: 0, padding: '4px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent(`https://rpitssr.edu.kh/verify/student/${student.studentId || 'RPITSSR-STU'}`)}`}
                      alt="QR"
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                </div>

                {/* ID Card Tricolor Footer */}
                <div style={{ height: '6px', background: 'linear-gradient(90deg, #07294D 0%, #1e73be 50%, #ffaf00 100%)' }} />
              </div>

              {/* Actions */}
              <div className="no-print" style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 22px',
                    borderRadius: '8px',
                    backgroundColor: '#07294D',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '0.88rem',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Printer size={16} />
                  <span>បោះពុម្ពប័ណ្ណសម្គាល់ខ្លួន (Print ID Card)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintCardModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#f1f5f9',
                    color: '#334155',
                    fontWeight: '600',
                    fontSize: '0.88rem',
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                  }}
                >
                  បិទ (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
