import React, { useEffect, useState, useMemo } from "react";
import { Global } from "@emotion/react";
import { styled } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { grey } from "@mui/material/colors";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { useSelector, useDispatch } from "react-redux";
import { dataSliceActions } from "../../store/dataSlice";

import SwipeableDrawer from "@mui/material/SwipeableDrawer";

const drawerBleeding = 150;

const Root = styled("div")(({ theme }) => ({
  height: "100%",
  backgroundColor:
    theme.palette.mode === "light"
      ? grey[100]
      : theme.palette.background.default,
}));

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "light" ? "#fff" : grey[800],
}));

const SelectStrike=(props)=> {
  const { window } = props;
  const [open, setOpen] = React.useState(false);
  const [dropdown1Open, setDropdown1Open] = React.useState(false);
  const [dropdown2Open, setDropdown2Open] = React.useState(false);
  const [selectedOptions1, setSelectedOptions1] = React.useState([]);
  const [selectedOptions2, setSelectedOptions2] = React.useState([]);
  const dropdown1Ref = React.useRef();
  const dropdown2Ref = React.useRef();
  const finalCallStrikesRef = React.useRef([]);
  const finalPutStrikesRef = React.useRef([]);
  const [interval, setInterval] = useState("");
  const dispatch = useDispatch();

  const { callStrikes, putStrikes,refreshCount} = useSelector((state) => ({
    callStrikes: state.callStrikes,
    putStrikes: state.putStrikes,
    refreshCount:state.refreshStorage,
  }));

  const memoizedCallStrikes = useMemo(() => callStrikes, [callStrikes]);
  const memoizedPutStrikes = useMemo(() => putStrikes, [putStrikes]);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  // This is used only for the example
  const container =
    window !== undefined ? () => window().document.body : undefined;

  const handleChange = (event) => {
    localStorage.setItem("timeInterval", event.target.value);
    setInterval(localStorage.getItem("timeInterval"));
    dispatch(dataSliceActions.refreshLocalStorage());
  };

  useEffect(() => {
    const finalCallStrikesValue = localStorage.getItem("SelectedCall");
    const finalPutStrikesValue = localStorage.getItem("SelectedPut");
    finalCallStrikesRef.current = finalCallStrikesValue?.split(",").map(Number);
    finalPutStrikesRef.current = finalPutStrikesValue?.split(",").map(Number);
  }, [refreshCount]);


  const handleDropdown1Toggle = () => {
    setDropdown1Open(!dropdown1Open);
  };

  const handleDropdown2Toggle = () => {
    setDropdown2Open(!dropdown2Open);
  };

  const handleOptionSelect1 = () => {
    const selectedOptions = Array.from(
      dropdown1Ref.current.querySelectorAll('input[type="checkbox"]:checked'),
      (checkbox) => Number(checkbox.value)
    );
    setSelectedOptions1(selectedOptions);
  };

  const handleOptionSelect2 = () => {
    const selectedOptions = Array.from(
      dropdown2Ref.current.querySelectorAll('input[type="checkbox"]:checked'),
      (checkbox) => Number(checkbox.value)
    );
    setSelectedOptions2(selectedOptions);
  };

  const handleClickOutside = (event) => {
    if (
      dropdown1Ref.current &&
      !dropdown1Ref.current.contains(event.target) &&
      dropdown1Open
    ) {
      setDropdown1Open(false);
    }
    if (
      dropdown2Ref.current &&
      !dropdown2Ref.current.contains(event.target) &&
      dropdown2Open
    ) {
      setDropdown2Open(false);
    }
  };
  React.useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      selectedOptions1.length === selectedOptions2.length &&
      selectedOptions1.length > 1
    ) {
      localStorage.setItem("SelectedCall", selectedOptions1);
      localStorage.setItem("SelectedPut", selectedOptions2);
      dispatch(dataSliceActions.refreshLocalStorage());
      setSelectedOptions1([]);
      setSelectedOptions2([]);
      setDropdown1Open(false);
      setDropdown2Open(false);
    } else {
      const isSubmitButtonClicked =
        event.nativeEvent.submitter.getAttribute("type") === "submit";

      if (isSubmitButtonClicked) {
        alert("Please select three same numbers of strategies.");
      }
    }
  };

  return (
    <Root>
      <CssBaseline />
      <Global
        styles={{
          ".MuiDrawer-root > .MuiPaper-root": {
            height: `calc(50% - ${drawerBleeding}px)`,
            overflow: "visible",
          },
        }}
      />
      <Box
        sx={{ textAlign: "center", pt: 1, background: "rgb(225, 236, 200)" }}
      >
        <Button onClick={toggleDrawer(true)}>
          <b>Filters</b>
        </Button>
      </Box>
      <SwipeableDrawer
        container={container}
        anchor="bottom"
        open={open}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
        swipeAreaWidth={drawerBleeding}
        disableSwipeToOpen={false}
        ModalProps={{
          keepMounted: true,
        }}
      >
        <StyledBox
          sx={{
            px: 2,
            py: 2,
            height: "100%",
            overflow: "auto",
          }}
        >
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "rgb(225, 236, 200)",
              padding: "1rem",
            }}
          >
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2rem",
                backgroundColor: "rgb(225, 236, 200)",
                padding: " 1rem 0",
              }}
            >
              <div>
                <div>
                  <div
                    id="dropdown1"
                    className={`dropdown ${dropdown1Open ? "open" : ""}`}
                    onClick={handleDropdown1Toggle}
                    ref={dropdown1Ref}
                  >
                    <div className="dropdown-trigger">
                      <Button
                        variant="contained"
                        sx={{ backgroundColor: "grey", padding: "1px" }}
                        className="dropdown-button"
                      >
                        Select Call
                        <span className="arrow">&#9662;</span>
                      </Button>
                    </div>
                    <div className="dropdown-menu">
                      {dropdown1Open && (
                        <div className="dropdown-options">
                          {memoizedCallStrikes.map((value, index) => (
                            <FormControlLabel
                              key={index}
                              control={
                                <Checkbox
                                  value={value}
                                  checked={selectedOptions1.includes(value)}
                                  onChange={handleOptionSelect1}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              }
                              label={value.toString()}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <br />

                <div>
                  <div
                    id="dropdown2"
                    className={`dropdown ${dropdown2Open ? "open" : ""}`}
                    onClick={handleDropdown2Toggle}
                    ref={dropdown2Ref}
                  >
                    <div className="dropdown-trigger">
                      <Button
                        variant="contained"
                        sx={{ backgroundColor: "grey", padding: "1px" }}
                        className="dropdown-button"
                      >
                        Select Put
                        <span className="arrow">&#9662;</span>
                      </Button>
                    </div>
                    <div className="dropdown-menu">
                      {dropdown2Open && (
                        <div className="dropdown-options">
                          {memoizedPutStrikes.map((value, index) => (
                            <FormControlLabel
                              key={index}
                              control={
                                <Checkbox
                                  value={value}
                                  checked={selectedOptions2.includes(value)}
                                  onChange={handleOptionSelect2}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              }
                              label={value.toString()}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="contained" type="submit">
                Show Chart
              </Button>
            </form>
            {!dropdown1Open && !dropdown2Open && (
              <Box sx={{ minWidth: 120 }}>
                <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                  <InputLabel>Interval</InputLabel>
                  <Select
                    value={interval}
                    label="interval"
                    onChange={handleChange}
                  >
                    <MenuItem value={60}>1 Min</MenuItem>
                    <MenuItem value={300}>5 Min</MenuItem>
                    <MenuItem value={900}>15 Min</MenuItem>
                    <MenuItem value={1800}>30 Min</MenuItem>
                    <MenuItem value={3600}>1 hr</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
            {!dropdown1Open && !dropdown2Open && (
              <div>
                <Card sx={{ width: 170, height: 100 }}>
                  <CardContent sx={{ padding: "0", textAlign: "center" }}>
                    <h3>Selected Call</h3>
                    {finalCallStrikesRef.current?.map((call) => (
                      <span
                        key={call}
                        style={{ fontSize: "0.8rem", height: "1.4rem" }}
                      >
                        &nbsp;{call}&nbsp;
                      </span>
                    ))}
                  </CardContent>
                </Card>

                <Card sx={{ width: 170, height: 100, mt: 3 }}>
                  <CardContent sx={{ padding: "0", textAlign: "center" }}>
                    <h3>Selected Put</h3>
                    {finalPutStrikesRef.current?.map((put) => (
                      <span
                        key={put}
                        style={{ fontSize: "0.8rem", height: "1.4rem" }}
                      >
                        &nbsp;{put}&nbsp;
                      </span>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </StyledBox>
      </SwipeableDrawer>
    </Root>
  );
}

export default SelectStrike;
