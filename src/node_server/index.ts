import ws from 'ws';
import Controller from './controller/controller';
import { MessageAddress } from './data/enums';
import { CLIENTS_COUNTER_START_NUM, SERVER_PORT } from './data/data';

export default function nodeServer() {
  const controller = new Controller();

  const clients: Record<number, ws> = {};

  let clientsCounter = CLIENTS_COUNTER_START_NUM;

  const wss = new ws.Server({ port: SERVER_PORT });

  console.log(`Websocket is started on localhost:${SERVER_PORT}`);

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
