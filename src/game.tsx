import * as React from "react"
import { createRoot } from 'react-dom/client'
import { makeWorld, systemUpdate } from "./board"
import { number } from "prop-types";


type TUpdateState = (x:number,y:number) => void;


function createCells (x : number, y : number, cellCb : TUpdateState){
    return Array.from(
        { length: x },
        (_, i) => (
            <td key={"uniqueId" + i.toString() + y.toString()} >
                <button onClick={(_) => {cellCb(i,y)}} className="button">{i.toString() + y.toString()}</button>
            </td>
        )
    );    
}


function createRows (x : number, y : number, cb : TUpdateState){
    return Array.from(
        { length: y },
        (_, i) => (
            <tr key={"uniqueId" + i.toString() + y.toString()} >
                {createCells(x,i,cb)}
            </tr>
        )
    );    
}

const reactTable = (rows : number, cols : number, cb : TUpdateState) => {
    return (<div>
        <table className="table">
            <tbody>
            {createRows(rows, cols, cb)}
            </tbody>
        </table>
    </div>)
}

function updateStateFunction (x:number,y:number){
    console.log(x,y)
}

export default function MyApp() {
    const myBool = true
    const [world, setWorld]  = React.useState(makeWorld(10,10))
    const u = (x: number,y: number) => {
        const updatedWorld = systemUpdate(x,y,world)
        console.log(updatedWorld)
        setWorld(updatedWorld)
    }
    return (
        <div className="centerDiv">
        <h1 className="box h2 has-text-primary"> Minesweeper</h1>
        <div className="box"><button className="button">Restart</button></div>
        {reactTable(8,8,u)}
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