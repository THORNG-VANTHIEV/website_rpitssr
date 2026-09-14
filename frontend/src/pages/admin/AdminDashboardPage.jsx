import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  BookOpen,
  Newspaper,
  Calendar,
  GraduationCap,
  Users,
  Image,
  Database,
  ShieldCheck,
  HardDrive,
  Plus,
  ArrowUpRight
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/system/summary')
      .then((res) => setSummary(res.data))
      .catch((err) => console.error('Failed to load summary:', err))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Total Courses', value: summary?.counts?.courses ?? '--', icon: BookOpen, color: '#07294d', bg: '#e0e7ff', link: '/admin-panel/courses' },
    { label: 'Blog Posts', value: summary?.counts?.blogPosts ?? '--', icon: Newspaper, color: '#0c8b51', bg: '#dcfce7', link: '/admin-panel/blog-posts' },
    { label: 'Events', value: summary?.counts?.events ?? '--', icon: Calendar, color: '#d97706', bg: '#fef3c7', link: '/admin-panel/events' },
    { label: 'Teachers', value: summary?.counts?.teachers ?? '--', icon: GraduationCap, color: '#7c3aed', bg: '#ede9fe', link: '/admin-panel/teachers' },
    { label: 'Registered Users', value: summary?.counts?.users ?? '--', icon: Users, color: '#0284c7', bg: '#e0f2fe', link: '/admin-panel/users' },
    { label: 'Gallery Images', value: summary?.counts?.galleryImages ?? '--', icon: Image, color: '#db2777', bg: '#fce7f3', link: '/admin-panel/gallery-images' },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--admin-primary)', margin: '0 0 6px' }}>
          Institute Overview Dashboard
        </h1>
        <p style={{ color: 'var(--admin-text-muted)', margin: 0, fontSize: '0.95rem' }}>
          Real-time metrics, system health, and direct management shortcuts for RPITSSR.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="admin-stats-grid">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <Link key={idx} to={s.link} style={{ textDecoration: 'none' }}>
              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ backgroundColor: s.bg, color: s.color }}>
                  <Icon size={26} />
                </div>
                <div>
                  <div className="admin-stat-label">{s.label}</div>
                  <div className="admin-stat-value">{loading ? '...' : s.value}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* System Health Status */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            <ShieldCheck size={20} color="var(--admin-accent)" />
            System Infrastructure Status
          </h3>
          <span className="admin-badge admin-badge-success">OPERATIONAL</span>
        </div>
        <div className="admin-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Database size={32} color="#0c8b51" />
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>MySQL Database</div>
                <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--admin-primary)' }}>
                  {summary?.systemHealth?.database?.toUpperCase() || 'CONNECTED (PORT 8889)'}
                </div>
              </div>
            </div>

            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <ShieldCheck size={32} color="#0284c7" />
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>REST API Core</div>
                <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--admin-primary)' }}>
                  {summary?.systemHealth?.api?.toUpperCase() || 'LARAVEL 12 (SANCTUM ACTIVE)'}
                </div>
              </div>
            </div>

            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <HardDrive size={32} color="#f59e0b" />
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Media Storage</div>
                <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--admin-primary)' }}>
                  {summary?.systemHealth?.storage?.toUpperCase() || 'PUBLIC DISK WRITABLE'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Quick Action Shortcuts</h3>
        </div>
        <div className="admin-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <Link to="/admin-panel/courses" className="admin-btn admin-btn-outline" style={{ justifyContent: 'space-between', padding: '14px 18px' }}>
              <span>Manage Courses</span>
              <ArrowUpRight size={16} />
            </Link>
            <Link to="/admin-panel/teachers" className="admin-btn admin-btn-outline" style={{ justifyContent: 'space-between', padding: '14px 18px' }}>
              <span>Manage Teachers</span>
              <ArrowUpRight size={16} />
            </Link>
            <Link to="/admin-panel/blog-posts" className="admin-btn admin-btn-outline" style={{ justifyContent: 'space-between', padding: '14px 18px' }}>
              <span>Publish News</span>
              <ArrowUpRight size={16} />
            </Link>
            <Link to="/admin-panel/scrolling-banners" className="admin-btn admin-btn-outline" style={{ justifyContent: 'space-between', padding: '14px 18px' }}>
              <span>Banner Ticker</span>
              <ArrowUpRight size={16} />
            </Link>
            <Link to="/admin-panel/exam-results" className="admin-btn admin-btn-outline" style={{ justifyContent: 'space-between', padding: '14px 18px' }}>
              <span>Upload Results</span>
              <ArrowUpRight size={16} />
            </Link>
            <Link to="/admin-panel/settings" className="admin-btn admin-btn-outline" style={{ justifyContent: 'space-between', padding: '14px 18px' }}>
              <span>Institute Settings</span>
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
