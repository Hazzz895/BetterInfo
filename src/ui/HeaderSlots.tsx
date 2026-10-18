import { Badge } from '@pulsesync/addon-sdk'

import { settings } from '../settings'
import { usePageView } from '../state'
import { AlbumMeta } from './AlbumMeta'
import { ArtistMeta, ListenerChange } from './ArtistMeta'
import { PlaylistMeta } from './PlaylistMeta'

export function HeaderTitle() {
    const view = usePageView()
    const values = settings.use()
    if (!view) {
        return null
    }

    const showAiBadge = view.isAiArtist && values.artist_ai
    if (!showAiBadge) {
        return null
    }

    return (
        <span className="bi-badges" data-betterinfo-owned="title">
            {showAiBadge && (
                <span className="bi-ai">
                    <Badge icon="code" label="Сгенерировано ИИ" />
                    Сгенерировано ИИ
                </span>
            )}
        </span>
    )
}

export function PlaylistPrivacyIcon() {
    const view = usePageView()
    const values = settings.use()
    if (!view || view.page.type !== 'playlist' || !view.page.isPrivate || !values.playlist_private) {
        return null
    }

    return (
        <span
            className="bi-private-playlist-icon"
            data-test-id="UGC_PLAYLIST_ICON"
            data-betterinfo-owned="playlist-privacy"
        >
            <Badge icon="eye_crossed" size="xxs" label="Этот плейлист можете слушать только вы" />
        </span>
    )
}

export function HeaderMeta() {
    const view = usePageView()
    const values = settings.use()
    if (!view) {
        return null
    }

    switch (view.page.type) {
        case 'album':
            return null
        case 'playlist':
            return null
        case 'artist':
            return <ArtistMeta artist={view.page} settings={values} />
    }
}

export function AlbumHeaderMeta() {
    const view = usePageView()
    const values = settings.use()
    if (!view || view.page.type !== 'album') {
        return null
    }

    return <AlbumMeta album={view.page} settings={values} />
}

export function ArtistListenerChange() {
    const view = usePageView()
    const values = settings.use()
    if (!view || view.page.type !== 'artist' || !values.artist_delta || view.page.listenersDelta === 0) {
        return null
    }

    return <ListenerChange delta={view.page.listenersDelta} />
}

export function PlaylistHeaderMeta() {
    const view = usePageView()
    const values = settings.use()
    if (!view || view.page.type !== 'playlist') {
        return null
    }

    return <PlaylistMeta playlist={view.page} settings={values} />
}
