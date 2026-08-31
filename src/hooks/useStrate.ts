/**
 * useStrate Hook
 * Hook for accessing and managing strate data
 */

import { useState, useEffect, useMemo } from 'react';
import { Strate } from '../types/strate';

interface UseStrateOptions {
  id?: number;
  str?: string;
}

interface UseStrateReturn {
  strate: Strate | null;
  strates: Strate[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useStrate(options: UseStrateOptions = {}): UseStrateReturn {
  const [strates, setStrates] = useState<Strate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStrates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In production, this would fetch from an API
      // For now, we import from the JSON file
      const response = await fetch('/strates/strates_3136_v41_updated.json');
      const data = await response.json();
      setStrates(data.strates || []);
    } catch (err) {
      setError(err as Error);
      setStrates([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStrates();
  }, []);

  const strate = useMemo(() => {
    if (!options.id && !options.str) return null;
    
    if (options.id !== undefined) {
      return strates.find(s => s.id === options.id) || null;
    }
    
    if (options.str) {
      return strates.find(s => s.str === options.str) || null;
    }
    
    return null;
  }, [strates, options.id, options.str]);

  return {
    strate,
    strates,
    isLoading,
    error,
    refresh: fetchStrates,
  };
}

// Hook for filtering strates
export function useFilteredStrates(
  filter: {
    priority?: string[];
    status?: string[];
    famille?: string[];
    role?: string[];
    search?: string;
  } = {}
): Strate[] {
  const { strates } = useStrate();

  return useMemo(() => {
    return strates.filter(strate => {
      // Priority filter
      if (filter.priority && filter.priority.length > 0) {
        if (!filter.priority.includes(strate.github_status.priority)) {
          return false;
        }
      }

      // Status filter
      if (filter.status && filter.status.length > 0) {
        if (!filter.status.includes(strate.github_status.status)) {
          return false;
        }
      }

      // Famille filter
      if (filter.famille && filter.famille.length > 0) {
        if (!filter.famille.includes(strate.famille)) {
          return false;
        }
      }

      // Role filter
      if (filter.role && filter.role.length > 0) {
        if (!filter.role.includes(strate.role)) {
          return false;
        }
      }

      // Search filter
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const matches = [
          strate.str.toLowerCase(),
          strate.designation.toLowerCase(),
          strate.famille.toLowerCase(),
          strate.role.toLowerCase(),
          strate.id.toString(),
        ].some(text => text.includes(searchLower));
        
        if (!matches) return false;
      }

      return true;
    });
  }, [strates, filter]);
}

// Hook for strate statistics
export function useStrateStats(): {
  total: number;
  byPriority: Record<string, number>;
  byStatus: Record<string, number>;
  byFamille: Record<string, number>;
  byRole: Record<string, number>;
  completionRate: number;
} {
  const { strates } = useStrate();

  return useMemo(() => {
    const byPriority: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byFamille: Record<string, number> = {};
    const byRole: Record<string, number> = {};

    strates.forEach(strate => {
      byPriority[strate.github_status.priority] = (byPriority[strate.github_status.priority] || 0) + 1;
      byStatus[strate.github_status.status] = (byStatus[strate.github_status.status] || 0) + 1;
      byFamille[strate.famille] = (byFamille[strate.famille] || 0) + 1;
      byRole[strate.role] = (byRole[strate.role] || 0) + 1;
    });

    const doneCount = byStatus['DONE'] || 0;
    const completionRate = (doneCount / strates.length) * 100;

    return {
      total: strates.length,
      byPriority,
      byStatus,
      byFamille,
      byRole,
      completionRate,
    };
  }, [strates]);
}
