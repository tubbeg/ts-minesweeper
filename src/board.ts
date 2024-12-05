import {World, With} from "miniplex"
import {Entity, PositionComp, MatchResult, StateComp} from "./types"
import { isFlagged, isMine, isInvisible, queryBoard, queryFlaggedCells, queryInvisibleCells, queryMinedCells, queryEmptyCells, queryAllCells, queryEmptyVisibleCells, queryEmptyHiddenCells, queryGameState, allMinesAreFlagged, hasVisibleMine, getGameStateEntity, allNonMinesAreVisible } from "./query"
import {addRandomMines, isNeighbour, posIsEqual} from "./random"

type W = World<Entity>

export type MSEvent =
    | "INSPECT"
    | "FLAG"

function isCell(c : With<Entity, "position" | "invisible">) : boolean{
    return (c.empty != null || c.flag != null || c.mine != null)
}

function isNotMine(e : With<Entity, "position" | "invisible">){
    return (e.mine == null)
}

function filterInvisibleNonMinesNeighbours (p : PositionComp,c : Array<With<Entity, "position" | "invisible">>){

    const f = c.filter((e) => {return isNeighbour(e.position, p)})
    return f.filter((e2) => {return isNotMine(e2)})
}

type EntMine = With<Entity, "position" | "mine">[]
type EntInvCell =  With<Entity, "position" | "invisible">



type ProxyInfo =
    | "NONE"
    | {some:number}

function getMineNeighbours(p : PositionComp,  m : With<Entity, "position" | "mine">[]) : number{
    const f = m.filter((e) => {return isNeighbour(p, e.position)})
    return f.length
}

function proxyInfo (n :  EntInvCell, m : EntMine) : ProxyInfo{
    let ret : ProxyInfo = "NONE"
    let nr = getMineNeighbours(n.position, m)
    if (nr > 0)
        ret = {some:nr}
    return ret
}


//RECURSIVE
//NOTE! There's a lot of potential problems that can occur here
//I should be using labels and infinite loop instead of doing
//another function call. But I'm not doing it because I'm lazy :)
function changeVisibility (x:number,y:number,w : W){
    let invis = queryInvisibleCells(w)
    const p  = {x: x, y: y}
    const c = invis.find((e) => {return posIsEqual(e.position, p)})
    const recur = (n : EntInvCell,w : W) => {changeVisibility(n.position.x, n.position.y, w)}
    const filterMines = (world : W) => {return filterInvisibleNonMinesNeighbours(p, queryInvisibleCells(world))}
    if (c != null){
        if (isCell(c)){
            w.removeComponent(c, "invisible")
            if (isNotMine(c)){
                const proxy = proxyInfo(c,queryMinedCells(w))
                if (proxy != "NONE")
                    w.addComponent(c, "proxy",proxy.some)
                else
                    filterMines(w).forEach(n => {recur(n,w)})
            }
        }
    }
    return w
}

function inspectDebug (x:number,y:number,world : W){
    let i = isInvisible(x,y,world)
    console.log("Debug info: ", x,y)
    if (isMine(x,y,world))
        console.log("Cell is a mine")
    if (isFlagged(x,y,world))
        console.log("Cell is flagged")
    if (i == "NONE")
        console.log("Cell is visible")
    else
        console.log("Cell is invisible")
}

function toggleFlagCell (x:number,y:number,w : W){
    const f = isFlagged(x,y,w)
    const i = isInvisible(x,y,w)
    if (f != "NONE")
        w.removeComponent(f, "flag")
    else{
        if (i != "NONE")
            w.addComponent(i.some, "flag", "flagged")
    }
    return w
}


function updateGameState (w : W){
    const s = queryGameState(w)
    if (s != "NONE"){
        if (s.some == "NONE"){
            const se = getGameStateEntity(w)
            if(se != "NONE"){
                if (allMinesAreFlagged(w) && (allNonMinesAreVisible(w)))
                {
                    const mr : MatchResult = "WON"
                    const sc : StateComp = {some: mr}
                    w.removeComponent(se.some,"state")
                    w.addComponent(se.some, "state",sc)
                }
                if (hasVisibleMine(w) )
                {
                    const mr : MatchResult = "LOST"
                    const sc : StateComp = {some: mr}
                    w.removeComponent(se.some,"state")
                    w.addComponent(se.some, "state",sc)
                }
            }
        }
    }
    return w
}

export function systemUpdate (ev : MSEvent, x:number,y:number,world : W){
    inspectDebug(x,y,world)
    let ret = world
    const s = queryGameState(world)
    if (s != "NONE"){
        if (s.some == "NONE"){
            let update
            if (ev == "INSPECT")
                update = changeVisibility(x,y,world)
            else
                update = toggleFlagCell(x,y,world)
            ret = updateGameState(update)
        }
    }
    return ret
}

//I would not recommend running this function at large
//board sizes. Poor optimization
function addEmptyCells (w : W){
    const b = queryBoard(w)
    if (b != "NONE")
    {
        const f = b.size
        for (let i = 0; i < f.a; i++){
            for (let j = 0; j < f.b; j++){
                if (!(isMine(j,i,w)))
                    w.add({empty: "empty", invisible: "invisible", position: {x: j, y: i}})
                    //w.add({empty: "empty",position: {x: j, y: i}})
            }
        }
    }
    return w
}

function addCellEntities (p : PositionComp,difficulty : number,w : W){
    const m = addRandomMines(p,difficulty,w)
    return addEmptyCells(m)
}

function addBoardEntity (x: number, y :number, w : W){
    w.add({board: "board",size: {a: x, b: y}})
    return w
}

function addGameState(w : W){
    w.add({state: "NONE"})
    return w
}

export function makeWorld (initPos : PositionComp, difficulty : number, x: number,y:number) : World
{
    const world = new World<Entity>()
    const addBoard = addBoardEntity(x,y, world)
    const addCells = addCellEntities(initPos,difficulty,addBoard)
    return addGameState(addCells)
}


