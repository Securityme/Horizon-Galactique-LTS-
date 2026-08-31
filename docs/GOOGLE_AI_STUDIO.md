# Google AI Studio Integration

## Overview

This integration allows Horizon Galactique LTS to automatically synchronize strates data with Google AI Studio for AI-powered analysis and insights.

## Setup

### 1. Google Cloud Project
- Create project: horizon-galactique-lts
- Enable Vertex AI API
- Create service account with AI permissions

### 2. Environment Variables
Add to .env file:
GOOGLE_AI_STUDIO_API_KEY=your_api_key
GOOGLE_AI_STUDIO_PROJECT_ID=horizon-galactique-lts
GOOGLE_AI_STUDIO_DATASET_ID=strates_matrix
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_CLOUD_LOCATION=us-central1

### 3. GitHub Secrets
Add to GitHub Actions secrets:
- GOOGLE_AI_STUDIO_API_KEY
- GOOGLE_AI_STUDIO_PROJECT_ID
- GOOGLE_AI_STUDIO_DATASET_ID
- GOOGLE_CLOUD_PROJECT_ID

## Usage

### Manual Sync
bun run sync:google-ai-studio

### Automatic Sync
- On push to dev branch
- After strates generation
- Daily at midnight

## Scripts
- scripts/syncGoogleAIStudio.ts: Main sync script
- .github/workflows/sync-google-ai-studio.yml: GitHub workflow

## Data Sent
- All 3136 strates with metadata
- Priority, status, implementation info
- GitHub integration status
- Maturity level tracking

## Resources
- Google AI Studio: https://aistudio.google.com/
- Vertex AI Docs: https://cloud.google.com/vertex-ai/docs
