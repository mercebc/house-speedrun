import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskPhoto } from './TaskPhoto'
import { PhotoStorageProvider } from '../storage/PhotoStorageProvider'
import type { PhotoStorageService } from '../storage/photoStorage'

vi.mock('../utils/image', () => ({
  resizeImage: vi.fn(async (file: Blob) => file),
}))

function createFakePhotoStorage(initial?: Blob): PhotoStorageService {
  let photo: Blob | null = initial ?? null
  return {
    async getPhoto() {
      return photo
    },
    async savePhoto(_taskId, next) {
      photo = next
    },
    async deletePhoto() {
      photo = null
    },
  }
}

const ORIGINAL_CREATE_OBJECT_URL = URL.createObjectURL
const ORIGINAL_REVOKE_OBJECT_URL = URL.revokeObjectURL

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => 'blob:fake-url')
  URL.revokeObjectURL = vi.fn()
})

afterEach(() => {
  URL.createObjectURL = ORIGINAL_CREATE_OBJECT_URL
  URL.revokeObjectURL = ORIGINAL_REVOKE_OBJECT_URL
  vi.clearAllMocks()
})

function renderTaskPhoto(storage: PhotoStorageService) {
  render(
    <PhotoStorageProvider storage={storage}>
      <TaskPhoto taskId="clean-oven" taskName="Clean oven" />
    </PhotoStorageProvider>,
  )
}

describe('TaskPhoto', () => {
  it('shows an upload prompt when there is no photo yet', async () => {
    renderTaskPhoto(createFakePhotoStorage())

    expect(await screen.findByRole('button', { name: /add a photo/i })).toBeInTheDocument()
  })

  it('shows the existing photo when one is saved', async () => {
    renderTaskPhoto(createFakePhotoStorage(new Blob(['bytes'], { type: 'image/jpeg' })))

    const image = await screen.findByRole('img', { name: 'Clean oven' })
    expect(image).toHaveAttribute('src', 'blob:fake-url')
  })

  it('uploads and displays a new photo when a file is selected', async () => {
    const storage = createFakePhotoStorage()
    const user = userEvent.setup()
    renderTaskPhoto(storage)
    await screen.findByRole('button', { name: /add a photo/i })

    const file = new File(['bytes'], 'oven.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/add a photo/i, { selector: 'input' })
    await user.upload(input, file)

    await waitFor(async () => {
      expect(await storage.getPhoto('clean-oven')).not.toBeNull()
    })
    expect(await screen.findByRole('img', { name: 'Clean oven' })).toBeInTheDocument()
  })
})
