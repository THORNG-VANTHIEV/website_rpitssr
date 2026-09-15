import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import client from '../api/client';

// Comprehensive sample FAQs covering key institutional areas
const SAMPLE_FAQS = [
  {
    id: 1,
    category: 'courses',
    questionKm: 'តើវិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប មានបណ្តុះបណ្តាលកម្រិតណាខ្លះ?',
    questionEn: 'What training levels and qualifications are offered at RPITSSR?',
    answerKm: 'វិទ្យាស្ថានផ្តល់ការបណ្តុះបណ្តាលចាប់ពីកម្រិតវិញ្ញាបនបត្របច្ចេកទេស និងវិជ្ជាជីវៈ (C1, C2, C3), សញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស (បរិញ្ញាបត្ររង / Associate Degree), និងបរិញ្ញាបត្របច្ចេកវិទ្យា (Bachelor of Technology) លើជំនាញវិស្វកម្ម សំណង់ អគ្គិសនី មេកានិច រថយន្ត បច្ចេកវិទ្យាព័ត៌មាន និងបដិសណ្ឋារកិច្ច។',
    answerEn: 'The Institute offers vocational and higher education programs starting from Technical & Vocational Certificates (C1, C2, C3), Higher Diploma in Technology (Associate Degree), and Bachelor of Technology across Engineering, Civil, Electrical, Automotive, IT, and Hospitality sectors.'
  },
  {
    id: 2,
    category: 'admission',
    questionKm: 'តើនិស្សិតអាចចុះឈ្មោះចូលរៀនតាមរបៀបណា?',
    questionEn: 'How can students apply and register for admission?',
    answerKm: 'បេក្ខជនអាចមកដាក់ពាក្យដោយផ្ទាល់នៅការិយាល័យសិក្សានៃវិទ្យាស្ថាន ឬចុះឈ្មោះតាមប្រព័ន្ធអនឡាញលើគេហទំព័រផ្លូវការ rpitssr.edu.kh ឬតាមរយៈគេហទំព័ររបស់ក្រសួងការងារ និងបណ្តុះបណ្តាលវិជ្ជាជីវៈ ក្នុងរដូវកាលចុះឈ្មោះចូលរៀន។',
    answerEn: 'Applicants can submit documents in person at the Academic Affairs Office or register online via our official website (rpitssr.edu.kh) or the Ministry of Labour and Vocational Training portal during the enrollment season.'
  },
  {
    id: 3,
    category: 'fees',
    questionKm: 'តើមានអាហារូបករណ៍ ១.៥ លាននាក់របស់រាជរដ្ឋាភិបាលដែរឬទេ?',
    questionEn: 'Is the Government 1.5 Million TVET Scholarship Program available?',
    answerKm: 'បាទ/ចាស! វិទ្យាស្ថានជាគ្រឹះស្ថាន TVET សាធារណៈដែលអនុវត្តកម្មវិធីបណ្តុះបណ្តាលជំនាញវិជ្ជាជីវៈ និងបច្ចេកទេស ១.៥ លាននាក់ ដោយឥតគិតថ្លៃសិក្សា ១០០% និងមានប្រាក់ឧបត្ថម្ភប្រចាំខែ ២៨០,០០០ រៀល សម្រាប់យុវជនមកពីគ្រួសារក្រីក្រ និងងាយរងគ្រោះ (កាន់ប័ណ្ណសមធម៌ ឬប័ណ្ណក្រីក្រ)។ សម្រាប់យុវជនទូទៅដែលគ្មានប័ណ្ណក្រីក្រ ក៏ទទួលបានការសិក្សាដោយឥតបង់ថ្លៃសិក្សាផងដែរ។',
    answerEn: 'Yes! RPITSSR is an official public TVET institute delivering the National 1.5 Million Vocational Training Program with 100% tuition-free education and a monthly allowance of 280,000 Riels for youth from poor and vulnerable households (Equity/IDPoor cardholders). General students also study tuition-free.'
  },
  {
    id: 4,
    category: 'facilities',
    questionKm: 'តើវិទ្យាស្ថានមានកន្លែងស្នាក់នៅ (អន្តេវាសិកដ្ឋាន) សម្រាប់សិស្ស-និស្សិតមកពីខេត្តឆ្ងាយដែរឬទេ?',
    questionEn: 'Are dormitory and accommodation facilities available for students from remote areas?',
    answerKm: 'វិទ្យាស្ថានមានអគារអន្តេវាសិកដ្ឋានប្រកបដោយផាសុកភាព និងសុវត្ថិភាពខ្ពស់ ផ្តល់អាទិភាពជូនសិស្ស-និស្សិតនារី និងសិស្ស-និស្សិតដែលមកពីតំបន់ដាច់ស្រយាល ឬខេត្តឆ្ងាយៗ ដើម្បីជួយសម្រួលបន្ទុកការចំណាយរបស់អាណាព្យាបាល។',
    answerEn: 'Yes, RPITSSR provides comfortable, secure, and fully equipped dormitory accommodations on campus, with special priority given to female students and learners traveling from rural or remote provinces.'
  },
  {
    id: 5,
    category: 'courses',
    questionKm: 'តើនិស្សិតបញ្ចប់ការសិក្សាទទួលបានឱកាសការងារយ៉ាងដូចម្តេច?',
    questionEn: 'What are the job prospects and employment opportunities for graduates?',
    answerKm: 'អត្រាការងាររបស់និស្សិតបញ្ចប់ការសិក្សាពី RPITSSR មានលើសពី ៩៥% ដោយសារវិទ្យាស្ថានមានកិច្ចសហការភាពជាដៃគូយ៉ាងជិតស្និទ្ធជាមួយក្រុមហ៊ុន រោងចក្រ សហគ្រាស និងឧស្សាហកម្មជាង ១០០ ទាំងនៅក្នុងប្រទេសកម្ពុជា និងតំបន់ ដើម្បីបញ្ជូននិស្សិតចុះកម្មសិក្សាការងារ (Internship) និងជ្រើសរើសការងារភ្លាមៗ។',
    answerEn: 'Over 95% of RPITSSR graduates secure employment shortly after graduation. The Institute maintains strategic partnerships with more than 100 industrial companies, factories, and corporate enterprises for internship placements and immediate recruitment.'
  },
  {
    id: 6,
    category: 'admission',
    questionKm: 'តើការចុះឈ្មោះចូលរៀនវគ្គបណ្តុះបណ្តាលជំនាញ TVET ១.៥ លាននាក់ តម្រូវឱ្យមានឯកសារអ្វីខ្លះ?',
    questionEn: 'What documents are required to enroll in the 1.5M TVET scholarship program?',
    answerKm: 'ឯកសារតម្រូវរួមមាន៖ ១. សំបុត្រកំណើត ឬអត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរ (ច្បាប់ចម្លង) ២. សៀវភៅគ្រួសារ ឬសៀវភៅស្នាក់នៅ ៣. ប័ណ្ណសមធម៌ ឬប័ណ្ណក្រីក្រ (សម្រាប់ទទួលប្រាក់ឧបត្ថម្ភ ២៨០,០០០ រៀល/ខែ) និង ៤. រូបថត ៤x៦ ចំនួន ៣ សន្លឹក។ ករណីគ្មានប័ណ្ណក្រីក្រ នៅតែអាចចុះឈ្មោះសិក្សាដោយឥតគិតថ្លៃ ១០០%។',
    answerEn: 'Required documents: 1. Copy of Cambodian National ID or Birth Certificate; 2. Family book or residence certificate; 3. Equity / IDPoor card (if applicable, for monthly stipend eligibility); 4. Three 4x6 passport-size photographs. Applicants without IDPoor cards can still study tuition-free.'
  },
  {
    id: 7,
    category: 'courses',
    questionKm: 'តើវិទ្យាស្ថានមានបណ្តុះបណ្តាលថ្នាក់វេនយប់ និងចុងសប្តាហ៍សម្រាប់អ្នកកំពុងបំពេញការងារដែរឬទេ?',
    questionEn: 'Are evening and weekend classes available for working professionals?',
    answerKm: 'បាទ/ចាស! វិទ្យាស្ថានមានបើកថ្នាក់បណ្តុះបណ្តាលវេនយប់ (ច័ន្ទ-សុក្រ ម៉ោង ៥:៣០ ល្ងាច ដល់ ៨:៣០ យប់) និងវេនចុងសប្តាហ៍ (សៅរ៍-អាទិត្យ) សម្រាប់កម្រិតសញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស (បរិញ្ញាបត្ររង) និងបរិញ្ញាបត្របច្ចេកវិទ្យា ដើម្បីផ្តល់ឱកាសដល់អ្នកកំពុងបំពេញការងារអាចបន្តការសិក្សាបង្កើនជំនាញ។',
    answerEn: 'Yes! RPITSSR offers evening classes (Mon-Fri 5:30 PM - 8:30 PM) and weekend classes (Saturday-Sunday) for Associate and Bachelor degree programs to accommodate working adults and career advancers.'
  },
  {
    id: 8,
    category: 'fees',
    questionKm: 'តើថ្លៃសិក្សាសម្រាប់កម្រិតបរិញ្ញាបត្ររង និងបរិញ្ញាបត្របច្ចេកវិទ្យាមានតម្លៃប៉ុន្មាន?',
    questionEn: 'What are the tuition fees for Associate and Bachelor Degree programs?',
    answerKm: 'ថ្លៃសិក្សាមានកម្រិតសមរម្យបំផុតស្របតាមគោលនយោបាយរបស់ក្រសួងការងារ និងបណ្តុះបណ្តាលវិជ្ជាជីវៈ។ ក្រៅពីនេះ វិទ្យាស្ថានមានផ្តល់អាហារូបករណ៍លើកទឹកចិត្តដល់សិស្សពូកែ អាហារូបករណ៍សម្រាប់សិស្សនារី និងអាហារូបករណ៍ឧបត្ថម្ភពីដៃគូអភិវឌ្ឍន៍ជាតិ និងអន្តរជាតិជារៀងរាល់ឆ្នាំ។',
    answerEn: 'Tuition fees are structured affordably in line with public TVET institutional guidelines. In addition, RPITSSR offers academic merit scholarships, scholarships for women in STEM, and partner-funded financial grants every academic year.'
  },
  {
    id: 9,
    category: 'facilities',
    questionKm: 'តើវិទ្យាស្ថានមានបន្ទប់ពិសោធន៍ និងរោងជាងបច្ចេកវិទ្យាអ្វីខ្លះ?',
    questionEn: 'What laboratories, workshops, and engineering facilities are available?',
    answerKm: 'វិទ្យាស្ថានមានរោងជាង និងបន្ទប់ពិសោធន៍ស្តង់ដារទំនើបជាង ១០ រួមមាន៖ រោងជាងមេកានិចទូទៅ និងស្វ័យប្រវត្តិកម្ម, រោងជាងអគ្គិសនី និងថាមពលកកើតឡើងវិញ, បន្ទប់ពិសោធន៍កុំព្យូទ័រ & Networking, រោងជាងជួសជុលរថយន្តទំនើប, បន្ទប់ពិសោធន៍ម៉ាស៊ីនត្រជាក់ និងបរិក្ខារត្រជាក់ឧស្សាហកម្ម, និងបន្ទប់អនុវត្តបដិសណ្ឋារកិច្ច។',
    answerEn: 'RPITSSR features over 10 specialized engineering workshops and labs including Mechanical & Automation, Electrical & Renewable Energy, Computer Networking, Automotive Technology, HVAC Industrial Refrigeration, and Hospitality Simulation Suites.'
  },
  {
    id: 10,
    category: 'admission',
    questionKm: 'តើនិស្សិតទទួលបានការចុះកម្មសិក្សាការងារ (Internship) យ៉ាងដូចម្តេច?',
    questionEn: 'How are internships arranged for graduating students?',
    answerKm: 'មុនពេលបញ្ចប់ការសិក្សា វិទ្យាស្ថានសម្របសម្រួលបញ្ជូននិស្សិតគ្រប់រូបចុះធ្វើកម្មសិក្សាជាក់ស្តែងរយៈពេលពី ៣ ទៅ ៦ ខែ នៅតាមបណ្តាក្រុមហ៊ុន ឧស្សាហកម្ម សហគ្រាស ឬសណ្ឋាគារលំដាប់អន្តរជាតិដែលជាដៃគូសហការ ដើម្បីទទួលបានបទពិសោធន៍ការងារពិតប្រាកដ និងឱកាសការងារភ្លាមៗក្រោយបញ្ចប់ការសិក្សា។',
    answerEn: 'Prior to graduation, RPITSSR coordinates structured 3 to 6-month industrial internship placements at leading corporate, industrial, or multinational partner organizations, providing hands-on experience and direct recruitment paths.'
  }
];

// Khmer numerals conversion helper
const toKhmerNumber = (num) => {
  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return num.toString().split('').map(char => khmerDigits[char] || char).join('');
};

// Soft pastel category badge resolver
const getCategoryBadgeStyle = (catKey) => {
  switch (catKey) {
    case 'admission':
      return { background: '#eff6ff', color: '#1e73be', border: '1px solid #dbeafe' };
    case 'courses':
      return { background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff' };
    case 'fees':
      return { background: '#fefce8', color: '#ca8a04', border: '1px solid #fef08a' };
    case 'facilities':
      return { background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' };
    default:
      return { background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' };
  }
};

export const FaqPage = () => {
  const { t, language, currentLanguage } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState(new Set([1, 33])); // Default open first FAQ
  const [helpfulRatings, setHelpfulRatings] = useState({});

  // Document title
  useEffect(() => {
    document.title = isKhmer
      ? 'សំណួរញឹកញាប់ (FAQ) | RPITSSR'
      : 'FAQ & Knowledge Center | RPITSSR';
  }, [isKhmer]);

  // Fetch FAQs from API with fallback to rich institutional sample FAQs
  useEffect(() => {
    window.scrollTo(0, 0);
    let isMounted = true;

    const fetchFaqs = async () => {
      try {
        setLoading(true);
        const res = await client.get('/faqs');
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);

        if (isMounted) {
          if (data && data.length > 0) {
            // Map data and ensure every FAQ has a valid category
            const mapped = data.map((item) => {
              let cat = item.category || 'general';
              if (!cat || cat === 'general') {
                const q = (item.question || '').toLowerCase();
                if (q.includes('ចុះឈ្មោះ') || q.includes('admission') || q.includes('កម្មសិក្សា') || q.includes('internship') || q.includes('ឯកសារ')) {
                  cat = 'admission';
                } else if (q.includes('អាហារូបករណ៍') || q.includes('ថ្លៃ') || q.includes('scholarship') || q.includes('fee')) {
                  cat = 'fees';
                } else if (q.includes('អន្តេវាសិកដ្ឋាន') || q.includes('រោងជាង') || q.includes('ពិសោធន៍') || q.includes('facility') || q.includes('dormitory')) {
                  cat = 'facilities';
                } else {
                  cat = 'courses';
                }
              }
              return {
                ...item,
                category: cat
              };
            });
            setFaqs(mapped);
            // Open first FAQ id by default
            if (mapped.length > 0) {
              setOpenIds(new Set([mapped[0].id]));
            }
          } else {
            // Fallback to SAMPLE_FAQS
            setFaqs(SAMPLE_FAQS);
            setOpenIds(new Set([SAMPLE_FAQS[0].id]));
          }
        }
      } catch (err) {
        console.error('Failed to load FAQs:', err);
        if (isMounted) {
          setFaqs(SAMPLE_FAQS);
          setOpenIds(new Set([SAMPLE_FAQS[0].id]));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFaqs();

    return () => {
      isMounted = false;
    };
  }, []);

  // Category definitions with bilingual labels and icons
  const categories = useMemo(() => [
    { id: 'all', label: isKhmer ? 'ទាំងអស់' : 'All Questions', icon: 'fas fa-th-large' },
    { id: 'admission', label: isKhmer ? 'ការចូលរៀន & លក្ខខណ្ឌ' : 'Admissions & TVET', icon: 'fas fa-user-graduate' },
    { id: 'courses', label: isKhmer ? 'កម្មវិធី & វគ្គបណ្តុះបណ្តាល' : 'Courses & Programs', icon: 'fas fa-book-open' },
    { id: 'fees', label: isKhmer ? 'អាហារូបករណ៍ & ថ្លៃសិក្សា' : 'Scholarships & Fees', icon: 'fas fa-award' },
    { id: 'facilities', label: isKhmer ? 'រោងជាង & គ្រឿងបរិក្ខារ' : 'Labs & Facilities', icon: 'fas fa-building' }
  ], [isKhmer]);

  // Toggle individual accordion
  const toggleAccordion = useCallback((faqId) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(faqId)) {
        next.delete(faqId);
      } else {
        next.add(faqId);
      }
      return next;
    });
  }, []);

  // Filtered FAQs list
  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesCategory = selectedCategory === 'all' || (faq.category && faq.category.toLowerCase() === selectedCategory.toLowerCase());
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCategory;

      const qText = isKhmer ? (faq.question || faq.questionKm || '') : (faq.questionEn || faq.question || '');
      const aText = isKhmer ? (faq.answer || faq.answerKm || '') : (faq.answerEn || faq.answer || '');

      const matchQ = qText.toLowerCase().includes(query);
      const matchA = aText.toLowerCase().includes(query);

      return matchesCategory && (matchQ || matchA);
    });
  }, [faqs, selectedCategory, searchQuery, isKhmer]);

  // Calculate count per category
  const categoryCounts = useMemo(() => {
    const counts = { all: faqs.length };
    categories.forEach(cat => {
      if (cat.id !== 'all') {
        counts[cat.id] = faqs.filter(f => f.category && f.category.toLowerCase() === cat.id.toLowerCase()).length;
      }
    });
    return counts;
  }, [faqs, categories]);

  // Expand / Collapse all toggle
  const allFilteredOpen = useMemo(() => {
    if (filteredFaqs.length === 0) return false;
    return filteredFaqs.every(f => openIds.has(f.id));
  }, [filteredFaqs, openIds]);

  const handleToggleAll = () => {
    if (allFilteredOpen) {
      // Collapse all
      setOpenIds(new Set());
    } else {
      // Expand all filtered
      const allIds = new Set(filteredFaqs.map(f => f.id));
      setOpenIds(allIds);
    }
  };

  // User feedback handler (Was this helpful?)
  const handleRateHelpful = (faqId, rating) => {
    setHelpfulRatings(prev => ({
      ...prev,
      [faqId]: rating
    }));
  };

  // Get question & answer text by language
  const getQuestionText = (faq) => {
    if (!isKhmer && faq.questionEn) return faq.questionEn;
    return faq.question || faq.questionKm || '';
  };

  const getAnswerText = (faq) => {
    if (!isKhmer && faq.answerEn) return faq.answerEn;
    return faq.answer || faq.answerKm || '';
  };

  // Get localized category name for pill tag
  const getCategoryLabel = (catKey) => {
    const found = categories.find(c => c.id === catKey);
    if (!found) return isKhmer ? 'ទូទៅ' : 'General';
    return found.label;
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* 1. INSTITUTIONAL HERO SECTION (AGENTS.md Daylight Format) */}
      <section className="faq-page-hero">
        <div className="container" style={{ maxWidth: '1140px' }}>
          <div className="row justify-content-center text-center">
            <div className="col-lg-10">
              {/* Breadcrumb & Official Badge */}
              <div className="faq-hero-meta-row">
                <div className="faq-breadcrumb">
                  <Link to="/">
                    <i className="fas fa-home me-1"></i>
                    {isKhmer ? 'ទំព័រដើម' : 'Home'}
                  </Link>
                  <i className="fas fa-chevron-right text-muted" style={{ fontSize: '0.72rem' }}></i>
                  <span>{t('faq.pageTitle') || (isKhmer ? 'សំណួរញឹកញាប់' : 'FAQ')}</span>
                </div>
                <div className="faq-hero-badge">
                  <i className="fas fa-question-circle text-primary"></i>
                  <span>{isKhmer ? 'មជ្ឈមណ្ឌលព័ត៌មាន និងឆ្លើយតបចម្ងល់ស្ថាប័ន' : 'Institutional FAQ & Knowledge Center'}</span>
                </div>
              </div>

              {/* Main Institutional Title */}
              <h1 className="faq-hero-title">
                {isKhmer
                  ? 'សំណួរដែលសួរញឹកញាប់ (FAQ)'
                  : 'Frequently Asked Questions (FAQ)'}
              </h1>

              {/* Subtitle */}
              <p className="faq-hero-subtitle">
                {isKhmer
                  ? 'ស្វែងរកចម្លើយផ្លូវការ និងច្បាស់លាស់អំពីការចុះឈ្មោះចូលរៀន កម្មវិធីបណ្តុះបណ្តាលជំនាញ TVET អាហារូបករណ៍ ១.៥ លាននាក់ ថ្លៃសិក្សា ហេដ្ឋារចនាសម្ព័ន្ធ និងសេវាកម្មសិស្ស-និស្សិតនៃវិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប។'
                  : 'Find verified institutional answers regarding admissions, TVET programs, government 1.5M scholarships, tuition fees, laboratories, dormitory facilities, and student services at RPITSSR.'}
              </p>

              {/* Institutional Trust Badges */}
              <div className="faq-trust-pills">
                <div className="faq-trust-pill">
                  <i className="fas fa-graduation-cap text-warning"></i>
                  <span>{isKhmer ? 'អាហារូបករណ៍ ១០០% និងប្រាក់ឧបត្ថម្ភ' : '100% Scholarships & Allowances'}</span>
                </div>
                <div className="faq-trust-pill">
                  <i className="fas fa-certificate text-primary"></i>
                  <span>{isKhmer ? 'សញ្ញាបត្រជាតិ TVET ទទួលស្គាល់ទូទាំងប្រទេស' : 'Nationally Accredited Diplomas'}</span>
                </div>
                <div className="faq-trust-pill">
                  <i className="fas fa-briefcase text-success"></i>
                  <span>{isKhmer ? 'អត្រាការងារជាង ៩៥%' : '95%+ Graduate Employment'}</span>
                </div>
                <div className="faq-trust-pill">
                  <i className="fas fa-headset text-info"></i>
                  <span>{isKhmer ? 'សេវាប្រឹក្សាយោបល់ការសិក្សា' : 'Dedicated Academic Advisory'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INSTITUTIONAL METRICS STRIP */}
      <section className="faq-metrics-area">
        <div className="container" style={{ maxWidth: '1140px' }}>
          <div className="faq-metrics-grid">
            <div className="faq-metric-card">
              <div className="faq-metric-icon" style={{ background: '#eff6ff', color: '#1e73be', border: '1px solid #dbeafe' }}>
                <i className="fas fa-question"></i>
              </div>
              <div className="faq-metric-info">
                <span className="faq-metric-val">
                  {isKhmer ? `${toKhmerNumber(faqs.length)}+ សំណួរ` : `${faqs.length}+ Questions`}
                </span>
                <span className="faq-metric-lbl">
                  {isKhmer ? 'ចម្លើយផ្លូវការ និងច្បាស់លាស់' : 'Official Verified Answers'}
                </span>
              </div>
            </div>

            <div className="faq-metric-card">
              <div className="faq-metric-icon" style={{ background: '#fefce8', color: '#ca8a04', border: '1px solid #fef08a' }}>
                <i className="fas fa-award"></i>
              </div>
              <div className="faq-metric-info">
                <span className="faq-metric-val">
                  {isKhmer ? '១០០% ឥតគិតថ្លៃ' : '100% Tuition Free'}
                </span>
                <span className="faq-metric-lbl">
                  {isKhmer ? 'អាហារូបករណ៍ TVET ១.៥ លាននាក់' : 'Govt 1.5M TVET Program'}
                </span>
              </div>
            </div>

            <div className="faq-metric-card">
              <div className="faq-metric-icon" style={{ background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}>
                <i className="fas fa-layer-group"></i>
              </div>
              <div className="faq-metric-info">
                <span className="faq-metric-val">
                  {isKhmer ? '០៤ កម្រិតសិក្សា' : '4 Study Tracks'}
                </span>
                <span className="faq-metric-lbl">
                  {isKhmer ? 'C1-C3, បរិញ្ញាបត្ររង និងបច្ចេកវិទ្យា' : 'Certificates to B.Tech'}
                </span>
              </div>
            </div>

            <div className="faq-metric-card">
              <div className="faq-metric-icon" style={{ background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' }}>
                <i className="fas fa-comments"></i>
              </div>
              <div className="faq-metric-info">
                <span className="faq-metric-val">
                  {isKhmer ? 'ឆ្លើយតបរហ័ស' : 'Fast Response'}
                </span>
                <span className="faq-metric-lbl">
                  {isKhmer ? 'តាម Telegram និងទូរស័ព្ទផ្ទាល់' : 'Telegram Channel & Hotline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN FAQ CONTENT AREA */}
      <section style={{ background: '#f8fafc', padding: '50px 0 90px', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container" style={{ maxWidth: '1080px' }}>
          
          {/* Filter & Live Search Card */}
          <div className="faq-filter-card">
            {/* Search Input */}
            <div className="faq-search-wrapper">
              <i className="fas fa-search faq-search-icon"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('faq.searchFAQ') || (isKhmer ? 'ស្វែងរកសំណួរ ឬចម្ងល់របស់អ្នកនៅទីនេះ...' : 'Search questions, keywords, or topics...')}
                className="faq-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="faq-search-clear"
                  title={isKhmer ? 'លុបពាក្យស្វែងរក' : 'Clear Search'}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="faq-category-pills">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const count = categoryCounts[cat.id] || 0;
                const countFormatted = isKhmer ? toKhmerNumber(count) : count;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`faq-cat-pill ${isSelected ? 'active' : ''}`}
                  >
                    <i className={cat.icon} style={{ fontSize: '13px' }}></i>
                    <span>{cat.label}</span>
                    <span className="faq-cat-count">
                      {countFormatted}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Bar (Counter + Expand/Collapse All) */}
          <div className="faq-actions-bar">
            <div className="faq-results-counter">
              <i className="fas fa-list-check text-primary"></i>
              <span>
                {isKhmer
                  ? `បង្ហាញ ${toKhmerNumber(filteredFaqs.length)} នៃ ${toKhmerNumber(faqs.length)} សំណួរ`
                  : `Showing ${filteredFaqs.length} of ${faqs.length} questions`}
              </span>
              {searchQuery && (
                <span style={{ color: '#1e73be', fontWeight: 700 }}>
                  ({isKhmer ? `ពាក្យគន្លឹះ: "${searchQuery}"` : `Keyword: "${searchQuery}"`})
                </span>
              )}
            </div>

            {filteredFaqs.length > 0 && (
              <button
                type="button"
                onClick={handleToggleAll}
                className="faq-toggle-all-btn"
              >
                <i className={allFilteredOpen ? 'fas fa-compress-alt text-primary' : 'fas fa-expand-alt text-primary'}></i>
                <span>
                  {allFilteredOpen
                    ? (isKhmer ? 'បង្រួមទាំងអស់' : 'Collapse All')
                    : (isKhmer ? 'ពង្រីកទាំងអស់' : 'Expand All')}
                </span>
              </button>
            )}
          </div>

          {/* FAQ Accordion List */}
          <div className="faq-accordion-wrap">
            {loading ? (
              <div className="text-center py-5">
                <div style={{
                  border: '4px solid #e2e8f0',
                  borderTop: '4px solid #07294D',
                  borderRadius: '50%',
                  width: '45px',
                  height: '45px',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 15px'
                }}></div>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                  {t('common.loading') || (isKhmer ? 'កំពុងទាញយកទិន្នន័យសំណួរ...' : 'Loading FAQs...')}
                </p>
              </div>
            ) : filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => {
                const isOpen = openIds.has(faq.id);
                const itemNum = String(index + 1).padStart(2, '0');
                const formattedNum = isKhmer ? toKhmerNumber(itemNum) : itemNum;
                const badgeStyle = getCategoryBadgeStyle(faq.category);
                const qText = getQuestionText(faq);
                const aText = getAnswerText(faq);
                const rating = helpfulRatings[faq.id];

                return (
                  <div
                    key={faq.id || index}
                    className={`inst-faq-item ${isOpen ? 'active' : ''}`}
                  >
                    <button
                      type="button"
                      className="inst-faq-btn"
                      onClick={() => toggleAccordion(faq.id)}
                      aria-expanded={isOpen}
                    >
                      {/* Left side: Num + Tag + Question */}
                      <div className="d-flex align-items-center gap-3 flex-grow-1">
                        <div className="inst-faq-num">
                          {formattedNum}
                        </div>
                        <div className="inst-faq-question-wrap">
                          <span
                            className="inst-faq-cat-tag"
                            style={badgeStyle}
                          >
                            <i className="fas fa-tag me-1" style={{ fontSize: '9px' }}></i>
                            {getCategoryLabel(faq.category)}
                          </span>
                          <h3 className="inst-faq-question">
                            {qText}
                          </h3>
                        </div>
                      </div>

                      {/* Right side: Animated Chevron Toggle */}
                      <div className="inst-faq-toggle-icon">
                        <i className="fas fa-chevron-down"></i>
                      </div>
                    </button>

                    {/* Accordion Body */}
                    {isOpen && (
                      <div className="inst-faq-body">
                        <div className="inst-faq-answer-inner">
                          <p className="inst-faq-answer-text">
                            {aText}
                          </p>

                          {/* Was this helpful? Micro-interaction */}
                          <div className="inst-faq-feedback-bar">
                            <span style={{ fontWeight: 600 }}>
                              <i className="fas fa-question-circle me-1 text-primary"></i>
                              {t('faq.helpful') || (isKhmer ? 'តើចម្លើយនេះមានប្រយោជន៍ចំពោះអ្នកទេ?' : 'Was this answer helpful?')}
                            </span>
                            {rating ? (
                              <span className="inst-faq-feedback-btn rated">
                                <i className="fas fa-check-circle"></i>
                                {isKhmer ? 'អរគុណសម្រាប់ការវាយតម្លៃរបស់អ្នក!' : 'Thank you for your feedback!'}
                              </span>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleRateHelpful(faq.id, 'yes')}
                                  className="inst-faq-feedback-btn"
                                  title={isKhmer ? 'មានប្រយោជន៍' : 'Helpful'}
                                >
                                  <i className="far fa-thumbs-up text-success"></i>
                                  <span>{isKhmer ? 'មានប្រយោជន៍' : 'Yes'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRateHelpful(faq.id, 'no')}
                                  className="inst-faq-feedback-btn"
                                  title={isKhmer ? 'មិនសូវមានប្រយោជន៍' : 'Not helpful'}
                                >
                                  <i className="far fa-thumbs-down text-danger"></i>
                                  <span>{isKhmer ? 'មិនសូវមានប្រយោជន៍' : 'No'}</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              /* Empty state */
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  padding: '60px 24px',
                  textAlign: 'center',
                  border: '1px dashed #cbd5e1',
                  boxShadow: '0 4px 18px rgba(7, 41, 77, 0.03)'
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#f1f5f9',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '26px',
                    margin: '0 auto 16px'
                  }}
                >
                  <i className="fas fa-search"></i>
                </div>
                <h5 style={{ color: '#07294D', fontWeight: '800', fontSize: '1.25rem', marginBottom: '8px' }}>
                  {t('faq.noFAQs') || (isKhmer ? 'រកមិនឃើញសំណួរដែលត្រូវគ្នាឡើយ' : 'No FAQs matching your query')}
                </h5>
                <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 20px', lineHeight: 1.7 }}>
                  {t('faq.noFAQsMsg') || (isKhmer ? 'សូមសាកល្បងស្វែងរកជាមួយពាក្យគន្លឹះផ្សេង ឬជ្រើសរើសប្រភេទសំណួរទាំងអស់។' : 'Try adjusting your search terms or filter to see more questions.')}
                </p>
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  style={{
                    background: '#07294D',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '30px',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(7, 41, 77, 0.15)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <i className="fas fa-redo-alt me-1"></i>
                  {isKhmer ? 'សម្អាតការស្វែងរក' : 'Reset Search'}
                </button>
              </div>
            )}
          </div>

          {/* 4. INSTITUTIONAL SUPPORT & DIRECT HELP CHANNELS */}
          <div className="faq-support-grid">
            {/* Card 1: Academic Affairs Office */}
            <div className="faq-support-card">
              <div className="faq-support-icon-wrap" style={{ background: '#eff6ff', color: '#1e73be', border: '1px solid #dbeafe' }}>
                <i className="fas fa-building-columns"></i>
              </div>
              <h4 className="faq-support-title">
                {isKhmer ? 'ការិយាល័យសិក្សាផ្ទាល់' : 'Academic Affairs Office'}
              </h4>
              <p className="faq-support-desc">
                {isKhmer
                  ? 'អញ្ជើញមកកាន់ការិយាល័យសិក្សានៃវិទ្យាស្ថានផ្ទាល់ (អាគាររដ្ឋបាល ជាន់ផ្ទាល់ដី) រៀងរាល់ថ្ងៃច័ន្ទ ដល់សៅរ៍ វេលាម៉ោង ៧:៣០ព្រឹក - ៥:០០ល្ងាច។'
                  : 'Visit the Academic Affairs Office on the Ground Floor of the Administration Building, open Monday through Saturday from 7:30 AM to 5:00 PM.'}
              </p>
              <Link
                to="/about"
                className="faq-support-action"
                style={{ background: '#eff6ff', color: '#1e73be', border: '1px solid #dbeafe' }}
              >
                <span>{isKhmer ? 'អំពីវិទ្យាស្ថាន' : 'About Campus'}</span>
                <i className="fas fa-arrow-right"></i>
              </Link>
            </div>

            {/* Card 2: Phone & Telegram Hotline */}
            <div className="faq-support-card">
              <div className="faq-support-icon-wrap" style={{ background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' }}>
                <i className="fab fa-telegram"></i>
              </div>
              <h4 className="faq-support-title">
                {isKhmer ? 'ហតឡាញ & Telegram' : 'Hotline & Telegram'}
              </h4>
              <p className="faq-support-desc">
                {isKhmer
                  ? 'ទំនាក់ទំនងប្រឹក្សាយោបល់រហ័សតាមទូរស័ព្ទលេខ ០៦៣ ៩៦៣ ៨៨៨ ឬចូលរួមជាមួយ Channel Telegram ផ្លូវការរបស់វិទ្យាស្ថាន។'
                  : 'Get prompt guidance via hotline 063 963 888 or join the official RPITSSR Telegram channel for instant updates and alerts.'}
              </p>
              <a
                href="https://t.me/rpitssr"
                target="_blank"
                rel="noopener noreferrer"
                className="faq-support-action"
                style={{ background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' }}
              >
                <i className="fab fa-telegram-plane"></i>
                <span>{isKhmer ? 'ឆានែល Telegram' : 'Join Telegram'}</span>
              </a>
            </div>

            {/* Card 3: Direct Consultation Form */}
            <div className="faq-support-card">
              <div className="faq-support-icon-wrap" style={{ background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}>
                <i className="fas fa-paper-plane"></i>
              </div>
              <h4 className="faq-support-title">
                {isKhmer ? 'ផ្ញើសំណួរមកកាន់យើង' : 'Ask a Direct Question'}
              </h4>
              <p className="faq-support-desc">
                {isKhmer
                  ? 'មិនទាន់បានទទួលចម្លើយចំពោះចម្ងល់របស់អ្នកមែនទេ? ផ្ញើសំណួរមកកាន់ក្រុមការងារដើម្បីទទួលបានការឆ្លើយតបយ៉ាងឆាប់រហ័ស។'
                  : 'Didn’t find the answer you were looking for? Send a direct message to our student advisory team and we will respond promptly.'}
              </p>
              <Link
                to="/contact"
                className="faq-support-action"
                style={{ background: '#07294D', color: '#ffffff' }}
              >
                <span>{isKhmer ? 'ទាក់ទងមកយើងឥឡូវនេះ' : 'Contact Us Now'}</span>
                <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};
