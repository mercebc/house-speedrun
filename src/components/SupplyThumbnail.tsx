import { useEffect, useRef, useState } from 'react'
import { usePhotoStorage } from '../storage/usePhotoStorage'

// Read-only display of a supply's photo. Uploading only happens on the
// Supplies catalog page (Settings) — everywhere else just shows the result.
export function SupplyThumbnail({ supplyId, supplyName }: { supplyId: string; supplyName: string }) {
  const storage = usePhotoStorage()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false

    storage.getPhoto(supplyId).then((photo) => {
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
  }, [storage, supplyId])

  if (photoUrl === null) {
    return (
      <span className="supply-thumbnail supply-thumbnail--placeholder" aria-label={supplyName}>
        🧴
      </span>
    )
  }

  return (
    <span className="supply-thumbnail">
      <img src={photoUrl} alt={supplyName} className="supply-thumbnail__image" />
    </span>
  )
}
