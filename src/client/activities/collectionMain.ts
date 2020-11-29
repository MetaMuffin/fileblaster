import { popPatialActivity, Activity, pushActivity } from "../activity";
import { entryForm } from "./entryForm";
import { buildInteractiveEntryListView } from "./entryView";



export function collectionMainActivity(colname: string): Activity {
    var div = document.createElement("div")
    
    var toolbar = document.createElement("div")
    var btnNew = document.createElement("input")
    btnNew.type = "button"
    btnNew.value = "New Entry"
    btnNew.onclick = () => {
        pushActivity(entryForm(colname,undefined))
    }
    toolbar.appendChild(btnNew)

    var list = buildInteractiveEntryListView(colname);

    div.append(toolbar,list)

    return {
        title: colname,
        element: div,
        name: "collection-main",
        oncancel: () => true,
        type: "fullscreen"
    }
}
