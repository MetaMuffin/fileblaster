import { pushActivity, popActivity } from "./screen"
import { WS, createWS } from "./websocket"


async function init() {
    WS.c = createWS()    
    await WS.c.waitReady()
    pushActivity({
        element: document.createElement("div"),
        name: "main",
        title: "fileblaster",
        type: "fullscreen"
    })
}

window.onload = init

//@ts-ignore
window.a = pushActivity
//@ts-ignore
window.b = popActivity