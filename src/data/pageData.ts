import type { PageEntity } from '@pulsesync/addon-sdk'

import type { AlbumInfo, ArtistInfo, OwnerPlaylist, PageInfo, PlaylistInfo, PlaylistTrack } from './types'

type SourceRecord = Record<string, unknown>

function readRecord(value: unknown): SourceRecord {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value as SourceRecord
    }
    return {}
}

function readArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : []
}

function readString(value: unknown): string {
    if (typeof value === 'string' || typeof value === 'number') {
        return String(value)
    }
    return ''
}

function readNumber(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function readAlbumDuration(album: SourceRecord): number {
    const duration = readNumber(album.durationMs)
    if (duration) {
        return duration
    }

    const tracks = readArray(album.volumes).flatMap(readArray).map(readRecord)
    const hasAllTracks = tracks.length >= readNumber(album.trackCount)
    const hasAllDurations = tracks.every(track => typeof track.durationMs === 'number')
    if (!hasAllTracks || !hasAllDurations) {
        return 0
    }
    return tracks.reduce((total, track) => total + readNumber(track.durationMs), 0)
}

function readAlbum(album: SourceRecord): AlbumInfo {
    return {
        type: 'album',
        id: readString(album.id),
        genre: readString(album.genre),
        releaseDate: readString(album.releaseDate),
        isRecent: album.recent === true,
        trackCount: readNumber(album.trackCount),
        durationMs: readAlbumDuration(album),
        artistIds: readArray(album.artists)
            .map(artist => readString(readRecord(artist).id))
            .filter(Boolean),
    }
}

function readPlaylistTrack(value: unknown): PlaylistTrack {
    const entry = readRecord(value)
    const track = readRecord(entry.track)
    return {
        id: readString(entry.id ?? track.id),
        addedAt: readString(entry.timestamp),
    }
}

function readOwnerPlaylists(value: unknown): OwnerPlaylist[] {
    const playlists: OwnerPlaylist[] = []
    for (const entry of readArray(value)) {
        const playlist = readRecord(entry)
        const id = readString(playlist.playlistUuid)
        if (id) {
            playlists.push({
                id,
                title: readString(playlist.title),
                imageUrl: readString(playlist.ogImage),
                trackCount: readNumber(playlist.trackCount),
            })
        }
    }
    return playlists
}

function readPlaylist(playlist: SourceRecord): PlaylistInfo {
    const owner = readRecord(playlist.owner)
    return {
        type: 'playlist',
        id: readString(playlist.playlistUuid ?? playlist.id),
        createdAt: readString(playlist.created),
        isPrivate: playlist.visibility === 'private',
        trackCount: readNumber(playlist.trackCount),
        durationMs: readNumber(playlist.durationMs),
        tracks: readArray(playlist.tracks).map(readPlaylistTrack),
        ownerName: readString(owner.name ?? owner.login),
        ownerPlaylists: readOwnerPlaylists(playlist.lastOwnerPlaylists),
    }
}

function readArtist(entity: SourceRecord): ArtistInfo {
    const artist = readRecord(entity.artist)
    const counts = readRecord(artist.counts)
    const stats = readRecord(entity.stats ?? artist.stats)
    const description =
        readString(readRecord(artist.description).text) ||
        readString(artist.description) ||
        readString(entity.description)

    return {
        type: 'artist',
        id: readString(artist.id),
        description,
        listenersDelta: readNumber(stats.lastMonthListenersDelta),
        likesCount: readNumber(entity.likesCount ?? artist.likesCount),
        albumCount: readNumber(counts.directAlbums),
        trackCount: readNumber(counts.tracks),
        birthDate: readString(artist.initDate),
        endDate: readString(artist.endDate),
        alternativeNames: readArray(artist.fullNames)
            .map(readString)
            .filter(name => name && name !== artist.name),
        genres: readArray(artist.genres).map(readString).filter(Boolean),
        countries: readArray(artist.countries).map(readString).filter(Boolean),
    }
}

export function readPageInfo(snapshot: PageEntity | null): PageInfo | null {
    if (!snapshot) {
        return null
    }

    const entity = readRecord(snapshot.entity)
    let info: PageInfo
    switch (snapshot.type) {
        case 'album':
            info = readAlbum(entity)
            break
        case 'playlist':
            info = readPlaylist(entity)
            break
        case 'artist':
            info = readArtist(entity)
            break
        default:
            return null
    }
    return info.id ? info : null
}
