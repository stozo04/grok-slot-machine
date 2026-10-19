
import {create} from "zustand"; import {spin,evaluate,type Win} from "../engine/engine"; import type {SymbolId} from "../engine/config";
export type Phase="IDLE"|"SPINNING"|"SETTLED";
export interface HistoryEntry{time:string; bet:number; win:number; grid:SymbolId[][]; wins:Win[]}
interface State{ credits:number; denom:number; mult:number; lastWin:number; totalWon:number; totalBet:number; spinning:boolean; grid:SymbolId[][]; wins:Win[]; history:HistoryEntry[]; message:string; muted:boolean; volume:number; showPaytable:boolean; showDiag:boolean;
 deposit:(amt:number)=>void; setDenom:(n:number)=>void; setMult:(n:number)=>void; doSpin:()=>void; settle:()=>void; cashOut:()=>number; toggleMute:()=>void; setVolume:(n:number)=>void; setShowPaytable:(b:boolean)=>void; setShowDiag:(b:boolean)=>void; }
const saved=(()=>{try{return JSON.parse(localStorage.getItem("neural-jackpot")||"null")}catch{return null}})();
let pending:{grid:SymbolId[][],wins:Win[],bet:number,winAmt:number}|null=null;
export const useStore=create<State>((set,get)=>({
 credits:saved?.credits??0, denom:1, mult:1, lastWin:0, totalWon:saved?.totalWon??0, totalBet:saved?.totalBet??0, spinning:false,
 grid:[["GROK","CHATGPT","GEMINI"],["CHATGPT","MUSE","GROK"],["GEMINI","ANTHROPIC","CHATGPT"],["MUSE","GROK","ANTHROPIC"],["GROK","GEMINI","MUSE"]], wins:[], history:saved?.history??[], message:"Deposit virtual credits to play. No real money.", muted:false, volume:0.7, showPaytable:false, showDiag:false,
 deposit:(amt)=>{set(s=>({credits:s.credits+amt,message:`Deposited $${amt} in virtual credits.`})); persist(get());},
 setDenom:(n)=>set({denom:n}), setMult:(n)=>set({mult:n}),
 doSpin:()=>{ const s=get(); if(s.spinning) return; const bet=s.denom*s.mult*20; if(s.credits<bet){set({message:"Insufficient credits. Deposit virtual credits to continue."}); return;}
   const result=spin(); const wins=evaluate(result.grid); const winAmt=wins.reduce((a,w)=>a+w.payout*s.denom*s.mult,0);
   pending={grid:result.grid,wins,bet,winAmt}; set({credits:s.credits-bet,totalBet:s.totalBet+bet,spinning:true,wins:[],lastWin:0,message:"Reels spinning… outcome already locked by the probability engine."}); },
 settle:()=>{ if(!pending) return; const p=pending; pending=null; const s=get(); set({grid:p.grid,wins:p.wins,credits:s.credits+p.winAmt,lastWin:p.winAmt,totalWon:s.totalWon+p.winAmt,spinning:false,message:p.winAmt>0?`You won $${p.winAmt.toLocaleString()}!`:"No win this spin.",history:[{time:new Date().toLocaleTimeString(),bet:p.bet,win:p.winAmt,grid:p.grid,wins:p.wins},...s.history].slice(0,20)}); persist(get()); },
 cashOut:()=>{ const s=get(); if(s.spinning) return 0; const amt=s.credits; set({credits:0,lastWin:0,message:"Cashed out. Session saved to history."}); persist(get()); return amt; },
 toggleMute:()=>set(s=>({muted:!s.muted})), setVolume:(n)=>set({volume:n}), setShowPaytable:(b)=>set({showPaytable:b}), setShowDiag:(b)=>set({showDiag:b}),
}));
function persist(s:State){ try{localStorage.setItem("neural-jackpot",JSON.stringify({credits:s.credits,totalWon:s.totalWon,totalBet:s.totalBet,history:s.history}))}catch{} }
export const totalBetOf=(denom:number,mult:number)=>denom*mult*20;
