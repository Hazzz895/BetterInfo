import { formatDate } from '../data/format'
import type { PlaylistInfo, PlaylistTrack } from '../data/types'
import type { Settings } from '../settings'
import type { DomChanges } from './DomChanges'

function readRowIndex(row: HTMLElement): number | null {
    const value = row.closest('[data-index]')?.getAttribute('data-index')
    if (!value || !/^\d+$/.test(value)) {
        return null
    }
    const index = Number(value)
    return Number.isSafeInteger(index) ? index : null
}

function findTrack(row: HTMLElement, index: number, playlist: PlaylistInfo): PlaylistTrack | undefined {
    const link = row.querySelector<HTMLAnchorElement>('a[href*="trackId="]')
    const trackId = link ? new URL(link.href, window.location.href).searchParams.get('trackId') : null
    const track = playlist.tracks[index]
    if (!trackId || track?.id === trackId) {
        return track
    }
    return playlist.tracks.find(entry => entry.id === trackId)
}

export function renderPlaylistRows(playlist: PlaylistInfo, settings: Settings, changes: DomChanges): void {
    if (!settings.playlist_index && !settings.playlist_date) {
        return
    }
    const rows = document.querySelectorAll<HTMLElement>('[data-test-id="TRACK_PLAYLIST"]')
    for (const row of rows) {
        const index = readRowIndex(row)
        if (index === null) {
            continue
        }
        if (settings.playlist_index) {
            const label = changes.getOrCreate(row, 'track-index', 'span', true)
            changes.setText(label, (index + 1).toLocaleString('ru-RU'))
        }
        if (!settings.playlist_date) {
            continue
        }
        const track = findTrack(row, index, playlist)
        const addedAt = formatDate(track?.addedAt ?? '', true)
        const controls = row.querySelector<HTMLElement>('[class*="TrackPlaylist_controlsBarCell"]')
        if (addedAt && controls) {
            const label = changes.getOrCreate(controls, 'track-date', 'span', true)
            changes.setText(label, addedAt)
        }
    }
}
