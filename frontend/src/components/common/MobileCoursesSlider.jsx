import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CourseCard } from './CourseCard';

export const MobileCoursesSlider = ({ courses }) => {
  const visibleCount = 3;
  const totalCourses = courses ? courses.length : 0;

  // Base index offset so courses[0] is positioned at index visibleCount
  const [currentIndex, setCurrentIndex] = useState(visibleCount);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const resumeTimerRef = useRef(null);
  const snapTimeoutRef = useRef(null);

  // Extend courses with clones at beginning and end for seamless infinite loop
  const extendedCourses = useMemo(() => {
    if (!courses || courses.length <= visibleCount) return courses || [];
    return [
      ...courses.slice(-visibleCount),
      ...courses,
      ...courses.slice(0, visibleCount),
    ];
  }, [courses, visibleCount]);

  // Reset base index if course count changes
  useEffect(() => {
    setCurrentIndex(visibleCount);
    setIsTransitioning(true);
  }, [totalCourses, visibleCount]);

  // Auto-play: advance 1 card forward every 3.5 seconds
  useEffect(() => {
    if (totalCourses <= visibleCount || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 3500);

    return () => clearInterval(timer);
  }, [totalCourses, isPaused, visibleCount]);

  // Snap seamlessly back into original range when clones finish animating
  const handleTransitionEnd = (e) => {
    if (e && e.target !== e.currentTarget) return;

    if (currentIndex >= totalCourses + visibleCount) {
      setIsTransitioning(false);
      setCurrentIndex((prev) => prev - totalCourses);
    } else if (currentIndex < visibleCount) {
      setIsTransitioning(false);
      setCurrentIndex((prev) => prev + totalCourses);
    }
  };

  // Fallback safety timer if transitionend is interrupted
  useEffect(() => {
    if (totalCourses <= visibleCount) return;

    if (currentIndex >= totalCourses + visibleCount || currentIndex < visibleCount) {
      if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = setTimeout(() => {
        handleTransitionEnd();
      }, 500);
      return () => {
        if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
      };
    }
  }, [currentIndex, totalCourses, visibleCount]);

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

  // If items fit on screen without sliding
  if (totalCourses <= visibleCount) {
    return (
      <div className="mobile-courses-slider-wrapper">
        <div className="mobile-courses-slider-track-wrap">
          <div className="mobile-courses-slider-track">
            {courses.map((course, idx) => (
              <div key={course.id || idx} className="mobile-course-slide-item">
                <CourseCard course={course} />
              </div>
            ))}
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

    // Resume auto-play after 2.5 seconds of idle
    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 2500);
  };

  const goToSlide = (dotIdx) => {
    setCurrentIndex(dotIdx + visibleCount);
    setIsPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 2500);
  };

  // Step percentage per 1 card slide = 100% / 3 = 33.333333%
  const stepPercentage = 100 / visibleCount;
  const activeDotIndex = (currentIndex - visibleCount + totalCourses) % totalCourses;

  return (
    <div
      className="mobile-courses-slider-wrapper"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="mobile-courses-slider-track-wrap">
        <div
          className={`mobile-courses-slider-track ${!isTransitioning ? 'no-transition' : ''}`}
          style={{ transform: `translateX(-${currentIndex * stepPercentage}%)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedCourses.map((course, idx) => (
            <div key={`mc-slide-${idx}-${course.id || idx}`} className="mobile-course-slide-item">
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      </div>

      {/* Dots Pagination for courses */}
      {totalCourses > visibleCount && (
        <div className="mobile-courses-slider-dots">
          {courses.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              className={`mobile-courses-slider-dot ${dotIdx === activeDotIndex ? 'active' : ''}`}
              onClick={() => goToSlide(dotIdx)}
              aria-label={`Go to slide ${dotIdx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
