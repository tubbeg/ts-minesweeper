import * as React from "react"
import { createRoot } from 'react-dom/client'
import { makeWorld, systemUpdate } from "./board"
import { number } from "prop-types";
import { Entity } from "./types";
import { World, With } from "miniplex";
import { queryMinedCells, MineQuery, isInvisible, isMine, queryBoard, isFlagged, isProxy, getProxy } from "./query";
import { posIsEqual } from "./random";
import {Option} from "effect"

type MSEvent =
    | "INSPECT"
    | "FLAG"
type TUpdateState = (ev : MSEvent,x:number,y:number) => void;

type ReactCellType =
    | "?"
    | "💣"
    | "_"
    | "☢"
    | "1"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "ERROR"
    

type ReactWorld = Array<Array<ReactCellType>>

const warningClass = " has-text-warning "
const nothingClass = " has-text-black  "

function cellStateToClass (r: ReactWorld,x:number,y:number){
    let cn = " button "
    if (r != null){
        if (r[y] != null)
        {
            if (r[y][x] != null){
                let i = r[y][x]
                if (i == "_")
                    cn = cn + nothingClass
                if (i == "💣")
                    cn = cn + warningClass
                if (i == "1")
                    cn = cn + warningClass
                if (i == "2")
                    cn = cn + warningClass
                if (i == "3")
                    cn = cn + warningClass
                if (i == "4")
                    cn = cn + warningClass
                if (i == "5")
                    cn = cn + warningClass
                if (i == "6")
                    cn = cn + warningClass
                if (i == "7")
                    cn = cn + warningClass
                if (i == "8")
                    cn = cn + warningClass
                if (i == "?")
                    cn = cn + " has-background-dark "
                else 
                    cn = cn + " has-background-black "
            }
        }
    }
    return cn
}

function cellStateToText (r: ReactWorld,x:number,y:number) : string{
    let cn = "NONE"
    if (r != null){
        if (r[y] != null)
        {
            if (r[y][x] != null)
                return r[y][x]
        }
    }
    return cn
}


function createCellTD (r : ReactWorld, x : number, y : number, cellCb : TUpdateState){
    const msToEvent = (e : React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        let ev : MSEvent = "FLAG"
        if (e.detail == 2)
            ev = "INSPECT"
        cellCb(ev,x,y)
    }
    return (<td key={"uniqueId" + x.toString() + y.toString()} >
            <button onClick={msToEvent} className={cellStateToClass(r,x,y)}>
                {cellStateToText(r,x,y)}
            </button>
        </td>)
}

function createCells (r : ReactWorld, x : number, y : number, cellCb : TUpdateState){
    return Array.from(
        { length: x },
        (_, i) => (createCellTD(r,i,y,cellCb)));    
}

function createRows (r : ReactWorld, x : number, y : number, cb : TUpdateState){
    return Array.from(
        { length: y },
        (_, i) => (
            <tr key={"uniqueId" + i.toString() + y.toString()} >
                {createCells(r,x,i,cb)}
            </tr>
        )
    );    
}

const reactTable = (r : ReactWorld, rows : number, cols : number, cb : TUpdateState) => {
    return (<div>
        <table className="table">
            <tbody>
            {createRows(r,rows, cols, cb)}
            </tbody>
        </table>
    </div>)
}

function proxyToString(nr : number) : ReactCellType{
    console.log("Converting to string", nr)
    let ret : ReactCellType = "ERROR"
    switch (nr){
        case (1): ret = "1"; break;
        case 2: ret = "2" ; break;
        case 3: ret = "3" ; break;
        case 4: ret = "4" ; break;
        case 5: ret = "5" ; break;
        case 6: ret = "6" ; break;
        case 7: ret = "7" ; break;
        case 8: ret = "8" ; break;
        default:
            ret = "ERROR"
    }
    return ret
}


function worldToArr(w : World<Entity>, y: number, board : With<Entity, "size" | "board">){
    let arr : Array<ReactCellType> = []
    for (let j = 0; j < board.size.b; j++)
    {
        arr[j] = "_"
        if (isFlagged(j,y,w))
            arr[j] = "☢"
        if (isMine(j,y,w))
            arr[j] = "💣"
        if (isInvisible(j,y,w))
            arr[j] = "?"
        if (isProxy(j,y,w))
        {
            arr[j] = "ERROR"
            Option.map(getProxy(j,y,w), nr => {
                arr[j] = proxyToString(nr)
            })
        }
    }
    return arr    
}

function worldToReact (w : World<Entity>){
    let arr : ReactWorld = []
    Option.map(queryBoard(w), board => {
        if (board != null)
        {
            for (let i = 0; i < board.size.a; i++)
                arr[i] = worldToArr(w, i, board)
        }
    })
    return arr
}

const defaultDifficulty = 30

const defaultPos = {x: 0 , y: 0}

export default function MyApp() {
    const [a,b] = [10,10]
    const d = defaultDifficulty
    const [gameState, setGameState]  = React.useState({hasStarted: false})
    const [state, setState]  = React.useState({world: makeWorld(defaultPos,d,a,b)})
    const u = (ev : MSEvent, x: number,y: number) => {
        let w = state.world
        if (!(gameState.hasStarted) && (ev == "INSPECT")){
            w = makeWorld({x: x,y:y}, d, a,b)
            setState((s) => {return {world: (systemUpdate(x,y,w))}})
            setGameState((s) => {return {hasStarted:true}})
        }
        if (gameState.hasStarted)
        {
            const updatedWorld = systemUpdate(x,y,w)
            console.log(updatedWorld)
            setState((s) => {return {world: updatedWorld}})
        }
    }
    const restart = () => {
        setGameState((s) => {return {hasStarted:false}})
        const w = {world: makeWorld(defaultPos,d,a,b)}
        setState((s) => {return w})
    }
    return (
        <div className="centerDiv">
        <h1 className="box h2 has-text-primary"> Minesweeper</h1>
        <h1 className="box">Instructions: Click on a cell to flag it. Double click to inspect!</h1>
        <div className="box"><button onClick={(_) => {restart()}} className="button">Restart</button></div>
        {reactTable(worldToReact(state.world),a,b,u)}
        </div>
    )
}
