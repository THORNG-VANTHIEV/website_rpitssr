import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Award,
  FileText,
  Phone,
  ArrowRight,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  X,
  UserCheck,
  Sparkles,
  Clock
} from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout, user, isAuthenticated } = useAuth();
  const { t, currentLanguage, language } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && isAuthenticated && user) {
      const role = user?.role;
      if (role === 'admin' || role === 'sub_admin') {
        navigate('/admin-panel');
      } else if (role === 'student') {
        navigate('/student-dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError(
        isKhmer
          ? 'សូមបញ្ចូលទាំងអាសយដ្ឋានអ៊ីមែល និងពាក្យសម្ងាត់'
          : 'Please enter both email address and password.'
      );
      return;
    }

    setLoading(true);
    setError('');
    setIsPendingApproval(false);

    try {
      localStorage.removeItem('token');
      const data = await login({ email, password });
      const role = data?.user?.role;
      if (role === 'admin' || role === 'sub_admin') {
        navigate('/admin-panel');
      } else if (role === 'student') {
        navigate('/student-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      localStorage.removeItem('token');
      if (err.response?.data?.status === 'pending') {
        setIsPendingApproval(true);
      } else {
        setIsPendingApproval(false);
      }

      let msg = isKhmer ? 'ការចូលគណនីមិនបានជោគជ័យ ៖ ' : 'Sign-in failed: ';
      if (err.response?.data) {
        const d = err.response.data;
        if (typeof d === 'object' && d.msg) msg += d.msg;
        else if (typeof d === 'object' && d.error) msg += d.error;
        else if (typeof d === 'object' && d.message) msg += d.message;
        else if (typeof d === 'string') msg += d;
        else msg += isKhmer ? 'អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ' : 'Invalid email or password';
      } else if (err.request) {
        msg += isKhmer
          ? 'បញ្ហាតភ្ជាប់បណ្តាញ។ សូមពិនិត្យអ៊ីនធឺណិតរបស់អ្នកហើយព្យាយាមម្តងទៀត។'
          : 'Network error. Please check your internet connection.';
      } else {
        msg += err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-root" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* =========================================================================
          1. DAYLIGHT INSTITUTIONAL HERO (Strictly AGENTS.md Standard)
          ========================================================================= */}
      <section className="auth-page-hero">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-10">
              {/* Breadcrumb */}
              <div className="auth-breadcrumb">
                <Link to="/">{isKhmer ? 'ទំព័រដើម' : 'Home'}</Link>
                <ChevronRight size={14} />
                <span>{isKhmer ? 'ច្រកចូលគណនីប្រព័ន្ធ' : 'Portal Sign-In'}</span>
              </div>

              {/* Institutional Hero Badge */}
              <div>
                <span className="auth-hero-badge">
                  <ShieldCheck size={16} />
                  {isKhmer
                    ? 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប • RPITSSR'
                    : 'Regional Polytechnic Institute Techo Sen Siem Reap'}
                </span>
              </div>

              {/* Title */}
              <h1 className="auth-hero-title">
                {isKhmer ? 'ច្រកចូលគណនីស្ថាប័នផ្លូវការ RPITSSR' : 'Official Institutional Sign-In Portal'}
              </h1>

              {/* Subtitle */}
              <p className="auth-hero-subtitle">
                {isKhmer
                  ? 'ចូលប្រើប្រាស់ប្រព័ន្ធគ្រប់គ្រងការសិក្សា (LMS) ការត្រួតពិនិត្យលទ្ធផលប្រឡង កាលវិភាគ និងផ្ទាំងគ្រប់គ្រងរដ្ឋបាលសម្រាប់សិស្ស-និស្សិត សាស្ត្រាចារ្យ និងបុគ្គលិក។'
                  : 'Access the unified institutional learning portal (LMS), examination transcripts, semester schedules, and administrative management services.'}
              </p>

              {/* Trust & Security Badges */}
              <div className="auth-trust-badges">
                <span className="auth-trust-pill">
                  <ShieldCheck size={14} color="#059669" />
                  {isKhmer ? 'សុវត្ថិភាព 256-bit SSL' : '256-bit SSL Encryption'}
                </span>
                <span className="auth-trust-pill">
                  <GraduationCap size={14} color="#1e73be" />
                  {isKhmer ? 'គណនីនិស្សិត & សាស្ត្រាចារ្យ' : 'Student & Faculty Access'}
                </span>
                <span className="auth-trust-pill">
                  <CheckCircle2 size={14} color="#d97706" />
                  {isKhmer ? 'ផ្ទៀងផ្ទាត់ទិន្នន័យផ្លូវការ' : 'Verified Authentication'}
                </span>
                <span className="auth-trust-pill">
                  <Sparkles size={14} color="#7c3aed" />
                  {isKhmer ? 'ដំណើរការ ២៤/៧ រហ័ស' : '24/7 Portal Availability'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. SPLIT INSTITUTIONAL AUTHENTICATION CARD
          ========================================================================= */}
      <div className="container">
        <div className="auth-split-wrapper">
          <div className="row g-0">
            {/* Left Column: Brand & Features Sidebar */}
            <div className="col-lg-5 d-none d-lg-block">
              <div className="auth-brand-sidebar h-100">
                <div>
                  <img
                    src="/images/logo/logo.webp"
                    alt="RPITSSR Institutional Logo"
                    className="auth-sidebar-logo"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div style={{ color: '#ffaf00', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {isKhmer ? 'ព្រះរាជាណាចក្រកម្ពុជា' : 'KINGDOM OF CAMBODIA'}
                  </div>
                  <h3 style={{ color: '#ffffff', fontSize: '1.35rem', fontWeight: 800, lineHeight: 1.35, margin: '6px 0 12px' }}>
                    {isKhmer
                      ? 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប'
                      : 'Regional Polytechnic Institute Techo Sen Siem Reap'}
                  </h3>
                  <p style={{ color: '#cbd5e1', fontSize: '0.86rem', lineHeight: 1.6 }}>
                    {isKhmer
                      ? 'បណ្តុះបណ្តាលជំនាញបច្ចេកទេស និងវិជ្ជាជីវៈកម្រិតជាតិ ប្រកបដោយគុណភាព សមត្ថភាព និងឧត្តមភាពការងារ។'
                      : 'Fostering premier vocational engineering, technical innovation, and digital education standards.'}
                  </p>
                </div>

                {/* Feature Highlights */}
                <div className="auth-sidebar-features">
                  <div className="auth-sidebar-feature-item">
                    <div className="auth-sidebar-feature-icon">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#ffffff' }}>
                        {isKhmer ? 'ប្រព័ន្ធគ្រប់គ្រងការសិក្សា (LMS)' : 'E-Learning & Timetables'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                        {isKhmer ? 'មេរៀន ឯកសារ និងកាលវិភាគ' : 'Syllabus, lectures, and calendars'}
                      </div>
                    </div>
                  </div>

                  <div className="auth-sidebar-feature-item">
                    <div className="auth-sidebar-feature-icon">
                      <Award size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#ffffff' }}>
                        {isKhmer ? 'តារាងពិន្ទុ & លទ្ធផលប្រឡង' : 'Exam Results & GPA'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                        {isKhmer ? 'ផ្ទៀងផ្ទាត់និទ្ទេសផ្ទាល់ខ្លួន' : 'Official student transcripts'}
                      </div>
                    </div>
                  </div>

                  <div className="auth-sidebar-feature-item">
                    <div className="auth-sidebar-feature-icon">
                      <FileText size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#ffffff' }}>
                        {isKhmer ? 'អាហារូបករណ៍ TVET 1.5M' : 'National TVET Scholarships'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                        {isKhmer ? 'ប្រាក់ឧបត្ថម្ភ និងការអនុវត្ត' : 'Stipends & enterprise placement'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar Support Footer */}
                <div className="auth-sidebar-support">
                  <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                    {isKhmer ? 'ការគាំទ្របច្ចេកវិទ្យាព័ត៌មាន (IT Support)' : 'IT Portal Support Desk'}
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Phone size={13} color="#ffaf00" />
                    <span>(+855) 63 963 888 • info@rpitssr.edu.kh</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Authentication Form */}
            <div className="col-lg-7 col-md-12">
              <div className="auth-form-container">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1" style={{ fontSize: '0.76rem', fontWeight: 700 }}>
                    {isKhmer ? 'ច្រកចូលសុវត្ថិភាព' : 'Secure Login'}
                  </span>
                  <Link to="/" className="text-muted small text-decoration-none" style={{ fontSize: '0.84rem' }}>
                    ← {isKhmer ? 'ត្រលប់ទៅទំព័រដើម' : 'Back to Home'}
                  </Link>
                </div>

                <h2 className="auth-form-title">
                  {isKhmer ? 'សូមស្វាគមន៍មកកាន់ RPITSSR' : 'Welcome to RPITSSR'}
                </h2>
                <p className="auth-form-subtitle">
                  {isKhmer
                    ? 'សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែល និងពាក្យសម្ងាត់របស់អ្នកដើម្បីចូលប្រើប្រាស់គណនី'
                    : 'Enter your institutional email and password to access your dashboard.'}
                </p>

                {location.state?.passwordChanged && (
                  <div className="alert alert-success rounded-3 mb-4" role="status">
                    {isKhmer
                      ? 'ពាក្យសម្ងាត់ត្រូវបានផ្លាស់ប្តូរ ហើយគ្រប់ឧបករណ៍ត្រូវបានចាកចេញ។ សូមចូលគណនីម្តងទៀត។'
                      : 'Your password has changed and all devices have been signed out. Please sign in again.'}
                  </div>
                )}

                {isPendingApproval ? (
                  <div
                    className="d-flex align-items-start gap-3 p-3 rounded-3 mb-4"
                    style={{
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      color: '#92400e',
                      fontSize: '0.88rem',
                      lineHeight: 1.55
                    }}
                  >
                    <Clock size={22} className="flex-shrink-0 mt-1" style={{ color: '#d97706' }} />
                    <div>
                      <strong style={{ color: '#78350f', display: 'block', marginBottom: '2px' }}>
                        {isKhmer ? 'គណនីកំពុងរង់ចាំការអនុម័ត (Pending Admin Approval)' : 'Account Pending Admin Approval'}
                      </strong>
                      {isKhmer
                        ? 'គណនីរបស់អ្នកត្រូវបានកត់ត្រាក្នុងប្រព័ន្ធរួចរាល់ហើយ ប៉ុន្តែកំពុងស្ថិតក្នុងដំណាក់កាលត្រួតពិនិត្យ និងអនុម័តដោយគណៈគ្រប់គ្រងសាលា។ សូមរង់ចាំការជូនដំណឹង ឬទាក់ទងមកកាន់ការិយាល័យសិក្សា។'
                        : 'Your account has been created but is awaiting review and approval by the institute administration before access can be granted. Please check back later or contact Academic Affairs.'}
                    </div>
                  </div>
                ) : error && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 p-3 rounded-3 mb-4" role="alert" style={{ fontSize: '0.88rem' }}>
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <div>{error}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Email Field */}
                  <div className="auth-input-group">
                    <label className="auth-input-label">
                      {isKhmer ? 'អាសយដ្ឋានអ៊ីមែលស្ថាប័ន' : 'Institutional Email Address'} *
                    </label>
                    <div className="auth-input-wrapper">
                      <Mail className="auth-input-icon" size={18} />
                      <input
                        type="email"
                        className="auth-field-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@rpitssr.edu.kh"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="auth-input-group">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="auth-input-label mb-0">
                        {isKhmer ? 'ពាក្យសម្ងាត់គណនី' : 'Account Password'} *
                      </label>
                      <button
                        type="button"
                        className="btn btn-link p-0 text-decoration-none"
                        style={{ fontSize: '0.82rem', color: '#1e73be', fontWeight: 600 }}
                        onClick={() => setShowForgotModal(true)}
                      >
                        {isKhmer ? 'ភ្លេចពាក្យសម្ងាត់?' : 'Forgot Password?'}
                      </button>
                    </div>
                    <div className="auth-input-wrapper">
                      <Lock className="auth-input-icon" size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="auth-field-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="auth-toggle-pwd"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="rememberMeCheckbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="rememberMeCheckbox"
                        style={{ fontSize: '0.86rem', color: '#475569', cursor: 'pointer', userSelect: 'none' }}
                      >
                        {isKhmer ? 'ចងចាំគណនីលើឧបករណ៍នេះ' : 'Remember me on this device'}
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="auth-btn-submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div
                          style={{
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTop: '2px solid #ffffff',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            animation: 'spin 0.8s linear infinite'
                          }}
                        />
                        <span>{isKhmer ? 'កំពុងផ្ទៀងផ្ទាត់...' : 'Authenticating...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{isKhmer ? 'ចូលគណនីប្រព័ន្ធ' : 'Sign In to Portal'}</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  {/* Register Link Footer */}
                  <div
                    className="d-flex align-items-center justify-content-center flex-wrap gap-2 text-center mt-4 pt-3 border-top"
                    style={{ fontSize: '0.92rem', color: '#64748b' }}
                  >
                    <span>
                      {isKhmer ? 'មិនទាន់មានគណនីមែនទេ?' : "Don't have an account?"}
                    </span>
                    <Link
                      to="/register"
                      style={{ color: '#1e73be', fontWeight: 700, textDecoration: 'none' }}
                    >
                      {isKhmer ? 'ចុះឈ្មោះបង្កើតគណនីថ្មី →' : 'Create an Account →'}
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. FORGOT PASSWORD HELP MODAL LIGHTBOX
          ========================================================================= */}
      {showForgotModal && (
        <div
          className="exam-modal-backdrop"
          onClick={() => setShowForgotModal(false)}
        >
          <div
            className="exam-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            style={{ maxWidth: '560px' }}
          >
            <div className="exam-modal-header">
              <button
                className="exam-modal-close"
                onClick={() => setShowForgotModal(false)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
              <div className="d-flex align-items-center gap-2">
                <HelpCircle size={20} color="#1e73be" />
                <h5 style={{ margin: 0, color: '#07294D', fontWeight: 800 }}>
                  {isKhmer ? 'ការណែនាំអំពីការកំណត់ពាក្យសម្ងាត់ឡើងវិញ' : 'Password Reset Assistance'}
                </h5>
              </div>
            </div>

            <div className="exam-modal-body">
              <p style={{ color: '#334155', fontSize: '0.94rem', lineHeight: 1.7, marginBottom: '20px' }}>
                {isKhmer
                  ? 'ដើម្បីសុវត្ថិភាពទិន្នន័យផ្ទាល់ខ្លួន និងកំណត់ត្រាសិក្សា ការកំណត់ពាក្យសម្ងាត់គណនីនិស្សិត និងបុគ្គលិកត្រូវឆ្លងកាត់ការផ្ទៀងផ្ទាត់ដោយការិយាល័យសិក្សា ឬការិយាល័យបច្ចេកវិទ្យាព័ត៌មាន។'
                  : 'To ensure data privacy and academic record protection, student and staff password resets must be verified through the Academic Affairs or IT Support offices.'}
              </p>

              <div className="p-3 rounded-3 mb-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, color: '#07294D', fontSize: '0.9rem', marginBottom: '8px' }}>
                  {isKhmer ? 'ជម្រើសក្នុងការស្នើសុំពាក្យសម្ងាត់ថ្មី ៖' : 'Options to Reset Credentials:'}
                </div>
                <ul className="mb-0 ps-3" style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.8 }}>
                  <li>
                    {isKhmer
                      ? 'ទាក់ទងផ្ទាល់នៅការិយាល័យសិក្សា និងកិច្ចការនិស្សិត (អគារ A, បន្ទប់ ១០៤)'
                      : 'Visit the Academic Affairs Office in person (Building A, Room 104)'}
                  </li>
                  <li>
                    {isKhmer
                      ? 'ផ្ញើអ៊ីមែលផ្លូវការមកកាន់ ៖ info@rpitssr.edu.kh (ភ្ជាប់ជាមួយរូបថតកាតនិស្សិត)'
                      : 'Send an email to info@rpitssr.edu.kh with your Student ID card attached'}
                  </li>
                  <li>
                    {isKhmer
                      ? 'ទូរស័ព្ទមកកាន់លេខទាន់ហេតុការណ៍ ៖ (+855) 63 963 888'
                      : 'Call the campus hotline at (+855) 63 963 888'}
                  </li>
                </ul>
              </div>

              <div className="d-flex justify-content-end pt-3" style={{ borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4"
                  style={{ background: '#07294D', borderColor: '#07294D' }}
                  onClick={() => setShowForgotModal(false)}
                >
                  {isKhmer ? 'យល់ព្រម' : 'Got it'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
