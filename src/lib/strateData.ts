/**
 * Strate Data Library
 * Functions for loading and managing strate data
 */

import { StratesMatrix, Strate } from '../types/strate';

let strateDataCache: StratesMatrix | null = null;

/**
 * Load strates data
 */
export async function loadStrateData(): Promise<StratesMatrix> {
  if (strateDataCache) return strateDataCache;
  
  try {
    if (typeof window !== 'undefined') {
      const response = await fetch('/strates/strates_3136_v41_updated.json');
      const data = await response.json();
      strateDataCache = data as StratesMatrix;
      return strateDataCache;
    }
    
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'strates', 'strates_3136_v41_updated.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as StratesMatrix;
    strateDataCache = data;
    return strateDataCache;
  } catch (error) {
    console.error('Error loading strate data:', error);
    throw new Error('Failed to load strate data');
  }
}

/**
 * Get all strates
 */
export async function getAllStrates(): Promise<Strate[]> {
  const data = await loadStrateData();
  return data.strates;
}

/**
 * Get strate by ID
 */
export async function getStrateById(id: number): Promise<Strate | undefined> {
  const strates = await getAllStrates();
  return strates.find(s => s.id === id);
}

/**
 * Get statistics
 */
export async function getStrateStats(): Promise<{
  total: number;
  byPriority: Record<string, number>;
  byStatus: Record<string, number>;
  completionRate: number;
}> {
  const strates = await getAllStrates();
  const byPriority: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  
  strates.forEach(strate => {
    byPriority[strate.github_status.priority] = (byPriority[strate.github_status.priority] || 0) + 1;
    byStatus[strate.github_status.status] = (byStatus[strate.github_status.status] || 0) + 1;
  });
  
  const done = byStatus['DONE'] || 0;
  const completionRate = (done / strates.length) * 100;
  
  return { total: strates.length, byPriority, byStatus, completionRate };
}
