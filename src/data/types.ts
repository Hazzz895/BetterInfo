export type PlaylistTrack = {
    id: string
    addedAt: string
}

export type OwnerPlaylist = {
    id: string
    title: string
    imageUrl: string
    trackCount: number
}

export type AlbumInfo = {
    type: 'album'
    id: string
    genre: string
    releaseDate: string
    isRecent: boolean
    trackCount: number
    durationMs: number
    artistIds: string[]
}

export type PlaylistInfo = {
    type: 'playlist'
    id: string
    createdAt: string
    isPrivate: boolean
    trackCount: number
    durationMs: number
    tracks: PlaylistTrack[]
    ownerName: string
    ownerPlaylists: OwnerPlaylist[]
}

export type ArtistInfo = {
    type: 'artist'
    id: string
    description: string
    listenersDelta: number
    likesCount: number
    albumCount: number
    trackCount: number
    birthDate: string
    endDate: string
    alternativeNames: string[]
    genres: string[]
    countries: string[]
}

export type PageInfo = AlbumInfo | PlaylistInfo | ArtistInfo
