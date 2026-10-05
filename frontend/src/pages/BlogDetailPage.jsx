import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useLanguage } from '../context/LanguageContext';
import { getCategoryDisplayName } from './BlogPage';
import client from '../api/client';

export const BlogDetailPage = () => {
  const { id, slug } = useParams();
  const { t, currentLanguage } = useLanguage();
  const isKhmer = currentLanguage === 'km';
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const postId = id || slug || 17;
    setLoading(true);

    client.get(`/blog-posts/${postId}`)
      .then(res => {
        const data = res.data?.post || res.data?.data || res.data;
        if (data && (data.id || data.title)) {
          setPost(data);
        } else {
          setPost(null);
        }
      })
      .catch((err) => {
        console.error('Error fetching blog post:', err);
        setPost(null);
      })
      .finally(() => {
        setLoading(false);
      });

    // Fetch recent posts
    client.get('/blog-posts')
      .then(res => {
        const posts = res.data?.posts || res.data?.data?.posts || res.data?.data || res.data || [];
        setRecentPosts(Array.isArray(posts) ? posts.slice(0, 4) : []);
      })
      .catch(() => {});

    // Fetch categories for sidebar
    client.get('/blog-categories')
      .then(res => {
        const cats = res.data?.categories || res.data?.data || res.data || [];
        setCategories(Array.isArray(cats) ? cats : []);
      })
      .catch(() => {});
  }, [id, slug]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getReadingTime = (content) => {
    if (!content || typeof content !== 'string') return 1;
    const textOnly = content.replace(/<[^>]*>/g, '').trim();
    const words = textOnly.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 180));
  };

  const copyPageLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const categoryName = post?.category
    ? (typeof post.category === 'object' ? post.category.name : post.category)
    : null;

  const currentUrl = window.location.href;

  return (
    <div>
      {/* 1. INSTITUTIONAL DAYLIGHT HERO (No Background Image - AGENTS.md Compliant) */}
      <section className="gallery-page-hero" style={{ padding: '48px 0 38px' }}>
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-10">
              {/* Breadcrumb & Official Badge */}
              <div className="gallery-hero-meta-row">
                <div className="gallery-breadcrumb">
                  <Link to="/">
                    <i className="fas fa-home me-1"></i>
                    {isKhmer ? 'ទំព័រដើម' : 'Home'}
                  </Link>
                  <i className="fas fa-chevron-right text-muted" style={{ fontSize: '0.72rem' }}></i>
                  <Link to="/blog">
                    {isKhmer ? 'ព័ត៌មាន' : 'Blog'}
                  </Link>
                  <i className="fas fa-chevron-right text-muted" style={{ fontSize: '0.72rem' }}></i>
                  <span>{isKhmer ? 'ព័ត៌មានលម្អិត' : 'Details'}</span>
                </div>
                <div className="gallery-hero-badge">
                  <i className="fas fa-newspaper text-primary"></i>
                  <span>{categoryName || (isKhmer ? 'ព័ត៌មាន និងសេចក្តីប្រកាសផ្លូវការ' : 'Official News & Announcements')}</span>
                </div>
              </div>

              {/* Main Institutional Title */}
              <h1 className="gallery-hero-title" style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.35rem)', marginBottom: '14px' }}>
                {isKhmer ? 'ព័ត៌មានលម្អិត និងសេចក្តីប្រកាស' : 'Official News & Announcements'}
              </h1>

              {/* Subtitle */}
              <p className="gallery-hero-subtitle" style={{ marginBottom: '22px' }}>
                {isKhmer
                  ? 'តាមដានសេចក្តីប្រកាសព័ត៌មានផ្លូវការ កម្មវិធីបណ្តុះបណ្តាល TVET កិច្ចសហប្រតិបត្តិការ និងព្រឹត្តិការណ៍នានារបស់វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប'
                  : 'Explore official institute announcements, TVET educational updates, partnerships, and campus events at RPITSSR.'}
              </p>

              {/* Institutional Trust Badges */}
              <div className="gallery-trust-pills">
                <div className="gallery-trust-pill">
                  <i className="fas fa-shield-alt text-primary"></i>
                  <span>{isKhmer ? 'ព័ត៌មានផ្លូវការស្ថាប័ន' : 'Official Institute News'}</span>
                </div>
                <div className="gallery-trust-pill">
                  <i className="fas fa-graduation-cap text-success"></i>
                  <span>{isKhmer ? 'សកម្មភាពបណ្តុះបណ្តាល TVET' : 'TVET Training Activities'}</span>
                </div>
                <div className="gallery-trust-pill">
                  <i className="fas fa-award text-warning"></i>
                  <span>{isKhmer ? 'កាលបរិច្ឆេទ & ខ្លឹមសារពេញលេញ' : 'Verified & Full Content'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="blog-details-page pt-5 pb-5" style={{ backgroundColor: '#f8fafc', minHeight: '80vh', padding: '40px 0 70px' }}>
        <div className="container" style={{ maxWidth: '1240px', padding: '0 20px' }}>
          <div className="row" style={{ rowGap: '30px' }}>
            {loading ? (
              <div className="col-12 text-center py-5">
                <div style={{ border: '4px solid #f3f4f6', borderTop: '4px solid #07294D', borderRadius: '50%', width: '45px', height: '45px', animation: 'spin 1s linear infinite', margin: '0 auto 15px' }}></div>
                <p className="text-muted">{t('common.loading') || 'Loading Article...'}</p>
              </div>
            ) : post ? (
              <>
                {/* Main Article Content */}
                <div className="col-lg-8">
                  <div
                    className="blog-details-content overflow-hidden mb-4"
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                      border: '1px solid #e2e8f0',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Featured Image */}
                    <div className="blog-image-container" style={{ width: '100%', maxHeight: '480px', overflow: 'hidden' }}>
                      <img
                        src={post.imageUrl || post.image_url || '/images/blog.webp'}
                        alt={post.title}
                        style={{ width: '100%', maxHeight: '480px', objectFit: 'cover', display: 'block' }}
                        onError={(e) => { e.target.src = '/images/blog.webp'; }}
                      />
                    </div>

                    <div style={{ padding: '36px 36px 44px' }}>
                      {/* Post Title */}
                      <h1
                        style={{
                          color: '#07294D',
                          fontWeight: '800',
                          fontSize: '1.9rem',
                          lineHeight: '1.45',
                          marginBottom: '16px',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {post.title}
                      </h1>

                      {/* Meta Information */}
                      <div
                        className="meta d-flex flex-wrap align-items-center gap-3"
                        style={{
                          color: '#64748b',
                          fontSize: '0.9rem',
                          borderBottom: '1px solid #e2e8f0',
                          paddingBottom: '16px',
                          marginBottom: '28px',
                        }}
                      >
                        <span>
                          <i className="far fa-calendar-alt me-1" style={{ color: '#07294D' }}></i>{' '}
                          {formatDate(post.publishedAt || post.createdAt || post.created_at)}
                        </span>
                        <span>
                          <i className="far fa-user me-1" style={{ color: '#07294D' }}></i> By:{' '}
                          {post.author || 'RPITSSR'}
                        </span>
                        <span>
                          <i className="far fa-clock me-1" style={{ color: '#07294D' }}></i>{' '}
                          {getReadingTime(post.content || post.body || post.summary)} min read
                        </span>
                        {categoryName && (
                          <span
                            style={{
                              background: '#eff6ff',
                              color: '#1e40af',
                              padding: '3px 10px',
                              borderRadius: '4px',
                              fontWeight: '600',
                            }}
                          >
                            <i className="far fa-folder me-1"></i> {categoryName}
                          </span>
                        )}
                      </div>

                      {/* Post Body Content (Sanitized against XSS) */}
                      <div
                        className="blog-text-content"
                        style={{
                          color: '#334155',
                          lineHeight: '2.1',
                          fontSize: '1.08rem',
                          marginBottom: '32px',
                          wordBreak: 'break-word',
                        }}
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(post.content || post.body || post.summary || ''),
                        }}
                      />

                      <hr style={{ margin: '28px 0', borderColor: '#e2e8f0' }} />

                      {/* Bottom Actions & Social Share matching rpitssr.edu.kh */}
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <Link
                          to="/blog"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: '1.5px solid #07294D',
                            color: '#07294D',
                            backgroundColor: '#ffffff',
                            fontWeight: '600',
                            fontSize: '0.92rem',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <i className="fas fa-arrow-left"></i> {t('blog.allPosts') || 'ត្រឡប់ទៅព័ត៌មានទាំងអស់'}
                        </Link>

                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span className="text-muted fw-bold me-1">{t('blog.sharePost') || 'Share:'}</span>
                          <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm text-white"
                            style={{ background: '#3b5998', borderRadius: '4px' }}
                            title="Share on Facebook"
                          >
                            <i className="fab fa-facebook-f"></i>
                          </a>
                          <a
                            href={`https://telegram.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(post.title || '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm text-white"
                            style={{ background: '#0088cc', borderRadius: '4px' }}
                            title="Share on Telegram"
                          >
                            <i className="fab fa-telegram-plane"></i>
                          </a>
                          <a
                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent((post.title || '') + ' ' + currentUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm text-white"
                            style={{ background: '#25d366', borderRadius: '4px' }}
                            title="Share on WhatsApp"
                          >
                            <i className="fab fa-whatsapp"></i>
                          </a>
                          <button
                            type="button"
                            onClick={copyPageLink}
                            className="btn btn-sm btn-outline-secondary"
                            style={{ borderRadius: '4px' }}
                            title="Copy Link"
                          >
                            <i className={`fas ${copied ? 'fa-check text-success' : 'fa-copy'} me-1`}></i>
                            {copied ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar matching rpitssr.edu.kh */}
                <div className="col-lg-4 mt-4 mt-lg-0">
                  {/* Categories Widget */}
                  {categories.length > 0 && (
                    <div
                      className="blog-sidebar mb-4"
                      style={{
                        backgroundColor: '#ffffff',
                        padding: '24px 24px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <h5
                        className="sidebar-title mb-3"
                        style={{
                          color: '#07294D',
                          fontWeight: '700',
                          borderBottom: '2px solid #07294D',
                          paddingBottom: '10px'
                        }}
                      >
                        {t('blog.allCategories') || 'Categories'}
                      </h5>
                      <ul className="list-unstyled mb-0">
                        {categories.map((cat) => (
                          <li
                            key={cat.id}
                            className="d-flex justify-content-between align-items-center py-2 border-bottom"
                          >
                            <Link
                              to={`/blog?category=${cat.id}`}
                              style={{ color: '#333', textDecoration: 'none', fontWeight: '500' }}
                            >
                              <i className="far fa-folder me-2 text-primary"></i> {getCategoryDisplayName(cat, isKhmer)}
                            </Link>
                            {cat.posts_count !== undefined && (
                              <span className="badge bg-light text-dark rounded-pill">
                                {cat.posts_count}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recent Articles Widget */}
                  <div
                    className="blog-sidebar"
                    style={{
                      backgroundColor: '#ffffff',
                      padding: '24px 24px',
                      borderRadius: '16px',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <h5
                      className="sidebar-title mb-3"
                      style={{
                        color: '#07294D',
                        fontWeight: '700',
                        borderBottom: '2px solid #07294D',
                        paddingBottom: '10px'
                      }}
                    >
                      {t('blog.latestPosts') || 'Recent Articles'}
                    </h5>
                    <div className="recent-posts-list">
                      {recentPosts.length > 0 ? (
                        recentPosts.map((rPost) => (
                          <div
                            key={rPost.id}
                            className="d-flex gap-3 mb-3 pb-3"
                            style={{ borderBottom: '1px solid #eee' }}
                          >
                            <img
                              src={rPost.imageUrl || rPost.image_url || '/images/blog.webp'}
                              alt={rPost.title}
                              style={{
                                width: '70px',
                                height: '70px',
                                objectFit: 'cover',
                                borderRadius: '6px',
                                flexShrink: 0
                              }}
                              onError={(e) => { e.target.src = '/images/blog.webp'; }}
                            />
                            <div>
                              <h6
                                style={{
                                  fontSize: '0.9rem',
                                  fontWeight: '700',
                                  lineHeight: '1.4',
                                  marginBottom: '4px'
                                }}
                              >
                                <Link
                                  to={`/blog-details/${rPost.id}`}
                                  style={{ color: '#07294D', textDecoration: 'none' }}
                                >
                                  {rPost.title}
                                </Link>
                              </h6>
                              <small className="text-muted">
                                {formatDate(rPost.publishedAt || rPost.createdAt || rPost.created_at)}
                              </small>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted mb-0">No recent articles.</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="col-12 text-center py-5">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: '64px', height: '64px', backgroundColor: '#fef2f2', color: '#dc2626' }}
                >
                  <i className="fas fa-exclamation-circle" style={{ fontSize: '1.6rem' }}></i>
                </div>
                <h4 style={{ color: '#07294D', fontWeight: 800, marginBottom: '8px' }}>
                  {isKhmer ? 'រកមិនឃើញអត្ថបទព័ត៌មាននេះឡើយ' : 'Article Not Found'}
                </h4>
                <p className="text-muted small mb-4">
                  {isKhmer ? 'អត្ថបទនេះអាចត្រូវបានផ្លាស់ប្តូរ ឬដកចេញពីប្រព័ន្ធ។' : 'This article may have been moved or removed.'}
                </p>
                <Link
                  to="/blog"
                  style={{
                    backgroundColor: '#07294D',
                    color: '#ffffff',
                    padding: '10px 24px',
                    borderRadius: '50px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <i className="fas fa-arrow-left"></i>
                  <span>{isKhmer ? 'ត្រឡប់ទៅព័ត៌មានទាំងអស់' : 'Back to All Articles'}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
