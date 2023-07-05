import React, { useEffect, useState, useRef } from "react";
import ApexChart from "./charts/ApexChart";
import axios from "axios";
import ChartJSChart from "./charts/ChartJSChart";
// import { getWebSocket, reconnect } from "../util.js";

// Function to calculate the milliseconds until the next third second of the minute
// const calculateDelayToNextThirdSecond = () => {
//   const now = new Date();
//   const targetTime = new Date(now);
//   targetTime.setSeconds(6); // Set the target seconds to 3
//   targetTime.setMilliseconds(0); // Reset milliseconds to zero

//   let delay = targetTime - now;
//   if (delay < 0) {
//     // If the target time has already passed, add one minute to the delay
//     targetTime.setMinutes(targetTime.getMinutes() + 1);
//     delay = targetTime - now;
//   }

//   return delay;
// };

function Layout(props) {
  const [socketData, setSocketData] = useState([]);

  const latestVWAPRef = useRef(0); // Use ref to store latest VWAP value
  const latestLTPRef = useRef(0); // Use ref to store latest LTP value
  const [prevVWAP, setPrevVWAP] = useState(0); // State variable to store previous VWAP value
  const [prevLTP, setPrevLTP] = useState(0); // State variable to store previous LTP value

  const { callTokens, putTokens } = props;

  const allTokens = callTokens.concat(putTokens);
  // console.log("allTokens", allTokens);

  useEffect(() => {
    let ws = null;
    let heartbeatInterval = null;

    const connectWebSocket = () => {
      ws = new WebSocket(
        "ws://14.99.241.31:3000/apimarketdata/socket.io/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiJYNTAyX2RjMDEzOWQ2MmMyM2Q5MjYyMjM5MzciLCJwdWJsaWNLZXkiOiJkYzAxMzlkNjJjMjNkOTI2MjIzOTM3IiwiaWF0IjoxNjg4NTMyNjkwLCJleHAiOjE2ODg2MTkwOTB9.sz6ZEud-bz6PoUqVcq4MAoWeyBqkpm9UscJS9VDk1f4&userID=X502&publishFormat=JSON&broadcastMode=Partial&transport=websocket&EIO=4"
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

    latestVWAPRef.current = calculatedVWAP.toFixed(2); // Update latestVWAP ref
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
    latestLTPRef.current = calculatedLTP.toFixed(2); // Update latestLTP ref
  };

  console.log(+latestVWAPRef.current, "VWAP");
  console.log(+latestLTPRef.current, "LTP");

  useEffect(() => {
    // The main useEffect for handling data sending
    if (+latestVWAPRef.current !== 0 && +latestLTPRef.current !== 0) {
      checkAndSendData();
    }
    console.log("effect");
  }, [latestVWAPRef.current, latestLTPRef.current]);

  const checkAndSendData = () => {
    const currentVWAP = latestVWAPRef.current;
    const currentLTP = latestLTPRef.current;

    // Check if the values are different from the previous ones
    if (currentVWAP !== prevVWAP || currentLTP !== prevLTP) {
      console.log("ltp not 0");
      setPrevVWAP(currentVWAP);
      setPrevLTP(currentLTP);

      // Send the data only if it is different from the previous values
      sendChartData();
    }
  };

  const sendChartData = () => {
    axios
      .post("http://localhost:8080/postChartData", {
        VWAP: latestVWAPRef.current, // Send the latest VWAP value from ref
        LTP: latestLTPRef.current, // Send the latest LTP value from ref
      })
      .then()
      .catch((error) => console.error("Error sending data:", error));
  };

  return (
    <>
      <ChartJSChart />
      <ApexChart />
    </>
  );
}

export default Layout;
