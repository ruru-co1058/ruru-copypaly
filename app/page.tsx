'use client';

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, Move, RefreshCw, Sparkles, Timer, Trophy } from 'lucide-react';

declare global {
  interface Document {
    modelContext?: {
      registerTool: (tool: {
        name: string;
        title?: string;
        description: string;
        inputSchema: object;
        annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
        execute: (input: unknown) => unknown;
      }, options?: { signal?: AbortSignal }) => void | Promise<void>;
    };
  }
}

const starterImage = '/default-puzzle.png';

const levels = [
  { size: 3, label: '輕鬆', note: '3 × 3' },
  { size: 4, label: '挑戰', note: '4 × 4' },
  { size: 5, label: '高手', note: '5 × 5' },
];

const shuffle = (count: number) => {
  const items = Array.from({ length: count }, (_, index) => index);
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  if (items.every((item, index) => item === index) && items.length > 1) [items[0], items[1]] = [items[1], items[0]];
  return items;
};

const formatTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

export default function Home() {
  const [size, setSize] = useState(3);
  const [image, setImage] = useState(starterImage);
  const [pieces, setPieces] = useState<number[]>(() => shuffle(9));
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const dragIndex = useRef<number | null>(null);

  const progress = useMemo(() => Math.round((pieces.filter((piece, index) => piece === index).length / pieces.length) * 100), [pieces]);

  useEffect(() => {
    if (!playing || completed) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [playing, completed]);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: 'start_photo_puzzle',
      title: '開始照片拼圖',
      description: '選擇 3×3、4×4 或 5×5 的難度，重新打亂並開始一局新的照片拼圖。',
      inputSchema: {
        type: 'object',
        properties: { size: { type: 'integer', enum: [3, 4, 5], description: '每一邊的拼圖片數量' } },
        required: ['size'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: (input) => {
        const requested = (input as { size?: unknown })?.size;
        if (requested !== 3 && requested !== 4 && requested !== 5) throw new Error('難度必須是 3、4 或 5。');
        setSize(requested);
        startGame(requested);
        return { started: true, size: requested, pieces: requested * requested };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  const startGame = (nextSize = size) => {
    setPieces(shuffle(nextSize * nextSize));
    setMoves(0); setSeconds(0); setCompleted(false); setSelected(null); setPlaying(true);
  };

  const swapPieces = (from: number, to: number) => {
    if (from === to || completed) return;
    setPieces((current) => {
      const next = [...current];
      [next[from], next[to]] = [next[to], next[from]];
      if (next.every((piece, index) => piece === index)) { setCompleted(true); setPlaying(false); }
      return next;
    });
    setMoves((value) => value + 1);
    setSelected(null);
  };

  const choosePiece = (index: number) => selected === null ? setSelected(index) : swapPieces(selected, index);

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => { setImage(String(reader.result)); startGame(size); };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>, index: number) => {
    event.preventDefault();
    if (dragIndex.current !== null) swapPieces(dragIndex.current, index);
    dragIndex.current = null;
  };

  return (
    <main className="game-shell">
      <div className="doodle doodle-one" aria-hidden="true">✦</div>
      <div className="doodle doodle-two" aria-hidden="true">〰</div>
      <header className="topbar">
        <div className="brand-mark"><Sparkles size={23} strokeWidth={2.6} /></div>
        <div><p className="eyebrow">照片變身大挑戰</p><h1>拼拼樂！</h1></div>
        <label className="upload-button"><ImagePlus size={20} /><span>換一張照片</span><input type="file" accept="image/*" onChange={handleUpload} /></label>
      </header>

      <section className="workspace">
        <aside className="side-card setup-card">
          <div><span className="step-tag">STEP 1</span><h2>選擇難度</h2></div>
          <div className="level-list" role="radiogroup" aria-label="選擇拼圖難度">
            {levels.map((level) => (
              <button key={level.size} type="button" role="radio" aria-checked={size === level.size} className={`level-button ${size === level.size ? 'active' : ''}`} onClick={() => { setSize(level.size); startGame(level.size); }}>
                <span><strong>{level.label}</strong><small>{level.note}</small></span>
                <span className="level-grid" style={{ gridTemplateColumns: `repeat(${level.size}, 1fr)` }} aria-hidden="true">{Array.from({ length: level.size * level.size }, (_, i) => <i key={i} />)}</span>
              </button>
            ))}
          </div>
          <div className="how-to"><Move size={22} /><p><strong>怎麼玩？</strong><br />拖曳兩塊拼圖交換位置；也可以依序點選兩塊。</p></div>
        </aside>

        <section className="board-column">
          <div className="status-row">
            <div><Timer size={20} /><span>時間</span><strong>{formatTime(seconds)}</strong></div>
            <div><Move size={20} /><span>步數</span><strong>{moves}</strong></div>
            <div className="progress-pill"><span>完成度</span><strong>{progress}%</strong></div>
          </div>
          <div className={`puzzle-frame ${completed ? 'is-complete' : ''}`}>
            <div className="tape tape-left" aria-hidden="true" /><div className="tape tape-right" aria-hidden="true" />
            <div className="puzzle-board" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
              {pieces.map((piece, index) => {
                const row = Math.floor(piece / size); const column = piece % size;
                return <button key={`${piece}-${index}`} type="button" draggable={!completed} aria-label={`拼圖片第 ${index + 1} 格${selected === index ? '，已選取' : ''}`} className={`puzzle-piece ${selected === index ? 'selected' : ''}`} onClick={() => choosePiece(index)} onDragStart={() => { dragIndex.current = index; }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(event, index)} style={{ backgroundImage: `url("${image}")`, backgroundSize: `${size * 100}% ${size * 100}%`, backgroundPosition: `${(column / (size - 1)) * 100}% ${(row / (size - 1)) * 100}%` }} />;
              })}
            </div>
            {completed && <div className="win-card" role="status"><Trophy size={34} /><strong>拼圖完成！</strong><span>{formatTime(seconds)}・{moves} 步</span></div>}
          </div>
          <button className="shuffle-button" type="button" onClick={() => startGame()}><RefreshCw size={20} />重新打亂</button>
        </section>

        <aside className="side-card preview-card">
          <div><span className="step-tag yellow">小提示</span><h2>原圖參考</h2></div>
          <div className="reference-photo"><img src={image} alt="拼圖原圖參考" /></div>
          <p>先找出四個角落，再慢慢完成邊邊，會更容易喔！</p>
          <div className="encouragement">你一定<br />做得到！<Sparkles size={19} /></div>
        </aside>
      </section>
    </main>
  );
}
