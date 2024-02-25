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

// const loginOrCreateRequest: LoginOrCreateRequest = JSON.parse(
//   data.toString()
// );

// const loginOrCreateRequestData: LoginOrCreateRequestData = JSON.parse(
//   loginOrCreateRequest.data
// );

// console.log(data.toString());
// console.log(loginOrCreateRequestData.name);

// const loginOrCreateResponseData: LoginOrCreateResponseData = {
//   name: loginOrCreateRequestData.name,
//   index: 55545,
//   error: false,
//   errorText: '',
// };

// const loginOrCreateResponse: LoginOrCreateResponse = {
//   type: MessageTypesPersonal.reg,
//   data: JSON.stringify(loginOrCreateResponseData),
//   id: 0,
// };

// const updateWinnersResponseData: WinnerData[] = [];

// const updateWinnersResponse: UpdateWinnersResponse = {
//   type: MessageTypesForAll.update_winners,
//   data: JSON.stringify(updateWinnersResponseData),
//   id: 0,
// };

// const updateRoomResponseData: RoomsData[] = [];

// const updateRoomResponse: UpdateRoomResponse = {
//   type: MessageTypesForAll.update_room,
//   data: JSON.stringify(updateRoomResponseData),
//   id: 0,
// };

// ws.send(JSON.stringify(loginOrCreateResponse));
// ws.send(JSON.stringify(updateWinnersResponse));
// ws.send(JSON.stringify(updateRoomResponse));
