
import {useEffect,useState} from "react";
import SlotMachine3D from "./components/SlotMachine3D";
import {useStore,totalBetOf} from "./state/store";
import {PAYTABLE,PAYLINES} from "./engine/config";
import {theoreticalRtp,hitFrequencyPerLine,REEL_STRIPS} from "./engine/engine";
import {sfx} from "./audio/sound";
import "./styles.css";
const money=(n:number)=>"$"+n.toLocaleString();
export default function App(){
  const s=useStore(); const [depositOpen,setDepositOpen]=useState(false); const [cashReceipt,setCashReceipt]=useState<number|null>(null); const [reduced]=useState(()=>window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  const bet=totalBetOf(s.denom,s.mult); const profit=s.totalWon-s.totalBet;
  useEffect(()=>{ const h=(e:KeyboardEvent)=>{ if(e.code==="Space" && !depositOpen){ e.preventDefault(); if(!s.spinning){ if(!s.muted) sfx.spin(s.volume); s.doSpin(); } } }; window.addEventListener("keydown",h); return ()=>window.removeEventListener("keydown",h); },[s.spinning,depositOpen,s.muted,s.volume]);
  const spin=()=>{ if(!s.muted) sfx.spin(s.volume); s.doSpin(); };
  return <div className="app">
    <header className="glass top"><div><h1>NEURAL JACKPOT</h1><p>The AI Wars · virtual credits only, no real money</p></div>
      <div className="stats"><span>Balance <b>{money(s.credits)}</b></span><span>Session <b className={profit>=0?"pos":"neg"}>{profit>=0?"+":""}{money(profit)}</b></span>
      <button onClick={()=>{s.toggleMute()}}>{s.muted?"🔇":"🔊"}</button><input aria-label="Volume" type="range" min={0} max={1} step={0.05} value={s.volume} onChange={e=>s.setVolume(+e.target.value)}/></div></header>
    <main className="stage"><SlotMachine3D/>
      {s.wins.length>0 && <div className="wins glass"><h3>Winning lines</h3>{s.wins.map((w,i)=><p key={i}>Line {w.line}: {w.count}× {w.symbol} pays {money(w.payout*s.denom*s.mult)}</p>)}</div>}
    </main>
    <div className="message" role="status">{s.message}{reduced?" (reduced motion preferred)":""}</div>
    <section className="glass console">
      <button onClick={()=>setDepositOpen(true)}>DEPOSIT CREDITS</button>
      <button disabled={s.spinning||s.credits===0} onClick={()=>{ const amt=s.cashOut(); if(amt>0) setCashReceipt(amt); }}>CASH OUT</button>
      <label>Denomination <select value={s.denom} onChange={e=>{s.setDenom(+e.target.value); if(!s.muted)sfx.click(s.volume)}}>{[1,5,10].map(d=><option key={d} value={d}>${d}</option>)}</select></label>
      <label>Multiplier <select value={s.mult} onChange={e=>s.setMult(+e.target.value)}>{[1,5,10].map(m=><option key={m} value={m}>{m===10?"MAX BET 10x":m+"x"}</option>)}</select></label>
      <div className="bet">Total Bet <b>{money(bet)}</b><small>20 lines</small></div>
      <button className="spin" disabled={s.spinning||s.credits<bet} onClick={spin}>SPIN</button>
    </section>
    <section className="panels">
      <div className="glass panel"><h3>Session</h3><p>Last win: {money(s.lastWin)}</p><p>Total won: {money(s.totalWon)}</p><p>Total wagered: {money(s.totalBet)}</p><p>Spins recorded: {s.history.length}</p>
        <button onClick={()=>s.setShowPaytable(!s.showPaytable)}>{s.showPaytable?"Hide":"Show"} paytable</button> <button onClick={()=>s.setShowDiag(!s.showDiag)}>{s.showDiag?"Hide":"Show"} diagnostics</button>
        {s.showPaytable && <table><thead><tr><th>Symbol</th><th>3×</th><th>4×</th><th>5×</th></tr></thead><tbody>{Object.entries(PAYTABLE).map(([k,v])=><tr key={k}><td>{k}</td><td>{v[3]}</td><td>{v[4]}</td><td>{v[5]}</td></tr>)}</tbody></table>}
        {s.showPaytable && <p className="small">Multipliers are × bet per line. 20 fixed paylines, left to right. BLANK never pays. No wilds or scatters in v1.</p>}
        {s.showDiag && <div className="small"><p>Theoretical RTP: {(theoreticalRtp()*100).toFixed(2)}% (target 93.5–94.5%)</p><p>Hit frequency per line: {(hitFrequencyPerLine()*100).toFixed(2)}%</p><p>Max payout: 5× GEMINI at max bet = {money(10000*10*10)}</p>{REEL_STRIPS.map((st,i)=><p key={i}>Reel {i+1}: {st.length} stops</p>)}</div>}
      </div>
      <div className="glass panel"><h3>Recent spins</h3>{s.history.length===0?<p>No spins yet.</p>:s.history.slice(0,8).map((h,i)=><p key={i}>{h.time} · bet {money(h.bet)} · win {money(h.win)}</p>)}</div>
      <div className="glass panel"><h3>Rules</h3><p>Outcomes are chosen by uniform stops on explicit 100-stop reel strips before any animation. Odds never change with balance, bet, or history. Press Space to spin.</p><p className="small">Logos belong to their owners; this is a simulated-money fan game. Muse asset is user-supplied and configurable in <code>src/assets/muse.webp</code>.</p></div>
    </section>
    {depositOpen && <div className="modal"><div className="glass card"><h2>Deposit virtual credits</h2><p>No real funds are involved. This is fictional in-game money.</p>{[100,500,1000,5000].map(a=><button key={a} onClick={()=>{s.deposit(a); setDepositOpen(false);}}>{money(a)}</button>)} <button onClick={()=>setDepositOpen(false)}>Cancel</button></div></div>}
    {cashReceipt!==null && <div className="modal"><div className="glass card receipt"><h2>◈ HOLOGRAPHIC PAYOUT ◈</h2><p>Virtual credits cashed out</p><h1>{money(cashReceipt)}</h1><p>No actual money was transferred.</p><button onClick={()=>setCashReceipt(null)}>Confirm</button></div></div>}
  </div>;
}
