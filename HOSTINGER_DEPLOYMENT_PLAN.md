# ផែនការ និងការណែនាំដាក់ពង្រាយគម្រោងលើ Hostinger (rpitssr.edu.kh)

> **Domain ផ្លូវការ:** `rpitssr.edu.kh`  
> **ស្ថាបត្យកម្ម Subdomain (Dual Subdomain Architecture):**
> - 🌐 **Frontend Web Portal**: `https://web.rpitssr.edu.kh` (ឬ `https://portal.rpitssr.edu.kh`)
> - ⚙️ **Backend API**: `https://api.rpitssr.edu.kh`

---

## 📦 កញ្ចប់ Zip សម្រាប់ Upload (នៅក្នុង Folder `hostinger-deploy/`)

កញ្ចប់ Zip ស្អាតស្អំទាំង ២ ត្រូវបានវេចខ្ចប់ដោយស្វ័យប្រវត្តិក្តៅៗ រួចរាល់សម្រាប់ Upload៖
1. **`hostinger-deploy/frontend-web.zip`** (`51MB`):
   - ផ្ទុកតែមាតិកានៅក្នុង `dist/` ដែលបាន compile និង minify រួច (React 19 + Vite 8.3)
   - រួមបញ្ចូលទាំងឯកសារ `.htaccess` សម្រាប់ការពារ Single Page Application (SPA) routing (មិន error 404 ពេល refresh ទំព័រ)
2. **`hostinger-deploy/backend-api.zip`** (`44MB`):
   - ផ្ទុក Laravel Core Application ស្អាតស្អំ
   - បាន Exclude ឯកសារសម្ងាត់ `.env`, `.git`, tests, SQLite, និង log ចាស់ៗ ដើម្បីសុវត្ថិភាពខ្ពស់បំផុត

---

## 🗺️ រចនាសម្ព័ន្ធ Folder លើ Hostinger File Manager

```text
/home/u123456789/domains/rpitssr.edu.kh/
│
├── public_html/
│   └── web/                         <-- [Frontend Document Root: web.rpitssr.edu.kh]
│       ├── assets/
│       ├── images/
│       ├── fonts/
│       ├── index.html
│       └── .htaccess                <-- [SPA Routing & Rewrite Rules]
│
└── backend/                         <-- [Laravel Core សុវត្ថិភាពនៅក្រៅ public_html]
    ├── app/
    ├── bootstrap/
    ├── config/
    ├── database/
    ├── public/                      <-- [Backend Document Root: api.rpitssr.edu.kh]
    │   ├── index.php
    │   ├── storage/                 <-- Symlink ទៅ storage/app/public
    │   └── .htaccess
    ├── routes/
    ├── storage/
    ├── vendor/
    └── .env                         <-- [ឯកសារ Config Production បង្កើតផ្ទាល់លើ Server]
```

---

## 🚀 ជំហានអនុវត្តជាក់ស្តែងទាំង ៥ (Step-by-Step Execution)

### ជំហានទី ១: បង្កើត Subdomains & បើក SSL ក្នុង Hostinger hPanel

1. ចូលទៅកាន់ **Hostinger hPanel** -> ជ្រើសរើស Domain **`rpitssr.edu.kh`**
2. ចូលទៅកាន់ **Subdomains**៖
   - **Subdomain ទី ១ (Frontend)**:
     - ឈ្មោះ Subdomain: `web` (ចេញជា `web.rpitssr.edu.kh`)
     - ធីកយក: *Custom folder for subdomain*
     - បញ្ចូលឈ្មោះថត: `public_html/web`
     - ចុច **Create**
   - **Subdomain ទី ២ (Backend API)**:
     - ឈ្មោះ Subdomain: `api` (ចេញជា `api.rpitssr.edu.kh`)
     - ធីកយក: *Custom folder for subdomain*
     - បញ្ចូលឈ្មោះថត: `backend/public` *(ចង្អុលផ្ទាល់ទៅ `backend/public` មិនប៉ះពាល់ source code ក្នុង root)*
     - ចុច **Create**
3. ចូលទៅកាន់ Menu **SSL** ក្នុង hPanel៖
   - ដំឡើង **Free SSL (Let's Encrypt)** សម្រាប់ `web.rpitssr.edu.kh` និង `api.rpitssr.edu.kh` (ដើម្បីឱ្យមាន `https://` បៃតងទាំងពីរ)
4. ចូលទៅកាន់ **PHP Configuration**៖
   - ជ្រើសយក **PHP 8.2** ឬ **PHP 8.3**
   - ផ្ទាំង **PHP Extensions**: ធីកបើក `fileinfo`, `pdo_mysql`, `mbstring`, `openssl`, `curl`, `gd`, `bcmath`, `zip`

---

### ជំហានទី ២: បង្កើត MySQL Database លើ Hostinger

1. ចូលទៅកាន់ **Databases** -> **MySQL Databases**
2. បង្កើត Database ថ្មី៖
   - **Database Name**: ឧ. `u123456_rpitssr`
   - **Username**: ឧ. `u123456_admin`
   - **Password**: លេខសម្ងាត់ខ្លាំង (Generate Password)
   - ចុច **Create**
3. កត់ត្រាព័ត៌មានទាំង ៣ នេះទុកសម្រាប់បំពេញក្នុង `.env`។

---

### ជំហានទី ៣: Upload និង Extract កញ្ចប់ Zip ទាំង ២

1. **Upload Frontend**:
   - បើក **File Manager** ក្នុង hPanel -> ចូលថត `domains/rpitssr.edu.kh/public_html/web/`
   - Upload ឯកសារ `hostinger-deploy/frontend-web.zip` ចូលទៅ
   - ចុចកណ្ដុរស្ដាំលើ file `frontend-web.zip` -> ជ្រើសរើស **Extract**
2. **Upload Backend**:
   - ចូលថត `domains/rpitssr.edu.kh/` -> បង្កើត Folder ឈ្មោះ `backend` (បើមិនទាន់មាន)
   - ចូលក្នុង `backend/` -> Upload ឯកសារ `hostinger-deploy/backend-api.zip`
   - ចុចកណ្ដុរស្ដាំលើ file `backend-api.zip` -> ជ្រើសរើស **Extract**

---

### ជំហានទី ៤: បង្កើតឯកសារ `.env` លើ Hostinger Backend

នៅក្នុងថត `domains/rpitssr.edu.kh/backend/` បង្កើតឯកសារថ្មីឈ្មោះ `.env` រួចចម្លងកូដខាងក្រោមចូល (កែប្រែព័ត៌មាន Database របស់លោកអ្នក)៖

```env
APP_NAME="RPITSSR Institutional Portal"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://api.rpitssr.edu.kh

# Whitelist Subdomains សម្រាប់ CORS
CORS_ALLOWED_ORIGINS=https://web.rpitssr.edu.kh,https://portal.rpitssr.edu.kh,https://rpitssr.edu.kh,https://www.rpitssr.edu.kh
TRUSTED_PROXIES=127.0.0.1
SECURITY_HSTS_ENABLED=true
SECURITY_CSP_REPORT_ONLY=false
BACKUP_DOWNLOADS_ENABLED=false
SANCTUM_EXPIRATION=10080

APP_LOCALE=km
APP_FALLBACK_LOCALE=en

BCRYPT_ROUNDS=12
LOG_CHANNEL=daily
LOG_LEVEL=error

# បញ្ចូលព័ត៌មាន Database ដែលបានបង្កើតក្នុងជំហានទី ២
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=u123456_rpitssr
DB_USERNAME=u123456_admin
DB_PASSWORD=YOUR_STRONG_DATABASE_PASSWORD

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=true
SESSION_PATH=/
SESSION_DOMAIN=null
SESSION_SECURE_COOKIE=true

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=public
QUEUE_CONNECTION=database
CACHE_STORE=database
RATE_LIMITER_STORE=database

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=official@rpitssr.edu.kh
MAIL_PASSWORD=YOUR_GMAIL_APP_PASSWORD
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="info@rpitssr.edu.kh"
MAIL_FROM_NAME="វិទ្យាស្ថានពហុបច្ចេកទេសភូមិភាគតេជោសែនសៀមរាប"
```

---

### ជំហានទី ៥: ដំណើរការ Commands តាម Hostinger SSH Access

ចូលទៅកាន់ **hPanel -> Advanced -> SSH Access** (បើក SSH Connection) រួចដំណើរការ Commands ខាងក្រោមតាមលំដាប់៖

```bash
# ១. ចូលទៅកាន់ថត backend នៃ domain rpitssr.edu.kh
cd domains/rpitssr.edu.kh/backend

# ២. ដំឡើង Composer packages (ប្រសិនបើ folder vendor មិនទាន់មាន ឬចង់ update)
composer install --no-dev --optimize-autoloader

# ៣. បង្កើត Application Encryption Key ថ្មីលើ Production
php artisan key:generate

# ៤. រត់ Migration និងបញ្ចូលទិន្នន័យដំបូង
php artisan migrate --force
php artisan db:seed --force

# ៥. បង្កើត Symlink សម្រាប់បង្ហាញរូបភាពឯកសារ/មេដាយ/ស្លាក
php artisan storage:link

# ៦. Cache Configurations & Routes (បង្កើនល្បឿន និងសុវត្ថិភាព)
php artisan config:cache
php artisan route:cache
php artisan view:cache

# ៧. កំណត់សិទ្ធិ Folder Storage ឱ្យ Web Server អាច save រូបភាព និង log បាន
chmod -R 775 storage bootstrap/cache
```

---

## 🧪 ការផ្ទៀងផ្ទាត់ក្រោយពេល Deploy រួចរាល់ (Post-Deployment Verification)

| ចំណុចតេស្ត | URL / សកម្មភាព | លទ្ធផលដែលរំពឹងទុក |
| :--- | :--- | :--- |
| **១. Backend Health** | `https://api.rpitssr.edu.kh/api/health` | បង្ហាញ JSON: `{"status":"ok"}` |
| **២. Frontend Home** | `https://web.rpitssr.edu.kh` | បង្ហាញទំព័រដើមស្ថាប័នពេញលេញ |
| **៣. Mobile Sliders** | បើកមើលលើទូរស័ព្ទដៃ | Carousel ជំនាញ, វីដេអូ, ព្រឹត្តិការណ៍ រត់ទៅមុខជានិច្ចគ្មាន rewind |
| **៤. Daylight Banners** | ចូល `/courses`, `/organization`, `/about` | Banner ពណ៌ Daylight Slate-Blue មាន tricolor line ស្រស់ស្អាត |
| **៥. Refresh (SPA)** | ចូល `/courses` រួចចុច F5 Refresh | មិន error 404 (ផ្ទុកទំព័រ Course ត្រឹមត្រូវតាមរយៈ `.htaccess`) |
| **៦. Admin Login** | ចូល `/login` | អាច Login ចូលផ្ទាំងគ្រប់គ្រង Admin បានត្រឹមត្រូវ |

---

## 🔄 របៀប Update កូដនៅពេលក្រោយ (Future Updates)

នៅពេលលោកអ្នកមានការកែសម្រួលកូដថ្មីនៅលើកុំព្យូទ័រ៖
1. គ្រាន់តែដំណើរការ `bash scripts/package-hostinger.sh`
2. វានឹង compile React ដោយស្វ័យប្រវត្តិ និងបង្កើត file zip ថ្មីក្នុង `hostinger-deploy/`
3. Upload តែ file zip ដែលបានផ្លាស់ប្តូរ (ឧ. `frontend-web.zip` បើកែតែ Frontend) ទៅ Extract លើ Hostinger ជាការស្រេច!
