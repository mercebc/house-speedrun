const MAX_DIMENSION = 1000
const JPEG_QUALITY = 0.82

export async function resizeImage(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (context === null) throw new Error('Canvas 2D context is not available')
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob === null ? reject(new Error('Failed to encode image')) : resolve(blob)),
      'image/jpeg',
      JPEG_QUALITY,
    )
  })
}
