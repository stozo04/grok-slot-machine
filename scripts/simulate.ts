import {spin,evaluate,mulberry32,theoreticalRtp} from "../src/engine/engine";
const N=1_000_000; const rng=mulberry32(20261019); let returned=0, sq=0, hits=0, maxWin=0;
for(let i=0;i<N;i++){ const {grid}=spin(rng); const wins=evaluate(grid); const pay=wins.reduce((a,w)=>a+w.payout,0); returned+=pay; sq+=pay*pay; if(pay>0)hits++; if(pay>maxWin)maxWin=pay; }
const meanPerSpin=returned/N; const variance=sq/N-meanPerSpin*meanPerSpin; const sd=Math.sqrt(variance); const rtp=meanPerSpin/20; const seRtp=(sd/Math.sqrt(N))/20;
console.log(`Spins: ${N.toLocaleString()}`); console.log(`Theoretical RTP: ${(theoreticalRtp()*100).toFixed(3)}%`); console.log(`Empirical RTP: ${(rtp*100).toFixed(3)}% ± ${(1.96*seRtp*100).toFixed(3)}% (95% CI, payout-variance based)`); console.log(`Hit frequency (any line win): ${(hits/N*100).toFixed(2)}%`); console.log(`Max win observed (bet-per-line units, single spin total across lines): ${maxWin}`);
