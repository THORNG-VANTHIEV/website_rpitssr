import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import {
  Globe,
  Search,
  Share2,
  Mail,
  Shield,
  UploadCloud,
  CheckSquare,
  Palette,
  GraduationCap,
  Save,
  Check,
  Upload,
  Image as ImageIcon,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  Phone,
  MapPin,
  Settings,
  Sparkles,
  Layers,
  SlidersHorizontal,
  ExternalLink,
  MessageSquare,
  Lock,
  Calendar,
  Radio,
} from 'lucide-react';

export const AdminSettingsPage = () => {
  const { currentLanguage, language } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  const [activeTab, setActiveTab] = useState('general'); // 'general', 'academic', 'appearance', 'seo', 'security'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [toast, setToast] = useState(null);

  const [settings, setSettings] = useState({
    siteName: 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប',
    siteNameEn: 'Regional Polytechnic Institute Techo Sen Siem Reap',
    siteDescription: 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប (RPITSSR) ផ្តល់ការអប់រំបណ្តុះបណ្តាលបច្ចេកទេស និងវិជ្ជាជីវៈ (TVET) កម្រិតសញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស និងបរិញ្ញាបត្របច្ចេកវិទ្យា។',
    siteUrl: 'https://www.rpitssr.edu.kh',
    contactEmail: 'info@rpitssr.edu.kh',
    siteEmail: 'info@rpitssr.edu.kh',
    contactPhone: '+855 96 666 0306',
    sitePhone: '+855 96 666 0306',
    address: 'ភូមិបន្ទាយចាស់ សង្កាត់ស្លក្រាម ក្រុងសៀមរាប ខេត្តសៀមរាប',
    siteAddress: 'ភូមិបន្ទាយចាស់ សង្កាត់ស្លក្រាម ក្រុងសៀមរាប ខេត្តសៀមរាប',
    logoUrl: '/images/logo.png',
    metaTitle: 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប - RPITSSR',
    metaDescription: 'គេហទំព័រផ្លូវការរបស់វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប (RPITSSR) - ជំនាញបច្ចេកទេស អាហារូបករណ៍ ១០០% និងការងារសមរម្យ។',
    metaKeywords: 'RPITSSR, TVET, សៀមរាប, អាហារូបករណ៍, បច្ចេកវិទ្យា, វិស្វកម្ម, ព័ត៌មានវិទ្យា',
    facebookUrl: 'https://facebook.com/rpitssr',
    youtubeUrl: 'https://youtube.com/@rpitssr_edu',
    telegramUrl: 'https://t.me/rpitssr',
    linkedinUrl: '',
    instagramUrl: '',
    academicYear: '2025-2026',
    currentAcademicYear: '2025-2026',
    activeSemester: 'ឆមាសទី ១',
    defaultLanguage: 'km',
    enableRegistration: true,
    enableComments: true,
    enableChatWidget: true,
    enableBannerTicker: true,
    primaryColor: '#07294D',
    secondaryColor: '#1e73be',
    maxUploadSize: 10,
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/settings');
      const raw = res.data?.data || res.data;
      if (raw && typeof raw === 'object') {
        setSettings((prev) => ({
          ...prev,
          ...raw,
          siteName: raw.siteName || prev.siteName,
          siteNameEn: raw.siteNameEn || prev.siteNameEn,
          siteDescription: raw.siteDescription || prev.siteDescription,
          siteEmail: raw.contactEmail || raw.siteEmail || prev.siteEmail,
          contactEmail: raw.contactEmail || raw.siteEmail || prev.siteEmail,
          sitePhone: raw.contactPhone || raw.sitePhone || prev.sitePhone,
          contactPhone: raw.contactPhone || raw.sitePhone || prev.sitePhone,
          siteAddress: raw.address || raw.siteAddress || prev.siteAddress,
          address: raw.address || raw.siteAddress || prev.address,
          currentAcademicYear: raw.academicYear || raw.currentAcademicYear || prev.currentAcademicYear,
          academicYear: raw.academicYear || raw.currentAcademicYear || prev.academicYear,
          logoUrl: raw.logoUrl || prev.logoUrl,
          primaryColor: raw.primaryColor || prev.primaryColor,
          secondaryColor: raw.secondaryColor || prev.secondaryColor,
        }));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);
    data.append('subDir', 'settings');
    setUploadingLogo(true);
    try {
      const res = await api.post('/admin/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data?.imageUrl || res.data?.url;
      if (url) {
        setSettings((prev) => ({ ...prev, logoUrl: url }));
        showToast(isKhmer ? 'បានផ្ទុកឡើងរូបសញ្ញា Logo ដោយជោគជ័យ' : 'Logo uploaded successfully.');
      }
    } catch (err) {
      console.error('Failed to upload logo:', err);
      showToast(isKhmer ? 'បរាជ័យក្នុងការផ្ទុកឡើង Logo' : 'Failed to upload logo image.', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const payload = {
        ...settings,
        contactEmail: settings.siteEmail || settings.contactEmail,
        contactPhone: settings.sitePhone || settings.contactPhone,
        address: settings.siteAddress || settings.address,
        academicYear: settings.currentAcademicYear || settings.academicYear,
        siteDescription: settings.siteDescription || settings.siteNameEn,
      };

      const res = await api.put('/admin/settings', payload);
      const updated = res.data?.data || res.data;
      if (updated && typeof updated === 'object') {
        setSettings((prev) => ({ ...prev, ...updated }));
      }
      setSaveSuccess(true);
      showToast(isKhmer ? 'បានរក្សាទុកការកំណត់គេហទំព័រជោគជ័យ!' : 'All settings saved successfully!');
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to save settings:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || (isKhmer ? 'បរាជ័យក្នុងការរក្សាទុកការកំណត់' : 'Failed to save settings.');
      showToast(errMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  // 5 Streamlined Tabs
  const tabs = [
    {
      id: 'general',
      label: isKhmer ? 'ព័ត៌មានទូទៅស្ថាប័ន' : 'General & Identity',
      icon: Globe,
      desc: isKhmer ? 'ឈ្មោះ អត្តសញ្ញាណ ឡូហ្គោ និងព័ត៌មានទំនាក់ទំនង' : 'Name, logo, and contact info',
    },
    {
      id: 'academic',
      label: isKhmer ? 'ឆ្នាំសិក្សា & ការចុះឈ្មោះ' : 'Academic & Admissions',
      icon: GraduationCap,
      desc: isKhmer ? 'ឆ្នាំសិក្សា ឆមាស និងការបើកទទួលពាក្យ' : 'Academic year and enrollment',
    },
    {
      id: 'appearance',
      label: isKhmer ? 'ពណ៌ & សោភ័ណភាព' : 'Branding & Theme',
      icon: Palette,
      desc: isKhmer ? 'កូដពណ៌ស្ថាប័ន និងរូបរាងគេហទំព័រ' : 'Colors and visual identity',
    },
    {
      id: 'seo',
      label: isKhmer ? 'SEO & បណ្តាញសង្គម' : 'SEO & Social Media',
      icon: Search,
      desc: isKhmer ? 'ការស្វែងរក Google និងតំណភ្ជាប់បណ្តាញសង្គម' : 'Search engine tags and channels',
    },
    {
      id: 'security',
      label: isKhmer ? 'សុវត្ថិភាព & មុខងារប្រព័ន្ធ' : 'System & Security',
      icon: Shield,
      desc: isKhmer ? 'ការគ្រប់គ្រងមតិយោបល់ និងមុខងារគេហទំព័រ' : 'Comment moderation and widgets',
    },
  ];

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 9999,
            background: toast.type === 'error' ? '#ef4444' : '#059669',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem',
            fontWeight: 600,
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. Institutional Header Banner */}
      <div className="admin-page-header admin-settings-header" style={{ marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#eff6ff',
                color: '#1e73be',
                padding: '6px 14px',
                borderRadius: '30px',
                fontSize: '0.84rem',
                fontWeight: 700,
                marginBottom: '10px',
                border: '1px solid #dbeafe',
              }}
            >
              <Settings size={15} />
              <span>
                {isKhmer ? 'ប្រព័ន្ធគ្រប់គ្រងការកំណត់ទូទៅ & គេហទំព័រ' : 'Website & System Configuration'}
              </span>
            </div>
            <h1
              style={{
                fontSize: 'clamp(1.35rem, 4vw, 1.75rem)',
                fontWeight: 800,
                color: '#07294D',
                margin: '0 0 6px 0',
                letterSpacing: '-0.01em',
              }}
            >
              {isKhmer ? 'ការកំណត់ប្រព័ន្ធ និងគេហទំព័រស្ថាប័ន' : 'Website & System Settings'}
            </h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.94rem', maxWidth: '740px', lineHeight: 1.5 }}>
              {isKhmer
                ? 'កំណត់ព័ត៌មានទូទៅរបស់វិទ្យាស្ថាន RPITSSR អាសយដ្ឋានទំនាក់ទំនង ឆ្នាំសិក្សា កូដពណ៌ស្ថាប័ន និងគោលការណ៍សុវត្ថិភាពគេហទំព័រ។'
                : 'Configure global institute parameters, campus contacts, academic term, brand aesthetics, and portal security.'}
            </p>
          </div>

          {/* Top Actions */}
          <div className="admin-settings-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={loadSettings}
              disabled={loading || saving}
              className="admin-btn admin-btn-outline"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: '42px',
                padding: '0 16px',
                background: '#fff',
              }}
              title={isKhmer ? 'ទាញយកទិន្នន័យឡើងវិញ' : 'Reload Settings'}
            >
              <RotateCw size={15} className={loading ? 'animate-spin' : ''} />
              <span>{isKhmer ? 'ផ្ទុកឡើងវិញ' : 'Reload'}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="admin-btn admin-btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: '42px',
                padding: '0 22px',
                borderRadius: '8px',
                fontWeight: 700,
                background: saveSuccess ? '#059669' : 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)',
                boxShadow: '0 4px 12px rgba(30, 115, 190, 0.25)',
              }}
            >
              {saving ? (
                <RotateCw size={16} className="animate-spin" />
              ) : saveSuccess ? (
                <Check size={16} />
              ) : (
                <Save size={16} />
              )}
              <span>
                {saving
                  ? isKhmer
                    ? 'កំពុងរក្សាទុក...'
                    : 'Saving...'
                  : saveSuccess
                  ? isKhmer
                    ? 'រក្សាទុករួចរាល់!'
                    : 'Saved Successfully!'
                  : isKhmer
                  ? 'រក្សាទុកការកំណត់'
                  : 'Save All Settings'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 4-Card Institutional KPI Metric Strip */}
      <div className="admin-kpi-grid admin-settings-kpis" style={{ marginBottom: '28px' }}>
        {/* KPI 1: System Status */}
        <div
          className="admin-kpi-card"
          onClick={() => setActiveTab('general')}
          style={{
            cursor: 'pointer',
            border: activeTab === 'general' ? '1.5px solid #059669' : '1px solid #e2e8f0',
          }}
          title={isKhmer ? 'ចុចដើម្បីមើលព័ត៌មានទូទៅ' : 'Click to view General Settings'}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
              flexShrink: 0,
            }}
          >
            <Radio size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              {isKhmer ? 'ស្ថានភាពគេហទំព័រ' : 'Portal Status'}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', lineHeight: 1.2 }}>
              {isKhmer ? 'ដំណើរការពេញលេញ' : 'Online & Live'}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
              rpitssr.edu.kh
            </div>
          </div>
        </div>

        {/* KPI 2: Current Academic Year */}
        <div
          className="admin-kpi-card"
          onClick={() => setActiveTab('academic')}
          style={{
            cursor: 'pointer',
            border: activeTab === 'academic' ? '1.5px solid #1e73be' : '1px solid #e2e8f0',
          }}
          title={isKhmer ? 'ចុចដើម្បីមើលការកំណត់ឆ្នាំសិក្សា' : 'Click to view Academic Settings'}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: '#eff6ff',
              border: '1px solid #dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1e73be',
              flexShrink: 0,
            }}
          >
            <GraduationCap size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              {isKhmer ? 'ឆ្នាំសិក្សាសកម្ម' : 'Academic Term'}
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#07294D', lineHeight: 1.2 }}>
              {settings.currentAcademicYear || settings.academicYear}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#1e73be', fontWeight: 600, marginTop: '2px' }}>
              {settings.activeSemester || (isKhmer ? 'ឆមាសទី ១' : 'Semester 1')}
            </div>
          </div>
        </div>

        {/* KPI 3: Social & Media Channels */}
        <div
          className="admin-kpi-card"
          onClick={() => setActiveTab('seo')}
          style={{
            cursor: 'pointer',
            border: activeTab === 'seo' ? '1.5px solid #7c3aed' : '1px solid #e2e8f0',
          }}
          title={isKhmer ? 'ចុចដើម្បីមើលបណ្តាញសង្គម & SEO' : 'Click to view SEO & Social'}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: '#faf5ff',
              border: '1px solid #e9d5ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7c3aed',
              flexShrink: 0,
            }}
          >
            <Share2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              {isKhmer ? 'បណ្តាញទំនាក់ទំនង' : 'Connected Channels'}
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#07294D', lineHeight: 1.2 }}>
              {isKhmer ? '៣ បណ្តាញ' : '3 Channels'}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#7c3aed', fontWeight: 600, marginTop: '2px' }}>
              Facebook, Telegram, YouTube
            </div>
          </div>
        </div>

        {/* KPI 4: Security & Access */}
        <div
          className="admin-kpi-card"
          onClick={() => setActiveTab('security')}
          style={{
            cursor: 'pointer',
            border: activeTab === 'security' ? '1.5px solid #ca8a04' : '1px solid #e2e8f0',
          }}
          title={isKhmer ? 'ចុចដើម្បីមើលសុវត្ថិភាព & មុខងារប្រព័ន្ធ' : 'Click to view Security Settings'}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: '#fefce8',
              border: '1px solid #fef08a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ca8a04',
              flexShrink: 0,
            }}
          >
            <Shield size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              {isKhmer ? 'សុវត្ថិភាព & ការចុះឈ្មោះ' : 'Security & Access'}
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#07294D', lineHeight: 1.2 }}>
              {settings.enableRegistration ? (isKhmer ? 'បើកទទួលចុះឈ្មោះ' : 'Open Registration') : (isKhmer ? 'បិទការចុះឈ្មោះ' : 'Closed')}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#ca8a04', fontWeight: 600, marginTop: '2px' }}>
              {isKhmer ? 'ត្រួតពិនិត្យមតិយោបល់' : 'Comment Moderation'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Configuration Card with 5 Tabs */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Modern Tabs Bar */}
        <div
          className="admin-settings-tabs-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #f1f5f9',
            padding: '0 clamp(10px, 2.5vw, 20px)',
            gap: '6px',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            background: '#fafafa',
          }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '14px 18px',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '0.88rem',
                  fontWeight: isTabActive ? 700 : 600,
                  color: isTabActive ? '#1e73be' : '#64748b',
                  borderBottom: isTabActive ? '2.5px solid #1e73be' : '2.5px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body Form */}
        <form onSubmit={handleSave} style={{ padding: 'clamp(16px, 3.5vw, 28px)' }}>
          {/* TAB 1: General & Identity */}
          {activeTab === 'general' && (
            <div>
              <div style={{ marginBottom: '22px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#07294D', margin: '0 0 4px 0' }}>
                  {isKhmer ? 'ព័ត៌មានទូទៅ & អត្តសញ្ញាណស្ថាប័ន' : 'Institute Identity & Contact'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b' }}>
                  {isKhmer
                    ? 'កំណត់ឈ្មោះស្ថាប័នផ្លូវការ រូបសញ្ញា Logo និងព័ត៌មានទំនាក់ទំនងសាធារណៈ។'
                    : 'Configure institute public name, logo, address, and primary communication hotlines.'}
                </p>
              </div>

              {/* Institute Names */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '16px', marginBottom: '18px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label" style={{ fontWeight: 700, color: '#07294D', marginBottom: '6px', display: 'block' }}>
                    {isKhmer ? 'ឈ្មោះវិទ្យាស្ថាន (ភាសាខ្មែរ) *' : 'Institute Name (Khmer) *'}
                  </label>
                  <input
                    type="text"
                    className="admin-form-control"
                    required
                    value={settings.siteName}
                    onChange={(e) => handleChange('siteName', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" style={{ fontWeight: 700, color: '#07294D', marginBottom: '6px', display: 'block' }}>
                    {isKhmer ? 'ឈ្មោះវិទ្យាស្ថាន (English) *' : 'Institute Name (English) *'}
                  </label>
                  <input
                    type="text"
                    className="admin-form-control"
                    required
                    value={settings.siteNameEn}
                    onChange={(e) => handleChange('siteNameEn', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              {/* Logo Upload with Preview */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '18px',
                  marginBottom: '20px',
                }}
              >
                <label className="admin-form-label" style={{ fontWeight: 700, color: '#07294D', marginBottom: '8px', display: 'block' }}>
                  {isKhmer ? 'រូបសញ្ញា Logo ផ្លូវការ' : 'Official Institute Logo'}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div
                    style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '12px',
                      background: '#ffffff',
                      border: '1.5px dashed #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '6px',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={settings.logoUrl || '/images/logo.png'}
                      alt="Logo"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.src = '/images/logo.png';
                      }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 'min(100%, 220px)' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        className="admin-form-control"
                        value={settings.logoUrl}
                        onChange={(e) => handleChange('logoUrl', e.target.value)}
                        placeholder="/images/logo.png"
                        style={{ flex: '1 1 180px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                      />
                      <label
                        className="admin-btn admin-btn-outline"
                        style={{
                          whiteSpace: 'nowrap',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          height: '38px',
                          padding: '0 14px',
                        }}
                      >
                        <Upload size={14} />
                        <span>{uploadingLogo ? (isKhmer ? 'កំពុងផ្ទុក...' : 'Uploading...') : (isKhmer ? 'ផ្ទុក Logo ថ្មី' : 'Upload Logo')}</span>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                      </label>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {isKhmer ? 'គាំទ្រឯកសារ PNG, WEBP ឬ SVG (ផ្ទៃថ្លា Transparent រឹតតែប្រសើរ)' : 'Supports PNG, WEBP, or SVG with transparent background.'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contacts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '16px', marginBottom: '18px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label" style={{ fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
                    {isKhmer ? 'អ៊ីមែលផ្លូវការ (Contact Email) *' : 'Official Contact Email *'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="email"
                      className="admin-form-control"
                      value={settings.siteEmail}
                      onChange={(e) => {
                        handleChange('siteEmail', e.target.value);
                        handleChange('contactEmail', e.target.value);
                      }}
                      style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" style={{ fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
                    {isKhmer ? 'លេខទូរសព្ទទាន់ហេតុការណ៍ (Hotline) *' : 'Official Hotline Phone *'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      className="admin-form-control"
                      value={settings.sitePhone}
                      onChange={(e) => {
                        handleChange('sitePhone', e.target.value);
                        handleChange('contactPhone', e.target.value);
                      }}
                      style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              </div>

              {/* Physical Address & URL */}
              <div className="admin-form-group" style={{ marginBottom: '18px' }}>
                <label className="admin-form-label" style={{ fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
                  {isKhmer ? 'អាសយដ្ឋានទីតាំងវិទ្យាស្ថាន (Physical Address)' : 'Campus Physical Address'}
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#94a3b8' }} />
                  <textarea
                    className="admin-form-control"
                    rows={2}
                    value={settings.siteAddress}
                    onChange={(e) => {
                      handleChange('siteAddress', e.target.value);
                      handleChange('address', e.target.value);
                    }}
                    style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', lineHeight: 1.5 }}
                  />
                </div>
              </div>

              <div className="admin-form-group" style={{ marginBottom: '10px' }}>
                <label className="admin-form-label" style={{ fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
                  {isKhmer ? 'អាសយដ្ឋានគេហទំព័រផ្លូវការ (Portal URL)' : 'Official Website URL'}
                </label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={settings.siteUrl}
                  onChange={(e) => handleChange('siteUrl', e.target.value)}
                  placeholder="https://www.rpitssr.edu.kh"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>
          )}

          {/* TAB 2: Academic & Admissions */}
          {activeTab === 'academic' && (
            <div>
              <div style={{ marginBottom: '22px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#07294D', margin: '0 0 4px 0' }}>
                  {isKhmer ? 'ឆ្នាំសិក្សា & គោលការណ៍ចុះឈ្មោះចូលរៀន' : 'Academic Terms & Admission Policies'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b' }}>
                  {isKhmer
                    ? 'កំណត់ឆ្នាំសិក្សាបច្ចុប្បន្ន ឆមាសសកម្ម និងការបើកទទួលពាក្យចុះឈ្មោះតាមអនឡាញ។'
                    : 'Manage current academic calendar year, active semester, and online student self-registration.'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label" style={{ fontWeight: 700, color: '#07294D', marginBottom: '6px', display: 'block' }}>
                    {isKhmer ? 'ឆ្នាំសិក្សាបច្ចុប្បន្ន (Academic Year) *' : 'Current Academic Year *'}
                  </label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={settings.currentAcademicYear}
                    onChange={(e) => {
                      handleChange('currentAcademicYear', e.target.value);
                      handleChange('academicYear', e.target.value);
                    }}
                    placeholder="2025-2026"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" style={{ fontWeight: 700, color: '#07294D', marginBottom: '6px', display: 'block' }}>
                    {isKhmer ? 'ឆមាសសកម្ម (Active Semester) *' : 'Active Semester *'}
                  </label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={settings.activeSemester}
                    onChange={(e) => handleChange('activeSemester', e.target.value)}
                    placeholder={isKhmer ? 'ឆមាសទី ១ / Semester 1' : 'Semester 1'}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              {/* Switch Card: Enable Registration */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ flex: '1 1 240px' }}>
                  <div style={{ fontWeight: 700, color: '#07294D', fontSize: '0.94rem' }}>
                    {isKhmer ? 'អនុញ្ញាតឱ្យសិស្ស-និស្សិតចុះឈ្មោះចូលរៀនតាមអនឡាញ (/register)' : 'Allow Public Online Student Self-Registration (/register)'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                    {isKhmer
                      ? 'បើក ឬបិទទម្រង់ពាក្យស្នើសុំចុះឈ្មោះចូលរៀន និងអាហារូបករណ៍ ១០០% លើគេហទំព័រ។'
                      : 'Toggle public availability of student registration and scholarship application forms.'}
                  </div>
                </div>

                <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer', flexShrink: 0 }}>
                  <input
                    type="checkbox"
                    checked={settings.enableRegistration}
                    onChange={(e) => handleChange('enableRegistration', e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      inset: 0,
                      backgroundColor: settings.enableRegistration ? '#10b981' : '#cbd5e1',
                      borderRadius: '34px',
                      transition: '0.2s',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '""',
                        height: '20px',
                        width: '20px',
                        left: settings.enableRegistration ? '25px' : '3px',
                        bottom: '3px',
                        backgroundColor: '#ffffff',
                        borderRadius: '50%',
                        transition: '0.2s',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    />
                  </span>
                </label>
              </div>

              {/* Default Language Selector */}
              <div className="admin-form-group">
                <label className="admin-form-label" style={{ fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
                  {isKhmer ? 'ភាសាលំនាំដើមនៃគេហទំព័រ (Default Language)' : 'Default Portal Language'}
                </label>
                <select
                  className="admin-form-control"
                  value={settings.defaultLanguage}
                  onChange={(e) => handleChange('defaultLanguage', e.target.value)}
                  style={{ maxWidth: '280px', width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  <option value="km">ភាសាខ្មែរ (Khmer - Official)</option>
                  <option value="en">English (International)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 3: Branding & Theme */}
          {activeTab === 'appearance' && (
            <div>
              <div style={{ marginBottom: '22px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#07294D', margin: '0 0 4px 0' }}>
                  {isKhmer ? 'កូដពណ៌ & សោភ័ណភាពស្ថាប័ន' : 'Institutional Palette & Aesthetics'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b' }}>
                  {isKhmer
                    ? 'កំណត់ពណ៌គោលរបស់វិទ្យាស្ថានស្របតាម Design System (Deep Navy, Royal Blue, និង Golden Amber)។'
                    : 'Configure institutional brand colors following RPITSSR Design System rules.'}
                </p>
              </div>

              {/* Color Pickers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  }}
                >
                  <label className="admin-form-label" style={{ fontWeight: 700, color: '#07294D', marginBottom: '6px', display: 'block' }}>
                    {isKhmer ? 'ពណ៌គោលចម្បង (Deep Navy Primary)' : 'Deep Navy Primary'}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                    <input
                      type="color"
                      value={settings.primaryColor || '#07294D'}
                      onChange={(e) => handleChange('primaryColor', e.target.value)}
                      style={{ width: '48px', height: '42px', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: 0 }}
                    />
                    <input
                      type="text"
                      className="admin-form-control"
                      value={settings.primaryColor}
                      onChange={(e) => handleChange('primaryColor', e.target.value)}
                      style={{ width: '130px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'monospace' }}
                    />
                  </div>
                  <span style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '6px', display: 'block' }}>
                    #07294D - Header, Primary Text & Navigation
                  </span>
                </div>

                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  }}
                >
                  <label className="admin-form-label" style={{ fontWeight: 700, color: '#07294D', marginBottom: '6px', display: 'block' }}>
                    {isKhmer ? 'ពណ៌លម្អិតបន្ថែម (Royal Blue Accent)' : 'Royal Blue Accent'}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                    <input
                      type="color"
                      value={settings.secondaryColor || '#1e73be'}
                      onChange={(e) => handleChange('secondaryColor', e.target.value)}
                      style={{ width: '48px', height: '42px', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: 0 }}
                    />
                    <input
                      type="text"
                      className="admin-form-control"
                      value={settings.secondaryColor}
                      onChange={(e) => handleChange('secondaryColor', e.target.value)}
                      style={{ width: '130px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'monospace' }}
                    />
                  </div>
                  <span style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '6px', display: 'block' }}>
                    #1e73be - Buttons, Active Links & Icons
                  </span>
                </div>
              </div>

              {/* Live Preview Card */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px',
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {isKhmer ? 'ទិដ្ឋភាពជាក់ស្តែងនៃកូដពណ៌ (Live Brand Theme Preview)' : 'Live Brand Theme Preview'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div
                    style={{
                      background: settings.primaryColor || '#07294D',
                      color: '#ffffff',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>Primary Navy Card</span>
                  </div>

                  <div
                    style={{
                      background: settings.secondaryColor || '#1e73be',
                      color: '#ffffff',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>Royal Blue Button</span>
                  </div>

                  <div
                    style={{
                      background: '#ffaf00',
                      color: '#07294D',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>Golden Amber CTA</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SEO & Social Media */}
          {activeTab === 'seo' && (
            <div>
              <div style={{ marginBottom: '22px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#07294D', margin: '0 0 4px 0' }}>
                  {isKhmer ? 'ការស្វែងរក Google (SEO) & បណ្តាញសង្គម' : 'Search Engine Optimization & Social Channels'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b' }}>
                  {isKhmer
                    ? 'កំណត់ Meta Tag សម្រាប់ម៉ាស៊ីនស្វែងរក Google និងតំណភ្ជាប់បណ្តាញសង្គមផ្លូវការរបស់វិទ្យាស្ថាន។'
                    : 'Manage Google search metadata and institute official social media presences.'}
                </p>
              </div>

              {/* SEO Meta Fields */}
              <div className="admin-form-group" style={{ marginBottom: '16px' }}>
                <label className="admin-form-label" style={{ fontWeight: 700, color: '#07294D', marginBottom: '6px', display: 'block' }}>
                  {isKhmer ? 'ចំណងជើង Meta Title (បង្ហាញលើ Google & Browser Tab)' : 'Default Browser Title Tag'}
                </label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={settings.metaTitle}
                  onChange={(e) => handleChange('metaTitle', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div className="admin-form-group" style={{ marginBottom: '16px' }}>
                <label className="admin-form-label" style={{ fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
                  {isKhmer ? 'សេចក្តីសង្ខេប Meta Description' : 'Meta Description'}
                </label>
                <textarea
                  className="admin-form-control"
                  rows={3}
                  value={settings.metaDescription}
                  onChange={(e) => handleChange('metaDescription', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', lineHeight: 1.5 }}
                />
              </div>

              <div className="admin-form-group" style={{ marginBottom: '24px' }}>
                <label className="admin-form-label" style={{ fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
                  {isKhmer ? 'ពាក្យគន្លឹះស្វែងរក Keywords (ញែកដោយសញ្ញាក្បៀស ,)' : 'Keywords (comma-separated)'}
                </label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={settings.metaKeywords}
                  onChange={(e) => handleChange('metaKeywords', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              {/* Social Channels Sub-section */}
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#07294D', marginBottom: '14px' }}>
                {isKhmer ? 'តំណភ្ជាប់បណ្តាញសង្គមផ្លូវការ' : 'Official Social Channels'}
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '16px', marginBottom: '14px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label" style={{ fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
                    Facebook Page URL
                  </label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={settings.facebookUrl}
                    onChange={(e) => handleChange('facebookUrl', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" style={{ fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
                    Telegram Channel Link
                  </label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={settings.telegramUrl}
                    onChange={(e) => handleChange('telegramUrl', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '16px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label" style={{ fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
                    YouTube Channel URL
                  </label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={settings.youtubeUrl}
                    onChange={(e) => handleChange('youtubeUrl', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" style={{ fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
                    LinkedIn URL (Optional)
                  </label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={settings.linkedinUrl}
                    onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: System & Security */}
          {activeTab === 'security' && (
            <div>
              <div style={{ marginBottom: '22px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#07294D', margin: '0 0 4px 0' }}>
                  {isKhmer ? 'សុវត្ថិភាព & ម៉ូឌុលមុខងារគេហទំព័រ' : 'Portal Security & Feature Toggles'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b' }}>
                  {isKhmer
                    ? 'គ្រប់គ្រងមុខងារអន្តរកម្មដូចជា មតិយោបល់អ្នកអាន របារអក្សររត់ និងទំហំផ្ទុកឡើងអតិបរមា។'
                    : 'Manage interactive modules like reader comments, ticker banner, and file size quotas.'}
                </p>
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                {/* Comments Toggle */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px',
                  }}
                >
                  <div style={{ flex: '1 1 240px' }}>
                    <div style={{ fontWeight: 700, color: '#07294D', fontSize: '0.92rem' }}>
                      {isKhmer ? 'បើកដំណើរការការបញ្ចេញមតិយោបល់លើអត្ថបទប្លុក (Comments)' : 'Enable Blog Reader Comments & Moderation'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      {isKhmer ? 'អនុញ្ញាតឱ្យសាធារណជនបញ្ចេញមតិយោបល់លើអត្ថបទព័ត៌មាន' : 'Allow public visitors to submit questions or feedback on news articles.'}
                    </div>
                  </div>

                  <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer', flexShrink: 0 }}>
                    <input
                      type="checkbox"
                      checked={settings.enableComments}
                      onChange={(e) => handleChange('enableComments', e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        inset: 0,
                        backgroundColor: settings.enableComments ? '#10b981' : '#cbd5e1',
                        borderRadius: '34px',
                        transition: '0.2s',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          content: '""',
                          height: '20px',
                          width: '20px',
                          left: settings.enableComments ? '25px' : '3px',
                          bottom: '3px',
                          backgroundColor: '#ffffff',
                          borderRadius: '50%',
                          transition: '0.2s',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                      />
                    </span>
                  </label>
                </div>

                {/* Announcement Ticker */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px',
                  }}
                >
                  <div style={{ flex: '1 1 240px' }}>
                    <div style={{ fontWeight: 700, color: '#07294D', fontSize: '0.92rem' }}>
                      {isKhmer ? 'បើករបារអក្សររត់ជូនដំណឹងលើទំព័រដើម (Scrolling Announcement Ticker)' : 'Enable Scrolling Announcement Ticker on Homepage'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      {isKhmer ? 'បង្ហាញសារជូនដំណឹងសំខាន់ៗរត់លើកំពូលទំព័រដើម' : 'Display high-priority breaking announcements ticker.'}
                    </div>
                  </div>

                  <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer', flexShrink: 0 }}>
                    <input
                      type="checkbox"
                      checked={settings.enableBannerTicker}
                      onChange={(e) => handleChange('enableBannerTicker', e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        inset: 0,
                        backgroundColor: settings.enableBannerTicker ? '#10b981' : '#cbd5e1',
                        borderRadius: '34px',
                        transition: '0.2s',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          content: '""',
                          height: '20px',
                          width: '20px',
                          left: settings.enableBannerTicker ? '25px' : '3px',
                          bottom: '3px',
                          backgroundColor: '#ffffff',
                          borderRadius: '50%',
                          transition: '0.2s',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                      />
                    </span>
                  </label>
                </div>

                {/* Floating Chat Widget */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px',
                  }}
                >
                  <div style={{ flex: '1 1 240px' }}>
                    <div style={{ fontWeight: 700, color: '#07294D', fontSize: '0.92rem' }}>
                      {isKhmer ? 'បើកដំណើរការប៊ូតុងជំនួយអណ្តែត Telegram Chat Widget' : 'Enable Floating Live Telegram Chat Widget'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      {isKhmer ? 'ប៊ូតុងសួរព័ត៌មានរហ័សនៅផ្នែកខាងក្រោមស្តាំនៃគេហទំព័រ' : 'Display quick inquiry floating button on lower right screen.'}
                    </div>
                  </div>

                  <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer', flexShrink: 0 }}>
                    <input
                      type="checkbox"
                      checked={settings.enableChatWidget}
                      onChange={(e) => handleChange('enableChatWidget', e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        inset: 0,
                        backgroundColor: settings.enableChatWidget ? '#10b981' : '#cbd5e1',
                        borderRadius: '34px',
                        transition: '0.2s',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          content: '""',
                          height: '20px',
                          width: '20px',
                          left: settings.enableChatWidget ? '25px' : '3px',
                          bottom: '3px',
                          backgroundColor: '#ffffff',
                          borderRadius: '50%',
                          transition: '0.2s',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                      />
                    </span>
                  </label>
                </div>
              </div>

              {/* Upload Size Limit */}
              <div className="admin-form-group" style={{ maxWidth: '320px' }}>
                <label className="admin-form-label" style={{ fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
                  {isKhmer ? 'ទំហំឯកសារផ្ទុកឡើងអតិបរមា (Megabytes MB)' : 'Max File Upload Size (MB)'}
                </label>
                <input
                  type="number"
                  className="admin-form-control"
                  value={settings.maxUploadSize}
                  onChange={(e) => handleChange('maxUploadSize', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  min="1"
                  max="100"
                />
                <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  {isKhmer ? 'ទំហំស្តង់ដារដែលបានណែនាំគឺ 10MB - 25MB។' : 'Recommended server quota is 10MB - 25MB.'}
                </span>
              </div>
            </div>
          )}

          {/* Bottom Save Action Bar */}
          <div
            className="admin-settings-bottom-bar"
            style={{
              borderTop: '1px solid #f1f5f9',
              paddingTop: '20px',
              marginTop: '28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div style={{ fontSize: '0.84rem', color: '#64748b', flex: '1 1 240px' }}>
              {isKhmer ? 'រាល់ការផ្លាស់ប្តូរនឹងមានប្រសិទ្ធភាពភ្លាមៗបន្ទាប់ពីចុចរក្សាទុក។' : 'Changes take effect immediately across all website modules.'}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="admin-btn admin-btn-primary admin-settings-save-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: '42px',
                padding: '0 24px',
                borderRadius: '8px',
                fontWeight: 700,
                background: saveSuccess ? '#059669' : 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)',
                boxShadow: '0 4px 12px rgba(30, 115, 190, 0.25)',
              }}
            >
              {saving ? (
                <RotateCw size={16} className="animate-spin" />
              ) : saveSuccess ? (
                <Check size={16} />
              ) : (
                <Save size={16} />
              )}
              <span>
                {saving
                  ? isKhmer
                    ? 'កំពុងរក្សាទុក...'
                    : 'Saving...'
                  : saveSuccess
                  ? isKhmer
                    ? 'រក្សាទុករួចរាល់!'
                    : 'Saved Successfully!'
                  : isKhmer
                  ? 'រក្សាទុកការកំណត់'
                  : 'Save Configuration'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
