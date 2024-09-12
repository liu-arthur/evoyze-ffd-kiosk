import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TermsAndConditionsComponent from "./TermsAndConditionsComponent";

import { SnackbarProvider } from "notistack";

export default function ReviewComponent({ guestInfo, allowCheckIn }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [termsAgreed, setTermsAgreed] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  let resvInfo;

  if (location.state) {
    resvInfo = location.state;
  } else {
    navigate("/");
  }

  let totalCharge = 0;
  resvInfo.room.forEach((room) => {
    room.charges.forEach((amt) => {
      totalCharge += amt.charge_amt;
    });
  });

  const collectPymt = resvInfo.reservation.kiosk_col_payment;

  useEffect(() => {
    // Set allowCheckIn based on conditions
    const canCheckIn = collectPymt === 0 && termsAgreed;
    allowCheckIn(canCheckIn);
  }, [collectPymt, termsAgreed, allowCheckIn]);

  const addresses = [
    guestInfo.add1,
    guestInfo.add2,
    guestInfo.add3,
    guestInfo.postcode,
    guestInfo.state,
  ];

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
      <Stack spacing={2}>
        <Divider />
        <Stack
          direction="column"
          divider={<Divider flexItem />}
          spacing={2}
          sx={{ my: 2 }}
        >
          <div>
            <Typography variant="subtitle2" gutterBottom>
              Reservation details
            </Typography>
            <Typography gutterBottom sx={{ fontWeight: 700 }}>
              {guestInfo.name}
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              {addresses.join(", ")}
            </Typography>
            {guestInfo.email && guestInfo.email.trim() !== "" ? (
              <Typography color="text.secondary" gutterBottom>
                {guestInfo.email}
              </Typography>
            ) : null}
            {guestInfo.mobile_no && guestInfo.mobile_no.trim() !== "" ? (
              <Typography color="text.secondary" gutterBottom>
                {guestInfo.mobile_no}
              </Typography>
            ) : null}
          </div>
          {/* <div>
          <Typography variant="subtitle2" gutterBottom>
            Payment details
          </Typography>
          <Grid container>
            {collectPymt === 0 ? (
              <React.Fragment key={guestInfo.name}>
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  sx={{ width: "100%", mb: 1 }}
                >
                  <Typography
                    variant="body1"
                    color="text.secondary"
                  ></Typography>
                  <Typography gutterBottom sx={{ fontWeight: 700 }}>
                    Payment Complete
                  </Typography>
                </Stack>
              </React.Fragment>
            ) : (
              <React.Fragment key={guestInfo.name}>
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  sx={{ width: "100%", mb: 1 }}
                >
                  <Typography
                    variant="body1"
                    color="text.secondary"
                  ></Typography>
                  <Typography gutterBottom sx={{ fontWeight: 700 }}>
                    Pending Payment
                  </Typography>
                </Stack>
              </React.Fragment>
            )}
          </Grid>
        </div> */}
          <div>
            <Typography variant="subtitle2" gutterBottom>
              Terms and Conditions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please read and accept our{" "}
              <Button onClick={() => setModalOpen(true)} color="primary">
                Terms and Conditions
              </Button>{" "}
              before proceeding.
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={termsAgreed}
                  onChange={(event) => setTermsAgreed(event.target.checked)}
                />
              }
              label="I agree to the Terms and Conditions"
            />
          </div>
        </Stack>
        <TermsAndConditionsComponent
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </Stack>
    </SnackbarProvider>
  );
}
