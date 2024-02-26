import {
  GameData,
  GamePlayer,
  GameRoom,
  GameRooms,
  PlayerData,
  RoomData,
  RoomUser,
  WinnerData,
} from '../data/types';

export interface IState {
  getWinners: () => WinnerData[];
  addWinner: (winnerName: string) => void;

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

  getGame: (gameId: number) => GameRoom;
  addGame: (game: GameRooms) => void;
  addShips: (gameData: GameData) => boolean;
  checkGame: (id: number) => void;
  getSurrendedToPlayerId: (id: number) => number | null;
}

export default class State implements IState {
  private rooms: RoomData[];
  private games: GameRooms;
  private winners: WinnerData[];
  private playersDB: PlayerData[];
  private playersActive: RoomUser[];

  constructor() {
    this.rooms = [];
    this.games = {};
    this.winners = [];
    this.playersDB = [];
    this.playersActive = [];
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

  public getGame(gameId: number): GameRoom {
    const gameRoom = this.games[gameId];

    return gameRoom;
  }

  public addGame(game: GameRooms): void {
    this.games = { ...this.games, ...game };
  }

  public checkGame(id: number): void {
    const gamesToDelete: number[] = [];
    const games = Object.keys(this.games);

    games.forEach((gameId) => {
      const gamePlayers = this.games[+gameId].gamePlayers;

      gamePlayers.forEach((player) => {
        if (player.indexPlayer === id) {
          gamesToDelete.push(+gameId);
        }
      });
    });

    gamesToDelete.forEach((gameId) => {
      delete this.games[gameId];
    });
  }

  public getSurrendedToPlayerId(id: number): number | null {
    let result = null;
    const games = Object.keys(this.games);

    games.forEach((gameId) => {
      const gamePlayers = this.games[+gameId].gamePlayers;

      if (gamePlayers.length < 2) return;
      gamePlayers.forEach((player, index) => {
        if (player.indexPlayer === id) {
          result = gamePlayers[Number(!index)].indexPlayer;
        }
      });
    });

    return result;
  }

  public addShips(gameData: GameData): boolean {
    const gamePlayer: GamePlayer = {
      ships: gameData.ships,
      indexPlayer: gameData.indexPlayer,
    };

    this.games[gameData.gameId].gamePlayers.push(gamePlayer);

    return this.games[gameData.gameId].gamePlayers.length === 2;
  }

  public getWinners(): WinnerData[] {
    return this.winners;
  }

  public addWinner(winnerName: string): void {
    const winnerIndex = this.winners.findIndex(
      (winner) => winner.name === winnerName
    );

    if (winnerIndex < 0) {
      this.winners.push({
        name: winnerName,
        wins: 1,
      });
    } else {
      this.winners[winnerIndex].wins += 1;
    }
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
