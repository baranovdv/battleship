import { Message } from '../../data/types';
import { Commands } from '../../data/types';

export default class AbstractController {
  protected createMessage(command: Commands, data: string): string {
    const message: Message = {
      type: command,
      data,
      id: 0,
    };

    return JSON.stringify(message);
  }
}
