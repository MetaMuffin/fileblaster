import { State } from "..";
import { ColEntry, SchemeCollection } from "../../scheme";
import { pushActivity } from "../activity";
import { getEntryPreview } from "../helper";
import { entryForm } from "./entryForm";


export interface EntryListViewFeatures {
    allowEdit?: boolean,
    displayMeta?: boolean,
    useTableRow?: boolean
}

export function buildInteractiveEntryListView(colname: string): HTMLElement {
    var query = {}
    var el = document.createElement("div")
    el.classList.add("interactive-list-view")

    var controls = document.createElement("div")
    controls.classList.add("controls")

    
    var ul = document.createElement("ul")
    var offset = 0
    const moreElements = async (n: number) => {
        var entries = await State.ws.getManyEntries(colname,query,n,offset)
        offset += entries.length
        for (const entry of entries) {
            ul.appendChild(buildEntryListViewItem(colname,entry, {
                allowEdit: true
            }))
        }
    }
    moreElements(10)

    el.append(controls,ul)
    return el
}

export function buildEntryListViewItem(colname: string, entry: ColEntry, features: EntryListViewFeatures): HTMLElement {
    var el = document.createElement(features.useTableRow ? "tr" : "ul")
    el.classList.add("entry-list-view")
    var btns = document.createElement("div")
    btns.classList.add("entry-list-view-btns")

    var data = buildEntryDisplayNoFeature(colname,entry)

    if (features.allowEdit) {
        var btnEdit = document.createElement("input")
        btnEdit.type = "button"
        btnEdit.value = "Edit"
        btnEdit.onclick = () => {
            pushActivity(entryForm(colname,entry))
        }
        btns.appendChild(btnEdit)
    }

    el.append(data,btns)
    return el
}

export function buildEntryDisplayNoFeature(colname: string, entry: ColEntry): HTMLElement {
    var el = document.createElement("div")
    // TODO
    var p = document.createElement("p")
    p.textContent = getEntryPreview(entry,State.scheme[colname])
    el.appendChild(p)

    return el
}