import axios from 'axios';
import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const ApexChart = () => {
const [items, setItems]=useState([])
 
  const [series, setSeries] = useState([
    {
      name: 'VWAP',
      data: [] // Array to store VWAP data points
    },
    {
      name: 'LTP',
      data: [] // Array to store LTP data points
    }
  ]);

  useEffect(() => {
    const fetchData = () => {
      axios.get('http://localhost:8080/getChartData')
        .then((response) => {
          const { latestData } = response.data;
          setItems(latestData[0].items);
        })
        .catch(err => console.log(err)); 
    };

    // Fetch data initially
    fetchData();

    // Fetch data every minute
    const interval = setInterval(fetchData, 10000);

    // Clean up the interval on component unmount
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  useEffect(() => {
    const VWAPPoints = items.map(item => [item?.Time, item?.VWAP]);
    const LTPPoints = items.map(item => [item?.Time, item?.LTP]);
  
    setSeries(prevSeries => {
      const updatedSeries = [...prevSeries];
  
      // Add new VWAP data points to the array
      if (VWAPPoints.length > 0) {
        const lastVWAPPoint = VWAPPoints[VWAPPoints.length - 1];
        const previousVWAPPoint = prevSeries[0].data[prevSeries[0].data.length - 1];
  
        if (!previousVWAPPoint || lastVWAPPoint[0] !== previousVWAPPoint[0]) {
          updatedSeries[0].data = [...prevSeries[0].data, ...VWAPPoints];
        }
      }
  
      // Add new LTP data points to the array
      if (LTPPoints.length > 0) {
        const lastLTPPoint = LTPPoints[LTPPoints.length - 1];
        const previousLTPPoint = prevSeries[1].data[prevSeries[1].data.length - 1];
  
        if (!previousLTPPoint || lastLTPPoint[0] !== previousLTPPoint[0]) {
          updatedSeries[1].data = [...prevSeries[1].data, ...LTPPoints];
        }
      }
  
      return updatedSeries;
    });
  }, [items]);
  
  
  

  const minValue = Math.min(
    ...series.flatMap(serie => serie.data.map(dataPoint => dataPoint[1]))
  );
  const maxValue = Math.max(
    ...series.flatMap(serie => serie.data.map(dataPoint => dataPoint[1]))
  );


  const options = {
    chart: {
      id: 'realtime',
      height: 350,
      type: 'line',
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: {
          speed: 1000
        }
      },
      toolbar: {
        show: true
      },
      zoom: {
        enabled: true, // Enable zooming
        type: 'x', // Enable zooming on the x-axis only
        selection: {
          enabled: true // Enable selection
        }
      }
    },
    dataLabels: {
      enabled: false, // Enable data labels
      enabledOnSeries: [0, 1], // Apply data labels to series 1 and 2
      background: {
        enabled: true,
        foreColor: 'black',
        padding: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#fff'
      },
      style: {
        fontSize: '12px',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        colors: ['lightblue']
      },
      // formatter: (value) => value[1].toFixed(2) // Format data label value to two decimal places
    },
    markers: {
      size: 0, // Adjust the size of the markers
      hover: {
        sizeOffset: 4 // Increase the size of the markers when hovering
      }
    },
    tooltip: {
      enabled: true, // Enable tooltip on hover
      x: {
        show: false // Hide the x-axis value in the tooltip
      },
      y: {
        title: {
          formatter: () => '' // Hide the y-axis title in the tooltip
        }
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2 // Adjust the thickness of the lines
    },
    series: [
      {
        name: 'VWAP',
        data: series[0].data,
        connectNulls: false
      },
      {
        name: 'LTP',
        data: series[1].data,
        connectNulls: false
      }
    ],
    title: {
      text: 'VWAP & LTP vs TIME',
      align: 'center'
    },
  
    xaxis: {
      type: 'datetime',
      // title:{
      //   text:"Time"
      // },
      range: 22500000, // 6 hours and 15 minutes in milliseconds (09:15 AM to 03:30 PM)
      min: new Date().setHours(9, 15, 0, 0), // Set the minimum value to 9:15 AM of the current date
      max: new Date().setHours(15, 30, 0, 0), // Set the maximum value to 3:30 PM of the current date
      labels: {
        formatter: (value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Format timestamp to local time string
      }
    },
    yaxis: {
      // title:{
      //   text:"VWAP vs LTP" 
      // },
      min: minValue - 1000, // Adjust the y-axis range to start from 20 points below the lowest value
      max: maxValue + 1000
    },
    legend: {
      show: true
    },
  };

  return (
    <div id="chart" style={{width:"100%"}}>
      <ReactApexChart options={options} series={series} type="line" width={"100%"} height={700} />
    </div>
  );
};

export default ApexChart;




// useEffect(() => {
//   const currentTime = new Date().getTime();
//   setSeries(prevSeries => [
//     {
//       name: 'VWAP',
//       data: [...prevSeries[0].data, [currentTime, VWAP]] // Add new VWAP data point to the array
//     },
//     {
//       name: 'LTP',
//       data: [...prevSeries[1].data, [currentTime, LTP]] // Add new LTP data point to the array
//     }
//   ]);
// }, [VWAP, LTP]);   //update this code with ltp and vwap and time which I'm getting from items array