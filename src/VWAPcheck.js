const splitOHLCData = [
  [
    {
      OI: "1262775",
      close: "332.25",
      high: "332.65",
      low: "293.8",
      open: "325",
      timestamp: "1693386959",
      volume: "708255",
    },
    {
      OI: "1262775",
      close: "320.05",
      high: "347.95",
      low: "314.25",
      open: "333.9",
      timestamp: "1693387019",
      volume: "494205",
    },
    {
      OI: "1122795",
      close: "317.5",
      high: "326.15",
      low: "317.35",
      open: "319.45",
      timestamp: "1693387079",
      volume: "167850",
    },
  ],
  [
    {
      OI: "1956765",
      close: "45.15",
      high: "68.3",
      low: "44.6",
      open: "68.3",
      timestamp: "1693386959",
      volume: "1048260",
    },
    {
      OI: "1956765",
      close: "47.15",
      high: "48.5",
      low: "42.25",
      open: "45",
      timestamp: "1693387019",
      volume: "664080",
    },
    {
      OI: "2287725",
      close: "47.4",
      high: "47.5",
      low: "45.5",
      open: "47.2",
      timestamp: "1693387079",
      volume: "409530",
    },
  ],
];

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
      if (!totalVolumes[timestamp]) {
        totalVolumes[timestamp] = 0;
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

const calculateAverageOHLC = (ohlcDataArray) => {
  const timestampSet = new Set();
  ohlcDataArray.forEach((ohlcData) => {
    ohlcData.forEach((entry) => timestampSet.add(entry.Time));
  });

  const averagedOHLC = [];

  for (const timestamp of timestampSet) {
    const matchingOHLCs = ohlcDataArray.map((ohlcData) =>
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
      const averageLTP = totalLTP / validMatchingOHLCs.length;

      averagedOHLC.push({
        Time: timestamp,
        VWAP: Number(averageVWAP.toFixed(2)),
        LTP: Number(averageLTP.toFixed(2)),
      });
    }
  }

  return averagedOHLC;
};

const allOHLCData = [];
splitOHLCData.forEach((subArray) => {
  const ohlcData = calculateOHLCForSubArray(subArray);
  allOHLCData.push(ohlcData);
});

const averagedOHLC = calculateAverageOHLC(allOHLCData);
console.log(averagedOHLC);

useEffect(() => {
  const finalResultArray =
    data.length > 0 ? averagedOHLC : "";
  dispatch(dataSliceActions.addFinalChartData(finalResultArray));
}, [data]);