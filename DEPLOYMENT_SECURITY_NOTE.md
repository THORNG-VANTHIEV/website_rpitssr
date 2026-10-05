# សៀវភៅណែនាំស្តីពីការការពារទិន្នន័យសម្ងាត់ពេល Deploy (Deployment Security & Data Leak Prevention Note)

> **គោលបំណង:** កំណត់ត្រាសំខាន់អំពីបញ្ជីឯកសារ និង Folder ដែលមិនត្រូវ Deploy ឬ Copy ទៅកាន់ Production Server ជាដាច់ខាត ដើម្បីជៀសវាងការលេចធ្លាយទិន្នន័យ (Data Leaks / Sensitive Data Exposure) និងការលេចធ្លាយ Source Code។

---

### 🛑 ១. ក្រុមឯកសារផ្ទុកលេខសម្ងាត់ និង Configuration (Secret & Config Files)
| ឯកសារ / Folder | មូលហេតុដែលមិនត្រូវ Deploy |
| :--- | :--- |
| **`backend/.env` (របស់ Local)** | ផ្ទុក Password Database ម៉ាស៊ីនផ្ទាល់ខ្លួន, Local App Key និង Debug mode។ **(នៅលើ Server ត្រូវបង្កើត `.env` ថ្មីផ្ទាល់លើ Server នោះ)** |
| **`*.env.backup`, `*.env.old`, `*.env.production`** | ឯកសារ Backup ច្រើនតែ Web Server (Nginx/Apache) មិនស្គាល់ថាជា Config ហើយអាចអនុញ្ញាតឱ្យអ្នកក្រៅទាញយកតាម Browser បាន (`domain.com/.env.backup`) |
| **`backend/storage/*.key`** | ផ្ទុក Encryption Keys ឬ Private Keys របស់ local |

---

### 🛑 ២. ក្រុមឯកសារទិន្នន័យ និង Backup (Database Dumps & Backups)
| ឯកសារ / Folder | មូលហេតុដែលមិនត្រូវ Deploy |
| :--- | :--- |
| **`*.sql`, `*.sql.gz`, `*.dump`** *(ឧ. `rpitssr_db.sql`)* | ផ្ទុកទិន្នន័យជាក់ស្តែង រួមទាំង Hash Password របស់ Admin និងទិន្នន័យសិស្ស។ **ហានិភ័យធ្ងន់ធ្ងរបំផុតបើធ្លាយ!** |
| **`backend/database/*.sqlite*`** *(ឧ. `database.sqlite`)* | ឯកសារ Database SQLite ដែលតេស្តលើ local (អាចត្រូវគេ download បានបើគ្មានការការពារ) |
| **`backend/storage/app/backups/*`** | ឯកសារដែលប្រព័ន្ធ Admin បង្កើតពេលចុច Backup Database លើម៉ាស៊ីន local |

---

### 🛑 ៣. ក្រុមឯកសារ Version Control & Local Editors (VCS & Development Metadata)
| ឯកសារ / Folder | មូលហេតុដែលមិនត្រូវ Deploy |
| :--- | :--- |
| **`.git/` (Folder Git ទាំងមូល)** | **គ្រោះថ្នាក់បំផុត!** ប្រសិនបើ Folder `.git` ធ្លាយតាម Web (`domain.com/.git/`) ជនអនាមិកអាចទាញយក Source Code និង Git History ទាំងអស់នៃគម្រោង |
| **`.agents/`, `.gemini/`, `.github/`** | ផ្ទុក logs និង script ជំនួយការអភិវឌ្ឍន៍ (Dev tooling) |
| **`.idea/`, `.vscode/`, `.DS_Store`, `Thumbs.db`** | ឯកសារ Cache របស់កម្មវិធីសរសេរកូដ (VS Code/PhpStorm) និង MacOS |

---

### 🛑 ៤. កូដប្រភពដើមរបស់ Frontend (Frontend Dev Source & Node Modules)
> [!IMPORTANT]
> នៅលើ Production Server លោកអ្នក **មិនត្រូវ Deploy ថត `frontend/src` ឬ `frontend/node_modules` ឡើយ!**

| ឯកសារ / Folder | មូលហេតុ |
| :--- | :--- |
| **`frontend/src/`** | ជាកូដ JSX/React ដើមដែលមិនទាន់ compile |
| **`frontend/node_modules/`** | មានទំហំធំរាប់រយ MBs និងផ្ទុក dev libraries ឥតប្រយោជន៍លើ production |
| **`frontend/vite.config.js`, `package.json`** | Configuration សម្រាប់ build |

👉 **វិធីត្រឹមត្រូវសម្រាប់ Frontend:** 
- ដំណើរការ `npm run build` នៅលើម៉ាស៊ីនរបស់អ្នក
- រួច **យកតែមាតិកានៅក្នុងថត `frontend/dist/` តែមួយគត់** ទៅដាក់លើ Web Server (Nginx/Apache Document Root)។

---

### 🛑 ៥. ឯកសារ Logs, Tests និង Mock Data
| ឯកសារ / Folder | មូលហេតុដែលមិនត្រូវ Deploy |
| :--- | :--- |
| **`backend/storage/logs/*.log`** *(ឧ. `laravel.log`)* | ផ្ទុក Error messages, API request payloads, និង Session debug ចាស់ៗក្នុង local |
| **`backend/tests/`** | ឯកសារ Test Suite (មិនចាំបាច់នៅលើ Production Server ឡើយ) |
| **`backend/database/seeders/backup_mock_*.json`** | ឯកសារទិន្នន័យសាកល្បង (Mock/Dummy data) |
| **`backend/storage/app/admissions/private/*`** | ឯកសារអត្តសញ្ញាណប័ណ្ណ/សៀវភៅគ្រួសារដែលបាន upload តេស្តក្នុង local (នៅលើ server ត្រូវទុក folder នេះទទេរ) |

---

### 🛡️ គំរូ Command `rsync` សម្រាប់ Deploy ដោយសុវត្ថិភាព (Safe Deploy Command)

ប្រសិនបើលោកអ្នកប្រើប្រាស់ SSH/rsync ដើម្បី sync កូដទៅកាន់ Server លោកអ្នកអាចប្រើ options `--exclude` ដូចខាងក្រោម៖

```bash
# ឧទាហរណ៍ Sync Backend ដោយ exclude ឯកសារគ្រោះថ្នាក់
rsync -avz --delete \
  --exclude='.git*' \
  --exclude='.env*' \
  --exclude='*.sql*' \
  --exclude='*.sqlite*' \
  --exclude='storage/logs/*.log' \
  --exclude='storage/app/backups/*' \
  --exclude='tests/' \
  --exclude='vendor/' \
  --exclude='node_modules/' \
  ./backend/ user@server_ip:/var/www/rpitssr/backend/

# នៅលើ Server រួចរាល់ទើប run:
# composer install --no-dev --optimize-autoloader
```

---

### 🔒 ការការពារបន្ថែមនៅលើ Web Server (Nginx Configuration)
ត្រូវប្រាកដថា Nginx លើ Server មានបន្ទាត់នេះ ដើម្បីបិទមិនឱ្យ Web Browser បើកមើល hidden files និង file `.env`:

```nginx
# ប្លុកមិនឱ្យនរណាម្នាក់ download ឯកសារចាប់ផ្តើមដោយសញ្ញាចុច (.) ដូចជា .env, .git
location ~ /\.(?!well-known) {
    deny all;
    return 404;
}

# ប្លុកមិនឱ្យ download ឯកសារ sql ឬ log
location ~* \.(sql|log|dump)$ {
    deny all;
    return 404;
}
```
