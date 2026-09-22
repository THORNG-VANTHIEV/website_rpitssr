import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  Users,
  Search,
  CheckCircle2,
  Clock,
  Phone,
  AlertCircle,
  Eye,
  Trash2,
  Filter,
  FileText,
  UserCheck,
  UserX,
  Calendar,
  MapPin,
  Mail,
  ExternalLink,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/client';

export const AdminAdmissionsPage = () => {
  const { currentLanguage, language } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  // State
  const [admissions, setAdmissions] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    contacted: 0,
    approved: 0,
    enrolled: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');
  const [statusTarget, setStatusTarget] = useState('pending');

  // Enroll Form
  const [enrollForm, setEnrollForm] = useState({
    studentId: '',
    email: '',
    password: 'Rpitssr@2026',
    className: '',
    academicYear: '2026-2027',
    semester: '1'
  });
  const [enrollSuccessResult, setEnrollSuccessResult] = useState(null);

  // Fetch admissions
  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/admin/admissions', { params });
      if (res.data?.success) {
        setAdmissions(res.data.data || []);
        if (res.data.metrics) {
          setMetrics(res.data.metrics);
        }
      }
    } catch (err) {
      console.error('Failed to load admissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, [statusFilter]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAdmissions();
  };

  // Open Review Modal
  const handleOpenReview = (adm) => {
    setSelectedAdmission(adm);
    setStatusTarget(adm.status);
    setStatusNotes(adm.adminNotes || '');
    setReviewModalOpen(true);
  };

  // Update Status
  const handleUpdateStatus = async (newStatus) => {
    if (!selectedAdmission) return;
    try {
      setActionLoading(true);
      const res = await api.put(`/admin/admissions/${selectedAdmission.id}/status`, {
        status: newStatus || statusTarget,
        adminNotes: statusNotes
      });
      if (res.data?.success) {
        setAdmissions(prev =>
          prev.map(item => (item.id === selectedAdmission.id ? { ...item, status: newStatus || statusTarget, adminNotes: statusNotes } : item))
        );
        setSelectedAdmission(prev => ({ ...prev, status: newStatus || statusTarget, adminNotes: statusNotes }));
        // Refresh metrics
        fetchAdmissions();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(isKhmer ? 'បរាជ័យក្នុងការកែប្រែស្ថានភាព' : 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Enroll Modal
  const handleOpenEnroll = (adm) => {
    setSelectedAdmission(adm);
    const year = new Date().getFullYear();
    // Default studentId
    setEnrollForm({
      studentId: '',
      email: '',
      password: 'Rpitssr@2026',
      className: adm.major || '',
      academicYear: `${year}-${year + 1}`,
      semester: '1'
    });
    setEnrollSuccessResult(null);
    setEnrollModalOpen(true);
  };

  // Submit Enroll
  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAdmission) return;

    try {
      setActionLoading(true);
      const res = await api.post(`/admin/admissions/${selectedAdmission.id}/enroll`, enrollForm);
      if (res.data?.success) {
        setEnrollSuccessResult(res.data);
        fetchAdmissions();
      }
    } catch (err) {
      console.error('Failed to enroll student:', err);
      alert(err.response?.data?.message || (isKhmer ? 'បរាជ័យក្នុងការចុះឈ្មោះ' : 'Failed to enroll student'));
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Admission
  const handleDelete = async (id) => {
    if (!window.confirm(isKhmer ? 'តើអ្នកពិតជាចង់លុបពាក្យសុំនេះមែនទេ?' : 'Are you sure you want to delete this admission record?')) {
      return;
    }
    try {
      const res = await api.delete(`/admin/admissions/${id}`);
      if (res.data?.success) {
        setAdmissions(prev => prev.filter(item => item.id !== id));
        fetchAdmissions();
      }
    } catch (err) {
      console.error('Delete admission error:', err);
      alert(isKhmer ? 'បរាជ័យក្នុងការលុប' : 'Failed to delete');
    }
  };

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 32px)', maxWidth: '1400px', margin: '0 auto' }}>
      {/* =========================================================
          1. SECTION HEADER (Centered & Balanced per AGENTS.md)
          ========================================================= */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            background: '#eff6ff',
            border: '1px solid #dbeafe',
            color: '#1e73be',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '10px'
          }}
        >
          <GraduationCap size={16} />
          <span>{isKhmer ? 'ការិយាល័យសិក្សា & ចុះឈ្មោះចូលរៀន' : 'Academic Affairs & Admissions'}</span>
        </span>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)', fontWeight: 800, color: '#07294D', margin: '0 0 10px' }}>
          {isKhmer ? 'គ្រប់គ្រងពាក្យសុំចុះឈ្មោះចូលរៀនតាមអនឡាញ' : 'Online Admission Applications Management'}
        </h2>
        <div style={{ width: '48px', height: '3px', background: '#1e73be', margin: '0 auto 12px', borderRadius: '2px' }}></div>
        <p style={{ color: '#64748b', fontSize: '0.94rem', maxWidth: '680px', margin: '0 auto' }}>
          {isKhmer
            ? 'ត្រួតពិនិត្យពាក្យសុំ ឯកសារភ្ជាប់ (សញ្ញាបត្រ ប័ណ្ណសមធម៌) និងអនុម័តចុះឈ្មោះបេក្ខជនជាផ្លូវការ (1-Click Student Enrollment)'
            : 'Review prospective student applications, verify credentials, and enroll approved candidates.'}
        </p>
      </div>

      {/* =========================================================
          2. 4-CARD KPI STRIP (AGENTS.md Daylight Format)
          ========================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        {/* Card 1: Total */}
        <div
          onClick={() => setStatusFilter('all')}
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '20px',
            border: statusFilter === 'all' ? '2px solid #1e73be' : '1px solid #e2e8f0',
            boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#eff6ff',
              border: '1px solid #dbeafe',
              color: '#1e73be',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              {isKhmer ? 'ពាក្យសុំសរុប' : 'Total Applications'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#07294D', lineHeight: 1.2 }}>
              {metrics.total}
            </div>
          </div>
        </div>

        {/* Card 2: Pending */}
        <div
          onClick={() => setStatusFilter('pending')}
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '20px',
            border: statusFilter === 'pending' ? '2px solid #ea580c' : '1px solid #e2e8f0',
            boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              color: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              {isKhmer ? 'រង់ចាំការពិនិត្យ' : 'Pending Review'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ea580c', lineHeight: 1.2 }}>
              {metrics.pending}
            </div>
          </div>
        </div>

        {/* Card 3: Contacted */}
        <div
          onClick={() => setStatusFilter('contacted')}
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '20px',
            border: statusFilter === 'contacted' ? '2px solid #7c3aed' : '1px solid #e2e8f0',
            boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#faf5ff',
              border: '1px solid #e9d5ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Phone size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              {isKhmer ? 'បានទាក់ទង' : 'Contacted'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7c3aed', lineHeight: 1.2 }}>
              {metrics.contacted}
            </div>
          </div>
        </div>

        {/* Card 4: Enrolled */}
        <div
          onClick={() => setStatusFilter('enrolled')}
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '20px',
            border: statusFilter === 'enrolled' ? '2px solid #059669' : '1px solid #e2e8f0',
            boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              {isKhmer ? 'បានចុះឈ្មោះជាផ្លូវការ' : 'Enrolled Students'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', lineHeight: 1.2 }}>
              {metrics.enrolled}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          3. CONTROLS: FILTER TABS & SEARCH BAR
          ========================================================= */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '18px',
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%' }}>
          {[
            { id: 'all', labelKm: 'ទាំងអស់', labelEn: 'All' },
            { id: 'pending', labelKm: 'រង់ចាំពិនិត្យ', labelEn: 'Pending' },
            { id: 'contacted', labelKm: 'បានទាក់ទង', labelEn: 'Contacted' },
            { id: 'approved', labelKm: 'បានយល់ព្រម', labelEn: 'Approved' },
            { id: 'enrolled', labelKm: 'បានចុះឈ្មោះ', labelEn: 'Enrolled' },
            { id: 'rejected', labelKm: 'បដិសេធ', labelEn: 'Rejected' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: statusFilter === tab.id ? '1px solid #07294D' : '1px solid #e2e8f0',
                background: statusFilter === tab.id ? '#07294D' : '#f8fafc',
                color: statusFilter === tab.id ? '#ffffff' : '#64748b',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {isKhmer ? tab.labelKm : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', minWidth: '260px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isKhmer ? 'ស្វែងរកតាមឈ្មោះ លេខទូរស័ព្ទ កូដ...' : 'Search by name, phone, code...'}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              background: '#1e73be',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            {isKhmer ? 'ស្វែងរក' : 'Search'}
          </button>
        </form>
      </div>

      {/* =========================================================
          4. ADMISSIONS DIRECTORY: TABLE (DESKTOP) & CARDS (MOBILE)
          ========================================================= */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <RefreshCw size={32} className="spin" style={{ margin: '0 auto 12px', display: 'block', color: '#1e73be' }} />
          <span>{isKhmer ? 'កំពុងទាញយកទិន្នន័យពាក្យសុំ...' : 'Loading admission applications...'}</span>
        </div>
      ) : admissions.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            padding: '60px 20px',
            textAlign: 'center'
          }}
        >
          <FileText size={48} style={{ color: '#cbd5e1', margin: '0 auto 12px', display: 'block' }} />
          <h4 style={{ color: '#07294D', fontWeight: 800, margin: '0 0 6px' }}>
            {isKhmer ? 'មិនមានទិន្នន័យពាក្យសុំឡើយ' : 'No Admission Applications Found'}
          </h4>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
            {isKhmer ? 'មិនមានពាក្យសុំដែលត្រូវគ្នានឹងលក្ខខណ្ឌចម្រោះនេះទេ' : 'No applications match your selected filter criteria.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div
            className="d-none d-md-block"
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
              overflow: 'hidden'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                    {isKhmer ? 'កូដតាមដាន' : 'Code'}
                  </th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                    {isKhmer ? 'បេក្ខជន' : 'Applicant'}
                  </th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                    {isKhmer ? 'ជំនាញ & កម្រិត' : 'Major & Level'}
                  </th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                    {isKhmer ? 'ទំនាក់ទំនង' : 'Contact'}
                  </th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                    {isKhmer ? 'ស្ថានភាព' : 'Status'}
                  </th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>
                    {isKhmer ? 'សកម្មភាព' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {admissions.map(adm => (
                  <tr
                    key={adm.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background 0.15s'
                    }}
                  >
                    {/* Tracking Code */}
                    <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          color: '#07294D',
                          background: '#f1f5f9',
                          padding: '4px 8px',
                          borderRadius: '6px'
                        }}
                      >
                        {adm.trackingCode}
                      </span>
                    </td>

                    {/* Applicant */}
                    <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: 800, color: '#07294D', fontSize: '0.94rem' }}>
                        {adm.khmerName}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {adm.latinName} • {adm.gender === 'male' ? (isKhmer ? 'ប្រុស' : 'M') : adm.gender === 'female' ? (isKhmer ? 'ស្រី' : 'F') : 'Other'}
                      </div>
                    </td>

                    {/* Major & Degree */}
                    <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                      <div style={{ marginBottom: '4px' }}>
                        {adm.courseType === 'short_term' || adm.degreeLevel === 'tvet_short' || adm.degreeLevel === 'short_course' ? (
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 7px', borderRadius: '6px', background: '#fffbeb', color: '#b45309', border: '1px solid #fed7aa', display: 'inline-block' }}>
                            ⚡ {isKhmer ? 'វគ្គខ្លី TVET' : 'Short TVET'}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 7px', borderRadius: '6px', background: '#eff6ff', color: '#1e73be', border: '1px solid #bfdbfe', display: 'inline-block' }}>
                            🏛️ {isKhmer ? 'វគ្គវែង' : 'Degree'}
                          </span>
                        )}
                      </div>
                      <div style={{ fontWeight: 700, color: '#07294D', fontSize: '0.88rem' }}>
                        {adm.major}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                        {adm.shift === 'morning' ? (isKhmer ? 'វេនព្រឹក' : 'Morning') : adm.shift === 'afternoon' ? (isKhmer ? 'វេនរសៀល' : 'Afternoon') : adm.shift === 'evening' ? (isKhmer ? 'វេនយប់' : 'Evening') : (isKhmer ? 'ចុងសប្តាហ៍' : 'Weekend')}
                      </div>
                    </td>

                    {/* Contact */}
                    <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: 700, color: '#07294D', fontSize: '0.86rem' }}>
                        {adm.phone}
                      </div>
                      {adm.telegram && (
                        <div style={{ fontSize: '0.78rem', color: '#0284c7' }}>
                          TG: {adm.telegram}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                      {adm.status === 'enrolled' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '9999px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontSize: '0.8rem', fontWeight: 700 }}>
                          <CheckCircle2 size={13} /> {isKhmer ? 'បានចុះឈ្មោះ' : 'Enrolled'}
                        </span>
                      ) : adm.status === 'approved' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '9999px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontSize: '0.8rem', fontWeight: 700 }}>
                          <CheckCircle2 size={13} /> {isKhmer ? 'បានយល់ព្រម' : 'Approved'}
                        </span>
                      ) : adm.status === 'contacted' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '9999px', background: '#eff6ff', color: '#1e73be', border: '1px solid #bfdbfe', fontSize: '0.8rem', fontWeight: 700 }}>
                          <Phone size={13} /> {isKhmer ? 'បានទាក់ទង' : 'Contacted'}
                        </span>
                      ) : adm.status === 'rejected' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '9999px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '0.8rem', fontWeight: 700 }}>
                          ✕ {isKhmer ? 'បដិសេធ' : 'Rejected'}
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '9999px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontSize: '0.8rem', fontWeight: 700 }}>
                          <Clock size={13} /> {isKhmer ? 'រង់ចាំពិនិត្យ' : 'Pending'}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 18px', verticalAlign: 'middle', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenReview(adm)}
                          title={isKhmer ? 'មើលលម្អិត & ឯកសារ' : 'View Details & Documents'}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            background: '#eff6ff',
                            border: '1px solid #dbeafe',
                            color: '#1e73be',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 700
                          }}
                        >
                          <Eye size={14} />
                          <span>{isKhmer ? 'ពិនិត្យ' : 'Review'}</span>
                        </button>

                        {adm.status !== 'enrolled' && (
                          <button
                            onClick={() => handleOpenEnroll(adm)}
                            title={isKhmer ? 'ចុះឈ្មោះជាសិស្សផ្លូវការ' : 'Enroll as Student'}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              background: '#f0fdf4',
                              border: '1px solid #bbf7d0',
                              color: '#16a34a',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.8rem',
                              fontWeight: 700
                            }}
                          >
                            <UserCheck size={14} />
                            <span>{isKhmer ? 'ចុះឈ្មោះ' : 'Enroll'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(adm.id)}
                          title={isKhmer ? 'លុប' : 'Delete'}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '8px',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View (< 768px) */}
          <div className="d-md-none" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {admissions.map(adm => (
              <div
                key={adm.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 14px rgba(7, 41, 77, 0.04)',
                  padding: '16px'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      color: '#07294D',
                      background: '#f1f5f9',
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}
                  >
                    {adm.trackingCode}
                  </span>

                  {/* Status Badge */}
                  {adm.status === 'enrolled' ? (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '3px 8px', borderRadius: '9999px', border: '1px solid #bbf7d0' }}>
                      ✓ {isKhmer ? 'បានចុះឈ្មោះ' : 'Enrolled'}
                    </span>
                  ) : adm.status === 'approved' ? (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '3px 8px', borderRadius: '9999px', border: '1px solid #bbf7d0' }}>
                      ✓ {isKhmer ? 'បានយល់ព្រម' : 'Approved'}
                    </span>
                  ) : adm.status === 'contacted' ? (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e73be', background: '#eff6ff', padding: '3px 8px', borderRadius: '9999px', border: '1px solid #bfdbfe' }}>
                      📞 {isKhmer ? 'បានទាក់ទង' : 'Contacted'}
                    </span>
                  ) : adm.status === 'rejected' ? (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', background: '#fef2f2', padding: '3px 8px', borderRadius: '9999px', border: '1px solid #fecaca' }}>
                      ✕ {isKhmer ? 'បដិសេធ' : 'Rejected'}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '3px 8px', borderRadius: '9999px', border: '1px solid #fde68a' }}>
                      ⏳ {isKhmer ? 'រង់ចាំពិនិត្យ' : 'Pending'}
                    </span>
                  )}
                </div>

                {/* Name */}
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#07294D', margin: '0 0 6px' }}>
                  {adm.khmerName} ({adm.latinName})
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  {adm.courseType === 'short_term' || adm.degreeLevel === 'tvet_short' || adm.degreeLevel === 'short_course' ? (
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: '5px', background: '#fffbeb', color: '#b45309', border: '1px solid #fed7aa' }}>
                      ⚡ {isKhmer ? 'វគ្គខ្លី TVET' : 'Short TVET'}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: '5px', background: '#eff6ff', color: '#1e73be', border: '1px solid #bfdbfe' }}>
                      🏛️ {isKhmer ? 'វគ្គវែង' : 'Degree'}
                    </span>
                  )}
                  <span style={{ fontSize: '0.84rem', color: '#07294D', fontWeight: 700 }}>
                    {adm.major}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px' }}>
                  📞 {adm.phone} {adm.telegram && `• TG: ${adm.telegram}`}
                </div>

                {/* Mobile Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: adm.status !== 'enrolled' ? '1fr 1fr' : '1fr', gap: '8px' }}>
                  <button
                    onClick={() => handleOpenReview(adm)}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: '#eff6ff',
                      border: '1px solid #dbeafe',
                      color: '#1e73be',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Eye size={14} />
                    <span>{isKhmer ? 'ពិនិត្យពាក្យ' : 'Review'}</span>
                  </button>

                  {adm.status !== 'enrolled' && (
                    <button
                      onClick={() => handleOpenEnroll(adm)}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        color: '#16a34a',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <UserCheck size={14} />
                      <span>{isKhmer ? 'ចុះឈ្មោះ' : 'Enroll'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* =========================================================
          5. APPLICATION REVIEW LIGHTBOX MODAL
          ========================================================= */}
      {reviewModalOpen && selectedAdmission && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 41, 77, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '750px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(7, 41, 77, 0.2)',
              border: '1px solid #e2e8f0'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  {isKhmer ? 'ព័ត៌មានលម្អិតពាក្យសុំ' : 'Application Review'}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#07294D', margin: 0 }}>
                  {selectedAdmission.trackingCode} — {selectedAdmission.khmerName}
                </h3>
              </div>
              <button
                onClick={() => setReviewModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  color: '#94a3b8'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {/* Applicant Bio Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                  gap: '14px',
                  background: '#f8fafc',
                  padding: '16px',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '20px'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{isKhmer ? 'ឈ្មោះឡាតាំង' : 'Latin Name'}</div>
                  <div style={{ fontWeight: 800, color: '#07294D', fontSize: '0.9rem' }}>{selectedAdmission.latinName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{isKhmer ? 'ភេទ & ថ្ងៃខែឆ្នាំកំណើត' : 'Gender & DOB'}</div>
                  <div style={{ fontWeight: 700, color: '#07294D', fontSize: '0.9rem' }}>
                    {selectedAdmission.gender === 'male' ? 'ប្រុស' : selectedAdmission.gender === 'female' ? 'ស្រី' : 'ផ្សេងៗ'} • {selectedAdmission.dob || 'N/A'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{isKhmer ? 'លេខទូរស័ព្ទ' : 'Phone'}</div>
                  <div style={{ fontWeight: 700, color: '#07294D', fontSize: '0.9rem' }}>{selectedAdmission.phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{isKhmer ? 'Telegram' : 'Telegram'}</div>
                  <div style={{ fontWeight: 700, color: '#0284c7', fontSize: '0.9rem' }}>{selectedAdmission.telegram || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{isKhmer ? 'អ៊ីមែលផ្ទាល់ខ្លួន' : 'Personal Email'}</div>
                  <div style={{ fontWeight: 700, color: '#07294D', fontSize: '0.9rem' }}>{selectedAdmission.email || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{isKhmer ? 'ប្រភេទវគ្គសិក្សា' : 'Course Type'}</div>
                  <div style={{ fontWeight: 800, color: selectedAdmission.courseType === 'short_term' ? '#b45309' : '#1e73be', fontSize: '0.9rem' }}>
                    {selectedAdmission.courseType === 'short_term'
                      ? (isKhmer ? '⚡ វគ្គខ្លី (TVET / វិជ្ជាជីវៈ)' : '⚡ Short-Term (TVET)')
                      : (isKhmer ? '🏛️ វគ្គវែង (កម្រិតសញ្ញាបត្រ)' : '🏛️ Long-Term Degree')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{isKhmer ? 'កម្រិតសិក្សា' : 'Degree Level'}</div>
                  <div style={{ fontWeight: 700, color: '#07294D', fontSize: '0.9rem' }}>
                    {selectedAdmission.degreeLevel || 'N/A'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{isKhmer ? 'វេនសិក្សា' : 'Shift'}</div>
                  <div style={{ fontWeight: 700, color: '#1e73be', fontSize: '0.9rem' }}>{selectedAdmission.shift}</div>
                </div>
              </div>

              {/* Major & Address */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#07294D', marginBottom: '4px' }}>
                  {isKhmer ? 'ជំនាញជ្រើសរើស ៖' : 'Desired Major:'} <span style={{ color: '#1e73be', fontWeight: 800 }}>{selectedAdmission.major}</span>
                </div>
                {selectedAdmission.currentAddress && (
                  <div style={{ fontSize: '0.84rem', color: '#64748b' }}>
                    📍 {isKhmer ? 'អាសយដ្ឋាន ៖' : 'Address:'} {selectedAdmission.currentAddress}
                  </div>
                )}
              </div>

              {/* Uploaded Documents */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#07294D', marginBottom: '12px' }}>
                  {isKhmer ? 'ឯកសារភ្ជាប់ (Uploaded Documents)' : 'Uploaded Documents'}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '12px' }}>
                  {/* Photo */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', textAlign: 'center', background: '#f8fafc' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                      {isKhmer ? 'រូបថត 4x6' : 'Photo'}
                    </div>
                    {selectedAdmission.photoUrl ? (
                      <a href={selectedAdmission.photoUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#1e73be', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <ExternalLink size={12} /> {isKhmer ? 'បើកមើល' : 'View'}
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{isKhmer ? 'គ្មាន' : 'None'}</span>
                    )}
                  </div>

                  {/* Certificate */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', textAlign: 'center', background: '#f8fafc' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                      {isKhmer ? 'សញ្ញាបត្រ' : 'Certificate'}
                    </div>
                    {selectedAdmission.certificateUrl ? (
                      <a href={selectedAdmission.certificateUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#1e73be', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <ExternalLink size={12} /> {isKhmer ? 'បើកមើល' : 'View'}
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{isKhmer ? 'គ្មាន' : 'None'}</span>
                    )}
                  </div>

                  {/* ID Card */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', textAlign: 'center', background: '#f8fafc' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                      {isKhmer ? 'អត្តសញ្ញាណប័ណ្ណ' : 'ID Card'}
                    </div>
                    {selectedAdmission.idCardUrl ? (
                      <a href={selectedAdmission.idCardUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#1e73be', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <ExternalLink size={12} /> {isKhmer ? 'បើកមើល' : 'View'}
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{isKhmer ? 'គ្មាន' : 'None'}</span>
                    )}
                  </div>

                  {/* Equity Card */}
                  <div style={{ border: '1px solid #fde68a', borderRadius: '12px', padding: '12px', textAlign: 'center', background: '#fffbeb' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#92400e', marginBottom: '6px' }}>
                      {isKhmer ? 'ប័ណ្ណសមធម៌' : 'Equity Card'}
                    </div>
                    {selectedAdmission.equityCardUrl ? (
                      <a href={selectedAdmission.equityCardUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <ExternalLink size={12} /> {isKhmer ? 'បើកមើល' : 'View'}
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{isKhmer ? 'គ្មាន' : 'None'}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Update & Notes */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                    {isKhmer ? 'កែប្រែស្ថានភាពពាក្យសុំ ៖' : 'Update Status:'}
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['pending', 'contacted', 'approved', 'rejected'].map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleUpdateStatus(st)}
                        disabled={actionLoading}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: selectedAdmission.status === st ? '2px solid #07294D' : '1px solid #cbd5e1',
                          background: selectedAdmission.status === st ? '#07294D' : '#ffffff',
                          color: selectedAdmission.status === st ? '#ffffff' : '#475569'
                        }}
                      >
                        {st === 'pending' ? '⏳ Pending' : st === 'contacted' ? '📞 Contacted' : st === 'approved' ? '✓ Approved' : '✕ Rejected'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                    {isKhmer ? 'កំណត់សម្គាល់ការិយាល័យសិក្សា (Admin Notes) ៖' : 'Academic Affairs Notes:'}
                  </label>
                  <textarea
                    rows={3}
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder={isKhmer ? 'បញ្ចូលកំណត់សម្គាល់ ឬការណែនាំដល់បេក្ខជន...' : 'Add notes or instructions...'}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      marginBottom: '10px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(null)}
                    disabled={actionLoading}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '8px',
                      background: '#1e73be',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {isKhmer ? 'រក្សាទុកកំណត់សម្គាល់' : 'Save Notes'}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#64748b',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {isKhmer ? 'បិទ' : 'Close'}
              </button>

              {selectedAdmission.status !== 'enrolled' && (
                <button
                  type="button"
                  onClick={() => {
                    setReviewModalOpen(false);
                    handleOpenEnroll(selectedAdmission);
                  }}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '10px',
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <UserCheck size={16} />
                  <span>{isKhmer ? '🎓 ចុះឈ្មោះជាសិស្សផ្លូវការ (Enroll Student)' : '🎓 Enroll as Student'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          6. 1-CLICK STUDENT ENROLLMENT MODAL
          ========================================================= */}
      {enrollModalOpen && selectedAdmission && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 41, 77, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(7, 41, 77, 0.2)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>
                {isKhmer ? 'ការចុះឈ្មោះជាសិស្សផ្លូវការ' : 'Official Student Enrollment'}
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#07294D', margin: 0 }}>
                {selectedAdmission.khmerName} ({selectedAdmission.latinName})
              </h3>
            </div>

            {/* Body */}
            <div style={{ padding: '24px' }}>
              {enrollSuccessResult ? (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: '#f0fdf4',
                      border: '2px solid #bbf7d0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      color: '#16a34a'
                    }}
                  >
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 style={{ color: '#166534', fontWeight: 800, margin: '0 0 8px' }}>
                    {isKhmer ? 'បានចុះឈ្មោះជោគជ័យ!' : 'Successfully Enrolled!'}
                  </h3>
                  <p style={{ color: '#15803d', fontSize: '0.88rem', marginBottom: '20px' }}>
                    {isKhmer ? 'គណនីនិស្សិតត្រូវបានបង្កើត និងផ្ញើព័ត៌មានរួចរាល់' : 'Official student credentials created successfully.'}
                  </p>

                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'left', marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.85rem', marginBottom: '6px' }}>
                      <strong>Student ID:</strong> <span style={{ color: '#16a34a', fontWeight: 800 }}>{enrollSuccessResult.credentials?.studentId}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', marginBottom: '6px' }}>
                      <strong>Official Email:</strong> <span>{enrollSuccessResult.credentials?.email}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                      <strong>Temporary Password:</strong> <code>{enrollSuccessResult.credentials?.temporaryPassword}</code>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEnrollModalOpen(false)}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '10px',
                      background: '#07294D',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {isKhmer ? 'បិទផ្ទាំងនេះ' : 'Close'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEnrollSubmit}>
                  <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '0 0 16px' }}>
                    {isKhmer
                      ? 'ប្រព័ន្ធនឹងបង្កើតគណនីនិស្សិតផ្លូវការ ដោយភ្ជាប់ជាមួយ Student ID និងអ៊ីមែលសាលា (@rpitssr.edu.kh)។'
                      : 'Create an official student record with an assigned Student ID and institute email.'}
                  </p>

                  <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#07294D', marginBottom: '4px' }}>
                        {isKhmer ? 'អត្តលេខនិស្សិត (ទុកទទេដើម្បី Generate ស្វ័យប្រវត្ត)' : 'Student ID (Leave blank to auto-generate)'}
                      </label>
                      <input
                        type="text"
                        value={enrollForm.studentId}
                        onChange={(e) => setEnrollForm({ ...enrollForm, studentId: e.target.value })}
                        placeholder="e.g. STU-2026-090"
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#07294D', marginBottom: '4px' }}>
                        {isKhmer ? 'អ៊ីមែលផ្លូវការ (ទុកទទេដើម្បី Generate ស្វ័យប្រវត្ត)' : 'Official Email (Leave blank to auto-generate)'}
                      </label>
                      <input
                        type="email"
                        value={enrollForm.email}
                        onChange={(e) => setEnrollForm({ ...enrollForm, email: e.target.value })}
                        placeholder="e.g. username@rpitssr.edu.kh"
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#07294D', marginBottom: '4px' }}>
                          {isKhmer ? 'ឆ្នាំសិក្សា' : 'Academic Year'}
                        </label>
                        <input
                          type="text"
                          value={enrollForm.academicYear}
                          onChange={(e) => setEnrollForm({ ...enrollForm, academicYear: e.target.value })}
                          style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#07294D', marginBottom: '4px' }}>
                          {isKhmer ? 'ឆមាស' : 'Semester'}
                        </label>
                        <select
                          value={enrollForm.semester}
                          onChange={(e) => setEnrollForm({ ...enrollForm, semester: e.target.value })}
                          style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#ffffff' }}
                        >
                          <option value="1">ឆមាសទី ១ (Semester 1)</option>
                          <option value="2">ឆមាសទី ២ (Semester 2)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setEnrollModalOpen(false)}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#64748b',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {isKhmer ? 'បោះបង់' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      style={{
                        padding: '10px 22px',
                        borderRadius: '10px',
                        background: '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 700,
                        cursor: actionLoading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {actionLoading ? (isKhmer ? 'កំពុងចុះឈ្មោះ...' : 'Enrolling...') : (isKhmer ? '✓ បញ្ជាក់ការចុះឈ្មោះ' : 'Confirm Enrollment')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdmissionsPage;
