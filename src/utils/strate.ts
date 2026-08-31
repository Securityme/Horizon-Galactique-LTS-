/**
 * Strate Utilities
 * Utility functions for working with strates
 */

import { Strate } from '../types/strate';
import { PRIORITY_COLORS, STATUS_COLORS, ROLE_COLORS } from '../types/strate';

/**
 * Get strate by ID from array
 */
export function getStrateById(strates: Strate[], id: number): Strate | undefined {
  return strates.find(s => s.id === id);
}

/**
 * Get strate by code from array
 */
export function getStrateByCode(strates: Strate[], code: string): Strate | undefined {
  return strates.find(s => s.str === code);
}

/**
 * Filter strates by priority
 */
export function filterByPriority(strates: Strate[], priority: string): Strate[] {
  return strates.filter(s => s.github_status.priority === priority);
}

/**
 * Filter strates by status
 */
export function filterByStatus(strates: Strate[], status: string): Strate[] {
  return strates.filter(s => s.github_status.status === status);
}

/**
 * Group strates by priority
 */
export function groupStratesByPriority(strates: Strate[]): Record<string, Strate[]> {
  return strates.reduce((acc, strate) => {
    const priority = strate.github_status.priority;
    if (!acc[priority]) acc[priority] = [];
    acc[priority].push(strate);
    return acc;
  }, {} as Record<string, Strate[]>);
}

/**
 * Group strates by status
 */
export function groupStratesByStatus(strates: Strate[]): Record<string, Strate[]> {
  return strates.reduce((acc, strate) => {
    const status = strate.github_status.status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(strate);
    return acc;
  }, {} as Record<string, Strate[]>);
}

/**
 * Calculate completion percentage
 */
export function calculateCompletion(strates: Strate[]): number {
  const done = strates.filter(s => s.github_status.status === 'DONE').length;
  return (done / strates.length) * 100;
}

/**
 * Sort strates by ID
 */
export function sortStratesById(strates: Strate[], order: 'asc' | 'desc' = 'asc'): Strate[] {
  return [...strates].sort((a, b) => order === 'asc' ? a.id - b.id : b.id - a.id);
}
