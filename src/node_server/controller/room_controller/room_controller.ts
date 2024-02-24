import { RoomData } from '../../data/types';
import { IState } from '../../state/state';

export interface IRoomController {
  createRoom: (id: number) => void;
  getRoomsData: () => string;
}

export default class RoomController implements IRoomController {
  private state: IState;

  constructor(state: IState) {
    this.state = state;
  }

  public createRoom(id: number): void {
    const player = this.state.getPlayerActive(id);

    const roomId = this.state.getRooms().length;

    const roomUsers = [player];

    const roomData: RoomData = {
      roomId,
      roomUsers,
    };

    this.state.addRoom(roomData);
  }

  public getRoomsData(): string {
    const RoomsData: RoomData[] = this.state.getRooms();

    return JSON.stringify(RoomsData);
  }
}
