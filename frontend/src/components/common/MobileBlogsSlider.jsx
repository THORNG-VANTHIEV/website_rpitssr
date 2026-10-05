import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BlogCard } from './BlogCard';

export const MobileBlogsSlider = ({ posts }) => {
  const baseIndex = 2; // Offset for 2 prefix clones
  const totalPosts = posts ? posts.length : 0;

  const [currentIndex, setCurrentIndex] = useState(baseIndex);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const resumeTimerRef = useRef(null);
  const snapTimeoutRef = useRef(null);

  // Extend posts with clones for Center Mode seamless infinite loop
  const extendedPosts = useMemo(() => {
    if (!posts || posts.length <= 1) return posts || [];
    const len = posts.length;
    const p1 = posts[len - 2] || posts[0];
    const p2 = posts[len - 1];
    const s1 = posts[0];
    const s2 = posts[1] || posts[0];
    return [p1, p2, ...posts, s1, s2];
  }, [posts]);

  // Reset base index if posts change
  useEffect(() => {
    setCurrentIndex(baseIndex);
    setIsTransitioning(true);
  }, [totalPosts]);

  // Auto-play: advance 1 post forward every 3.5 seconds
  useEffect(() => {
    if (totalPosts <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 3500);

    return () => clearInterval(timer);
  }, [totalPosts, isPaused]);

  // Snap seamlessly back to real range when clones finish animating
  const handleTransitionEnd = (e) => {
    if (e && e.target !== e.currentTarget) return;

    if (currentIndex >= totalPosts + baseIndex) {
      setIsTransitioning(false);
      setCurrentIndex((prev) => prev - totalPosts);
    } else if (currentIndex < baseIndex) {
      setIsTransitioning(false);
      setCurrentIndex((prev) => prev + totalPosts);
    }
  };

  // Fallback safety timer if transitionend is interrupted
  useEffect(() => {
    if (totalPosts <= 1) return;

    if (currentIndex >= totalPosts + baseIndex || currentIndex < baseIndex) {
      if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = setTimeout(() => {
        handleTransitionEnd();
      }, 500);
      return () => {
        if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
      };
    }
  }, [currentIndex, totalPosts]);

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

  if (!posts || posts.length === 0) return null;

  // Single post display
  if (totalPosts <= 1) {
    return (
      <div className="mobile-center-slider-wrapper">
        <div className="mobile-center-slider-track-wrap">
          <div className="mobile-center-slider-track" style={{ transform: 'translateX(8%)' }}>
            <div className="mobile-center-slide-item is-active" style={{ width: '84%', marginRight: '3%' }}>
              <BlogCard post={posts[0]} featured={false} />
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
  const cardWidth = 84; // % of container width
  const gap = 3; // % gap between cards
  const step = cardWidth + gap;
  const centerOffset = (100 - cardWidth) / 2;

  const activeDotIndex = (currentIndex - baseIndex + totalPosts) % totalPosts;

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
          {extendedPosts.map((post, idx) => {
            const isActive = idx === currentIndex;
            return (
              <div
                key={`mb-slide-${idx}-${post.id || idx}`}
                className={`mobile-center-slide-item ${isActive ? 'is-active' : 'is-peek'}`}
                style={{ width: `${cardWidth}%`, marginRight: `${gap}%` }}
                onClick={() => {
                  if (!isActive) setCurrentIndex(idx);
                }}
              >
                <BlogCard post={post} featured={false} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Center Slider Dots */}
      {totalPosts > 1 && (
        <div className="mobile-center-slider-dots">
          {posts.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              className={`mobile-center-slider-dot ${dotIdx === activeDotIndex ? 'active' : ''}`}
              onClick={() => goToSlide(dotIdx)}
              aria-label={`Go to article ${dotIdx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
