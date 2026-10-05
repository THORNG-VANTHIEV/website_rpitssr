import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getYouTubeId } from './YouTubeVideoCard';

export const MobileVideosSlider = ({ videos }) => {
  const baseIndex = 2; // Offset for 2 prefix clones
  const totalVideos = videos ? videos.length : 0;

  const [currentIndex, setCurrentIndex] = useState(baseIndex);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const resumeTimerRef = useRef(null);
  const snapTimeoutRef = useRef(null);

  // Extend videos with clones for Center Mode seamless infinite loop
  const extendedVideos = useMemo(() => {
    if (!videos || videos.length <= 1) return videos || [];
    const len = videos.length;
    const p1 = videos[len - 2] || videos[0];
    const p2 = videos[len - 1];
    const s1 = videos[0];
    const s2 = videos[1] || videos[0];
    return [p1, p2, ...videos, s1, s2];
  }, [videos]);

  // Reset base index if videos change
  useEffect(() => {
    setCurrentIndex(baseIndex);
    setIsTransitioning(true);
  }, [totalVideos]);

  // Auto-play: advance 1 video forward every 3.5 seconds
  useEffect(() => {
    if (totalVideos <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 3500);

    return () => clearInterval(timer);
  }, [totalVideos, isPaused]);

  // Snap seamlessly back to real range when clones finish animating
  const handleTransitionEnd = (e) => {
    if (e && e.target !== e.currentTarget) return;

    if (currentIndex >= totalVideos + baseIndex) {
      setIsTransitioning(false);
      setCurrentIndex((prev) => prev - totalVideos);
    } else if (currentIndex < baseIndex) {
      setIsTransitioning(false);
      setCurrentIndex((prev) => prev + totalVideos);
    }
  };

  // Fallback safety timer if transitionend is interrupted
  useEffect(() => {
    if (totalVideos <= 1) return;

    if (currentIndex >= totalVideos + baseIndex || currentIndex < baseIndex) {
      if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = setTimeout(() => {
        handleTransitionEnd();
      }, 500);
      return () => {
        if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
      };
    }
  }, [currentIndex, totalVideos]);

  // Re-enable smooth transition on next animation frame after snap
  useEffect(() => {
    if (!isTransitioning) {
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
        return () => cancelAnimationFrame(raf2);
      });
      return () => cancelAnimationFrame(raf1);
    }
  }, [isTransitioning]);

  if (!videos || videos.length === 0) return null;

  // Single video display
  if (totalVideos <= 1) {
    const video = videos[0];
    const rawUrl = video.videoUrl || video.youtubeUrl || video.url || '';
    const videoId = getYouTubeId(video.youtubeId || rawUrl);
    const targetUrl = rawUrl || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : '#');
    const isFb = video.platform === 'facebook' || (targetUrl && (targetUrl.includes('facebook.com') || targetUrl.includes('fb.watch')));
    let thumbnailUrl = video.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '/images/gallery/school.jpg');

    return (
      <div className="mobile-center-slider-wrapper">
        <div className="mobile-center-slider-track-wrap">
          <div className="mobile-center-slider-track" style={{ transform: 'translateX(8%)' }}>
            <div className="mobile-center-slide-item is-active" style={{ width: '84%', marginRight: '3%' }}>
              <a href={targetUrl} target="_blank" rel="noopener noreferrer" className="mobile-center-video-card">
                <div className="center-video-thumb-box">
                  <img src={thumbnailUrl} alt={video.title} className="center-video-img" loading="lazy" />
                  <div className="center-video-overlay"></div>
                  {video.category && (
                    <span className="center-video-badge-category"><i className="fas fa-tag me-1"></i> {video.category}</span>
                  )}
                  {video.duration && (
                    <span className="center-video-badge-duration"><i className="far fa-clock me-1"></i> {video.duration}</span>
                  )}
                  <div className={`center-video-play-btn ${isFb ? 'fb-color' : 'yt-color'}`}>
                    <i className="fas fa-play"></i>
                  </div>
                </div>
                <div className="center-video-info">
                  <div className="center-video-meta-line">
                    <span className={`video-source-pill ${isFb ? 'fb' : 'yt'}`}>
                      <i className={`fab ${isFb ? 'fa-facebook-f' : 'fa-youtube'} me-1`}></i> {isFb ? 'Facebook' : 'YouTube'}
                    </span>
                    {video.publishedDate && (
                      <span className="video-date-pill"><i className="far fa-calendar-alt me-1"></i> {video.publishedDate}</span>
                    )}
                  </div>
                  <h4 className="center-video-title">{video.title}</h4>
                  <div className="center-video-watch-link">
                    <span>{isFb ? 'ទស្សនាលើ Facebook' : 'ទស្សនាវីដេអូពេញ'}</span>
                    <i className="fas fa-arrow-right ms-1"></i>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = 0;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 40;

    if (touchEndX.current !== 0) {
      if (diff > threshold) {
        // Swiped Left -> Advance forward
        setCurrentIndex((prev) => prev + 1);
      } else if (diff < -threshold) {
        // Swiped Right -> Back 1 slide
        setCurrentIndex((prev) => prev - 1);
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;

    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 2500);
  };

  const goToSlide = (dotIdx) => {
    setCurrentIndex(dotIdx + baseIndex);
    setIsPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 2500);
  };

  // Center Mode Dimensions
  const cardWidth = 84; // % of container
  const gap = 3; // % gap between cards
  const step = cardWidth + gap;
  const centerOffset = (100 - cardWidth) / 2;

  const activeDotIndex = (currentIndex - baseIndex + totalVideos) % totalVideos;

  return (
    <div
      className="mobile-center-slider-wrapper"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="mobile-center-slider-track-wrap">
        <div
          className={`mobile-center-slider-track ${!isTransitioning ? 'no-transition' : ''}`}
          style={{
            transform: `translateX(calc(${centerOffset}% - ${currentIndex * step}%))`,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedVideos.map((video, idx) => {
            const rawUrl = video.videoUrl || video.youtubeUrl || video.url || '';
            const videoId = getYouTubeId(video.youtubeId || rawUrl);
            const targetUrl = rawUrl || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : '#');
            const isFb = video.platform === 'facebook' || (targetUrl && (targetUrl.includes('facebook.com') || targetUrl.includes('fb.watch')));

            let thumbnailUrl = video.thumbnail;
            if (!thumbnailUrl && videoId) {
              thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }
            if (!thumbnailUrl) {
              thumbnailUrl = '/images/gallery/school.jpg';
            }

            const isActive = idx === currentIndex;

            return (
              <div
                key={`mv-slide-${idx}-${video.id || video.youtubeId || idx}`}
                className={`mobile-center-slide-item ${isActive ? 'is-active' : 'is-peek'}`}
                style={{ width: `${cardWidth}%`, marginRight: `${gap}%` }}
                onClick={() => {
                  if (!isActive) setCurrentIndex(idx);
                }}
              >
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mobile-center-video-card"
                >
                  {/* 16:9 Thumbnail Box */}
                  <div className="center-video-thumb-box">
                    <img
                      src={thumbnailUrl}
                      alt={video.title}
                      className="center-video-img"
                      loading="lazy"
                    />
                    <div className="center-video-overlay"></div>

                    {/* Category Badge */}
                    {video.category && (
                      <span className="center-video-badge-category">
                        <i className="fas fa-tag me-1"></i> {video.category}
                      </span>
                    )}

                    {/* Duration Badge */}
                    {video.duration && (
                      <span className="center-video-badge-duration">
                        <i className="far fa-clock me-1"></i> {video.duration}
                      </span>
                    )}

                    {/* Center Play Button with Glow */}
                    <div className={`center-video-play-btn ${isFb ? 'fb-color' : 'yt-color'}`}>
                      <i className="fas fa-play"></i>
                    </div>
                  </div>

                  {/* Video Meta & Title Content */}
                  <div className="center-video-info">
                    <div className="center-video-meta-line">
                      {isFb ? (
                        <span className="video-source-pill fb">
                          <i className="fab fa-facebook-f me-1"></i> Facebook
                        </span>
                      ) : (
                        <span className="video-source-pill yt">
                          <i className="fab fa-youtube me-1"></i> YouTube
                        </span>
                      )}
                      {video.publishedDate && (
                        <span className="video-date-pill">
                          <i className="far fa-calendar-alt me-1"></i> {video.publishedDate}
                        </span>
                      )}
                    </div>

                    <h4 className="center-video-title">{video.title}</h4>

                    <div className="center-video-watch-link">
                      <span>{isFb ? 'ទស្សនាលើ Facebook' : 'ទស្សនាវីដេអូពេញ'}</span>
                      <i className="fas fa-arrow-right ms-1"></i>
                    </div>
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Center Slider Dots */}
      {totalVideos > 1 && (
        <div className="mobile-center-slider-dots">
          {videos.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              className={`mobile-center-slider-dot ${dotIdx === activeDotIndex ? 'active' : ''}`}
              onClick={() => goToSlide(dotIdx)}
              aria-label={`Go to video ${dotIdx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
