import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageBanner } from '../components/common/PageBanner';
import { useLanguage } from '../context/LanguageContext';
import client from '../api/client';

const SAMPLE_TEACHERS = [
  {
    id: 1,
    name: 'Dr. Seng Bunthoeun',
    nameKm: 'បណ្ឌិត សេង ប៊ុនធឿន',
    designation: 'Director of RPITSSR',
    designationKm: 'នាយកវិទ្យាស្ថាន RPITSSR',
    department: 'Executive Management',
    departmentKm: 'គណៈគ្រប់គ្រងស្ថាប័ន',
    image_url: '/images/teachers/teacher-1.jpg',
    facebook: 'https://facebook.com',
    linkedin: 'https://linkedin.com'
  },
  {
    id: 2,
    name: 'Eng. Chhay Kimhong',
    nameKm: 'វិស្វករ ឆាយ គឹមហុង',
    designation: 'Head of Information Technology',
    designationKm: 'ប្រធានដេប៉ាតឺម៉ង់ព័ត៌មានវិទ្យា',
    department: 'Information Technology',
    departmentKm: 'ព័ត៌មានវិទ្យា',
    image_url: '/images/teachers/teacher-2.jpg',
    facebook: 'https://facebook.com'
  },
  {
    id: 3,
    name: 'Ms. Keo Sreymom',
    nameKm: 'សាស្ត្រាចារ្យ កែវ ស្រីមុំ',
    designation: 'Senior Lecturer, Civil Engineering',
    designationKm: 'សាស្ត្រាចារ្យជាន់ខ្ពស់ វិស្វកម្មសំណង់ស៊ីវិល',
    department: 'Civil Engineering',
    departmentKm: 'សំណង់ស៊ីវិល',
    image_url: '/images/teachers/teacher-3.jpg',
    facebook: 'https://facebook.com'
  },
  {
    id: 4,
    name: 'Mr. Heng Sokheng',
    nameKm: 'លោក ហេង សុខហេង',
    designation: 'Electrical Automation Specialist',
    designationKm: 'អ្នកឯកទេសស្វ័យប្រវត្តិកម្មអគ្គិសនី',
    department: 'Electrical Engineering',
    departmentKm: 'អគ្គិសនី និងថាមពល',
    image_url: '/images/teachers/teacher-4.jpg',
    facebook: 'https://facebook.com'
  }
];

export const TeachersPage = () => {
  const { t, currentLanguage, language } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  const toKhmerNumber = (num) => {
    if (!isKhmer || num === undefined || num === null) return num;
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return String(num).replace(/[0-9]/g, (d) => khmerDigits[parseInt(d, 10)]);
  };

  const getDepartmentName = (dept) => {
    if (!isKhmer) return dept;
    const mapping = {
      'Executive Management': 'គណៈគ្រប់គ្រងស្ថាប័ន',
      'Information Technology': 'ព័ត៌មានវិទ្យា',
      'Civil Engineering': 'សំណង់ស៊ីវិល',
      'Electrical Engineering': 'អគ្គិសនី និងថាមពល',
      'Mechanical Engineering': 'មេកានិច',
      'General Studies': 'ចំណេះទូទៅ'
    };
    return mapping[dept] || dept;
  };

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
                {t('teachers.allTeachers') || 'All Faculty'} ({toKhmerNumber(teachers.length)})
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
                    {getDepartmentName(dept)} ({toKhmerNumber(count)})
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
                          {isKhmer ? (teacher.nameKm || teacher.name) : (teacher.name || teacher.nameKm)}
                        </Link>
                      </h4>
                      <span className="designation" style={{ display: 'block', color: '#666', fontSize: '0.9rem', marginTop: '4px' }}>
                        {isKhmer ? (teacher.designationKm || teacher.designation) : (teacher.designation || teacher.designationKm)}
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
                          {getDepartmentName(teacher.department)}
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
