import { WSPacket } from "../wspacket"
import { EventEmitter } from "events"
import { Logger } from "./logger"
import { pushActivity } from "./screen";

export function createWS(): WS {
    var ws = new WebSocket(`ws://${window.location.host}/api/ws`)
    Logger.log(["websocket"],"Connecting to Websocket server....")
    return new WS(ws)
}



export class WS extends EventEmitter {
    public static c: WS;
    private ws: WebSocket
    constructor(ws: WebSocket) {
        super()
        this.ws = ws
        this.ws.onmessage = (ev) => this.onmessage(ev.data)
        
    }

    async waitReady(): Promise<void> {
        if (this.ws.OPEN) return Logger.log(["websocket"],"Connected very fast!")
        return new Promise((resolve, reject) => {
            this.ws.onopen = () => {
                Logger.log(["websocket"],"Connected!")
                resolve()
            }
            this.ws.onerror = reject
        })
    }

    private onmessage(data: string) {
        var j: WSPacket = JSON.parse(data)
        this.emit(j.name, j.data)
    }

    private async recvPacket(name: string): Promise<any> {
        return new Promise((r) => {
            this.once(name, (d) => {
                Logger.log(["websocket"],`Received a ${d.name} packet`, d.data)
                r(d.data)
            })
        })
    }

    private sendPacket(name: string, data: any) {
        Logger.log(["websocket"],`Sending a ${name} packet:`, data)
        this.ws.send(JSON.stringify({ name, data }))
    }


    async getCollectionList(): Promise<string[]> {
        this.sendPacket
        return await this.recvPacket("collection-list")
    }

}