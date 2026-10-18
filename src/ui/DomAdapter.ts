import type { AddonApi } from '@pulsesync/addon-sdk'

import { formatDate } from '../data/format'
import type { PageInfo } from '../data/types'
import type { Settings } from '../settings'
import { renderArtistLikes } from './ArtistLikes'
import { DomChanges } from './DomChanges'
import { renderPlaylistRows } from './PlaylistRows'
import { createPlaylistOwnerAction, type PlaylistOwnerAction } from './PlaylistOwnerAction'

function isAddonMutation(record: MutationRecord): boolean {
    const selector = '[data-betterinfo-owned]'
    const target = record.target instanceof Element ? record.target : record.target.parentElement
    if (target?.closest(selector)) {
        return true
    }
    const nodes = [...record.addedNodes, ...record.removedNodes]
    return nodes.length > 0 && nodes.every(node => node instanceof Element && node.matches(selector))
}

export class DomAdapter {
    private readonly changes = new DomChanges()
    private readonly observer: MutationObserver
    private cancelRender?: () => void
    private ownerTarget?: HTMLElement
    private ownerAction?: PlaylistOwnerAction
    private ownerName = ''
    private page: PageInfo | null = null
    private settings?: Settings
    private onOwnerClick?: () => void

    constructor(private readonly api: AddonApi) {
        this.observer = new MutationObserver(records => {
            const shouldRender = records.some(record => {
                if (
                    record.type === 'characterData' &&
                    !record.target.parentElement?.closest('[data-test-id="PLAYLIST_HEADER_UPDATED_TEXT"]')
                ) {
                    return false
                }
                return !isAddonMutation(record)
            })
            if (shouldRender) {
                this.schedule()
            }
        })
    }

    start(): void {
        this.observer.observe(document.body, {
            childList: true,
            characterData: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-index', 'aria-pressed'],
        })
    }

    update(page: PageInfo, settings: Settings, onOwnerClick: () => void): void {
        this.page = page
        this.settings = settings
        this.onOwnerClick = onOwnerClick
        this.schedule()
    }

    private schedule(): void {
        if (this.cancelRender || this.api.signal.aborted) {
            return
        }
        this.cancelRender = this.api.setTimeout(() => {
            this.cancelRender = undefined
            try {
                this.render()
            } catch (error) {
                this.api.logger.warn('Не удалось обновить элементы BetterInfo', error)
            }
        }, 50)
    }

    private render(): void {
        const page = this.page
        const settings = this.settings
        if (!page || !settings) {
            return
        }
        this.changes.beginRender()
        try {
            switch (page.type) {
                case 'album':
                    if (settings.album_date && formatDate(page.releaseDate)) {
                        for (const label of document.querySelectorAll<HTMLElement>(
                            '[data-test-id="ALBUM_RELEASE_DATE"]',
                        )) {
                            this.changes.mark(label, 'data-betterinfo-original')
                        }
                    }
                    break
                case 'playlist':
                    if (page.isPrivate && settings.playlist_private) {
                        const titleContainer = document.querySelector(
                            '[data-test-id="ENTITY_HEADER"] [data-test-id="ENTITY_TITLE"]',
                        )?.parentElement
                        if (titleContainer) {
                            this.changes.mark(titleContainer, 'data-betterinfo-private-title')
                        }
                    }
                    renderPlaylistRows(page, settings, this.changes)
                    break
                case 'artist':
                    const artistMeta = document.querySelector(
                        '[data-test-id="ENTITY_HEADER"] [class*="PageHeaderArtist_meta"]',
                    )
                    const metadataContainer = artistMeta?.closest<HTMLElement>('[class*="PageHeaderBase_meta"]')
                    if (metadataContainer) {
                        this.changes.mark(metadataContainer, 'data-betterinfo-artist-layout')
                    }
                    renderArtistLikes(page, settings, this.changes)
                    break
            }
            this.updateOwnerAction(page, settings)
        } finally {
            this.changes.finishRender()
        }
    }

    private updateOwnerAction(page: PageInfo, settings: Settings): void {
        const showOwnerPlaylists =
            page.type === 'playlist' && settings.playlist_moreOwner && page.ownerPlaylists.length > 0
        const subtitle = showOwnerPlaylists
            ? document.querySelector<HTMLElement>(
                  '[data-test-id="ENTITY_HEADER"] [data-test-id="PLAYLIST_HEADER_UPDATED_TEXT"]',
              )
            : null
        const ownerName = page.type === 'playlist' ? page.ownerName : ''
        if (subtitle === this.ownerTarget && ownerName === this.ownerName && this.ownerAction?.isCurrent()) {
            return
        }
        this.ownerAction?.dispose()
        this.ownerAction = undefined
        this.ownerTarget = subtitle ?? undefined
        this.ownerName = ownerName
        if (subtitle) {
            this.ownerAction =
                createPlaylistOwnerAction(this.api, subtitle, ownerName, () => this.onOwnerClick?.()) ?? undefined
        }
    }

    clear(): void {
        this.cancelRender?.()
        this.cancelRender = undefined
        this.page = null
        this.onOwnerClick = undefined
        this.ownerAction?.dispose()
        this.ownerAction = undefined
        this.ownerTarget = undefined
        this.ownerName = ''
        this.changes.clear()
    }

    stop(): void {
        this.observer.disconnect()
        this.clear()
    }
}
