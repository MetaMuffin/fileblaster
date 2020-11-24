import { Activity } from "../activity";
import { SchemeValue, SchemeInputBuild, SchemeCollection } from "../../scheme";


export function entryForm(colname: string, entryname: string | undefined = undefined): Activity {
    var div = document.createElement("div")



    return {
        element: div,
        name: "entry-form",
        type: "fullscreen",
        oncancel: () => {
            return true
        },
        title: `Edit: `
    }
}



export function buildEntryInput(s: SchemeCollection): SchemeInputBuild {
    var form = document.createElement("div")
    var collectors: {[key:string]: () => any}

    for (const valname in s) {
        if (s.hasOwnProperty(valname)) {
            const valtype = s[valname];
            
        }
    }

    return {
        collect: () => {

        },
        element: form
    }
}

export function buildValueInput(s: SchemeValue): SchemeInputBuild {
    if (s.type == "string") return buildStringInput(s)
    else return {
        collect: () => undefined,
        element: document.createElement("div")
    }
}


export function buildStringInput(s: SchemeValue): SchemeInputBuild {
    var input = document.createElement("input")
    input.value = "text"
    return {
        collect: () => input.value,
        element: input
    }
}