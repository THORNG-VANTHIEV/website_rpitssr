import React, { useEffect, useState } from 'react';
import api from '../../api/client';

export const BannerTicker = () => {
  const [items, setItems] = useState([]);
  const [duration, setDuration] = useState(35);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await api.get('/scrolling-banners');
        let bannerList = [];
        if (res.data?.success && res.data?.data?.banners) {
          bannerList = res.data.data.banners;
        } else if (Array.isArray(res.data)) {
          bannerList = res.data;
        } else if (Array.isArray(res.data?.data)) {
          bannerList = res.data.data;
        }

        const activeBanners = bannerList
          .filter((b) => b.is_active === true || b.is_active === 1 || b.is_active === '1')
          .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

        if (activeBanners.length > 0) {
          const totalChars = activeBanners.reduce((acc, b) => acc + (b.message ? b.message.length : 0), 0);
          const computedDuration = Math.max(30, Math.ceil(0.18 * totalChars));
          setDuration(computedDuration);

          const messages = activeBanners.map((b) => b.message.replace(/[\r\n]+/g, '   ').trim());
          setItems(messages);
        } else {
          setItems([
            '🎓 វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប - TVET',
            '🔥 [ថ្មី] ទស្សនាវីដេអូផ្សព្វផ្សាយ និងសកម្មភាពបណ្តុះបណ្តាលចុងក្រោយរបស់ RPITSSR លើ YouTube',
            '🌟 កម្មវិធីបណ្តុះបណ្តាលជំនាញវិជ្ជាជីវៈ ១.៥ លាននាក់ ដោយឥតគិតថ្លៃ'
          ]);
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
      }
    };

    fetchBanners();
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <div className="scrolling-banner-wrapper">
      <div className="scrolling-banner-container">
        {/* Track 1: Primary */}
        <div
          className="scrolling-banner-track"
          style={{ animationDuration: `${duration}s` }}
        >
          {items.map((text, idx) => (
            <div key={`track1-${idx}`} className="scrolling-banner-item">
              <span>{text}</span>
              <span className="scrolling-banner-bullet">✦</span>
            </div>
          ))}
        </div>

        {/* Track 2: Seamless Mirror Clone (Eliminates all jump & jitter) */}
        <div
          className="scrolling-banner-track"
          aria-hidden="true"
          style={{ animationDuration: `${duration}s` }}
        >
          {items.map((text, idx) => (
            <div key={`track2-${idx}`} className="scrolling-banner-item">
              <span>{text}</span>
              <span className="scrolling-banner-bullet">✦</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
