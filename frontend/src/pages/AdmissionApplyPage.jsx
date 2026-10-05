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
  ArrowLeft,
  Sparkles,
  MapPin,
  Briefcase,
  Heart,
  Users,
  Printer,
  Download,
  ShieldCheck,
  Calendar,
  Building,
  FileCheck,
  ExternalLink,
  Info
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/client';
import { PrintableAdmissionForm } from '../components/common/PrintableAdmissionForm';

export const AdmissionApplyPage = () => {
  const { currentLanguage, language } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  // Active Tab: 'apply' or 'track'
  const [activeTab, setActiveTab] = useState('apply');

  // Wizard Step: 1 (Program & Major), 2 (Personal & Bio - Section A), 3 (Education & Work - Sections B, C, D), 4 (Equity & Documents - Section E)
  const [currentStep, setCurrentStep] = useState(1);

  // Mock Admission data for instant test preview
  const isTestPrint = typeof window !== 'undefined' && window.location.search.includes('test_print');
  const mockAdmissionData = {
    trackingCode: 'RPITSSR-2026-0001',
    khmerName: 'សុខ ចាន់ដារ៉ា',
    latinName: 'SOK CHANDARA',
    gender: 'male',
    dob: '2005-04-12',
    ethnicity: 'ខ្មែរ',
    nationality: 'កម្ពុជា',
    religion: 'ព្រះពុទ្ធ',
    phone: '012 345 678',
    guardianPhone: '098 765 432',
    guardianName: 'សុខ គឹមហេង',
    guardianRelation: 'ឪពុក',
    pob: 'ភូមិបន្ទាយចាស់ ឃុំព្រះនេត្រព្រះ ស្រុកព្រះនេត្រព្រះ ខេត្តបន្ទាយមានជ័យ',
    pobVillage: 'បន្ទាយចាស់',
    pobCommune: 'ព្រះនេត្រព្រះ',
    pobDistrict: 'ព្រះនេត្រព្រះ',
    pobProvince: 'បន្ទាយមានជ័យ',
    currentAddress: 'ភូមិវត្តបូព៌ ឃុំសាលាកំរើក ស្រុកសៀមរាប ខេត្តសៀមរាប',
    houseNumber: '128',
    streetNumber: '7',
    groupNumber: '3',
    currentVillage: 'វត្តបូព៌',
    currentCommune: 'សាលាកំរើក',
    currentDistrict: 'ក្រុងសៀមរាប',
    currentProvince: 'ខេត្តសៀមរាប',
    guardianAddress: 'ភូមិវត្តបូព៌ ឃុំសាលាកំរើក ក្រុងសៀមរាប ខេត្តសៀមរាប',
    educationLevel: 'ថ្នាក់ទី១២ (បាក់ឌុប)',
    schoolGraduationYear: '២០២៤',
    previousSchool: 'វិទ្យាល័យ ១០ មករា ១៩៧៩',
    degreeLevel: 'higher_diploma',
    major: 'ព័ត៌មានវិទ្យា',
    shift: 'morning_afternoon',
    studyType: 'scholarship',
    academicYear: '២០២៦-២០២៧',
    idCardNumber: '020492819',
    distanceKm: '3.5',
    familyMembersCount: '4',
    maritalStatus: 'single',
    commuteMethod: 'own_motorcycle',
    employmentStatus: 'unemployed',
    workObstacle: 'studying',
  };

  const testMode = (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('test_mode')) || 'all';
  const isBlank = typeof window !== 'undefined' && window.location.search.includes('blank=true');

  // Official Standard Printable Document State
  const [printModalOpen, setPrintModalOpen] = useState(isTestPrint);
  const [printTargetAdmission, setPrintTargetAdmission] = useState(isTestPrint ? (isBlank ? {} : mockAdmissionData) : null);
  const [printDefaultMode, setPrintDefaultMode] = useState(isTestPrint ? testMode : 'voucher');

  const handleOpenPrint = (admData, mode = 'voucher') => {
    setPrintTargetAdmission(admData);
    setPrintDefaultMode(mode);
    setPrintModalOpen(true);
  };

  // Form Options (loaded from API with fallbacks)
  const [options, setOptions] = useState({
    programTypes: [],
    degreeLevels: [],
    majors: [],
    shifts: [],
    indigenousGroups: [],
    disabilityTypes: [],
    commuteMethods: [],
    maritalStatuses: [],
    employmentStatuses: []
  });
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Form State (Complete mapping to FR02 - RPITSSR/ETO/PR01/FR02)
  const [formData, setFormData] = useState({
    // Step 1: Program & Choice
    courseType: 'long_term', // 'long_term' | 'short_term'
    studyType: 'scholarship', // 'scholarship' (អាហារូបករណ៍) | 'paying' (បង់ថ្លៃ)
    academicYear: '2026-2027',
    degreeLevel: 'bachelor',
    major: '',
    shift: 'morning',

    // Step 2: Personal Info & Bio (Section A)
    khmerName: '',
    latinName: '',
    gender: 'male',
    dob: '',
    idCardNumber: '',
    studentCardNo: '',
    nationality: 'កម្ពុជា',
    ethnicity: 'ខ្មែរ',
    religion: 'ព្រះពុទ្ធ',
    pob: '', // ទីកន្លែងកំណើត
    permanentAddress: '', // ទីលំនៅអចិន្ត្រៃយ៍
    currentAddress: '', // អាសយដ្ឋានបច្ចុប្បន្ន
    phone: '',
    telegram: '',
    email: '',
    distanceKm: '',
    maritalStatus: 'single',
    familyMembersCount: '',
    commuteMethod: 'own_motorcycle',
    guardianName: '',
    guardianRelation: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianAddress: '',

    // Step 3: General Education & Employment (Sections B, C, D)
    educationLevel: 'ថ្នាក់ទី ១២ (បាក់ឌុប)',
    isStudyingGeneral: false,
    previousSchool: '',
    schoolGraduationYear: '2025',
    previousTraining: '',
    employmentStatus: 'unemployed',
    jobTitle: '',
    incomeType: 'ប្រចាំខែ',
    personalIncome: '',
    familyIncome: '',
    employmentType: 'បុគ្គលិកទទួលប្រាក់ឈ្នួល',

    // Step 4: Social Equity & Attached Documents (Section E & Docs)
    workObstacle: '',
    hasDisability: false,
    disabilityType: '',
    disabilityTiming: 'birth',
    isIndigenous: false,
    indigenousGroup: '',
    isOrphan: false,
    hasEquityCard: false,
    equityCardNumber: '',
    equityCardType: 'កម្រិត ១ (ក្រីក្រខ្លាំង)',

    // Uploaded URLs
    photoUrl: '',
    certificateUrl: '',
    idCardUrl: '',
    familyBookUrl: '',
    birthCertificateUrl: '',
    equityCardUrl: '',

    // Agreement & Signature
    agreement: false
  });

  // Uploading state per file
  const [uploading, setUploading] = useState({
    photo: false,
    certificate: false,
    idCard: false,
    familyBook: false,
    birthCertificate: false,
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

  // Fallback / Preset Options
  const DEFAULT_INDIGENOUS = [
    'ព្រៅ (Brao)', 'ចារាយ (Jarai)', 'កាចាក (Kachac)', 'គ្រឹង (Kreung)',
    'គួយ (Kuy)', 'លុន (Lun)', 'រូង (Roong)', 'ស្ទៀង (Stieng)',
    'រាដេ (Rhade)', 'ខ្លឹង (Kleung)', 'ក្រោល (Kraol)', 'ក្រាវ៉ែត (Kravet)',
    'មែល (Mel)', 'ភ្នង (Phnong)', 'ព័រ (Poar)', 'ទំពូន (Tampuon)',
    'ថ្មូន (Thmaun)', 'ផ្សេងៗ (Other)'
  ];

  // Fetch Options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const res = await api.get('/admissions/options');
        if (res.data) {
          setOptions(prev => ({
            ...prev,
            ...res.data,
            indigenousGroups: res.data.indigenousGroups?.length ? res.data.indigenousGroups : DEFAULT_INDIGENOUS
          }));

          if (res.data.degreeLevels?.length && !formData.degreeLevel) {
            setFormData(prev => ({ ...prev, degreeLevel: res.data.degreeLevels[0].id }));
          }

          if (res.data.majors?.length && !formData.major) {
            setFormData(prev => ({
              ...prev,
              major: res.data.majors[0].nameKm || res.data.majors[0].name
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load admission options:', err);
        setOptions(prev => ({
          ...prev,
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
              id: 'c3',
              courseType: 'long_term',
              nameKm: 'សញ្ញាបត្របច្ចេកទេស និងវិជ្ជាជីវៈ ៣ (C3 - ១ ឆ្នាំ)',
              nameEn: 'Technical & Vocational Certificate 3 (C3)',
              shortName: 'ប.រ.វិ ៣ (C3)',
              duration: '១ ឆ្នាំ',
              scholarship: 'អាហារូបករណ៍រដ្ឋ',
              requirementKm: 'បានបញ្ចប់កម្រិត C2 ឬចប់ថ្នាក់ទី ១១'
            },
            {
              id: 'tvet_short',
              courseType: 'short_term',
              nameKm: 'វគ្គបណ្តុះបណ្តាលវិជ្ជាជីវៈកម្រិត ១ (TVET ១,៥ លាននាក់ - C1)',
              nameEn: 'TVET 1.5M Technical & Vocational Level 1 (C1)',
              shortName: 'TVET ១.៥ លាននាក់ (C1)',
              duration: '៤ ខែ',
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
            { id: 1, name: 'ព័ត៌មានវិទ្យា & វិទ្យាសាស្ត្រកុំព្យូទ័រ (Information Technology)', nameKm: 'ព័ត៌មានវិទ្យា & វិទ្យាសាស្ត្រកុំព្យូទ័រ' },
            { id: 2, name: 'វិស្វកម្មអគ្គិសនី & ថាមពល (Electrical & Energy Engineering)', nameKm: 'វិស្វកម្មអគ្គិសនី & ថាមពល' },
            { id: 3, name: 'វិស្វកម្មមេកានិក & យានយន្ត (Mechanical & Automotive Engineering)', nameKm: 'វិស្វកម្មមេកានិក & យានយន្ត' },
            { id: 4, name: 'វិស្វកម្មសំណង់ស៊ីវិល & ស្ថាបត្យកម្ម (Civil Engineering & Architecture)', nameKm: 'វិស្វកម្មសំណង់ស៊ីវិល & ស្ថាបត្យកម្ម' },
            { id: 5, name: 'បច្ចេកវិទ្យាកុំព្យូទ័រ & បរិក្ខារត្រជាក់ (HVAC & Refrigeration Technology)', nameKm: 'វិស្វកម្មបរិក្ខារត្រជាក់ & កម្តៅ (HVAC)' },
            { id: 6, name: 'សេវាកម្មទេសចរណ៍ & បដិសណ្ឋារកិច្ច (Tourism & Hospitality Services)', nameKm: 'ទេសចរណ៍ & បដិសណ្ឋារកិច្ច' },
            { id: 7, name: 'ធុរកិច្ចឌីជីថល & គណនេយ្យ (Digital Business & Accounting)', nameKm: 'គណនេយ្យ & ធនាគារ-ហិរញ្ញវត្ថុ' }
          ],
          shifts: [
            { id: 'morning', nameKm: 'វេនព្រឹក (Morning: 08:00 AM - 11:30 AM)', nameEn: 'Morning Shift (08:00 AM - 11:30 AM)' },
            { id: 'afternoon', nameKm: 'វេនរសៀល (Afternoon: 01:30 PM - 05:00 PM)', nameEn: 'Afternoon Shift (01:30 PM - 05:00 PM)' },
            { id: 'evening', nameKm: 'វេនយប់ (Evening: 05:30 PM - 08:30 PM)', nameEn: 'Evening Shift (05:30 PM - 08:30 PM)' },
            { id: 'weekend', nameKm: 'វេនចុងសប្តាហ៍ (Weekend: ថ្ងៃសៅរ៍ - ថ្ងៃអាទិត្យ)', nameEn: 'Weekend Shift (Saturday - Sunday)' }
          ],
          indigenousGroups: DEFAULT_INDIGENOUS
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

    if (file.size > 10 * 1024 * 1024) {
      alert(isKhmer ? 'ទំហំឯកសារមិនត្រូវលើសពី 10MB ឡើយ។' : 'File size must not exceed 10MB');
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
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, [`${field}Url`]: previewUrl }));
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  // Step Validation before Next
  const validateStep = (step) => {
    setFormError('');
    if (step === 1) {
      if (!formData.degreeLevel) {
        setFormError(isKhmer ? 'សូមជ្រើសរើសកម្រិតសិក្សា' : 'Please select your degree level');
        return false;
      }
      if (!formData.major) {
        setFormError(isKhmer ? 'សូមជ្រើសរើសមុខជំនាញឯកទេស' : 'Please select your major');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!formData.khmerName.trim()) {
        setFormError(isKhmer ? 'សូមបញ្ចូលគោត្តនាម និងនាមជាភាសាខ្មែរ' : 'Please enter your Khmer name');
        return false;
      }
      if (!formData.latinName.trim()) {
        setFormError(isKhmer ? 'សូមបញ្ចូលឈ្មោះជាអក្សរឡាតាំង' : 'Please enter your Latin name');
        return false;
      }
      if (!formData.phone.trim()) {
        setFormError(isKhmer ? 'សូមបញ្ចូលលេខទូរស័ព្ទផ្ទាល់ខ្លួន' : 'Please enter your phone number');
        return false;
      }
      return true;
    }

    if (step === 3) {
      // Optional fields in Step 3 have defaults, always valid
      return true;
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setFormError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 380, behavior: 'smooth' });
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
      setFormError(isKhmer ? 'សូមអាន និងយល់ព្រមលើលក្ខខណ្ឌ និងសេចក្តីប្រកាសខាងលើ។' : 'Please accept the declaration checkbox.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        // Step 1: Program
        courseType: formData.courseType || 'long_term',
        studyType: formData.studyType || 'scholarship',
        academicYear: formData.academicYear || '2026-2027',
        degreeLevel: formData.degreeLevel,
        major: formData.major,
        shift: formData.shift,

        // Step 2: Personal (Section A)
        khmerName: formData.khmerName.trim(),
        latinName: formData.latinName.trim(),
        gender: formData.gender,
        dob: formData.dob || null,
        idCardNumber: formData.idCardNumber.trim() || null,
        studentCardNo: formData.studentCardNo.trim() || null,
        nationality: formData.nationality || 'កម្ពុជា',
        ethnicity: formData.ethnicity || 'ខ្មែរ',
        religion: formData.religion || 'ព្រះពុទ្ធ',
        pob: formData.pob.trim() || null,
        permanentAddress: formData.permanentAddress.trim() || null,
        currentAddress: formData.currentAddress.trim() || null,
        phone: formData.phone.trim(),
        telegram: formData.telegram.trim() || null,
        email: formData.email.trim() || null,
        distanceKm: formData.distanceKm ? parseFloat(formData.distanceKm) : null,
        maritalStatus: formData.maritalStatus || 'single',
        familyMembersCount: formData.familyMembersCount ? parseInt(formData.familyMembersCount, 10) : null,
        commuteMethod: formData.commuteMethod || null,
        guardianName: formData.guardianName.trim() || null,
        guardianRelation: formData.guardianRelation.trim() || null,
        guardianPhone: formData.guardianPhone.trim() || null,
        guardianEmail: formData.guardianEmail.trim() || null,
        guardianAddress: formData.guardianAddress.trim() || null,

        // Step 3: Education & Work (Sections B, C, D)
        educationLevel: formData.educationLevel || null,
        isStudyingGeneral: Boolean(formData.isStudyingGeneral),
        previousSchool: formData.previousSchool.trim() || null,
        schoolGraduationYear: formData.schoolGraduationYear.trim() || null,
        previousTraining: formData.previousTraining.trim() || null,
        employmentStatus: formData.employmentStatus || 'unemployed',
        jobTitle: formData.jobTitle.trim() || null,
        incomeType: formData.incomeType || null,
        personalIncome: formData.personalIncome.trim() || null,
        familyIncome: formData.familyIncome.trim() || null,
        employmentType: formData.employmentType || null,

        // Step 4: Equity & Documents (Section E)
        workObstacle: formData.workObstacle.trim() || null,
        hasDisability: Boolean(formData.hasDisability),
        disabilityType: formData.hasDisability ? formData.disabilityType : null,
        disabilityTiming: formData.hasDisability ? formData.disabilityTiming : null,
        isIndigenous: Boolean(formData.isIndigenous),
        indigenousGroup: formData.isIndigenous ? formData.indigenousGroup : null,
        isOrphan: Boolean(formData.isOrphan),
        hasEquityCard: Boolean(formData.hasEquityCard),
        equityCardNumber: formData.hasEquityCard ? formData.equityCardNumber.trim() : null,
        equityCardType: formData.hasEquityCard ? formData.equityCardType : null,

        // Documents
        photoUrl: formData.photoUrl || null,
        certificateUrl: formData.certificateUrl || null,
        idCardUrl: formData.idCardUrl || null,
        familyBookUrl: formData.familyBookUrl || null,
        birthCertificateUrl: formData.birthCertificateUrl || null,
        equityCardUrl: formData.equityCardUrl || null
      };

      const res = await api.post('/admissions/apply', payload);
      if (res.data?.success) {
        setSubmitSuccess({
          ...res.data,
          applicantData: { ...formData, trackingCode: res.data.trackingCode }
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Admission submit error:', err);
      const errMsg = err.response?.data?.message || (isKhmer ? 'ការដាក់ពាក្យសុំមិនជោគជ័យទេ។ សូមពិនិត្យទិន្នន័យម្តងទៀត។' : 'Failed to submit application. Please review your input.');
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

  // Print Voucher Handler
  const handlePrintVoucher = () => {
    window.print();
  };

  // Wizard Step Labels
  const steps = [
    { num: 1, titleKm: 'វគ្គ & ជំនាញ', titleEn: 'Program & Major', icon: Award },
    { num: 2, titleKm: 'ជីវប្រវត្តិ (A)', titleEn: 'Personal Bio', icon: User },
    { num: 3, titleKm: 'ការអប់រំ & ការងារ', titleEn: 'Education & Work', icon: Briefcase },
    { num: 4, titleKm: 'សមធម៌ & ឯកសារ', titleEn: 'Equity & Docs', icon: FileCheck }
  ];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Print Stylesheet for Receipt Voucher */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #official-receipt-voucher, #official-receipt-voucher * {
            visibility: visible;
          }
          #official-receipt-voucher {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: #ffffff !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* =========================================================================
          1. INSTITUTIONAL DAYLIGHT HERO BANNER (Strictly AGENTS.md Standard)
          ========================================================================= */}
      <section
        className="no-print"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
          borderBottom: '1px solid #e2e8f0',
          padding: 'clamp(35px, 5vw, 60px) 0 clamp(25px, 4vw, 40px)',
          textAlign: 'center'
        }}
      >
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
          {/* Institutional Badge */}
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
              marginBottom: '14px'
            }}
          >
            <GraduationCap size={16} />
            <span>{isKhmer ? 'ទម្រង់ស្តង់ដារផ្លូវការលេខ RPITSSR/ETO/PR01/FR02 (លើកទី៤)' : 'Official RPITSSR/ETO/PR01/FR02 Standard Form (Rev 4)'}</span>
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
            {isKhmer ? 'ពាក្យសុំចុះឈ្មោះចូលរៀនតាមប្រព័ន្ធអនឡាញ' : 'Online Admission Application Form'}
          </h1>

          <p
            style={{
              color: '#64748b',
              fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
              maxWidth: '780px',
              margin: '0 auto 22px',
              lineHeight: 1.6
            }}
          >
            {isKhmer
              ? 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប ទទួលចុះឈ្មោះចូលរៀនថ្នាក់បរិញ្ញាបត្របច្ចេកវិទ្យា, សញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស និងវគ្គបណ្តុះបណ្តាលវិជ្ជាជីវៈ TVET ១,៥ លាននាក់ (អាហារូបករណ៍ ១០០% ឥតគិតថ្លៃ)'
              : 'Official enrollment portal for Bachelor of Technology, Higher Technical Diploma, and TVET 1.5M vocational scholarships.'}
          </p>

          {/* Action Tabs & Download Button */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
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
                type="button"
                onClick={() => { setActiveTab('apply'); setSubmitSuccess(null); }}
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
                <span>{isKhmer ? 'ទម្រង់ចុះឈ្មោះ (អនឡាញ)' : 'Online Form'}</span>
              </button>

              <button
                type="button"
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
                <span>{isKhmer ? 'តាមដានស្ថានភាពពាក្យសុំ' : 'Track Application'}</span>
              </button>
            </div>

            {/* Download Blank Form PDF Link */}
            <a
              href="/forms/3-FR02-ពាក្យចូលរៀន.pdf"
              download
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 20px',
                borderRadius: '14px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1e73be',
                fontSize: '0.88rem',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(30, 115, 190, 0.08)'
              }}
            >
              <Download size={16} />
              <span>{isKhmer ? 'ទាញយកទម្រង់ក្រដាស FR02 (PDF)' : 'Download Blank FR02 PDF'}</span>
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. MAIN FORM CONTAINER
          ========================================================================= */}
      <div className="container" style={{ maxWidth: '980px', margin: '30px auto 0', padding: '0 16px' }}>
        {/* =========================================================
            TAB 1: APPLICATION FORM (WIZARD STEPS)
            ========================================================= */}
        {activeTab === 'apply' && (
          <div>
            {submitSuccess ? (
              /* Success & Receipt Voucher Card */
              <div>
                {/* Success Alert Banner */}
                <div
                  className="no-print"
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    border: '1px solid #bbf7d0',
                    boxShadow: '0 6px 24px rgba(7, 41, 77, 0.05)',
                    padding: '24px 30px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: '#f0fdf4',
                        border: '2px solid #bbf7d0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#16a34a',
                        flexShrink: 0
                      }}
                    >
                      <CheckCircle2 size={32} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>
                        {isKhmer ? '✓ ទទួលបានពាក្យសុំដោយជោគជ័យ' : '✓ Successfully Submitted'}
                      </span>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#07294D', margin: '2px 0' }}>
                        {isKhmer ? 'លេខកូដតាមដាន ៖' : 'Tracking Code:'} <span style={{ fontFamily: 'monospace', color: '#1e73be' }}>{submitSuccess.trackingCode}</span>
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b' }}>
                        {isKhmer ? 'លោកអ្នកអាចបោះពុម្ព ឬរក្សាទុកបង្កាន់ដៃទទួលពាក្យផ្លូវការខាងក្រោមទុកជាភស្តុតាង' : 'You can print or save the official admission voucher below as proof.'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(submitSuccess.trackingCode)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        background: copiedCode ? '#f0fdf4' : '#f8fafc',
                        border: '1px solid #cbd5e1',
                        color: copiedCode ? '#16a34a' : '#07294D',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedCode ? (isKhmer ? 'បានចម្លង!' : 'Copied!') : (isKhmer ? 'ចម្លងកូដ' : 'Copy')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenPrint({ ...formData, trackingCode: submitSuccess.trackingCode }, 'all')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        background: '#07294D',
                        color: '#ffffff',
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <Printer size={15} />
                      <span>{isKhmer ? 'បោះពុម្ពពាក្យសុំ FR02 (៥ ទំព័រ)' : 'Print Form FR02 (5 Pages)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenPrint({ ...formData, trackingCode: submitSuccess.trackingCode }, 'voucher')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        background: '#eff6ff',
                        color: '#1e73be',
                        border: '1px solid #bfdbfe',
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <FileText size={15} />
                      <span>{isKhmer ? 'បោះពុម្ពបង្កាន់ដៃ' : 'Print Voucher'}</span>
                    </button>

                    <a
                      href="/docs/3-FR02-ពាក្យចូលរៀន.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        background: '#f8fafc',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <Download size={15} />
                      <span>{isKhmer ? 'ទាញយកទម្រង់ PDF ដើម' : 'Download Original PDF'}</span>
                    </a>
                  </div>
                </div>

                {/* =========================================================================
                    OFFICIAL ADMISSION VOUCHER (FR02 PAGE 5 STANDARD)
                    ========================================================================= */}
                <div
                  id="official-receipt-voucher"
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    border: '1.5px solid #cbd5e1',
                    boxShadow: '0 8px 30px rgba(7, 41, 77, 0.06)',
                    padding: 'clamp(20px, 4vw, 36px)',
                    marginBottom: '30px'
                  }}
                >
                  {/* STUB 1: FOR STUDENT */}
                  <div style={{ paddingBottom: '24px', borderBottom: '2px dashed #94a3b8', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#07294D', textTransform: 'uppercase' }}>
                          {isKhmer ? 'ក្រសួងការងារ និងបណ្តុះបណ្តាលវិជ្ជាជីវៈ' : 'Ministry of Labour and Vocational Training'}
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#07294D' }}>
                          {isKhmer ? 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប' : 'Regional Polytechnic Institute Techo Sen Siem Reap'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          RPITSSR / Educational & Training Office (ETO)
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#dc2626' }}>
                          {isKhmer ? '★ កំណាត់ទី ១ ៖ សម្រាប់សាមីខ្លួន (Student Copy)' : '★ Part 1: Student Copy'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Form: RPITSSR/ETO/PR01/FR02 (ទំព័រ ៥/៥)
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', margin: '14px 0 20px' }}>
                      <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#07294D', letterSpacing: '0.5px', margin: '0 0 4px' }}>
                        {isKhmer ? 'បង្កាន់ដៃទទួលពាក្យ' : 'ADMISSION RECEIPT VOUCHER'}
                      </h2>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e73be', background: '#eff6ff', padding: '3px 12px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                        {isKhmer ? 'កូដតាមដាន ៖' : 'Tracking Code:'} {submitSuccess.trackingCode}
                      </span>
                    </div>

                    {/* Voucher Details Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.86rem' }}>
                      <div>
                        <span style={{ color: '#64748b' }}>{isKhmer ? 'គោត្តនាម-នាម ៖ ' : 'Khmer Name: '}</span>
                        <strong style={{ color: '#07294D' }}>{formData.khmerName}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>{isKhmer ? 'អក្សរឡាតាំង ៖ ' : 'Latin Name: '}</span>
                        <strong style={{ color: '#07294D' }}>{formData.latinName}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>{isKhmer ? 'ភេទ & ថ្ងៃកំណើត ៖ ' : 'Gender & DOB: '}</span>
                        <strong style={{ color: '#07294D' }}>{formData.gender === 'male' ? 'ប្រុស' : 'ស្រី'} • {formData.dob || 'N/A'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>{isKhmer ? 'លេខទូរស័ព្ទ ៖ ' : 'Phone: '}</span>
                        <strong style={{ color: '#07294D' }}>{formData.phone}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>{isKhmer ? 'កម្រិតសិក្សា ៖ ' : 'Degree: '}</span>
                        <strong style={{ color: '#1e73be' }}>{formData.degreeLevel}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>{isKhmer ? 'ជំនាញឯកទេស ៖ ' : 'Major: '}</span>
                        <strong style={{ color: '#07294D' }}>{formData.major}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>{isKhmer ? 'វេនសិក្សា ៖ ' : 'Shift: '}</span>
                        <strong style={{ color: '#07294D' }}>{formData.shift}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>{isKhmer ? 'ប្រភេទសិក្សា ៖ ' : 'Type: '}</span>
                        <strong style={{ color: formData.studyType === 'scholarship' ? '#16a34a' : '#07294D' }}>
                          {formData.studyType === 'scholarship' ? (isKhmer ? 'អាហារូបករណ៍រដ្ឋ ១០០%' : '100% Scholarship') : (isKhmer ? 'បង់ថ្លៃ' : 'Fee-Paying')}
                        </strong>
                      </div>
                    </div>

                    {/* Signature block */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', textAlign: 'center', fontSize: '0.82rem' }}>
                      <div style={{ width: '45%' }}>
                        <div>{isKhmer ? 'ហត្ថលេខា / ឈ្មោះសាមីខ្លួន' : 'Applicant Signature'}</div>
                        <div style={{ height: '50px' }}></div>
                        <div style={{ fontWeight: 700, color: '#07294D' }}>{formData.khmerName}</div>
                      </div>
                      <div style={{ width: '45%' }}>
                        <div>{isKhmer ? 'ហត្ថលេខាអ្នកទទួលពាក្យ (RPITSSR)' : 'Receiver Signature'}</div>
                        <div style={{ height: '50px' }}></div>
                        <div style={{ fontWeight: 700, color: '#07294D' }}>{isKhmer ? 'ការិយាល័យសិក្សា ETO' : 'ETO Office'}</div>
                      </div>
                    </div>
                  </div>

                  {/* STUB 2: FOR INSTITUTE */}
                  <div style={{ paddingTop: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#07294D' }}>
                          {isKhmer ? 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប' : 'Regional Polytechnic Institute Techo Sen Siem Reap'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          RPITSSR / Educational & Training Office (ETO)
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e73be' }}>
                          {isKhmer ? '★ កំណាត់ទី ២ ៖ សម្រាប់វិទ្យាស្ថាន (Institute Copy)' : '★ Part 2: Institute Copy'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Form: RPITSSR/ETO/PR01/FR02
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', margin: '14px 0 20px' }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#07294D', margin: '0 0 4px' }}>
                        {isKhmer ? 'បង្កាន់ដៃទទួលពាក្យចូលរៀន (សម្រាប់តម្កល់ទុក)' : 'ADMISSION VOUCHER (ARCHIVE)'}
                      </h2>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#07294D', background: '#f1f5f9', padding: '3px 12px', borderRadius: '6px' }}>
                        Code: {submitSuccess.trackingCode}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.86rem' }}>
                      <div>
                        <span style={{ color: '#64748b' }}>{isKhmer ? 'បេក្ខជន ៖ ' : 'Applicant: '}</span>
                        <strong>{formData.khmerName} ({formData.latinName})</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>{isKhmer ? 'ទូរស័ព្ទ & អាណាព្យាបាល ៖ ' : 'Phone & Guardian: '}</span>
                        <strong>{formData.phone} / {formData.guardianPhone || 'N/A'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>{isKhmer ? 'ជំនាញ ៖ ' : 'Major: '}</span>
                        <strong>{formData.major}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>{isKhmer ? 'វេន & កម្រិត ៖ ' : 'Shift & Level: '}</span>
                        <strong>{formData.shift} ({formData.degreeLevel})</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', textAlign: 'center', fontSize: '0.82rem' }}>
                      <div style={{ width: '45%' }}>
                        <div>{isKhmer ? 'ហត្ថលេខាសាមីខ្លួន' : 'Applicant'}</div>
                        <div style={{ height: '40px' }}></div>
                        <div>{formData.khmerName}</div>
                      </div>
                      <div style={{ width: '45%' }}>
                        <div>{isKhmer ? 'ហត្ថលេខាអ្នកទទួលពាក្យ' : 'Receiver'}</div>
                        <div style={{ height: '40px' }}></div>
                        <div>{isKhmer ? 'ការិយាល័យសិក្សា' : 'ETO Office'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Return button */}
                <div className="no-print" style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitSuccess(null);
                      setCurrentStep(1);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 28px',
                      borderRadius: '12px',
                      background: '#07294D',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <span>{isKhmer ? 'ដាក់ពាក្យសុំថ្មីមួយទៀត' : 'Submit Another Application'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* =========================================================================
                  WIZARD FORM CONTAINER (STEPS 1 TO 4)
                  ========================================================================= */
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 6px 25px rgba(7, 41, 77, 0.04)',
                  padding: 'clamp(20px, 4vw, 36px)',
                  marginBottom: '40px'
                }}
              >
                {/* Government Scholarship Notice Banner */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    border: '1px solid #bfdbfe',
                    borderRadius: '16px',
                    padding: '14px 18px',
                    marginBottom: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <Award size={24} className="flex-shrink-0" style={{ color: '#1e73be' }} />
                  <div>
                    <strong style={{ color: '#07294D', fontSize: '0.92rem', display: 'block' }}>
                      {isKhmer ? 'អាហារូបករណ៍រដ្ឋាភិបាល ១០០% (TVET ១,៥ លាននាក់)' : 'Government 100% TVET 1.5M Scholarships'}
                    </strong>
                    <span style={{ fontSize: '0.84rem', color: '#1e3a8a' }}>
                      {isKhmer
                        ? 'សិក្សាឥតគិតថ្លៃ ១០០% ទទួលបានប្រាក់ឧបត្ថម្ភ ២៨០,០០០ រៀល/ខែ សម្រាប់សិស្សមកពីគ្រួសារក្រីក្រ និងងាយរងហានិភ័យ (ភ្ជាប់ប័ណ្ណសមធម៌នៅជំហានទី ៤)។'
                        : '100% free tuition and monthly 280,000 KHR stipend for youth with IDPoor/Equity cards.'}
                    </span>
                  </div>
                </div>

                {/* Step Progress Indicator (Stepper) */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '32px',
                    position: 'relative'
                  }}
                >
                  {/* Connecting Line */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '20px',
                      left: '40px',
                      right: '40px',
                      height: '3px',
                      background: '#e2e8f0',
                      zIndex: 1
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '20px',
                      left: '40px',
                      width: `${((currentStep - 1) / 3) * 100 * 0.85}%`,
                      height: '3px',
                      background: '#1e73be',
                      zIndex: 2,
                      transition: 'width 0.3s ease'
                    }}
                  />

                  {steps.map(s => {
                    const StepIcon = s.icon;
                    const isActive = currentStep === s.num;
                    const isDone = currentStep > s.num;
                    return (
                      <div
                        key={s.num}
                        onClick={() => {
                          if (isDone) setCurrentStep(s.num);
                        }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          zIndex: 3,
                          cursor: isDone ? 'pointer' : 'default',
                          userSelect: 'none'
                        }}
                      >
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.92rem',
                            transition: 'all 0.2s ease',
                            background: isActive ? '#07294D' : isDone ? '#10b981' : '#ffffff',
                            color: isActive || isDone ? '#ffffff' : '#64748b',
                            border: isActive ? '3px solid #bfdbfe' : isDone ? '3px solid #a7f3d0' : '2px solid #cbd5e1',
                            boxShadow: isActive ? '0 4px 12px rgba(7, 41, 77, 0.25)' : 'none'
                          }}
                        >
                          {isDone ? <Check size={18} /> : <StepIcon size={18} />}
                        </div>
                        <span
                          style={{
                            marginTop: '8px',
                            fontSize: '0.8rem',
                            fontWeight: isActive ? 800 : 600,
                            color: isActive ? '#07294D' : isDone ? '#10b981' : '#94a3b8',
                            textAlign: 'center'
                          }}
                        >
                          {isKhmer ? s.titleKm : s.titleEn}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Form Error Banner */}
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
                      STEP 1: PROGRAM CHOICE & STUDY INTENT
                      ========================================================= */}
                  {currentStep === 1 && (
                    <div>
                      <div style={{ marginBottom: '24px', paddingBottom: '12px', borderBottom: '1.5px solid #f1f5f9' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#07294D', margin: '0 0 4px' }}>
                          {isKhmer ? 'ជំហានទី ១ ៖ ជ្រើសរើសវគ្គសិក្សា និងជំនាញឯកទេស' : 'Step 1: Academic Program & Desired Major'}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b' }}>
                          {isKhmer ? 'សូមជ្រើសរើសប្រភេទកម្មវិធីសិក្សា កម្រិតសញ្ញាបត្រ និងវេនសិក្សាដែលលោកអ្នកពេញចិត្ត' : 'Select your desired program category, degree level, and schedule shift.'}
                        </p>
                      </div>

                      {/* Course Type (Long-Term vs Short-Term) */}
                      <div style={{ marginBottom: '22px' }}>
                        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#07294D', marginBottom: '8px' }}>
                          {isKhmer ? 'ប្រភេទកម្មវិធីសិក្សា ៖' : 'Program Category:'}
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '12px' }}>
                          <div
                            onClick={() => setFormData({ ...formData, courseType: 'long_term', degreeLevel: 'bachelor' })}
                            style={{
                              border: formData.courseType === 'long_term' ? '2px solid #1e73be' : '1px solid #cbd5e1',
                              borderRadius: '14px',
                              padding: '14px',
                              cursor: 'pointer',
                              background: formData.courseType === 'long_term' ? '#eff6ff' : '#ffffff',
                              transition: 'all 0.15s'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <strong style={{ color: '#07294D', fontSize: '0.94rem' }}>
                                🏛️ {isKhmer ? 'វគ្គវែង (កម្រិតឧត្តមសិក្សា)' : 'Long-Term Degree'}
                              </strong>
                              {formData.courseType === 'long_term' && <CheckCircle2 size={18} color="#1e73be" />}
                            </div>
                            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                              {isKhmer ? 'បរិញ្ញាបត្របច្ចេកវិទ្យា (៤ ឆ្នាំ) ឬ សញ្ញាបត្រជាន់ខ្ពស់បច្ចេកទេស (២ ឆ្នាំ)' : 'Bachelor of Tech (4 yrs) / Higher Diploma (2 yrs)'}
                            </p>
                          </div>

                          <div
                            onClick={() => setFormData({ ...formData, courseType: 'short_term', degreeLevel: 'tvet_short' })}
                            style={{
                              border: formData.courseType === 'short_term' ? '2px solid #1e73be' : '1px solid #cbd5e1',
                              borderRadius: '14px',
                              padding: '14px',
                              cursor: 'pointer',
                              background: formData.courseType === 'short_term' ? '#eff6ff' : '#ffffff',
                              transition: 'all 0.15s'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <strong style={{ color: '#07294D', fontSize: '0.94rem' }}>
                                ⚡ {isKhmer ? 'វគ្គខ្លី (TVET ១,៥ លាននាក់)' : 'Short-Term / TVET 1.5M'}
                              </strong>
                              {formData.courseType === 'short_term' && <CheckCircle2 size={18} color="#1e73be" />}
                            </div>
                            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                              {isKhmer ? 'បណ្តុះបណ្តាលវិជ្ជាជីវៈកម្រិត ១ (C1), វគ្គខ្លី ១-៤ ខែ ឥតគិតថ្លៃ' : 'TVET Level 1 (C1), short courses 1-4 months (Free)'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Study Type (Scholarship vs Self-Paying) */}
                      <div style={{ marginBottom: '22px' }}>
                        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#07294D', marginBottom: '8px' }}>
                          {isKhmer ? 'លក្ខខណ្ឌនៃការសិក្សា ៖' : 'Enrollment Scholarship Type:'}
                        </label>
                        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                          <label
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '10px 16px',
                              borderRadius: '10px',
                              border: formData.studyType === 'scholarship' ? '1.5px solid #059669' : '1px solid #cbd5e1',
                              background: formData.studyType === 'scholarship' ? '#f0fdf4' : '#ffffff',
                              cursor: 'pointer',
                              fontSize: '0.88rem',
                              fontWeight: 700,
                              color: '#07294D'
                            }}
                          >
                            <input
                              type="radio"
                              name="studyType"
                              value="scholarship"
                              checked={formData.studyType === 'scholarship'}
                              onChange={(e) => setFormData({ ...formData, studyType: e.target.value })}
                            />
                            <span>🎁 {isKhmer ? 'អាហារូបករណ៍រដ្ឋ (Scholarship)' : 'Government Scholarship'}</span>
                          </label>

                          <label
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '10px 16px',
                              borderRadius: '10px',
                              border: formData.studyType === 'paying' ? '1.5px solid #1e73be' : '1px solid #cbd5e1',
                              background: formData.studyType === 'paying' ? '#eff6ff' : '#ffffff',
                              cursor: 'pointer',
                              fontSize: '0.88rem',
                              fontWeight: 700,
                              color: '#07294D'
                            }}
                          >
                            <input
                              type="radio"
                              name="studyType"
                              value="paying"
                              checked={formData.studyType === 'paying'}
                              onChange={(e) => setFormData({ ...formData, studyType: e.target.value })}
                            />
                            <span>💳 {isKhmer ? 'បង់ថ្លៃសិក្សា (Fee-Paying)' : 'Self-Paying'}</span>
                          </label>
                        </div>
                      </div>

                      {/* Degree Level Selector */}
                      <div style={{ marginBottom: '22px' }}>
                        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#07294D', marginBottom: '8px' }}>
                          {isKhmer ? 'កម្រិតសិក្សា (Degree Level)' : 'Degree Level'} *
                        </label>
                        <select
                          value={formData.degreeLevel}
                          onChange={(e) => setFormData({ ...formData, degreeLevel: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '12px 14px',
                            borderRadius: '12px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.92rem',
                            outline: 'none',
                            background: '#ffffff',
                            fontWeight: 600,
                            color: '#07294D'
                          }}
                        >
                          {options.degreeLevels?.map(deg => (
                            <option key={deg.id} value={deg.id}>
                              {isKhmer ? deg.nameKm : deg.nameEn}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Major Selector */}
                      <div style={{ marginBottom: '22px' }}>
                        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#07294D', marginBottom: '8px' }}>
                          {isKhmer ? 'ជំនាញឯកទេស (Desired Major)' : 'Major / Specialization'} *
                        </label>
                        <select
                          value={formData.major}
                          onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '12px 14px',
                            borderRadius: '12px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.92rem',
                            outline: 'none',
                            background: '#ffffff',
                            fontWeight: 700,
                            color: '#07294D'
                          }}
                        >
                          <option value="">{isKhmer ? '-- សូមជ្រើសរើសជំនាញ --' : '-- Select Major --'}</option>
                          {options.majors?.map(m => (
                            <option key={m.id} value={m.nameKm || m.name}>
                              {isKhmer ? (m.nameKm || m.name) : (m.nameEn || m.name)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Shift Selector */}
                      <div style={{ marginBottom: '22px' }}>
                        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#07294D', marginBottom: '8px' }}>
                          {isKhmer ? 'វេនសិក្សា (Study Shift)' : 'Schedule Shift'} *
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '10px' }}>
                          {options.shifts?.map(s => {
                            const selected = formData.shift === s.id;
                            return (
                              <div
                                key={s.id}
                                onClick={() => setFormData({ ...formData, shift: s.id })}
                                style={{
                                  border: selected ? '2px solid #1e73be' : '1px solid #cbd5e1',
                                  borderRadius: '12px',
                                  padding: '12px',
                                  cursor: 'pointer',
                                  background: selected ? '#eff6ff' : '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between'
                                }}
                              >
                                <span style={{ fontSize: '0.86rem', fontWeight: selected ? 800 : 600, color: selected ? '#1e73be' : '#475569' }}>
                                  {isKhmer ? s.nameKm : s.nameEn}
                                </span>
                                {selected && <Check size={16} color="#1e73be" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Step 1 Actions */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
                        <button
                          type="button"
                          onClick={handleNextStep}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 28px',
                            borderRadius: '12px',
                            background: '#07294D',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.94rem',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <span>{isKhmer ? 'បន្តទៅជំហានទី ២' : 'Next: Personal Bio'}</span>
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* =========================================================
                      STEP 2: PERSONAL INFORMATION & BIO (SECTION A)
                      ========================================================= */}
                  {currentStep === 2 && (
                    <div>
                      <div style={{ marginBottom: '24px', paddingBottom: '12px', borderBottom: '1.5px solid #f1f5f9' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#07294D', margin: '0 0 4px' }}>
                          {isKhmer ? 'ជំហានទី ២ ៖ ជីវប្រវត្តិ និងព័ត៌មានផ្ទាល់ខ្លួន (ផ្នែក A)' : 'Step 2: Section A - Student Biography'}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b' }}>
                          {isKhmer ? 'ព័ត៌មានអត្តសញ្ញាណប័ណ្ណ ទីលំនៅ និងទំនាក់ទំនងស្របតាមទម្រង់ស្ដង់ដារ FR02' : 'Official personal identification, residence, and contact information.'}
                        </p>
                      </div>

                      {/* Name Inputs */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                            {isKhmer ? '១. គោត្តនាម និងនាម (ខ្មែរ)' : '1. Full Name in Khmer'} *
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

                        <div>
                          <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                            {isKhmer ? '២. ឈ្មោះជាអក្សរឡាតាំង (Latin)' : '2. Latin Full Name'} *
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
                              outline: 'none',
                              textTransform: 'uppercase'
                            }}
                          />
                        </div>
                      </div>

                      {/* Gender, DOB & ID Card */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                            {isKhmer ? '៣. ភេទ' : '3. Gender'} *
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
                              outline: 'none',
                              background: '#ffffff'
                            }}
                          >
                            <option value="male">{isKhmer ? 'ប្រុស (Male)' : 'Male'}</option>
                            <option value="female">{isKhmer ? 'ស្រី (Female)' : 'Female'}</option>
                            <option value="other">{isKhmer ? 'ផ្សេងៗ (Other)' : 'Other'}</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                            {isKhmer ? '៤. ថ្ងៃខែឆ្នាំកំណើត' : '4. Date of Birth'} *
                          </label>
                          <input
                            type="date"
                            value={formData.dob}
                            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '10px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.92rem',
                              outline: 'none'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                            {isKhmer ? '៥. លេខអត្តសញ្ញាណប័ណ្ណ' : '5. National ID Number'}
                          </label>
                          <input
                            type="text"
                            value={formData.idCardNumber}
                            onChange={(e) => setFormData({ ...formData, idCardNumber: e.target.value })}
                            placeholder="ឧ. 0102030405"
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

                      {/* Nationality, Ethnicity, Religion */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                            {isKhmer ? 'សញ្ជាតិ' : 'Nationality'}
                          </label>
                          <input
                            type="text"
                            value={formData.nationality}
                            onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                            {isKhmer ? 'ជនជាតិ' : 'Ethnicity'}
                          </label>
                          <input
                            type="text"
                            value={formData.ethnicity}
                            onChange={(e) => setFormData({ ...formData, ethnicity: e.target.value })}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                            {isKhmer ? 'សាសនា' : 'Religion'}
                          </label>
                          <input
                            type="text"
                            value={formData.religion}
                            onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                          />
                        </div>
                      </div>

                      {/* Contacts: Phone, Telegram, Email */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                            {isKhmer ? 'លេខទូរស័ព្ទផ្ទាល់ខ្លួន' : 'Phone Number'} *
                          </label>
                          <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="012 345 678"
                            style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                            {isKhmer ? 'គណនី Telegram' : 'Telegram'}
                          </label>
                          <input
                            type="text"
                            value={formData.telegram}
                            onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                            placeholder="@username or phone"
                            style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                            {isKhmer ? 'អ៊ីមែលផ្ទាល់ខ្លួន (បើមាន)' : 'Email'}
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="student@example.com"
                            style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                          />
                        </div>
                      </div>

                      {/* Place of Birth & Current Address */}
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                          {isKhmer ? '១១. ទីកន្លែងកំណើត (ភូមិ, ឃុំ/សង្កាត់, ស្រុក/ខណ្ឌ, ខេត្ត/ក្រុង)' : '11. Place of Birth (Village, Commune, District, Province)'}
                        </label>
                        <input
                          type="text"
                          value={formData.pob}
                          onChange={(e) => setFormData({ ...formData, pob: e.target.value })}
                          placeholder={isKhmer ? 'ឧ. ភូមិវត្តបូព៌ ឃុំសាលាកំរើក ស្រុកសៀមរាប ខេត្តសៀមរាប' : 'e.g. Wat Bo, Sala Kamreuk, Siem Reap'}
                          style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                        />
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                          {isKhmer ? '១២. ទីលំនៅអចិន្ត្រៃយ៍ / អាសយដ្ឋានបច្ចុប្បន្ន' : '12. Permanent & Current Residence'}
                        </label>
                        <input
                          type="text"
                          value={formData.currentAddress}
                          onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value, permanentAddress: e.target.value })}
                          placeholder={isKhmer ? 'ផ្ទះលេខ ផ្លូវ ក្រុម ភូមិ ឃុំ/សង្កាត់ ស្រុក/ខណ្ឌ ខេត្ត/ក្រុង' : 'House #, Street, Village, Commune, District, Province'}
                          style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                        />
                      </div>

                      {/* Commute Method, Distance, Marital Status */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px', marginBottom: '20px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                            {isKhmer ? '៧. ចម្ងាយមកសាលា (KM)' : '7. Commute Distance (KM)'}
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={formData.distanceKm}
                            onChange={(e) => setFormData({ ...formData, distanceKm: e.target.value })}
                            placeholder="ឧ. 5.5"
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                            {isKhmer ? '៩. ស្ថានភាពគ្រួសារ' : '9. Marital Status'}
                          </label>
                          <select
                            value={formData.maritalStatus}
                            onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#ffffff' }}
                          >
                            <option value="single">{isKhmer ? 'នៅលីវ (Single)' : 'Single'}</option>
                            <option value="married">{isKhmer ? 'រៀបការរួច (Married)' : 'Married'}</option>
                            <option value="divorced">{isKhmer ? 'លែងលះ (Divorced)' : 'Divorced'}</option>
                            <option value="widowed">{isKhmer ? 'មេម៉ាយ/ពោះម៉ាយ' : 'Widowed'}</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#07294D', marginBottom: '6px' }}>
                            {isKhmer ? '១០. មធ្យោបាយធ្វើដំណើរ' : '10. Commute Method'}
                          </label>
                          <select
                            value={formData.commuteMethod}
                            onChange={(e) => setFormData({ ...formData, commuteMethod: e.target.value })}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#ffffff' }}
                          >
                            <option value="own_motorcycle">{isKhmer ? 'ម៉ូតូផ្ទាល់ខ្លួន' : 'Personal Motorcycle'}</option>
                            <option value="bicycle">{isKhmer ? 'កង់' : 'Bicycle'}</option>
                            <option value="walk">{isKhmer ? 'ថ្មើរជើង' : 'Walking'}</option>
                            <option value="public_transport">{isKhmer ? 'មធ្យោបាយសាធារណៈ / រថយន្តក្រុង' : 'Public Bus'}</option>
                            <option value="motodop">{isKhmer ? 'ម៉ូតូឌុប / PassApp' : 'Motodop / PassApp'}</option>
                            <option value="school_provided">{isKhmer ? 'ផ្តល់ដោយគ្រឹះស្ថាន (ឥតគិតថ្លៃ)' : 'Institute Provided'}</option>
                            <option value="other">{isKhmer ? 'ផ្សេងៗ' : 'Other'}</option>
                          </select>
                        </div>
                      </div>

                      {/* Guardian Information (Item 13 in FR02) */}
                      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#07294D', marginBottom: '12px' }}>
                          👨‍👩‍👧 {isKhmer ? '១៣. ព័ត៌មានអាណាព្យាបាល ឬសាច់ញាតិ' : '13. Guardian or Relative Information'}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>
                              {isKhmer ? 'ឈ្មោះអាណាព្យាបាល' : 'Guardian Name'}
                            </label>
                            <input
                              type="text"
                              value={formData.guardianName}
                              onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                              placeholder={isKhmer ? 'ឧ. សេង សុខា' : 'e.g. Seng Sokha'}
                              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>
                              {isKhmer ? 'ត្រូវជាអ្វី (ឪពុក, ម្តាយ...)' : 'Relationship'}
                            </label>
                            <input
                              type="text"
                              value={formData.guardianRelation}
                              onChange={(e) => setFormData({ ...formData, guardianRelation: e.target.value })}
                              placeholder={isKhmer ? 'ឧ. ឪពុក / ម្តាយ / បងប្អូន' : 'e.g. Father / Mother'}
                              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>
                              {isKhmer ? 'លេខទូរស័ព្ទអាណាព្យាបាល' : 'Guardian Phone'}
                            </label>
                            <input
                              type="tel"
                              value={formData.guardianPhone}
                              onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                              placeholder="098 765 432"
                              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Step 2 Actions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            background: '#f1f5f9',
                            color: '#07294D',
                            fontWeight: 700,
                            fontSize: '0.92rem',
                            border: '1px solid #cbd5e1',
                            cursor: 'pointer'
                          }}
                        >
                          <ArrowLeft size={16} />
                          <span>{isKhmer ? 'ថយក្រោយ' : 'Back'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleNextStep}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 28px',
                            borderRadius: '12px',
                            background: '#07294D',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.94rem',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <span>{isKhmer ? 'បន្តទៅជំហានទី ៣' : 'Next: Education & Work'}</span>
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* =========================================================
                      STEP 3: EDUCATION & EMPLOYMENT (SECTIONS B, C, D)
                      ========================================================= */}
                  {currentStep === 3 && (
                    <div>
                      <div style={{ marginBottom: '24px', paddingBottom: '12px', borderBottom: '1.5px solid #f1f5f9' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#07294D', margin: '0 0 4px' }}>
                          {isKhmer ? 'ជំហានទី ៣ ៖ កម្រិតវប្បធម៌ និងព័ត៌មានការងារ (ផ្នែក B, C, D)' : 'Step 3: Education & Employment (Sections B, C, D)'}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b' }}>
                          {isKhmer ? 'ទិន្នន័យប្រវត្តិសិក្សា និងស្ថានភាពការងារស្របតាមប្រព័ន្ធ TVET MIS ជាតិ' : 'Educational background and employment status matching national TVET MIS standards.'}
                        </p>
                      </div>

                      {/* Section B: General Education */}
                      <div style={{ marginBottom: '24px' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#07294D', marginBottom: '12px' }}>
                          🎓 {isKhmer ? '(B) កម្រិតវប្បធម៌ទូទៅ (ចំណុច ១៤ - ១៥)' : '(B) General Education Level'}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '14px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', color: '#64748b', marginBottom: '4px' }}>
                              {isKhmer ? '១៤. កម្រិតវប្បធម៌ទូទៅ (ថ្នាក់ទី ១ ដល់ ១២)' : '14. General Education Grade'}
                            </label>
                            <select
                              value={formData.educationLevel}
                              onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#ffffff' }}
                            >
                              <option value="ថ្នាក់ទី ១២ (បាក់ឌុប)">{isKhmer ? 'ថ្នាក់ទី ១២ (ជាប់បាក់ឌុប)' : 'Grade 12 (BacII Passed)'}</option>
                              <option value="ថ្នាក់ទី ១២ (ធ្លាក់បាក់ឌុប)">{isKhmer ? 'ថ្នាក់ទី ១២ (ធ្លាក់បាក់ឌុប)' : 'Grade 12 (BacII Not Passed)'}</option>
                              <option value="ថ្នាក់ទី ១១">{isKhmer ? 'ថ្នាក់ទី ១១' : 'Grade 11'}</option>
                              <option value="ថ្នាក់ទី ១០">{isKhmer ? 'ថ្នាក់ទី ១០' : 'Grade 10'}</option>
                              <option value="ថ្នាក់ទី ៩ (ឌីប្លូម)">{isKhmer ? 'ថ្នាក់ទី ៩ (ឌីប្លូម)' : 'Grade 9 (Diploma)'}</option>
                              <option value="ថ្នាក់ទី ៧-៨">{isKhmer ? 'ថ្នាក់ទី ៧ ឬ ៨' : 'Grade 7-8'}</option>
                              <option value="បឋមសិក្សា (១-៦)">{isKhmer ? 'បឋមសិក្សា (ថ្នាក់ទី ១-៦)' : 'Primary (Grade 1-6)'}</option>
                              <option value="អនក្ខរជន">{isKhmer ? 'អនក្ខរជន (មិនចេះអក្សរ)' : 'Non-formal'}</option>
                            </select>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', color: '#64748b', marginBottom: '4px' }}>
                              {isKhmer ? 'សាលារៀនដែលបានបញ្ចប់ចុងក្រោយ' : 'School Name'}
                            </label>
                            <input
                              type="text"
                              value={formData.previousSchool}
                              onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                              placeholder={isKhmer ? 'ឧ. វិទ្យាល័យ ១០ មករា ១៩៧៩' : 'e.g. 10 January 1979 High School'}
                              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', color: '#64748b', marginBottom: '4px' }}>
                              {isKhmer ? 'ឆ្នាំបញ្ចប់ការសិក្សា' : 'Completion Year'}
                            </label>
                            <input
                              type="text"
                              value={formData.schoolGraduationYear}
                              onChange={(e) => setFormData({ ...formData, schoolGraduationYear: e.target.value })}
                              placeholder="2025"
                              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section C: Previous TVET Training */}
                      <div style={{ marginBottom: '24px' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#07294D', marginBottom: '8px' }}>
                          🛠️ {isKhmer ? '(C) វគ្គបណ្តុះបណ្តាលដែលធ្លាប់បានរៀនពីមុន (ចំណុច ១៦)' : '(C) Previous Vocational Training (Item 16)'}
                        </div>
                        <input
                          type="text"
                          value={formData.previousTraining}
                          onChange={(e) => setFormData({ ...formData, previousTraining: e.target.value })}
                          placeholder={isKhmer ? 'ឧ. ធ្លាប់រៀនវគ្គខ្លីអគ្គិសនី ឬ C1 នៅវិទ្យាស្ថាន... (បើគ្មាន សូមទុកទំនេរ)' : 'Previous TVET course, school, year, level (if any)'}
                          style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        />
                      </div>

                      {/* Section D: Employment Info (TVET MIS) */}
                      <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#07294D', marginBottom: '14px' }}>
                          💼 {isKhmer ? '(D) ព័ត៌មានការងារបច្ចុប្បន្ន (ចំណុច ១៧ - ២២)' : '(D) Current Employment Status (Items 17-22)'}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '14px', marginBottom: '14px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', color: '#64748b', marginBottom: '4px' }}>
                              {isKhmer ? '១៧. ស្ថានភាពការងារ' : '17. Employment Status'}
                            </label>
                            <select
                              value={formData.employmentStatus}
                              onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff' }}
                            >
                              <option value="unemployed">{isKhmer ? 'គ្មានការងារធ្វើ (Unemployed)' : 'Unemployed'}</option>
                              <option value="employed_full_time">{isKhmer ? 'មានការងារពេញម៉ោង (Full-Time)' : 'Full-Time Employed'}</option>
                              <option value="contract">{isKhmer ? 'ការងារជាប់កិច្ចសន្យា / ក្រៅម៉ោង' : 'Contract / Part-Time'}</option>
                              <option value="self_employed">{isKhmer ? 'រកស៊ីដោយខ្លួនឯង' : 'Self-Employed'}</option>
                              <option value="other">{isKhmer ? 'ផ្សេងៗ' : 'Other'}</option>
                            </select>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', color: '#64748b', marginBottom: '4px' }}>
                              {isKhmer ? '១៨. មុខងារ / ការងាររបស់អ្នក' : '18. Current Job Title'}
                            </label>
                            <input
                              type="text"
                              value={formData.jobTitle}
                              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                              placeholder={isKhmer ? 'ឧ. កម្មកររោងចក្រ, បុគ្គលិកសណ្ឋាគារ...' : 'e.g. Electrician, Hospitality'}
                              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', color: '#64748b', marginBottom: '4px' }}>
                              {isKhmer ? '២០. ប្រាក់ចំណូលផ្ទាល់ខ្លួន (ប្រចាំខែ)' : '20. Monthly Personal Income'}
                            </label>
                            <input
                              type="text"
                              value={formData.personalIncome}
                              onChange={(e) => setFormData({ ...formData, personalIncome: e.target.value })}
                              placeholder={isKhmer ? 'ឧ. $150 ឬ ៦០០,០០០៛' : 'e.g. $150 / 600,000 KHR'}
                              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', color: '#64748b', marginBottom: '4px' }}>
                              {isKhmer ? '២១. ប្រាក់ចំណូលគ្រួសារ (ប្រចាំខែ)' : '21. Monthly Family Income'}
                            </label>
                            <input
                              type="text"
                              value={formData.familyIncome}
                              onChange={(e) => setFormData({ ...formData, familyIncome: e.target.value })}
                              placeholder={isKhmer ? 'ឧ. $300 ឬ ១,២០០,០០០៛' : 'e.g. $300'}
                              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Step 3 Actions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            background: '#f1f5f9',
                            color: '#07294D',
                            fontWeight: 700,
                            fontSize: '0.92rem',
                            border: '1px solid #cbd5e1',
                            cursor: 'pointer'
                          }}
                        >
                          <ArrowLeft size={16} />
                          <span>{isKhmer ? 'ថយក្រោយ' : 'Back'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleNextStep}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 28px',
                            borderRadius: '12px',
                            background: '#07294D',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.94rem',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <span>{isKhmer ? 'បន្តទៅជំហានទី ៤' : 'Next: Equity & Documents'}</span>
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* =========================================================
                      STEP 4: SOCIAL EQUITY & ATTACHMENTS (SECTION E & DOCS)
                      ========================================================= */}
                  {currentStep === 4 && (
                    <div>
                      <div style={{ marginBottom: '24px', paddingBottom: '12px', borderBottom: '1.5px solid #f1f5f9' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#07294D', margin: '0 0 4px' }}>
                          {isKhmer ? 'ជំហានទី ៤ ៖ ព័ត៌មានសមធម៌ និងឯកសារភ្ជាប់ (ផ្នែក E)' : 'Step 4: Social Equity & Attached Documents (Section E)'}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b' }}>
                          {isKhmer ? 'ព័ត៌មានស្ម័គ្រចិត្តគាំពារសង្គម និងការភ្ជាប់ឯកសារផ្លូវការតម្រូវ' : 'Voluntary social equity disclosure and official supporting documents upload.'}
                        </p>
                      </div>

                      {/* Section E: Voluntary & Special Needs Accordion Box */}
                      <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '28px' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#07294D', marginBottom: '14px' }}>
                          🤝 {isKhmer ? '(E) ការបញ្ចេញព័ត៌មានដោយស្ម័គ្រចិត្ត / គាំពារសង្គម' : '(E) Voluntary Social Equity Disclosure'}
                        </div>

                        {/* Disability Toggle */}
                        <div style={{ marginBottom: '14px' }}>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700, color: '#07294D' }}>
                            <input
                              type="checkbox"
                              checked={formData.hasDisability}
                              onChange={(e) => setFormData({ ...formData, hasDisability: e.target.checked })}
                            />
                            <span>{isKhmer ? 'តើអ្នកមានពិការភាពដែរឬទេ? (ជនមានពិការភាព)' : 'Do you have any disability?'}</span>
                          </label>

                          {formData.hasDisability && (
                            <div style={{ display: 'flex', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
                              <select
                                value={formData.disabilityType}
                                onChange={(e) => setFormData({ ...formData, disabilityType: e.target.value })}
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff' }}
                              >
                                <option value="">{isKhmer ? '-- ជ្រើសរើសប្រភេទពិការភាព --' : '-- Disability Type --'}</option>
                                <option value="ការមើល (ភ្នែក)">{isKhmer ? 'ការមើល (ភ្នែក)' : 'Visual'}</option>
                                <option value="ការនិយាយ">{isKhmer ? 'ការនិយាយ' : 'Speech'}</option>
                                <option value="ការធ្វើចលនា">{isKhmer ? 'ការធ្វើចលនា (ដៃ/ជើង)' : 'Mobility'}</option>
                                <option value="សតិអារម្មណ៍">{isKhmer ? 'សតិអារម្មណ៍' : 'Mental'}</option>
                                <option value="ការស្តាប់">{isKhmer ? 'ការស្តាប់ (ត្រចៀក)' : 'Hearing'}</option>
                                <option value="ផ្សេងៗ">{isKhmer ? 'ផ្សេងៗ' : 'Other'}</option>
                              </select>

                              <select
                                value={formData.disabilityTiming}
                                onChange={(e) => setFormData({ ...formData, disabilityTiming: e.target.value })}
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff' }}
                              >
                                <option value="birth">{isKhmer ? 'តាំងពីកំណើត' : 'From Birth'}</option>
                                <option value="after">{isKhmer ? 'ក្រោយកំណើត' : 'After Birth'}</option>
                              </select>
                            </div>
                          )}
                        </div>

                        {/* Indigenous Minority Toggle */}
                        <div style={{ marginBottom: '14px' }}>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700, color: '#07294D' }}>
                            <input
                              type="checkbox"
                              checked={formData.isIndigenous}
                              onChange={(e) => setFormData({ ...formData, isIndigenous: e.target.checked })}
                            />
                            <span>{isKhmer ? 'តើអ្នកជាជនជាតិដើមភាគតិចដែរឬទេ?' : 'Are you an indigenous minority?'}</span>
                          </label>

                          {formData.isIndigenous && (
                            <div style={{ marginTop: '10px' }}>
                              <select
                                value={formData.indigenousGroup}
                                onChange={(e) => setFormData({ ...formData, indigenousGroup: e.target.value })}
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff', minWidth: '220px' }}
                              >
                                <option value="">{isKhmer ? '-- ជ្រើសរើសជនជាតិដើមភាគតិច --' : '-- Select Indigenous Group --'}</option>
                                {options.indigenousGroups?.map(grp => (
                                  <option key={grp} value={grp}>{grp}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>

                        {/* IDPoor / Equity Card Toggle */}
                        <div style={{ marginBottom: '10px' }}>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700, color: '#07294D' }}>
                            <input
                              type="checkbox"
                              checked={formData.hasEquityCard}
                              onChange={(e) => setFormData({ ...formData, hasEquityCard: e.target.checked })}
                            />
                            <span>{isKhmer ? 'មានប័ណ្ណសមធម៌ (ប័ណ្ណក្រីក្រ) ឬប័ណ្ណងាយរងហានិភ័យ' : 'Holder of IDPoor or Vulnerability Card'}</span>
                          </label>

                          {formData.hasEquityCard && (
                            <div style={{ display: 'flex', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
                              <input
                                type="text"
                                value={formData.equityCardNumber}
                                onChange={(e) => setFormData({ ...formData, equityCardNumber: e.target.value })}
                                placeholder={isKhmer ? 'លេខប័ណ្ណសមធម៌ (ឧ. 1701...)' : 'Card Number'}
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', minWidth: '200px' }}
                              />
                              <select
                                value={formData.equityCardType}
                                onChange={(e) => setFormData({ ...formData, equityCardType: e.target.value })}
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff' }}
                              >
                                <option value="កម្រិត ១ (ក្រីក្រខ្លាំង)">{isKhmer ? 'កម្រិត ១ (ក្រីក្រខ្លាំង)' : 'Level 1 (Extreme Poor)'}</option>
                                <option value="កម្រិត ២ (ក្រីក្រ)">{isKhmer ? 'កម្រិត ២ (ក្រីក្រ)' : 'Level 2 (Poor)'}</option>
                                <option value="ងាយរងហានិភ័យ">{isKhmer ? 'គ្រួសារងាយរងហានិភ័យ' : 'Near Poor / Vulnerable'}</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Official Supporting Documents Required (Page 1 in FR02) */}
                      <div style={{ marginBottom: '30px' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.94rem', color: '#07294D', marginBottom: '6px' }}>
                          📂 {isKhmer ? 'ឯកសារភ្ជាប់ចាំបាច់ (សូមភា្ជាប់មកជាមួយ)' : 'Official Required Documents Upload'}
                        </div>
                        <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: '#64748b' }}>
                          {isKhmer ? 'ឯកសារអាចជាឯកសារ PDF ឬរូបថតច្បាស់ (JPG, PNG) ទំហំមិនលើសពី 10MB ក្នុងមួយឯកសារ' : 'Files can be PDF documents or clear images (JPG, PNG) up to 10MB each.'}
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px' }}>
                          {/* 1. Photo 4x6 */}
                          <div style={{ border: '1.5px dashed #cbd5e1', borderRadius: '14px', padding: '14px', textAlign: 'center', background: '#f8fafc' }}>
                            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#07294D', marginBottom: '6px' }}>
                              {isKhmer ? '១. រូបថត ៤x៦ (១ សន្លឹក)' : '1. 4x6 Photo'} *
                            </div>
                            {formData.photoUrl ? (
                              <div style={{ color: '#16a34a', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <CheckCircle2 size={16} /> {isKhmer ? 'បានភ្ជាប់រួចរាល់' : 'Uploaded'}
                              </div>
                            ) : (
                              <label style={{ cursor: 'pointer', display: 'inline-block' }}>
                                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'photo')} style={{ display: 'none' }} />
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', background: '#eff6ff', color: '#1e73be', fontSize: '0.82rem', fontWeight: 700, border: '1px solid #bfdbfe' }}>
                                  <Upload size={14} /> {uploading.photo ? '...' : (isKhmer ? 'ជ្រើសរើសរូប' : 'Upload')}
                                </span>
                              </label>
                            )}
                          </div>

                          {/* 2. Certificate / Diploma */}
                          <div style={{ border: '1.5px dashed #cbd5e1', borderRadius: '14px', padding: '14px', textAlign: 'center', background: '#f8fafc' }}>
                            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#07294D', marginBottom: '6px' }}>
                              {isKhmer ? '២. សញ្ញាបត្រ / បាក់ឌុប' : '2. Certificate / Diploma'}
                            </div>
                            {formData.certificateUrl ? (
                              <div style={{ color: '#16a34a', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <CheckCircle2 size={16} /> {isKhmer ? 'បានភ្ជាប់រួចរាល់' : 'Uploaded'}
                              </div>
                            ) : (
                              <label style={{ cursor: 'pointer', display: 'inline-block' }}>
                                <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'certificate')} style={{ display: 'none' }} />
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', background: '#eff6ff', color: '#1e73be', fontSize: '0.82rem', fontWeight: 700, border: '1px solid #bfdbfe' }}>
                                  <Upload size={14} /> {uploading.certificate ? '...' : (isKhmer ? 'ជ្រើសរើស' : 'Upload')}
                                </span>
                              </label>
                            )}
                          </div>

                          {/* 3. National ID Card */}
                          <div style={{ border: '1.5px dashed #cbd5e1', borderRadius: '14px', padding: '14px', textAlign: 'center', background: '#f8fafc' }}>
                            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#07294D', marginBottom: '6px' }}>
                              {isKhmer ? '៣. អត្តសញ្ញាណប័ណ្ណ (កូពី)' : '3. National ID Card'}
                            </div>
                            {formData.idCardUrl ? (
                              <div style={{ color: '#16a34a', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <CheckCircle2 size={16} /> {isKhmer ? 'បានភ្ជាប់រួចរាល់' : 'Uploaded'}
                              </div>
                            ) : (
                              <label style={{ cursor: 'pointer', display: 'inline-block' }}>
                                <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'idCard')} style={{ display: 'none' }} />
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', background: '#eff6ff', color: '#1e73be', fontSize: '0.82rem', fontWeight: 700, border: '1px solid #bfdbfe' }}>
                                  <Upload size={14} /> {uploading.idCard ? '...' : (isKhmer ? 'ជ្រើសរើស' : 'Upload')}
                                </span>
                              </label>
                            )}
                          </div>

                          {/* 4. Family Book or Birth Certificate */}
                          <div style={{ border: '1.5px dashed #cbd5e1', borderRadius: '14px', padding: '14px', textAlign: 'center', background: '#f8fafc' }}>
                            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#07294D', marginBottom: '6px' }}>
                              {isKhmer ? '៤. សៀវភៅគ្រួសារ / សំបុត្រកំណើត' : '4. Family Book / Birth Cert'}
                            </div>
                            {formData.familyBookUrl ? (
                              <div style={{ color: '#16a34a', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <CheckCircle2 size={16} /> {isKhmer ? 'បានភ្ជាប់រួចរាល់' : 'Uploaded'}
                              </div>
                            ) : (
                              <label style={{ cursor: 'pointer', display: 'inline-block' }}>
                                <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'familyBook')} style={{ display: 'none' }} />
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', background: '#eff6ff', color: '#1e73be', fontSize: '0.82rem', fontWeight: 700, border: '1px solid #bfdbfe' }}>
                                  <Upload size={14} /> {uploading.familyBook ? '...' : (isKhmer ? 'ជ្រើសរើស' : 'Upload')}
                                </span>
                              </label>
                            )}
                          </div>

                          {/* 5. Equity Card (Conditional) */}
                          {formData.hasEquityCard && (
                            <div style={{ border: '1.5px dashed #f59e0b', borderRadius: '14px', padding: '14px', textAlign: 'center', background: '#fffbeb' }}>
                              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#b45309', marginBottom: '6px' }}>
                                {isKhmer ? '៥. ប័ណ្ណសមធម៌ក្រីក្រ' : '5. IDPoor Card'}
                              </div>
                              {formData.equityCardUrl ? (
                                <div style={{ color: '#16a34a', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                  <CheckCircle2 size={16} /> {isKhmer ? 'បានភ្ជាប់រួចរាល់' : 'Uploaded'}
                                </div>
                              ) : (
                                <label style={{ cursor: 'pointer', display: 'inline-block' }}>
                                  <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'equityCard')} style={{ display: 'none' }} />
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', background: '#fef3c7', color: '#b45309', fontSize: '0.82rem', fontWeight: 700, border: '1px solid #fde68a' }}>
                                    <Upload size={14} /> {uploading.equityCard ? '...' : (isKhmer ? 'ជ្រើសរើស' : 'Upload')}
                                  </span>
                                </label>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Official Agreement Checkbox (Page 1 & 4 in FR02) */}
                      <div
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '14px',
                          padding: '16px',
                          marginBottom: '28px'
                        }}
                      >
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            required
                            checked={formData.agreement}
                            onChange={(e) => setFormData({ ...formData, agreement: e.target.checked })}
                            style={{ marginTop: '3px' }}
                          />
                          <span style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.6 }}>
                            <strong>{isKhmer ? 'ការសន្យា និងសេចក្តីបញ្ជាក់ ៖' : 'Institutional Declaration:'}</strong>{' '}
                            {isKhmer
                              ? 'ខ្ញុំបាទ/នាងខ្ញុំ សូមសន្យាគោរពបទបញ្ជាផ្ទៃក្នុង និងអនុវត្តតាមកម្មវិធីសិក្សារបស់វិទ្យាស្ថានយ៉ាងខ្ជាប់ខ្ជួន។ បើមានការប្រព្រឹត្តខុសដោយប្រការណាមួយ ខ្ញុំបាទ/នាងខ្ញុំ សូមទទួលយកការវិនិច្ឆ័យរបស់ក្រុមប្រឹក្សាវិន័យរបស់វិទ្យាស្ថានដោយពុំមានការតវ៉ាឡើយ។ ព័ត៌មានដែលបានរាយការណ៍ក្នុងពាក្យសុំនេះពិតជាត្រឹមត្រូវឥតមានការក្លែងបន្លំឡើយ។'
                              : 'I pledge to strictly abide by RPITSSR institutional discipline and regulations. All information provided in this admission form is true and accurate.'}
                          </span>
                        </label>
                      </div>

                      {/* Step 4 Actions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            background: '#f1f5f9',
                            color: '#07294D',
                            fontWeight: 700,
                            fontSize: '0.92rem',
                            border: '1px solid #cbd5e1',
                            cursor: 'pointer'
                          }}
                        >
                          <ArrowLeft size={16} />
                          <span>{isKhmer ? 'ថយក្រោយ' : 'Back'}</span>
                        </button>

                        <button
                          type="submit"
                          disabled={submitting}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '13px 32px',
                            borderRadius: '12px',
                            background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '0.96rem',
                            border: 'none',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 16px rgba(7, 41, 77, 0.2)'
                          }}
                        >
                          <Send size={18} />
                          <span>{submitting ? (isKhmer ? 'កំពុងបញ្ជូនពាក្យសុំ...' : 'Submitting...') : (isKhmer ? '🚀 បញ្ជូនពាក្យសុំចុះឈ្មោះចូលរៀន' : 'Submit Admission Application')}</span>
                        </button>
                      </div>
                    </div>
                  )}
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

                  <div>
                    {trackResult.status === 'enrolled' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 16px', borderRadius: '9999px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontWeight: 800, fontSize: '0.88rem' }}>
                        <CheckCircle2 size={16} />
                        <span>{isKhmer ? '✓ បានចុះឈ្មោះចូលរៀនជាផ្លូវការ (Enrolled)' : '✓ Enrolled'}</span>
                      </span>
                    ) : trackResult.status === 'approved' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 16px', borderRadius: '9999px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e73be', fontWeight: 800, fontSize: '0.88rem' }}>
                        <CheckCircle2 size={16} />
                        <span>{isKhmer ? '✓ បានអនុម័ត (Approved)' : '✓ Approved'}</span>
                      </span>
                    ) : trackResult.status === 'contacted' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 16px', borderRadius: '9999px', background: '#fffbeb', border: '1px solid #fed7aa', color: '#ea580c', fontWeight: 800, fontSize: '0.88rem' }}>
                        <Phone size={16} />
                        <span>{isKhmer ? 'បានទាក់ទងបឋម (Contacted)' : 'Contacted'}</span>
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 16px', borderRadius: '9999px', background: '#fefce8', border: '1px solid #fef08a', color: '#ca8a04', fontWeight: 800, fontSize: '0.88rem' }}>
                        <Clock size={16} />
                        <span>{isKhmer ? 'កំពុងរង់ចាំពិនិត្យ (Pending)' : 'Pending'}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px', background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{isKhmer ? 'ឈ្មោះបេក្ខជន' : 'Applicant Name'}</span>
                    <div style={{ fontWeight: 800, color: '#07294D' }}>{trackResult.khmerName} ({trackResult.latinName})</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{isKhmer ? 'ជំនាញដែលបានជ្រើសរើស' : 'Selected Major'}</span>
                    <div style={{ fontWeight: 800, color: '#1e73be' }}>{trackResult.major}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{isKhmer ? 'កម្រិត & វេនសិក្សា' : 'Level & Shift'}</span>
                    <div style={{ fontWeight: 700, color: '#07294D' }}>{trackResult.degreeLevel} • {trackResult.shift}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{isKhmer ? 'កាលបរិច្ឆេទដាក់ពាក្យ' : 'Applied Date'}</span>
                    <div style={{ fontWeight: 700, color: '#07294D' }}>{new Date(trackResult.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                {trackResult.adminNotes && (
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px 18px', color: '#92400e', fontSize: '0.88rem', marginBottom: '16px' }}>
                    <strong>📢 {isKhmer ? 'កំណត់សម្គាល់ពីការិយាល័យសិក្សា ៖ ' : 'Academic Affairs Note: '}</strong>
                    {trackResult.adminNotes}
                  </div>
                )}

                {/* Printable Document Actions */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenPrint(trackResult, 'all')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      background: '#07294D',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <Printer size={15} />
                    <span>{isKhmer ? 'បោះពុម្ពពាក្យសុំ FR02 (៥ ទំព័រ)' : 'Print Form FR02 (5 Pages)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenPrint(trackResult, 'voucher')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      background: '#eff6ff',
                      color: '#1e73be',
                      border: '1px solid #bfdbfe',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <FileText size={15} />
                    <span>{isKhmer ? 'បោះពុម្ពបង្កាន់ដៃ' : 'Print Voucher'}</span>
                  </button>

                  <a
                    href="/docs/3-FR02-ពាក្យចូលរៀន.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <Download size={15} />
                    <span>{isKhmer ? 'ទាញយក PDF ដើម' : 'Download Original PDF'}</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Official Standard Printable Admission Document & Voucher Lightbox Modal */}
      <PrintableAdmissionForm
        admission={printTargetAdmission}
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        defaultMode={printDefaultMode}
      />
    </div>
  );
};

export default AdmissionApplyPage;
