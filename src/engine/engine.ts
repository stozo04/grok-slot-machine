
import {PAYLINES,PAYTABLE,WEIGHTS,SYMBOLS,type SymbolId} from "./config";
export type Grid = SymbolId[][]; // [reel][row]
// deterministic PRNG for tests
export function mulberry32(seed:number){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
export function cryptoRandom(){const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]/4294967296}
function shuffledStrip(reel:number, rng:()=>number): SymbolId[]{
  const bag:SymbolId[]=[]; for(const s of SYMBOLS) for(let i=0;i<WEIGHTS[s];i++) bag.push(s);
  // different deterministic ordering per reel
  const r=mulberry32(1234+reel*999); const arr=[...bag];
  for(let i=arr.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]} return arr;
}
export const REEL_STRIPS: SymbolId[][]=[0,1,2,3,4].map(i=>shuffledStrip(i,cryptoRandom));
export interface SpinResult{grid:Grid; stops:number[]}
export function spin(rng:()=>number=cryptoRandom):SpinResult{
  const stops=REEL_STRIPS.map(strip=>Math.floor(rng()*strip.length));
  const grid=REEL_STRIPS.map((strip,reel)=>[0,1,2].map(row=>strip[(stops[reel]+row)%strip.length]));
  return {grid,stops};
}
export interface Win{line:number; symbol:SymbolId; count:number; payout:number} // payout in bet-per-line multipliers
export function evaluate(grid:Grid):Win[]{
  const wins:Win[]=[];
  PAYLINES.forEach((line,idx)=>{
    const first=grid[0][line[0]]; if(first==="BLANK") return;
    let count=1; for(let reel=1;reel<5;reel++){ if(grid[reel][line[reel]]===first) count++; else break; }
    if(count>=3){ const pay=PAYTABLE[first as keyof typeof PAYTABLE][count as 3|4|5]; wins.push({line:idx+1,symbol:first,count,payout:pay}); }
  }); return wins;
}
export function theoreticalRtp():number{
  // per-line expectation from marginal symbol probabilities (reels independent, stops uniform)
  let ev=0;
  for(const s of SYMBOLS){ if(s==="BLANK") continue;
    const p=REEL_STRIPS.map(strip=>strip.filter(x=>x===s).length/strip.length);
    const p3=p[0]*p[1]*p[2]*(1-p[3]); const p4=p[0]*p[1]*p[2]*p[3]*(1-p[4]); const p5=p[0]*p[1]*p[2]*p[3]*p[4];
    const pay=PAYTABLE[s as keyof typeof PAYTABLE]; ev+=p3*pay[3]+p4*pay[4]+p5*pay[5];
  } return ev; // fraction of bet-per-line returned per line = RTP
}
export function hitFrequencyPerLine():number{
  let h=0; for(const s of SYMBOLS){ if(s==="BLANK") continue; const p=REEL_STRIPS.map(st=>st.filter(x=>x===s).length/st.length); h+=p[0]*p[1]*p[2]; } return h;
}
