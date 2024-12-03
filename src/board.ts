import {World} from "miniplex"
import {Option} from "effect"


type PositionComp = {x: number, y: number}
type BoardComp = "board"
type MineComp = "mine"
type EmptyComp = "empty"
type FlagComp = "flagged" 
type SizeComp = {size: {x: number, y: number}}

type Entity = {
    position?: PositionComp
    flag?: FlagComp
    board?: BoardComp
    mine?: MineComp 
    empty?: EmptyComp 
  }

export function systemUpdate (x:number,y:number,world : World<Entity>){

    return world;
}

function queryEmptyCells (w : World<Entity>){
    const result = w.with("position", "empty")
    if (result.entities.length > 0)
        return Option.some(result.entities)
    return Option.none()
}

function queryMinedCells (w : World<Entity>){
    const result = w.with("position", "mine")
    if (result.entities.length > 0)
        return Option.some(result.entities)
    return Option.none()
}

function queryFlaggedCells (w : World<Entity>){
    const result = w.with("position", "flag")
    if (result.entities.length > 0)
        return Option.some(result.entities)
    return Option.none()
}

export function getXYCellState (x: number,y : number, w : World<Entity>){

}

function addCellEntities (w : World<Entity>){
    return w
}

function addBoardEntity (x: number, y :number, w : World<Entity>){
    w.add({board: "board",size: {x: x, y: y}})
    return w
}

export function makeWorld (x: number,y:number) : World
{
    const world = new World<Entity>()
    const addBoard = addBoardEntity(x,y, world)
    return addCellEntities(addBoard)
}


