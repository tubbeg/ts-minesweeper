import { PositionComp, Entity } from "./types";
import { Option } from "effect";
import { queryBoard } from "./query";
import { World } from "miniplex";
import { positive } from "effect/Schema";

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

//there is loads of potential here for fun bugs :)
function getRandomUniquePosition (x:number,y:number, l : Array<PositionComp>){
    const max = x * y
    let p;
    if (max > l.length){
        p = getRandomPosition(x,y)
        while(isNotUnique(p,l)){
            p = getRandomPosition(x,y)
        }
        return Option.some(p)
    }
    return Option.none()
}


function getRandomPositions (init : PositionComp, x:number,y:number, nr : number){
    let l : Array<PositionComp> = []
    let p : Option.Option<PositionComp> = Option.none()
    if (nr > 0){
        while (l.length < (nr - 1)){
            p = getRandomUniquePosition(x,y,l)
            if (Option.isNone(p))
                break;
            else
            {
                if (!(posIsEqual(p.value,init)))
                    l.push(p.value)
            }
        }
    }
    return l
}


export function addRandomMines(init:PositionComp,difficulty: number, w : World<Entity>){
    const bo = queryBoard(w)
    Option.map(bo, board => {
        const [x,y] = [board?.size.a,board?.size.b]
        if (x != null && y != null){
            const pos = getRandomPositions(init,x,y,difficulty)
            pos.forEach(p => {
                w.add({mine: "mine", invisible: "invisible", position: p})
            })
            console.log("a,b", x,y)
            return w
        }
        return w
    })
    return w
}
