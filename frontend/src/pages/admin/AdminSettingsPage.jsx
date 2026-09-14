import React, { useEffect, useState } from 'react';
import api from '../../api/client';
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
  Image as ImageIcon
} from 'lucide-react';

export const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('site');
  const [settings, setSettings] = useState({
    siteName: 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប',
    siteNameEn: 'Regional Polytechnic Institute Techo Sen Siem Reap',
    siteDescription: 'Regional Polytechnic Institute Techo Sen Siem Reap',
    siteUrl: 'https://rpitssr.edu.kh',
    contactEmail: 'info@rpitssr.edu.kh',
    siteEmail: 'info@rpitssr.edu.kh',
    contactPhone: '096 666 0306',
    sitePhone: '096 666 0306',
    address: 'Bantey Chas Village, Sangkat Slakram, Siem Reap City, Siem Reap Province',
    siteAddress: 'Bantey Chas Village, Sangkat Slakram, Siem Reap City, Siem Reap Province',
    logoUrl: '/images/logo.png',
    metaTitle: 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប - RPITSSR',
    metaDescription: 'Official website of RPITSSR - Vocational and Technical Education in Siem Reap, Cambodia.',
    metaKeywords: 'RPITSSR, TVET, Siem Reap, Education, Vocational Training, Engineering, ICT',
    facebookUrl: 'https://facebook.com/rpitssr',
    youtubeUrl: 'https://youtube.com/@rpitssr_edu',
    telegramUrl: 'https://t.me/rpitssr',
    linkedinUrl: '',
    instagramUrl: '',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    maxUploadSize: '10',
    currentAcademicYear: '2025-2026',
    academicYear: '2025-2026',
    activeSemester: 'Semester 1',
    defaultLanguage: 'kh',
    enableRegistration: true,
    enableComments: true,
    enableChatWidget: true,
    enableBannerTicker: true,
    primaryColor: '#07294d',
    secondaryColor: '#0c8b51',
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    api.get('/admin/settings')
      .then((res) => {
        const raw = res.data?.data || res.data;
        if (raw && typeof raw === 'object') {
          setSettings((prev) => ({
            ...prev,
            ...raw,
            siteName: raw.siteName || prev.siteName,
            siteNameEn: raw.siteDescription || raw.siteNameEn || prev.siteNameEn,
            siteDescription: raw.siteDescription || raw.siteNameEn || prev.siteDescription,
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
      })
      .catch((err) => console.error('Failed to load settings:', err));
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
      }
    } catch (err) {
      console.error('Failed to upload logo:', err);
      alert('Failed to upload logo image.');
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
        siteDescription: settings.siteNameEn || settings.siteDescription,
      };

      const res = await api.put('/admin/settings', payload);
      const updated = res.data?.data || res.data;
      if (updated && typeof updated === 'object') {
        setSettings((prev) => ({ ...prev, ...updated }));
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to save settings:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to save settings.';
      alert(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'site', label: 'Site Settings', icon: Globe },
    { id: 'seo', label: 'SEO Settings', icon: Search },
    { id: 'social', label: 'Social Media', icon: Share2 },
    { id: 'email', label: 'Email Settings', icon: Mail },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'upload', label: 'File Upload', icon: UploadCloud },
    { id: 'features', label: 'Features', icon: CheckSquare },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'academic', label: 'Academic', icon: GraduationCap },
  ];

  return (
    <div style={{ minWidth: 0, maxWidth: '100%' }}>
      {/* Header with Save Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--admin-primary)', margin: 0 }}>
            Website System Settings
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', margin: '4px 0 0', fontSize: '0.9rem' }}>
            Configure global website parameters, institute contact info, metadata, and security policies
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="admin-btn admin-btn-primary"
          disabled={saving}
          style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          {saveSuccess ? <Check size={16} /> : <Save size={16} />}
          <span>{saving ? 'Saving...' : saveSuccess ? 'Saved Successfully!' : 'Save All Settings'}</span>
        </button>
      </div>

      {/* Tabs Navigation (9 tabs with smooth horizontal scroll) */}
      <div className="admin-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              className={`admin-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} style={{ display: 'inline', marginRight: '6px' }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="admin-card">
        <form onSubmit={handleSave} className="admin-card-body" style={{ padding: '24px' }}>
          {/* Tab 1: Site Settings */}
          {activeTab === 'site' && (
            <div>
              <h4 style={{ color: 'var(--admin-primary)', fontWeight: '700', marginBottom: '16px' }}>
                General Institute Information
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Institute Name (Khmer)</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={settings.siteName}
                    onChange={(e) => handleChange('siteName', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Institute Name (English)</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={settings.siteNameEn}
                    onChange={(e) => {
                      handleChange('siteNameEn', e.target.value);
                      handleChange('siteDescription', e.target.value);
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Primary Contact Email</label>
                  <input
                    type="email"
                    className="admin-form-control"
                    value={settings.siteEmail}
                    onChange={(e) => {
                      handleChange('siteEmail', e.target.value);
                      handleChange('contactEmail', e.target.value);
                    }}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Hotline Phone Number</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={settings.sitePhone}
                    onChange={(e) => {
                      handleChange('sitePhone', e.target.value);
                      handleChange('contactPhone', e.target.value);
                    }}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Physical Campus Address</label>
                <textarea
                  className="admin-form-control"
                  rows={2}
                  value={settings.siteAddress}
                  onChange={(e) => {
                    handleChange('siteAddress', e.target.value);
                    handleChange('address', e.target.value);
                  }}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Official Website URL</label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={settings.siteUrl}
                  onChange={(e) => handleChange('siteUrl', e.target.value)}
                  placeholder="https://rpitssr.edu.kh"
                />
              </div>
            </div>
          )}

          {/* Tab 2: SEO Settings */}
          {activeTab === 'seo' && (
            <div>
              <h4 style={{ color: 'var(--admin-primary)', fontWeight: '700', marginBottom: '16px' }}>
                Search Engine Optimization (SEO)
              </h4>
              <div className="admin-form-group">
                <label className="admin-form-label">Default Browser Title Tag</label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={settings.metaTitle}
                  onChange={(e) => handleChange('metaTitle', e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Meta Description</label>
                <textarea
                  className="admin-form-control"
                  rows={3}
                  value={settings.metaDescription}
                  onChange={(e) => handleChange('metaDescription', e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Keywords (comma-separated)</label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={settings.metaKeywords}
                  onChange={(e) => handleChange('metaKeywords', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Tab 3: Social Media */}
          {activeTab === 'social' && (
            <div>
              <h4 style={{ color: 'var(--admin-primary)', fontWeight: '700', marginBottom: '16px' }}>
                Official Social Media Channels
              </h4>
              <div className="admin-form-group">
                <label className="admin-form-label">Facebook Page URL</label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={settings.facebookUrl}
                  onChange={(e) => handleChange('facebookUrl', e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">YouTube Channel URL</label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={settings.youtubeUrl}
                  onChange={(e) => handleChange('youtubeUrl', e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Telegram Channel Link</label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={settings.telegramUrl}
                  onChange={(e) => handleChange('telegramUrl', e.target.value)}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">LinkedIn URL (Optional)</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={settings.linkedinUrl}
                    onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Instagram URL (Optional)</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={settings.instagramUrl}
                    onChange={(e) => handleChange('instagramUrl', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Email Settings */}
          {activeTab === 'email' && (
            <div>
              <h4 style={{ color: 'var(--admin-primary)', fontWeight: '700', marginBottom: '16px' }}>
                SMTP Mail Delivery Configuration
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">SMTP Server Host</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={settings.smtpHost}
                    onChange={(e) => handleChange('smtpHost', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">SMTP Port</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={settings.smtpPort}
                    onChange={(e) => handleChange('smtpPort', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Security */}
          {activeTab === 'security' && (
            <div>
              <h4 style={{ color: 'var(--admin-primary)', fontWeight: '700', marginBottom: '16px' }}>
                Access Control & Security
              </h4>
              <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <input
                  type="checkbox"
                  id="enableReg"
                  checked={settings.enableRegistration}
                  onChange={(e) => handleChange('enableRegistration', e.target.checked)}
                />
                <label htmlFor="enableReg" style={{ margin: 0, fontWeight: '600', cursor: 'pointer' }}>
                  Allow Public Student Self-Registration (/register)
                </label>
              </div>
              <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="enableCommentsCheck"
                  checked={settings.enableComments}
                  onChange={(e) => handleChange('enableComments', e.target.checked)}
                />
                <label htmlFor="enableCommentsCheck" style={{ margin: 0, fontWeight: '600', cursor: 'pointer' }}>
                  Enable Public Blog Comments & Moderation
                </label>
              </div>
            </div>
          )}

          {/* Tab 6: File Upload */}
          {activeTab === 'upload' && (
            <div>
              <h4 style={{ color: 'var(--admin-primary)', fontWeight: '700', marginBottom: '16px' }}>
                Media & Storage Constraints
              </h4>
              <div className="admin-form-group">
                <label className="admin-form-label">Max File Upload Size (Megabytes)</label>
                <input
                  type="number"
                  className="admin-form-control"
                  style={{ maxWidth: '240px' }}
                  value={settings.maxUploadSize}
                  onChange={(e) => handleChange('maxUploadSize', e.target.value)}
                />
                <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Standard institute server upload limit is 10MB - 20MB.
                </span>
              </div>
            </div>
          )}

          {/* Tab 7: Features */}
          {activeTab === 'features' && (
            <div>
              <h4 style={{ color: 'var(--admin-primary)', fontWeight: '700', marginBottom: '16px' }}>
                Interactive Website Modules
              </h4>
              <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <input
                  type="checkbox"
                  id="enableBanner"
                  checked={settings.enableBannerTicker}
                  onChange={(e) => handleChange('enableBannerTicker', e.target.checked)}
                />
                <label htmlFor="enableBanner" style={{ margin: 0, fontWeight: '600', cursor: 'pointer' }}>
                  Enable Scrolling Announcement Banner (Ticker on Homepage)
                </label>
              </div>
              <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="enableChat"
                  checked={settings.enableChatWidget}
                  onChange={(e) => handleChange('enableChatWidget', e.target.checked)}
                />
                <label htmlFor="enableChat" style={{ margin: 0, fontWeight: '600', cursor: 'pointer' }}>
                  Enable Floating Live Support Telegram / Chat Widget
                </label>
              </div>
            </div>
          )}

          {/* Tab 8: Appearance */}
          {activeTab === 'appearance' && (
            <div>
              <h4 style={{ color: 'var(--admin-primary)', fontWeight: '700', marginBottom: '16px' }}>
                Branding, Logo & Color Themes
              </h4>

              <div className="admin-form-group" style={{ marginBottom: '20px' }}>
                <label className="admin-form-label">Institute Official Logo</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    className="admin-form-control"
                    style={{ flex: '1', minWidth: '240px' }}
                    value={settings.logoUrl}
                    onChange={(e) => handleChange('logoUrl', e.target.value)}
                    placeholder="/images/logo.png"
                  />
                  <label className="admin-btn admin-btn-outline" style={{ whiteSpace: 'nowrap', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Upload size={14} />
                    <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                  </label>
                </div>
                {settings.logoUrl && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={settings.logoUrl}
                      alt="Logo Preview"
                      style={{ height: '48px', objectFit: 'contain', background: '#f8fafc', padding: '4px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Live Logo Preview</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Primary Brand Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="color"
                      value={settings.primaryColor || '#07294d'}
                      onChange={(e) => handleChange('primaryColor', e.target.value)}
                      style={{ width: '42px', height: '38px', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: 0 }}
                    />
                    <input
                      type="text"
                      className="admin-form-control"
                      value={settings.primaryColor}
                      onChange={(e) => handleChange('primaryColor', e.target.value)}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Secondary / Accent Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="color"
                      value={settings.secondaryColor || '#0c8b51'}
                      onChange={(e) => handleChange('secondaryColor', e.target.value)}
                      style={{ width: '42px', height: '38px', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: 0 }}
                    />
                    <input
                      type="text"
                      className="admin-form-control"
                      value={settings.secondaryColor}
                      onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 9: Academic */}
          {activeTab === 'academic' && (
            <div>
              <h4 style={{ color: 'var(--admin-primary)', fontWeight: '700', marginBottom: '16px' }}>
                Current Academic Term
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Current Academic Year</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={settings.currentAcademicYear}
                    onChange={(e) => {
                      handleChange('currentAcademicYear', e.target.value);
                      handleChange('academicYear', e.target.value);
                    }}
                    placeholder="2025-2026"
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Active Semester</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={settings.activeSemester}
                    onChange={(e) => handleChange('activeSemester', e.target.value)}
                    placeholder="Semester 1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bottom Save Action */}
          <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '20px', marginTop: '24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
            {saveSuccess && (
              <span style={{ color: 'var(--admin-accent)', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={16} /> Changes saved successfully!
              </span>
            )}
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={saving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
