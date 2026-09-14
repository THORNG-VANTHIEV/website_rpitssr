import React, { useState } from 'react';
import { Boxes, CheckCircle2, Download, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

export const AdminPluginsPage = () => {
  const [plugins, setPlugins] = useState([
    {
      id: 1,
      name: 'Khmer Lunar Calendar Engine',
      description: 'Calculates dynamic Buddhist lunar dates, waxing/waning moon phases, and holy days for header banner.',
      version: 'v2.4.0',
      author: 'RPITSSR Core Tech',
      status: 'active',
    },
    {
      id: 2,
      name: 'Sanctum JWT Authentication Guard',
      description: 'Restricts administrative endpoints with secure token authorization and role-based permissions.',
      version: 'v3.1.2',
      author: 'Laravel Framework',
      status: 'active',
    },
    {
      id: 3,
      name: 'SEO & OpenGraph Social Meta Generator',
      description: 'Automates rich link previews on Facebook, Telegram, and Google search indexing for courses and articles.',
      version: 'v1.8.0',
      author: 'RPITSSR Dev',
      status: 'active',
    },
    {
      id: 4,
      name: 'Telegram Institute Bot Notification Gateway',
      description: 'Broadcasts urgent announcements, enrollment reminders, and exam results to Telegram subscribers.',
      version: 'v2.0.1',
      author: 'Community',
      status: 'active',
    },
  ]);

  const handleToggle = (id) => {
    setPlugins(
      plugins.map((p) =>
        p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p
      )
    );
  };

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            <Boxes size={20} color="var(--admin-accent)" />
            Installed System Modules & Extensions
          </h3>
          <span className="admin-badge admin-badge-success">{plugins.length} Ext Active</span>
        </div>
        <div className="admin-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {plugins.map((plugin) => (
              <div
                key={plugin.id}
                style={{
                  padding: '20px',
                  background: '#fff',
                  borderRadius: '10px',
                  border: '1px solid var(--admin-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: 'var(--admin-primary)' }}>
                      {plugin.name}
                    </h4>
                    <span className={`admin-badge ${plugin.status === 'active' ? 'admin-badge-success' : 'admin-badge-warning'}`}>
                      {plugin.status.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', margin: '0 0 16px', lineHeight: 1.5 }}>
                    {plugin.description}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--admin-border)', fontSize: '0.78rem' }}>
                  <code>{plugin.version} &bull; {plugin.author}</code>
                  <button
                    onClick={() => handleToggle(plugin.id)}
                    className={`admin-btn ${plugin.status === 'active' ? 'admin-btn-outline' : 'admin-btn-primary'} admin-btn-sm`}
                  >
                    {plugin.status === 'active' ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
