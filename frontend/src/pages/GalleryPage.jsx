import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/client';

export const GalleryPage = () => {
  const { t } = useLanguage();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    document.title = '🖼️ Gallery - រូបភាព | RPITSSR';
  }, []);

  const getImageUrl = (url, fallback = '/images/gallery/school.jpg') => {
    if (!url) return fallback;
    const cleanUrl = url.replace(/\\/g, '/');
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) return cleanUrl;
    if (cleanUrl.startsWith('/uploads/')) return cleanUrl;
    if (cleanUrl.startsWith('uploads/')) return `/${cleanUrl}`;
    if (cleanUrl.startsWith('/images/')) return cleanUrl;
    if (cleanUrl.startsWith('images/')) return `/${cleanUrl}`;
    return cleanUrl;
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        let galleryImgs = [];
        let blogImgs = [];

        if (filter === 'all' || filter === 'gallery') {
          try {
            const res = await api.get('/gallery-images');
            const data = Array.isArray(res.data)
              ? res.data
              : res.data?.data || [];
            galleryImgs = data.map((item) => ({
              ...item,
              source: 'gallery',
              imageUrl: item.imageUrl || item.image_url,
            }));
          } catch (err) {
            console.error('Failed to load gallery images:', err);
          }
        }

        if (filter === 'all' || filter === 'blog') {
          try {
            const res = await api.get('/blog-posts?limit=100&status=published');
            const blogList = [];
            const data = res.data;
            const posts = Array.isArray(data)
              ? data
              : data?.data?.posts || data?.posts || [];

            posts.forEach((post) => {
              if (post.imageUrl) {
                blogList.push({
                  id: `blog-featured-${post.id}`,
                  title: post.title,
                  description: post.excerpt || '',
                  imageUrl: post.imageUrl,
                  source: 'blog',
                  createdAt: post.publishedAt || post.createdAt,
                });
              }
              if (post.content) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = post.content;
                const imgElements = tempDiv.querySelectorAll('img');
                const seenUrls = new Set(post.imageUrl ? [post.imageUrl] : []);
                let photoIndex = 1;

                imgElements.forEach((imgTag) => {
                  let src = imgTag.getAttribute('src') || imgTag.src;
                  if (!src) return;
                  if (src.startsWith('http://') || src.startsWith('https://')) {
                    const match = src.match(/\/uploads\/.+/);
                    if (match) src = match[0];
                  }
                  if (seenUrls.has(src) || src.startsWith('data:')) return;

                  const width = parseInt(imgTag.width || imgTag.getAttribute('width') || 0, 10);
                  const height = parseInt(imgTag.height || imgTag.getAttribute('height') || 0, 10);
                  if (
                    (width > 0 && width < 150) ||
                    (height > 0 && height < 150) ||
                    src.match(/emoji|icon|sticker|logo-small|favicon/i)
                  ) {
                    return;
                  }

                  blogList.push({
                    id: `blog-content-${post.id}-${photoIndex}`,
                    title: `${post.title} - Photo ${photoIndex}`,
                    description: post.excerpt || '',
                    imageUrl: src,
                    source: 'blog',
                    createdAt: post.publishedAt || post.createdAt,
                  });
                  seenUrls.add(src);
                  photoIndex++;
                });
              }
            });
            blogImgs = blogList;
          } catch (err) {
            console.error('Failed to load blog images:', err);
          }
        }

        galleryImgs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        blogImgs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const combined = [...galleryImgs, ...blogImgs];
        setImages(combined);
      } catch (err) {
        console.error('Failed to load images:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [filter]);

  const totalPages = Math.ceil(images.length / 6);
  const startIndex = (currentPage - 1) * 6;
  const endIndex = startIndex + 6;
  const currentImages = images.slice(startIndex, endIndex);

  const closeModal = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  const showPrev = useCallback(() => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
      setSelectedImage(images[selectedIndex - 1]);
    }
  }, [selectedIndex, images]);

  const showNext = useCallback(() => {
    if (selectedIndex < images.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      setSelectedImage(images[selectedIndex + 1]);
    }
  }, [selectedIndex, images]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImage) {
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'ArrowRight') showNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, selectedIndex, showPrev, showNext]);

  const renderCard = (img, idx) => (
    <div
      className="single-gallery mt-30"
      onClick={() => {
        setSelectedImage(img);
        setSelectedIndex(startIndex + idx);
        document.body.style.overflow = 'hidden';
      }}
      style={{
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
      }}
    >
      <img
        src={getImageUrl(img.imageUrl)}
        alt={img.title || 'gallery'}
        onError={(e) => {
          e.target.src = '/images/gallery/school.jpg';
        }}
        style={{
          width: '100%',
          height: '300px',
          objectFit: 'cover',
          display: 'block',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '5px 12px',
          background:
            img.source === 'blog'
              ? 'rgba(33, 150, 243, 0.9)'
              : 'rgba(76, 175, 80, 0.9)',
          color: 'white',
          borderRadius: '15px',
          fontSize: '0.75rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        <i
          className={`fas fa-${img.source === 'blog' ? 'blog' : 'image'} mr-1 me-1`}
        ></i>
        {img.source === 'blog' ? 'Blog' : 'Gallery'}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '1rem',
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
          color: 'white',
          opacity: 0,
          transition: 'opacity 0.3s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
      >
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#fff' }}>
          {img.title || t('gallery.viewImage')}
        </h4>
        {img.description && (
          <p
            style={{
              margin: '0.25rem 0 0',
              fontSize: '0.875rem',
              opacity: 0.9,
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            {img.description}
          </p>
        )}
      </div>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
        }}
        className="zoom-icon"
      >
        <i
          className="fas fa-search-plus"
          style={{ fontSize: '24px', color: '#1e73be' }}
        ></i>
      </div>
    </div>
  );

  return (
    <div>
      {/* 1. Page Banner */}
      <section className="page-banner">
        <div
          className="page-banner-bg bg_cover"
          style={{
            backgroundImage: 'url(/images/gallery.webp)',
            height: '200px',
            minHeight: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="container">
            <div className="banner-content text-center">
              <h2 className="title">{t('gallery.title')}</h2>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Gallery Main Body */}
      <div className="gallery-page">
        <div className="container">
          {/* Filter Buttons */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="text-center">
                <div
                  className="btn-group"
                  role="group"
                  style={{
                    gap: '10px',
                    display: 'inline-flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                  }}
                >
                  <button
                    className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => {
                      setFilter('all');
                      setCurrentPage(1);
                    }}
                    style={{
                      borderRadius: '25px',
                      padding: '10px 30px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <i className="fas fa-images mr-2 me-2"></i>
                    {t('gallery.allImages') || 'All Images'}
                  </button>
                  <button
                    className={`btn ${filter === 'gallery' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => {
                      setFilter('gallery');
                      setCurrentPage(1);
                    }}
                    style={{
                      borderRadius: '25px',
                      padding: '10px 30px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <i className="fas fa-image mr-2 me-2"></i>
                    {t('gallery.galleryOnly') || 'Gallery Only'}
                  </button>
                  <button
                    className={`btn ${filter === 'blog' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => {
                      setFilter('blog');
                      setCurrentPage(1);
                    }}
                    style={{
                      borderRadius: '25px',
                      padding: '10px 30px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <i className="fas fa-blog mr-2 me-2"></i>
                    {t('gallery.blogImages') || 'Blog Images'}
                  </button>
                </div>

                {images.length > 0 && (
                  <p className="mt-3 text-muted">
                    <i className="fas fa-info-circle mr-2 me-1"></i>
                    {t('gallery.showing') || 'Showing'} {images.length}{' '}
                    {t('gallery.images') || 'images'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Gallery Content */}
          {loading ? (
            <div className="row">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="col-lg-4 col-sm-6">
                  <div
                    className="single-gallery mt-30 text-center py-5"
                    style={{
                      minHeight: '300px',
                      background: '#f5f5f5',
                      borderRadius: '12px',
                    }}
                  >
                    <i className="fas fa-spinner fa-spin fa-2x text-muted"></i>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {(filter === 'all' || filter === 'gallery') && (
                <>
                  {filter === 'all' && images.some((e) => e.source === 'gallery') && (
                    <div className="row mb-3">
                      <div className="col-12">
                        <h3
                          className="section-title"
                          style={{
                            fontSize: '1.75rem',
                            fontWeight: '700',
                            color: '#333',
                            borderLeft: '4px solid #4caf50',
                            paddingLeft: '15px',
                            marginTop: '20px',
                          }}
                        >
                          <i
                            className="fas fa-images mr-2 me-2"
                            style={{ color: '#4caf50' }}
                          ></i>
                          {t('gallery.gallerySection') || 'Gallery Images'}
                        </h3>
                      </div>
                    </div>
                  )}
                  <div className="row">
                    {currentImages
                      .filter((e) => e.source === 'gallery')
                      .map((img, idx) => (
                        <div key={img.id} className="col-lg-4 col-sm-6">
                          {renderCard(img, idx)}
                        </div>
                      ))}
                  </div>
                </>
              )}

              {(filter === 'all' || filter === 'blog') && (
                <>
                  {filter === 'all' && images.some((e) => e.source === 'blog') && (
                    <div className="row mb-3 mt-5">
                      <div className="col-12">
                        <h3
                          className="section-title"
                          style={{
                            fontSize: '1.75rem',
                            fontWeight: '700',
                            color: '#333',
                            borderLeft: '4px solid #2196f3',
                            paddingLeft: '15px',
                            marginTop: '20px',
                          }}
                        >
                          <i
                            className="fas fa-blog mr-2 me-2"
                            style={{ color: '#2196f3' }}
                          ></i>
                          {t('gallery.blogSection') || 'Blog Post Images'}
                        </h3>
                      </div>
                    </div>
                  )}
                  <div className="row">
                    {currentImages
                      .filter((e) => e.source === 'blog')
                      .map((img, idx) => (
                        <div key={img.id} className="col-lg-4 col-sm-6">
                          {renderCard(img, idx)}
                        </div>
                      ))}
                  </div>
                </>
              )}

              {currentImages.length === 0 && (
                <div className="row">
                  <div className="col-12">
                    <div className="text-center mt-30 py-5">
                      <i
                        className="fas fa-image text-muted mb-3"
                        style={{ fontSize: '3rem' }}
                      ></i>
                      <h3>{t('gallery.noImages')}</h3>
                      <p className="text-muted">{t('gallery.noImagesMsg')}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-wrapper text-center mt-30">
              <ul className="pagination-items">
                <li>
                  <button
                    className={`btn btn-link ${currentPage === 1 ? 'disabled' : ''}`}
                    onClick={() => {
                      if (currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                        window.scrollTo(0, 0);
                      }
                    }}
                    disabled={currentPage === 1}
                  >
                    <i className="fal fa-angle-left"></i>
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, t) => t + 1).map((pageNum) => (
                  <li key={pageNum}>
                    <button
                      className={`btn btn-link ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo(0, 0);
                      }}
                    >
                      {pageNum.toString().padStart(2, '0')}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    className={`btn btn-link ${currentPage === totalPages ? 'disabled' : ''}`}
                    onClick={() => {
                      if (currentPage < totalPages) {
                        setCurrentPage(currentPage + 1);
                        window.scrollTo(0, 0);
                      }
                    }}
                    disabled={currentPage === totalPages}
                  >
                    <i className="fal fa-angle-right"></i>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.3s ease',
          }}
          onClick={closeModal}
        >
          {/* Close Button */}
          <button
            onClick={closeModal}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: 'white',
              fontSize: '32px',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              zIndex: 10001,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'rotate(90deg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'rotate(0deg)';
            }}
          >
            <i className="fas fa-times"></i>
          </button>

          {/* Prev Button */}
          {selectedIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                showPrev();
              }}
              style={{
                position: 'absolute',
                left: '20px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'white',
                fontSize: '32px',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                zIndex: 10001,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
          )}

          {/* Next Button */}
          {selectedIndex < images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
              style={{
                position: 'absolute',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'white',
                fontSize: '32px',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                zIndex: 10001,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          )}

          {/* Image & Caption Box */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <img
              src={getImageUrl(selectedImage.imageUrl)}
              alt={selectedImage.title || 'Gallery Image'}
              onError={(e) => {
                e.target.src = '/images/gallery/school.jpg';
              }}
              style={{
                maxWidth: '100%',
                maxHeight: 'calc(90vh - 100px)',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 10px 50px rgba(0,0,0,0.5)',
                animation: 'zoomIn 0.3s ease',
              }}
            />
            {(selectedImage.title || selectedImage.description) && (
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(10px)',
                  padding: '1rem 2rem',
                  borderRadius: '8px',
                  color: 'white',
                  textAlign: 'center',
                  maxWidth: '600px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {selectedImage.title && (
                  <h3
                    style={{
                      margin: '0 0 0.5rem',
                      fontSize: '1.5rem',
                      color: 'white',
                      fontWeight: '600',
                    }}
                  >
                    {selectedImage.title}
                  </h3>
                )}
                {selectedImage.description && (
                  <p
                    style={{
                      margin: 0,
                      opacity: 0.95,
                      color: 'rgba(255, 255, 255, 0.9)',
                    }}
                  >
                    {selectedImage.description}
                  </p>
                )}
                <div
                  style={{
                    marginTop: '0.5rem',
                    fontSize: '0.875rem',
                    opacity: 0.8,
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  {selectedIndex + 1} / {images.length}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inline styles for hover effects and animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .single-gallery:hover .zoom-icon {
          opacity: 1 !important;
        }
        .single-gallery:hover div[style*="linear-gradient"] {
          opacity: 1 !important;
        }
      `}</style>
      <div style={{ height: '50px' }}></div>
    </div>
  );
};
