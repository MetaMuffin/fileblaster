import { pushActivity, popActivity } from "./activity"
import { WS, createWS } from "./websocket"
import { Scheme } from "../scheme";
import { buildCollectionSelectorActivity as collectionSelectorActivity } from "./activities/collectionSelector";
import { Logger } from "./logger";
import { getAllCollectionNames } from "./helper";
import { collectionMainActivity } from "./activities/collectionMain";
import { devInit } from "./dev";


async function init() {
    document.body.classList.add("theme-light")
    State.ws = await createWS()
    devInit()
    pushActivity(collectionSelectorActivity((sel) => {
        pushActivity(collectionMainActivity(sel))
        return false
    }))
}

export class State {
    public static ws: WS;
    public static scheme: Scheme;
}

window.onload = init

