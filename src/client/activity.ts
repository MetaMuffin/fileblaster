import { EventEmitter } from "events"
import { setDisabledRecursive } from "./helper"
import { Keybindings } from "./keybindings"
import { Logger } from "./logger"


export interface Activity {
    element: HTMLElement
    name: string,
    title?: string,
    type?: "floating" | "fullscreen" | "snackbar" | "sheet",
    oncancel?: () => boolean,
    onpop?: () => any,
    snackbarTimeout?: number,
    events?: EventEmitter,
    snackbarTheme?: string,
    _id?: number
}

export interface ActivityBuild {
    source: Activity,
    element: HTMLElement,
    unbind?: () => any,
}

export var activity_stack: ActivityBuild[] = []
var activity_partial_stack: ActivityBuild[] = []

const get_activity_root = () => document.getElementById("activity-root")

var activityEvents = new EventEmitter()

export function pushActivity(activity: Activity, onpop: () => any = () => { }) {
    Logger.log(["activity"], `Pushed ${activity.type || "fullscreen (defaulted)"} activity: ${activity.name}`)
    var build;
    if (activity.type == "snackbar") build = buildSnackbarActivity(activity)
    else if (activity.type == "sheet") build = buildSheetActivity(activity)
    else build = buildFullscreenActivity(activity)

    if (activity.type == "snackbar" || activity.type == "floating") activity_partial_stack.push(build)
    else activity_stack.push(build)
    get_activity_root()?.appendChild(build.element)

    activityEvents.once(`pop-${activity_stack.length - 1}`, () => {
        onpop()
    })
}

export function popActivity() {
    var s = activity_stack.pop()
    activityEvents.emit(`pop-${activity_stack.length}`)
    if (s) {
        if (s.source.onpop) s.source.onpop()
        if (s.unbind) s.unbind()
        Logger.log(["activity"], `Popped activity: ${s.source.name}`)
        s.element.classList.remove("activity-active")
        s.element.classList.add("activity-inactive")
        setDisabledRecursive(s.element, true);
        setTimeout(() => {
            if (s) get_activity_root()?.removeChild(s.element)
        }, 1000)
    } else {
        throw new Error("Nothing left to pop!");
    }
}

export function popPatialActivity(a: Activity) {
    Logger.log(["activity"], `Popped partial overlay activity: ${a.name}`)
    var index = activity_partial_stack.findIndex(e => e.source.element == a.element)
    if (index == -1) return Logger.log(["warn", "activity"], "Partial Overlay not found to remove it.")
    var [par] = activity_partial_stack.splice(index)
    par.element.classList.remove("activity-active")
    par.element.classList.add("activity-inactive")
    if (a.onpop) a.onpop()
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
    var unbind;
    if (source.oncancel) {
        var cancelb = document.createElement("input")
        cancelb.type = "button"
        cancelb.onclick = () => {
            if (!source.oncancel) return
            var shouldpop = source.oncancel()
            if (!shouldpop) return
            popActivity()
            cancelb.onclick = () => { }
        }
        cancelb.value = "×"
        cancelb.classList.add("activity-fs-cancel")
        unbind = Keybindings.bindElementClick(cancelb, "escape")
        topbar.appendChild(cancelb)
    }

    screen.appendChild(topbar)
    if (source.events) screen.appendChild(buildLoadingBar(source.events))
    screen.appendChild(source.element)

    return {
        source: source,
        element: screen,
        unbind,
    }
}

export function buildLoadingBar(events: EventEmitter): HTMLElement {
    var el = document.createElement("div")
    el.classList.add("loading-bar-inactive", "loading-bar")
    events.on("loading-state", (state) => {
        if (state) {
            el.classList.add("loading-bar-active")
            el.classList.remove("loading-bar-inactive")
        } else {
            el.classList.remove("loading-bar-active")
            el.classList.add("loading-bar-inactive")
        }
    })
    return el
}

export function buildSnackbarActivity(source: Activity): ActivityBuild {
    var snackbar = document.createElement("div")
    snackbar.classList.add("activity", "activity-active", "activity-snackbar")
    if (source.snackbarTheme) snackbar.classList.add(`snackbar-${source.snackbarTheme}`)
    source.element.classList.add("activity-content")


    if (source.snackbarTimeout) setTimeout(() => {
        popPatialActivity(source)
    }, source.snackbarTimeout)

    snackbar.append(source.element)
    return {
        source: source,
        element: snackbar
    }
}

export function buildSheetActivity(source: Activity): ActivityBuild {
    var el = document.createElement("div")
    el.classList.add("activity","activity-sheet","activity-active")
    source.element.classList.add("activity-content")
    el.appendChild(source.element)
    return {
        source,
        element: el
    }
}

export function pushErrorSnackbar(message: string, poptimer: boolean) {
    var errel = document.createElement("div")
    var errtext = document.createElement("p")
    errtext.innerHTML = message
    errel.appendChild(errtext)
    errel.classList.add("error-snackbar-el")
    pushActivity({
        element: errel,
        name: "error",
        title: "Error",
        type: "snackbar",
        snackbarTheme: "danger",
        snackbarTimeout: poptimer ? 3000 : undefined,
    })
}

export function pushErrorObjectSnackbar(err: { title: string, data: any }, poptimer: boolean) {
    var errel = document.createElement("div")
    var errtext = document.createElement("p")
    errtext.innerHTML = `<strong>${err.title}</strong><br>${err.data}`
    errel.appendChild(errtext)
    errel.classList.add("error-snackbar-el")
    pushActivity({
        element: errel,
        name: "error",
        title: "Error",
        type: "snackbar",
        snackbarTheme: "danger",
        snackbarTimeout: poptimer ? 3000 : undefined,
    })
}

export type SelectButton = { value: string, classes?: Array<string>, keybind?: string, onclick: () => any }
export function selectButtonActivity(text: string, buttons: SelectButton[]): Activity {
    var el = document.createElement("div")
    el.classList.add("select-button-sheet")

    var p = document.createElement("p")
    p.textContent = text;

    var ul = document.createElement("ul")
    for (const btn of buttons) {
        var li = document.createElement("li")
        var b = document.createElement("input")
        b.type = "button"
        b.classList.add("btn")
        if (btn.classes) b.classList.add(...btn.classes)
        b.value = btn.value
        b.onclick = btn.onclick

        li.appendChild(b)
        ul.appendChild(li)
    }

    el.append(p,ul)

    return {
        element: el,
        name: "select-button",
        type: "sheet",
        oncancel: () => true,
    }
}