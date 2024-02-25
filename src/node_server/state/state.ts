import {
  AppState,
  GameData,
  GamePlayer,
  GameRoom,
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
  checkRooms: (id: number) => void;

  getGame: (gameId: number) => GamePlayer[];
  addGame: (game: GameRoom) => void;
  addShips: (gameData: GameData) => boolean;
}

export default class State implements IState {
  private state: AppState;
  private rooms: RoomData[];
  private games: GameRoom;
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

  public checkRooms(id: number) {
    const rooms = this.rooms.filter((room) => room.roomUsers[0].index === id);

    if (rooms) {
      rooms.forEach((room) => {
        this.deleteRoom(room.roomId);
      });
    }
  }

  public deleteRoom(roomId: number): void {
    const roomIndex = this.rooms.findIndex((room) => room.roomId === roomId);

    if (roomIndex < 0) return;

    this.rooms.splice(roomIndex, 1);
  }

  public getGame(gameId: number): GamePlayer[] {
    const gamePlayers = this.games[gameId];

    return gamePlayers;
  }

  public addGame(game: GameRoom): void {
    this.games = { ...this.games, ...game };
  }

  public addShips(gameData: GameData): boolean {
    const gamePlayer: GamePlayer = {
      ships: gameData.ships,
      indexPlayer: gameData.indexPlayer,
    };

    this.games[gameData.gameId].push(gamePlayer);

    return this.games[gameData.gameId].length === 2;
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
