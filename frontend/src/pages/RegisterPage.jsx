import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import client from '../api/client';
import {
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
  Lock,
  Mail,
  User,
  AtSign,
  Eye,
  EyeOff,
  Sparkles,
  HelpCircle,
  X,
  Clock,
  Hash
} from 'lucide-react';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    studentId: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const { t, currentLanguage, language } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Password live validation
  const hasMinLength = formData.password.length >= 8;
  const passwordsMatch =
    formData.password.length > 0 &&
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.username.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError(
        isKhmer
          ? 'សូមបំពេញព័ត៌មានចាំបាច់ទាំងអស់ដែលមានសញ្ញាផ្កាយ (*)'
          : 'Please complete all required fields marked with (*).'
      );
      return;
    }

    if (!hasMinLength) {
      setError(
        isKhmer
          ? 'ពាក្យសម្ងាត់ត្រូវតែមានយ៉ាងតិច ៨ តួអក្សរ'
          : 'Password must be at least 8 characters long.'
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(
        isKhmer
          ? 'ពាក្យសម្ងាត់ និងការបញ្ជាក់ពាក្យសម្ងាត់មិនត្រូវគ្នាឡើយ'
          : 'Password and password confirmation do not match.'
      );
      return;
    }

    const emailVal = formData.email.trim().toLowerCase();
    if (!/^[a-zA-Z0-9._%+-]+@rpitssr\.edu\.kh$/i.test(emailVal)) {
      setError(
        isKhmer
          ? 'សូមប្រើប្រាស់គណនីអ៊ីមែលផ្លូវការរបស់វិទ្យាស្ថាន (@rpitssr.edu.kh) ដែលលោកអ្នកទទួលបានក្រោយពេលចុះឈ្មោះចូលរៀន (ឧ. yourname@rpitssr.edu.kh)'
          : 'Please use your official institutional email address (@rpitssr.edu.kh) provided upon enrollment (e.g. yourname@rpitssr.edu.kh).'
      );
      return;
    }

    if (!formData.agreeTerms) {
      setError(
        isKhmer
          ? 'សូមយល់ព្រមតាមលក្ខខណ្ឌប្រើប្រាស់ និងគោលការណ៍ឯកជនភាពរបស់វិទ្យាស្ថាន'
          : 'Please accept the Institutional Terms of Service and Privacy Policy.'
      );
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        username: formData.username.trim().toLowerCase().replace(/\s+/g, '_'),
        email: emailVal,
        password: formData.password,
        studentId: formData.studentId.trim() || null,
        role: 'student'
      };

      await client.post('/auth/register', payload);

      setIsSubmittedSuccessfully(true);
    } catch (err) {
      let msg = isKhmer ? 'ការចុះឈ្មោះមិនបានសម្រេច ៖ ' : 'Registration failed: ';
      if (err.response?.data) {
        const d = err.response.data;
        if (d.errors && typeof d.errors === 'object') {
          const firstErrKey = Object.keys(d.errors)[0];
          const errDetail = Array.isArray(d.errors[firstErrKey])
            ? d.errors[firstErrKey][0]
            : d.errors[firstErrKey];
          msg += errDetail;
        } else if (d.error) {
          msg += d.error;
        } else if (d.message) {
          msg += d.message;
        } else {
          msg += isKhmer
            ? 'អ៊ីមែល ឬឈ្មោះគណនីនេះមានក្នុងប្រព័ន្ធរួចហើយ'
            : 'Email or username already exists in our system.';
        }
      } else if (err.request) {
        msg += isKhmer
          ? 'បញ្ហាតភ្ជាប់បណ្តាញ។ សូមពិនិត្យអ៊ីនធឺណិតរបស់អ្នកហើយព្យាយាមម្តងទៀត។'
          : 'Network error. Please check your internet connection and try again.';
      } else {
        msg += err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page-root" style={{ background: '#f8fafc', minHeight: '100vh' }}>
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
                <span>{isKhmer ? 'ចុះឈ្មោះបង្កើតគណនីថ្មី' : 'Create Account'}</span>
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
                {isKhmer
                  ? 'ចុះឈ្មោះបង្កើតគណនីប្រព័ន្ធស្ថាប័នផ្លូវការ RPITSSR'
                  : 'Register Official RPITSSR Portal Account'}
              </h1>

              {/* Subtitle */}
              <p className="auth-hero-subtitle">
                {isKhmer
                  ? 'បង្កើតគណនីតែមួយដើម្បីចូលប្រើប្រាស់គ្រប់សេវាកម្មឌីជីថលរបស់វិទ្យាស្ថាន រួមមាន៖ ប្រព័ន្ធគ្រប់គ្រងការសិក្សា (LMS), ការស្នើសុំអាហារូបករណ៍ TVET 1.5M, ការពិនិត្យលទ្ធផលប្រឡង និងការទាញយកទម្រង់បែបបទផ្លូវការ។'
                  : 'Create your unified institutional account to access the LMS learning platform, national TVET 1.5M scholarship applications, official exam transcripts, and student services.'}
              </p>

              {/* Trust & Security Badges */}
              <div className="auth-trust-badges">
                <span className="auth-trust-pill">
                  <ShieldCheck size={14} color="#059669" />
                  {isKhmer ? 'សុវត្ថិភាព 256-bit SSL' : '256-bit SSL Encryption'}
                </span>
                <span className="auth-trust-pill">
                  <GraduationCap size={14} color="#1e73be" />
                  {isKhmer ? 'គណនីនិស្សិត & សិក្ខាកាម' : 'Student & Trainee Portal'}
                </span>
                <span className="auth-trust-pill">
                  <CheckCircle2 size={14} color="#d97706" />
                  {isKhmer ? 'ចុះឈ្មោះឥតគិតថ្លៃ ១០០%' : '100% Free Registration'}
                </span>
                <span className="auth-trust-pill">
                  <Sparkles size={14} color="#7c3aed" />
                  {isKhmer ? 'ដំណើរការ ២៤/៧ រហ័ស' : 'Instant Activation'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. SPLIT INSTITUTIONAL AUTHENTICATION CARD
          ========================================================================= */}
      <div className="container pb-80">
        <div className="auth-split-wrapper">
          <div className="row g-0">
            {/* Left Column: Brand & Benefits Sidebar */}
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
                  <div
                    style={{
                      color: '#ffaf00',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {isKhmer ? 'ព្រះរាជាណាចក្រកម្ពុជា' : 'KINGDOM OF CAMBODIA'}
                  </div>
                  <h3
                    style={{
                      color: '#ffffff',
                      fontSize: '1.35rem',
                      fontWeight: 800,
                      lineHeight: 1.35,
                      margin: '6px 0 12px'
                    }}
                  >
                    {isKhmer
                      ? 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប'
                      : 'Regional Polytechnic Institute Techo Sen Siem Reap'}
                  </h3>
                  <p style={{ color: '#cbd5e1', fontSize: '0.86rem', lineHeight: 1.6 }}>
                    {isKhmer
                      ? 'ចូលរួមជាសមាជិកសិក្សានៅវិទ្យាស្ថានដើម្បីទទួលបានចំណេះដឹងបច្ចេកវិទ្យា ជំនាញវិជ្ជាជីវៈកម្រិតខ្ពស់ និងឱកាសការងារជាក់ស្តែង។'
                      : 'Join our academic community to access advanced engineering laboratories, vocational certification, and career placement.'}
                  </p>
                </div>

                {/* Benefits List */}
                <div className="auth-sidebar-features">
                  <div className="auth-sidebar-feature-item">
                    <div className="auth-sidebar-feature-icon">
                      <GraduationCap size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#ffffff' }}>
                        {isKhmer ? 'អាហារូបករណ៍ TVET 1.5M' : 'National TVET 1.5M Program'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                        {isKhmer
                          ? 'រៀនឥតគិតថ្លៃ + ប្រាក់ឧបត្ថម្ភ ២៨០,០០០៛/ខែ'
                          : '100% Free Tuition + 280,000 KHR/mo stipend'}
                      </div>
                    </div>
                  </div>

                  <div className="auth-sidebar-feature-item">
                    <div className="auth-sidebar-feature-icon">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#ffffff' }}>
                        {isKhmer ? 'ប្រព័ន្ធគ្រប់គ្រងការសិក្សា (LMS)' : 'Unified E-Learning LMS'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                        {isKhmer
                          ? 'មេរៀន វីដេអូ កាលវិភាគ និងកិច្ចការផ្ទះ'
                          : 'Syllabus, lectures, exercises & timetable'}
                      </div>
                    </div>
                  </div>

                  <div className="auth-sidebar-feature-item">
                    <div className="auth-sidebar-feature-icon">
                      <Award size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#ffffff' }}>
                        {isKhmer ? 'តារាងពិន្ទុ & លទ្ធផលប្រឡង' : 'Verified Transcripts & GPA'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                        {isKhmer
                          ? 'ផ្ទៀងផ្ទាត់និទ្ទេសផ្ទាល់ខ្លួន និងទាញយក PDF'
                          : 'Personal grades, GPA slip and certificates'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar Support Footer */}
                <div className="auth-sidebar-support">
                  <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                    {isKhmer ? 'ការិយាល័យកិច្ចការនិស្សិត (Support)' : 'Student Support Desk'}
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Phone size={13} color="#ffaf00" />
                    <span>(+855) 63 963 888 • info@rpitssr.edu.kh</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Registration Form */}
            <div className="col-lg-7 col-md-12">
              <div className="auth-form-container">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span
                    className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1"
                    style={{ fontSize: '0.76rem', fontWeight: 700 }}
                  >
                    {isKhmer ? 'ចុះឈ្មោះគណនីថ្មី' : 'New Registration'}
                  </span>
                  <Link
                    to="/"
                    className="text-muted small text-decoration-none"
                    style={{ fontSize: '0.84rem' }}
                  >
                    ← {isKhmer ? 'ត្រលប់ទៅទំព័រដើម' : 'Back to Home'}
                  </Link>
                </div>

                <h2 className="auth-form-title">
                  {isKhmer ? 'សូមស្វាគមន៍មកកាន់ RPITSSR' : 'Create Your Account'}
                </h2>
                <p className="auth-form-subtitle">
                  {isKhmer
                    ? 'សូមបំពេញព័ត៌មានខាងក្រោមដើម្បីបង្កើតគណនីនិស្សិត ឬសិក្ខាកាមផ្លូវការ'
                    : 'Fill out the details below to register your institutional portal access.'}
                </p>

                {/* Institutional Enrollment Policy Notice */}
                <div
                  className="d-flex align-items-start gap-3 p-3 rounded-3 mb-4"
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#1e40af',
                    fontSize: '0.86rem',
                    lineHeight: 1.55
                  }}
                >
                  <ShieldCheck size={22} className="flex-shrink-0 mt-1" style={{ color: '#1e73be' }} />
                  <div>
                    <strong style={{ color: '#07294D' }}>
                      {isKhmer ? 'គោលការណ៍ចុះឈ្មោះផ្លូវការ ៖ ' : 'Official Enrollment Policy: '}
                    </strong>
                    {isKhmer
                      ? 'ការចុះឈ្មោះគណនីនិស្សិតទាមទារឱ្យប្រើប្រាស់គណនីអ៊ីមែលផ្លូវការរបស់វិទ្យាស្ថាន (@rpitssr.edu.kh) ដែលបានផ្តល់ជូនក្រោយពេលចុះឈ្មោះចូលរៀន។ គណនីថ្មីទាំងអស់នឹងត្រូវរង់ចាំការត្រួតពិនិត្យ និងអនុម័តដោយគណៈគ្រប់គ្រងសាលា (Admin Approval) មុនពេលអាចចូលប្រើប្រាស់បាន។'
                      : 'Student registration strictly requires an official institutional email (@rpitssr.edu.kh) issued upon enrollment. All new accounts must be approved by the academic administration prior to accessing the portal.'}
                  </div>
                </div>

                {error && (
                  <div
                    className="alert alert-danger d-flex align-items-center gap-2 p-3 rounded-3 mb-4"
                    role="alert"
                    style={{ fontSize: '0.88rem' }}
                  >
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <div>{error}</div>
                  </div>
                )}

                {isSubmittedSuccessfully ? (
                  /* =========================================================
                     PENDING ADMIN APPROVAL SUCCESS CONFIRMATION SCREEN
                     ========================================================= */
                  <div className="text-center py-4">
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                        color: '#d97706',
                        border: '2px solid #fcd34d',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        boxShadow: '0 10px 25px rgba(217, 119, 6, 0.2)'
                      }}
                    >
                      <Clock size={38} style={{ strokeWidth: 2.2 }} />
                    </div>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#07294D', marginBottom: 10 }}>
                      {isKhmer ? 'ការចុះឈ្មោះទទួលបានជោគជ័យ!' : 'Registration Submitted Successfully!'}
                    </h2>

                    <p style={{ color: '#475569', fontSize: '0.96rem', maxWidth: 480, margin: '0 auto 20px', lineHeight: 1.6 }}>
                      {isKhmer ? (
                        <>
                          គណនី <strong>{formData.email}</strong> ត្រូវបានកត់ត្រាក្នុងប្រព័ន្ធ និងកំពុងស្ថិតក្នុងស្ថានភាព{' '}
                          <strong style={{ color: '#b45309' }}>រង់ចាំការត្រួតពិនិត្យ និងអនុម័តពីគណៈគ្រប់គ្រងសាលា (Pending Admin Approval)</strong>។
                        </>
                      ) : (
                        <>
                          Your account <strong>{formData.email}</strong> has been registered and is currently{' '}
                          <strong style={{ color: '#b45309' }}>awaiting approval by the academic administration (Pending Admin Approval)</strong>.
                        </>
                      )}
                    </p>

                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 16,
                        padding: '16px 20px',
                        maxWidth: 480,
                        margin: '0 auto 28px',
                        textAlign: 'left'
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          color: '#07294D',
                          marginBottom: 8,
                          fontSize: '0.92rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <ShieldCheck size={16} color="#1e73be" />
                        {isKhmer ? 'ព័ត៌មានគណនីដែលបានចុះឈ្មោះ' : 'Submitted Account Details'}
                      </div>
                      <div style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.7 }}>
                        <div>• {isKhmer ? 'ឈ្មោះពេញ' : 'Full Name'}: <strong>{formData.lastName} {formData.firstName}</strong></div>
                        <div>• {isKhmer ? 'អត្តលេខនិស្សិត' : 'Student ID'}: <strong>{formData.studentId || (isKhmer ? 'មិនបានបញ្ចូល' : 'Not provided')}</strong></div>
                        <div>• {isKhmer ? 'អ៊ីមែលសាលា' : 'School Email'}: <strong>{formData.email}</strong></div>
                        <div>
                          • {isKhmer ? 'ស្ថានភាព' : 'Status'}:{' '}
                          <span
                            style={{
                              background: '#fef3c7',
                              color: '#b45309',
                              padding: '2px 8px',
                              borderRadius: 6,
                              fontWeight: 700,
                              fontSize: '0.78rem'
                            }}
                          >
                            {isKhmer ? '⏳ កំពុងរង់ចាំការអនុម័ត' : '⏳ Pending Approval'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: 440, margin: '0 auto 24px' }}>
                      {isKhmer
                        ? 'ក្រោយពេលការិយាល័យសិក្សាអនុម័តរួច លោកអ្នកអាចប្រើអ៊ីមែលនេះ និងពាក្យសម្ងាត់ដើម្បីចូលប្រើប្រាស់ Student Dashboard បាន។'
                        : 'Once approved by the Academic Affairs Office, you will be able to sign in and access the Student Dashboard.'}
                    </p>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <Link
                        to="/"
                        className="btn"
                        style={{
                          background: '#f1f5f9',
                          color: '#475569',
                          fontWeight: 600,
                          padding: '10px 24px',
                          borderRadius: 12,
                          textDecoration: 'none'
                        }}
                      >
                        {isKhmer ? 'ត្រឡប់ទៅទំព័រដើម' : 'Back to Home'}
                      </Link>
                      <Link
                        to="/login"
                        className="btn"
                        style={{
                          background: 'linear-gradient(135deg, #07294D, #1e73be)',
                          color: '#ffffff',
                          fontWeight: 700,
                          padding: '10px 26px',
                          borderRadius: 12,
                          textDecoration: 'none',
                          boxShadow: '0 4px 14px rgba(7, 41, 77, 0.25)'
                        }}
                      >
                        {isKhmer ? 'ទៅកាន់ទំព័រចូលគណនី' : 'Go to Sign In'}
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                  {/* Name Row: Last Name & First Name */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <div className="auth-input-group mb-0">
                        <label className="auth-input-label">
                          {isKhmer ? 'គោត្តនាម (Last Name)' : 'Last Name'} *
                        </label>
                        <div className="auth-input-wrapper">
                          <User className="auth-input-icon" size={18} />
                          <input
                            type="text"
                            name="lastName"
                            className="auth-field-control no-toggle"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder={isKhmer ? 'ឧ. សុខ' : 'e.g. Sok'}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="auth-input-group mb-0">
                        <label className="auth-input-label">
                          {isKhmer ? 'នាមខ្លួន (First Name)' : 'First Name'} *
                        </label>
                        <div className="auth-input-wrapper">
                          <User className="auth-input-icon" size={18} />
                          <input
                            type="text"
                            name="firstName"
                            className="auth-field-control no-toggle"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder={isKhmer ? 'ឧ. ដារ៉ា' : 'e.g. Dara'}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Username & Student ID Row */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <div className="auth-input-group mb-0">
                        <label className="auth-input-label">
                          {isKhmer ? 'ឈ្មោះគណនី (Username)' : 'Username'} *
                        </label>
                        <div className="auth-input-wrapper">
                          <AtSign className="auth-input-icon" size={18} />
                          <input
                            type="text"
                            name="username"
                            className="auth-field-control no-toggle"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="sok_dara"
                            required
                            autoComplete="username"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="auth-input-group mb-0">
                        <label className="auth-input-label">
                          {isKhmer ? 'អត្តលេខនិស្សិត (Student ID)' : 'Official Student ID'}
                        </label>
                        <div className="auth-input-wrapper">
                          <Hash className="auth-input-icon" size={18} />
                          <input
                            type="text"
                            name="studentId"
                            className="auth-field-control no-toggle"
                            value={formData.studentId}
                            onChange={handleChange}
                            placeholder={isKhmer ? 'ឧ. STU-2026-089' : 'e.g. STU-2026-089'}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Institutional Email Row */}
                  <div className="mb-3">
                    <div className="auth-input-group mb-0">
                      <label className="auth-input-label">
                        {isKhmer ? 'អ៊ីមែលផ្លូវការរបស់វិទ្យាស្ថាន (@rpitssr.edu.kh)' : 'Institutional Email (@rpitssr.edu.kh)'} *
                      </label>
                      <div className="auth-input-wrapper">
                        <Mail className="auth-input-icon" size={18} />
                        <input
                          type="email"
                          name="email"
                          className="auth-field-control no-toggle"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="yourname@rpitssr.edu.kh"
                          required
                          autoComplete="email"
                        />
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                        {isKhmer
                          ? 'ឧទាហរណ៍ ៖ thorngvanthiev@rpitssr.edu.kh (គណនីដែលទទួលបានពីសាលា)'
                          : 'Example: thorngvanthiev@rpitssr.edu.kh (provided upon enrollment)'}
                      </span>
                    </div>
                  </div>

                  {/* Password & Confirm Password Row */}
                  <div className="row g-3 mb-2">
                    <div className="col-md-6">
                      <div className="auth-input-group mb-0">
                        <label className="auth-input-label">
                          {isKhmer ? 'ពាក្យសម្ងាត់' : 'Password'} *
                        </label>
                        <div className="auth-input-wrapper">
                          <Lock className="auth-input-icon" size={18} />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            className="auth-field-control"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            minLength={6}
                            autoComplete="new-password"
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
                    </div>

                    <div className="col-md-6">
                      <div className="auth-input-group mb-0">
                        <label className="auth-input-label">
                          {isKhmer ? 'បញ្ជាក់ពាក្យសម្ងាត់' : 'Confirm Password'} *
                        </label>
                        <div className="auth-input-wrapper">
                          <Lock className="auth-input-icon" size={18} />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            className="auth-field-control"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            minLength={6}
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            className="auth-toggle-pwd"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Password Requirement Indicators */}
                  <div className="auth-pwd-reqs">
                    <span className={`auth-pwd-req-item ${hasMinLength ? 'valid' : 'invalid'}`}>
                      {hasMinLength ? (
                        <CheckCircle2 size={13} color="#166534" />
                      ) : (
                        <span style={{ fontSize: '10px' }}>○</span>
                      )}
                      {isKhmer ? 'យ៉ាងតិច ៨ តួអក្សរ' : 'Min 8 characters'}
                    </span>

                    <span className={`auth-pwd-req-item ${passwordsMatch ? 'valid' : 'invalid'}`}>
                      {passwordsMatch ? (
                        <CheckCircle2 size={13} color="#166534" />
                      ) : (
                        <span style={{ fontSize: '10px' }}>○</span>
                      )}
                      {isKhmer ? 'ពាក្យសម្ងាត់ត្រូវគ្នា' : 'Passwords match'}
                    </span>
                  </div>

                  {/* Terms & Conditions Agreement */}
                  <div className={`auth-terms-box ${formData.agreeTerms ? 'checked' : ''}`}>
                    <label className="auth-terms-label" htmlFor="agreeTermsCheckbox">
                      <input
                        type="checkbox"
                        id="agreeTermsCheckbox"
                        name="agreeTerms"
                        className="auth-terms-checkbox"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        required
                      />
                      <span className="auth-terms-text">
                        {isKhmer ? (
                          <>
                            ខ្ញុំយល់ព្រមតាម{' '}
                            <button
                              type="button"
                              className="auth-terms-link-btn"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowTermsModal(true);
                              }}
                            >
                              លក្ខខណ្ឌប្រើប្រាស់
                            </button>{' '}
                            និងគោលការណ៍រក្សាការសម្ងាត់របស់វិទ្យាស្ថាន{' '}
                            <span className="auth-terms-brand">RPITSSR</span>
                          </>
                        ) : (
                          <>
                            I agree to the{' '}
                            <button
                              type="button"
                              className="auth-terms-link-btn"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowTermsModal(true);
                              }}
                            >
                              Terms of Service
                            </button>{' '}
                            and Academic Privacy Policy of{' '}
                            <span className="auth-terms-brand">RPITSSR</span>
                          </>
                        )}
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="auth-btn-submit"
                    disabled={loading || !formData.agreeTerms}
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
                        <span>{isKhmer ? 'កំពុងបង្កើតគណនី...' : 'Creating Account...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{isKhmer ? 'ចុះឈ្មោះបង្កើតគណនី' : 'Create Account Now'}</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  {/* Login Link Footer */}
                  <div
                    className="d-flex align-items-center justify-content-center flex-wrap gap-2 text-center mt-4 pt-3 border-top"
                    style={{ fontSize: '0.92rem', color: '#64748b' }}
                  >
                    <span>
                      {isKhmer ? 'មានគណនីរួចរាល់ហើយមែនទេ?' : 'Already have an account?'}
                    </span>
                    <Link
                      to="/login"
                      style={{ color: '#1e73be', fontWeight: 700, textDecoration: 'none' }}
                    >
                      {isKhmer ? 'ចូលគណនីនៅទីនេះ →' : 'Sign In Instead →'}
                    </Link>
                  </div>
                </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. TERMS OF SERVICE & PRIVACY POLICY LIGHTBOX MODAL
          ========================================================================= */}
      {showTermsModal && (
        <div
          className="exam-modal-backdrop"
          onClick={() => setShowTermsModal(false)}
        >
          <div
            className="exam-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            style={{ maxWidth: '640px' }}
          >
            <div className="exam-modal-header">
              <button
                className="exam-modal-close"
                onClick={() => setShowTermsModal(false)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
              <div className="d-flex align-items-center gap-2">
                <ShieldCheck size={20} color="#1e73be" />
                <h5 style={{ margin: 0, color: '#07294D', fontWeight: 800 }}>
                  {isKhmer
                    ? 'លក្ខខណ្ឌប្រើប្រាស់ និងគោលការណ៍ឯកជនភាព'
                    : 'Institutional Terms & Privacy Policy'}
                </h5>
              </div>
            </div>

            <div className="exam-modal-body">
              <div
                style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  paddingRight: '6px',
                  fontSize: '0.88rem',
                  color: '#334155',
                  lineHeight: 1.7
                }}
              >
                <h6 style={{ color: '#07294D', fontWeight: 700, marginBottom: '8px' }}>
                  {isKhmer ? '១. សុពលភាពនៃគណនី និងការទទួលខុសត្រូវ' : '1. Account Validity & Responsibilities'}
                </h6>
                <p>
                  {isKhmer
                    ? 'គណនីដែលបានបង្កើតនៅលើវិបសាយស្ថាប័ន RPITSSR គឺសម្រាប់សិស្ស-និស្សិត សាស្ត្រាចារ្យ និងបុគ្គលិកប្រើប្រាស់ក្នុងការសិក្សា ស្រាវជ្រាវ និងទំនាក់ទំនងផ្លូវការ។ ម្ចាស់គណនីត្រូវទទួលខុសត្រូវក្នុងការរក្សាការសម្ងាត់នៃពាក្យសម្ងាត់ផ្ទាល់ខ្លួន។'
                    : 'Accounts registered on the RPITSSR institutional portal are designated for students, faculty, and trainees for educational coursework, academic records, and administrative verification.'}
                </p>

                <h6 style={{ color: '#07294D', fontWeight: 700, margin: '14px 0 8px' }}>
                  {isKhmer ? '២. ការការពារទិន្នន័យឯកជនភាព' : '2. Student Privacy & Data Protection'}
                </h6>
                <p>
                  {isKhmer
                    ? 'ព័ត៌មានផ្ទាល់ខ្លួនរួមមាន ឈ្មោះ អ៊ីមែល លទ្ធផលប្រឡង និងកំណត់ត្រាសិក្សា ត្រូវបានការពារដោយសុវត្ថិភាពខ្ពស់ និងមិនត្រូវចែករំលែកទៅភាគីទីបីដោយគ្មានការអនុញ្ញាតស្របច្បាប់ឡើយ។'
                    : 'All submitted personal information, academic credentials, and transcripts are strictly protected and managed under Ministry of Labour and Vocational Training compliance rules.'}
                </p>

                <h6 style={{ color: '#07294D', fontWeight: 700, margin: '14px 0 8px' }}>
                  {isKhmer ? '៣. ក្រមសីលធម៌នៃការប្រើប្រាស់ប្រព័ន្ធ' : '3. Code of Conduct'}
                </h6>
                <p className="mb-0">
                  {isKhmer
                    ? 'ហាមឃាត់ដាច់ខាតនូវរាល់សកម្មភាពព្យាយាមជ្រៀតចូលប្រព័ន្ធ បំផ្លាញទិន្នន័យ ឬប្រើប្រាស់គណនីអ្នកដទៃដោយគ្មានការអនុញ្ញាត។ វិទ្យាស្ថានសូមរក្សាសិទ្ធិក្នុងការផ្អាក ឬលុបគណនីដែលបំពានច្បាប់។'
                    : 'Unauthorized access, malicious data interference, and academic misconduct are strictly prohibited and subject to institutional disciplinary measures.'}
                </p>
              </div>

              <div className="d-flex justify-content-end pt-3 mt-3" style={{ borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4"
                  style={{ background: '#07294D', borderColor: '#07294D' }}
                  onClick={() => setShowTermsModal(false)}
                >
                  {isKhmer ? 'យល់ព្រម និងបិទ' : 'Accept & Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
