import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/layout/Navbar';
import { BannerTicker } from './components/layout/BannerTicker';
import { Footer } from './components/layout/Footer';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { ScrollToTop } from './components/common/ScrollToTop';
import { WebsiteGuideModal } from './components/common/WebsiteGuideModal';

// Public Pages
import { HomePage } from './pages/HomePage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { BlogPage } from './pages/BlogPage';
import { BlogDetailPage } from './pages/BlogDetailPage';
import { EventsPage } from './pages/EventsPage';
import { TeachersPage } from './pages/TeachersPage';
import { ExamResultsPage } from './pages/ExamResultsPage';
import { FaqPage } from './pages/FaqPage';
import { GalleryPage } from './pages/GalleryPage';
import { NoticePage } from './pages/NoticePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { OrganizationPage } from './pages/OrganizationPage';
import { DownloadPage } from './pages/DownloadPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdmissionApplyPage } from './pages/AdmissionApplyPage';

// Admin Shell & Pages
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminAdmissionsPage } from './pages/admin/AdminAdmissionsPage';
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage';
import { AdminCourseCategoriesPage } from './pages/admin/AdminCourseCategoriesPage';
import { AdminTeachersPage } from './pages/admin/AdminTeachersPage';
import { AdminExamResultsPage } from './pages/admin/AdminExamResultsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminEventsPage } from './pages/admin/AdminEventsPage';
import { AdminEventCategoriesPage } from './pages/admin/AdminEventCategoriesPage';
import { AdminGalleryPage } from './pages/admin/AdminGalleryPage';
import { AdminNoticesPage } from './pages/admin/AdminNoticesPage';
import { AdminDownloadsPage } from './pages/admin/AdminDownloadsPage';
import { AdminBannersPage } from './pages/admin/AdminBannersPage';
import { AdminPromotionsPage } from './pages/admin/AdminPromotionsPage';
import { AdminPromotionalVideosPage } from './pages/admin/AdminPromotionalVideosPage';
import { AdminLibraryPage } from './pages/admin/AdminLibraryPage';
import { AdminBooksPage } from './pages/admin/AdminBooksPage';
import { AdminBlogPostsPage } from './pages/admin/AdminBlogPostsPage';
import { AdminBlogCategoriesPage } from './pages/admin/AdminBlogCategoriesPage';
import { AdminCommentsPage } from './pages/admin/AdminCommentsPage';
import { AdminFaqsPage } from './pages/admin/AdminFaqsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminBackupsPage } from './pages/admin/AdminBackupsPage';
import { AdminLogsPage } from './pages/admin/AdminLogsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminPluginsPage } from './pages/admin/AdminPluginsPage';

// Student Portal
import { StudentRoute } from './components/auth/StudentRoute';
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';

// Layout wrapper for Public Pages (with Public Navbar, Ticker & Footer)
const PublicLayout = () => {
  const location = useLocation();

  return (
    <div className="super_container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <BannerTicker />
      <main key={location.pathname} className="rpitssr-page-transition" style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
      <WebsiteGuideModal />
    </div>
  );
};

// Route Guard for Admin Panel
const ProtectedAdminRoute = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Authenticating administrator access..." />;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout />;
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* =========================================================
                PUBLIC WEBSITE ROUTES
                ========================================================= */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/our-courses" element={<CoursesPage />} />
              <Route path="/courses/:id" element={<CourseDetailPage />} />
              <Route path="/courses-details/:id" element={<CourseDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/about-us" element={<AboutPage />} />
              <Route path="/organization" element={<OrganizationPage />} />
              <Route path="/leadership" element={<OrganizationPage />} />
              <Route path="/org-chart" element={<OrganizationPage />} />
              <Route path="/downloads" element={<DownloadPage />} />
              <Route path="/download-center" element={<DownloadPage />} />
              <Route path="/forms" element={<DownloadPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogDetailPage />} />
              <Route path="/blog-details/:id" element={<BlogDetailPage />} />
              <Route path="/teachers" element={<TeachersPage />} />
              <Route path="/teacher-details/:id" element={<TeachersPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/event-details/:id" element={<EventsPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/contact-us" element={<ContactPage />} />
              <Route path="/notice" element={<NoticePage />} />
              <Route path="/notices" element={<NoticePage />} />
              <Route path="/exam-result" element={<ExamResultsPage />} />
              <Route path="/exam-results" element={<ExamResultsPage />} />
              <Route path="/apply" element={<AdmissionApplyPage />} />
              <Route path="/admission" element={<AdmissionApplyPage />} />
              <Route path="/admission-apply" element={<AdmissionApplyPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* =========================================================
                COMPREHENSIVE ADMIN PANEL ROUTES (/admin-panel/*)
                ========================================================= */}
            <Route path="/admin-panel" element={<ProtectedAdminRoute />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="admissions" element={<AdminAdmissionsPage />} />
              <Route path="admission-applications" element={<AdminAdmissionsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="teachers" element={<AdminTeachersPage />} />
              <Route path="courses" element={<AdminCoursesPage />} />
              <Route path="course-categories" element={<AdminCourseCategoriesPage />} />
              <Route path="exam-results" element={<AdminExamResultsPage />} />
              <Route path="events" element={<AdminEventsPage />} />
              <Route path="event-categories" element={<AdminEventCategoriesPage />} />
              <Route path="gallery-images" element={<AdminGalleryPage />} />
              <Route path="videos" element={<AdminPromotionalVideosPage />} />
              <Route path="promotional-videos" element={<AdminPromotionalVideosPage />} />
              <Route path="notices" element={<AdminNoticesPage />} />
              <Route path="downloads" element={<AdminDownloadsPage />} />
              <Route path="scrolling-banners" element={<AdminBannersPage />} />
              <Route path="promotions" element={<AdminPromotionsPage />} />
              <Route path="special-broadcasts" element={<AdminPromotionsPage />} />
              <Route path="books" element={<AdminBooksPage />} />
              <Route path="library-books" element={<AdminBooksPage />} />
              <Route path="library" element={<AdminLibraryPage />} />
              <Route path="library-categories" element={<AdminLibraryPage />} />
              <Route path="borrowings" element={<AdminLibraryPage />} />
              <Route path="blog-posts" element={<AdminBlogPostsPage />} />
              <Route path="blog-categories" element={<AdminBlogCategoriesPage />} />
              <Route path="comments" element={<AdminCommentsPage />} />
              <Route path="faqs" element={<AdminFaqsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="backups" element={<AdminBackupsPage />} />
              <Route path="logs" element={<AdminLogsPage />} />
              <Route path="plugins" element={<AdminPluginsPage />} />
            </Route>

            {/* Legacy Admin Redirects */}
            <Route path="/admin" element={<Navigate to="/admin-panel" replace />} />
            <Route path="/admin/dashboard" element={<Navigate to="/admin-panel" replace />} />
            {/* Student Dashboard Portal */}
            <Route path="/student-dashboard" element={<StudentRoute><StudentDashboardPage /></StudentRoute>} />
            <Route path="/student-dashboard/*" element={<StudentRoute><StudentDashboardPage /></StudentRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
