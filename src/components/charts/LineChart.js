import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Chart, registerables } from "chart.js";
import Button from '@mui/material/Button';
import "chartjs-plugin-annotation";
import "chartjs-adapter-date-fns"; // Import date-fns adapter for time scales
import zoomPlugin from 'chartjs-plugin-zoom';
import SearchOffIcon from '@mui/icons-material/SearchOff';


Chart.register(...registerables, zoomPlugin);
// Chart.register(...registerables, zoomPlugin);

Chart.register({
  id: "annotation",
  beforeDraw: (chart) => {
    const ctx = chart.ctx;
    const { left, top, right, bottom } = chart.chartArea;
    ctx.save();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);

    const annotation = chart.options.plugins.annotation;
    if (annotation && annotation.annotations) {
      annotation.annotations.forEach((annotation) => {
        if (annotation.type === "line") {
          const y = chart.scales.y.getPixelForValue(annotation.value);
          if (y >= top && y <= bottom) {
            ctx.beginPath();
            ctx.moveTo(left, y);
            ctx.lineTo(right, y);
            ctx.stroke();
          }
        }
      });
    }

    ctx.restore();
  },
});

const LineChart = () => {
  const [selectedVWAPIndex, setSelectedVWAPIndex] = useState(null);
  const chartRef = useRef(null);

  const items = useSelector((state) => state.finalChartData);
  // console.log(items);

  const minTimestamp = new Date();
  minTimestamp.setHours(9, 15, 0, 0); // Set the minimum timestamp to 09:15:00

  const maxTimestamp = new Date();
  maxTimestamp.setHours(15, 30, 0, 0); // Set the maximum timestamp to 15:30:00

  useEffect(() => {
    if (items.length > 0) {
      const minValue = Math.min(
        ...items.flatMap((item) => [item.VWAP, item.LTP])
      );
      const maxValue = Math.max(
        ...items.flatMap((item) => [item.VWAP, item.LTP])
      );

      if (!chartRef.current) {
        chartRef.current = new Chart("chart", {
          type: "line",
          data: {
            datasets: [
              {
                label: "VWAP",
                data: [],
                borderColor: "rgb(71,165,252)",
                fill: false,
                borderWidth: 2,
                pointRadius: 0,
              },
              {
                label: "LTP",
                data: [],
                borderColor: "red",
                fill: false,
                borderWidth: 2,
                pointRadius: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 2000,
              easing: "easeOutQuad",
            },
            scales: {
              x: {
                type: "time",
                title: {
                  display: true,
                  text: "VWAP vs LTP",
                },
                time: {
                  parser: "HH:mm",
                  unit: "minute",
                  displayFormats: {
                    minute: "HH:mm",
                  },
                },
                min: minTimestamp,
                max: maxTimestamp,
                ticks: {
                  stepSize: 5,
                },
              },
              y: {
                min: minValue - 50,
                max: maxValue + 50,
                ticks: {
                  stepSize: 10,
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
                    if (tooltipItems.length > 0) {
                      const date = new Date(tooltipItems[0].parsed.x);
                      return date.toLocaleTimeString();
                    }
                    return "";
                  },
                },
              },
              annotation: {
                drawTime: "afterDatasetsDraw",
                annotations: [],
              },
              zoom: {
                zoom: {
                  wheel: {
                    enabled: true,
                  },
                  pinch: {
                    enabled: true,
                  },
                  mode: "x",
                },
              },
            },
          },
        });

      
      }

      const VWAPPoints = items.map((item) => ({
        x: new Date(item.Time * 1000 - 19800000),
        y: item.VWAP,
      }));
      const LTPPoints = items.map((item) => ({
        x: new Date(item.Time * 1000 - 19800000),
        y: item.LTP,
      }));

      chartRef.current.data.datasets[0].data = VWAPPoints;
      chartRef.current.data.datasets[1].data = LTPPoints;

      chartRef.current.options.plugins.annotation.annotations = [];

      if (selectedVWAPIndex !== null) {
        const selectedVWAP = items[selectedVWAPIndex]?.VWAP;
        const minValue = Math.min(...VWAPPoints.map((point) => point.y));
        const maxValue = Math.max(...VWAPPoints.map((point) => point.y));

        chartRef.current.options.plugins.annotation.annotations.push({
          type: "line",
          mode: "horizontal",
          scaleID: "y",
          value: selectedVWAP,
          borderColor: "red",
          borderWidth: 1,
          borderDash: [4, 4],
          endValue: minValue - (maxValue - minValue) * 0.1,
        });
      }

      chartRef.current.update();
    }
  }, [items, selectedVWAPIndex]);

  const handleChartClick = (event) => {
    const activeElements = chartRef.current.getElementsAtEventForMode(
      event,
      "nearest",
      { intersect: true },
      false
    );

    if (activeElements.length > 0) {
      const clickedDatasetIndex = activeElements[0].datasetIndex;
      const clickedIndex = activeElements[0].index;

      if (clickedDatasetIndex === 0) {
        setSelectedVWAPIndex((prevIndex) =>
          prevIndex === clickedIndex ? null : clickedIndex
        );
      }
    }
  };
  const handleResetZoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "95vh",
        backgroundColor: "rgb(247, 255, 229)",
      }}
    >
       <Button sx={{position:"absolute", right:"2px", top:"7px", padding:"2px",fontSize:"0.8rem"}} variant="contained" color="success" onClick={handleResetZoom}><SearchOffIcon/></Button>
      <canvas
        id="chart"
        style={{ width: "100%", height: "100%" }}
        onClick={handleChartClick}
      ></canvas>
    </div>
  );
};

export default LineChart;
