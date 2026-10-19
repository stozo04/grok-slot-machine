
import {describe,it,expect} from "vitest"; import {spin,evaluate,mulberry32,theoreticalRtp,REEL_STRIPS} from "./engine"; import type {SymbolId} from "./config";
describe("slot engine",()=>{
 it("strips have configured weights",()=>{ for(const strip of REEL_STRIPS){ expect(strip.length).toBe(100); expect(strip.filter(s=>s==="GEMINI").length).toBe(3);} });
 it("seeded spin is reproducible",()=>{ const a=spin(mulberry32(42)); const b=spin(mulberry32(42)); expect(a.stops).toEqual(b.stops); });
 it("pays left-to-right 3oak only",()=>{ const g:SymbolId[][]=[["GROK","BLANK","BLANK"],["GROK","BLANK","BLANK"],["GROK","BLANK","BLANK"],["CHATGPT","BLANK","BLANK"],["GEMINI","BLANK","BLANK"]]; const wins=evaluate(g); expect(wins.some(w=>w.line===2&&w.count===3)).toBe(true); });
 it("blank never pays",()=>{ const g:SymbolId[][]=Array.from({length:5},()=>["BLANK","BLANK","BLANK"] as SymbolId[]); expect(evaluate(g)).toHaveLength(0); });
 it("theoretical RTP in target band",()=>{ const r=theoreticalRtp(); expect(r).toBeGreaterThan(0.935); expect(r).toBeLessThan(0.945); });
});
