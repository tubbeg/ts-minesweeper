import { Entity, PositionComp } from "./types"
import {World, With, Query} from "miniplex"
import { Option } from "effect"
import { posIsEqual } from "./random"

//I suspect that running these functions each
//time might come at a performance penalty

//however that's not really important since
//the UI only needs to update on user events (mouse clicking)
//which is quite slow

export function queryAllCells (w : World<Entity>){
    const result = w.with("position")
    if (result.entities.length > 0)
        return Option.some(result.entities)
    return Option.none()
}

export function queryEmptyCells (w : World<Entity>){
    const result = w.with("position", "empty")
    if (result.entities.length > 0)
        return Option.some(result.entities)
    return Option.none()
}

export type MineQuery = Query<With<Entity, "position" | "mine">>

export function queryMinedCells (w : World<Entity>){
    const result = w.with("position", "mine")
    if (result.entities.length > 0)
        return Option.some(result.entities)
    return Option.none()
}

export function queryFlaggedCells (w : World<Entity>){
    const result = w.with("position", "flag")
    if (result.entities.length > 0)
        return Option.some(result.entities)
    return Option.none()
}

export function queryInvisibleCells (w : World<Entity>){
    const result = w.with("position", "invisible")
    if (result.entities.length > 0)
        return Option.some(result.entities)
    return Option.none()
}

export function queryProxyCells (w : World<Entity>){
    const result = w.with("position", "proxy")
    if (result.entities.length > 0)
        return Option.some(result.entities)
    return Option.none()
}

export type EmptyPos = With<Entity, "position" | "empty">
export type OptCollEmptyPos = Option.Option<Array<EmptyPos>>

export function queryEmptyVisibleCells (w : World<Entity>) : Array<EmptyPos> {
    const e = queryEmptyCells(w)
    let arr  : Array<EmptyPos> = []
    Option.map(e, empties => {
        const f  = empties.filter((e) => {
            if (e.invisible != null)
                return false
            return true
        })
        console.log("EMPTY CELLS LEN", empties.length)
        console.log("RESULT LEN", f.length)
        arr = f
    })
    return arr
}

export function queryEmptyHiddenCells (w : World<Entity>) : OptCollEmptyPos {
    const e = queryEmptyCells(w)
    Option.map(e, empties => {
        const f  = empties.filter((e) => {
            if (e.invisible != null)
                return true
            return false
        })
        return Option.some(f)
    })
    return Option.none()
}

export function queryBoard  (w : World<Entity>){
    const result = w.with("size", "board")
    if (result.entities.length > 0){
        const firstEl = result.entities[0]
        return Option.some(firstEl)
    }
    return Option.none()
}

type EntPos = {position?: PositionComp}

function comparePos (x:number, y:number,m : Array<EntPos>) : boolean{
    let ret = false
    let el
    for (let i = 0; i < m.length; i++) {
        el = m[i]
        if (el != null)
        {            
            if (el.position != null)
            {
                if (posIsEqual(el.position, {x: x, y: y}))
                {
                    ret = true
                    break;
                }
            }
        }
    }   
    return ret
}
    
export function isMine (x: number,y : number, w : World<Entity>) : boolean{
    const m = queryMinedCells(w)
    let ret = false
    Option.map(m, coll => {ret = comparePos(x,y,coll)})
    return ret
}

export function isFlagged (x: number,y : number, w : World<Entity>) : boolean{
    const m = queryFlaggedCells(w)
    let ret = false
    Option.map(m, coll => {ret = comparePos(x,y,coll)})
    return ret
}

export function isInvisible (x: number,y : number, w : World<Entity>) : boolean{
    const m = queryInvisibleCells(w)
    let ret = false
    Option.map(m, coll => {ret = comparePos(x,y,coll)})
    return ret
}

export function isProxy (x: number,y : number, w : World<Entity>) : boolean{
    const m = queryProxyCells(w)
    let ret = false
    Option.map(m, coll => {ret = comparePos(x,y,coll)})
    return ret
}

export function getProxy (x: number,y : number, w : World<Entity>) : Option.Option<number>{
    const p = queryProxyCells(w)
    let ret : Option.Option<number> = Option.none()
    Option.map(p, proxies => {
        const f = proxies.find((e) => {
            return (posIsEqual(e.position, {x: x, y: y}))
        })
        if (f != null)
            ret = Option.some(f.proxy)
    })
    return ret
}


