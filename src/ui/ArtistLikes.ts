import type { ArtistInfo } from '../data/types'
import type { Settings } from '../settings'
import type { DomChanges } from './DomChanges'

export function renderArtistLikes(artist: ArtistInfo, settings: Settings, changes: DomChanges): void {
    if (!settings.artist_likes || !artist.likesCount) {
        return
    }
    const button = document.querySelector<HTMLElement>(
        '[class*="PageHeaderArtist_controls"] [data-test-id="LIKE_BUTTON"]',
    )
    if (!button) {
        return
    }
    const label = changes.getOrCreate(button, 'likes', 'span')
    const liked = button.getAttribute('aria-pressed') === 'true'
    if (label.dataset.count !== String(artist.likesCount)) {
        label.dataset.liked = String(liked)
        label.dataset.count = String(artist.likesCount)
    }
    const localChange = Number(liked) - Number(label.dataset.liked === 'true')
    const displayedCount = Math.max(0, artist.likesCount + localChange)
    changes.setText(label, displayedCount.toLocaleString('ru-RU'))
    changes.mark(button, 'data-betterinfo-likes')
}
