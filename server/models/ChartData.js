const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  Time: { type: Number, required: true },
  VWAP: { type: Number, required: true },
  LTP: { type: Number, required: true }
});

const ChartSchema = new mongoose.Schema({
  date: { type: String, require: true },
  items: [itemSchema]
});

const ChartData = mongoose.model('chartdata', ChartSchema);

module.exports = ChartData;
