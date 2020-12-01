

export interface Scheme {
    [key: string]: SchemeCollection
}

export interface SchemeCollection {
    [key: string]: SchemeValue
}

export type SchemeValueType = "string" | "number" | "array" | "map" | "ref" | "date" | "boolean"

export interface SchemeValue {
    type: SchemeValueType
    optional?: boolean
    array?: SchemeValue
    ref?: SchemeTypeRef
    map?: SchemeTypeMap
    contraints?: SchemeConstraints,
    display?: SchemeDisplay,
    preview_index?: number
}

export interface SchemeDisplay {
    unit: string
}

export interface SchemeConstraints {
    min?: number
    max?: number
    included?: Array<any>
    regex?: string
}

export interface SchemeTypeRef {
    collection: string
    merge: string
}

export interface SchemeTypeMap {
    key: SchemeValue
    value: SchemeValue
}

export interface SchemeInputBuild {
    collect: () => any
    element: HTMLElement,
    label_after?: boolean
}

export interface EntryValidationError {
    field: string,
    message: string,
}

export interface ColEntry {
    f_id: string,
    [key: string]: any
}
