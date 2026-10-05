import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';

export const BannerTicker = () => {
  const { currentLanguage, language } = useLanguage();
  const isKhmer = currentLanguage === 'km' || language === 'km';
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
          const totalChars = activeBanners.reduce((acc, b) => {
            const msg = (!isKhmer && b.message_en) ? b.message_en : (b.message || '');
            return acc + msg.length;
          }, 0);
          const computedDuration = Math.max(30, Math.ceil(0.18 * totalChars));
          setDuration(computedDuration);

          const messages = activeBanners.map((b) => {
            const msg = (!isKhmer && b.message_en) ? b.message_en : b.message;
            return (msg || '').replace(/[\r\n]+/g, '   ').trim();
          }).filter(Boolean);

          setItems(messages.length > 0 ? messages : (isKhmer ? [
            '🎓 វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប - TVET',
            '🔥 [ថ្មី] ទស្សនាវីដេអូផ្សព្វផ្សាយ និងសកម្មភាពបណ្តុះបណ្តាលចុងក្រោយរបស់ RPITSSR លើ YouTube',
            '🌟 កម្មវិធីបណ្តុះបណ្តាលជំនាញវិជ្ជាជីវៈ ១.៥ លាននាក់ ដោយឥតគិតថ្លៃ'
          ] : [
            '🎓 Regional Polytechnic Institute Techo Sen Siem Reap - TVET Excellence',
            '🔥 [New] Watch our latest official promotional video & training media on YouTube',
            '🌟 Free TVET 1.5M vocational training program with monthly living support'
          ]));
        } else {
          setItems(isKhmer ? [
            '🎓 វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប - TVET',
            '🔥 [ថ្មី] ទស្សនាវីដេអូផ្សព្វផ្សាយ និងសកម្មភាពបណ្តុះបណ្តាលចុងក្រោយរបស់ RPITSSR លើ YouTube',
            '🌟 កម្មវិធីបណ្តុះបណ្តាលជំនាញវិជ្ជាជីវៈ ១.៥ លាននាក់ ដោយឥតគិតថ្លៃ'
          ] : [
            '🎓 Regional Polytechnic Institute Techo Sen Siem Reap - TVET Excellence',
            '🔥 [New] Watch our latest official promotional video & training media on YouTube',
            '🌟 Free TVET 1.5M vocational training program with monthly living support'
          ]);
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
      }
    };

    fetchBanners();
  }, [isKhmer]);

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
