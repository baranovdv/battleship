import { ERROR_COMMAND_MESSAGE } from '../data/data';
import {
  MessageAddress,
  MessageTypesForAll,
  MessageTypesGameRoom,
  MessageTypesPersonal,
} from '../data/enums';
import {
  Commands,
  GamePlayer,
  GameRoom,
  HandleAttackResponse,
  Message,
  MessageToSend,
  TurnData,
} from '../data/types';
import State, { IState } from '../state/state';
import AbstractController from './abstract_controller/abstract_controller';
import GameController, {
  IGameController,
} from './game_controller/game_controller';
import RegController, { IRegController } from './reg_controller/reg_controller';
import RoomController, {
  IRoomController,
} from './room_controller/room_controller';

export interface IController {
  handleRequest: (request: string, id: number) => string[];
  cleanUp: (id: number) => void;
}

export default class Controller extends AbstractController {
  private state: IState;
  private messages: MessageToSend[];
  private reg_controller: IRegController;
  private room_controller: IRoomController;
  private game_controller: IGameController;

  constructor() {
    super();

    this.state = new State();
    this.messages = [];
    this.reg_controller = new RegController(this.state);
    this.room_controller = new RoomController(this.state);
    this.game_controller = new GameController(this.state);
  }

  public handleRequest(request: string, id: number) {
    try {
      const parsedRequest: Message = JSON.parse(request);

      const command: Commands = parsedRequest.type;
      const data = parsedRequest.data;

      console.log(command, data);
      switch (command) {
        case 'reg':
          {
            const regResponse = this.reg_controller.getRegResponse(data, id);

            const message = this.createMessage(
              MessageTypesPersonal.reg,
              regResponse
            );
            this.addMessage({ message });

            this.updateRoom();
          }
          break;

        case 'create_room':
          {
            this.room_controller.createRoom(id);

            this.updateRoom();
          }
          break;

        case 'add_user_to_room':
          {
            const gameData = this.room_controller.addUserToRoom(data, id);

            if (gameData) {
              gameData.playerIds.forEach((id) => {
                gameData.data.idPlayer = id;

                const message = this.createMessage(
                  MessageTypesGameRoom.create_game,
                  JSON.stringify(gameData.data)
                );
                this.addMessage({ message, address: id });
              });
            }

            this.updateRoom();
          }
          break;

        case 'add_ships':
          {
            const gameId = this.game_controller.addPlayerShips(data);

            if (gameId === null) break;

            const gamePlayers: GamePlayer[] =
              this.state.getGame(gameId).gamePlayers;

            gamePlayers.forEach((player) => {
              const message = this.createMessage(
                MessageTypesGameRoom.start_game,
                JSON.stringify(player)
              );

              this.addMessage({ message, address: player.indexPlayer });
            });

            this.turn(gameId);
          }
          break;

        case 'attack':
          {
            const { attackFeedback, gameId, splash }: HandleAttackResponse =
              this.game_controller.handleAttack(data);

            if (attackFeedback.status === 'fail') return [];

            const gamePlayers: GamePlayer[] =
              this.state.getGame(gameId).gamePlayers;

            gamePlayers.forEach((player) => {
              const message = this.createMessage(
                MessageTypesGameRoom.attack,
                JSON.stringify(attackFeedback)
              );

              this.addMessage({ message, address: player.indexPlayer });
            });

            if (attackFeedback.status === 'killed') {
              const splashAttackFeedback = JSON.parse(
                JSON.stringify(attackFeedback)
              );

              splashAttackFeedback.status = 'miss';

              splash?.forEach((coord) => {
                const [x, y] = coord.split(':');

                splashAttackFeedback.position.x = +x;
                splashAttackFeedback.position.y = +y;

                gamePlayers.forEach((player) => {
                  const message = this.createMessage(
                    MessageTypesGameRoom.attack,
                    JSON.stringify(splashAttackFeedback)
                  );

                  this.addMessage({ message, address: player.indexPlayer });
                });
              });
            }

            this.turn(gameId, attackFeedback.status === 'miss');
          }
          break;

        default:
          throw new Error(ERROR_COMMAND_MESSAGE);
      }

      return this.deliverMessages();
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  public cleanUp(id: number) {
    this.state.removePlayerActive(id);
    this.state.checkRooms(id);
  }

  private addMessage(message: MessageToSend) {
    this.messages.push(message);
  }

  private clearMessages(): void {
    this.messages = [];
  }

  private turn(gameId: number, isChangeTurn?: boolean) {
    const gameRoom: GameRoom = this.state.getGame(gameId);

    if (isChangeTurn) {
      gameRoom.currentTurn = Number(!gameRoom.currentTurn);
    }

    const currentTurnPlayerId: number =
      gameRoom.gamePlayers[gameRoom.currentTurn].indexPlayer;

    const turnData: TurnData = {
      currentPlayer: currentTurnPlayerId,
    };

    gameRoom.gamePlayers.forEach((player) => {
      const message = this.createMessage(
        MessageTypesGameRoom.turn,
        JSON.stringify(turnData)
      );

      this.addMessage({ message, address: player.indexPlayer });
    });
  }

  private updateRoom(): void {
    const roomData = this.room_controller.getRoomsData();

    const message = this.createMessage(
      MessageTypesForAll.update_room,
      roomData
    );

    this.addMessage({ message, address: MessageAddress.ALL });
  }

  private deliverMessages(): MessageToSend[] {
    const messageBuffer = [...this.messages];

    this.clearMessages();

    return messageBuffer;
  }
}
