'use client'

import { useEffect, useState } from 'react'

export function useClientActiveCountries() {
  const [activeCountries, setActiveCountries] = useState<{ Egypt: boolean, Morocco: boolean }>(() => {
    const defaultCountries = { Egypt: true, Morocco: false };

    try {
      if (typeof window === 'undefined') return defaultCountries;
      
      const savedCountries = localStorage.getItem('activeCountries');
      return savedCountries ? JSON.parse(savedCountries) : defaultCountries;
    } catch {
      return defaultCountries;
    }
  });

  useEffect(() => {
    localStorage.setItem('activeCountries', JSON.stringify(activeCountries));
  }, [activeCountries]);

  return [activeCountries, setActiveCountries] as const;
}
