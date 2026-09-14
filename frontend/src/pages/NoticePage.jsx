import React, { useState, useEffect } from 'react';
import { PageBanner } from '../components/common/PageBanner';
import { useLanguage } from '../context/LanguageContext';
import client from '../api/client';

const SAMPLE_NOTICES = [
  {
    id: 1,
    title: 'សេចក្តីជូនដំណឹងស្តីពីការជ្រើសរើសសិស្ស-និស្សិតចូលរៀនវគ្គថ្មី ឆ្នាំសិក្សា ២០២៦-២០២៧',
    date: '2026-08-20',
    category: 'Admissions',
    content: 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប សូមជូនដំណឹងដល់ប្អូនៗសិស្សានុសិស្សទាំងអស់ឱ្យបានជ្រាបថា វិទ្យាស្ថានចាប់ផ្តើមទទួលពាក្យសុំចូលរៀនចាប់ពីថ្ងៃផ្សាយដំណឹងនេះតទៅលើមុខជំនាញបច្ចេកវិទ្យាព័ត៌មាន អគ្គិសនី យានយន្ត សំណង់ស៊ីវិល និងបរិក្ខារត្រជាក់។'
  },
  {
    id: 2,
    title: 'កាលវិភាគប្រឡងឆមាសទី២ សម្រាប់សិស្ស-និស្សិតគ្រប់កម្រិតបណ្តុះបណ្តាល',
    date: '2026-08-05',
    category: 'Academic',
    content: 'ការិយាល័យសិក្សាសូមប្រកាសផ្សាយកាលវិភាគប្រឡងឆមាសទី២។ សិស្ស-និស្សិតទាំងអស់ត្រូវពិនិត្យមើលកាលវិភាគតាមបន្ទប់ និងគោរពបទបញ្ជាផ្ទៃក្នុងនៃការប្រឡងឱ្យបានខ្ជាប់ខ្ជួន។'
  },
  {
    id: 3,
    title: 'សេចក្តីប្រកាសស្តីពីការផ្តល់អាហារូបករណ៍ ១.៥ លាននាក់របស់រាជរដ្ឋាភិបាលកម្ពុជា',
    date: '2026-07-15',
    category: 'Scholarship',
    content: 'ឱកាសសិក្សាជំនាញបច្ចេកទេសឥតគិតថ្លៃ និងទទួលបានប្រាក់ឧបត្ថម្ភ ២៨០,០០០ រៀលក្នុងមួយខែ សម្រាប់យុវជនមកពីគ្រួសារក្រីក្រ និងងាយរងគ្រោះ។'
  },
  {
    id: 4,
    title: 'ការចុះឈ្មោះហាត់ការងារ និងកម្មសិក្សាការងារនៅតាមបណ្តាក្រុមហ៊ុនដៃគូ',
    date: '2026-06-30',
    category: 'Internship',
    content: 'ការិយាល័យទំនាក់ទំនងសហគ្រាសសូមអញ្ជើញនិស្សិតឆ្នាំបញ្ចប់មកចុះឈ្មោះជ្រើសរើសទីតាំងចុះកម្មសិក្សាការងារតាមជំនាញនីមួយៗ។'
  }
];

export const NoticePage = () => {
  const { t } = useLanguage();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/notices')
      .then(res => {
        const data = res.data?.data || res.data || [];
        const validList = Array.isArray(data) ? data : [];
        if (validList.length > 0) {
          setNotices(validList);
        } else {
          setNotices(SAMPLE_NOTICES);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching notices:', err);
        setNotices(SAMPLE_NOTICES);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <PageBanner
        title={t('notice.pageTitle') || 'Official Notices & Announcements'}
        image="/images/notice.webp"
      />

      <section className="notice-area pt-70 pb-70">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title-2 mb-40">
                <h2 className="title">{t('notice.pageTitle') || 'Institute Notices'}</h2>
                <span className="line"></span>
              </div>
            </div>
          </div>

          <div className="notice-content">
            {loading ? (
              <div className="text-center py-5">
                <div style={{ border: '4px solid #f3f4f6', borderTop: '4px solid #07294D', borderRadius: '50%', width: '45px', height: '45px', animation: 'spin 1s linear infinite', margin: '0 auto 15px' }}></div>
                <p className="text-muted">{t('common.loading') || 'Loading Announcements...'}</p>
              </div>
            ) : notices.length > 0 ? (
              notices.map((notice, index) => (
                <div
                  key={notice.id || index}
                  className="single-notice d-flex align-items-start mb-4 p-4 bg-white rounded shadow-sm"
                  style={{ borderLeft: '4px solid #07294D' }}
                >
                  <span
                    className="number me-3"
                    style={{
                      fontSize: '1.6rem',
                      fontWeight: '800',
                      color: '#07294D',
                      minWidth: '50px',
                      height: '50px',
                      borderRadius: '8px',
                      background: '#f0f4f8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {(index + 1).toString().padStart(2, '0')}
                  </span>

                  <div className="media-body flex-grow-1 ms-3">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                      <span className="text-muted" style={{ fontSize: '0.88rem' }}>
                        <i className="far fa-calendar-alt me-1"></i>
                        {notice.date ? new Date(notice.date).toLocaleDateString() : 'Recent'}
                      </span>
                      {notice.category && (
                        <span className="badge bg-light text-primary border">
                          {notice.category}
                        </span>
                      )}
                    </div>

                    <h5 className="notice-title mb-2" style={{ color: '#07294D', fontWeight: '700', lineHeight: '1.5' }}>
                      {notice.title}
                    </h5>

                    {(notice.content || notice.description) && (
                      <p className="text-muted mb-0" style={{ lineHeight: '1.7', fontSize: '0.95rem' }}>
                        {notice.content || notice.description}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-5">
                <p className="text-muted">No notices at this time.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
