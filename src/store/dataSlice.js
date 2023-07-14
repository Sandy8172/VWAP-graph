import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  callStrikes: [],
  putStrikes: [],
  exchangeId: [],
  refreshStorage: 0,
  finalChartData: [],
};

const dataSlice = createSlice({
  name: "lineChart",
  initialState,
  reducers: {
    strikePrice(state, action) {
      const { callValues, putValues } = action.payload;
      state.callStrikes = callValues.sort((a, b) => a - b);
      state.putStrikes = putValues.sort((a, b) => a - b);
    },
    refreshLocalStorage(state) {
      state.refreshStorage++;
    },
    exchangeTokens(state, action) {
      const allTokens = action.payload;
      const exchangeId = allTokens.map(Number);

      if (JSON.stringify(state.exchangeId) !== JSON.stringify(exchangeId)) {
        state.exchangeId = exchangeId;
      }
    },
    addFinalChartData(state, action) {
      state.finalChartData = action.payload;
    },
  },
});

export const dataSliceActions = dataSlice.actions;

export default dataSlice.reducer;
