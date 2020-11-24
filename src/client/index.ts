import { pushActivity, popActivity } from "./activity"
import { WS, createWS } from "./websocket"
import { Scheme } from "../scheme";
import { buildCollectionSelectorActivity as collectionSelectorActivity } from "./activities/collectionSelector";
import { Logger } from "./logger";
import { getAllCollectionNames } from "./helper";
import { collectionMainActivity } from "./activities/collectionMain";


async function init() {
    State.ws = await createWS()    
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

//@ts-ignore
window.b = getAllCollectionNames