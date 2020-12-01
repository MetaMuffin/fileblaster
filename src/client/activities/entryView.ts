import { State } from "..";
import { ColEntry, SchemeCollection } from "../../scheme";
import { popActivity, pushActivity, selectButtonActivity, pushErrorSnackbar } from "../activity";
import { getEntryPreview, AdvancedElement } from "../helper";
import { Keybindings } from "../keybindings";
import { entryForm } from "./entryForm";


export interface EntryListViewFeatures {
    allowEdit?: boolean,
    allowDelete?: boolean,
    displayMeta?: boolean,
    useTableRow?: boolean,
}

export function buildInteractiveEntryListView(colname: string): AdvancedElement {
    var query = {}
    var el = document.createElement("div")
    el.classList.add("interactive-list-view")

    var update: () => any;
    var controls = document.createElement("div")
    controls.classList.add("controls")

    var ocb: (() => any)[] = []
    var unbind: () => any;

    var ul = document.createElement("ul")
    var offset = 0
    const moreElements = async (n: number) => {
        var entries = await State.ws.getManyEntries(colname, query, n, offset)
        offset += entries.length
        for (const entry of entries) {
            ul.appendChild(buildEntryListViewItem(colname, entry, {
                allowEdit: true,
                allowDelete: true,
            }, update))
            ocb.push(() => {
                pushActivity(entryForm(colname, entry), update)
            })
        }
    }
    moreElements(10)

    unbind = Keybindings.bindSelection((s) => {
        if (!ocb[s]) return
        ocb[s]()
    })

    update = () => {
        ocb = []
        ul.innerHTML = ""
        offset = 0
        moreElements(10)
    }

    State.ws.on("event-entry-reload", update)

    el.append(controls, ul)
    return {
        element: el,
        cleanup: () => {
            unbind()
            State.ws.on("event-entry-reload", update)
        }
    }
}

export function buildEntryListViewItem(colname: string, entry: ColEntry, features: EntryListViewFeatures, onupdate: () => any): HTMLElement {
    var el = document.createElement(features.useTableRow ? "tr" : "ul")
    el.classList.add("entry-list-view")
    var btns = document.createElement("div")
    btns.classList.add("entry-list-view-btns")

    var data = buildEntryDisplayNoFeature(colname, entry)

    if (features.allowEdit) {
        var btnEdit = document.createElement("input")
        btnEdit.classList.add("btn")
        btnEdit.type = "button"
        btnEdit.value = "Edit"
        btnEdit.onclick = () => {
            pushActivity(entryForm(colname, entry), onupdate)
        }
        btns.appendChild(btnEdit)
    }
    if (features.allowDelete) {
        var btnDelete = document.createElement("input")
        btnDelete.classList.add("btn", "btn-danger")
        btnDelete.type = "button"
        btnDelete.value = "Delete"
        btnDelete.onclick = () => {
            pushActivity(selectButtonActivity("Do you really want to delete this entry?", [
                {
                    value: "Yes",
                    classes: ["btn-danger"],
                    onclick: () => {
                        if(State.ws.entryLock(entry?.f_id, true)) {
                            State.ws.entryLock(entry?.f_id, false);
                            State.ws.deleteEntry(colname, entry);
                        } else {
                            pushErrorSnackbar("This entry is locked. Someone is still editing it.",true)
                        }
                        popActivity()
                    }
                },
                {
                    value: "No",
                    onclick: () => {
                        popActivity();
                    }
                }
            ]))
        }
        btns.appendChild(btnDelete)
    }

    el.append(data, btns)
    return el
}

export function buildEntryDisplayNoFeature(colname: string, entry: ColEntry): HTMLElement {
    var el = document.createElement("div")
    // TODO
    var p = document.createElement("p")
    p.textContent = getEntryPreview(entry, State.scheme[colname])
    el.appendChild(p)

    return el
}