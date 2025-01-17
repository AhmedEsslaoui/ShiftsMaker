import { loadFromFirestore, saveToFirestore } from './firebase';

const SYNC_INTERVAL = 30000; // 30 seconds
const COLLECTION_NAME = 'shifts';
const DOCUMENT_ID = 'shiftTables';

interface SyncStatus {
  isSyncing: boolean;
  lastSynced: string | null;
}

type SyncStatusCallback = (status: SyncStatus) => void;

class DataCache {
  private static instance: DataCache;
  private cache: any = {};
  private lastModified: number = 0;
  private syncTimeout: NodeJS.Timeout | null = null;
  private isDirty: boolean = false;
  private isSyncing: boolean = false;
  private syncStatusCallbacks: Set<SyncStatusCallback> = new Set();

  private constructor() {
    this.initializeCache();
    // Start periodic sync
    setInterval(async () => {
      if (!this.isSyncing) {
        await this.syncWithFirestore();
      }
    }, SYNC_INTERVAL);
  }

  public static getInstance(): DataCache {
    if (!DataCache.instance) {
      DataCache.instance = new DataCache();
    }
    return DataCache.instance;
  }

  private notifySyncStatus(status: SyncStatus) {
    this.syncStatusCallbacks.forEach(callback => callback(status));
  }

  public subscribeSyncStatus(callback: SyncStatusCallback): () => void {
    this.syncStatusCallbacks.add(callback);
    // Send initial status
    callback({
      isSyncing: false,
      lastSynced: this.lastModified ? new Date(this.lastModified).toLocaleTimeString() : null
    });
    // Return unsubscribe function
    return () => {
      this.syncStatusCallbacks.delete(callback);
    };
  }

  private async initializeCache() {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        this.notifySyncStatus({ isSyncing: true, lastSynced: null });
        const data = await loadFromFirestore(COLLECTION_NAME, DOCUMENT_ID);
        
        if (data && this.validateShiftTables(data)) {
          this.cache = data;
          this.lastModified = Date.now();
        } else {
          // Initialize with valid empty state if no data or invalid data
          this.cache = { tables: [] };
          this.lastModified = Date.now();
        }

        this.notifySyncStatus({
          isSyncing: false,
          lastSynced: this.lastModified ? new Date(this.lastModified).toLocaleTimeString() : null
        });
        return;
      } catch (error) {
        retryCount++;
        console.error(`Error initializing cache (attempt ${retryCount}/${maxRetries}):`, error);
        
        if (retryCount === maxRetries) {
          // Initialize with empty state after max retries
          this.cache = { tables: [] };
          this.lastModified = Date.now();
          this.notifySyncStatus({ isSyncing: false, lastSynced: null });
          console.error('Failed to initialize from Firestore, starting with empty cache');
        } else {
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, retryCount), 10000)));
        }
      }
    }
  }

  private validateShiftTables(data: any): boolean {
    // Enhanced validation
    if (!data || typeof data !== 'object') {
      console.error('Invalid data: must be an object');
      return false;
    }

    if (!Array.isArray(data?.tables)) {
      console.error('Invalid data structure: tables must be an array');
      return false;
    }

    // Validate each table
    return data.tables.every((table: any) => {
      const isValid = 
        table?.id && 
        typeof table.id === 'string' &&
        (table.country === 'Egypt' || table.country === 'Morocco') &&
        table.date &&
        Array.isArray(table.agents) &&
        // Additional validation for agents
        table.agents.every((agent: any) => typeof agent === 'string');

      if (!isValid) {
        console.error('Invalid table structure:', { id: table?.id, country: table?.country });
      }
      return isValid;
    });
  }

  public getData(): any {
    return this.cache;
  }

  public async setData(newData: any) {
    if (!newData) {
      console.error('Attempted to save invalid data');
      return;
    }

    if (!this.validateShiftTables(newData)) {
      console.error('Data validation failed');
      return;
    }
    
    const previousData = { ...this.cache };
    
    try {
      // Add lastModified timestamp to each table
      if (newData.tables) {
        newData.tables = newData.tables.map((table: any) => ({
          ...table,
          lastModified: Date.now()
        }));
      }
      
      this.cache = newData;
      this.lastModified = Date.now();
      this.isDirty = true;
      await this.syncWithFirestore();
    } catch (error) {
      this.cache = previousData;
      console.error('Error in setData:', error);
      throw error;
    }
  }

  public async updateData(path: string[], value: any) {
    if (!path || !Array.isArray(path) || path.length === 0) {
      console.error('Invalid path for updateData');
      return;
    }

    const newCache = JSON.parse(JSON.stringify(this.cache));
    let current = newCache;

    try {
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {};
        }
        current = current[path[i]];
      }

      // Add lastModified timestamp if updating a table
      if (path[0] === 'tables') {
        value.lastModified = Date.now();
      }

      current[path[path.length - 1]] = value;

      if (!this.validateShiftTables(newCache)) {
        throw new Error('Data validation failed after update');
      }

      this.cache = newCache;
      this.lastModified = Date.now();
      this.isDirty = true;
      
      // Debounce sync to prevent rapid consecutive updates
      if (this.syncTimeout) {
        clearTimeout(this.syncTimeout);
      }
      this.syncTimeout = setTimeout(() => {
        this.syncWithFirestore();
      }, 1000);
    } catch (error) {
      console.error('Error in updateData:', error);
      throw error;
    }
  }

  public async clearCache() {
    let backup;
    try {
      // Keep a backup before clearing
      backup = { ...this.cache };
      
      // Instead of empty object, initialize with proper structure
      this.cache = { tables: [] };
      this.lastModified = Date.now();
      this.isDirty = true;
      
      await this.syncWithFirestore();
    } catch (error) {
      console.error('Error in clearCache:', error);
      // Restore backup if sync fails
      if (backup) {
        this.cache = backup;
      }
      throw error;
    }
  }

  public async forceSync() {
    await this.syncWithFirestore();
  }

  private async syncWithFirestore() {
    if (!this.isDirty || this.isSyncing) return;

    let retryCount = 0;
    const maxRetries = 3;
    let lastError = null;
    
    this.isSyncing = true;
    
    try {
      while (retryCount < maxRetries) {
        try {
          this.notifySyncStatus({ isSyncing: true, lastSynced: null });
          
          if (!this.validateShiftTables(this.cache)) {
            throw new Error('Data validation failed before sync');
          }

          // Add lastModified timestamp to modified tables only
          if (this.cache.tables) {
            this.cache.tables = this.cache.tables.map(table => ({
              ...table,
              lastModified: table.lastModified || Date.now()
            }));
          }

          await saveToFirestore(this.cache, COLLECTION_NAME, DOCUMENT_ID);
          this.isDirty = false;
          this.notifySyncStatus({
            isSyncing: false,
            lastSynced: new Date(this.lastModified).toLocaleTimeString()
          });
          return;
        } catch (error) {
          lastError = error;
          retryCount++;
          console.error(`Error syncing with Firestore (attempt ${retryCount}/${maxRetries}):`, error);
          
          if (retryCount === maxRetries) {
            this.notifySyncStatus({
              isSyncing: false,
              lastSynced: this.lastModified ? new Date(this.lastModified).toLocaleTimeString() : null
            });
            throw lastError;
          }
          
          await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, retryCount), 10000)));
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }

  public async updateTableStatus(tableId: string, updates: Partial<ShiftTable>) {
    if (!this.cache.tables) return;

    const tableIndex = this.cache.tables.findIndex(t => t.id === tableId);
    if (tableIndex === -1) return;

    // Only update the specified fields
    this.cache.tables[tableIndex] = {
      ...this.cache.tables[tableIndex],
      ...updates,
      lastModified: Date.now()
    };

    this.lastModified = Date.now();
    this.isDirty = true;

    // Debounce sync to prevent rapid consecutive updates
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    this.syncTimeout = setTimeout(() => {
      this.syncWithFirestore();
    }, 1000);
  }

  public getLastModified(): number {
    return this.lastModified;
  }
}

export const dataCache = DataCache.getInstance();
