'use client'

import { useEffect, useState } from 'react'

type TabType = 'admin' | 'egypt' | 'morocco' | 'archive' | 'analytics';

export function useClientActiveTab() {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const defaultTab = 'admin';

    try {
      if (typeof window === 'undefined') return defaultTab;
      
      const savedTab = localStorage.getItem('activeTab');
      return (savedTab as TabType) || defaultTab;
    } catch {
      return defaultTab;
    }
  });

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  return [activeTab, setActiveTab] as const;
}
