
import * as lws from "ws"
import { WSPacket } from "../wspacket"

export function wsServerConnect(ws: lws) {
    ws.onopen = () => {
        ws.onmessage = (ev) => {
            var j: WSPacket = JSON.parse(ev.data.toString())
            
        } 
    }
}

const wsPacketHandlers:{[key:string]: (data: any) => Promise<any>} = {
    "list-collections": async (d) => {
        
    }
}