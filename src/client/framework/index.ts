export type ElBuild = HTMLElement

export type ElBuilder = () => ElBuild


export class El {
    private builder: ElBuilder
    private element: HTMLElement


    constructor(builder: ElBuilder) {
        this.builder = builder
        this.element = builder()
    }

    rebuild() {
        this.element.parentElement
    }

    appendChild(el: El) {
        this.element.appendChild(el.element)
    }
}

