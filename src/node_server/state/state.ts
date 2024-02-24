import {
  AppState,
  PlayerData,
  RoomData,
  RoomUser,
  WinnerData,
} from '../data/types';

export interface IState {
  getState: () => AppState;

  getWinners: () => WinnerData[];

  getPlayersDB: () => PlayerData[];
  addPlayerDB: (player: PlayerData) => number;

  getPlayersActive: () => RoomUser[];
  getPlayerActive: (id: number) => RoomUser;
  addPlayerActive: (player: RoomUser) => void;
  removePlayerActive: (id: number) => void;

  getRooms: () => RoomData[];
  addRoom: (roomData: RoomData) => void;
  deleteRoom: (id: number) => void;

  addGame: (game: RoomData) => void;
}

export default class State implements IState {
  private state: AppState;
  private rooms: RoomData[];
  private games: RoomData[];
  private winners: WinnerData[];
  private playersDB: PlayerData[];
  private playersActive: RoomUser[];

  constructor() {
    this.state = 'main';
    this.rooms = [];
    this.games = [];
    this.winners = [];
    this.playersDB = [];
    this.playersActive = [];
  }

  public getState(): AppState {
    return this.state;
  }

  public getRooms(): RoomData[] {
    return this.rooms;
  }

  public addRoom(roomData: RoomData): void {
    this.rooms.push(roomData);
  }

  public deleteRoom(roomId: number): void {
    const roomIndex = this.rooms.findIndex((room) => (room.roomId = roomId));

    if (!roomIndex) throw new Error('Room DB error');

    this.rooms.splice(roomIndex, 1);
  }

  addGame(game: RoomData): void {
    this.games.push(game);
  }

  public getWinners(): WinnerData[] {
    return this.winners;
  }

  public getPlayersDB(): PlayerData[] {
    return this.playersDB;
  }

  public getPlayersActive(): RoomUser[] {
    return this.playersActive;
  }

  public getPlayerActive(id: number): RoomUser {
    const player = this.playersActive.find((player) => player.index === id);

    if (!player) throw new Error('DB Error');

    return player;
  }

  public addPlayerDB(player: PlayerData): number {
    this.playersDB.push(player);

    return this.playersDB.length - 1;
  }

  public removePlayerActive(id: number): void {
    const playerIndex = this.playersActive.findIndex(
      (player) => player.index === id
    );

    if (playerIndex < 0) throw new Error('DB Error');

    this.playersActive.splice(playerIndex, 1);
  }

  public addPlayerActive(player: RoomUser): void {
    this.playersActive.push(player);
  }
}

// {
//   type: "update_room",
//   data:
//       [
//           {
//               roomId: <number>,
//               roomUsers:
//                   [
//                       {
//                           name: <string>,
//                           index: <number>,
//                       }
//                   ],
//           },
//       ],
//   id: 0,
// }
