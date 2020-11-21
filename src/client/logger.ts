

export class Logger {
    private static STYLES: { [key: string]: string } = {
        err: "color: black; background-color: red",
        perf: "color: #FF0000",
        screen: "color: #00FF00",        
        editor: "color: #FF8800",
    }


    static log(tags: string[], text: string) {
        const tagsc = this.composeTags(tags);
        console.log(tagsc.text + ` %c${text}`, ...tagsc.styles, '')
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
