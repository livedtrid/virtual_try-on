# Google Cloud Deployment Guide

This guide walks you through hosting the **Virtual Try-On backend** (FastAPI) and **frontend** (React) on Google Cloud — from zero to a live URL.

No prior Google Cloud experience is required.

---

## Table of Contents

1. [What Google Cloud services are used](#1-what-google-cloud-services-are-used)
2. [Prerequisites](#2-prerequisites)
3. [Create a Google Cloud project](#3-create-a-google-cloud-project)
4. [Enable billing](#4-enable-billing)
5. [Enable required APIs](#5-enable-required-apis)
6. [Install and configure the Google Cloud CLI](#6-install-and-configure-the-google-cloud-cli)
7. [Create a Service Account for the backend](#7-create-a-service-account-for-the-backend)
8. [Deploy the backend to Cloud Run](#8-deploy-the-backend-to-cloud-run)
9. [Deploy the frontend to Firebase Hosting](#9-deploy-the-frontend-to-firebase-hosting)
10. [Connect frontend to backend](#10-connect-frontend-to-backend)
11. [Verify everything works](#11-verify-everything-works)
12. [Estimated costs](#12-estimated-costs)
13. [Tear down / cleanup](#13-tear-down--cleanup)

---

## 1. What Google Cloud services are used

| Service | What it does in this project | Free tier? |
|---|---|---|
| **Cloud Run** | Hosts the FastAPI backend as a serverless container. Scales to zero when idle. | Yes — 2M requests/month |
| **Artifact Registry** | Stores the Docker container image for Cloud Run | Yes — 0.5 GB free |
| **Vertex AI** | Powers the Virtual Try-On AI model | Billed per request (see §12) |
| **Firebase Hosting** | Serves the static React frontend via CDN globally | Yes — 10 GB storage / 360 MB/day |
| **IAM** | Manages which service has permission to call Vertex AI | Free |
| **Cloud Build** | (Optional) Builds the Docker image without needing Docker locally | Yes — 120 min/day free |

> **Cloud Run + Firebase Hosting** is the recommended combination: both are serverless, both scale automatically, and both have generous free tiers.

---

## 2. Prerequisites

Install the following on your machine before starting:

### Node.js 18+
Download from [nodejs.org](https://nodejs.org/). After install, confirm:
```bash
node --version
```

### Python 3.11+
Download from [python.org](https://www.python.org/downloads/). After install, confirm:
```bash
python --version
```

### Docker Desktop
Required to build the backend container image.
Download from [docker.com](https://www.docker.com/products/docker-desktop/).
After install, confirm Docker is running:
```bash
docker --version
```

### Google Cloud CLI (`gcloud`)
Download and install from [cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install).

**Windows:** run the installer `.exe` — it adds `gcloud` to your PATH automatically.

After install, confirm:
```bash
gcloud --version
```

### Firebase CLI
```bash
npm install -g firebase-tools
```

Confirm:
```bash
firebase --version
```

---

## 3. Create a Google Cloud project

A **project** is an isolated workspace in Google Cloud — it has its own billing, APIs, and resources.

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Sign in with a Google account
3. Click the **project dropdown** at the top → **New Project**
4. Enter a name (e.g., `virtual-try-on-poc`)
5. Note the **Project ID** — it is auto-generated (e.g., `virtual-try-on-poc-123456`). You will use this ID in every command below.
6. Click **Create**

Set it as your active project in the CLI:
```bash
gcloud config set project YOUR_PROJECT_ID
```

---

## 4. Enable billing

Vertex AI requires an active billing account even for small usage.

1. Go to [console.cloud.google.com/billing](https://console.cloud.google.com/billing)
2. Click **Link a billing account** → **Create billing account**
3. Enter your payment info and link it to your project

> **Tip:** Set up a [budget alert](https://console.cloud.google.com/billing/budgets) at $10–$20 now so you get an email if costs are unexpected.

---

## 5. Enable required APIs

Google Cloud APIs are disabled by default. Run this single command to enable everything this project needs:

```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  aiplatform.googleapis.com \
  cloudbuild.googleapis.com \
  iam.googleapis.com \
  --project YOUR_PROJECT_ID
```

This takes about 30–60 seconds. You only need to do this once per project.

---

## 6. Install and configure the Google Cloud CLI

Authenticate your CLI with your Google account:
```bash
gcloud auth login
```

A browser window will open — sign in and grant access.

Also authenticate Application Default Credentials (used by SDKs and local dev):
```bash
gcloud auth application-default login
```

Set your project and default region:
```bash
gcloud config set project YOUR_PROJECT_ID
gcloud config set run/region us-central1
```

> `us-central1` is recommended because the Vertex AI Virtual Try-On model is available there.

---

## 7. Create a Service Account for the backend

The backend running on Cloud Run needs permission to call Vertex AI. A **Service Account** is a special identity for a non-human process.

### 7a. Create the service account
```bash
gcloud iam service-accounts create vto-backend \
  --display-name "Virtual Try-On Backend" \
  --project YOUR_PROJECT_ID
```

### 7b. Grant it Vertex AI access
```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member "serviceAccount:vto-backend@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role "roles/aiplatform.user"
```

The `aiplatform.user` role allows calling Vertex AI prediction endpoints such as Virtual Try-On — no broader permissions are granted.

---

## 8. Deploy the backend to Cloud Run

### 8a. Create a Docker image repository in Artifact Registry

```bash
gcloud artifacts repositories create vto-backend \
  --repository-format docker \
  --location us-central1 \
  --description "Virtual Try-On backend images" \
  --project YOUR_PROJECT_ID
```

### 8b. Create a `Dockerfile` in `backend/`

Create the file `backend/Dockerfile` with this content:

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ app/

ENV PORT=8080
EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

### 8c. Build and push the container image

Authenticate Docker to use Artifact Registry:
```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```

Build and push (run from the `backend/` directory):
```bash
cd backend

docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/vto-backend/api:latest .

docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/vto-backend/api:latest
```

> **Windows PowerShell tip:** Replace `\` line continuation with `` ` `` (backtick) or run it as one line.

### 8d. Deploy to Cloud Run

```bash
gcloud run deploy vto-backend \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/vto-backend/api:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --service-account vto-backend@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --set-env-vars VTO_USE_VERTEX=true,GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID,GOOGLE_CLOUD_LOCATION=us-central1,VTO_AUTH_MODE=adc \
  --memory 512Mi \
  --timeout 120 \
  --project YOUR_PROJECT_ID
```

**What each flag does:**

| Flag | Purpose |
|---|---|
| `--allow-unauthenticated` | Allows the frontend to call the API without login |
| `--service-account` | Gives the container the Vertex AI permission from §7 |
| `--set-env-vars` | Tells the backend to use Vertex AI with ADC auth |
| `--memory 512Mi` | Enough RAM for image processing |
| `--timeout 120` | Vertex AI can take up to ~60s; 120s gives margin |

After deploy, the CLI prints a **Service URL** like:
```
https://vto-backend-xxxxxxxx-uc.a.run.app
```

**Copy this URL** — you will need it in §10.

### 8e. Test the backend directly

```bash
curl https://vto-backend-xxxxxxxx-uc.a.run.app/health
```

Expected response:
```json
{"status": "ok"}
```

---

## 9. Deploy the frontend to Firebase Hosting

Firebase Hosting serves static files (HTML, CSS, JS) via a global CDN with a free HTTPS URL.

### 9a. Log in to Firebase

```bash
firebase login
```

A browser window will open. Sign in with the same Google account used in §3.

### 9b. Initialise Firebase in the frontend directory

```bash
cd frontend
firebase init hosting
```

Answer the prompts as follows:

| Prompt | Answer |
|---|---|
| Which Firebase project? | Select **Use an existing project** → pick `YOUR_PROJECT_ID` |
| Public directory | `dist` |
| Configure as single-page app? | **Yes** |
| Set up automatic builds with GitHub? | **No** (for now) |
| Overwrite `dist/index.html`? | **No** |

This creates `frontend/firebase.json` and `frontend/.firebaserc`.

### 9c. Set the backend URL and build the frontend

Create/update `frontend/.env`:
```env
VITE_API_BASE_URL=https://vto-backend-xxxxxxxx-uc.a.run.app
```

Replace the URL with the Service URL from §8d.

Build the frontend:
```bash
npm run build
```

### 9d. Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

After deploy, the CLI prints a **Hosting URL** like:
```
https://YOUR_PROJECT_ID.web.app
```

Open that URL in a browser — the storefront should appear.

---

## 10. Connect frontend to backend

The frontend reads `VITE_API_BASE_URL` at **build time**, so you must rebuild whenever you change it.

If you change or redeploy the backend and the URL changes, repeat:
1. Update `frontend/.env` with the new URL
2. `npm run build`
3. `firebase deploy --only hosting`

### CORS

The backend already allows all origins (`allow_origins=["*"]` in `backend/app/main.py`), so no additional CORS configuration is needed for PoC usage.

---

## 11. Verify everything works

1. Open the Firebase Hosting URL in a browser.
2. Click **Experimenta agora** on the product image.
3. The try-on widget modal should open.
4. Take or upload a photo, click **Use This Photo**.
5. The widget should show a loading spinner, then the generated try-on image.

**If you get a 502 error**, check Cloud Run logs:
```bash
gcloud run services logs read vto-backend --region us-central1 --limit 50
```

**If you get a 403 on Vertex AI**, check the service account binding:
```bash
gcloud projects get-iam-policy YOUR_PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:vto-backend@YOUR_PROJECT_ID.iam.gserviceaccount.com"
```

---

## 12. Estimated costs

At low usage typical for a PoC or demo:

| Service | Free tier | Rough cost beyond free |
|---|---|---|
| Cloud Run | 2M requests/month, 360K CPU-sec/month, 180K GB-sec/month | ~$0.40 per million requests |
| Artifact Registry | 0.5 GB | ~$0.10 per GB/month |
| Firebase Hosting | 10 GB storage, 360 MB/day transfer | ~$0.026 per GB transfer |
| Vertex AI Virtual Try-On | None | Charged per image — check [Vertex AI pricing](https://cloud.google.com/vertex-ai/pricing) |

> For a small demo with a few dozen try-on requests, total cost is typically **under $1/month** (excluding Vertex AI image generation charges).

---

## 13. Tear down / cleanup

To stop everything and avoid ongoing charges:

### Delete the Cloud Run service:
```bash
gcloud run services delete vto-backend --region us-central1
```

### Delete the Artifact Registry repository:
```bash
gcloud artifacts repositories delete vto-backend \
  --location us-central1 \
  --project YOUR_PROJECT_ID
```

### Delete the Firebase Hosting site:
Go to [console.firebase.google.com](https://console.firebase.google.com) → your project → **Hosting** → **Delete site**.

### Delete the entire project (removes all resources and billing):
```bash
gcloud projects delete YOUR_PROJECT_ID
```

> Deleting the project is irreversible. Only do this if you are done with the PoC entirely.

---

## Quick Reference — Commands Summary

```bash
# One-time setup
gcloud config set project YOUR_PROJECT_ID
gcloud config set run/region us-central1
gcloud services enable run.googleapis.com artifactregistry.googleapis.com aiplatform.googleapis.com cloudbuild.googleapis.com iam.googleapis.com

# Service account
gcloud iam service-accounts create vto-backend --display-name "Virtual Try-On Backend"
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member "serviceAccount:vto-backend@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role "roles/aiplatform.user"

# Build + deploy backend
cd backend
docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/vto-backend/api:latest .
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/vto-backend/api:latest
gcloud run deploy vto-backend \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/vto-backend/api:latest \
  --region us-central1 --allow-unauthenticated \
  --service-account vto-backend@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --set-env-vars VTO_USE_VERTEX=true,GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID,GOOGLE_CLOUD_LOCATION=us-central1,VTO_AUTH_MODE=adc \
  --memory 512Mi --timeout 120

# Build + deploy frontend
cd frontend
# edit .env: VITE_API_BASE_URL=https://YOUR_CLOUD_RUN_URL
npm run build
firebase deploy --only hosting
```

