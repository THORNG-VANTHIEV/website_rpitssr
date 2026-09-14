import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageBanner } from '../components/common/PageBanner';
import { useLanguage } from '../context/LanguageContext';
import client from '../api/client';

const SAMPLE_TEACHERS = [
  {
    id: 1,
    name: 'Dr. Seng Bunthoeun',
    designation: 'Director of RPITSSR',
    department: 'Executive Management',
    image_url: '/images/teachers/teacher-1.jpg',
    facebook: 'https://facebook.com',
    linkedin: 'https://linkedin.com'
  },
  {
    id: 2,
    name: 'Eng. Chhay Kimhong',
    designation: 'Head of Information Technology',
    department: 'Information Technology',
    image_url: '/images/teachers/teacher-2.jpg',
    facebook: 'https://facebook.com'
  },
  {
    id: 3,
    name: 'Ms. Keo Sreymom',
    designation: 'Senior Lecturer, Civil Engineering',
    department: 'Civil Engineering',
    image_url: '/images/teachers/teacher-3.jpg',
    facebook: 'https://facebook.com'
  },
  {
    id: 4,
    name: 'Mr. Heng Sokheng',
    designation: 'Electrical Automation Specialist',
    department: 'Electrical Engineering',
    image_url: '/images/teachers/teacher-4.jpg',
    facebook: 'https://facebook.com'
  }
];

export const TeachersPage = () => {
  const { t } = useLanguage();
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/teachers')
      .then(res => {
        const data = res.data?.data || res.data || [];
        const validList = Array.isArray(data) ? data : [];
        const listToUse = validList.length > 0 ? validList : SAMPLE_TEACHERS;
        setTeachers(listToUse);
        setFilteredTeachers(listToUse);
        const depts = [...new Set(listToUse.map(item => item.department).filter(Boolean))];
        setDepartments(depts);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching teachers:', err);
        setTeachers(SAMPLE_TEACHERS);
        setFilteredTeachers(SAMPLE_TEACHERS);
        setDepartments([...new Set(SAMPLE_TEACHERS.map(i => i.department))]);
        setLoading(false);
      });
  }, []);

  const handleFilter = (dept) => {
    setSelectedDept(dept);
    if (dept === 'all') {
      setFilteredTeachers(teachers);
    } else {
      setFilteredTeachers(teachers.filter(t => t.department === dept));
    }
  };

  return (
    <div>
      <PageBanner
        title={t('teachers.title') || 'Our Teachers'}
        image="/images/teachers.webp"
      />

      <section className="teachers-page" style={{ padding: '60px 0' }}>
        <div className="container">
          {/* Filter by Department */}
          <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1f2937', marginBottom: '1.5rem', textAlign: 'center' }}>
              {t('teachers.filterByDepartment') || 'Filter by Department'}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', maxWidth: '900px' }}>
              <button
                type="button"
                onClick={() => handleFilter('all')}
                style={{
                  padding: '0.65rem 1.75rem',
                  borderRadius: '50px',
                  border: selectedDept === 'all' ? '2px solid #07294D' : '2px solid #e5e7eb',
                  background: selectedDept === 'all' ? '#07294D' : 'white',
                  color: selectedDept === 'all' ? 'white' : '#6b7280',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: selectedDept === 'all' ? '0 4px 12px rgba(7, 41, 77, 0.25)' : 'none'
                }}
              >
                <i className="fas fa-users" style={{ marginRight: '0.5rem' }}></i>
                {t('teachers.allTeachers') || 'All Faculty'} ({teachers.length})
              </button>

              {departments.map((dept) => {
                const count = teachers.filter(item => item.department === dept).length;
                const isSelected = selectedDept === dept;
                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => handleFilter(dept)}
                    style={{
                      padding: '0.65rem 1.75rem',
                      borderRadius: '50px',
                      border: isSelected ? '2px solid #07294D' : '2px solid #e5e7eb',
                      background: isSelected ? '#07294D' : 'white',
                      color: isSelected ? 'white' : '#6b7280',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(7, 41, 77, 0.25)' : 'none'
                    }}
                  >
                    <i className="fas fa-graduation-cap" style={{ marginRight: '0.5rem' }}></i>
                    {dept} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading or Grid */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ border: '4px solid #f3f4f6', borderTop: '4px solid #07294D', borderRadius: '50%', width: '45px', height: '45px', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ color: '#666' }}>{t('teachers.loadingTeachers') || 'Loading Teachers...'}</p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f9fafb', borderRadius: '12px', border: '2px dashed #e5e7eb' }}>
              <i className="fas fa-user-slash" style={{ fontSize: '3.5rem', color: '#d1d5db', marginBottom: '1rem' }}></i>
              <h4 style={{ color: '#6b7280' }}>{t('teachers.noTeachers') || 'No Teachers Found'}</h4>
              <p style={{ color: '#9ca3af' }}>{t('teachers.noTeachersMsg') || 'No teachers match this department category.'}</p>
            </div>
          ) : (
            <div className="row teachers-row">
              {filteredTeachers.map((teacher) => (
                <div key={teacher.id} className="col-md-4 col-sm-6 teachers-col">
                  <div
                    className="single-teacher mt-30 text-center"
                    style={{
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease',
                      background: 'white',
                    }}
                  >
                    <div className="teacher-social">
                      <ul className="social">
                        {teacher.facebook && (
                          <li>
                            <a href={teacher.facebook} target="_blank" rel="noopener noreferrer">
                              <i className="fab fa-facebook-f"></i>
                            </a>
                          </li>
                        )}
                        {teacher.twitter && (
                          <li>
                            <a href={teacher.twitter} target="_blank" rel="noopener noreferrer">
                              <i className="fab fa-twitter"></i>
                            </a>
                          </li>
                        )}
                        {teacher.instagram && (
                          <li>
                            <a href={teacher.instagram} target="_blank" rel="noopener noreferrer">
                              <i className="fab fa-instagram"></i>
                            </a>
                          </li>
                        )}
                        {teacher.linkedin && (
                          <li>
                            <a href={teacher.linkedin} target="_blank" rel="noopener noreferrer">
                              <i className="fab fa-linkedin-in"></i>
                            </a>
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="teacher-image">
                      <Link to={`/teacher-details/${teacher.id}`}>
                        <img
                          src={teacher.image_url || teacher.imageUrl || '/images/teacher-all.jpg'}
                          alt={teacher.name}
                          style={{ width: '100%', height: '320px', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = '/images/teacher-all.jpg'; }}
                        />
                      </Link>
                    </div>

                    <div className="teacher-content" style={{ padding: '1.5rem' }}>
                      <h4 className="name">
                        <Link to={`/teacher-details/${teacher.id}`} style={{ color: '#07294D', textDecoration: 'none' }}>
                          {teacher.name}
                        </Link>
                      </h4>
                      <span className="designation" style={{ display: 'block', color: '#666', fontSize: '0.9rem', marginTop: '4px' }}>
                        {teacher.designation}
                      </span>
                      {teacher.department && (
                        <div
                          style={{
                            marginTop: '0.75rem',
                            display: 'inline-block',
                            padding: '0.3rem 0.9rem',
                            background: '#eff6ff',
                            borderRadius: '20px',
                            fontSize: '0.82rem',
                            color: '#1e40af',
                            fontWeight: '600',
                          }}
                        >
                          <i className="fas fa-building" style={{ marginRight: '0.4rem' }}></i>
                          {teacher.department}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
