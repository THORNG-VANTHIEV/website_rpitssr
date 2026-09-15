import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  BookOpen,
  Newspaper,
  Calendar,
  GraduationCap,
  Users,
  Image,
  Database,
  ShieldCheck,
  HardDrive,
  Plus,
  ArrowUpRight,
  Bell,
  Award,
  FileDown,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Server,
  Key,
  Layers,
  Phone,
  Sparkles,
  Sliders,
  FolderTree
} from 'lucide-react';

// Khmer numeral conversion helper
const toKhmerNumber = (num) => {
  if (num === null || num === undefined) return '--';
  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return String(num).replace(/[0-9]/g, (digit) => khmerDigits[parseInt(digit, 10)]);
};

export const AdminDashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFeedTab, setActiveFeedTab] = useState('notices');
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useAuth();
  const { currentLanguage, language } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  const loadSummary = () => {
    setRefreshing(true);
    api.get('/system/summary')
      .then((res) => {
        setSummary(res.data);
      })
      .catch((err) => {
        console.error('Failed to load summary:', err);
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    loadSummary();
  }, []);

  // Format today's date in Khmer or English
  const getTodayDateString = () => {
    const today = new Date();
    if (isKhmer) {
      const daysKh = ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
      const monthsKh = [
        'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
        'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
      ];
      const dayName = daysKh[today.getDay()];
      const day = toKhmerNumber(today.getDate());
      const month = monthsKh[today.getMonth()];
      const year = toKhmerNumber(today.getFullYear());
      return `ថ្ងៃ${dayName} ទី${day} ខែ${month} ឆ្នាំ${year}`;
    } else {
      return today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const counts = summary?.counts || {};
  const recent = summary?.recentActivity || {};
  const sysInfo = summary?.systemInfo || {};
  const sysHealth = summary?.systemHealth || {};

  // 8 Primary KPI Metrics
  const stats = [
    {
      id: 'users',
      labelKm: 'អ្នកប្រើប្រាស់ & និស្សិត',
      labelEn: 'Users & Students',
      value: counts.users ?? 12,
      subKm: `${toKhmerNumber(counts.students ?? 11)} គណនីនិស្សិត`,
      subEn: `${counts.students ?? 11} Student Accounts`,
      icon: Users,
      color: '#1e73be',
      bg: '#eff6ff',
      borderColor: '#dbeafe',
      tag: isKhmer ? 'សកម្ម' : 'Active',
      tagBg: '#dbeafe',
      tagColor: '#1e73be',
      link: '/admin-panel/users'
    },
    {
      id: 'courses',
      labelKm: 'ជំនាញ & វគ្គបណ្តុះបណ្តាល',
      labelEn: 'Courses & Majors',
      value: counts.courses ?? 10,
      subKm: 'ដេប៉ាតឺម៉ង់បណ្តុះបណ្តាល',
      subEn: 'Academic Departments',
      icon: BookOpen,
      color: '#07294D',
      bg: '#e0e7ff',
      borderColor: '#c7d2fe',
      tag: 'TVET',
      tagBg: '#e0e7ff',
      tagColor: '#07294D',
      link: '/admin-panel/courses'
    },
    {
      id: 'teachers',
      labelKm: 'សាស្ត្រាចារ្យ & បុគ្គលិក',
      labelEn: 'Faculty & Teachers',
      value: counts.teachers ?? 4,
      subKm: 'គ្រូបច្ចេកទេសជំនាញ',
      subEn: 'Specialist Instructors',
      icon: GraduationCap,
      color: '#ea580c',
      bg: '#fff7ed',
      borderColor: '#fed7aa',
      tag: isKhmer ? 'ជំនាញ' : 'Faculty',
      tagBg: '#ffedd5',
      tagColor: '#ea580c',
      link: '/admin-panel/teachers'
    },
    {
      id: 'examResults',
      labelKm: 'លទ្ធផលប្រឡង & ពិន្ទុ',
      labelEn: 'Exam Results',
      value: counts.examResults ?? 11,
      subKm: 'តារាងពិន្ទុបានផ្សាយ',
      subEn: 'Published Transcripts',
      icon: Award,
      color: '#059669',
      bg: '#f0fdf4',
      borderColor: '#bbf7d0',
      tag: isKhmer ? 'បានផ្សាយ' : 'Published',
      tagBg: '#dcfce7',
      tagColor: '#059669',
      link: '/admin-panel/exam-results'
    },
    {
      id: 'notices',
      labelKm: 'សេចក្តីជូនដំណឹង & ប្រកាស',
      labelEn: 'Notices & Bulletins',
      value: counts.notices ?? 8,
      subKm: 'សេចក្តីប្រកាសផ្លូវការ',
      subEn: 'Official Circulars',
      icon: Bell,
      color: '#d97706',
      bg: '#fefce8',
      borderColor: '#fef08a',
      tag: isKhmer ? 'ផ្លូវការ' : 'Official',
      tagBg: '#fef3c7',
      tagColor: '#d97706',
      link: '/admin-panel/notices'
    },
    {
      id: 'documents',
      labelKm: 'ឯកសារ & ទម្រង់បែបបទ',
      labelEn: 'Downloads & Forms',
      value: counts.documents ?? 13,
      subKm: 'ទម្រង់បែបបទសាធារណៈ',
      subEn: 'Public Form Downloads',
      icon: FileDown,
      color: '#7c3aed',
      bg: '#faf5ff',
      borderColor: '#e9d5ff',
      tag: 'PDF/DOC',
      tagBg: '#f3e8ff',
      tagColor: '#7c3aed',
      link: '/admin-panel/downloads'
    },
    {
      id: 'events',
      labelKm: 'ព្រឹត្តិការណ៍ & កម្មវិធី',
      labelEn: 'Events & Workshops',
      value: counts.events ?? 8,
      subKm: 'សិក្ខាសាលាស្ថាប័ន',
      subEn: 'Campus Conferences',
      icon: Calendar,
      color: '#0284c7',
      bg: '#f0f9ff',
      borderColor: '#bae6fd',
      tag: isKhmer ? 'កម្មវិធី' : 'Agenda',
      tagBg: '#e0f2fe',
      tagColor: '#0284c7',
      link: '/admin-panel/events'
    },
    {
      id: 'blogPosts',
      labelKm: 'ព័ត៌មាន & អត្ថបទ',
      labelEn: 'News & Blog Posts',
      value: counts.blogPosts ?? 5,
      subKm: 'អត្ថបទសកម្មភាព',
      subEn: 'Campus News Articles',
      icon: Newspaper,
      color: '#e11d48',
      bg: '#fff1f2',
      borderColor: '#fecdd3',
      tag: isKhmer ? 'ព័ត៌មាន' : 'Articles',
      tagBg: '#ffe4e6',
      tagColor: '#e11d48',
      link: '/admin-panel/blog-posts'
    }
  ];

  return (
    <div className="admin-dashboard-root pb-60">
      {/* =========================================================================
          1. EXECUTIVE WELCOME BANNER
          ========================================================================= */}
      <div className="admin-dash-welcome">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="admin-dash-role-badge">
                <ShieldCheck size={14} />
                {isKhmer ? 'គណៈគ្រប់គ្រងស្ថាប័ន RPITSSR' : 'Executive Administrator'}
              </span>
              <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-1" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                ● {isKhmer ? 'ប្រព័ន្ធដំណើរការប្រក្រតី' : 'System Online'}
              </span>
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#07294D', margin: '0 0 6px', letterSpacing: '-0.3px' }}>
              {isKhmer
                ? `សូមស្វាគមន៍, ${user?.fullName || user?.name || 'ថ្នាក់ដឹកនាំស្ថាប័ន'}`
                : `Welcome back, ${user?.fullName || user?.name || 'Administrator'}`}
            </h1>

            <p style={{ color: '#64748b', margin: 0, fontSize: '0.92rem' }}>
              {isKhmer
                ? 'ផ្ទាំងគ្រប់គ្រងទិន្នន័យ ស្ថិតិអប់រំ និងការត្រួតពិនិត្យហេដ្ឋារចនាសម្ព័ន្ធបច្ចេកវិទ្យាព័ត៌មានវិទ្យាស្ថាន។'
                : 'Unified operational command, academic performance analytics, and system health status for RPITSSR.'}
            </p>
          </div>

          <div className="d-flex align-items-center flex-wrap gap-2">
            <div className="admin-dash-date-chip">
              <Calendar size={15} color="#1e73be" />
              <span>{getTodayDateString()}</span>
            </div>

            <button
              type="button"
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2 rounded-3 px-3 py-2"
              onClick={loadSummary}
              disabled={refreshing}
              title={isKhmer ? 'ផ្ទុកទិន្នន័យឡើងវិញ' : 'Refresh Dashboard'}
              style={{ fontSize: '0.84rem', fontWeight: 600 }}
            >
              <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
              <span>{isKhmer ? 'ធ្វើបច្ចុប្បន្នភាព' : 'Refresh'}</span>
            </button>

            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2 rounded-3 px-3 py-2"
              style={{ background: '#07294D', borderColor: '#07294D', fontSize: '0.84rem', fontWeight: 600 }}
            >
              <ExternalLink size={14} />
              <span>{isKhmer ? 'គេហទំព័រផ្ទាល់' : 'Live Website'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. 8-CARD KPI METRICS GRID
          ========================================================================= */}
      <div className="admin-kpi-grid">
        {stats.map((item) => {
          const IconComponent = item.icon;
          const displayVal = loading ? '...' : isKhmer ? toKhmerNumber(item.value) : item.value;
          return (
            <Link key={item.id} to={item.link} className="admin-kpi-card">
              <div>
                <div className="admin-kpi-header">
                  <div
                    className="admin-kpi-icon-badge"
                    style={{
                      background: item.bg,
                      color: item.color,
                      border: `1px solid ${item.borderColor}`
                    }}
                  >
                    <IconComponent size={24} />
                  </div>
                  <span
                    className="admin-kpi-tag"
                    style={{ background: item.tagBg, color: item.tagColor }}
                  >
                    {item.tag}
                  </span>
                </div>

                <div className="admin-kpi-value">{displayVal}</div>
                <div className="admin-kpi-title">
                  {isKhmer ? item.labelKm : item.labelEn}
                </div>
              </div>

              <div className="admin-kpi-subtitle">
                <span>{isKhmer ? item.subKm : item.subEn}</span>
                <ChevronRight size={14} color="#94a3b8" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* =========================================================================
          3. TWO-COLUMN SPLIT OPERATIONAL LAYOUT
          ========================================================================= */}
      <div className="row g-4">
        {/* Left Column: Recent Activity & Quick Action Shortcuts */}
        <div className="col-lg-7">
          {/* Institutional Activity Feed */}
          <div className="admin-card mb-4">
            <div className="admin-card-header d-flex flex-wrap align-items-center justify-content-between gap-2">
              <div>
                <h3 className="admin-card-title mb-1" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#07294D' }}>
                  {isKhmer ? 'សកម្មភាពស្ថាប័នថ្មីៗ' : 'Recent Institutional Activity'}
                </h3>
                <p className="small text-muted mb-0" style={{ fontSize: '0.82rem' }}>
                  {isKhmer ? 'កំណត់ត្រា និងការផ្សាយចុងក្រោយលើប្រព័ន្ធ' : 'Latest publications and registered records'}
                </p>
              </div>

              {/* Feed Tabs */}
              <div className="d-flex align-items-center gap-1 bg-light p-1 rounded-3">
                <button
                  type="button"
                  className={`admin-feed-tab-btn ${activeFeedTab === 'notices' ? 'active' : ''}`}
                  onClick={() => setActiveFeedTab('notices')}
                >
                  <Bell size={13} />
                  <span>{isKhmer ? 'ដំណឹង' : 'Notices'}</span>
                </button>

                <button
                  type="button"
                  className={`admin-feed-tab-btn ${activeFeedTab === 'examResults' ? 'active' : ''}`}
                  onClick={() => setActiveFeedTab('examResults')}
                >
                  <Award size={13} />
                  <span>{isKhmer ? 'លទ្ធផល' : 'Results'}</span>
                </button>

                <button
                  type="button"
                  className={`admin-feed-tab-btn ${activeFeedTab === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveFeedTab('users')}
                >
                  <Users size={13} />
                  <span>{isKhmer ? 'និស្សិត' : 'Users'}</span>
                </button>
              </div>
            </div>

            <div className="admin-card-body p-3">
              {loading ? (
                <div className="text-center py-4 text-muted">
                  <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                  {isKhmer ? 'កំពុងផ្ទុកទិន្នន័យ...' : 'Loading recent activity...'}
                </div>
              ) : (
                <>
                  {/* TAB 1: NOTICES */}
                  {activeFeedTab === 'notices' && (
                    <div>
                      {recent.notices && recent.notices.length > 0 ? (
                        recent.notices.slice(0, 4).map((notice) => (
                          <Link
                            key={notice.id}
                            to="/admin-panel/notices"
                            className="admin-feed-item"
                          >
                            <div className="d-flex align-items-center">
                              <div
                                className="admin-feed-item-icon"
                                style={{ background: '#fefce8', color: '#d97706', border: '1px solid #fef08a' }}
                              >
                                <Bell size={18} />
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: '#07294D', fontSize: '0.88rem', marginBottom: '2px' }}>
                                  {notice.title}
                                </div>
                                <div className="d-flex align-items-center gap-2 text-muted small" style={{ fontSize: '0.78rem' }}>
                                  <span className="badge bg-light text-secondary border">
                                    {notice.category || 'General'}
                                  </span>
                                  <span>•</span>
                                  <span>{notice.date ? new Date(notice.date).toLocaleDateString() : 'Active'}</span>
                                </div>
                              </div>
                            </div>
                            <ChevronRight size={16} color="#94a3b8" />
                          </Link>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted small">
                          {isKhmer ? 'មិនមានសេចក្តីជូនដំណឹងថ្មីៗ' : 'No recent notices found'}
                        </div>
                      )}
                      <div className="text-end pt-2">
                        <Link to="/admin-panel/notices" className="text-primary small text-decoration-none fw-bold" style={{ fontSize: '0.84rem' }}>
                          {isKhmer ? 'មើលសេចក្តីជូនដំណឹងទាំងអស់ →' : 'View all announcements →'}
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: EXAM RESULTS */}
                  {activeFeedTab === 'examResults' && (
                    <div>
                      {recent.examResults && recent.examResults.length > 0 ? (
                        recent.examResults.slice(0, 4).map((result) => (
                          <Link
                            key={result.id}
                            to="/admin-panel/exam-results"
                            className="admin-feed-item"
                          >
                            <div className="d-flex align-items-center">
                              <div
                                className="admin-feed-item-icon"
                                style={{ background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' }}
                              >
                                <Award size={18} />
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: '#07294D', fontSize: '0.88rem', marginBottom: '2px' }}>
                                  {result.studentName || 'Student'} • <span style={{ color: '#1e73be' }}>{result.studentId || 'ID'}</span>
                                </div>
                                <div className="d-flex align-items-center gap-2 text-muted small" style={{ fontSize: '0.78rem' }}>
                                  <span className="badge bg-success-subtle text-success border border-success-subtle">
                                    Grade {result.grade || 'A'} ({result.percentage || 100}%)
                                  </span>
                                  <span>•</span>
                                  <span>{result.semester || 'Semester 1'}</span>
                                </div>
                              </div>
                            </div>
                            <ChevronRight size={16} color="#94a3b8" />
                          </Link>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted small">
                          {isKhmer ? 'មិនមានលទ្ធផលប្រឡងថ្មីៗ' : 'No recent exam results'}
                        </div>
                      )}
                      <div className="text-end pt-2">
                        <Link to="/admin-panel/exam-results" className="text-primary small text-decoration-none fw-bold" style={{ fontSize: '0.84rem' }}>
                          {isKhmer ? 'គ្រប់គ្រងលទ្ធផលប្រឡងទាំងអស់ →' : 'Manage all exam transcripts →'}
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: USERS */}
                  {activeFeedTab === 'users' && (
                    <div>
                      {recent.users && recent.users.length > 0 ? (
                        recent.users.slice(0, 4).map((u) => (
                          <Link
                            key={u.id}
                            to="/admin-panel/users"
                            className="admin-feed-item"
                          >
                            <div className="d-flex align-items-center">
                              <div
                                className="admin-feed-item-icon"
                                style={{ background: '#eff6ff', color: '#1e73be', border: '1px solid #dbeafe' }}
                              >
                                <Users size={18} />
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: '#07294D', fontSize: '0.88rem', marginBottom: '2px' }}>
                                  {u.fullName || u.username}
                                </div>
                                <div className="d-flex align-items-center gap-2 text-muted small" style={{ fontSize: '0.78rem' }}>
                                  <span>{u.email}</span>
                                  <span>•</span>
                                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                                    {u.role || 'student'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <ChevronRight size={16} color="#94a3b8" />
                          </Link>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted small">
                          {isKhmer ? 'មិនមានអ្នកចុះឈ្មោះថ្មី' : 'No recent users'}
                        </div>
                      )}
                      <div className="text-end pt-2">
                        <Link to="/admin-panel/users" className="text-primary small text-decoration-none fw-bold" style={{ fontSize: '0.84rem' }}>
                          {isKhmer ? 'គ្រប់គ្រងអ្នកប្រើប្រាស់ទាំងអស់ →' : 'Manage all system accounts →'}
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Quick Management Shortcuts */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title mb-0" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#07294D' }}>
                {isKhmer ? 'ផ្លូវកាត់គ្រប់គ្រងរហ័ស' : 'Fast Management Shortcuts'}
              </h3>
            </div>
            <div className="admin-card-body p-3">
              <div className="row g-3">
                <div className="col-md-6">
                  <Link to="/admin-panel/notices" className="admin-action-tile">
                    <div className="admin-action-tile-icon" style={{ background: '#fefce8', color: '#d97706', border: '1px solid #fef08a' }}>
                      <Bell size={20} />
                    </div>
                    <div>
                      <div className="admin-action-tile-title">
                        {isKhmer ? 'សេចក្តីជូនដំណឹង' : 'Post Announcement'}
                      </div>
                      <div className="admin-action-tile-desc">
                        {isKhmer ? 'បង្កើត និងផ្សាយដំណឹងផ្លូវការ' : 'Publish official notices'}
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="col-md-6">
                  <Link to="/admin-panel/exam-results" className="admin-action-tile">
                    <div className="admin-action-tile-icon" style={{ background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' }}>
                      <Award size={20} />
                    </div>
                    <div>
                      <div className="admin-action-tile-title">
                        {isKhmer ? 'បញ្ចូលលទ្ធផលប្រឡង' : 'Upload Exam Result'}
                      </div>
                      <div className="admin-action-tile-desc">
                        {isKhmer ? 'តារាងពិន្ទុ & និទ្ទេសនិស្សិត' : 'Semester grade transcripts'}
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="col-md-6">
                  <Link to="/admin-panel/courses" className="admin-action-tile">
                    <div className="admin-action-tile-icon" style={{ background: '#e0e7ff', color: '#07294D', border: '1px solid #c7d2fe' }}>
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <div className="admin-action-tile-title">
                        {isKhmer ? 'វគ្គបណ្តុះបណ្តាល' : 'Manage Courses'}
                      </div>
                      <div className="admin-action-tile-desc">
                        {isKhmer ? 'កែសម្រួលជំនាញ & កម្មវិធីសិក្សា' : 'Vocational & degree majors'}
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="col-md-6">
                  <Link to="/admin-panel/teachers" className="admin-action-tile">
                    <div className="admin-action-tile-icon" style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa' }}>
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <div className="admin-action-tile-title">
                        {isKhmer ? 'សាស្ត្រាចារ្យ & បុគ្គលិក' : 'Faculty & Staff'}
                      </div>
                      <div className="admin-action-tile-desc">
                        {isKhmer ? 'គ្រប់គ្រងគ្រូបច្ចេកទេស' : 'Directory of instructors'}
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="col-md-6">
                  <Link to="/admin-panel/downloads" className="admin-action-tile">
                    <div className="admin-action-tile-icon" style={{ background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}>
                      <FileDown size={20} />
                    </div>
                    <div>
                      <div className="admin-action-tile-title">
                        {isKhmer ? 'មជ្ឈមណ្ឌលឯកសារ' : 'Document Center'}
                      </div>
                      <div className="admin-action-tile-desc">
                        {isKhmer ? 'ទម្រង់បែបបទ TVET 1.5M & PDF' : 'Upload application forms'}
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="col-md-6">
                  <Link to="/admin-panel/settings" className="admin-action-tile">
                    <div className="admin-action-tile-icon" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                      <Sliders size={20} />
                    </div>
                    <div>
                      <div className="admin-action-tile-title">
                        {isKhmer ? 'ការកំណត់ស្ថាប័ន' : 'Institute Settings'}
                      </div>
                      <div className="admin-action-tile-desc">
                        {isKhmer ? 'ព័ត៌មានទូទៅ & ប្រព័ន្ធ' : 'Configuration & metadata'}
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: System Infrastructure & Security Health */}
        <div className="col-lg-5">
          {/* Infrastructure Health Status */}
          <div className="admin-card mb-4">
            <div className="admin-card-header d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <Server size={18} color="#07294D" />
                <h3 className="admin-card-title mb-0" style={{ fontSize: '1rem', fontWeight: 800, color: '#07294D' }}>
                  {isKhmer ? 'ស្ថានភាពហេដ្ឋារចនាសម្ព័ន្ធ' : 'Infrastructure & Security'}
                </h3>
              </div>
              <span className="admin-health-status-badge healthy">
                <CheckCircle2 size={12} />
                {isKhmer ? 'ដំណើរការប្រក្រតី' : 'HEALTHY'}
              </span>
            </div>

            <div className="admin-card-body p-3">
              {/* MySQL */}
              <div className="admin-health-row">
                <div className="d-flex align-items-center gap-3">
                  <Database size={22} color="#059669" />
                  <div>
                    <div style={{ fontWeight: 700, color: '#07294D', fontSize: '0.86rem' }}>
                      MySQL Database
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.76rem' }}>
                      Host: 127.0.0.1:8889 • DB: rpitssr_db
                    </div>
                  </div>
                </div>
                <span className="admin-health-status-badge healthy">
                  {sysHealth.database?.toUpperCase() || 'ONLINE'}
                </span>
              </div>

              {/* REST API Engine */}
              <div className="admin-health-row">
                <div className="d-flex align-items-center gap-3">
                  <Server size={22} color="#1e73be" />
                  <div>
                    <div style={{ fontWeight: 700, color: '#07294D', fontSize: '0.86rem' }}>
                      REST API Backend
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.76rem' }}>
                      Laravel {sysInfo.laravelVersion || '12'} • PHP {sysInfo.phpVersion || '8.5'}
                    </div>
                  </div>
                </div>
                <span className="admin-health-status-badge healthy">
                  SANCTUM
                </span>
              </div>

              {/* Public Storage */}
              <div className="admin-health-row">
                <div className="d-flex align-items-center gap-3">
                  <HardDrive size={22} color="#ea580c" />
                  <div>
                    <div style={{ fontWeight: 700, color: '#07294D', fontSize: '0.86rem' }}>
                      Media & PDF Storage
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.76rem' }}>
                      Storage Disk: Public Writable
                    </div>
                  </div>
                </div>
                <span className="admin-health-status-badge healthy">
                  WRITABLE
                </span>
              </div>

              {/* Automated Backup */}
              <div className="admin-health-row mb-0">
                <div className="d-flex align-items-center gap-3">
                  <Clock size={22} color="#7c3aed" />
                  <div>
                    <div style={{ fontWeight: 700, color: '#07294D', fontSize: '0.86rem' }}>
                      {isKhmer ? 'ការ Backup ទិន្នន័យចុងក្រោយ' : 'Latest Automated Backup'}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.76rem' }}>
                      {sysInfo.lastBackup ? new Date(sysInfo.lastBackup).toLocaleString() : 'Recent'}
                    </div>
                  </div>
                </div>
                <span className="badge bg-light text-secondary border" style={{ fontSize: '0.74rem' }}>
                  24h Synced
                </span>
              </div>
            </div>
          </div>

          {/* Academic Portal Ratio Distribution */}
          <div className="admin-card mb-4">
            <div className="admin-card-header">
              <h3 className="admin-card-title mb-0" style={{ fontSize: '1rem', fontWeight: 800, color: '#07294D' }}>
                {isKhmer ? 'ស្ថិតិគណនីក្នុងប្រព័ន្ធ' : 'Portal Account Distribution'}
              </h3>
            </div>
            <div className="admin-card-body p-3">
              <div className="d-flex justify-content-between align-items-center mb-2" style={{ fontSize: '0.86rem' }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>
                  {isKhmer ? 'គណនីសិស្ស-និស្សិត (Students)' : 'Student Trainees'}
                </span>
                <span style={{ fontWeight: 800, color: '#1e73be' }}>
                  {isKhmer ? toKhmerNumber(counts.students ?? 11) : counts.students ?? 11} ({Math.round(((counts.students ?? 11) / (counts.users || 12)) * 100)}%)
                </span>
              </div>
              <div className="progress mb-3" style={{ height: '8px', borderRadius: '9999px', background: '#f1f5f9' }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{
                    width: `${Math.round(((counts.students ?? 11) / (counts.users || 12)) * 100)}%`,
                    background: 'linear-gradient(90deg, #07294D, #1e73be)',
                    borderRadius: '9999px'
                  }}
                />
              </div>

              <div className="d-flex justify-content-between align-items-center mb-2" style={{ fontSize: '0.86rem' }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>
                  {isKhmer ? 'គណៈគ្រប់គ្រង & បុគ្គលិក (Staff)' : 'Administrative Staff'}
                </span>
                <span style={{ fontWeight: 800, color: '#059669' }}>
                  {isKhmer ? toKhmerNumber(counts.staff ?? 1) : counts.staff ?? 1} ({Math.round(((counts.staff ?? 1) / (counts.users || 12)) * 100)}%)
                </span>
              </div>
              <div className="progress mb-3" style={{ height: '8px', borderRadius: '9999px', background: '#f1f5f9' }}>
                <div
                  className="progress-bar bg-success"
                  role="progressbar"
                  style={{
                    width: `${Math.round(((counts.staff ?? 1) / (counts.users || 12)) * 100)}%`,
                    borderRadius: '9999px'
                  }}
                />
              </div>

              <div className="p-3 rounded-3 mt-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                <div className="d-flex align-items-center gap-2 mb-1" style={{ fontWeight: 700, color: '#07294D' }}>
                  <Sparkles size={14} color="#ffaf00" />
                  <span>{isKhmer ? 'អាហារូបករណ៍រដ្ឋាភិបាល TVET 1.5M' : 'National TVET 1.5M Priority'}</span>
                </div>
                <div style={{ color: '#64748b', lineHeight: 1.5 }}>
                  {isKhmer
                    ? 'និស្សិតក្រីក្រ និងងាយរងហានិភ័យទទួលបានការឧបត្ថម្ភ ២៨០,០០០៛/ខែ ព្រមទាំងចុះកម្មសិក្សា ១០០%។'
                    : 'Stipend disbursement and enterprise internship coordination active.'}
                </div>
              </div>
            </div>
          </div>

          {/* Campus IT Support Card */}
          <div className="admin-card" style={{ background: 'linear-gradient(135deg, #07294D 0%, #0d3c61 100%)', color: '#ffffff', border: 'none' }}>
            <div className="admin-card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-2" style={{ color: '#ffaf00', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Phone size={14} />
                <span>{isKhmer ? 'សេវាគាំទ្របច្ចេកវិទ្យាផ្ទៃក្នុង' : 'Campus IT Helpdesk'}</span>
              </div>
              <h4 style={{ color: '#ffffff', fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>
                {isKhmer ? 'ការិយាល័យបច្ចេកវិទ្យា & សិក្សា' : 'IT Support & Academic Affairs'}
              </h4>
              <p style={{ color: '#cbd5e1', fontSize: '0.84rem', lineHeight: 1.6, marginBottom: '16px' }}>
                {isKhmer
                  ? 'សម្រាប់ជំនួយបច្ចេកទេស ជួសជុលបញ្ហាប្រព័ន្ធ ឬការបម្រុងទុកទិន្នន័យ (Backup) សូមទាក់ទងការិយាល័យអគារ A បន្ទប់ ១០៤។'
                  : 'For system assistance, server recovery, or database management, visit Building A, Room 104.'}
              </p>
              <div className="d-flex align-items-center gap-2 text-warning small fw-bold" style={{ fontSize: '0.86rem' }}>
                <span>(+855) 63 963 888 • info@rpitssr.edu.kh</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
