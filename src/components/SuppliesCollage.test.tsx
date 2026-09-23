import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SuppliesCollage } from './SuppliesCollage'
import { PhotoStorageProvider } from '../storage/PhotoStorageProvider'
import { createFakePhotoStorage } from '../test/fakePhotoStorage'
import type { Supply } from '../domain/supplies/supply.types'

function renderCollage(supplies: Supply[]) {
  render(
    <PhotoStorageProvider storage={createFakePhotoStorage()}>
      <SuppliesCollage supplies={supplies} />
    </PhotoStorageProvider>,
  )
}

describe('SuppliesCollage', () => {
  it('shows each supply with its name', () => {
    renderCollage([
      { id: 'mop', name: 'Mop' },
      { id: 'bucket', name: 'Bucket' },
    ])

    expect(screen.getByText('Mop')).toBeInTheDocument()
    expect(screen.getByText('Bucket')).toBeInTheDocument()
  })

  it('does not offer to upload a photo here (that only happens on the supplies catalog page)', async () => {
    renderCollage([{ id: 'mop', name: 'Mop' }])

    await screen.findByText('Mop')
    expect(screen.queryByRole('button', { name: /add a photo/i })).not.toBeInTheDocument()
  })

  it('shows a note when the task needs no supplies', () => {
    renderCollage([])

    expect(screen.getByText(/no supplies/i)).toBeInTheDocument()
  })
})
