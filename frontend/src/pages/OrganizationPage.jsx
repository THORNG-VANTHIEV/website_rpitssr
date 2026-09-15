import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

// Official Organizational Structure Data of RPITSSR
const LEADERSHIP_DATA = {
  director: {
    id: 'director',
    nameKm: 'លោកជំទាវ/លោកស្រី ទេព កុសល',
    nameEn: 'H.E. Tep Kosal',
    titleKm: 'នាយិកាវិទ្យាស្ថាន',
    titleEn: 'Director of RPITSSR',
    category: 'executive',
    categoryLabelKm: 'គណៈនាយក',
    categoryLabelEn: 'Executive Leadership',
    image: '/images/teachers/teacher-1.jpg',
    email: 'director@rpitssr.edu.kh',
    phone: '(+855) 63 963 888',
    room: 'អគាររដ្ឋបាល A - បន្ទប់ ១០១ (Building A, Rm 101)',
    bioKm: 'មានបទពិសោធន៍ជាង ២០ ឆ្នាំក្នុងការដឹកនាំវិស័យអប់រំបណ្តុះបណ្តាលបច្ចេកទេស និងវិជ្ជាជីវៈ (TVET) នៅកម្ពុជា។ ដឹកនាំ RPITSSR ឱ្យក្លាយជាវិទ្យាស្ថានពហុបច្ចេកទេសគំរូកម្រិតជាតិ។',
    bioEn: 'Over 20 years of leadership in Technical and Vocational Education and Training (TVET) in Cambodia, steering RPITSSR as a premier regional polytechnic.',
    responsibilitiesKm: [
      'ដឹកនាំ និងគ្រប់គ្រងទូទៅលើកិច្ចការរដ្ឋបាល បច្ចេកទេស និងហិរញ្ញវត្ថុរបស់វិទ្យាស្ថាន',
      'កំណត់ទិសដៅយុទ្ធសាស្ត្រ និងគោលនយោបាយអភិវឌ្ឍន៍ធនធានមនុស្ស ស្របតាមក្រសួងការងារ និងបណ្តុះបណ្តាលវិជ្ជាជីវៈ (MLVT)',
      'តំណាងវិទ្យាស្ថានក្នុងកិច្ចព្រមព្រៀងសហប្រតិបត្តិការជាតិ និងអន្តរជាតិ (MoU, Development Partners)'
    ],
    responsibilitiesEn: [
      'Overall leadership and institutional management across administrative, academic, and financial operations',
      'Strategic planning and human resource development aligned with MLVT policies',
      'Institutional representation for national and international partnerships and MoUs'
    ],
    qualificationsKm: 'បណ្ឌិតគ្រប់គ្រងអប់រំ និងគោលនយោបាយសាធារណៈ (Ph.D. in Educational Administration)',
    qualificationsEn: 'Ph.D. in Educational Administration & Public Policy'
  },
  deputies: [
    {
      id: 'deputy-academic',
      nameKm: 'លោក ហេង សុផល',
      nameEn: 'Eng. Heng Sophal',
      titleKm: 'នាយករងទទួលបន្ទុកកិច្ចការសិក្សា និងបណ្តុះបណ្តាល',
      titleEn: 'Deputy Director - Academic Affairs & Training',
      category: 'executive',
      categoryLabelKm: 'គណៈនាយក',
      categoryLabelEn: 'Executive Leadership',
      image: '/images/teachers/teacher-2.jpg',
      email: 'academic@rpitssr.edu.kh',
      phone: '(+855) 12 345 601',
      room: 'អគាររដ្ឋបាល A - បន្ទប់ ១០២ (Building A, Rm 102)',
      bioKm: 'ឯកទេសខាងការរៀបចំកម្មវិធីសិក្សាផ្អែកលើសមត្ថភាព (CBT) និងការគ្រប់គ្រងគុណវុឌ្ឍិជាតិ (CQF)។',
      bioEn: 'Specialist in Competency-Based Training (CBT) curricula and Cambodian Qualifications Framework (CQF).',
      responsibilitiesKm: [
        'គ្រប់គ្រងកម្មវិធីសិក្សា TVET និងកម្រិតឧត្តមសិក្សាគ្រប់ដេប៉ាតឺម៉ង់',
        'ត្រួតពិនិត្យការរៀបចំការប្រឡងឆមាស និងការវាយតម្លៃលទ្ធផលសិក្សារបស់និស្សិត',
        'អភិវឌ្ឍន៍សមត្ថភាពគរុកោសល្យ និងជំនាញបច្ចេកវិទ្យារបស់គ្រូឧទ្ទេស'
      ],
      responsibilitiesEn: [
        'Supervision of TVET and higher-education curricula across all departments',
        'Oversight of semester examinations, grading standards, and academic assessments',
        'Pedagogical and technical capacity development for teaching faculty'
      ],
      qualificationsKm: 'អនុបណ្ឌិតវិស្វកម្មបច្ចេកវិទ្យា (Master of Engineering)',
      qualificationsEn: 'Master of Engineering & Technical Education'
    },
    {
      id: 'deputy-admin',
      nameKm: 'លោកស្រី គង់ សុខា',
      nameEn: 'Mrs. Kong Sokha',
      titleKm: 'នាយករងទទួលបន្ទុកកិច្ចការរដ្ឋបាល និងបុគ្គលិក',
      titleEn: 'Deputy Director - Administration & HR',
      category: 'executive',
      categoryLabelKm: 'គណៈនាយក',
      categoryLabelEn: 'Executive Leadership',
      image: '/images/teachers/teacher-3.jpg',
      email: 'admin@rpitssr.edu.kh',
      phone: '(+855) 12 345 602',
      room: 'អគាររដ្ឋបាល A - បន្ទប់ ១០៣ (Building A, Rm 103)',
      bioKm: 'ជំនាញក្នុងការគ្រប់គ្រងធនធានមនុស្សក្នុងវិស័យសាធារណៈ និងផែនការថវិកាហិរញ្ញវត្ថុស្ថាប័ន។',
      bioEn: 'Expertise in public-sector human resource management and institutional financial planning.',
      responsibilitiesKm: [
        'គ្រប់គ្រងបុគ្គលិក មន្ត្រីរាជការ និងបុគ្គលិកកិច្ចសន្យា',
        'រៀបចំផែនការថវិកា គណនេយ្យ និងលទ្ធកម្មសម្ភារបច្ចេកទេស',
        'គ្រប់គ្រងអគារសិក្សា បរិស្ថាន សន្តិសុខ និងទ្រព្យសម្បត្តិរដ្ឋ'
      ],
      responsibilitiesEn: [
        'Civil servant, staff, and contract personnel management and HR development',
        'Budget planning, institutional accounting, and public procurement',
        'Campus infrastructure, asset management, and occupational health & safety'
      ],
      qualificationsKm: 'អនុបណ្ឌិតរដ្ឋបាលសាធារណៈ (Master of Public Administration)',
      qualificationsEn: 'Master of Public Administration (MPA)'
    },
    {
      id: 'deputy-enterprise',
      nameKm: 'លោក ស៊ាន ចាន់ថា',
      nameEn: 'Mr. Sean Chantha',
      titleKm: 'នាយករងទទួលបន្ទុកទំនាក់ទំនងសហគ្រាស និងធានាគុណភាព',
      titleEn: 'Deputy Director - Enterprise & Quality Assurance',
      category: 'executive',
      categoryLabelKm: 'គណៈនាយក',
      categoryLabelEn: 'Executive Leadership',
      image: '/images/teachers/teacher-4.jpg',
      email: 'enterprise@rpitssr.edu.kh',
      phone: '(+855) 12 345 603',
      room: 'អគាររដ្ឋបាល B - បន្ទប់ ២០១ (Building B, Rm 201)',
      bioKm: 'បទពិសោធន៍ទូលំទូលាយក្នុងការកសាងបណ្តាញដៃគូឧស្សាហកម្ម សភាពាណិជ្ជកម្ម និងអង្គការអភិវឌ្ឍន៍អន្តរជាតិ។',
      bioEn: 'Extensive track record in building enterprise networks, industry chambers, and development agency linkages.',
      responsibilitiesKm: [
        'ជំរុញកិច្ចសហប្រតិបត្តិការជាមួយវិស័យឯកជន និងសហគ្រាសដៃគូ',
        'រៀបចំកម្មវិធីចុះហាត់ការ (Internship) និងការស្វែងរកការងារជូននិស្សិតបញ្ចប់ការសិក្សា',
        'ធានាគុណភាពផ្ទៃក្នុងស្ថាប័ន ស្របតាមស្តង់ដារគុណវុឌ្ឍិជាតិកម្ពុជា'
      ],
      responsibilitiesEn: [
        'Fostering private-sector partnerships, employer councils, and industry MoUs',
        'Student internship placement and graduate employment assistance programs',
        'Internal Quality Assurance (IQA) systems aligned with national accreditation'
      ],
      qualificationsKm: 'អនុបណ្ឌិតគ្រប់គ្រងធុរកិច្ច (MBA)',
      qualificationsEn: 'Master of Business Administration (MBA)'
    }
  ],
  departments: [
    {
      id: 'dept-it',
      nameKm: 'ដេប៉ាតឺម៉ង់ព័ត៌មានវិទ្យា',
      nameEn: 'Department of Information Technology',
      headKm: 'អេង ឈៃ គីមហុង',
      headEn: 'Eng. Chhay Kimhong',
      headTitleKm: 'ប្រធានដេប៉ាតឺម៉ង់',
      headTitleEn: 'Head of Department',
      category: 'technical',
      categoryLabelKm: 'ដេប៉ាតឺម៉ង់បច្ចេកទេស',
      categoryLabelEn: 'Technical Department',
      icon: 'fa-laptop-code',
      accentColor: '#1e73be',
      email: 'ict@rpitssr.edu.kh',
      phone: '(+855) 12 778 890',
      room: 'អគារ Lab IT - ជាន់ទី២ (IT Lab Building, 2nd Fl)',
      programsKm: 'បណ្តាញកុំព្យូទ័រ, ការអភិវឌ្ឍគេហទំព័រ & App, សន្តិសុខសាយប័រ',
      programsEn: 'Network Systems, Web & App Development, Cybersecurity',
      responsibilitiesKm: [
        'ដឹកនាំការបណ្តុះបណ្តាលមុខជំនាញ ICT កម្រិត C1 ដល់បរិញ្ញាបត្របច្ចេកវិទ្យា',
        'គ្រប់គ្រងបន្ទប់ Lab កុំព្យូទ័រចំនួន ៦ បន្ទប់ និងប្រព័ន្ធ Server សាលា',
        'ជំរុញការបង្កើតគម្រោង Software និង Capstone Project ជាក់ស្តែង'
      ],
      responsibilitiesEn: [
        'Delivering TVET Certificate to Bachelor-level ICT programs',
        'Managing 6 computer laboratories and campus server infrastructure',
        'Facilitating applied software engineering and graduate capstone projects'
      ],
      qualificationsKm: 'អនុបណ្ឌិតវិទ្យាសាស្ត្រកុំព្យូទ័រ (M.Sc. Computer Science)',
      qualificationsEn: 'M.Sc. in Computer Science & Networking'
    },
    {
      id: 'dept-electrical',
      nameKm: 'ដេប៉ាតឺម៉ង់អគ្គិសនី និងថាមពល',
      nameEn: 'Department of Electrical & Energy Engineering',
      headKm: 'លោក ហេង សុខេង',
      headEn: 'Mr. Heng Sokheng',
      headTitleKm: 'ប្រធានដេប៉ាតឺម៉ង់',
      headTitleEn: 'Head of Department',
      category: 'technical',
      categoryLabelKm: 'ដេប៉ាតឺម៉ង់បច្ចេកទេស',
      categoryLabelEn: 'Technical Department',
      icon: 'fa-bolt',
      accentColor: '#f59e0b',
      email: 'electrical@rpitssr.edu.kh',
      phone: '(+855) 12 667 788',
      room: 'រោងជាងអគ្គិសនី C (Electrical Workshop C)',
      programsKm: 'អគ្គិសនីក្នុងអគារ, ស្វ័យប្រវត្តិកម្មឧស្សាហកម្ម, ថាមពលសូឡា',
      programsEn: 'Building Electrical, Industrial Automation, Solar Energy Systems',
      responsibilitiesKm: [
        'គ្រប់គ្រងរោងជាងអនុវត្តប្រព័ន្ធអគ្គិសនី និងស្វ័យប្រវត្តិកម្ម PLC',
        'បណ្តុះបណ្តាលស្តង់ដារសុវត្ថិភាពអគ្គិសនី និងការតម្លើងសូឡាកកើតឡើងវិញ',
        'សហការជាមួយសហគ្រាសថាមពលសម្រាប់ការចុះកម្មសិក្សា'
      ],
      responsibilitiesEn: [
        'Overseeing electrical installation and PLC industrial automation workshops',
        'Training electrical safety codes and renewable solar energy systems',
        'Collaborating with regional energy contractors for hands-on student placement'
      ],
      qualificationsKm: 'វិស្វករអគ្គិសនី និងស្វ័យប្រវត្តិកម្ម (B.Eng. Electrical Automation)',
      qualificationsEn: 'B.Eng. in Electrical Engineering & Industrial Control'
    },
    {
      id: 'dept-mechanical',
      nameKm: 'ដេប៉ាតឺម៉ង់មេកានិចទូទៅ និងយានយន្ត',
      nameEn: 'Department of Mechanical & Automotive',
      headKm: 'លោក ឡុង វិសាល',
      headEn: 'Mr. Long Visal',
      headTitleKm: 'ប្រធានដេប៉ាតឺម៉ង់',
      headTitleEn: 'Head of Department',
      category: 'technical',
      categoryLabelKm: 'ដេប៉ាតឺម៉ង់បច្ចេកទេស',
      categoryLabelEn: 'Technical Department',
      icon: 'fa-car',
      accentColor: '#ef4444',
      email: 'automotive@rpitssr.edu.kh',
      phone: '(+855) 12 556 677',
      room: 'រោងជាងយានយន្ត D (Automotive Workshop D)',
      programsKm: 'ជួសជុលយានយន្តទំនើប, ប្រព័ន្ធអេឡិចត្រូនិករថយន្ត, ម៉ាស៊ីនត្រជាក់រថយន្ត',
      programsEn: 'Modern Automotive Repair, Automotive Electronics, Auto Air Conditioning',
      responsibilitiesKm: [
        'គ្រប់គ្រងរោងជាងជួសជុលយានយន្ត និងឧបករណ៍វិនិច្ឆ័យកុំព្យូទ័រ (OBD Scanner)',
        'បណ្តុះបណ្តាលសិស្សកម្មវិធី TVET 1.5M ផ្នែកយានយន្តដោយឥតគិតថ្លៃ',
        'ជំរុញការអនុវត្តលើម៉ាស៊ីនរថយន្តជាក់ស្តែង និងម៉ាស៊ីន Hybrid'
      ],
      responsibilitiesEn: [
        'Managing automotive overhaul bays and modern electronic diagnostics tools',
        'Delivering TVET 1.5M vocational automotive scholarship cohorts',
        'Practical training on engine diagnostics, transmissions, and hybrid drivetrains'
      ],
      qualificationsKm: 'វិស្វករមេកានិច និងយានយន្ត (B.Eng. Automotive Engineering)',
      qualificationsEn: 'B.Eng. in Mechanical & Automotive Engineering'
    },
    {
      id: 'dept-civil',
      nameKm: 'ដេប៉ាតឺម៉ង់សំណង់ស៊ីវិល',
      nameEn: 'Department of Civil Engineering',
      headKm: 'អ្នកគ្រូ កែវ ស្រីមុំ',
      headEn: 'Ms. Keo Sreymom',
      headTitleKm: 'ប្រធានដេប៉ាតឺម៉ង់',
      headTitleEn: 'Head of Department',
      category: 'technical',
      categoryLabelKm: 'ដេប៉ាតឺម៉ង់បច្ចេកទេស',
      categoryLabelEn: 'Technical Department',
      icon: 'fa-drafting-compass',
      accentColor: '#10b981',
      email: 'civil@rpitssr.edu.kh',
      phone: '(+855) 12 445 566',
      room: 'អគាររចនាប្លង់ E - បន្ទប់ ២០១ (Building E, Rm 201)',
      programsKm: 'បច្ចេកវិទ្យាសំណង់, ការគូរប្លង់ស្ថាបត្យកម្ម AutoCAD/Revit, ការស្ទង់វាស់ដី',
      programsEn: 'Construction Technology, Architectural CAD/Revit Drafting, Land Surveying',
      responsibilitiesKm: [
        'បណ្តុះបណ្តាលជំនាញគូរប្លង់ស្ថាបត្យកម្ម ការគណនាគ្រឿងបង្គុំ និងការដ្ឋានសំណង់',
        'គ្រប់គ្រងបន្ទប់ពិសោធន៍បេតុង និងឧបករណ៍ស្ទង់ដី Total Station',
        'ទំនាក់ទំនងជាមួយក្រុមហ៊ុនសំណង់ និងស្ថាបត្យកម្មក្នុងខេត្តសៀមរាប'
      ],
      responsibilitiesEn: [
        'Curriculum delivery in CAD structural drafting, site management, and surveying',
        'Managing concrete testing laboratory and Total Station geodetic equipment',
        'Liaison with provincial architectural and construction firms'
      ],
      qualificationsKm: 'អនុបណ្ឌិតវិស្វកម្មសំណង់ស៊ីវិល (M.Eng. Civil Engineering)',
      qualificationsEn: 'M.Eng. in Structural & Civil Engineering'
    },
    {
      id: 'dept-tourism',
      nameKm: 'ដេប៉ាតឺម៉ង់ទេសចរណ៍ និងបដិសណ្ឋារកិច្ច',
      nameEn: 'Department of Tourism & Hospitality',
      headKm: 'លោកស្រី ម៉ៅ សុភ័ក្ត្រ',
      headEn: 'Mrs. Mao Sopheak',
      headTitleKm: 'ប្រធានដេប៉ាតឺម៉ង់',
      headTitleEn: 'Head of Department',
      category: 'technical',
      categoryLabelKm: 'ដេប៉ាតឺម៉ង់បច្ចេកទេស',
      categoryLabelEn: 'Technical Department',
      icon: 'fa-hotel',
      accentColor: '#8b5cf6',
      email: 'hospitality@rpitssr.edu.kh',
      phone: '(+855) 12 334 455',
      room: 'មជ្ឈមណ្ឌលអនុវត្តបដិសណ្ឋារកិច្ច F (Hospitality Training Center F)',
      programsKm: 'សេវាកម្មសណ្ឋាគារ, ការរៀបចំម្ហូបអាហារ, ការគ្រប់គ្រងទេសចរណ៍',
      programsEn: 'Hotel Operations, Food & Beverage Production, Tourism Management',
      responsibilitiesKm: [
        'គ្រប់គ្រងបន្ទប់គំរូសណ្ឋាគារ (Mock Hotel Room) និងផ្ទះបាយស្តង់ដារអន្តរជាតិ',
        'បណ្តុះបណ្តាលជំនាញបដិសណ្ឋារកិច្ចឆ្លើយតបនឹងទីផ្សារទេសចរណ៍ខេត្តសៀមរាប',
        'រៀបចំការចុះហាត់ការនៅសណ្ឋាគារផ្កាយ ៥ និងរមណីយដ្ឋានដៃគូ'
      ],
      responsibilitiesEn: [
        'Supervising mock hotel suites, front-office simulators, and commercial training kitchens',
        'Delivering industry-certified hospitality programs tailored for Siem Reap tourism',
        'Coordinating internships with premier 5-star hotel chains and resorts'
      ],
      qualificationsKm: 'អនុបណ្ឌិតគ្រប់គ្រងទេសចរណ៍ និងបដិសណ្ឋារកិច្ច (Master in Tourism)',
      qualificationsEn: 'Master in International Hospitality & Tourism Management'
    }
  ],
  offices: [
    {
      id: 'office-academic',
      nameKm: 'ការិយាល័យសិក្សា និងកិច្ចការនិស្សិត',
      nameEn: 'Academic & Student Affairs Office',
      headKm: 'លោក សំ វិបុល',
      headEn: 'Mr. Sam Vibul',
      headTitleKm: 'ប្រធានការិយាល័យ',
      headTitleEn: 'Chief of Office',
      category: 'offices',
      categoryLabelKm: 'ការិយាល័យជំនាញ',
      categoryLabelEn: 'Administrative Office',
      icon: 'fa-user-graduate',
      accentColor: '#0284c7',
      email: 'student.affairs@rpitssr.edu.kh',
      phone: '(+855) 63 963 801',
      room: 'អគាររដ្ឋបាល A - បន្ទប់ ១០៤ (Building A, Rm 104)',
      servicesKm: 'ការចុះឈ្មោះចូលរៀន, ព្រឹត្តិបត្រពិន្ទុ, លិខិតបញ្ជាក់ការសិក្សា, អន្តេវាសិកដ្ឋាន',
      servicesEn: 'Admissions, Transcripts, Student Certifications, Dormitories',
      responsibilitiesKm: [
        'គ្រប់គ្រងការចុះឈ្មោះចូលរៀនរបស់សិស្ស-និស្សិតគ្រប់វគ្គសិក្សា',
        'រៀបចំ និងចេញលិខិតបញ្ជាក់ការសិក្សា ព្រឹត្តិបត្រពិន្ទុ និងសញ្ញាបត្រ',
        'គ្រប់គ្រងអាហារូបករណ៍រាជរដ្ឋាភិបាល និងសុខុមាលភាពនិស្សិតស្នាក់នៅអន្តេវាសិកដ្ឋាន'
      ],
      responsibilitiesEn: [
        'Student admissions and enrollment registration across all vocational tracks',
        'Issuing student status certificates, academic transcripts, and diplomas',
        'Managing government scholarship allowances and campus dormitory welfare'
      ],
      qualificationsKm: 'បរិញ្ញាបត្រជាន់ខ្ពស់រដ្ឋបាលអប់រំ (M.Ed. Educational Management)',
      qualificationsEn: 'Master of Educational Management'
    },
    {
      id: 'office-admin-finance',
      nameKm: 'ការិយាល័យរដ្ឋបាល គណនេយ្យ និងហិរញ្ញវត្ថុ',
      nameEn: 'Administration, Accounting & Finance Office',
      headKm: 'លោកស្រី នុត ដានី',
      headEn: 'Mrs. Nuth Dany',
      headTitleKm: 'ប្រធានការិយាល័យ',
      headTitleEn: 'Chief of Office',
      category: 'offices',
      categoryLabelKm: 'ការិយាល័យជំនាញ',
      categoryLabelEn: 'Administrative Office',
      icon: 'fa-file-invoice-dollar',
      accentColor: '#059669',
      email: 'finance@rpitssr.edu.kh',
      phone: '(+855) 63 963 802',
      room: 'អគាររដ្ឋបាល A - បន្ទប់ ១០៥ (Building A, Rm 105)',
      servicesKm: 'បៀវត្ស និងថវិកា, លិខិតរដ្ឋបាលចូល-ចេញ, លទ្ធកម្មសម្ភារៈ',
      servicesEn: 'Payroll & Budget, Inward/Outward Memos, Public Procurement',
      responsibilitiesKm: [
        'ចាត់ចែងលិខិតរដ្ឋបាល ចរាចរឯកសារផ្លូវការ និងការងារបុគ្គលិក',
        'រៀបចំគណនេយ្យចំណូល-ចំណាយ និងរបាយការណ៍ហិរញ្ញវត្ថុជូនក្រសួង',
        'គ្រប់គ្រងការផ្គត់ផ្គង់សម្ភារៈសិក្សា និងឧបករណ៍អនុវត្តក្នុងរោងជាង'
      ],
      responsibilitiesEn: [
        'Official correspondence, archive documentation, and personnel registry',
        'Institutional revenue/expenditure accounting and statutory ministerial reporting',
        'Procurement of teaching materials, machinery consumables, and office supplies'
      ],
      qualificationsKm: 'បរិញ្ញាបត្រគណនេយ្យ និងហិរញ្ញវត្ថុ (B.Acc. Accounting & Finance)',
      qualificationsEn: 'B.Acc. in Accounting & Financial Management'
    },
    {
      id: 'office-career',
      nameKm: 'ការិយាល័យទំនាក់ទំនងសហគ្រាស និងការងារ',
      nameEn: 'Enterprise Liaison & Job Placement Office',
      headKm: 'លោក ព្រុំ សុផាត',
      headEn: 'Mr. Prum Sophat',
      headTitleKm: 'ប្រធានការិយាល័យ',
      headTitleEn: 'Chief of Office',
      category: 'offices',
      categoryLabelKm: 'ការិយាល័យជំនាញ',
      categoryLabelEn: 'Administrative Office',
      icon: 'fa-briefcase',
      accentColor: '#d97706',
      email: 'career@rpitssr.edu.kh',
      phone: '(+855) 63 963 803',
      room: 'អគាររដ្ឋបាល B - បន្ទប់ ១០១ (Building B, Rm 101)',
      servicesKm: 'ពិព័រណ៍ការងារ, កម្មវិធីហាត់ការ, ការប្រឹក្សាយោបល់អាជីព, ការតាមដានអតីតនិស្សិត',
      servicesEn: 'Job Fairs, Internships, Career Counseling, Alumni Tracking',
      responsibilitiesKm: [
        'សម្របសម្រួលជាមួយសហគ្រាសក្នុងការបញ្ជូនសិស្សចុះហាត់ការជាក់ស្តែង',
        'រៀបចំពិព័រណ៍ការងារប្រចាំឆ្នាំ និងសិក្ខាសាលាតម្រង់ទិសអាជីពការងារ',
        'តាមដានអត្រាមានការងារធ្វើរបស់និស្សិតបញ្ចប់ការសិក្សា (Employability Rate)'
      ],
      responsibilitiesEn: [
        'Facilitating student workplace internships with partner industries',
        'Organizing annual campus job fairs and industry orientation workshops',
        'Tracking graduate employment outcomes and industry skill demand'
      ],
      qualificationsKm: 'បរិញ្ញាបត្រគ្រប់គ្រងធនធានមនុស្ស (BBA Human Resource Management)',
      qualificationsEn: 'BBA in Human Resource Management & Industry Relations'
    }
  ]
};

// Reusable Smooth Avatar with Graceful Executive Fallback (Prevents infinite reload loops & broken ovals)
const OrgLeaderAvatar = ({ image, name, size = 80, isTopLeader = false, icon = 'fa-user-tie' }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="position-relative d-inline-flex justify-content-center align-items-center">
      {image && !hasError ? (
        <img
          src={image}
          alt={name}
          className="rounded-circle"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            objectFit: 'cover',
            display: 'block',
            border: isTopLeader ? '3.5px solid #ffaf00' : '2.5px solid #1e73be',
            boxShadow: isTopLeader
              ? '0 0 0 4px rgba(255, 175, 0, 0.2), 0 8px 24px rgba(7, 41, 77, 0.12)'
              : '0 4px 12px rgba(30, 115, 190, 0.15)'
          }}
          onError={() => setHasError(true)}
        />
      ) : (
        <div
          className="rounded-circle d-flex align-items-center justify-content-center text-white mx-auto"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            background: isTopLeader
              ? 'linear-gradient(135deg, #07294D 0%, #1e73be 100%)'
              : 'linear-gradient(135deg, #1e73be 0%, #07294D 100%)',
            border: isTopLeader ? '3.5px solid #ffaf00' : '2.5px solid #1e73be',
            boxShadow: isTopLeader
              ? '0 0 0 4px rgba(255, 175, 0, 0.2), 0 8px 24px rgba(7, 41, 77, 0.12)'
              : '0 4px 12px rgba(30, 115, 190, 0.15)',
            fontSize: `${Math.round(size * 0.42)}px`
          }}
        >
          <i className={`fas ${isTopLeader ? 'fa-user-tie' : icon}`}></i>
        </div>
      )}
    </div>
  );
};

export const OrganizationPage = () => {
  const { t, language, currentLanguage } = useLanguage();
  const isKhmer = (currentLanguage || language) === 'km';

  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'grid'
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeader, setSelectedLeader] = useState(null);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedLeader(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when modal open without layout jitter
  useEffect(() => {
    if (selectedLeader) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [selectedLeader]);


  // Flatten all items for Grid view and search
  const allUnits = useMemo(() => {
    const list = [
      LEADERSHIP_DATA.director,
      ...LEADERSHIP_DATA.deputies,
      ...LEADERSHIP_DATA.departments.map(d => ({
        ...d,
        nameKm: d.headKm,
        nameEn: d.headEn,
        titleKm: `${d.headTitleKm} - ${d.nameKm}`,
        titleEn: `${d.headTitleEn} - ${d.nameEn}`
      })),
      ...LEADERSHIP_DATA.offices.map(o => ({
        ...o,
        nameKm: o.headKm,
        nameEn: o.headEn,
        titleKm: `${o.headTitleKm} - ${o.nameKm}`,
        titleEn: `${o.headTitleEn} - ${o.nameEn}`
      }))
    ];
    return list;
  }, []);

  // Filtered units for Grid View
  const filteredUnits = useMemo(() => {
    return allUnits.filter(item => {
      const matchCat = activeCategory === 'all' || item.category === activeCategory;
      if (!matchCat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const name = (item.nameKm || item.headKm || '') + ' ' + (item.nameEn || item.headEn || '');
      const title = (item.titleKm || item.nameKm || '') + ' ' + (item.titleEn || item.nameEn || '');
      const email = item.email || '';
      return name.toLowerCase().includes(q) || title.toLowerCase().includes(q) || email.toLowerCase().includes(q);
    });
  }, [allUnits, activeCategory, searchQuery]);

  return (
    <div className="organization-page-wrapper">
      {/* 1. Official Institutional Hero Banner */}
      <section className="org-page-hero">
        <div className="container">
          <div className="org-hero-content">
            {/* Meta Row with Breadcrumb & TVET Governance Badge (14px gap) */}
            <div className="org-hero-meta-row">
              <nav className="org-breadcrumb" aria-label="breadcrumb">
                <Link to="/">
                  <i className="fas fa-home"></i>
                  <span>{isKhmer ? 'ទំព័រដើម' : 'Home'}</span>
                </Link>
                <span className="separator">›</span>
                <span className="current">{t('organization.pageTitle')}</span>
              </nav>

              <span className="org-hero-badge">
                <i className="fas fa-landmark"></i>
                <span>{t('organization.badge_governance')}</span>
              </span>
            </div>

            {/* Official Title */}
            <h1 className="org-hero-title">
              {t('organization.pageTitle')}
            </h1>

            {/* Subtitle */}
            <p className="org-hero-subtitle">
              {t('organization.subtitle')}
            </p>

            {/* Institutional Trust Badges */}
            <div className="org-trust-pills">
              <span className="org-trust-pill">
                <i className="fas fa-scroll"></i>
                <span>{t('organization.trust_subdecree')}</span>
              </span>
              <span className="org-trust-pill">
                <i className="fas fa-award"></i>
                <span>{t('organization.trust_ministry')}</span>
              </span>
              <span className="org-trust-pill">
                <i className="fas fa-sitemap"></i>
                <span>{t('organization.trust_structure')}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="org-main-section" style={{ backgroundColor: '#f8fafc', paddingTop: '50px', paddingBottom: '100px', paddingLeft: '16px', paddingRight: '16px' }}>
        <div className="container px-2 px-md-3" style={{ maxWidth: '1280px' }}>

          {/* Quick Stats Strip - 4 Interactive Executive Metric Cards */}
          <div className="row g-3 justify-content-center mb-4 pb-2">
            <div className="col-6 col-lg-3">
              <div className="org-stat-card">
                <div
                  className="org-stat-icon-wrap"
                  style={{ backgroundColor: '#eff6ff', color: '#1e73be', border: '1px solid #dbeafe' }}
                >
                  <i className="fas fa-user-tie"></i>
                </div>
                <div className="fw-bold" style={{ fontSize: '2.1rem', color: '#07294D', lineHeight: 1.1 }}>1</div>
                <div className="fw-semibold text-dark small mt-1">{t('organization.stat_director')}</div>
                <span
                  className="badge rounded-pill mt-2 px-2.5 py-1"
                  style={{ backgroundColor: '#eff6ff', color: '#1e73be', fontSize: '0.72rem', fontWeight: '600', border: '1px solid #dbeafe' }}
                >
                  {t('organization.stat_director_badge')}
                </span>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <div className="org-stat-card">
                <div
                  className="org-stat-icon-wrap"
                  style={{ backgroundColor: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' }}
                >
                  <i className="fas fa-users-cog"></i>
                </div>
                <div className="fw-bold" style={{ fontSize: '2.1rem', color: '#07294D', lineHeight: 1.1 }}>3</div>
                <div className="fw-semibold text-dark small mt-1">{t('organization.stat_deputies')}</div>
                <span
                  className="badge rounded-pill mt-2 px-2.5 py-1"
                  style={{ backgroundColor: '#f0fdf4', color: '#059669', fontSize: '0.72rem', fontWeight: '600', border: '1px solid #bbf7d0' }}
                >
                  {t('organization.stat_deputies_badge')}
                </span>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <div className="org-stat-card">
                <div
                  className="org-stat-icon-wrap"
                  style={{ backgroundColor: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}
                >
                  <i className="fas fa-laptop-code"></i>
                </div>
                <div className="fw-bold" style={{ fontSize: '2.1rem', color: '#07294D', lineHeight: 1.1 }}>5</div>
                <div className="fw-semibold text-dark small mt-1">{t('organization.stat_departments')}</div>
                <span
                  className="badge rounded-pill mt-2 px-2.5 py-1"
                  style={{ backgroundColor: '#faf5ff', color: '#7c3aed', fontSize: '0.72rem', fontWeight: '600', border: '1px solid #e9d5ff' }}
                >
                  {t('organization.stat_departments_badge')}
                </span>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <div className="org-stat-card">
                <div
                  className="org-stat-icon-wrap"
                  style={{ backgroundColor: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}
                >
                  <i className="fas fa-building"></i>
                </div>
                <div className="fw-bold" style={{ fontSize: '2.1rem', color: '#07294D', lineHeight: 1.1 }}>3</div>
                <div className="fw-semibold text-dark small mt-1">{t('organization.stat_offices')}</div>
                <span
                  className="badge rounded-pill mt-2 px-2.5 py-1"
                  style={{ backgroundColor: '#fffbeb', color: '#d97706', fontSize: '0.72rem', fontWeight: '600', border: '1px solid #fde68a' }}
                >
                  {t('organization.stat_offices_badge')}
                </span>
              </div>
            </div>
          </div>

          {/* View Mode Switcher & Filter Toolbar */}
          <div className="org-toolbar d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            {/* View Mode Segmented Control */}
            <div className="org-view-segmented-wrap">
              <button
                type="button"
                className={`org-view-tab-btn ${viewMode === 'tree' ? 'active' : ''}`}
                onClick={() => setViewMode('tree')}
              >
                <i className="fas fa-sitemap"></i>
                <span>{t('organization.treeView')}</span>
              </button>
              <button
                type="button"
                className={`org-view-tab-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <i className="fas fa-th-large"></i>
                <span>{t('organization.gridView')}</span>
              </button>
            </div>

            {/* In Tree View: Helpful Instruction badge */}
            {viewMode === 'tree' && (
              <div
                className="d-none d-md-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill"
                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.84rem' }}
              >
                <i className="fas fa-mouse-pointer text-primary"></i>
                <span>{t('organization.tree_hint')}</span>
              </div>
            )}

            {/* In Grid View: Search & Category Filter */}
            {viewMode === 'grid' && (
              <div className="d-flex flex-wrap gap-2 align-items-center flex-grow-1 justify-content-lg-end">
                <div className="org-search-box position-relative" style={{ minWidth: '240px' }}>
                  <i className="fas fa-search position-absolute" style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                  <input
                    type="text"
                    className="form-control org-search-input-pill"
                    placeholder={t('organization.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className="btn btn-link position-absolute p-0 border-0"
                      style={{ right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', textDecoration: 'none' }}
                      onClick={() => setSearchQuery('')}
                    >
                      <i className="fas fa-times-circle"></i>
                    </button>
                  )}
                </div>

                <div className="org-filter-group d-flex flex-wrap align-items-center">
                  <button
                    type="button"
                    className={`org-filter-chip ${activeCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('all')}
                  >
                    {t('organization.all')}
                  </button>
                  <button
                    type="button"
                    className={`org-filter-chip ${activeCategory === 'executive' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('executive')}
                  >
                    {t('organization.executive')}
                  </button>
                  <button
                    type="button"
                    className={`org-filter-chip ${activeCategory === 'technical' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('technical')}
                  >
                    {t('organization.technical')}
                  </button>
                  <button
                    type="button"
                    className={`org-filter-chip ${activeCategory === 'offices' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('offices')}
                  >
                    {t('organization.offices')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* VIEW 1: INTERACTIVE HIERARCHY TREE CHART */}
          {viewMode === 'tree' && (
            <div className="org-tree-container p-4 p-md-5 bg-white rounded-4 border shadow-sm">
              <div className="text-center mb-4 text-muted small">
                <i className="fas fa-info-circle me-1 text-primary"></i>
                {t('organization.tree_hint')}
              </div>

              {/* TREE LEVEL 1: DIRECTOR (TOP) - CRISP WHITE DAYLIGHT CARD */}
              <div className="org-tree-level d-flex justify-content-center mb-4">
                <div
                  className="org-tree-card org-director-card-daylight d-flex flex-column align-items-center text-center"
                  onClick={() => setSelectedLeader(LEADERSHIP_DATA.director)}
                  role="button"
                  tabIndex={0}
                >
                  {/* Top Directorate Ribbon */}
                  <div className="d-flex justify-content-center w-100">
                    <div className="org-director-ribbon">
                      <i className="fas fa-crown text-warning"></i>
                      <span>{isKhmer ? 'គណៈនាយិកាវិទ្យាស្ថាន' : 'Institute Directorate'}</span>
                    </div>
                  </div>

                  {/* Centered Executive Avatar */}
                  <div className="d-flex justify-content-center mb-3">
                    <OrgLeaderAvatar
                      image={LEADERSHIP_DATA.director.image}
                      name={isKhmer ? LEADERSHIP_DATA.director.nameKm : LEADERSHIP_DATA.director.nameEn}
                      size={96}
                      isTopLeader={true}
                    />
                  </div>

                  {/* Director Name */}
                  <h4 className="fw-bold mb-1" style={{ color: '#07294D', fontSize: '1.25rem' }}>
                    {isKhmer ? LEADERSHIP_DATA.director.nameKm : LEADERSHIP_DATA.director.nameEn}
                  </h4>

                  {/* Designation */}
                  <div className="text-primary fw-semibold mb-2" style={{ fontSize: '0.98rem' }}>
                    {isKhmer ? LEADERSHIP_DATA.director.titleKm : LEADERSHIP_DATA.director.titleEn}
                  </div>

                  {/* Room & Email */}
                  <div className="text-muted small mb-1">
                    <i className="fas fa-door-open me-1.5 text-secondary"></i>
                    {LEADERSHIP_DATA.director.room}
                  </div>
                  <div className="d-flex align-items-center justify-content-center gap-2 text-muted small mb-3">
                    <i className="fas fa-envelope text-primary"></i>
                    <span>{LEADERSHIP_DATA.director.email}</span>
                  </div>

                  {/* Action CTA Button */}
                  <div className="btn btn-sm btn-outline-primary rounded-pill px-4 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5">
                    <i className="fas fa-id-card"></i>
                    <span>{t('organization.viewProfile')}</span>
                  </div>
                </div>
              </div>

              {/* STEM CONNECTOR 1: FROM DIRECTOR TO HORIZONTAL CROSSBAR */}
              <div className="org-tree-stem-vertical mx-auto" style={{ width: '2px', height: '32px', backgroundColor: '#cbd5e1' }}></div>

              {/* TREE LEVEL 2: DEPUTY DIRECTORS (3 DEPUTIES) */}
              <div className="position-relative mb-4">
                {/* Horizontal branch line spanning the 3 deputy columns */}
                <div className="org-tree-crossbar d-none d-md-block mx-auto" style={{ height: '2px', width: '70%', backgroundColor: '#cbd5e1', marginBottom: '0' }}></div>

                <div className="row g-4 justify-content-center pt-3">
                  {LEADERSHIP_DATA.deputies.map((deputy) => (
                    <div className="col-12 col-md-4" key={deputy.id}>
                      {/* Vertical line connecting crossbar to each card */}
                      <div className="org-tree-branch-vertical d-none d-md-block mx-auto" style={{ width: '2px', height: '16px', backgroundColor: '#cbd5e1', marginTop: '-16px' }}></div>
                      <div
                        className="org-tree-card org-deputy-card text-center h-100 d-flex flex-column align-items-center"
                        onClick={() => setSelectedLeader(deputy)}
                        role="button"
                        tabIndex={0}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex justify-content-center mb-3">
                          <OrgLeaderAvatar
                            image={deputy.image}
                            name={isKhmer ? deputy.nameKm : deputy.nameEn}
                            size={80}
                            icon="fa-user-graduate"
                          />
                        </div>
                        <h5 className="fw-bold mb-1" style={{ color: '#07294D', fontSize: '1.1rem' }}>
                          {isKhmer ? deputy.nameKm : deputy.nameEn}
                        </h5>
                        <div className="text-primary small fw-semibold mb-2" style={{ lineHeight: '1.5' }}>
                          {isKhmer ? deputy.titleKm : deputy.titleEn}
                        </div>
                        <div className="text-muted small mb-3">
                          <i className="fas fa-door-open me-1 text-secondary"></i>
                          {deputy.room}
                        </div>
                        <div className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1.5 mt-auto">
                          <i className="fas fa-id-card"></i>
                          <span>{t('organization.viewProfile')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* STEM CONNECTOR 2: FROM LEVEL 2 TO DEPARTMENTS & OFFICES */}
              <div className="org-tree-stem-vertical mx-auto my-3" style={{ width: '2px', height: '32px', backgroundColor: '#cbd5e1' }}></div>

              {/* TREE LEVEL 3: TWO PILLARS - TECHNICAL DEPTS & ADMINISTRATIVE OFFICES */}
              <div className="row g-4">
                {/* Pillar Left: 5 Technical Departments */}
                <div className="col-12 col-lg-7">
                  <div className="p-3 p-md-4 rounded-4 bg-light border h-100">
                    <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                      <div className="d-flex align-items-center gap-2">
                        <div className="p-2 rounded-circle bg-primary text-white" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="fas fa-cogs"></i>
                        </div>
                        <h5 className="fw-bold mb-0" style={{ color: '#07294D' }}>
                          {isKhmer ? 'ដេប៉ាតឺម៉ង់បច្ចេកទេស (Technical Departments)' : 'Technical Departments'}
                        </h5>
                      </div>
                      <span className="badge bg-primary text-white rounded-pill">5 ដេប៉ាតឺម៉ង់</span>
                    </div>

                    <div className="d-flex flex-column gap-3">
                      {LEADERSHIP_DATA.departments.map((dept) => (
                        <div
                          key={dept.id}
                          className="org-dept-card p-3 rounded-3 bg-white border shadow-sm d-flex align-items-center justify-content-between gap-3"
                          onClick={() => setSelectedLeader({
                            ...dept,
                            nameKm: dept.headKm,
                            nameEn: dept.headEn,
                            titleKm: `${dept.headTitleKm} - ${dept.nameKm}`,
                            titleEn: `${dept.headTitleEn} - ${dept.nameEn}`
                          })}
                          role="button"
                          tabIndex={0}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                              style={{ width: '48px', height: '48px', backgroundColor: dept.accentColor }}
                            >
                              <i className={`fas ${dept.icon} fs-5`}></i>
                            </div>
                            <div>
                              <div className="fw-bold" style={{ color: '#07294D', fontSize: '1rem' }}>
                                {isKhmer ? dept.nameKm : dept.nameEn}
                              </div>
                              <div className="text-muted small">
                                <span className="fw-semibold text-dark">{isKhmer ? dept.headKm : dept.headEn}</span> ({isKhmer ? dept.headTitleKm : dept.headTitleEn})
                              </div>
                              <div className="text-muted small" style={{ fontSize: '0.8rem' }}>
                                <i className="fas fa-map-marker-alt me-1 text-danger"></i>
                                {dept.room}
                              </div>
                            </div>
                          </div>
                          <div className="btn btn-sm btn-outline-primary rounded-pill px-3 flex-shrink-0">
                            {isKhmer ? 'ព័ត៌មាន' : 'Details'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pillar Right: 3 Administrative Offices */}
                <div className="col-12 col-lg-5">
                  <div className="p-3 p-md-4 rounded-4 bg-light border h-100">
                    <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                      <div className="d-flex align-items-center gap-2">
                        <div className="p-2 rounded-circle bg-success text-white" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="fas fa-building"></i>
                        </div>
                        <h5 className="fw-bold mb-0" style={{ color: '#07294D' }}>
                          {isKhmer ? 'ការិយាល័យជំនាញ (Offices)' : 'Administrative Offices'}
                        </h5>
                      </div>
                      <span className="badge bg-success text-white rounded-pill">3 ការិយាល័យ</span>
                    </div>

                    <div className="d-flex flex-column gap-3">
                      {LEADERSHIP_DATA.offices.map((office) => (
                        <div
                          key={office.id}
                          className="org-dept-card p-3 rounded-3 bg-white border shadow-sm d-flex align-items-center justify-content-between gap-3"
                          onClick={() => setSelectedLeader({
                            ...office,
                            nameKm: office.headKm,
                            nameEn: office.headEn,
                            titleKm: `${office.headTitleKm} - ${office.nameKm}`,
                            titleEn: `${office.headTitleEn} - ${office.nameEn}`
                          })}
                          role="button"
                          tabIndex={0}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                              style={{ width: '48px', height: '48px', backgroundColor: office.accentColor }}
                            >
                              <i className={`fas ${office.icon} fs-5`}></i>
                            </div>
                            <div>
                              <div className="fw-bold" style={{ color: '#07294D', fontSize: '1rem' }}>
                                {isKhmer ? office.nameKm : office.nameEn}
                              </div>
                              <div className="text-muted small">
                                <span className="fw-semibold text-dark">{isKhmer ? office.headKm : office.headEn}</span> ({isKhmer ? office.headTitleKm : office.headTitleEn})
                              </div>
                              <div className="text-muted small" style={{ fontSize: '0.8rem' }}>
                                <i className="fas fa-map-marker-alt me-1 text-danger"></i>
                                {office.room}
                              </div>
                            </div>
                          </div>
                          <div className="btn btn-sm btn-outline-success rounded-pill px-3 flex-shrink-0">
                            {isKhmer ? 'ព័ត៌មាន' : 'Details'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: DEPARTMENT GRID & FILTER VIEW */}
          {viewMode === 'grid' && (
            <div className="org-grid-container">
              {filteredUnits.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-4 border shadow-sm">
                  <i className="fas fa-search fs-1 text-muted mb-3"></i>
                  <h5>{isKhmer ? 'មិនមានទិន្នន័យត្រូវគ្នានឹងការស្វែងរកឡើយ' : 'No leadership profiles match your query'}</h5>
                  <p className="text-muted">{isKhmer ? 'សូមសាកល្បងពាក្យគន្លឹះផ្សេងទៀត' : 'Please try different keywords or reset filter'}</p>
                  <button className="btn btn-primary rounded-pill px-4" onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>
                    {isKhmer ? 'កំណត់ឡើងវិញ' : 'Reset Filter'}
                  </button>
                </div>
              ) : (
                <div className="row g-4">
                  {filteredUnits.map((item) => (
                    <div className="col-12 col-md-6 col-lg-4" key={item.id}>
                      <div
                        className="org-unit-card bg-white h-100 d-flex flex-column justify-content-between"
                        onClick={() => setSelectedLeader(item)}
                        role="button"
                        tabIndex={0}
                        style={{ cursor: 'pointer' }}
                      >
                        <div>
                          <div className="d-flex justify-content-between align-items-center mb-3 pb-1">
                            <span
                              className="badge rounded-pill px-3 py-2 fw-semibold"
                              style={{
                                backgroundColor: '#eff6ff',
                                color: '#1e73be',
                                fontSize: '0.82rem',
                                border: '1px solid #dbeafe'
                              }}
                            >
                              {isKhmer ? item.categoryLabelKm : item.categoryLabelEn}
                            </span>
                            {item.accentColor && (
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm flex-shrink-0"
                                style={{ width: '40px', height: '40px', backgroundColor: item.accentColor, fontSize: '1rem' }}
                              >
                                <i className={`fas ${item.icon || 'fa-user'}`}></i>
                              </div>
                            )}
                          </div>

                          <h5 className="fw-bold mb-2" style={{ color: '#07294D', fontSize: '1.18rem', lineHeight: 1.45 }}>
                            {isKhmer ? item.nameKm : item.nameEn}
                          </h5>
                          <div
                            className="small fw-semibold mb-3"
                            style={{ color: '#1e73be', fontSize: '0.92rem', lineHeight: 1.5 }}
                          >
                            {isKhmer ? item.titleKm : item.titleEn}
                          </div>

                          <div className="d-flex flex-column gap-2 mb-4">
                            {item.room && (
                              <div className="text-secondary small d-flex align-items-center gap-2" style={{ fontSize: '0.86rem', lineHeight: 1.45 }}>
                                <i className="fas fa-map-marker-alt text-danger flex-shrink-0" style={{ width: '16px' }}></i>
                                <span>{item.room}</span>
                              </div>
                            )}

                            {item.email && (
                              <div className="text-secondary small d-flex align-items-center gap-2 text-truncate" style={{ fontSize: '0.86rem' }}>
                                <i className="fas fa-envelope text-primary flex-shrink-0" style={{ width: '16px' }}></i>
                                <span className="text-truncate">{item.email}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div
                          className="pt-3 border-top d-flex align-items-center justify-content-between mt-auto"
                          style={{ borderColor: '#edf2f7' }}
                        >
                          <span className="text-primary small fw-bold d-inline-flex align-items-center gap-2" style={{ fontSize: '0.88rem' }}>
                            <span>{t('organization.viewProfile')}</span>
                            <i className="fas fa-arrow-right small"></i>
                          </span>
                          <span
                            className="d-flex align-items-center justify-content-center rounded-circle"
                            style={{ width: '28px', height: '28px', backgroundColor: '#f1f5f9', color: '#64748b' }}
                          >
                            <i className="fas fa-chevron-right" style={{ fontSize: '0.72rem' }}></i>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Institutional Governance Information Card */}
          <div className="org-governance-card">
            <div className="row align-items-center g-4 g-lg-5">
              <div className="col-lg-2 col-md-3 text-center d-flex justify-content-center align-items-center">
                <div className="org-governance-seal-badge">
                  <img
                    src="/images/rpitssr-seal.png"
                    alt="RPITSSR Institutional Seal"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
              </div>
              <div className="col-lg-10 col-md-9 text-center text-md-start">
                <div
                  className="d-inline-flex align-items-center gap-2 px-3 py-1 mb-2 rounded-pill"
                  style={{ backgroundColor: '#eff6ff', color: '#1e73be', fontSize: '0.84rem', fontWeight: '700' }}
                >
                  <i className="fas fa-shield-alt"></i>
                  <span>{isKhmer ? 'ស្តង់ដារ និងគណនេយ្យភាពស្ថាប័ន' : 'Institutional Standards & Governance'}</span>
                </div>
                <h4 className="fw-bold mb-3" style={{ color: '#07294D', fontSize: '1.4rem' }}>
                  {t('organization.governance')}
                </h4>
                <p className="text-muted mb-4" style={{ lineHeight: '2.1', fontSize: '0.98rem' }}>
                  {isKhmer
                    ? 'វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប (RPITSSR) ត្រូវដឹកនាំដោយនាយិកាវិទ្យាស្ថាន រួមជាមួយនាយករង ៣ រូប ទទួលបន្ទុកការងារតាមផ្នែកជំនាញ។ រចនាសម្ព័ន្ធនេះរៀបចំឡើងដើម្បីធានានូវអភិបាលកិច្ចប្រកបដោយគុណភាព ការបណ្តុះបណ្តាលស្របតាមតម្រូវការទីផ្សារការងារ និងការបម្រើសេវាសិស្ស-និស្សិតប្រកបដោយតម្លាភាព។'
                    : 'RPITSSR is administered by the Institute Director supported by 3 Deputy Directors across designated functional areas. This governance model guarantees high pedagogical standards, market-responsive technical education, and transparent student-centered administration.'}
                </p>
                <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-3 pt-2">
                  <Link to="/about" className="btn btn-outline-primary org-governance-btn">
                    <i className="fas fa-info-circle me-2"></i>
                    {isKhmer ? 'អំពីវិទ្យាស្ថាន' : 'About RPITSSR'}
                  </Link>
                  <Link to="/teachers" className="btn btn-outline-secondary org-governance-btn">
                    <i className="fas fa-chalkboard-teacher me-2"></i>
                    {isKhmer ? 'បញ្ជីគ្រូបង្រៀនទាំងអស់' : 'All Teaching Faculty'}
                  </Link>
                  <Link to="/contact" className="btn btn-outline-dark org-governance-btn">
                    <i className="fas fa-envelope me-2"></i>
                    {isKhmer ? 'ទាក់ទងមកវិទ្យាស្ថាន' : 'Contact Administration'}
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* LEADER PROFILE MODAL */}
      {selectedLeader && (
        <div
          className="org-modal-backdrop position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{
            backgroundColor: 'rgba(7, 41, 77, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999
          }}
          onClick={() => setSelectedLeader(null)}
        >
          <div
            className="org-modal-card bg-white rounded-4 shadow-lg overflow-hidden"
            style={{
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              animation: 'fadeInUp 0.25s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="org-modal-header text-white d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(135deg, #07294D 0%, #134e8d 60%, #1e73be 100%)' }}>
              <div className="d-flex align-items-center gap-3">
                <OrgLeaderAvatar
                  image={selectedLeader.image}
                  name={isKhmer ? selectedLeader.nameKm : selectedLeader.nameEn}
                  size={64}
                  isTopLeader={selectedLeader.id === 'director'}
                  icon={selectedLeader.icon || 'fa-user-tie'}
                />
                <div>
                  <h4 className="fw-bold mb-1 text-white" style={{ fontSize: '1.25rem', lineHeight: 1.4 }}>
                    {isKhmer ? selectedLeader.nameKm : selectedLeader.nameEn}
                  </h4>
                  <div className="text-warning small fw-semibold">
                    {isKhmer ? selectedLeader.titleKm : selectedLeader.titleEn}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm text-white rounded-circle d-flex align-items-center justify-content-center p-0 flex-shrink-0"
                onClick={() => setSelectedLeader(null)}
                style={{
                  width: '38px',
                  height: '38px',
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                  fontSize: '1.1rem',
                  border: 'none',
                  transition: 'background-color 0.2s ease'
                }}
                aria-label="Close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Body with Scrollable Area */}
            <div className="org-modal-body overflow-auto" style={{ flex: 1 }}>
              {/* Contact Information Bar */}
              <div
                className="rounded-4 border mb-4"
                style={{ padding: '22px 26px', backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
              >
                <div className="row g-3 small">
                  {selectedLeader.email && (
                    <div className="col-12 col-md-6">
                      <div className="text-muted mb-1 fw-medium" style={{ fontSize: '0.82rem' }}>{t('organization.email')}</div>
                      <a href={`mailto:${selectedLeader.email}`} className="fw-semibold text-primary text-decoration-none d-flex align-items-center gap-2">
                        <i className="fas fa-envelope text-primary flex-shrink-0"></i>
                        <span className="text-truncate">{selectedLeader.email}</span>
                      </a>
                    </div>
                  )}
                  {selectedLeader.phone && (
                    <div className="col-12 col-md-6">
                      <div className="text-muted mb-1 fw-medium" style={{ fontSize: '0.82rem' }}>{t('organization.phone')}</div>
                      <a href={`tel:${selectedLeader.phone}`} className="fw-semibold text-dark text-decoration-none d-flex align-items-center gap-2">
                        <i className="fas fa-phone text-success flex-shrink-0"></i>
                        <span>{selectedLeader.phone}</span>
                      </a>
                    </div>
                  )}
                  {selectedLeader.room && (
                    <div className="col-12 mt-2 pt-3 border-top" style={{ borderColor: '#e2e8f0' }}>
                      <div className="text-muted mb-1 fw-medium" style={{ fontSize: '0.82rem' }}>{t('organization.office')}</div>
                      <div className="fw-semibold text-dark d-flex align-items-center gap-2">
                        <i className="fas fa-map-marker-alt text-danger flex-shrink-0"></i>
                        <span>{selectedLeader.room}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio summary */}
              {(selectedLeader.bioKm || selectedLeader.bioEn) && (
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: '28px', height: '28px', backgroundColor: '#eff6ff', color: '#1e73be' }}
                    >
                      <i className="fas fa-user-tie" style={{ fontSize: '0.82rem' }}></i>
                    </span>
                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '1.02rem' }}>
                      {isKhmer ? 'សង្ខេបជីវប្រវត្តិ' : 'Executive Bio'}
                    </h6>
                  </div>
                  <div
                    className="p-3 px-4 rounded-3"
                    style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', borderLeft: '4px solid #1e73be' }}
                  >
                    <p className="small mb-0" style={{ lineHeight: '1.8', color: '#334155' }}>
                      {isKhmer ? selectedLeader.bioKm : selectedLeader.bioEn}
                    </p>
                  </div>
                </div>
              )}

              {/* Programs / Services if Department / Office */}
              {(selectedLeader.programsKm || selectedLeader.programsEn) && (
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: '28px', height: '28px', backgroundColor: '#eff6ff', color: '#1e73be' }}
                    >
                      <i className="fas fa-graduation-cap" style={{ fontSize: '0.82rem' }}></i>
                    </span>
                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '1.02rem' }}>
                      {isKhmer ? 'ជំនាញបណ្តុះបណ្តាលក្នុងដេប៉ាតឺម៉ង់' : 'Departmental Training Programs'}
                    </h6>
                  </div>
                  <div
                    className="p-3 px-4 rounded-3"
                    style={{ backgroundColor: '#eff6ff', border: '1px solid #dbeafe' }}
                  >
                    <p className="text-primary small fw-semibold mb-0" style={{ lineHeight: '1.6' }}>
                      {isKhmer ? selectedLeader.programsKm : selectedLeader.programsEn}
                    </p>
                  </div>
                </div>
              )}

              {(selectedLeader.servicesKm || selectedLeader.servicesEn) && (
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: '28px', height: '28px', backgroundColor: '#ecfdf5', color: '#059669' }}
                    >
                      <i className="fas fa-concierge-bell" style={{ fontSize: '0.82rem' }}></i>
                    </span>
                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '1.02rem' }}>
                      {isKhmer ? 'សេវាផ្តល់ជូនសិស្ស-និស្សិត' : 'Key Services Provided'}
                    </h6>
                  </div>
                  <div
                    className="p-3 px-4 rounded-3"
                    style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0' }}
                  >
                    <p className="text-success small fw-semibold mb-0" style={{ lineHeight: '1.6' }}>
                      {isKhmer ? selectedLeader.servicesKm : selectedLeader.servicesEn}
                    </p>
                  </div>
                </div>
              )}

              {/* Core Responsibilities */}
              {((isKhmer ? selectedLeader.responsibilitiesKm : selectedLeader.responsibilitiesEn) || []).length > 0 && (
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: '28px', height: '28px', backgroundColor: '#ecfdf5', color: '#059669' }}
                    >
                      <i className="fas fa-tasks" style={{ fontSize: '0.82rem' }}></i>
                    </span>
                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '1.02rem' }}>
                      {t('organization.responsibilities')}
                    </h6>
                  </div>
                  <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                    {(isKhmer ? selectedLeader.responsibilitiesKm : selectedLeader.responsibilitiesEn).map((resp, idx) => (
                      <li
                        key={idx}
                        className="d-flex align-items-start gap-3 p-3 px-4 rounded-3"
                        style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}
                      >
                        <i className="fas fa-check-circle text-success mt-1 flex-shrink-0" style={{ fontSize: '0.95rem' }}></i>
                        <span style={{ fontSize: '0.9rem', lineHeight: '1.65', color: '#334155' }}>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Qualifications */}
              {(selectedLeader.qualificationsKm || selectedLeader.qualificationsEn) && (
                <div
                  className="p-3 px-4 rounded-3 d-flex align-items-center gap-3 mb-1"
                  style={{ backgroundColor: '#fefce8', border: '1px solid #fef08a' }}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: '38px', height: '38px', backgroundColor: '#fef08a', color: '#ca8a04' }}
                  >
                    <i className="fas fa-award fs-5"></i>
                  </div>
                  <div>
                    <div className="text-muted small mb-1" style={{ fontSize: '0.78rem' }}>{t('organization.qualifications')}</div>
                    <div className="fw-bold text-dark small" style={{ fontSize: '0.92rem' }}>
                      {isKhmer ? selectedLeader.qualificationsKm : selectedLeader.qualificationsEn}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="org-modal-footer bg-light border-top d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-secondary rounded-pill px-4 py-2 fw-semibold shadow-sm"
                onClick={() => setSelectedLeader(null)}
              >
                {t('organization.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationPage;
