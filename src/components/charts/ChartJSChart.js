import React, { useEffect, useState, useRef } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns"; // Import date-fns adapter for time scales
import axios from "axios";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend
);

// ... (rest of the code remains the same)

const ChartJSChart = () => {
  const [items, setItems] = useState([]);
  const [myChart, setMyChart] = useState(null);
  const chartRef = useRef(null); // Create a ref to hold the chart element

  const fetchData = () => {
    axios
      .get("http://localhost:8080/getChartData")
      .then((response) => {
        const { latestData } = response.data;
        setItems(latestData[0].items);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 10000);
    return () => {
      clearInterval(interval);
      if (myChart) {
        myChart.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      if (myChart) {
        const VWAPPoints = items.map((item) => ({
          x: new Date(item?.Time),
          y: item?.VWAP,
        }));
        const LTPPoints = items.map((item) => ({
          x: new Date(item?.Time),
          y: item?.LTP,
        }));

        myChart.data.datasets[0].data = VWAPPoints;
        myChart.data.datasets[1].data = LTPPoints;
        myChart.update();

        
      } else {
        const minValue = Math.min(
          ...items.flatMap((item) => [item.VWAP, item.LTP])
        );
        const maxValue = Math.max(
          ...items.flatMap((item) => [item.VWAP, item.LTP])
        );

        // const ctx = document.getElementById("chart").getContext("2d");
        const ctx = chartRef.current; // Use the ref to access the chart element
        if (ctx) {
          const newChart = new Chart(ctx, {
            type: "line",
            data: {
              datasets: [
                {
                  label: "VWAP",
                  data: [],
                  borderColor: "blue",
                  fill: false,
                },
                {
                  label: "LTP",
                  data: [],
                  borderColor: "green",
                  fill: false,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              animation: {
                duration: 1000,
                easing: "linear",
              },
              scales: {
                x: {
                  type: "time",
                  title: {
                    display: true,
                    text: "VWAP vs LTP",
                  },
                  time: {
                    parser: "HH:mm", // Use the 'HH:mm' format for parsing time
                    unit: "minute",
                    // stepSize: 5, // Set the step size to 5 minutes
                    displayFormats: {
                      minute: "HH:mm",
                    },
                  },
                  
                },
                y: {
                  min: minValue - 600,
                  max: maxValue + 600,
                  ticks: {
                    stepSize: 50,
                  },
                },
              },
              plugins: {
           
                legend: {
                  display: true,
                },
                tooltip: {
                  enabled: true,
                  intersect: false,
                  mode: "index",

                  callbacks: {
                    title: (tooltipItems) => {
                      // Customize the tooltip title here (tooltipItems is an array)
                      if (tooltipItems.length > 0) {
                        const date = new Date(tooltipItems[0].parsed.x); // Assuming x-axis is a date value
                        return date.toLocaleTimeString(); // Use toLocaleTimeString to display local time
                      }
                      return "";
                    },
                  },
                },
                annotation: {
                  annotations: [], // Array to hold annotation elements
                },
              },
            },
          });

          setMyChart(newChart);
        }
      }
    }
  }, [items, myChart]);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <canvas
        id="chart"
        ref={chartRef}
        style={{ width: "100%", height: "100%" }}
      ></canvas>
    </div>
  );
};

export default ChartJSChart;
