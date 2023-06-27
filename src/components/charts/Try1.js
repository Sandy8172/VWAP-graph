import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const Try1 = (props) => {
    const{VWAP,LTP}=props
  const [series, setSeries] = useState([
    {
      name: 'VWAP',
      data: []
    },
    {
      name: 'LTP',
      data: []
    }
  ]);

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
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth'
    },
    title: {
      text: 'Dynamic Updating Chart',
      align: 'left'
    },
    markers: {
      size: 0
    },
    xaxis: {
      type: 'datetime',
      range: 22500000, // 6 hours and 15 minutes in milliseconds (09:15 AM to 03:30 PM)
      min: new Date().setHours(9, 15, 0, 0), // Set the minimum value to 9:15 AM of the current date
      max: new Date().setHours(15, 30, 0, 0), // Set the maximum value to 3:30 PM of the current date
      labels: {
        formatter: (value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Format timestamp to local time string
      }
    },
    yaxis: {
      max: 100
    },
    legend: {
      show: true
    },
  
  };

  useEffect(() => {
    const interval = setInterval(() => {

      setSeries((prevSeries) => [
        {
          ...prevSeries[0],
          data: [...prevSeries[0].data, [Date.now(), VWAP]]
        },
        {
          ...prevSeries[1],
          data: [...prevSeries[1].data, [Date.now(), LTP]]
        }
      ]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div id="chart">
      <ReactApexChart options={options} series={series} type="line" height={350} />
    </div>
  );
};

export default Try1;
