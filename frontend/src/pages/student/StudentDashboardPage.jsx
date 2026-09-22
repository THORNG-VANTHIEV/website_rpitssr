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
        {/* Welcome Hero Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #07294d 0%, #0d3c61 60%, #0c8b51 100%)',
            borderRadius: '16px',
            padding: 'clamp(18px, 3.5vw, 28px) clamp(16px, 3.5vw, 32px)',
            color: '#ffffff',
            marginBottom: '24px',
            boxShadow: '0 10px 25px -5px rgba(7, 41, 77, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, flex: '1 1 320px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                fontWeight: '800',
                flexShrink: 0,
              }}
            >
              <GraduationCap size={28} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: '500' }}>
                សូមស្វាគមន៍មកកាន់ប្រព័ន្ធព័ត៌មានវិទ្យាល័យបច្ចេកទេស (Welcome Back)
              </div>
              <h1
                style={{
                  fontSize: 'clamp(1.35rem, 4vw, 1.85rem)',
                  fontWeight: '800',
                  color: '#ffffff',
                  margin: '4px 0 8px',
                  letterSpacing: '-0.01em',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                  lineHeight: 1.2,
                  wordBreak: 'break-word',
                }}
              >
                {student.fullName || student.username}
              </h1>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.22)',
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                    color: '#ffffff',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.76rem',
                    fontWeight: '700',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  🎓 ID: {student.studentId || 'STU-STUDENT'}
                </span>
                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.22)',
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                    color: '#ffffff',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.76rem',
                    fontWeight: '700',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  🏛️ {student.className || 'Information Technology'}
                </span>
                <span
                  style={{
                    backgroundColor: '#0c8b51',
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                    color: '#ffffff',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.76rem',
                    fontWeight: '700',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  📅 {student.academicYear || '2025-2026'} ({student.semester || 'Semester 1'})
                </span>
              </div>
            </div>
          </div>

          {/* Quick Tab Jump Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('exams')}
              style={{
                backgroundColor: '#ffffff',
                color: '#07294d',
                border: 'none',
                padding: '9px 16px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Award size={16} />
              <span>លទ្ធផលប្រឡង</span>
            </button>
            <button
              onClick={() => setActiveTab('library')}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '9px 16px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Library size={16} />
              <span>សៀវភៅបណ្ណាល័យ</span>
            </button>
          </div>
        </div>

        {/* 4 Academic Quick Stat Cards */}
        <div className="student-stats-grid">
          {/* Card 1: Exam Results */}
          <div
            className="student-stat-card stat-exam"
            onClick={() => setActiveTab('exams')}
            title="ចុចដើម្បីពិនិត្យលទ្ធផលប្រឡងលម្អិត"
          >
            <div className="stat-card-header">
              <span className="stat-card-label">លទ្ធផលប្រឡង (Exam Results)</span>
              <div className="stat-gradient-icon exam-icon">
                <Award size={22} />
              </div>
            </div>
            <div className="stat-main-number">
              {examResults.length > 0 ? `${examResults.length} មុខវិជ្ជា` : '0 កំណត់ត្រា'}
            </div>
            <div className="stat-sub-badge blue">
              <Sparkles size={13} />
              <span>ពិន្ទុមធ្យមភាគ: {avgPercentage}%</span>
            </div>
          </div>

          {/* Card 2: Library Loans */}
          <div
            className="student-stat-card stat-library"
            onClick={() => setActiveTab('library')}
            title="ចុចដើម្បីពិនិត្យការខ្ចីសៀវភៅបណ្ណាល័យ"
          >
            <div className="stat-card-header">
              <span className="stat-card-label">សៀវភៅបណ្ណាល័យ (Book Loans)</span>
              <div className="stat-gradient-icon library-icon">
                <BookOpen size={22} />
              </div>
            </div>
            <div className="stat-main-number">
              {borrowings.filter((b) => b.status === 'borrowed').length} ក្បាលកំពុងខ្ចី
            </div>
            <div className="stat-sub-badge amber">
              <Clock size={13} />
              <span>សរុបទាំងអស់: {borrowings.length} ក្បាល</span>
            </div>
          </div>

          {/* Card 3: Major & Class */}
          <div
            className="student-stat-card stat-class"
            onClick={() => setActiveTab('profile')}
            title="ចុចដើម្បីមើលព័ត៌មានគណនី និងថ្នាក់រៀន"
          >
            <div className="stat-card-header">
              <span className="stat-card-label">ថ្នាក់ & ជំនាញ (Class & Major)</span>
              <div className="stat-gradient-icon class-icon">
                <Layers size={22} />
              </div>
            </div>
            <div
              className="stat-main-number"
              style={{
                fontSize: '1.25rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {student.className || 'Information Technology'}
            </div>
            <div className="stat-sub-badge purple">
              <Bookmark size={13} />
              <span>កម្រិតបណ្តុះបណ្តាលវិជ្ជាជីវៈ (TVET)</span>
            </div>
          </div>

          {/* Card 4: Academic Status */}
          <div className="student-stat-card stat-status" title="ស្ថានភាពនិស្សិតសកម្ម">
            <div className="stat-card-header">
              <span className="stat-card-label">ស្ថានភាពនិស្សិត (Status)</span>
              <div className="stat-gradient-icon status-icon">
                <CheckCircle2 size={22} />
              </div>
            </div>
            <div
              className="stat-main-number"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.35rem' }}
            >
              <span className="pulsing-dot" />
              <span style={{ color: '#059669' }}>{stats.academicStatus || 'Enrolled (សកម្ម)'}</span>
            </div>
            <div className="stat-sub-badge green">
              <Check size={13} />
              <span>មានសិទ្ធិប្រឡង & ប្រើប្រាស់ធនធាន</span>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="student-nav-tabs-wrapper">
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

        {/* TAB 5: MY PROFILE & SECURITY */}
        {activeTab === 'profile' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '28px', maxWidth: '720px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#07294d', margin: 0 }}>
                ព័ត៌មានគណនី និងសុវត្ថិភាព (Profile & Security)
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>
                កែប្រែព័ត៌មានផ្ទាល់ខ្លួន និងផ្លាស់ប្តូរពាក្យសម្ងាត់សម្រាប់ចូលប្រើប្រាស់
              </p>
            </div>

            {profileSuccess && (
              <div
                style={{
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle size={18} />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#b91c1c',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={18} />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.88rem', color: '#334155', marginBottom: '6px' }}>
                  ឈ្មោះពេញ (Full Name)
                </label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  placeholder="e.g. ថង វ៉ាន់ធៀវ"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: '600', fontSize: '0.88rem', color: '#334155', marginBottom: '6px' }}>
                    <span>អត្តលេខនិស្សិត (Student ID)</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'normal' }}>🔒 កំណត់ដោយការិយាល័យសិក្សា</span>
                  </label>
                  <input
                    type="text"
                    value={profileForm.studentId || 'មិនទាន់កំណត់ (Not Assigned)'}
                    readOnly
                    disabled
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: '0.9rem', outline: 'none', cursor: 'not-allowed' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '0.88rem', color: '#334155', marginBottom: '6px' }}>
                    ថ្នាក់សិក្សា (Class Name)
                  </label>
                  <input
                    type="text"
                    value={profileForm.className}
                    onChange={(e) => setProfileForm({ ...profileForm, className: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                    placeholder="e.g. IT-G13-A"
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '24px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#07294d', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lock size={16} /> ផ្លាស់ប្តូរពាក្យសម្ងាត់ (Change Password)
                </h4>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>
                    ពាក្យសម្ងាត់បច្ចុប្បន្ន (Current Password)
                  </label>
                  <input
                    type="password"
                    value={profileForm.currentPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                    placeholder="បញ្ចូលពាក្យសម្ងាត់ចាស់ដើម្បីផ្ទៀងផ្ទាត់"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '16px', marginBottom: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>
                      ពាក្យសម្ងាត់ថ្មី (New Password)
                    </label>
                    <input
                      type="password"
                      value={profileForm.newPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                      placeholder="យ៉ាងតិច ៨ តួអក្សរ"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>
                      បញ្ជាក់ពាក្យសម្ងាត់ថ្មី (Confirm New Password)
                    </label>
                    <input
                      type="password"
                      value={profileForm.confirmPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                      placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មីម្តងទៀត"
                    />
                  </div>
                </div>
              </div>

              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                ការផ្លាស់ប្តូរពាក្យសម្ងាត់នឹងចាកចេញពីគ្រប់ឧបករណ៍។ / Changing your password signs out all devices.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={handleLogoutAll}
                  disabled={loggingOutAll || profileSaving}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#07294D', fontWeight: 600 }}
                >
                  {loggingOutAll ? 'កំពុងចាកចេញ... / Signing out...' : 'ចាកចេញពីគ្រប់ឧបករណ៍ / Sign out of all devices'}
                </button>
                <button
                  type="submit"
                  disabled={profileSaving}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#0c8b51',
                    color: '#ffffff',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  <Save size={16} />
                  <span>{profileSaving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកការផ្លាស់ប្តូរ (Save Profile)'}</span>
                </button>
              </div>
            </form>
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
    </div>
  );
};
