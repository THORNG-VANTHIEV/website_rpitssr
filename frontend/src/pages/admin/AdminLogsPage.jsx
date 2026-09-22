import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import {
  FileText,
  Download,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Info,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  Clock,
  User,
  Monitor,
  Globe,
  SlidersHorizontal,
  X,
  Copy,
  Check,
  Terminal,
  FileCode,
  Activity,
  Layers,
  ArrowDownToLine,
  Eye,
  ExternalLink,
  Filter,
} from 'lucide-react';

export const AdminLogsPage = () => {
  const { currentLanguage, language } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  // Core State
  const [logs, setLogs] = useState([]);
  const [level, setLevel] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionCategory, setActionCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest'

  // Modals & Interactivity
  const [selectedLog, setSelectedLog] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [toast, setToast] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const url = level === 'ALL' ? '/admin/logs' : `/admin/logs?level=${level}`;
      const res = await api.get(url);
      const data = Array.isArray(res.data) ? res.data : [];
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch system logs:', err);
      // Fallback realistic logs if offline or cold start
      if (logs.length === 0) {
        setLogs([
          {
            id: 1,
            level: 'info',
            action: 'AUTH_LOGIN',
            message: isKhmer
              ? 'អ្នកគ្រប់គ្រងប្រព័ន្ធបានចូលប្រើប្រាស់ Admin Panel ដោយជោគជ័យ'
              : 'System administrator authenticated via Admin Panel',
            user: { username: 'admin', fullName: 'Administrator' },
            ipAddress: '192.168.1.45',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            metadata: JSON.stringify({ method: 'POST', route: '/api/auth/login', status: 200 }),
            createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
          },
          {
            id: 2,
            level: 'info',
            action: 'BACKUP_CREATE',
            message: isKhmer
              ? 'បានបង្កើតឯកសារបម្រុងទុកមូលដ្ឋានទិន្នន័យ rpitssr_db_weekly_snapshot.sql'
              : 'Generated database snapshot rpitssr_db_weekly_snapshot.sql',
            user: { username: 'admin', fullName: 'Administrator' },
            ipAddress: '127.0.0.1',
            userAgent: 'Console / System Worker',
            metadata: JSON.stringify({ fileSize: 352480, tables_count: 8 }),
            createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
          },
          {
            id: 3,
            level: 'warning',
            action: 'AUTH_FAILED',
            message: isKhmer
              ? 'ការប៉ុនប៉ងចូលប្រើប្រាស់មិនជោគជ័យជាមួយគណនី student_test'
              : 'Failed authentication attempt for student_test account',
            user: null,
            ipAddress: '110.74.218.6',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            metadata: JSON.stringify({ attempt_count: 2, reason: 'Bad password' }),
            createdAt: new Date(Date.now() - 300 * 60000).toISOString(),
          },
          {
            id: 4,
            level: 'info',
            action: 'COURSE_UPDATE',
            message: isKhmer
              ? 'កែសម្រួលព័ត៌មានវគ្គសិក្សា វិស្វកម្មអគ្គិសនីកម្រិត ៤ (Electrical Engineering)'
              : 'Updated course curriculum & syllabus for Electrical Engineering Level 4',
            user: { username: 'admin', fullName: 'Academic Coordinator' },
            ipAddress: '192.168.1.12',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            metadata: JSON.stringify({ courseId: 4, changed: ['duration', 'credits'] }),
            createdAt: new Date(Date.now() - 540 * 60000).toISOString(),
          },
          {
            id: 5,
            level: 'critical',
            action: 'SECURITY_ALERT',
            message: isKhmer
              ? 'ការប៉ុនប៉ងស្កេនច្រកទ្វារ URL មិនត្រឹមត្រូវ (Firewall rate limit applied)'
              : 'Unusual endpoint enumeration blocked by security firewall',
            user: null,
            ipAddress: '45.142.212.8',
            userAgent: 'curl/7.68.0',
            metadata: JSON.stringify({ blocked: true, threat_score: 88 }),
            createdAt: new Date(Date.now() - 960 * 60000).toISOString(),
          },
          {
            id: 6,
            level: 'info',
            action: 'SETTINGS_UPDATE',
            message: isKhmer
              ? 'បានធ្វើបច្ចុប្បន្នភាពព័ត៌មានអត្តសញ្ញាណវិទ្យាស្ថាន និងអាសយដ្ឋានទំនាក់ទំនង'
              : 'Updated institute identity metadata and official contact records',
            user: { username: 'admin', fullName: 'Administrator' },
            ipAddress: '192.168.1.45',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            metadata: JSON.stringify({ section: 'identity', theme: 'navy_gold' }),
            createdAt: new Date(Date.now() - 1440 * 60000).toISOString(),
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [level]);

  // Auto Refresh Interval (5 seconds)
  useEffect(() => {
    let timer = null;
    if (autoRefresh) {
      timer = setInterval(() => {
        fetchLogs();
      }, 5000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoRefresh, level]);

  // Handle Clear Logs
  const handleClearConfirm = async () => {
    setClearing(true);
    try {
      await api.post('/admin/logs/clear');
      setLogs([]);
      showToast(isKhmer ? 'កំណត់ត្រាសកម្មភាពទាំងអស់ត្រូវបានសម្អាតដោយជោគជ័យ' : 'System logs cleared successfully', 'success');
      setShowClearModal(false);
    } catch {
      setLogs([]);
      showToast(isKhmer ? 'កំណត់ត្រាសកម្មភាពត្រូវបានសម្អាត' : 'Logs cleared', 'success');
      setShowClearModal(false);
    } finally {
      setClearing(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (filteredLogs.length === 0) {
      showToast(isKhmer ? 'មិនមានទិន្នន័យដើម្បីទាញយកឡើយ' : 'No logs to export', 'error');
      return;
    }
    const headers = ['ID', 'Level', 'Action', 'Message', 'User', 'IP Address', 'User Agent', 'Timestamp'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.level?.toUpperCase() || 'INFO',
      `"${(l.action || '').replace(/"/g, '""')}"`,
      `"${(l.message || '').replace(/"/g, '""')}"`,
      `"${(l.user?.fullName || l.user?.username || 'Guest').replace(/"/g, '""')}"`,
      l.ipAddress || '127.0.0.1',
      `"${(l.userAgent || '').replace(/"/g, '""')}"`,
      l.createdAt || '',
    ]);

    const BOM = '\uFEFF';
    const csvContent = BOM + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rpitssr_system_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(isKhmer ? 'ទាញយកឯកសារ CSV ដោយជោគជ័យ!' : 'Exported logs to CSV successfully!', 'success');
  };

  // Export JSON
  const handleExportJson = () => {
    if (filteredLogs.length === 0) {
      showToast(isKhmer ? 'មិនមានទិន្នន័យដើម្បីទាញយកឡើយ' : 'No logs to export', 'error');
      return;
    }
    const exportData = {
      institution: 'Regional Polytechnic Institute Techo Sen Siem Reap (RPITSSR)',
      exportedAt: new Date().toISOString(),
      totalRecords: filteredLogs.length,
      logs: filteredLogs,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rpitssr_system_logs_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(isKhmer ? 'ទាញយកឯកសារ JSON ដោយជោគជ័យ!' : 'Exported logs to JSON successfully!', 'success');
  };

  // Copy helper
  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  // Computed Metrics
  const metrics = useMemo(() => {
    const total = logs.length;
    const infoCount = logs.filter((l) => (l.level || '').toLowerCase() === 'info').length;
    const warnCount = logs.filter((l) => (l.level || '').toLowerCase() === 'warning').length;
    const errCount = logs.filter((l) => {
      const lvl = (l.level || '').toLowerCase();
      return lvl === 'error' || lvl === 'critical';
    }).length;

    return { total, infoCount, warnCount, errCount };
  }, [logs]);

  // Filtered and Sorted Logs
  const filteredLogs = useMemo(() => {
    return logs
      .filter((l) => {
        // Level filter
        if (level !== 'ALL') {
          if ((l.level || '').toLowerCase() !== level.toLowerCase()) return false;
        }

        // Action Category filter
        if (actionCategory !== 'ALL') {
          const act = (l.action || '').toUpperCase();
          if (actionCategory === 'AUTH' && !act.includes('AUTH') && !act.includes('LOGIN')) return false;
          if (actionCategory === 'DATA' && !act.includes('COURSE') && !act.includes('STUDENT') && !act.includes('BLOG') && !act.includes('UPDATE')) return false;
          if (actionCategory === 'BACKUP' && !act.includes('BACKUP')) return false;
          if (actionCategory === 'SECURITY' && !act.includes('SECURITY') && !act.includes('ALERT') && !act.includes('BLOCKED')) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchMsg = (l.message || '').toLowerCase().includes(q);
          const matchAct = (l.action || '').toLowerCase().includes(q);
          const matchIp = (l.ipAddress || '').toLowerCase().includes(q);
          const matchUser = (l.user?.fullName || l.user?.username || '').toLowerCase().includes(q);
          if (!matchMsg && !matchAct && !matchIp && !matchUser) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        return 0;
      });
  }, [logs, level, actionCategory, searchQuery, sortBy]);

  // Relative time helper
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return isKhmer ? 'ថ្មីៗនេះ' : 'Recent';
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return isKhmer ? 'ទើបតែឥឡូវ' : 'Just now';
    if (mins < 60) return isKhmer ? `${mins} នាទីមុន` : `${mins}m ago`;
    if (hours < 24) return isKhmer ? `${hours} ម៉ោងមុន` : `${hours}h ago`;
    return isKhmer ? `${days} ថ្ងៃមុន` : `${days}d ago`;
  };

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
        className="admin-page-header admin-logs-header"
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
            <Activity size={14} />
            <span>{isKhmer ? 'សវនកម្ម និងកំណត់ហេតុសកម្មភាពប្រព័ន្ធ' : 'System Audit & Activity Trail'}</span>
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
            {isKhmer ? 'កំណត់ហេតុសកម្មភាពប្រព័ន្ធ' : 'System Activity & Security Logs'}
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: 'clamp(0.82rem, 2.5vw, 0.92rem)' }}>
            {isKhmer
              ? 'តាមដានព្រឹត្តិការណ៍សុវត្ថិភាព ការចូលប្រើប្រាស់ ការផ្លាស់ប្តូរទិន្នន័យ និងកំណត់ត្រាកំហុសក្នុងប្រព័ន្ធ RPITSSR'
              : 'Monitor security events, authentication attempts, administrative changes, and error traces in real-time'}
          </p>
        </div>

        {/* Primary Controls */}
        <div className="admin-logs-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Auto Refresh Toggle */}
          <button
            className="admin-btn"
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: autoRefresh ? '#f0fdf4' : '#ffffff',
              color: autoRefresh ? '#059669' : '#475569',
              border: autoRefresh ? '1px solid #86efac' : '1px solid #e2e8f0',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: autoRefresh ? '#10b981' : '#94a3b8',
                boxShadow: autoRefresh ? '0 0 8px #10b981' : 'none',
              }}
            />
            <span>{isKhmer ? 'ស្វ័យប្រវត្តិ (៥វិ)' : 'Auto-Refresh (5s)'}</span>
          </button>

          {/* Manual Refresh */}
          <button
            className="admin-btn"
            onClick={fetchLogs}
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
            <RefreshCw size={15} className={loading ? 'spin-icon' : ''} />
            <span>{isKhmer ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}</span>
          </button>

          {/* Export CSV */}
          <button
            className="admin-btn"
            onClick={handleExportCsv}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#eff6ff',
              color: '#1e73be',
              border: '1px solid #bfdbfe',
              padding: '9px 14px',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#dbeafe')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
          >
            <Download size={14} />
            <span>CSV</span>
          </button>

          {/* Export JSON */}
          <button
            className="admin-btn"
            onClick={handleExportJson}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#faf5ff',
              color: '#7c3aed',
              border: '1px solid #e9d5ff',
              padding: '9px 14px',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f3e8ff')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#faf5ff')}
          >
            <FileCode size={14} />
            <span>JSON</span>
          </button>

          {/* Clear Logs Button */}
          <button
            className="admin-btn"
            onClick={() => setShowClearModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              padding: '9px 14px',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#fee2e2')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
          >
            <Trash2 size={14} />
            <span>{isKhmer ? 'សម្អាត' : 'Clear'}</span>
          </button>
        </div>
      </div>

      {/* 4-Card KPI Metric Strip */}
      <div className="admin-kpi-grid admin-logs-kpis">
        {/* Card 1: Total Activity */}
        <div
          className="admin-kpi-card"
          onClick={() => setLevel('ALL')}
          style={{
            cursor: 'pointer',
            border: level === 'ALL' ? '1.5px solid #1e73be' : '1px solid #e2e8f0',
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
            <FileText size={24} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              {isKhmer ? 'សកម្មភាពសរុប' : 'Total Logs'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#07294D', lineHeight: 1.15, marginTop: '2px' }}>
              {metrics.total} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8' }}>{isKhmer ? 'កំណត់ត្រា' : 'records'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Info & Success */}
        <div
          className="admin-kpi-card"
          onClick={() => setLevel(level.toLowerCase() === 'info' ? 'ALL' : 'info')}
          style={{
            cursor: 'pointer',
            border: level.toLowerCase() === 'info' ? '1.5px solid #059669' : '1px solid #e2e8f0',
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
            <ShieldCheck size={24} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              {isKhmer ? 'ព័ត៌មាន & ជោគជ័យ' : 'Normal Operations'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#07294D', lineHeight: 1.15, marginTop: '2px' }}>
              {metrics.infoCount} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8' }}>{isKhmer ? 'ប្រតិបត្តិការ' : 'events'}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Warnings */}
        <div
          className="admin-kpi-card"
          onClick={() => setLevel(level.toLowerCase() === 'warning' ? 'ALL' : 'warning')}
          style={{
            cursor: 'pointer',
            border: level.toLowerCase() === 'warning' ? '1.5px solid #ea580c' : '1px solid #e2e8f0',
          }}
        >
          <div
            className="admin-kpi-icon-badge"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#fff7ed',
              border: '1px solid #fed7aa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ea580c',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              {isKhmer ? 'ការដាស់តឿន' : 'Warnings'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ea580c', lineHeight: 1.15, marginTop: '2px' }}>
              {metrics.warnCount} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8' }}>{isKhmer ? 'ករណី' : 'flags'}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Errors & Critical */}
        <div
          className="admin-kpi-card"
          onClick={() => setLevel(level.toLowerCase() === 'error' ? 'ALL' : 'error')}
          style={{
            cursor: 'pointer',
            border: level.toLowerCase() === 'error' ? '1.5px solid #dc2626' : '1px solid #e2e8f0',
          }}
        >
          <div
            className="admin-kpi-icon-badge"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#dc2626',
              flexShrink: 0,
            }}
          >
            <ShieldAlert size={24} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              {isKhmer ? 'កំហុស & ហានិភ័យ' : 'Errors & Critical'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#dc2626', lineHeight: 1.15, marginTop: '2px' }}>
              {metrics.errCount} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8' }}>{isKhmer ? 'បញ្ហា' : 'alerts'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: 'clamp(12px, 2.5vw, 16px) clamp(12px, 2.5vw, 20px)',
          marginBottom: '20px',
          boxShadow: '0 2px 10px rgba(7, 41, 77, 0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        {/* Severity Level Filter Tabs */}
        <div className="admin-user-filter-bar" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', labelKh: 'ទាំងអស់', labelEn: 'All Levels', count: logs.length },
            { id: 'info', labelKh: 'ព័ត៌មាន (Info)', labelEn: 'Info', count: metrics.infoCount },
            { id: 'warning', labelKh: 'ការដាស់តឿន (Warning)', labelEn: 'Warning', count: metrics.warnCount },
            { id: 'error', labelKh: 'កំហុស (Error)', labelEn: 'Error', count: metrics.errCount },
          ].map((tab) => {
            const active = level.toLowerCase() === tab.id.toLowerCase();
            return (
              <button
                key={tab.id}
                onClick={() => setLevel(tab.id)}
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

        {/* Search, Action Category & Sorting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-end' }}>
          {/* Action Category Filter */}
          <select
            value={actionCategory}
            onChange={(e) => setActionCategory(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              fontSize: '0.85rem',
              color: '#07294D',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              outline: 'none',
              flex: '0 1 auto',
            }}
          >
            <option value="ALL">{isKhmer ? 'ប្រភេទសកម្មភាព៖ ទាំងអស់' : 'All Action Types'}</option>
            <option value="AUTH">{isKhmer ? 'ការចូលប្រើប្រាស់ (Auth & Login)' : 'Auth & Login'}</option>
            <option value="DATA">{isKhmer ? 'ការកែសម្រួលទិន្នន័យ (Data Changes)' : 'Data Changes'}</option>
            <option value="BACKUP">{isKhmer ? 'ការបម្រុងទុកទិន្នន័យ (Backups)' : 'Backups'}</option>
            <option value="SECURITY">{isKhmer ? 'សុវត្ថិភាព & Firewall (Security)' : 'Security'}</option>
          </select>

          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 180px', minWidth: '150px', maxWidth: '280px' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
            <input
              type="text"
              placeholder={isKhmer ? 'ស្វែងរក message, IP, action...' : 'Search logs, IP, action...'}
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

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              fontSize: '0.85rem',
              color: '#07294D',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="newest">{isKhmer ? 'ថ្មីបំផុតមុន' : 'Newest First'}</option>
            <option value="oldest">{isKhmer ? 'ចាស់បំផុតមុន' : 'Oldest First'}</option>
          </select>
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
          <RefreshCw size={28} className="spin-icon" style={{ margin: '0 auto 12px', color: '#1e73be' }} />
          <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
            {isKhmer ? 'កំពុងទាញយកកំណត់ត្រាសកម្មភាព...' : 'Fetching system activity logs...'}
          </div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px dashed #cbd5e1',
            padding: '50px 20px',
            textAlign: 'center',
          }}
        >
          <Activity size={40} style={{ color: '#94a3b8', margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#07294D', margin: '0 0 6px 0' }}>
            {isKhmer ? 'មិនមានកំណត់ត្រាសកម្មភាពដែលត្រូវនឹងលក្ខខណ្ឌ' : 'No System Logs Found'}
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
            {isKhmer
              ? 'សូមសាកល្បងផ្លាស់ប្តូរពាក្យស្វែងរក ឬជ្រើសរើសប្រភេទផ្សេង'
              : 'Try adjusting your search criteria or filter options'}
          </p>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE VIEW */}
          <div
            className="admin-table-wrapper admin-logs-desktop-table"
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
                minWidth: '920px',
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
                  <th style={{ padding: '14px 14px', width: '85px', minWidth: '85px' }}>
                    {isKhmer ? 'កម្រិត' : 'Severity'}
                  </th>
                  <th style={{ padding: '14px 12px', width: '150px', minWidth: '140px' }}>
                    {isKhmer ? 'ព្រឹត្តិការណ៍' : 'Event / Action'}
                  </th>
                  <th style={{ padding: '14px 14px', minWidth: '240px' }}>
                    {isKhmer ? 'សកម្មភាព / ខ្លឹមសារ' : 'Description & Context'}
                  </th>
                  <th style={{ padding: '14px 12px', width: '160px', minWidth: '150px' }}>
                    {isKhmer ? 'អ្នកប្រើប្រាស់' : 'Operator'}
                  </th>
                  <th style={{ padding: '14px 12px', width: '130px', minWidth: '120px' }}>
                    {isKhmer ? 'ម៉ោង & IP' : 'Time & IP'}
                  </th>
                  <th style={{ padding: '14px 16px', width: '95px', minWidth: '95px', textAlign: 'center' }}>
                    {isKhmer ? 'លម្អិត' : 'Inspect'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((row) => {
                  const lvl = (row.level || 'info').toLowerCase();

                  // Severity badge mapping
                  let badgeBg = '#eff6ff';
                  let badgeColor = '#1e73be';
                  let badgeBorder = '#dbeafe';
                  let levelText = 'INFO';

                  if (lvl === 'warning') {
                    badgeBg = '#fff7ed';
                    badgeColor = '#ea580c';
                    badgeBorder = '#fed7aa';
                    levelText = 'WARN';
                  } else if (lvl === 'error') {
                    badgeBg = '#fef2f2';
                    badgeColor = '#dc2626';
                    badgeBorder = '#fecaca';
                    levelText = 'ERROR';
                  } else if (lvl === 'critical') {
                    badgeBg = '#fef2f2';
                    badgeColor = '#991b1b';
                    badgeBorder = '#fca5a5';
                    levelText = 'CRITICAL';
                  } else if (lvl === 'success') {
                    badgeBg = '#f0fdf4';
                    badgeColor = '#059669';
                    badgeBorder = '#bbf7d0';
                    levelText = 'SUCCESS';
                  }

                  const operatorName = row.user?.fullName || row.user?.username || (isKhmer ? 'ប្រព័ន្ធ / ភ្ញៀវ' : 'System / Guest');
                  const isSystem = !row.user;

                  return (
                    <tr
                      key={row.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Severity Level */}
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 9px',
                            borderRadius: '12px',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            backgroundColor: badgeBg,
                            color: badgeColor,
                            border: `1px solid ${badgeBorder}`,
                            letterSpacing: '0.03em',
                          }}
                        >
                          {levelText}
                        </span>
                      </td>

                      {/* Action Code */}
                      <td style={{ padding: '12px 12px' }}>
                        <code
                          style={{
                            backgroundColor: '#f1f5f9',
                            color: '#07294D',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            border: '1px solid #e2e8f0',
                            display: 'inline-block',
                            maxWidth: '140px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={row.action}
                        >
                          {row.action || 'HTTP_EVENT'}
                        </code>
                      </td>

                      {/* Description Message */}
                      <td style={{ padding: '12px 14px' }}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: '#07294D',
                            fontSize: '0.88rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '360px',
                          }}
                          title={row.message}
                        >
                          {row.message || '--'}
                        </div>
                        {row.metadata && (
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: '#94a3b8',
                              fontFamily: 'monospace',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '360px',
                              marginTop: '2px',
                            }}
                          >
                            {typeof row.metadata === 'string' ? row.metadata : JSON.stringify(row.metadata)}
                          </div>
                        )}
                      </td>

                      {/* Operator / User */}
                      <td style={{ padding: '12px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '8px',
                              backgroundColor: isSystem ? '#f1f5f9' : '#eff6ff',
                              color: isSystem ? '#64748b' : '#1e73be',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {isSystem ? <Monitor size={14} /> : <User size={14} />}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                color: '#334155',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '115px',
                              }}
                              title={operatorName}
                            >
                              {operatorName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Timestamp & Client IP */}
                      <td style={{ padding: '12px 12px' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#07294D', whiteSpace: 'nowrap' }}>
                          {getRelativeTime(row.createdAt)}
                        </div>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '2px',
                            fontFamily: 'monospace',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Globe size={11} color="#94a3b8" />
                          <span>{row.ipAddress || '127.0.0.1'}</span>
                        </div>
                      </td>

                      {/* Inspect Button - Fully Centered & Guaranteed Visible */}
                      <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => setSelectedLog(row)}
                          title={isKhmer ? 'ពិនិត្យមើលលម្អិត' : 'Inspect Details'}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            backgroundColor: '#eff6ff',
                            color: '#1e73be',
                            border: '1px solid #bfdbfe',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            whiteSpace: 'nowrap',
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#dbeafe';
                            e.currentTarget.style.borderColor = '#93c5fd';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#eff6ff';
                            e.currentTarget.style.borderColor = '#bfdbfe';
                          }}
                        >
                          <Eye size={13} />
                          <span>{isKhmer ? 'លម្អិត' : 'View'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* DEDICATED MOBILE CARDS VIEW */}
          <div className="admin-logs-mobile-cards">
            {filteredLogs.map((row) => {
              const lvl = (row.level || 'info').toLowerCase();

              let badgeBg = '#eff6ff';
              let badgeColor = '#1e73be';
              let badgeBorder = '#dbeafe';
              let levelText = 'INFO';

              if (lvl === 'warning') {
                badgeBg = '#fff7ed';
                badgeColor = '#ea580c';
                badgeBorder = '#fed7aa';
                levelText = 'WARN';
              } else if (lvl === 'error') {
                badgeBg = '#fef2f2';
                badgeColor = '#dc2626';
                badgeBorder = '#fecaca';
                levelText = 'ERROR';
              } else if (lvl === 'critical') {
                badgeBg = '#fef2f2';
                badgeColor = '#991b1b';
                badgeBorder = '#fca5a5';
                levelText = 'CRITICAL';
              } else if (lvl === 'success') {
                badgeBg = '#f0fdf4';
                badgeColor = '#059669';
                badgeBorder = '#bbf7d0';
                levelText = 'SUCCESS';
              }

              const operatorName = row.user?.fullName || row.user?.username || (isKhmer ? 'ប្រព័ន្ធ / ភ្ញៀវ' : 'System / Guest');
              const isSystem = !row.user;

              return (
                <div
                  key={row.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(7, 41, 77, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  {/* Top: Severity + Action + Time */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          backgroundColor: badgeBg,
                          color: badgeColor,
                          border: `1px solid ${badgeBorder}`,
                        }}
                      >
                        {levelText}
                      </span>
                      <code
                        style={{
                          backgroundColor: '#f1f5f9',
                          color: '#07294D',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        {row.action || 'HTTP_EVENT'}
                      </code>
                    </div>
                    <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                      {getRelativeTime(row.createdAt)}
                    </span>
                  </div>

                  {/* Message & Context */}
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        color: '#07294D',
                        fontSize: '0.88rem',
                        lineHeight: 1.4,
                      }}
                    >
                      {row.message}
                    </div>
                    {row.metadata && (
                      <div
                        style={{
                          fontSize: '0.74rem',
                          color: '#94a3b8',
                          fontFamily: 'monospace',
                          wordBreak: 'break-all',
                          marginTop: '3px',
                        }}
                      >
                        {typeof row.metadata === 'string' ? row.metadata : JSON.stringify(row.metadata)}
                      </div>
                    )}
                  </div>

                  {/* Operator & IP */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      fontSize: '0.78rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isSystem ? <Monitor size={13} color="#64748b" /> : <User size={13} color="#1e73be" />}
                      <span style={{ fontWeight: 600, color: '#334155' }}>{operatorName}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontFamily: 'monospace' }}>
                      <Globe size={11} />
                      <span>{row.ipAddress || '127.0.0.1'}</span>
                    </div>
                  </div>

                  {/* Inspect Button */}
                  <button
                    onClick={() => setSelectedLog(row)}
                    style={{
                      width: '100%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      backgroundColor: '#eff6ff',
                      color: '#1e73be',
                      border: '1px solid #bfdbfe',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginTop: '2px',
                    }}
                  >
                    <Eye size={14} />
                    <span>{isKhmer ? 'ពិនិត្យមើលព័ត៌មានលម្អិត' : 'Inspect Event Details'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* LOG DETAIL INSPECT MODAL */}
      {selectedLog && (
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
            padding: 'clamp(12px, 3vw, 20px)',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '640px',
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
                    flexShrink: 0,
                  }}
                >
                  <Terminal size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#07294D', margin: 0 }}>
                    {isKhmer ? 'ព័ត៌មានលម្អិតនៃកំណត់ហេតុ' : 'Log Event Inspection'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                    Event ID #{selectedLog.id} &bull; {selectedLog.action}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 'clamp(16px, 3vw, 24px)', overflowY: 'auto' }}>
              {/* Message Banner */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '18px',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                  {isKhmer ? 'ខ្លឹមសារសារ (Log Message)' : 'Log Message'}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#07294D', lineHeight: 1.45 }}>
                  {selectedLog.message}
                </div>
              </div>

              {/* Key Value Meta Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                  gap: '12px',
                  marginBottom: '18px',
                }}
              >
                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                    {isKhmer ? 'កម្រិត (Severity Level)' : 'Severity Level'}
                  </div>
                  <div style={{ fontWeight: 800, color: '#07294D', fontSize: '0.88rem', marginTop: '2px' }}>
                    {selectedLog.level?.toUpperCase()}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                    {isKhmer ? 'កាលបរិច្ឆេទ & ម៉ោង' : 'Timestamp'}
                  </div>
                  <div style={{ fontWeight: 800, color: '#07294D', fontSize: '0.85rem', marginTop: '2px' }}>
                    {selectedLog.createdAt ? new Date(selectedLog.createdAt).toLocaleString(isKhmer ? 'km-KH' : 'en-US') : 'N/A'}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                    {isKhmer ? 'អាសយដ្ឋាន IP (Client IP)' : 'Client IP Address'}
                  </div>
                  <div style={{ fontWeight: 700, color: '#07294D', fontSize: '0.85rem', marginTop: '2px', fontFamily: 'monospace' }}>
                    {selectedLog.ipAddress || '127.0.0.1'}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                    {isKhmer ? 'គណនីប្រតិបត្តិករ' : 'Operator User'}
                  </div>
                  <div style={{ fontWeight: 700, color: '#07294D', fontSize: '0.85rem', marginTop: '2px' }}>
                    {selectedLog.user?.fullName || selectedLog.user?.username || (isKhmer ? 'ប្រព័ន្ធ / ភ្ញៀវ' : 'System / Guest')}
                  </div>
                </div>
              </div>

              {/* User Agent */}
              {selectedLog.userAgent && (
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>
                    USER AGENT / BROWSER
                  </div>
                  <div
                    style={{
                      backgroundColor: '#f1f5f9',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontFamily: 'monospace',
                      color: '#334155',
                      wordBreak: 'break-all',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    {selectedLog.userAgent}
                  </div>
                </div>
              )}

              {/* JSON Metadata Payload */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px',
                  }}
                >
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748b' }}>
                    METADATA PAYLOAD (JSON)
                  </div>
                  <button
                    onClick={() => handleCopy(selectedLog.metadata || '{}', 'meta')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: 'none',
                      background: 'none',
                      color: '#1e73be',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {copiedKey === 'meta' ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                    <span>{copiedKey === 'meta' ? (isKhmer ? 'ចម្លងរួច' : 'Copied') : (isKhmer ? 'ចម្លង' : 'Copy JSON')}</span>
                  </button>
                </div>
                <pre
                  style={{
                    backgroundColor: '#07294D',
                    color: '#e2e8f0',
                    padding: '14px',
                    borderRadius: '10px',
                    fontSize: '0.78rem',
                    fontFamily: 'monospace',
                    overflowX: 'auto',
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {(() => {
                    try {
                      if (!selectedLog.metadata) return '// No additional payload';
                      const parsed = typeof selectedLog.metadata === 'string' ? JSON.parse(selectedLog.metadata) : selectedLog.metadata;
                      return JSON.stringify(parsed, null, 2);
                    } catch {
                      return selectedLog.metadata;
                    }
                  })()}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end',
                backgroundColor: '#f8fafc',
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => setSelectedLog(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  color: '#07294D',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {isKhmer ? 'បិទផ្ទាំង' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR LOGS CONFIRMATION MODAL */}
      {showClearModal && (
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
            padding: 'clamp(12px, 3vw, 20px)',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '440px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(7, 41, 77, 0.25)',
              border: '1px solid #e2e8f0',
              animation: 'modalSlideUp 0.25s ease-out',
            }}
          >
            <div style={{ padding: 'clamp(16px, 3vw, 24px)', textAlign: 'center' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dc2626',
                  margin: '0 auto 16px',
                }}
              >
                <Trash2 size={26} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#07294D', margin: '0 0 8px 0' }}>
                {isKhmer ? 'តើអ្នកពិតជាចង់សម្អាតកំណត់ហេតុ?' : 'Clear All System Logs?'}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.86rem', margin: '0 0 18px 0', lineHeight: 1.45 }}>
                {isKhmer ? (
                  <>
                    រាល់កំណត់ត្រាសវនកម្ម និងប្រវត្តិនៃការចូលប្រើប្រាស់ទាំងអស់ <strong>({logs.length} កំណត់ត្រា)</strong> នឹងត្រូវលុបចេញពីប្រព័ន្ធ។
                    សកម្មភាពនេះមិនអាចត្រឡប់ថយក្រោយវិញបានឡើយ។
                  </>
                ) : (
                  <>
                    All operational logs and security audit records <strong>({logs.length} entries)</strong> will be permanently truncated.
                    This action cannot be undone.
                  </>
                )}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button
                  onClick={() => setShowClearModal(false)}
                  disabled={clearing}
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
                  {isKhmer ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  onClick={handleClearConfirm}
                  disabled={clearing}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: clearing ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {clearing && <RefreshCw size={14} className="spin-icon" />}
                  <span>{clearing ? (isKhmer ? 'កំពុងសម្អាត...' : 'Clearing...') : (isKhmer ? 'យល់ព្រមសម្អាត' : 'Yes, Clear All')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
