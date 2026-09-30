import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Printer, FileText, X, Download } from 'lucide-react';

/**
 * PrintableAdmissionForm
 * 1:1 Exact Forensic Visual & Typographic Replica of Official Institutional Document:
 * "RPITSSR/ETO/PR01/FR02 (ចេញផ្សាយលើកទី៤, ១៦/០៣/២០២៦)"
 * Matches all 5 pages of "admission_form/3-FR02-ពាក្យចូលរៀន.pdf"
 * 
 * Exact Physical Page Dimensions & Margins (Extracted from original Word LTSC PDF):
 * - Page 1: A4 Portrait (210mm x 297mm) | Margins: Top 7.1mm, Right 8.0mm, Bottom 8.0mm, Left 8.0mm
 * - Page 2: A4 Portrait (210mm x 297mm) | Margins: Top 8.5mm, Right 8.0mm, Bottom 8.5mm, Left 8.0mm
 * - Page 3: A4 LANDSCAPE (297mm x 210mm) | Margins: Top 8.5mm, Right 10.0mm, Bottom 12.0mm, Left 8.0mm
 * - Page 4: A4 LANDSCAPE (297mm x 210mm) | Margins: Top 10.0mm, Right 9.0mm, Bottom 12.5mm, Left 8.0mm
 * - Page 5: A4 Portrait (210mm x 297mm) | Margins: Top 4.5mm, Right 4.0mm, Bottom 5.5mm, Left 7.8mm
 * 
 * Fonts:
 * - Titles / Section Headers: 'Khmer OS Muol Light', 'Moul', serif
 * - Body / Form Fields: 'Khmer OS Battambang', 'Battambang', sans-serif
 * - English Subtitles: 'Times New Roman', serif
 */

/**
 * Intelligent Khmer Address Parser
 * Automatically decomposes unified or raw Khmer address strings
 * into standard administrative components:
 * - houseNumber (ផ្ទះលេខ)
 * - streetNumber (ផ្លូវ)
 * - groupNumber (ក្រុម)
 * - village (ភូមិ)
 * - commune (ឃុំ/សង្កាត់)
 * - district (ស្រុក/ខណ្ឌ/ក្រុង)
 * - province (ខេត្ត/រាជធានី)
 */
export const parseKhmerAddress = (raw) => {
  if (!raw || typeof raw !== 'string') return {};
  const cleaned = raw.trim();
  const res = {
    houseNumber: '',
    streetNumber: '',
    groupNumber: '',
    village: '',
    commune: '',
    district: '',
    province: ''
  };

  // Match house number: ផ្ទះលេខ ... or ផ្ទះ ...
  const houseMatch = cleaned.match(/(?:ផ្ទះលេខ|ផ្ទះ)\s*[:#\-]?\s*([^\s,;]+)/);
  if (houseMatch) res.houseNumber = houseMatch[1].trim();

  // Match street: ផ្លូវលេខ ... or ផ្លូវ ...
  const streetMatch = cleaned.match(/(?:ផ្លូវលេខ|ផ្លូវ)\s*[:#\-]?\s*([^\s,;]+)/);
  if (streetMatch) res.streetNumber = streetMatch[1].trim();

  // Match group: ក្រុមទី ... or ក្រុម ...
  const groupMatch = cleaned.match(/(?:ក្រុមទី|ក្រុម)\s*[:#\-]?\s*([^\s,;]+)/);
  if (groupMatch) res.groupNumber = groupMatch[1].trim();

  // Match village: ភូមិ ... up to next boundary
  const villageMatch = cleaned.match(/ភូមិ\s*([^\s,;]+(?:\s+[^\s,;]+)*?)(?=\s*(?:ឃុំ|សង្កាត់|ស្រុក|ខណ្ឌ|ក្រុង|ខេត្ត|រាជធានី|[,;]|$))/);
  if (villageMatch) res.village = villageMatch[1].replace(/^[,\s\-]+|[,\s\-]+$/g, '').trim();

  // Match commune: ឃុំ|សង្កាត់ ...
  const communeMatch = cleaned.match(/(?:ឃុំ|សង្កាត់)\s*([^\s,;]+(?:\s+[^\s,;]+)*?)(?=\s*(?:ស្រុក|ខណ្ឌ|ក្រុង|ខេត្ត|រាជធានី|[,;]|$))/);
  if (communeMatch) res.commune = communeMatch[1].replace(/^[,\s\-]+|[,\s\-]+$/g, '').trim();

  // Match district: ស្រុក|ខណ្ឌ|ក្រុង ...
  const fullDistrict = cleaned.match(/(ស្រុក|ខណ្ឌ|ក្រុង)\s*([^\s,;]+(?:\s+[^\s,;]+)*?)(?=\s*(?:ខេត្ត|រាជធានី|[,;]|$))/);
  if (fullDistrict) {
    res.district = (fullDistrict[1] === 'ក្រុង' ? 'ក្រុង' + fullDistrict[2].trim() : fullDistrict[2].trim()).replace(/^[,\s\-]+|[,\s\-]+$/g, '').trim();
  }

  // Match province: ខេត្ត|រាជធានី ...
  const provinceMatch = cleaned.match(/(?:ខេត្ត|រាជធានី)\s*([^\s,;]+(?:\s+[^\s,;]+)*?)(?=[,;]|$)/);
  if (provinceMatch) {
    res.province = provinceMatch[1].replace(/^[,\s\-]+|[,\s\-]+$/g, '').trim();
  }

  // Fallback: If no tags matched at all, treat the raw string as province
  if (!res.village && !res.commune && !res.district && !res.province) {
    res.province = cleaned;
  }

  return res;
};

export const formatKhmerAddress = (addr) => {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  const parts = [];
  if (addr.houseNumber) parts.push(`ផ្ទះលេខ ${addr.houseNumber}`);
  if (addr.streetNumber) parts.push(`ផ្លូវ ${addr.streetNumber}`);
  if (addr.groupNumber) parts.push(`ក្រុម ${addr.groupNumber}`);
  if (addr.village) parts.push(`ភូមិ ${addr.village}`);
  if (addr.commune) parts.push(`ឃុំ/សង្កាត់ ${addr.commune}`);
  if (addr.district) parts.push(`ស្រុក/ខណ្ឌ ${addr.district}`);
  if (addr.province) parts.push(`ខេត្ត/ក្រុង ${addr.province}`);
  return parts.join(' ');
};

export const PrintableAdmissionForm = ({
  admission,
  isOpen,
  onClose,
  defaultMode = 'all'
}) => {
  const [printMode, setPrintMode] = useState(defaultMode);

  useEffect(() => {
    if (isOpen) {
      setPrintMode(defaultMode || 'all');
    }
  }, [isOpen, defaultMode]);

  if (!isOpen || !admission) return null;

  // Split Date Helpers
  const getDobDigits = (dateStr) => {
    if (!dateStr) return { y: [' ', ' ', ' ', ' '], m: [' ', ' '], d: [' ', ' '] };
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { y: [' ', ' ', ' ', ' '], m: [' ', ' '], d: [' ', ' '] };
      const yStr = String(d.getFullYear()).padStart(4, '0');
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      const dStr = String(d.getDate()).padStart(2, '0');
      return {
        y: yStr.split(''),
        m: mStr.split(''),
        d: dStr.split('')
      };
    } catch {
      return { y: [' ', ' ', ' ', ' '], m: [' ', ' '], d: [' ', ' '] };
    }
  };

  // Khmer Numerals Helper
  const toKhmerNum = (num) => {
    if (num === null || num === undefined) return '';
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return String(num).replace(/[0-9]/g, (d) => khmerDigits[parseInt(d, 10)]);
  };

  const getDayMonthYear = (dateStr) => {
    if (!dateStr) return { day: '.......', month: '.......', year: '២០២...' };
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { day: '.......', month: '.......', year: '២០២...' };
      return {
        day: String(d.getDate()).padStart(2, '0'),
        month: String(d.getMonth() + 1).padStart(2, '0'),
        year: String(d.getFullYear())
      };
    } catch {
      return { day: '.......', month: '.......', year: '២០២...' };
    }
  };

  const today = getDayMonthYear(new Date());
  const dobParts = getDayMonthYear(admission.dob);
  const dobDigits = getDobDigits(admission.dob);

  // Split Name Parts
  const nameParts = (admission.khmerName || '').trim().split(' ');
  const khmerLastName = nameParts[0] || '';
  const khmerFirstName = nameParts.slice(1).join(' ') || '';

  const latinParts = (admission.latinName || '').trim().split(' ');
  const latinLastName = (latinParts[0] || '').toUpperCase();
  const latinFirstName = latinParts.slice(1).join(' ').toUpperCase();

  // Shift & Degree Flags
  const isShiftMorning = admission.shift === 'morning';
  const isShiftAfternoon = admission.shift === 'afternoon';
  const isShiftBoth = admission.shift === 'morning_afternoon';
  const isShiftEvening = admission.shift === 'evening';
  const isShiftWeekend = admission.shift === 'weekend';

  const isBachelor = admission.degreeLevel === 'bachelor';
  const isHigherDip = admission.degreeLevel === 'higher_diploma';
  const isC1 = admission.degreeLevel === 'c1';
  const isC2 = admission.degreeLevel === 'c2';
  const isC3 = admission.degreeLevel === 'c3';
  const isShortCourse = ['tvet_short', 'short_course'].includes(admission.degreeLevel);
  const isScholarship = admission.studyType === 'scholarship';

  const degreeMap = {
    bachelor: 'បរិញ្ញាបត្របច្ចេកវិទ្យា/ឯកទេស',
    higher_diploma: 'សញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស',
    c3: 'សញ្ញាបត្របច្ចេកទេស និងវិជ្ជាជីវៈ ៣',
    c2: 'សញ្ញាបត្របច្ចេកទេស និងវិជ្ជាជីវៈ ២',
    c1: 'សញ្ញាបត្របច្ចេកទេស និងវិជ្ជាជីវៈ ១',
    tvet_short: 'វិញ្ញាបនបត្រវិជ្ជាជីវៈ',
    short_course: 'វគ្គខ្លី'
  };
  const degreeKhmer = degreeMap[admission.degreeLevel] || admission.degreeLevel || '';

  // Intelligent Address Parsing & Fallbacks for all pages
  const parsedPob = parseKhmerAddress(admission.pob);
  const pobVillage = admission.pobVillage || parsedPob.village || '';
  const pobCommune = admission.pobCommune || parsedPob.commune || '';
  const pobDistrict = admission.pobDistrict || parsedPob.district || '';
  const pobProvince = (admission.pobProvince || parsedPob.province || '').replace(/^ខេត្ត\s*/, '');

  const parsedCurrent = parseKhmerAddress(admission.permanentAddress || admission.currentAddress);
  const currentHouse = admission.houseNumber || parsedCurrent.houseNumber || '';
  const currentStreet = admission.streetNumber || parsedCurrent.streetNumber || '';
  const currentGroup = admission.groupNumber || parsedCurrent.groupNumber || '';
  const currentVillage = admission.currentVillage || parsedCurrent.village || '';
  const currentCommune = admission.currentCommune || parsedCurrent.commune || '';
  const currentDistrict = admission.currentDistrict || parsedCurrent.district || '';
  const currentProvince = (admission.currentProvince || parsedCurrent.province || '').replace(/^ខេត្ត\s*/, '');

  const parsedGuardian = parseKhmerAddress(admission.guardianAddress);
  const guardianHouse = admission.guardianHouseNumber || parsedGuardian.houseNumber || '';
  const guardianStreet = admission.guardianStreet || parsedGuardian.streetNumber || '';
  const guardianGroup = admission.guardianGroup || parsedGuardian.groupNumber || '';
  const guardianVillage = admission.guardianVillage || parsedGuardian.village || '';
  const guardianCommune = admission.guardianCommune || parsedGuardian.commune || '';
  const guardianDistrict = admission.guardianDistrict || parsedGuardian.district || '';
  const guardianProvince = (admission.guardianProvince || parsedGuardian.province || '').replace(/^ខេត្ត\s*/, '');

  const fullPobAddress = admission.pob || [
    pobVillage ? `ភូមិ ${pobVillage}` : '',
    pobCommune ? `ឃុំ/សង្កាត់ ${pobCommune}` : '',
    pobDistrict ? `ស្រុក/ខណ្ឌ ${pobDistrict}` : '',
    pobProvince ? `ខេត្ត/ក្រុង ${pobProvince}` : ''
  ].filter(Boolean).join(' ');

  const fullCurrentAddress = admission.currentAddress || admission.permanentAddress || [
    currentHouse ? `ផ្ទះលេខ ${currentHouse}` : '',
    currentStreet ? `ផ្លូវ ${currentStreet}` : '',
    currentGroup ? `ក្រុម ${currentGroup}` : '',
    currentVillage ? `ភូមិ ${currentVillage}` : '',
    currentCommune ? `ឃុំ/សង្កាត់ ${currentCommune}` : '',
    currentDistrict ? `ស្រុក/ខណ្ឌ ${currentDistrict}` : '',
    currentProvince ? `ខេត្ត/ក្រុង ${currentProvince}` : ''
  ].filter(Boolean).join(' ');

  // Continuous Flex Dotted Underline Component (Fills 100% available width like Word dot leaders)
  const DottedField = ({
    label = '',
    value = '',
    flex = '1 1 auto',
    minWidth = '20px',
    width,
    style = {},
    valueStyle = {}
  }) => (
    <span style={{
      display: 'inline-flex',
      alignItems: 'baseline',
      flex: width ? undefined : flex,
      width: width || undefined,
      minWidth: width ? width : minWidth,
      margin: '0 1px',
      ...style
    }}>
      {label && <span style={{ marginRight: '3px', whiteSpace: 'nowrap' }}>{label}</span>}
      <span style={{
        flex: 1,
        borderBottom: '1px dotted #000',
        minHeight: '13px',
        display: 'inline-flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0 2px',
        lineHeight: '1.15'
      }}>
        {value ? (
          <span style={{
            fontWeight: 700,
            color: '#000',
            fontFamily: "'Khmer OS Battambang', 'Battambang', sans-serif",
            fontSize: 'inherit',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
            ...valueStyle
          }}>
            {value}
          </span>
        ) : (
          <span>&nbsp;</span>
        )}
      </span>
    </span>
  );

  // Exact Checkbox Box Component (Matching character  in Word)
  const Box = ({ checked = false, label = '', style = {}, boxStyle = {}, nowrap = true }) => (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      marginRight: '6px',
      fontSize: 'inherit',
      ...style
    }}>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '10.5px',
        height: '10.5px',
        border: '1.1px solid #000',
        marginRight: '4.5px',
        fontSize: '9px',
        lineHeight: 1,
        fontWeight: 800,
        background: '#fff',
        color: '#000',
        flexShrink: 0,
        ...boxStyle
      }}>
        {checked ? '✓' : ''}
      </span>
      {label && <span style={{ whiteSpace: nowrap ? 'nowrap' : 'normal', lineHeight: '1.2' }}>{label}</span>}
    </span>
  );

  // Commute Option with perfectly aligned checkbox and hanging indent for 2nd line (matches Item 9 font size & checkbox)
  const CommuteOption = ({ checked = false, line1 = '', line2 = '' }) => (
    <div style={{ display: 'flex', flexDirection: 'column', fontSize: 'inherit', lineHeight: 1.3 }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '10.5px',
          height: '10.5px',
          border: '1.1px solid #000',
          marginRight: '4px',
          fontSize: '9px',
          lineHeight: 1,
          fontWeight: 800,
          background: '#fff',
          color: '#000',
          flexShrink: 0
        }}>
          {checked ? '✓' : ''}
        </span>
        <span style={{ whiteSpace: 'nowrap' }}>{line1}</span>
      </div>
      {line2 && (
        <div style={{ paddingLeft: '14.5px', whiteSpace: 'nowrap' }}>
          {line2}
        </div>
      )}
    </div>
  );

  // Royal Divider SVG (Traditional divider: line - dot - diamond - dot - line)
  const RoyalDivider = () => (
    <div style={{ textAlign: 'center', margin: '2px 0 3px' }}>
      <svg width="120" height="8" viewBox="0 0 120 8" fill="none" style={{ margin: '0 auto', display: 'block' }}>
        <line x1="8" y1="4" x2="44" y2="4" stroke="#000" strokeWidth="0.8"/>
        <circle cx="50" cy="4" r="1.5" fill="#000"/>
        <rect x="57" y="1" width="6" height="6" transform="rotate(45 60 4)" fill="#000"/>
        <circle cx="70" cy="4" r="1.5" fill="#000"/>
        <line x1="76" y1="4" x2="112" y2="4" stroke="#000" strokeWidth="0.8"/>
      </svg>
    </div>
  );

  // Official Standard Footer Table (RPITSSR/ETO/PR01/FR02)
  const Fr02Footer = ({ pageNum, isLandscape = false }) => (
    <table style={{
      width: '100%',
      borderCollapse: 'collapse',
      border: '1px solid #000',
      fontSize: '7.5pt',
      textAlign: 'center',
      color: '#000',
      marginTop: 'auto',
      fontFamily: "'Battambang', 'Khmer OS Battambang', sans-serif"
    }}>
      <tbody>
        <tr>
          <td style={{ border: '1px solid #000', width: isLandscape ? '14%' : '15%', fontWeight: 700, padding: '2px 4px' }}>RPITSSR</td>
          <td style={{ border: '1px solid #000', width: isLandscape ? '44%' : '38%', padding: '2px 4px', textAlign: 'left', paddingLeft: '8px', fontWeight: 400 }}>
            លេខ៖ RPITSSR/ETO/PR01/FR02<br />
            ថ្ងៃពិនិត្យឡើងវិញ៖ ១២/០៣/២០២៦
          </td>
          <td style={{ border: '1px solid #000', width: isLandscape ? '30%' : '35%', padding: '2px 4px', textAlign: 'left', paddingLeft: '8px', whiteSpace: isLandscape ? 'normal' : 'nowrap', fontWeight: 400 }}>
            ចេញផ្សាយលើកទី៤<br />
            ថ្ងៃប្រសិទ្ធភាព៖ ១៦/០៣/២០២៦
          </td>
          <td style={{ border: '1px solid #000', width: isLandscape ? '12%' : '12%', padding: '2px 4px', fontWeight: 400 }}>
            ទំព័រ {pageNum}/៥
          </td>
        </tr>
      </tbody>
    </table>
  );

  const modalContent = (
    <div className="printable-modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(7, 41, 77, 0.88)',
      backdropFilter: 'blur(8px)',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflowY: 'auto',
      padding: '16px 8px'
    }}>
      {/* =========================================================================
          PRINT & TYPOGRAPHY STYLESHEET (MIXED ORIENTATIONS & KHMER OS FONTS)
          ========================================================================= */}
      <style>{`
        /* Khmer OS Font Declarations - Strictly override global Kantumruy Pro */
        .fr02-page-1,
        .fr02-page-2,
        .fr02-page-3,
        .fr02-page-1,
        .fr02-page-2,
        .fr02-page-3,
        .fr02-page-4,
        .fr02-page-5,
        .fr02-page-1 :not(.fr02-muol):not(.fr02-muol *):not(.fr02-times):not(.fr02-times *),
        .fr02-page-2 :not(.fr02-muol):not(.fr02-muol *):not(.fr02-times):not(.fr02-times *),
        .fr02-page-3 :not(.fr02-muol):not(.fr02-muol *):not(.fr02-times):not(.fr02-times *),
        .fr02-page-4 :not(.fr02-muol):not(.fr02-muol *):not(.fr02-times):not(.fr02-times *),
        .fr02-page-5 :not(.fr02-muol):not(.fr02-muol *):not(.fr02-times):not(.fr02-times *) {
          font-family: 'Khmer OS Battambang', 'Battambang', sans-serif !important;
          color: #000000 !important;
        }

        .fr02-muol,
        .fr02-muol *,
        .fr02-page-1 .fr02-muol,
        .fr02-page-1 .fr02-muol *,
        .fr02-page-2 .fr02-muol,
        .fr02-page-2 .fr02-muol *,
        .fr02-page-3 .fr02-muol,
        .fr02-page-3 .fr02-muol *,
        .fr02-page-4 .fr02-muol,
        .fr02-page-4 .fr02-muol *,
        .fr02-page-5 .fr02-muol,
        .fr02-page-5 .fr02-muol *,
        .fr02-page-1 .fr02-header-gray,
        .fr02-page-2 .fr02-header-gray,
        .fr02-page-3 .fr02-header-gray,
        .fr02-page-4 .fr02-header-gray,
        .fr02-page-5 .fr02-header-gray {
          font-family: 'Moul', 'Khmer OS Muol Light', 'Khmer OS Moul Light', 'Khmer OS Moul', serif !important;
          font-weight: normal !important;
          color: #000000 !important;
        }

        .fr02-battambang,
        .fr02-battambang * {
          font-family: 'Khmer OS Battambang', 'Battambang', sans-serif !important;
          color: #000000 !important;
        }

        .fr02-times,
        .fr02-times *,
        .fr02-page-1 .fr02-times,
        .fr02-page-1 .fr02-times *,
        .fr02-page-2 .fr02-times,
        .fr02-page-2 .fr02-times *,
        .fr02-page-3 .fr02-times,
        .fr02-page-3 .fr02-times *,
        .fr02-page-4 .fr02-times,
        .fr02-page-4 .fr02-times *,
        .fr02-page-5 .fr02-times,
        .fr02-page-5 .fr02-times * {
          font-family: 'Times New Roman', Times, serif !important;
          color: #000000 !important;
        }

        /* Strict pure black color across all form elements and headings */
        .fr02-page-1 h1, .fr02-page-1 h2, .fr02-page-1 h3, .fr02-page-1 h4,
        .fr02-page-2 h1, .fr02-page-2 h2, .fr02-page-2 h3, .fr02-page-2 h4,
        .fr02-page-3 h1, .fr02-page-3 h2, .fr02-page-3 h3, .fr02-page-3 h4,
        .fr02-page-4 h1, .fr02-page-4 h2, .fr02-page-4 h3, .fr02-page-4 h4,
        .fr02-page-5 h1, .fr02-page-5 h2, .fr02-page-5 h3, .fr02-page-5 h4 {
          color: #000000 !important;
        }

        /* Screen Presentation */
        .fr02-page-1 {
          background: #ffffff;
          width: 210mm;
          min-height: 297mm;
          max-height: 297mm;
          height: 297mm;
          padding: 6.5mm 8.0mm 6.5mm 8.0mm;
          box-sizing: border-box;
          color: #000000 !important;
          font-size: 9.3pt;
          line-height: 1.70;
          position: relative;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          font-family: 'Khmer OS Battambang', 'Battambang', sans-serif;
          overflow: hidden;
        }

        .fr02-page-2 {
          background: #ffffff;
          width: 210mm;
          min-height: 297mm;
          max-height: 297mm;
          height: 297mm;
          padding: 8.0mm 8.0mm 8.0mm 8.0mm;
          box-sizing: border-box;
          color: #000000;
          font-size: 8.2pt;
          line-height: 1.25;
          position: relative;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          font-family: 'Khmer OS Battambang', 'Battambang', sans-serif;
          overflow: hidden;
        }

        .fr02-page-3 {
          background: #ffffff;
          width: 297mm;
          min-height: 210mm;
          max-height: 210mm;
          padding: 8.5mm 10.0mm 12.0mm 8.0mm;
          box-sizing: border-box;
          color: #000000;
          font-size: 8.2pt;
          line-height: 1.35;
          position: relative;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          font-family: 'Khmer OS Battambang', 'Battambang', sans-serif;
          overflow: hidden;
        }

        .fr02-page-4 {
          background: #ffffff;
          width: 297mm;
          min-height: 210mm;
          max-height: 210mm;
          padding: 10.0mm 9.0mm 12.5mm 8.0mm;
          box-sizing: border-box;
          color: #000000;
          font-size: 8.2pt;
          line-height: 1.35;
          position: relative;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          font-family: 'Khmer OS Battambang', 'Battambang', sans-serif;
          overflow: hidden;
        }

        .fr02-page-5 {
          background: #ffffff;
          width: 210mm;
          height: 297mm;
          min-height: 297mm;
          max-height: 297mm;
          padding: 4.5mm 8.0mm 5.0mm 8.0mm;
          box-sizing: border-box;
          color: #000000;
          font-size: 7.8pt;
          line-height: 1.4;
          position: relative;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          font-family: 'Khmer OS Battambang', 'Battambang', sans-serif;
          overflow: hidden;
        }

        .fr02-header-gray {
          background-color: #d1d5db !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          font-family: 'Khmer OS Muol Light', 'Khmer OS Moul Light', 'Khmer OS Moul', 'Moul', serif !important;
          font-weight: 400 !important;
          text-align: center;
          font-size: 9.8pt;
          padding: 2.5px 0 !important;
          border: 1px solid #000000;
          color: #000000 !important;
        }

        /* Print Media with Dynamic Paper Orientation Rules */
        @page {
          size: ${printMode === 'p3_p4' ? 'A4 landscape' : 'A4 portrait'} !important;
          margin: 0 !important;
        }
        @page portrait-page {
          size: A4 portrait !important;
          margin: 0 !important;
        }
        @page landscape-page {
          size: A4 landscape !important;
          margin: 0 !important;
        }

        @media print {
          body > *:not(#root):not(.printable-modal-overlay) {
            display: none !important;
          }
          nav, header, footer, .print-toolbar, .website-guide-modal {
            display: none !important;
          }
          body * {
            visibility: hidden;
          }
          .printable-modal-overlay,
          .printable-modal-overlay * {
            visibility: visible !important;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            overflow: visible !important;
          }
          .printable-modal-overlay {
            display: block !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
            backdrop-filter: none !important;
            overflow: visible !important;
            z-index: 999999 !important;
            box-shadow: none !important;
          }
          .print-toolbar {
            display: none !important;
          }

          .fr02-page-1,
          .fr02-page-2,
          .fr02-page-5 {
            page: portrait-page !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            page-break-after: always !important;
            break-after: page !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }

          .fr02-page-3,
          .fr02-page-4 {
            page: landscape-page !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
            min-height: 210mm !important;
            max-height: 210mm !important;
            page-break-after: always !important;
            break-after: page !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }

          .fr02-page-1:last-child,
          .fr02-page-2:last-child,
          .fr02-page-3:last-child,
          .fr02-page-4:last-child,
          .fr02-page-5:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
      `}</style>

      {/* =========================================================================
          SCREEN TOOLBAR
          ========================================================================= */}
      <div className="print-toolbar" style={{
        background: '#ffffff',
        borderRadius: '14px',
        padding: '12px 18px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
        marginBottom: '16px',
        width: '100%',
        maxWidth: '1020px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          {/* Title & Metadata */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#eff6ff',
              color: '#1e73be',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #bfdbfe'
            }}>
              <Printer size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#07294D' }}>
                ទម្រង់ស្តង់ដារផ្លូវការ 3-FR02-ពាក្យចូលរៀន.pdf (RPITSSR)
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                កូដតាមដាន ៖ <strong style={{ color: '#1e73be' }}>{admission.trackingCode || 'RPITSSR-2026-XXXX'}</strong> • សូមទាក់ទង ETO (A4: ទំព័រ ១-២ & ៥ Portrait • ទំព័រ ៣-៤ Landscape)
              </div>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f1f5f9',
            borderRadius: '8px',
            padding: '3px',
            gap: '3px',
            border: '1px solid #cbd5e1'
          }}>
            <button
              type="button"
              onClick={() => setPrintMode('all')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: printMode === 'all' ? '#07294D' : 'transparent',
                color: printMode === 'all' ? '#ffffff' : '#64748b'
              }}
            >
              📑 ទាំងអស់ (៥ ទំព័រ)
            </button>
            <button
              type="button"
              onClick={() => setPrintMode('p1_p2')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: printMode === 'p1_p2' ? '#07294D' : 'transparent',
                color: printMode === 'p1_p2' ? '#ffffff' : '#64748b'
              }}
            >
              📄 ទម្រង់ពាក្យ (ទំព័រ ១-២ • បញ្ឈរ)
            </button>
            <button
              type="button"
              onClick={() => setPrintMode('p3_p4')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: printMode === 'p3_p4' ? '#07294D' : 'transparent',
                color: printMode === 'p3_p4' ? '#ffffff' : '#64748b'
              }}
            >
              📊 ព័ត៌មានបន្ថែម (ទំព័រ ៣-៤ • ផ្តេក)
            </button>
            <button
              type="button"
              onClick={() => setPrintMode('voucher')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: printMode === 'voucher' ? '#07294D' : 'transparent',
                color: printMode === 'voucher' ? '#ffffff' : '#64748b'
              }}
            >
              🎟️ បង្កាន់ដៃ (ទំព័រ ៥ • បញ្ឈរ)
            </button>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a
              href="/docs/3-FR02-ពាក្យចូលរៀន.pdf"
              target="_blank"
              rel="noopener noreferrer"
              download
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '7px 12px',
                borderRadius: '8px',
                background: '#f8fafc',
                color: '#07294D',
                border: '1px solid #cbd5e1',
                fontWeight: 700,
                fontSize: '0.8rem',
                textDecoration: 'none',
                cursor: 'pointer'
              }}
              title="ទាញយកទម្រង់ PDF ដើម"
            >
              <Download size={14} />
              <span>ទម្រង់ PDF ដើម</span>
            </a>

            <button
              type="button"
              onClick={() => window.print()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 18px',
                borderRadius: '8px',
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.84rem',
                cursor: 'pointer'
              }}
            >
              <Printer size={15} />
              <span>បោះពុម្ព (Print)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '7px',
                borderRadius: '8px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#64748b',
                cursor: 'pointer'
              }}
              title="បិទ"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Print Guidance Alert */}
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '0.78rem',
          color: '#1e40af',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div>
            💡 <strong>ទំហំក្រដាស និង Margin៖</strong> ក្រដាស A4 (ទំព័រ ១, ២, ៥ Portrait • ទំព័រ ៣, ៤ Landscape) • ក្នុងផ្ទាំង Print សូមជ្រើសរើស <strong>Margins: "None" (គ្មានគែម)</strong> ដើម្បីទទួលបានទម្រង់ 1:1 ឥតកាត់គែម។
          </div>
          <div style={{ fontWeight: 700, color: '#1e73be' }}>
            Word LTSC Standard Format
          </div>
        </div>
      </div>

      {/* =========================================================================
          PRINTABLE PAGES CONTAINER
          ========================================================================= */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>

        {/* =======================================================================
            PAGE 1 OF 5: ពាក្យសុំចុះឈ្មោះចូលរៀន (PORTRAIT A4)
            ======================================================================= */}
        {(printMode === 'all' || printMode === 'p1_p2' || printMode === 'full_form') && (
          <div className="fr02-page-1">
            <div>
              {/* Header Page 1: Exact forensic layout matching Word LTSC PDF */}
              <div style={{ position: 'relative', minHeight: '34mm', marginBottom: '3mm' }}>
                {/* Top Center: Kingdom & Motto */}
                <div style={{ textAlign: 'center', width: '100%', paddingTop: '0px' }}>
                  <div className="fr02-muol" style={{ fontSize: '13pt', lineHeight: 1.25 }}>ព្រះរាជាណាចក្រកម្ពុជា</div>
                  <div className="fr02-muol" style={{ fontSize: '11pt', lineHeight: 1.25, marginTop: '2px' }}>ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
                  <RoyalDivider />
                </div>

                {/* Left: Ministry & Institute (positioned on left, aligning below Royal Divider) */}
                <div style={{ position: 'absolute', top: '15mm', left: 0 }}>
                  <div className="fr02-muol" style={{ fontSize: '10.5pt', lineHeight: 1.35, whiteSpace: 'nowrap' }}>ក្រសួងការងារ និងបណ្តុះបណ្តាលវិជ្ជាជីវៈ:</div>
                  <div className="fr02-muol" style={{ fontSize: '10.5pt', lineHeight: 1.35, marginTop: '3px', whiteSpace: 'nowrap' }}>
                    វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប
                  </div>
                </div>

                {/* Right: 4x6 Photo Box positioned absolutely in upper right */}
                <div style={{
                  position: 'absolute',
                  top: '5mm',
                  right: 0,
                  width: '28mm',
                  height: '38mm',
                  border: '1px solid #000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  fontSize: '9.5pt',
                  color: '#000',
                  overflow: 'hidden'
                }}>
                  {admission.photoUrl ? (
                    <img src={admission.photoUrl} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div>4x6</div>
                  )}
                </div>
              </div>

              {/* Title Page 1 */}
              <div style={{ textAlign: 'center', margin: '4mm 0 4mm' }}>
                <div className="fr02-muol" style={{ fontSize: '15.5pt', margin: 0, color: '#000000', lineHeight: 1.3 }}>
                  ពាក្យសុំចុះឈ្មោះចូលរៀន
                </div>
              </div>

              {/* Bio Summary Page 1 with Complete Continuous Dot Leaders */}
              <div className="fr02-battambang" style={{ fontSize: '9.3pt', lineHeight: 1.72, color: '#000000' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '2px' }}>
                  <span style={{ whiteSpace: 'nowrap' }}>ខ្ញុំបាទ/នាងខ្ញុំឈ្មោះ:</span>
                  <DottedField value={admission.khmerName} flex="1.2" />
                  <span style={{ marginLeft: '8px', whiteSpace: 'nowrap' }}>អក្សរឡាតាំង</span>
                  <DottedField value={admission.latinName} flex="1.2" valueStyle={{ textTransform: 'uppercase' }} />
                  <span style={{ marginLeft: '8px', whiteSpace: 'nowrap' }}>ភេទ</span>
                  <DottedField value={admission.gender === 'male' ? 'ប្រុស' : admission.gender === 'female' ? 'ស្រី' : ''} width="55px" />
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '2px' }}>
                  <span style={{ whiteSpace: 'nowrap' }}>ជនជាតិ</span>
                  <DottedField value={admission.ethnicity || 'ខ្មែរ'} flex="0.9" />
                  <span style={{ marginLeft: '8px', whiteSpace: 'nowrap' }}>សញ្ជាតិ</span>
                  <DottedField value={admission.nationality || 'កម្ពុជា'} flex="0.9" />
                  <span style={{ marginLeft: '8px', whiteSpace: 'nowrap' }}>សាសនា</span>
                  <DottedField value={admission.religion || 'ព្រះពុទ្ធ'} flex="0.9" />
                  <span style={{ marginLeft: '8px', whiteSpace: 'nowrap' }}>កើតថ្ងៃទី</span>
                  <DottedField value={toKhmerNum(dobParts.day)} width="36px" />
                  <span style={{ margin: '0 3px', whiteSpace: 'nowrap' }}>ខែ</span>
                  <DottedField value={toKhmerNum(dobParts.month)} width="36px" />
                  <span style={{ margin: '0 3px', whiteSpace: 'nowrap' }}>ឆ្នាំ</span>
                  <DottedField value={toKhmerNum(dobParts.year)} width="58px" />
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '2px' }}>
                  <span style={{ whiteSpace: 'nowrap' }}>ទីកន្លែងកំណើត:</span>
                  <DottedField value={fullPobAddress} flex="1" />
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '2px' }}>
                  <span style={{ whiteSpace: 'nowrap' }}>អាសយដ្ឋានបច្ចុប្បន្ន:</span>
                  <DottedField value={fullCurrentAddress} flex="1" />
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '2px' }}>
                  <span style={{ whiteSpace: 'nowrap' }}>លេខទំនាក់ទំនងផ្ទាល់ខ្លួន:</span>
                  <DottedField value={admission.phone} flex="1" />
                  <span style={{ marginLeft: '10px', whiteSpace: 'nowrap' }}>លេខទំនាក់ទំនងអាណាព្យាបាល</span>
                  <DottedField value={admission.guardianPhone} flex="1" />
                </div>

                {/* Addressing Leadership */}
                <div className="fr02-muol" style={{ textAlign: 'center', margin: '14px 0 4px', fontSize: '11.5pt', color: '#000000' }}>
                  សូមគោរពជូន
                </div>
                <div className="fr02-muol" style={{ textAlign: 'center', fontSize: '12pt', marginBottom: '12px', color: '#000000' }}>
                  លោកស្រី នាយិកាវិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប
                </div>

                <div style={{ textIndent: '32px', textAlign: 'justify', marginBottom: '6px' }}>
                  សូមលោកស្រីនាយិកាមេត្តាអនុញ្ញាតចុះឈ្មោះខ្ញុំបាទ/នាងខ្ញុំ &nbsp; &nbsp; &nbsp; ក្នុងបញ្ជីសិក្សានៅវិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោ<br />
                  សែនសៀមរាប សម្រាប់ឆ្នាំសិក្សា <strong>{toKhmerNum(admission.academicYear) || '២០.....-២០.....'}</strong>។
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '6px' }}>
                  <span style={{ whiteSpace: 'nowrap', textIndent: '32px' }}>កម្រិតសិក្សា៖</span>
                  <DottedField value={degreeKhmer} flex="1" />
                  <span style={{ marginLeft: '8px', whiteSpace: 'nowrap' }}>ឆ្នាំទី</span>
                  <DottedField value="១" width="38px" />
                  <span style={{ marginLeft: '8px', whiteSpace: 'nowrap' }}>ជំនាញឯកទេស៖</span>
                  <DottedField value={admission.major} flex="1.5" />
                </div>

                <div style={{
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.5
                }}>
                  <span style={{ marginRight: '2px' }}>វេនសិក្សា៖</span>
                  <Box checked={isShiftMorning} label="ចន្ទ-សុក្រ(ព្រឹក)" style={{ marginRight: '0' }} />
                  <Box checked={isShiftAfternoon} label="ចន្ទ-សុក្រ(រសៀល)" style={{ marginRight: '0' }} />
                  <Box checked={isShiftBoth} label="ចន្ទ-សុក្រ(ព្រឹក-រសៀល)" style={{ marginRight: '0' }} />
                  <Box checked={isShiftEvening} label="ចន្ទ-សុក្រ(យប់)" style={{ marginRight: '0' }} />
                  <Box checked={isShiftWeekend} label="សៅរ៍-អាទិត្យ(ព្រឹក-រសៀល)" style={{ marginRight: '0' }} />
                </div>

                <div style={{ textIndent: '32px', textAlign: 'justify', marginTop: '10px' }}>
                  ខ្ញុំបាទ/ នាងខ្ញុំ សូមសន្យា គោរពបទបញ្ជាផ្ទៃក្នុង និងអនុវត្តតាមកម្មវិធីសិក្សារបស់វិទ្យាស្ថានយ៉ាងខ្ជាប់ខ្ជួន បើមានការប្រព្រឹត្តិ<br />
                  ខុសដោយប្រការណាមួយ ខ្ញុំបាទ/ នាងខ្ញុំ សូមទទួលយកការវិនិច្ឆ័យរបស់ក្រុមប្រឹក្សាវិន័យរបស់វិទ្យាស្ថានដោយពុំមានការតវ៉ាឡើយ។
                </div>

                <div style={{ textAlign: 'center', margin: '10px 0 10px 0' }}>
                  សូមលោកស្រីនាយិកា មេត្តាទទួលនូវការគោរពដ៏ខ្ពង់ខ្ពស់អំពីខ្ញុំបាទ/នាងខ្ញុំ។
                </div>

                {/* Attachments Section: Full page-width dot leaders (Matching official Word LTSC PDF) */}
                <div style={{ marginTop: '10px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '3px' }}>សូមភ្ជាប់មកជាមួយ:</div>
                  <div style={{ paddingLeft: '20px', lineHeight: 1.75 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                      <span style={{ whiteSpace: 'nowrap' }}>• &nbsp; អត្តសញ្ញាណប័ណ្ណ(កូពី)</span>
                      <span style={{ flex: 1, borderBottom: '1px dotted #000', margin: '0 6px' }}></span>
                      <span style={{ whiteSpace: 'nowrap' }}>០១ច្បាប់</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                      <span style={{ whiteSpace: 'nowrap' }}>• &nbsp; សំបុត្រកំណើត ឬសៀវភៅគ្រួសារ(កូពី)</span>
                      <span style={{ flex: 1, borderBottom: '1px dotted #000', margin: '0 6px' }}></span>
                      <span style={{ whiteSpace: 'nowrap' }}>០១ច្បាប់</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                      <span style={{ whiteSpace: 'nowrap' }}>• &nbsp; សញ្ញាបត្រ (កូពី)</span>
                      <span style={{ flex: 1, borderBottom: '1px dotted #000', margin: '0 6px' }}></span>
                      <span style={{ whiteSpace: 'nowrap' }}>០២ច្បាប់</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                      <span style={{ whiteSpace: 'nowrap' }}>• &nbsp; រូបថតថ្មីថតចំពីមុខ( ៤x៦ )</span>
                      <span style={{ flex: 1, borderBottom: '1px dotted #000', margin: '0 6px' }}></span>
                      <span style={{ whiteSpace: 'nowrap' }}>០១សន្លឹក</span>
                    </div>
                  </div>
                </div>

                {/* Date & Signature Section: Positioned below attachments, aligned on the right */}
                <div style={{ width: '52%', marginLeft: 'auto', textAlign: 'center', marginTop: '10px', lineHeight: 1.55 }}>
                  <div>ថ្ងៃ...........................ខែ..................ឆ្នាំ............ ព.ស ២៥......</div>
                  <div style={{ marginTop: '2px' }}>
                    សៀមរាប ថ្ងៃទី {toKhmerNum(today.day)} ខែ {toKhmerNum(today.month)} ឆ្នាំ {toKhmerNum(today.year)}
                  </div>
                  <div style={{ fontWeight: 700, marginTop: '4px' }}>ហត្ថលេខា/ឈ្មោះសាមីខ្លួន</div>
                  {admission.khmerName && (
                    <div style={{ fontWeight: 700, marginTop: '24px' }}>{admission.khmerName}</div>
                  )}
                </div>
              </div>
            </div>

            <Fr02Footer pageNum="១" />
          </div>
        )}

        {/* =======================================================================
            PAGE 2 OF 5: ផ្នែក (A) ជីវប្រវត្តិសិស្ស (PORTRAIT A4)
            ======================================================================= */}
        {(printMode === 'all' || printMode === 'p1_p2' || printMode === 'full_form') && (
          <div className="fr02-page-2">
            <div>
              {/* Outer Top Box with 1px black border - Exact official layout matching Word LTSC PDF */}
              <div style={{ border: '1px solid #000', marginBottom: '5px' }}>
                {/* Header Top: Logo on Left, Centered Institute Titles on Right */}
                <div style={{ display: 'flex', alignItems: 'flex-start', padding: '6px 12px 2px 12px' }}>
                  <div style={{ width: '102px', flexShrink: 0, textAlign: 'center', paddingTop: '1px' }}>
                    <img
                      src="/images/logo.png"
                      alt="RPITSSR"
                      style={{ width: '96px', height: '96px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                    />
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', paddingRight: '102px', paddingTop: '1px' }}>
                    <div className="fr02-muol" style={{ fontSize: '12pt', lineHeight: 1.3, color: '#000000' }}>
                      វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប
                    </div>
                    <div className="fr02-times" style={{ fontSize: '14pt', fontWeight: 400, color: '#000000', margin: '1px 0 2px 0' }}>
                      Regional Polytechnic Institute Techo Sen Siem Reap
                    </div>
                    <div className="fr02-muol" style={{ fontSize: '12.5pt', lineHeight: 1.45, margin: '4px 0 6px 0', color: '#000000' }}>
                      ពាក្យសុំចុះឈ្មោះចូលរៀន
                    </div>
                    <div className="fr02-muol" style={{ textAlign: 'center', lineHeight: 1.45, margin: '5px 0 4px 0', fontSize: '11pt' }}>
                      <Box checked={isScholarship} label="អាហារូបករណ៍" style={{ marginRight: '55px' }} boxStyle={{ width: '11.5px', height: '11.5px', fontSize: '9px', marginRight: '5px' }} />
                      <Box checked={!isScholarship} label="បង់ថ្លៃ" boxStyle={{ width: '11.5px', height: '11.5px', fontSize: '9px', marginRight: '5px' }} />
                    </div>
                  </div>
                </div>

                {/* Header Body: 3 Structured Rows with Dedicated Label Columns */}
                <div style={{ padding: '0 12px 8px 12px' }}>
                  {/* Row 1: Degree Levels */}
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                    <div className="fr02-muol" style={{ width: '13%', fontSize: '9.2pt', textAlign: 'left', flexShrink: 0 }}>
                      កម្រិតសិក្សា:
                    </div>
                    <div style={{ width: '87%', display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: '5px 10px', fontSize: '8.3pt', lineHeight: 1.45 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <Box checked={isBachelor} label="បរិញ្ញាបត្របច្ចេកវិទ្យា/ឯកទេស" />
                        <Box checked={isC3} label="សញ្ញាបត្របច្ចេកទេស និងវិជ្ជាជីវៈ ៣" />
                        <Box checked={isC1} label="សញ្ញាបត្របច្ចេកទេស និងវិជ្ជាជីវៈ ១" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <Box checked={isHigherDip} label="សញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស" />
                        <Box checked={isC2} label="សញ្ញាបត្របច្ចេកទេស និងវិជ្ជាជីវៈ ២" />
                        <Box checked={isShortCourse} label={`វិញ្ញាបនបត្រវិជ្ជាជីវៈ: (${isShortCourse ? admission.major : '.......................'})`} />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Study Application */}
                  <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '8px' }}>
                    <div className="fr02-muol" style={{ width: '13%', fontSize: '9.2pt', textAlign: 'left', flexShrink: 0 }}>
                      សុំចូលរៀន:
                    </div>
                    <div style={{ width: '87%', display: 'flex', alignItems: 'baseline', fontSize: '8.3pt' }}>
                      <span>ឆ្នាំទី</span>
                      <DottedField value={toKhmerNum(admission.studyYear || '១')} width="36px" />
                      <span style={{ marginLeft: '10px' }}>ឆមាសទី</span>
                      <DottedField value={toKhmerNum(admission.semester || '១')} width="36px" />
                      <span style={{ marginLeft: '12px' }}>មុខជំនាញ:</span>
                      <DottedField value={admission.major} flex="1" />
                    </div>
                  </div>

                  {/* Row 3: Shifts */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: '8px' }}>
                    <div className="fr02-muol" style={{ width: '13%', fontSize: '9.2pt', paddingTop: '1px', textAlign: 'left', flexShrink: 0 }}>
                      វេនសិក្សា:
                    </div>
                    <div style={{ width: '87%', fontSize: '8.0pt' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', whiteSpace: 'nowrap' }}>
                        <Box checked={isShiftMorning} label="ចន្ទ-សុក្រ(ព្រឹក)" />
                        <Box checked={isShiftAfternoon} label="ចន្ទ-សុក្រ(រសៀល)" />
                        <Box checked={isShiftBoth} label="ចន្ទ-សុក្រ(ព្រឹក-រសៀល)" />
                        <Box checked={isShiftEvening} label="ចន្ទ-សុក្រ(យប់)" />
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        <Box checked={isShiftWeekend} label="សៅរ៍-អាទិត្យ(ព្រឹក-រសៀល)" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Clerk Usage Sub-row with continuous dotted lines */}
                <div style={{ borderTop: '1px solid #000', padding: '5px 12px', fontSize: '7.8pt', background: '#ffffff' }}>
                  <div className="fr02-times" style={{ textAlign: 'center', fontWeight: 700, fontSize: '8.4pt', marginBottom: '3px' }}>Data Clerk Usage</div>
                  <div className="fr02-times" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', flex: '1 1 auto' }}>
                      <span style={{ whiteSpace: 'nowrap' }}>Student Record #:</span>
                      <span style={{ flex: 1, borderBottom: '1px dotted #000', padding: '0 4px', fontWeight: 700 }}>{admission.trackingCode || ''}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', flex: '1 1 auto' }}>
                      <span style={{ whiteSpace: 'nowrap' }}>Entry Date:</span>
                      <span style={{ flex: 1, borderBottom: '1px dotted #000', padding: '0 4px', textAlign: 'center' }}>{today.day}/{today.month}/{today.year}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', flex: '1.2 1 auto' }}>
                      <span style={{ whiteSpace: 'nowrap' }}>Controlled by:</span>
                      <span style={{ flex: 1, borderBottom: '1px dotted #000', padding: '0 4px' }}>&nbsp;</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gray Banner: (A) ជីវប្រវត្តិសិស្ស */}
              <div className="fr02-header-gray" style={{ height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10.5pt', margin: '4px 0 0 0', background: '#c0c0c0', border: '1px solid #000', borderBottom: 'none' }}>
                (A) ជីវប្រវត្តិសិស្ស
              </div>

              {/* Section A Table Grid */}
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', borderTop: 'none', fontSize: '8.3pt', tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '28%' }} />
                  <col style={{ width: '60%' }} />
                </colgroup>
                <tbody>
                  {/* Row 1: 1*. គោត្តនាម & នាម */}
                  <tr>
                    <td colSpan="3" style={{ border: '1px solid #000', padding: '6px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline' }}>
                        <span style={{ width: '50%', display: 'flex', alignItems: 'baseline' }}>
                          <span style={{ whiteSpace: 'nowrap' }}>1*. គោត្តនាម:</span>
                          <DottedField value={khmerLastName} flex="1" />
                        </span>
                        <span style={{ width: '50%', display: 'flex', alignItems: 'baseline', paddingLeft: '14px' }}>
                          <span style={{ whiteSpace: 'nowrap' }}>នាម:</span>
                          <DottedField value={khmerFirstName} flex="1" />
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Row 2: 2*. Family Name & First Name */}
                  <tr>
                    <td colSpan="3" style={{ border: '1px solid #000', padding: '6px 10px' }}>
                      <div className="fr02-times" style={{ display: 'flex', alignItems: 'baseline' }}>
                        <span style={{ width: '50%', display: 'flex', alignItems: 'baseline' }}>
                          <span style={{ whiteSpace: 'nowrap' }}>2*. Family Name:</span>
                          <DottedField value={latinLastName} flex="1" valueStyle={{ textTransform: 'uppercase' }} />
                        </span>
                        <span style={{ width: '50%', display: 'flex', alignItems: 'baseline', paddingLeft: '14px' }}>
                          <span style={{ whiteSpace: 'nowrap' }}>First Name:</span>
                          <DottedField value={latinFirstName} flex="1" valueStyle={{ textTransform: 'uppercase' }} />
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Row 3: 3*, 4*, 5, 6 */}
                  <tr>
                    {/* 3*. ភេទ */}
                    <td style={{ border: '1px solid #000', width: '12%', verticalAlign: 'top', padding: '6px 8px' }}>
                      <div style={{ whiteSpace: 'nowrap' }}>3*. ភេទ:</div>
                      <div style={{ marginTop: '6px' }}><Box checked={admission.gender === 'female'} label="ស្រី" /></div>
                      <div style={{ marginTop: '5px' }}><Box checked={admission.gender === 'male'} label="ប្រុស" /></div>
                    </td>

                    {/* 4*. ថ្ងៃខែឆ្នាំកំណើត (Split 8-digit Boxes: Year 4, Month 2, Day 2 with labels underneath) */}
                    <td style={{ border: '1px solid #000', width: '28%', verticalAlign: 'top', padding: '6px 8px' }}>
                      <div style={{ marginBottom: '5px', whiteSpace: 'nowrap' }}>4*. ថ្ងៃខែឆ្នាំកំណើត</div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: '6px', fontSize: '8.0pt' }}>
                        {/* Year */}
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex' }}>
                            {dobDigits.y.map((digit, i) => (
                              <span key={i} style={{ width: '15px', height: '22px', border: '1px solid #000', borderRight: i === 3 ? '1px solid #000' : 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '9.0pt' }}>
                                {toKhmerNum(digit)}
                              </span>
                            ))}
                          </div>
                          <div style={{ fontSize: '7.5pt', marginTop: '3px' }}>ឆ្នាំ</div>
                        </div>
                        {/* Month */}
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex' }}>
                            {dobDigits.m.map((digit, i) => (
                              <span key={i} style={{ width: '15px', height: '22px', border: '1px solid #000', borderRight: i === 1 ? '1px solid #000' : 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '9.0pt' }}>
                                {toKhmerNum(digit)}
                              </span>
                            ))}
                          </div>
                          <div style={{ fontSize: '7.5pt', marginTop: '3px' }}>ខែ</div>
                        </div>
                        {/* Day */}
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex' }}>
                            {dobDigits.d.map((digit, i) => (
                              <span key={i} style={{ width: '15px', height: '22px', border: '1px solid #000', borderRight: i === 1 ? '1px solid #000' : 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '9.0pt' }}>
                                {toKhmerNum(digit)}
                              </span>
                            ))}
                          </div>
                          <div style={{ fontSize: '7.5pt', marginTop: '3px' }}>ថ្ងៃ</div>
                        </div>
                      </div>
                    </td>

                    {/* 5. លេខអត្តសញ្ញាណប័ណ្ណ & 6. អត្តលេខសិស្ស (Separated by inner border line) */}
                    <td style={{ border: '1px solid #000', width: '60%', verticalAlign: 'top', padding: 0 }}>
                      <div style={{ padding: '6px 8px', borderBottom: '1px solid #000', display: 'flex', alignItems: 'baseline' }}>
                        <span style={{ whiteSpace: 'nowrap' }}>5. លេខអត្តសញ្ញាណប័ណ្ណ:</span>
                        <DottedField value={toKhmerNum(admission.idCardNumber)} flex="1" />
                      </div>
                      <div style={{ padding: '6px 8px', display: 'flex', alignItems: 'baseline' }}>
                        <span style={{ whiteSpace: 'nowrap' }}>6. អត្តលេខសិស្ស:</span>
                        <DottedField value={admission.enrolledStudentId || ''} flex="1" />
                      </div>
                    </td>
                  </tr>

                  {/* Row 4: 8. ចំនួនសមាជិកគ្រួសារក្នុងបន្ទុក (Left) & 7*. ចម្ងាយផ្លូវធ្វើដំណើរ (Right) */}
                  <tr>
                    <td colSpan="2" style={{ border: '1px solid #000', verticalAlign: 'middle', padding: '6px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline' }}>
                        <span style={{ whiteSpace: 'nowrap' }}>8. ចំនួនសមាជិកគ្រួសារក្នុងបន្ទុក:</span>
                        <DottedField value={toKhmerNum(admission.familyMembersCount)} flex="1" />
                      </div>
                    </td>
                    <td style={{ border: '1px solid #000', verticalAlign: 'middle', padding: '6px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline' }}>
                        <span style={{ whiteSpace: 'nowrap' }}>7*. ចម្ងាយផ្លូវធ្វើដំណើរពីលំនៅបច្ចុប្បន្នទៅគ្រឹះស្ថាន:</span>
                        <DottedField value={toKhmerNum(admission.distanceKm)} flex="1" />
                        <span style={{ marginLeft: '4px', fontWeight: 700 }}>KM</span>
                      </div>
                    </td>
                  </tr>

                  {/* Row 5: 9. ស្ថានភាពគ្រួសារ (Left) & 10*. មធ្យោបាយធ្វើដំណើរ (Right) */}
                  <tr>
                    {/* Left: 9. ស្ថានភាពគ្រួសារ */}
                    <td colSpan="2" style={{ border: '1px solid #000', verticalAlign: 'top', padding: '6px 8px' }}>
                      <div style={{ fontWeight: 700, marginBottom: '6px' }}>9. ស្ថានភាពគ្រួសារ:</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '4px' }}>
                        <div><Box checked={admission.maritalStatus === 'alive' || !admission.maritalStatus} label="នៅរស់" /></div>
                        <div><Box checked={admission.maritalStatus === 'married'} label="រៀបការរួច" /></div>
                        <div><Box checked={admission.maritalStatus === 'divorced'} label="លែងលះ" /></div>
                        <div><Box checked={admission.maritalStatus === 'widowed'} label="មេម៉ាយ/ពោះម៉ាយ" /></div>
                      </div>
                    </td>

                    {/* Right: 10*. មធ្យោបាយធ្វើដំណើរ (2-column table grid matching Word LTSC PDF) */}
                    <td style={{ border: '1px solid #000', verticalAlign: 'top', padding: '3px 2px' }}>
                      <div style={{ fontWeight: 700, marginBottom: '2px', paddingLeft: '3px', fontSize: 'inherit' }}>10*. មធ្យោបាយធ្វើដំណើរ៖</div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: 'inherit', letterSpacing: '-0.3px', lineHeight: 1.3, tableLayout: 'fixed' }}>
                        <colgroup>
                          <col style={{ width: '50.5%' }} />
                          <col style={{ width: '49.5%' }} />
                        </colgroup>
                        <tbody>
                          <tr>
                            <td style={{ border: '1px solid #000', padding: '2.5px 3px', verticalAlign: 'top', overflow: 'hidden' }}>
                              <CommuteOption
                                checked={admission.commuteMethod === 'taxi_paid'}
                                line1="ម៉ូតូឌុប(ចំណាយលុយផ្ទាល់"
                                line2="ខ្លួន)"
                              />
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2.5px 3px', verticalAlign: 'top', overflow: 'hidden' }}>
                              <CommuteOption
                                checked={admission.commuteMethod === 'institute_free'}
                                line1="មធ្យោបាយធ្វើដំណើរផ្តល់ដោយ"
                                line2="គ្រឹះស្ថាន(ឥតគិតថ្លៃ)"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid #000', padding: '2.5px 3px', verticalAlign: 'top', overflow: 'hidden' }}>
                              <CommuteOption
                                checked={admission.commuteMethod === 'own_motorcycle'}
                                line1="ម៉ូតូផ្ទាល់ខ្លួន"
                              />
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2.5px 3px', verticalAlign: 'top', overflow: 'hidden' }}>
                              <CommuteOption
                                checked={admission.commuteMethod === 'community_free'}
                                line1="មធ្យោបាយធ្វើដំណើរផ្តល់ដោយ"
                                line2="សហគមន៍(ឥតគិតថ្លៃ)"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid #000', padding: '2.5px 3px', verticalAlign: 'top', overflow: 'hidden' }}>
                              <CommuteOption
                                checked={admission.commuteMethod === 'public_paid'}
                                line1="មធ្យោបាយធ្វើដំណើរសាធារណៈ"
                                line2="(ចំណាយលុយផ្ទាល់ខ្លួន)"
                              />
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2.5px 3px', verticalAlign: 'top', overflow: 'hidden' }}>
                              <CommuteOption
                                checked={admission.commuteMethod === 'walking'}
                                line1="ថ្មើរជើង"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid #000', padding: '2.5px 3px', verticalAlign: 'top', overflow: 'hidden' }}>
                              <CommuteOption
                                checked={admission.commuteMethod === 'bicycle'}
                                line1="កង់"
                              />
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2.5px 3px', verticalAlign: 'top', overflow: 'hidden' }}>
                              <CommuteOption
                                checked={!['own_motorcycle','taxi_paid','walking','bicycle','institute_free','community_free','public_paid'].includes(admission.commuteMethod)}
                                line1="ផ្សេងៗ"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  {/* Row 6: 11. ទីកន្លែងកំណើត */}
                  <tr>
                    <td colSpan="3" style={{ border: '1px solid #000', padding: '6px 10px' }}>
                      <div>11. ទីកន្លែងកំណើត៖</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', alignItems: 'baseline', marginTop: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline' }}><span>ភូមិ</span><DottedField value={pobVillage} flex="1" /></div>
                        <div style={{ display: 'flex', alignItems: 'baseline' }}><span>ឃុំ/សង្កាត់</span><DottedField value={pobCommune} flex="1" /></div>
                        <div style={{ display: 'flex', alignItems: 'baseline' }}><span>ស្រុក/ខណ្ឌ</span><DottedField value={pobDistrict} flex="1" /></div>
                        <div style={{ display: 'flex', alignItems: 'baseline' }}><span>ខេត្ត/ក្រុង</span><DottedField value={pobProvince} flex="1" /></div>
                      </div>
                    </td>
                  </tr>

                  {/* Row 7: 12. ទីលំនៅអចិន្ត្រៃយ៍ */}
                  <tr>
                    <td colSpan="3" style={{ border: '1px solid #000', padding: '6px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline' }}>
                        <span>12. ទីលំនៅអចិន្ត្រៃយ៍៖ ផ្ទះលេខ</span><DottedField value={currentHouse} flex="0.7" />
                        <span style={{ marginLeft: '6px' }}>ផ្លូវ</span><DottedField value={currentStreet} flex="0.8" />
                        <span style={{ marginLeft: '6px' }}>ក្រុម</span><DottedField value={currentGroup} flex="0.6" />
                        <span style={{ marginLeft: '6px' }}>ភូមិ</span><DottedField value={currentVillage} flex="1.2" />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', alignItems: 'baseline', marginTop: '5px' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline' }}><span>ឃុំ/សង្កាត់</span><DottedField value={currentCommune} flex="1" /></div>
                        <div style={{ display: 'flex', alignItems: 'baseline' }}><span>ស្រុក/ខណ្ឌ</span><DottedField value={currentDistrict} flex="1" /></div>
                        <div style={{ display: 'flex', alignItems: 'baseline' }}><span>ខេត្ត/ក្រុង</span><DottedField value={currentProvince} flex="1" /></div>
                      </div>
                    </td>
                  </tr>

                  {/* Row 8: 13. អាណាព្យាបាល ឬសាច់ញាតិ */}
                  <tr>
                    <td colSpan="3" style={{ border: '1px solid #000', padding: '6px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline' }}>
                        <span>13. អាណាព្យាបាល ឬសាច់ញាតិ៖ ឈ្មោះ៖</span>
                        <DottedField value={admission.guardianName} flex="1.2" />
                        <span style={{ marginLeft: '10px' }}>លេខទូរស័ព្ទ</span>
                        <DottedField value={admission.guardianPhone} flex="1" />
                        <span style={{ marginLeft: '10px' }}>អ៊ីម៉ែល</span>
                        <DottedField value={admission.guardianEmail} flex="1.1" />
                      </div>
                      <div style={{ marginTop: '5px' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', fontSize: '8.2pt', whiteSpace: 'nowrap' }}>
                          <span style={{ whiteSpace: 'nowrap' }}>ទីលំនៅរបស់អាណាព្យាបាល ឬសាច់ញាតិ ប្រសិនបើសិនខុសពីទីលំនៅអចិន្ត្រៃយ៍៖ ផ្ទះលេខ</span>
                          <DottedField value={guardianHouse} flex="0.7" />
                          <span style={{ marginLeft: '6px', whiteSpace: 'nowrap' }}>ផ្លូវ</span>
                          <DottedField value={guardianStreet} flex="0.8" />
                          <span style={{ marginLeft: '6px', whiteSpace: 'nowrap' }}>ក្រុម</span>
                          <DottedField value={guardianGroup} flex="0.6" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', alignItems: 'baseline', marginTop: '5px' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline' }}><span>ភូមិ</span><DottedField value={guardianVillage} flex="1" /></div>
                          <div style={{ display: 'flex', alignItems: 'baseline' }}><span>ឃុំ/សង្កាត់</span><DottedField value={guardianCommune} flex="1" /></div>
                          <div style={{ display: 'flex', alignItems: 'baseline' }}><span>ស្រុក/ខណ្ឌ</span><DottedField value={guardianDistrict} flex="1" /></div>
                          <div style={{ display: 'flex', alignItems: 'baseline' }}><span>ខេត្ត/ក្រុង</span><DottedField value={guardianProvince} flex="1" /></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ fontSize: '7.8pt', color: '#000', marginTop: '6px', marginBottom: '2px' }}>
                ចំណុច * សូមបំពេញព័ត៌មានដោយមិនអាចខ្វះបាន
              </div>
            </div>

            <Fr02Footer pageNum="២" />
          </div>
        )}

        {/* =======================================================================
            PAGE 3 OF 5: ផ្នែក (B), (C), (D) (LANDSCAPE A4 297mm x 210mm)
            ======================================================================= */}
        {(printMode === 'all' || printMode === 'p3_p4' || printMode === 'full_form') && (
          <div className="fr02-page-3">
            <div>
              {/* (B) កម្រិតវប្បធម៌ទូទៅ */}
              <div className="fr02-header-gray">
                (B) កម្រិតវប្បធម៌ទូទៅ
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', borderTop: 'none', fontSize: '8.2pt', marginBottom: '3px' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '50%', borderRight: '1px solid #000', padding: '3px 8px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline' }}>
                        <span>14. កម្រិតវប្បធម៌ទូទៅ(ថ្នាក់ទី១ ដល់ថ្នាក់ទី១២)៖</span>
                        <DottedField value={admission.educationLevel || 'ថ្នាក់ទី១២ (បាក់ឌុប)'} flex="1" />
                      </div>
                      <div style={{ fontSize: '7.5pt', color: '#334155' }}>(សូមបំពេញលេខ ០ ក្នុងករណីអក្ខរកម្ម)</div>
                    </td>
                    <td style={{ width: '50%', padding: '3px 8px', verticalAlign: 'top' }}>
                      <div>15. តើអ្នកកំពុងសិក្សាថ្នាក់វប្បធម៌ទូទៅនេះដែរឬទេ?</div>
                      <div style={{ marginTop: '2px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <Box checked={admission.isStudyingGeneral} label="បាទ/ចាស" />
                        <span style={{ display: 'flex', alignItems: 'baseline' }}>
                          <Box checked={!admission.isStudyingGeneral} label="ទេ/ បញ្ចប់ការសិក្សាឆ្នាំ" />
                          <DottedField value={admission.schoolGraduationYear || '២០២៤'} width="65px" />
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* (C) ការអប់រំ និងបណ្តុះបណ្តាល */}
              <div className="fr02-header-gray">
                (C) ការអប់រំ និងបណ្តុះបណ្តាល
              </div>
              <div style={{ border: '1px solid #000', borderTop: 'none', borderBottom: 'none', padding: '2px 8px', fontSize: '7.8pt', textAlign: 'justify' }}>
                16. សូមសរសេរឈ្មោះកម្មវិធី/វគ្គបណ្តុះបណ្តាលដែលអ្នកបានបញ្ចប់ ដោយបញ្ជាក់ពីឈ្មោះសាលា ទីកន្លែង និងឆ្នាំដែលបានបញ្ចប់។ រួចគូសសញ្ញា(✓)ក្នុងប្រអប់ដែលបញ្ជាក់ពីកម្រិតសិក្សានៃវគ្គនោះ។ TVET មានន័យថា កម្មវិធីបណ្តុះបណ្តាលដែលស្ថិតនៅក្នុងវិស័យអប់រំបណ្តុះបណ្តាលបច្ចេកទេស និងវិជ្ជាជីវៈ។
              </div>

              {/* Full 14-Column TVET Table in Landscape (Exact 1:1 match with Word layout) */}
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '7.6pt', textAlign: 'center', marginBottom: '3px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th rowSpan="2" style={{ border: '1px solid #000', padding: '2px', width: '20%' }}>ឈ្មោះកម្មវិធី/វគ្គបណ្តុះបណ្តាល</th>
                    <th colSpan="2" style={{ border: '1px solid #000', padding: '2px', width: '8%' }}>TVET</th>
                    <th rowSpan="2" style={{ border: '1px solid #000', padding: '2px', width: '6%' }}>ឆ្នាំបញ្ចប់</th>
                    <th rowSpan="2" style={{ border: '1px solid #000', padding: '2px', width: '4%' }}>វគ្គខ្លី</th>
                    <th rowSpan="2" style={{ border: '1px solid #000', padding: '2px', width: '4.5%' }}>ស.ប.<br/>វិ១</th>
                    <th rowSpan="2" style={{ border: '1px solid #000', padding: '2px', width: '4.5%' }}>ស.ប.<br/>វិ២</th>
                    <th rowSpan="2" style={{ border: '1px solid #000', padding: '2px', width: '4.5%' }}>ស.ប.<br/>វិ៣</th>
                    <th rowSpan="2" style={{ border: '1px solid #000', padding: '2px', width: '9%' }}>សញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស</th>
                    <th rowSpan="2" style={{ border: '1px solid #000', padding: '2px', width: '9%' }}>បរិញ្ញាបត្រ/វិស្វករ</th>
                    <th rowSpan="2" style={{ border: '1px solid #000', padding: '2px', width: '5.5%' }}>អនុបណ្ឌិត</th>
                    <th rowSpan="2" style={{ border: '1px solid #000', padding: '2px', width: '5%' }}>បណ្ឌិត</th>
                    <th rowSpan="2" style={{ border: '1px solid #000', padding: '2px', width: '11%' }}>ឈ្មោះសាលា</th>
                    <th rowSpan="2" style={{ border: '1px solid #000', padding: '2px', width: '9%' }}>ទីកន្លែង</th>
                  </tr>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ border: '1px solid #000', padding: '2px', width: '4%' }}>មែន</th>
                    <th style={{ border: '1px solid #000', padding: '2px', width: '4%' }}>មិនមែន</th>
                  </tr>
                </thead>
                <tbody>
                  {[0, 1, 2, 3, 4].map((idx) => {
                    const prog = (admission.tvetTrainings && admission.tvetTrainings[idx]) || null;
                    return (
                      <tr key={idx} style={{ height: '20px' }}>
                        <td style={{ border: '1px solid #000', textAlign: 'left', padding: '1px 6px' }}>{prog?.programName || ''}</td>
                        <td style={{ border: '1px solid #000' }}>{prog?.isTvet ? '✓' : '□'}</td>
                        <td style={{ border: '1px solid #000' }}>{prog && !prog.isTvet ? '✓' : '□'}</td>
                        <td style={{ border: '1px solid #000' }}>{prog?.gradYear || ''}</td>
                        <td style={{ border: '1px solid #000' }}>{prog?.degreeLevel === 'short_course' ? '✓' : '□'}</td>
                        <td style={{ border: '1px solid #000' }}>{prog?.degreeLevel === 'c1' ? '✓' : '□'}</td>
                        <td style={{ border: '1px solid #000' }}>{prog?.degreeLevel === 'c2' ? '✓' : '□'}</td>
                        <td style={{ border: '1px solid #000' }}>{prog?.degreeLevel === 'c3' ? '✓' : '□'}</td>
                        <td style={{ border: '1px solid #000' }}>{prog?.degreeLevel === 'higher_diploma' ? '✓' : '□'}</td>
                        <td style={{ border: '1px solid #000' }}>{prog?.degreeLevel === 'bachelor' ? '✓' : '□'}</td>
                        <td style={{ border: '1px solid #000' }}>{prog?.degreeLevel === 'master' ? '✓' : '□'}</td>
                        <td style={{ border: '1px solid #000' }}>{prog?.degreeLevel === 'phd' ? '✓' : '□'}</td>
                        <td style={{ border: '1px solid #000', textAlign: 'left', padding: '1px 4px' }}>{prog?.schoolName || ''}</td>
                        <td style={{ border: '1px solid #000', textAlign: 'left', padding: '1px 4px' }}>{prog?.location || ''}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* (D) ព័ត៌មានការងារ */}
              <div className="fr02-header-gray">
                (D) ព័ត៌មានការងារ
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', borderTop: 'none', fontSize: '7.8pt' }}>
                <tbody>
                  {/* Row 1: 17, 18, 19, 20, 21 */}
                  <tr>
                    {/* 17. ស្ថានភាពការងារ */}
                    <td style={{ width: '16%', borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '3px 6px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 800 }}>17*. ស្ថានភាពការងារ</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '3px' }}>
                        <Box checked={admission.employmentStatus === 'unemployed'} label="គ្មានការងារធ្វើ" />
                        <Box checked={admission.employmentStatus === 'full_time'} label="មានការងារពេញម៉ោង" />
                        <Box checked={admission.employmentStatus === 'contract'} label="ការងារជាប់កិច្ចសន្យា" />
                        <div style={{ fontSize: '7.2pt', color: '#000', paddingLeft: '14px' }}>(កម្មករបណ្តែត)</div>
                      </div>
                    </td>

                    {/* 18. តើការងាររបស់អ្នកជាអ្វី? */}
                    <td style={{ width: '20%', borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '3px 6px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 800 }}>18. តើការងាររបស់អ្នកជាអ្វី?</div>
                      <div style={{ borderBottom: '1px dotted #000', width: '100%', height: '14px', marginTop: '16px' }}></div>
                    </td>

                    {/* 19. ប្រភេទនៃប្រាក់កម្រៃការងារ (2 columns) */}
                    <td style={{ width: '38%', borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '3px 6px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 800, marginBottom: '2px' }}>19. ប្រភេទនៃប្រាក់កម្រៃការងារ</div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '7.5pt' }}>
                        <tbody>
                          <tr>
                            <td style={{ border: '1px solid #000', padding: '1px 4px', width: '38%' }}>
                              <Box checked={false} label="តាមម៉ោង" />
                            </td>
                            <td style={{ border: '1px solid #000', padding: '1px 4px', width: '62%' }}>
                              <Box checked={false} label="តាមចំនួនការងារដែលនិយោជិតបានធ្វើ" />
                            </td>
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid #000', padding: '1px 4px' }}>
                              <Box checked={false} label="ប្រចាំថ្ងៃ" />
                            </td>
                            <td style={{ border: '1px solid #000', padding: '1px 4px' }}>
                              <Box checked={false} label="កម្រៃជើងសារ" />
                            </td>
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid #000', padding: '1px 4px' }}>
                              <Box checked={false} label="ប្រចាំសប្តាហ៍" />
                            </td>
                            <td style={{ border: '1px solid #000', padding: '1px 4px' }}>
                              <Box checked={false} label="ប្រាក់ចំណេញ" />
                            </td>
                          </tr>
                          <tr>
                            <td style={{ border: '1px solid #000', padding: '1px 4px' }}>
                              <Box checked={false} label="ប្រចាំខែ" />
                            </td>
                            <td style={{ border: '1px solid #000', padding: '1px 4px' }}>
                              <Box checked={false} label="ផ្សេងៗ" />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>

                    {/* 20 & 21. ប្រាក់ចំណូល */}
                    <td style={{ width: '26%', borderBottom: '1px solid #000', padding: '3px 6px', verticalAlign: 'top' }}>
                      <div>
                        <span style={{ fontWeight: 800 }}>20*. ប្រាក់ចំណូល ផ្ទាល់ខ្លួន ប្រចាំខែ</span>
                        <div style={{ borderBottom: '1px dotted #000', width: '100%', height: '14px', marginTop: '6px' }}></div>
                      </div>
                      <div style={{ borderTop: '1px solid #000', marginTop: '8px', paddingTop: '4px' }}>
                        <span style={{ fontWeight: 800 }}>21*. ប្រាក់ចំណូល គ្រួសារ ប្រចាំខែ</span>
                        <div style={{ borderBottom: '1px dotted #000', width: '100%', height: '14px', marginTop: '6px' }}></div>
                      </div>
                    </td>
                  </tr>

                  {/* Row 2: 22. ប្រភេទការងារ (5 bordered sub-boxes) */}
                  <tr>
                    <td colSpan="4" style={{ borderBottom: '1px solid #000', padding: '3px 6px' }}>
                      <div style={{ fontWeight: 800, marginBottom: '2px' }}>22. ប្រភេទការងារ</div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '7.6pt' }}>
                        <tbody>
                          <tr>
                            <td style={{ border: '1px solid #000', padding: '2px 4px', width: '25%' }}>
                              <Box checked={false} label="បុគ្គលិកទទួលប្រាក់ឈ្នួលប្រចាំថ្ងៃ" />
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 4px', width: '12%' }}>
                              <Box checked={false} label="ថៅកែ" />
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 4px', width: '18%' }}>
                              <Box checked={false} label="រកស៊ីដោយខ្លួនឯង" />
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 4px', width: '33%' }}>
                              <Box checked={false} label="ធ្វើការឱ្យគ្រួសារដោយគ្មានប្រាក់ឈ្នួល" />
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 4px', width: '12%' }}>
                              <Box checked={false} label="ផ្សេងៗ" />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  {/* Row 3: សម្រាប់មន្ត្រីវិទ្យាស្ថាន */}
                  <tr>
                    <td colSpan="4" style={{ padding: '3px 8px', background: '#fafafa' }}>
                      <div className="fr02-muol" style={{ textAlign: 'center', fontSize: '8pt', marginBottom: '2px' }}>
                        សម្រាប់មន្ត្រីវិទ្យាស្ថាន៖
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '32px', fontSize: '7.8pt' }}>
                        <span>តើសិក្ខាកាមមានទិន្នន័យក្នុងប្រព័ន្ធព័ត៌មានហើយឬនៅ?</span>
                        <Box checked={false} label="គ្មាន" />
                        <span style={{ display: 'flex', alignItems: 'baseline' }}>
                          <Box checked={false} label="មាន ID:" />
                          <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', width: '110px' }}>&nbsp;</span>
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ fontSize: '7.8pt', color: '#000', marginTop: '3px' }}>
                ចំណុច * សូមបំពេញព័ត៌មានដោយមិនអាចខ្វះបាន
              </div>
            </div>

            <Fr02Footer pageNum="៣" isLandscape={true} />
          </div>
        )}

        {/* =======================================================================
            PAGE 4 OF 5: ផ្នែក (E) ការបញ្ចេញព័ត៌មានដោយស្ម័គ្រចិត្ត (LANDSCAPE A4)
            ======================================================================= */}
        {(printMode === 'all' || printMode === 'p3_p4' || printMode === 'full_form') && (
          <div className="fr02-page-4">
            <div>
              {/* (E) ការបញ្ចេញព័ត៌មានដោយស្ម័គ្រចិត្ត */}
              <div className="fr02-header-gray">
                ( E ) ការបញ្ចេញព័ត៌មានដោយស្ម័គ្រចិត្ត
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', borderTop: 'none', fontSize: '8.2pt', marginBottom: '4px' }}>
                <tbody>
                  {/* Row 1: Obstacle & Orphan */}
                  <tr>
                    <td style={{ width: '70%', borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '3px 8px', verticalAlign: 'top' }}>
                      <div>តើមូលហេតុអ្វីដែលរារាំងអ្នកមិនឱ្យចូលធ្វើការងារ មុនពេលចូលរៀនវគ្គនេះ?</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: '3px' }}>
                        <Box checked={admission.workObstacle === 'disability'} label="ពិការ/អសមត្ថភាព" />
                        <Box checked={admission.workObstacle === 'illness'} label="មានជំងឺ" />
                        <Box checked={admission.workObstacle === 'studying'} label="ជាប់រៀន" />
                        <Box checked={admission.workObstacle === 'housework'} label="ធ្វើកិច្ចការផ្ទះ" />
                        <Box checked={admission.workObstacle === 'elderly'} label="ចាស់ជរា/ចូលនិវត្តន៍" />
                        <Box checked={admission.workObstacle === 'other'} label="ផ្សេងៗ" />
                      </div>
                    </td>
                    <td style={{ width: '30%', borderBottom: '1px solid #000', padding: '3px 8px', verticalAlign: 'top' }}>
                      <div>ប្រសិនបើអ្នកជាក្មេងកំព្រា សូមគូសខាងក្រោម៖</div>
                      <div style={{ marginTop: '3px' }}>
                        <Box checked={admission.isOrphan} label="បាទ/ចាស" />
                      </div>
                    </td>
                  </tr>

                  {/* Row 2: Disability */}
                  <tr>
                    <td colSpan="2" style={{ borderBottom: '1px solid #000', padding: '3px 8px', verticalAlign: 'top' }}>
                      <div>ប្រសិនបើអ្នកពិការ/អសមត្ថភាព សូមផ្តល់ព័ត៌មានលម្អិតដូចខាងក្រោម៖</div>
                      <div style={{ display: 'flex', marginTop: '3px' }}>
                        <div style={{ width: '62%' }}>
                          <div>តើអ្នកមានពិការភាពក្នុងប្រភេទណាមួយ?</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 14px', marginTop: '2px' }}>
                            <Box checked={admission.disabilityType === 'vision'} label="ការមើល" />
                            <Box checked={admission.disabilityType === 'speech'} label="ការនិយាយ" />
                            <Box checked={admission.disabilityType === 'hearing'} label="ការស្តាប់" />
                            <Box checked={admission.disabilityType === 'movement'} label="ការធ្វើចលនា" />
                            <Box checked={admission.disabilityType === 'mental'} label="សតិអារម្មណ៍" />
                          </div>
                        </div>
                        <div style={{ width: '38%' }}>
                          <div>តើអ្នកមានពិការភាពតាំងពីពេលណាមក</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                            <Box checked={admission.disabilitySince === 'birth'} label="តាំងពីកំណើត" />
                            <Box checked={admission.disabilitySince === 'after_birth'} label="ក្រោយកំណើត" />
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Row 3: Ethnic Minorities (6 cols x 3 rows) */}
                  <tr>
                    <td colSpan="2" style={{ padding: '3px 8px', verticalAlign: 'top' }}>
                      <div>ប្រសិនអ្នកជាជនជាតិដើមភាគតិច សូមគូសលើឈ្មោះជនជាតិរបស់អ្នកខាងក្រោម៖</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '2px 4px', marginTop: '3px', fontSize: '7.8pt' }}>
                        <Box checked={admission.ethnicity === 'ព្រៅ'} label="ព្រៅ(Brao)" />
                        <Box checked={admission.ethnicity === 'ចារាយ'} label="ចារាយ(Jarai)" />
                        <Box checked={admission.ethnicity === 'កាចាក់'} label="កាចាក់(Kachac)" />
                        <Box checked={admission.ethnicity === 'ក្លឹង'} label="ក្លឹង(Kleung)" />
                        <Box checked={admission.ethnicity === 'ក្រោល'} label="ក្រោល(Kraol)" />
                        <Box checked={admission.ethnicity === 'ក្រាវែត'} label="ក្រាវែត(Kravet)" />

                        <Box checked={admission.ethnicity === 'គ្រឹង'} label="គ្រឹង(Kreung)" />
                        <Box checked={admission.ethnicity === 'គុយ'} label="គុយ(Kuy)" />
                        <Box checked={admission.ethnicity === 'លុន'} label="លុន(Lun)" />
                        <Box checked={admission.ethnicity === 'មែល'} label="មែល(Mel)" />
                        <Box checked={admission.ethnicity === 'ភ្នង'} label="ភ្នង(Phnong)" />
                        <Box checked={admission.ethnicity === 'ព័រ'} label="ព័រ(Poar)" />

                        <Box checked={admission.ethnicity === 'រ៉ាដេ'} label="រ៉ាដេ(Rhade)" />
                        <Box checked={admission.ethnicity === 'រ៉ុង'} label="រ៉ុង(Roong)" />
                        <Box checked={admission.ethnicity === 'ស្ទៀង'} label="ស្ទៀង(Stieng)" />
                        <Box checked={admission.ethnicity === 'ទំពួន'} label="ទំពួន(Tampuon)" />
                        <Box checked={admission.ethnicity === 'ថ្មួន'} label="ថ្មួន(Thmaun)" />
                        <Box checked={admission.ethnicity === 'other'} label="ផ្សេងៗ(Other)" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Pledge Title & 2 full continuous dotted lines */}
              <div style={{ textAlign: 'center', margin: '4px 0 2px' }}>
                <div className="fr02-muol" style={{ fontSize: '9.8pt' }}>
                  កិច្ចសន្យាទទួលខុសត្រូវចំពោះប្រវត្តិរូបខាងលើនេះ៖
                </div>
              </div>
              <div style={{ borderBottom: '1px dotted #000', width: '100%', height: '14px', marginBottom: '2px' }}></div>
              <div style={{ borderBottom: '1px dotted #000', width: '100%', height: '14px', marginBottom: '6px' }}></div>

              {/* Signatures Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginTop: '2px' }}>
                {/* Left: Guardian Confirmation (WITH FULL BORDER BOX like Word) */}
                <div style={{
                  width: '49%',
                  border: '1px solid #000',
                  padding: '5px 8px',
                  fontSize: '8pt',
                  boxSizing: 'border-box'
                }}>
                  <div className="fr02-muol" style={{ textAlign: 'center', fontSize: '8.8pt', marginBottom: '3px' }}>
                    សេចក្តីបញ្ជាក់របស់មាតាបិតា ឬអាណាព្យាបាល
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <span style={{ whiteSpace: 'nowrap' }}>ខ្ញុំបាទ/នាងខ្ញុំឈ្មោះ៖</span>
                    <DottedField value={admission.guardianName} flex="1" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '2px' }}>
                    <span style={{ whiteSpace: 'nowrap' }}>ត្រូវជា</span>
                    <DottedField value={admission.guardianRelation || 'អាណាព្យាបាល'} width="65px" />
                    <span style={{ marginLeft: '4px', whiteSpace: 'nowrap' }}>របស់សិស្សឈ្មោះ</span>
                    <DottedField value={admission.khmerName} flex="1" />
                    <span style={{ marginLeft: '4px', whiteSpace: 'nowrap' }}>លេខទូរស័ព្ទ៖</span>
                    <DottedField value={admission.guardianPhone} flex="1" />
                  </div>
                  <div style={{ textAlign: 'justify', marginTop: '2px' }}>
                    សូមបញ្ជាក់ថា សេចក្តីរាយការណ៍ក្នុងប្រវត្តិរូបនេះពិតជាត្រឹមត្រូវឥតមានការកែច្នៃឡើយ។
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '3px' }}>
                    <div>ថ្ងៃ.......................ខែ............ឆ្នាំ.....................ព.ស.២៥..…</div>
                    <div>សៀមរាប ថ្ងៃទី..............ខែ..............ឆ្នាំ២០២...</div>
                    <div style={{ fontWeight: 800, marginTop: '2px' }}>ស្នាមមេដៃមាតាបិតា ឬអាណាព្យាបាល</div>
                    <div style={{ height: '26px' }}></div>
                  </div>
                </div>

                {/* Right: Applicant Signature */}
                <div style={{
                  width: '49%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  fontSize: '8.2pt',
                  paddingTop: '8px'
                }}>
                  <div>ថ្ងៃ............................ខែ...................ឆ្នាំ.............. ព.ស ២៥..…</div>
                  <div>សៀមរាប ថ្ងៃទី {toKhmerNum(today.day)} ខែ {toKhmerNum(today.month)} ឆ្នាំ {toKhmerNum(today.year)}</div>
                  <div style={{ fontWeight: 800, marginTop: '4px' }}>ហត្ថលេខាសាមីខ្លួន</div>
                  <div style={{ height: '36px' }}></div>
                  <div style={{ fontWeight: 800 }}>{admission.khmerName}</div>
                </div>
              </div>

              <div style={{ fontSize: '7.8pt', color: '#000', marginTop: '4px' }}>
                ចំណុច * សូមបំពេញព័ត៌មានដោយមិនអាចខានបាន
              </div>
            </div>

            <Fr02Footer pageNum="៤" isLandscape={true} />
          </div>
        )}

        {/* =======================================================================
            PAGE 5 OF 5: បង្កាន់ដៃទទួលពាក្យ (PORTRAIT A4 - 2 IDENTICAL HALVES)
            ======================================================================= */}
        {(printMode === 'voucher' || printMode === 'all') && (() => {
          const renderVoucherHalf = (isTop) => (
            <div style={{
              height: '141mm',
              maxHeight: '141mm',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box'
            }}>
              <div>
                {/* Header (matching official Word layout) */}
                <div style={{ position: 'relative', minHeight: '27mm', marginBottom: '1px' }}>
                  {/* Top Center: Kingdom & Motto */}
                  <div style={{ textAlign: 'center', width: '100%', paddingTop: '0px' }}>
                    <div className="fr02-muol" style={{ fontSize: '10.5pt', lineHeight: 1.25 }}>ព្រះរាជាណាចក្រកម្ពុជា</div>
                    <div className="fr02-muol" style={{ fontSize: '9pt', lineHeight: 1.25, marginTop: '1px' }}>ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
                    <RoyalDivider />
                  </div>

                  {/* Left: Ministry & Institute (single line each) */}
                  <div style={{ position: 'absolute', top: '8.5mm', left: 0 }}>
                    <div className="fr02-muol" style={{ fontSize: '8.2pt', lineHeight: 1.3, whiteSpace: 'nowrap' }}>
                      ក្រសួងការងារ និងបណ្តុះបណ្តាលវិជ្ជាជីវៈ
                    </div>
                    <div className="fr02-muol" style={{ fontSize: '8.2pt', lineHeight: 1.3, marginTop: '1px', whiteSpace: 'nowrap' }}>
                      វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប
                    </div>
                  </div>

                  {/* Right: 4x6 Box */}
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    right: 0,
                    width: '19mm',
                    height: '25mm',
                    border: '1px solid #000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    fontSize: '7.5pt',
                    color: '#000',
                    overflow: 'hidden'
                  }}>
                    {admission.photoUrl ? (
                      <img src={admission.photoUrl} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ lineHeight: 1.25 }}>រូបថត<br/>៤ x ៦</div>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div style={{ textAlign: 'center', margin: '2px 0 4px' }}>
                  <div className="fr02-muol" style={{ fontSize: '11.5pt', margin: 0, color: '#000000', lineHeight: 1.3 }}>
                    បង្កាន់ដៃទទួលពាក្យ
                  </div>
                </div>

                {/* Fields */}
                <div className="fr02-battambang" style={{ fontSize: '8.4pt', lineHeight: 1.95 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '4.5px' }}>
                    <span style={{ whiteSpace: 'nowrap' }}>គោត្តនាម-នាម៖</span>
                    <DottedField value={admission.khmerName} flex="1.2" />
                    <span style={{ marginLeft: '6px', whiteSpace: 'nowrap' }}>អក្សរឡាតាំង</span>
                    <DottedField value={admission.latinName} flex="1.2" valueStyle={{ textTransform: 'uppercase' }} />
                    <span style={{ marginLeft: '6px', whiteSpace: 'nowrap' }}>ភេទ</span>
                    <DottedField value={admission.gender === 'male' ? 'ប្រុស' : admission.gender === 'female' ? 'ស្រី' : ''} width="45px" />
                    <DottedField flex="1" />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '4.5px' }}>
                    <span style={{ whiteSpace: 'nowrap' }}>ជនជាតិ៖</span>
                    <DottedField value={admission.ethnicity || 'ខ្មែរ'} flex="0.8" />
                    <span style={{ marginLeft: '4px', whiteSpace: 'nowrap' }}>សញ្ជាតិ</span>
                    <DottedField value={admission.nationality || 'កម្ពុជា'} flex="0.8" />
                    <span style={{ marginLeft: '4px', whiteSpace: 'nowrap' }}>សាសនា</span>
                    <DottedField value={admission.religion || 'ព្រះពុទ្ធ'} flex="0.8" />
                    <span style={{ marginLeft: '4px', whiteSpace: 'nowrap' }}>កើតថ្ងៃទី</span>
                    <DottedField value={toKhmerNum(dobParts.day)} width="26px" />
                    <span style={{ margin: '0 2px' }}>ខែ</span>
                    <DottedField value={toKhmerNum(dobParts.month)} width="26px" />
                    <span style={{ margin: '0 2px' }}>ឆ្នាំ</span>
                    <DottedField value={toKhmerNum(dobParts.year)} width="45px" />
                    <DottedField flex="1" />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '4.5px' }}>
                    <span style={{ whiteSpace: 'nowrap' }}>អាសយដ្ឋានបច្ចុប្បន្ន៖</span>
                    <DottedField value={fullCurrentAddress} flex="1" />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '4.5px' }}>
                    <span style={{ whiteSpace: 'nowrap' }}>លេខទូរស័ព្ទផ្ទាល់ខ្លួន៖</span>
                    <DottedField value={admission.phone} flex="1" />
                    <span style={{ marginLeft: '6px', whiteSpace: 'nowrap' }}>លេខទូរស័ព្ទអាណាព្យាបាល</span>
                    <DottedField value={admission.guardianPhone} flex="1" />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '4.5px' }}>
                    <span style={{ whiteSpace: 'nowrap' }}>កម្រិតវប្បធម៌៖</span>
                    <DottedField value={admission.educationLevel || 'បាក់ឌុប'} flex="1" />
                    <span style={{ marginLeft: '4px', whiteSpace: 'nowrap' }}>ឆ្នាំ</span>
                    <DottedField value={toKhmerNum(admission.schoolGraduationYear || '២០២៤')} width="45px" />
                    <span style={{ marginLeft: '4px', whiteSpace: 'nowrap' }}>សាលា</span>
                    <DottedField value={admission.previousSchool} flex="1.2" />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '4.5px' }}>
                    <span style={{ whiteSpace: 'nowrap' }}>កម្រិតសិក្សា៖</span>
                    <DottedField value={degreeKhmer} flex="1.2" />
                    <span style={{ marginLeft: '4px', whiteSpace: 'nowrap' }}>ឆ្នាំទី</span>
                    <DottedField value={toKhmerNum(admission.studyYear || '១')} width="26px" />
                    <span style={{ marginLeft: '4px', whiteSpace: 'nowrap' }}>ឆ្នាំសិក្សា</span>
                    <DottedField value={toKhmerNum(admission.academicYear || '២០២៦-២០២៧')} flex="1" />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '3px' }}>
                    <span style={{ whiteSpace: 'nowrap' }}>ជំនាញឯកទេស៖</span>
                    <DottedField value={admission.major} flex="1" />
                    <span style={{ marginLeft: '6px', whiteSpace: 'nowrap' }}>វេនសិក្សា៖</span>
                    <Box checked={isShiftMorning} label="ចន្ទ-សុក្រ(ព្រឹក)" style={{ marginLeft: '4px' }} />
                    <Box checked={isShiftAfternoon} label="ចន្ទ-សុក្រ(រសៀល)" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '3px', marginBottom: '8px' }}>
                    <Box checked={isShiftBoth} label="ចន្ទ-សុក្រ(ព្រឹក-រសៀល)" />
                    <Box checked={isShiftEvening} label="ចន្ទ-សុក្រ(យប់)" />
                    <Box checked={isShiftWeekend} label="សៅរ៍-អាទិត្យ(ព្រឹក-រសៀល)" />
                  </div>

                  {/* Signatures */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', marginTop: '12px', fontSize: '8pt', lineHeight: 1.5 }}>
                    <div style={{ width: '46%' }}>
                      <div>ថ្ងៃ....................ខែ...............ឆ្នាំ........... ព.ស ២៥..…</div>
                      <div>សៀមរាប ថ្ងៃទី {toKhmerNum(today.day)} ខែ {toKhmerNum(today.month)} ឆ្នាំ {toKhmerNum(today.year)}</div>
                      <div style={{ fontWeight: 800, marginTop: '4px' }}>ហត្ថលេខា/ឈ្មោះអ្នកទទួលពាក្យ</div>
                      <div style={{ height: '26px' }}></div>
                      <div style={{ fontWeight: 800 }}>ការិយាល័យ ETO</div>
                    </div>
                    <div style={{ width: '46%' }}>
                      <div>ថ្ងៃ....................ខែ...............ឆ្នាំ........... ព.ស ២៥..…</div>
                      <div>សៀមរាប ថ្ងៃទី {toKhmerNum(today.day)} ខែ {toKhmerNum(today.month)} ឆ្នាំ {toKhmerNum(today.year)}</div>
                      <div style={{ fontWeight: 800, marginTop: '4px' }}>ហត្ថលេខា/ឈ្មោះសាមីខ្លួន</div>
                      <div style={{ height: '26px' }}></div>
                      <div style={{ fontWeight: 800 }}>{admission.khmerName}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '2px' }}>
                <Fr02Footer pageNum="៥" />
              </div>
            </div>
          );

          return (
            <div className="fr02-page-5">
              {/* ================= PART 1: TOP HALF ================= */}
              {renderVoucherHalf(true)}

              {/* DASHED CUTTING LINE */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '1.5mm 0',
                position: 'relative',
                height: '3mm'
              }}>
                <div style={{ borderTop: '1px dashed #000', width: '100%' }}></div>
                <span style={{
                  position: 'absolute',
                  background: '#fff',
                  padding: '0 8px',
                  fontSize: '6.8pt',
                  fontWeight: 700,
                  color: '#334155'
                }}>
                  ✂ កាត់ត្រង់នេះ (ផ្នែកខាងលើសម្រាប់សិស្ស / ផ្នែកខាងក្រោមសម្រាប់វិទ្យាស្ថានរក្សាទុក)
                </span>
              </div>

              {/* ================= PART 2: BOTTOM HALF ================= */}
              {renderVoucherHalf(false)}
            </div>
          );
        })()}
      </div>
    </div>
  );
  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default PrintableAdmissionForm;
