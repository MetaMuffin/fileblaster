import { WSPacket } from "../wspacket"
import { EventEmitter } from "events"
import { Logger } from "./logger"
import { pushActivity, pushErrorSnackbar } from "./activity";
import { Scheme } from "../scheme";
import { State } from ".";

export async function createWS(): Promise<WS> {
    Logger.log(["websocket"],"Connecting to Websocket server....")
    var wsi = new WebSocket(`ws://${window.location.host}/api/ws`)
    var ws = new WS(wsi)
    await ws.waitReady()
    return ws;
}



export class WS extends EventEmitter {
    private ws: WebSocket


    constructor(ws: WebSocket) {
        super()
        this.ws = ws
        this.ws.onmessage = (ev) => this.onmessage(ev.data)
        this.ws.onopen = () => {
            Logger.log(["websocket"],"Connected!")
            this.emit("preready")
        }
        this.ws.onclose = (e) => {
            pushErrorSnackbar("Connection to server was interrupted. Please reload this page.")
        }
        this.once("preready", async () => {
            Logger.log(["websocket"],"Fetching scheme data...")
            var oscheme = await this.getScheme()
            if (!oscheme) return pushErrorSnackbar("Internal error. Report this error and reload this page if something doesn't work anymore.")
            State.scheme = oscheme
            Logger.log(["websocket"],"Ready!")
            this.emit("ready")
        })
    }

    async waitReady(): Promise<void> {
        if (State.scheme) {
            Logger.log(["websocket"],"Ready very fast!")
            return
        }
        return new Promise((resolve, reject) => {
            this.on("ready", () => {
                resolve()
            })
        })
    }

    private onmessage(data: string) {
        var j: WSPacket = JSON.parse(data)
        this.emit("packet-"+j.id, j)
    }

    private async recvPacket(id: number): Promise<WSPacket> {
        return new Promise((r) => {
            this.once("packet-"+id, (d) => {
                Logger.log(["websocket"],`Received a ${d.name} packet: `, d.data)
                r(d)
            })
        })
    }

    private sendPacket(name: string, data: any): number {
        Logger.log(["websocket"],`Sending a ${name} packet:`, data)
        var id = Math.floor(Math.random()*1000000)
        this.ws.send(JSON.stringify({ name, data, id }))
        return id
    }

    async packetIO(name:string, data:any): Promise<any | undefined> {
        var id = this.sendPacket(name,data)
        var res = await this.recvPacket(id)
        if (res.name == "error") {
            Logger.log(["err","websocket"],`SERVER RESPONDED WITH ERROR: ${res.data}`)
            return undefined
        }
        return res.data
    }


    async getScheme(): Promise<Scheme | undefined> {
        return await this.packetIO("scheme",{})
    }



}