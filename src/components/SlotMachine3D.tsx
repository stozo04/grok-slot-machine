
import {useEffect,useMemo,useRef} from "react";
import {Canvas,useFrame} from "@react-three/fiber";
import {Environment,Float,RoundedBox,Text} from "@react-three/drei";
import {EffectComposer,Bloom} from "@react-three/postprocessing";
import * as THREE from "three";
import gsap from "gsap";
import {useStore} from "../state/store";
import {SYMBOL_COLORS,type SymbolId} from "../engine/config";
import {sfx} from "../audio/sound";
import grokUrl from "../assets/grok.webp"; import chatUrl from "../assets/chatgpt.webp"; import museUrl from "../assets/muse.webp"; import anthUrl from "../assets/anthropic.svg"; import gemUrl from "../assets/gemini.webp";
const URLS:Record<SymbolId,string|null>={BLANK:null,GROK:grokUrl,CHATGPT:chatUrl,MUSE:museUrl,ANTHROPIC:anthUrl,GEMINI:gemUrl};
function useTex(url:string|null){ const t=useMemo(()=> url? new THREE.TextureLoader().load(url):null,[url]); return t; }
function Tile({symbol,angle,reelX,highlight}:{symbol:SymbolId,angle:number,reelX:number,highlight:boolean}){
  const tex=useTex(URLS[symbol]); const R=1.15; const y=Math.sin(angle)*R; const z=Math.cos(angle)*R;
  return <group position={[reelX,y,z]} rotation={[ -angle,0,0]}>
    <RoundedBox args={[0.82,0.62,0.08]} radius={0.06} position={[0,0,0]}>
      <meshStandardMaterial color={symbol==="BLANK"?"#10141d":"#1a2233"} metalness={0.6} roughness={0.25} emissive={new THREE.Color(SYMBOL_COLORS[symbol])} emissiveIntensity={highlight?1.2: symbol==="BLANK"?0.05:0.25}/>
    </RoundedBox>
    {tex && <mesh position={[0,0,0.051]}><planeGeometry args={[0.52,0.52]}/><meshBasicMaterial map={tex} transparent toneMapped={false}/></mesh>}
    {!tex && <Text fontSize={0.14} color="#2c3648" position={[0,0,0.051]}>·</Text>}
  </group>;
}
const FILLER:SymbolId[]=["GROK","CHATGPT","MUSE","ANTHROPIC","GEMINI","BLANK","GROK","CHATGPT","BLANK","MUSE","GROK","BLANK"];
function Reel({index}:{index:number}){
  const grid=useStore(s=>s.grid); const spinning=useStore(s=>s.spinning); const wins=useStore(s=>s.wins); const muted=useStore(s=>s.muted); const volume=useStore(s=>s.volume);
  const ref=useRef<THREE.Group>(null); const SEG=12;
  const tiles=useMemo(()=>{ const col=grid[index]; const arr=[...FILLER]; arr[0]=col[1]; arr[1]=col[0]; arr[SEG-1]=col[2]; return arr; },[grid,index]);
  useEffect(()=>{ if(!spinning||!ref.current) return; const g=ref.current; const target=Math.ceil(g.rotation.x/(Math.PI*2))*(Math.PI*2)+(Math.PI*2)*(3+index); const obj={v:g.rotation.x};
    const tw=gsap.to(obj,{v:target,duration:2.4+index*0.35,ease:"power3.out",onUpdate:()=>{g.rotation.x=obj.v},onComplete:()=>{ if(!muted) sfx.stop(index,volume); if(index===4){ useStore.getState().settle(); const w=useStore.getState().lastWin; const bet=useStore.getState().denom*useStore.getState().mult*20; if(w>0 && !muted) (w>=bet*10? sfx.big(volume): sfx.coin(volume)); }}});
    return ()=>{tw.kill()}; },[spinning,index]);
  const winSym = wins.length? grid[index] : null;
  return <group ref={ref} position={[0,0,0]}>{tiles.map((s,i)=>{ const angle=(i/SEG)*Math.PI*2; const isFrontWin = !!winSym && (i===0||i===1||i===SEG-1); return <Tile key={i} symbol={s} angle={angle} reelX={(index-2)*0.98} highlight={isFrontWin}/>})}</group>;
}
function Machine(){
  const lastWin=useStore(s=>s.lastWin); const spinning=useStore(s=>s.spinning);
  const light=useRef<THREE.PointLight>(null);
  useFrame(({clock})=>{ if(light.current) light.current.intensity= lastWin>0? 30+Math.sin(clock.elapsedTime*8)*10 : spinning?18:10; });
  return <group position={[0,-0.1,-0.4]}>
    <RoundedBox args={[5.9,3.6,1.1]} radius={0.18} position={[0,0,-0.75]}><meshStandardMaterial color="#0b0e14" metalness={0.85} roughness={0.28}/></RoundedBox>
    <RoundedBox args={[5.5,3.1,0.25]} radius={0.12} position={[0,0,-0.15]}><meshPhysicalMaterial color="#111827" metalness={0.4} roughness={0.05} transmission={0.35} transparent opacity={0.92}/></RoundedBox>
    {[0,1,2,3,4].map(i=><Reel key={i} index={i}/>)}
    <pointLight ref={light} position={[0,1.5,3]} color="#22d3ee"/>
    <pointLight position={[-3,2,2]} intensity={8} color="#8b5cf6"/>
    <Float speed={2} floatIntensity={0.4}><Text fontSize={0.32} color="#e0f2fe" position={[0,2.15,0.4]}>NEURAL JACKPOT</Text></Float>
    <Text fontSize={0.15} color="#67e8f9" position={[0,-2.0,0.6]}>{lastWin>0?`WIN  $${lastWin.toLocaleString()}`: spinning?"SPINNING…":"THE AI WARS"}</Text>
    {/* physical SPIN knob */}
    <mesh position={[2.35,-2.05,0.5]}><sphereGeometry args={[0.22,32,32]}/><meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={spinning?0.4:1.6} metalness={0.3} roughness={0.2}/></mesh>
  </group>;
}
export default function SlotMachine3D(){
  return <Canvas camera={{position:[0,0.4,7.2],fov:42}} dpr={[1,2]} gl={{antialias:true}}>
    <color attach="background" args={["#05070d"]}/><fog attach="fog" args={["#05070d",9,16]}/>
    <ambientLight intensity={0.5}/><spotLight position={[5,6,6]} intensity={80} angle={0.5}/>
    <Machine/><Environment preset="city"/>
    <EffectComposer><Bloom intensity={0.7} luminanceThreshold={0.25} luminanceSmoothing={0.2}/></EffectComposer>
  </Canvas>;
}
