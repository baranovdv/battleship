import {
  AddUserToRoomData,
  AddUserToRoomResponse,
  CreateGameData,
  RoomData,
} from '../../data/types';
import { IState } from '../../state/state';

export interface IRoomController {
  createRoom: (id: number) => number | undefined;
  getRoomsData: () => string;
  addUserToRoom: (
    data: string,
    id: number
  ) => AddUserToRoomResponse | undefined;
}

export default class RoomController implements IRoomController {
  private state: IState;
  private roomsCounter: number;

  constructor(state: IState) {
    this.state = state;
    this.roomsCounter = 0;
  }

  public createRoom(id: number): number | undefined {
    if (this.checkIsUserInRoom(id)) return;

    const player = this.state.getPlayerActive(id);

    const roomId = this.roomsCounter;

    this.roomsCounter += 1;

    const roomUsers = [player];

    const roomData: RoomData = {
      roomId,
      roomUsers,
    };

    this.state.addRoom(roomData);

    console.log(`Room with ${roomId} is created `);

    return roomId;
  }

  public addUserToRoom(
    data: string,
    id: number
  ): AddUserToRoomResponse | undefined {
    const roomRequest = JSON.parse(data) as AddUserToRoomData;

    let roomData = this.state
      .getRooms()
      .find((room) => room.roomId === roomRequest.indexRoom);

    if (!roomData) throw new Error('No such room');

    roomData = JSON.parse(JSON.stringify(roomData));

    if (!roomData) throw new Error('No such room');

    const playerOneId = roomData.roomUsers[0].index;

    if (playerOneId === id) return;

    const player = this.state.getPlayerActive(id);

    roomData.roomUsers.push(player);

    this.state.deleteRoom(roomData.roomId);
    this.state.checkRooms(id);

    this.state.addGame({
      [roomData.roomId]: {
        gamePlayers: [],
        currentTurn: 0,
        gameFields: [],
      },
    });

    const createGameData: CreateGameData = {
      idGame: roomData.roomId,
      idPlayer: id,
    };

    console.log(`User with id ${id} added to room ${roomData.roomId}`);
    console.log(
      `Gameroom with id ${roomData.roomId} is created with players ${playerOneId} and ${id}`
    );

    return {
      data: createGameData,
      playerIds: [playerOneId, id],
    };
  }

  public getRoomsData(): string {
    const RoomsData: RoomData[] = this.state.getRooms();

    return JSON.stringify(RoomsData);
  }

  private checkIsUserInRoom(id: number): boolean {
    const userIndex = this.state
      .getRooms()
      .findIndex((room) => room.roomUsers[0].index === id);

    return userIndex >= 0;
  }
}
