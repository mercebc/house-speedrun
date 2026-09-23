import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { usePhotoStorage } from '../storage/usePhotoStorage'
import { resizeImage } from '../utils/image'

// A small upload-or-display photo control keyed by an arbitrary item id —
// used for both task photos and supply-catalog product photos.
export function ItemPhoto({
  itemId,
  itemName,
  defaultIcon,
}: {
  itemId: string
  itemName: string
  defaultIcon?: ReactNode
}) {
  const storage = usePhotoStorage()
  const inputId = useId()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false

    storage.getPhoto(itemId).then((photo) => {
      if (cancelled || photo === null) return
      const url = URL.createObjectURL(photo)
      objectUrlRef.current = url
      setPhotoUrl(url)
    })

    return () => {
      cancelled = true
      if (objectUrlRef.current !== null) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
    }
  }, [storage, itemId])

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file === undefined) return

    const resized = await resizeImage(file)
    await storage.savePhoto(itemId, resized)

    if (objectUrlRef.current !== null) URL.revokeObjectURL(objectUrlRef.current)
    const url = URL.createObjectURL(resized)
    objectUrlRef.current = url
    setPhotoUrl(url)
  }

  const actionLabel = photoUrl !== null || defaultIcon !== undefined ? 'Change photo' : 'Add a photo'

  return (
    <div className="item-photo">
      {photoUrl === null ? (
        <label htmlFor={inputId} className="item-photo__placeholder" role="button">
          {defaultIcon !== undefined ? (
            <>
              <span className="item-photo__default-icon" aria-hidden="true">
                {defaultIcon}
              </span>
              <span className="item-photo__default-label">Change</span>
            </>
          ) : (
            <>
              <span aria-hidden="true">📷</span>
              <span>Add a photo</span>
            </>
          )}
        </label>
      ) : (
        <label htmlFor={inputId} className="item-photo__image-wrapper">
          <img src={photoUrl} alt={itemName} className="item-photo__image" />
        </label>
      )}
      <input
        id={inputId}
        type="file"
        accept="image/*"
        capture="environment"
        aria-label={actionLabel}
        className="item-photo__input"
        onChange={handleFileSelected}
      />
    </div>
  )
}
