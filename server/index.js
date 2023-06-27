const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const ChartData = require("./models/ChartData.js");

// Create Express app
const app = express();

// Connect to MongoDB using Mongoose
mongoose
  .connect("mongodb://localhost:27017/VWAP", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4,
  })
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/postChartData", async (req, res) => {
  try {
    const { VWAP, LTP } = req.body;
    const currentTime = new Date().getTime();
    const newDate = new Date();
    const year = newDate.getFullYear();
    const month = newDate.getMonth() + 1; // January is 0, so we add 1
    const day = newDate.getDate();
    const currentDate = `${day.toString().padStart(2, "0")}-${month
      .toString()
      .padStart(2, "0")}-${year}`;
    console.log(VWAP);
    console.log(LTP);
    console.log(currentDate);
    console.log(currentTime);

    const items = [
      {
        Time: currentTime,
        VWAP: +VWAP,
        LTP: +LTP,
      },
    ];

    const existingDate = await ChartData.find({ date: currentDate });
    // console.log(existingDate);
    if (existingDate.length > 0) {
      const existingDocument = existingDate[0];
      existingDocument.items.push(...items); // Append new items to the existing items array
      await ChartData.updateOne(
        { _id: existingDocument._id },
        existingDocument
      );
      res.json({ success: true });
    } else {
      const newDateData = new ChartData({ date: currentDate, items: items });
      await newDateData.save();
      res.json({ success: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/getChartData", async (req, res) => {
  try {
    const newDate = new Date();
    const year = newDate.getFullYear();
    const month = newDate.getMonth() + 1;
    const day = newDate.getDate();
    const currentDate = `${day.toString().padStart(2, "0")}-${month
      .toString()
      .padStart(2, "0")}-${year}`;
    const latestData = await ChartData.find({ date: currentDate });
    res.json({ latestData });
  } catch (err) {}
});

// Start the Express server
app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
