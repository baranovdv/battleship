import {
  AttackData,
  AttackFeedbackData,
  AttackResult,
  CellCoords,
  GameData,
  GameField,
  GameRoom,
  HandleAttackResponse,
  RandomAttackData,
  ShipData,
} from '../../data/types';
import { IState } from '../../state/state';
import { SHIP_STATE } from '../../data/enums';

export interface IGameController {
  addPlayerShips: (data: string) => number | null;
  handleAttack: (data: string) => HandleAttackResponse;
  getRandomAttackShot: (data: string) => string;
}

export default class GameController implements IGameController {
  private state: IState;
  private splash: Set<string>;
  private shot: Set<string>;

  constructor(state: IState) {
    this.state = state;
    this.splash = new Set();
    this.shot = new Set();
  }

  public addPlayerShips(data: string): number | null {
    const ships = JSON.parse(data) as GameData;

    const isPlayersReady = this.state.addShips(ships);

    if (isPlayersReady) {
      const gameRoom = this.state.getGame(ships.gameId);

      gameRoom.gamePlayers.forEach((player) => {
        const field = this.createField(player.ships);

        gameRoom.gameFields.unshift(field);
      });
    }

    console.log(
      `User with id ${ships.indexPlayer} added ships to Gameroom ${ships.gameId}`
    );

    return isPlayersReady ? ships.gameId : null;
  }

  public handleAttack(data: string): HandleAttackResponse {
    const attackData = JSON.parse(data) as AttackData;

    const gameRoom = this.state.getGame(attackData.gameId);

    const currentPlayerId =
      gameRoom.gamePlayers[gameRoom.currentTurn].indexPlayer;

    if (currentPlayerId !== attackData.indexPlayer) {
      const attackFeedback: AttackFeedbackData = {
        position: {
          x: attackData.x,
          y: attackData.y,
        },
        currentPlayer: attackData.indexPlayer,
        status: 'fail',
      };

      return {
        attackFeedback,
        gameId: attackData.gameId,
      };
    }

    const attackResult: AttackResult = this.handleAttackCoords(
      gameRoom,
      attackData.x,
      attackData.y
    );

    const handleAttackResponse: AttackFeedbackData = {
      position: {
        x: attackData.x,
        y: attackData.y,
      },
      currentPlayer: attackData.indexPlayer,
      status: attackResult,
    };

    const isFinish = this.checkFinish(
      gameRoom.gameFields[gameRoom.currentTurn]
    );

    if (isFinish) {
      handleAttackResponse.status = 'finish';
    }

    return {
      attackFeedback: handleAttackResponse,
      gameId: attackData.gameId,
      splash: this.splash,
      shot: this.shot,
    };
  }

  public getRandomAttackShot(data: string): string {
    const randomAttackData: RandomAttackData = JSON.parse(
      data
    ) as RandomAttackData;

    const gameRoom = this.state.getGame(randomAttackData.gameId);

    const field = gameRoom.gameFields[gameRoom.currentTurn];

    const randomCoords: CellCoords = this.getRandomCoords(field);

    const attackData: AttackData = {
      ...randomAttackData,
      ...randomCoords,
    };

    return JSON.stringify(attackData);
  }

  private handleAttackCoords(
    gameRoom: GameRoom,
    x: number,
    y: number
  ): AttackResult {
    const field = gameRoom.gameFields[gameRoom.currentTurn];

    let result: AttackResult = 'fail';

    if (field[y][x] === SHIP_STATE.NO_SHIP) {
      result = 'miss';

      return result;
    }

    if (field[y][x] === SHIP_STATE.SHIP) {
      field[y][x] = SHIP_STATE.SHOT;

      this.splash.clear();
      this.shot.clear();

      result = this.checkOutside(field, x, y);
    }

    return result;
  }

  private checkOutside(
    field: GameField,
    x: number,
    y: number,
    xRecur?: number,
    yRecur?: number
  ): AttackResult {
    let result: AttackResult = 'killed';

    for (let i = y - 1; i <= y + 1; i++) {
      for (let j = x - 1; j <= x + 1; j++) {
        if (i === y && j === x) {
          continue;
        }

        if (i === yRecur && j === xRecur) {
          continue;
        }

        if (i < 0 || i >= field.length || j < 0 || j >= field.length) {
          continue;
        }

        if (field[i][j] === SHIP_STATE.NO_SHIP) {
          this.splash.add(`${j}:${i}`);
        }

        if (field[i][j] === SHIP_STATE.SHIP) {
          result = 'shot';
        }

        if (field[i][j] === SHIP_STATE.SHOT) {
          this.shot.add(`${j}:${i}`);
          this.shot.add(`${x}:${y}`);

          const recResult = this.checkOutside(field, j, i, x, y);
          result = recResult === 'shot' ? 'shot' : result;
        }
      }
    }

    return result;
  }

  private getRandomCoords(field: GameField): CellCoords {
    const cellCoords: CellCoords = {
      x: 0,
      y: 0,
    };

    let cellState = SHIP_STATE.SHOT;

    while (cellState === SHIP_STATE.SHOT) {
      cellCoords.x = Math.round(Math.random() * 9);
      cellCoords.y = Math.round(Math.random() * 9);

      cellState = field[cellCoords.y][cellCoords.x];
    }

    return cellCoords;
  }

  private createField(ships: ShipData[]): GameField {
    const field = Array(10)
      .fill(0)
      .map(() => Array(10).fill(0));

    ships.forEach((ship) => {
      const x = ship.position.x;
      const y = ship.position.y;

      if (!ship.direction) {
        for (let i = x; i < x + ship.length; i++) {
          field[y][i] = SHIP_STATE.SHIP;
        }
      } else {
        for (let i = y; i < y + ship.length; i++) {
          field[i][x] = SHIP_STATE.SHIP;
        }
      }
    });

    return field;
  }

  private checkFinish(field: GameField): boolean {
    let shipsCounter = 0;

    for (let i = 0; i < field.length; i++) {
      for (let j = 0; j < field[i].length; j++) {
        if (field[i][j] === SHIP_STATE.SHIP) {
          shipsCounter += 1;
        }
      }
    }

    return shipsCounter === 0;
  }
}
