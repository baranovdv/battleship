import { GameData } from '../../data/types';
import { IState } from '../../state/state';

export interface IGameController {
  addPlayerShips: (data: string) => number | null;
}

export default class GameController implements IGameController {
  private state: IState;

  constructor(state: IState) {
    this.state = state;
  }

  public addPlayerShips(data: string): number | null {
    const ships = JSON.parse(data) as GameData;

    const isPlayersReady = this.state.addShips(ships);

    return isPlayersReady ? ships.gameId : null;
  }
}
