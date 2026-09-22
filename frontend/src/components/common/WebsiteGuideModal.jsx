import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import {
  Compass,
  GraduationCap,
  FileCheck2,
  Download,
  MapPin,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Award,
  Phone,
  BookOpen
} from 'lucide-react';

export const WebsiteGuideModal = () => {
  const { currentLanguage, language } = useLanguage();
  const isKhmer = currentLanguage === 'km' || language === 'km';
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Guide Steps definition
  const steps = [
    {
      id: 'courses',
      badge: isKhmer ? 'ជំហានទី ១៖ វគ្គសិក្សា & អាហារូបករណ៍' : 'Step 1: Courses & Scholarships',
      title: isKhmer ? 'ស្វែងរកជំនាញ & អាហារូបករណ៍ ១០០%' : 'Explore Programs & 100% Scholarships',
      subtitle: isKhmer
        ? 'ស្វែងរកមុខជំនាញបច្ចេកទេស និងវិជ្ជាជីវៈ (កម្រិតសញ្ញាបត្រជាន់ខ្ពស់, បរិញ្ញាបត្រ, និងវគ្គឥតគិតថ្លៃ TVET 1.5M) រួមជាមួយការចុះឈ្មោះរៀនតាមអនឡាញយ៉ាងងាយស្រួល។'
        : 'Discover technical and vocational programs (High Diploma, Bachelor, and 100% Free TVET 1.5M programs) and enroll online seamlessly.',
      icon: GraduationCap,
      themeColor: '#ca8a04',
      themeBg: '#fefce8',
      themeBorder: '#fef08a',
      highlights: [
        isKhmer ? 'កម្មវិធីបណ្តុះបណ្តាល TVET 1.5M ឥតគិតថ្លៃ ១០០% + ប្រាក់ឧបត្ថម្ភ' : '100% Free TVET 1.5M Programs + Monthly Allowance',
        isKhmer ? 'បន្ទប់ពិសោធន៍ និងរោងជាងបច្ចេកវិទ្យាទំនើបកម្រិត Industry 4.0' : 'State-of-the-art 4.0 workshops and modern computer labs',
        isKhmer ? 'ឱកាសការងារខ្ពស់ ៩៥% និងចុះកម្មសិក្សាផ្ទាល់នៅក្រុមហ៊ុនដៃគូ' : '95% employment rate with direct enterprise internships',
      ],
      actionLabel: isKhmer ? '📖 ទៅកាន់ទំព័រវគ្គសិក្សាទាំងអស់' : '📖 Browse All Courses',
      path: '/courses',
    },
    {
      id: 'exam',
      badge: isKhmer ? 'ជំហានទី ២៖ លទ្ធផលប្រឡង & ការសិក្សា' : 'Step 2: Exam Results & Academics',
      title: isKhmer ? 'ពិនិត្យលទ្ធផលប្រឡង & កាលវិភាគ' : 'Check Exam Results & Schedules',
      subtitle: isKhmer
        ? 'ពិនិត្យលទ្ធផលប្រឡងបញ្ចប់វគ្គ ប្រឡងឆមាស និងតារាងកាលវិភាគសិក្សាផ្លូវការរបស់វិទ្យាស្ថានដោយគ្រាន់តែវាយបញ្ចូលលេខអត្តសញ្ញាណប័ណ្ណ ឬលេខកូដសិស្ស។'
        : 'Quickly check semester exams, final grades, and official training schedules by entering student ID or exam roll code.',
      icon: FileCheck2,
      themeColor: '#1e73be',
      themeBg: '#eff6ff',
      themeBorder: '#dbeafe',
      highlights: [
        isKhmer ? 'ស្វែងរកលទ្ធផលប្រឡងឆាប់រហ័សតាមលេខកូដ ឬឈ្មោះសិស្ស' : 'Instant grade search by student ID or full name',
        isKhmer ? 'ទាញយក និងពិនិត្យមើលតារាងនិទ្ទេសផ្លូវការ' : 'View official grades, evaluation rankings and statuses',
        isKhmer ? 'តាមដានសេចក្តីជូនដំណឹងសិក្សា និងកាលបរិច្ឆេទប្រឡងថ្មីៗ' : 'Keep track of upcoming exam dates and academic notices',
      ],
      actionLabel: isKhmer ? '📊 ពិនិត្យលទ្ធផលប្រឡង' : '📊 Check Exam Results',
      path: '/exam-result',
    },
    {
      id: 'downloads',
      badge: isKhmer ? 'ជំហានទី ៣៖ ទាញយកឯកសារ & ទម្រង់បែបបទ' : 'Step 3: Official Downloads & Forms',
      title: isKhmer ? 'មជ្ឈមណ្ឌលទាញយកឯកសារផ្លូវការ' : 'Official Document Download Center',
      subtitle: isKhmer
        ? 'ច្រកទ្វារផ្លូវកាត់សម្រាប់ទាញយកពាក្យសុំចុះឈ្មោះចូលរៀន សេចក្តីជូនដំណឹង កម្មវិធីសិក្សាលម្អិត និងទម្រង់បែបបទរដ្ឋបាលផ្សេងៗជាទម្រង់ PDF។'
        : 'Direct gateway to download admission forms, scholarship applications, curriculum outlines, and official institute templates in PDF format.',
      icon: Download,
      themeColor: '#059669',
      themeBg: '#f0fdf4',
      themeBorder: '#bbf7d0',
      highlights: [
        isKhmer ? 'ទម្រង់ពាក្យសុំចុះឈ្មោះចូលរៀនគ្រប់កម្រិត និងអាហារូបករណ៍' : 'Admission and scholarship application forms in PDF',
        isKhmer ? 'ឯកសារពិពណ៌នាមុខវិជ្ជា និងកម្មវិធីបណ្តុះបណ្តាលលម្អិត' : 'Detailed course syllabus and syllabus blueprints',
        isKhmer ? 'ទាញយកឯកសារផ្លូវការបានយ៉ាងរហ័ស និងឥតគិតថ្លៃ' : 'Instant free downloads with one single click',
      ],
      actionLabel: isKhmer ? '📥 ទៅកាន់មជ្ឈមណ្ឌលទាញយក' : '📥 Go to Downloads',
      path: '/downloads',
    },
    {
      id: 'contact',
      badge: isKhmer ? 'ជំហានទី ៤៖ ទំនាក់ទំនង & ទីតាំង' : 'Step 4: Contact & Campus Location',
      title: isKhmer ? 'ទំនាក់ទំនង & ទីតាំងវិទ្យាស្ថានផ្ទាល់' : 'Contact Us & Campus Location',
      subtitle: isKhmer
        ? 'ព័ត៌មានទំនាក់ទំនងផ្ទាល់ជាមួយការិយាល័យសិក្សា ការិយាល័យរដ្ឋបាល តាមរយៈទូរស័ព្ទ Telegram និងផែនទី Google Maps មកកាន់បរិវេណវិទ្យាស្ថានក្នុងក្រុងសៀមរាប។'
        : 'Direct communication channels with our academic office, administrative team via hotline, Telegram, and interactive Google Maps in Siem Reap.',
      icon: MapPin,
      themeColor: '#7c3aed',
      themeBg: '#faf5ff',
      themeBorder: '#e9d5ff',
      highlights: [
        isKhmer ? 'ទូរស័ព្ទទំនាក់ទំនង៖ 096 666 0306 / 089 483 623 / 069 728 996' : 'Hotlines: 096 666 0306 / 089 483 623 / 069 728 996',
        isKhmer ? 'ឆានែល Telegram ផ្លូវការផ្តល់ការប្រឹក្សា និងព័ត៌មាន ២៤/៧' : 'Official Telegram community for 24/7 counseling',
        isKhmer ? 'ទីតាំង៖ ខាងកើតផ្សារសាមគ្គី ៧០ ម៉ែត្រ ក្រុងសៀមរាប' : 'Location: 70m East of Samaki Market, Siem Reap City',
      ],
      actionLabel: isKhmer ? '📍 ទំនាក់ទំនង & មើលទីតាំង' : '📍 Contact & Location',
      path: '/contact',
    },
  ];

  // Auto-launch for first-time visitors
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('rpitssr_website_guide_seen');
    if (!hasSeenGuide) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen to global open event from header / navbar or floating button
  useEffect(() => {
    const handleOpen = () => {
      setCurrentStep(0);
      setIsOpen(true);
    };
    window.addEventListener('open-website-guide', handleOpen);
    return () => window.removeEventListener('open-website-guide', handleOpen);
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('rpitssr_website_guide_seen', 'true');
    }
    setIsOpen(false);
  };

  const handleComplete = () => {
    localStorage.setItem('rpitssr_website_guide_seen', 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleJumpToPage = (path) => {
    handleClose();
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeStep = steps[currentStep];
  const StepIcon = activeStep.icon;

  return (
    <>
      {/* Floating Trigger Button on Bottom-Left */}
      <div className="website-guide-floating-wrapper">
        <button
          type="button"
          onClick={() => {
            setCurrentStep(0);
            setIsOpen(true);
          }}
          className="website-guide-floating-btn"
          title={isKhmer ? 'មគ្គុទ្ទេសក៍ណែនាំគេហទំព័រ' : 'Website Quick Guide'}
        >
          <Compass size={18} className="guide-compass-icon" />
          <span className="guide-floating-text">
            {isKhmer ? 'មគ្គុទ្ទេសក៍' : 'Site Guide'}
          </span>
        </button>
      </div>

      {/* Interactive Modal */}
      {isOpen && (
        <div className="website-guide-backdrop" onClick={handleClose}>
          <div
            className="website-guide-modal-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Mobile Drag Handle Indicator */}
            <div className="guide-modal-handle-bar" />

            {/* Modal Header */}
            <div className="website-guide-header">
              <div className="guide-header-title-row">
                <div className="guide-brand-icon">
                  <Compass size={22} color="#1e73be" />
                </div>
                <div>
                  <h3 className="guide-main-heading">
                    {isKhmer ? 'មគ្គុទ្ទេសក៍ណែនាំគេហទំព័រ' : 'RPITSSR Website Quick Guide'}
                  </h3>
                  <div className="guide-sub-heading">
                    {isKhmer
                      ? 'ស្វែងយល់ពីច្រកទ្វារសំខាន់ៗនៃវិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប'
                      : 'Explore essential gateways of Techo Sen Siem Reap Polytechnic'}
                  </div>
                </div>
              </div>

              <div className="guide-header-right">
                <span className="guide-step-counter-badge">
                  <span className="guide-counter-full">
                    {isKhmer
                      ? `ជំហាន ${currentStep + 1} នៃ ${steps.length}`
                      : `Step ${currentStep + 1} of ${steps.length}`}
                  </span>
                  <span className="guide-counter-short">
                    {isKhmer
                      ? `ជំហាន ${currentStep + 1}/${steps.length}`
                      : `${currentStep + 1}/${steps.length}`}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handleClose}
                  className="guide-close-btn"
                  aria-label="Close Guide"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="guide-stepper-track">
              {steps.map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => setCurrentStep(idx)}
                  className={`guide-stepper-segment ${
                    idx === currentStep ? 'active' : idx < currentStep ? 'completed' : ''
                  }`}
                  title={s.title}
                />
              ))}
            </div>

            {/* Modal Body / Active Step Content */}
            <div className="website-guide-body">
              <div className="guide-step-card">
                {/* Step Header Badge */}
                <div className="guide-step-top-meta">
                  <div
                    className="guide-step-icon-badge"
                    style={{
                      backgroundColor: activeStep.themeBg,
                      borderColor: activeStep.themeBorder,
                      color: activeStep.themeColor,
                    }}
                  >
                    <StepIcon size={24} />
                  </div>
                  <div>
                    <span
                      className="guide-step-category-pill"
                      style={{
                        backgroundColor: activeStep.themeBg,
                        color: activeStep.themeColor,
                        borderColor: activeStep.themeBorder,
                      }}
                    >
                      {activeStep.badge}
                    </span>
                    <h4 className="guide-step-title">{activeStep.title}</h4>
                  </div>
                </div>

                {/* Subtitle / Description */}
                <p className="guide-step-description">{activeStep.subtitle}</p>

                {/* Highlights List */}
                <div className="guide-step-highlights">
                  <div className="guide-highlights-title">
                    <Sparkles size={14} color="#ca8a04" />
                    <span>{isKhmer ? 'ចំណុចសំខាន់ៗដែលគួរដឹង៖' : 'Key Highlights:'}</span>
                  </div>
                  <ul className="guide-highlights-list">
                    {activeStep.highlights.map((h, i) => (
                      <li key={i}>
                        <CheckCircle2 size={16} color="#059669" className="highlight-check" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Direct Action Link to Page */}
                <div className="guide-direct-link-wrap">
                  <button
                    type="button"
                    onClick={() => handleJumpToPage(activeStep.path)}
                    className="guide-direct-action-btn"
                  >
                    <span>{activeStep.actionLabel}</span>
                    <ArrowRight size={15} />
                  </button>
                  <span className="guide-direct-hint">
                    {isKhmer ? '(ចុចដើម្បីចូលទៅកាន់ទំព័រនេះភ្លាមៗ)' : '(Click to jump directly to page)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="website-guide-footer">
              <div className="guide-footer-nav-buttons">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="guide-btn-secondary"
                  >
                    <ArrowLeft size={16} />
                    <span>{isKhmer ? 'ថយក្រោយ' : 'Back'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="guide-btn-primary"
                >
                  <span>
                    {currentStep === steps.length - 1
                      ? isKhmer ? '✓ រួចរាល់ / ចាប់ផ្តើម' : '✓ Got it / Finish'
                      : isKhmer ? 'បន្ទាប់ →' : 'Next →'}
                  </span>
                </button>
              </div>

              <label className="guide-dont-show-again">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                />
                <span>
                  {isKhmer ? 'កុំបង្ហាញសារនេះម្តងទៀត' : 'Don\'t show automatically again'}
                </span>
              </label>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
