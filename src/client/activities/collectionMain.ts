import { popPatialActivity, Activity, pushActivity } from "../activity";
import { Keybindings } from "../keybindings";
import { entryForm } from "./entryForm";
import { buildInteractiveEntryListView } from "./entryView";



export function collectionMainActivity(colname: string): Activity {
    var div = document.createElement("div")
    var list = buildInteractiveEntryListView(colname);
    var cleanup: (() => any)[] = []
    
    var toolbar = document.createElement("div")
    var btnNew = document.createElement("input")
    btnNew.classList.add("btn","btn-big")
    btnNew.type = "button"
    btnNew.value = "New Entry"
    btnNew.onclick = async () => {
        pushActivity(entryForm(colname,undefined),() => {
            console.log("POP!");
            if (list.cleanup) cleanup.push(list.cleanup)
        })
    }
    cleanup.push(Keybindings.bindElementClick(btnNew,"new"))
    toolbar.appendChild(btnNew)

    div.append(toolbar,list.element)

    return {
        title: colname,
        element: div,
        name: "collection-main",
        oncancel: () => true,
        type: "fullscreen",
        onpop: () => {
            cleanup.forEach(e => e())

        }
    }
}
