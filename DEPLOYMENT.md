# CogniSpark Deployment Guide

## Prerequisites

- Google Cloud Project (`golden-shine-495107-e5`)
- GitHub repository (`aaliya1719/cognispark`)
- `gcloud` CLI installed locally
- GitHub account with admin access to the repo

## Step 1: Run GCP Setup Script

Open Cloud Shell or your terminal and run:

```bash
# Clone your repo locally (if not already)
git clone https://github.com/aaliya1719/cognispark.git
cd cognispark

# Run the setup script
bash scripts/setup-gcp.sh
```

This script will:
- Enable required Google Cloud APIs
- Create Artifact Registry repository
- Create service account for GitHub
- Set up Workload Identity Federation
- Output configuration values

## Step 2: Add GitHub Secrets

Go to: `https://github.com/aaliya1719/cognispark/settings/secrets/actions`

Add these secrets (the script will output the values):

| Secret Name | Description |
|---|---|
| `WIF_PROVIDER` | Workload Identity Provider (from script output) |
| `WIF_SERVICE_ACCOUNT` | Service account email (from script output) |
| `NEXTAUTH_URL` | Your Cloud Run service URL (add after first deploy) |
| `NEXTAUTH_SECRET` | Generate: `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | From Google OAuth app |
| `GOOGLE_CLIENT_SECRET` | From Google OAuth app |
| `GEMINI_API_KEY` | Your Google Gemini API key |

## Step 3: Deploy

Push changes to `main` branch:

```bash
git push origin main
```

GitHub Actions will automatically:
1. Build Docker image
2. Push to Artifact Registry
3. Deploy to Cloud Run

Monitor the workflow at: `https://github.com/aaliya1719/cognispark/actions`

## Step 4: Get Deployed URL

After first deployment succeeds:

```bash
gcloud run services describe cognispark --region=us-central1 --format='value(status.url)'
```

Add this URL as `NEXTAUTH_URL` GitHub secret.

## Environment Variables

The following environment variables are required:

- `NEXTAUTH_URL`: Your Cloud Run URL
- `NEXTAUTH_SECRET`: Secret for NextAuth
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth secret
- `GEMINI_API_KEY`: Google Gemini API key
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to GCP service account key (auto-mounted on Cloud Run)

## Firestore Configuration

The app uses Firestore for data persistence. Ensure:

1. Firestore Database is created in your GCP project
2. Service account has Firestore permissions (included in setup)

## Troubleshooting

**GitHub Actions fails with auth error:**
- Verify `WIF_PROVIDER` and `WIF_SERVICE_ACCOUNT` secrets are correct

**Cloud Run deployment fails:**
- Check service account has `run.admin` role
- Verify environment variables are set correctly

**Firestore connection errors:**
- Ensure Firestore database exists in your project
- Check service account has Firestore permissions

## Rollback

To rollback to previous version:

```bash
gcloud run deploy cognispark \
  --image=us-central1-docker.pkg.dev/golden-shine-495107-e5/cognispark/cognispark:PREVIOUS_SHA \
  --region=us-central1
```
