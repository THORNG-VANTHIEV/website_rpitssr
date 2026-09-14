import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { Database, Download, Trash2, ShieldCheck, HardDrive } from 'lucide-react';

export const AdminBackupsPage = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/backups');
      setBackups(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      await api.post('/admin/backups', { type: 'database', description: 'Snapshot generated via Admin Panel' });
      fetchData();
    } catch {
      alert('Backup generation failed.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this backup snapshot?')) return;
    try {
      await api.delete(`/admin/backups/${id}`);
      fetchData();
    } catch {
      alert('Failed to delete backup.');
    }
  };

  const columns = [
    {
      header: 'Backup Archive',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Database size={18} />
          </div>
          <div>
            <div style={{ fontWeight: '700', color: 'var(--admin-primary)' }}>{row.fileName}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{row.description || 'Database Dump'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'File Size',
      render: (row) => (
        <code>{row.fileSize ? (row.fileSize / 1024).toFixed(1) + ' KB' : '350 KB'}</code>
      ),
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (row) => <span className="admin-badge admin-badge-info">{row.type?.toUpperCase()}</span>,
    },
    {
      header: 'Created Date',
      render: (row) => (
        <span style={{ fontSize: '0.85rem' }}>
          {row.createdAt ? new Date(row.createdAt).toLocaleString() : 'Just now'}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <span className="admin-badge admin-badge-success">{row.status?.toUpperCase() || 'COMPLETED'}</span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <a
            href={`/rpitssr_db.sql`}
            download={row.fileName}
            className="admin-btn admin-btn-outline admin-btn-sm"
            title="Download SQL File"
          >
            <Download size={14} />
          </a>
          <button
            onClick={() => handleDelete(row.id)}
            className="admin-btn admin-btn-danger admin-btn-sm"
            title="Delete Backup"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminDataTable
        title="Database & Media Backups"
        subtitle="Create scheduled and manual SQL dumps to ensure institute business continuity and recovery"
        columns={columns}
        data={backups}
        loading={loading}
        onAdd={handleCreateBackup}
        addLabel={creating ? 'Creating Snapshot...' : 'Create Database Backup'}
        onRefresh={fetchData}
        searchPlaceholder="Search backup archives..."
      />
    </div>
  );
};
