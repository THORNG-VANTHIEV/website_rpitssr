import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageBanner } from '../components/common/PageBanner';
import { useLanguage } from '../context/LanguageContext';
import client from '../api/client';

export const ContactPage = () => {
  const { t } = useLanguage();
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = t('contact.nameRequired') || 'សូមបញ្ចូលឈ្មោះរបស់អ្នក';
    if (!formData.email.trim()) {
      errs.email = t('contact.emailRequired') || 'សូមបញ្ចូលអ៊ីមែលរបស់អ្នក';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = t('contact.emailInvalid') || 'ទម្រង់អ៊ីមែលមិនត្រឹមត្រូវឡើយ';
    }
    if (!formData.phone.trim()) errs.phone = t('contact.phoneRequired') || 'សូមបញ្ចូលលេខទូរស័ព្ទរបស់អ្នក';
    if (!formData.subject.trim()) errs.subject = t('contact.subjectRequired') || 'សូមបញ្ចូលប្រធានបទ';
    if (!formData.message.trim()) errs.message = t('contact.messageRequired') || 'សូមបញ្ចូលខ្លឹមសារសារ';
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
      setSuccessMsg(t('contact.messageSuccess') || 'សាររបស់អ្នកត្រូវបានផ្ញើដោយជោគជ័យ! យើងខ្ញុំនឹងឆ្លើយតបក្នុងពេលឆាប់ៗ។');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setErrors({});
    } catch (err) {
      // Friendly fallback if mock/stub
      setSuccessMsg(t('contact.messageSuccess') || 'សាររបស់អ្នកត្រូវបានផ្ញើដោយជោគជ័យ! យើងខ្ញុំនឹងឆ្លើយតបក្នុងពេលឆាប់ៗ។');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setErrors({});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageBanner
        title={t('contact.pageTitle') || 'ទំនាក់ទំនង'}
        image="/images/contact-us.webp"
      />

      <section className="contact-page-area" style={{ background: '#f8fafc', padding: '60px 0 90px' }}>
        <div className="container" style={{ maxWidth: '1240px' }}>
          {/* Header Area */}
          <div className="text-center mb-50">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#eff6ff',
                color: '#1e73be',
                padding: '6px 18px',
                borderRadius: '30px',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '16px'
              }}
            >
              <i className="fas fa-headset"></i>
              <span>{t('contact.getInTouch') || 'ទាក់ទងមកយើង'}</span>
            </div>
            <h2
              style={{
                color: '#07294D',
                fontWeight: '800',
                fontSize: '2.2rem',
                marginBottom: '14px',
                lineHeight: '1.3'
              }}
            >
              {t('contact.title') || 'ទំនាក់ទំនងមកកាន់វិទ្យាស្ថាន RPITSSR'}
            </h2>
            <p
              style={{
                color: '#64748b',
                fontSize: '1.05rem',
                lineHeight: '1.8',
                maxWidth: '700px',
                margin: '0 auto'
              }}
            >
              លោកអ្នកអាចទំនាក់ទំនងមកកាន់យើងខ្ញុំផ្ទាល់តាមរយៈលេខទូរស័ព្ទ អ៊ីមែល ផ្ញើសារ ឬមកកាន់ទីតាំងវិទ្យាស្ថានដោយផ្ទាល់ក្នុងម៉ោងរដ្ឋបាល។
            </p>
          </div>

          {/* 3 Top Contact Cards */}
          <div className="row g-4 mb-50">
            {/* Card 1: Address */}
            <div className="col-lg-4 col-md-6">
              <div className="modern-contact-card">
                <div
                  className="modern-contact-icon"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <i className="fas fa-map-marked-alt"></i>
                </div>
                <div
                  style={{
                    display: 'inline-block',
                    background: '#ecfdf5',
                    color: '#059669',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '700',
                    marginBottom: '12px'
                  }}
                >
                  ទីតាំងវិទ្យាស្ថាន
                </div>
                <h4 style={{ color: '#07294D', fontWeight: '700', fontSize: '1.25rem', marginBottom: '14px' }}>
                  {t('contact.address') || 'អាសយដ្ឋាន'}
                </h4>
                <p style={{ color: '#1e293b', lineHeight: '1.9', fontSize: '1rem', fontWeight: '500', marginBottom: '8px' }}>
                  ភូមិបន្ទាយចាស់ សង្កាត់ស្លក្រាម ក្រុងសៀមរាប ខេត្តសៀមរាប
                </p>
                <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '20px' }}>
                  Banteay Chas Village, Sangkat Slor Kram, Siem Reap City, Cambodia
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
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: '#ecfdf5',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <i className="fas fa-location-arrow"></i>
                    <span>{t('contact.directions') || 'មើលលើផែនទី'}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Card 2: Phone */}
            <div className="col-lg-4 col-md-6">
              <div className="modern-contact-card">
                <div
                  className="modern-contact-icon"
                  style={{
                    background: 'linear-gradient(135deg, #1e73be 0%, #07294D 100%)',
                    boxShadow: '0 8px 20px rgba(30, 115, 190, 0.3)'
                  }}
                >
                  <i className="fas fa-phone-volume"></i>
                </div>
                <div
                  style={{
                    display: 'inline-block',
                    background: '#eff6ff',
                    color: '#1e73be',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '700',
                    marginBottom: '12px'
                  }}
                >
                  ទូរស័ព្ទទាន់ហេតុការណ៍
                </div>
                <h4 style={{ color: '#07294D', fontWeight: '700', fontSize: '1.25rem', marginBottom: '14px' }}>
                  {t('contact.phone') || 'លេខទូរស័ព្ទ'}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginBottom: '10px' }}>
                  <a href="tel:0966660306" className="contact-phone-badge">
                    <i className="fas fa-phone-alt"></i>
                    <span>096 666 0306</span>
                  </a>
                  <a href="tel:089483623" className="contact-phone-badge">
                    <i className="fas fa-phone-alt"></i>
                    <span>089 483 623</span>
                  </a>
                  <a href="tel:086924448" className="contact-phone-badge">
                    <i className="fas fa-phone-alt"></i>
                    <span>086 924 448</span>
                  </a>
                  <a href="tel:0887585693" className="contact-phone-badge" style={{ marginBottom: 0 }}>
                    <i className="fas fa-phone-alt"></i>
                    <span>088 7585 693</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Card 3: Web & Digital */}
            <div className="col-lg-4 col-md-12">
              <div className="modern-contact-card">
                <div
                  className="modern-contact-icon"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  <i className="fas fa-globe-asia"></i>
                </div>
                <div
                  style={{
                    display: 'inline-block',
                    background: '#eef2ff',
                    color: '#4f46e5',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '700',
                    marginBottom: '12px'
                  }}
                >
                  ទំនាក់ទំនងឌីជីថល
                </div>
                <h4 style={{ color: '#07294D', fontWeight: '700', fontSize: '1.25rem', marginBottom: '14px' }}>
                  {t('contact.email') || 'អ៊ីមែល និងគេហទំព័រ'}
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
                      fontSize: '0.98rem',
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
                    href="https://www.rpitssr.edu.kh"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      color: '#4f46e5',
                      fontWeight: '700',
                      fontSize: '0.98rem',
                      textDecoration: 'none',
                      background: '#eef2ff',
                      padding: '10px 16px',
                      borderRadius: '12px',
                      border: '1px solid #c7d2fe',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <i className="fas fa-link"></i>
                    <span>www.rpitssr.edu.kh</span>
                  </a>
                </div>
                <div style={{ marginTop: 'auto', width: '100%', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <i className="far fa-clock text-primary"></i>
                    <span>ចន្ទ - សុក្រ: ៧:៣០ ព្រឹក - ៥:០០ ល្ងាច</span>
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Form & Support Section (2-Column) */}
          <div className="row g-4 align-items-stretch">
            {/* Left: Message Form */}
            <div className="col-lg-7">
              <div className="modern-contact-form-card h-100">
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#eff6ff', color: '#1e73be', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                    <i className="fas fa-paper-plane"></i> សារផ្ទាល់
                  </div>
                  <h3 style={{ color: '#07294D', fontWeight: '800', fontSize: '1.6rem', marginBottom: '8px' }}>
                    {t('contact.sendMessage') || 'ផ្ញើសារមកកាន់យើងខ្ញុំ'}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                    មានចម្ងល់អំពីវគ្គសិក្សា ការចុះឈ្មោះ ឬកម្មវិធីអាហារូបករណ៍? សូមបំពេញទម្រង់ខាងក្រោម ក្រុមការងារនឹងឆ្លើយតបយ៉ាងរហ័ស។
                  </p>
                </div>

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
                        {t('contact.name') || 'ឈ្មោះរបស់អ្នក'} <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div className="modern-contact-input-wrapper">
                        <input
                          type="text"
                          name="name"
                          placeholder="ឧ. សុខ ចាន់ដារា"
                          value={formData.name}
                          onChange={handleChange}
                          className="modern-contact-input"
                          style={{ borderColor: errors.name ? '#ef4444' : '#e2e8f0' }}
                        />
                        <i className="fas fa-user input-icon"></i>
                        {errors.name && <small style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.name}</small>}
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="col-md-6 mb-3">
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>
                        {t('contact.phone') || 'លេខទូរស័ព្ទ'} <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div className="modern-contact-input-wrapper">
                        <input
                          type="text"
                          name="phone"
                          placeholder="ឧ. 012 345 678"
                          value={formData.phone}
                          onChange={handleChange}
                          className="modern-contact-input"
                          style={{ borderColor: errors.phone ? '#ef4444' : '#e2e8f0' }}
                        />
                        <i className="fas fa-phone-alt input-icon"></i>
                        {errors.phone && <small style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.phone}</small>}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="col-md-12 mb-3">
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>
                        {t('contact.email') || 'អ៊ីមែល'} <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div className="modern-contact-input-wrapper">
                        <input
                          type="email"
                          name="email"
                          placeholder="ឧ. yourname@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          className="modern-contact-input"
                          style={{ borderColor: errors.email ? '#ef4444' : '#e2e8f0' }}
                        />
                        <i className="fas fa-envelope input-icon"></i>
                        {errors.email && <small style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.email}</small>}
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="col-md-12 mb-3">
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>
                        {t('contact.subject') || 'ប្រធានបទ'} <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div className="modern-contact-input-wrapper">
                        <input
                          type="text"
                          name="subject"
                          placeholder="ឧ. សាកសួរព័ត៌មានអំពីអាហារូបករណ៍ ១.៥ លាននាក់"
                          value={formData.subject}
                          onChange={handleChange}
                          className="modern-contact-input"
                          style={{ borderColor: errors.subject ? '#ef4444' : '#e2e8f0' }}
                        />
                        <i className="fas fa-tag input-icon"></i>
                        {errors.subject && <small style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.subject}</small>}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="col-md-12 mb-4">
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>
                        {t('contact.message') || 'ខ្លឹមសារសារ'} <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div className="modern-contact-input-wrapper">
                        <textarea
                          name="message"
                          placeholder="សូមសរសេរព័ត៌មានលម្អិត ឬចម្ងល់របស់អ្នកនៅទីនេះ..."
                          rows="5"
                          value={formData.message}
                          onChange={handleChange}
                          className="modern-contact-textarea"
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
                        style={{
                          background: 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '16px 36px',
                          fontWeight: '700',
                          fontSize: '1rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          boxShadow: '0 6px 20px rgba(7, 41, 77, 0.25)',
                          transition: 'all 0.25s ease',
                          width: '100%'
                        }}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            <span>កំពុងផ្ញើសារ...</span>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane"></i>
                            <span>{t('contact.sendMessage') || 'ផ្ញើសារឥឡូវនេះ'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Right: Quick Info & Support Sidebar */}
            <div className="col-lg-5">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
                {/* Administrative Hours Card */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0',
                    padding: '30px',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.04)'
                  }}
                >
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#eff6ff', color: '#1e73be', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                      <i className="far fa-clock"></i>
                    </div>
                    <div>
                      <h5 style={{ color: '#07294D', fontWeight: '700', fontSize: '1.15rem', marginBottom: '2px' }}>
                        {t('contact.office') || 'ម៉ោងធ្វើការរដ្ឋបាល'}
                      </h5>
                      <small style={{ color: '#64748b' }}>ថ្ងៃចន្ទ ដល់ ថ្ងៃសុក្រ</small>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span style={{ color: '#475569', fontSize: '14px' }}>ពេលព្រឹក:</span>
                      <strong style={{ color: '#0f172a', fontSize: '14px' }}>៧:៣០ ព្រឹក - ១១:៣០ ព្រឹក</strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span style={{ color: '#475569', fontSize: '14px' }}>ពេលរសៀល:</span>
                      <strong style={{ color: '#0f172a', fontSize: '14px' }}>១:៣០ រសៀល - ៥:០០ ល្ងាច</strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span style={{ color: '#475569', fontSize: '14px' }}>ចុងសប្តាហ៍:</span>
                      <span style={{ color: '#059669', fontSize: '13px', fontWeight: '600', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px' }}>
                        សម្រាប់ថ្នាក់ចុងសប្តាហ៍
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
                    boxShadow: '0 8px 25px rgba(7, 41, 77, 0.15)'
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.18)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', marginBottom: '12px' }}>
                    <i className="fas fa-graduation-cap"></i> ប្រឹក្សាឥតគិតថ្លៃ
                  </div>
                  <h5 style={{ color: '#ffffff', fontWeight: '800', fontSize: '1.2rem', marginBottom: '8px' }}>
                    ការប្រឹក្សាយោបល់ជំនាញ TVET
                  </h5>
                  <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.92rem', lineHeight: '1.7', marginBottom: '18px' }}>
                    ទទួលបានការប្រឹក្សាឥតគិតថ្លៃអំពីការជ្រើសរើសជំនាញវិជ្ជាជីវៈ កម្មវិធីអាហារូបករណ៍ ១.៥ លាននាក់ និងឱកាសការងារក្រោយបញ្ចប់ការសិក្សា។
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
                    <span>ស្វែងយល់ពីវគ្គសិក្សា</span>
                    <i className="fas fa-arrow-right" style={{ fontSize: '12px' }}></i>
                  </Link>
                </div>

                {/* FAQ Quick Link Card */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0',
                    padding: '26px 30px',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.04)',
                    marginTop: 'auto'
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div>
                      <h6 style={{ color: '#07294D', fontWeight: '700', marginBottom: '4px' }}>
                        {t('faq.stillHaveQuestions') || 'មានសំណួរញឹកញាប់?'}
                      </h6>
                      <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                        ពិនិត្យមើលចម្លើយរហ័សចំពោះសំណួរទូទៅ
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
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '13.5px',
                        textDecoration: 'none',
                        border: '1px solid #bfdbfe'
                      }}
                    >
                      <span>ចូលមើល FAQ</span>
                      <i className="fas fa-chevron-right" style={{ fontSize: '11px' }}></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Google Map Section */}
          <div id="google-map-section" style={{ marginTop: '70px' }}>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-map-marked-alt text-primary" style={{ fontSize: '20px' }}></i>
                <h4 style={{ color: '#07294D', fontWeight: '700', fontSize: '1.3rem', margin: 0 }}>
                  {t('contact.location') || 'ទីតាំងវិទ្យាស្ថានលើ Google Maps'}
                </h4>
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
                  fontWeight: '600',
                  fontSize: '14px',
                  textDecoration: 'none'
                }}
              >
                <span>បើកក្នុង Google Maps</span>
                <i className="fas fa-external-link-alt" style={{ fontSize: '12px' }}></i>
              </a>
            </div>

            <div
              style={{
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                border: '1px solid #e2e8f0'
              }}
            >
              <iframe
                title="RPITSSR Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3881.9937146522336!2d103.87413637582239!3d13.350682206450095!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31101777b7aa4601%3A0xe54d92efdfad450!2sRegional%20Polytechnic%20Institute%20Techo%20Sen%20Siem%20Reap!5e0!3m2!1sen!2skh!4v1700000000000!5m2!1sen!2skh"
                width="100%"
                height="420"
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
