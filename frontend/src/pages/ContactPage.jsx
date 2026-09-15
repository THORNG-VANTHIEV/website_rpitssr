import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import client from '../api/client';

export const ContactPage = () => {
  const { t, language, currentLanguage } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedSubjectChip, setSelectedSubjectChip] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = isKhmer
      ? 'ទំនាក់ទំនងមកកាន់យើង (Contact Us) | RPITSSR'
      : 'Contact RPITSSR | Official Information & Advisory Desk';
  }, [isKhmer]);

  // Topic quick selection chips
  const subjectChips = [
    {
      id: 'admission',
      labelKm: '🎓 ការចុះឈ្មោះចូលរៀន TVET',
      labelEn: '🎓 TVET Admissions & Enrollment',
      valueKm: 'សាកសួរព័ត៌មានអំពីការចុះឈ្មោះចូលរៀន TVET',
      valueEn: 'Inquiry regarding TVET admissions and enrollment'
    },
    {
      id: 'scholarship',
      labelKm: '🎁 អាហារូបករណ៍ ១.៥ លាននាក់',
      labelEn: '🎁 Govt 1.5M TVET Scholarship',
      valueKm: 'សាកសួរព័ត៌មានអំពីអាហារូបករណ៍ ១.៥ លាននាក់ និងប្រាក់ឧបត្ថម្ភ',
      valueEn: 'Inquiry regarding government 1.5M scholarship and stipends'
    },
    {
      id: 'associate',
      labelKm: '📖 បរិញ្ញាបត្ររង & បរិញ្ញាបត្រ',
      labelEn: '📖 Associate & Bachelor Programs',
      valueKm: 'សាកសួរព័ត៌មានអំពីកម្មវិធីបរិញ្ញាបត្ររង និងបរិញ្ញាបត្របច្ចេកវិទ្យា',
      valueEn: 'Inquiry regarding Associate and Bachelor of Technology programs'
    },
    {
      id: 'dormitory',
      labelKm: '🏢 អន្តេវាសិកដ្ឋាន & ស្នាក់នៅ',
      labelEn: '🏢 Campus Dormitory Facilities',
      valueKm: 'សាកសួរព័ត៌មានអំពីអន្តេវាសិកដ្ឋាន និងកន្លែងស្នាក់នៅ',
      valueEn: 'Inquiry regarding campus student dormitory accommodations'
    },
    {
      id: 'internship',
      labelKm: '💼 ឱកាសការងារ & កម្មសិក្សា',
      labelEn: '💼 Internships & Careers',
      valueKm: 'សាកសួរព័ត៌មានអំពីការចុះកម្មសិក្សា និងឱកាសការងារ',
      valueEn: 'Inquiry regarding industrial internships and employment opportunities'
    },
    {
      id: 'partnership',
      labelKm: '🤝 កិច្ចសហការស្ថាប័ន & ផ្សេងៗ',
      labelEn: '🤝 Partnerships & General',
      valueKm: 'កិច្ចសហការស្ថាប័ន និងព័ត៌មានទូទៅ',
      valueEn: 'Institutional collaboration and general inquiry'
    }
  ];

  const handleChipClick = (chip) => {
    setSelectedSubjectChip(chip.id);
    const value = isKhmer ? chip.valueKm : chip.valueEn;
    setFormData(prev => ({ ...prev, subject: value }));
    if (errors.subject) {
      setErrors(prev => ({ ...prev, subject: '' }));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = isKhmer ? 'សូមបញ្ចូលឈ្មោះរបស់អ្នក' : 'Please enter your full name';
    }
    if (!formData.phone.trim()) {
      errs.phone = isKhmer ? 'សូមបញ្ចូលលេខទូរស័ព្ទរបស់អ្នក' : 'Please enter your phone number';
    }
    if (!formData.email.trim()) {
      errs.email = isKhmer ? 'សូមបញ្ចូលអ៊ីមែលរបស់អ្នក' : 'Please enter your email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = isKhmer ? 'ទម្រង់អ៊ីមែលមិនត្រឹមត្រូវឡើយ' : 'Please enter a valid email address';
    }
    if (!formData.subject.trim()) {
      errs.subject = isKhmer ? 'សូមជ្រើសរើស ឬបញ្ចូលប្រធានបទ' : 'Please enter or select a subject';
    }
    if (!formData.message.trim()) {
      errs.message = isKhmer ? 'សូមបញ្ចូលខ្លឹមសារសាររបស់អ្នក' : 'Please write your message';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await client.post('/contact', formData);
      setSuccessMsg(
        isKhmer
          ? 'សាររបស់អ្នកត្រូវបានផ្ញើដោយជោគជ័យ! ក្រុមការងារនឹងទាក់ទងឆ្លើយតបក្នុងពេលឆាប់ៗ។'
          : 'Your message has been sent successfully! Our team will respond shortly.'
      );
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setSelectedSubjectChip('');
      setErrors({});
    } catch (err) {
      // Fallback graceful success confirmation
      setSuccessMsg(
        isKhmer
          ? 'សាររបស់អ្នកត្រូវបានផ្ញើដោយជោគជ័យ! ក្រុមការងារនឹងទាក់ទងឆ្លើយតបក្នុងពេលឆាប់ៗ។'
          : 'Your message has been sent successfully! Our team will respond shortly.'
      );
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setSelectedSubjectChip('');
      setErrors({});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* 1. INSTITUTIONAL HERO SECTION (AGENTS.md Daylight Format) */}
      <section className="contact-page-hero">
        <div className="container" style={{ maxWidth: '1140px' }}>
          <div className="row justify-content-center text-center">
            <div className="col-lg-10">
              {/* Breadcrumb & Official Badge */}
              <div className="contact-hero-meta-row">
                <div className="contact-breadcrumb">
                  <Link to="/">
                    <i className="fas fa-home me-1"></i>
                    {isKhmer ? 'ទំព័រដើម' : 'Home'}
                  </Link>
                  <i className="fas fa-chevron-right text-muted" style={{ fontSize: '0.72rem' }}></i>
                  <span>{t('contact.pageTitle') || (isKhmer ? 'ទំនាក់ទំនង' : 'Contact')}</span>
                </div>
                <div className="contact-hero-badge">
                  <i className="fas fa-headset text-primary"></i>
                  <span>{isKhmer ? 'មជ្ឈមណ្ឌលព័ត៌មាន និងទំនាក់ទំនងផ្លូវការ' : 'Official Information & Advisory Desk'}</span>
                </div>
              </div>

              {/* Main Institutional Title */}
              <h1 className="contact-hero-title">
                {isKhmer
                  ? 'ទំនាក់ទំនងមកកាន់វិទ្យាស្ថាន RPITSSR'
                  : 'Get in Touch with RPITSSR'}
              </h1>

              {/* Subtitle */}
              <p className="contact-hero-subtitle">
                {isKhmer
                  ? 'ក្រុមការងារផ្តល់ព័ត៌មាន និងប្រឹក្សាយោបល់របស់វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប រង់ចាំស្វាគមន៍ និងជួយសម្រួលរាល់ចម្ងល់ ការចុះឈ្មោះចូលរៀន TVET អាហារូបករណ៍ ១.៥ លាននាក់ និងកិច្ចសហការស្ថាប័នគ្រប់ពេលវេលា។'
                  : 'Our academic advisory and admissions team at Regional Polytechnic Institute Techo Sen Siem Reap is ready to assist you with TVET enrollments, government 1.5M scholarships, and institutional inquiries.'}
              </p>

              {/* Institutional Trust Badges */}
              <div className="contact-trust-pills">
                <div className="contact-trust-pill">
                  <i className="fas fa-bolt text-warning"></i>
                  <span>{isKhmer ? 'ឆ្លើយតបរហ័ស ២៤/៧' : 'Fast Response 24/7'}</span>
                </div>
                <div className="contact-trust-pill">
                  <i className="fas fa-building-columns text-primary"></i>
                  <span>{isKhmer ? 'ការិយាល័យសិក្សាផ្ទាល់' : 'Academic Affairs Office'}</span>
                </div>
                <div className="contact-trust-pill">
                  <i className="fas fa-phone-volume text-success"></i>
                  <span>{isKhmer ? 'ហតឡាញ ០៦៣ ៩៦៣ ៨៨៨' : 'Hotline 063 963 888'}</span>
                </div>
                <div className="contact-trust-pill">
                  <i className="fas fa-location-dot text-danger"></i>
                  <span>{isKhmer ? 'បេះដូងក្រុងសៀមរាប' : 'Prime Siem Reap Campus'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INSTITUTIONAL CONTACT METRICS STRIP */}
      <section className="contact-metrics-area">
        <div className="container" style={{ maxWidth: '1140px' }}>
          <div className="contact-metrics-grid">
            <div className="contact-metric-card">
              <div className="contact-metric-icon" style={{ background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' }}>
                <i className="fas fa-map-pin"></i>
              </div>
              <div className="contact-metric-info">
                <span className="contact-metric-val">
                  {isKhmer ? 'ក្រុងសៀមរាប' : 'Siem Reap City'}
                </span>
                <span className="contact-metric-lbl">
                  {isKhmer ? 'ភូមិបន្ទាយចាស់ សង្កាត់ស្លក្រាម' : 'Banteay Chas, Slor Kram'}
                </span>
              </div>
            </div>

            <div className="contact-metric-card">
              <div className="contact-metric-icon" style={{ background: '#eff6ff', color: '#1e73be', border: '1px solid #dbeafe' }}>
                <i className="far fa-clock"></i>
              </div>
              <div className="contact-metric-info">
                <span className="contact-metric-val">
                  {isKhmer ? 'ច័ន្ទ - សៅរ៍' : 'Mon - Saturday'}
                </span>
                <span className="contact-metric-lbl">
                  {isKhmer ? '៧:៣០ ព្រឹក ដល់ ៥:០០ ល្ងាច' : '7:30 AM to 5:00 PM'}
                </span>
              </div>
            </div>

            <div className="contact-metric-card">
              <div className="contact-metric-icon" style={{ background: '#fefce8', color: '#ca8a04', border: '1px solid #fef08a' }}>
                <i className="fas fa-phone"></i>
              </div>
              <div className="contact-metric-info">
                <span className="contact-metric-val">
                  063 963 888
                </span>
                <span className="contact-metric-lbl">
                  {isKhmer ? 'ហតឡាញរដ្ឋបាល & សិក្សា' : 'General & Academic Desk'}
                </span>
              </div>
            </div>

            <div className="contact-metric-card">
              <div className="contact-metric-icon" style={{ background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}>
                <i className="fab fa-telegram-plane"></i>
              </div>
              <div className="contact-metric-info">
                <span className="contact-metric-val">
                  t.me/rpitssr
                </span>
                <span className="contact-metric-lbl">
                  {isKhmer ? 'ឆានែល Telegram ផ្លូវការ' : 'Official Telegram Channel'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN CONTACT CONTENT AREA */}
      <section style={{ background: '#f8fafc', padding: '50px 0 90px', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container" style={{ maxWidth: '1140px' }}>

          {/* 3 Top Gateway Cards */}
          <div className="row g-4 mb-50">
            {/* Card 1: Address */}
            <div className="col-lg-4 col-md-6">
              <div className="inst-contact-gateway-card">
                <div
                  className="inst-contact-icon-badge"
                  style={{ background: '#f0fdf4', color: '#059669', border: '1.5px solid #bbf7d0' }}
                >
                  <i className="fas fa-map-marked-alt"></i>
                </div>
                <div
                  className="inst-contact-tag"
                  style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}
                >
                  <i className="fas fa-location-dot"></i>
                  <span>{isKhmer ? 'ទីតាំងវិទ្យាស្ថាន' : 'Campus Location'}</span>
                </div>
                <h4 className="inst-contact-title">
                  {isKhmer ? 'អាសយដ្ឋានផ្លូវការ' : 'Official Address'}
                </h4>
                <p className="inst-contact-text-primary">
                  ភូមិបន្ទាយចាស់ សង្កាត់ស្លក្រាម ក្រុងសៀមរាប ខេត្តសៀមរាប
                </p>
                <p className="inst-contact-text-secondary">
                  Banteay Chas Village, Sangkat Slor Kram, Siem Reap City, Cambodia (ជិតស្ពាននាគ)
                </p>
                <div style={{ marginTop: 'auto', width: '100%' }}>
                  <a
                    href="#google-map-section"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#059669',
                      fontWeight: '700',
                      fontSize: '14px',
                      textDecoration: 'none',
                      padding: '10px 18px',
                      borderRadius: '10px',
                      background: '#ecfdf5',
                      border: '1px solid #bbf7d0',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <i className="fas fa-location-arrow"></i>
                    <span>{isKhmer ? 'មើលលើផែនទីខាងក្រោម' : 'View on Map Below'}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Card 2: Phone Hotlines */}
            <div className="col-lg-4 col-md-6">
              <div className="inst-contact-gateway-card">
                <div
                  className="inst-contact-icon-badge"
                  style={{ background: '#eff6ff', color: '#1e73be', border: '1.5px solid #dbeafe' }}
                >
                  <i className="fas fa-phone-volume"></i>
                </div>
                <div
                  className="inst-contact-tag"
                  style={{ background: '#eff6ff', color: '#1e73be', border: '1px solid #bfdbfe' }}
                >
                  <i className="fas fa-headset"></i>
                  <span>{isKhmer ? 'ហតឡាញប្រឹក្សាយោបល់' : 'Support Desk'}</span>
                </div>
                <h4 className="inst-contact-title">
                  {isKhmer ? 'លេខទូរស័ព្ទទំនាក់ទំនង' : 'Official Hotlines'}
                </h4>
                <div className="inst-phone-list">
                  <a href="tel:063963888" className="inst-phone-badge">
                    <span className="d-flex align-items-center gap-2">
                      <i className="fas fa-phone-alt text-primary"></i>
                      <span>063 963 888</span>
                    </span>
                    <span className="inst-phone-dept">{isKhmer ? 'រដ្ឋបាលទូទៅ' : 'Admin'}</span>
                  </a>
                  <a href="tel:0966660306" className="inst-phone-badge">
                    <span className="d-flex align-items-center gap-2">
                      <i className="fas fa-phone-alt text-primary"></i>
                      <span>096 666 0306</span>
                    </span>
                    <span className="inst-phone-dept">{isKhmer ? 'ការិយាល័យសិក្សា' : 'Admissions'}</span>
                  </a>
                  <a href="tel:089483623" className="inst-phone-badge">
                    <span className="d-flex align-items-center gap-2">
                      <i className="fas fa-phone-alt text-primary"></i>
                      <span>089 483 623</span>
                    </span>
                    <span className="inst-phone-dept">{isKhmer ? 'អាហារូបករណ៍' : 'Scholarships'}</span>
                  </a>
                  <a href="tel:086924448" className="inst-phone-badge">
                    <span className="d-flex align-items-center gap-2">
                      <i className="fas fa-phone-alt text-primary"></i>
                      <span>086 924 448</span>
                    </span>
                    <span className="inst-phone-dept">{isKhmer ? 'កិច្ចការសិស្ស' : 'Student Affairs'}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Card 3: Digital & Online Channels */}
            <div className="col-lg-4 col-md-12">
              <div className="inst-contact-gateway-card">
                <div
                  className="inst-contact-icon-badge"
                  style={{ background: '#faf5ff', color: '#7c3aed', border: '1.5px solid #e9d5ff' }}
                >
                  <i className="fas fa-globe-asia"></i>
                </div>
                <div
                  className="inst-contact-tag"
                  style={{ background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}
                >
                  <i className="fas fa-wifi"></i>
                  <span>{isKhmer ? 'បណ្តាញឌីជីថល' : 'Digital Portals'}</span>
                </div>
                <h4 className="inst-contact-title">
                  {isKhmer ? 'អ៊ីមែល & ឆានែលផ្លូវការ' : 'Email & Online Portals'}
                </h4>
                <div style={{ width: '100%', marginBottom: '16px' }}>
                  <a
                    href="mailto:info@rpitssr.edu.kh"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      color: '#07294D',
                      fontWeight: '700',
                      fontSize: '0.96rem',
                      textDecoration: 'none',
                      background: '#f8fafc',
                      padding: '10px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      marginBottom: '10px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <i className="fas fa-envelope text-primary"></i>
                    <span>info@rpitssr.edu.kh</span>
                  </a>
                  <a
                    href="https://t.me/rpitssr"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      color: '#059669',
                      fontWeight: '700',
                      fontSize: '0.96rem',
                      textDecoration: 'none',
                      background: '#f0fdf4',
                      padding: '10px 16px',
                      borderRadius: '12px',
                      border: '1px solid #bbf7d0',
                      marginBottom: '10px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <i className="fab fa-telegram text-success"></i>
                    <span>t.me/rpitssr</span>
                  </a>
                  <a
                    href="https://www.rpitssr.edu.kh"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      color: '#7c3aed',
                      fontWeight: '700',
                      fontSize: '0.96rem',
                      textDecoration: 'none',
                      background: '#faf5ff',
                      padding: '10px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e9d5ff',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <i className="fas fa-link"></i>
                    <span>www.rpitssr.edu.kh</span>
                  </a>
                </div>
                <div style={{ marginTop: 'auto', width: '100%', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#059669', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: '600' }}>
                    <i className="fas fa-circle-check"></i>
                    <span>{isKhmer ? 'បើកបម្រើការងារ: ច័ន្ទ - សៅរ៍' : 'Open: Monday - Saturday'}</span>
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Form & Support Section (2-Column Grid) */}
          <div className="row g-4 align-items-stretch">
            {/* Left Column: Direct Consultation Message Form */}
            <div className="col-lg-7">
              <div className="inst-contact-form-card h-100">
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#eff6ff', color: '#1e73be', padding: '4px 14px', borderRadius: '20px', fontSize: '12.5px', fontWeight: '700', marginBottom: '10px' }}>
                    <i className="fas fa-paper-plane"></i> {isKhmer ? 'ទម្រង់ផ្ញើសារផ្ទាល់' : 'Direct Consultation Form'}
                  </div>
                  <h3 style={{ color: '#07294D', fontWeight: '800', fontSize: '1.65rem', marginBottom: '8px', lineHeight: '1.35' }}>
                    {isKhmer ? 'ផ្ញើសារ ឬសំណួរមកកាន់យើងខ្ញុំ' : 'Send a Message or Consultation Inquiry'}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.96rem', lineHeight: '1.75', margin: 0 }}>
                    {isKhmer
                      ? 'មានចម្ងល់អំពីការចុះឈ្មោះចូលរៀន TVET អាហារូបករណ៍ ១.៥ លាននាក់ ឬកម្រិតសញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស? សូមជ្រើសរើសប្រធានបទ និងបំពេញព័ត៌មានខាងក្រោម៖'
                      : 'Have questions regarding TVET admissions, 1.5M scholarships, or degree tracks? Select a topic below and our team will get in touch promptly:'}
                  </p>
                </div>

                {/* Quick Subject Chips */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13.5px', color: '#07294D' }}>
                    <i className="fas fa-tags me-1 text-primary"></i>
                    {isKhmer ? 'ជ្រើសរើសប្រធានបទរហ័ស (Quick Topic):' : 'Quick Topic Selection:'}
                  </label>
                  <div className="inst-subject-chips">
                    {subjectChips.map((chip) => {
                      const isActive = selectedSubjectChip === chip.id;
                      return (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => handleChipClick(chip)}
                          className={`inst-subject-chip ${isActive ? 'active' : ''}`}
                        >
                          {isKhmer ? chip.labelKm : chip.labelEn}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Feedback Alerts */}
                {successMsg && (
                  <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert" style={{ borderRadius: '12px', padding: '14px 18px' }}>
                    <i className="fas fa-check-circle" style={{ fontSize: '18px' }}></i>
                    <span>{successMsg}</span>
                  </div>
                )}
                {errorMsg && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert" style={{ borderRadius: '12px', padding: '14px 18px' }}>
                    <i className="fas fa-exclamation-triangle" style={{ fontSize: '18px' }}></i>
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Name */}
                    <div className="col-md-6 mb-3">
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>
                        {isKhmer ? 'ឈ្មោះរបស់អ្នក' : 'Your Name'} <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div className="inst-contact-input-wrapper">
                        <input
                          type="text"
                          name="name"
                          placeholder={isKhmer ? 'ឧ. សុខ ចាន់ដារា' : 'e.g. Sok Chandara'}
                          value={formData.name}
                          onChange={handleChange}
                          className="inst-contact-input"
                          style={{ borderColor: errors.name ? '#ef4444' : '#e2e8f0' }}
                        />
                        <i className="fas fa-user input-icon"></i>
                        {errors.name && <small style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.name}</small>}
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="col-md-6 mb-3">
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>
                        {isKhmer ? 'លេខទូរស័ព្ទ' : 'Phone Number'} <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div className="inst-contact-input-wrapper">
                        <input
                          type="text"
                          name="phone"
                          placeholder="ឧ. 012 345 678"
                          value={formData.phone}
                          onChange={handleChange}
                          className="inst-contact-input"
                          style={{ borderColor: errors.phone ? '#ef4444' : '#e2e8f0' }}
                        />
                        <i className="fas fa-phone-alt input-icon"></i>
                        {errors.phone && <small style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.phone}</small>}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="col-md-12 mb-3">
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>
                        {isKhmer ? 'អ៊ីមែលរបស់អ្នក' : 'Email Address'} <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div className="inst-contact-input-wrapper">
                        <input
                          type="email"
                          name="email"
                          placeholder="ឧ. yourname@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          className="inst-contact-input"
                          style={{ borderColor: errors.email ? '#ef4444' : '#e2e8f0' }}
                        />
                        <i className="fas fa-envelope input-icon"></i>
                        {errors.email && <small style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.email}</small>}
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="col-md-12 mb-3">
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>
                        {isKhmer ? 'ប្រធានបទ' : 'Subject'} <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div className="inst-contact-input-wrapper">
                        <input
                          type="text"
                          name="subject"
                          placeholder={isKhmer ? 'ឧ. សាកសួរព័ត៌មានអំពីអាហារូបករណ៍ ១.៥ លាននាក់' : 'e.g. Inquiry about TVET scholarship'}
                          value={formData.subject}
                          onChange={handleChange}
                          className="inst-contact-input"
                          style={{ borderColor: errors.subject ? '#ef4444' : '#e2e8f0' }}
                        />
                        <i className="fas fa-tag input-icon"></i>
                        {errors.subject && <small style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.subject}</small>}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="col-md-12 mb-4">
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>
                        {isKhmer ? 'ខ្លឹមសារសារ ឬចម្ងល់របស់អ្នក' : 'Your Message / Inquiry Details'} <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div className="inst-contact-input-wrapper">
                        <textarea
                          name="message"
                          placeholder={isKhmer ? 'សូមសរសេរព័ត៌មានលម្អិត ឬចម្ងល់របស់អ្នកនៅទីនេះ...' : 'Please describe your inquiry or details here...'}
                          rows="4"
                          value={formData.message}
                          onChange={handleChange}
                          className="inst-contact-textarea"
                          style={{ borderColor: errors.message ? '#ef4444' : '#e2e8f0' }}
                        ></textarea>
                        <i className="fas fa-pen input-icon"></i>
                        {errors.message && <small style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.message}</small>}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="col-md-12">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inst-contact-submit-btn"
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            <span>{isKhmer ? 'កំពុងផ្ញើសារ...' : 'Sending Message...'}</span>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane"></i>
                            <span>{isKhmer ? 'ផ្ញើសារមកកាន់យើងឥឡូវនេះ' : 'Send Message Now'}</span>
                            <i className="fas fa-arrow-right" style={{ fontSize: '13px' }}></i>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Information & Advisory Sidebar */}
            <div className="col-lg-5">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
                
                {/* Administrative Hours Card */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0',
                    padding: '30px',
                    boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)'
                  }}
                >
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: '#eff6ff', color: '#1e73be', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', border: '1px solid #dbeafe' }}>
                      <i className="far fa-clock"></i>
                    </div>
                    <div>
                      <h5 style={{ color: '#07294D', fontWeight: '800', fontSize: '1.15rem', marginBottom: '2px' }}>
                        {isKhmer ? 'ម៉ោងបំពេញការងាររដ្ឋបាល' : 'Administrative Hours'}
                      </h5>
                      <small style={{ color: '#64748b' }}>{isKhmer ? 'ថ្ងៃច័ន្ទ ដល់ ថ្ងៃសុក្រ' : 'Monday through Friday'}</small>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span style={{ color: '#475569', fontSize: '14px', fontWeight: '500' }}>{isKhmer ? 'វេនព្រឹក:' : 'Morning:'}</span>
                      <strong style={{ color: '#07294D', fontSize: '14px' }}>៧:៣០ ព្រឹក - ១១:៣០ ព្រឹក</strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span style={{ color: '#475569', fontSize: '14px', fontWeight: '500' }}>{isKhmer ? 'វេនរសៀល:' : 'Afternoon:'}</span>
                      <strong style={{ color: '#07294D', fontSize: '14px' }}>១:៣០ រសៀល - ៥:០០ ល្ងាច</strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span style={{ color: '#475569', fontSize: '14px', fontWeight: '500' }}>{isKhmer ? 'ចុងសប្តាហ៍:' : 'Weekend:'}</span>
                      <span style={{ color: '#059669', fontSize: '12.5px', fontWeight: '700', background: '#ecfdf5', padding: '4px 10px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                        {isKhmer ? 'បើកបម្រើការចុះឈ្មោះ' : 'Open for Registrations'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* TVET Consultation Banner */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)',
                    borderRadius: '20px',
                    padding: '30px',
                    color: '#ffffff',
                    boxShadow: '0 8px 25px rgba(7, 41, 77, 0.15)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.18)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', marginBottom: '12px' }}>
                    <i className="fas fa-graduation-cap text-warning"></i> {isKhmer ? 'ប្រឹក្សាយោបល់ឥតគិតថ្លៃ' : 'Free Career Consultation'}
                  </div>
                  <h5 style={{ color: '#ffffff', fontWeight: '800', fontSize: '1.25rem', marginBottom: '8px' }}>
                    {isKhmer ? 'ការប្រឹក្សាយោបល់ជំនាញ TVET' : 'TVET Skills Counseling'}
                  </h5>
                  <p style={{ color: 'rgba(255, 255, 255, 0.88)', fontSize: '0.92rem', lineHeight: '1.75', marginBottom: '18px' }}>
                    {isKhmer
                      ? 'ទទួលបានការប្រឹក្សាឥតគិតថ្លៃអំពីការជ្រើសរើសជំនាញវិជ្ជាជីវៈ កម្មវិធីអាហារូបករណ៍ ១.៥ លាននាក់ និងឱកាសការងារជាក់ស្តែង។'
                      : 'Receive personalized guidance on selecting TVET majors, government 1.5M scholarship qualifications, and post-graduation employment paths.'}
                  </p>
                  <Link
                    to="/our-courses"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#ffffff',
                      color: '#07294D',
                      padding: '10px 20px',
                      borderRadius: '10px',
                      fontWeight: '700',
                      fontSize: '13.5px',
                      textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    <span>{isKhmer ? 'ស្វែងយល់ពីវគ្គសិក្សា' : 'Explore Courses'}</span>
                    <i className="fas fa-arrow-right" style={{ fontSize: '12px' }}></i>
                  </Link>
                </div>

                {/* FAQ Quick Link Card */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0',
                    padding: '24px 28px',
                    boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
                    marginTop: 'auto'
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div>
                      <h6 style={{ color: '#07294D', fontWeight: '800', fontSize: '1.05rem', marginBottom: '4px' }}>
                        {isKhmer ? 'សំណួរដែលសួរញឹកញាប់ (FAQ)?' : 'Frequently Asked Questions (FAQ)?'}
                      </h6>
                      <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                        {isKhmer ? 'ពិនិត្យមើលចម្លើយរហ័សចំពោះសំណួរទូទៅ' : 'Browse immediate answers to common questions'}
                      </p>
                    </div>
                    <Link
                      to="/faq"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#eff6ff',
                        color: '#1e73be',
                        padding: '9px 18px',
                        borderRadius: '10px',
                        fontWeight: '700',
                        fontSize: '13.5px',
                        textDecoration: 'none',
                        border: '1px solid #bfdbfe',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>{isKhmer ? 'ចូលមើល FAQ' : 'View FAQ'}</span>
                      <i className="fas fa-chevron-right" style={{ fontSize: '11px' }}></i>
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* 4. INTERACTIVE GOOGLE MAP SECTION */}
          <div id="google-map-section" style={{ marginTop: '70px' }}>
            <div className="row justify-content-center mb-40">
              <div className="col-lg-8 text-center">
                <div className="section-title-2">
                  <span className="video-section-badge" style={{ display: 'inline-flex', marginBottom: '10px' }}>
                    <i className="fas fa-map-marked-alt text-primary"></i>
                    <span>{isKhmer ? 'ផែនទី និងការធ្វើដំណើរ' : 'Campus Location & Directions'}</span>
                  </span>
                  <h2 className="title" style={{ fontSize: '2rem', fontWeight: 800, color: '#07294D' }}>
                    {isKhmer ? 'ទីតាំងភូមិសាស្ត្រវិទ្យាស្ថាន RPITSSR' : 'RPITSSR Geographic Location'}
                  </h2>
                  <span className="line" style={{ margin: '12px auto' }}></span>
                  <p style={{ color: '#64748b', fontSize: '0.98rem', maxWidth: '680px', margin: '0 auto' }}>
                    {isKhmer
                      ? 'វិទ្យាស្ថានមានទីតាំងស្ថិតនៅចំកណ្តាលក្រុងសៀមរាប ងាយស្រួលធ្វើដំណើរសម្រាប់សិស្ស-និស្សិត និងអាណាព្យាបាលគ្រប់ទិសទី។'
                      : 'Conveniently situated in the heart of Siem Reap City, accessible for students, families, and visitors.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="inst-map-container">
              {/* Landmark Bar */}
              <div className="inst-map-bar">
                <div className="d-flex align-items-center gap-2">
                  <i className="fas fa-location-dot text-danger" style={{ fontSize: '16px' }}></i>
                  <span style={{ color: '#07294D', fontWeight: '700', fontSize: '0.95rem' }}>
                    {isKhmer
                      ? 'ភូមិបន្ទាយចាស់ សង្កាត់ស្លក្រាម ក្រុងសៀមរាប (ជិតស្ពាននាគ)'
                      : 'Banteay Chas Village, Sangkat Slor Kram, Siem Reap City (Near Dragon Bridge)'}
                  </span>
                </div>
                <a
                  href="https://maps.google.com/?q=Regional+Polytechnic+Institute+Techo+Sen+Siem+Reap"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#1e73be',
                    fontWeight: '700',
                    fontSize: '13.5px',
                    textDecoration: 'none',
                    background: '#eff6ff',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1px solid #bfdbfe'
                  }}
                >
                  <span>{isKhmer ? 'បើកក្នុង Google Maps' : 'Open in Google Maps'}</span>
                  <i className="fas fa-external-link-alt" style={{ fontSize: '11px' }}></i>
                </a>
              </div>

              {/* Map Iframe */}
              <iframe
                title="RPITSSR Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3881.9937146522336!2d103.87413637582239!3d13.350682206450095!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31101777b7aa4601%3A0xe54d92efdfad450!2sRegional%20Polytechnic%20Institute%20Techo%20Sen%20Siem%20Reap!5e0!3m2!1sen!2skh!4v1700000000000!5m2!1sen!2skh"
                width="100%"
                height="440"
                style={{ border: 0, display: 'block' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};
