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
  private syncStatusCallbacks: Set<SyncStatusCallback> = new Set();

  private constructor() {
    this.initializeCache();
    // Start periodic sync
    setInterval(() => this.syncWithFirestore(), SYNC_INTERVAL);
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
    try {
      this.notifySyncStatus({ isSyncing: true, lastSynced: null });
      const data = await loadFromFirestore(COLLECTION_NAME, DOCUMENT_ID);
      if (data) {
        this.cache = data;
        this.lastModified = Date.now();
      }
      this.notifySyncStatus({
        isSyncing: false,
        lastSynced: this.lastModified ? new Date(this.lastModified).toLocaleTimeString() : null
      });
    } catch (error) {
      console.error('Error initializing cache:', error);
      this.notifySyncStatus({ isSyncing: false, lastSynced: null });
    }
  }

  public getData(): any {
    return this.cache;
  }

  public async setData(newData: any) {
    this.cache = newData;
    this.lastModified = Date.now();
    this.isDirty = true;
    await this.syncWithFirestore();
  }

  private async syncWithFirestore() {
    if (!this.isDirty) return;

    try {
      this.notifySyncStatus({ isSyncing: true, lastSynced: null });
      await saveToFirestore(this.cache, COLLECTION_NAME, DOCUMENT_ID);
      this.isDirty = false;
      this.notifySyncStatus({
        isSyncing: false,
        lastSynced: new Date(this.lastModified).toLocaleTimeString()
      });
      console.log('✅ Synced with Firestore');
    } catch (error) {
      console.error('Error syncing with Firestore:', error);
      this.notifySyncStatus({
        isSyncing: false,
        lastSynced: this.lastModified ? new Date(this.lastModified).toLocaleTimeString() : null
      });
    }
  }

  public getLastModified(): number {
    return this.lastModified;
  }

  public async updateData(path: string[], value: any) {
    let current = this.cache;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    this.lastModified = Date.now();
    this.isDirty = true;
    await this.syncWithFirestore();
  }

  public async clearCache() {
    this.cache = {};
    this.lastModified = Date.now();
    this.isDirty = true;
    await this.syncWithFirestore();
  }

  public async forceSync() {
    await this.syncWithFirestore();
  }
}

export const dataCache = DataCache.getInstance();
