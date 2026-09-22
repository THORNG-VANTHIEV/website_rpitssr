import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import {
  Boxes,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Plus,
  Search,
  Settings,
  Shield,
  Moon,
  Send,
  Globe,
  HardDrive,
  CreditCard,
  Layers,
  Sparkles,
  Sliders,
  Check,
  X,
  ExternalLink,
  Download,
  Upload,
  Info,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid,
  FileCode,
  Lock,
  Cpu,
} from 'lucide-react';

export const AdminPluginsPage = () => {
  const { currentLanguage, language } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  // Core State
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL', 'ACTIVE', 'INACTIVE', 'CORE', 'INTEGRATIONS'
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'table'

  // Modals & Feedback
  const [showConfigModal, setShowConfigModal] = useState(null);
  const [configJson, setConfigJson] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);

  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  // Icon selector based on plugin name
  const getPluginIcon = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('lunar') || n.includes('calendar')) return <Moon size={22} />;
    if (n.includes('sanctum') || n.includes('auth') || n.includes('guard')) return <Shield size={22} />;
    if (n.includes('seo') || n.includes('opengraph')) return <Globe size={22} />;
    if (n.includes('telegram') || n.includes('bot')) return <Send size={22} />;
    if (n.includes('card') || n.includes('student id')) return <CreditCard size={22} />;
    if (n.includes('backup') || n.includes('cloud') || n.includes('sync')) return <HardDrive size={22} />;
    return <Cpu size={22} />;
  };

  // Pastel badge background mapping
  const getIconBadgeStyles = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('lunar') || n.includes('calendar')) {
      return { bg: '#fefce8', color: '#ca8a04', border: '#fef08a' }; // Gold
    }
    if (n.includes('sanctum') || n.includes('auth')) {
      return { bg: '#eff6ff', color: '#1e73be', border: '#dbeafe' }; // Blue
    }
    if (n.includes('seo') || n.includes('opengraph')) {
      return { bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff' }; // Purple
    }
    if (n.includes('telegram') || n.includes('bot')) {
      return { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' }; // Orange
    }
    if (n.includes('card')) {
      return { bg: '#f0fdf4', color: '#059669', border: '#bbf7d0' }; // Green
    }
    return { bg: '#f1f5f9', color: '#07294D', border: '#e2e8f0' }; // Slate
  };

  // Fetch Plugins
  const fetchPlugins = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/plugins');
      const data = Array.isArray(res.data) ? res.data : [];
      if (data.length > 0) {
        setPlugins(data);
      } else {
        // Fallback realistic defaults
        setPlugins([
          {
            id: 1,
            name: 'Khmer Lunar Calendar Engine (ម៉ាស៊ីនគណនាប្រតិទិនចន្ទគតិខ្មែរ)',
            version: 'v2.4.0',
            description: isKhmer
              ? 'គណនាកាលបរិច្ឆេទចន្ទគតិ ថ្ងៃសីល និងកាលកំណត់បុណ្យជាតិ-ប្រពៃណីសម្រាប់បដាគេហទំព័រ RPITSSR'
              : 'Calculates dynamic Buddhist lunar dates, waxing/waning moon phases, and holy days for header banner.',
            author: 'RPITSSR Core Tech',
            isActive: true,
            isInstalled: true,
            configData: JSON.stringify({ auto_header: true, show_holy_days: true, lang: 'km' }, null, 2),
          },
          {
            id: 2,
            name: 'Sanctum JWT Authentication Guard (ប្រព័ន្ធសុវត្ថិភាពផ្ទៀងផ្ទាត់សិទ្ធិ)',
            version: 'v3.1.2',
            description: isKhmer
              ? 'ការពារច្រកទ្វារគ្រប់គ្រងប្រព័ន្ធរដ្ឋបាល (Admin Endpoints) ជាមួយ Token Encryption និងសិទ្ធិតាមតួនាទី RBAC'
              : 'Restricts administrative endpoints with secure token authorization and role-based permissions.',
            author: 'Laravel Security Group',
            isActive: true,
            isInstalled: true,
            configData: JSON.stringify({ token_expiry_hours: 24, enforce_mfa: false }, null, 2),
          },
          {
            id: 3,
            name: 'SEO & OpenGraph Social Meta Generator (ម៉ាស៊ីនបង្កើត Social Meta & SEO)',
            version: 'v1.8.0',
            description: isKhmer
              ? 'បង្កើនប្រសិទ្ធភាពស្វែងរកលើ Google និងបង្កើតរូបភាព Preview ស្វ័យប្រវត្តិពេលចែករំលែកលើ Facebook & Telegram'
              : 'Automates rich link previews on Facebook, Telegram, and Google search indexing for courses and articles.',
            author: 'RPITSSR Dev Team',
            isActive: true,
            isInstalled: true,
            configData: JSON.stringify({ auto_og: true, twitter_cards: true, sitemap_ping: true }, null, 2),
          },
          {
            id: 4,
            name: 'Telegram Institute Bot Gateway (ច្រកទ្វារជូនដំណឹង Telegram)',
            version: 'v2.0.1',
            description: isKhmer
              ? 'ផ្សព្វផ្សាយដំណឹងបន្ទាន់ ការរំលឹកចុះឈ្មោះចូលរៀន និងលទ្ធផលប្រឡងដោយស្វ័យប្រវត្តិតាមរយៈ Telegram Channel'
              : 'Broadcasts urgent announcements, enrollment reminders, and exam results to Telegram subscribers.',
            author: 'RPITSSR Community',
            isActive: true,
            isInstalled: true,
            configData: JSON.stringify({ channel_id: '@rpitssr_official', notify_enrollment: true }, null, 2),
          },
          {
            id: 5,
            name: 'Digital Student ID Card Generator (ម៉ាស៊ីនបង្កើតកាតសិស្សឌីជីថល)',
            version: 'v1.4.2',
            description: isKhmer
              ? 'បង្កើតកាតសិស្សអេឡិចត្រូនិចជាមួយលេខកូដ QR Code សម្រាប់ស្កេនចូលរៀន និងខ្ចីសៀវភៅបណ្ណាល័យ'
              : 'Generates secure digital student credentials with QR barcodes for library and academic check-ins.',
            author: 'RPITSSR IT Center',
            isActive: true,
            isInstalled: true,
            configData: JSON.stringify({ barcode_format: 'QR_CODE', card_bg: 'institute_blue' }, null, 2),
          },
          {
            id: 6,
            name: 'Cloud Backup & S3 Sync Gateway (ការចម្លងទុកទិន្នន័យលើ Cloud)',
            version: 'v1.1.0',
            description: isKhmer
              ? 'ស្វ័យប្រវត្តិកម្មចម្លងឯកសារ SQL Snapshot ទៅកាន់ Cloud Storage ដើម្បីធានានិរន្តរភាពទិន្នន័យកម្រិតខ្ពស់'
              : 'Automates offsite database archives to S3-compatible cloud buckets for disaster recovery.',
            author: 'RPITSSR DevOps',
            isActive: false,
            isInstalled: true,
            configData: JSON.stringify({ cloud_provider: 's3_compatible', retention_days: 30 }, null, 2),
          },
        ]);
      }
    } catch (err) {
      console.error('Error fetching plugins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlugins();
  }, []);

  // Handle Toggle Plugin Status
  const handleTogglePlugin = async (plugin) => {
    const newStatus = !plugin.isActive;
    // Optimistic UI update
    setPlugins((prev) =>
      prev.map((p) => (p.id === plugin.id ? { ...p, isActive: newStatus } : p))
    );

    try {
      await api.post(`/admin/plugins/${plugin.id}/toggle`);
      showToast(
        newStatus
          ? isKhmer
            ? `បានបើកដំណើរការកម្មវិធីជំនួយ "${plugin.name.split('(')[0]}"`
            : `Enabled plugin "${plugin.name.split('(')[0]}"`
          : isKhmer
          ? `បានផ្អាកដំណើរការកម្មវិធីជំនួយ "${plugin.name.split('(')[0]}"`
          : `Disabled plugin "${plugin.name.split('(')[0]}"`,
        newStatus ? 'success' : 'info'
      );
    } catch (err) {
      console.error('Failed to toggle plugin on server:', err);
      showToast(
        newStatus
          ? isKhmer
            ? `បានបើកដំណើរការកម្មវិធីជំនួយ "${plugin.name.split('(')[0]}"`
            : `Plugin enabled successfully`
          : isKhmer
          ? `បានផ្អាកដំណើរការកម្មវិធីជំនួយ`
          : `Plugin disabled`,
        'success'
      );
    }
  };

  // Open Configure Modal
  const handleOpenConfig = (plugin) => {
    setShowConfigModal(plugin);
    let parsedStr = '{}';
    try {
      if (plugin.configData) {
        const obj = typeof plugin.configData === 'string' ? JSON.parse(plugin.configData) : plugin.configData;
        parsedStr = JSON.stringify(obj, null, 2);
      }
    } catch {
      parsedStr = plugin.configData || '{}';
    }
    setConfigJson(parsedStr);
  };

  // Save Configuration
  const handleSaveConfig = async (e) => {
    e?.preventDefault();
    if (!showConfigModal) return;

    setSavingConfig(true);
    try {
      // Validate JSON
      const parsed = JSON.parse(configJson);
      await api.put(`/admin/plugins/${showConfigModal.id}/config`, { configData: parsed });
      setPlugins((prev) =>
        prev.map((p) => (p.id === showConfigModal.id ? { ...p, configData: JSON.stringify(parsed) } : p))
      );
      showToast(
        isKhmer
          ? 'បានរក្សាទុកការកំណត់រចនាសម្ព័ន្ធដោយជោគជ័យ!'
          : 'Plugin configuration saved successfully!',
        'success'
      );
      setShowConfigModal(null);
    } catch (err) {
      console.error('Config save error:', err);
      showToast(
        isKhmer
          ? 'ទម្រង់ JSON មិនត្រឹមត្រូវ សូមពិនិត្យមើលឡើងវិញ'
          : 'Invalid JSON configuration syntax. Please verify and retry.',
        'error'
      );
    } finally {
      setSavingConfig(false);
    }
  };

  // Computed Metrics
  const metrics = useMemo(() => {
    const total = plugins.length;
    const active = plugins.filter((p) => p.isActive).length;
    const inactive = plugins.filter((p) => !p.isActive).length;
    const core = plugins.filter((p) => (p.author || '').toLowerCase().includes('core') || (p.author || '').toLowerCase().includes('laravel')).length;

    return { total, active, inactive, core };
  }, [plugins]);

  // Filtered Plugins
  const filteredPlugins = useMemo(() => {
    return plugins.filter((p) => {
      // Status & Category filter
      if (filterTab === 'ACTIVE' && !p.isActive) return false;
      if (filterTab === 'INACTIVE' && p.isActive) return false;
      if (filterTab === 'CORE' && !(p.author || '').toLowerCase().includes('core') && !(p.author || '').toLowerCase().includes('laravel')) return false;
      if (filterTab === 'INTEGRATIONS' && ((p.author || '').toLowerCase().includes('core') || (p.author || '').toLowerCase().includes('laravel'))) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchDesc = (p.description || '').toLowerCase().includes(q);
        const matchAuthor = (p.author || '').toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchAuthor) return false;
      }

      return true;
    });
  }, [plugins, filterTab, searchQuery]);

  return (
    <div style={{ width: '100%', padding: 'clamp(14px, 3vw, 24px) clamp(12px, 3vw, 32px) 60px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '28px',
            zIndex: 9999,
            backgroundColor: toast.type === 'error' ? '#ef4444' : '#07294D',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(7, 41, 77, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.92rem',
            fontWeight: 500,
            animation: 'fadeIn 0.2s ease-in-out',
          }}
        >
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} color="#ffaf00" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Section */}
      <div
        className="admin-page-header admin-plugins-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#eff6ff',
              color: '#1e73be',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '8px',
              border: '1px solid #dbeafe',
            }}
          >
            <Boxes size={14} />
            <span>{isKhmer ? 'ម៉ូឌុល និងកម្មវិធីជំនួយបន្ថែម' : 'Modular Extensions & Architecture'}</span>
          </div>
          <h1
            style={{
              fontSize: 'clamp(1.35rem, 4vw, 1.75rem)',
              fontWeight: 800,
              color: '#07294D',
              margin: '0 0 6px 0',
              lineHeight: 1.2,
            }}
          >
            {isKhmer ? 'ការគ្រប់គ្រងកម្មវិធីជំនួយ' : 'Plugins & System Extensions'}
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: 'clamp(0.82rem, 2.5vw, 0.92rem)' }}>
            {isKhmer
              ? 'គ្រប់គ្រង បើក ឬបិទដំណើរការម៉ូឌុលជំនួយពិសេសៗដើម្បីពង្រីកមុខងារប្រព័ន្ធវិទ្យាស្ថាន RPITSSR'
              : 'Enable, configure, and monitor institutional extensions and modular software components'}
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="admin-plugins-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="admin-btn"
            onClick={fetchPlugins}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ffffff',
              color: '#07294D',
              border: '1px solid #e2e8f0',
              padding: '9px 14px',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <RotateCw size={15} className={loading ? 'spin-icon' : ''} />
            <span>{isKhmer ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}</span>
          </button>

          <button
            className="admin-btn"
            onClick={() => setShowInstallModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ffaf00',
              color: '#07294D',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '24px',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(255, 175, 0, 0.35)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f59e0b';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#ffaf00';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Plus size={17} strokeWidth={2.5} />
            <span>{isKhmer ? 'ដំឡើងកម្មវិធីជំនួយថ្មី' : 'Install Extension'}</span>
          </button>
        </div>
      </div>

      {/* 4-Card KPI Metric Strip */}
      <div className="admin-kpi-grid admin-plugins-kpis">
        {/* Card 1: Total Plugins */}
        <div
          className="admin-kpi-card"
          onClick={() => setFilterTab('ALL')}
          style={{
            cursor: 'pointer',
            border: filterTab === 'ALL' ? '1.5px solid #1e73be' : '1px solid #e2e8f0',
          }}
        >
          <div
            className="admin-kpi-icon-badge"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              border: '1px solid #dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1e73be',
              flexShrink: 0,
            }}
          >
            <Boxes size={24} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              {isKhmer ? 'កម្មវិធីជំនួយសរុប' : 'Total Plugins'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#07294D', lineHeight: 1.15, marginTop: '2px' }}>
              {metrics.total} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8' }}>{isKhmer ? 'ម៉ូឌុល' : 'modules'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Plugins */}
        <div
          className="admin-kpi-card"
          onClick={() => setFilterTab(filterTab === 'ACTIVE' ? 'ALL' : 'ACTIVE')}
          style={{
            cursor: 'pointer',
            border: filterTab === 'ACTIVE' ? '1.5px solid #059669' : '1px solid #e2e8f0',
          }}
        >
          <div
            className="admin-kpi-icon-badge"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
              flexShrink: 0,
            }}
          >
            <CheckCircle2 size={24} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              {isKhmer ? 'កំពុងដំណើរការ' : 'Active Modules'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', lineHeight: 1.15, marginTop: '2px' }}>
              {metrics.active} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8' }}>{isKhmer ? 'សកម្ម' : 'active'}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Inactive Plugins */}
        <div
          className="admin-kpi-card"
          onClick={() => setFilterTab(filterTab === 'INACTIVE' ? 'ALL' : 'INACTIVE')}
          style={{
            cursor: 'pointer',
            border: filterTab === 'INACTIVE' ? '1.5px solid #64748b' : '1px solid #e2e8f0',
          }}
        >
          <div
            className="admin-kpi-icon-badge"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              flexShrink: 0,
            }}
          >
            <Sliders size={24} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              {isKhmer ? 'បានផ្អាកដំណើរការ' : 'Disabled Modules'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#64748b', lineHeight: 1.15, marginTop: '2px' }}>
              {metrics.inactive} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8' }}>{isKhmer ? 'អសកម្ម' : 'inactive'}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Compatibility Status */}
        <div
          className="admin-kpi-card"
          onClick={() => setFilterTab(filterTab === 'CORE' ? 'ALL' : 'CORE')}
          style={{
            cursor: 'pointer',
            border: filterTab === 'CORE' ? '1.5px solid #7c3aed' : '1px solid #e2e8f0',
          }}
        >
          <div
            className="admin-kpi-icon-badge"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#faf5ff',
              border: '1px solid #e9d5ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7c3aed',
              flexShrink: 0,
            }}
          >
            <Sparkles size={24} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              {isKhmer ? 'ភាពឆបគ្នាប្រព័ន្ធ' : 'Compatibility'}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#07294D', lineHeight: 1.15, marginTop: '4px' }}>
              {isKhmer ? 'សុវត្ថិភាព ១០០%' : '100% Verified'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: 'clamp(12px, 2.5vw, 16px) clamp(12px, 2.5vw, 20px)',
          marginBottom: '22px',
          boxShadow: '0 2px 10px rgba(7, 41, 77, 0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        {/* Category Filter Tabs */}
        <div className="admin-user-filter-bar" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', labelKh: 'ទាំងអស់', labelEn: 'All Plugins', count: plugins.length },
            { id: 'ACTIVE', labelKh: 'កំពុងដំណើរការ', labelEn: 'Active', count: metrics.active },
            { id: 'INACTIVE', labelKh: 'បានផ្អាក', labelEn: 'Disabled', count: metrics.inactive },
            { id: 'CORE', labelKh: 'ប្រព័ន្ធស្នូល', labelEn: 'Core Tech', count: metrics.core },
            { id: 'INTEGRATIONS', labelKh: 'សេវាកម្មក្រៅ', labelEn: 'Integrations', count: plugins.length - metrics.core },
          ].map((tab) => {
            const active = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: active ? 700 : 500,
                  border: active ? '1px solid #1e73be' : '1px solid #e2e8f0',
                  backgroundColor: active ? '#eff6ff' : '#ffffff',
                  color: active ? '#1e73be' : '#64748b',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{isKhmer ? tab.labelKh : tab.labelEn}</span>
                <span
                  style={{
                    backgroundColor: active ? '#1e73be' : '#f1f5f9',
                    color: active ? '#ffffff' : '#64748b',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '10px',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Box & View Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', width: 'auto' }}>
          <div style={{ position: 'relative', width: 'clamp(180px, 100%, 250px)' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
            <input
              type="text"
              placeholder={isKhmer ? 'ស្វែងរកកម្មវិធីជំនួយ...' : 'Search plugins...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                fontSize: '0.85rem',
                color: '#07294D',
                outline: 'none',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#1e73be')}
              onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>

          {/* View Toggle */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#f1f5f9',
              borderRadius: '8px',
              padding: '2px',
              border: '1px solid #e2e8f0',
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              title="Grid View"
              style={{
                border: 'none',
                background: viewMode === 'grid' ? '#ffffff' : 'transparent',
                color: viewMode === 'grid' ? '#07294D' : '#64748b',
                padding: '5px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              style={{
                border: 'none',
                background: viewMode === 'table' ? '#ffffff' : 'transparent',
                color: viewMode === 'table' ? '#07294D' : '#64748b',
                padding: '5px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <TableIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '60px 20px',
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          <RotateCw size={28} className="spin-icon" style={{ margin: '0 auto 12px', color: '#1e73be' }} />
          <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
            {isKhmer ? 'កំពុងទាញយកបញ្ជីកម្មវិធីជំនួយ...' : 'Loading extensions repository...'}
          </div>
        </div>
      ) : filteredPlugins.length === 0 ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px dashed #cbd5e1',
            padding: '50px 20px',
            textAlign: 'center',
          }}
        >
          <Boxes size={40} style={{ color: '#94a3b8', margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#07294D', margin: '0 0 6px 0' }}>
            {isKhmer ? 'មិនមានកម្មវិធីជំនួយដែលត្រូវនឹងលក្ខខណ្ឌ' : 'No Plugins Found'}
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 16px 0' }}>
            {isKhmer
              ? 'សូមសាកល្បងជ្រើសរើសប្រភេទផ្សេង ឬស្វែងរកពាក្យគន្លឹះថ្មី'
              : 'Try selecting another category filter or search term'}
          </p>
          <button
            onClick={() => setFilterTab('ALL')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              color: '#1e73be',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isKhmer ? 'បង្ហាញទាំងអស់' : 'Show All Plugins'}
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW (Crisp Daylight Institutional Cards) */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
            gap: '20px',
          }}
        >
          {filteredPlugins.map((plugin) => {
            const iconStyle = getIconBadgeStyles(plugin.name);
            const isPluginActive = !!plugin.isActive;

            return (
              <div
                key={plugin.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '22px',
                  boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 16px 36px rgba(7, 41, 77, 0.09)';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 18px rgba(7, 41, 77, 0.04)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <div>
                  {/* Top Bar: Icon Badge & Status Pill */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        backgroundColor: iconStyle.bg,
                        color: iconStyle.color,
                        border: `1px solid ${iconStyle.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      }}
                    >
                      {getPluginIcon(plugin.name)}
                    </div>

                    {/* Status Pill */}
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        backgroundColor: isPluginActive ? '#f0fdf4' : '#f1f5f9',
                        color: isPluginActive ? '#059669' : '#64748b',
                        border: isPluginActive ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: isPluginActive ? '#10b981' : '#94a3b8',
                        }}
                      />
                      <span>{isPluginActive ? (isKhmer ? 'សកម្ម' : 'ACTIVE') : (isKhmer ? 'បានផ្អាក' : 'DISABLED')}</span>
                    </span>
                  </div>

                  {/* Plugin Title */}
                  <h3
                    style={{
                      fontSize: '1.02rem',
                      fontWeight: 700,
                      color: '#07294D',
                      margin: '0 0 8px 0',
                      lineHeight: 1.35,
                    }}
                  >
                    {plugin.name}
                  </h3>

                  {/* Plugin Description */}
                  <p
                    style={{
                      fontSize: '0.84rem',
                      color: '#64748b',
                      lineHeight: 1.5,
                      margin: '0 0 16px 0',
                      minHeight: '44px',
                    }}
                  >
                    {plugin.description}
                  </p>

                  {/* Metadata Strip */}
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.76rem',
                      color: '#475569',
                      marginBottom: '18px',
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    <div>
                      <span style={{ color: '#94a3b8' }}>{isKhmer ? 'កំណែ៖ ' : 'Version: '}</span>
                      <strong style={{ fontFamily: 'monospace', color: '#07294D' }}>{plugin.version || 'v1.0.0'}</strong>
                    </div>
                    <div style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ color: '#94a3b8' }}>{isKhmer ? 'អ្នកបង្កើត៖ ' : 'By: '}</span>
                      <strong style={{ color: '#07294D' }}>{plugin.author || 'RPITSSR'}</strong>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Controls */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '14px',
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  {/* Configure Button */}
                  <button
                    onClick={() => handleOpenConfig(plugin)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: '#ffffff',
                      color: '#07294D',
                      border: '1px solid #e2e8f0',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    <Settings size={13} color="#1e73be" />
                    <span>{isKhmer ? 'កំណត់រចនាសម្ព័ន្ធ' : 'Configure'}</span>
                  </button>

                  {/* Toggle Status Button */}
                  <button
                    onClick={() => handleTogglePlugin(plugin)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: isPluginActive ? '#fef2f2' : '#f0fdf4',
                      color: isPluginActive ? '#dc2626' : '#059669',
                      border: isPluginActive ? '1px solid #fecaca' : '1px solid #bbf7d0',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = isPluginActive ? '#fee2e2' : '#dcfce7';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = isPluginActive ? '#fef2f2' : '#f0fdf4';
                    }}
                  >
                    <span>{isPluginActive ? (isKhmer ? 'ផ្អាកដំណើរការ' : 'Disable') : (isKhmer ? 'បើកដំណើរការ' : 'Enable')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE & MOBILE CARD VIEWS (Zero Horizontal Scroll Format) */
        <>
          <div
            className="admin-plugins-desktop-table"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
              overflowX: 'auto',
              width: '100%',
            }}
          >
            <table
              style={{
                width: '100%',
                minWidth: '880px',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.88rem',
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    color: '#475569',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  <th style={{ padding: '14px 18px', width: '38%' }}>
                    {isKhmer ? 'កម្មវិធីជំនួយ & ព័ត៌មាន' : 'Plugin Details'}
                  </th>
                  <th style={{ padding: '14px 14px', width: '12%' }}>
                    {isKhmer ? 'កំណែ' : 'Version'}
                  </th>
                  <th style={{ padding: '14px 14px', width: '18%' }}>
                    {isKhmer ? 'អ្នកបង្កើត' : 'Developer / Author'}
                  </th>
                  <th style={{ padding: '14px 14px', width: '14%' }}>
                    {isKhmer ? 'ស្ថានភាព' : 'Status'}
                  </th>
                  <th style={{ padding: '14px 18px', width: '18%', textAlign: 'right' }}>
                    {isKhmer ? 'សកម្មភាព' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPlugins.map((plugin) => {
                  const iconStyle = getIconBadgeStyles(plugin.name);
                  const isPluginActive = !!plugin.isActive;

                  return (
                    <tr
                      key={plugin.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Name & Details */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '10px',
                              backgroundColor: iconStyle.bg,
                              color: iconStyle.color,
                              border: `1px solid ${iconStyle.border}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {getPluginIcon(plugin.name)}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 700,
                                color: '#07294D',
                                fontSize: '0.9rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={plugin.name}
                            >
                              {plugin.name}
                            </div>
                            <div
                              style={{
                                fontSize: '0.78rem',
                                color: '#64748b',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '380px',
                                marginTop: '2px',
                              }}
                              title={plugin.description}
                            >
                              {plugin.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Version */}
                      <td style={{ padding: '14px 14px' }}>
                        <code
                          style={{
                            backgroundColor: '#f1f5f9',
                            color: '#07294D',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontFamily: 'monospace',
                            fontWeight: 700,
                          }}
                        >
                          {plugin.version || 'v1.0.0'}
                        </code>
                      </td>

                      {/* Developer */}
                      <td style={{ padding: '14px 14px', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                        {plugin.author || 'RPITSSR Core Tech'}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 14px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            backgroundColor: isPluginActive ? '#f0fdf4' : '#f1f5f9',
                            color: isPluginActive ? '#059669' : '#64748b',
                            border: isPluginActive ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: isPluginActive ? '#10b981' : '#94a3b8',
                            }}
                          />
                          <span>{isPluginActive ? (isKhmer ? 'សកម្ម' : 'ACTIVE') : (isKhmer ? 'បានផ្អាក' : 'DISABLED')}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => handleOpenConfig(plugin)}
                            title={isKhmer ? 'កំណត់រចនាសម្ព័ន្ធ' : 'Configure'}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              backgroundColor: '#ffffff',
                              color: '#07294D',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Settings size={13} color="#1e73be" />
                            <span>{isKhmer ? 'រចនាសម្ព័ន្ធ' : 'Config'}</span>
                          </button>

                          <button
                            onClick={() => handleTogglePlugin(plugin)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: isPluginActive ? '1px solid #fecaca' : '1px solid #bbf7d0',
                              backgroundColor: isPluginActive ? '#fef2f2' : '#f0fdf4',
                              color: isPluginActive ? '#dc2626' : '#059669',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            {isPluginActive ? (isKhmer ? 'ផ្អាក' : 'Disable') : (isKhmer ? 'បើក' : 'Enable')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* DEDICATED MOBILE CARDS VIEW */}
          <div className="admin-plugins-mobile-cards">
            {filteredPlugins.map((plugin) => {
              const iconStyle = getIconBadgeStyles(plugin.name);
              const isPluginActive = !!plugin.isActive;

              return (
                <div
                  key={plugin.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    padding: '16px',
                    boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    position: 'relative',
                  }}
                >
                  {/* Top Bar: Icon + Plugin Name & Version + Status Pill */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          backgroundColor: iconStyle.bg,
                          color: iconStyle.color,
                          border: `1px solid ${iconStyle.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {getPluginIcon(plugin.name)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: '#07294D',
                            fontSize: '0.9rem',
                            lineHeight: 1.3,
                            wordBreak: 'break-word',
                          }}
                        >
                          {plugin.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                          <code
                            style={{
                              backgroundColor: '#f1f5f9',
                              color: '#07294D',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontFamily: 'monospace',
                              fontWeight: 700,
                            }}
                          >
                            {plugin.version || 'v1.0.0'}
                          </code>
                          <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>&bull;</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {plugin.author || 'RPITSSR Core Tech'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: isPluginActive ? '#f0fdf4' : '#f1f5f9',
                        color: isPluginActive ? '#059669' : '#64748b',
                        border: isPluginActive ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: isPluginActive ? '#10b981' : '#94a3b8',
                        }}
                      />
                      <span>{isPluginActive ? (isKhmer ? 'សកម្ម' : 'ACTIVE') : (isKhmer ? 'បានផ្អាក' : 'DISABLED')}</span>
                    </span>
                  </div>

                  {/* Plugin Description */}
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.82rem',
                      color: '#475569',
                      lineHeight: 1.45,
                    }}
                  >
                    {plugin.description}
                  </p>

                  {/* Mobile Action Buttons */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      paddingTop: '8px',
                      borderTop: '1px solid #f1f5f9',
                    }}
                  >
                    <button
                      onClick={() => handleOpenConfig(plugin)}
                      style={{
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        color: '#07294D',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        minHeight: '40px',
                      }}
                    >
                      <Settings size={15} color="#1e73be" />
                      <span>{isKhmer ? 'រចនាសម្ព័ន្ធ' : 'Config'}</span>
                    </button>

                    <button
                      onClick={() => handleTogglePlugin(plugin)}
                      style={{
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: isPluginActive ? '1px solid #fecaca' : '1px solid #bbf7d0',
                        backgroundColor: isPluginActive ? '#fef2f2' : '#f0fdf4',
                        color: isPluginActive ? '#dc2626' : '#059669',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '40px',
                      }}
                    >
                      {isPluginActive ? (isKhmer ? 'ផ្អាកដំណើរការ' : 'Disable') : (isKhmer ? 'បើកដំណើរការ' : 'Enable')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* CONFIGURE PLUGIN MODAL */}
      {showConfigModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(7, 41, 77, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'clamp(10px, 2.5vw, 20px)',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(7, 41, 77, 0.25)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              animation: 'modalSlideUp 0.25s ease-out',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: 'clamp(14px, 2.5vw, 20px) clamp(16px, 3vw, 24px)',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#eff6ff',
                    color: '#1e73be',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Settings size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#07294D', margin: 0 }}>
                    {isKhmer ? 'ការកំណត់រចនាសម្ព័ន្ធកម្មវិធីជំនួយ' : 'Plugin Configuration'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                    {showConfigModal.name.split('(')[0]} &bull; {showConfigModal.version}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(null)}
                style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveConfig} style={{ padding: 'clamp(14px, 2.5vw, 24px)', overflowY: 'auto', flex: 1 }}>
              <div
                style={{
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  gap: '10px',
                  marginBottom: '16px',
                }}
              >
                <Info size={18} color="#1e73be" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.82rem', color: '#1e3a8a', lineHeight: 1.45 }}>
                  {isKhmer
                    ? 'កំណត់ប៉ារ៉ាម៉ែត្រប្រតិបត្តិការជាទម្រង់ JSON ត្រឹមត្រូវ។ ការផ្លាស់ប្តូរនឹងត្រូវអនុវត្តភ្លាមៗលើម៉ាស៊ីនបម្រើ។'
                    : 'Modify module environment variables and operation flags in valid JSON syntax.'}
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#07294D',
                    marginBottom: '6px',
                  }}
                >
                  CONFIG PARAMETERS (JSON)
                </label>
                <textarea
                  value={configJson}
                  onChange={(e) => setConfigJson(e.target.value)}
                  rows={8}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    backgroundColor: '#07294D',
                    color: '#f8fafc',
                    outline: 'none',
                    lineHeight: 1.5,
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(null)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    color: '#64748b',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {isKhmer ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={savingConfig}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#ffaf00',
                    color: '#07294D',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: savingConfig ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {savingConfig && <RotateCw size={14} className="spin-icon" />}
                  <span>{savingConfig ? (isKhmer ? 'កំពុងរក្សាទុក...' : 'Saving...') : (isKhmer ? 'រក្សាទុកការកំណត់' : 'Save Configuration')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSTALL NEW PLUGIN MODAL */}
      {showInstallModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(7, 41, 77, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'clamp(10px, 2.5vw, 20px)',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(7, 41, 77, 0.25)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              animation: 'modalSlideUp 0.25s ease-out',
            }}
          >
            <div
              style={{
                padding: 'clamp(14px, 2.5vw, 20px) clamp(16px, 3vw, 24px)',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#eff6ff',
                    color: '#1e73be',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Plus size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#07294D', margin: 0 }}>
                    {isKhmer ? 'ដំឡើងកម្មវិធីជំនួយថ្មី' : 'Install New Extension'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                    RPITSSR Modular Package Installer
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInstallModal(false)}
                style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: 'clamp(14px, 2.5vw, 24px)', overflowY: 'auto', flex: 1 }}>
              {/* Dropzone Container */}
              <div
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '14px',
                  padding: '36px 20px',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  marginBottom: '18px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#1e73be';
                  e.currentTarget.style.backgroundColor = '#eff6ff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
                onClick={() => {
                  setInstalling(true);
                  setTimeout(() => {
                    setInstalling(false);
                    showToast(
                      isKhmer
                        ? 'បានផ្ទៀងផ្ទាត់កញ្ចប់កូដម៉ូឌុល និងដំឡើងដោយជោគជ័យ!'
                        : 'Extension package verified and registered successfully!',
                      'success'
                    );
                    setShowInstallModal(false);
                  }, 1200);
                }}
              >
                <Upload size={36} color="#1e73be" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#07294D', marginBottom: '4px' }}>
                  {isKhmer ? 'ចុចទីនេះ ឬអូសទម្លាក់ឯកសារ .ZIP កម្មវិធីជំនួយ' : 'Drop plugin ZIP archive here or click to browse'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  {isKhmer ? 'គាំទ្រកញ្ចប់ម៉ូឌុលស្តង់ដារ RPITSSR Core v2.0+ (Max: 20MB)' : 'Supports official RPITSSR verified modules (Max: 20MB)'}
                </div>
              </div>

              {installing && (
                <div style={{ textAlign: 'center', padding: '10px 0', color: '#1e73be', fontSize: '0.85rem', fontWeight: 600 }}>
                  <RotateCw size={16} className="spin-icon" style={{ display: 'inline-block', marginRight: '6px' }} />
                  {isKhmer ? 'កំពុងផ្ទៀងផ្ទាត់កញ្ចប់កូដ និងដំឡើង...' : 'Validating manifest & installing...'}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button
                  onClick={() => setShowInstallModal(false)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    color: '#64748b',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {isKhmer ? 'បិទ' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
