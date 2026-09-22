import type { PhotoStorageService } from '../storage/photoStorage'

export function createFakePhotoStorage(seed: Record<string, Blob> = {}): PhotoStorageService {
  const photos = new Map(Object.entries(seed))

  return {
    async getPhoto(taskId: string) {
      return photos.get(taskId) ?? null
    },
    async savePhoto(taskId: string, photo: Blob) {
      photos.set(taskId, photo)
    },
    async deletePhoto(taskId: string) {
      photos.delete(taskId)
    },
  }
}
