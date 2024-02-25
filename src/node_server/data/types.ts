import {
  MessageTypesForAll,
  MessageTypesGameRoom,
  MessageTypesPersonal,
} from './enums';

export type Message = {
  type: Commands;
  data: string;
  id: number;
};

export type MessageToSend = {
  message: string;
  address?: number;
};

export type WinnerData = {
  name: string;
  wins: number;
};

export type RoomUser = {
  name: string;
  index: number;
};

export type RoomData = {
  roomId: number;
  roomUsers: RoomUser[];
};

export type ShipData = {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
};

export type GameField = number[][];

export type CellCoords = {
  x: number;
  y: number;
};

export type GameRooms = Record<number, GameRoom>;

export type GameRoom = {
  gamePlayers: GamePlayer[];
  currentTurn: number;
  gameFields: GameField[];
};

export type GamePlayer = {
  ships: ShipData[];
  indexPlayer: number;
};

export type GameData = {
  gameId: number;
  ships: ShipData[];
  indexPlayer: number;
};

export type TurnData = {
  currentPlayer: number;
};

export type AttackResult = 'miss' | 'killed' | 'shot' | 'fail';

export type AttackFeedbackData = {
  position: {
    x: number;
    y: number;
  };
  currentPlayer: number;
  status: AttackResult;
};

export type HandleAttackResponse = {
  attackFeedback: AttackFeedbackData;
  gameId: number;
  splash?: Set<string>;
  shot?: Set<string>;
};

export type AttackData = {
  gameId: number;
  x: number;
  y: number;
  indexPlayer: number;
};

export type RandomAttackData = {
  gameId: number;
  indexPlayer: number;
};

export type PlayerData = {
  name: string;
  password: string;
};

export type AddUserToRoomData = {
  indexRoom: number;
};

export type AddUserToRoomResponse = {
  data: CreateGameData;
  playerIds: number[];
};

export type CreateGameData = {
  idGame: number;
  idPlayer: number;
};

export type LoginOrCreateRequestData = {
  name: string;
  password: string;
};

export type LoginOrCreateResponseData = {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
};

export type AppState = 'main' | 'room' | 'game';

export type GameRoomCommands = keyof typeof MessageTypesGameRoom;
export type PersonalCommands = keyof typeof MessageTypesPersonal;
export type ForAllCommands = keyof typeof MessageTypesForAll;

export type Commands = GameRoomCommands | PersonalCommands | ForAllCommands;
