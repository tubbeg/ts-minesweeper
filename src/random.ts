import { PositionComp, Entity } from "./types";
import { queryBoard } from "./query";
import { World } from "miniplex";

export function isNeighbour(p1 : PositionComp, p2 : PositionComp) : boolean{
    let xn1a = {x: p1.x - 1, y: p1.y}
    let xn1b = {x: p1.x - 1, y: p1.y + 1}
    let xn1c = {x: p1.x - 1, y: p1.y - 1}
    let xp1a = {x: p1.x + 1, y: p1.y}
    let xp1b = {x: p1.x + 1, y: p1.y + 1}
    let xp1c = {x: p1.x + 1, y: p1.y - 1}
    let yp1 = {x: p1.x, y: p1.y + 1}
    let yn1 = {x: p1.x, y: p1.y - 1}
    if (posIsEqual(xn1a,p2))
        return true
    if (posIsEqual(xn1b,p2))
        return true
    if (posIsEqual(xn1c,p2))
        return true
    if (posIsEqual(xp1a,p2))
        return true
    if (posIsEqual(xp1b,p2))
        return true
    if (posIsEqual(xp1c,p2))
        return true
    if (posIsEqual(yp1,p2))
        return true
    if (posIsEqual(yn1,p2))
        return true
    return false
}

function getRand(max:number) {
    return Math.floor(Math.random() * max);
}

function getRandomPosition(x:number,y:number){
    const [a,b] = [getRand(x), getRand(y)]
    return {x: a, y: b}
}

export function posIsEqual(p1 : PositionComp,p2 : PositionComp){
    return (p1.x == p2.x && p1.y == p2.y)
}

function isNotUnique (p : PositionComp, l : Array<PositionComp>){
    const f = l.filter((e) => {return posIsEqual(e,p)})
    return (f.length > 0)
}

type PositionOption =
    | "NONE"
    | PositionComp

//there is loads of potential here for fun bugs :)
function getRandomUniquePosition (x:number,y:number, l : Array<PositionComp>){
    const max = x * y
    let p
    let ret : PositionOption = "NONE"
    if (max > l.length){
        p = getRandomPosition(x,y)
        while(isNotUnique(p,l)){
            p = getRandomPosition(x,y)
        }
        ret = p
    }
    return ret
}

function isOkMine(init:PositionComp, compare: PositionComp){
    const n  = isNeighbour(init, compare)
    const e = posIsEqual(init,compare)
    return ((!n) && (!e))
}

function getRandomPositions (init : PositionComp, x:number,y:number, nr : number){
    let l : Array<PositionComp> = []
    let p : PositionOption = "NONE"
    if (nr > 0){
        while (l.length < (nr - 8)){
            p = getRandomUniquePosition(x,y,l)
            if (p == "NONE")
                break;
            else
            {
                if (isOkMine(p,init))
                    l.push(p)
            }
        }
    }
    return l
}


export function addRandomMines(init:PositionComp,difficulty: number, w : World<Entity>){
    const bo = queryBoard(w)
    if (bo != "NONE"){
        const [x,y] = [bo.size.a,bo.size.b]
        if (x != null && y != null){
            const pos = getRandomPositions(init,x,y,difficulty)
            pos.forEach(p => {
                w.add({mine: "mine", invisible: "invisible", position: p})
            })
            console.log("a,b", x,y)
        }
    }
    return w
}
