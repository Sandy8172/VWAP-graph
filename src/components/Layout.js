import React, { useEffect, useState } from "react";
import ApexChart from "./charts/ApexChart";
import axios from "axios";
// import { getWebSocket, reconnect } from "../util.js";

function Layout(props) {
  const [socketData, setSocketData] = useState([]);
  const [VWAP, setVWAP] = useState(0);
  const [LTP, setLTP] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const { callTokens, putTokens } = props;

  const allTokens = callTokens.concat(putTokens);
  // console.log("allTokens", allTokens);

  useEffect(() => {
    let ws = null;
    let heartbeatInterval = null;

    const connectWebSocket = () => {
      ws = new WebSocket(
        "ws://14.99.241.31:3000/apimarketdata/socket.io/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiJYNTAyX2RjMDEzOWQ2MmMyM2Q5MjYyMjM5MzciLCJwdWJsaWNLZXkiOiJkYzAxMzlkNjJjMjNkOTI2MjIzOTM3IiwiaWF0IjoxNjg3ODQyOTk5LCJleHAiOjE2ODc5MjkzOTl9.WpqS31qAkAqen-SeJOWrv3P-tPhGkbzlgv_8VlunVpI&userID=X502&publishFormat=JSON&broadcastMode=Partial&transport=websocket&EIO=4"
      );

      ws.addEventListener("open", () => {
        console.log("WebSocket connection established");
      });

      ws.onmessage = (event) => {
        const receivedData = event.data;
        const messages = [receivedData];
        // console.log(messages);

        messages.forEach((message) => {
          if (message.includes("1505-json-partial")) {
            const dataPayload = message.substring(2); // Remove the leading '42'
            const pairs = dataPayload.split(",").slice(1);

            const data = {};
            pairs.forEach((pair) => {
              const [key, value] = pair.split(":");
              const formattedKey = key.trim().replace(/"/g, "");
              let formattedValue = value.trim().replace(/\\/g, "");

              // Modify 't' value
              if (formattedKey === "t") {
                formattedValue = formattedValue.replace("2_", "");
              }

              // Modify 'pv' value
              if (formattedKey === "pv") {
                formattedValue = formattedValue.replace("]", "");
              }
              // Modify 'pv' value
              if (formattedKey === "pv") {
                formattedValue = formattedValue.replace('"', "");
              }

              data[formattedKey] = formattedValue;
            });
            setSocketData((prevState) => {
              const existingIndex = prevState.findIndex(
                (obj) => obj?.t === data.t
              );

              if (existingIndex !== -1) {
                // If the existing object is found, update its values
                const updatedData = [...prevState];
                updatedData[existingIndex] = {
                  ...updatedData[existingIndex],
                  ...data,
                };
                return updatedData;
              } else {
                // If the existing object is not found, add the new object to the state
                return [...prevState, data];
              }
            });
          }
        });
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
  //  console.log(socketData);

  const finalTokensData = socketData.filter((obj) => allTokens.includes(obj.t));
  // console.log(finalTokensData);

  useEffect(() => {
    calculateVWAP();
    calculateLTP();
  }, [socketData]);

  const calculateVWAP = () => {
    let totalVolume = 0;
    let totalPriceVolume = 0;
    let calculatedVWAP = 0;

    // Calculate total volume and total price volume for VWAP
    finalTokensData.forEach((tick) => {
      const { c, h, l, bv } = tick;
      const price = (parseFloat(c) + parseFloat(h) + parseFloat(l)) / 3;
      totalVolume += parseFloat(bv);
      totalPriceVolume += price * parseFloat(bv);
      calculatedVWAP += totalPriceVolume / totalVolume;
    });

    setVWAP(calculatedVWAP.toFixed(2)); // Update VWAP state
  };
  const calculateLTP = () => {
    let totalHighLowAvg = 0;

    // Calculate total high low avg-----------
    finalTokensData.forEach((entry) => {
      const highLowAvg = (parseFloat(entry.h) + parseFloat(entry.l)) / 2;

      totalHighLowAvg += highLowAvg;
    });

    // Calculate VWAP
    const calculatedLTP = totalHighLowAvg;
    setLTP(calculatedLTP.toFixed(2)); // Update VWAP state
  };

  console.log(VWAP, "VWAP");
  console.log(+LTP, "LTP");
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prevElapsedTime) => prevElapsedTime + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (elapsedTime > 60 && +VWAP !== 0 && +LTP !== 0) {
      sendChartData();
      setElapsedTime(0);
    }
  }, [elapsedTime]);

  const sendChartData = () => {
    axios
      .post("http://localhost:8080/postChartData", {
        VWAP,
        LTP,
      })
      .then()
      .catch();
  };

  return (
    <>
      <ApexChart/>
    </>
  );
}

export default Layout;
