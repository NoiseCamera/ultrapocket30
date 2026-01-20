
import { CharacterDef } from './types';

export const PETS: CharacterDef[] = [
  { id: 0, name: 'たまご', tier: 0, type: 'slime' },
  { id: 1, name: 'ぷにい', tier: 1, type: 'slime' },
  { id: 2, name: 'ぽろん', tier: 2, type: 'beast' },
  { id: 3, name: 'うぃる', tier: 2, type: 'bird' },
  { id: 4, name: 'ぎが', tier: 2, type: 'robot' },
  { id: 5, name: 'りーふ', tier: 2, type: 'plant' },
  { id: 11, name: 'ばぶる', tier: 2, type: 'slime' },
  { id: 13, name: 'すぺくと', tier: 2, type: 'ghost' },
  { id: 6, name: 'がるごす', tier: 3, type: 'beast' },
  { id: 7, name: 'るなりす', tier: 3, type: 'ghost' },
  { id: 8, name: 'べくたー', tier: 3, type: 'robot' },
  { id: 9, name: 'ふろーら', tier: 3, type: 'plant' },
  { id: 10, name: 'ぜにす', tier: 3, type: 'bird' },
  { id: 12, name: 'どらご', tier: 3, type: 'beast' },
  { id: 14, name: 'さいばー', tier: 3, type: 'robot' },
  { id: 15, name: 'うっど', tier: 3, type: 'plant' },
  { id: 16, name: 'すかい', tier: 3, type: 'bird' },
  { id: 17, name: 'ぐみぃ', tier: 3, type: 'slime' },
  { id: 18, name: 'れお', tier: 4, type: 'beast' },
  { id: 19, name: 'しゃどう', tier: 4, type: 'ghost' },
  { id: 20, name: 'ぷろと', tier: 4, type: 'robot' },
  { id: 21, name: 'かくたす', tier: 4, type: 'plant' },
  { id: 22, name: 'ほーく', tier: 4, type: 'bird' },
  { id: 23, name: 'すらい', tier: 4, type: 'slime' },
  { id: 24, name: 'たいが', tier: 4, type: 'beast' },
  { id: 25, name: 'ふぁんと', tier: 4, type: 'ghost' },
  { id: 26, name: 'めた', tier: 4, type: 'robot' },
  { id: 27, name: 'ろーず', tier: 4, type: 'plant' },
  { id: 28, name: 'いーぐる', tier: 4, type: 'bird' },
  { id: 29, name: 'くりあ', tier: 4, type: 'slime' }
];

export const MENU_ITEMS = [
  { id: 'feed', label: 'ごはん' },
  { id: 'clean', label: 'そうじ' },
  { id: 'game', label: 'あそぶ' },
  { id: 'status', label: 'じょうたい' },
  { id: 'heal', label: 'ちりょう' },
  { id: 'clock', label: 'とけい' }
];

const paramY = (y: number, start: number, range: number) => Math.sin(((y - start) / range) * Math.PI);

export const getPixelData = (id: number, frame: number, isEating: boolean = false): number[][] => {
  const grid = Array(32).fill(0).map(() => Array(32).fill(0));
  const setPixel = (y: number, x: number, val: number) => {
    if (y >= 0 && y < 32 && x >= 0 && x < 32) grid[y][x] = val;
  };

  if (id === 999) {
    for (let y = 10; y < 28; y++) {
      const w = y < 15 ? Math.floor((y - 10) * 1.5) : 8;
      for (let x = 16 - w; x < 16 + w; x++) setPixel(y, x, 1);
    }
    for (let i = -2; i <= 2; i++) {
      setPixel(18, 16 + i, 2);
      setPixel(19, 16 + i, 2);
      setPixel(17 + i, 16, 2);
    }
    return grid;
  }

  const pet = PETS.find(p => p.id === id) || PETS[0];
  const bounce = (frame < 4 && frame % 2 !== 0) ? -1 : 0;
  const baseColor = 1;

  const drawBase = (y: number, x: number, w: number, h: number, type: 'rect'|'circle'|'pointy'|'slime') => {
    for (let dy = 0; dy < h; dy++) {
      let width = w;
      if (type === 'circle') width = Math.floor(paramY(dy, 0, h) * w);
      if (type === 'pointy') width = Math.floor((dy / h) * w);
      if (type === 'slime') width = Math.floor(Math.sqrt(Math.max(0, 1 - Math.pow((dy - h/2)/(h/2), 2))) * w);
      for (let dx = -width; dx < width; dx++) setPixel(y + dy, x + dx, baseColor);
    }
  };

  if (pet.tier === 0) {
    for (let y = 10; y < 26; y++) {
      const w = Math.floor(paramY(y, 10, 16) * 9);
      for (let x = 16 - w; x < 16 + w; x++) setPixel(y + (frame % 2), x, baseColor);
    }
    for (let i = 0; i < 3; i++) setPixel(14 + i + (frame % 2), 12, 2);
    return grid;
  }

  const hY = 10 + bounce;
  const isBlink = frame === 2 && !isEating;

  switch(id) {
    case 1: drawBase(hY, 16, 9, 14, 'slime'); break;
    case 2:
      drawBase(hY, 16, 11, 12, 'rect');
      for(let i=0; i<5; i++) { setPixel(hY-i, 8, baseColor); setPixel(hY-i, 24, baseColor); }
      break;
    case 3:
      drawBase(hY, 16, 10, 10, 'circle');
      for(let i=0; i<4; i++) setPixel(hY-i, 16, baseColor);
      break;
    case 4:
      drawBase(hY, 16, 12, 12, 'rect');
      setPixel(hY-2, 16, baseColor); setPixel(hY-3, 16, baseColor);
      break;
    case 5:
      drawBase(hY, 16, 8, 14, 'pointy');
      setPixel(hY-2, 14, baseColor); setPixel(hY-3, 13, baseColor);
      break;
    case 11:
      drawBase(hY, 16, 12, 10, 'circle');
      setPixel(hY+2, 22, baseColor);
      break;
    case 13:
      drawBase(hY, 16, 8, 14, 'pointy');
      for(let i=0; i<4; i++) setPixel(hY+14+i, 16+(i%2), baseColor);
      break;
    case 6:
      drawBase(hY, 16, 14, 16, 'rect');
      for(let i=0; i<6; i++){ setPixel(hY-i, 5, baseColor); setPixel(hY-i, 27, baseColor); }
      break;
    case 7:
      drawBase(hY, 16, 15, 15, 'circle');
      for(let x=8; x<24; x++) setPixel(hY-2, x, baseColor);
      break;
    case 8:
      drawBase(hY, 16, 15, 15, 'rect');
      for(let i=0; i<15; i++) { setPixel(hY+i, 4, baseColor); setPixel(hY+i, 28, baseColor); }
      break;
    case 9:
      drawBase(hY, 16, 10, 14, 'pointy');
      for(let i=-3; i<4; i++) { setPixel(hY, 16+i, baseColor); setPixel(hY+i, 16, baseColor); }
      break;
    case 10:
      drawBase(hY, 16, 12, 12, 'circle');
      for(let i=0; i<8; i++) { setPixel(hY+i, 2, baseColor); setPixel(hY+i, 30, baseColor); }
      break;
    case 12:
      drawBase(hY, 16, 14, 15, 'slime');
      for(let i=0; i<6; i++){ setPixel(hY-i, 10-i, baseColor); setPixel(hY-i, 22+i, baseColor); }
      break;
    case 14:
      drawBase(hY, 16, 14, 14, 'rect');
      for(let y=hY-4; y<hY; y++){ setPixel(y, 10, baseColor); setPixel(y, 22, baseColor); }
      break;
    case 15:
      drawBase(hY, 14, 8, 18, 'rect');
      for(let y=hY-4; y<hY+4; y++) for(let x=8; x<24; x++) setPixel(y, x, baseColor);
      break;
    case 16:
      drawBase(hY, 16, 14, 10, 'circle');
      setPixel(hY-1, 16, baseColor); setPixel(hY-2, 16, baseColor);
      break;
    case 17:
      drawBase(hY, 16, 15, 12, 'slime');
      setPixel(hY-2, 12, baseColor); setPixel(hY-2, 20, baseColor);
      break;
    case 18:
      drawBase(hY, 16, 15, 15, 'rect');
      for(let y=hY-2; y<hY+17; y++) { setPixel(y, 5, baseColor); setPixel(y, 27, baseColor); }
      break;
    case 19:
      drawBase(hY, 16, 13, 16, 'pointy');
      for(let i=0; i<5; i++) setPixel(hY+16+i, 10+i*2, baseColor);
      break;
    case 20:
      drawBase(hY, 16, 12, 16, 'rect');
      for(let x=10; x<22; x++) setPixel(hY+4, x, 2);
      break;
    case 21:
      drawBase(hY, 16, 12, 18, 'rect');
      setPixel(hY+5, 8, baseColor); setPixel(hY+10, 24, baseColor);
      break;
    case 22:
      drawBase(hY, 16, 14, 12, 'circle');
      for(let x=4; x<28; x++) setPixel(hY+6, x, baseColor);
      break;
    case 23:
      drawBase(hY, 16, 16, 14, 'slime');
      for(let i=0; i<10; i++) setPixel(hY+(i%3), 16+(i%5), 2);
      break;
    case 24:
      drawBase(hY, 16, 15, 15, 'rect');
      for(let i=0; i<5; i++) setPixel(hY+4+i, 10, 2);
      break;
    case 25:
      drawBase(hY, 16, 14, 18, 'pointy');
      for(let i=0; i<6; i++) { setPixel(hY-2, 16+i, baseColor); setPixel(hY-2, 16-i, baseColor); }
      break;
    case 26:
      drawBase(hY, 16, 15, 15, 'rect');
      for(let y=hY; y<hY+15; y++) for(let x=15; x<18; x++) setPixel(y, x, 2);
      break;
    case 27:
      drawBase(hY, 16, 12, 15, 'circle');
      for(let i=0; i<3; i++) { setPixel(hY-i, 16-i, baseColor); setPixel(hY-i, 16+i, baseColor); }
      break;
    case 28:
      drawBase(hY, 16, 16, 14, 'circle');
      for(let i=0; i<6; i++) { setPixel(hY-i, 16, baseColor); }
      break;
    case 29:
      drawBase(hY, 16, 14, 16, 'slime');
      for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
          if(grid[y][x] === 1 && (x+y)%2===0) grid[y][x] = 2;
        }
      }
      break;
    default: drawBase(hY, 16, 12, 14, 'circle');
  }

  // あっち向いてホイの方向用オフセット (frame 4-7)
  let offX = 0;
  let offY = 0;
  if (frame === 4) offY = -3; // UP
  if (frame === 5) offY = 3;  // DOWN
  if (frame === 6) offX = -4; // LEFT
  if (frame === 7) offX = 4;  // RIGHT

  const eyeY = hY + (id % 2 === 0 ? 5 : 4) + offY;
  const eyeX1 = 16 - (id % 5 + 3) + offX;
  const eyeX2 = 16 + (id % 5 + 3) + offX;

  if (isBlink) {
    setPixel(eyeY, eyeX1, 2); 
    setPixel(eyeY, eyeX2, 2);
  } else {
    setPixel(eyeY-1, eyeX1, 2); setPixel(eyeY, eyeX1, 2); setPixel(eyeY+1, eyeX1, 2);
    setPixel(eyeY-1, eyeX2, 2); setPixel(eyeY, eyeX2, 2); setPixel(eyeY+1, eyeX2, 2);
  }
  
  if (isEating) {
    for(let y=eyeY+3; y<eyeY+6; y++) 
      for(let x=14+offX; x<18+offX; x++) setPixel(y, x, 2);
  } else {
    setPixel(eyeY+4, 15+offX, 2); setPixel(eyeY+4, 17+offX, 2);
  }

  return grid;
};

export const getIconPixelData = (index: number, selected: boolean): number[][] => {
  const grid = Array(8).fill(0).map(() => Array(8).fill(0));
  const setP = (y: number, x: number) => { if (y >= 0 && y < 8 && x >= 0 && x < 8) grid[y][x] = 1; };
  switch (index) {
    case 0:
      setP(4, 1); setP(4, 6); setP(5, 1); setP(5, 6); setP(6, 2); setP(6, 3); setP(6, 4); setP(6, 5);
      setP(3, 2); setP(3, 5); setP(2, 3); setP(2, 4); break;
    case 1:
      setP(2, 5); setP(3, 4); setP(4, 3); setP(5, 2); setP(6, 1);
      setP(1, 5); setP(2, 6); setP(5, 1); setP(6, 2); break;
    case 2:
      setP(1, 1); setP(1, 6); setP(6, 1); setP(6, 6); setP(1, 2); setP(1, 3); setP(1, 4); setP(1, 5);
      setP(6, 2); setP(6, 3); setP(6, 4); setP(6, 5); setP(2, 1); setP(3, 1); setP(4, 1); setP(5, 1);
      setP(2, 6); setP(3, 6); setP(4, 6); setP(5, 6); setP(3, 3); break;
    case 3:
      setP(1, 3); setP(1, 4); setP(1, 5); setP(2, 2); setP(2, 6); setP(3, 2); setP(3, 6); setP(4, 2); setP(4, 6);
      setP(5, 3); setP(5, 4); setP(5, 5); setP(6, 6); setP(7, 7); break;
    case 4:
      setP(3, 1); setP(3, 2); setP(3, 3); setP(3, 4); setP(3, 5); setP(1, 3); setP(2, 3); setP(4, 3); setP(5, 3); break;
    case 5:
      setP(1, 3); setP(1, 4); setP(2, 2); setP(2, 5); setP(3, 1); setP(3, 6); setP(4, 1); setP(4, 6);
      setP(5, 2); setP(5, 5); setP(6, 3); setP(6, 4); setP(3, 3); setP(3, 4); break;
  }
  if (selected) {
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) grid[y][x] = grid[y][x] === 1 ? 2 : 1;
  }
  return grid;
};

export const getItemPixelData = (type: 'fruit' | 'bad' | 'poop' | 'sick' | 'heart' | 'hunger'): number[][] => {
  const grid = Array(16).fill(0).map(() => Array(16).fill(0));
  const setP = (y: number, x: number, val: number = 1) => { if (y >= 0 && y < 16 && x >= 0 && x < 16) grid[y][x] = val; };
  switch (type) {
    case 'fruit':
      for (let y = 7; y < 15; y++) {
        const w = Math.floor(paramY(y, 7, 7) * 6) + 1;
        for (let x = 8 - w; x < 8 + w; x++) { if (y === 7 && (x === 7 || x === 8)) continue; setP(y, x); }
      }
      setP(6, 7); setP(5, 7); setP(4, 8); setP(4, 9); setP(5, 10); setP(6, 11); setP(5, 9); setP(6, 10);
      break;
    case 'bad':
      for (let y = 7; y < 15; y++) {
        for (let x = 4; x < 13; x++) {
          if (Math.sqrt(Math.pow(y - 11, 2) + Math.pow(x - 8, 2)) < 4.2) setP(y, x);
        }
      }
      setP(10, 7, 2); setP(11, 7, 2); setP(6, 8); setP(5, 9); setP(4, 10); 
      setP(3, 10, 2); setP(4, 9, 2); setP(4, 11, 2); setP(5, 10, 2); 
      setP(2, 10); setP(3, 11); setP(3, 9);
      break;
    case 'poop':
      for (let y = 10; y < 14; y++) for (let x = 4; x < 12; x++) setP(y, x);
      for (let y = 7; y < 10; y++) for (let x = 6; x < 10; x++) setP(y, x);
      setP(5, 7); setP(6, 7); setP(6, 8); break;
    case 'sick':
      for (let y = 2; y < 11; y++) { setP(y, 7); setP(y, 8); }
      setP(13, 7); setP(13, 8); setP(14, 7); setP(14, 8); break;
    case 'heart':
      for (let y = 4; y < 12; y++) {
        const w = y < 7 ? 4 : 12 - y;
        for (let x = 8 - w; x < 8 + w; x++) { if (y === 4 && (x === 7 || x === 8)) continue; setP(y, x); }
      }
      break;
    case 'hunger':
      for (let y = 4; y < 14; y++) {
        const w = Math.floor((y - 4) * 0.8);
        for (let x = 8 - w; x < 8 + w; x++) setP(y, x);
      }
      for (let y = 10; y < 14; y++) for (let x = 7; x < 9; x++) setP(y, x, 2);
      break;
  }
  return grid;
};

export const getHandPixelData = (hand: number): number[][] => {
  const grid = Array(24).fill(0).map(() => Array(24).fill(0));
  const setP = (y: number, x: number, val: number = 1) => { if (y >= 0 && y < 24 && x >= 0 && x < 24) grid[y][x] = val; };
  if (hand === 0) {
    for (let y = 8; y < 18; y++) for (let x = 6; x < 18; x++) {
      if (Math.sqrt(Math.pow(y - 13, 2) + Math.pow(x - 12, 2)) < 6) setP(y, x);
    }
  } else if (hand === 1) {
    for (let y = 12; y < 20; y++) for (let x = 8; x < 16; x++) setP(y, x);
    for (let y = 4; y < 12; y++) { setP(y, 9); setP(y, 10); setP(y, 13); setP(y, 14); }
  } else {
    for (let y = 10; y < 20; y++) for (let x = 8; x < 16; x++) setP(y, x);
    for (let y = 4; y < 10; y++) { setP(y, 8); setP(y, 10); setP(y, 12); setP(y, 14); setP(y, 16); }
  }
  return grid;
};

export const getEmotionPixelData = (type: string): number[][] => {
  const grid = Array(16).fill(0).map(() => Array(16).fill(0));
  const setP = (y: number, x: number, val: number = 1) => { if (y >= 0 && y < 16 && x >= 0 && x < 16) grid[y][x] = val; };
  if (type === 'HEART') {
    for (let y = 4; y < 12; y++) {
      const w = y < 7 ? 4 : 12 - y;
      for (let x = 8 - w; x < 8 + w; x++) { if (y === 4 && (x === 7 || x === 8)) continue; setP(y, x); }
    }
  } else if (type === 'SWEAT') {
    for (let x = 5; x < 9; x++) { setP(4, x); setP(5, x); setP(6, x); }
    setP(7, 6); setP(7, 7); setP(8, 6);
  } else if (type === 'SPARKLE') {
    for (let i = 4; i < 12; i++) { setP(i, 8); setP(8, i); }
    setP(7, 7); setP(7, 9); setP(9, 7); setP(9, 9);
  } else if (type === 'SURPRISE') {
    for (let y = 2; y < 10; y++) { setP(y, 7); setP(y, 8); }
    setP(12, 7); setP(12, 8); setP(13, 7); setP(13, 8);
  }
  return grid;
};

export const getArrowPixelData = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'): number[][] => {
  const grid = Array(8).fill(0).map(() => Array(8).fill(0));
  const setP = (y: number, x: number) => { if (y >= 0 && y < 8 && x >= 0 && x < 8) grid[y][x] = 1; };
  if (dir === 'UP') {
    setP(1, 4); setP(2, 3); setP(2, 4); setP(2, 5); setP(3, 2); setP(3, 3); setP(3, 4); setP(3, 5); setP(3, 6); 
    setP(4, 4); setP(5, 4); setP(6, 4);
  } else if (dir === 'DOWN') {
    setP(6, 4); setP(5, 3); setP(5, 4); setP(5, 5); setP(4, 2); setP(4, 3); setP(4, 4); setP(4, 5); setP(4, 6); 
    setP(3, 4); setP(2, 4); setP(1, 4);
  } else if (dir === 'LEFT') {
    setP(4, 1); setP(3, 2); setP(4, 2); setP(5, 2); setP(2, 3); setP(3, 3); setP(4, 3); setP(5, 3); setP(6, 3); 
    setP(4, 4); setP(4, 5); setP(4, 6);
  } else if (dir === 'RIGHT') {
    setP(4, 6); setP(3, 5); setP(4, 5); setP(5, 5); setP(2, 4); setP(3, 4); setP(4, 4); setP(5, 4); setP(6, 4); 
    setP(4, 3); setP(4, 2); setP(4, 1);
  }
  return grid;
};
