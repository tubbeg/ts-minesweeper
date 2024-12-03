import * as React from "react"
import { createRoot } from 'react-dom/client'
import { makeBoard } from "./board"


function MyButton() {
    return (
      <button>Click here</button>
    )
  }


type Stuff =
  | {some: number}
  | "stuff"

export default function MyApp() {
    const stuff : Stuff = {some: 1337}
    const myBool = true
    const myBoard = makeBoard(5,5)
    return (
        <div>
            {stuff.some}
        <h1>Minesweeper</h1>
        <MyButton />
        </div>
    )
}

function runApp (){
    const rootEl = document.getElementById("divRoot")
    if (rootEl != null)
        createRoot(rootEl).render(<MyApp/>)
    else
        console.error("problem loading react application")
}

runApp();