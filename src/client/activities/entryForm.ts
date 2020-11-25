import { popPatialActivity, Activity, pushActivity, popActivity } from "../activity";
import { SchemeValue, SchemeInputBuild, SchemeCollection, SchemeValueType } from "../../scheme";
import { Logger } from "../logger";
import { State } from "..";
import { kebabToTitle, newTempID, setDisabledRecursive, sleep } from "../helper";

export type OnSaveCallback = () => Promise<boolean>

export function entryForm(colname: string, entryid: string | undefined = undefined): Activity {
    var div = document.createElement("div");

    var col = State.scheme[colname]
    var savedState = true
    var saveSnackbar: Activity | undefined;

    const popSaveBar = () => {
        savedState = true
        if (saveSnackbar){
            popPatialActivity(saveSnackbar)
            saveSnackbar = undefined
        }
    }

    const onsave = async (): Promise<boolean> => {
        await sleep(1000)
        popSaveBar()

        return true
    }
    
    const ondiscard = () => {
        popSaveBar()
    }

    var onchange = () => {
        if (!saveSnackbar) {
            saveSnackbar = buildSaveSnackbar(onsave,ondiscard)
            pushActivity(saveSnackbar)
        }
        savedState = false
    }

    var form = buildEntryInput(col,onchange)
    div.append(form.element)

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
        title: `Edit: ${entryid || "New"}`,
    };
}

export function buildSaveSnackbar(onsave: OnSaveCallback, ondiscard: () => any): Activity {
    var bar = document.createElement("div")

    var infoText = document.createElement("p")
    infoText.textContent = "You have unsaved changes."

    var btnSave = document.createElement("input")
    btnSave.type = "button"
    btnSave.onclick = async () => {
        setDisabledRecursive(bar,true)
        var couldSave = await onsave()
        if (!couldSave) return setDisabledRecursive(bar,false)   
    }
    btnSave.classList.add("btn-green")
    btnSave.value = "Save"
    
    var btnDiscard = document.createElement("input")
    btnDiscard.type = "button"
    btnDiscard.onclick = ondiscard
    btnDiscard.classList.add("btn-danger")
    btnDiscard.value = "Discard changes"

    var btnSaveBack = document.createElement("input")
    btnSaveBack.type = "button"
    btnSaveBack.onclick = async () => {
        setDisabledRecursive(bar,true)
        var couldSave = await onsave()
        if (!couldSave) return setDisabledRecursive(bar,false)
        popActivity()
    }
    btnSaveBack.classList.add("btn-green")
    btnSaveBack.value = "Save and Quit"

    bar.append(infoText,btnDiscard,btnSaveBack,btnSave)
    bar.classList.add("save-snackbar")

    return {
        type: "snackbar",
        element: bar,
        name: "save-bar",
    }
}

export function buildEntryInput(s: SchemeCollection, onchange: ()=>any): SchemeInputBuild {
    var form = document.createElement("div");
    form.classList.add("entry-form")
    var collectors: { [key: string]: () => any } = {};

    for (const valname in s) {
        if (s.hasOwnProperty(valname)) {
            const valtype = s[valname];
            var pair = document.createElement("div")

            var label = document.createElement("span")
            var { collect, element, label_after } = buildValueInput(valtype,onchange)
            collectors[valname] = collect

            label.textContent = kebabToTitle(valname)

            if (label_after) pair.append(element, label)
            else pair.append(label, element)

            form.appendChild(pair)
        }
    }

    return {
        collect: () => { },
        element: form,
    };
}

export function buildValueInput(s: SchemeValue, onchange: ()=>any): SchemeInputBuild {
    var builder = FORM_INPUT_BUILDERS[s.type]
    return builder(s,onchange)
}


function dummyInput(s: SchemeValue): SchemeInputBuild {
    Logger.log(["err", "form"], `Form value type ${s.type} is unknown.`);
    return {
        collect: () => undefined,
        element: document.createElement("div")
    }
}

export type FormInputBuilder = (s: SchemeValue, onchange: ()=>any) => SchemeInputBuild
const FORM_INPUT_BUILDERS: { [key in SchemeValueType]: FormInputBuilder } = {
    array: (s,och) => {
        return dummyInput(s)
    },
    ref: (s,och) => {
        return dummyInput(s)
    },
    map: (s,och) => {
        return dummyInput(s)
    },
    date: (s,och) => {
        var date = new Date();
        var dd = String(date.getDate()).padStart(2, "0");
        var mm = String(date.getMonth() + 1).padStart(2, "0");
        var yy = date.getFullYear();

        var input = document.createElement("input");
        input.classList.add("datepicker");
        input.onchange = och;
        input.value = mm + "/" + dd + "/" + yy;
        input.type = "date";
        input.placeholder = " "

        return {
            collect: () =>
                new Date(
                    parseInt(input.value.split("/")[2]),
                    parseInt(input.value.split("/")[0]),
                    parseInt(input.value.split("/")[1])
                ).getTime(),
            label_after: true,
            element: input,
        };
    },

    number: (s,och) => {
        var input = document.createElement("input");
        input.value = "1";
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

    string: (s,och) => {
        var input = document.createElement("input");
        input.onchange = och;
        input.placeholder = " "
        input.type = "text";
        return {
            collect: () => input.value,
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
