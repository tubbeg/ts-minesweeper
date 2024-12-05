import { Entity, PositionComp, StateComp } from "./types"
import {World, With, Query} from "miniplex"
import { posIsEqual } from "./random"


type W = World<Entity>

//I suspect that running these functions each
//time might come at a performance penalty

//however that's not really important since
//the UI only needs to update on user events (mouse clicking)
//which is quite slow

export function queryAllCells (w : W){
    const result = w.with("position")
    return result.entities
}

export function queryEmptyCells (w : W){
    const result = w.with("position", "empty")
    return result.entities

}

export type StateCompOption =
    | "NONE"
    | {some: StateComp}

export function queryGameState (w : W) : StateCompOption {
    const result = w.with("state")
    let ret : StateCompOption = "NONE"
    if (result.entities.length > 0)
    {
        if (result.entities[0] != null)
            ret = {some: result.entities[0].state}
    }
    return ret
}


export type GameStateEntityOption =
    | "NONE"
    | {some:With<Entity, "state">}


export function getGameStateEntity (w : W){

    let ret : GameStateEntityOption = "NONE"
    const result = w.with("state")
    if (result.entities.length > 0)
    {
        const s = result.entities[0]
        if (s != null)
            ret = {some:s}
    }
    return ret
}

type MineEntities = Array<With<Entity, "position" | "mine">>

export function queryMinedCells (w : W) : MineEntities{
    const result = w.with("position", "mine")
    return result.entities
}

export function queryFlaggedCells (w : W){
    const result = w.with("position", "flag")
    return result.entities
}

export function queryInvisibleCells (w : W){
    const result = w.with("position", "invisible")
    return result.entities
}

export function queryProxyCells (w : W){
    const result = w.with("position", "proxy")
    return result.entities
}


export function queryEmptyVisibleCells (w : W) {
    const f  = queryEmptyCells(w).filter((e) => {
        if (e.invisible != null)
            return false
        return true
    })
    return f
}

export function queryEmptyHiddenCells (w : W)  {
    const f  = queryEmptyCells(w).filter((e) => {
        if (e.invisible != null)
            return true
        return false
    })
    return f
}

export type BoardOption =
    | "NONE"
    |  With<Entity, "board" | "size">

export function queryBoard  (w : W){
    const result = w.with("size", "board")
    let ret : BoardOption = "NONE"
    if (result.entities.length > 0){
        const firstEl = result.entities[0]
        if (firstEl != null)
            ret = firstEl
    }
    return ret
}

type EntPos = {position?: PositionComp}

    
export function isMine (x: number,y : number, w : W) : boolean{
    const m = queryMinedCells(w)
    let ret = false
    const p = {x: x, y: y}
    const f = m.filter((e) => {return posIsEqual(p, e.position)})
    if (f.length > 0)
        ret = true
    return ret
}

export type FlagOption =
    | "NONE"
    | With<Entity, "position" | "flag">

export function isFlagged (x: number,y : number, w : W) : FlagOption{
    const m = queryFlaggedCells(w)
    let ret : FlagOption = "NONE"
    const p = {x: x, y: y}
    const f = m.find((e) => {return posIsEqual(p, e.position)})
    if (f != null)
        ret = f
    return ret
}

type InvisibleOption =
    | "NONE"
    | {some: With<Entity, "position" | "invisible">}

export function isInvisible (x: number,y : number, w : W) : InvisibleOption{
    const m = queryInvisibleCells(w)
    let ret : InvisibleOption = "NONE"
    const p = {x: x, y: y}
    const f = m.find((e) => {return posIsEqual(p, e.position)})
    if (f != null)
        ret = {some:f}
    return ret
}

export function isProxy (x: number,y : number, w : W) : boolean{
    const m = queryProxyCells(w)
    let ret = false
    const p = {x: x, y: y}
    const f = m.find((e) => {return posIsEqual(p, e.position)})
    if (f != null)
        ret = true
    return ret
}

type ProxyOption =
    | "NONE"
    | number

export function getProxy (x: number,y : number, w : W) : ProxyOption{
    const p = queryProxyCells(w)
    let ret : number = -1
    const pos = {x: x, y: y}
    const f = p.find((e) => {return posIsEqual(e.position, pos)})
    if (f != null)
        ret = f.proxy
    return ret
}

export function hasVisibleMine(w : W){
    const m = queryMinedCells(w)
    const f = m.filter((mine) => {return (mine.invisible == null)})
    return (f.length > 0)
}

export function allMinesAreFlagged(w : W){
    const m = queryMinedCells(w)
    const f = m.filter((mine) => {return (mine.flag != null)})
    return (f.length == m.length)
}

export function allNonMinesAreVisible(w : W){
    const m = queryInvisibleCells(w)
    const f = m.filter((i) => {return (i.mine == null)})
    return (f.length == 0)
}
