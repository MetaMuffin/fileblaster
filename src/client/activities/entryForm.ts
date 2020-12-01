import { popPatialActivity, Activity, pushActivity, popActivity, pushErrorSnackbar } from "../activity";
import { SchemeValue, SchemeInputBuild, SchemeCollection, SchemeValueType, ColEntry } from "../../scheme";
import { Logger } from "../logger";
import { State } from "..";
import { getEntryPreview, kebabToTitle, newTempID, setDisabledRecursive, sleep } from "../helper";
import { EventEmitter } from "events";
import { genEntryId } from "../../schemeValidator";
import { Keybindings } from "../keybindings";

export type OnSaveCallback = () => Promise<boolean>

export function entryForm(colname: string, entry: ColEntry | undefined = undefined): Activity {
    var div = document.createElement("div");


    var aevents = new EventEmitter()

    var col = State.scheme[colname]
    var savedState = true
    var saveSnackbar: Activity | undefined;
    var collect: undefined | (() => ColEntry);

    var data = entry || { f_id: genEntryId() }

    const popSaveBar = () => {
        savedState = true
        if (saveSnackbar) {
            popPatialActivity(saveSnackbar)
            saveSnackbar = undefined
        }
    }

    const onsave = async (): Promise<boolean> => {
        aevents.emit("loading-state", true)
        if (!collect) {
            pushErrorSnackbar("Internal error while collecting form data. Sorry :(", true)
            return false;
        }
        var entry = collect()
        entry.f_id = data.f_id
        var couldSave = await State.ws.updateEntry(colname, entry)
        aevents.emit("loading-state", false)
        if (!couldSave) return false
        popSaveBar()
        return true
    }

    const ondiscard = () => {
        popSaveBar()
    }

    var onchange = () => {
        if (!saveSnackbar) {
            saveSnackbar = buildSaveSnackbar(onsave, ondiscard)
            pushActivity(saveSnackbar)
        }
        savedState = false
    }

    const build_main = () => {
        var form = buildEntryInput(col, data, onchange)
        div.append(form.element)
        collect = form.collect

    }

    if (entry) State.ws.entryLock(entry?.f_id, true).then((r) => {
        if (r) return build_main()
        popActivity()
        pushErrorSnackbar("This entry is locked. Somepne is already editing it.",true)
    })
    else build_main()


    return {
        element: div,
        name: "entry-form",
        type: "fullscreen",
        oncancel: () => {
            if (savedState) return true
            document.body.classList.add("shake")
            setTimeout(() => {
                document.body.classList.remove("shake")
            }, 300)
            return false
        },
        onpop: () => {
            if (entry) State.ws.entryLock(entry.f_id, false)
        },
        title: `Edit: ${(entry) ? getEntryPreview(entry, col) : `New (${data.f_id})`}`,
        events: aevents
    };
}

export function buildSaveSnackbar(onsave: OnSaveCallback, ondiscard: () => any): Activity {
    var bar = document.createElement("div")
    var unbind: (() => any)[] = []

    var infoText = document.createElement("p")
    infoText.textContent = "You have unsaved changes."

    var btnSave = document.createElement("input")
    btnSave.classList.add("btn", "btn-green")
    btnSave.type = "button"
    btnSave.onclick = async () => {
        setDisabledRecursive(bar, true)
        var couldSave = await onsave()
        if (!couldSave) return setDisabledRecursive(bar, false)
    }
    btnSave.value = "Save"

    var btnDiscard = document.createElement("input")
    btnDiscard.classList.add("btn", "btn-danger")
    btnDiscard.type = "button"
    btnDiscard.onclick = ondiscard
    btnDiscard.value = "Discard changes"

    var btnSaveBack = document.createElement("input")
    btnSaveBack.classList.add("btn", "btn-green")
    btnSaveBack.type = "button"
    btnSaveBack.onclick = async () => {
        setDisabledRecursive(bar, true)
        var couldSave = await onsave()
        if (!couldSave) return setDisabledRecursive(bar, false)
        popActivity()
    }
    btnSaveBack.value = "Save and Close"

    unbind.push(Keybindings.bindElementClick(btnSave, "save"))
    unbind.push(Keybindings.bindElementClick(btnSaveBack, "save-quit"))

    bar.append(infoText, btnDiscard, btnSaveBack, btnSave)
    bar.classList.add("save-snackbar")

    return {
        onpop: () => {
            unbind.forEach(e => e())
        },
        type: "snackbar",
        element: bar,
        name: "save-bar",
    }
}

export function buildEntryInput(s: SchemeCollection, preload_data: ColEntry | undefined, onchange: () => any): SchemeInputBuild {
    var form = document.createElement("div");
    form.classList.add("entry-form")
    var collectors: { [key: string]: () => any } = {};
    if (!preload_data) preload_data = { f_id: "PRELOAD_PLACEHOLDER" }

    for (const valname in s) {
        if (s.hasOwnProperty(valname)) {
            const valtype = s[valname];
            var pair = document.createElement("div")

            var label = document.createElement("span")
            var preload = preload_data[valname]
            var { collect, element, label_after } = buildValueInput(valtype, preload, onchange)
            collectors[valname] = collect

            label.textContent = kebabToTitle(valname)

            if (label_after) pair.append(element, label)
            else pair.append(label, element)

            form.appendChild(pair)
        }
    }

    return {
        collect: () => {
            var res: { [key: string]: any } = {}
            for (const valname in collectors) {
                if (!s.hasOwnProperty(valname)) continue
                const collect = collectors[valname]
                res[valname] = collect()
            }
            return res
        },
        element: form,
    };
}

export function buildValueInput(s: SchemeValue, preload: any, onchange: () => any): SchemeInputBuild {
    var builder = FORM_INPUT_BUILDERS[s.type]
    return builder(s, preload, onchange)
}


function dummyInput(s: SchemeValue): SchemeInputBuild {
    Logger.log(["err", "form"], `Form value type ${s.type} is unknown.`);
    return {
        collect: () => undefined,
        element: document.createElement("div")
    }
}

export type FormInputBuilder = (s: SchemeValue, preload: any, onchange: () => any) => SchemeInputBuild
const FORM_INPUT_BUILDERS: { [key in SchemeValueType]: FormInputBuilder } = {
    array: (s, preload, och) => {
        return dummyInput(s)
    },
    ref: (s, preload, och) => {
        return dummyInput(s)
    },
    map: (s, preload, och) => {
        return dummyInput(s)
    },
    date: (s, preload, och) => {
        var date = new Date();
        var dd = String(date.getDate()).padStart(2, "0");
        var mm = String(date.getMonth() + 1).padStart(2, "0");
        var yy = date.getFullYear();

        var input = document.createElement("input");
        input.onchange = och;

        var d = new Date(preload)
        input.value = preload || yy + "-" + mm + "-" + dd

        input.type = "date";
        input.placeholder = " "

        return {
            collect: () => {
                return input.value
            },
            label_after: true,
            element: input,
        };
    },

    number: (s, preload, och) => {
        var input = document.createElement("input");
        input.value = preload || "1";
        input.type = "number";
        input.placeholder = " "
        input.onchange = och;
        input.onkeypress = (ev) => {
            if (!ev.code.startsWith("Digit") && !ev.code.startsWith("Numpad")) {
                ev.preventDefault()
            }
        }
        return {
            collect: () => parseFloat(input.value),
            element: input,
            label_after: true
        };
    },

    string: (s, preload, och) => {
        var input = document.createElement("input");
        input.onchange = och;
        input.placeholder = " "
        input.type = "text";
        if(s.contraints?.regex != undefined) {
            input.pattern = s.contraints?.regex || "";
        }
        input.value = preload || ""
        return {
            collect: () => input.value,
            element: input,
            label_after: true
        };
    },
    boolean: (s, preload, och) => {
        var input = document.createElement("input");
        input.onchange = och;
        input.checked = preload
        input.type = "checkbox";
        return {
            collect: () => input.checked,
            element: input,
            label_after: true
        };
    }
}

// TODO
export function buildDropdownInput(s: SchemeValue): SchemeInputBuild {
    var menu = document.createElement("select")
    var options = ["a"]

    for (var o of options) {
        var opt = document.createElement("option")
        opt.textContent = o
        opt.value = o
        menu.appendChild(opt)
    }

    return {
        collect: () => menu.value,
        element: menu
    }
}
