import { MessageAddress } from '../../data/enums';
import { LoginOrCreateResponseData, PlayerData } from '../../data/types';
import { IState } from '../../state/state';

export interface IRegController {
  getRegResponse: (data: string, id: number) => string;
  createBot: () => void;
}

export default class RegController {
  private state: IState;

  constructor(state: IState) {
    this.state = state;
  }

  public getRegResponse(data: string, id: number): string {
    const player = JSON.parse(data) as PlayerData;

    const responseData: LoginOrCreateResponseData = {
      name: player.name,
      index: id,
      error: false,
      errorText: '',
    };

    if (!this.addPlayerDB(player)) {
      responseData.error = true;
      responseData.errorText = 'Wrong password';

      console.log(`User with id ${id} tryed login with wrong password`);

      return JSON.stringify(responseData);
    }

    if (!this.addPlayerActive(player.name, id)) {
      responseData.error = true;
      responseData.errorText = 'Player is in the game already';

      console.log(`User with id ${id} is already in the game`);

      return JSON.stringify(responseData);
    }

    console.log(`User with id ${id} logged in`);

    return JSON.stringify(responseData);
  }

  public createBot(): void {
    const bot: PlayerData = {
      name: 'Bot',
      password: 'password',
    };

    this.addPlayerDB(bot);
    this.addPlayerActive(bot.name, MessageAddress.BOT);
  }

  private addPlayerDB(player: PlayerData): boolean {
    const playerDB = this.state
      .getPlayersDB()
      .find((playerDB) => playerDB.name === player.name);

    if (!playerDB) {
      this.state.addPlayerDB(player);
    } else {
      if (playerDB.password !== player.password) return false;
    }

    return true;
  }

  private addPlayerActive(name: string, id: number): boolean {
    const isPlayerActiveExist = !!this.state
      .getPlayersActive()
      .find((playerActive) => playerActive.name === name);

    if (!isPlayerActiveExist) this.state.addPlayerActive({ name, index: id });

    return !isPlayerActiveExist;
  }
}
