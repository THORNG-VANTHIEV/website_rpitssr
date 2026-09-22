import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Clock, ChevronRight, Edit3, Award, BookOpen } from 'lucide-react';

export const CourseCard = ({ course }) => {
  const { t, currentLanguage, language } = useLanguage();
  const isKhmer = currentLanguage === 'km' || language === 'km';
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

  const isFree = course.fee === '0' || course.fee === 0 || !course.fee || String(course.fee).toLowerCase() === 'free';
  const feeVal = isFree ? '0' : String(course.fee).replace('$', '');

  return (
    <div className="single-courses modern-course-card">
      {imageUrl && (
        <div className="courses-image">
          <Link to={`/courses-details/${course.id}`} onClick={() => window.scrollTo(0, 0)}>
            <img
              src={imageUrl}
              alt={course.title}
              onError={(e) => { e.target.src = '/images/courses/Course 3.jpg'; }}
              loading="lazy"
            />
          </Link>
          {isFree && (
            <span className="course-card-badge-free">
              <Award size={12} />
              <span>{isKhmer ? 'អាហារូបករណ៍ ១០០%' : '100% Scholarship'}</span>
            </span>
          )}
        </div>
      )}

      <div className="course-card-content">
        <Link to={`/courses-details/${course.id}`} className="category" onClick={() => window.scrollTo(0, 0)}>
          #{categoryTag}
        </Link>

        <h4 className="courses-title">
          <Link to={`/courses-details/${course.id}`} onClick={() => window.scrollTo(0, 0)}>
            {course.title}
          </Link>
        </h4>

        {course.description && (
          <p className="courses-desc-snippet">
            {course.description}
          </p>
        )}

        <div className="duration-fee">
          <div className="duration">
            <Clock size={13} className="course-meta-icon" />
            <span>{course.duration || (isKhmer ? '៤ ឆ្នាំ' : '4 Years')}</span>
          </div>
          <div className="fee">
            {isFree ? (
              <span className="course-fee-free-tag">{isKhmer ? 'ឥតគិតថ្លៃ' : 'Free ($0)'}</span>
            ) : (
              <span className="course-fee-val">${feeVal}</span>
            )}
          </div>
        </div>

        <div className="courses-link">
          <Link className="more" to={`/courses-details/${course.id}`} onClick={() => window.scrollTo(0, 0)}>
            <BookOpen size={13} />
            <span>{isKhmer ? 'មើលលម្អិត' : 'Details'}</span>
          </Link>
          <Link className="apply" to="/register" onClick={() => window.scrollTo(0, 0)}>
            <Edit3 size={13} />
            <span>{isKhmer ? 'ដាក់ពាក្យ' : 'Apply'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
