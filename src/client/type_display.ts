import { SchemeValue } from "../scheme";


export function displayValue(type: SchemeValue, value: any): string {
    if (typeof value == "string") return value
    else return "TODO!"
}