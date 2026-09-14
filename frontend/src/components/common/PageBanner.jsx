import React from 'react';

export const PageBanner = ({ title, image = '/images/our-course.webp', style = {} }) => {
  return (
    <section className="page-banner">
      <div
        className="page-banner-bg bg_cover"
        style={{
          backgroundImage: image ? `url(${image})` : undefined,
          minHeight: '200px',
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          ...style
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="banner-content text-center">
            <h2
              className="title"
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 3.2rem)',
                lineHeight: 1.25,
                margin: 0,
                color: '#fff',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                wordBreak: 'break-word'
              }}
            >
              {title}
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
};
