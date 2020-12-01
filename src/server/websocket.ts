
import { Server } from "http"
import { v4 } from "uuid"
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

var ws_all: { id: string, ws: lws }[] = []

export function wsBroadcast(name: string, data: any) {
    ws_all.forEach(w => {
        var res = { name, data }
        console.log(res);
        w.ws.send(JSON.stringify(res))
    })
}

export function wsServerConnect(ws: lws) {
    var id = v4()
    const devpackethandler = (data: any) => {
        ws.send(JSON.stringify({
            data, id: "dev",
            name: "dev-packet"
        }))
    }
    var ready = false
    dev_events.on("packet", devpackethandler)
    ws.onclose = () => {
        dev_events.off("packet", devpackethandler)
        ws_all.splice(ws_all.findIndex(e => e.id == id), 1)
        for (const lock in locks) {
            if (locks.hasOwnProperty(lock)) {
                const lock_owner_id = locks[lock];
                if (lock_owner_id == id) delete locks[lock]
            }
        }
    }
    const onafteropen = () => {
        console.log("Somebody connected!!!")
        ws_all.push({ id, ws })
    }
    ws.onmessage = async (ev) => {
        if (!ready) {
            onafteropen()
            ready = true
        }
        var j: WSPacket = JSON.parse(ev.data.toString())
        console.log(j);
        var res: WSPacket = {
            data: {},
            id: j.id,
            name: j.name
        }

        if (wsPacketHandlers.hasOwnProperty(j.name)) {
            var fnres: FnRes = await wsPacketHandlers[j.name](j.data, ws, id)
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

// maps a entry id to a id of the websocket, that locked it.
var locks: { [key: string]: string } = {}

const wsPacketHandlers: { [key: string]: (data: any, ws: lws, wsid: string) => Promise<FnRes> } = {
    "scheme": async (d) => {
        return { ok: ServerDB.scheme }
    },

    "update-entry": async (d) => {
        const { colname, entry } = d;
        var err_res = validateEntryLocal(colname, entry)
        if (err_res) return err_res
        var res = await ServerDB.updateEntry(colname, entry);
        wsBroadcast("entry-reload", {})
        if (res) return { ok: "ok" }
        return { error: { title: "no matches" } }
    },
    "delete-entry": async (d) => {
        const { colname, entry } = d;
        var err_res = validateEntryLocal(colname, entry)
        if (err_res) return err_res
        var res = await ServerDB.deleteEntry(colname, entry)
        wsBroadcast("entry-reload", {})
        if (res) return { ok: "ok" }
        return { error: { title: "no matches" } }
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
    "lock": async (d, _, id) => {
        const { state, entry_id } = d;
        if (!entry_id) return { error: {title: "entry_id missing! kek"}}
        if (locks[entry_id] == id && state) {
            delete locks[entry_id]
        }
        if (locks[entry_id]) return { ok: false }
        if (state) locks[entry_id] = id
        return { ok: true }
    }
}
