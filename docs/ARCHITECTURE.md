# Horizon Galactique LTS - Architecture

## Overview

Horizon Galactique LTS is a comprehensive 3136-strate matrix implementation built on modern web technologies.

## Technology Stack

### Frontend
- React 19.0.1 - UI Library
- TypeScript 5.8.2 - Type System
- Vite 6.2.3 - Build Tool
- Tailwind CSS 4.1.14 - Styling
- Motion 12.23.24 - Animations
- D3 7.9.0 - Data Visualization
- Lucide React 0.546.0 - Icons

### Backend
- Express 4.21.2 - Server Framework
- Firebase 12.18.0 - Database and Authentication

### AI Integration
- Google GenAI 2.4.0 - AI Services

## Project Structure

Horizon-Galactique-LTS-/
- .github/
  - ISSUE_TEMPLATE/
  - PULL_REQUEST_TEMPLATE.md
  - workflows/
  - CODEOWNERS
- docs/
  - ARCHITECTURE.md
  - STRATES.md
  - API.md
- scripts/
  - generateStrates.ts
  - syncGitHubStatus.ts
  - updateStratesFromGitHub.ts
  - validateStrates.ts
- src/
  - components/
    - PrimUI/
    - DesignSystem/
    - Typography/
    - Motion/
    - Grid/
    - Effects/
    - Adapters/
    - Resilience/
  - hooks/
  - lib/
  - types/
  - utils/
  - test/
- strates/
  - strates_3136_v41_updated.json
- package.json
- tsconfig.json
- vite.config.ts

## Strate Matrix Structure

The project is organized into 3136 strates with the following hierarchy:
- Sectors (S): 16 sectors (S01-S16)
- Rangs (R): 4 rangs per sector (R00-R03)
- Familles (F): 7 familles per rang (F00-F06)
- Roles (P): 7 roles per famille (Base, Entree, Mesure, Agregat, Signal, Norme, Conteneur)

## Maturity Levels
- L1: Foundations (P0 strates)
- L2: Core Components (P0 + P1 strates)
- L3: Extensions and Resilience (P0 + P1 + P2 strates)
- Production: Complete (All strates)

## GitHub Integration
- GitHub Actions for CI/CD
- Issue Templates for tracking strate implementation
- CODEOWNERS for code ownership
- Branch protection for main and dev branches
