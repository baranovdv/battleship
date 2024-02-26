import ws from 'ws';
import Controller from './controller/controller';
import { MessageAddress } from './data/enums';

export default function nodeServer() {
  const controller = new Controller();

  const clients: Record<number, ws> = {};

  let clientsCounter = 2;

  const wss = new ws.Server({ port: 3000 });

  wss.on('connection', (ws) => {
    const id = clientsCounter;

    clientsCounter += 1;

    clients[id] = ws;

    console.log(`Connected with id ${id}`);

    ws.on('message', (data) => {
      try {
        const messages = controller.handleRequest(data.toString(), id);

        messages.forEach((message) => {
          if (message.address === MessageAddress.ALL) {
            for (const id in clients) {
              clients[id].send(message.message);
            }
          } else if (message.address === MessageAddress.BOT) {
            // const botMessage = JSON.parse(message.message) as Message;

            // if (botMessage.type === 'turn') {
            //   const turnData: TurnData = JSON.parse(
            //     botMessage.data
            //   ) as TurnData;
            //   if (turnData.currentPlayer === MessageAddress.BOT) {

            //   }
            // }

            return;
          } else if (typeof message.address === 'number') {
            clients[message.address].send(message.message);
          } else {
            ws.send(message.message);
          }
        });
      } catch (error) {
        console.log((error as Error).message);
      }
    });

    ws.on('close', () => {
      controller.cleanUp(id);

      delete clients[id];

      console.log(`Connection with id ${id} closed`);
    });
  });
}

nodeServer();
