'use client'

import { useEffect, useState } from 'react'

export function useClientAnalyticsFilters() {
  const [filters, setFilters] = useState<{
    startDate: string | null,
    endDate: string | null,
    country: 'Egypt' | 'Morocco',
    view: string
  }>(() => {
    const defaultFilters = {
      startDate: null,
      endDate: null,
      country: 'Egypt',
      view: 'all-time'
    };

    try {
      if (typeof window === 'undefined') return defaultFilters;
      
      const savedFilters = localStorage.getItem('analyticsFilters');
      return savedFilters ? JSON.parse(savedFilters) : defaultFilters;
    } catch {
      return defaultFilters;
    }
  });

  useEffect(() => {
    localStorage.setItem('analyticsFilters', JSON.stringify(filters));
  }, [filters]);

  return [filters, setFilters] as const;
}
