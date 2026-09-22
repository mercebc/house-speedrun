import { useEffect, useId, useRef, useState } from 'react'
import { usePhotoStorage } from '../storage/usePhotoStorage'
import { resizeImage } from '../utils/image'

export function TaskPhoto({ taskId, taskName }: { taskId: string; taskName: string }) {
  const storage = usePhotoStorage()
  const inputId = useId()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false

    storage.getPhoto(taskId).then((photo) => {
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
  }, [storage, taskId])

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file === undefined) return

    const resized = await resizeImage(file)
    await storage.savePhoto(taskId, resized)

    if (objectUrlRef.current !== null) URL.revokeObjectURL(objectUrlRef.current)
    const url = URL.createObjectURL(resized)
    objectUrlRef.current = url
    setPhotoUrl(url)
  }

  return (
    <div className="task-photo">
      {photoUrl === null ? (
        <label htmlFor={inputId} className="task-photo__placeholder" role="button">
          <span aria-hidden="true">📷</span>
          <span>Add a photo</span>
        </label>
      ) : (
        <label htmlFor={inputId} className="task-photo__image-wrapper">
          <img src={photoUrl} alt={taskName} className="task-photo__image" />
        </label>
      )}
      <input
        id={inputId}
        type="file"
        accept="image/*"
        capture="environment"
        aria-label="Add a photo"
        className="task-photo__input"
        onChange={handleFileSelected}
      />
    </div>
  )
}
