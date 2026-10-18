import { useEffect, useRef, type KeyboardEvent } from 'react'
import { Button, logger, openModal, type RenderModalProps } from '@pulsesync/addon-sdk'

import { formatCount } from '../data/format'
import type { PlaylistInfo } from '../data/types'

function getCoverUrl(value: string): string | undefined {
    if (!value) {
        return undefined
    }
    try {
        const url = new URL(value.includes('://') ? value : `https://${value}`)
        if (url.protocol !== 'https:' && url.protocol !== 'http:') {
            return undefined
        }
        return url.href.replace('%%', '200x200')
    } catch {
        return undefined
    }
}

function keepFocusInDialog(event: KeyboardEvent<HTMLDivElement>): void {
    const controls = event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
    const first = controls[0]
    const last = controls[controls.length - 1]
    if (!first) {
        event.preventDefault()
        return
    }
    const focused = document.activeElement
    const movingBeforeFirst = event.shiftKey && (focused === first || focused === event.currentTarget)
    const movingAfterLast = !event.shiftKey && focused === last
    if (movingBeforeFirst) {
        event.preventDefault()
        last.focus()
    } else if (movingAfterLast) {
        event.preventDefault()
        first.focus()
    }
}

type OwnerPlaylistsProps = RenderModalProps & { playlist: PlaylistInfo; signal: AbortSignal }

function OwnerPlaylists({ controller, playlist, signal }: OwnerPlaylistsProps) {
    const dialogRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const close = () => controller.close(false)
        if (signal.aborted) {
            close()
            return
        }
        signal.addEventListener('abort', close, { once: true })
        const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
        dialogRef.current?.focus()
        return () => {
            signal.removeEventListener('abort', close)
            previousFocus?.focus()
        }
    }, [controller, signal])

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
        if (event.key === 'Escape') {
            event.preventDefault()
            controller.close(false)
        } else if (event.key === 'Tab') {
            keepFocusInDialog(event)
        }
    }

    return (
        <div
            className="bi-modal-overlay"
            data-betterinfo-owned="modal"
            onClick={event => {
                if (event.target === event.currentTarget) {
                    controller.close(false)
                }
            }}
        >
            <div
                ref={dialogRef}
                className="bi-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="betterinfo-owner-title"
                tabIndex={-1}
                onKeyDown={handleKeyDown}
            >
                <h2 id="betterinfo-owner-title">Плейлисты {playlist.ownerName}</h2>
                <ul className="bi-playlists">
                    {playlist.ownerPlaylists.map(playlist => (
                        <li key={playlist.id}>
                            <a
                                href={`/playlists?playlistUuid=${encodeURIComponent(playlist.id)}`}
                                onClick={() => controller.close(true)}
                            >
                                <img src={getCoverUrl(playlist.imageUrl)} alt="" loading="lazy" />
                                <span>
                                    {playlist.title}
                                    <small>{formatCount(playlist.trackCount, 'track')}</small>
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>
                <Button
                    onClick={() => {
                        controller.close(false)
                    }}
                >
                    Закрыть
                </Button>
            </div>
        </div>
    )
}

export async function showOwnerPlaylists(playlist: PlaylistInfo, signal: AbortSignal): Promise<void> {
    if (signal.aborted) {
        return
    }
    try {
        await openModal(props => <OwnerPlaylists {...props} playlist={playlist} signal={signal} />)
    } catch (error) {
        const cancelled = signal.aborted || (error instanceof Error && error.name === 'AbortError')
        if (!cancelled) {
            logger.warn('Не удалось показать плейлисты автора', error)
        }
    }
}
