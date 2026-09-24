import { toSpotifyEmbedUrl } from '../utils/spotify'

export function SpotifyPlayer({ playlistUrl }: { playlistUrl: string }) {
  const embedUrl = toSpotifyEmbedUrl(playlistUrl)
  if (embedUrl === null) return null

  return (
    <div className="spotify-player">
      <iframe
        title="Spotify player"
        src={embedUrl}
        width="100%"
        height="152"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </div>
  )
}
