import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageBanner } from '../components/common/PageBanner';
import { useLanguage } from '../context/LanguageContext';
import client from '../api/client';

const SAMPLE_FAQS = [
  {
    id: 1,
    category: 'courses',
    question: 'តើវិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប មានបណ្តុះបណ្តាលកម្រិតណាខ្លះ?',
    answer: 'វិទ្យាស្ថានផ្តល់ការបណ្តុះបណ្តាលចាប់ពីកម្រិតវិញ្ញាបនបត្របច្ចេកទេស និងវិជ្ជាជីវៈ (C1, C2, C3), សញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស (បរិញ្ញាបត្ររង / Associate Degree), និងបរិញ្ញាបត្របច្ចេកវិទ្យា (Bachelor of Technology) លើជំនាញវិស្វកម្ម និងបច្ចេកវិទ្យាជាច្រើន។'
  },
  {
    id: 2,
    category: 'admission',
    question: 'តើនិស្សិតអាចចុះឈ្មោះចូលរៀនតាមរបៀបណា?',
    answer: 'បេក្ខជនអាចមកដាក់ពាក្យដោយផ្ទាល់នៅការិយាល័យសិក្សានៃវិទ្យាស្ថាន ឬចុះឈ្មោះតាមប្រព័ន្ធអនឡាញលើគេហទំព័រផ្លូវការ rpitssr.edu.kh ក្នុងរដូវកាលចុះឈ្មោះចូលរៀន។'
  },
  {
    id: 3,
    category: 'fees',
    question: 'តើមានអាហារូបករណ៍ ១.៥ លាននាក់របស់រាជរដ្ឋាភិបាលដែរឬទេ?',
    answer: 'បាទ/ចាស! វិទ្យាស្ថានជាគ្រឹះស្ថាន TVET សាធារណៈដែលអនុវត្តកម្មវិធីបណ្តុះបណ្តាលជំនាញវិជ្ជាជីវៈ និងបច្ចេកទេស ១.៥ លាននាក់ ដោយឥតគិតថ្លៃសិក្សា និងមានប្រាក់ឧបត្ថម្ភប្រចាំខែ ២៨០,០០០ រៀល សម្រាប់យុវជនមកពីគ្រួសារក្រីក្រ និងងាយរងគ្រោះ (ប័ណ្ណក្រីក្រ/សមធម៌)។'
  },
  {
    id: 4,
    category: 'facilities',
    question: 'តើវិទ្យាស្ថានមានកន្លែងស្នាក់នៅ (អន្តេវាសិកដ្ឋាន) សម្រាប់សិស្ស-និស្សិតមកពីខេត្តឆ្ងាយដែរឬទេ?',
    answer: 'វិទ្យាស្ថានមានអគារអន្តេវាសិកដ្ឋានប្រកបដោយផាសុកភាព និងសុវត្ថិភាពខ្ពស់ ផ្តល់អាទិភាពដល់សិស្ស-និស្សិតនារី និងសិស្សមកពីតំបន់ដាច់ស្រយាល។'
  },
  {
    id: 5,
    category: 'courses',
    question: 'តើនិស្សិតបញ្ចប់ការសិក្សាទទួលបានឱកាសការងារយ៉ាងដូចម្តេច?',
    answer: 'អត្រាការងាររបស់និស្សិតបញ្ចប់ការសិក្សាពី RPITSSR មានលើសពី ៩៥% ដោយសារវិទ្យាស្ថានមានកិច្ចសហការយ៉ាងជិតស្និទ្ធជាមួយក្រុមហ៊ុន រោងចក្រ សហគ្រាស និងឧស្សាហកម្មជាង ១០០ នៅក្នុងប្រទេសកម្ពុជា និងក្រៅប្រទេស។'
  }
];

export const FaqPage = () => {
  const { t } = useLanguage();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    client.get('/faqs')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        if (data.length > 0) {
          setFaqs(data);
        } else {
          setFaqs(SAMPLE_FAQS);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load FAQs:', err);
        setFaqs(SAMPLE_FAQS);
        setLoading(false);
      });
  }, []);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? -1 : index);
  };

  const categories = [
    { id: 'all', label: t('faq.all') || 'ទាំងអស់', icon: 'fas fa-th-large' },
    { id: 'admission', label: t('faq.admission') || 'ការចូលរៀន', icon: 'fas fa-user-graduate' },
    { id: 'courses', label: t('faq.courses') || 'វគ្គសិក្សា', icon: 'fas fa-book-open' },
    { id: 'fees', label: t('faq.fees') || 'អាហារូបករណ៍ / ថ្លៃសិក្សា', icon: 'fas fa-award' },
    { id: 'facilities', label: t('faq.facilities') || 'គ្រឿងបរិក្ខារ', icon: 'fas fa-building' }
  ];

  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesCategory = selectedCategory === 'all' || (faq.category && faq.category === selectedCategory);
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCategory;
      const questionMatch = (faq.question || '').toLowerCase().includes(query);
      const answerMatch = (faq.answer || '').toLowerCase().includes(query);
      return matchesCategory && (questionMatch || answerMatch);
    });
  }, [faqs, selectedCategory, searchQuery]);

  return (
    <div>
      <PageBanner
        title={t('faq.pageTitle') || 'សំណួរញឹកញាប់'}
        image="/images/faq.webp"
      />

      <section className="faq-page-area" style={{ background: '#f8fafc', padding: '60px 0 90px' }}>
        <div className="container" style={{ maxWidth: '1080px' }}>
          {/* Header Section */}
          <div className="text-center mb-50">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#eff6ff',
                color: '#1e73be',
                padding: '6px 18px',
                borderRadius: '30px',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '16px'
              }}
            >
              <i className="fas fa-question-circle"></i>
              <span>{t('faq.title') || 'សំណួរដែលសួរញឹកញាប់'}</span>
            </div>
            <h2
              style={{
                color: '#07294D',
                fontWeight: '800',
                fontSize: '2.2rem',
                marginBottom: '14px',
                lineHeight: '1.3'
              }}
            >
              {t('faq.pageTitle') || 'សំណួរញឹកញាប់'}
            </h2>
            <p
              style={{
                color: '#64748b',
                fontSize: '1.05rem',
                lineHeight: '1.8',
                maxWidth: '680px',
                margin: '0 auto'
              }}
            >
              ស្វែងរកចម្លើយចំពោះរាល់ចម្ងល់ទូទៅអំពីការចុះឈ្មោះចូលរៀន កម្មវិធីសិក្សាTVET អាហារូបករណ៍ និងសេវាកម្មសិស្ស-និស្សិត។
            </p>
          </div>

          {/* Search Bar & Category Filter */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '24px 28px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
              border: '1px solid #e2e8f0',
              marginBottom: '36px'
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <i
                className="fas fa-search"
                style={{
                  position: 'absolute',
                  left: '18px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: '16px'
                }}
              ></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('faq.searchFAQ') || 'ស្វែងរកសំណួរ ឬចម្ងល់របស់អ្នកនៅទីនេះ...'}
                style={{
                  width: '100%',
                  padding: '14px 44px 14px 48px',
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0',
                  outline: 'none',
                  fontSize: '15px',
                  color: '#1e293b',
                  backgroundColor: '#f8fafc',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1e73be';
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.boxShadow = '0 0 0 4px rgba(30, 115, 190, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#e2e8f0',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#64748b',
                    fontSize: '12px'
                  }}
                  title="Clear"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '8px 16px',
                      borderRadius: '30px',
                      border: isSelected ? '1.5px solid #1e73be' : '1.5px solid #e2e8f0',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      color: isSelected ? '#1e73be' : '#64748b',
                      fontSize: '13.5px',
                      fontWeight: isSelected ? '700' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <i className={cat.icon} style={{ fontSize: '13px' }}></i>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accordion FAQ List */}
          <div className="modern-faq-container">
            {loading ? (
              <div className="text-center py-5">
                <div style={{ border: '4px solid #f3f4f6', borderTop: '4px solid #07294D', borderRadius: '50%', width: '45px', height: '45px', animation: 'spin 1s linear infinite', margin: '0 auto 15px' }}></div>
                <p className="text-muted">{t('common.loading') || 'កំពុងទាញយកទិន្នន័យសំណួរ...'}</p>
              </div>
            ) : filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => {
                const isOpen = activeIndex === index;
                const formattedNum = String(index + 1).padStart(2, '0');
                return (
                  <div
                    key={faq.id || index}
                    className={`modern-faq-item ${isOpen ? 'active' : ''}`}
                  >
                    <button
                      type="button"
                      className="modern-faq-btn"
                      onClick={() => toggleAccordion(index)}
                      aria-expanded={isOpen}
                    >
                      <div className="d-flex align-items-center gap-3 flex-grow-1">
                        <div className="modern-faq-num">
                          {formattedNum}
                        </div>
                        <h3 className="modern-faq-question">
                          {faq.question}
                        </h3>
                      </div>
                      <div className="modern-faq-toggle-icon">
                        <i className="fas fa-chevron-down"></i>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="modern-faq-body">
                        <div style={{ borderLeft: '3px solid #1e73be', paddingLeft: '16px' }}>
                          <p className="modern-faq-answer">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '50px 20px',
                  textAlign: 'center',
                  border: '1px dashed #cbd5e1'
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#f1f5f9',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    margin: '0 auto 16px'
                  }}
                >
                  <i className="fas fa-search"></i>
                </div>
                <h5 style={{ color: '#07294D', fontWeight: '700', marginBottom: '8px' }}>
                  {t('faq.noFAQs') || 'រកមិនឃើញសំណួរដែលត្រូវគ្នាឡើយ'}
                </h5>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
                  សូមសាកល្បងស្វែងរកជាមួយពាក្យគន្លឹះផ្សេង ឬជ្រើសរើសប្រភេទសំណួរទាំងអស់។
                </p>
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  style={{
                    background: '#07294D',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  សម្អាតការស្វែងរក
                </button>
              </div>
            )}
          </div>

          {/* Bottom Help / Contact Banner */}
          <div
            style={{
              marginTop: '50px',
              background: 'linear-gradient(135deg, #07294D 0%, #185ca1 100%)',
              borderRadius: '20px',
              padding: '40px 45px',
              boxShadow: '0 12px 35px rgba(7, 41, 77, 0.15)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '24px'
            }}
          >
            <div style={{ maxWidth: '600px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.15)', padding: '5px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
                <i className="fas fa-headset"></i> {t('faq.stillHaveQuestions') || 'នៅតែមានសំណួរ?'}
              </div>
              <h3 style={{ color: '#ffffff', fontWeight: '800', fontSize: '1.5rem', marginBottom: '8px', lineHeight: '1.4' }}>
                មិនទាន់បានទទួលចម្លើយចំពោះចម្ងល់របស់អ្នកមែនទេ?
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.98rem', lineHeight: '1.8', margin: 0 }}>
                ក្រុមការងារផ្តល់ព័ត៌មាន និងប្រឹក្សាយោបល់របស់វិទ្យាស្ថានរង់ចាំស្វាគមន៍ និងជួយសម្រួលរាល់ចម្ងល់របស់អ្នកគ្រប់ពេលវេលា។
              </p>
            </div>

            <div className="d-flex align-items-center gap-3 flex-wrap">
              <Link
                to="/contact"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#ffffff',
                  color: '#07294D',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '14.5px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease'
                }}
              >
                <i className="fas fa-paper-plane text-primary"></i>
                <span>{t('faq.contactUs') || 'ទំនាក់ទំនងមកយើង'}</span>
              </Link>
              <a
                href="tel:063963888"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1.5px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '14.5px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <i className="fas fa-phone-alt"></i>
                <span>063 963 888</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
