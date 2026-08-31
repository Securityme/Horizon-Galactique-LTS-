# Horizon Galactique LTS - API Documentation

## Overview

This document describes the API endpoints and data structures used in Horizon Galactique LTS.

## Data Structures

### Strate

Each strate has the following structure:

- id: number - Unique numeric identifier (0-3135)
- str: string - Hierarchical code (STR-XX.XX.XX.XX)
- quadrant: string - Quadrant identifier
- master: string - Master identifier
- secteur: string - Sector (S01-S16)
- sous_quadrant: string - Sub-quadrant
- rang: string - Rank
- rang_nom: string - Rank name
- famille: string - Family group
- famille_abstraite: string - Abstract family
- role: string - Role (Base, Entree, Mesure, Agregat, Signal, Norme, Conteneur)
- designation: string - Designation
- mission_rang: string - Mission description
- theme_activation: string | null - Activation theme
- lot: string - Lot (L1, L2, L3)
- ere: number - Era (1, 2, 3)
- maturite: string - Maturity (SCELLE, CONCU)
- activation: string - Activation status (ACTIF, VERROUILLE)
- origine_v402: string | null - V40.2 origin
- chemin_src: string | null - Source path
- proprietaire: string | null - Owner
- tags: string[] - Tags
- github_status: GitHubStatus - GitHub integration status

### GitHubStatus

- implementation: string - Implementation status (PARTIAL, NOT_IMPLEMENTED, IMPLEMENTED, BLOCKED, NOT_DEFINED)
- file: string | null - File path
- commit: string | null - Commit SHA
- priority: string - Priority (P0, P1, P2, P3)
- estimated_hours: number - Estimated hours for implementation
- assigned_to: string | null - Assigned developer
- start_date: string | null - Start date
- due_date: string | null - Due date
- status: string - Status (TODO, IN_PROGRESS, DONE, BLOCKED, BACKLOG)
- blocked_by: string | null - Blocking reason
- dependencies: string[] - Dependent strates

## JSON Structure

The main data file is strates/strates_3136_v41_updated.json with:
- reference: string
- revision: string
- total: number
- adresse: string
- loi: object - Calculation rules
- cadence_hz: number
- github_integration: object - GitHub integration metadata
- strates: array - Array of 3136 strate objects

## Scripts

### generateStrates.ts
Generates the complete strates matrix with GitHub status.

Usage: bun run generate:strates

### syncGitHubStatus.ts
Synchronizes the GitHub status with the actual repository state.

Usage: bun run sync:github

### updateStratesFromGitHub.ts
Updates strates data from GitHub API.

Usage: bun run update:strates

### validateStrates.ts
Validates the strates data for consistency.

Usage: bun run validate:strates
