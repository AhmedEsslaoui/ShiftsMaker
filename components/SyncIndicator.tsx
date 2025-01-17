"use client";

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface SyncState {
  isSyncing: boolean;
  lastSynced: string | null;
}

export function SyncIndicator() {
  const [syncState, setSyncState] = useState<SyncState>({
    isSyncing: false,
    lastSynced: null,
  });

  useEffect(() => {
    const eventSource = new EventSource('/api/syncStatus');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setSyncState(data);

      if (data.isSyncing) {
        toast.loading('Syncing with Drive...', {
          id: 'sync-toast',
          position: 'bottom-right',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
          icon: '🔄'
        });
      } else if (data.lastSynced) {
        toast.success('Synced with Drive', {
          id: 'sync-toast',
          duration: 2000,
          position: 'bottom-right',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
          icon: '✨'
        });
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 text-sm text-gray-500">
      {syncState.isSyncing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Syncing...</span>
        </>
      ) : syncState.lastSynced ? (
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Synced {syncState.lastSynced}
        </span>
      ) : null}
    </div>
  );
}
