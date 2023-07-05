import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "./Layout";

const MasterTocken = () => {
  const [callTokens, setCallTokens] = useState([]);
  const [putTokens, setPutTokens] = useState([]);

  useEffect(() => {
    //function to get exvhangeInstrumentID from master Token -----------------------------------

    const fetchData = async () => {
      const url = "http://14.99.241.31:3000/apimarketdata/instruments/master";
      const headers = {
        Authorization:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiJYNTAyX2RjMDEzOWQ2MmMyM2Q5MjYyMjM5MzciLCJwdWJsaWNLZXkiOiJkYzAxMzlkNjJjMjNkOTI2MjIzOTM3IiwiaWF0IjoxNjg4NTMyNjkwLCJleHAiOjE2ODg2MTkwOTB9.sz6ZEud-bz6PoUqVcq4MAoWeyBqkpm9UscJS9VDk1f4",
        "Content-Type": "application/json",
      };

      const body = {
        exchangeSegmentList: ["NSECM", "NSECD", "NSEFO"],
      };

      try {
        const response = await axios.post(url, body, { headers });
        const { data } = response;

        // extracting BankNifty from all Data -------------------

        if (data.type === "success" && data.result) {
          const instrumentData = data.result.split("\n");
          const bankNiftyData = instrumentData.filter((line) =>
            line.includes("BANKNIFTY")
          );

          //Extracting Future index from BankNifty data --------------------------

          const futureData = bankNiftyData.filter((line) =>
            line.includes("FUTIDX")
          );

          //Extracting option index from BankNifty data --------------------------

          const OptionData = bankNiftyData.filter((line) =>
            line.includes("OPTIDX")
          );

          const latestDateRow = futureData.slice(0, 1);

          const exchangeInstrumentID = latestDateRow[0].split("|")[1];
          console.log(exchangeInstrumentID);

          // function to fetch LTP from exchangeInstrumentID -------------------------------------------------
          const fechLTP = async () => {
            const url =
              "http://14.99.241.31:3000/apimarketdata/instruments/quotes";
            const headers = {
              Authorization:
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiJYNTAyX2RjMDEzOWQ2MmMyM2Q5MjYyMjM5MzciLCJwdWJsaWNLZXkiOiJkYzAxMzlkNjJjMjNkOTI2MjIzOTM3IiwiaWF0IjoxNjg4NTMyNjkwLCJleHAiOjE2ODg2MTkwOTB9.sz6ZEud-bz6PoUqVcq4MAoWeyBqkpm9UscJS9VDk1f4",
            };

            const body = {
              isTradeSymbol: "true",
              instruments: [
                {
                  exchangeSegment: 2,
                  exchangeInstrumentID: exchangeInstrumentID,
                },
              ],
              xtsMessageCode: 1501,
              publishFormat: "JSON",
            };

            try {
              const response = await axios.post(url, body, { headers });
              const { data } = response;
              const quotes = JSON.parse(data.result.listQuotes[0]);
              const lastTradedPrice = quotes.LastTradedPrice;
              console.log(lastTradedPrice);

              // rounding up the LTP with nearest hundreds -----------------
              const nearestStrikes = Math.round(lastTradedPrice / 100) * 100;
              const callValues = [];
              const putValues = [];

              for (let i = 1; i <= 3; i++) {
                const callValue = nearestStrikes + 100 * i - 100;
                const putValue = nearestStrikes - 100 * i + 100;
                callValues.push(callValue);
                putValues.push(putValue);
              }
              // console.log(callValues);
              // filter call values -----------------------------
              const filteredCallOptionData = OptionData.filter((line) => {
                const instrumentName = line.split("|")[4];
                return callValues.some((value) =>
                  instrumentName.includes(value)
                );
              });
              // filter put values ---------------------------------

              const filteredPutOptionData = OptionData.filter((line) => {
                const instrumentName = line.split("|")[4];
                return putValues.some((value) =>
                  instrumentName.includes(value)
                );
              });

              // function for filter only call and put options

              function findCallPutWithLastElement(lines, target) {
                const result = [];
                for (let i = 0; i < lines.length; i++) {
                  const line = lines[i].split("|");
                  const lastElement = line[line.length - 1];
                  if (lastElement === target) {
                    result.push(lines[i]);
                  }
                }
                return result;
              }
              //   all calls ---------
              const allCallOptions = findCallPutWithLastElement(
                filteredCallOptionData,
                "3"
              );
              //   all puts ---------
              const allPutOptions = findCallPutWithLastElement(
                filteredPutOptionData,
                "4"
              );

              // function to find data only includes the latest thersday----------------------------------

              function indexesWithUpcomingThursday(indexes) {
                const today = new Date();
                const upcomingThursday = new Date(today);
                upcomingThursday.setDate(
                  today.getDate() + ((4 - today.getDay() + 7) % 7)
                ); // Calculate upcoming Thursday

                const upcomingThursdayString = upcomingThursday
                  .toISOString()
                  .split("T")[0];
                const dataWithThursday = [];
                for (var i = 0; i < indexes.length; i++) {
                  const data = indexes[i];
                  const dateString = data.match(/\d{4}-\d{2}-\d{2}/)[0];

                  if (dateString === upcomingThursdayString) {
                    dataWithThursday.push(data);
                  }
                }
                return dataWithThursday;
              }

              // final data of call with latest thursday---------------------------
              const callData = indexesWithUpcomingThursday(allCallOptions);
              // final data of put with latest thursday----------------------------
              const putData = indexesWithUpcomingThursday(allPutOptions);

              // console.log(callData);
              // console.log(putData);
              // function to extract final tocken for call and put --------------------------
              const finalTokens = (data) => {
                const tokens = [];
                for (let i = 0; i < data.length; i++) {
                  const token = data[i].split("|")[1];
                  tokens.push(token);
                }
                return tokens;
              };

              const callTokens = finalTokens(callData);
              const putTokens = finalTokens(putData);
              setCallTokens(callTokens);
              setPutTokens(putTokens);
            } catch (error) {
              console.error(error);
            }
          };
          fechLTP();
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  return <Layout callTokens={callTokens} putTokens={putTokens} />;
};

export default MasterTocken;
