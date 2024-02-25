import {
  AddUserToRoomData,
  AddUserToRoomResponse,
  CreateGameData,
  RoomData,
} from '../../data/types';
import { IState } from '../../state/state';

export interface IRoomController {
  createRoom: (id: number) => void;
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

  public createRoom(id: number): void {
    const player = this.state.getPlayerActive(id);

    const roomId = this.roomsCounter;

    this.roomsCounter += 1;

    const roomUsers = [player];

    const roomData: RoomData = {
      roomId,
      roomUsers,
    };

    this.state.addRoom(roomData);
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

    this.state.addGame({
      [roomData.roomId]: {
        GamePlayers: [],
        CurrentTurn: 0,
      },
    });

    const createGameData: CreateGameData = {
      idGame: roomData.roomId,
      idPlayer: id,
    };

    return {
      data: createGameData,
      playerIds: [playerOneId, id],
    };
  }

  public getRoomsData(): string {
    const RoomsData: RoomData[] = this.state.getRooms();

    return JSON.stringify(RoomsData);
  }
}
