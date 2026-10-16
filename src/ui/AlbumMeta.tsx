import { Badge } from '@pulsesync/addon-sdk'

import { formatDate, formatTrackSummary, isRecentRelease } from '../data/format'
import { formatGenre } from '../data/genres'
import type { AlbumInfo } from '../data/types'
import type { Settings } from '../settings'

export function AlbumMeta({ album, settings }: { album: AlbumInfo; settings: Settings }) {
    const genre = settings.album_genre ? formatGenre(album.genre) : ''
    const releaseDate = settings.album_date ? formatDate(album.releaseDate) : ''
    const trackSummary = settings.album_trackCount ? formatTrackSummary(album.trackCount, album.durationMs) : ''

    if (!genre && !releaseDate && !trackSummary) {
        return null
    }

    const showLeadingSeparator = album.artistIds.length > 0 || !releaseDate
    const className = showLeadingSeparator ? 'bi-album-meta bi-album-meta_with-leading-separator' : 'bi-album-meta'

    return (
        <span className={className} data-betterinfo-owned="album-meta">
            {releaseDate && (
                <span className="bi-album-fact">
                    {releaseDate}
                    {isRecentRelease(album.releaseDate, album.isRecent) && (
                        <Badge icon="chartNew" label="Новый релиз" />
                    )}
                </span>
            )}
            {genre && <span className="bi-album-fact">{genre}</span>}
            {trackSummary && <span className="bi-album-fact">{trackSummary}</span>}
        </span>
    )
}
