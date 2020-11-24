

export class Logger {
    private static STYLES: { [key: string]: string } = {
        err: "color: black; background-color: red",
        warn: "color: black; background-color: yellow",
        perf: "color: #FF0000",
        activity: "color: #00FF00",
        editor: "color: #FF8800",
        websocket: "color: #00EEEE",
        "dev-mode": "color: #FF00FF",
    }


    static log(tags: string[], text: string, attachments: any = undefined) {
        const tagsc = this.composeTags(tags);
        console.log(tagsc.text + ` %c${text}`, ...tagsc.styles, '')
        if (attachments) console.log(attachments)
    }
    private static composeTags(tags: string[]): { styles: string[], text: string } {
        return {
            styles: tags.map(t => {
                if (Logger.STYLES.hasOwnProperty(t.toLowerCase())) {
                    return Logger.STYLES[t.toLowerCase()]
                } else return ""
            }),
            text: tags.map(t => {
                return `%c[${t}]`
            }).join(" ")
        }
    }
}
