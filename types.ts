
export type CharacterId = number; // 0 to 29

export type ShellDesign = 'classic' | 'arctic' | 'atomic' | 'neon' | 'carbon' | 'sakura';

export type AppMode = 
  | 'LOGO' 
  | 'CLOCK' 
  | 'MENU' 
  | 'ROOM' 
  | 'TALK' 
  | 'TEACH' 
  | 'STATUS' 
  | 'EVO_READY'
  | 'EVO_CHOICE'  // どっちに進化するか選ぶモード
  | 'EVO' 
  | 'DEAD' 
  | 'LIFE_END'     // 寿命到達
  | 'BREEDING'    // 掛け合わせ選択
  | 'GAME_SELECT'
  | 'GAME_CATCH'
  | 'GAME_ACCHI'
  | 'GAME_JANKEN';

export type EmotionType = 'HEART' | 'SWEAT' | 'SPARKLE' | 'SURPRISE' | null;

export interface PetStats {
  hunger: number;
  happiness: number;
  hygiene: number;
  energy: number;
  age: number;
  poopCount: number;
  poopPositions: { x: number; y: number }[];
  isSick: boolean;
  training: number;
}

export interface LegacyPet {
  id: number;
  name: string;
  generation: number;
  finalTraining: number;
}

export interface WordEntry {
  word: string;
  category: string;
}

export interface GameState {
  characterId: CharacterId;
  pendingEvoId: CharacterId | null;
  stats: PetStats;
  taughtWords: WordEntry[];
  mode: AppMode;
  selectedMenuIndex: number;
  pos: { x: number; y: number };
  targetPos: { x: number; y: number };
  emotion: EmotionType;
  generation: number;
  legacy: LegacyPet[];
  shellDesign: ShellDesign;
  lastTimestamp: number; // 進行状況保存用
}

export interface CharacterDef {
  id: number;
  name: string;
  tier: number; // 0: たまご, 1: よう体, 2: せいちょうき, 3: せいたい
  type: 'slime' | 'beast' | 'bird' | 'robot' | 'plant' | 'ghost';
}
