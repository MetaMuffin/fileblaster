import { removePatialActivity, Activity, pushActivity } from "../activity";
import { entryForm } from "./entryForm";



export function collectionMainActivity(colname: string): Activity {
    var div = document.createElement("div")
    
    var btnEdit = document.createElement("input")
    btnEdit.type = "button"
    btnEdit.onclick = () => {
        pushActivity(entryForm(colname,undefined))
    }
    div.appendChild(btnEdit)

    return {
        title: colname,
        element: div,
        name: "collection-main",
        oncancel: () => true,
        type: "fullscreen"
    }
}