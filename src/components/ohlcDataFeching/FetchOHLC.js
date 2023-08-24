import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { dataSliceActions } from "../../store/dataSlice";
import LineChart from "../charts/LineChart";

function FetchOHLC() {
  const [data, setData] = useState([]);
  const [timeInterval, setTimeInterval] = useState(60);

  const dispatch = useDispatch();

  const exchangeId = useSelector((state) => state.exchangeId);
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiJYNTAyX2RjMDEzOWQ2MmMyM2Q5MjYyMjM5MzciLCJwdWJsaWNLZXkiOiJkYzAxMzlkNjJjMjNkOTI2MjIzOTM3IiwiaWF0IjoxNjkyODQ3OTQ5LCJleHAiOjE2OTI5MzQzNDl9.B_hnEVCskVDYNwk2_L5gaL9fWJyOEsIODyWMQBCcl3Y";
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

  const calculateVWAPAndLTP = (data) => {
    const finalResult = [];

    if (data.length > 0 && data[0].length > 0) {
      for (let i = 0; i < data[0].length; i++) {
        let totalVolume = 0;
        let totalPriceVolume = 0;
        let calculatedVWAP = 0;
        let totalHighLowAvg = 0;
        let timestampValue;

        for (let j = 0; j < data.length; j++) {
          const item = data[j][i];  

          if (
            item &&
            item.timestamp &&
            item.close &&
            item.high &&
            item.low &&
            item.volume
          ) {
            const { timestamp, close, high, low, volume } = item;
            const price =
              (parseFloat(close) + parseFloat(high) + parseFloat(low)) / 3;
            const vol = parseFloat(volume);

            totalVolume += vol;
            totalPriceVolume += price * vol;
            calculatedVWAP = totalPriceVolume / totalVolume;

            const highLowAvg = (parseFloat(high) + parseFloat(low)) / 2;
            totalHighLowAvg += highLowAvg;

            if (j === 0) {
              timestampValue = timestamp;
            }
          }
        }

        finalResult.push({
          Time: Number(timestampValue),
          VWAP: Number(calculatedVWAP.toFixed(2)),
          LTP: Number((totalHighLowAvg / data.length).toFixed(2)),
        });
      }
    }

    return finalResult;
  };
  useEffect(() => {
    const finalResultArray =
      data.length > 0 ? calculateVWAPAndLTP(splitOHLCData) : "";
    dispatch(dataSliceActions.addFinalChartData(finalResultArray));
  }, [data]);

  return (
    <div>
      <LineChart />
    </div>
  );
}

export default FetchOHLC;