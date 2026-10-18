import type { AddonApi, PageEntity } from '@pulsesync/addon-sdk'

import { AiArtists } from './data/ai'
import { readPageInfo } from './data/pageData'
import type { PageInfo } from './data/types'
import { settings } from './settings'
import { publishPageView } from './state'
import { DomAdapter } from './ui/DomAdapter'
import { showOwnerPlaylists } from './ui/OwnerPlaylists'

export class BetterInfo {
    private readonly dom: DomAdapter
    private readonly aiLookup: AiArtists
    private readonly subscriptions: (() => void)[] = []
    private readonly requestedArtistDetails = new Set<string>()
    private pageController = new AbortController()
    private lookupController = new AbortController()
    private currentSnapshot: PageEntity | null = null
    private currentPage: PageInfo | null = null
    private active = false
    private routeGeneration = 0
    private snapshotVersion = 0

    constructor(private readonly api: AddonApi) {
        this.dom = new DomAdapter(api)
        this.aiLookup = new AiArtists(api.net)
    }

    start(): void {
        this.api.signal.throwIfAborted()
        this.active = true
        this.dom.start()
        this.subscriptions.push(this.api.page.onChange(snapshot => this.applySnapshot(snapshot)))
        this.subscriptions.push(
            this.api.router.onChange(() => {
                this.routeGeneration += 1
                this.clearPage()
                void this.readCurrentPage()
            }),
        )
        this.subscriptions.push(
            this.api.settings.onChange(() => {
                if (this.currentSnapshot) {
                    this.applySnapshot(this.currentSnapshot)
                }
            }),
        )

        const stop = () => this.stop()
        this.api.signal.addEventListener('abort', stop, { once: true })
        this.subscriptions.push(() => this.api.signal.removeEventListener('abort', stop))
        void this.readCurrentPage()
    }

    private async readCurrentPage(includeArtistBrief = false): Promise<void> {
        const routeGeneration = this.routeGeneration
        const snapshotVersion = this.snapshotVersion
        try {
            const snapshot = await this.api.page.getSnapshot({ includeArtistBrief })
            const routeChanged = routeGeneration !== this.routeGeneration
            const newerSnapshotReceived = snapshotVersion !== this.snapshotVersion
            if (!this.active || this.api.signal.aborted || routeChanged || newerSnapshotReceived) {
                return
            }
            this.applySnapshot(snapshot)
        } catch (error) {
            if (this.active && routeGeneration === this.routeGeneration) {
                this.api.logger.warn('Не удалось получить данные страницы', error)
            }
        }
    }

    private applySnapshot(snapshot: PageEntity | null): void {
        if (!this.active || this.api.signal.aborted) {
            return
        }

        const page = readPageInfo(snapshot)
        this.snapshotVersion += 1
        if (!page) {
            this.clearPage()
            return
        }

        const pageChanged = this.currentPage?.id !== page.id || this.currentPage?.type !== page.type
        this.lookupController.abort()
        this.lookupController = new AbortController()
        if (pageChanged) {
            this.pageController.abort()
            this.pageController = new AbortController()
            this.dom.clear()
        }
        this.currentSnapshot = snapshot
        this.currentPage = page

        const signal = this.pageController.signal
        publishPageView({ page, isAiArtist: false, signal })
        this.dom.update(page, settings.store, () => {
            if (page.type === 'playlist') {
                void showOwnerPlaylists(page, signal)
            }
        })
        this.requestArtistDetails(page)
        void this.checkAiArtist(page, this.lookupController.signal)
    }

    private requestArtistDetails(page: PageInfo): void {
        if (page.type !== 'artist' || !settings.store.artist_brief || this.requestedArtistDetails.has(page.id)) {
            return
        }
        this.requestedArtistDetails.add(page.id)
        void this.readCurrentPage(true)
    }

    private async checkAiArtist(page: PageInfo, signal: AbortSignal): Promise<void> {
        if (!settings.store.artist_ai || page.type === 'playlist') {
            return
        }
        const artistIds = page.type === 'artist' ? [page.id] : page.artistIds
        try {
            const isAiArtist = await this.aiLookup.hasArtist(artistIds, signal)
            if (this.active && !signal.aborted) {
                publishPageView({ page, isAiArtist, signal: this.pageController.signal })
            }
        } catch (error) {
            if (this.active && !signal.aborted) {
                this.api.logger.warn('Не удалось проверить ИИ-исполнителя', error)
            }
        }
    }

    private clearPage(): void {
        this.pageController.abort()
        this.lookupController.abort()
        this.currentSnapshot = null
        this.currentPage = null
        publishPageView(null)
        this.dom.clear()
    }

    stop(): void {
        if (!this.active) {
            return
        }
        this.active = false
        for (const unsubscribe of this.subscriptions.splice(0).reverse()) {
            unsubscribe()
        }
        this.clearPage()
        this.dom.stop()
        this.aiLookup.clear()
        this.requestedArtistDetails.clear()
    }
}
