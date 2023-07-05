import React, {useEffect} from "react";
import axios from "axios";

function Ohlc() {
    // /apimarketdata/instruments/ohlc
    // const fechLTP = async () => {
    //   const url = "http://apimarketdata/instruments/ohlc";
    //   const headers = {
    //     Authorization:
    //       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiJYNTAyX2RjMDEzOWQ2MmMyM2Q5MjYyMjM5MzciLCJwdWJsaWNLZXkiOiJkYzAxMzlkNjJjMjNkOTI2MjIzOTM3IiwiaWF0IjoxNjg4NDQ3NzY3LCJleHAiOjE2ODg1MzQxNjd9.NJb_6VfSsLfuLlTqswHQMGJ-CghbiVgxERhUmSpbTZQ",
    //   };

    //   const body = {
    //     isTradeSymbol: "true",
    //     instruments: [
    //       {
    //         exchangeSegment: 2,
    //         exchangeInstrumentID: 35014,
    //       },
    //     ],
    //     xtsMessageCode: 1501,
    //     publishFormat: "JSON",
    //   };

    //   try {
    //     const response = await axios.post(url, body, { headers });
    //     const { data } = response;
    //     console.log(data);
    //   } catch (err) {
    //     console.log(err);
    //   }
    // };
    useEffect(() => {
        // Define the API URL
        const apiUrl = "http://14.99.241.31:3000/apimarketdata/instruments/ohlc";
    
        // Define the request parameters
        const params = {
          exchangeSegment: "NSEFO",
          exchangeInstrumentID: 35014,
          startTime: 'Jul 04 2023 091500',
          endTime: 'Jul 04 2023 133000',
          compressionValue: 60,
        };
    
        // Define the request headers
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiJYNTAyX2RjMDEzOWQ2MmMyM2Q5MjYyMjM5MzciLCJwdWJsaWNLZXkiOiJkYzAxMzlkNjJjMjNkOTI2MjIzOTM3IiwiaWF0IjoxNjg4NDQ3NzY3LCJleHAiOjE2ODg1MzQxNjd9.NJb_6VfSsLfuLlTqswHQMGJ-CghbiVgxERhUmSpbTZQ";
        const headers = {
          Authorization: `Bearer ${token}`,
        };
    
        // Make the HTTP GET request using Axios
        axios
          .get(apiUrl, { params, headers })
          .then((response) => {
            // Extract the OHLC data from the response
            console.log(response.data);
          })
          .catch((error) => {
            console.error('Error fetching OHLC data:', error);
          });
      }, []);
  return <div>Ohlc</div>;
}

export default Ohlc;
