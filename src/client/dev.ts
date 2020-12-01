import { State } from ".";
import { pushActivity, pushErrorObjectSnackbar } from "./activity";
import { Logger } from "./logger";


export function devInit() {
    if (window.location.hash != "#dev") return
    Logger.log(["dev-mode"], "Entering dev mode!")
    State.ws.on("packet-dev", (data) => {
        if (data.data.css_reload) devReloadCss()
    })

    // Expose some functions to the window for dev
    //@ts-ignore
    window.dev = {
        Logger, State, pushActivity, pushErrorObjectSnackbar,
    }
}


export function devReloadCss() {
    Logger.log(["dev-mode"], "Reloading CSS!")
    var links = document.getElementsByTagName("link");

    for (var x in links) {
        if (!links.hasOwnProperty(x)) continue
        var link = links[x];
        link.href = link.href.split("?")[0] + "?id=" + new Date().getMilliseconds();
    }

}
