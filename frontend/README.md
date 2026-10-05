# RPITSSR Frontend Application

This is the React + Vite frontend client for the **Regional Polytechnic Institute Techo Sen Siem Reap (RPITSSR)** official portal.

---

## 📌 សៀវភៅណែនាំអំពីការគ្រប់គ្រង និងបើកដំណើរការមុខងារឡើងវិញ (Feature Activation Guide)

សម្រាប់ដំណាក់កាលត្រៀម Deploy ដំបូង (Phase 1 Launch) មុខងារចំនួន **៥** ត្រូវបានដាក់ស្ថិតនៅក្រោមទំព័រផ្លូវការ **«កំពុងអភិវឌ្ឍ / ឆាប់ៗនេះ» (UnderDevelopmentPage)** ដើម្បីរក្សាភាពស្អាតបាត និងសុវត្ថិភាពទិន្នន័យនៃគេហទំព័រ។

> [!NOTE]
> **Component និងកូដដើមទាំងអស់ត្រូវបានរក្សាទុក ១០០% មិនមានការលុបបាត់ឡើយ:**
> - `DownloadPage.jsx` (មជ្ឈមណ្ឌលទាញយកឯកសារ)
> - `LibraryPage.jsx` (បណ្ណាល័យអេឡិចត្រូនិក)
> - `ExamResultsPage.jsx` (ការពិនិត្យលទ្ធផលប្រឡង)
> - `AdmissionApplyPage.jsx` (ការចុះឈ្មោះចូលរៀន)
> - `RegisterPage.jsx` (ការចុះឈ្មោះគណនីសិស្ស)
>
> ឯកសារទាំងអស់នេះត្រូវបាន Import រួចជាស្រេចនៅក្នុង `src/App.jsx`។ នៅពេលអ្នកចង់បើកដំណើរការមុខងារណាមួយឡើងវិញ អ្នកគ្រាន់តែកែសម្រួលកូដតែ **១ បន្ទាត់** ក្នុង `App.jsx` ប៉ុណ្ណោះ។

---

### 🛠️ របៀបបើកដំណើរការមុខងារនីមួយៗឡើងវិញ (Step-by-Step Reactivation)

បើកឯកសារ `src/App.jsx` ហើយស្វែងរកផ្នែក `PUBLIC WEBSITE ROUTES` (ចន្លោះបន្ទាត់ 120 - 150)៖

#### ១. បើកដំណើរការ «មជ្ឈមណ្ឌលទាញយកឯកសារ (Download Center)»
- **ទីតាំងក្នុង `src/App.jsx`**:
  ```jsx
  // បច្ចុប្បន្ន (Under Development):
  <Route path="/downloads" element={<UnderDevelopmentPage feature="downloads" />} />
  <Route path="/download-center" element={<UnderDevelopmentPage feature="downloads" />} />
  <Route path="/forms" element={<UnderDevelopmentPage feature="downloads" />} />

  // ប្តូរមកបើកដំណើរការពេញលេញវិញ (Active Page):
  <Route path="/downloads" element={<DownloadPage />} />
  <Route path="/download-center" element={<DownloadPage />} />
  <Route path="/forms" element={<DownloadPage />} />
  ```

#### ២. បើកដំណើរការ «បណ្ណាល័យអេឡិចត្រូនិក (E-Library)»
- **ទីតាំងក្នុង `src/App.jsx`**:
  ```jsx
  // បច្ចុប្បន្ន (Under Development):
  <Route path="/library" element={<UnderDevelopmentPage feature="library" />} />
  <Route path="/e-library" element={<UnderDevelopmentPage feature="library" />} />
  <Route path="/books" element={<UnderDevelopmentPage feature="library" />} />

  // ប្តូរមកបើកដំណើរការពេញលេញវិញ (Active Page):
  <Route path="/library" element={<LibraryPage />} />
  <Route path="/e-library" element={<LibraryPage />} />
  <Route path="/books" element={<LibraryPage />} />
  ```

#### ៣. បើកដំណើរការ «ការពិនិត្យលទ្ធផលប្រឡង (Exam Results Lookup)»
- **ទីតាំងក្នុង `src/App.jsx`**:
  ```jsx
  // បច្ចុប្បន្ន (Under Development):
  <Route path="/exam-result" element={<UnderDevelopmentPage feature="exam-result" />} />
  <Route path="/exam-results" element={<UnderDevelopmentPage feature="exam-result" />} />

  // ប្តូរមកបើកដំណើរការពេញលេញវិញ (Active Page):
  <Route path="/exam-result" element={<ExamResultsPage />} />
  <Route path="/exam-results" element={<ExamResultsPage />} />
  ```

#### ៤. បើកដំណើរការ «ការចុះឈ្មោះចូលរៀនតាមអនឡាញ (Online Admissions)»
- **ទីតាំងក្នុង `src/App.jsx`**:
  ```jsx
  // បច្ចុប្បន្ន (Under Development):
  <Route path="/apply" element={<UnderDevelopmentPage feature="admission" />} />
  <Route path="/admission" element={<UnderDevelopmentPage feature="admission" />} />
  <Route path="/admission-apply" element={<UnderDevelopmentPage feature="admission" />} />

  // ប្តូរមកបើកដំណើរការពេញលេញវិញ (Active Page):
  <Route path="/apply" element={<AdmissionApplyPage />} />
  <Route path="/admission" element={<AdmissionApplyPage />} />
  <Route path="/admission-apply" element={<AdmissionApplyPage />} />
  ```

#### ៥. បើកដំណើរការ «ការចុះឈ្មោះគណនីសិស្សថ្មី (Student Registration)»
- **ទីតាំងក្នុង `src/App.jsx`**:
  ```jsx
  // បច្ចុប្បន្ន (Under Development):
  <Route path="/register" element={<UnderDevelopmentPage feature="register" />} />

  // ប្តូរមកបើកដំណើរការពេញលេញវិញ (Active Page):
  <Route path="/register" element={<RegisterPage />} />
  ```

---

### 🏷️ របៀបដកផ្លាក «ឆាប់ៗនេះ» (Coming Soon Badges)

នៅពេលបើកដំណើរការទំព័រណាមួយឡើងវិញ អ្នកអាចដកផ្លាកសម្គាល់ «ឆាប់ៗនេះ» ចេញពី Menu និងទំព័រដើមបានយ៉ាងងាយស្រួល៖

1. **នៅក្នុង Menu ចំហៀងទូរស័ព្ទ (`src/components/layout/Navbar.jsx`)**:
   - ស្វែងរក `<span className="drawer-badge-pill amber">{isKhmer ? 'ឆាប់ៗនេះ' : 'Coming Soon'}</span>`
   - លុប ឬ comment បន្ទាត់នោះចេញពី Link ដែលបានបើកដំណើរការរួច។

2. **នៅលើផ្ទាំងច្រកទ្វារកាត់លើទំព័រដើម (`src/pages/HomePage.jsx`)**:
   - ស្វែងរក `badgeText: isKhmer ? 'ឆាប់ៗនេះ' : 'Coming Soon'` (ត្រង់ Gateway 2 Download Center ឬ Gateway 4 Online Admissions)
   - ដក property `badgeText` ឬប្តូរទៅជា `null` ដើម្បីកុំឱ្យបង្ហាញផ្លាក។

---

### ⚡ បញ្ជាសំខាន់ៗសម្រាប់ដំណើរការ (Useful Commands)

```bash
# ដំណើរការ Local Dev Server
npm run dev

# ពិនិត្យកូដ (Lint)
npm run lint

# Build សម្រាប់ Production Deployment
npm run build
```
