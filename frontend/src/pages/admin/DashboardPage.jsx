import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { BookOpen, Newspaper, Users, Award, ShieldCheck, Database, HardDrive, LogOut } from 'lucide-react';

export const DashboardPage = () => {
  const { user, isAdmin, loading, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/login');
      return;
    }

    if (isAdmin) {
      api.get('/admin/system/summary')
        .then((res) => setSummary(res.data))
        .catch((err) => console.error(err))
        .finally(() => setFetching(false));
    }
  }, [isAdmin, loading, navigate]);

  if (loading || fetching) return <LoadingSpinner text="Loading admin control center..." />;

  return (
    <div style={{ padding: '50px 0', minHeight: '80vh' }}>
      <div className="container">
        {/* Admin Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-gold" style={{ marginBottom: '8px' }}>ADMINISTRATIVE CONTROL</span>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-dark)' }}>
              Welcome, {user?.fullName || user?.username}
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Connected to Laravel REST API backend (Option A)</p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/" className="btn btn-outline">View Website</Link>
            <button onClick={logout} className="btn" style={{ background: '#fef2f2', color: '#dc2626' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* System Health Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MAMP MySQL Status</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#16a34a' }}>
                {summary?.systemHealth?.database?.toUpperCase() || 'HEALTHY'}
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Laravel REST API</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)' }}>
                {summary?.systemHealth?.api?.toUpperCase() || 'HEALTHY'}
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fef3c7', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HardDrive size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Media Storage</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--accent)' }}>
                {summary?.systemHealth?.storage?.toUpperCase() || 'HEALTHY'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation / Resource Shortcuts */}
        <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--primary-dark)', marginBottom: '20px' }}>
          Management Sections
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <BookOpen size={24} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px' }}>Courses</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Manage vocational and technical programs, curricula, fees, and credits.</p>
            <Link to="/courses" className="btn btn-outline" style={{ width: '100%', fontSize: '0.85rem' }}>Open Courses</Link>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <Newspaper size={24} style={{ color: 'var(--accent)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px' }}>News & Posts</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Publish announcements, event notifications, and photo galleries.</p>
            <Link to="/blog" className="btn btn-outline" style={{ width: '100%', fontSize: '0.85rem' }}>Open News</Link>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <Award size={24} style={{ color: '#16a34a', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px' }}>Exam Results</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Verify student scores, grades, and cohorts.</p>
            <Link to="/exam-results" className="btn btn-outline" style={{ width: '100%', fontSize: '0.85rem' }}>Open Results</Link>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <Users size={24} style={{ color: '#8b5cf6', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px' }}>Faculty</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>View instructors, academic departments, and profiles.</p>
            <Link to="/teachers" className="btn btn-outline" style={{ width: '100%', fontSize: '0.85rem' }}>Open Faculty</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
