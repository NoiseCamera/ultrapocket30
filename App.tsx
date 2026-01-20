
import React, { useState, useEffect, useRef } from 'react';
import { PETS, MENU_ITEMS } from './constants';
import { GameState, AppMode, PetStats, EmotionType, LegacyPet, ShellDesign } from './types';
import PixelCanvas from './components/PixelCanvas';
import IconCanvas from './components/IconCanvas';
import ItemCanvas from './components/ItemCanvas';
import HandCanvas from './components/HandCanvas';
import EmotionCanvas from './components/EmotionCanvas';
import ArrowCanvas from './components/ArrowCanvas';
import TimerCanvas from './components/TimerCanvas';
import { sound } from './components/Sound';

const INITIAL_STATS: PetStats = {
  hunger: 50,
  happiness: 50,
  hygiene: 100,
  energy: 100,
  age: 0,
  poopCount: 0,
  poopPositions: [],
  isSick: false,
  training: 0
};

const SHELL_STYLES: Record<ShellDesign, { body: string, border: string, accent: string, label: string }> = {
  classic: { body: 'bg-white', border: 'border-gray-100', accent: 'bg-blue-500', label: 'CLASSIC WHITE' },
  arctic: { body: 'bg-cyan-50', border: 'border-cyan-100', accent: 'bg-cyan-600', label: 'ARCTIC BLUE' },
  atomic: { body: 'bg-purple-600/80 backdrop-blur-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.3)]', border: 'border-purple-400/50', accent: 'bg-purple-900', label: 'ATOMIC PURPLE' },
  neon: { body: 'bg-yellow-300', border: 'border-yellow-200', accent: 'bg-pink-500', label: 'NEON YELLOW' },
  carbon: { body: 'bg-zinc-800', border: 'border-zinc-700', accent: 'bg-zinc-900', label: 'CARBON BLACK' },
  sakura: { body: 'bg-pink-100', border: 'border-pink-50', accent: 'bg-red-400', label: 'SAKURA PINK' }
};

const SHELL_ORDER: ShellDesign[] = ['classic', 'arctic', 'atomic', 'neon', 'carbon', 'sakura'];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('ultra_pocket_save');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        const awaySeconds = Math.max(0, (now - (parsed.lastTimestamp || now)) / 1000);
        
        // 離脱中も30秒で1歳成長
        const stats = { ...parsed.stats };
        stats.age += awaySeconds / 30;
        stats.hunger = Math.max(0, stats.hunger - awaySeconds * 0.1);
        stats.happiness = Math.max(0, stats.happiness - awaySeconds * 0.08);
        if (stats.poopCount > 0) stats.hygiene = Math.max(0, stats.hygiene - awaySeconds * 1.0);
        
        return { 
          ...parsed, 
          stats,
          mode: 'ROOM', 
          shellDesign: parsed.shellDesign || 'classic',
          lastTimestamp: now
        };
      } catch (e) { console.error(e); }
    }
    return {
      characterId: 0,
      pendingEvoId: null,
      stats: { ...INITIAL_STATS },
      taughtWords: [],
      mode: 'ROOM',
      selectedMenuIndex: 0,
      pos: { x: 40, y: 60 },
      targetPos: { x: 40, y: 60 },
      emotion: null,
      generation: 1,
      legacy: [],
      shellDesign: 'classic',
      lastTimestamp: Date.now()
    };
  });

  const [frame, setFrame] = useState(0);
  const [time, setTime] = useState(new Date());
  const [message, setMessage] = useState('');
  const [isEating, setIsEating] = useState(false);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [fruits, setFruits] = useState<{ x: number, y: number, type: 'fruit' | 'bad', speed: number }[]>([]);
  const [score, setScore] = useState(0);
  const [gameTimer, setGameTimer] = useState(40);
  const [acchiPhase, setAcchiPhase] = useState<'JANKEN' | 'HOI' | 'RESULT'>('JANKEN');
  const [jankenResult, setJankenResult] = useState<'WIN' | 'LOSE' | 'DRAW'>('DRAW');
  const [playerHand, setPlayerHand] = useState(0);
  const [enemyHand, setEnemyHand] = useState(0);
  const [acchiFrame, setAcchiFrame] = useState(0);
  const [evoChoice, setEvoChoice] = useState(0); 

  const lastUpdateRef = useRef(Date.now());
  const lastAlertRef = useRef(0);
  const lastEvoHeartbeatRef = useRef(0);

  useEffect(() => {
    localStorage.setItem('ultra_pocket_save', JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!['GAME_ACCHI', 'GAME_JANKEN', 'EVO_CHOICE'].includes(gameState.mode)) {
        setFrame(f => (f + 1) % 4);
      }
      setTime(new Date());
      updateLogic();
    }, 250);
    return () => clearInterval(timer);
  }, [gameState.mode, fruits, gameTimer]);

  useEffect(() => {
    if (gameState.emotion) {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, emotion: null }));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState.emotion]);

  const setEmotion = (type: EmotionType) => {
    setGameState(prev => ({ ...prev, emotion: type }));
  };

  const cycleShell = () => {
    sound.playSelect();
    const currentIndex = SHELL_ORDER.indexOf(gameState.shellDesign);
    const nextIndex = (currentIndex + 1) % SHELL_ORDER.length;
    setGameState(prev => ({ ...prev, shellDesign: SHELL_ORDER[nextIndex] }));
  };

  const updateLogic = () => {
    const now = Date.now();
    const delta = (now - lastUpdateRef.current) / 1000;
    lastUpdateRef.current = now;

    setGameState(prev => {
      if (['DEAD', 'LIFE_END', 'BREEDING', 'EVO_CHOICE'].includes(prev.mode)) return { ...prev, lastTimestamp: now };

      const isMiniGame = prev.mode.startsWith('GAME_');
      let newPos = { ...prev.pos };
      let newTargetPos = { ...prev.targetPos };
      let nextMode: AppMode = prev.mode;

      if (prev.mode === 'ROOM' && !isEating && prev.characterId !== 0 && !isMiniGame) {
        if (prev.pos.x !== prev.targetPos.x || prev.pos.y !== prev.targetPos.y) {
          if (prev.pos.x < prev.targetPos.x) newPos.x += 1;
          else if (prev.pos.x > prev.targetPos.x) newPos.x -= 1;
          if (prev.pos.y < prev.targetPos.y) newPos.y += 1;
          else if (prev.pos.y > prev.targetPos.y) newPos.y -= 1;
          if (Math.random() < 0.2) sound.playFootstep();
        } else {
          if (Math.random() < 0.05) {
            newTargetPos = {
              x: Math.floor(Math.random() * 80 + 10),
              y: Math.floor(30 + Math.random() * 40)
            };
          }
        }
      }

      const stats = { ...prev.stats };

      if (!isMiniGame && prev.mode !== 'EVO' && prev.mode !== 'EVO_READY') {
        stats.age += delta / 30; // 30秒で1歳
        stats.hunger = Math.max(0, stats.hunger - delta * 0.2);
        stats.happiness = Math.max(0, stats.happiness - delta * 0.15);
        if (stats.poopCount > 0) stats.hygiene = Math.max(0, stats.hygiene - delta * 1.5);
        
        if (stats.poopCount < 5 && Math.random() < 0.002) {
          stats.poopCount += 1;
          stats.poopPositions.push({
            x: Math.floor(Math.random() * 80 + 10),
            y: Math.floor(Math.random() * 20 + 65)
          });
          sound.playPoop();
        }
        
        if (stats.hygiene < 20 && Math.random() < 0.01) stats.isSick = true;
        
        const isCalling = stats.hunger < 20 || stats.happiness < 20 || stats.isSick;
        if (isCalling && now - lastAlertRef.current > 15000) {
          sound.playCall();
          lastAlertRef.current = now;
        }

        // 寿命ロジック
        if (stats.age >= 100) {
          sound.playWin();
          return { ...prev, mode: 'LIFE_END', lastTimestamp: now };
        }
        if (stats.age > 60) {
          const deathRisk = (stats.age - 60) / 40; // 0.0 to 1.0
          // 年齢が上がるほど毎チック(0.25s)ごとの死亡確率が上がる
          if (Math.random() < deathRisk * 0.01 * delta) {
            sound.playWin();
            return { ...prev, mode: 'LIFE_END', lastTimestamp: now };
          }
        }

        if (stats.hunger <= 0 && stats.happiness <= 0) {
          sound.playDead();
          return { ...prev, mode: 'DEAD', lastTimestamp: now };
        }
        
        // 進化タイミング判定 (20/40/60歳)
        const currentPet = PETS.find(p => p.id === prev.characterId) || PETS[0];
        if (currentPet.tier === 0 && stats.age > 1) nextMode = 'EVO_READY';
        else if (currentPet.tier === 1 && stats.age >= 20) nextMode = 'EVO_READY';
        else if (currentPet.tier === 2 && stats.age >= 40) nextMode = 'EVO_READY';
        else if (currentPet.tier === 3 && stats.age >= 60) nextMode = 'EVO_READY';

        return { ...prev, pos: newPos, targetPos: newTargetPos, stats, mode: nextMode, lastTimestamp: now };
      }
      
      if (prev.mode === 'EVO_READY') {
        if (now - lastEvoHeartbeatRef.current > 1000) {
          sound.playEvolutionReady();
          lastEvoHeartbeatRef.current = now;
        }
      }
      return { ...prev, pos: newPos, targetPos: newTargetPos, lastTimestamp: now };
    });

    if (gameState.mode === 'GAME_CATCH' && !gameResult) {
      updateCatchGame();
    }
  };

  const updateCatchGame = () => {
    setGameTimer(t => {
      if (t <= 5 && t > 0) sound.playTimerLow();
      if (t <= 0) { finishCatchGame(); return 0; }
      return t - 1;
    });
    setFruits(prev => {
      const speedMultiplier = 1 + ((40 - gameTimer) / 40);
      const next = prev.map(f => ({ ...f, y: Math.floor(f.y + (f.speed * speedMultiplier)) })).filter(f => f.y < 100);
      const spawnRate = 0.2 + ((40 - gameTimer) / 80);
      if (Math.random() < spawnRate) {
        const lanes = [10, 30, 50, 70, 90];
        const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
        next.push({
          x: randomLane,
          y: 0,
          type: Math.random() > 0.35 ? 'fruit' : 'bad',
          speed: Math.floor(3 + Math.random() * 3)
        });
      }
      next.forEach((f, i) => {
        const dx = Math.abs(f.x - gameState.pos.x);
        const dy = Math.abs(f.y - 85);
        if (dx < 5 && dy < 10) {
          if (f.type === 'fruit') {
            setScore(s => s + 10);
            sound.playCatch();
          } else {
            setScore(s => Math.max(0, s - 15));
            setEmotion('SWEAT');
            sound.playMiss();
          }
          next.splice(i, 1);
        }
      });
      return next;
    });
  };

  const finishCatchGame = () => {
    setGameResult(`スコア: ${score}`);
    sound.playWin();
    if (score >= 100) setEmotion('HEART');
    else if (score > 50) setEmotion('SPARKLE');
    setGameState(p => ({
      ...p,
      stats: {
        ...p.stats,
        happiness: Math.min(100, p.stats.happiness + Math.floor(score / 4)),
        training: p.stats.training + Math.floor(score / 8)
      }
    }));
  };

  const startNewLife = (partnerId?: number) => {
    setGameState(prev => {
      const currentPet = PETS.find(p => p.id === prev.characterId);
      const newLegacy: LegacyPet[] = [...prev.legacy];
      if (currentPet) {
        newLegacy.push({
          id: currentPet.id,
          name: currentPet.name,
          generation: prev.generation,
          finalTraining: prev.stats.training
        });
      }
      const partner = prev.legacy.find(l => l.id === partnerId);
      const trainingBonus = partner ? Math.floor(partner.finalTraining / 5) : 0;
      return {
        ...prev,
        characterId: 0,
        pendingEvoId: null,
        stats: { ...INITIAL_STATS, training: trainingBonus },
        mode: 'ROOM',
        pos: { x: 40, y: 60 },
        targetPos: { x: 40, y: 60 },
        generation: prev.generation + 1,
        legacy: newLegacy.slice(-10),
        lastTimestamp: Date.now()
      };
    });
    sound.playStart();
  };

  const handleAction = () => {
    const currentPet = PETS.find(p => p.id === gameState.characterId) || PETS[0];

    if (gameState.mode === 'ROOM') {
      sound.playSelect();
      setGameState(p => ({ ...p, mode: 'MENU' }));
    } else if (gameState.mode === 'EVO_READY') {
      sound.playSelect();
      setGameState(p => ({ ...p, mode: 'EVO_CHOICE' }));
    } else if (gameState.mode === 'EVO_CHOICE') {
      const targetTier = currentPet.tier + 1;
      const candidates = PETS.filter(p => p.tier === targetTier);
      if (candidates.length > 0) {
        const randomPet = candidates[Math.floor(Math.random() * candidates.length)];
        sound.playEvolution();
        setGameState(p => ({ ...p, characterId: randomPet.id, mode: 'EVO' }));
      }
    } else if (gameState.mode === 'MENU') {
      sound.playSelect();
      const menu = MENU_ITEMS[gameState.selectedMenuIndex];
      if (!menu) return;

      if (currentPet.tier === 0 && (['feed', 'clean', 'game', 'heal'].includes(menu.id))) {
        sound.playBack();
        setMessage('たまごの ときは おせわ できないよ');
        setEmotion('SURPRISE');
        setGameState(p => ({ ...p, mode: 'TALK' }));
        return;
      }

      switch (menu.id) {
        case 'feed': feed(); break;
        case 'clean': clean(); break;
        case 'game': setGameState(p => ({ ...p, mode: 'GAME_SELECT', selectedMenuIndex: 0 })); break;
        case 'status': setGameState(p => ({ ...p, mode: 'STATUS' })); break;
        case 'heal': heal(); break;
        case 'clock': setGameState(p => ({ ...p, mode: 'ROOM' })); break;
      }
    } else if (gameState.mode === 'GAME_SELECT') {
      sound.playStart();
      const idx = gameState.selectedMenuIndex % 3;
      setGameResult(null);
      setScore(0);
      setGameTimer(40);
      if (idx === 0) {
        setGameState(p => ({ ...p, mode: 'GAME_CATCH', pos: { x: 50, y: 85 } }));
        setFruits([]);
      } else if (idx === 1) {
        setGameState(p => ({ ...p, mode: 'GAME_ACCHI' }));
        setAcchiPhase('JANKEN');
        setMessage('じゃんけん...');
        setAcchiFrame(0);
      } else {
        setGameState(p => ({ ...p, mode: 'GAME_JANKEN' }));
        setMessage('じゃんけん...');
        setJankenResult('DRAW');
        setPlayerHand(0);
        setEnemyHand(0);
      }
    } else if (['GAME_CATCH', 'GAME_ACCHI', 'GAME_JANKEN', 'EVO', 'TALK', 'STATUS'].includes(gameState.mode)) {
      sound.playBack();
      setGameState(p => ({ ...p, mode: 'ROOM' }));
    } else if (gameState.mode === 'LIFE_END') {
      setGameState(p => ({ ...p, mode: 'BREEDING', selectedMenuIndex: 0 }));
    } else if (gameState.mode === 'BREEDING') {
      if (gameState.selectedMenuIndex === 0) startNewLife();
      else {
        const partner = gameState.legacy[gameState.selectedMenuIndex - 1];
        startNewLife(partner.id);
      }
    } else if (gameState.mode === 'DEAD') {
      localStorage.removeItem('ultra_pocket_save');
      window.location.reload();
    }
  };

  const handleDirection = (dir: string) => {
    sound.playMove();
    if (['MENU', 'GAME_SELECT', 'BREEDING'].includes(gameState.mode)) {
      let count = 0;
      if (gameState.mode === 'MENU') count = MENU_ITEMS.length;
      else if (gameState.mode === 'GAME_SELECT') count = 3;
      else if (gameState.mode === 'BREEDING') count = gameState.legacy.length + 1;
      const delta = (dir === 'RIGHT' || dir === 'DOWN') ? 1 : -1;
      setGameState(p => ({ ...p, selectedMenuIndex: (p.selectedMenuIndex + delta + count) % count }));
    } else if (gameState.mode === 'EVO_CHOICE') {
      setEvoChoice(prev => (prev === 0 ? 1 : 0));
    } else if (gameState.mode === 'GAME_CATCH' && !gameResult) {
      setGameState(p => ({ ...p, pos: { ...p.pos, x: Math.max(10, Math.min(90, p.pos.x + (dir === 'RIGHT' ? 20 : -20))) } }));
    } else if (gameState.mode === 'GAME_ACCHI' || gameState.mode === 'GAME_JANKEN') {
      if (gameState.mode === 'GAME_ACCHI') {
        if (acchiPhase === 'JANKEN') {
          if (dir === 'LEFT') playJankenInAcchi(0);
          if (dir === 'UP') playJankenInAcchi(1);
          if (dir === 'RIGHT') playJankenInAcchi(2);
        }
        else if (acchiPhase === 'HOI') {
          if (dir === 'UP') playHoi(0); if (dir === 'DOWN') playHoi(1); if (dir === 'LEFT') playHoi(2); if (dir === 'RIGHT') playHoi(3);
        }
      } else if (gameState.mode === 'GAME_JANKEN' && !gameResult) {
        if (dir === 'LEFT') playJankenStandalone(0); if (dir === 'UP') playJankenStandalone(1); if (dir === 'RIGHT') playJankenStandalone(2);
      }
    }
  };

  const playJankenInAcchi = (hand: number) => {
    sound.playJanken();
    const eHand = Math.floor(Math.random() * 3);
    setPlayerHand(hand);
    setEnemyHand(eHand);
    let res: 'WIN' | 'LOSE' | 'DRAW' = 'DRAW';
    if (hand === eHand) res = 'DRAW';
    else if ((hand === 0 && eHand === 1) || (hand === 1 && eHand === 2) || (hand === 2 && eHand === 0)) res = 'WIN';
    else res = 'LOSE';
    setJankenResult(res);
    setTimeout(() => {
      if (res === 'DRAW') {
        sound.playAlert();
        setMessage('あいこで...');
        setEmotion('SURPRISE');
      } else {
        sound.playSelect();
        setAcchiPhase('HOI');
        setMessage('あっちむいて...');
      }
    }, 800);
  };

  const playJankenStandalone = (hand: number) => {
    sound.playJanken();
    const eHand = Math.floor(Math.random() * 3);
    setPlayerHand(hand);
    setEnemyHand(eHand);
    let res: 'WIN' | 'LOSE' | 'DRAW' = 'DRAW';
    if (hand === eHand) res = 'DRAW';
    else if ((hand === 0 && eHand === 1) || (hand === 1 && eHand === 2) || (hand === 2 && eHand === 0)) res = 'WIN';
    else res = 'LOSE';
    setJankenResult(res);
    if (res === 'DRAW') {
      setMessage('あいこで...');
      setEmotion('SURPRISE');
      sound.playAlert();
    } else {
      const win = res === 'WIN';
      setGameResult(win ? 'きみの かち！' : 'ボクの かち！');
      if (win) {
        sound.playWin();
        setEmotion('HEART');
        setGameState(p => ({ ...p, stats: { ...p.stats, happiness: Math.min(100, p.stats.happiness + 15), training: p.stats.training + 10 } }));
      } else {
        sound.playMiss();
        setEmotion('SWEAT');
      }
    }
  };

  const playHoi = (dir: number) => {
    sound.playHoi();
    const eDir = Math.floor(Math.random() * 4);
    const frameMap = [4, 5, 6, 7];
    setAcchiFrame(frameMap[eDir]);
    setTimeout(() => {
      if (jankenResult === 'WIN' && dir === eDir) {
        setGameResult('きみの かち！');
        setEmotion('HEART');
        setGameState(p => ({ ...p, stats: { ...p.stats, training: p.stats.training + 15, happiness: Math.min(100, p.stats.happiness + 20) } }));
        sound.playWin();
      } else if (jankenResult === 'LOSE' && dir === eDir) {
        setGameResult('ボクの かち！');
        setEmotion('SURPRISE');
        sound.playMiss();
      } else {
        sound.playBack();
        setAcchiPhase('JANKEN');
        setAcchiFrame(0);
        setMessage('じゃんけん...');
        setEmotion('SWEAT');
      }
      if (dir === eDir) setAcchiPhase('RESULT');
    }, 1000);
  };

  const feed = () => {
    sound.playEat();
    setIsEating(true);
    setEmotion('HEART');
    setGameState(p => ({ ...p, mode: 'TALK', stats: { ...p.stats, hunger: Math.min(100, p.stats.hunger + 40) } }));
    setMessage('もぐもぐ！おいしいね。');
    setTimeout(() => { setIsEating(false); }, 2000);
  };

  const clean = () => {
    sound.playClean();
    setEmotion('SPARKLE');
    setGameState(p => ({ ...p, mode: 'TALK', stats: { ...p.stats, poopCount: 0, poopPositions: [], hygiene: 100 } }));
    setMessage('ぴかぴかになったよ！');
  };

  const heal = () => {
    sound.playHeal();
    setEmotion('HEART');
    setGameState(p => ({ ...p, mode: 'TALK', stats: { ...p.stats, isSick: false, happiness: Math.min(100, p.stats.happiness + 25) } }));
    setMessage('すっかりげんき！');
  };

  const renderBar = (val: number) => {
    const blocks = Math.floor(Math.max(0, Math.min(100, val)) / 20);
    return `[${'■'.repeat(blocks)}${'□'.repeat(5 - blocks)}]`;
  };

  const currentPet = PETS.find(p => p.id === gameState.characterId) || PETS[0];
  const isCalling = gameState.stats.hunger < 20 || gameState.stats.happiness < 20 || gameState.stats.isSick;
  const currentShell = SHELL_STYLES[gameState.shellDesign];

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#111] p-4 text-[#0f380f]">
      {/* 筐体メイン */}
      <div className={`relative flex flex-col items-center p-6 rounded-[4rem] border-[16px] shadow-2xl w-full max-w-[420px] h-[720px] transform scale-95 sm:scale-100 transition-all duration-500 ${currentShell.body} ${currentShell.border}`}>
        <div className="lcd-screen w-full h-[360px] rounded-2xl mb-10 flex flex-col p-4 relative overflow-hidden border-8 border-black/20">
          
          {isCalling && (
            <div className="absolute top-2 right-2 z-50 animate-pulse">
               <div className="bg-[#0f380f] text-[#9bbc0f] text-[8px] px-1 font-black rounded border border-[#0f380f] flex items-center gap-1">
                 <span>CALL!</span>
                 <div className="w-1 h-1 bg-[#9bbc0f] rounded-full animate-ping" />
               </div>
            </div>
          )}

          <div className="flex-1 relative flex flex-col">
            {(['ROOM', 'TALK', 'MENU', 'EVO_READY', 'EVO_CHOICE'].includes(gameState.mode)) && (
               <div className="flex justify-between items-center w-full px-2 py-1 border-b border-black/10 bg-black/5 rounded-t-lg mb-1">
                 <div className="flex items-center gap-1">
                   <span className="pixel-text text-[9px] font-bold">おなか:</span>
                   <div className={`pixel-text text-[9px] font-bold ${gameState.stats.hunger < 20 ? 'animate-pulse text-red-800' : ''}`}>{Math.floor(gameState.stats.hunger)}</div>
                   <span className="pixel-text text-[9px] font-bold ml-1">ごきげん:</span>
                   <div className={`pixel-text text-[9px] font-bold ${gameState.stats.happiness < 20 ? 'animate-pulse text-red-800' : ''}`}>{Math.floor(gameState.stats.happiness)}</div>
                 </div>
                 <div className="flex flex-col items-end">
                   <div className="pixel-text text-[10px] font-black leading-none">{currentPet.name}</div>
                   <div className="pixel-text text-[8px] font-bold opacity-70 mt-0.5">{Math.floor(gameState.stats.age)}さい</div>
                 </div>
               </div>
            )}
            
            <div className="flex-1 relative">
              {(gameState.mode === 'ROOM' || gameState.mode === 'TALK' || gameState.mode === 'EVO_READY') && (
                <>
                  <div className={`absolute transition-all duration-100 ease-linear ${gameState.mode === 'EVO_READY' ? 'animate-pulse' : ''}`} style={{ left: `${Math.round(gameState.pos.x)}%`, top: `${Math.round(gameState.pos.y)}%`, transform: 'translate(-50%, -50%)' }}>
                    <div className="relative">
                      {gameState.stats.isSick && <div className="absolute -top-4 -right-4 animate-pulse"><ItemCanvas type="sick" size={20} /></div>}
                      {gameState.emotion && <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce"><EmotionCanvas type={gameState.emotion} size={32} /></div>}
                      <PixelCanvas characterId={gameState.characterId} frame={frame} size={gameState.mode === 'TALK' ? 140 : 90} isEating={isEating} />
                    </div>
                  </div>
                  {gameState.mode === 'EVO_READY' && (
                    <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-1">
                      <div className="bg-[#0f380f] text-[#9bbc0f] px-4 py-1 pixel-text text-sm font-black rounded-full animate-bounce">しんかの きざし！</div>
                      <div className="pixel-text text-[10px] font-bold opacity-80 animate-pulse">[ ● ] を おせ！</div>
                    </div>
                  )}
                  {gameState.mode === 'TALK' && (
                    <div className="absolute bottom-4 left-0 right-0">
                       <div className="bg-white/80 border-2 border-black p-2 mx-2 rounded-lg pixel-text text-center text-[11px] font-bold shadow-[2px_2px_0_#0f380f] relative">
                         {message}
                       </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 pixel-text text-[12px] opacity-40 font-bold">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </>
              )}

              {gameState.mode === 'EVO_CHOICE' && (
                <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
                  <div className="pixel-text text-lg font-black animate-pulse">どっちに しんか する？</div>
                  <div className="flex items-center gap-12">
                    <div className={`p-4 border-4 rounded-xl transition-all ${evoChoice === 0 ? 'border-black bg-black/10 scale-110' : 'border-black/20 opacity-50'}`}>
                      <div className="pixel-text text-4xl font-black">?</div>
                    </div>
                    <div className={`p-4 border-4 rounded-xl transition-all ${evoChoice === 1 ? 'border-black bg-black/10 scale-110' : 'border-black/20 opacity-50'}`}>
                      <div className="pixel-text text-4xl font-black">?</div>
                    </div>
                  </div>
                  <div className="pixel-text text-sm font-black animate-bounce">[ ● ] けってい！</div>
                </div>
              )}

              {gameState.mode === 'MENU' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 flex items-center justify-center"><PixelCanvas characterId={gameState.characterId} frame={frame} size={130} /></div>
                  <div className="grid grid-cols-6 gap-2 border-t-4 border-black pt-3">{MENU_ITEMS.map((item, i) => (<div key={item.id} className="flex flex-col items-center"><IconCanvas index={i} selected={gameState.selectedMenuIndex === i} size={28} /></div>))}</div>
                  <div className="text-center pixel-text text-sm mt-2 font-bold uppercase">{MENU_ITEMS[gameState.selectedMenuIndex]?.label}</div>
                </div>
              )}

              {gameState.mode === 'STATUS' && (
                <div className="flex flex-col text-[12px] pixel-text gap-3 justify-center h-full px-6 font-bold">
                  <div className="flex justify-between border-b-2 border-black pb-1"><span>なまえ:</span> <span>{currentPet.name}</span></div>
                  <div className="flex justify-between"><span>とし:</span> <span>{Math.floor(gameState.stats.age)}さい</span></div>
                  <div className="flex justify-between"><span>おなか:</span> <span>{renderBar(gameState.stats.hunger)}</span></div>
                  <div className="flex justify-between"><span>なかよし:</span> <span>{renderBar(gameState.stats.happiness)}</span></div>
                  <div className="mt-5 text-center animate-pulse border-t-2 border-black pt-2">[ ● ] ルームへ</div>
                </div>
              )}
              
              {gameState.mode === 'GAME_CATCH' && (
                <div className="h-full relative bg-black/5 rounded-lg overflow-hidden flex flex-col">
                  <div className="flex flex-col p-2 bg-black/10 border-b-2 border-black/20 gap-2">
                    <div className="pixel-text text-xs font-bold text-center">SCORE: {score}</div>
                    <div className="flex justify-center"><TimerCanvas progress={gameTimer / 40} width={140} height={12} /></div>
                  </div>
                  <div className="flex-1 relative">
                    {fruits.map((f, i) => (<div key={i} className="absolute" style={{left: `${Math.round(f.x)}%`, top: `${Math.round(f.y)}%`, transform: 'translate(-50%, -50%)'}}><ItemCanvas type={f.type} size={24} /></div>))}
                    <div className="absolute" style={{left: `${Math.round(gameState.pos.x)}%`, top: '85%', transform: 'translate(-50%, -50%)'}}><PixelCanvas characterId={gameState.characterId} frame={frame} size={80} /></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* コントローラー */}
        <div className="relative w-64 h-64 flex items-center justify-center mt-4">
          <div className="absolute w-56 h-56 rounded-full border-4 border-black/10 shadow-inner" />
          <button onClick={() => handleDirection('UP')} className="absolute top-0 w-16 h-16 bg-gray-200 border-b-8 border-gray-400 rounded-2xl active:bg-gray-300 transition-all active:translate-y-2 flex items-center justify-center shadow-md"><ArrowCanvas dir="UP" /></button>
          <button onClick={() => handleDirection('LEFT')} className="absolute left-0 w-16 h-16 bg-gray-200 border-b-8 border-gray-400 rounded-2xl active:bg-gray-300 transition-all active:translate-y-2 flex items-center justify-center shadow-md"><ArrowCanvas dir="LEFT" /></button>
          <button onClick={() => handleDirection('RIGHT')} className="absolute right-0 w-16 h-16 bg-gray-200 border-b-8 border-gray-400 rounded-2xl active:bg-gray-300 transition-all active:translate-y-2 flex items-center justify-center shadow-md"><ArrowCanvas dir="RIGHT" /></button>
          <button onClick={() => handleDirection('DOWN')} className="absolute bottom-0 w-16 h-16 bg-gray-200 border-b-8 border-gray-400 rounded-2xl active:bg-gray-300 transition-all active:translate-y-2 flex items-center justify-center shadow-md"><ArrowCanvas dir="DOWN" /></button>
          <button onClick={handleAction} className={`z-10 w-24 h-24 ${currentShell.accent} border-b-8 border-black/40 rounded-full shadow-2xl active:translate-y-2 active:border-b-0 transition-all flex items-center justify-center ${gameState.mode === 'EVO_READY' ? 'animate-bounce ring-4 ring-yellow-400' : ''}`} />
          
          <button onClick={cycleShell} className="absolute bottom-4 right-4 w-10 h-10 bg-gray-300 border-b-4 border-gray-500 rounded-full active:translate-y-1 active:border-b-0 flex items-center justify-center shadow-lg" title="Design Change">
            <div className="w-4 h-4 rounded-full border-2 border-white opacity-40" />
          </button>
        </div>
        <div className="mt-8 text-black/20 font-black tracking-[0.4em] text-[10px] italic uppercase">{currentShell.label} Edition</div>
      </div>
    </div>
  );
};

export default App;
