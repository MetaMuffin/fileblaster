
import { Server } from "http"
import * as lws from "ws"
import { validateEntry } from "../schemeValidator"
import { WSPacket } from "../wspacket"
import { ServerDB } from "./database"
import { dev_events } from "./dev"


interface FnRes {
    ok?: any,
    error?: {
        title: string,
        data?: any
    }
}

export function wsServerConnect(ws: lws) {
    const devpackethandler = (data: any) => {
        ws.send(JSON.stringify({
            data, id: "dev",
            name: "dev-packet"
        }))
    }
    dev_events.on("packet", devpackethandler)
    ws.onclose = () => {
        dev_events.off("packet", devpackethandler)
    }
    ws.onopen = () => {
        console.log("Somebody connected!!!")
    }
    ws.onmessage = async (ev) => {
        var j: WSPacket = JSON.parse(ev.data.toString())
        console.log(j);
        var res: WSPacket = {
            data: {},
            id: j.id,
            name: j.name
        }

        if (wsPacketHandlers.hasOwnProperty(j.name)) {
            var fnres: FnRes = await wsPacketHandlers[j.name](j.data)
            if (fnres.error) {
                res.name = "error"
                res.data = fnres.error
            } else {
                res.data = fnres.ok
            }
        } else {
            res.name = "error"
            res.data = "Packet unknown: " + j.name
        }
        console.log(res);
        ws.send(JSON.stringify(res))
    }
}

function validateEntryLocal(colname: any, entry: any): FnRes | undefined {
    if (!colname || !entry) return { error: { title: "No colname or entry" } };
    if (!ServerDB.scheme.hasOwnProperty(colname)) return { error: { title: "Colname unknown" } }
    var invalid = validateEntry(ServerDB.scheme[colname], entry)
    if (invalid) return { error: { title: "Entry invalid", data: invalid } };
    return undefined
}

const wsPacketHandlers: { [key: string]: (data: any) => Promise<FnRes> } = {
    "scheme": async (d) => {
        return { ok: ServerDB.scheme }
    },
    
    "update-entry": async (d) => {
        const { colname, entry } = d;
        var err_res = validateEntryLocal(colname, entry)
        if (err_res) return err_res
        ServerDB.updateEntry(colname, entry);
        return { ok: "ok" }
    },
    "delete-entry": async (d) => {
        const { colname, entry } = d;
        var err_res = validateEntryLocal(colname, entry)
        if (err_res) return err_res

        return { ok: "ok" }
    },
    "get-one-entry": async (d) => {
        const { colname, query } = d;
        if (!colname || !query) return { error: { title: "No colname or query" } };
        if (!ServerDB.scheme.hasOwnProperty(colname)) return { error: { title: "Colname unknown" } }
        var res = await ServerDB.getOneEntry(colname, query);
        return { ok: res }
    },
    "get-many-entries": async (d) => {
        const { colname, query, count, offset } = d;
        if (!colname || !query) return { error: { title: "No colname or query" } };
        if (!ServerDB.scheme.hasOwnProperty(colname)) return { error: { title: "Colname unknown" } }
        var res = await ServerDB.getManyEntries(colname, query, count, offset);
        return { ok: res }
    },
}
