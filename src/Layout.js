import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

function Layout() {
  useEffect(() => {
    let ws = null;
    let heartbeatInterval = null;

    const connectWebSocket = () => {
      ws = new WebSocket(
        "ws://14.99.241.31:3000/apimarketdata/socket.io/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiJYNTAyX2RjMDEzOWQ2MmMyM2Q5MjYyMjM5MzciLCJwdWJsaWNLZXkiOiJkYzAxMzlkNjJjMjNkOTI2MjIzOTM3IiwiaWF0IjoxNjkzNTUxMDgzLCJleHAiOjE2OTM2Mzc0ODN9.zent-s_KCJ9W-9NvZ7Y8iN4FN1WnkKGA2NrwGTWVvh0&userID=X502&publishFormat=JSON&broadcastMode=Full&transport=websocket&EIO=4"
      );

      ws.addEventListener("open", () => {
        console.log("WebSocket connection established");
      });

      ws.onmessage = (event) => {
        const receivedData = event.data;
        const messages = [receivedData];
        console.log(messages);
      };

      ws.addEventListener("close", (event) => {
        const { code, reason } = event;
        console.log(`WebSocket connection closed with code ${code}: ${reason}`);
        reconnect();
      });

      ws.addEventListener("error", (error) => {
        console.log("WebSocket error:", error);
      });
    };

    const reconnect = () => {
      setTimeout(connectWebSocket, 500);
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return <>
  <h1>web socket</h1></>;
}

export default Layout;
