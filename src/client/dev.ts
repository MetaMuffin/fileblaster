import { State } from ".";


export function devInit() {
    if (window.location.hash != "#dev") return
    
    State.ws.on("packet-dev",(data) => {
        if (data.css_reload) devReloadCss()
    })
}


export function devReloadCss() {

    var links = document.getElementsByTagName("link");
    for (var cl in links) {
        var link = links[cl];
        if (link.rel === "stylesheet")
            link.href += "";
    }
}