---
description: Mandatory UI Design System & Component Guidelines for RPITSSR website
globs: ["frontend/src/**/*", "frontend/public/**/*"]
---

# RPITSSR UI Design Standards & Component Guidelines

Whenever creating or modifying UI components, sections, pages, or stylesheets in this repository, you MUST adhere to the following rules:

1. **Crisp White Institutional Format**:
   - Backgrounds for cards must be crisp white (`#ffffff`) with subtle border `1px solid #e2e8f0` and soft elevation `box-shadow: 0 4px 18px rgba(7, 41, 77, 0.04)`.
   - Never use dark navy blocks, night-mode widgets, or neon glow cards on public pages.
   - Hover states should lift smoothly `transform: translateY(-5px)` with elevated soft shadow `0 16px 36px rgba(7, 41, 77, 0.09)`.

2. **Institutional Colors**:
   - Deep Navy Primary: `#07294D`
   - Royal Blue Accent: `#1e73be`
   - Golden Amber Highlight: `#ffaf00` / `#f59e0b`
   - Soft Slate Alternating Sections: `#f8fafc` with `1px solid #f1f5f9` borders

3. **Soft Pastel Icon Badges**:
   - Icons must be placed inside rounded squares or circles with delicate matching borders and pastel backgrounds:
     - Blue: `#eff6ff` bg, `#1e73be` icon, `#dbeafe` border
     - Green: `#f0fdf4` bg, `#059669` icon, `#bbf7d0` border
     - Orange/Amber: `#fff7ed` bg, `#ea580c` icon, `#fed7aa` border
     - Purple: `#faf5ff` bg, `#7c3aed` icon, `#e9d5ff` border
     - Gold: `#fefce8` bg, `#ca8a04` icon, `#fef08a` border

4. **Centered Section Headers**:
   - Always use `.section-title-2` centered:
     - Badge `<span className="video-section-badge">`
     - Heading `h2` in Deep Navy `#07294D`, `font-size: 2rem`, `font-weight: 800`
     - Centered accent line `<span className="line" style={{ margin: '12px auto' }}></span>`
     - Subtitle `<p>` in `#64748b`, `max-width: 680px`, `margin: 0 auto`
   - Never use legacy `.section-title` with vertical line `|` (`.title::before`).

5. **Spacing & Breathing Room**:
   - Ample section padding: `70px - 100px` top and bottom on Desktop, `40px - 65px` on Mobile.
   - Always leave at least `80px - 100px` bottom clearance for buttons before section divider borders.

6. **Homepage Section Sequence**:
   1. Hero Section
   2. Quick Access Gateways
   3. Key Institutional Facts & Figures (3,652+ Students, 105+ Faculty, 120+ Programs, 30+ Awards)
   4. Top Courses Area
   5. Why Choose RPITSSR
   6. Promotional Videos & Media Showcase
   7. Upcoming Events Area
   8. Latest News & Blog Area
