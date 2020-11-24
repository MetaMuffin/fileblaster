import { removePatialActivity, Activity } from "../activity";
import { SchemeValue, SchemeInputBuild, SchemeCollection, SchemeValueType } from "../../scheme";
import { Logger } from "../logger";
import { State } from "..";
import { newTempID } from "../helper";

export function entryForm(colname: string, entryid: string | undefined = undefined): Activity {
    var div = document.createElement("div");

    var col = State.scheme[colname]
    var form = buildEntryInput(col)

    div.appendChild(form.element)

    return {
        element: div,
        name: "entry-form",
        type: "fullscreen",
        oncancel: () => {
            return true;
        },
        title: `Edit: ${entryid || "New"}`,
    };
}

export function buildEntryInput(s: SchemeCollection): SchemeInputBuild {
    var form = document.createElement("div");
    form.classList.add("entry-form")
    var collectors: { [key: string]: () => any } = {};

    for (const valname in s) {
        if (s.hasOwnProperty(valname)) {
            const valtype = s[valname];
            var input_id = newTempID()
            var pair = document.createElement("div")

            var label = document.createElement("label")
            var { collect, element } = buildValueInput(valtype)
            collectors[valname] = collect

            element.id = input_id
            label.setAttribute("for", input_id)
            label.textContent = `${valname}: `

            pair.append(label, element)

            form.appendChild(pair)
        }
    }

    return {
        collect: () => { },
        element: form,
    };
}

export function buildValueInput(s: SchemeValue): SchemeInputBuild {
    var builder = FORM_INPUT_BUILDERS[s.type]
    return builder(s)
}


function dummyInput(s: SchemeValue): SchemeInputBuild {
    Logger.log(["err", "form"], `Form value type ${s.type} is unknown.`);
    return {
        collect: () => undefined,
        element: document.createElement("div")
    }
}

export type FormInputBuilder = (s: SchemeValue) => SchemeInputBuild
const FORM_INPUT_BUILDERS: { [key in SchemeValueType]: FormInputBuilder } = {
    array: (s) => {
        return dummyInput(s)
    },
    ref: (s) => {
        return dummyInput(s)
    },
    map: (s) => {
        return dummyInput(s)
    },
    date: (s) => {
        var date = new Date();
        var dd = String(date.getDate()).padStart(2, "0");
        var mm = String(date.getMonth() + 1).padStart(2, "0");
        var yy = date.getFullYear();

        var input = document.createElement("input");
        input.classList.add("datepicker");
        input.value = mm + "/" + dd + "/" + yy;
        input.type = "date";

        return {
            collect: () =>
                new Date(
                    parseInt(input.value.split("/")[2]),
                    parseInt(input.value.split("/")[0]),
                    parseInt(input.value.split("/")[1])
                ).getTime(),
            element: input,
        };
    },

    number: (s) => {
        var input = document.createElement("input");
        input.value = "1";
        input.type = "number";
        input.onkeypress = (ev) => {
            if (!ev.code.startsWith("Digit") && !ev.code.startsWith("Numpad")) {
                ev.preventDefault()
            }
        }
        return {
            collect: () => parseFloat(input.value),
            element: input,
        };
    },

    string: (s) => {
        var input = document.createElement("input");
        input.type = "text";
        return {
            collect: () => input.value,
            element: input,
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
