
export type  PositionComp = {x: number, y: number}
//IMO the unions could be better in typescript
//F#/Haskell has a massive advantage, and with much better
//pattern matching (which does not exist in typescript!) 
export type  BoardComp = "board"
export type  MineComp = "mine"
export type  EmptyComp = "empty"
export type  FlagComp = "flagged" 
export type  SizeComp = {a: number, b: number}
export type  InvisibleComp = "invisible"
export type ProxyComp = number
export type MatchResult =
  | "WON"
  | "LOST"
export type StateComp =
  | "NONE"
  | {some:MatchResult}

export type  Entity = {
    position?: PositionComp
    flag?: FlagComp
    board?: BoardComp
    size?: SizeComp
    mine?: MineComp 
    empty?: EmptyComp 
    invisible?: InvisibleComp
    proxy?: ProxyComp
    state?: StateComp
  }
  