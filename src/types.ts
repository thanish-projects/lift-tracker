export type Unit='kg'|'lb'
export interface Ex{id:string;name:string;muscle:string;sets:number;reps:string}
export interface Day{id:string;name:string;weekday:number;exercises:Ex[]}
export interface SetLog{id:string;w:number;r:number;rpe?:number;done:boolean}
export interface ExLog{id:string;name:string;muscle:string;skipped?:boolean;sets:SetLog[]}
export interface Session{id:string;name:string;date:string;start:number;end?:number;backfill?:boolean;exercises:ExLog[]}
export interface State{v:1;prefs:{name:string;unit:Unit;rest:number;goal:number};split:Day[];active:Session|null;history:Session[]}
