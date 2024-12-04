import {World, With} from "miniplex"
import {Option} from "effect"
import { Size } from "fast-check"
import {Entity, PositionComp} from "./types"
import { isFlagged, isMine, isInvisible, queryBoard, queryFlaggedCells, queryInvisibleCells, queryMinedCells, queryEmptyCells, queryAllCells, queryEmptyVisibleCells, queryEmptyHiddenCells, OptCollEmptyPos, EmptyPos } from "./query"
import {addRandomMines, isNeighbour, posIsEqual} from "./random"


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

function changeVisibilityNeighbours
(el : With<Entity, "position" | "invisible">, p : PositionComp, m : EntMine,w : World<Entity>){
    const i = queryInvisibleCells(w)
    if (el.mine == null)
    {
        Option.map(i, iu => {
            const n = filterInvisibleNonMinesNeighbours(p, iu)
            n.forEach((neighbour) => {
                let n = getMineNeighbours(neighbour.position, m)
                if (n > 0)
                    w.addComponent(neighbour, "proxy",n)
                else{
                    const pn = neighbour.position
                    changeVisibility(pn.x, pn.y, w)
                }
            })
        })
    }
}

//RECURSIVE
//NOTE! There's a lot of potential problems that can occur here
//I should be using labels and infinite loop instead of doing
//another function call. But I'm not doing it because I'm lazy :)
function changeVisibility (x:number,y:number,world : World<Entity>){
    const invis = queryInvisibleCells(world)
    const p  = {x: x, y: y}

    Option.map(queryMinedCells(world), mined => {
        Option.map(invis, inv => {
            const el = inv.find((e) => {return posIsEqual(e.position, p)})
            if (el != null)
            {
                if (isCell(el)){
                    world.removeComponent(el, "invisible")
                    const invisUpdate = queryInvisibleCells(world)
                    changeVisibilityNeighbours(el, p, mined, world)
                    }
                }
            })
    })
    return world
}

function getMineNeighbours(p : PositionComp,  m : With<Entity, "position" | "mine">[]) : number{
    const f = m.filter((e) => {return isNeighbour(p, e.position)})
    return f.length
}

function createProxies (w : World<Entity>){
    console.log("Creating proxies")
    const emptyCells = queryEmptyVisibleCells(w)
    console.log(emptyCells, "EMPTY CELLS")
    console.log(emptyCells.length, "EMPTY CELLS LEN")
    Option.map(queryMinedCells(w), mined => {
        emptyCells.forEach((e) => {
            console.log("Adding proxies")
            let n = getMineNeighbours(e.position, mined)
            console.log("Neighbours: ", n)
            if (n > 0)
                w.addComponent(e, "proxy",n)
        })
    })
    return w
}


function inspectDebug (x:number,y:number,world : World<Entity>){
    console.log("Inspecting: ", x,y)
    if (isMine(x,y,world))
        console.log("Cell is a mine")
    if (isFlagged(x,y,world))
        console.log("Cell is flagged")
    if (!(isInvisible(x,y,world)))
        console.log("Cell is visible")
    else
        console.log("Cell is invisible")
}

export function systemUpdate (x:number,y:number,world : World<Entity>){
    inspectDebug(x,y,world)
    const v = changeVisibility(x,y,world)
    return createProxies(v)
}

//I would not recommend running this function at large
//board sizes. Poor optimization
function addEmptyCells (w : World<Entity>){
    Option.map(queryBoard(w), board => {
        if (board != null)
        {
            if (board.size != null)
            {
                const f = board.size
                for (let i = 0; i < f.a; i++){
                    for (let j = 0; j < f.b; j++){
                        if (!(isMine(j,i,w)))
                            w.add({empty: "empty", invisible: "invisible", position: {x: j, y: i}})
                            //w.add({empty: "empty",position: {x: j, y: i}})
                    }
                }
            }
        }
    })
    return w
}

function addCellEntities (p : PositionComp,difficulty : number,w : World<Entity>){
    const m = addRandomMines(p,difficulty,w)
    return addEmptyCells(m)
}

function addBoardEntity (x: number, y :number, w : World<Entity>){
    w.add({board: "board",size: {a: x, b: y}})
    return w
}

export function makeWorld (initPos : PositionComp, difficulty : number, x: number,y:number) : World
{
    const world = new World<Entity>()
    const addBoard = addBoardEntity(x,y, world)
    return addCellEntities(initPos,difficulty,addBoard)
}


