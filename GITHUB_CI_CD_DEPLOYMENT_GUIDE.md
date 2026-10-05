# មគ្គុទ្ទេសក៍ដំឡើងការ Deploy ដោយស្វ័យប្រវត្តិចេញពី GitHub (GitHub Actions CI/CD to Hostinger)

> 🚀 **គោលដៅ:** រាល់ពេលលោកអ្នកកែប្រែកូដរួចរាល់ ហើយដំណើរការ `git push origin main` ទៅកាន់ GitHub ប្រព័ន្ធ **GitHub Actions** នឹង Build React និងផ្ញើកូដទៅកាន់ Hostinger រួចរត់ migrate/cache ដោយស្វ័យប្រវត្តិ ១០០% ដោយមិនបាច់ Zip ឬ Upload ដោយដៃទៀតឡើយ!

---

## 🏗️ ដំណើរការរបស់ CI/CD Workflow (`.github/workflows/deploy.yml`)

```text
[កុំព្យូទ័ររបស់អ្នក]
       │
       ▼  (git push origin main)
[GitHub Repository]
       │
       ▼  (ដំណើរការ GitHub Actions Runner ដោយឥតគិតថ្លៃ មាន RAM 8GB)
 ├── ១. Checkout កូដថ្មី
 ├── ២. Build React Frontend (`npm run build`)
 ├── ៣. Sync តែ folder `dist/` ទៅកាន់ Hostinger `public_html/web/`
 ├── ៤. Sync កូដ Laravel Backend ទៅកាន់ `domains/rpitssr.edu.kh/backend/`
 └── ៥. SSH ចូល Hostinger រត់ `composer install`, `php artisan migrate`, `php artisan config:cache`
       │
       ▼
[Hostinger Server (rpitssr.edu.kh) ផ្សាយផ្ទាល់កូដថ្មីភ្លាមៗ!]
```

---

## 🔑 ជំហានរៀបចំទាំង ៣ យ៉ាងងាយស្រួល (One-Time Setup)

### ជំហានទី ១: យកព័ត៌មាន SSH ពី Hostinger

1. ចូលទៅកាន់ **Hostinger hPanel**
2. ចូលទៅកាន់ **Advanced** -> **SSH Access**
3. ចុច **Enable SSH** (បើមិនទាន់បានបើក)
4. លោកអ្នកនឹងឃើញព័ត៌មានដូចខាងក្រោម៖
   - **SSH IP (Host)**: ឧ. `185.xxx.xxx.xxx`
   - **SSH Port**: `65002` (Hostinger ប្រើ Port 65002 ជាស្តង់ដារ)
   - **SSH Username**: ឧ. `u795902940`
   - **SSH Password**: លេខសម្ងាត់គណនី Hostinger របស់អ្នក

---

### ជំហានទី ២: បង្កើត SSH Key សម្រាប់ GitHub ភ្ជាប់ទៅ Hostinger

នៅលើ Terminal ម៉ាស៊ីន Mac របស់អ្នក សូមដំណើរការ Command នេះដើម្បីបង្កើតសោរ SSH ថ្មីមួយ៖

```bash
# ១. បង្កើត SSH Key គូ (Private & Public)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/hostinger_deploy -N ""

# ២. មើល Public Key (ដើម្បីយកទៅដាក់លើ Hostinger)
cat ~/.ssh/hostinger_deploy.pub

# ៣. មើល Private Key (ដើម្បីយកទៅដាក់ក្នុង GitHub Secrets)
cat ~/.ssh/hostinger_deploy
```

**របៀបដាក់ Key លើ Hostinger:**
- ក្នុង Hostinger hPanel -> **SSH Access** -> រំកិលចុះក្រោមត្រង់ **SSH Keys**
- ចុច **Add SSH Key** -> បិទភ្ជាប់ (Paste) មាតិកានៃ `~/.ssh/hostinger_deploy.pub` ចូល រួចចុច **Add**។

---

### ជំហានទី ៣: បញ្ចូល Secrets ក្នុង GitHub Repository

1. បើក Repository គម្រោងរបស់អ្នកនៅលើវេបសាយ **GitHub.com**
2. ចូលទៅកាន់ **Settings** (របស់ Repo) -> ផ្ទាំងខាងឆ្វេងរើស **Secrets and variables** -> **Actions**
3. ចុចប៊ូតុងពណ៌បៃតង **New repository secret** រួចបង្កើត Secrets ចំនួន ៤ ដូចខាងក្រោម៖

| ឈ្មោះ Secret Name | តម្លៃត្រូវបញ្ចូល (Secret Value) |
| :--- | :--- |
| `HOSTINGER_SSH_HOST` | SSH IP របស់ Hostinger (ឧ. `185.199.xxx.xxx`) |
| `HOSTINGER_SSH_PORT` | `65002` |
| `HOSTINGER_SSH_USER` | SSH Username (ឧ. `u795902940`) |
| `HOSTINGER_SSH_KEY` | មាតិកាទាំងស្រុងនៃ Private Key (`~/.ssh/hostinger_deploy`) រាប់ទាំង `-----BEGIN OPENSSH PRIVATE KEY-----` រហូតដល់ចុងបញ្ចប់ |

---

## 🎯 របៀបប្រើប្រាស់ (How to Use)

ចាប់ពីពេលនេះតទៅ រាល់ពេលដែលលោកអ្នកចង់ដាក់កូដថ្មីទៅកាន់ Server៖

```bash
# ១. បញ្ចូលកូដដែលបានកែ
git add .
git commit -m "Update feature / UI improvements"

# ២. Push ទៅកាន់ GitHub
git push origin main
```

**បន្ទាប់ពី Push រួច:**
1. បើកមើលផ្ទាំង **Actions** លើ GitHub របស់អ្នក
2. លោកអ្នកនឹងឃើញ Workflow **"Deploy to Hostinger Production"** កំពុងដំណើរការដោយស្វ័យប្រវត្តិ
3. រយៈពេលប្រហែល ១ ទៅ ២ នាទី វានឹងចេញសញ្ញាគ្រីសពណ៌បៃតង `✓` មានន័យថា Server របស់លោកអ្នកបាន Update កូដថ្មីដោយជោគជ័យ!

> **ចំណាំបន្ថែម:** លោកអ្នកក៏អាចចូលទៅកាន់ផ្ទាំង **Actions** លើ GitHub -> ចុចលើ **Deploy to Hostinger Production** -> ចុច **Run workflow** ដើម្បីបញ្ជាឱ្យវា Deploy ដោយដៃបានគ្រប់ពេលវេលាផងដែរ។
