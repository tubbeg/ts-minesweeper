import * as React from "react"
import { createRoot } from 'react-dom/client'
import MyApp from "./game"

function runApp (){
    const rootEl = document.getElementById("divRoot")
    if (rootEl != null)
        createRoot(rootEl).render(<MyApp/>)
    else
        console.error("problem loading react application")
}

runApp();