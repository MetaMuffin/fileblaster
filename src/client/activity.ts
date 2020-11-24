import { Logger } from "./logger"


export interface Activity {
    element: HTMLElement
    name: string,
    title?: string,
    type?: "floating" | "fullscreen" | "snackbar",
    oncancel?: () => boolean,
    snackbarTimeout?: number
}

export interface ActivityBuild {
    source: Activity,
    element: HTMLElement
}

var activity_stack: ActivityBuild[] = []
var activity_partial_stack: ActivityBuild[] = []

const get_activity_root = () => document.getElementById("activity-root")

export function pushActivity(activity: Activity) {
    Logger.log(["activity"], `Pushed ${activity.type || "fullscreen (defaulted)"} activity: ${activity.name}`)
    var build;
    if (activity.type == "snackbar") build = buildSnackbarActivity(activity)
    else build = buildFullscreenActivity(activity)

    if (activity.type == "snackbar" || activity.type == "floating") activity_partial_stack.push(build)
    else activity_stack.push(build)
    get_activity_root()?.appendChild(build.element)
}

export function popActivity() {
    var s = activity_stack.pop()
    if (s) {
        Logger.log(["activity"], `Popped activity: ${s.source.name}`)
        s.element.classList.remove("activity-active")
        s.element.classList.add("activity-inactive")
        setTimeout(() => {
            if (s) get_activity_root()?.removeChild(s.element)
        }, 1000)
    } else {
        throw new Error("Nothing left to pop!");
    }
}

export function removePatialActivity(a: Activity) {
    Logger.log(["activity"], `Popped partial overlay activity: ${a.name}`)
    var index = activity_partial_stack.findIndex(e => e.source.element == a.element)
    if (index == -1) return Logger.log(["warn", "activity"], "Partial Overlay not found to remove it.")
    var [par] = activity_partial_stack.splice(index)
    par.element.classList.remove("activity-active")
    par.element.classList.add("activity-inactive")
    setTimeout(() => {
        get_activity_root()?.removeChild(par.element)
    }, 1000)
}

export function buildFullscreenActivity(source: Activity): ActivityBuild {
    var screen = document.createElement("div")
    screen.classList.add("activity", "activity-active", "activity-fs")
    screen.classList.add(`activity-fs-background-${activity_stack.length}`)
    source.element.classList.add("activity-content")

    var topbar = document.createElement("div")
    topbar.classList.add("activity-fs-topbar")
    var title = document.createElement("h2")
    title.textContent = source.title || ""
    topbar.appendChild(title)
    if (source.oncancel) {
        var cancelb = document.createElement("input")
        cancelb.type = "button"
        cancelb.onclick = () => {
            if (!source.oncancel) return
            var shouldpop = source.oncancel()
            if (shouldpop) popActivity()
            cancelb.onclick = () => { }
        }
        cancelb.value = "X"
        cancelb.classList.add("activity-fs-cancel")
        topbar.appendChild(cancelb)
    }

    screen.append(topbar, source.element)

    return {
        source: source,
        element: screen
    }
}

export function buildSnackbarActivity(source: Activity): ActivityBuild {
    var snackbar = document.createElement("div")
    snackbar.classList.add("activity", "activity-active", "activity-snackbar")
    source.element.classList.add("activity-content")


    setTimeout(() => {
        removePatialActivity(source)
    }, source.snackbarTimeout || 5000)

    snackbar.append(source.element)
    return {
        source: source,
        element: snackbar
    }
}


export function pushErrorSnackbar(message: string) {
    var errel = document.createElement("div")
    var errtext = document.createElement("p")
    errtext.innerHTML = message
    errel.appendChild(errtext)
    errel.classList.add("error-snackbar-el")
    pushActivity({
        element: errel,
        name: "error",
        title: "Error",
        type: "snackbar"
    })
}