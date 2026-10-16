const OWNER_ATTRIBUTE = 'data-betterinfo-owned'

export class DomChanges {
    private readonly elements = new Set<HTMLElement>()
    private attributes = new Map<HTMLElement, Set<string>>()
    private readonly neededElements = new Set<HTMLElement>()
    private readonly neededAttributes = new Map<HTMLElement, Set<string>>()

    beginRender(): void {
        this.neededElements.clear()
        this.neededAttributes.clear()
    }

    getOrCreate<K extends keyof HTMLElementTagNameMap>(
        parent: HTMLElement,
        key: string,
        tagName: K,
        prepend = false,
    ): HTMLElementTagNameMap[K] {
        const selector = `:scope > [${OWNER_ATTRIBUTE}="${key}"]`
        let element = parent.querySelector<HTMLElementTagNameMap[K]>(selector)
        if (!element) {
            element = document.createElement(tagName)
            element.setAttribute(OWNER_ATTRIBUTE, key)
            element.className = `bi-${key}`
            if (prepend) {
                parent.prepend(element)
            } else {
                parent.append(element)
            }
        }
        this.elements.add(element)
        this.neededElements.add(element)
        return element
    }

    setText(element: HTMLElement, text: string): void {
        if (element.textContent !== text) {
            element.textContent = text
        }
    }

    mark(element: HTMLElement, attribute: string): void {
        let attributes = this.neededAttributes.get(element)
        if (!attributes) {
            attributes = new Set()
            this.neededAttributes.set(element, attributes)
        }
        attributes.add(attribute)
        if (!element.hasAttribute(attribute)) {
            element.setAttribute(attribute, '')
        }
    }

    finishRender(): void {
        for (const element of this.elements) {
            if (!this.neededElements.has(element)) {
                element.remove()
                this.elements.delete(element)
            }
        }
        for (const [element, attributes] of this.attributes) {
            for (const attribute of attributes) {
                if (!this.neededAttributes.get(element)?.has(attribute)) {
                    element.removeAttribute(attribute)
                }
            }
        }
        this.attributes = new Map(this.neededAttributes)
    }

    clear(): void {
        this.beginRender()
        this.finishRender()
    }
}
