import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Clock, ChevronRight, Edit3, Award, BookOpen } from 'lucide-react';
import { resolveImageUrl } from '../../utils/imageUrl';

export const CourseCard = ({ course }) => {
  const { t, currentLanguage, language } = useLanguage();
  const isKhmer = currentLanguage === 'km' || language === 'km';
  if (!course) return null;

  const courseTitle = course.title || (isKhmer ? 'ជំនាញ និងវគ្គបណ្តុះបណ្តាល' : 'Training Program');
  const imageUrl = resolveImageUrl(course.imageUrl || course.image || course.image_url, '/images/courses/Course 3.jpg');
  const categoryTag = course.category
    ? (typeof course.category === 'object' ? course.category.name : course.category)
    : (courseTitle ? courseTitle.split(' ')[0] : 'TVET');

  const isFree = course.fee === '0' || course.fee === 0 || !course.fee || String(course.fee).toLowerCase() === 'free';
  const feeVal = isFree ? '0' : String(course.fee).replace('$', '');

  return (
    <div className="single-courses modern-course-card">
      {imageUrl && (
        <div className="courses-image">
          <Link to={`/courses-details/${course.id}`} onClick={() => window.scrollTo(0, 0)}>
            <img
              src={imageUrl}
              alt={courseTitle}
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
            {courseTitle}
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
