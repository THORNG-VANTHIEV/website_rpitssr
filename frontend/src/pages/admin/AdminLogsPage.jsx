import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { FileText, Download, Trash2, RefreshCw, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export const AdminLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [level, setLevel] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchLogs = async () => {
    try {
      const url = level === 'ALL' ? '/admin/logs' : `/admin/logs?level=${level}`;
      const res = await api.get(url);
      setLogs(res.data || []);
    } catch (err) {
      console.error(err);
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

  const handleClear = async () => {
    if (!window.confirm('Clear all system activity logs?')) return;
    try {
      await api.post('/admin/logs/clear');
      fetchLogs();
    } catch {
      alert('Failed to clear logs.');
    }
  };

  const handleExportCsv = () => {
    if (logs.length === 0) return alert('No log records to export.');
    const headers = ['Level', 'Action', 'Message', 'User', 'IP Address', 'Timestamp'];
    const rows = logs.map((l) => [
      l.level,
      l.action || '',
      `"${(l.message || '').replace(/"/g, '""')}"`,
      l.user?.username || 'Guest',
      l.ipAddress || '',
      l.createdAt || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `system_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      header: 'Log Level',
      render: (row) => {
        const lvl = row.level?.toUpperCase();
        let badgeClass = 'admin-badge-info';
        if (lvl === 'ERROR' || lvl === 'CRITICAL') badgeClass = 'admin-badge-danger';
        if (lvl === 'WARNING') badgeClass = 'admin-badge-warning';
        if (lvl === 'SUCCESS') badgeClass = 'admin-badge-success';

        return <span className={`admin-badge ${badgeClass}`}>{lvl || 'INFO'}</span>;
      },
    },
    {
      header: 'Action / Event',
      accessor: 'action',
      render: (row) => <code>{row.action || 'HTTP_REQUEST'}</code>,
    },
    {
      header: 'Message',
      render: (row) => (
        <span style={{ fontWeight: '500', color: 'var(--admin-primary)' }}>
          {row.message || '--'}
        </span>
      ),
    },
    {
      header: 'User',
      render: (row) => (
        <span style={{ fontSize: '0.85rem' }}>{row.user?.fullName || row.user?.username || 'System / Guest'}</span>
      ),
    },
    {
      header: 'Client IP',
      render: (row) => <code>{row.ipAddress || '127.0.0.1'}</code>,
    },
    {
      header: 'Timestamp',
      render: (row) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
          {row.createdAt ? new Date(row.createdAt).toLocaleTimeString() : 'Recent'}
        </span>
      ),
    },
  ];

  const customHeaderActions = (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <select
        className="admin-form-control"
        style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
        value={level}
        onChange={(e) => setLevel(e.target.value)}
      >
        <option value="ALL">All Levels</option>
        <option value="INFO">INFO</option>
        <option value="WARNING">WARNING</option>
        <option value="ERROR">ERROR</option>
        <option value="DEBUG">DEBUG</option>
      </select>

      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={autoRefresh}
          onChange={(e) => setAutoRefresh(e.target.checked)}
        />
        <span>Auto-Refresh (5s)</span>
      </label>

      <button onClick={handleExportCsv} className="admin-btn admin-btn-outline admin-btn-sm" title="Export CSV">
        <Download size={14} /> CSV
      </button>

      <button onClick={handleClear} className="admin-btn admin-btn-danger admin-btn-sm" title="Clear Logs">
        <Trash2 size={14} /> Clear
      </button>
    </div>
  );

  return (
    <div>
      <AdminDataTable
        title="Live System Activity Logs"
        subtitle="Monitor security events, authentication attempts, database transactions, and error logs"
        columns={columns}
        data={logs}
        loading={loading}
        onRefresh={fetchLogs}
        customHeaderActions={customHeaderActions}
        searchPlaceholder="Filter logs by message or action..."
      />
    </div>
  );
};
