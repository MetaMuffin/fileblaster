
import * as lws from "ws"
import { WSPacket } from "../wspacket"
import { ServerDB } from "./database"
import { dev_events } from "./dev"


export function wsServerConnect(ws: lws) {
    dev_events.on("packet",(data) => {
        console.log("Sending dev packet to client");
        ws.send(JSON.stringify({
            data, id: "dev",
            name: "dev-packet"
        }))
    })
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
            res.data = await wsPacketHandlers[j.name](j.data)
        } else {
            res.name = "error"
            res.data = "Packet unknown: " + j.name
        }
        console.log(res);
        ws.send(JSON.stringify(res))
    } 
}

const wsPacketHandlers:{[key:string]: (data: any) => Promise<any>} = {
    "scheme": async (d) => {
        return ServerDB.scheme
    }
}
