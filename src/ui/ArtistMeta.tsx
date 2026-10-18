import { formatCount, formatDate, isBirthday } from '../data/format'
import { formatGenre } from '../data/genres'
import type { ArtistInfo } from '../data/types'
import type { Settings } from '../settings'

export function ListenerChange({ delta }: { delta: number }) {
    const sign = delta > 0 ? '+' : ''
    const tone = delta > 0 ? 'positive' : 'negative'
    return (
        <span className="bi-listener-change" data-tone={tone} data-betterinfo-owned="listener-change">
            {sign}
            {delta.toLocaleString('ru-RU')} за последние 28 дней
        </span>
    )
}

export function ArtistMeta({ artist, settings }: { artist: ArtistInfo; settings: Settings }) {
    const description = settings.artist_description ? artist.description : ''
    const birthDate = settings.artist_date ? formatDate(artist.birthDate) : ''
    const endDate = settings.artist_end && artist.id !== '36791' ? formatDate(artist.endDate) : ''
    const names = settings.artist_aka ? artist.alternativeNames.join(', ') : ''
    const genres = settings.artist_genres ? artist.genres.map(formatGenre).join(', ') : ''
    const countries = settings.artist_country ? artist.countries.join(', ') : ''
    const showAlbumCount = settings.artist_albums && artist.albumCount > 0
    const showTrackCount = settings.artist_tracks && artist.trackCount > 0
    const hasBiographicalInfo = Boolean(birthDate || endDate || names || genres || countries)

    const showFacts = showAlbumCount || showTrackCount || hasBiographicalInfo
    if (!description && !showFacts) {
        return null
    }

    return (
        <div className="bi-artist-meta" data-betterinfo-owned="artist-meta">
            {description && <p className="bi-artist-description">{description}</p>}
            {showFacts && (
                <div className="bi-artist-facts">
                    {showAlbumCount && <span>{formatCount(artist.albumCount, 'album')}</span>}
                    {showTrackCount && <span>{formatCount(artist.trackCount, 'track')}</span>}
                    {birthDate && (
                        <span>
                            Дата рождения: {birthDate}
                            {isBirthday(artist.birthDate) ? ' 🎂' : ''}
                        </span>
                    )}
                    {endDate && <span>Дата кончины: {endDate}</span>}
                    {names && (
                        <span>
                            <span className="bi-artist-aka">AKA</span>
                            {names}
                        </span>
                    )}
                    {genres && <span>{genres}</span>}
                    {countries && <span>{countries}</span>}
                </div>
            )}
        </div>
    )
}
