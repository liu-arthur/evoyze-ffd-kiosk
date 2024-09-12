import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import LoadingButton from "@mui/lab/LoadingButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import StyleIcon from "@mui/icons-material/Style";

// import InfoMobileComponent from './InfoMobileComponent';
import ReservationInfoComponent from "./ReservationInfoComponent";
import GuestRegistrationComponent from "./GuestRegistrationComponent";
// import UpsellRoomComponent from './UpsellRoomComponent';
// import AddOnCartComponent from './AddOnCartComponent';
import ReviewComponent from "./ReviewComponent";

import { SnackbarProvider, enqueueSnackbar, closeSnackbar } from "notistack";

const { ipcRenderer } = window.require("electron");

const RETURNTOMAIN = 15;
const TIMEOUT = 60 * 1000;

export default function MainPageComponent() {
  const [getSteps, setSteps] = useState([
    "Reservation Found",
    "Confimation/ Update Guest Info",
    "Upgrade Room Package",
    "Add On Services/ Items",
    "Review your order",
  ]);

  const [secondsLeft, setSecondsLeft] = useState(null);
  const [getActiveStep, setActiveStep] = useState(0);
  const [getHasAddOn, setHasAddOn] = useState(false);
  const [getAddToCartItem, setAddToCartItem] = useState({});
  const [getHasPackages, setHasPackages] = useState(false);
  const [getResultMyKad, setResultMyKad] = useState({});
  const [getGuestAlreadyReg, setGuestAlreadyReg] = useState(false);
  const [getAllowCheckIn, setAllowCheckIn] = useState(false);
  const [getRoomNumber, setRoomNumber] = useState({ room: [] });
  const [disabledRooms, setDisabledRooms] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;

  let timeoutId;
  let notificationTimer;

  const resetTimeout = () => {
    clearTimeout(timeoutId);
    clearTimeout(notificationTimer);

    timeoutId = setTimeout(() => {
      navigate("/");
    }, TIMEOUT);

    // Set timer to show notification at 10 seconds remaining
    notificationTimer = setTimeout(() => {
      if (location.pathname !== "/") {
        showRedirectionNotification();
      }
    }, TIMEOUT - 10000);
  };

  // Show notification about redirection in 10 seconds
  const showRedirectionNotification = () => {
    enqueueSnackbar("You will be redirected in 10 seconds.", {
      variant: "warning",
    });
  };

  const handleUserActivity = () => {
    closeSnackbar();
    resetTimeout();
  };

  useEffect(() => {
    // Initial setup of timeout
    resetTimeout();

    // Set up event listeners for user activity
    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("touchstart", handleUserActivity);

    // Timer to show the notification at 50 seconds (10 seconds before timeout)
    const notificationTimer = setTimeout(() => {
      showRedirectionNotification();
    }, TIMEOUT - 10000); // Show notification when 50 seconds have elapsed

    // Clean up event listeners on component unmount
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(notificationTimer);
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      navigate("/");
    };

    // Add event listener for beforeunload event
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function to remove event listener when component unmounts
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [navigate]);

  useEffect(() => {
    if (state?.room?.packages && state.room.packages.length > 0) {
      setHasPackages(true);
    }
  }, [state?.room?.packages]);

  useEffect(() => {
    if (state?.addOnItems && state.addOnItems.length > 0) {
      setHasAddOn(true);
    }
  }, [state?.addOnItems]);

  const filteredSteps = getSteps.filter((step) => {
    if (!getHasPackages && step === "Upgrade Room Package") {
      return false;
    }

    if (!getHasAddOn && step === "Add On Services/ Items") {
      return false;
    }
    return true;
  });

  const handleNext = () => {
    setActiveStep(getActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(getActiveStep - 1);
  };

  const handleCheckIn = async () => {
    if (getAllowCheckIn) {
      const u = new URL(state.a.u);
      const path = "api/room";

      u.pathname = u.pathname.endsWith("/")
        ? u.pathname + path
        : u.pathname + "/" + path;

      const api = u.toString();

      //POST
      const data = {
        // Compulsory
        ipAddr: state.a.ip,
        resv_id: location.state.reservation.resv_id,
      };

      try {
        const response = await fetch(api, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: state.a.k,
          },
          body: JSON.stringify(data),
        });

        const responseData = await response.json();

        console.log(responseData.msg);
        if (responseData.msg !== "ok") {
          enqueueSnackbar(responseData.msg, { variant: "info" });
          return;
        }

        setRoomNumber(responseData);
        handleNext();
      } catch (error) {
        enqueueSnackbar(error.message || "An error occurred", {
          variant: "error",
        });
      }
    }
  };

  const getStepContent = (currPage) => {
    switch (currPage) {
      case 0:
        return <ReservationInfoComponent result={setResultMyKad} />;
      case 1:
        return (
          <GuestRegistrationComponent
            guestInfo={getResultMyKad?.data?.newGuest}
            next={setGuestAlreadyReg}
          />
        );
      // case 2:
      //     if (getHasPackages) {
      //         return <UpsellRoomComponent />
      //     } else {
      //         handleNext()
      //     }
      //     break
      // case 3:
      //     if (getHasAddOn) {
      //         return <AddOnCartComponent AddToCart={setAddToCartItem} />
      //     } else {
      //         handleNext()
      //     }
      //     break
      case 2:
        return (
          <ReviewComponent
            guestInfo={getResultMyKad?.data?.newGuest}
            allowCheckIn={setAllowCheckIn}
          />
        );
      default:
        return navigate("/");
    }
  };

  useEffect(() => {
    if (getResultMyKad.msg === "ok") {
      handleNext();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getResultMyKad]);

  const addRoomToDisabled = (roomNo) => {
    setDisabledRooms((prev) => {
      if (!prev.includes(roomNo)) {
        return [...prev, roomNo];
      }
      return prev;
    });
  };

  // Clear the list of disabled rooms
  const clearDisabledRooms = () => {
    setDisabledRooms([]);
  };

  // Check if a room is in the list of disabled rooms
  const isRoomDisabled = (roomNo) => {
    return disabledRooms.includes(roomNo);
  };

  useEffect(() => {
    // Define the handler function
    const handleIssueCardResult = (event, data) => {
      if (data.msg !== "ok") {
        enqueueSnackbar(data.msg, { variant: "warning" });
        setLoading(false);
        return;
      } else if (data.msg === "ok") {
        enqueueSnackbar("Please collect the room card.", { variant: "info" });
        addRoomToDisabled(data.room);
        setLoading(false);
      }
    };

    // Add the event listener
    ipcRenderer.on("issue-card-result", handleIssueCardResult);

    // Clean up the event listener
    return () => {
      ipcRenderer.removeListener("issue-card-result", handleIssueCardResult);
    };
  }, []);

  useEffect(() => {
    const allRooms = getRoomNumber.room.map((item) => item.room_no);
    const allDisabled = allRooms.every((room_no) => isRoomDisabled(room_no));

    if (allRooms.length > 0 && allDisabled) {
      setSecondsLeft(RETURNTOMAIN);

      const interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setLoading(true);
            clearDisabledRooms(); // Clear the list of disabled rooms
            navigate("/");
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [getRoomNumber, disabledRooms, navigate]); // Add disabledRooms to dependencies

  const [loading, setLoading] = useState(false);
  const handleIssueRoomCard = (roomNo) => {
    setLoading(true);

    ipcRenderer.send("issue-card", {
      resv: state.reservation,
      room: roomNo,
    });
  };

  return (
    <SnackbarProvider
      preventDuplicate
      autoHideDuration={3000}
      maxSnack={2}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
    >
      <Container
        id="type"
        sx={{
          pt: "1rem",
          pb: "2rem",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2.5rem",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Button
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => {
                navigate("/");
              }}
              sx={{ alignSelf: "start" }}
            >
              Back to Main Page
            </Button>
          </Box>
        </Box>
        {/* <Card
                        sx={{
                            display: { xs: 'flex', md: 'flex' },
                            width: '100%',
                        }}
                    >
                        <CardContent
                            sx={{
                                display: 'flex',
                                width: '100%',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                ':last-of-child': { pb: 2 },
                            }}
                        >
                            <div>
                                <Typography variant="h5">
                                    Reservation Info
                                </Typography>
                            </div>
                            <InfoMobileComponent AddToCart={getAddToCartItem} />
                        </CardContent>
                    </Card> */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            width: "100%",
            maxWidth: "100%",
            maxHeight: "720px",
            gap: 5,
          }}
        >
          <Stepper
            id="mobile-stepper"
            activeStep={getActiveStep}
            alternativeLabel
            sx={{ display: "flex" }}
          >
            {filteredSteps.map((label) => (
              <Step
                sx={{
                  ":first-of-type": { pl: 0 },
                  ":last-of-child": { pr: 0 },
                  "& .MuiStepConnector-root": { top: 2 },
                }}
                key={label}
              >
                <StepLabel
                  sx={{ ".MuiStepLabel-labelContainer": { maxWidth: "70px" } }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          {getActiveStep === filteredSteps.length ? (
            <Stack spacing={2} useFlexGap>
              <Typography variant="h1">Hi,</Typography>
              <Typography variant="h5">
                Before pressing the "Issue Card" button, please ensure that you
                have placed the room card on top of the card encoder. Thank you!
              </Typography>
              <TableContainer component={Paper}>
                <Table aria-label="room table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontStyle: "italic" }}>Floor</TableCell>
                      <TableCell align="right" sx={{ fontStyle: "italic" }}>
                        Room Type
                      </TableCell>
                      <TableCell align="right" sx={{ fontStyle: "italic" }}>
                        Room Number
                      </TableCell>
                      <TableCell align="right" sx={{ fontStyle: "italic" }}>
                        Card Assignment
                      </TableCell>
                      {/* <TableCell align="right">Action</TableCell> */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getRoomNumber.room.map((room, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {room.floor_no}
                        </TableCell>
                        <TableCell align="right">{room.room_type}</TableCell>
                        <TableCell align="right">{room.room_no}</TableCell>
                        <TableCell align="right">
                          <LoadingButton
                            size="small"
                            color="primary"
                            onClick={() => handleIssueRoomCard(room.room_no)}
                            loading={loading}
                            disabled={isRoomDisabled(room.room_no)}
                            loadingPosition="start"
                            startIcon={<StyleIcon />}
                            variant="contained"
                          >
                            <span>Issue card</span>
                          </LoadingButton>
                        </TableCell>
                        {/* <TableCell>
                                                        <button onClick={returnOK}>Return Okay</button>
                                                    </TableCell> */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="body1" color="text.secondary">
                {secondsLeft !== null && (
                  <div>
                    Redirecting in {secondsLeft}{" "}
                    {secondsLeft === 1 ? "second" : "seconds"}...
                  </div>
                )}
              </Typography>
            </Stack>
          ) : (
            <React.Fragment>
              {getStepContent(getActiveStep)}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column-reverse", sm: "row" },
                  justifyContent:
                    getActiveStep !== 0 ? "space-between" : "flex-end",
                  alignItems: "end",
                  flexGrow: 1,
                  gap: 1,
                  pb: { xs: 12, sm: 0 },
                  mt: { xs: 2, sm: 0 },
                  mb: "60px",
                }}
              >
                {getActiveStep !== 0 && (
                  <Button
                    startIcon={<ChevronLeftRoundedIcon />}
                    onClick={handleBack}
                    variant="text"
                    sx={{
                      display: { xs: "none", sm: "flex" },
                    }}
                  >
                    Previous
                  </Button>
                )}

                {getActiveStep === filteredSteps.length - 1
                  ? // Render Check In Now button only if getAllowCheckIn is true
                    getAllowCheckIn && (
                      <Button
                        variant="contained"
                        endIcon={<ChevronRightRoundedIcon />}
                        onClick={handleCheckIn}
                        sx={{
                          width: { xs: "100%", sm: "fit-content" },
                        }}
                      >
                        Check In Now
                      </Button>
                    )
                  : // Render Continue button if getActiveStep is not the last step
                    getActiveStep !== 0 &&
                    getGuestAlreadyReg && (
                      <Button
                        variant="contained"
                        endIcon={<ChevronRightRoundedIcon />}
                        onClick={handleNext}
                        sx={{
                          width: { xs: "100%", sm: "fit-content" },
                        }}
                      >
                        Continue
                      </Button>
                    )}
              </Box>
            </React.Fragment>
          )}
        </Box>
      </Container>
    </SnackbarProvider>
  );
}
