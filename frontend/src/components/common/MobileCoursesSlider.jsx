import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CourseCard } from './CourseCard';

export const MobileCoursesSlider = ({ courses }) => {
  const baseIndex = 2; // Offset for 2 prefix clones
  const totalCourses = courses ? courses.length : 0;

  const [currentIndex, setCurrentIndex] = useState(baseIndex);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const resumeTimerRef = useRef(null);
  const snapTimeoutRef = useRef(null);

  // Extend courses with clones for Center Mode seamless infinite loop
  const extendedCourses = useMemo(() => {
    if (!courses || courses.length <= 1) return courses || [];
    const len = courses.length;
    const p1 = courses[len - 2] || courses[0];
    const p2 = courses[len - 1];
    const s1 = courses[0];
    const s2 = courses[1] || courses[0];
    return [p1, p2, ...courses, s1, s2];
  }, [courses]);

  // Reset base index if course count changes
  useEffect(() => {
    setCurrentIndex(baseIndex);
    setIsTransitioning(true);
  }, [totalCourses]);

  // Auto-play: advance 1 card forward every 3.5 seconds
  useEffect(() => {
    if (totalCourses <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 3500);

    return () => clearInterval(timer);
  }, [totalCourses, isPaused]);

  // Snap seamlessly back into original range when clones finish animating
  const handleTransitionEnd = (e) => {
    if (e && e.target !== e.currentTarget) return;

    if (currentIndex >= totalCourses + baseIndex) {
      setIsTransitioning(false);
      setCurrentIndex((prev) => prev - totalCourses);
    } else if (currentIndex < baseIndex) {
      setIsTransitioning(false);
      setCurrentIndex((prev) => prev + totalCourses);
    }
  };

  // Fallback safety timer if transitionend is interrupted
  useEffect(() => {
    if (totalCourses <= 1) return;

    if (currentIndex >= totalCourses + baseIndex || currentIndex < baseIndex) {
      if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
        if (currentIndex >= totalCourses + baseIndex) {
          setCurrentIndex((prev) => prev - totalCourses);
        } else if (currentIndex < baseIndex) {
          setCurrentIndex((prev) => prev + totalCourses);
        }
      }, 550);
    }

    return () => {
      if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
    };
  }, [currentIndex, totalCourses]);

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

  if (!courses || courses.length === 0) return null;

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
    const threshold = 35; // minimum swipe distance

    if (touchEndX.current !== 0) {
      if (diff > threshold) {
        // Swiped Left -> Advance 1 card forward
        setCurrentIndex((prev) => prev + 1);
      } else if (diff < -threshold) {
        // Swiped Right -> Back 1 card backward
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

  const activeDotIndex = (currentIndex - baseIndex + totalCourses) % totalCourses;

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
          {extendedCourses.map((course, idx) => {
            const isActive = idx === currentIndex;
            return (
              <div
                key={`mc-slide-${idx}-${course.id || idx}`}
                className={`mobile-center-slide-item ${isActive ? 'is-active' : 'is-peek'}`}
                style={{ width: `${cardWidth}%`, marginRight: `${gap}%` }}
                onClick={() => {
                  if (!isActive) setCurrentIndex(idx);
                }}
              >
                <CourseCard course={course} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Dots Pagination */}
      {totalCourses > 1 && (
        <div className="mobile-center-slider-dots">
          {courses.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              className={`mobile-center-slider-dot ${dotIdx === activeDotIndex ? 'active' : ''}`}
              onClick={() => goToSlide(dotIdx)}
              aria-label={`Go to slide ${dotIdx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
