import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { dataSliceActions } from "../../store/dataSlice";
import LineChart from "../charts/LineChart";

function FetchOHLC() {
  const [data, setData] = useState([]);
  const [timeInterval, setTimeInterval] = useState(60);

  const dispatch = useDispatch();

  const exchangeId = useSelector((state) => state.exchangeId);
  // console.log(exchangeId , "exchangeID");
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiJYNTE5X2Q3NGU1ZTU1YzZmNjBkZWNjMjc1MjIiLCJwdWJsaWNLZXkiOiJkNzRlNWU1NWM2ZjYwZGVjYzI3NTIyIiwiaWF0IjoxNzA0MjU3NTIzLCJleHAiOjE3MDQzNDM5MjN9.MeMpiLvLZOdStvX1YzS1ESY-F3fZVkW4yMIZbng5tX4";
  const currentDate = new Date();
  const currentDateString = currentDate
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    .replace(/,/g, "");

  const startTime = `${currentDateString} 091500`;
  const endTime = `${currentDateString} 153000`;

  const refreshCount = useSelector((state) => state.refreshStorage);

  useEffect(() => {
    setTimeInterval(+localStorage.getItem("timeInterval"));
  }, [refreshCount]);
  // console.log(timeInterval);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiPromises = exchangeId.map(async (instrumentId) => {
          const response = await axios.get(
            "http://14.99.241.31:3000/apimarketdata/instruments/ohlc",
            {
              params: {
                exchangeSegment: "NSEFO",
                exchangeInstrumentID: instrumentId,
                startTime,
                endTime,
                compressionValue: timeInterval,
              },
              headers: {
                Authorization: token,
              },
            }
          );
          return response.data;
        });

        const results = await Promise.all(apiPromises);
        setData(results);
        // console.log(results);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    // Fetch data every 59th second of the minute
    const interval = setInterval(() => {
      const currentDate = new Date();
      const seconds = currentDate.getSeconds();
      if (seconds === 59) {
        fetchData();
      }
      // fetchData();
    }, 1000); // Check every second

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [exchangeId, timeInterval]);

  // splitting data and assigning the keys-----------------------------------------------

  const dataResponses = data?.map((item) => item.result.dataReponse);
  const splitOHLCData = dataResponses?.map((response) => {
    return response?.split(",").map((item) => {
      const [timestamp, open, high, low, close, volume, OI] = item.split("|");
      return { timestamp, open, high, low, close, volume, OI };
    });
  });
// console.log(splitOHLCData);
  //function to calculate VWAP and LTP -------------------------------------------------

//   const calculateVWAPAndLTP = (data) => {
//     const finalResult = [];

//     if (data.length > 0 && data[0].length > 0) {
//       for (let i = 0; i < data[0].length; i++) {
//         let totalVolume = 0;
//         let totalPriceVolume = 0;
//         let calculatedVWAP = 0;
//         let totalHighLowAvg = 0;
//         let timestampValue;

//         for (let j = 0; j < data.length; j++) {
//           const item = data[j][i];  

//           if (
//             item &&
//             item.timestamp &&
//             item.close &&
//             item.high &&
//             item.low &&
//             item.volume
//           ) {
//             const { timestamp, close, high, low, volume } = item;
//             // console.log(item);
//             const price =
//               (parseFloat(close) + parseFloat(high) + parseFloat(low)) / 3;
//             const vol = parseFloat(volume);
//             totalVolume += vol;
//             totalPriceVolume += price * vol;
//             calculatedVWAP = totalPriceVolume / totalVolume;

//             const highLowAvg =  (parseFloat(close) + parseFloat(high) + parseFloat(low)) / 3;
//             totalHighLowAvg += highLowAvg;

//             if (j === 0) {
//               timestampValue = timestamp;
//             }
//           }
//         }

//         finalResult.push({
//           Time: Number(timestampValue),
//           VWAP: Number(calculatedVWAP.toFixed(2)),
//           LTP: Number((totalHighLowAvg / data.length).toFixed(2)),
//         });
//       }
//     }

//     return finalResult;
//   };
//   console.log(splitOHLCData);
//   useEffect(() => {
//     const finalResultArray =
//       data.length > 0 ? calculateVWAPAndLTP(splitOHLCData) : "";
//     dispatch(dataSliceActions.addFinalChartData(finalResultArray));
//   }, [data]);
// console.log(calculateVWAPAndLTP(splitOHLCData));
const calculateOHLCForSubArray = (subArray) => {
  const aggregatedVWAP = {};
  const aggregatedLTP = {};
  let totalVolumes = 0;
  let totalPriceVolume = 0;

  // Calculate VWAP and LTP for the sub-array
  for (const item of subArray) {
    if (item.timestamp && item.close && item.high && item.low && item.volume) {
      const price =
        (parseFloat(item.close) +
          parseFloat(item.high) +
          parseFloat(item.low)) /
        3;
      const vol = parseFloat(item.volume);
      const timestamp = item.timestamp;
      totalVolumes += vol;
      totalPriceVolume += price * vol;

      if (!aggregatedVWAP[timestamp]) {
        aggregatedVWAP[timestamp] = 0;
      }
      if (!aggregatedLTP[timestamp]) {
        aggregatedLTP[timestamp] = 0;
      }
      aggregatedVWAP[timestamp] = totalPriceVolume / totalVolumes;
      aggregatedLTP[timestamp] += price;
    }
  }

  const finalResult = [];

  // Calculate final VWAP and LTP based on the aggregated values
  for (const timestamp in aggregatedVWAP) {
    if (aggregatedVWAP.hasOwnProperty(timestamp)) {
      const totalVWAP = aggregatedVWAP[timestamp];
      const totalLTP = aggregatedLTP[timestamp];

      finalResult.push({
        Time: Number(timestamp),
        VWAP: Number(totalVWAP.toFixed(2)),
        LTP: Number(totalLTP.toFixed(2)),
      });
    }
  }
  return finalResult;
};

const allOHLCData = useMemo(() => {
  const result = [];
  splitOHLCData.forEach((subArray) => {
    const ohlcData = calculateOHLCForSubArray(subArray);
    result.push(ohlcData);
  });
  return result;
}, [splitOHLCData]);

const averagedOHLC = useMemo(() => {
  const timestampSet = new Set();
  allOHLCData.forEach((ohlcData) => {
    ohlcData.forEach((entry) => timestampSet.add(entry.Time));
  });

  const result = [];

  for (const timestamp of timestampSet) {
    const matchingOHLCs = allOHLCData.map((ohlcData) =>
      ohlcData.find((entry) => entry.Time === timestamp)
    );

    const validMatchingOHLCs = matchingOHLCs.filter(Boolean);

    if (validMatchingOHLCs.length > 0) {
      const totalVWAP = validMatchingOHLCs.reduce(
        (sum, ohlc) => sum + ohlc.VWAP,
        0
      );
      const totalLTP = validMatchingOHLCs.reduce(
        (sum, ohlc) => sum + ohlc.LTP,
        0
      );
      const averageVWAP = totalVWAP / validMatchingOHLCs.length;
      const averageLTP = totalLTP / splitOHLCData.length;

      result.push({
        Time: timestamp,
        VWAP: Number(averageVWAP.toFixed(2)),
        LTP: Number(averageLTP.toFixed(2)),
      });
    }
  }

  return result;
}, [allOHLCData, splitOHLCData]);

useEffect(() => {
  const finalResultArray =
  data.length > 0 ? averagedOHLC : "";
  dispatch(dataSliceActions.addFinalChartData(finalResultArray));
}, [data, averagedOHLC]);
console.log(averagedOHLC);
  return (
    <div>
      <LineChart />
    </div>
  );
}

export default FetchOHLC;