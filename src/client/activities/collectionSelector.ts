import { getAllCollectionNames } from "../helper"
import { WS } from "../websocket"
import { State } from ".."
import { popPatialActivity, popActivity, Activity } from "../activity"
import { Keybindings } from "../keybindings"

export function buildCollectionSelectorActivity(onselect: (selection: string) => boolean): Activity {
    var div = document.createElement("div")
    var ul = document.createElement("ul")
    ul.classList.add("collection-list")

    var ocb: (() => any)[] = []
    var unbind: () => any;

    for (const colname of getAllCollectionNames(State.scheme)) {
        var li = document.createElement("li")
        const click = () => {
            var shouldpop = onselect(colname)
            if (shouldpop) {
                popActivity()
                unbind()
            }
        }
        li.onclick = click
        ocb.push(click)
        var p = document.createElement("p")
        p.textContent = colname
        li.appendChild(p)
        ul.appendChild(li)
    }

    unbind = Keybindings.bindSelection((s) => {
        if (!ocb[s]) return
        ocb[s]()
    })

    div.appendChild(ul)
    return {
        element: div,
        name: "collection-selector",
        title: State.lang.select_colletion,
    }
}

