import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export const CourseCard = ({ course }) => {
  const { t } = useLanguage();
  if (!course) return null;

  const resolveImage = (url) => {
    if (!url) return '/images/courses/Course 3.jpg';
    const clean = url.replace(/\\/g, '/');
    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
    if (clean.startsWith('/uploads/')) return clean;
    if (clean.startsWith('uploads/')) return `/${clean}`;
    if (clean.startsWith('/images/')) return clean;
    if (clean.startsWith('images/')) return `/${clean}`;
    return clean;
  };

  const imageUrl = resolveImage(course.imageUrl || course.image || course.image_url);
  const categoryTag = course.category
    ? (typeof course.category === 'object' ? course.category.name : course.category)
    : (course.title ? course.title.split(' ')[0] : 'TVET');

  const feeVal = course.fee === '0' || course.fee === 0 || !course.fee || course.fee === 'Free'
    ? '0'
    : String(course.fee).replace('$', '');

  return (
    <div className="single-courses">
      {imageUrl && (
        <div className="courses-image" style={{ marginBottom: '15px' }}>
          <Link to={`/courses-details/${course.id}`} onClick={() => window.scrollTo(0, 0)}>
            <img
              src={imageUrl}
              alt={course.title}
              onError={(e) => { e.target.src = '/images/courses/Course 3.jpg'; }}
              style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', display: 'block' }}
            />
          </Link>
        </div>
      )}

      <Link to={`/courses-details/${course.id}`} className="category" onClick={() => window.scrollTo(0, 0)}>
        #{categoryTag}
      </Link>

      <h4 className="courses-title">
        <Link to={`/courses-details/${course.id}`} onClick={() => window.scrollTo(0, 0)}>
          {course.title}
        </Link>
      </h4>

      <div className="duration-fee">
        <p className="duration">
          {t('courses.duration') || 'Duration'}: <span> {course.duration || '៤ ឆ្នាំ'}</span>
        </p>
        <p className="fee">
          {t('courses.fee') || 'Fee'}: <span> ${feeVal}</span>
        </p>
      </div>

      <div className="courses-link">
        <Link className="apply" to="/register" onClick={() => window.scrollTo(0, 0)}>
          <i className="fas fa-edit" style={{ fontSize: '11px' }}></i>
          <span>{t('courses.onlineApply') || 'Apply'}</span>
        </Link>
        <Link className="more" to={`/courses-details/${course.id}`} onClick={() => window.scrollTo(0, 0)}>
          <span>{t('courses.readMore') || 'Read more'}</span>
          <i className="fas fa-chevron-right"></i>
        </Link>
      </div>
    </div>
  );
};
