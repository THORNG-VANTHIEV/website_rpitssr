# RPITSSR Institutional UI Design System & Engineering Rules

This document defines the mandatory design patterns, aesthetic standards, component architectures, and page structure rules for the **RPITSSR (Regional Polytechnic Institute Techo Sen Siem Reap)** project. All future development and styling MUST strictly adhere to these established rules.

---

## 1. Core Color Palette & Typography

- **Deep Navy Primary (`#07294D`)**: Core institutional brand color. Used for headings, stat numbers, top navbar, primary text, and dark button gradients.
- **Royal Blue Accent (`#1e73be`)**: Primary interaction color. Used for active tabs, links, chevron indicators, plus signs (`+`), and focus rings.
- **Golden Amber (`#ffaf00` / `#f59e0b`)**: Warm accent color. Used for primary CTA pill buttons, scholarship badges (`អាហារូបករណ៍ ១០០%`), and highlight badges.
- **Backgrounds**:
  - Main Page Background: `#ffffff`
  - Alternating Section Background: `#f8fafc` (Soft slate) with subtle borders `1px solid #f1f5f9`
  - Card Background: `#ffffff` (Crisp white)
- **Borders & Dividers**:
  - Subtle card border: `1px solid #e2e8f0` (Hover: `1px solid #cbd5e1`)
  - Dashed sub-dividers: `1px dashed #e2e8f0`
- **Typography**:
  - Fonts: `'Kantumruy Pro'`, `'Battambang'`, `'Outfit'`, `'Inter'`, sans-serif
  - Body & Descriptions: `#64748b` (Slate 500)
  - Subtitles & Meta: `#94a3b8` (Slate 400)

---

## 2. Card Standards: Crisp White Institutional Format

> [!IMPORTANT]
> **NO Dark Night-Mode Containers or Rainbow Gradients**: Never use dark-navy floating boxes, neon glow app-icons, or 8-color rainbow backgrounds (`nth-child(8n)`) on public daylight pages. All cards must be crisp white and daylight-friendly.

### Card Architecture
- `background: #ffffff;`
- `border-radius: 20px;` (or `16px` for small/department cards)
- `border: 1px solid #e2e8f0;`
- `box-shadow: 0 4px 18px rgba(7, 41, 77, 0.04);`
- **Hover States**:
  - `transform: translateY(-5px);` (or `-6px` on metric cards)
  - `border-color: #cbd5e1;`
  - `box-shadow: 0 16px 36px rgba(7, 41, 77, 0.09);`
  - Top Tricolor Accent Bar on hover (`::before`): `height: 4px; background: linear-gradient(90deg, #07294D, #1e73be, #ffaf00);`

### Soft Pastel Icon Badges
Always place icons inside rounded pastel badges with gentle matching borders:
- **Blue (Students / TVET)**: Background `#eff6ff`, Icon `#1e73be`, Border `#dbeafe`
- **Green (Free / Verified)**: Background `#f0fdf4`, Icon `#059669`, Border `#bbf7d0`
- **Orange/Amber (Faculty / Experts)**: Background `#fff7ed`, Icon `#ea580c`, Border `#fed7aa`
- **Purple (Programs / Tech 4.0)**: Background `#faf5ff`, Icon `#7c3aed`, Border `#e9d5ff`
- **Gold/Yellow (Awards / National)**: Background `#fefce8`, Icon `#ca8a04`, Border `#fef08a`

---

## 3. Section Header Standards (Centered & Balanced)

Never use the legacy `.section-title` with the vertical divider line `|` (`.title::before`). Always use `.section-title-2` with a centered layout:

```jsx
<div className="row justify-content-center mb-40">
  <div className="col-lg-8 text-center">
    <div className="section-title-2">
      <span className="video-section-badge" style={{ display: 'inline-flex', marginBottom: '10px' }}>
        <Icon size={14} /> {isKhmer ? 'ផ្លាក Badge' : 'Badge'}
      </span>
      <h2 className="title" style={{ fontSize: '2rem', fontWeight: 800, color: '#07294D' }}>
        {isKhmer ? 'ចំណងជើងផ្នែក' : 'Section Title'}
      </h2>
      <span className="line" style={{ margin: '12px auto' }}></span>
      <p style={{ color: '#64748b', fontSize: '0.98rem', maxWidth: '680px', margin: '0 auto' }}>
        {description}
      </p>
    </div>
  </div>
</div>
```

---

## 4. Spacing & Breathing Room Guidelines

- **Section Vertical Padding**:
  - Desktop: `padding-top: 70px - 100px`, `padding-bottom: 70px - 100px`
  - Tablet: `padding-top: 50px - 70px`, `padding-bottom: 60px - 80px`
  - Mobile: `padding-top: 40px - 50px`, `padding-bottom: 50px - 65px`
- **Bottom Clearance for Action Buttons**:
  - Always ensure action buttons (e.g. `[ 📖 មើលជំនាញ និងវគ្គសិក្សាទាំងអស់ → ]`) have at least `80px - 100px` of bottom padding before the section boundary or next section divider line.
  - Never allow buttons or floating cards to sit directly on or overlap section border lines.

---

## 5. Official Homepage Section Hierarchy

1. **Section 1: Purpose-Driven Hero Section** (Official banner, mission, and primary action buttons)
2. **Section 2: Quick Access Gateways** (4 cards: Programs, Downloads, Leadership, Contact)
3. **Section 3: Key Institutional Facts & Figures** (3,652+ Students, 105+ Faculty, 120+ Programs, 30+ Awards)
4. **Section 4: Top Courses Area** (Popular Majors & Training Programs + Browse All button)
5. **Section 5: Why Choose RPITSSR** (4 Core Advantages: Modern Labs, Expert Faculty, 95% Jobs, 100% Scholarships)
6. **Section 6: Promotional Videos & Media Showcase** (Featured video + YouTube playlist)
7. **Section 7: Upcoming Events Area** (Categorized tabs & event cards)
8. **Section 8: Latest News & Blog Area** (Articles, notices, and activities)

---

## 6. Bilingual & Academic Tone Standard

- **Khmer Terminology**:
  - Top Courses: `ជំនាញ និងវគ្គបណ្តុះបណ្តាលពេញនិយម` (NOT "នេះគឺវគ្គសិក្សាថ្មីៗរបស់យើង")
  - Stats: `ស្ថិតិ និងសមិទ្ធផលសំខាន់ៗរបស់វិទ្យាស្ថាន`
  - Why RPITSSR: `ហេតុអ្វីជ្រើសរើសសិក្សានៅ RPITSSR?`
  - Gateways: `ច្រកទ្វារផ្លូវកាត់រហ័ស`
  - Free: `ឥតគិតថ្លៃ` / `អាហារូបករណ៍ ១០០%`
- Avoid literal/machine translation. Maintain an elevated, trustworthy, academic Cambodian institutional tone.
