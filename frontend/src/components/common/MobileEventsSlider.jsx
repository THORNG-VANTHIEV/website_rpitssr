import React, { useState, useEffect, useRef, useMemo } from 'react';
import { EventCard } from './EventCard';

export const MobileEventsSlider = ({ events }) => {
  const baseIndex = 2; // Offset for 2 prefix clones
  const totalEvents = events ? events.length : 0;

  const [currentIndex, setCurrentIndex] = useState(baseIndex);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const resumeTimerRef = useRef(null);
  const snapTimeoutRef = useRef(null);

  // Extend events with clones for Center Mode seamless infinite loop
  const extendedEvents = useMemo(() => {
    if (!events || events.length <= 1) return events || [];
    const len = events.length;
    const p1 = events[len - 2] || events[0];
    const p2 = events[len - 1];
    const s1 = events[0];
    const s2 = events[1] || events[0];
    return [p1, p2, ...events, s1, s2];
  }, [events]);

  // Reset base index if events change
  useEffect(() => {
    setCurrentIndex(baseIndex);
    setIsTransitioning(true);
  }, [totalEvents]);

  // Auto-play: advance 1 event forward every 3.5 seconds
  useEffect(() => {
    if (totalEvents <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 3500);

    return () => clearInterval(timer);
  }, [totalEvents, isPaused]);

  // Snap seamlessly back to real range when clones finish animating
  const handleTransitionEnd = (e) => {
    if (e && e.target !== e.currentTarget) return;

    if (currentIndex >= totalEvents + baseIndex) {
      setIsTransitioning(false);
      setCurrentIndex((prev) => prev - totalEvents);
    } else if (currentIndex < baseIndex) {
      setIsTransitioning(false);
      setCurrentIndex((prev) => prev + totalEvents);
    }
  };

  // Fallback safety timer if transitionend is interrupted
  useEffect(() => {
    if (totalEvents <= 1) return;

    if (currentIndex >= totalEvents + baseIndex || currentIndex < baseIndex) {
      if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = setTimeout(() => {
        handleTransitionEnd();
      }, 500);
      return () => {
        if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
      };
    }
  }, [currentIndex, totalEvents]);

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

  if (!events || events.length === 0) return null;

  // Single event display
  if (totalEvents <= 1) {
    return (
      <div className="mobile-center-slider-wrapper">
        <div className="mobile-center-slider-track-wrap">
          <div className="mobile-center-slider-track" style={{ transform: 'translateX(8%)' }}>
            <div className="mobile-center-slide-item is-active" style={{ width: '84%', marginRight: '3%' }}>
              <EventCard event={events[0]} />
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

  const activeDotIndex = (currentIndex - baseIndex + totalEvents) % totalEvents;

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
          {extendedEvents.map((event, idx) => {
            const isActive = idx === currentIndex;
            return (
              <div
                key={`me-slide-${idx}-${event.id || idx}`}
                className={`mobile-center-slide-item ${isActive ? 'is-active' : 'is-peek'}`}
                style={{ width: `${cardWidth}%`, marginRight: `${gap}%` }}
                onClick={() => {
                  if (!isActive) setCurrentIndex(idx);
                }}
              >
                <EventCard event={event} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Center Slider Dots */}
      {totalEvents > 1 && (
        <div className="mobile-center-slider-dots">
          {events.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              className={`mobile-center-slider-dot ${dotIdx === activeDotIndex ? 'active' : ''}`}
              onClick={() => goToSlide(dotIdx)}
              aria-label={`Go to event ${dotIdx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
