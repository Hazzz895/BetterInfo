import './styles.css'

import { defineAddon } from '@pulsesync/addon-sdk'

import addonConfig from '../addon.config.mjs'
import { BetterInfo } from './runtime'
import { settings } from './settings'
import { AlbumHeaderMeta, ArtistListenerChange, HeaderMeta, HeaderTitle, PlaylistHeaderMeta } from './ui/HeaderSlots'

export default defineAddon({
    id: addonConfig.id,
    name: addonConfig.name,
    settings,
    slots: {
        entityHeaderTitleAccessory: HeaderTitle,
        entityHeaderMeta: HeaderMeta,
    },
    mounts: [
        {
            target: () =>
                document.querySelector('[data-test-id="ENTITY_HEADER"] [data-test-id="ARTIST_LISTENERS_COUNT"]')
                    ?.parentElement ?? null,
            component: ArtistListenerChange,
        },
        {
            target: () =>
                document.querySelector('[data-test-id="ENTITY_HEADER"] [data-test-id="ALBUM_RELEASE_DATE"]')
                    ?.parentElement ?? null,
            component: AlbumHeaderMeta,
        },
        {
            target: '[data-test-id="ENTITY_HEADER"] [data-test-id="PLAYLIST_HEADER_UPDATED_TEXT"]',
            component: PlaylistHeaderMeta,
        },
    ],
    start(api) {
        const addon = new BetterInfo(api)
        try {
            addon.start()
        } catch (error) {
            addon.stop()
            throw error
        }
        return () => addon.stop()
    },
})
