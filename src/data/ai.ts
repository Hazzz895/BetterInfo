import type { AddonNet } from '@pulsesync/addon-sdk'

export class AiArtists {
    private readonly cache = new Map<string, boolean>()

    constructor(private readonly net: AddonNet) {}

    async hasArtist(ids: readonly string[], signal: AbortSignal): Promise<boolean> {
        for (const id of new Set(ids)) {
            signal.throwIfAborted()
            const cached = this.cache.get(id)
            if (cached === true) {
                return true
            }
            if (cached === false) {
                continue
            }
            const response = await this.net.fetch(`https://iimuzyka.top/${encodeURIComponent(id)}`, {
                redirect: 'manual',
                signal,
                timeoutMs: 10_000,
            })
            signal.throwIfAborted()
            if (!response.ok && response.status !== 404 && (response.status < 300 || response.status >= 400)) {
                throw new Error(`ИИ-каталог: HTTP ${response.status}`)
            }
            const isAi = response.ok
            this.cache.set(id, isAi)
            if (this.cache.size > 256) {
                const oldestId = this.cache.keys().next().value
                if (oldestId !== undefined) {
                    this.cache.delete(oldestId)
                }
            }
            if (isAi) {
                return true
            }
        }
        return false
    }

    clear(): void {
        this.cache.clear()
    }
}
