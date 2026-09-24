import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { createIndexedDbPhotoStorage } from './photoStorage'

async function blobText(blob: Blob): Promise<string> {
  return await blob.text()
}

describe('IndexedDB photo storage', () => {
  beforeEach(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase('house-speedrun-photos')
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
      request.onblocked = () => resolve()
    })
  })

  it('returns null for a task with no photo', async () => {
    const storage = createIndexedDbPhotoStorage()

    const photo = await storage.getPhoto('kitchen-counters')

    expect(photo).toBeNull()
  })

  it('returns a saved photo on a later read', async () => {
    const storage = createIndexedDbPhotoStorage()
    const blob = new Blob(['fake-image-bytes'], { type: 'image/jpeg' })

    await storage.savePhoto('clean-oven', blob)
    const photo = await storage.getPhoto('clean-oven')

    expect(photo).not.toBeNull()
    expect(photo?.type).toBe('image/jpeg')
    expect(await blobText(photo!)).toBe('fake-image-bytes')
  })

  it('replaces an existing photo for the same task', async () => {
    const storage = createIndexedDbPhotoStorage()
    await storage.savePhoto('clean-oven', new Blob(['old'], { type: 'image/jpeg' }))

    await storage.savePhoto('clean-oven', new Blob(['new'], { type: 'image/jpeg' }))
    const photo = await storage.getPhoto('clean-oven')

    expect(await blobText(photo!)).toBe('new')
  })

  it('keeps photos for other tasks independent', async () => {
    const storage = createIndexedDbPhotoStorage()
    await storage.savePhoto('clean-oven', new Blob(['oven'], { type: 'image/jpeg' }))
    await storage.savePhoto('clean-fridge', new Blob(['fridge'], { type: 'image/jpeg' }))

    expect(await blobText((await storage.getPhoto('clean-oven'))!)).toBe('oven')
    expect(await blobText((await storage.getPhoto('clean-fridge'))!)).toBe('fridge')
  })

  it('deletes a photo', async () => {
    const storage = createIndexedDbPhotoStorage()
    await storage.savePhoto('clean-oven', new Blob(['oven'], { type: 'image/jpeg' }))

    await storage.deletePhoto('clean-oven')

    expect(await storage.getPhoto('clean-oven')).toBeNull()
  })
})
