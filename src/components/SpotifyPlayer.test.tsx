import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SpotifyPlayer } from './SpotifyPlayer'

describe('SpotifyPlayer', () => {
  it('embeds the configured playlist', () => {
    render(<SpotifyPlayer playlistUrl="https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M" />)

    const iframe = screen.getByTitle(/spotify player/i)
    expect(iframe).toHaveAttribute('src', 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M')
  })

  it('renders nothing when no playlist is configured', () => {
    const { container } = render(<SpotifyPlayer playlistUrl="" />)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when the configured link is not a valid Spotify link', () => {
    const { container } = render(<SpotifyPlayer playlistUrl="not a url" />)

    expect(container).toBeEmptyDOMElement()
  })
})
