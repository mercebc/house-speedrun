import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SupplyThumbnail } from './SupplyThumbnail'
import { PhotoStorageProvider } from '../storage/PhotoStorageProvider'
import { createFakePhotoStorage } from '../test/fakePhotoStorage'

const ORIGINAL_CREATE_OBJECT_URL = URL.createObjectURL

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => 'blob:fake-url')
})

afterEach(() => {
  URL.createObjectURL = ORIGINAL_CREATE_OBJECT_URL
  vi.clearAllMocks()
})

describe('SupplyThumbnail', () => {
  it('shows a neutral placeholder when no photo has been uploaded yet', async () => {
    render(
      <PhotoStorageProvider storage={createFakePhotoStorage()}>
        <SupplyThumbnail supplyId="mop" supplyName="Mop" />
      </PhotoStorageProvider>,
    )

    expect(await screen.findByLabelText('Mop')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /add a photo/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('shows the uploaded photo when one exists', async () => {
    const storage = createFakePhotoStorage({ mop: new Blob(['bytes'], { type: 'image/jpeg' }) })
    render(
      <PhotoStorageProvider storage={storage}>
        <SupplyThumbnail supplyId="mop" supplyName="Mop" />
      </PhotoStorageProvider>,
    )

    const image = await screen.findByRole('img', { name: 'Mop' })
    expect(image).toHaveAttribute('src', 'blob:fake-url')
  })
})
