

export interface Activity {
    element: HTMLElement
    name: string,
    title: string,
    type?: "floating" | "fullscreen",
    oncancel?: () => boolean
}

export interface ActivityBuild {
    source: Activity,
    element: HTMLElement
}

var activity_stack:ActivityBuild[] = []

const get_activity_root = () => document.getElementById("activity-root")

export function pushActivity(activity: Activity) {
    var build = buildScreen(activity)
    activity_stack.push(build)
    get_activity_root()?.appendChild(build.element)
}

export function popActivity() {
    var s = activity_stack.pop()
    if (s) {
        s.element.classList.remove("activity-active")
        s.element.classList.add("activity-inactive")
        setTimeout(() => {
            if (s) get_activity_root()?.removeChild(s.element)
        }, 1000)
    } else {
        throw new Error("Nothing left to pop!");
    }
}

export function buildScreen(source: Activity): ActivityBuild {
    var screen = document.createElement("div")
    screen.classList.add("activity")
    screen.classList.add("activity-active")
    screen.classList.add(`activity-background-${activity_stack.length}`)

    var topbar = document.createElement("div")
    topbar.classList.add("activity-topbar")
    var title = document.createElement("h2")
    title.textContent = source.title
    topbar.appendChild(title)
    if (source.oncancel) {
        var cancelb = document.createElement("input")
        cancelb.type = "button"
        cancelb.onclick = () => {
            if (!source.oncancel) return
            var shouldpop = source.oncancel()
            if (shouldpop) popActivity()
            cancelb.onclick = () => {}
        }
        cancelb.value = "X"
        cancelb.classList.add("activity-cancel")
        topbar.appendChild(cancelb)
    }

    screen.append(topbar,source.element)
    
    return {
        source: source,
        element: screen
    }
}