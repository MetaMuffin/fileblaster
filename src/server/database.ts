import { ColEntry, Scheme } from "../scheme";
import { readFileSync } from "fs";
import { join } from "path";
import { Db, MongoClient } from "mongodb";


export class ServerDB {
    public static scheme: Scheme;
    private static dbcon: MongoClient;
    private static dbo: Db

    static async loadScheme() {
        ServerDB.dbcon = await MongoClient.connect("mongodb://localhost:27017/")
        ServerDB.dbo = ServerDB.dbcon.db("files")
        ServerDB.scheme = JSON.parse(readFileSync(join(__dirname, "../../schemes/example.json")).toString())
    }

    static async addEntry(colname: string, data: ColEntry) {
        await this.dbo.collection(colname).insertOne(data)
    }
    static async getOneEntry(colname: string, query: any): Promise<any> {
        return await this.dbo.collection(colname).findOne(query)
    }
    static async getManyEntries(colname: string, query: any, count: number | undefined, offset: number | undefined): Promise<any[]> {
        let cursor = this.dbo.collection(colname).find(query)
        if (offset) cursor.skip(offset)
        if (count) cursor.limit(count)
        let results = []
        for await (const r of cursor) {
            results.push(r)
        }
        return results;
    }
    
    static async updateEntry(colname: string, entry: ColEntry): Promise<boolean> {
        let query = {f_id: entry.f_id}
        var res = await this.dbo.collection(colname).replaceOne(query,entry, {upsert: true})
        return res.matchedCount > 0 || res.upsertedCount != 0
    }

    static async deleteEntry(colname: string, entry: ColEntry): Promise<boolean> {
        var res = await this.dbo.collection(colname).deleteOne({f_id: entry.f_id})
        if (!res.deletedCount) return false
        return res.deletedCount > 0
    }
}
