import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  FileText,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Phone,
  Award,
  Upload,
  Copy,
  Check,
  Send,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/client';

export const AdmissionApplyPage = () => {
  const { currentLanguage, language } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  // Active Tab: 'apply' or 'track'
  const [activeTab, setActiveTab] = useState('apply');

  // Form Options (loaded from API)
  const [options, setOptions] = useState({
    degreeLevels: [],
    majors: [],
    shifts: []
  });
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    khmerName: '',
    latinName: '',
    gender: 'male',
    dob: '',
    phone: '',
    telegram: '',
    email: '',
    currentAddress: '',
    courseType: 'long_term', // 'long_term' (វគ្គវែង) | 'short_term' (វគ្គខ្លី)
    degreeLevel: 'bachelor',
    major: '',
    shift: 'morning',
    photoUrl: '',
    certificateUrl: '',
    idCardUrl: '',
    equityCardUrl: '',
    agreement: false
  });

  // Uploading state per file
  const [uploading, setUploading] = useState({
    photo: false,
    certificate: false,
    idCard: false,
    equityCard: false
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [formError, setFormError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Tracking State
  const [trackCode, setTrackCode] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState('');

  // Fetch Options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const res = await api.get('/admissions/options');
        if (res.data) {
          setOptions(res.data);
          if (res.data.degreeLevels?.length && !formData.degreeLevel) {
            setFormData(prev => ({ ...prev, degreeLevel: res.data.degreeLevels[0].id }));
          }
          if (res.data.majors?.length) {
            setFormData(prev => {
              if (!prev.major) {
                return { ...prev, major: res.data.majors[0].nameKm || res.data.majors[0].name };
              }
              const matched = res.data.majors.find(m => 
                m.code === prev.major.toLowerCase() || 
                m.nameEn?.toLowerCase() === prev.major.toLowerCase() ||
                m.name?.toLowerCase() === prev.major.toLowerCase() ||
                m.nameKm === prev.major
              );
              if (matched) {
                return { ...prev, major: matched.nameKm || matched.name };
              }
              return prev;
            });
          }
        }
      } catch (err) {
        console.error('Failed to load admission options:', err);
        // Fallback default options
        setOptions({
          programTypes: [
            {
              id: 'long_term',
              nameKm: 'វគ្គវែង (កម្រិតសញ្ញាបត្រ - បរិញ្ញាបត្រ & ជាន់ខ្ពស់)',
              nameEn: 'Long-Term Degree Programs (Bachelor & Higher Diploma)',
              badge: '២ - ៤ ឆ្នាំ',
              descriptionKm: 'បណ្តុះបណ្តាលកម្រិតឧត្តមសិក្សាបច្ចេកវិទ្យា ទទួលបានសញ្ញាបត្រទទួលស្គាល់ដោយក្រសួងការងារ និងបណ្តុះបណ្តាលវិជ្ជាជីវៈ។'
            },
            {
              id: 'short_term',
              nameKm: 'វគ្គខ្លី (បណ្តុះបណ្តាលវិជ្ជាជីវៈ & TVET ១,៥ លាននាក់)',
              nameEn: 'Short-Term Vocational Courses & TVET 1.5M',
              badge: '១ - ៤ ខែ (Free 100%)',
              descriptionKm: 'បណ្តុះបណ្តាលជំនាញជាក់ស្តែងឆាប់ចេះ ឆាប់បានការងារ អាហារូបករណ៍ ១០០% ឥតគិតថ្លៃ ព្រមទាំងទទួលបានប្រាក់ឧបត្ថម្ភ។'
            }
          ],
          degreeLevels: [
            {
              id: 'bachelor',
              courseType: 'long_term',
              nameKm: 'បរិញ្ញាបត្របច្ចេកវិទ្យា (Bachelor of Technology - ៤ ឆ្នាំ)',
              nameEn: 'Bachelor of Technology (4 Years)',
              shortName: 'បរិញ្ញាបត្រ (B.Tech)',
              duration: '៤ ឆ្នាំ (ឬបន្ត ២ ឆ្នាំ)',
              scholarship: 'មានអាហារូបករណ៍រដ្ឋ',
              requirementKm: 'សញ្ញាបត្រមធ្យមសិក្សាទុតិយភូមិ (បាក់ឌុប) ឬសញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស'
            },
            {
              id: 'higher_diploma',
              courseType: 'long_term',
              nameKm: 'សញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស / បរិញ្ញាបត្ររង (Higher Diploma - ២ ឆ្នាំ)',
              nameEn: 'Higher Technical Diploma / Associate (2 Years)',
              shortName: 'ជាន់ខ្ពស់បច្ចេកទេស (H.Dip)',
              duration: '២ ឆ្នាំ',
              scholarship: 'មានអាហារូបករណ៍រដ្ឋ',
              requirementKm: 'សញ្ញាបត្របាក់ឌុប ឬធ្លាក់បាក់ឌុប ឬវិញ្ញាបនបត្របច្ចេកទេស C3'
            },
            {
              id: 'tvet_short',
              courseType: 'short_term',
              nameKm: 'វគ្គបណ្តុះបណ្តាលវិជ្ជាជីវៈកម្រិត ១-២-៣ (TVET ១,៥ លាននាក់ - C1, C2, C3)',
              nameEn: 'TVET 1.5M Technical & Vocational (Levels 1-3)',
              shortName: 'TVET ១.៥ លាននាក់ (C1-C3)',
              duration: '៤ ខែ / ១ កម្រិត',
              scholarship: 'ឥតគិតថ្លៃ ១០០% + ឧបត្ថម្ភ ២៨០,០០០៛/ខែ',
              requirementKm: 'សិស្ស-យុវជនទូទៅ (ប័ណ្ណសមធម៌ / គ្រួសារងាយរងហានិភ័យ)'
            },
            {
              id: 'short_course',
              courseType: 'short_term',
              nameKm: 'វគ្គបណ្តុះបណ្តាលជំនាញវិជ្ជាជីវៈខ្លីៗ (Short Vocational Courses - ១ ទៅ ៤ ខែ)',
              nameEn: 'Short-Term Vocational Course (1 to 4 Months)',
              shortName: 'វគ្គខ្លីវិជ្ជាជីវៈ',
              duration: '១ - ៤ ខែ',
              scholarship: 'អាហារូបករណ៍រដ្ឋ / តម្លៃសមរម្យ',
              requirementKm: 'សិស្ស-និស្សិត ឬប្រជាពលរដ្ឋទូទៅ'
            }
          ],
          majors: [
            { id: 2, name: 'វិស្វកម្មអគ្គិសនី & ថាមពល (Electrical & Energy Engineering)' },
            { id: 3, name: 'វិស្វកម្មមេកានិក & យានយន្ត (Mechanical & Automotive Engineering)' },
            { id: 4, name: 'វិស្វកម្មសំណង់ស៊ីវិល & ស្ថាបត្យកម្ម (Civil Engineering & Architecture)' },
            { id: 5, name: 'បច្ចេកវិទ្យាកុំព្យូទ័រ & បរិក្ខារត្រជាក់ (HVAC & Refrigeration Technology)' },
            { id: 6, name: 'សេវាកម្មទេសចរណ៍ & បដិសណ្ឋារកិច្ច (Tourism & Hospitality Services)' },
            { id: 7, name: 'ធុរកិច្ចឌីជីថល & គណនេយ្យ (Digital Business & Accounting)' }
          ],
          shifts: [
            { id: 'morning', nameKm: 'វេនព្រឹក (Morning: 08:00 AM - 11:30 AM)', nameEn: 'Morning Shift (08:00 AM - 11:30 AM)' },
            { id: 'afternoon', nameKm: 'វេនរសៀល (Afternoon: 01:30 PM - 05:00 PM)', nameEn: 'Afternoon Shift (01:30 PM - 05:00 PM)' },
            { id: 'evening', nameKm: 'វេនយប់ (Evening: 05:30 PM - 08:30 PM)', nameEn: 'Evening Shift (05:30 PM - 08:30 PM)' },
            { id: 'weekend', nameKm: 'វេនចុងសប្តាហ៍ (Weekend: ថ្ងៃសៅរ៍ - ថ្ងៃអាទិត្យ)', nameEn: 'Weekend Shift (Saturday - Sunday)' }
          ]
        });
        setFormData(prev => ({
          ...prev,
          courseType: 'long_term',
          degreeLevel: 'bachelor',
          major: 'ព័ត៌មានវិទ្យា & វិទ្យាសាស្ត្រកុំព្យូទ័រ (Information Technology / Computer Science)'
        }));
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  // Handle Document Upload
  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert(isKhmer ? 'ប្រភេទឯកសារមិនត្រឹមត្រូវ។ សូមបញ្ចូលតែរូបភាព (JPG, PNG, WEBP) ឬឯកសារ PDF ប៉ុណ្ណោះ។' : 'Invalid file type. Only JPG, PNG, WEBP images or PDF documents are permitted.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(isKhmer ? 'ទំហំឯកសារមិនត្រូវលើសពី 5MB ឡើយ។' : 'File size must not exceed 5MB');
      return;
    }

    setUploading(prev => ({ ...prev, [field]: true }));
    const data = new FormData();
    data.append('file', file);
    data.append('type', field);

    try {
      const res = await api.post('/admissions/upload-document', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data?.url;
      if (url) {
        setFormData(prev => ({ ...prev, [`${field}Url`]: url }));
      }
    } catch (err) {
      console.error('File upload error:', err);
      // Fallback preview using Object URL for client demonstration if offline
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, [`${field}Url`]: previewUrl }));
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.khmerName.trim() || !formData.latinName.trim()) {
      setFormError(isKhmer ? 'សូមបំពេញគោត្តនាម និងនាមជាភាសាខ្មែរ និងឡាតាំងឲ្យបានពេញលេញ។' : 'Please enter both Khmer and Latin full names.');
      return;
    }

    if (!formData.phone.trim()) {
      setFormError(isKhmer ? 'សូមបំពេញលេខទូរស័ព្ទឲ្យបានត្រឹមត្រូវ។' : 'Please enter a valid phone number.');
      return;
    }

    if (!formData.major) {
      setFormError(isKhmer ? 'សូមជ្រើសរើសជំនាញដែលអ្នកចង់សិក្សា។' : 'Please select your desired major.');
      return;
    }

    if (!formData.agreement) {
      setFormError(isKhmer ? 'សូមអាន និងយល់ព្រមលើលក្ខខណ្ឌ និងសេចក្តីប្រកាសខាងលើ។�' : 'Please accept the declaration checkbox.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        khmerName: formData.khmerName.trim(),
        latinName: formData.latinName.trim(),
        gender: formData.gender,
        dob: formData.dob || null,
        phone: formData.phone.trim(),
        telegram: formData.telegram.trim() || null,
        email: formData.email.trim() || null,
        currentAddress: formData.currentAddress.trim() || null,
        courseType: formData.courseType || 'long_term',
        degreeLevel: formData.degreeLevel,
        major: formData.major,
        shift: formData.shift,
        photoUrl: formData.photoUrl || null,
        certificateUrl: formData.certificateUrl || null,
        idCardUrl: formData.idCardUrl || null,
        equityCardUrl: formData.equityCardUrl || null
      };

      const res = await api.post('/admissions/apply', payload);
      if (res.data?.success) {
        setSubmitSuccess(res.data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Admission submit error:', err);
      const errMsg = err.response?.data?.message || (isKhmer ? 'ការដាក់ពាក្យសុំមិនជោគជ័យទេ។ សូមព្យាយាមម្តងទៀត។' : 'Failed to submit application. Please try again.');
      setFormError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Tracking Status Lookup
  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    setTrackError('');
    setTrackResult(null);

    const code = trackCode.trim().toUpperCase();
    if (!code) {
      setTrackError(isKhmer ? 'សូមបញ្ចូលលេខកូដតាមដានពាក្យសុំ (Tracking Code)' : 'Please enter your tracking code.');
      return;
    }

    setTrackLoading(true);

    try {
      const res = await api.get(`/admissions/track/${code}`);
      if (res.data?.success) {
        setTrackResult(res.data.data);
      }
    } catch (err) {
      console.error('Track application error:', err);
      setTrackError(
        isKhmer
          ? 'រកមិនឃើញទិន្នន័យពាក្យសុំដែលមានលេខកូដនេះទេ។ សូមពិនិត្យលេខកូដឡើងវិញ (ឧ. APP-2026-XXXX)។'
          : 'No application found with this tracking code. Please verify your code (e.g. APP-2026-XXXX).'
      );
    } finally {
      setTrackLoading(false);
    }
  };

  // Copy tracking code to clipboard
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '70px' }}>
      {/* =========================================================================
          1. INSTITUTIONAL DAYLIGHT HERO BANNER (Strictly AGENTS.md Standard)
          ========================================================================= */}
      <section
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
          borderBottom: '1px solid #e2e8f0',
          padding: 'clamp(35px, 5vw, 60px) 0 clamp(25px, 4vw, 40px)',
          textAlign: 'center'
        }}
      >
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '9999px',
              background: '#eff6ff',
              border: '1px solid #dbeafe',
              color: '#1e73be',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '16px'
            }}
          >
            <GraduationCap size={16} />
            <span>{isKhmer ? 'ការិយាល័យសិក្សា & ចុះឈ្មោះចូលរៀន RPITSSR' : 'RPITSSR Admissions & Academic Enrollment'}</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 800,
              color: '#07294D',
              margin: '0 0 12px 0',
              lineHeight: 1.25,
              letterSpacing: '-0.4px'
            }}
          >
            {isKhmer ? 'ការចុះឈ្មោះចូលរៀនតាមប្រព័ន្ធអនឡាញ' : 'Online Admission & Enrollment'}
          </h1>

          <p
            style={{
              color: '#64748b',
              fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
              maxWidth: '740px',
              margin: '0 auto 24px',
              lineHeight: 1.6
            }}
          >
            {isKhmer ? 'ដាក់ពាក្យសុំចូលរៀនតាមអនឡាញសម្រាប់ថ្នាក់បរិញ្ញាបត្របច្ចេកវិទ្យា ជាន់ខ្ពស់បច្ចេកទេស និងវគ្គបណ្តុះបណ្តាលវិជ្ជាជីវៈ TVET ១,៥ លាននាក់ (អាហារូបករណ៍ ១០០% ឥតគិតថ្លៃ)' : 'Apply online for Bachelor of Technology, Higher Diploma, and TVET 1.5M vocational scholarship programs.'}
          </p>

          {/* Tab Selector Buttons */}
          <div
            style={{
              display: 'inline-flex',
              background: '#ffffff',
              padding: '5px',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 14px rgba(7, 41, 77, 0.05)',
              gap: '6px'
            }}
          >
            <button
              onClick={() => setActiveTab('apply')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '12px',
                fontSize: '0.92rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: activeTab === 'apply' ? '#07294D' : 'transparent',
                color: activeTab === 'apply' ? '#ffffff' : '#64748b'
              }}
            >
              <FileText size={16} />
              <span>{isKhmer ? 'ទម្រង់បែបបទចុះឈ្មោះ' : 'Application Form'}</span>
            </button>

            <button
              onClick={() => setActiveTab('track')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '12px',
                fontSize: '0.92rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: activeTab === 'track' ? '#07294D' : 'transparent',
                color: activeTab === 'track' ? '#ffffff' : '#64748b'
              }}
            >
              <Search size={16} />
              <span>{isKhmer ? 'តាមដានស្ថានភាពពាក្យសុំ' : 'Track Application Status'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. MAIN CONTENT AREA
          ========================================================================= */}
      <div className="container" style={{ maxWidth: '960px', margin: '35px auto 0', padding: '0 20px' }}>
        {/* =========================================================
            TAB 1: APPLICATION FORM
            ========================================================= */}
        {activeTab === 'apply' && (
          <div>
            {submitSuccess ? (
              /* Success Confirmation Card */
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '24px',
                  border: '1px solid #bbf7d0',
                  boxShadow: '0 10px 30px rgba(7, 41, 77, 0.06)',
                  padding: 'clamp(28px, 5vw, 48px)',
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#f0fdf4',
                    border: '2px solid #bbf7d0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: '#16a34a'
                  }}
                >
                  <CheckCircle2 size={42} />
                </div>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 14px',
                    borderRadius: '9999px',
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    color: '#b45309',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    marginBottom: '12px'
                  }}
                >
                  <Sparkles size={14} />
                  <span>{isKhmer ? 'ទទួលបានពាក្យសុំរួចរាល់' : 'Application Received'}</span>
                </span>

                <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 1.95rem)', fontWeight: 800, color: '#07294D', margin: '0 0 10px' }}>
                  {isKhmer ? 'សូមអរគុណ! ពាក្យសុំរបស់អ្នកត្រូវបានបញ្ជូនដោយជោគជ័យ' : 'Thank You! Your Application Has Been Submitted'}
                </h2>

                <p style={{ color: '#64748b', fontSize: '0.98rem', maxWidth: '640px', margin: '0 auto 28px', lineHeight: 1.6 }}>
                  {isKhmer ? 'ការិយាល័យសិក្សានៃវិទ្យាស្ថាន RPITSSR នឹងពិនិត្យពាក្យសុំ ហើយទាក់ទងទៅកាន់អ្នកតាមទូរស័ព្ទ ឬ Telegram ក្នុងរយៈពេល ១ ទៅ ២ ថ្ងៃនៃថ្ងៃធ្វើការ។' : 'The RPITSSR Academic Affairs Office will review your application and reach out to you via Phone or Telegram within 1-2 business days.'}
                </p>

                {/* Tracking Code Highlight Box */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1.5px dashed #cbd5e1',
                    borderRadius: '18px',
                    padding: '24px',
                    maxWidth: '520px',
                    margin: '0 auto 30px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                    {isKhmer ? 'លេខកូដតាមដានពាក្យសុំផ្លូវការ (Tracking Code)' : 'Official Application Tracking Code'}
                  </div>
                  <div
                    style={{
                      fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
                      fontWeight: 900,
                      color: '#07294D',
                      letterSpacing: '2px',
                      fontFamily: 'monospace',
                      margin: '6px 0 12px'
                    }}
                  >
                    {submitSuccess.trackingCode}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyCode(submitSuccess.trackingCode)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 18px',
                      borderRadius: '10px',
                      background: copiedCode ? '#f0fdf4' : '#eff6ff',
                      border: `1px solid ${copiedCode ? '#bbf7d0' : '#bfdbfe'}`,
                      color: copiedCode ? '#16a34a' : '#1e73be',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {copiedCode ? <Check size={15} /> : <Copy size={15} />}
                    <span>{copiedCode ? (isKhmer ? 'បានចម្លងរួចរាល់!' : 'Copied!') : (isKhmer ? 'ចម្លងលេខកូដ' : 'Copy Tracking Code')}</span>
                  </button>
                  <p style={{ margin: '10px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                    {isKhmer ? 'សូមរក្សាទុកលេខកូដនេះដើម្បីពិនិត្យស្ថានភាពពាក្យសុំនៅពេលក្រោយ' : 'Please save this code to check your admission progress later'}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      setTrackCode(submitSuccess.trackingCode);
                      setActiveTab('track');
                      setSubmitSuccess(null);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      background: '#07294D',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <Search size={16} />
                    <span>{isKhmer ? 'ពិនិត្យស្ថានភាពឥឡូវនេះ' : 'Track Status Now'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setSubmitSuccess(null);
                      setFormData({
                        khmerName: '',
                        latinName: '',
                        gender: 'male',
                        dob: '',
                        phone: '',
                        telegram: '',
                        email: '',
                        currentAddress: '',
                        degreeLevel: 'bachelor',
                        major: options.majors[0]?.name || '',
                        shift: 'morning',
                        photoUrl: '',
                        certificateUrl: '',
                        idCardUrl: '',
                        equityCardUrl: '',
                        agreement: false
                      });
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      background: '#ffffff',
                      color: '#07294D',
                      border: '1px solid #cbd5e1',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      cursor: 'pointer'
                    }}
                  >
                    <FileText size={16} />
                    <span>{isKhmer ? 'ដាក់ពាក្យសុំថ្មីទៀត' : 'Submit Another Application'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Application Form Card */
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 20px rgba(7, 41, 77, 0.04)',
                  padding: 'clamp(24px, 4vw, 40px)'
                }}
              >
                {/* Government 100% Scholarship Notice Banner */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                    border: '1px solid #fde68a',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    marginBottom: '28px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px'
                  }}
                >
                  <Award size={24} className="flex-shrink-0 mt-1" style={{ color: '#d97706' }} />
                  <div>
                    <strong style={{ color: '#78350f', fontSize: '0.94rem', display: 'block', marginBottom: '3px' }}>
                      {isKhmer ? 'កម្មវិធីអាហារូបករណ៍រដ្ឋាភិបាល ១០០% បណ្តុះបណ្តាលជំនាញវិជ្ជាជីវៈ (TVET ១,៥ លាននាក់)' : 'Government TVET 1.5M 100% Scholarship Program'}
                    </strong>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#92400e', lineHeight: 1.5 }}>
                      {isKhmer ? 'សិស្ស-យុវជនមកពីគ្រួសារក្រីក្រ និងងាយរងហានិភ័យ (មានប័ណ្ណសមធម៌ ឬប័ណ្ណក្រីក្រ) ទទួលបានអាហារូបករណ៍ឥតគិតថ្លៃ ១០០% ព្រមទាំងប្រាក់ឧបត្ថម្ភ ២៨០,០០០ រៀល/ខែ។ សូមភ្ជាប់រូបភាពប័ណ្ណសមធម៌នៅផ្នែកទី ៣។' : 'Applicants holding IDPoor / Equity cards receive 100% tuition scholarships and 280,000 KHR monthly stipends. Please upload your equity card in Section 3.'}
                    </p>
                  </div>
                </div>

                {formError && (
                  <div
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      color: '#991b1b',
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '24px'
                    }}
                  >
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* =========================================================
                      SECTION 1: PERSONAL INFORMATION
                      ========================================================= */}
                  <div style={{ marginBottom: '32px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        paddingBottom: '12px',
                        borderBottom: '1.5px solid #f1f5f9',
                        marginBottom: '20px'
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: '#eff6ff',
                          color: '#1e73be',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.88rem'
                        }}
                      >
                        1
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#07294D', margin: 0 }}>
                        {isKhmer ? 'ព័ត៌មានផ្ទាល់ខ្លួនរបស់បេក្ខជន' : 'Personal Information'}
                      </h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
                      {/* Khmer Name */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                          {isKhmer ? 'គោត្តនាម និងនាម (ជាភាសាខ្មែរ)' : 'Full Name in Khmer'} *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.khmerName}
                          onChange={(e) => setFormData({ ...formData, khmerName: e.target.value })}
                          placeholder={isKhmer ? 'ឧ. សេង រិទ្ធី' : 'e.g. Seng Rithy'}
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.92rem',
                            outline: 'none'
                          }}
                        />
                      </div>

                      {/* Latin Name */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                          {isKhmer ? 'ឈ្មោះជាអក្សរឡាតាំង (Latin Name)' : 'Full Name in English (Latin)'} *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.latinName}
                          onChange={(e) => setFormData({ ...formData, latinName: e.target.value.toUpperCase() })}
                          placeholder="e.g. SENG RITHY"
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.92rem',
                            textTransform: 'uppercase',
                            outline: 'none'
                          }}
                        />
                      </div>

                      {/* Gender */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                          {isKhmer ? 'ភេទ (Gender)' : 'Gender'} *
                        </label>
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.92rem',
                            background: '#ffffff',
                            outline: 'none'
                          }}
                        >
                          <option value="male">{isKhmer ? 'ប្រុស (Male)' : 'Male'}</option>
                          <option value="female">{isKhmer ? 'ស្រី (Female)' : 'Female'}</option>
                          <option value="other">{isKhmer ? 'ផ្សេងទៀត (Other)' : 'Other'}</option>
                        </select>
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                          {isKhmer ? 'ថ្ងៃខែឆ្នាំកំណើត (Date of Birth)' : 'Date of Birth'} *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.dob}
                          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.92rem',
                            outline: 'none'
                          }}
                        />
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                          {isKhmer ? 'លេខទូរស័ព្ទទាក់ទង (Phone Number)' : 'Phone Number'} *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="e.g. 012 345 678"
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.92rem',
                            outline: 'none'
                          }}
                        />
                      </div>

                      {/* Telegram */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                          {isKhmer ? 'គណនី Telegram (Username/Phone)' : 'Telegram Account'}
                        </label>
                        <input
                          type="text"
                          value={formData.telegram}
                          onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                          placeholder="e.g. @username ឬលេខទូរស័ព្ទ"
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.92rem',
                            outline: 'none'
                          }}
                        />
                      </div>

                      {/* Personal Email */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                          {isKhmer ? 'អ៊ីមែលផ្ទាល់ខ្លួន (Personal Email)' : 'Personal Email'}
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="yourname@gmail.com"
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.92rem',
                            outline: 'none'
                          }}
                        />
                      </div>

                      {/* Current Address */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                          {isKhmer ? 'អាសយដ្ឋានបច្ចុប្បន្ន (Current Address)' : 'Current Address'}
                        </label>
                        <input
                          type="text"
                          value={formData.currentAddress}
                          onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                          placeholder={isKhmer ? 'ភូមិ, ឃុំ/សង្កាត់, ស្រុក/ខណ្ឌ, ខេត្ត/រាជធានី' : 'Village, Commune, District, Province'}
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.92rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* =========================================================
                      SECTION 2: ACADEMIC PROGRAM & SHIFT
                      ========================================================= */}
                  <div style={{ marginBottom: '32px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        paddingBottom: '12px',
                        borderBottom: '1.5px solid #f1f5f9',
                        marginBottom: '20px'
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: '#f0fdf4',
                          color: '#16a34a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.88rem'
                        }}
                      >
                        2
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#07294D', margin: 0 }}>
                        {isKhmer ? 'កម្រិតសិក្សា ជំនាញ និងវេនសិក្សា' : 'Academic Program & Shift'}
                      </h3>
                    </div>

                    {/* Program Type Selection (វគ្គខ្លី vs វគ្គវែង�) */}
                    <div style={{ marginBottom: '22px' }}>
                      <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: '#07294D', marginBottom: '10px' }}>
                        {isKhmer ? 'ប្រភេទវគ្គសិក្សា (Program Type)' : 'Program Type'} *
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '14px' }}>
                        {/* Option 1: វគ្គវែង (កម្រិតសញ្ញាបត្រ) */}
                        <div
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              courseType: 'long_term',
                              degreeLevel: prev.degreeLevel === 'tvet_short' || prev.degreeLevel === 'short_course' ? 'bachelor' : prev.degreeLevel
                            }));
                          }}
                          style={{
                            padding: '16px 18px',
                            borderRadius: '16px',
                            border: `2px solid ${formData.courseType === 'long_term' ? '#1e73be' : '#e2e8f0'}`,
                            background: formData.courseType === 'long_term' ? '#f0f7ff' : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: formData.courseType === 'long_term' ? '0 4px 14px rgba(30, 115, 190, 0.12)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '1.3rem' }}>🎓�</span>
                              <strong style={{ fontSize: '0.98rem', color: formData.courseType === 'long_term' ? '#07294D' : '#334155' }}>
                                {isKhmer ? 'វគ្គវែង (កម្រិតសញ្ញាបត្រ)' : 'Long-Term Degree Programs'}
                              </strong>
                            </div>
                            <span
                              style={{
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: formData.courseType === 'long_term' ? '#1e73be' : '#e2e8f0',
                                color: formData.courseType === 'long_term' ? '#ffffff' : '#475569'
                              }}
                            >
                              ២ - ៤ ឆ្នាំ
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                            {isKhmer ? 'បរិញ្ញាបត្របច្ចេកវិទ្យា (៤ ឆ្នាំ) និងសញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស / បរិញ្ញាបត្ររង (២ ឆ្នាំ) ទទួលស្គាល់ដោយក្រសួងការងារ។' : 'Bachelor of Technology (4 Years) & Higher Technical Diploma (2 Years). Accredited degree programs.'}
                          </p>
                        </div>

                        {/* Option 2: វគ្គខ្លី (បណ្តុះបណ្តាលវិជ្ជាជីវៈ & TVET) */}
                        <div
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              courseType: 'short_term',
                              degreeLevel: prev.degreeLevel === 'bachelor' || prev.degreeLevel === 'higher_diploma' ? 'tvet_short' : prev.degreeLevel
                            }));
                          }}
                          style={{
                            padding: '16px 18px',
                            borderRadius: '16px',
                            border: `2px solid ${formData.courseType === 'short_term' ? '#f59e0b' : '#e2e8f0'}`,
                            background: formData.courseType === 'short_term' ? '#fffbeb' : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: formData.courseType === 'short_term' ? '0 4px 14px rgba(245, 158, 11, 0.12)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '1.3rem' }}>⚡�</span>
                              <strong style={{ fontSize: '0.98rem', color: formData.courseType === 'short_term' ? '#92400e' : '#334155' }}>
                                {isKhmer ? 'វគ្គខ្លី (វិជ្ជាជីវៈ & TVET)' : 'Short-Term Vocational & TVET'}
                              </strong>
                            </div>
                            <span
                              style={{
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: formData.courseType === 'short_term' ? '#f59e0b' : '#e2e8f0',
                                color: formData.courseType === 'short_term' ? '#ffffff' : '#475569'
                              }}
                            >
                              ១ - ៤ ខែ (Free 100%)
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                            {isKhmer ? 'វគ្គ TVET ១,៥ លាននាក់ (C1, C2, C3) អាហារូបករណ៍ ១០០% ឥតគិតថ្លៃ + ប្រាក់ឧបត្ថម្ភ និងវគ្គខ្លីៗជាក់ស្តែង។' : 'TVET 1.5M (C1-C3) 100% free scholarship with monthly stipend and short practical vocational courses.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', marginBottom: '16px' }}>
                      {/* Degree Level */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                          {isKhmer ? 'កម្រិតសញ្ញាបត្រ (Degree Level)' : 'Degree Level'} *
                        </label>
                        <select
                          value={formData.degreeLevel}
                          onChange={(e) => setFormData({ ...formData, degreeLevel: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.92rem',
                            background: '#ffffff',
                            outline: 'none'
                          }}
                        >
                          {(options.degreeLevels || [])
                            .filter(deg => {
                              if (formData.courseType === 'long_term') {
                                return deg.courseType === 'long_term' || deg.id === 'bachelor' || deg.id === 'higher_diploma';
                              }
                              return deg.courseType === 'short_term' || deg.id === 'tvet_short' || deg.id === 'short_course';
                            })
                            .map((deg) => (
                              <option key={deg.id} value={deg.id}>
                                {isKhmer ? deg.nameKm : deg.nameEn}
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* Major Selection */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                          {isKhmer ? 'ជំនាញដែលចង់សិក្សា (Desired Major)' : 'Desired Major'} *
                        </label>
                        <select
                          value={formData.major}
                          onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                          required
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.92rem',
                            background: '#ffffff',
                            outline: 'none'
                          }}
                        >
                          <option value="">{isKhmer ? '-- សូមជ្រើសរើសជំនាញ --' : '-- Select Major --'}</option>
                          {options.majors?.map((m) => (
                            <option key={m.id || m.name} value={m.name}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Shift Selection */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                          {isKhmer ? 'វេនសិក្សា (Study Shift)' : 'Study Shift'} *
                        </label>
                        <select
                          value={formData.shift}
                          onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.92rem',
                            background: '#ffffff',
                            outline: 'none'
                          }}
                        >
                          {options.shifts?.map((s) => (
                            <option key={s.id} value={s.id}>
                              {isKhmer ? s.nameKm : s.nameEn}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Program Information Alert Box */}
                    {formData.courseType === 'long_term' ? (
                      <div
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #dbeafe',
                          borderLeft: '4px solid #1e73be',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          fontSize: '0.84rem',
                          color: '#334155',
                          lineHeight: 1.5
                        }}
                      >
                        <strong style={{ color: '#07294D', display: 'block', marginBottom: '4px' }}>
                          ℹ️ {isKhmer ? 'លក្ខខណ្ឌជ្រើសរើស (កម្រិតសញ្ញាបត្រ)៖' : 'Long-Term Program Requirements:'}
                        </strong>
                        {formData.degreeLevel === 'bachelor'
                          ? (isKhmer
                              ? '• បរិញ្ញាបត្របច្ចេកវិទ្យា (៤ ឆ្នាំ)៖ តម្រូវឱ្យមានសញ្ញាបត្របាក់ឌុប ឬសញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស (បន្ត ២ ឆ្នាំ)។'
                              : '• Bachelor of Technology (4 Years): Requires High School Diploma (Bac II) or Higher Technical Diploma for 2-year bridge program.')
                          : (isKhmer
                              ? '• សញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស / បរិញ្ញាបត្ររង (២ ឆ្នាំ)៖ ទទួលសិស្សជាប់បាក់ឌុប ធ្លាក់បាក់ឌុប ឬវិញ្ញាបនបត្រកម្រិត ៣ (C3)។'
                              : '• Higher Technical Diploma (2 Years): Open to Bac II graduates, Bac II participants, or TVET Level 3 (C3) holders.')}
                      </div>
                    ) : (
                      <div
                        style={{
                          background: '#fffbeb',
                          border: '1px solid #fed7aa',
                          borderLeft: '4px solid #f59e0b',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          fontSize: '0.84rem',
                          color: '#92400e',
                          lineHeight: 1.5
                        }}
                      >
                        <strong style={{ color: '#92400e', display: 'block', marginBottom: '4px' }}>
                          🌟 {isKhmer ? 'អត្ថប្រយោជន៍ និងអាហារូបករណ៍ (TVET ១,៥ លាននាក់)៖' : 'Short-Term & TVET 1.5M Scholarship Benefits:'}
                        </strong>
                        {formData.degreeLevel === 'tvet_short'
                          ? (isKhmer
                              ? '• អាហារូបករណ៍ ១០០% សម្រាប់យុវជនទូទៅ។ យុវជនមកពីគ្រួសារមានប័ណ្ណសមធម៌ ឬប័ណ្ណក្រីក្រ ទទួលបានប្រាក់ឧបត្ថម្ភ ២៨០,០០០ រៀល/ខែ និងជួយរកការងារឱ្យធ្វើ។'
                              : '• 100% Free Tuition for all youth. Beneficiaries holding Equity/IDPoor cards receive 280,000 KHR/month stipend and job placement.')
                          : (isKhmer
                              ? '• វគ្គខ្លីវិជ្ជាជីវៈ (១ ដល់ ៤ ខែ)៖ អនុវត្តជាក់ស្តែង ឆាប់ចេះ ឆាប់បានការងារធ្វើ និងពង្រឹងសមត្ថភាពបច្ចេកទេសបន្ថែម។'
                              : '• Short vocational courses (1-4 months): Practice-oriented training for fast employment and technical skill enhancement.')}
                      </div>
                    )}
                  </div>

                  {/* =========================================================
                      SECTION 3: SUPPORTING DOCUMENTS (UPLOAD)
                      ========================================================= */}
                  <div style={{ marginBottom: '32px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        paddingBottom: '12px',
                        borderBottom: '1.5px solid #f1f5f9',
                        marginBottom: '20px'
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: '#fff7ed',
                          color: '#ea580c',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.88rem'
                        }}
                      >
                        3
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#07294D', margin: 0 }}>
                          {isKhmer ? 'ឯកសារភ្ជាប់ (Supporting Documents)' : 'Supporting Documents'}
                        </h3>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {isKhmer ? 'សូមភ្ជាប់រូបភាព ឬឯកសារ PDF (ទំហំអតិបរមា 10MB ក្នុងមួយឯកសារ)' : 'Attach image or PDF files (max 10MB each)'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '16px' }}>
                      {/* Photo Upload */}
                      <div style={{ border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '16px', background: '#f8fafc', textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#07294D', marginBottom: '6px' }}>
                          {isKhmer ? '១. រូបថត 4x6 (Photo)' : '1. Passport Photo (4x6)'}
                        </div>
                        <label
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: '#1e73be'
                          }}
                        >
                          <Upload size={14} />
                          <span>{uploading.photo ? (isKhmer ? 'កំពុងបញ្ចូល...' : 'Uploading...') : (formData.photoUrl ? (isKhmer ? '✓ បានជ្រើសរើស' : '✓ Selected') : (isKhmer ? 'ជ្រើសរើសឯកសារ' : 'Select File'))}</span>
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'photo')} style={{ display: 'none' }} />
                        </label>
                        {formData.photoUrl && (
                          <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                            {isKhmer ? '✓ បានបញ្ចូលរួចរាល់' : '✓ Uploaded'}
                          </div>
                        )}
                      </div>

                      {/* High School Certificate / Diploma */}
                      <div style={{ border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '16px', background: '#f8fafc', textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#07294D', marginBottom: '6px' }}>
                          {isKhmer ? '២. សញ្ញាបត្របាក់ឌុប / វិញ្ញាបនបត្របញ្ជាក់ការសិក្សា' : '2. High School Diploma / Certificate'}
                        </div>
                        <label
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: '#1e73be'
                          }}
                        >
                          <Upload size={14} />
                          <span>{uploading.certificate ? (isKhmer ? 'កំពុងបញ្ចូល...' : 'Uploading...') : (formData.certificateUrl ? (isKhmer ? '✓ បានជ្រើសរើស' : '✓ Selected') : (isKhmer ? 'ជ្រើសរើសឯកសារ' : 'Select File'))}</span>
                          <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'certificate')} style={{ display: 'none' }} />
                        </label>
                        {formData.certificateUrl && (
                          <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                            {isKhmer ? '✓ បានបញ្ចូលរួចរាល់' : '✓ Uploaded'}
                          </div>
                        )}
                      </div>

                      {/* ID Card / Birth Certificate */}
                      <div style={{ border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '16px', background: '#f8fafc', textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#07294D', marginBottom: '6px' }}>
                          {isKhmer ? '៣. អត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរ / សំបុត្រកំណើត' : '3. National ID / Birth Certificate'}
                        </div>
                        <label
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: '#1e73be'
                          }}
                        >
                          <Upload size={14} />
                          <span>{uploading.idCard ? (isKhmer ? 'កំពុងបញ្ចូល...' : 'Uploading...') : (formData.idCardUrl ? (isKhmer ? '✓ បានជ្រើសរើស' : '✓ Selected') : (isKhmer ? 'ជ្រើសរើសឯកសារ' : 'Select File'))}</span>
                          <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'idCard')} style={{ display: 'none' }} />
                        </label>
                        {formData.idCardUrl && (
                          <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                            {isKhmer ? '✓ បានបញ្ចូលរួចរាល់' : '✓ Uploaded'}
                          </div>
                        )}
                      </div>

                      {/* Equity Card (Optional for TVET scholarship) */}
                      <div style={{ border: '1px dashed #fde68a', borderRadius: '12px', padding: '16px', background: '#fffbeb', textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#92400e', marginBottom: '6px' }}>
                          {isKhmer ? '៤. ប័ណ្ណសមធម៌ / ប័ណ្ណក្រីក្រ (បើមាន)' : '4. IDPoor / Equity Card (If Any)'}
                        </div>
                        <label
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            background: '#ffffff',
                            border: '1px solid #fde68a',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: '#d97706'
                          }}
                        >
                          <Upload size={14} />
                          <span>{uploading.equityCard ? (isKhmer ? 'កំពុងបញ្ចូល...' : 'Uploading...') : (formData.equityCardUrl ? (isKhmer ? '✓ បានជ្រើសរើស' : '✓ Selected') : (isKhmer ? 'ជ្រើសរើសឯកសារ' : 'Select File'))}</span>
                          <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'equityCard')} style={{ display: 'none' }} />
                        </label>
                        {formData.equityCardUrl && (
                          <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                            {isKhmer ? '✓ បានបញ្ចូលរួចរាល់' : '✓ Uploaded'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* =========================================================
                      SECTION 4: DECLARATION & SUBMIT
                      ========================================================= */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '20px',
                      marginBottom: '28px'
                    }}
                  >
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', margin: 0 }}>
                      <input
                        type="checkbox"
                        required
                        checked={formData.agreement}
                        onChange={(e) => setFormData({ ...formData, agreement: e.target.checked })}
                        style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.55 }}>
                        {isKhmer ? 'ខ្ញុំបាទ/នាងខ្ញុំសូមធានាអះអាងថា ព័ត៌មាន និងឯកសារដែលបានភ្ជាប់ទាំងអស់ខាងលើពិតជាត្រឹមត្រូវពិតប្រាកដមែន ហើយខ្ញុំសូមសន្យាថានឹងគោរពតាមបទបញ្ជាផ្ទៃក្នុង និងបទប្បញ្ញត្តិសិក្សារបស់វិទ្យាស្ថាន RPITSSR។' : 'I hereby declare that all information and documents submitted above are accurate and true, and I agree to adhere to the academic regulations and policies of RPITSSR.'}
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div style={{ textAlign: 'center' }}>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '14px 36px',
                        borderRadius: '9999px',
                        background: 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)',
                        color: '#ffffff',
                        fontSize: '1rem',
                        fontWeight: 800,
                        border: 'none',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        boxShadow: '0 8px 24px rgba(7, 41, 77, 0.2)',
                        transition: 'all 0.2s ease',
                        opacity: submitting ? 0.75 : 1
                      }}
                    >
                      <Send size={18} />
                      <span>{submitting ? (isKhmer ? 'កំពុងបញ្ជូនពាក្យសុំ...' : 'Submitting Application...') : (isKhmer ? '🚀 បញ្ជូនពាក្យសុំចុះឈ្មោះចូលរៀន' : '🚀 Submit Admission Application')}</span>
                    </button>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '10px' }}>
                      {isKhmer ? 'មិនមានការបង់ថ្លៃសេវាដាក់ពាក្យសុំឡើយ' : 'No application fee required'}
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TAB 2: TRACK APPLICATION STATUS
            ========================================================= */}
        {activeTab === 'track' && (
          <div>
            {/* Search Box */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(7, 41, 77, 0.04)',
                padding: 'clamp(24px, 4vw, 36px)',
                marginBottom: '28px'
              }}
            >
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#07294D', margin: '0 0 8px', textAlign: 'center' }}>
                {isKhmer ? 'តាមដានស្ថានភាពពាក្យសុំចុះឈ្មោះរបស់អ្នក' : 'Track Your Admission Application'}
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', maxWidth: '540px', margin: '0 auto 24px' }}>
                {isKhmer ? 'សូមបញ្ចូលលេខកូដតាមដានពាក្យសុំផ្លូវការរបស់អ្នកដែលទទួលបានក្រោយពេលដាក់ពាក្យ (ឧ. APP-2026-XXXX)' : 'Enter your official application tracking code (e.g. APP-2026-XXXX) to view current progress.'}
              </p>

              <form onSubmit={handleTrackSubmit} style={{ maxWidth: '520px', margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
                    <input
                      type="text"
                      required
                      value={trackCode}
                      onChange={(e) => setTrackCode(e.target.value.toUpperCase())}
                      placeholder="e.g. APP-2026-K92X"
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 42px',
                        borderRadius: '12px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        letterSpacing: '1px',
                        fontFamily: 'monospace',
                        textTransform: 'uppercase',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={trackLoading}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '12px',
                      background: '#07294D',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      border: 'none',
                      cursor: trackLoading ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Search size={16} />
                    <span>{trackLoading ? (isKhmer ? 'កំពុងស្វែងរក...' : 'Searching...') : (isKhmer ? 'ពិនិត្យ' : 'Check')}</span>
                  </button>
                </div>
              </form>

              {trackError && (
                <div
                  style={{
                    maxWidth: '520px',
                    margin: '18px auto 0',
                    padding: '12px 16px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '10px',
                    color: '#991b1b',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{trackError}</span>
                </div>
              )}
            </div>

            {/* Tracking Result Card */}
            {trackResult && (
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 6px 25px rgba(7, 41, 77, 0.05)',
                  padding: 'clamp(24px, 4vw, 36px)'
                }}
              >
                {/* Status Header Strip */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    paddingBottom: '20px',
                    borderBottom: '1px solid #f1f5f9',
                    marginBottom: '24px'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                      {isKhmer ? 'លេខកូដតាមដាន' : 'Tracking Code'}
                    </span>
                    <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#07294D', margin: 0, fontFamily: 'monospace' }}>
                      {trackResult.trackingCode}
                    </h3>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {trackResult.status === 'enrolled' ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 16px',
                          borderRadius: '9999px',
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          color: '#16a34a',
                          fontWeight: 800,
                          fontSize: '0.88rem'
                        }}
                      >
                        <CheckCircle2 size={16} />
                        <span>{isKhmer ? '✓� បានចុះឈ្មោះចូលរៀនជាផ្លូវការ (Enrolled)' : '✓� Enrolled as Student'}</span>
                      </span>
                    ) : trackResult.status === 'approved' ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 16px',
                          borderRadius: '9999px',
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          color: '#16a34a',
                          fontWeight: 800,
                          fontSize: '0.88rem'
                        }}
                      >
                        <CheckCircle2 size={16} />
                        <span>{isKhmer ? '✓ បានអនុម័តពាក្យសុំ (Approved)' : '✓ Approved'}</span>
                      </span>
                    ) : trackResult.status === 'contacted' ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 16px',
                          borderRadius: '9999px',
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          color: '#1e73be',
                          fontWeight: 800,
                          fontSize: '0.88rem'
                        }}
                      >
                        <Phone size={16} />
                        <span>{isKhmer ? '📞 បានទាក់ទងបេក្ខជន (Contacted)' : '📞 Contacted'}</span>
                      </span>
                    ) : trackResult.status === 'rejected' ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 16px',
                          borderRadius: '9999px',
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          color: '#dc2626',
                          fontWeight: 800,
                          fontSize: '0.88rem'
                        }}
                      >
                        <AlertCircle size={16} />
                        <span>{isKhmer ? '✓� មិនទាន់អនុម័ត (Rejected)' : '✓� Rejected'}</span>
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 16px',
                          borderRadius: '9999px',
                          background: '#fef3c7',
                          border: '1px solid #fde68a',
                          color: '#b45309',
                          fontWeight: 800,
                          fontSize: '0.88rem'
                        }}
                      >
                        <Clock size={16} />
                        <span>{isKhmer ? '⏳ កំពុងរង់ចាំការពិនិត្យ (Pending Review)' : '⏳ Pending Review'}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Visual 3-Step Timeline */}
                <div style={{ marginBottom: '32px', padding: '10px 0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', position: 'relative' }}>
                    {/* Step 1: Submitted */}
                    <div style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: '#07294D',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 8px',
                          fontWeight: 800,
                          fontSize: '0.85rem'
                        }}
                      >
                        ✓
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#07294D' }}>
                        {isKhmer ? 'បានដាក់ពាក្យ' : 'Submitted'}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                        {new Date(trackResult.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Step 2: Under Review / Contacted */}
                    <div style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: trackResult.status !== 'pending' ? '#07294D' : '#fef3c7',
                          color: trackResult.status !== 'pending' ? '#ffffff' : '#d97706',
                          border: trackResult.status === 'pending' ? '2px solid #fde68a' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 8px',
                          fontWeight: 800,
                          fontSize: '0.85rem'
                        }}
                      >
                        {trackResult.status !== 'pending' ? '✓' : '2'}
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#07294D' }}>
                        {isKhmer ? 'កំពុងពិនិត្យ / ផ្ទៀងផ្ទាត់' : 'Under Review'}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                        {trackResult.status === 'contacted' ? (isKhmer ? 'បានទាក់ទង' : 'Contacted') : (isKhmer ? 'ការិយាល័យសិក្សា' : 'Academic Affairs')}
                      </div>
                    </div>

                    {/* Step 3: Decision / Enrolled */}
                    <div style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: ['approved', 'enrolled'].includes(trackResult.status) ? '#16a34a' : trackResult.status === 'rejected' ? '#dc2626' : '#f1f5f9',
                          color: ['approved', 'enrolled', 'rejected'].includes(trackResult.status) ? '#ffffff' : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 8px',
                          fontWeight: 800,
                          fontSize: '0.85rem'
                        }}
                      >
                        {['approved', 'enrolled'].includes(trackResult.status) ? '✓' : trackResult.status === 'rejected' ? '✓' : '3'}
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#07294D' }}>
                        {trackResult.status === 'enrolled'
                          ? (isKhmer ? 'បានចុះឈ្មោះ' : 'Enrolled')
                          : trackResult.status === 'approved'
                          ? (isKhmer ? 'បានអនុម័ត' : 'Approved')
                          : trackResult.status === 'rejected'
                          ? (isKhmer ? 'មិនទាន់អនុម័ត' : 'Rejected')
                          : (isKhmer ? 'ការសម្រេចផ្លូវការ' : 'Official Decision')}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                        {trackResult.enrolledStudentId || (isKhmer ? 'ជំហានចុងក្រោយ' : 'Final Step')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
                    gap: '16px',
                    background: '#f8fafc',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '24px'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.76rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                      {isKhmer ? 'ឈ្មោះបេក្ខជន' : 'Applicant Name'}
                    </span>
                    <div style={{ fontWeight: 800, color: '#07294D', fontSize: '1rem', marginTop: '2px' }}>
                      {trackResult.khmerName} ({trackResult.latinName})
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.76rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                      {isKhmer ? 'កម្រិតសិក្សា & ជំនាញ' : 'Program & Major'}
                    </span>
                    <div style={{ fontWeight: 700, color: '#07294D', fontSize: '0.92rem', marginTop: '2px' }}>
                      {trackResult.major}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.76rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                      {isKhmer ? 'វេនសិក្សា' : 'Shift'}
                    </span>
                    <div style={{ fontWeight: 700, color: '#1e73be', fontSize: '0.92rem', marginTop: '2px' }}>
                      {trackResult.shift === 'morning' ? (isKhmer ? 'វេនព្រឹក' : 'Morning') : trackResult.shift === 'afternoon' ? (isKhmer ? 'វេនរសៀល' : 'Afternoon') : trackResult.shift === 'evening' ? (isKhmer ? 'វេនយប់' : 'Evening') : (isKhmer ? 'វេនចុងសប្តាហ៍' : 'Weekend')}
                    </div>
                  </div>

                  {trackResult.enrolledStudentId && (
                    <div>
                      <span style={{ fontSize: '0.76rem', color: '#16a34a', textTransform: 'uppercase', fontWeight: 700 }}>
                        {isKhmer ? 'អត្តលេខនិស្សិតផ្លូវការ (Student ID)' : 'Official Student ID'}
                      </span>
                      <div style={{ fontWeight: 900, color: '#16a34a', fontSize: '1.05rem', marginTop: '2px' }}>
                        {trackResult.enrolledStudentId}
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin Notes Notice */}
                {trackResult.adminNotes && (
                  <div
                    style={{
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '12px',
                      padding: '16px',
                      color: '#1e40af',
                      fontSize: '0.88rem',
                      lineHeight: 1.55,
                      marginBottom: '20px'
                    }}
                  >
                    <strong style={{ display: 'block', marginBottom: '4px' }}>
                      {isKhmer ? '📢 សេចក្តីជូនដំណឹងពីការិយាល័យសិក្សា៖' : '📢 Notice from Academic Affairs:'}
                    </strong>
                    {trackResult.adminNotes}
                  </div>
                )}

                {/* If Enrolled: Provide direct link to register portal */}
                {trackResult.status === 'enrolled' && (
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                      border: '1px solid #bbf7d0',
                      borderRadius: '16px',
                      padding: '20px',
                      textAlign: 'center'
                    }}
                  >
                    <h4 style={{ color: '#166534', fontWeight: 800, margin: '0 0 8px' }}>
                      {isKhmer ? '🎉 អបអរសាទរ! អ្នកអាចបង្កើតគណនីនិស្សិតបានហើយ' : 'Congratulations! You Can Now Create Your Student Account'}
                    </h4>
                    <p style={{ color: '#15803d', fontSize: '0.88rem', maxWidth: '560px', margin: '0 auto 16px' }}>
                      {isKhmer
                        ? `អ្នកត្រូវបានផ្តល់អត្តលេខនិស្សិត ${trackResult.enrolledStudentId} រួចរាល់ហើយ។ សូមចុចប៊ូតុងខាងក្រោមដើម្បីបង្កើតគណនីប្រើប្រាស់ Student Dashboard។`
                        : `You have been assigned Student ID ${trackResult.enrolledStudentId}. Click below to activate your Student Dashboard account.`}
                    </p>
                    <Link
                      to="/register"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 24px',
                        borderRadius: '9999px',
                        background: '#16a34a',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        textDecoration: 'none',
                        boxShadow: '0 4px 14px rgba(22, 163, 74, 0.25)'
                      }}
                    >
                      <User size={16} />
                      <span>{isKhmer ? 'បង្កើតគណនីនិស្សិត (Register Portal Account)' : 'Register Portal Account'}</span>
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdmissionApplyPage;
