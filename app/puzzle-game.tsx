'use client';

import {ChangeEvent,useEffect,useMemo,useRef,useState} from 'react';
import {Check,ImagePlus,LockKeyhole,MousePointerClick,Play,RotateCcw,Shuffle,Timer,Trash2,Upload} from 'lucide-react';

type Picture={id:string;url:string;name:string};
type Card={key:string;pictureId:string;matched:boolean};
type Status='setup'|'playing'|'won';
function shuffle<T>(items:T[]){const next=[...items];for(let i=next.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[next[i],next[j]]=[next[j],next[i]]}return next}
function clock(seconds:number){return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`}
function audioContext(){const AudioContextClass=window.AudioContext||(window as typeof window&{webkitAudioContext:typeof AudioContext}).webkitAudioContext;return new AudioContextClass()}
function soundCorrect(){const context=audioContext();[523,659,784,1047].forEach((frequency,index)=>{const oscillator=context.createOscillator(),gain=context.createGain(),start=context.currentTime+index*.09;oscillator.type='triangle';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.001,start);gain.gain.exponentialRampToValueAtTime(.16,start+.025);gain.gain.exponentialRampToValueAtTime(.001,start+.22);oscillator.connect(gain).connect(context.destination);oscillator.start(start);oscillator.stop(start+.23)});window.setTimeout(()=>void context.close(),700)}
function soundWrong(){const context=audioContext();[0,.2].forEach(delay=>{const oscillator=context.createOscillator(),gain=context.createGain(),start=context.currentTime+delay;oscillator.type='square';oscillator.frequency.setValueAtTime(220,start);oscillator.frequency.exponentialRampToValueAtTime(165,start+.13);gain.gain.setValueAtTime(.12,start);gain.gain.exponentialRampToValueAtTime(.001,start+.14);oscillator.connect(gain).connect(context.destination);oscillator.start(start);oscillator.stop(start+.15)});window.setTimeout(()=>void context.close(),600)}
function soundVictory(){const context=audioContext();[523,659,784,1047,1319].forEach((frequency,index)=>{const oscillator=context.createOscillator(),gain=context.createGain(),start=context.currentTime+index*.12;oscillator.type='triangle';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.001,start);gain.gain.exponentialRampToValueAtTime(.2,start+.03);gain.gain.exponentialRampToValueAtTime(.001,start+.34);oscillator.connect(gain).connect(context.destination);oscillator.start(start);oscillator.stop(start+.35)});window.setTimeout(()=>void context.close(),1100)}

export default function PictureMatchGame(){
 const [pictures,setPictures]=useState<Picture[]>([]),[cards,setCards]=useState<Card[]>([]),[open,setOpen]=useState<number[]>([]),[status,setStatus]=useState<Status>('setup'),[moves,setMoves]=useState(0),[seconds,setSeconds]=useState(0),[locked,setLocked]=useState(false);
 const inputRef=useRef<HTMLInputElement>(null),picturesRef=useRef<Picture[]>([]);
 useEffect(()=>{picturesRef.current=pictures},[pictures]);
 useEffect(()=>()=>picturesRef.current.forEach(picture=>URL.revokeObjectURL(picture.url)),[]);
 useEffect(()=>{if(status!=='playing')return;const timer=window.setInterval(()=>setSeconds(value=>value+1),1000);return()=>window.clearInterval(timer)},[status]);
 const matched=useMemo(()=>cards.filter(card=>card.matched).length/2,[cards]);
 const addPictures=(event:ChangeEvent<HTMLInputElement>)=>{const files=Array.from(event.target.files??[]).filter(file=>file.type.startsWith('image/')).slice(0,12-pictures.length);const additions=files.map(file=>({id:crypto.randomUUID(),url:URL.createObjectURL(file),name:file.name}));setPictures(current=>[...current,...additions]);setStatus('setup');setCards([]);event.target.value=''};
 const removePicture=(id:string)=>{setPictures(current=>{const target=current.find(p=>p.id===id);if(target)URL.revokeObjectURL(target.url);return current.filter(p=>p.id!==id)});setCards([]);setStatus('setup')};
 const start=()=>{if(pictures.length<2)return;const deck=shuffle(pictures.flatMap(picture=>[{key:crypto.randomUUID(),pictureId:picture.id,matched:false},{key:crypto.randomUUID(),pictureId:picture.id,matched:false}]));setCards(deck);setOpen([]);setMoves(0);setSeconds(0);setLocked(false);setStatus('playing')};
 const flip=(index:number)=>{if(status!=='playing'||locked||open.includes(index)||cards[index].matched)return;const next=[...open,index];setOpen(next);if(next.length<2)return;setMoves(value=>value+1);setLocked(true);const [first,second]=next;if(cards[first].pictureId===cards[second].pictureId){const isVictory=cards.filter(card=>card.matched).length+2===cards.length;isVictory?soundVictory():soundCorrect();window.setTimeout(()=>{setCards(current=>current.map((card,i)=>i===first||i===second?{...card,matched:true}:card));setOpen([]);setLocked(false);if(isVictory)setStatus('won')},450)}else{soundWrong();window.setTimeout(()=>{setOpen([]);setLocked(false)},900)}};
 return <main className="match-shell">
  <header className="topbar"><div className="logo"><span/><span/></div><div><p className="eyebrow">翻一翻・找一找</p><h1>圖片配對小高手</h1></div><div className="privacy-pill"><LockKeyhole/>關閉後自動刪除</div></header>
  <section className="workspace">
   <aside className="control-card">
    <div className="step"><span>1</span><div><strong>匯入配對圖片</strong><small>每張圖片會自動變成一對</small></div></div>
    <button className="upload-button" onClick={()=>inputRef.current?.click()}><Upload/>選擇多張圖片</button><input ref={inputRef} className="sr-only" type="file" accept="image/*" multiple onChange={addPictures}/>
    <p className="upload-help">一次可選多張，最多 12 張。至少需要 2 張不同圖片。</p>
    <div className="picture-list">{pictures.length===0?<button className="add-tile" onClick={()=>inputRef.current?.click()}><ImagePlus/><span>加入圖片</span></button>:pictures.map((picture,index)=><div className="picture-row" key={picture.id}><img src={picture.url} alt={`配對圖片 ${index+1}`}/><span>第 {index+1} 組</span><button aria-label={`刪除第 ${index+1} 組圖片`} onClick={()=>removePicture(picture.id)}><Trash2/></button></div>)}</div>
    {pictures.length>0&&pictures.length<12&&<button className="more-button" onClick={()=>inputRef.current?.click()}><ImagePlus/>再加入圖片</button>}
    <button className="start-button" disabled={pictures.length<2} onClick={start}><Shuffle/>{status==='playing'?'重新洗牌':'開始配對'}</button>
    {pictures.length<2&&<p className="need-more">還需要 {2-pictures.length} 張圖片才能開始。</p>}
    <div className="privacy-note"><LockKeyhole/><p><strong>圖片不會上傳</strong><br/>只暫存在目前分頁；重新整理或關閉網頁後會自動刪除。</p></div>
   </aside>
   <section className="game-card">
    <div className="game-stats"><span><Timer/>時間 <strong>{clock(seconds)}</strong></span><span><MousePointerClick/>翻牌 <strong>{moves}</strong> 次</span><span><Check/>配對 <strong>{matched}/{pictures.length}</strong></span></div>
    <div className="game-area">
     {status==='setup'?<div className="empty-state"><div className="cards-demo"><i/><i/><i/><i/></div><h2>{pictures.length?'圖片準備好了！':'先加入想配對的圖片'}</h2><p>{pictures.length?`目前有 ${pictures.length} 組，共 ${pictures.length*2} 張牌。`:'每張圖片會出現兩次，找出相同的兩張。'}</p>{pictures.length>=2?<button onClick={start}><Play/>開始配對</button>:<button onClick={()=>inputRef.current?.click()}><Upload/>匯入圖片</button>}</div>:
     <><div className="two-row-scroll"><div className={`card-grid ${status==='won'?'is-frozen':''}`} style={{gridTemplateColumns:`repeat(${Math.ceil(cards.length/2)}, minmax(72px, 1fr))`} as React.CSSProperties}>{cards.map((card,index)=>{const picture=pictures.find(p=>p.id===card.pictureId);const shown=open.includes(index)||card.matched;return <button key={card.key} className={`memory-card ${shown?'is-flipped':''} ${card.matched?'is-matched':''}`} disabled={card.matched||status==='won'} onClick={()=>flip(index)} aria-label={shown?`第 ${index+1} 張牌，已翻開`:`翻開第 ${index+1} 張牌`}><span className="card-inner"><span className="card-back"><span>?</span></span><span className="card-front">{picture&&<img src={picture.url} alt="配對圖片"/>}{card.matched&&<i><Check/></i>}</span></span></button>})}</div></div><p className="game-tip">翻開兩張牌。配對正確的圖片會留在原位顯示。</p>{status==='won'&&<div className="win-panel" role="status" aria-live="assertive"><div className="victory-star">★</div><h2>全部配對成功！</h2><span className="finish-label">完成時間</span><strong className="finish-time">{clock(seconds)}</strong><p>共翻牌 <strong>{moves}</strong> 次</p><button onClick={start}><RotateCcw/>再玩一次</button></div>}</>}
    </div>
   </section>
  </section>
 </main>
}
