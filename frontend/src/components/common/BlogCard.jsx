import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getCleanExcerpt } from '../../utils/textUtils';

// Helper for authentic Cambodian date formatting
const formatKhmerDate = (dateStr, isKhmer) => {
  if (!dateStr) return isKhmer ? 'មិនមានកាលបរិច្ឆេទ' : 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return isKhmer ? 'មិនមានកាលបរិច្ឆេទ' : 'N/A';

  if (!isKhmer) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const khmerMonths = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ];
  const toKhmerNumber = (num) => {
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return num.toString().split('').map(char => khmerDigits[char] || char).join('');
  };

  const day = toKhmerNumber(d.getDate());
  const month = khmerMonths[d.getMonth()];
  const year = toKhmerNumber(d.getFullYear());
  return `${day} ${month} ${year}`;
};

// Category styling resolver following AGENTS.md pastel palette
export const getCategoryStyle = (catName) => {
  const c = (catName || '').toLowerCase();
  if (c.includes('scholar') || c.includes('អាហារូបករណ៍') || c.includes('promotion')) {
    return { background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' };
  }
  if (c.includes('event') || c.includes('ព្រឹត្តិការណ៍') || c.includes('workshop')) {
    return { background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff' };
  }
  if (c.includes('achieve') || c.includes('iso') || c.includes('សមិទ្ធផល') || c.includes('award')) {
    return { background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' };
  }
  if (c.includes('partner') || c.includes('ដៃគូ') || c.includes('mou')) {
    return { background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa' };
  }
  return { background: '#eff6ff', color: '#1e73be', border: '1px solid #dbeafe' };
};

// Category name resolver helper
export const resolveCategoryName = (post, isKhmer) => {
  let categoryName = isKhmer ? 'ព័ត៌មានទូទៅ' : 'Campus News';
  if (post?.category) {
    if (typeof post.category === 'object' && post.category.name) categoryName = post.category.name;
    else if (typeof post.category === 'string') categoryName = post.category;
  } else if (post?.tags) {
    let tags = [];
    if (Array.isArray(post.tags)) tags = post.tags;
    else if (typeof post.tags === 'string') {
      try {
        const parsed = JSON.parse(post.tags);
        tags = Array.isArray(parsed) ? parsed : [post.tags];
      } catch (e) {
        tags = [post.tags];
      }
    }
    if (tags.length > 0) {
      const first = tags[0];
      if (typeof first === 'object' && first.name) categoryName = first.name;
      else if (typeof first === 'string') categoryName = first;
    }
  } else if (post?.title) {
    const titleLower = post.title.toLowerCase();
    if (titleLower.includes('scholar') || titleLower.includes('អាហារូបករណ៍') || titleLower.includes('១០០%')) {
      categoryName = isKhmer ? 'អាហារូបករណ៍' : 'Scholarships';
    } else if (titleLower.includes('event') || titleLower.includes('ពិធី') || titleLower.includes('បវេសនកាល')) {
      categoryName = isKhmer ? 'ព្រឹត្តិការណ៍' : 'Events';
    } else if (titleLower.includes('partner') || titleLower.includes('jica') || titleLower.includes('adb') || titleLower.includes('ដៃគូ')) {
      categoryName = isKhmer ? 'កិច្ចសហប្រតិបត្តិការ' : 'Partnership';
    } else if (titleLower.includes('iso') || titleLower.includes('គុណភាព') || titleLower.includes('ជ័យលាភី')) {
      categoryName = isKhmer ? 'សមិទ្ធផល' : 'Achievement';
    }
  }

  if (isKhmer) {
    const catLower = (categoryName || '').toLowerCase();
    if (catLower === 'promotion' || catLower.includes('scholar')) categoryName = 'អាហារូបករណ៍';
    else if (catLower === 'news' || catLower.includes('campus')) categoryName = 'ព័ត៌មានទូទៅ';
    else if (catLower === 'events' || catLower.includes('event')) categoryName = 'ព្រឹត្តិការណ៍';
    else if (catLower === 'partnership' || catLower.includes('partner')) categoryName = 'កិច្ចសហប្រតិបត្តិការ';
    else if (catLower === 'achievement' || catLower.includes('achieve')) categoryName = 'សមិទ្ធផល & គុណភាព';
    else if (catLower === 'education') categoryName = 'ការអប់រំបណ្តុះបណ្តាល';
  }

  return categoryName;
};

export const BlogCard = ({ post, featured = false }) => {
  const { t, language, currentLanguage } = useLanguage();
  if (!post) return null;

  const isKhmer = (currentLanguage || language) === 'km';
  const imageUrl = post.imageUrl || post.image_url || '/images/blog-placeholder.jpg';

  const categoryName = resolveCategoryName(post, isKhmer);

  const dateStr = post.publishedAt || post.createdAt || post.created_at;
  const formattedDate = formatKhmerDate(dateStr, isKhmer);

  const isRecent = (() => {
    if (post.is_new || post.isNew) return true;
    if (!dateStr) return false;
    const postTime = new Date(dateStr).getTime();
    if (isNaN(postTime)) return false;
    const diffDays = (Date.now() - postTime) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 14;
  })();

  const linkTarget = `/blog-details/${post.id || post.slug}`;
  const commentsCount = Array.isArray(post.comments) ? post.comments.length : (post.comments_count || 0);

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const catStyle = getCategoryStyle(categoryName);

  return (
    <div className={`inst-blog-card modern-blog-card ${featured ? 'featured' : ''}`}>
      <div className="inst-blog-media">
        <Link to={linkTarget} onClick={handleScrollTop} className="d-block w-100 h-100">
          <img
            src={imageUrl}
            alt={post.title || 'Blog post'}
            onError={(e) => { e.target.src = '/images/blog.webp'; }}
          />
        </Link>
        <div className="inst-blog-cat-badge" style={catStyle}>
          {categoryName}
        </div>
        {isRecent && (
          <span
            className="badge position-absolute top-0 end-0 m-3 px-2.5 py-1 rounded-pill shadow-sm"
            style={{ backgroundColor: '#ffaf00', color: '#07294D', fontWeight: '800', fontSize: '0.72rem', zIndex: 2 }}
          >
            <i className="fas fa-sparkles me-1"></i>
            {isKhmer ? 'ថ្មី' : 'NEW'}
          </span>
        )}
      </div>

      <div className="inst-blog-body">
        <div className="inst-blog-meta">
          <span>
            <i className="far fa-calendar-alt text-primary"></i>
            {formattedDate}
          </span>
          <span>
            <i className="far fa-user text-primary"></i>
            {post.author || 'RPITSSR News'}
          </span>
        </div>

        <h4 className="inst-blog-title">
          <Link to={linkTarget} onClick={handleScrollTop}>
            {post.title}
          </Link>
        </h4>

        <p className="inst-blog-excerpt">
          {getCleanExcerpt(post, 120)}
        </p>

        <div className="inst-blog-footer">
          <Link to={linkTarget} className="inst-blog-btn" onClick={handleScrollTop}>
            <span>{t('blog.readMore') || 'អានបន្ថែម'}</span>
            <i className="fas fa-arrow-right"></i>
          </Link>
          <div className="d-flex align-items-center gap-2 text-muted small">
            {post.viewCount !== undefined && post.viewCount > 0 && (
              <span title="Views" className="d-inline-flex align-items-center gap-1">
                <i className="far fa-eye text-secondary"></i>
                <span>{post.viewCount}</span>
              </span>
            )}
            <span title="Comments" className="d-inline-flex align-items-center gap-1">
              <i className="far fa-comments text-secondary"></i>
              <span>{commentsCount}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
