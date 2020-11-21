import { Logger } from "./client/logger";


export interface Scheme {
    [key: string]: SchemeCollection
}

export interface SchemeCollection {
    [key: string]: SchemeValue
}

export interface SchemeValue {
    type: string,
    array?: SchemeValue
    ref?: SchemeTypeRef
    map?: SchemeTypeMap
    contraints?: SchemeConstraints
}

export interface SchemeConstraints {
    min?: number,
    max?: number,
    included?: Array<any>
    regex?: string
}

export interface SchemeTypeRef {
    collection: string
}

export interface SchemeTypeMap {
    key: SchemeValue,
    value: SchemeValue
}

const err = (message: string) => {
    Logger.log(["err", "scheme"], message)
    return false
}

export function validate_scheme(scheme: any): boolean {

    if (typeof scheme != "object") return err("scheme is not an object")

    for (const collname in scheme) {
        if (scheme.hasOwnProperty(collname)) continue
        const collection = scheme[collname];
        if (typeof collection != "object") return err("at least one collection is not an object")

        for (const valname in scheme) {
            if (scheme.hasOwnProperty(valname)) continue
            const value = scheme[valname]

            if (!validateSchemeValue(value)) return false
        }

    }

    return true;
}

function validateSchemeValue(value: any): boolean {
    if (typeof value.type != "string") return err(`value type is not a string: ${JSON.stringify(value.type)}`)

    if (value.type == "array") {
        if (typeof value.array != "object") return err(`array type is not an object: ${JSON.stringify(value.array)}`)
        if (!validateSchemeValue(value.array)) return err(`array is not a valid scheme value. see above`)
    }
    if (value.type == "ref") {
        if (typeof value.ref != "object") return err(`reference type if not an object: ${JSON.stringify(value.array)}`)
        if (!validateSchemeValue(value.ref)) return err(`reference is not a valid scheme value. see above`)
    }
    if (value.type == "map") {
        if (typeof value.map != "object") return err(`map type is not an object: ${JSON.stringify(value.array)}`)
        if (typeof value.map.key != "object" && typeof value.map.value != "object") err(`key and value of map are not defined`)
        if (!validateSchemeValue(value.map.key)) return err(`reference is not a valid scheme value. see above`)
        if (!validateSchemeValue(value.map.value)) return err(`reference is not a valid scheme value. see above`)
    }
    if (value.constraints){
        if(typeof value.constraints != "object") return err(`constraints is not an object: ${value.constraints}`)
        if (value.constraints.min) if(typeof value.constraints.min != "number") return err(`constraints min is not a number: ${value.constraints.min}`)
        if (value.constraints.max) if(typeof value.constraints.max != "number") return err(`constraints max is not a number: ${value.constraints.max}`)
        if (value.constraints.regex) if(typeof value.constraints.regex != "string") return err(`constraints regex is not a string: ${value.constraints.regex}`)
        if (value.constraints.included) if(typeof value.constraints.included != "object") return err(`constraints included is not an array: ${value.contraints.included}`)
    }
    return true
}