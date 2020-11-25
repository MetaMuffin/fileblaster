import { Scheme } from "../scheme";




export function getAllCollectionNames(scheme: Scheme): string[] {
    var colnames = []
    for (const colname in scheme) {
        if (scheme.hasOwnProperty(colname)) {
            colnames.push(colname)
        }
    }
    return colnames
}

var idcounter = 0
export function newTempID(): string {
    return `dom_id${idcounter += 2}`
}

export function kebabToTitle(name: string): string {

    let arr = name.split('-');
    let capital = arr.map((item, index) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase());
    let capitalString = capital.join("");

    return capitalString;
}


export function sleep(ms:number): Promise<void> {
    return new Promise((r) => setTimeout(r,ms))
}

export function setDisabledRecursive(element: Element, state: boolean) {
    if (state) {
        element.setAttribute("js-disabled","1")
        element.setAttribute("disabled","1")
    } else {
        if (element.getAttribute("js-disabled")) {
            element.removeAttribute("js-disabled")
            element.removeAttribute("disabled")
        }
    }
    for (let i = 0; i < element.children.length; i++) {
        const child = element.children[i];
        setDisabledRecursive(child,state)   
    }
}