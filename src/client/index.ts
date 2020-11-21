import { pushActivity, popActivity } from "./screen"


function init() {
    pushActivity({
        element: document.createElement("div"),
        name: "main",
        title: "fileblaster",
        type: "fullscreen"
    })
    setTimeout(() => {
        pushActivity({
            element: document.createElement("div"),
            name: "test",
            title: "I can be canceled!",
            oncancel: () => true
        })
    },300)
}

window.onload = init

//@ts-ignore
window.a = pushActivity
//@ts-ignore
window.b = popActivity