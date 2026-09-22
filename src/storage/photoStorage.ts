const DB_NAME = 'house-speedrun-photos'
const STORE_NAME = 'photos'
const DB_VERSION = 1

export interface PhotoStorageService {
  getPhoto(taskId: string): Promise<Blob | null>
  savePhoto(taskId: string, photo: Blob): Promise<void>
  deletePhoto(taskId: string): Promise<void>
}

function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open(DB_NAME, DB_VERSION)

    openRequest.onupgradeneeded = () => {
      const db = openRequest.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    openRequest.onerror = () => reject(openRequest.error)

    openRequest.onsuccess = () => {
      const db = openRequest.result
      const transaction = db.transaction(STORE_NAME, mode)
      const request = run(transaction.objectStore(STORE_NAME))

      transaction.oncomplete = () => {
        db.close()
        resolve(request.result)
      }
      transaction.onerror = () => {
        db.close()
        reject(transaction.error)
      }
    }
  })
}

interface StoredPhoto {
  data: ArrayBuffer
  type: string
}

export function createIndexedDbPhotoStorage(): PhotoStorageService {
  return {
    async getPhoto(taskId: string): Promise<Blob | null> {
      const result = await withStore<StoredPhoto | undefined>('readonly', (store) => store.get(taskId))
      if (result === undefined) return null
      return new Blob([result.data], { type: result.type })
    },

    async savePhoto(taskId: string, photo: Blob): Promise<void> {
      const stored: StoredPhoto = { data: await photo.arrayBuffer(), type: photo.type }
      await withStore('readwrite', (store) => store.put(stored, taskId))
    },

    async deletePhoto(taskId: string): Promise<void> {
      await withStore('readwrite', (store) => store.delete(taskId))
    },
  }
}
