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