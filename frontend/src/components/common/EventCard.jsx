import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getCleanExcerpt } from '../../utils/textUtils';

export const EventCard = ({ event }) => {
  const { t, language } = useLanguage();
  const [imageError, setImageError] = useState(false);

  if (!event) return null;

  const defaultImg = '/images/gallery/school.jpg';
  const rawImg = event.imageUrl || event.image || event.image_url;
  const imageSrc = imageError || !rawImg ? defaultImg : rawImg;

  // Category name resolution
  let categoryName = 'ព្រឹត្តិការណ៍';
  if (event.category) {
    if (typeof event.category === 'object' && event.category.name) {
      categoryName = event.category.name;
    } else if (typeof event.category === 'string') {
      categoryName = event.category;
    }
  }

  // Parse date details for modern calendar badge
  const parseDateDetails = (dateStr) => {
    if (!dateStr) {
      return { day: '--', month: 'TBD', year: '' };
    }
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        return { day: '--', month: 'TBD', year: '' };
      }
      const khmerMonths = [
        'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
        'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
      ];
      const enMonths = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];

      const dayNum = d.getDate();
      const dayFormatted = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
      const monthFormatted = language === 'km' ? khmerMonths[d.getMonth()] : enMonths[d.getMonth()];
      const yearFormatted = d.getFullYear();

      return {
        day: dayFormatted,
        month: monthFormatted,
        year: yearFormatted,
        fullDateKh: `${dayFormatted} ${khmerMonths[d.getMonth()]} ${yearFormatted}`
      };
    } catch {
      return { day: '--', month: 'TBD', year: '' };
    }
  };

  const { day, month, year } = parseDateDetails(event.date);

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const linkTarget = `/events`;
  const isFree = !event.fee || event.fee === '0' || event.fee.toLowerCase().includes('free') || event.fee.includes('ឥតគិតថ្លៃ');

  return (
    <div className="modern-event-card">
      {/* Top Image Container with Badges */}
      <div className="event-card-thumb-wrapper">
        <Link to={linkTarget} onClick={handleScrollTop} className="event-thumb-link">
          <img
            src={imageSrc}
            alt={event.title || 'Event'}
            className="event-card-img"
            onError={() => setImageError(true)}
            loading="lazy"
          />
          <div className="event-thumb-overlay"></div>
        </Link>

        {/* Floating Category Badge */}
        <span className="event-category-pill">
          <i className="fas fa-tag me-1"></i> {categoryName}
        </span>

        {/* Floating 2-Part Calendar Badge */}
        <div className="event-calendar-badge">
          <span className="cal-month">{month}</span>
          <span className="cal-day">{day}</span>
          {year && <span className="cal-year">{year}</span>}
        </div>
      </div>

      {/* Card Body */}
      <div className="event-card-content">
        {/* Meta Info Row */}
        <div className="event-meta-row">
          <span className="event-meta-item time">
            <i className="far fa-clock"></i>
            <span>{event.time || '08:00 AM'}</span>
          </span>
          {isFree && (
            <span className="event-meta-item free-badge">
              <i className="fas fa-check-circle"></i> ឥតគិតថ្លៃ
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="event-card-title">
          <Link to={linkTarget} onClick={handleScrollTop} title={event.title}>
            {event.title}
          </Link>
        </h4>

        {/* Location */}
        <div className="event-location-row">
          <i className="fas fa-map-marker-alt text-danger"></i>
          <span className="location-text">{event.place || 'វិទ្យាស្ថាន RPITSSR'}</span>
        </div>

        {/* Snippet Description */}
        {(event.description || event.overview) && (
          <p className="event-desc-excerpt">
            {getCleanExcerpt(event.description || event.overview, 95)}
          </p>
        )}

        {/* Card Footer */}
        <div className="event-card-footer">
          <Link to={linkTarget} className="event-detail-btn" onClick={handleScrollTop}>
            <span>{t('home.readMore') || 'ព័ត៌មានលម្អិត'}</span>
            <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};
