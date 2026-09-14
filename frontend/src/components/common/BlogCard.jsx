import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getCleanExcerpt } from '../../utils/textUtils';

export const BlogCard = ({ post, featured = false }) => {
  if (!post) return null;

  const { t } = useLanguage();
  const imageUrl = post.imageUrl || post.image_url || '/images/blog-placeholder.jpg';
  
  // Category resolution matching chunk 605
  let categoryName = 'Education';
  if (post.category) {
    if (typeof post.category === 'object' && post.category.name) categoryName = post.category.name;
    else if (typeof post.category === 'string') categoryName = post.category;
  } else if (post.tags) {
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
  } else if (post.title) {
    const titleLower = post.title.toLowerCase();
    if (titleLower.includes('course') || titleLower.includes('class') || titleLower.includes('education')) categoryName = 'Education';
    else if (titleLower.includes('event') || titleLower.includes('ceremony') || titleLower.includes('graduation')) categoryName = 'Events';
    else if (titleLower.includes('news') || titleLower.includes('announcement') || titleLower.includes('notice')) categoryName = 'News';
    else if (titleLower.includes('student') || titleLower.includes('achievement') || titleLower.includes('award')) categoryName = 'Student Life';
  }

  const dateStr = post.publishedAt || post.createdAt || post.created_at;
  const formattedDate = (() => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  })();

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

  return (
    <div className={`modern-blog-card ${featured ? 'featured' : ''}`}>
      <div className="blog-image-wrapper">
        <Link to={linkTarget} onClick={handleScrollTop}>
          <img
            src={imageUrl}
            alt={post.title || 'Blog post'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.src = '/images/blog-placeholder.jpg'; }}
          />
        </Link>
        <div className="blog-category">
          <span>{categoryName}</span>
        </div>
        {isRecent && (
          <span className="blog-new-badge">
            <span className="pulse-dot"></span> ថ្មី
          </span>
        )}
      </div>
      <div className="blog-content-wrapper">
        <div className="blog-meta">
          <div className="meta-item">
            <i className="fas fa-calendar"></i>
            <span>{formattedDate}</span>
          </div>
          <div className="meta-item">
            <i className="fas fa-user"></i>
            <span>{post.author || 'Admin'}</span>
          </div>
        </div>
        <h4 className="blog-title">
          <Link to={linkTarget} onClick={handleScrollTop}>
            {post.title}
          </Link>
        </h4>
        <p className="blog-excerpt">
          {getCleanExcerpt(post, 120)}
        </p>
        <div className="blog-footer">
          <Link to={linkTarget} className="read-more-btn" onClick={handleScrollTop}>
            {t('home.readMore')} <i className="fas fa-arrow-right"></i>
          </Link>
          <div className="blog-engagement">
            <span className="comments-count">
              <i className="fas fa-comments"></i>{commentsCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
