import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageBanner } from '../components/common/PageBanner';
import { EventCard } from '../components/common/EventCard';
import { useLanguage } from '../context/LanguageContext';
import client from '../api/client';

const SAMPLE_EVENTS = [
  {
    id: 1,
    title: 'National TVET Day Exhibition 2026',
    date: '2026-06-15',
    time: '08:00 AM - 05:00 PM',
    place: 'RPITSSR Grand Conference Hall'
  },
  {
    id: 2,
    title: 'Siem Reap Technical Career Fair & Skills Matching',
    date: '2026-07-20',
    time: '08:30 AM - 04:30 PM',
    place: 'Main Campus Courtyard'
  },
  {
    id: 3,
    title: 'ASEAN Renewable Energy & IoT Workshop',
    date: '2026-08-10',
    time: '09:00 AM - 12:00 PM',
    place: 'STEM Innovation Center, RPITSSR'
  },
  {
    id: 4,
    title: 'Annual Student Graduation & Certification Ceremony',
    date: '2026-09-05',
    time: '07:30 AM - 11:30 AM',
    place: 'Grand Auditorium'
  }
];

export const EventsPage = () => {
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/events')
      .then(res => {
        const data = res.data?.data || res.data || [];
        const validList = Array.isArray(data) ? data : [];
        if (validList.length > 0) {
          setEvents(validList);
        } else {
          setEvents(SAMPLE_EVENTS);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching events:', err);
        setEvents(SAMPLE_EVENTS);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <PageBanner
        title={t('events.title') || 'Upcoming Events'}
        image="/images/events.webp"
      />

      <section className="event-page pt-70 pb-70">
        <div className="container">
          <div className="row g-4">
            {loading ? (
              <div className="col-12 text-center py-5">
                <div style={{ border: '4px solid #f3f4f6', borderTop: '4px solid #07294D', borderRadius: '50%', width: '45px', height: '45px', animation: 'spin 1s linear infinite', margin: '0 auto 15px' }}></div>
                <p className="text-muted">{t('common.loading') || 'Loading Events...'}</p>
              </div>
            ) : events.length > 0 ? (
              events.map((item) => (
                <div key={item.id} className="col-xl-3 col-lg-6 col-md-6 d-flex">
                  <EventCard event={item} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <h4 className="text-muted">{t('events.noEvents') || 'No Events Found'}</h4>
                <p className="text-muted">{t('events.checkBackLater') || 'Please check back later for new events.'}</p>
              </div>
            )}
          </div>

          {events.length > 0 && (
            <div className="row mt-50">
              <div className="col-12">
                <ul className="pagination-items text-center" style={{ listStyle: 'none', display: 'flex', justifyContent: 'center', gap: '8px', padding: 0 }}>
                  <li>
                    <span className="active" style={{ display: 'inline-block', width: '40px', height: '40px', lineHeight: '40px', borderRadius: '5px', background: '#07294D', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>
                      01
                    </span>
                  </li>
                  <li>
                    <span style={{ display: 'inline-block', width: '40px', height: '40px', lineHeight: '40px', borderRadius: '5px', background: '#f0f4f8', color: '#07294D', fontWeight: '700', cursor: 'pointer' }}>
                      02
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
