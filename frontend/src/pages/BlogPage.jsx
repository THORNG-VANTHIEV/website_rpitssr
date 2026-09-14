import React, { useState, useEffect } from 'react';
import { PageBanner } from '../components/common/PageBanner';
import { useLanguage } from '../context/LanguageContext';
import { BlogCard } from '../components/common/BlogCard';
import client from '../api/client';

const SAMPLE_POSTS = [
  {
    id: 1,
    title: 'RPITSSR Welcomes New Cohort of Technical Students for Academic Year 2026-2027',
    publishedAt: '2026-08-28',
    author: 'Administration',
    category: 'Campus News',
    imageUrl: '/images/gallery/school.jpg',
    summary: 'The institute orientation ceremony took place with over 800 aspiring technical and engineering students enrolled in various state-certified disciplines.'
  },
  {
    id: 2,
    title: 'Siem Reap Provincial TVET Day Highlights Industry-Driven Innovation',
    publishedAt: '2026-08-15',
    author: 'Editorial Team',
    category: 'Events',
    imageUrl: '/images/gallery/gallery 2.jpg',
    summary: 'Exhibition showcasing student automation prototypes, renewable solar implementations, and automotive diagnostics was celebrated by visiting delegates.'
  },
  {
    id: 3,
    title: 'Strengthening International TVET Partnerships with JICA and ADB Support',
    publishedAt: '2026-07-22',
    author: 'Public Relations',
    category: 'Partnership',
    imageUrl: '/images/gallery/gallery 3.jpg',
    summary: 'RPITSSR leadership signed modern curriculum enhancement frameworks to continuously align vocational training with ASEAN workforce standards.'
  },
  {
    id: 4,
    title: 'RPITSSR Achieves Renewal of International ISO 9001:2015 Quality Certification',
    publishedAt: '2026-07-02',
    author: 'Quality Assurance',
    category: 'Achievement',
    imageUrl: '/images/teacher-all.jpg',
    summary: 'Official audit confirmed full compliance with international standards in managing technical and vocational education and training in Siem Reap.'
  }
];

export const BlogPage = () => {
  const { t } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    client.get('/blog-posts')
      .then(res => {
        const data = res.data?.posts || res.data?.data?.posts || res.data?.data || res.data || [];
        const validList = Array.isArray(data) ? data : [];
        if (validList.length > 0) {
          setPosts(validList);
        } else {
          setPosts(SAMPLE_POSTS);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching blog posts:', err);
        setPosts(SAMPLE_POSTS);
        setLoading(false);
      });
  }, []);

  const totalPages = Math.ceil(posts.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentPosts = posts.slice(startIndex, startIndex + pageSize);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div>
      <PageBanner
        title={t('blog.title') || 'Latest News & Updates'}
        image="/images/blog.webp"
      />

      <section className="blog-page pt-70 pb-70">
        <div className="container">
          <div className="row">
            {loading ? (
              <div className="col-12 text-center py-5">
                <div style={{ border: '4px solid #f3f4f6', borderTop: '4px solid #07294D', borderRadius: '50%', width: '45px', height: '45px', animation: 'spin 1s linear infinite', margin: '0 auto 15px' }}></div>
                <p className="text-muted">{t('common.loading') || 'Loading Articles...'}</p>
              </div>
            ) : currentPosts.length === 0 ? (
              <div className="col-12 text-center py-5">
                <h3>{t('blog.noBlogPosts') || 'No News Posts Available'}</h3>
                <p className="text-muted">{t('blog.checkBackLater') || 'Please check back later for updates.'}</p>
              </div>
            ) : (
              currentPosts.map((post) => (
                <div key={post.id} className="col-lg-4 col-md-6 mb-4">
                  <BlogCard post={post} />
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="row mt-40">
              <div className="col-12 text-center">
                <div className="pagination-wrapper">
                  <ul className="pagination-items" style={{ listStyle: 'none', display: 'inline-flex', gap: '8px', padding: 0 }}>
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pNum = idx + 1;
                      const isActive = currentPage === pNum;
                      return (
                        <li key={pNum}>
                          <button
                            type="button"
                            onClick={() => { setCurrentPage(pNum); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '5px',
                              border: 'none',
                              background: isActive ? '#07294D' : '#f0f4f8',
                              color: isActive ? '#fff' : '#07294D',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            {pNum.toString().padStart(2, '0')}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
