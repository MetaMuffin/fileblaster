import { Activity } from "../activity";



export function collectionMainActivity(colname: string): Activity {
    var div = document.createElement("div")
    

    return {
        title: colname,
        element: div,
        name: "collection-main",
        oncancel: () => true,
        type: "fullscreen"
    }
}