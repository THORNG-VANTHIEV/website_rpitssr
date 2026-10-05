import React from 'react';

export const PageBanner = ({
  title,
  image = '/images/blog-details.webp',
  subtitle = null,
  style = {}
}) => {
  return (
    <section className="page-banner" style={{ position: 'relative', overflow: 'hidden' }}>
      <div
        className="page-banner-bg"
        style={{
          backgroundImage: image ? `url(${image})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          backgroundRepeat: 'no-repeat',
          minHeight: '210px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '48px 0',
          ...style
        }}
      >
        {/* Institutional Navy Overlay for Crystal-Clear Text Legibility */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(7, 41, 77, 0.82) 0%, rgba(13, 56, 104, 0.76) 55%, rgba(30, 115, 190, 0.72) 100%)',
            zIndex: 1
          }}
        />

        {/* Subtle Decorative Ambient Glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 100%, rgba(255, 175, 0, 0.12) 0%, transparent 60%)',
            zIndex: 1,
            pointerEvents: 'none'
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="banner-content text-center">
            <h2
              className="title"
              style={{
                fontSize: 'clamp(1.85rem, 3.8vw, 2.85rem)',
                fontWeight: 800,
                lineHeight: 1.3,
                margin: 0,
                color: '#ffffff',
                textShadow: '0 3px 12px rgba(7, 41, 77, 0.6)',
                wordBreak: 'break-word',
                fontFamily: "'Kantumruy Pro', 'Battambang', sans-serif"
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                style={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: '0.95rem',
                  marginTop: '8px',
                  marginBottom: 0
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Tricolor Institutional Accent Line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #07294D 0%, #1e73be 50%, #ffaf00 100%)',
            zIndex: 3
          }}
        />
      </div>
    </section>
  );
};

