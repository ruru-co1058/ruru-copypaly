'use client';
import {useState} from 'react';
import {ArrowLeft,Home,User,Users} from 'lucide-react';
import Game from './puzzle-game';
import BackgroundMusic from './background-music';
type Mode='single'|'dual'|null;
export const dynamic='force-static';
export default function Page(){
 const[mode,setMode]=useState<Mode>(null),[countdown,setCountdown]=useState<number|null>(null),[signal,setSignal]=useState(0);
 const startPk=()=>{setCountdown(3);[2,1].forEach((n,i)=>setTimeout(()=>setCountdown(n),700*(i+1)));setTimeout(()=>{setCountdown(null);setSignal(Date.now())},2100)};
 if(!mode)return <main className="mode-screen"><BackgroundMusic style="match"/><a href="https://ruru-co1058.github.io/ruru-knowme-eplay/"><ArrowLeft/>回到遊戲首頁</a><div className="mode-card"><p>選擇遊戲方式</p><h1>圖形配對遊戲</h1><div><button onClick={()=>setMode('single')}><User/><strong>單人計時</strong><span>一個人完成挑戰並記錄時間</span></button><button onClick={()=>setMode('dual')}><Users/><strong>雙人 PK</strong><span>共用題目，倒數後同時開始</span></button></div></div></main>;
 return <div className={mode==='dual'?'mode-game dual-mode':'mode-game'}><BackgroundMusic style="match"/><div className="mode-nav"><a href="https://ruru-co1058.github.io/ruru-knowme-eplay/"><Home/>遊戲首頁</a><button onClick={()=>setMode(null)}>切換模式</button>{mode==='dual'&&<button className="pk-launch" onClick={startPk} disabled={countdown!==null}><Users/>開始雙人 PK</button>}</div><div className="game-panes">{mode==='single'?<Game/>:<><div className="player-pane"><b>玩家 1</b><Game autoStartSignal={signal} player={0}/></div><div className="player-pane"><b>玩家 2</b><Game autoStartSignal={signal} player={1}/></div></>}</div>{countdown!==null&&<div className="shared-countdown">{countdown}</div>}</div>
}

