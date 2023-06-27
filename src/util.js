export function getWebSocket() {
    const ws = new WebSocket(
      "ws://14.99.241.31:3000/apimarketdata/socket.io/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiJYNTAyX2RjMDEzOWQ2MmMyM2Q5MjYyMjM5MzciLCJwdWJsaWNLZXkiOiJkYzAxMzlkNjJjMjNkOTI2MjIzOTM3IiwiaWF0IjoxNjg2NjQyMjk0LCJleHAiOjE2ODY3Mjg2OTR9.DKgOvx5gLxF3_SWJl-7ZIUkDyV0DHbq2a1BCpNoi7-8&userID=X502&publishFormat=JSON&broadcastMode=Partial&transport=websocket&EIO=3"
    );
    return ws;
  }

  export const reconnect = () => {
    setTimeout(getWebSocket, 500);
  };
