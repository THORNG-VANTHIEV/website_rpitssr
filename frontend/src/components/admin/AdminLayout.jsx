import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import '../../styles/admin.css';
import {
  LayoutDashboard,
  ExternalLink,
  Users,
  GraduationCap,
  BookOpen,
  FolderTree,
  Award,
  Calendar,
  Image,
  Video,
  Bell,
  Sliders,
  Tag,
  Library,
  BookmarkCheck,
  Newspaper,
  MessageSquare,
  HelpCircle,
  Settings,
  BarChart3,
  Database,
  FileText,
  FileDown,
  Boxes,
  Menu,
  X,
  LogOut,
  ChevronRight
} from 'lucide-react';

export const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { user, logout } = useAuth();
  const { currentLanguage } = useLanguage();
  const isKhmer = currentLanguage === 'km';

  const location = useLocation();
  const navigate = useNavigate();

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setShowLogoutConfirm(false);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const directItems = [
    { path: '/admin-panel', label: isKhmer ? 'ផ្ទាំងព័ត៌មាន' : 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/', label: isKhmer ? 'ទៅកាន់គេហទំព័រ' : 'Go to Frontend', icon: ExternalLink, isExternal: true },
  ];

  const navGroups = [
    {
      id: 'academics',
      title: isKhmer ? 'ការសិក្សា & អ្នកប្រើប្រាស់' : 'Academics & Users',
      icon: GraduationCap,
      items: [
        { path: '/admin-panel/users', label: isKhmer ? 'អ្នកប្រើប្រាស់' : 'Users', icon: Users },
        { path: '/admin-panel/teachers', label: isKhmer ? 'សាស្ត្រាចារ្យ & បុគ្គលិក' : 'Teachers', icon: GraduationCap },
        { path: '/admin-panel/courses', label: isKhmer ? 'វគ្គបណ្តុះបណ្តាល' : 'Courses', icon: BookOpen },
        { path: '/admin-panel/course-categories', label: isKhmer ? 'ប្រភេទវគ្គសិក្សា' : 'Course Categories', icon: FolderTree },
        { path: '/admin-panel/exam-results', label: isKhmer ? 'លទ្ធផលប្រឡង' : 'Exam Results', icon: Award },
      ]
    },
    {
      id: 'content',
      title: isKhmer ? 'ការគ្រប់គ្រងមាតិកា' : 'Content Management',
      icon: Calendar,
      items: [
        { path: '/admin-panel/events', label: isKhmer ? 'ព្រឹត្តិការណ៍' : 'Events', icon: Calendar },
        { path: '/admin-panel/event-categories', label: isKhmer ? 'ប្រភេទព្រឹត្តិការណ៍' : 'Event Categories', icon: FolderTree },
        { path: '/admin-panel/gallery-images', label: isKhmer ? 'វិចិត្រសាលរូបភាព' : 'Gallery', icon: Image },
        { path: '/admin-panel/videos', label: isKhmer ? 'វីដេអូផ្សព្វផ្សាយ' : 'Promotional Videos', icon: Video },
        { path: '/admin-panel/notices', label: isKhmer ? 'សេចក្តីជូនដំណឹង' : 'Notices', icon: Bell },
        { path: '/admin-panel/downloads', label: isKhmer ? 'ឯកសារទាញយក / ទម្រង់បែបបទ' : 'Downloads / Forms', icon: FileDown },
        { path: '/admin-panel/scrolling-banners', label: isKhmer ? 'បដាអក្សររត់' : 'Scrolling Banners', icon: Sliders },
        { path: '/admin-panel/promotions', label: isKhmer ? 'ការផ្សព្វផ្សាយពិសេស' : 'Promotions', icon: Tag },
      ]
    },
    {
      id: 'library',
      title: isKhmer ? 'ការគ្រប់គ្រងបណ្ណាល័យ' : 'Library Management',
      icon: Library,
      items: [
        { path: '/admin-panel/library', label: isKhmer ? 'គ្រប់គ្រងសៀវភៅ' : 'Manage Books', icon: Library },
        { path: '/admin-panel/library-categories', label: isKhmer ? 'ប្រភេទសៀវភៅ' : 'Book Categories', icon: FolderTree },
        { path: '/admin-panel/borrowings', label: isKhmer ? 'ការខ្ចី-សងសៀវភៅ' : 'Manage Borrowings', icon: BookmarkCheck },
      ]
    },
    {
      id: 'blog',
      title: isKhmer ? 'ព័ត៌មាន & ប្លុក' : 'Blog & Engagement',
      icon: Newspaper,
      items: [
        { path: '/admin-panel/blog-posts', label: isKhmer ? 'អត្ថបទព័ត៌មាន' : 'Blog Posts', icon: Newspaper },
        { path: '/admin-panel/blog-categories', label: isKhmer ? 'ប្រភេទព័ត៌មាន' : 'Blog Categories', icon: FolderTree },
        { path: '/admin-panel/comments', label: isKhmer ? 'មតិយោបល់' : 'Comments', icon: MessageSquare },
        { path: '/admin-panel/faqs', label: isKhmer ? 'សំណួរញឹកញាប់' : 'FAQs', icon: HelpCircle },
      ]
    },
    {
      id: 'system',
      title: isKhmer ? 'គេហទំព័រ & ប្រព័ន្ធ' : 'Website & System',
      icon: Settings,
      items: [
        { path: '/admin-panel/settings', label: isKhmer ? 'ការកំណត់ទូទៅ' : 'Settings', icon: Settings },
        { path: '/admin-panel/reports', label: isKhmer ? 'របាយការណ៍' : 'Reports', icon: BarChart3 },
        { path: '/admin-panel/backups', label: isKhmer ? 'ការបម្រុងទុក (Backups)' : 'Backups', icon: Database },
        { path: '/admin-panel/logs', label: isKhmer ? 'កំណត់ត្រាប្រព័ន្ធ (Logs)' : 'System Logs', icon: FileText },
        { path: '/admin-panel/plugins', label: isKhmer ? 'កម្មវិធីជំនួយ (Plugins)' : 'Plugins', icon: Boxes },
      ]
    }
  ];

  // Initialize open groups based on current URL path
  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {};
    navGroups.forEach(group => {
      if (group.items.some(item => item.path === location.pathname)) {
        initial[group.id] = true;
      }
    });
    return initial;
  });

  // Whenever path changes, auto-open the group containing the active page
  useEffect(() => {
    navGroups.forEach(group => {
      if (group.items.some(item => item.path === location.pathname)) {
        setOpenGroups(prev => ({ ...prev, [group.id]: true }));
      }
    });
  }, [location.pathname]);

  const toggleGroup = (groupId) => {
    if (collapsed) {
      setCollapsed(false);
      setOpenGroups(prev => ({ ...prev, [groupId]: true }));
      return;
    }
    setOpenGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Helper to determine current breadcrumb title
  const getCurrentPageTitle = () => {
    for (const item of directItems) {
      if (!item.isExternal && location.pathname === item.path) {
        return item.label;
      }
    }
    for (const group of navGroups) {
      for (const item of group.items) {
        if (!item.isExternal && location.pathname === item.path) {
          return item.label;
        }
      }
    }
    return 'Admin Panel';
  };

  return (
    <div className="admin-wrapper">
      {/* Sidebar Overlay for Mobile */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-header">
          <img src="/images/logo.png" alt="RPITSSR Logo" className="admin-sidebar-logo" />
          {!collapsed && <span className="admin-sidebar-title">RPITSSR ADMIN</span>}
        </div>

        <nav className="admin-sidebar-nav">
          {/* Direct Top-Level Links */}
          <div className="admin-nav-section">
            {!collapsed && <div className="admin-nav-group-title">{isKhmer ? 'ទិដ្ឋភាពទូទៅ' : 'Overview'}</div>}
            {directItems.map((item, itemIdx) => {
              const Icon = item.icon;
              if (item.isExternal) {
                return (
                  <Link
                    key={itemIdx}
                    to={item.path}
                    className="admin-nav-item"
                    title={collapsed ? item.label : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className="admin-nav-icon" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              }

              return (
                <NavLink
                  key={itemIdx}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                  title={collapsed ? item.label : undefined}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon className="admin-nav-icon" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </div>

          {/* Collapsible Dropdown Groups */}
          <div className="admin-nav-section">
            {!collapsed && <div className="admin-nav-group-title">{isKhmer ? 'ការគ្រប់គ្រង' : 'Management'}</div>}
            {navGroups.map((group) => {
              const GroupIcon = group.icon;
              const isOpen = !!openGroups[group.id];
              const isGroupActive = group.items.some(item => item.path === location.pathname);

              return (
                <div key={group.id} className="admin-nav-dropdown-group">
                  <button
                    type="button"
                    className={`admin-nav-group-header ${isGroupActive ? 'has-active' : ''} ${isOpen ? 'expanded' : ''}`}
                    onClick={() => toggleGroup(group.id)}
                    title={collapsed ? group.title : undefined}
                    aria-expanded={isOpen}
                  >
                    <div className="admin-nav-group-header-left">
                      <GroupIcon className="admin-nav-icon" />
                      {!collapsed && <span className="admin-nav-group-title-text">{group.title}</span>}
                    </div>

                    {!collapsed && (
                      <div className="admin-nav-group-header-right">
                        <span className="admin-nav-group-badge">{group.items.length}</span>
                        <ChevronRight className={`admin-nav-chevron ${isOpen ? 'open' : ''}`} />
                      </div>
                    )}
                  </button>

                  {/* Submenu items list */}
                  {!collapsed && isOpen && (
                    <div className="admin-nav-subitems">
                      {group.items.map((item, itemIdx) => {
                        const ItemIcon = item.icon;
                        return (
                          <NavLink
                            key={itemIdx}
                            to={item.path}
                            className={({ isActive }) => `admin-nav-subitem ${isActive ? 'active' : ''}`}
                            onClick={() => setMobileOpen(false)}
                          >
                            <ItemIcon className="admin-nav-subicon" />
                            <span>{item.label}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main Container */}
      <div className={`admin-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-toggle-btn"
              onClick={() => {
                if (window.innerWidth < 992) {
                  setMobileOpen(!mobileOpen);
                } else {
                  setCollapsed(!collapsed);
                }
              }}
              aria-label="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>
            <div className="admin-breadcrumb">
              <span>{getCurrentPageTitle()}</span>
            </div>
          </div>

          <div className="admin-topbar-right">
            <LanguageSwitcher variant="admin" size="sm" />

            <div className="admin-topbar-divider" />

            <div className="admin-user-card" title={user?.email || 'admin@rpitssr.edu.kh'}>
              <div className="admin-avatar-wrap">
                <div className="admin-avatar">
                  {(user?.fullName || user?.username || 'A').charAt(0).toUpperCase()}
                </div>
                <span
                  className="admin-status-dot"
                  title={isKhmer ? 'ស្ថានភាព៖ សកម្ម (Online)' : 'Status: Active (Online)'}
                />
              </div>
              <div className="admin-user-info">
                <span className="admin-user-name">
                  {user?.fullName === 'System Administrator' || !user?.fullName
                    ? (isKhmer ? 'អ្នកគ្រប់គ្រងប្រព័ន្ធ' : 'System Administrator')
                    : user.fullName}
                </span>
                <span className="admin-user-role">
                  <span className="admin-role-status">●</span>
                  <span>{isKhmer ? 'កំពុងដំណើរការ' : 'Online'}</span>
                  <span className="admin-role-sep">•</span>
                  <span className="admin-role-badge">Super Admin</span>
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="admin-logout-btn"
              title={isKhmer ? 'ចាកចេញពីផ្ទាំងគ្រប់គ្រង' : 'Logout from Admin Panel'}
            >
              <LogOut size={15} style={{ strokeWidth: 2.2 }} />
              <span>{isKhmer ? 'ចាកចេញ' : 'Logout'}</span>
            </button>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Dialog Modal */}
      {showLogoutConfirm && (
        <div
          className="admin-modal-backdrop"
          onClick={() => !isLoggingOut && setShowLogoutConfirm(false)}
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
            className="admin-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              animation: 'scaleUp 0.15s ease-out',
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
                តើអ្នកពិតជាចង់ចាកចេញពីផ្ទាំងគ្រប់គ្រង RPITSSR Admin មែនទេ?
                <br />
                <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  Are you sure you want to sign out from your admin session?
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
                className="admin-btn admin-btn-outline"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={isLoggingOut}
                style={{ minWidth: '95px' }}
              >
                {isKhmer ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                style={{
                  minWidth: '130px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <LogOut size={15} />
                <span>{isLoggingOut ? (isKhmer ? 'កំពុងចាកចេញ...' : 'Signing out...') : (isKhmer ? 'ចាកចេញឥឡូវនេះ' : 'Sign Out Now')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
