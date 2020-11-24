import { getAllCollectionNames } from "../helper"
import { WS } from "../websocket"
import { State } from ".."
import { removePatialActivity, popActivity, Activity } from "../activity"




export function buildCollectionSelectorActivity(onselect: (selection: string) => boolean): Activity {
    var div = document.createElement("div")
    var ul = document.createElement("ul")
    ul.classList.add("collection-list")

    for (const colname of getAllCollectionNames(State.scheme)) {
        var li = document.createElement("li")
        li.onclick = () => {
            var shouldpop = onselect(colname)
            if (shouldpop) popActivity()
        }
        var p = document.createElement("p")
        p.textContent = colname
        li.appendChild(p)
        ul.appendChild(li)
    }
    

    div.appendChild(ul)
    return {
        element: div,
        name: "collection-selector",
        title: "Select a Collection",
    }
}

