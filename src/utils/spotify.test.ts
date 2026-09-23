import { describe, expect, it } from 'vitest'
import { toSpotifyEmbedUrl } from './spotify'

describe('toSpotifyEmbedUrl', () => {
  it('converts a playlist share link to an embed link', () => {
    expect(toSpotifyEmbedUrl('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M')).toBe(
      'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M',
    )
  })

  it('converts a track share link to an embed link', () => {
    expect(toSpotifyEmbedUrl('https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT')).toBe(
      'https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT',
    )
  })

  it('converts an album share link to an embed link', () => {
    expect(toSpotifyEmbedUrl('https://open.spotify.com/album/1DFixLWuPkv3KT3TnV35m3')).toBe(
      'https://open.spotify.com/embed/album/1DFixLWuPkv3KT3TnV35m3',
    )
  })

  it('strips query params and locale path segments from the share link', () => {
    expect(
      toSpotifyEmbedUrl('https://open.spotify.com/intl-en/playlist/37i9dQZF1DXcBWIGoYBM5M?si=abc123'),
    ).toBe('https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M')
  })

  it('passes through a link that is already an embed link', () => {
    expect(toSpotifyEmbedUrl('https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M')).toBe(
      'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M',
    )
  })

  it('returns null for an empty string', () => {
    expect(toSpotifyEmbedUrl('')).toBeNull()
  })

  it('returns null for a non-Spotify URL', () => {
    expect(toSpotifyEmbedUrl('https://example.com/playlist/123')).toBeNull()
  })

  it('returns null for an unparseable string', () => {
    expect(toSpotifyEmbedUrl('not a url')).toBeNull()
  })
})
