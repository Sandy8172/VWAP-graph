import React, { useEffect, useRef } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { dataSliceActions } from "../../store/dataSlice";
import SelectStrike from "../selectOptions/SelectStrike";
import FetchOHLC from "../ohlcDataFeching/FetchOHLC";

const MasterTocken = () => {
  const finalCallStrikesRef = useRef([]);
  const finalPutStrikesRef = useRef([]);
  const dispatch = useDispatch();
  const refreshCount = useSelector((state) => state.refreshStorage);

  useEffect(() => {
    const finalCallStrikesValue = localStorage.getItem("SelectedCall");
    const finalPutStrikesValue = localStorage.getItem("SelectedPut");
    finalCallStrikesRef.current = finalCallStrikesValue?.split(",").map(Number);
    finalPutStrikesRef.current = finalPutStrikesValue?.split(",").map(Number);
  }, [refreshCount]);

  useEffect(() => {
    //function to get exvhangeInstrumentID from master Token -----------------------------------

    const fetchData = async () => {
      const url = "http://14.99.241.31:3000/apimarketdata/instruments/master";
      const headers = {
        Authorization:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiJYNTAyX2RjMDEzOWQ2MmMyM2Q5MjYyMjM5MzciLCJwdWJsaWNLZXkiOiJkYzAxMzlkNjJjMjNkOTI2MjIzOTM3IiwiaWF0IjoxNjkyODQ3OTQ5LCJleHAiOjE2OTI5MzQzNDl9.B_hnEVCskVDYNwk2_L5gaL9fWJyOEsIODyWMQBCcl3Y",
        "Content-Type": "application/json",
      };

      const body = {
        exchangeSegmentList: ["NSECM", "NSECD", "NSEFO"],
      };

      try {
        const response = await axios.post(url, body, { headers });
        const { data } = response;
        // console.log(data);

        // extracting BankNifty from all Data -------------------

        if (data.type === "success" && data.result) {
          const instrumentData = data.result?.split("\n");
          const bankNiftyData = instrumentData.filter((line) =>
            line.includes("BANKNIFTY")
          );
          // console.log(bankNiftyData);
          //Extracting Future index from BankNifty data --------------------------

          const futureData = bankNiftyData.filter((line) =>
            line.includes("FUTIDX")
          );
          const filteredFutureData = futureData.slice(0, 3);
          // console.log(filteredFutureData);

          //Extracting option index from BankNifty data --------------------------

          const OptionData = bankNiftyData.filter((line) =>
            line.includes("OPTIDX")
          );
          // console.log(OptionData);

          // extracting current month row data from future index ------------------

          const getLatestMonthRow = () => {
            // Calculate upcoming Thursday
            const today = new Date();
            const upcomingThursday = new Date(today);
            upcomingThursday.setDate(
              today.getDate() + ((4 - today.getDay() + 7) % 7)
            );
            // Get the month of the upcoming Thursday
            const monthOfUpcomingThursday = upcomingThursday.toLocaleString(
              "default",
              { month: "short" }
            ).toUpperCase();

            let latestMonthYearRow = null;

            for (let i = 0; i < filteredFutureData.length; i++) {
              const row = filteredFutureData[i];
              const parts = row.split("|");
              const instrument = parts[4];
              const monthYearMatch = instrument.match(
                /BANKNIFTY\d+([a-zA-Z]+)FUT/
              );

              if (monthYearMatch) {
                const monthYear = monthYearMatch[1].toUpperCase();
                if (monthYear === monthOfUpcomingThursday) {
                  latestMonthYearRow = row;
                  break;
                } 
              }
            }
            return latestMonthYearRow ;
          };
          const latestMonthRow = getLatestMonthRow();
          // console.log(latestMonthRow);

          const exchangeInstrumentID = latestMonthRow.split("|")[1];
          // console.log(exchangeInstrumentID);

          // function to fetch LTP from exchangeInstrumentID -------------------------------------------------
          const fetchLTP = async () => {
            const url =
              "http://14.99.241.31:3000/apimarketdata/instruments/quotes";
            const headers = {
              Authorization:
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiJYNTAyX2RjMDEzOWQ2MmMyM2Q5MjYyMjM5MzciLCJwdWJsaWNLZXkiOiJkYzAxMzlkNjJjMjNkOTI2MjIzOTM3IiwiaWF0IjoxNjkyODQ3OTQ5LCJleHAiOjE2OTI5MzQzNDl9.B_hnEVCskVDYNwk2_L5gaL9fWJyOEsIODyWMQBCcl3Y",
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
              // console.log(data);
              const quotes = JSON.parse(data.result.listQuotes[0]);
              const lastTradedPrice = quotes.LastTradedPrice;
              // console.log(lastTradedPrice);

              // rounding up the LTP with nearest hundreds -----------------
              const nearestStrikes = Math.round(lastTradedPrice / 100) * 100;
              dispatch(dataSliceActions.updateATM(nearestStrikes));
              const callValues = [];
              const putValues = [];

              for (let i = 1; i <= 10; i++) {
                const upperValue = nearestStrikes + 100 * i;
                const lowerValue = nearestStrikes - 100 * i + 100;

                callValues.push(upperValue, lowerValue);
                putValues.push(upperValue, lowerValue);
              }
              dispatch(dataSliceActions.strikePrice({ callValues, putValues }));
              // filter call values -----------------------------
              const filteredCallOptionData = OptionData.filter((line) => {
                const instrumentName =
                  line?.split("|")[line.split("|").length - 2];
                // console.log(instrumentName);
                return finalCallStrikesRef.current?.some((value) =>
                  instrumentName.includes(value)
                );
              });
              // console.log(filteredCallOptionData);
              // filter put values ---------------------------------

              const filteredPutOptionData = OptionData.filter((line) => {
                const instrumentName =
                  line?.split("|")[line.split("|").length - 2];
                return finalPutStrikesRef.current?.some((value) =>
                  instrumentName.includes(value)
                );
              });
              // console.log(filteredPutOptionData);

              // function for filter only call and put options

              function findCallPutWithLastElement(lines, target) {
                const result = [];
                for (let i = 0; i < lines.length; i++) {
                  const line = lines[i]?.split("|");
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
              // console.log(allCallOptions, allPutOptions);

              // function to find data only includes the latest thersday----------------------------------

              function indexesWithUpcomingThursday(indexes) {
                const today = new Date();
                const upcomingThursday = new Date(today);
                upcomingThursday.setDate(
                  today.getDate() + ((4 - today.getDay() + 7) % 7)
                ); // Calculate upcoming Thursday
                // console.log(upcomingThursday);

                const upcomingThursdayString = upcomingThursday
                  .toISOString()
                  ?.split("T")[0];
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
                  const token = data[i]?.split("|")[1];
                  tokens.push(token);
                }
                return tokens;
              };

              const callTokens = finalTokens(callData);
              const putTokens = finalTokens(putData);
              const allTokens = callTokens.concat(putTokens);
              // console.log(allTokens);
              dispatch(dataSliceActions.exchangeTokens(allTokens));
              // console.log(callTokens, putTokens);
            } catch (error) {
              console.error(error);
            }
          };
          fetchLTP();
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [refreshCount]);

  return (
    <>
      <SelectStrike />
      <FetchOHLC />
    </>
  );
};
export default MasterTocken;
