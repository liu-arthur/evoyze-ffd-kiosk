import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import BuildIcon from "@mui/icons-material/Build";
import CircularProgress from "@mui/material/CircularProgress";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";
import KioskBoard from "kioskboard";

import { SnackbarProvider, enqueueSnackbar } from "notistack";

const { ipcRenderer } = window.require("electron");

const tiers = [
  {
    id: "bk",
    title: "Find Your Booking",
    description: ["Booking Number", "Booker Name"],
    buttonText: "Search",
    buttonVariant: "outlined",
  },
  {
    id: "qr",
    title: "Scan QR Code",
    subheader: "Coming soon...",
    description: ["Coming soon: Our QR code scanning feature!"],
    buttonText: "Scan",
    buttonVariant: "outlined",
  },
];

export default function LandingPageComponent() {
  // Access getConfig via props
  // const getConfig = props;
  const [getConfig, setConfig] = useState({});
  const [getOpen, setOpen] = useState(false);
  const navigate = useNavigate();

  // User input fields
  const bkNumRef = useRef(null);

  useEffect(() => {
    if (bkNumRef.current) {
      KioskBoard.run(bkNumRef.current, {
        cssAnimations: false,
        theme: "flat",
        keysEnterText: "Return",
        keysAllowSpacebar: true,
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
          },
          {
            1: "Z",
            2: "X",
            3: "C",
            4: "V",
            5: "B",
            6: "N",
            7: "M",
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
          ".",
          "_",
          "-",
          "+",
          "@",
          ".com",
        ],
      });
    }
  }, []);

  useEffect(() => {
    ipcRenderer.send("find-config");
    ipcRenderer.once("result", (event, data) => {
      if (data.msg !== "ok") {
        enqueueSnackbar(data.msg, { variant: "warning" });
        return;
      }

      setConfig(data.data);
    });
    // Clean up the listener when the component unmounts
    return () => {
      ipcRenderer.removeAllListeners("result");
    };
  }, []);

  const searchBooking = async () => {
    const inputValue = bkNumRef.current.value;

    if (!inputValue) {
      return;
    }

    handleOpen();

    if (getConfig && getConfig.pms_url) {
      if (!getConfig.pms_url.endsWith("/") && !getConfig.link.startsWith("/")) {
        getConfig.pms_url += "/";
      } else if (
        getConfig.pms_url.endsWith("/") &&
        getConfig.link.startsWith("/")
      ) {
        getConfig.link = getConfig.link.slice(1);
      }
    }

    const u = new URL(getConfig.pms_url + getConfig.link);
    const pmsURL = u.toString();
    const k = `eVoyze ${getConfig.key}`;
    const ip = getConfig.ip_address;
    const path = "api/booking";
    u.pathname = u.pathname.endsWith("/")
      ? u.pathname + path
      : u.pathname + "/" + path;

    const api = u.toString();

    const data = {
      dt: moment().format("YYYYMMDD"),
      resvNum: inputValue,
      ipAddr: ip,
    };

    try {
      const response = await fetch(api, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: k,
        },

        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      responseData.a = {
        u: pmsURL,
        k: k,
        ip: ip,
        inputPhone: getConfig.input_phone,
        iputtEmail: getConfig.input_email,
      };

      if (responseData.msg !== "ok") {
        handleClose();
        bkNumRef.current.value = "";
        enqueueSnackbar(responseData.msg, { variant: "warning" });
      } else {
        handleClose();
        navigate("/MainPageComponent", { state: responseData });
      }
    } catch (error) {
      handleClose();
      bkNumRef.current.value = "";
      enqueueSnackbar(error.message, { variant: "error" });
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
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
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={getOpen}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

        <Box
          sx={{
            width: "100%",
            textAlign: "center",
          }}
        >
          <Typography
            component="h2"
            variant="h4"
            textAlign="center"
            color="text.primary"
            sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
          >
            Welcome to Our Kiosk
          </Typography>
          <Typography
            variant="body1"
            textAlign="center"
            color="text.secondary"
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            Explore our kiosk for easy access to services and information. From
            bookings to inquiries, our intuitive interface is here to assist you
            every step of the way. <br />
            <br />
            Start your journey with us today.
          </Typography>
        </Box>
        <Grid container spacing={4} alignItems="center" justifyContent="center">
          {tiers.map((tier) => (
            <Grid item key={tier.title} xs={12} sm={6} md={6}>
              <Card
                sx={{
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  border: tier.id === "bk" ? "1px solid" : undefined,
                  borderColor: tier.id === "bk" ? "primary.main" : undefined,
                  background:
                    tier.id === "bk"
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
                      color: tier.id === "bk" ? "grey.100" : "",
                    }}
                  >
                    <Typography component="h3" variant="h6">
                      {tier.title}
                      {tier.id === "qr" && (
                        <Chip
                          icon={<BuildIcon />}
                          label={tier.subheader}
                          size="small"
                          sx={{
                            background: (theme) =>
                              theme.palette.mode === "light" ? "" : "none",
                            backgroundColor: "primary.contrastText",
                            "& .MuiChip-label": {
                              color: "primary.dark",
                            },
                            "& .MuiChip-icon": {
                              color: "primary.dark",
                            },
                          }}
                        />
                      )}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "baseline",
                      color: tier.id === "bk" ? "grey.50" : undefined,
                    }}
                  ></Box>
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
                      <TipsAndUpdatesOutlinedIcon
                        sx={{
                          width: 20,
                          color:
                            tier.id === "bk" ? "primary.light" : "primary.main",
                        }}
                      />
                      <Typography
                        component="span"
                        variant="subtitle2"
                        sx={{
                          color: tier.id === "bk" ? "grey.200" : undefined,
                        }}
                      >
                        {line}
                      </Typography>
                    </Box>
                  ))}
                  <Divider
                    sx={{
                      my: 2,
                      opacity: 0.2,
                      borderColor: "grey.500",
                    }}
                  />
                  {tier.id === "bk" && (
                    <div className="Input-div">
                      <div className="OutlinedInput-root">
                        <input
                          className="Input-bk"
                          ref={bkNumRef}
                          data-kioskboard-type="all"
                          data-kioskboard-placement="bottom"
                          data-kioskboard-specialcharacters="true"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant={tier.buttonVariant}
                    disabled={tier.id === "qr"}
                    onClick={(e) => {
                      e.preventDefault();
                      searchBooking();
                    }}
                  >
                    {tier.buttonText}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </SnackbarProvider>
  );
}
