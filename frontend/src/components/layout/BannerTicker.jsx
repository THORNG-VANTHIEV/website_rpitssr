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
          const computedDuration = Math.max(25, Math.ceil(0.15 * totalChars));
          setDuration(computedDuration);

          const messages = activeBanners.map((b) => b.message.replace(/[\r\n]+/g, '   ').trim());
          setItems([...messages, ...messages]);
        } else {
          setItems([
            '🎓 វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប - TVET',
            '🔥 [ថ្មី] ទស្សនាវីដេអូផ្សព្វផ្សាយ និងសកម្មភាពបណ្តុះបណ្តាលចុងក្រោយរបស់ RPITSSR លើ YouTube',
            '🌟 កម្មវិធីបណ្តុះបណ្តាលជំនាញវិជ្ជាជីវៈ ១.៥ លាននាក់ ដោយឥតគិតថ្លៃ',
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
        <div
          className="scrolling-banner-content"
          style={{ animation: `scroll-infinite ${duration}s linear infinite` }}
        >
          {items.map((text, idx) => (
            <div key={idx} className="scrolling-banner-item">
              {text}
            </div>
          ))}
        </div>
      </div>
      <div className="scrolling-banner-gradient-left"></div>
      <div className="scrolling-banner-gradient-right"></div>
    </div>
  );
};
