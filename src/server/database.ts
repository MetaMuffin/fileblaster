import { Scheme } from "../scheme";
import { readFileSync } from "fs";
import { join } from "path";



export class ServerDB {
    public static scheme: Scheme;

    static loadScheme() {
        ServerDB.scheme = JSON.parse(readFileSync(join(__dirname,"../../schemes/example.json")).toString())
    }
}