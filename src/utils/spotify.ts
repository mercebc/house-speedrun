const EMBEDDABLE_TYPES = new Set(['playlist', 'track', 'album', 'artist', 'show', 'episode'])

// Turns a normal open.spotify.com share link (optionally with a locale
// segment like /intl-en/ and a `?si=` tracking param) into the matching
// /embed/ link the Spotify embed player expects.
export function toSpotifyEmbedUrl(shareUrl: string): string | null {
  if (shareUrl.trim() === '') return null

  let url: URL
  try {
    url = new URL(shareUrl)
  } catch {
    return null
  }

  if (url.hostname !== 'open.spotify.com') return null

  const segments = url.pathname.split('/').filter(Boolean)
  const typeIndex = segments.findIndex((segment) => EMBEDDABLE_TYPES.has(segment))
  const [type, id] = typeIndex === -1 ? [] : segments.slice(typeIndex)

  if (type === undefined || id === undefined) return null

  return `https://open.spotify.com/embed/${type}/${id}`
}
