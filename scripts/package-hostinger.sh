#!/usr/bin/env bash
# ==============================================================================
# RPITSSR Hostinger Deployment Packaging Script
# Generates clean, ready-to-upload zip archives for Frontend and Backend.
# Excludes development artifacts, sensitive credentials, tests, and database dumps.
# ==============================================================================

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="${ROOT_DIR}/hostinger-deploy"

echo "=========================================================="
echo "📦 RPITSSR: Packaging for Hostinger Deployment"
echo "=========================================================="

mkdir -p "${OUTPUT_DIR}"
rm -rf "${OUTPUT_DIR}/*"

# 1. Build and Package Frontend (dist only)
echo "🔨 Building Frontend React application..."
cd "${ROOT_DIR}/frontend"
npm run build

echo "📦 Packaging Frontend to frontend-web.zip..."
cd "${ROOT_DIR}/frontend/dist"
zip -r -q "${OUTPUT_DIR}/frontend-web.zip" .
echo "   ✅ Generated: ${OUTPUT_DIR}/frontend-web.zip"

# 2. Package Backend (Clean Laravel Code)
echo "📦 Packaging Backend to backend-api.zip..."
cd "${ROOT_DIR}/backend"

zip -r -q "${OUTPUT_DIR}/backend-api.zip" . \
  -x "*.git*" \
  -x "tests/*" \
  -x ".env" \
  -x ".env.local" \
  -x ".env.backup*" \
  -x "*.sqlite*" \
  -x "storage/logs/*.log" \
  -x "storage/framework/cache/*" \
  -x "storage/framework/sessions/*" \
  -x "storage/framework/views/*" \
  -x "storage/app/backups/*" \
  -x "storage/app/admissions/private/*" \
  -x "node_modules/*"

echo "   ✅ Generated: ${OUTPUT_DIR}/backend-api.zip"

echo "=========================================================="
echo "🎉 SUCCESS: Ready for Hostinger Upload!"
echo "=========================================================="
echo "1. Upload frontend-web.zip into: public_html/web/ and extract it."
echo "2. Upload backend-api.zip into:  domains/yourdomain.com/backend/ and extract it."
echo "3. Follow the instructions in hostinger_subdomain_deployment_plan.md"
echo "=========================================================="
