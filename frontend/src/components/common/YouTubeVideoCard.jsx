import React, { useState } from 'react';

// Helper to extract YouTube video ID from various URL formats
export const getYouTubeId = (url) => {
  if (!url) return '';
  // If it's already an ID (11 chars without slashes)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : '';
};

export const YouTubeVideoCard = ({ video, featured = false }) => {
  const [imgError, setImgError] = useState(false);
  const rawUrl = video.videoUrl || video.youtubeUrl || video.url || '';
  const videoId = getYouTubeId(video.youtubeId || rawUrl);
  const targetUrl = rawUrl || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : '#');
  const isFb = video.platform === 'facebook' || (targetUrl && (targetUrl.includes('facebook.com') || targetUrl.includes('fb.watch') || targetUrl.includes('fb.com')));
  
  // Thumbnail with fallback
  let thumbnailUrl = video.thumbnail;
  if (!thumbnailUrl && videoId) {
    thumbnailUrl = imgError
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  if (!thumbnailUrl) {
    thumbnailUrl = '/images/videos/fb_reel_1639279004473101.jpg';
  }

  if (featured) {
    return (
      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="featured-video-card-link"
      >
        <div className="modern-featured-video-card">
          <div className="video-thumb-container">
            <img
              src={thumbnailUrl}
              alt={video.title}
              onError={() => setImgError(true)}
              className="video-thumb-img"
              loading="lazy"
            />
            <div className="video-thumb-overlay"></div>
            
            {/* Pulsing NEW Badge */}
            {video.isNew && (
              <span className="pulse-new-badge">
                <span className="pulse-dot"></span>
                🔥 ថ្មី / NEW
              </span>
            )}

            {/* Category Tag */}
            {video.category && (
              <span className="video-category-badge">
                <i className="fas fa-tag"></i> {video.category}
              </span>
            )}

            {/* Duration Badge */}
            {video.duration && (
              <span className="video-duration-badge">
                <i className="far fa-clock"></i> {video.duration}
              </span>
            )}

            {/* Center Play Button with Ripple */}
            <div className="center-play-button-wrapper">
              <div className="play-ripple-circle"></div>
              <div className={`play-button-circle ${isFb ? 'facebook-play' : ''}`}>
                <i className="fas fa-play"></i>
              </div>
            </div>
          </div>

          <div className="featured-video-info">
            <div className="video-meta-row">
              {isFb ? (
                <span className="facebook-source-tag">
                  <i className="fab fa-facebook"></i> Facebook
                </span>
              ) : (
                <span className="youtube-source-tag">
                  <i className="fab fa-youtube"></i> YouTube
                </span>
              )}
              {video.publishedDate && (
                <span className="video-date">
                  <i className="far fa-calendar-alt"></i> {video.publishedDate}
                </span>
              )}
            </div>
            <h3 className="featured-video-title">{video.title}</h3>
            {video.description && (
              <p className="featured-video-description">{video.description}</p>
            )}
            {isFb ? (
              <div className="watch-on-facebook-btn">
                <span>ទស្សនាលើ Facebook</span>
                <i className="fas fa-external-link-alt ml-2"></i>
              </div>
            ) : (
              <div className="watch-on-youtube-btn">
                <span>ទស្សនាលើ YouTube</span>
                <i className="fas fa-external-link-alt ml-2"></i>
              </div>
            )}
          </div>
        </div>
      </a>
    );
  }

  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="compact-video-card-link"
    >
      <div className="modern-compact-video-card">
        <div className="compact-thumb-box">
          <img
            src={thumbnailUrl}
            alt={video.title}
            onError={() => setImgError(true)}
            className="compact-thumb-img"
            loading="lazy"
          />
          <div className="compact-thumb-overlay"></div>
          
          {video.isNew && (
            <span className="pulse-new-badge compact">
              🔥 ថ្មី
            </span>
          )}

          <div className="compact-play-icon">
            <i className="fas fa-play"></i>
          </div>

          {video.duration && (
            <span className="compact-duration-badge">
              {video.duration}
            </span>
          )}
        </div>

        <div className="compact-video-body">
          <div className="compact-meta-row">
            <span className={`compact-source ${isFb ? 'facebook' : ''}`}>
              {isFb ? (
                <span style={{ color: '#1877f2', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
                  <i className="fab fa-facebook"></i> Facebook
                </span>
              ) : (
                <span style={{ color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
                  <i className="fab fa-youtube"></i> YouTube
                </span>
              )}
            </span>
            {video.publishedDate && (
              <span className="compact-date">{video.publishedDate}</span>
            )}
          </div>
          <h4 className="compact-video-title">{video.title}</h4>
          {video.category && (
            <span className="compact-category-pill">{video.category}</span>
          )}
        </div>
      </div>
    </a>
  );
};
