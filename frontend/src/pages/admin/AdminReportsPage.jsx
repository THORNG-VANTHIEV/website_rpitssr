import React, { useState } from 'react';
import { BarChart3, Download, FileSpreadsheet, Calendar, Filter } from 'lucide-react';

export const AdminReportsPage = () => {
  const [reportType, setReportType] = useState('courses');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-09-12');
  const [generating, setGenerating] = useState(false);

  const reportsList = [
    { title: 'Student Enrollment Breakdown', type: 'Student Statistics', date: '2026-09-01', records: '1,240 Students', format: 'PDF & Excel' },
    { title: 'Vocational Courses & Capacity', type: 'Academic Summary', date: '2026-08-15', records: '48 Programs', format: 'PDF & Excel' },
    { title: 'Instructor & Teaching Hours', type: 'Faculty Report', date: '2026-07-30', records: '65 Instructors', format: 'PDF' },
    { title: 'Exam Scores & Pass Rates (Semester 1)', type: 'Exam Evaluation', date: '2026-06-25', records: '980 Scores', format: 'Excel' },
  ];

  const handleGenerate = (e) => {
    e.preventDefault();
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      alert(`Report generated successfully for ${reportType.toUpperCase()} from ${startDate} to ${endDate}!`);
    }, 1200);
  };

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            <BarChart3 size={20} color="var(--admin-accent)" />
            Generate Analytics & Academic Reports
          </h3>
        </div>
        <form onSubmit={handleGenerate} className="admin-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Report Category</label>
              <select
                className="admin-form-control"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="courses">Courses & Enrollment</option>
                <option value="students">Student Admissions</option>
                <option value="exams">Examination Pass/Fail Rates</option>
                <option value="teachers">Faculty Allocation</option>
                <option value="financial">Tuition & Scholarships</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Start Date</label>
              <input
                type="date"
                className="admin-form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">End Date</label>
              <input
                type="date"
                className="admin-form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={generating}>
              <Download size={15} />
              <span>{generating ? 'Processing Report...' : 'Generate & Download Report'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Available Pre-generated Reports */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Archived Institute Reports</h3>
        </div>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Report Title</th>
                <th>Type</th>
                <th>Period / Date</th>
                <th>Data Volume</th>
                <th>Format</th>
                <th style={{ textAlign: 'right' }}>Download</th>
              </tr>
            </thead>
            <tbody>
              {reportsList.map((r, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: '600', color: 'var(--admin-primary)' }}>{r.title}</td>
                  <td><span className="admin-badge admin-badge-info">{r.type}</span></td>
                  <td>{r.date}</td>
                  <td>{r.records}</td>
                  <td><code>{r.format}</code></td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => alert(`Downloading ${r.title}...`)}
                      className="admin-btn admin-btn-outline admin-btn-sm"
                    >
                      <Download size={14} /> Export
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
