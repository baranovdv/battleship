import { BOT_SHIPS_LAYOUTS, ERROR_COMMAND_MESSAGE } from '../data/data';
import {
  MessageAddress,
  MessageTypesForAll,
  MessageTypesGameRoom,
  MessageTypesPersonal,
} from '../data/enums';
import {
  AddUserToRoomData,
  Commands,
  FinishGameData,
  GameData,
  GamePlayer,
  GameRoom,
  HandleAttackResponse,
  Message,
  MessageToSend,
  RandomAttackData,
  ShipData,
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

      console.log(`User with id ${id} invoke ${command}`);

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
            this.updateWinners();
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
            this.addUserToRoom(data, id);
          }
          break;

        case 'add_ships':
          {
            this.addShips(data);
          }
          break;

        case 'attack':
          {
            this.attack(data);
          }
          break;

        case 'randomAttack':
          {
            this.randomAttack(data);
          }
          break;

        case 'single_play':
          {
            this.state.checkRooms(id);

            const roomId = this.room_controller.createRoom(id);

            if (roomId === undefined) throw new Error('Bot creation error');

            this.reg_controller.createBot();

            const addBotToRoomData: AddUserToRoomData = {
              indexRoom: roomId,
            };

            const gameId = this.addUserToRoom(
              JSON.stringify(addBotToRoomData),
              MessageAddress.BOT
            );

            const ships: ShipData[] =
              BOT_SHIPS_LAYOUTS[
                Math.floor(Math.random() * BOT_SHIPS_LAYOUTS.length)
              ];

            const gameData: GameData = {
              gameId,
              ships,
              indexPlayer: MessageAddress.BOT,
            };

            this.addShips(JSON.stringify(gameData));
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
    this.state.checkGame(id);
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

    if (currentTurnPlayerId === MessageAddress.BOT) {
      const randomAttackData: RandomAttackData = {
        gameId,
        indexPlayer: currentTurnPlayerId,
      };

      this.randomAttack(JSON.stringify(randomAttackData));
    }
  }

  private attack(data: string): void {
    const { attackFeedback, gameId, splash, shot }: HandleAttackResponse =
      this.game_controller.handleAttack(data);

    if (attackFeedback.status === 'fail') return;

    const gameRoom: GameRoom = this.state.getGame(gameId);
    const gamePlayers: GamePlayer[] = gameRoom.gamePlayers;

    gamePlayers.forEach((player) => {
      const message = this.createMessage(
        MessageTypesGameRoom.attack,
        JSON.stringify(attackFeedback)
      );

      this.addMessage({ message, address: player.indexPlayer });
    });

    console.log(
      `User with id ${gamePlayers[gameRoom.currentTurn].indexPlayer} ${attackFeedback.status}`
    );

    if (
      attackFeedback.status === 'killed' ||
      attackFeedback.status === 'finish'
    ) {
      const shotAttackFeedback = JSON.parse(JSON.stringify(attackFeedback));

      shot?.forEach((coord) => {
        const [x, y] = coord.split(':');

        shotAttackFeedback.position.x = +x;
        shotAttackFeedback.position.y = +y;

        gamePlayers.forEach((player) => {
          const message = this.createMessage(
            MessageTypesGameRoom.attack,
            JSON.stringify(shotAttackFeedback)
          );

          this.addMessage({ message, address: player.indexPlayer });
        });
      });

      const splashAttackFeedback = JSON.parse(JSON.stringify(attackFeedback));

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

    if (attackFeedback.status === 'finish') {
      const winnerId = gamePlayers[gameRoom.currentTurn].indexPlayer;

      const player = this.state.getPlayerActive(winnerId);

      this.state.addWinner(player.name);

      const finishGameData: FinishGameData = {
        winPlayer: winnerId,
      };

      gamePlayers.forEach((player) => {
        const message = this.createMessage(
          MessageTypesGameRoom.finish,
          JSON.stringify(finishGameData)
        );

        this.addMessage({ message, address: player.indexPlayer });
      });

      this.updateWinners();

      this.state.checkGame(winnerId);

      return;
    }

    this.turn(gameId, attackFeedback.status === 'miss');
  }

  private addUserToRoom(data: string, id: number): number {
    const gameData = this.room_controller.addUserToRoom(data, id);

    if (gameData === undefined) throw new Error('Add user error');

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

    return gameData.data.idGame;
  }

  private addShips(data: string) {
    const gameId = this.game_controller.addPlayerShips(data);

    if (gameId === null) return;

    const gamePlayers: GamePlayer[] = this.state.getGame(gameId).gamePlayers;

    gamePlayers.forEach((player) => {
      const message = this.createMessage(
        MessageTypesGameRoom.start_game,
        JSON.stringify(player)
      );

      this.addMessage({ message, address: player.indexPlayer });
    });

    console.log(`Gameroom ${gameId} is in play!`);

    this.turn(gameId);
  }

  private randomAttack(data: string) {
    const randomAttackShot = this.game_controller.getRandomAttackShot(data);

    this.attack(randomAttackShot);
  }

  private deliverMessages(): MessageToSend[] {
    const messageBuffer = [...this.messages];

    this.clearMessages();

    return messageBuffer;
  }

  private updateRoom(): void {
    const roomData = this.room_controller.getRoomsData();

    const message = this.createMessage(
      MessageTypesForAll.update_room,
      roomData
    );

    this.addMessage({ message, address: MessageAddress.ALL });
  }

  private updateWinners() {
    const winners = this.state.getWinners();

    const message = this.createMessage(
      MessageTypesForAll.update_winners,
      JSON.stringify(winners)
    );

    this.addMessage({ message, address: MessageAddress.ALL });
  }
}
