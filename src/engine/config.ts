
export const SYMBOLS = ["BLANK","GROK","CHATGPT","MUSE","ANTHROPIC","GEMINI"] as const;
export type SymbolId = typeof SYMBOLS[number];
export const WEIGHTS: Record<SymbolId, number> = {BLANK:40,GROK:25,CHATGPT:15,MUSE:10,ANTHROPIC:7,GEMINI:3};
export const PAYLINES: number[][] = [
[1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],
[0,0,1,0,0],[2,2,1,2,2],[1,0,0,0,1],[1,2,2,2,1],[1,0,1,0,1],
[1,2,1,2,1],[0,1,1,1,0],[2,1,1,1,2],[1,1,0,1,1],[1,1,2,1,1],
[0,1,0,1,0],[2,1,2,1,2],[1,0,2,0,1],[1,2,0,2,1],[0,2,0,2,0]];
// multipliers of bet-per-line, tuned with theoreticalRtp() in engine.ts (see README)
export const PAYTABLE: Record<Exclude<SymbolId,"BLANK">, {3:number,4:number,5:number}> = {
 GROK:{3:20,4:60,5:200}, CHATGPT:{3:40,4:120,5:400}, MUSE:{3:60,4:240,5:1000},
 ANTHROPIC:{3:100,4:400,5:2000}, GEMINI:{3:200,4:1000,5:10000}};
export const DENOMINATIONS=[100,500,1000]; // cents: $1,$5,$10 display handled below
export const DENOM_OPTIONS=[1,5,10]; export const MULTIPLIERS=[1,5,10];
export const SYMBOL_COLORS: Record<SymbolId,string>={BLANK:"#151a24",GROK:"#ffffff",CHATGPT:"#10a37f",MUSE:"#d97757",ANTHROPIC:"#d4a017",GEMINI:"#8ab4f8"};
