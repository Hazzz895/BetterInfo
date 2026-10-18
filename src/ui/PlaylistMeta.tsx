import { formatDate, formatTrackSummary } from '../data/format'
import type { PlaylistInfo } from '../data/types'
import type { Settings } from '../settings'

export function PlaylistMeta({ playlist, settings }: { playlist: PlaylistInfo; settings: Settings }) {
    const creationDate = settings.playlist_created ? formatDate(playlist.createdAt) : ''
    const trackSummary = settings.playlist_trackCount
        ? formatTrackSummary(playlist.trackCount, playlist.durationMs)
        : ''
    if (!creationDate && !trackSummary) {
        return null
    }

    return (
        <span className="bi-playlist-meta" data-betterinfo-owned="playlist-meta">
            {creationDate && <span>{` / создано ${creationDate}`}</span>}
            {trackSummary && <span className="bi-playlist-track-summary">{trackSummary}</span>}
        </span>
    )
}
