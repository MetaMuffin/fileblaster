import { pushActivity, popActivity } from "./screen"
import { WS } from "./websocket"


async function init() {
    WS.c = new WS();
    await WS.c.waitReady().catch(() => {
        pushActivity({
            element: document.createElement("div"),
            name: "ws-error",
            title: "Websocket error.",
            type: "fullscreen"
        })
    })
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