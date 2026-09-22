import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  BarChart3,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Newspaper,
  BookOpen,
  HelpCircle,
  ArrowDownToLine,
  FileText,
  FileCode,
  Layers,
  Sparkles,
  ExternalLink,
  Printer,
  Table,
  Check,
} from 'lucide-react';

export const AdminReportsPage = () => {
  const { currentLanguage, language } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  const [reportType, setReportType] = useState('courses');
  const [reportFormat, setReportFormat] = useState('csv'); // 'csv', 'json'
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [generating, setGenerating] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [toast, setToast] = useState(null);

  // Live system counts
  const [statsData, setStatsData] = useState({
    courses: 10,
    posts: 5,
    events: 9,
    faqs: 10,
    books: 8,
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const loadSystemStats = async () => {
    setLoadingStats(true);
    try {
      const [coursesRes, postsRes, eventsRes, faqsRes, booksRes] = await Promise.allSettled([
        api.get('/courses'),
        api.get('/admin/blog-posts?limit=100'),
        api.get('/events'),
        api.get('/faqs'),
        api.get('/admin/library/books'),
      ]);

      const getCount = (res, fallback = 0) => {
        if (res.status === 'fulfilled' && res.value?.data) {
          const d = res.value.data;
          if (Array.isArray(d)) return d.length;
          if (Array.isArray(d.data)) return d.data.length;
          if (Array.isArray(d.courses)) return d.courses.length;
          if (Array.isArray(d.posts)) return d.posts.length;
          if (Array.isArray(d.books)) return d.books.length;
        }
        return fallback;
      };

      setStatsData({
        courses: getCount(coursesRes, 10),
        posts: getCount(postsRes, 5),
        events: getCount(eventsRes, 9),
        faqs: getCount(faqsRes, 10),
        books: getCount(booksRes, 8),
      });
    } catch (err) {
      console.error('Error gathering report stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadSystemStats();
  }, []);

  // Preset Archived Reports List
  const archivedReports = useMemo(() => [
    {
      id: 1,
      title: isKhmer ? 'បញ្ជីជំនាញ និងកម្មវិធីបណ្តុះបណ្តាល TVET' : 'Vocational Courses & Training Curricula',
      type: isKhmer ? 'កម្មវិធីសិក្សា' : 'Curriculum',
      categoryKey: 'courses',
      date: '2026-09-15',
      records: `${statsData.courses} ${isKhmer ? 'ជំនាញ' : 'Majors'}`,
      format: 'CSV / Excel',
      size: '24 KB',
    },
    {
      id: 2,
      title: isKhmer ? 'អត្ថបទព័ត៌មាន និងសេចក្តីប្រកាសស្ថាប័ន' : 'Press Releases & Blog Publications',
      type: isKhmer ? 'ព័ត៌មាន & សារព័ត៌មាន' : 'Press Releases',
      categoryKey: 'posts',
      date: '2026-09-14',
      records: `${statsData.posts} ${isKhmer ? 'អត្ថបទ' : 'Articles'}`,
      format: 'CSV / Excel',
      size: '48 KB',
    },
    {
      id: 3,
      title: isKhmer ? 'ព្រឹត្តិការណ៍ សិក្ខាសាលា និងសកម្មភាពជាតិ' : 'Institutional Events & Workshops Log',
      type: isKhmer ? 'ព្រឹត្តិការណ៍' : 'Events',
      categoryKey: 'events',
      date: '2026-09-10',
      records: `${statsData.events} ${isKhmer ? 'ព្រឹត្តិការណ៍' : 'Events'}`,
      format: 'CSV / Excel',
      size: '18 KB',
    },
    {
      id: 4,
      title: isKhmer ? 'បញ្ជីសៀវភៅ និងធនធានបណ្ណាល័យបច្ចេកវិទ្យា' : 'Library Catalog & Digital Materials',
      type: isKhmer ? 'បណ្ណាល័យ' : 'Library Catalog',
      categoryKey: 'books',
      date: '2026-09-08',
      records: `${statsData.books} ${isKhmer ? 'សៀវភៅ' : 'Books'}`,
      format: 'CSV / Excel',
      size: '32 KB',
    },
    {
      id: 5,
      title: isKhmer ? 'សំណួរ-ចម្លើយញឹកញាប់ពីសិស្ស-និស្សិត' : 'Student Frequently Asked Questions (FAQs)',
      type: isKhmer ? 'សំណួរ-ចម្លើយ' : 'Knowledge Base',
      categoryKey: 'faqs',
      date: '2026-09-05',
      records: `${statsData.faqs} ${isKhmer ? 'សំណួរ' : 'FAQs'}`,
      format: 'CSV / Excel',
      size: '15 KB',
    },
  ], [isKhmer, statsData]);

  // Helper to trigger browser CSV download
  const downloadCSV = (filename, rows) => {
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      rows.map((row) => row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to trigger browser JSON download
  const downloadJSON = (filename, dataObj) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataObj, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Real Report Generator
  const handleGenerateAndExport = async (targetCategory = reportType, targetFormat = reportFormat) => {
    setGenerating(true);
    try {
      let endpoint = '/courses';
      let titlePrefix = 'rpitssr_courses';
      let headers = ['ID', 'Title', 'Fee', 'Duration', 'Category'];

      if (targetCategory === 'posts') {
        endpoint = '/admin/blog-posts?limit=100';
        titlePrefix = 'rpitssr_news_articles';
      } else if (targetCategory === 'events') {
        endpoint = '/events';
        titlePrefix = 'rpitssr_events';
      } else if (targetCategory === 'books') {
        endpoint = '/admin/library/books';
        titlePrefix = 'rpitssr_library_books';
      } else if (targetCategory === 'faqs') {
        endpoint = '/faqs';
        titlePrefix = 'rpitssr_faqs';
      }

      const res = await api.get(endpoint);
      const raw = res.data;
      const items = Array.isArray(raw) ? raw : (raw?.data || raw?.posts || raw?.courses || raw?.books || []);

      const timestamp = new Date().toISOString().slice(0, 10);
      const fileName = `${titlePrefix}_report_${timestamp}.${targetFormat}`;

      if (targetFormat === 'json') {
        downloadJSON(fileName, {
          institution: 'Regional Polytechnic Institute Techo Sen Siem Reap (RPITSSR)',
          generatedAt: new Date().toISOString(),
          category: targetCategory,
          totalRecords: items.length,
          data: items,
        });
      } else {
        // CSV Format
        let rows = [];
        if (targetCategory === 'courses') {
          rows = [
            ['ID', 'Course Title (ឈ្មោះវគ្គសិក្សា)', 'Category (ប្រភេទ)', 'Duration (រយៈពេល)', 'Fee (ថ្លៃសិក្សា)', 'Created Date'],
            ...items.map((c) => [c.id, c.title, c.category?.name || c.category || 'TVET', c.duration || '--', c.fee || 'Free ឥតគិតថ្លៃ', c.createdAt || '--']),
          ];
        } else if (targetCategory === 'posts') {
          rows = [
            ['ID', 'Article Title (ចំណងជើងអត្ថបទ)', 'Category (ប្រភេទ)', 'Author (អ្នកនិពន្ធ)', 'Views (ការទស្សនា)', 'Status', 'Published Date'],
            ...items.map((p) => [p.id, p.title, p.category?.name || 'General', p.author || 'RPITSSR', p.viewCount || 0, p.status || 'published', p.publishedAt || p.createdAt || '--']),
          ];
        } else if (targetCategory === 'events') {
          rows = [
            ['ID', 'Event Title (ឈ្មោះកម្មវិធី)', 'Location (ទីតាំង)', 'Event Date (កាលបរិច្ឆេទ)', 'Category'],
            ...items.map((e) => [e.id, e.title, e.location || 'RPITSSR Campus', e.date || e.startDate || '--', e.category?.name || 'Event']),
          ];
        } else if (targetCategory === 'books') {
          rows = [
            ['ID', 'Book Title (ចំណងជើងសៀវភៅ)', 'Author (អ្នកនិពន្ធ)', 'ISBN', 'Category (ប្រភេទ)', 'Copies Available'],
            ...items.map((b) => [b.id, b.title, b.author || '--', b.isbn || '--', b.category?.name || 'General', b.available_copies || b.copies || 1]),
          ];
        } else {
          // FAQs
          rows = [
            ['ID', 'Question (សំណួរ)', 'Category (ប្រភេទ)', 'Answer (ចម្លើយបំភ្លឺ)', 'Order'],
            ...items.map((f) => [f.id, f.question, f.category || 'General', f.answer, f.order || 0]),
          ];
        }

        downloadCSV(fileName, rows);
      }

      showToast(isKhmer ? `បានទាញយករបាយការណ៍ "${fileName}" ដោយជោគជ័យ!` : `Report "${fileName}" exported successfully!`);
    } catch (err) {
      console.error('Failed to generate report:', err);
      showToast(isKhmer ? 'បរាជ័យក្នុងការទាញយកទិន្នន័យរបាយការណ៍' : 'Failed to export report.', 'error');
    } finally {
      setGenerating(false);
    }
  };

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
      <div className="admin-page-header admin-reports-header" style={{ marginBottom: '24px' }}>
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
              <FileSpreadsheet size={15} />
              <span>
                {isKhmer ? 'ប្រព័ន្ធបង្កើតរបាយការណ៍ & ស្ថិតិវិភាគទិន្នន័យស្ថាប័ន' : 'Institutional Analytics & Reporting System'}
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
              {isKhmer ? 'របាយការណ៍ និងស្ថិតិស្ថាប័ន RPITSSR' : 'Institutional Reports & Analytics'}
            </h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.94rem', maxWidth: '740px', lineHeight: 1.5 }}>
              {isKhmer
                ? 'ទាញយកស្ថិតិ និងទិន្នន័យសង្ខេបអំពីជំនាញបណ្តុះបណ្តាល អត្ថបទព័ត៌មាន ព្រឹត្តិការណ៍ បណ្ណាល័យ និងសំណួរ-ចម្លើយ ក្នុងទម្រង់ Excel / CSV និង JSON។'
                : 'Generate and export statistical reports for academic courses, press releases, campus events, and library assets in CSV and JSON formats.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="admin-reports-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={loadSystemStats}
              disabled={loadingStats}
              className="admin-btn admin-btn-outline"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: '42px',
                padding: '0 16px',
                background: '#fff',
              }}
              title={isKhmer ? 'ទាញយកស្ថិតិឡើងវិញ' : 'Refresh Stats'}
            >
              <RotateCw size={15} className={loadingStats ? 'animate-spin' : ''} />
              <span>{isKhmer ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}</span>
            </button>

            <button
              onClick={() => handleGenerateAndExport('courses', 'csv')}
              disabled={generating}
              className="admin-btn admin-btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: '42px',
                padding: '0 20px',
                borderRadius: '8px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)',
                boxShadow: '0 4px 12px rgba(30, 115, 190, 0.25)',
              }}
            >
              {generating ? <RotateCw size={16} className="animate-spin" /> : <ArrowDownToLine size={16} />}
              <span>{isKhmer ? 'ទាញយកទិន្នន័យរហ័ស (Excel)' : 'Quick Export (CSV)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 4-Card Institutional KPI Metric Strip */}
      <div className="admin-kpi-grid admin-reports-kpis" style={{ marginBottom: '28px' }}>
        {/* KPI 1: Courses */}
        <div
          className="admin-kpi-card"
          onClick={() => setReportType('courses')}
          style={{
            cursor: 'pointer',
            border: reportType === 'courses' ? '1.5px solid #1e73be' : '1px solid #e2e8f0',
          }}
          title={isKhmer ? 'ចុចដើម្បីជ្រើសរើសរបាយការណ៍វគ្គបណ្តុះបណ្តាល' : 'Click to select Courses report'}
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
              {isKhmer ? 'វគ្គបណ្តុះបណ្តាល TVET' : 'Courses & Programs'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#07294D', lineHeight: 1.2 }}>
              {statsData.courses}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#1e73be', fontWeight: 600, marginTop: '2px' }}>
              {isKhmer ? 'ជំនាញ និងកម្មវិធីសកម្ម' : 'Active training majors'}
            </div>
          </div>
        </div>

        {/* KPI 2: Publications */}
        <div
          className="admin-kpi-card"
          onClick={() => setReportType('posts')}
          style={{
            cursor: 'pointer',
            border: reportType === 'posts' ? '1.5px solid #059669' : '1px solid #e2e8f0',
          }}
          title={isKhmer ? 'ចុចដើម្បីជ្រើសរើសរបាយការណ៍ព័ត៌មាន' : 'Click to select News report'}
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
            <Newspaper size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              {isKhmer ? 'អត្ថបទ & សេចក្តីប្រកាស' : 'News & Press'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#07294D', lineHeight: 1.2 }}>
              {statsData.posts}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
              {isKhmer ? 'អត្ថបទផ្សាយជាសាធារណៈ' : 'Public publications'}
            </div>
          </div>
        </div>

        {/* KPI 3: Events */}
        <div
          className="admin-kpi-card"
          onClick={() => setReportType('events')}
          style={{
            cursor: 'pointer',
            border: reportType === 'events' ? '1.5px solid #7c3aed' : '1px solid #e2e8f0',
          }}
          title={isKhmer ? 'ចុចដើម្បីជ្រើសរើសរបាយការណ៍ព្រឹត្តិការណ៍' : 'Click to select Events report'}
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
            <Calendar size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              {isKhmer ? 'ព្រឹត្តិការណ៍ស្ថាប័ន' : 'Events & Workshops'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#07294D', lineHeight: 1.2 }}>
              {statsData.events}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#7c3aed', fontWeight: 600, marginTop: '2px' }}>
              {isKhmer ? 'សិក្ខាសាលា & កម្មវិធីជាតិ' : 'Organized activities'}
            </div>
          </div>
        </div>

        {/* KPI 4: Library */}
        <div
          className="admin-kpi-card"
          onClick={() => setReportType('books')}
          style={{
            cursor: 'pointer',
            border: reportType === 'books' ? '1.5px solid #ca8a04' : '1px solid #e2e8f0',
          }}
          title={isKhmer ? 'ចុចដើម្បីជ្រើសរើសរបាយការណ៍បណ្ណាល័យ' : 'Click to select Library report'}
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
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              {isKhmer ? 'បណ្ណាល័យ & ធនធាន' : 'Library Resources'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#07294D', lineHeight: 1.2 }}>
              {statsData.books}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#ca8a04', fontWeight: 600, marginTop: '2px' }}>
              {isKhmer ? 'សៀវភៅ & កាតាឡុកសិក្សា' : 'Catalogued materials'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Report Generator Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: 'clamp(16px, 3.5vw, 26px)',
          boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
          marginBottom: '28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#eff6ff',
              border: '1px solid #dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1e73be',
            }}
          >
            <Filter size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#07294D' }}>
              {isKhmer ? 'បង្កើត និងទាញយករបាយការណ៍តាមតម្រូវការ' : 'Generate & Export Custom Report'}
            </h3>
            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
              {isKhmer ? 'ជ្រើសរើសប្រភេទរបាយការណ៍ និងទម្រង់ឯកសារដែលលោកអ្នកត្រូវការ' : 'Select data category and desired export file format'}
            </div>
          </div>
        </div>

        {/* Generator Controls */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerateAndExport(reportType, reportFormat);
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            {/* Report Category */}
            <div className="admin-form-group">
              <label className="admin-form-label" style={{ fontWeight: 700, color: '#07294D', marginBottom: '6px', display: 'block' }}>
                {isKhmer ? 'ប្រភេទរបាយការណ៍ (Category) *' : 'Report Category *'}
              </label>
              <select
                className="admin-form-control"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
              >
                <option value="courses">{isKhmer ? '🎓 ជំនាញ និងកម្មវិធីសិក្សា TVET' : '🎓 Courses & Curriculum'}</option>
                <option value="posts">{isKhmer ? '📰 អត្ថបទព័ត៌មាន & សេចក្តីប្រកាស' : '📰 News & Press Releases'}</option>
                <option value="events">{isKhmer ? '📅 ព្រឹត្តិការណ៍ & សិក្ខាសាលា' : '📅 Events & Workshops'}</option>
                <option value="books">{isKhmer ? '📚 បណ្ណាល័យ & សៀវភៅសិក្សា' : '📚 Library Catalog'}</option>
                <option value="faqs">{isKhmer ? '❓ សំណួរ-ចម្លើយញឹកញាប់ (FAQs)' : '❓ FAQs & Inquiries'}</option>
              </select>
            </div>

            {/* Export Format */}
            <div className="admin-form-group">
              <label className="admin-form-label" style={{ fontWeight: 700, color: '#07294D', marginBottom: '6px', display: 'block' }}>
                {isKhmer ? 'ទម្រង់ឯកសារ (Export Format) *' : 'Export Format *'}
              </label>
              <select
                className="admin-form-control"
                value={reportFormat}
                onChange={(e) => setReportFormat(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
              >
                <option value="csv">{isKhmer ? '📊 Excel / CSV Spreadsheet (.csv)' : '📊 CSV Spreadsheet (.csv)'}</option>
                <option value="json">{isKhmer ? '⚙️ JSON Raw Structured Data (.json)' : '⚙️ JSON Data (.json)'}</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="admin-form-group">
              <label className="admin-form-label" style={{ fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
                {isKhmer ? 'កាលបរិច្ឆេទចាប់ផ្តើម' : 'Start Date'}
              </label>
              <input
                type="date"
                className="admin-form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            {/* End Date */}
            <div className="admin-form-group">
              <label className="admin-form-label" style={{ fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
                {isKhmer ? 'កាលបរិច្ឆេទបញ្ចប់' : 'End Date'}
              </label>
              <input
                type="date"
                className="admin-form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="submit"
              disabled={generating}
              className="admin-btn admin-btn-primary admin-reports-generate-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: '42px',
                padding: '0 24px',
                borderRadius: '8px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)',
                boxShadow: '0 4px 12px rgba(30, 115, 190, 0.25)',
              }}
            >
              {generating ? <RotateCw size={16} className="animate-spin" /> : <Download size={16} />}
              <span>{generating ? (isKhmer ? 'កំពុងបង្កើត...' : 'Processing...') : (isKhmer ? 'ទាញយករបាយការណ៍' : 'Generate & Download')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 4. Archived Reports Table (Zero Horizontal Scrollbar) */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#07294D' }}>
              {isKhmer ? 'បណ្ណសាររបាយការណ៍ស្ថាប័ន' : 'Archived Institutional Reports'}
            </h3>
            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
              {isKhmer ? 'របាយការណ៍ស្តង់ដារដែលត្រូវបានរៀបចំរួចជាស្រេចសម្រាប់ការទាញយកភ្លាមៗ' : 'Pre-configured institutional reports ready for instant 1-click export'}
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="admin-table-wrapper admin-reports-desktop-table" style={{ width: '100%', overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
                  {isKhmer ? 'ចំណងជើងរបាយការណ៍' : 'Report Title'}
                </th>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 700, color: '#475569', width: '150px' }}>
                  {isKhmer ? 'ប្រភេទ' : 'Category'}
                </th>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 700, color: '#475569', width: '130px' }}>
                  {isKhmer ? 'ទំហំទិន្នន័យ' : 'Data Volume'}
                </th>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 700, color: '#475569', width: '120px' }}>
                  {isKhmer ? 'កាលបរិច្ឆេទ' : 'Period / Date'}
                </th>
                <th style={{ padding: '12px 14px', textAlign: 'center', fontSize: '0.82rem', fontWeight: 700, color: '#475569', width: '110px' }}>
                  {isKhmer ? 'ទម្រង់' : 'Format'}
                </th>
                <th style={{ padding: '12px 20px', textAlign: 'right', fontSize: '0.82rem', fontWeight: 700, color: '#475569', width: '120px' }}>
                  {isKhmer ? 'ទាញយក' : 'Export'}
                </th>
              </tr>
            </thead>
            <tbody>
              {archivedReports.map((report) => (
                <tr
                  key={report.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Title */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: '#eff6ff',
                          border: '1px solid #dbeafe',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#1e73be',
                          flexShrink: 0,
                        }}
                      >
                        <FileSpreadsheet size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#07294D', fontSize: '0.92rem' }}>
                          {report.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          File: {report.categoryKey}_report_{report.date}.csv • {report.size}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td style={{ padding: '14px 14px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        background: '#eff6ff',
                        color: '#1e73be',
                        border: '1px solid #dbeafe',
                      }}
                    >
                      {report.type}
                    </span>
                  </td>

                  {/* Records Count */}
                  <td style={{ padding: '14px 14px', fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
                    {report.records}
                  </td>

                  {/* Date */}
                  <td style={{ padding: '14px 14px', fontSize: '0.82rem', color: '#64748b' }}>
                    {report.date}
                  </td>

                  {/* Format Pill */}
                  <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.74rem',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {report.format}
                    </span>
                  </td>

                  {/* 1-Click Export Button */}
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleGenerateAndExport(report.categoryKey, 'csv')}
                      className="admin-btn admin-btn-outline admin-btn-sm"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        color: '#1e73be',
                        borderColor: '#dbeafe',
                        background: '#eff6ff',
                      }}
                      title={isKhmer ? 'ទាញយកជា CSV / Excel' : 'Download CSV'}
                    >
                      <ArrowDownToLine size={13} />
                      <span>{isKhmer ? 'ទាញយក' : 'Export'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dedicated Mobile Cards Layout (< 768px) */}
        <div className="admin-reports-mobile-cards">
          {archivedReports.map((report) => (
            <div
              key={report.id}
              className="admin-card"
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '16px',
                boxShadow: '0 4px 18px rgba(7, 41, 77, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {/* Header: Icon + Title + File Info */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: '#eff6ff',
                    border: '1px solid #dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1e73be',
                    flexShrink: 0,
                  }}
                >
                  <FileSpreadsheet size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, color: '#07294D', fontSize: '0.96rem', lineHeight: 1.35, marginBottom: '4px' }}>
                    {report.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', wordBreak: 'break-all' }}>
                    {report.categoryKey}_report_{report.date}.csv • {report.size}
                  </div>
                </div>
              </div>

              {/* Meta tags stack */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 9px',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    background: '#eff6ff',
                    color: '#1e73be',
                    border: '1px solid #dbeafe',
                  }}
                >
                  {report.type}
                </span>

                <span
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: '#334155',
                    background: '#f8fafc',
                    padding: '3px 9px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  {report.records}
                </span>

                <span
                  style={{
                    fontSize: '0.76rem',
                    color: '#64748b',
                    background: '#f8fafc',
                    padding: '3px 9px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Calendar size={12} />
                  {report.date}
                </span>

                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #e2e8f0',
                    marginLeft: 'auto',
                  }}
                >
                  {report.format}
                </span>
              </div>

              {/* 1-Click Export Action Button */}
              <button
                onClick={() => handleGenerateAndExport(report.categoryKey, 'csv')}
                className="admin-btn admin-btn-primary admin-btn-sm"
                style={{
                  width: '100%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  height: '38px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)',
                  boxShadow: '0 2px 8px rgba(30, 115, 190, 0.2)',
                }}
              >
                <ArrowDownToLine size={15} />
                <span>{isKhmer ? 'ទាញយករបាយការណ៍ (CSV / Excel)' : 'Download CSV Report'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
