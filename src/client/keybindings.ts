import { EventEmitter } from "events"
import { popActivity, activity_stack, Activity, pushActivity } from "./activity"
import { Logger } from "./logger";



const KEY_ACTION_MAP: { [key: string]: string } = {
    "Escape": "escape",
    "KeyS": "save",
    "KeyX": "save-quit",
    "KeyN": "new",
    "Digit1": "select-1",
    "Digit2": "select-2",
    "Digit3": "select-3",
    "Digit4": "select-4",
    "Digit5": "select-5",
}
var counter = 0;

export class Keybindings {
    static keymap: any
    static bindings: { [key: string]: { c: number, stack: number, cb: () => any }[] } = {}
    static disabled = false

    static init() {
        document.onkeydown = ({ code }) => {
            if (this.disabled) return
            if (document.activeElement?.tagName == "INPUT")
                if (document.activeElement?.getAttribute("type") != "button") return
            if (!KEY_ACTION_MAP.hasOwnProperty(code)) return
            var action = KEY_ACTION_MAP[code]
            Logger.log(["keybinding"], `Action: ${action}`)
            if (!this.bindings.hasOwnProperty(action)) return this.slTrain()
            var bs = this.bindings[action]
            if (bs.length < 1) return this.slTrain()
            var b = bs[bs.length - 1]
            if (b.stack != activity_stack.length) return this.slTrain()
            b.cb()
        }
    }
    static slTrain() {
        pushSlTrainActivity()
    }

    static bindGeneric(action: string, callback: () => any): () => any {
        var count = counter += 1
        const unbind = () => {
            Logger.log(["keybinding"], `Unbound ${action} (${count})`)
            this.bindings[action].splice(this.bindings[action].findIndex(e => e.c == count), 1)
        }
        setTimeout(() => {
            Logger.log(["keybinding"], `Bound ${action} (${count})`)
            if (!this.bindings.hasOwnProperty(action)) this.bindings[action] = []
            this.bindings[action].push({
                c: count,
                cb: callback,
                stack: activity_stack.length
            })
        })
        return unbind
    }

    static bindSelection(onselect: (n: number) => any): () => any {
        var unbinders: (() => any)[] = []
        for (let i = 0; i < 5; i++) {
            unbinders.push(this.bindGeneric(`select-${i + 1}`, () => onselect(i)))
        }
        return () => {
            unbinders.forEach(u => u())
        }
    }

    static bindElementClick(element: HTMLElement, action: string): () => any {
        return this.bindGeneric(action, () => {
            element.click()
        })
    }
}

export function pushSlTrainActivity() {
    Keybindings.disabled = true
    var el = document.createElement("div")
    el.id = "sl-train"
    var pre = document.createElement("pre")

    var frame = 0
    var left = window.screen.availWidth - 500
    const update = () => {
        left -= 10
        frame = (frame + 1) % SL_TRAIN_WHEELS.length
        var train = SL_TRAIN + SL_TRAIN_WHEELS[SL_TRAIN_WHEELS.length - frame - 1]
        pre.style.left = left + "px"
        pre.textContent = train
        if (left < -pre.offsetWidth) {
            Keybindings.disabled = false
            popActivity()
        }
    }
    var handle = setInterval(update, 75)

    el.appendChild(pre)
    pushActivity({
        element: el,
        title: "...",
        name: "sl-train",
        type: "fullscreen",
        onpop: () => {
            clearInterval(handle)
        }
    })
}

const SL_TRAIN = `
      ====        ________                ___________ 
  _D _|  |_______/        \\__I_I_____===__|_________| 
   |(_)---  |   H\\________/ |   |        =|___ ___|   
   /     |  |   H  |  |     |   |         ||_| |_||   
  |      |  |   H  |__--------------------| [___] |   
  | ________|___H__/__|_____/[][]~\\_______|       |   
  |/ |   |-----------I_____I [][] []  D   |=======|__ `

const SL_TRAIN_WHEELS = [`
__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__ 
 |/-=|___|=    ||    ||    ||    |_____/~\\___/        
  \\_/      \\O=====O=====O=====O_/      \\_/            
`, `
__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__ 
 |/-=|___|=O=====O=====O=====O   |_____/~\\___/        
  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/            
`, `
__/ =| o |=-O=====O=====O=====O \\ ____Y___________|__ 
 |/-=|___|=    ||    ||    ||    |_____/~\\___/        
  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/            
`, `
__/ =| o |=-~O=====O=====O=====O\\ ____Y___________|__ 
 |/-=|___|=    ||    ||    ||    |_____/~\\___/        
  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/            
`, `
__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__ 
 |/-=|___|=   O=====O=====O=====O|_____/~\\___/        
  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/            
`, `
__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__ 
 |/-=|___|=    ||    ||    ||    |_____/~\\___/        
  \\_/      \\_O=====O=====O=====O/      \\_/            
`]
