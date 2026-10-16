import type { AddonApi } from '@pulsesync/addon-sdk'

export type PlaylistOwnerAction = {
    isCurrent: () => boolean
    dispose: () => void
}

function findOwnerText(subtitle: HTMLElement, ownerName: string): Text | null {
    const walker = document.createTreeWalker(subtitle, NodeFilter.SHOW_TEXT)
    let node = walker.nextNode()
    while (node) {
        const belongsToAddon = node.parentElement?.closest('[data-betterinfo-owned]')
        if (!belongsToAddon && node.textContent?.includes(ownerName)) {
            return node as Text
        }
        node = walker.nextNode()
    }
    return null
}

export function createPlaylistOwnerAction(
    api: AddonApi,
    subtitle: HTMLElement,
    ownerName: string,
    openPlaylists: () => void,
): PlaylistOwnerAction | null {
    if (!ownerName) {
        return null
    }

    let target = subtitle.querySelector<HTMLElement>('a[href*="/users/"], a[href*="/user/"]')
    let restoreText = () => {}
    let isCurrent = () => Boolean(target?.isConnected && subtitle.contains(target))

    if (!target) {
        const source = findOwnerText(subtitle, ownerName)
        if (!source) {
            return null
        }
        const originalText = source.data
        const nameStart = originalText.indexOf(ownerName)
        const wrapper = document.createElement('span')
        wrapper.setAttribute('data-betterinfo-owned', 'playlist-owner')
        const button = document.createElement('button')
        button.type = 'button'
        button.textContent = ownerName
        wrapper.append(originalText.slice(0, nameStart), button, originalText.slice(nameStart + ownerName.length))
        source.before(wrapper)
        source.data = ''
        target = button

        isCurrent = () => source.isConnected && source.data === '' && wrapper.parentNode === source.parentNode
        restoreText = () => {
            // Keep React's text node in place so native updates and unmounts still work.
            if (source.data === '') {
                source.data = originalText
            }
            wrapper.remove()
        }
    }

    const element = target
    const previousHasPopup = element.getAttribute('aria-haspopup')
    element.setAttribute('data-betterinfo-owner-trigger', '')
    element.setAttribute('aria-haspopup', 'dialog')
    const removeClickListener = api.listen(
        element,
        'click',
        event => {
            event.preventDefault()
            event.stopPropagation()
            openPlaylists()
        },
        { capture: true },
    )

    return {
        isCurrent,
        dispose() {
            removeClickListener()
            element.removeAttribute('data-betterinfo-owner-trigger')
            if (previousHasPopup === null) {
                element.removeAttribute('aria-haspopup')
            } else {
                element.setAttribute('aria-haspopup', previousHasPopup)
            }
            restoreText()
        },
    }
}
