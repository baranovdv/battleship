import ws from 'ws';

export default function nodeServer() {
  const wss = new ws.Server({ port: 3000 });

  wss.on('connection', (ws) => {
    console.log('Connected');

    ws.on('close', () => {
      console.log('Connection closed');
    });
  });
}

nodeServer();
