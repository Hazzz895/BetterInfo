import { useSyncExternalStore } from 'react'

import type { PageInfo } from './data/types'

export type PageView = {
    page: PageInfo
    isAiArtist: boolean
    signal: AbortSignal
}
let current: PageView | null = null
const listeners = new Set<() => void>()

export function publishPageView(view: PageView | null): void {
    current = view
    listeners.forEach(listener => listener())
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

export function usePageView(): PageView | null {
    return useSyncExternalStore(
        subscribe,
        () => current,
        () => null,
    )
}
