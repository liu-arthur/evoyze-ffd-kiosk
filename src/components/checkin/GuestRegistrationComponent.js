import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import moment from "moment";
import KioskBoard from "kioskboard";

import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
// import Checkbox from '@mui/material/Checkbox';
import DeleteIcon from "@mui/icons-material/Clear";
import Divider from "@mui/material/Divider";
import FemaleIcon from "@mui/icons-material/Woman2";
import FormControl from "@mui/material/FormControl";
// import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from "@mui/material/FormLabel";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MaleIcon from "@mui/icons-material/Man4";
import MenuItem from "@mui/material/MenuItem";
import RadioGroup from "@mui/material/RadioGroup";
import SaveGuestIcon from "@mui/icons-material/HowToReg";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { Grid } from "@mui/material";
import { styled } from "@mui/system";

import { SnackbarProvider, enqueueSnackbar } from "notistack";

const { ipcRenderer } = window.require("electron");

const FormGrid = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
}));

const tiers = [
  {
    id: "my",
    title: "MyKad",
    subheader: "",
    description: [
      "Get ready your MyKad.",
      "Insert your MyKad into the designated MyKad reader slot.",
      "Once your MyKad is inserted, proceed to press the button below.",
    ],
    buttonText: "Add Guest using MyKad",
    buttonVariant: "outlined",
  },
  {
    id: "pp",
    title: "Passport",
    subheader: "",
    description: ["Coming soon..."],
    buttonText: "Add Guest using Passport",
    buttonVariant: "outlined",
  },
];

export default function GuestRegistrationComponent({ guestInfo, next }) {
  const location = useLocation();
  const state = location.state;

  const [getOpen, setOpen] = useState(false);
  // const [getChecked, setChecked] = useState(true);
  const [getCurrGuest, setCurrGuest] = useState(
    guestInfo || { email: "", mobile_no: "", group_seq: "" }
  );
  const [getGuestList, setGuestList] = useState([
    guestInfo || { email: "", mobile_no: "", group_seq: "" },
  ]);
  const [getSelectedRoomSeq, setSelectedRoomSeq] = useState("");
  const [getGuestSaved, setGuestSaved] = useState([]);

  // User input fields
  const emailRef = useRef(null);
  const phoneNoRef = useRef(null);
  // const subscribeRef = useRef(null);
  const roomRef = useRef(null);

  useEffect(() => {
    const keyboardRefs = [emailRef.current, phoneNoRef.current];

    keyboardRefs.forEach((ref) => {
      if (ref) {
        KioskBoard.run(ref, {
          cssAnimations: false,
          theme: "flat",
          keysEnterText: "Return",
          keysAllowSpacebar: false,
          keysFontSize: "18px",
          keysIconSize: "18px",
          keysArrayOfObjects: [
            {
              0: "Q",
              1: "W",
              2: "E",
              3: "R",
              4: "T",
              5: "Y",
              6: "U",
              7: "I",
              8: "O",
              9: "P",
            },
            {
              0: "A",
              1: "S",
              2: "D",
              3: "F",
              4: "G",
              5: "H",
              6: "J",
              7: "K",
              8: "L",
              9: ".",
            },
            {
              0: "Z",
              1: "X",
              2: "C",
              3: "V",
              4: "B",
              5: "N",
              6: "M",
              7: "@",
              8: ".com",
              9: "_",
            },
          ],
          keysSpecialCharsArrayOfStrings: [
            "$",
            "!",
            "~",
            "&",
            "=",
            "#",
            "[",
            "]",
            "-",
            "+",
          ],
        });
      }
    });
  }, []);

  const handleFormChange = (seq) => {
    const selCurrGuest = getGuestList.find((guest) => guest.seq === seq);
    setCurrGuest(selCurrGuest);
    // setChecked(selCurrGuest.subscribe);
    emailRef.current.value = selCurrGuest?.email || "";
    phoneNoRef.current.value = selCurrGuest?.mobile_no || "";
    roomRef.current.value = selCurrGuest?.group_seq || "";

    // Find the room with rate_seq equal to selCurrGuest.group_seq
    const selectedRoom = state.room.find(
      (room) => room.rate_seq === selCurrGuest?.group_seq
    );

    // Update the state variable used for the value prop of the Select component
    setSelectedRoomSeq(selectedRoom ? selectedRoom.rate_seq : "");
  };

  // const handleSubChange = (e) => {
  //   setChecked(e.target.checked);
  //   subscribeRef.current.value = e.target.checked;
  // };

  const handleRoomSeqChange = (e) => {
    setSelectedRoomSeq(e.target.value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const genSeqNumber = () => {
    return getGuestList.reduce((maxSeq, guest) => {
      return guest.seq > maxSeq ? guest.seq : maxSeq;
    }, getGuestList[0].seq);
  };

  const handleRegisterMyKad = async () => {
    handleOpen();

    ipcRenderer.send("add-guest-mykad");
    ipcRenderer.once("another-mykad-content", (event, data) => {
      if (data.msg !== "ok") {
        handleClose();
        enqueueSnackbar(data.msg, { variant: "warning" });
        return;
      } else {
        let newGuest = data.data;
        const alreadyInList = getGuestList.find(
          (guest) => guest.name === newGuest.name
        );

        if (alreadyInList) {
          handleClose();
          return;
        }

        newGuest["seq"] = genSeqNumber() + 1;
        setGuestList((guestList) => [...guestList, newGuest]);
        next(false);
        handleClose();
      }
    });
  };

  const handleEmailChange = (e) => {
    setCurrGuest((prev) => ({
      ...prev,
      email: e.target.value,
    }));
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handlePhoneNoChange = (e) => {
    setCurrGuest((prev) => ({
      ...prev,
      mobile_no: e.target.value,
    }));
  };

  const handleSaveGuestInfo = async () => {
    if (!getSelectedRoomSeq) {
      enqueueSnackbar("Please select a room before saving the data...", {
        variant: "info",
      });
      return;
    }

    let emailValue = "";
    let phoneValue = "";

    emailValue = emailRef.current.value.trim().toLowerCase();
    phoneValue = phoneNoRef.current.value.trim();

    if (state.a.input_email === 1) {
      if (!emailValue) {
        enqueueSnackbar("Email cannot be blank.", { variant: "warning" });
        return;
      }
    }

    if (state.a.input_phone === 1) {
      if (!phoneValue) {
        enqueueSnackbar("Phone number cannot be blank.", {
          variant: "warning",
        });
        return;
      }
    }

    if (emailValue && !isValidEmail(emailValue)) {
      enqueueSnackbar("Invalid email format.", { variant: "warning" });
      return;
    }

    const guestIndex = getGuestList.findIndex(
      (record) => record.seq === getCurrGuest.seq
    );

    const guestSeq = getGuestList.filter(
      (item) => item.group_seq === getSelectedRoomSeq
    ).length;

    setGuestSaved((prevGuestSaved) => {
      const newGuestSaved = [...prevGuestSaved];
      newGuestSaved[guestIndex] = true;
      return newGuestSaved;
    });

    getGuestList[guestIndex]["email"] = emailValue;
    getGuestList[guestIndex]["mobile_no"] = phoneValue;
    // getGuestList[guestIndex]["subscribe"] = subscribeRef.current.value;
    getGuestList[guestIndex]["group_seq"] = getSelectedRoomSeq;
    getGuestList[guestIndex]["isSaved"] = 1;

    const u = new URL(state.a.u);
    const path = "api/contact";

    u.pathname = u.pathname.endsWith("/")
      ? u.pathname + path
      : u.pathname + "/" + path;

    const api = u.toString();

    //POST
    const data = {
      // Compulsory
      ipAddr: state.a.ip,

      resv_id: state.reservation.resv_id,
      group_seq: getCurrGuest.group_seq,
      seq: guestSeq,

      // MyKad data
      name: getGuestList[guestIndex].name,
      gender: getGuestList[guestIndex].gender,
      dob: moment(getGuestList[guestIndex].dob, "DD-MM-YYYY").format(
        "YYYYMMDD"
      ),
      id_no: getGuestList[guestIndex].IC,
      nationality: (getGuestList[guestIndex].citizenship = "WARGANEGARA"
        ? "MALAYSIA"
        : getGuestList[guestIndex].citizenship),
      race: getGuestList[guestIndex].race,
      addr1: getGuestList[guestIndex].addr1,
      addr2: getGuestList[guestIndex].add2 + getGuestList[guestIndex]?.add3,
      postcode: getGuestList[guestIndex].postcode,
      city: getGuestList[guestIndex].city,
      state: getGuestList[guestIndex].state,
      mobile_phone: getGuestList[guestIndex].mobile_no,
      email: getGuestList[guestIndex].email,
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

      if (responseData.msg !== "ok") {
        enqueueSnackbar(responseData.msg, { variant: "warning" });
        return;
      }

      // msg('Contact saved successfully!');
      enqueueSnackbar("Contact saved successfully!", { variant: "success" });
    } catch (error) {
      enqueueSnackbar(error, { variant: "error" });
      // You can set a state variable here to handle errors if needed
    }

    const rateSeqArray = state.room.map((room) => room.rate_seq);
    const guestSeqArray = getGuestList.map((guest) => guest.group_seq);

    const isAllRoomTook = rateSeqArray.every((value) =>
      guestSeqArray.includes(value)
    );

    if (!isAllRoomTook) {
      return;
    }

    const readyToGo = getGuestList.map((guest) => {
      if (guest.isSaved !== 1) {
        return false;
      }

      return true;
    });

    next(readyToGo);
  };

  const handleDeleteGuestInfo = (seq) => {
    const guestRecords = [...getGuestList];
    const guestToDelete = getGuestList.findIndex(
      (record) => record.seq === seq
    );

    if (getGuestList.length === 1) {
      enqueueSnackbar("No allow to delete.", { variant: "success" });
      return;
    }

    if (guestToDelete !== -1) {
      guestRecords.splice(guestToDelete, 1);
      setGuestList(guestRecords);
      setCurrGuest(getGuestList[0]);
    }
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
      <Stack spacing={{ xs: 3, sm: 6, md: 6 }} useFlexGap>
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={getOpen}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <FormControl component="fieldset" fullWidth>
          <RadioGroup
            sx={{
              flexDirection: { sm: "column", md: "row" },
              gap: 2,
            }}
          >
            {!!getGuestList &&
              getGuestList.map((guest, index) => (
                <Card
                  key={index}
                  sx={{
                    width: "100%",
                    flexGrow: 1,
                    outline: "1px solid",
                    outlineColor: "primary.main",
                    color: getGuestSaved[index] ? "white" : "color.default",
                    backgroundColor: getGuestSaved[index]
                      ? "#61c1bd"
                      : "background.default",
                  }}
                >
                  <CardActionArea onClick={() => handleFormChange(guest.seq)}>
                    <CardContent
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      {guest.gender === "L" || guest.gender === "M" ? (
                        <MaleIcon color="primary" fontSize="medium" />
                      ) : (
                        <FemaleIcon color="primary" fontSize="medium" />
                      )}
                      <Typography fontWeight="bold">{guest.name}</Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
          </RadioGroup>
        </FormControl>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              p: 3,
              // height: { xs: 180, sm: 230, md: 280 },
              width: "100%",
              borderRadius: "20px",
              border: "1px solid ",
              borderColor: "divider",
              backgroundColor: "background.paper",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography component="h3" variant="h6">
                {getCurrGuest.name}
              </Typography>
              <Stack
                direction="row"
                justifyContent="left"
                spacing={1}
                useFlexGap
                sx={{
                  color: "text.secondary",
                }}
              >
                <IconButton onClick={handleSaveGuestInfo}>
                  <SaveGuestIcon
                    sx={{
                      fontSize: { xs: 28, sm: 36 },
                      color: "#0BB04A",
                    }}
                  />
                </IconButton>

                <IconButton
                  onClick={() => handleDeleteGuestInfo(getCurrGuest.seq)}
                >
                  <DeleteIcon
                    sx={{
                      fontSize: { xs: 28, sm: 36 },
                      color: "#FF3A31",
                    }}
                  />
                </IconButton>
              </Stack>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <FormControl fullWidth>
                <InputLabel id="select-room-label">Room</InputLabel>
                <Select
                  labelId="select-room-label"
                  id="select-room-seq"
                  value={getSelectedRoomSeq}
                  ref={roomRef}
                  label="Room"
                  onChange={handleRoomSeqChange}
                >
                  <MenuItem disabled>Select a room...</MenuItem>
                  {state.room.map((room, index) => (
                    <MenuItem key={index} value={room.rate_seq}>
                      {room.room_description} ( Room {room.rate_seq})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                paddingTop: "10px",
              }}
            >
              <FormGrid sx={{ flexGrow: 1 }}>
                <FormLabel htmlFor="card-number">Email</FormLabel>
                <div className="Input-div">
                  <div className="OutlinedInput-root">
                    <input
                      className="Input-field"
                      ref={emailRef}
                      data-kioskboard-type="all"
                      data-kioskboard-placement="bottom"
                      data-kioskboard-specialcharacters="true"
                      value={getCurrGuest?.email || ""}
                      onChange={handleEmailChange}
                      autoComplete="off"
                    />
                  </div>
                </div>
              </FormGrid>
              <FormGrid sx={{ flexGrow: 1 }}>
                <FormLabel htmlFor="card-number">Phone Number</FormLabel>
                <div className="Input-div">
                  <div className="OutlinedInput-root">
                    <input
                      className="Input-field"
                      ref={phoneNoRef}
                      data-kioskboard-type="numpad"
                      data-kioskboard-placement="bottom"
                      value={getCurrGuest?.mobile_no || ""}
                      onChange={handlePhoneNoChange}
                      autoComplete="off"
                    />
                  </div>
                </div>
              </FormGrid>
            </Box>

            {/* <FormControlLabel
            control={
              <Checkbox
                name="subscribe"
                ref={subscribeRef}
                checked={getChecked}
                onChange={handleSubChange}
              />
            }
            label="Subscribe for the latest promotions!"
          /> */}
          </Box>

          <Grid
            container
            spacing={4}
            alignItems="center"
            justifyContent="center"
          >
            {tiers.map((tier) => (
              <Grid item key={tier.title} xs={12} sm={6} md={6}>
                <Card
                  sx={{
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    border: tier.id === "my" ? "1px solid" : undefined,
                    borderColor: tier.id === "my" ? "primary.main" : undefined,
                    background:
                      tier.id === "my"
                        ? "linear-gradient(#033363, #021F3B)"
                        : undefined,
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        mb: 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        color: tier.id === "my" ? "grey.100" : "",
                      }}
                    >
                      <Typography component="h3" variant="h6">
                        {tier.title}
                      </Typography>
                    </Box>
                    <Divider
                      sx={{
                        my: 2,
                        opacity: 0.2,
                        borderColor: "grey.500",
                      }}
                    />
                    {tier.description.map((line) => (
                      <Box
                        key={line}
                        sx={{
                          py: 1,
                          display: "flex",
                          gap: 1.5,
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          component="span"
                          variant="subtitle2"
                          sx={{
                            color: tier.id === "my" ? "grey.200" : undefined,
                          }}
                        >
                          {line}
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                  <CardActions>
                    <Button
                      fullWidth
                      variant={tier.buttonVariant}
                      disabled={tier.id === "pp"}
                      onClick={(e) => {
                        e.preventDefault();
                        handleRegisterMyKad();
                      }}
                    >
                      {tier.buttonText}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Stack>
    </SnackbarProvider>
  );
}
