#!/bin/bash

# CogniSpark GCP Setup Script
# This script sets up Google Cloud infrastructure for deployment

set -e

# Configuration
PROJECT_ID="golden-shine-495107-e5"
REGION="us-central1"
SERVICE_ACCOUNT="github-cognispark"
REPOSITORY="cognispark"
GITHUB_OWNER="aaliya1719"
GITHUB_REPO="cognispark"

echo "🚀 Starting CogniSpark GCP Setup..."
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Set project
echo "📋 Setting GCP project..."
gcloud config set project $PROJECT_ID

# 1. Enable APIs
echo "✅ Enabling required APIs..."
gcloud services enable \
  artifactregistry.googleapis.com \
  run.googleapis.com \
  iamcredentials.googleapis.com \
  cloudresourcemanager.googleapis.com \
  iam.googleapis.com

# 2. Create Artifact Registry repository
echo "✅ Creating Artifact Registry repository..."
gcloud artifacts repositories create $REPOSITORY \
  --repository-format=docker \
  --location=$REGION \
  --description="CogniSpark Docker images" \
  2>/dev/null || echo "   (Repository may already exist)"

# 3. Create service account
echo "✅ Creating service account for GitHub..."
gcloud iam service-accounts create $SERVICE_ACCOUNT \
  --display-name="GitHub Actions for CogniSpark" \
  2>/dev/null || echo "   (Service account may already exist)"

SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com"

# 4. Grant Cloud Run Admin role
echo "✅ Granting Cloud Run Admin permissions..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:${SERVICE_ACCOUNT_EMAIL} \
  --role=roles/run.admin \
  --condition=None \
  2>/dev/null || true

# 5. Grant Artifact Registry Writer role
echo "✅ Granting Artifact Registry Writer permissions..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:${SERVICE_ACCOUNT_EMAIL} \
  --role=roles/artifactregistry.writer \
  --condition=None \
  2>/dev/null || true

# 6. Grant Service Account User role
echo "✅ Granting Service Account User permissions..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:${SERVICE_ACCOUNT_EMAIL} \
  --role=roles/iam.serviceAccountUser \
  --condition=None \
  2>/dev/null || true

# 7. Get project number
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')

# 8. Create Workload Identity Pool
echo "✅ Creating Workload Identity Pool..."
gcloud iam workload-identity-pools create "github-pool" \
  --project=$PROJECT_ID \
  --location=global \
  --display-name="GitHub Actions Pool" \
  2>/dev/null || echo "   (Pool may already exist)"

# 9. Create Workload Identity Provider
echo "✅ Creating Workload Identity Provider..."
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project=$PROJECT_ID \
  --location=global \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.aud=assertion.aud,attribute.repository_owner=assertion.repository_owner" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --workload-identity-pool="github-pool" \
  2>/dev/null || echo "   (Provider may already exist)"

# 10. Grant Workload Identity User role
echo "✅ Granting Workload Identity User role..."
gcloud iam service-accounts add-iam-policy-binding \
  ${SERVICE_ACCOUNT_EMAIL} \
  --project=$PROJECT_ID \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-pool/attribute.repository_owner/${GITHUB_OWNER}" \
  2>/dev/null || true

# Get Workload Identity Provider resource name
WIF_PROVIDER="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-pool/providers/github-provider"

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📌 Add these GitHub Secrets to your repository:"
echo "   Go to: https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/settings/secrets/actions"
echo ""
echo "1. WIF_PROVIDER"
echo "   Value: ${WIF_PROVIDER}"
echo ""
echo "2. WIF_SERVICE_ACCOUNT"
echo "   Value: ${SERVICE_ACCOUNT_EMAIL}"
echo ""
echo "3. NEXTAUTH_URL (after first deployment)"
echo "   Value: https://cognispark-<hash>.run.app"
echo ""
echo "4. NEXTAUTH_SECRET (generate: openssl rand -base64 32)"
echo "   Value: <random-secret>"
echo ""
echo "5. GOOGLE_CLIENT_ID"
echo "   Value: <from your OAuth app>"
echo ""
echo "6. GOOGLE_CLIENT_SECRET"
echo "   Value: <from your OAuth app>"
echo ""
echo "7. GEMINI_API_KEY"
echo "   Value: <your Gemini API key>"
echo ""
echo "🎉 Ready to deploy! Push to main branch to trigger GitHub Actions workflow."
